(() => {
  // Dataset: 24 sekki, 3 kō each (standard modern names)
  const sekki = [
    { name: "立春", kous: ["東風解凍", "黄鶯睍睆", "魚上氷"] },
    { name: "雨水", kous: ["土脉潤起", "霞始靆", "草木萌動"] },
    { name: "啓蟄", kous: ["蟄虫啓戸", "桃始笑", "菜虫化蝶"] },
    { name: "春分", kous: ["雀始巣", "桜始開", "雷乃発声"] },
    { name: "清明", kous: ["玄鳥至", "鴻雁北", "虹始見"] },
    { name: "穀雨", kous: ["葭始生", "霜止出苗", "牡丹華"] },
    { name: "立夏", kous: ["蛙始鳴", "蚯蚓出", "竹笋生"] },
    { name: "小満", kous: ["蚕起食桑", "紅花栄", "麦秋至"] },
    { name: "芒種", kous: ["螳螂生", "腐草為蛍", "梅子黄"] },
    { name: "夏至", kous: ["乃東枯", "菖蒲華", "半夏生"] },
    { name: "小暑", kous: ["温風至", "蓮始開", "鷹乃学習"] },
    { name: "大暑", kous: ["桐始結花", "土潤溽暑", "大雨時行"] },
    { name: "立秋", kous: ["涼風至", "寒蝉鳴", "蒙霧升降"] },
    { name: "処暑", kous: ["綿柎開", "天地始粛", "禾乃登"] },
    { name: "白露", kous: ["草露白", "鶺鴒鳴", "玄鳥去"] },
    { name: "秋分", kous: ["雷乃収声", "蟄虫坏戸", "水始涸"] },
    { name: "寒露", kous: ["鴻雁来", "菊花開", "蟋蟀在戸"] },
    { name: "霜降", kous: ["霜始降", "霎時施", "楓蔦黄"] },
    { name: "立冬", kous: ["山茶始開", "地始凍", "金盞香"] },
    { name: "小雪", kous: ["虹蔵不見", "朔風払葉", "橘始黄"] },
    { name: "大雪", kous: ["閉塞成冬", "熊蟄穴", "鮭魚群"] },
    { name: "冬至", kous: ["乃東生", "麋角解", "雪下出麦"] },
    { name: "小寒", kous: ["芹乃栄", "水泉動", "雉始雊"] },
    { name: "大寒", kous: ["款冬華", "水沢腹堅", "鶏始乳"] }
  ];

  const q = (s, el = document) => el.querySelector(s);
  const qa = (s, el = document) => Array.from(el.querySelectorAll(s));

  const colors = [
    "#80d6ff", "#7fdfff", "#73f0e7", "#8df59a", "#c6f57a", "#f3f06d",
    "#ffe066", "#ffbe5c", "#ff9f7b", "#ff7f95", "#ff76c0", "#ff7fe8",
    "#ffd5a1", "#ffc27a", "#f2a766", "#d98b6a", "#b07d8c", "#8aa0c7",
    "#7fb6ff", "#60a5fa", "#5aa0f0", "#4a8bd6", "#3b74bd", "#345fa3"
  ];
  const seasonColor = (idx) => colors[idx % colors.length];

  // Theming: update accent and background based on current index
  function hexToRgb(hex) {
    const m = hex.replace('#','');
    const n = parseInt(m.length === 3 ? m.split('').map(c=>c+c).join('') : m, 16);
    return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
  }
  function mix(a, b, t) {
    return Math.round(a + (b - a) * t);
  }
  function lighten(hex, t = 0.35) {
    const {r,g,b} = hexToRgb(hex);
    const R = mix(r, 255, t), G = mix(g, 255, t), B = mix(b, 255, t);
    return `rgb(${R}, ${G}, ${B})`;
  }
  function darken(hex, t = 0.35) {
    const {r,g,b} = hexToRgb(hex);
    const R = mix(r, 0, t), G = mix(g, 0, t), B = mix(b, 0, t);
    return { r: R, g: G, b: B };
  }
  function mixRgb(a, b, t) {
    return {
      r: mix(a.r, b.r, t),
      g: mix(a.g, b.g, t),
      b: mix(a.b, b.b, t)
    };
  }
  function rgbToStr({r,g,b}) { return `rgb(${r}, ${g}, ${b})`; }
  function setThemeByIndex(i) {
    const acc = seasonColor(i);
    const acc2 = lighten(acc, 0.5);
    document.documentElement.style.setProperty('--accent', acc);
    document.documentElement.style.setProperty('--accent-2', acc2);
    // background hues: tint dark base with accent so season is reflected
    const base1 = { r: 10, g: 16, b: 32 };
    const base2 = { r: 8, g: 12, b: 20 };
    const accRgb = hexToRgb(acc);
    // blend ~25% accent into base for subtle seasonal tint
    const b1 = mixRgb(base1, accRgb, 0.25);
    const b2 = mixRgb(base2, accRgb, 0.18);
    document.documentElement.style.setProperty('--bg1', rgbToStr(b1));
    document.documentElement.style.setProperty('--bg2', rgbToStr(b2));
  }

  // Generative illustrations: unique per name
  function sekkiIndexByName(name) { return sekki.findIndex(s => s.name === name); }
  function sekkiIndexByKou(kname) {
    for (let i = 0; i < sekki.length; i++) if (sekki[i].kous.includes(kname)) return i;
    return 0;
  }
  function hashStr(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function randPick(r, arr) { return arr[Math.floor(r() * arr.length) % arr.length]; }
  function randInt(r, min, max) { return Math.floor(r() * (max - min + 1)) + min; }
  function polar(xc, yc, rad, ang) { const x = xc + rad * Math.cos(ang); const y = yc + rad * Math.sin(ang); return `${x.toFixed(2)},${y.toFixed(2)}`; }
  function illustSvgForName(name, idxForColor) {
    const seed = hashStr(name);
    const r = mulberry32(seed);
    const acc = seasonColor(idxForColor);
    const acc2 = lighten(acc, 0.55);
    const bg = lighten(acc, 0.88);
    const fam = randPick(r, ['petal','star','burst','rings','tri','grid','waves','flake']);
    let g = '';
    if (fam === 'petal') {
      const petals = randInt(r, 5, 10);
      const pr = randInt(r, 10, 18);
      for (let i = 0; i < petals; i++) {
        const a = (Math.PI * 2 * i) / petals;
        g += `<ellipse cx="32" cy="32" rx="6" ry="${pr}" transform="rotate(${(a*180/Math.PI).toFixed(1)},32,32)" fill="${acc2}" />`;
      }
      g += `<circle cx="32" cy="32" r="6" fill="${acc}"/>`;
    } else if (fam === 'star') {
      const spikes = randInt(r, 5, 12);
      const r1 = randInt(r, 6, 12), r2 = randInt(r, 16, 22);
      let path = '';
      for (let i = 0; i < spikes * 2; i++) {
        const ang = (Math.PI * i) / spikes;
        const rr = i % 2 ? r2 : r1;
        const [x, y] = [32 + rr * Math.cos(ang), 32 + rr * Math.sin(ang)];
        path += `${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)} `;
      }
      path += 'Z';
      g = `<path d="${path}" fill="${acc2}" stroke="${acc}" stroke-width="1.5"/>`;
    } else if (fam === 'burst') {
      const rays = randInt(r, 8, 18);
      for (let i = 0; i < rays; i++) {
        const ang = (Math.PI * 2 * i) / rays;
        const x1 = 32 + 6 * Math.cos(ang), y1 = 32 + 6 * Math.sin(ang);
        const x2 = 32 + randInt(r, 16, 26) * Math.cos(ang), y2 = 32 + randInt(r, 16, 26) * Math.sin(ang);
        g += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${acc}" stroke-width="1.6"/>`;
      }
      g += `<circle cx="32" cy="32" r="6" fill="${acc}"/>`;
    } else if (fam === 'rings') {
      const rings = randInt(r, 3, 6);
      for (let i = 0; i < rings; i++) {
        g += `<circle cx="32" cy="32" r="${10 + i*4}" fill="none" stroke="${acc2}" stroke-width="1.6"/>`;
      }
      g += `<circle cx="32" cy="32" r="6" fill="${acc}"/>`;
    } else if (fam === 'tri') {
      const t = randInt(r, 2, 4);
      for (let i = 0; i < t; i++) {
        const off = i * 6;
        g += `<path d="M ${20+off} 44 L 32 ${20+off} L ${44-off} 44 Z" fill="${i%2?acc:acc2}" opacity="${0.7 - i*0.1}"/>`;
      }
    } else if (fam === 'grid') {
      const dots = randInt(r, 3, 5);
      const step = 32 / (dots + 1);
      for (let i = 1; i <= dots; i++) {
        for (let j = 1; j <= dots; j++) {
          g += `<circle cx="${16 + (i-1)*step}" cy="${16 + (j-1)*step}" r="${randInt(r,1,3)}" fill="${acc}"/>`;
        }
      }
    } else if (fam === 'waves') {
      const lines = randInt(r, 2, 4);
      for (let i = 0; i < lines; i++) {
        const y = 24 + i * 6;
        g += `<path d="M 8 ${y} Q 20 ${y-6} 32 ${y} T 56 ${y}" fill="none" stroke="${acc}" stroke-width="1.6"/>`;
      }
    } else if (fam === 'flake') {
      const branches = randInt(r, 5, 8);
      for (let i = 0; i < branches; i++) {
        const ang = (Math.PI * 2 * i) / branches;
        const x2 = 32 + 18 * Math.cos(ang), y2 = 32 + 18 * Math.sin(ang);
        g += `<line x1="32" y1="32" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${acc}" stroke-width="1.4"/>`;
      }
      g += `<circle cx="32" cy="32" r="5" fill="${acc}"/>`;
    }
    return `
      <svg class="tip-illust" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="rg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="${acc2}" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="${bg}" stop-opacity="0.15"/>
          </radialGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#rg)" />
        ${g}
      </svg>`;
  }

  // Hint data: 読みと簡潔な意味
  const sekkiInfo = {
    "立春": { yomi: "りっしゅん", desc: "春のはじまり。寒さの底から気が緩む頃。" },
    "雨水": { yomi: "うすい", desc: "雪が雨に、氷が水に。大地が潤い出す頃。" },
    "啓蟄": { yomi: "けいちつ", desc: "土中の虫が目覚めて穴を開く頃。" },
    "春分": { yomi: "しゅんぶん", desc: "昼と夜がほぼ等しい頃。" },
    "清明": { yomi: "せいめい", desc: "万物が清らかで生き生きと見える頃。" },
    "穀雨": { yomi: "こくう", desc: "穀物を育てる恵みの雨が降る頃。" },
    "立夏": { yomi: "りっか", desc: "夏のはじまり。新緑が鮮やか。" },
    "小満": { yomi: "しょうまん", desc: "草木が茂り、万物が満ち始める頃。" },
    "芒種": { yomi: "ぼうしゅ", desc: "芒ある穀物の種まき時。" },
    "夏至": { yomi: "げし", desc: "一年で最も昼が長い頃。" },
    "小暑": { yomi: "しょうしょ", desc: "暑さが本格化し始める頃。" },
    "大暑": { yomi: "たいしょ", desc: "一年で最も暑さが厳しい頃。" },
    "立秋": { yomi: "りっしゅう", desc: "秋のはじまり。暑さの中に秋の気配。" },
    "処暑": { yomi: "しょしょ", desc: "暑さが次第に落ち着く頃。" },
    "白露": { yomi: "はくろ", desc: "草に白い露が降りる頃。" },
    "秋分": { yomi: "しゅうぶん", desc: "昼と夜がほぼ等しい頃。" },
    "寒露": { yomi: "かんろ", desc: "冷たい露が降り、空気が澄む頃。" },
    "霜降": { yomi: "そうこう", desc: "初霜が降りる頃。" },
    "立冬": { yomi: "りっとう", desc: "冬のはじまり。木枯らし。" },
    "小雪": { yomi: "しょうせつ", desc: "わずかに雪が降り始める頃。" },
    "大雪": { yomi: "たいせつ", desc: "雪が多く降る頃。" },
    "冬至": { yomi: "とうじ", desc: "一年で最も夜が長い頃。" },
    "小寒": { yomi: "しょうかん", desc: "寒さが強まり始める頃。" },
    "大寒": { yomi: "だいかん", desc: "一年で最も寒さが厳しい頃。" }
  };

  const kouInfo = {
    "東風解凍": { yomi: "はるかぜ こおりを とく", desc: "春の風が氷を解かし始める。" },
    "黄鶯睍睆": { yomi: "うぐいす なく", desc: "鶯が美しく鳴く。" },
    "魚上氷": { yomi: "うお こおりを いずる", desc: "氷の割れ目から魚が動く。" },
    "土脉潤起": { yomi: "つち うるおい おこる", desc: "大地に潤いが戻る。" },
    "霞始靆": { yomi: "かすみ はじめて たなびく", desc: "春霞がたなびく。" },
    "草木萌動": { yomi: "そうもく めばえ いずる", desc: "草木が芽吹く。" },
    "蟄虫啓戸": { yomi: "すごもりむし とを ひらく", desc: "冬ごもりの虫が出る。" },
    "桃始笑": { yomi: "もも はじめて さく", desc: "桃の花が咲く。" },
    "菜虫化蝶": { yomi: "なむし ちょうと なる", desc: "青虫が蝶になる。" },
    "雀始巣": { yomi: "すずめ はじめて すくう", desc: "雀が巣作りを始める。" },
    "桜始開": { yomi: "さくら はじめて ひらく", desc: "桜が開花する。" },
    "雷乃発声": { yomi: "かみなり すなわち こえを はっす", desc: "春雷が鳴る。" },
    "玄鳥至": { yomi: "つばめ きたる", desc: "燕が渡来する。" },
    "鴻雁北": { yomi: "こうがん かえる", desc: "雁が北へ帰る。" },
    "虹始見": { yomi: "にじ はじめて あらわる", desc: "虹が見え始める。" },
    "葭始生": { yomi: "あし はじめて しょうず", desc: "葦が芽吹く。" },
    "霜止出苗": { yomi: "しも やみて なえ いずる", desc: "霜がやみ、苗が育つ。" },
    "牡丹華": { yomi: "ぼたん はな さく", desc: "牡丹が見頃。" },
    "蛙始鳴": { yomi: "かわず はじめて なく", desc: "蛙が鳴き始める。" },
    "蚯蚓出": { yomi: "みみず いづる", desc: "ミミズが地上へ。" },
    "竹笋生": { yomi: "たけのこ しょうず", desc: "筍が伸びる。" },
    "蚕起食桑": { yomi: "かいこ くわを はむ", desc: "蚕が桑を食べる。" },
    "紅花栄": { yomi: "べにばな さかう", desc: "紅花が盛ん。" },
    "麦秋至": { yomi: "むぎの とき いたる", desc: "麦の収穫期。" },
    "螳螂生": { yomi: "かまきり しょうず", desc: "カマキリが生まれる。" },
    "腐草為蛍": { yomi: "くされたる くさ ほたると なる", desc: "蛍が舞い始める。" },
    "梅子黄": { yomi: "うめのみ きばむ", desc: "梅が熟す。" },
    "乃東枯": { yomi: "なつかれくさ かるる", desc: "夏枯草が枯れる。" },
    "菖蒲華": { yomi: "あやめ はな さく", desc: "アヤメが咲く。" },
    "半夏生": { yomi: "はんげ しょうず", desc: "半夏が生える。" },
    "温風至": { yomi: "あつかぜ いたる", desc: "暖かい風が吹く。" },
    "蓮始開": { yomi: "はす はじめて ひらく", desc: "蓮が開花する。" },
    "鷹乃学習": { yomi: "たか わざを ならう", desc: "鷹の子が狩りを学ぶ。" },
    "桐始結花": { yomi: "きり はなを むすぶ", desc: "桐の花芽がつく。" },
    "土潤溽暑": { yomi: "つち うるおい むしあつし", desc: "土が湿り蒸し暑い。" },
    "大雨時行": { yomi: "たいう ときどき ふる", desc: "激しい雨が時折降る。" },
    "涼風至": { yomi: "すずかぜ いたる", desc: "涼しい風が吹く。" },
    "寒蝉鳴": { yomi: "ひぐらし なく", desc: "ひぐらしが鳴く。" },
    "蒙霧升降": { yomi: "ふかき きり まとう", desc: "深い霧が立ちこめる。" },
    "綿柎開": { yomi: "わたの はなしべ ひらく", desc: "綿の萼が開く。" },
    "天地始粛": { yomi: "てんち はじめて さむし", desc: "暑さが鎮まり秋めく。" },
    "禾乃登": { yomi: "こくもの みのる", desc: "稲などが実る。" },
    "草露白": { yomi: "くさの つゆ しろし", desc: "露が白く光る。" },
    "鶺鴒鳴": { yomi: "せきれい なく", desc: "セキレイが鳴く。" },
    "玄鳥去": { yomi: "つばめ さる", desc: "燕が南へ去る。" },
    "雷乃収声": { yomi: "かみなり こえを おさむ", desc: "雷がおさまる。" },
    "蟄虫坏戸": { yomi: "むし かくれて とを ふさぐ", desc: "虫が土中に隠れる。" },
    "水始涸": { yomi: "みず はじめて かる", desc: "田畑の水がなくなる。" },
    "鴻雁来": { yomi: "がん きたる", desc: "雁が渡ってくる。" },
    "菊花開": { yomi: "きくの はな ひらく", desc: "菊が咲き始める。" },
    "蟋蟀在戸": { yomi: "きりぎりす とに あり", desc: "コオロギが戸口で鳴く。" },
    "霜始降": { yomi: "しも はじめて ふる", desc: "霜が降り始める。" },
    "霎時施": { yomi: "こさめ ときどき ふる", desc: "時雨のような小雨。" },
    "楓蔦黄": { yomi: "もみじ つた きばむ", desc: "紅葉や蔦が色づく。" },
    "山茶始開": { yomi: "つばき はじめて ひらく", desc: "山茶花・椿が咲く。" },
    "地始凍": { yomi: "ち はじめて こおる", desc: "地面が凍り始める。" },
    "金盞香": { yomi: "すいせん かんばし", desc: "水仙の香りが高まる。" },
    "虹蔵不見": { yomi: "にじ かくれて みえず", desc: "虹が見えにくくなる。" },
    "朔風払葉": { yomi: "きたかぜ このはを はらう", desc: "北風が木の葉を散らす。" },
    "橘始黄": { yomi: "たちばな きばむ", desc: "橘の実が色づく。" },
    "閉塞成冬": { yomi: "そら ふさがり ふゆと なる", desc: "空がどんより冬めく。" },
    "熊蟄穴": { yomi: "くま あなに こもる", desc: "熊が穴にこもる。" },
    "鮭魚群": { yomi: "さけ むらがる", desc: "鮭が群れ上る頃。" },
    "乃東生": { yomi: "なつかれくさ しょうず", desc: "夏枯草が芽を出す。" },
    "麋角解": { yomi: "おおじか つの おつる", desc: "大鹿の角が落ちる。" },
    "雪下出麦": { yomi: "ゆき したに むぎ いず", desc: "雪下で麦が芽を出す。" },
    "芹乃栄": { yomi: "せり さかう", desc: "芹がよく育つ。" },
    "水泉動": { yomi: "しみず うごき はじめる", desc: "湧き水が動き出す。" },
    "雉始雊": { yomi: "きじ はじめて なく", desc: "雉が鳴く。" },
    "款冬華": { yomi: "ふきの はな さく", desc: "蕗の花が咲く。" },
    "水沢腹堅": { yomi: "さわみず こおり つめる", desc: "沢の氷が厚く張る。" },
    "鶏始乳": { yomi: "にわとり とやに つく", desc: "鶏が卵を抱く頃。" }
  };

  function buildTooltip(type, name) {
    const info = type === 'sekki' ? sekkiInfo[name] : kouInfo[name];
    const yomi = info?.yomi || '—';
    const desc = info?.desc || '（準備中）';
    const idx = type === 'sekki' ? sekkiIndexByName(name) : sekkiIndexByKou(name);
    const svg = illustSvgForName(name, idx);
    return `${svg}<div class="tip-title">${name}</div><div class="tip-yomi">${yomi}</div><div class="tip-desc">${desc}</div>`;
  }

  let tipEl = null;
  let moveListener = null;
  function ensureTip() {
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'tooltip-card';
      document.body.appendChild(tipEl);
    }
    return tipEl;
  }

  function showTip(html) {
    const el = ensureTip();
    el.innerHTML = html;
    el.style.display = 'block';
  }
  function hideTip() {
    if (tipEl) tipEl.style.display = 'none';
    if (moveListener) {
      window.removeEventListener('mousemove', moveListener);
      moveListener = null;
    }
  }
  function positionTip(x, y) {
    const el = ensureTip();
    const pad = 10;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x + 14;
    let top = y + 14;
    if (left + w + pad > vw) left = vw - w - pad;
    if (top + h + pad > vh) top = vh - h - pad;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  function addHover(el, type, name) {
    el.addEventListener('mouseenter', (e) => {
      showTip(buildTooltip(type, name));
      positionTip(e.clientX, e.clientY);
      moveListener = (ev) => positionTip(ev.clientX, ev.clientY);
      window.addEventListener('mousemove', moveListener);
    });
    el.addEventListener('mouseleave', hideTip);
  }

  // Elements
  const instruction = q('#instruction');
  const progressList = q('#progress-list');
  const choices = q('#choices');
  const result = q('#result');
  const indicator = q('#progress-indicator');
  const resetBtn = q('#reset');
  const kouControls = q('#kou-controls');
  const confirmKouBtn = q('#confirm-kou');
  const currentSekkiEl = q('#current-sekki');

  // State
  const state = {
    index: 0,            // which sekki to choose next
    chosen: [],          // names selected so far
    stage: 'sekki',      // 'sekki' | 'kou'
    currentKous: null,   // array of 3 correct kous for current chosen sekki
    kouScores: [],       // correct counts per chosen sekki index
    kouShown: []         // rendered correct kous text per chosen sekki
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function updateIndicator() {
    indicator.textContent = `${state.index + 1} / ${sekki.length}`;
  }

  function renderProgress() {
    progressList.innerHTML = '';
    state.chosen.forEach((name, i) => {
      const li = document.createElement('li');
      const badge = state.kouScores[i] != null ? `${state.kouScores[i]}/3` : '';
      const svg = illustSvgForName(name, i).replace('class="tip-illust"','class="illust"');
      li.innerHTML = `${svg}<div class="row"><span><span class="idx">${String(i + 1).padStart(2, '0')}</span><strong>${name}</strong></span><span class="badge">${badge}</span></div><div class="kous"></div>`;
      li.style.borderColor = seasonColor(i);
      // hint now inline on cards; no tooltip on progress cards
      const kousEl = li.querySelector('.kous');
      if (state.kouShown[i]) {
        const parts = String(state.kouShown[i]).split('・');
        kousEl.innerHTML = '';
        parts.forEach(t => {
          const d = document.createElement('div');
          d.className = 'kou-item';
          d.textContent = t;
          kousEl.appendChild(d);
        });
      }
      progressList.appendChild(li);
    });
  }

  function setMessage(text, ok = null) {
    result.className = 'result' + (ok === null ? '' : ok ? ' good' : ' bad');
    result.textContent = text || '';
  }

  function nextSekkiQuestion() {
    state.stage = 'sekki';
    if (typeof saveState === 'function') saveState();
    setMessage('');
    kouControls.style.display = 'none';
    currentSekkiEl.style.display = 'none';
    choices.innerHTML = '';

    if (state.index >= sekki.length) {
      const total = state.kouScores.reduce((a, b) => a + (b || 0), 0);
      instruction.textContent = 'おめでとうございます。二十四節気をすべて選びました！';
      setMessage(`最終スコア: ${total} / 72`, true);
      updateIndicator();
      return;
    }

    instruction.textContent = state.index === 0 ? '最初の節気を選んでください。' : '次の節気を選んでください。';
    updateIndicator();
    setThemeByIndex(state.index);

    const correct = sekki[state.index];
    const pool = sekki.filter((_, i) => i !== state.index);
    const decoys = shuffle(pool).slice(0, 3).map(s => s.name);
    const options = shuffle([correct.name, ...decoys]);

    options.forEach(name => {
      const li = document.createElement('li');
      li.className = 'card selectable';
      li.style.borderColor = seasonColor(state.index);
      const info = sekkiInfo[name] || {};
      const idxForColor = sekkiIndexByName(name);
      const svg = illustSvgForName(name, idxForColor);
      li.innerHTML = `${svg.replace('class="tip-illust"','class="illust"')}<div class="title">${name}</div><div class="yomi">${info.yomi || ''}</div><div class="desc">${info.desc || ''}</div><div class="sub">節気</div>`;
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-label', `${name}（節気） ${info.yomi ? 'よみ: ' + info.yomi : ''}`.trim());
      li.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); li.click(); }
      });
      li.addEventListener('click', () => {
        if (name === correct.name) {
          state.chosen.push(name);
          state.kouScores.push(null);
          state.kouShown.push('');
          renderProgress();
          setMessage('正解！三候を選びましょう。', true);
          // Move to kō stage for the chosen sekki
          state.currentKous = correct.kous.slice();
          renderKouQuestion(correct.name, state.currentKous, state.index);
          state.index += 1;
          if (typeof saveState === 'function') saveState();
        } else {
          li.classList.add('blink-wrong');
          setTimeout(() => li.classList.remove('blink-wrong'), 450);
          setMessage('惜しい…もう一度選んでください。', false);
        }
      });
      choices.appendChild(li);
    });
  }

  function renderKouQuestion(sekkiName, correctKous, colorIdx) {
    state.stage = 'kou';
    instruction.textContent = `「${sekkiName}」の三候を3つ選ぶと自動で進みます。`;
    currentSekkiEl.style.display = '';
    currentSekkiEl.textContent = sekkiName;
    currentSekkiEl.style.borderColor = seasonColor(colorIdx);
    setThemeByIndex(colorIdx);
    choices.innerHTML = '';
    setMessage('');
    kouControls.style.display = 'none';

    const decoys = [];
    while (decoys.length < 3) {
      const r = sekki[Math.floor(Math.random() * sekki.length)];
      const c = r.kous[Math.floor(Math.random() * 3)];
      if (!correctKous.includes(c) && !decoys.includes(c)) decoys.push(c);
    }
    const items = shuffle([...correctKous, ...decoys]);

    items.forEach(text => {
      const li = document.createElement('li');
      li.className = 'card selectable';
      li.style.borderColor = seasonColor(colorIdx);
      const info = kouInfo[text] || {};
      const idxForColor = sekkiIndexByKou(text);
      const svg = illustSvgForName(text, idxForColor);
      li.innerHTML = `${svg.replace('class="tip-illust"','class="illust"')}<div class="title">${text}</div><div class="yomi">${info.yomi || ''}</div><div class="desc">${info.desc || ''}</div><div class="sub">候</div>`;
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.setAttribute('aria-pressed', 'false');
      li.setAttribute('aria-label', `${text}（候） ${info.yomi ? 'よみ: ' + info.yomi : ''}`.trim());
      li.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); li.click(); }
      });
      li.addEventListener('click', () => {
        // 最大3つまで選択可能。3つ揃ったら自動で採点・進行。
        if (!li.classList.contains('selected')) {
          const count = qa('#choices .card.selected').length;
          if (count >= 3) return;
          li.classList.add('selected');
          li.setAttribute('aria-pressed', 'true');
        } else {
          li.classList.remove('selected');
          li.setAttribute('aria-pressed', 'false');
        }
        const countNow = qa('#choices .card.selected').length;
        if (countNow === 3 && typeof confirmKouBtn.onclick === 'function') {
          confirmKouBtn.onclick();
        }
      });
      choices.appendChild(li);
    });

    confirmKouBtn.onclick = () => {
      // disable interactions during grading
      confirmKouBtn.disabled = true;
      qa('#choices .card').forEach(el => el.style.pointerEvents = 'none');

      const selected = qa('#choices .card.selected').map(el => el.querySelector('.title').textContent.trim());
      let correctCount = 0;
      qa('#choices .card').forEach(el => {
        const title = el.querySelector('.title').textContent.trim();
        const isSelected = el.classList.contains('selected');
        const isCorrect = correctKous.includes(title);
        if (isSelected && isCorrect) {
          el.classList.add('correct');
          correctCount++;
        } else if (isSelected && !isCorrect) {
          el.classList.add('wrong');
        }
      });

      // Update progress list badge for the latest chosen sekki
      const lastIdx = state.chosen.length - 1;
      state.kouScores[lastIdx] = correctCount;
      state.kouShown[lastIdx] = correctKous.join('・');
      const lastLi = progressList.children[lastIdx];
      if (lastLi) {
        const badgeEl = lastLi.querySelector('.badge');
        if (badgeEl) badgeEl.textContent = `${correctCount}/3`;
        const kousEl = lastLi.querySelector('.kous');
        if (kousEl) {
          kousEl.innerHTML = '';
          correctKous.forEach(t => {
            const d = document.createElement('div');
            d.className = 'kou-item';
            d.textContent = t;
            kousEl.appendChild(d);
          });
        }
      }

      // clear textual result, rely on colors
      setMessage('');
      if (typeof saveState === 'function') saveState();

      // proceed to next sekki after a short pause
      setTimeout(() => {
        confirmKouBtn.disabled = false;
        nextSekkiQuestion();
      }, 1000);
    };
  }

  function reset() {
    state.index = 0;
    state.chosen = [];
    state.stage = 'sekki';
    state.currentKous = null;
    state.kouScores = [];
    state.kouShown = [];
    setThemeByIndex(0);
    renderProgress();
    nextSekkiQuestion();
    if (typeof saveState === 'function') saveState();
  }

  resetBtn.addEventListener('click', reset);
  // Persistence
  const STORAGE_KEY = 'sekkiKouGameStateV1';
  function saveState() {
    try {
      const data = {
        index: state.index,
        chosen: state.chosen,
        stage: state.stage,
        currentKous: state.currentKous,
        kouScores: state.kouScores,
        kouShown: state.kouShown
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data.index !== 'number') return null;
      return data;
    } catch { return null; }
  }

  function boot() {
    const saved = loadState();
    if (saved && Array.isArray(saved.chosen) && Array.isArray(saved.kouScores)) {
      state.index = saved.index;
      state.chosen = saved.chosen;
      state.stage = saved.stage;
      state.currentKous = saved.currentKous;
      state.kouScores = saved.kouScores;
      state.kouShown = saved.kouShown || [];
      renderProgress();
      updateIndicator();
      const colorIdx = Math.max(0, Math.min(sekki.length - 1, state.stage === 'kou' ? state.index - 1 : state.index));
      setThemeByIndex(colorIdx);
      if (state.stage === 'kou' && state.currentKous && state.chosen.length > 0) {
        const lastName = state.chosen[state.chosen.length - 1];
        renderKouQuestion(lastName, state.currentKous, colorIdx);
      } else {
        nextSekkiQuestion();
      }
    } else {
      reset();
    }
  }

  // boot
  boot();
})();
