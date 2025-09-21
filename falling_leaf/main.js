(() => {
  'use strict';

  // ---------- Config & constants ----------
  const PX_PER_M = 120; // 1 m ≈ 120 CSS px
  const rho = 1.225;    // air density kg/m^3
  const g0 = 9.81;      // gravity m/s^2

  let canvas, ctx;
  let ui, uival;
  let Wcss = 0, Hcss = 0, dpr = 1;

  // ---------- Utilities ----------
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const isNum = (x) => Number.isFinite(x);
  const safeNum = (x, f = 0) => (Number.isFinite(x) ? x : f);
  const isVec = (v) => v && isNum(v.x) && isNum(v.y);
  const safeVec = (v, fx = 0, fy = 0) => ({ x: safeNum(v?.x, fx), y: safeNum(v?.y, fy) });
  const mix = (a, b, t) => a + (b - a) * t;
  const len = (v) => Math.hypot(safeNum(v.x, 0), safeNum(v.y, 0));
  const norm = (v) => {
    const L = len(v);
    const d = L > 1e-12 ? 1 / L : 0;
    return { x: safeNum(v.x * d, 0), y: safeNum(v.y * d, 0) };
  };
  const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const mul = (v, s) => ({ x: v.x * s, y: v.y * s });
  const perp = (v) => ({ x: -v.y, y: v.x });
  const dot = (a, b) => a.x * b.x + a.y * b.y;
  const angWrap = (a) => {
    a = (a + Math.PI) % (2 * Math.PI);
    if (a < 0) a += 2 * Math.PI;
    return a - Math.PI;
  };

  // ---------- Simple seeded Perlin noise ----------
  // Lightweight 3D Perlin implementation for wind field (x,y,t)
  function makePerlin(seed = 1337) {
    // xorshift32
    let s = seed >>> 0;
    const rand = () => (s ^= s << 13, s ^= s >>> 17, s ^= s << 5, (s >>> 0) / 4294967296);
    const p = new Uint8Array(512);
    const perm = new Uint8Array(256);
    for (let i = 0; i < 256; i++) perm[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = perm[i]; perm[i] = perm[j]; perm[j] = t;
    }
    for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

    const grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (a, b, t) => a + (b - a) * t;
    const gradDot = (hash, x, y, z) => {
      const g = grad3[hash % 12];
      return g[0]*x + g[1]*y + g[2]*z;
    };

    function noise3(x, y, z) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const zf = z - Math.floor(z);
      const u = fade(xf), v = fade(yf), w = fade(zf);
      const A  = p[X] + Y,  AA = p[A] + Z,  AB = p[A + 1] + Z;
      const B  = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
      return lerp(
        lerp(
          lerp(gradDot(p[AA], xf,   yf,   zf),   gradDot(p[BA], xf-1, yf,   zf),   u),
          lerp(gradDot(p[AB], xf,   yf-1, zf),   gradDot(p[BB], xf-1, yf-1, zf), u), v
        ),
        lerp(
          lerp(gradDot(p[AA+1], xf,   yf,   zf-1), gradDot(p[BA+1], xf-1, yf,   zf-1), u),
          lerp(gradDot(p[AB+1], xf,   yf-1, zf-1), gradDot(p[BB+1], xf-1, yf-1, zf-1), u), v
        ),
        w
      );
    }
    return { noise3 };
  }

  // ---------- Wind field (divergence-free via curl of scalar) ----------
  const perlin = makePerlin(20240521);
  function scalarField(x, y, t) {
    // scale to get gentle, smooth variations
    const s = 0.08;
    const st = 0.15;
    const n = perlin.noise3(x * s, y * s, t * st);
    return safeNum(n, 0);
  }
  function curlNoise(x, y, t) {
    // Numerically approximate curl from scalar potential ψ: (∂ψ/∂y, -∂ψ/∂x)
    const e = 0.25;
    const dψdy = (scalarField(x, y + e, t) - scalarField(x, y - e, t)) / (2 * e);
    const dψdx = (scalarField(x + e, y, t) - scalarField(x - e, y, t)) / (2 * e);
    return { x: safeNum(dψdy, 0), y: safeNum(-dψdx, 0) };
  }
  function windAt(p, t, params) {
    // Base wind with temporal gust in magnitude and slight direction jitter
    const mean = safeNum(params.windMean, 0);
    const amp = clamp(safeNum(params.gustAmp, 0), 0, 3);
    // Temporal noise for speed (≈ [-1,1]) and direction jitter
    const nMag = perlin.noise3(0.05 * t, 0.0, 7.1);
    const nDir = perlin.noise3(0.033 * t, 11.3, 2.7);
    let mag = clamp(mean + amp * nMag, 0, mean + amp);
    const dirJitterMax = 0.35 * (amp / 3); // up to ~20° when amp=3
    const dir = dirJitterMax * nDir; // radians
    let base = { x: mag * Math.cos(dir), y: mag * Math.sin(dir) };

    // Add divergence-free curl noise gusts for spatial variation
    const curl = curlNoise(safeNum(p.x, 0) * 0.4, safeNum(p.y, 0) * 0.4, safeNum(t, 0));
    const gust = mul(curl, safeNum(params.turbulence, 0) * 0.4);
    let w = add(base, gust);
    // clamp wind magnitude slightly higher to allow gusts
    const L = len(w);
    const Lmax = Math.max(3.5, mean + amp + 0.5);
    if (L > Lmax) w = mul(w, Lmax / L);
    return safeVec(w, 0, 0);
  }

  // ---------- Leaf model ----------
  class Leaf {
    constructor() {
      // Physical parameters (SI)
      this.m = 0.0010;        // mass ~1.0 g
      this.S = 0.0050;        // area ~50 cm^2 (for realistic terminal speed)
      // Effective geometry for moment of inertia (rectangular approx)
      const w = 0.08, h = 0.06; // 8 cm x 6 cm
      this.c = 0.07;          // characteristic chord length ~7 cm
      this.I = (1/12) * this.m * (w*w + h*h); // kg·m^2

      // Aerodynamic coefficients
      this.Cd0 = 0.18;   // edge-on min drag (scalar model)
      this.Cd90 = 1.20;  // face-on drag (scalar model)
      this.Cd_n = 1.20;  // anisotropic: normal-direction drag
      this.Cd_t = 0.08;  // anisotropic: tangential-direction drag
      this.ClMax = 0.25; // max lift coefficient (much reduced)
      this.Cm0 = 0.01;   // moment coefficient amplitude (reduced)
      this.kSpin = 0.0;  // disable spin-lift for stability
      this.kOmega = 0.10; // stronger rotational damping

      // State (world meters, radians)
      this.age = 0;
      this.rest = 0;
      this.reset();
    }

    reset() {
      this.p = { x: (Wcss/2) / PX_PER_M, y: 0.4 };
      this.v = { x: (Math.random()*2-1) * 0.1, y: 0 };
      this.theta = mix(-0.6, 0.6, Math.random()); // orientation angle: plate normal
      this.omega = (Math.random()*2-1) * 2;       // rad/s
      this.age = 0;
      this.rest = 0;
    }

    spawnAtTop() {
      const marginPx = 40;
      const minX = marginPx / PX_PER_M;
      const maxX = Math.max(minX + 0.1, (Wcss - marginPx) / PX_PER_M);
      this.p = { x: mix(minX, maxX, Math.random()), y: -0.15 };
      this.v = { x: (Math.random()*2-1) * 0.15, y: 0 };
      this.theta = mix(-0.9, 0.9, Math.random());
      this.omega = (Math.random()*2-1) * 1.5;
      this.age = 0;
      this.rest = 0;
    }

    coeffs(alpha) {
      // alpha: angle between plate normal and incoming flow (-π..π)
      const s = Math.sin(alpha), s2 = s*s;
      const Cd = this.Cd0 + (this.Cd90 - this.Cd0) * s2; // max at face-on
      // Our theta is a plate NORMAL. For thin-plate models, lift uses AoA to CHORD.
      // alpha_chord = alpha + π/2 => sin(2*alpha_chord) = -sin(2*alpha)
      let Cl = -this.ClMax * Math.sin(2 * alpha);        // corrected sign
      // soft stall clamp
      Cl = clamp(Cl, -this.ClMax, this.ClMax);
      // With the same transformation, moment sign in this frame flips
      const Cm = this.Cm0 * Math.sin(2 * alpha);
      return { Cd, Cl, Cm };
    }

    // Derivatives for RK4
    deriv(state, t, env) {
      const { p, v, theta, omega } = state;
      const w = windAt(p, t, env);
      const uRel = sub(v, w); // leaf rel to air
      let speed = len(uRel);
      if (!isNum(speed)) speed = 0;
      speed = clamp(speed, 0, 3.0); // restrict relative speed for stability
      const uhat = speed > 1e-5 ? mul(uRel, 1 / speed) : { x: 1, y: 0 };
      // incoming flow direction angle
      const beta = Math.atan2(-uhat.y, -uhat.x) || 0; // direction from which air comes
      const alpha = angWrap(beta - theta);       // AoA: flow vs plate normal
      const { Cd, Cl, Cm } = this.coeffs(alpha);

      const q = 0.5 * rho * speed * speed;      // dynamic pressure
      const qS = 0.5 * rho * this.S;            // for anisotropic drag calculation
      // Aerodynamic forces: orientation-dependent (anisotropic) drag
      const n_hat = { x: Math.cos(theta), y: Math.sin(theta) }; // plate normal
      const t_hat = perp(n_hat); // plate tangent
      const u_n = dot(uRel, n_hat);
      const u_t = dot(uRel, t_hat);
      const Fd_n = mul(n_hat, -this.Cd_n * qS * Math.abs(u_n) * u_n);
      const Fd_t = mul(t_hat, -this.Cd_t * qS * Math.abs(u_t) * u_t);
      const Fd = add(Fd_n, Fd_t);
      const FdMag = Math.max(1e-9, len(Fd));
      const Ldir = perp(uhat);                  // lift perpendicular to flow
      let Fl = mul(Ldir, q * this.S * Cl);
      if (speed < 0.05) { Fl = { x: 0, y: 0 }; }
      // Limit lift magnitude relative to drag to avoid lateral blow-up
      const FlMag = Math.hypot(Fl.x, Fl.y);
      const rMax = 0.5; // |Fl| <= rMax * |Fd|
      if (FlMag > 1e-9) {
        const cap = rMax * FdMag / FlMag;
        const s = Math.min(1, cap);
        Fl = mul(Fl, s);
      }
      // Spin-lift disabled via kSpin=0
      const Fspin = { x: 0, y: 0 };
      // Gravity
      const Fg = { x: 0, y: env.gScale * this.m * g0 };

      // Sum forces
      const F = safeVec({ x: Fd.x + Fl.x + Fspin.x, y: Fd.y + Fl.y + Fspin.y + Fg.y }, 0, safeNum(Fg.y, 0));

      // Aerodynamic moment about center
      const M_aero = safeNum(q * this.S * this.c * Cm - this.kOmega * omega, 0);

      return {
        dp: safeVec(v, 0, 0),
        dv: mul(F, 1 / this.m),
        dtheta: safeNum(omega, 0),
        domega: safeNum(M_aero / this.I, 0),
      };
    }

    rk4Step(dt, t, env) {
      const S = { p: this.p, v: this.v, theta: this.theta, omega: this.omega };
      const k1 = this.deriv(S, t, env);
      const S2 = {
        p: add(S.p, mul(k1.dp, dt/2)),
        v: add(S.v, mul(k1.dv, dt/2)),
        theta: S.theta + k1.dtheta * dt/2,
        omega: S.omega + k1.domega * dt/2,
      };
      const k2 = this.deriv(S2, t + dt/2, env);
      const S3 = {
        p: add(S.p, mul(k2.dp, dt/2)),
        v: add(S.v, mul(k2.dv, dt/2)),
        theta: S.theta + k2.dtheta * dt/2,
        omega: S.omega + k2.domega * dt/2,
      };
      const k3 = this.deriv(S3, t + dt/2, env);
      const S4 = {
        p: add(S.p, mul(k3.dp, dt)),
        v: add(S.v, mul(k3.dv, dt)),
        theta: S.theta + k3.dtheta * dt,
        omega: S.omega + k3.domega * dt,
      };
      const k4 = this.deriv(S4, t + dt, env);

      const dp = mul(add(add(k1.dp, mul(add(k2.dp, k3.dp), 2)), k4.dp), dt/6);
      const dv = mul(add(add(k1.dv, mul(add(k2.dv, k3.dv), 2)), k4.dv), dt/6);
      const dtheta = (k1.dtheta + 2*(k2.dtheta + k3.dtheta) + k4.dtheta) * dt/6;
      const domega = (k1.domega + 2*(k2.domega + k3.domega) + k4.domega) * dt/6;

      this.p = safeVec(add(this.p, dp), 0, 0);
      this.v = safeVec(add(this.v, dv), 0, 0);
      this.theta = angWrap(safeNum(this.theta + dtheta, 0));
      this.omega = clamp(safeNum(this.omega + domega, 0), -10, 10);
      // Clamp to visible world bounds to avoid disappearing
      this.p.x = clamp(this.p.x, -0.2, (Wcss - 10) / PX_PER_M);
      this.p.y = clamp(this.p.y, -0.2, (Hcss + 50) / PX_PER_M);
      this.age += dt;
    }
  }

  // ---------- Rendering ----------
  function drawLeaf(ctx, leaf, scale, trailOn) {
    const x = leaf.p.x * scale;
    const y = leaf.p.y * scale;
    const r = leaf.theta; // plate normal angle

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r - Math.PI/2); // rotate so leaf visual aligns with normal

    // Leaf shape: stylized Bezier outline
    const w = 0.10 * scale; // width ~10 cm
    const h = 0.16 * scale; // height ~16 cm

    // vein
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -h*0.48);
    ctx.lineTo(0, h*0.5);
    ctx.stroke();

    // body
    const grad = ctx.createLinearGradient(0, -h*0.5, 0, h*0.5);
    grad.addColorStop(0, '#4f7f2a');
    grad.addColorStop(0.6, '#6a9436');
    grad.addColorStop(1, '#936b2d');
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -h*0.5);
    ctx.bezierCurveTo(w*0.9, -h*0.45, w*0.85, -h*0.2, w*0.55, h*0.1);
    ctx.bezierCurveTo(w*0.35, h*0.35, w*0.15, h*0.45, 0, h*0.5);
    ctx.bezierCurveTo(-w*0.15, h*0.45, -w*0.35, h*0.35, -w*0.55, h*0.1);
    ctx.bezierCurveTo(-w*0.85, -h*0.2, -w*0.9, -h*0.45, 0, -h*0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // stem
    ctx.beginPath();
    ctx.moveTo(0, -h*0.5);
    ctx.lineTo(0, -h*0.65);
    ctx.strokeStyle = 'rgba(100,70,30,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  // ---------- Simulation loop ----------
  // Multi-leaf system
  const leaves = [];
  const targetLeaves = 24;
  let spawnBase = 0.6;     // base interval (s)
  let spawnJitter = 0.4;   // additional random (0..jitter) seconds
  let spawnTimer = 0;
  let nextSpawn = 0.6;
  let tSim = 0;
  let paused = false;
  let last = 0;
  let accum = 0;
  const fixedDt = 1/240; // physics dt for RK4 (s)

  function step(now) {
    // schedule next frame early to avoid stopping on render errors
    requestAnimationFrame(step);
    if (!last) last = now;
    const dtReal = (now - last) / 1000;
    last = now;
    if (!paused) {
      // slow motion factor: <1 slows physics
      const slow = parseFloat(ui.slowmo.value);
      accum += clamp(dtReal * slow, 0, 0.1);

      const env = {
        windMean: safeNum(parseFloat(ui.wind.value), 0),
        gustAmp: safeNum(parseFloat(ui.gust.value), 0),
        turbulence: safeNum(parseFloat(ui.turb.value), 0),
        gScale: safeNum(parseFloat(ui.grav.value), 1),
      };

      while (accum >= fixedDt) {
        // Step existing leaves
        for (const lf of leaves) {
          lf.rk4Step(fixedDt, tSim, env);
          // Ground collision
          const groundY = (Hcss - 30) / PX_PER_M;
          if (lf.p.y > groundY) {
            lf.p.y = groundY;
            // simple inelastic collision & friction
            lf.v.y *= -0.15; // small bounce
            lf.v.x *= 0.8;
            lf.omega *= 0.6;
            if (Math.abs(lf.v.y) < 0.02) lf.v.y = 0;
          }
          // Rest detection and recycle
          const vmag = len(lf.v);
          if (lf.p.y >= (Hcss - 30) / PX_PER_M && vmag < 0.05 && Math.abs(lf.omega) < 0.2) {
            lf.rest += fixedDt;
          } else {
            lf.rest = 0;
          }
          if (lf.rest > 2.0) {
            lf.spawnAtTop();
          }
        }

        // Spawn new leaves over time up to target
        spawnTimer += fixedDt;
        if (leaves.length < targetLeaves && spawnTimer >= nextSpawn) {
          spawnTimer = 0;
          nextSpawn = spawnBase + Math.random() * spawnJitter;
          const nl = new Leaf();
          nl.spawnAtTop();
          leaves.push(nl);
        }

        tSim += fixedDt;
        accum -= fixedDt;
      }
    }

    render();
  }

  function render() {
    const s = PX_PER_M;
    // trail rendering
    if (!ui.trail.checked) {
      // DPI-safe clear: reset transform temporarily
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(10,14,28,0.12)';
      ctx.fillRect(0, 0, Wcss, Hcss);
    }

    // ground
    ctx.fillStyle = '#1a2a3f';
    ctx.fillRect(0, Hcss - 20, Wcss, 20);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(0, Hcss - 20);
    ctx.lineTo(Wcss, Hcss - 20);
    ctx.stroke();

    const env = {
      windMean: safeNum(parseFloat(ui.wind.value), 0),
      gustAmp: safeNum(parseFloat(ui.gust.value), 0),
      turbulence: safeNum(parseFloat(ui.turb.value), 0),
      gScale: safeNum(parseFloat(ui.grav.value), 1),
    };

    // leaves
    for (const lf of leaves) {
      drawLeaf(ctx, lf, s, ui.trail.checked);
    }

    // readout
    // no debug readout
  }

  // ---------- UI wiring ----------
  function syncLabels() {
    uival.slowmoVal.textContent = `${parseFloat(ui.slowmo.value).toFixed(2)}x`;
    uival.windVal.textContent = `${parseFloat(ui.wind.value).toFixed(1)} m/s`;
    uival.gustVal.textContent = `${parseFloat(ui.gust.value).toFixed(1)} m/s`;
    uival.turbVal.textContent = `${parseFloat(ui.turb.value).toFixed(1)}`;
    uival.gravVal.textContent = `${parseFloat(ui.grav.value).toFixed(2)} g`;
  }
  function addUIEvents() {
    ui.slowmo.addEventListener('input', syncLabels);
    ui.wind.addEventListener('input', syncLabels);
    ui.gust.addEventListener('input', syncLabels);
    ui.turb.addEventListener('input', syncLabels);
    ui.grav.addEventListener('input', syncLabels);
    ui.reset.addEventListener('click', () => {
      leaves.length = 0;
      // spawn a single leaf immediately, then continue timed spawns
      const lf = new Leaf();
      lf.spawnAtTop();
      leaves.push(lf);
      tSim = 0; accum = 0; spawnTimer = 0; nextSpawn = spawnBase + Math.random() * spawnJitter;
    });
    ui.pause.addEventListener('click', () => {
      paused = !paused;
      ui.pause.textContent = paused ? '再開' : '一時停止';
    });
  }

  function resize() {
    // Maintain aspect based on initial attribute ratio 600/960
    const ratio = 600 / 960;
    dpr = Math.max(1, window.devicePixelRatio || 1);
    // CSS size is clientWidth; compute CSS height by ratio
    const cssW = canvas.clientWidth || 960;
    const cssH = Math.round(cssW * ratio);
    canvas.style.height = cssH + 'px';

    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    Wcss = cssW; Hcss = cssH;

    // Reset transform so we can draw in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function init() {
    canvas = document.getElementById('scene');
    ctx = canvas.getContext('2d');
    const $ = (id) => document.getElementById(id);
    ui = {
      slowmo: $('slowmo'),
      wind: $('wind'),
      gust: $('gust'),
      turb: $('turb'),
      grav: $('grav'),
      trail: $('trail'),
      reset: $('reset'),
      pause: $('pause'),
    };
    uival = {
      slowmoVal: $('slowmoVal'),
      windVal: $('windVal'),
      gustVal: $('gustVal'),
      turbVal: $('turbVal'),
      gravVal: $('gravVal'),
    };

    resize();
    window.addEventListener('resize', resize);
    addUIEvents();
    syncLabels();
    // initialize timing then start
    last = 0;
    // initial: spawn a single leaf, then let timed spawner handle the rest
    const lf0 = new Leaf();
    lf0.spawnAtTop();
    leaves.push(lf0);
    spawnTimer = 0; nextSpawn = spawnBase + Math.random() * spawnJitter;
    requestAnimationFrame(step);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
