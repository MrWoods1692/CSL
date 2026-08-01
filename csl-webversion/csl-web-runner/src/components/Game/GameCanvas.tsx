'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import HUD from './HUD';

interface GameCanvasProps {
  version: string;
  serverAddress?: string;
  seed?: string;
  onBack: () => void;
}

// Map version to WASM module path and class name
function getWasmConfig(version: string): { path: string; className: string } {
  const configMap: Record<string, { path: string; className: string }> = {
    '1.21.4': { path: '/wasm/mc1_21_4', className: 'Mc1214Engine' },
    '1.20.4': { path: '/wasm/mc1_20_4', className: 'Mc1204Engine' },
    '1.19.4': { path: '/wasm/mc1_19_4', className: 'Mc1194Engine' },
  };
  return configMap[version] || { path: '/wasm/mc1_21_4', className: 'Mc1214Engine' };
}

export default function GameCanvas({ version, serverAddress, seed, onBack }: GameCanvasProps) {
  const [fps, setFps] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const engineRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    async function initEngine() {
      try {
        setLoading(true);
        const { path, className } = getWasmConfig(version);
        
        // Dynamic import of the WASM module for the selected version
        const wasmModule = await import(`../../../public${path}/csl_${path.split('/').pop()}.js`);
        await wasmModule.default();
        
        // Create engine instance using the correct class for this version
        const EngineClass = wasmModule[className];
        if (!EngineClass) {
          throw new Error(`Engine class ${className} not found in WASM module`);
        }
        const engine = new EngineClass(version);
        
        if (!mounted) return;
        
        engine.init('game-canvas');
        
        if (serverAddress) {
          const [host, portStr] = serverAddress.split(':');
          const port = parseInt(portStr) || 25565;
          engine.connect_server(host, port);
        } else {
          const seedNum = seed ? parseInt(seed) || hashString(seed) : Math.floor(Math.random() * 2147483647);
          engine.load_singleplayer(seedNum);
        }
        
        engine.start();
        engineRef.current = engine;
        setLoading(false);
        
        // Start game loop
        lastTimeRef.current = performance.now();
        gameLoop();
      } catch (err: any) {
        console.error('Failed to initialize engine:', err);
        setError(err.message || 'Failed to load game engine');
        setLoading(false);
      }
    }

    function gameLoop() {
      if (!mounted) return;
      
      const now = performance.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      
      try {
        if (engineRef.current) {
          engineRef.current.tick(dt);
          setFps(Math.round(engineRef.current.get_fps()));
          
          const posStr = engineRef.current.get_player_position();
          if (posStr) {
            try {
              const pos = JSON.parse(posStr);
              if (pos && Array.isArray(pos) && pos.length === 3) {
                setPosition({ x: pos[0], y: pos[1], z: pos[2] });
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error('Game loop error:', err);
      }
      
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }

    initEngine();

    return () => {
      mounted = false;
      cancelAnimationFrame(animFrameRef.current);
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [version, serverAddress, seed]);

  const handleCanvasClick = useCallback(() => {
    canvasRef.current?.requestPointerLock();
  }, []);

  return (
    <div style={styles.container}>
      {/* Loading overlay */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner} />
            <h2 style={styles.loadingTitle}>正在加载 Minecraft {version}</h2>
            <p style={styles.loadingText}>初始化游戏引擎...</p>
            <div style={styles.progressBar}>
              <div style={styles.progressFill} />
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div style={styles.errorOverlay}>
          <div style={styles.errorContent}>
            <h2>⚠️ 加载失败</h2>
            <p>{error}</p>
            <button onClick={onBack} style={styles.backButton}>返回启动器</button>
          </div>
        </div>
      )}

      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        id="game-canvas"
        style={styles.canvas}
        onClick={handleCanvasClick}
      />

      {/* HUD */}
      {!loading && !error && (
        <HUD
          fps={fps}
          position={position}
          version={version}
          onBack={onBack}
        />
      )}
    </div>
  );
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    background: '#000',
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  loadingContent: {
    textAlign: 'center',
    color: '#fff',
  },
  spinner: {
    width: 60,
    height: 60,
    border: '4px solid rgba(255,255,255,0.1)',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  loadingTitle: {
    fontSize: 24,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  progressBar: {
    width: 300,
    height: 4,
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    margin: '0 auto',
    overflow: 'hidden',
  },
  progressFill: {
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    borderRadius: 2,
    animation: 'progress 2s ease-in-out infinite',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  errorContent: {
    textAlign: 'center',
    color: '#fff',
    padding: 40,
  },
  backButton: {
    marginTop: 20,
    padding: '12px 32px',
    background: '#667eea',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
  },
};