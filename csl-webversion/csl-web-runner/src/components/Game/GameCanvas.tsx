'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import HUD from './HUD';
import { MultiplayerCore, MultiplayerMode, parseFrpIni } from '@/lib/multiplayer-core';

interface GameCanvasProps {
  version: string;
  serverAddress?: string;
  networkMode?: MultiplayerMode;
  frpIni?: string;
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

export default function GameCanvas({ version, serverAddress, networkMode = 'relay', frpIni, seed, onBack }: GameCanvasProps) {
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
        
        if (serverAddress || networkMode === 'frp') {
          const frp = networkMode === 'frp' && frpIni?.trim() ? parseFrpIni(frpIni) : undefined;
          const address = new MultiplayerCore({ mode: networkMode, serverAddress, frp }).resolveGameAddress();
          if (!address) throw new Error('无法解析联机地址');
          engine.connect_server(address.host, address.port);
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
  }, [version, serverAddress, networkMode, frpIni, seed]);

  const handleCanvasClick = useCallback(() => {
    canvasRef.current?.requestPointerLock();
  }, []);

  return (
    <div style={styles.container}>
      {/* Loading overlay */}
      {loading && (
        <div style={styles.loadingOverlay}>
          {/* 背景效果 */}
          <div style={styles.loadingBgGrid} />
          <div style={styles.loadingGlow} />
          <div style={styles.loadingContent}>
            <div style={styles.spinnerWrap}>
              <div style={styles.spinner} />
            </div>
            <h2 style={styles.loadingTitle}>正在加载 Minecraft {version}</h2>
            <p style={styles.loadingText}>初始化游戏引擎...</p>
            <div style={styles.progressBar}>
              <div style={styles.progressFill} />
            </div>
            <div style={styles.loadingTags}>
              <span style={styles.loadingTag}>⚡ WASM 引擎</span>
              <span style={styles.loadingTag}>🎮 原生性能</span>
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div style={styles.errorOverlay}>
          <div style={styles.errorGlow} />
          <div style={styles.errorContent}>
            <div style={styles.errorIconWrap}>
              <span style={styles.errorIcon}>⚠️</span>
            </div>
            <h2 style={styles.errorTitle}>加载失败</h2>
            <p style={styles.errorText}>{error}</p>
            <button onClick={onBack} style={styles.backButton}>← 返回启动器</button>
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
    background: 'var(--bg-base)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    overflow: 'hidden',
  },
  loadingBgGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(var(--border-overlay) 1px, transparent 1px),
      linear-gradient(90deg, var(--border-overlay) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    pointerEvents: 'none',
  },
  loadingGlow: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    animation: 'pulse 4s ease-in-out infinite',
  },
  loadingContent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    animation: 'fadeIn 0.6s ease-out',
    zIndex: 1,
  },
  spinnerWrap: {
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  spinner: {
    width: 44,
    height: 44,
    border: '3px solid var(--border-soft)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 800,
    margin: 0,
    color: 'var(--text-primary)',
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.3px',
  },
  loadingText: {
    fontSize: 14,
    color: 'var(--text-tertiary)',
    margin: 0,
  },
  progressBar: {
    width: 280,
    height: 4,
    background: 'var(--border-soft)',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '40%',
    height: '100%',
    background: 'var(--accent-gradient)',
    borderRadius: 2,
    animation: 'progress 2s ease-in-out infinite',
    boxShadow: '0 0 8px var(--accent-glow)',
  },
  loadingTags: {
    display: 'flex',
    gap: 10,
    marginTop: 8,
  },
  loadingTag: {
    fontSize: 11,
    padding: '5px 12px',
    background: 'var(--bg-elevated)',
    borderRadius: 8,
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-subtle)',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--bg-base)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  errorGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(248,113,113,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  errorContent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    animation: 'fadeIn 0.5s ease-out',
    textAlign: 'center' as const,
  },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'rgba(248,113,113,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(248,113,113,0.2)',
  },
  errorIcon: {
    fontSize: 32,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#f87171',
    margin: 0,
  },
  errorText: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    maxWidth: 380,
    lineHeight: 1.7,
    margin: 0,
  },
  backButton: {
    marginTop: 8,
    padding: '12px 28px',
    background: 'var(--accent-gradient)',
    border: 'none',
    borderRadius: 12,
    color: 'var(--text-on-accent)',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: 'var(--shadow-accent)',
  },
};