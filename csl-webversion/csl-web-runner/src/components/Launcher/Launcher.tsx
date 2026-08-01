'use client';

import { useState, useEffect } from 'react';

interface LauncherProps {
  onLaunch: (version: string, server?: string, seed?: string) => void;
  onOpenMods: () => void;
}

const MC_VERSIONS = [
  { id: 'eaglercraft_1_12', label: 'Eaglercraft 1.12.2', protocol: 340, features: '真正的 Minecraft！完整单人游戏', icon: '⭐', badge: '推荐', badgeColor: '#4f8', bg: 'rgba(68,255,136,0.06)' },
  { id: 'eaglercraft_1_8', label: 'Eaglercraft 1.8.8', protocol: 47, features: '真正的 Minecraft！经典 PvP 版本', icon: '⚔️', badge: '经典', badgeColor: '#f80', bg: 'rgba(255,136,0,0.06)' },
  { id: '1.21.4', label: 'Minecraft 1.21.4', protocol: 769, features: 'WASM 演示 · 最新特性尝鲜', icon: '🧪', badge: 'WASM', badgeColor: '#66e', bg: 'rgba(102,102,238,0.06)' },
  { id: '1.20.4', label: 'Minecraft 1.20.4', protocol: 765, features: 'WASM 演示 · 樱花树林与考古', icon: '🌸', badge: 'WASM', badgeColor: '#66e', bg: 'rgba(102,102,238,0.06)' },
  { id: '1.19.4', label: 'Minecraft 1.19.4', protocol: 762, features: 'WASM 演示 · 深暗之域与监守者', icon: '🌑', badge: 'WASM', badgeColor: '#66e', bg: 'rgba(102,102,238,0.06)' },
];

// 预生成粒子位置，避免每次渲染随机
const PARTICLES = Array.from({ length: 30 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 6,
  duration: 3 + Math.random() * 5,
  size: 2 + Math.random() * 5,
  opacity: 0.08 + Math.random() * 0.15,
}));

