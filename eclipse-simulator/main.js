/*
  皆既月食シミュレータ（簡略モデル）
  - 月は一定速度で直線的に地球の影（半影/本影）を横切ると仮定
  - U1/U2/GREATEST/U3/U4 から進入角（インパクトパラメータ）と速度を推定
*/

(function(){
  const $ = (sel)=>document.querySelector(sel);

  // DOM
  const geometryCanvas = $('#geometryCanvas');
  const viewCanvas = $('#viewCanvas');
  const ctxGeo = geometryCanvas.getContext('2d');
  const ctxView = viewCanvas.getContext('2d');
  const timeSlider = $('#timeSlider');
  const playPauseBtn = $('#playPause');
  const speedSelect = $('#speed');
  const marksEl = $('#marks');
  const phaseLabel = $('#phase-label');
  const timeLabel = $('#time-label');
  const eventName = $('#event-name');
  const eventLocation = $('#event-location');
  // Optional inputs
  const inP1 = document.getElementById('inP1');
  const inU1 = document.getElementById('inU1');
  const inU2 = document.getElementById('inU2');
  const inG  = document.getElementById('inG');
  const inU3 = document.getElementById('inU3');
  const inU4 = document.getElementById('inU4');
  const inP4 = document.getElementById('inP4');
  const btnJST = document.getElementById('applyJST');
  const btnUTC = document.getElementById('applyUTC');

  // Event data
  const evt = window.eclipseEvent;
  eventName.textContent = `イベント: ${evt.name}`;
  eventLocation.textContent = `場所: ${evt.location}`;
  // Merge persisted overrides (if any)
  try{
    const ov = JSON.parse(localStorage.getItem('eclipseOverrides')||'null');
    if (ov && ov.name === evt.name && ov.times){
      evt.times = Object.assign({}, evt.times||{}, ov.times);
    }
  }catch(_){/* ignore */}

  // Parse times
  const T = {};
  for (const k of Object.keys(evt.times)) {
    T[k] = new Date(evt.times[k]);
  }
  let start = T.P1 || T.U1 || T.GREATEST;
  let end = T.P4 || T.U4 || T.GREATEST;
  const t0 = T.GREATEST;
  // もし開始・終了が欠ける場合は、最大食の前後に仮のウィンドウを設定（±4時間）
  if (!start || !end || end.getTime() === start.getTime()){
    const base = t0 || new Date();
    start = new Date(base.getTime() - 4*3600*1000);
    end   = new Date(base.getTime() + 4*3600*1000);
  }

  // Radii (in moon radii units)
  const Rm = evt.radii.moon;       // = 1.0
  const Ru = evt.radii.umbra;      // ≈ 2.6
  const Rp = evt.radii.penumbral ?? evt.radii.penumbra; // ≈ 4.2

  // Derive linear motion parameters from U1 & U2 around greatest
  // Model: distance^2 = b^2 + (v * t)^2, with t seconds from greatest, b impact parameter
  function secondsBetween(a,b){ return (a.getTime() - b.getTime())/1000; }

  const haveU1 = !!T.U1; const haveU2 = !!T.U2; const haveU3 = !!T.U3; const haveU4 = !!T.U4;

  // pick two constraints ideally U1 & U2, else fallbacks using U3/U4 by symmetry
  let tU1 = haveU1 ? secondsBetween(T.U1, t0) : null; // negative
  let tU2 = haveU2 ? secondsBetween(T.U2, t0) : null; // negative
  if (tU1 === null && haveU4) tU1 = -secondsBetween(T.U4, t0); // mirror
  if (tU2 === null && haveU3) tU2 = -secondsBetween(T.U3, t0); // mirror

  // Distances at contacts
  const D1 = Ru + Rm; // U1/U4
  const D2 = Math.max(Ru - Rm, 0.001); // U2/U3

  // Solve for v and b
  // D1^2 - D2^2 = v^2 (t1^2 - t2^2) -> v = sqrt((D1^2 - D2^2)/(t1^2 - t2^2))
  // b^2 = D1^2 - (v t1)^2
  let v = 0.00055; // moon radii per second（概ね月の相対運動 ~0.5°/h を想定）
  let b = 0.0;  // impact parameter in moon radii

  // もしデータセットに本影食分（Mu）や impact があれば最大時距離を優先設定
  if (evt && (evt.impact != null || (evt.magnitudes && evt.magnitudes.umbral != null))){
    if (evt.impact != null) {
      b = Math.max(0, +evt.impact);
    } else if (evt.magnitudes && evt.magnitudes.umbral != null) {
      const Mu = +evt.magnitudes.umbral;
      b = Math.max(0, Ru - Mu*Rm);
    }
  }
  if (tU1 !== null && tU2 !== null && Math.abs(tU1) !== Math.abs(tU2)){
    const num = D1*D1 - D2*D2;
    const den = tU1*tU1 - tU2*tU2;
    if (den !== 0 && num/den > 0){
      v = Math.sqrt(num/den);
      const b2 = D1*D1 - (v*tU1)*(v*tU1);
      b = Math.max(0, Math.sqrt(Math.max(0, b2)));
    }
  } else {
    // Fallback: estimate v from totality duration if available
    if (haveU2 && haveU3){
      const dt = Math.abs(secondsBetween(T.U3, T.U2));
      // at U2/U3: sqrt(b^2 + (v t2)^2) = D2 -> v = sqrt((D2^2 - b^2))/|t2|
      // assume near-central (b ~ 0)
      v = D2/Math.max(1, Math.abs(secondsBetween(T.U2, t0)));
      b = 0;
    } else {
      // データ不足時はデフォルト値を維持
      v = v;
      b = b;
    }
  }

  // Slider time domain
  const totalSec = Math.max(1, secondsBetween(end, start));
  function sliderToDate(val){
    const p = val/1000;
    const ms = start.getTime() + p * (end.getTime() - start.getTime());
    return new Date(ms);
  }
  function dateToSlider(d){
    const p = (d.getTime() - start.getTime())/(end.getTime() - start.getTime());
    return Math.min(1000, Math.max(0, Math.round(p*1000)));
  }

  // Add phase marks
  const marks = [
    ['P1', T.P1], ['U1', T.U1], ['U2', T.U2], ['最大', T.GREATEST], ['U3', T.U3], ['U4', T.U4], ['P4', T.P4]
  ].filter(([,d])=>d instanceof Date && !isNaN(d));
  marksEl.innerHTML = marks.map(([k,d])=>`<span class="mark">${k}: ${formatTime(d)}</span>`).join('');

  // Animation state
  let playing = false;
  let lastTick = null;
  let simTime = new Date(start.getTime());

  playPauseBtn.addEventListener('click', ()=>{
    playing = !playing;
    playPauseBtn.textContent = playing ? '⏸' : '▶';
    if (playing) lastTick = performance.now();
  });
  timeSlider.addEventListener('input', ()=>{
    simTime = sliderToDate(+timeSlider.value);
    render();
  });

  function step(ts){
    if (playing){
      const s = parseFloat(speedSelect.value);
      if (lastTick == null) lastTick = ts;
      const dtMs = (ts - lastTick) * s;
      lastTick = ts;
      simTime = new Date(simTime.getTime() + dtMs*10); // accelerate a bit for snappy feel
      if (simTime > end){ simTime = new Date(start.getTime()); }
      timeSlider.value = dateToSlider(simTime);
      render();
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  function render(){
    // Update labels
    timeLabel.textContent = `時刻: ${formatTime(simTime)}`;

    // Compute moon center relative to shadow center at simTime
    const t = secondsBetween(simTime, t0); // negative before greatest
    const x = v * t; // along-track
    const y = b;     // impact parameter (fixed)
    const d = Math.hypot(x, y); // center-to-center distance

    // Determine phase label
    const state = phaseState(d);
    phaseLabel.textContent = `状態: ${state}`;

    drawGeometry(x, y, d);
    drawView(d, x, y);
  }

  function drawGeometry(x, y, d){
    const W = geometryCanvas.width, H = geometryCanvas.height;
    ctxGeo.clearRect(0,0,W,H);

    // World scale: fit penumbra comfortably
    const margin = 30;
    const maxR = Rp;
    const scale = Math.min((W-2*margin)/(2*maxR), (H-2*margin)/(2*maxR));

    const cx = W*0.6; // shift right to leave room for sun
    const cy = H*0.5;

    // Sun (decorative)
    ctxGeo.fillStyle = '#ffcc33';
    ctxGeo.beginPath();
    ctxGeo.arc(W*0.1, cy, 24, 0, Math.PI*2); ctxGeo.fill();

    // Penumbra
    drawCircle(ctxGeo, cx, cy, Rp*scale, 'rgba(180,180,180,0.15)', '#777');
    // Umbra
    drawCircle(ctxGeo, cx, cy, Ru*scale, 'rgba(60,60,60,0.45)', '#999');
    // Earth (shadow center)
    drawCircle(ctxGeo, cx, cy, 4, '#4caf50', '#4caf50');

    // Moon path line
    ctxGeo.strokeStyle = '#2a9df4';
    ctxGeo.setLineDash([6,6]);
    ctxGeo.beginPath();
    ctxGeo.moveTo(cx - (Rp+Rm+2)*scale, cy + y*scale);
    ctxGeo.lineTo(cx + (Rp+Rm+2)*scale, cy + y*scale);
    ctxGeo.stroke();
    ctxGeo.setLineDash([]);

    // Moon
    const mx = cx + x*scale;
    const my = cy + y*scale;
    drawCircle(ctxGeo, mx, my, Rm*scale, '#ddd', '#bbb');

    // Labels
    ctxGeo.fillStyle = '#9aa0a6';
    ctxGeo.font = '12px system-ui';
    ctxGeo.fillText('半影', cx + Rp*scale + 6, cy);
    ctxGeo.fillText('本影', cx + Ru*scale + 6, cy);
  }

  function drawView(d, x, y){
    const W = viewCanvas.width, H = viewCanvas.height;
    ctxView.clearRect(0,0,W,H);

    const cx = W/2, cy = H/2;
    const R = Math.min(W,H)*0.35; // render moon radius

    // Moon disk base
    drawCircle(ctxView, cx, cy, R, '#ddd', '#ccc');

    // Shade based on umbral magnitude
    const magUmbral = (Ru - d)/Rm; // >1: totality, 0..1: partial, <0: outside umbra
    const magPenum = (Rp - d)/Rm;  // penumbral indicator

    if (magUmbral > 1){
      // Totality: copper-red tint
      ctxView.fillStyle = 'rgba(176,74,74,0.85)';
      drawCircle(ctxView, cx, cy, R, ctxView.fillStyle, null);
    } else if (magUmbral > 0){
      // Partial umbral: create a soft mask darker towards overlapped side
      const intensity = clamp(magUmbral, 0, 1);
      shadeDirectional(ctxView, cx, cy, R, x, y, intensity);
    } else if (magPenum > 0){
      // Penumbral: subtle dimming
      const p = clamp(magPenum*0.3, 0, 0.3);
      ctxView.fillStyle = `rgba(0,0,0,${p})`;
      drawCircle(ctxView, cx, cy, R, ctxView.fillStyle, null);
    }

    // Rim
    ctxView.strokeStyle = '#aaa';
    ctxView.lineWidth = 2;
    ctxView.beginPath();
    ctxView.arc(cx, cy, R, 0, Math.PI*2); ctxView.stroke();
  }

  function shadeDirectional(ctx, cx, cy, R, x, y, intensity){
    // Direction from shadow center to moon center projects where the dark edge lies
    // Use a linear gradient across the disk to approximate the bite
    const dir = Math.atan2(y, x); // radians
    const dx = Math.cos(dir), dy = Math.sin(dir);

    const gx = ctx.createLinearGradient(cx - dx*R, cy - dy*R, cx + dx*R, cy + dy*R);
    const dark = Math.min(0.85, 0.35 + 0.5*intensity);
    gx.addColorStop(0.0, `rgba(176,74,74,${dark})`);
    gx.addColorStop(0.5, 'rgba(176,74,74,0.15)');
    gx.addColorStop(1.0, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.clip();
    ctx.fillStyle = gx;
    ctx.fillRect(cx- R, cy- R, 2*R, 2*R);
    ctx.restore();
  }

  function drawCircle(ctx, x, y, r, fill, stroke){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    if (fill){ ctx.fillStyle = fill; ctx.fill(); }
    if (stroke){ ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function phaseState(d){
    if (d <= Ru - Rm) return '皆既食（本影内）';
    if (d < Ru + Rm) return '部分食（本影に一部）';
    if (d < Rp + Rm) return '半影食';
    return '非食';
  }

  function formatTime(d){
    const y=d.getFullYear();
    const m=('0'+(d.getMonth()+1)).slice(-2);
    const dd=('0'+d.getDate()).slice(-2);
    const hh=('0'+d.getHours()).slice(-2);
    const mm=('0'+d.getMinutes()).slice(-2);
    const ss=('0'+d.getSeconds()).slice(-2);
    return `${y}-${m}-${dd} ${hh}:${mm}:${ss}`;
  }

  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

  // ------- Input helpers (optional UI) -------
  function parseYMDHMS(s){
    if (!s) return null;
    const m = s.trim().match(/^(\d{4})[-\/.](\d{2})[-\/.](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!m) return null;
    const [_, yy, MM, dd, hh, mm, ss] = m;
    return { y:+yy, M:+MM, d:+dd, h:+hh, m:+mm, s:ss?+ss:0 };
  }
  function toISOJST(fields){
    const {y,M,d,h,m,s} = fields;
    const pad=(n)=>('0'+n).slice(-2);
    return `${y}-${pad(M)}-${pad(d)}T${pad(h)}:${pad(m)}:${pad(s)}+09:00`;
  }
  function utcToISOJST(fields){
    const ms = Date.UTC(fields.y, fields.M-1, fields.d, fields.h, fields.m, fields.s);
    const d = new Date(ms + 9*3600*1000);
    const pad=(n)=>('0'+n).slice(-2);
    const y=d.getFullYear(), M=d.getMonth()+1, dd=d.getDate();
    const hh=d.getHours(), mm=d.getMinutes(), ss=d.getSeconds();
    return `${y}-${pad(M)}-${pad(dd)}T${pad(hh)}:${pad(mm)}:${pad(ss)}+09:00`;
  }
  function readInputs(){
    return {
      P1: inP1 && inP1.value.trim(),
      U1: inU1 && inU1.value.trim(),
      U2: inU2 && inU2.value.trim(),
      GREATEST: inG && inG.value.trim(),
      U3: inU3 && inU3.value.trim(),
      U4: inU4 && inU4.value.trim(),
      P4: inP4 && inP4.value.trim(),
    };
  }
  function applyInputs(asUTC){
    if (!btnJST && !btnUTC) return; // UI not present
    const raw = readInputs();
    const outTimes = Object.assign({}, evt.times||{});
    for (const k of Object.keys(raw)){
      const v = raw[k]; if (!v) continue;
      const f = parseYMDHMS(v); if (!f) continue;
      outTimes[k] = asUTC ? utcToISOJST(f) : toISOJST(f);
    }
    // Persist and reload
    try{
      localStorage.setItem('eclipseOverrides', JSON.stringify({ name: evt.name, times: outTimes }));
    }catch(_){/* ignore */}
    location.reload();
  }
  if (btnJST) btnJST.addEventListener('click', ()=>applyInputs(false));
  if (btnUTC) btnUTC.addEventListener('click', ()=>applyInputs(true));

  // Initial render
  timeSlider.value = dateToSlider(simTime);
  render();
})();
