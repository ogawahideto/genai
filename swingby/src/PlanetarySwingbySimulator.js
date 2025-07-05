import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Info, Settings } from 'lucide-react';

const PlanetarySwingbySimulator = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // 初期設定値
  const [initialSettings, setInitialSettings] = useState({
    spacecraftX: 100,
    spacecraftY: 300,
    spacecraftVx: 2,
    spacecraftVy: 0,
    planetX: 400,
    planetY: 300,
    planetVx: 0,
    planetVy: 1,
    planetMass: 1000,
    planetRadius: 30
  });
  
  const [spacecraft, setSpacecraft] = useState({
    x: 100,
    y: 300,
    vx: 2,
    vy: 0,
    trail: []
  });
  const [planet, setPlanet] = useState({
    x: 400,
    y: 300,
    vx: 0,
    vy: 1,
    mass: 1000,
    radius: 30
  });
  const [time, setTime] = useState(0);
  const [initialSpeed, setInitialSpeed] = useState(2);
  const [finalSpeed, setFinalSpeed] = useState(2);

  const resetSimulation = () => {
    setIsPlaying(false);
    setTime(0);
    setSpacecraft({
      x: initialSettings.spacecraftX,
      y: initialSettings.spacecraftY,
      vx: initialSettings.spacecraftVx,
      vy: initialSettings.spacecraftVy,
      trail: []
    });
    setPlanet({
      x: initialSettings.planetX,
      y: initialSettings.planetY,
      vx: initialSettings.planetVx,
      vy: initialSettings.planetVy,
      mass: initialSettings.planetMass,
      radius: initialSettings.planetRadius
    });
    const speed = Math.sqrt(initialSettings.spacecraftVx * initialSettings.spacecraftVx + 
                          initialSettings.spacecraftVy * initialSettings.spacecraftVy);
    setInitialSpeed(speed);
    setFinalSpeed(speed);
  };

  const applySettings = () => {
    resetSimulation();
    setShowControls(false);
  };

  const presets = {
    acceleration: {
      name: "加速スイングバイ",
      description: "惑星の後方から接近して加速を得る",
      spacecraftX: 100,
      spacecraftY: 350,
      spacecraftVx: 2.5,
      spacecraftVy: -0.5,
      planetX: 400,
      planetY: 200,
      planetVx: 0,
      planetVy: 1.5,
      planetMass: 1200,
      planetRadius: 35
    },
    deceleration: {
      name: "減速スイングバイ",
      description: "惑星の前方から接近して減速する",
      spacecraftX: 100,
      spacecraftY: 100,
      spacecraftVx: 3,
      spacecraftVy: 0.5,
      planetX: 400,
      planetY: 300,
      planetVx: 0,
      planetVy: -0.8,
      planetMass: 1200,
      planetRadius: 32
    },
    highSpeed: {
      name: "高速通過",
      description: "高速で惑星を通過する場合",
      spacecraftX: 80,
      spacecraftY: 300,
      spacecraftVx: 4,
      spacecraftVy: 0,
      planetX: 350,
      planetY: 300,
      planetVx: 0,
      planetVy: 0.8,
      planetMass: 800,
      planetRadius: 25
    },
    closeApproach: {
      name: "接近通過",
      description: "惑星に非常に接近して通過",
      spacecraftX: 120,
      spacecraftY: 320,
      spacecraftVx: 1.8,
      spacecraftVy: -0.3,
      planetX: 380,
      planetY: 280,
      planetVx: 0,
      planetVy: 1,
      planetMass: 1500,
      planetRadius: 40
    }
  };

  const applyPreset = (presetKey) => {
    const preset = presets[presetKey];
    setInitialSettings({
      spacecraftX: preset.spacecraftX,
      spacecraftY: preset.spacecraftY,
      spacecraftVx: preset.spacecraftVx,
      spacecraftVy: preset.spacecraftVy,
      planetX: preset.planetX,
      planetY: preset.planetY,
      planetVx: preset.planetVx,
      planetVy: preset.planetVy,
      planetMass: preset.planetMass,
      planetRadius: preset.planetRadius
    });
    resetSimulation();
  };

  const calculateGravity = (sc, pl) => {
    const dx = pl.x - sc.x;
    const dy = pl.y - sc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) return { fx: 0, fy: 0 };
    
    const force = (pl.mass * 0.1) / (distance * distance);
    const fx = force * dx / distance;
    const fy = force * dy / distance;
    
    return { fx, fy };
  };

  const updateSimulation = () => {
    setSpacecraft(prevSc => {
      const { fx, fy } = calculateGravity(prevSc, planet);
      
      const newVx = prevSc.vx + fx;
      const newVy = prevSc.vy + fy;
      const newX = prevSc.x + newVx;
      const newY = prevSc.y + newVy;
      
      const newTrail = [...prevSc.trail, { x: prevSc.x, y: prevSc.y }];
      if (newTrail.length > 100) newTrail.shift();
      
      const currentSpeed = Math.sqrt(newVx * newVx + newVy * newVy);
      setFinalSpeed(currentSpeed);
      
      return {
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
        trail: newTrail
      };
    });

    setPlanet(prevPl => ({
      ...prevPl,
      x: prevPl.x + prevPl.vx,
      y: prevPl.y + prevPl.vy
    }));

    setTime(prevTime => prevTime + 1);
  };

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = setInterval(updateSimulation, 50);
    } else {
      clearInterval(animationRef.current);
    }
    
    return () => clearInterval(animationRef.current);
  }, [isPlaying, planet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 背景の星
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // 宇宙船の軌跡
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    spacecraft.trail.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    
    // 惑星の重力場（視覚化）
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    for (let r = 50; r <= 150; r += 25) {
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, r, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // 惑星
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // 惑星の影
    ctx.fillStyle = '#cc4425';
    ctx.beginPath();
    ctx.arc(planet.x - 5, planet.y - 5, planet.radius * 0.8, 0, 2 * Math.PI);
    ctx.fill();
    
    // 宇宙船
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(spacecraft.x, spacecraft.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // 速度ベクトル
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(spacecraft.x, spacecraft.y);
    ctx.lineTo(spacecraft.x + spacecraft.vx * 10, spacecraft.y + spacecraft.vy * 10);
    ctx.stroke();
    
  }, [spacecraft, planet, time]);

  const speedGain = ((finalSpeed - initialSpeed) / initialSpeed * 100).toFixed(1);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">惑星スイングバイシミュレータ</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowControls(!showControls)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Settings size={20} />
            設定
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Info size={20} />
            仕組み
          </button>
        </div>
      </div>

      {showControls && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <h3 className="text-xl font-semibold mb-4 text-purple-400">初期設定</h3>
          
          {/* プリセットセクション */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3 text-yellow-400">プリセット</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(presets).map(([key, preset]) => (
                <div key={key} className="bg-gray-700 p-3 rounded-lg">
                  <h5 className="font-semibold text-white mb-1">{preset.name}</h5>
                  <p className="text-sm text-gray-300 mb-2">{preset.description}</p>
                  <button
                    onClick={() => applyPreset(key)}
                    className="w-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    適用
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium mb-3 text-cyan-400">宇宙船の初期設定</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">X座標</label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={initialSettings.spacecraftX}
                    onChange={(e) => setInitialSettings({...initialSettings, spacecraftX: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{initialSettings.spacecraftX}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Y座標</label>
                  <input
                    type="range"
                    min="100"
                    max="350"
                    value={initialSettings.spacecraftY}
                    onChange={(e) => setInitialSettings({...initialSettings, spacecraftY: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{initialSettings.spacecraftY}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">X方向速度</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={initialSettings.spacecraftVx}
                    onChange={(e) => setInitialSettings({...initialSettings, spacecraftVx: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{initialSettings.spacecraftVx}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Y方向速度</label>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.1"
                    value={initialSettings.spacecraftVy}
                    onChange={(e) => setInitialSettings({...initialSettings, spacecraftVy: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{initialSettings.spacecraftVy}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-3 text-orange-400">惑星の初期設定</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">X座標</label>
                  <input
                    type="range"
                    min="300"
                    max="500"
                    value={initialSettings.planetX}
                    onChange={(e) => setInitialSettings({...initialSettings, planetX: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{initialSettings.planetX}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Y座標</label>
                  <input
                    type="range"
                    min="150"
                    max="350"
                    value={initialSettings.planetY}
                    onChange={(e) => setInitialSettings({...initialSettings, planetY: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{initialSettings.planetY}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">X方向速度</label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={initialSettings.planetVx}
                    onChange={(e) => setInitialSettings({...initialSettings, planetVx: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{initialSettings.planetVx}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Y方向速度</label>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    value={initialSettings.planetVy}
                    onChange={(e) => setInitialSettings({...initialSettings, planetVy: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{initialSettings.planetVy}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">質量</label>
                  <input
                    type="range"
                    min="500"
                    max="2000"
                    step="100"
                    value={initialSettings.planetMass}
                    onChange={(e) => setInitialSettings({...initialSettings, planetMass: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{initialSettings.planetMass}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">半径</label>
                  <input
                    type="range"
                    min="20"
                    max="50"
                    value={initialSettings.planetRadius}
                    onChange={(e) => setInitialSettings({...initialSettings, planetRadius: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-400">{initialSettings.planetRadius}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={applySettings}
              className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              設定を適用
            </button>
            <button
              onClick={() => {
                setInitialSettings({
                  spacecraftX: 100,
                  spacecraftY: 300,
                  spacecraftVx: 2,
                  spacecraftVy: 0,
                  planetX: 400,
                  planetY: 300,
                  planetVx: 0,
                  planetVy: 1,
                  planetMass: 1000,
                  planetRadius: 30
                });
              }}
              className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              デフォルトに戻す
            </button>
          </div>
        </div>
      )}

      {showInfo && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <h3 className="text-xl font-semibold mb-3 text-cyan-400">スイングバイとは？</h3>
          <div className="space-y-2 text-gray-300">
            <p>• 宇宙船が惑星の重力を利用して速度と軌道を変える技術</p>
            <p>• 燃料を使わずに加速・減速・軌道変更が可能</p>
            <p>• 惑星の運動エネルギーを宇宙船に移すことで実現</p>
            <p>• NASA の惑星探査機で頻繁に使用される手法</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="border-2 border-gray-600 rounded-lg w-full"
          />
          
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? '停止' : '開始'}
            </button>
            
            <button
              onClick={resetSimulation}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={20} />
              リセット
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-cyan-400">シミュレーション情報</h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400">時間</div>
                <div className="text-xl font-mono">{(time / 20).toFixed(1)}秒</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">初期速度</div>
                <div className="text-xl font-mono text-blue-400">{initialSpeed.toFixed(2)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">現在速度</div>
                <div className="text-xl font-mono text-green-400">{finalSpeed.toFixed(2)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400">速度増加</div>
                <div className={`text-xl font-mono ${speedGain > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {speedGain > 0 ? '+' : ''}{speedGain}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-cyan-400">凡例</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white rounded-full border-2 border-cyan-400"></div>
                <span>宇宙船</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span>惑星</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-cyan-400"></div>
                <span>軌跡</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500"></div>
                <span>速度ベクトル</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 border border-yellow-400 opacity-50"></div>
                <span>重力場</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-cyan-400">観察ポイント</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• 惑星に近づくと宇宙船が加速</p>
              <p>• 惑星から離れるときの速度変化</p>
              <p>• 軌道の曲がり方</p>
              <p>• 最終的な速度の変化</p>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-yellow-400">スイングバイの種類</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-green-400">加速スイングバイ</div>
                <div className="text-gray-300">惑星の後方から接近し、惑星の運動エネルギーを受け取って加速</div>
              </div>
              <div>
                <div className="font-semibold text-red-400">減速スイングバイ</div>
                <div className="text-gray-300">惑星の前方から接近し、惑星にエネルギーを渡して減速</div>
              </div>
              <div>
                <div className="font-semibold text-blue-400">軌道変更</div>
                <div className="text-gray-300">速度の大きさより方向の変化が主目的</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetarySwingbySimulator;