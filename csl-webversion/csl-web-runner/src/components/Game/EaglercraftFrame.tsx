'use client';

import { useRef, useState, useEffect } from 'react';
import Lottie from 'lottie-react';

interface EaglercraftFrameProps {
  version: string;
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

export default function EaglercraftFrame({ version, onBack }: EaglercraftFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animationData, setAnimationData] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const url = getEaglercraftUrl(version);
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
      {/* 顶栏 */}
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
        <span style={styles.topBarHint}>纯静态 · 无服务器 · 单人游戏</span>
      </div>

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
    background: 'rgba(10, 10, 20, 0.88)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
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
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: '#bbb',
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
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '-0.2px',
  },
  topBarBadge: {
    fontSize: 10,
    fontWeight: 800,
    padding: '3px 10px',
    borderRadius: 8,
    background: 'rgba(68,255,136,0.15)',
    color: '#4f8',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  topBarHint: {
    color: '#555',
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
    background: '#080812',
    overflow: 'hidden',
  },
  loadingBgGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    pointerEvents: 'none',
  },
  loadingGlow1: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(102,126,234,0.12) 0%, transparent 70%)',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  loadingGlow2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(118,75,162,0.1) 0%, transparent 70%)',
    bottom: '20%',
    left: '50%',
    transform: 'translate(-50%, 50%)',
    pointerEvents: 'none',
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
    background: 'rgba(255,255,255,0.5)',
    animation: 'float 3s ease-in-out infinite',
    boxShadow: '0 0 4px rgba(102,126,234,0.4)',
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
    background: 'radial-gradient(circle, rgba(102,126,234,0.2) 0%, transparent 70%)',
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
    border: '3px solid rgba(255,255,255,0.08)',
    borderTopColor: '#667eea',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
    background: 'linear-gradient(135deg, #667eea, #a78bfa, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.3px',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#777',
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
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
    borderRadius: 2,
    transition: 'width 0.3s ease-out',
    boxShadow: '0 0 8px rgba(102,126,234,0.4)',
  },
  progressText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: 700,
    fontFamily: '"SF Mono", "Fira Code", monospace',
    minWidth: 36,
    textAlign: 'right',
  },
  loadingHint: {
    fontSize: 12,
    color: '#444',
    margin: 0,
  },
  loadingTags: {
    display: 'flex',
    gap: 10,
    marginTop: 8,
  },
  loadingTag: {
    fontSize: 11,
    padding: '4px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    color: '#555',
    border: '1px solid rgba(255,255,255,0.04)',
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
    background: '#080812',
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
    color: '#888',
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
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  errorRetryBtn: {
    padding: '12px 28px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#aaa',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};