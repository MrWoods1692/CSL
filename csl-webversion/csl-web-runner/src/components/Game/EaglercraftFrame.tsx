'use client';

import { useRef, useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { MultiplayerMode } from '@/lib/multiplayer-core';

interface EaglercraftFrameProps {
  version: string;
  serverAddress?: string;
  networkMode?: MultiplayerMode;
  onBack: () => void;
}

function getEaglercraftUrl(version: string): string {
  if (version === 'eaglercraft_1_8') {
    return '/eaglercraft_1_8.html';
  }
  return '/eaglercraft_1_12.html';
}

function getVersionLabel(version: string): string {
  if (version === 'eaglercraft_1_8') {
    return 'Eaglercraft 1.8.8';
  }
  return 'Eaglercraft 1.12.2';
}

// 预生成粒子
const LOADING_PARTICLES = Array.from({ length: 20 }, () => ({
  left: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 2 + Math.random() * 3,
  size: 2 + Math.random() * 3,
}));

export default function EaglercraftFrame({ version, serverAddress, networkMode, onBack }: EaglercraftFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animationData, setAnimationData] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const url = (() => {
    const base = getEaglercraftUrl(version);
    const params = new URLSearchParams();
    if (serverAddress) params.set('server', serverAddress);
    if (networkMode) params.set('transport', networkMode);
    return params.size ? `${base}?${params}` : base;
  })();
  const label = getVersionLabel(version);

  useEffect(() => {
    fetch('/loading.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(() => {});
  }, []);

  // 模拟加载进度
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        const increment = prev < 30 ? 2 : prev < 60 ? 1 : 0.5;
        return Math.min(prev + increment, 90);
      });
    }, 200);
    return () => clearInterval(interval);
  }, [loading]);

  // 加载完成时跳到 100%
  useEffect(() => {
    if (!loading) setProgress(100);
  }, [loading]);

  return (
    <div style={styles.wrapper}>
      {/* 顶栏 - 仅在加载/错误时显示，游戏启动后隐藏 */}
      {(loading || error) && (
        <div style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <button onClick={onBack} style={styles.backButton}>
              <span style={styles.backArrow}>←</span>
              返回启动器
            </button>
            <div style={styles.topBarDivider} />
            <span style={styles.topBarTitle}>{label}</span>
            <span style={styles.topBarBadge}>Eaglercraft</span>
          </div>
          <span style={styles.topBarHint}>{networkMode === 'p2p' ? 'P2P 低延迟连接' : networkMode === 'frp' ? 'FRP 稳定转发' : 'Relay 中继连接'}</span>
        </div>
      )}

      {/* 加载覆盖层 */}
      {loading && (
        <div style={styles.loadingOverlay}>
          {/* 背景效果 */}
          <div style={styles.loadingBgGrid} />
          <div style={styles.loadingGlow1} />
          <div style={styles.loadingGlow2} />
          <div style={styles.loadingParticles}>
            {LOADING_PARTICLES.map((p, i) => (
              <div
                key={i}
                style={{
                  ...styles.loadingParticle,
                  left: `${p.left}%`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  width: p.size,
                  height: p.size,
                }}
              />
            ))}
          </div>

          {/* 内容 */}
          <div style={styles.loadingContent}>
            {/* 动画区域 */}
            <div style={styles.loadingAnimWrap}>
              <div style={styles.loadingAnimGlow} />
              {animationData ? (
                <Lottie
                  animationData={animationData}
                  loop={true}
                  style={styles.lottieAnimation}
                />
              ) : (
                <div style={styles.spinnerWrap}>
                  <div style={styles.spinner} />
                </div>
              )}
            </div>

            {/* 标题 */}
            <h2 style={styles.loadingTitle}>正在启动 Minecraft</h2>
            <p style={styles.loadingSubtitle}>{label} · 真正的 Minecraft 网页版</p>

            {/* 进度条 */}
            <div style={styles.progressWrap}>
              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${progress}%`,
                  }}
                />
              </div>
              <span style={styles.progressText}>{Math.round(progress)}%</span>
            </div>

            {/* 提示 */}
            <p style={styles.loadingHint}>首次加载可能需要 10-30 秒，请耐心等待</p>

            {/* 底部特性标签 */}
            <div style={styles.loadingTags}>
              <span style={styles.loadingTag}>🎯 完整单人游戏</span>
              <span style={styles.loadingTag}>💾 本地存档</span>
              <span style={styles.loadingTag}>⚡ 纯浏览器运行</span>
            </div>
          </div>
        </div>
      )}

      {/* 错误覆盖层 */}
      {error && (
        <div style={styles.errorOverlay}>
          <div style={styles.errorGlow} />
          <div style={styles.errorContent}>
            <div style={styles.errorIconWrap}>
              <span style={styles.errorIcon}>⚠️</span>
            </div>
            <h2 style={styles.errorTitle}>加载失败</h2>
            <p style={styles.errorText}>{error}</p>
            <div style={styles.errorActions}>
              <button onClick={onBack} style={styles.errorPrimaryBtn}>
                ← 返回启动器
              </button>
              <button onClick={() => { setError(''); setLoading(true); }} style={styles.errorRetryBtn}>
                🔄 重试
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iframe */}
      <iframe
        ref={iframeRef}
        src={url}
        style={styles.iframe}
        title={`Eaglercraft ${label}`}
        allow="autoplay; fullscreen; cross-origin-isolated"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError('无法加载游戏文件，请检查网络连接后重试');
        }}
      />

      {/* 游戏运行时的悬浮退出按钮（鼠标移到左上角触发） */}
      {!loading && !error && (
        <div className="csl-exit-zone" style={styles.exitHoverZone}>
          <button onClick={onBack} className="csl-exit-btn" style={styles.exitBtn} title="返回启动器">
            <span style={styles.exitArrow}>←</span>
            <span style={styles.exitText}>返回启动器</span>
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // ===== 容器 =====
  wrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    background: '#000',
  },

  // ===== 顶栏 =====
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: 'var(--bg-overlay-strong)',
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid var(--border-overlay)`,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: 'var(--bg-overlay)',
    border: `1px solid var(--border-overlay-strong)`,
    borderRadius: 10,
    color: 'var(--text-overlay)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  backArrow: {
    fontSize: 15,
    transition: 'transform 0.2s',
  },
  topBarDivider: {
    width: 1,
    height: 20,
    background: 'var(--border-overlay-strong)',
    borderRadius: 1,
  },
  topBarTitle: {
    color: 'var(--text-overlay)',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '-0.2px',
  },
  topBarBadge: {
    fontSize: 10,
    fontWeight: 800,
    padding: '3px 10px',
    borderRadius: 8,
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    border: '1px solid var(--accent-border)',
  },
  topBarHint: {
    color: 'var(--text-overlay-faint)',
    fontSize: 12,
  },

  // ===== iframe =====
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },

  // ===== 加载覆盖层 =====
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base)',
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
  loadingGlow1: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    animation: 'pulse 4s ease-in-out infinite',
  },
  loadingGlow2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--secondary-soft) 0%, transparent 70%)',
    bottom: '20%',
    left: '50%',
    transform: 'translate(-50%, 50%)',
    pointerEvents: 'none',
    animation: 'pulse 5s ease-in-out infinite',
  },
  loadingParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  loadingParticle: {
    position: 'absolute',
    bottom: '-10px',
    borderRadius: '50%',
    background: 'var(--accent)',
    animation: 'floatUp 3s ease-in-out infinite',
    boxShadow: '0 0 6px var(--accent-glow)',
    opacity: 0.6,
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
  loadingAnimWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  loadingAnimGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 140,
    height: 140,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  lottieAnimation: {
    width: 150,
    height: 150,
    position: 'relative',
    zIndex: 1,
  },
  spinnerWrap: {
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
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
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.3px',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: 'var(--text-tertiary)',
    margin: 0,
  },
  progressWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: 280,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    background: 'var(--border-soft)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--accent-gradient)',
    borderRadius: 2,
    transition: 'width 0.3s ease-out',
    boxShadow: '0 0 8px var(--accent-glow)',
  },
  progressText: {
    fontSize: 12,
    color: 'var(--accent)',
    fontWeight: 700,
    fontFamily: '"SF Mono", "Fira Code", monospace',
    minWidth: 36,
    textAlign: 'right',
  },
  loadingHint: {
    fontSize: 12,
    color: 'var(--text-tertiary)',
    margin: 0,
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
    transition: 'all 0.2s ease',
  },

  // ===== 错误覆盖层 =====
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base)',
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
    textAlign: 'center',
    margin: 0,
    maxWidth: 380,
    lineHeight: 1.7,
  },
  errorActions: {
    display: 'flex',
    gap: 12,
    marginTop: 8,
  },
  errorPrimaryBtn: {
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
  errorRetryBtn: {
    padding: '12px 28px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-soft)',
    borderRadius: 12,
    color: 'var(--text-secondary)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // ===== 游戏运行时悬浮退出按钮 =====
  exitHoverZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 200,
    height: 80,
    zIndex: 90,
    // 鼠标移入此区域时显示按钮（通过 CSS hover 实现）
  },
  exitBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    background: 'rgba(10, 10, 20, 0.75)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#ccc',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    opacity: 0,
    transform: 'translateY(-4px)',
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    // hover 时显示
  },
  exitArrow: {
    fontSize: 15,
  },
  exitText: {
    fontSize: 13,
  },
};