export default function Launcher({ onLaunch, onOpenMods }: LauncherProps) {
  const [selectedVersion, setSelectedVersion] = useState('eaglercraft_1_12');
  const [serverAddress, setServerAddress] = useState('');
  const [seed, setSeed] = useState('');
  const [launchMode, setLaunchMode] = useState<'singleplayer' | 'multiplayer'>('singleplayer');
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null);

  const handleLaunch = () => {
    if (launchMode === 'multiplayer' && !serverAddress.trim()) {
      alert('请输入服务器地址');
      return;
    }
    onLaunch(
      selectedVersion,
      launchMode === 'multiplayer' ? serverAddress : undefined,
      launchMode === 'singleplayer' ? seed || undefined : undefined
    );
  };

  return (
    <div style={styles.container}>
      {/* 动态背景 */}
      <div style={styles.bgGradient} />
      <div style={styles.bgGrid} />
      <div style={styles.bgParticles}>
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      <div style={styles.content}>
        {/* Logo 区域 */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              {/* 外发光 */}
              <rect x="2" y="2" width="76" height="76" rx="16" fill="none" stroke="rgba(102,126,234,0.15)" strokeWidth="1"/>
              {/* 四个方块 */}
              <rect x="8" y="8" width="28" height="28" rx="6" fill="rgba(102,126,234,0.25)" stroke="rgba(102,126,234,0.5)" strokeWidth="2"/>
              <rect x="44" y="8" width="28" height="28" rx="6" fill="rgba(118,75,162,0.25)" stroke="rgba(118,75,162,0.5)" strokeWidth="2"/>
              <rect x="8" y="44" width="28" height="28" rx="6" fill="rgba(240,147,251,0.25)" stroke="rgba(240,147,251,0.5)" strokeWidth="2"/>
              <rect x="44" y="44" width="28" height="28" rx="6" fill="rgba(102,126,234,0.25)" stroke="rgba(102,126,234,0.5)" strokeWidth="2"/>
              {/* 内发光 */}
              <rect x="14" y="14" width="16" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
              <rect x="50" y="14" width="16" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
              <rect x="14" y="50" width="16" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
              <rect x="50" y="50" width="16" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
            </svg>
          </div>
          <h1 style={styles.title}>CSL Web Runner</h1>
          <p style={styles.subtitle}>Craft Spirit Launcher · 在浏览器中畅玩 Minecraft</p>
          <div style={styles.divider} />
        </div>

        {/* 版本选择 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>📦</span>
            选择版本
            <span style={styles.sectionHint}>点击卡片选择</span>
          </h2>
          <div style={styles.versionGrid}>
            {MC_VERSIONS.map((v) => {
              const isSelected = selectedVersion === v.id;
              const isHovered = hoveredVersion === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVersion(v.id)}
                  onMouseEnter={() => setHoveredVersion(v.id)}
                  onMouseLeave={() => setHoveredVersion(null)}
                  style={{
                    ...styles.versionCard,
                    ...(isSelected ? styles.versionCardActive : {}),
                    ...(isHovered && !isSelected ? styles.versionCardHover : {}),
                  }}
                >
                  {/* 选中角标 */}
                  {isSelected && (
                    <div style={styles.selectedRibbon}>
                      <svg width="32" height="32" viewBox="0 0 32 32">
                        <path d="M0 0 L32 0 L32 32 Z" fill="linear-gradient(135deg, #667eea, #764ba2)" />
                      </svg>
                      <span style={styles.selectedRibbonText}>✓</span>
                    </div>
                  )}
                  <div style={styles.versionCardTop}>
                    <span style={styles.versionIcon}>{v.icon}</span>
                    {v.badge && (
                      <span style={{ ...styles.badge, backgroundColor: v.badgeColor }}>
                        {v.badge}
                      </span>
                    )}
                  </div>
                  <div style={styles.versionLabel}>{v.label}</div>
                  <div style={styles.versionFeatures}>{v.features}</div>
                  <div style={styles.versionProtocol}>协议 {v.protocol}</div>
                  {/* 选中指示条 */}
                  <div style={{
                    ...styles.versionIndicator,
                    ...(isSelected ? styles.versionIndicatorActive : {}),
                  }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* 启动模式 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>🎮</span>
            启动模式
          </h2>
          <div style={styles.modeRow}>
            <button
              onClick={() => setLaunchMode('singleplayer')}
              style={{
                ...styles.modeButton,
                ...(launchMode === 'singleplayer' ? styles.modeButtonActive : {}),
              }}
            >
              <div style={styles.modeIconWrapper}>
                <span style={styles.modeIcon}>🏠</span>
              </div>
              <div style={styles.modeContent}>
                <div style={styles.modeLabel}>单人世界</div>
                <div style={styles.modeDesc}>离线游玩 · 存档保存在本地</div>
              </div>
              {launchMode === 'singleplayer' && <div style={styles.modeDot} />}
            </button>
            <button
              onClick={() => setLaunchMode('multiplayer')}
              style={{
                ...styles.modeButton,
                ...(launchMode === 'multiplayer' ? styles.modeButtonActive : {}),
              }}
            >
              <div style={styles.modeIconWrapper}>
                <span style={styles.modeIcon}>🌐</span>
              </div>
              <div style={styles.modeContent}>
                <div style={styles.modeLabel}>多人服务器</div>
                <div style={styles.modeDesc}>连接到远程服务器游玩</div>
              </div>
              {launchMode === 'multiplayer' && <div style={styles.modeDot} />}
            </button>
          </div>

          {launchMode === 'singleplayer' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🌱</span>
                世界种子（留空随机生成）
              </label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="例如: -8376190481726527742"
                style={styles.input}
              />
            </div>
          )}

          {launchMode === 'multiplayer' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔗</span>
                服务器地址
              </label>
              <input
                type="text"
                value={serverAddress}
                onChange={(e) => setServerAddress(e.target.value)}
                placeholder="例如: mc.hypixel.net:25565"
                style={styles.input}
              />
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div style={styles.actions}>
          <button onClick={handleLaunch} style={styles.launchButton}>
            <span style={styles.launchIcon}>🚀</span>
            <span>启动游戏</span>
            <span style={styles.launchArrow}>→</span>
          </button>
          <button onClick={onOpenMods} style={styles.modsButton}>
            <span style={styles.modsIcon}>🧩</span>
            <span>模组管理</span>
          </button>
        </div>

        {/* 底部信息 */}
        <div style={styles.footer}>
          <div style={styles.footerRow}>
            <span style={styles.footerTag}>🦀 Rust</span>
            <span style={styles.footerTag}>⚡ WebAssembly</span>
            <span style={styles.footerTag}>🎨 WebGL2</span>
            <span style={styles.footerTag}>🎮 Eaglercraft</span>
          </div>
          <p style={styles.footerText}>纯静态部署 · 无需后端服务器 · 打开即玩</p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // ===== 背景 =====
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'auto',
    background: '#080812',
  },
  bgGradient: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse 80% 60% at 20% 40%, rgba(102, 126, 234, 0.1) 0%, transparent 55%),
      radial-gradient(ellipse 60% 80% at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 55%),
      radial-gradient(ellipse 70% 50% at 50% 80%, rgba(240, 147, 251, 0.06) 0%, transparent 55%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(102, 126, 234, 0.04) 0%, transparent 70%)
    `,
    pointerEvents: 'none',
  },
  bgGrid: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  bgParticles: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.6)',
    animation: 'float 4s ease-in-out infinite',
    boxShadow: '0 0 6px rgba(102,126,234,0.4)',
  },

  // ===== 内容区 =====
  content: {
    position: 'relative',
    maxWidth: 900,
    margin: '0 auto',
    padding: '56px 28px 72px',
    animation: 'fadeIn 0.7s ease-out',
  },

  // ===== Logo =====
  logoSection: {
    textAlign: 'center' as const,
    marginBottom: 52,
  },
  logoIcon: {
    marginBottom: 20,
    animation: 'float 3s ease-in-out infinite',
    display: 'inline-block',
    filter: 'drop-shadow(0 0 30px rgba(102,126,234,0.3))',
  },
  title: {
    fontSize: 48,
    fontWeight: 900,
    background: 'linear-gradient(135deg, #667eea 0%, #a78bfa 30%, #764ba2 60%, #f093fb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: 10,
    letterSpacing: '-1px',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    fontWeight: 400,
    letterSpacing: '0.5px',
  },
  divider: {
    width: 80,
    height: 3,
    background: 'linear-gradient(90deg, transparent, #667eea, #764ba2, transparent)',
    borderRadius: 2,
    margin: '24px auto 0',
  },

  // ===== 分区 =====
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 18,
    color: '#ccc',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    fontSize: 22,
  },
  sectionHint: {
    fontSize: 12,
    color: '#555',
    fontWeight: 400,
    marginLeft: 'auto',
  },

  // ===== 版本卡片 =====
  versionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 14,
  },
  versionCard: {
    position: 'relative',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: '20px 20px 16px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    color: '#888',
    overflow: 'hidden',
  },
  versionCardHover: {
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.1)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
  },
  versionCardActive: {
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.35)',
    color: '#fff',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  versionCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  versionIcon: {
    fontSize: 28,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },
  badge: {
    fontSize: 10,
    fontWeight: 800,
    padding: '3px 10px',
    borderRadius: 12,
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  versionLabel: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 6,
    letterSpacing: '-0.2px',
  },
  versionFeatures: {
    fontSize: 12,
    color: '#777',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  versionProtocol: {
    fontSize: 11,
    color: '#555',
    fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
    letterSpacing: '0.3px',
  },
  versionIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'transparent',
    transition: 'all 0.3s ease',
    borderRadius: '0 0 18px 18px',
  },
  versionIndicatorActive: {
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
  },
  selectedRibbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    overflow: 'hidden',
  },
  selectedRibbonText: {
    position: 'absolute',
    top: 2,
    right: 2,
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    zIndex: 1,
  },

  // ===== 模式选择 =====
  modeRow: {
    display: 'flex',
    gap: 14,
  },
  modeButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '18px 22px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 18,
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'left' as const,
    position: 'relative',
    overflow: 'hidden',
  },
  modeButtonActive: {
    background: 'rgba(102, 126, 234, 0.1)',
    borderColor: 'rgba(102, 126, 234, 0.35)',
    color: '#fff',
    boxShadow: '0 8px 30px rgba(102, 126, 234, 0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
    transform: 'translateY(-1px)',
  },
  modeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modeIcon: {
    fontSize: 26,
  },
  modeContent: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 3,
    letterSpacing: '-0.2px',
  },
  modeDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 1.4,
  },
  modeDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#4f8',
    boxShadow: '0 0 10px rgba(68,255,136,0.5)',
    flexShrink: 0,
  },

  // ===== 输入框 =====
  inputGroup: {
    marginTop: 18,
    animation: 'fadeIn 0.35s ease-out',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#999',
    marginBottom: 10,
    fontWeight: 500,
  },
  labelIcon: {
    fontSize: 15,
  },
  input: {
    width: '100%',
    padding: '15px 20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    transition: 'all 0.25s',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },

  // ===== 按钮 =====
  actions: {
    display: 'flex',
    gap: 16,
    marginTop: 40,
  },
  launchButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '20px 36px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: 18,
    color: '#fff',
    fontSize: 20,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.35), 0 2px 8px rgba(0,0,0,0.2)',
    letterSpacing: '0.5px',
    position: 'relative',
    overflow: 'hidden',
  },
  launchIcon: {
    fontSize: 24,
  },
  launchArrow: {
    fontSize: 18,
    opacity: 0.6,
    transition: 'transform 0.3s',
  },
  modsButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '18px 32px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 18,
    color: '#aaa',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  modsIcon: {
    fontSize: 20,
  },

  // ===== 底部 =====
  footer: {
    textAlign: 'center' as const,
    marginTop: 56,
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap' as const,
  },
  footerTag: {
    fontSize: 11,
    padding: '5px 12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    color: '#666',
    fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
    letterSpacing: '0.3px',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  footerText: {
    fontSize: 12,
    color: '#444',
    letterSpacing: '0.3px',
  },
};