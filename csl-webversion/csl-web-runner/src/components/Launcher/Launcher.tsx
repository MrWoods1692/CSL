'use client';

import { useState, useEffect } from 'react';

interface LauncherProps {
  onLaunch: (version: string, server?: string, seed?: string) => void;
}

const MC_VERSIONS = [
  { id: 'eaglercraft_1_12', label: 'Eaglercraft 1.12.2', protocol: 340, features: '真正的 Minecraft！完整单人游戏', icon: '⭐', badge: '推荐', badgeColor: '#c88040' },
  { id: 'eaglercraft_1_8', label: 'Eaglercraft 1.8.8', protocol: 47, features: '真正的 Minecraft！经典 PvP 版本', icon: '⚔️', badge: '经典', badgeColor: '#50b48c' },
];

export default function Launcher({ onLaunch }: LauncherProps) {
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
      {/* 背景 */}
      <div style={styles.bgGradient} />

      <div style={styles.content}>
        {/* Logo 区域 */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect x="4" y="4" width="20" height="20" rx="4" fill="rgba(200,128,64,0.2)" stroke="rgba(200,128,64,0.45)" strokeWidth="1.5"/>
              <rect x="32" y="4" width="20" height="20" rx="4" fill="rgba(80,180,140,0.2)" stroke="rgba(80,180,140,0.45)" strokeWidth="1.5"/>
              <rect x="4" y="32" width="20" height="20" rx="4" fill="rgba(180,140,100,0.2)" stroke="rgba(180,140,100,0.45)" strokeWidth="1.5"/>
              <rect x="32" y="32" width="20" height="20" rx="4" fill="rgba(200,128,64,0.2)" stroke="rgba(200,128,64,0.45)" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1 style={styles.title}>CSL Web Runner</h1>
          <p style={styles.subtitle}>Craft Spirit Launcher · 在浏览器中畅玩 Minecraft</p>
        </div>

        {/* 版本选择 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>选择版本</h2>
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
                </button>
              );
            })}
          </div>
        </div>

        {/* 启动模式 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>启动模式</h2>
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
            </button>
          </div>

          {launchMode === 'singleplayer' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>世界种子（留空随机生成）</label>
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
              <label style={styles.label}>服务器地址</label>
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
            🚀 启动游戏
          </button>
        </div>

        {/* 底部信息 */}
        <div style={styles.footer}>
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
    background: '#0d0d0d',
  },
  bgGradient: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse 80% 60% at 20% 30%, rgba(210, 140, 80, 0.06) 0%, transparent 55%),
      radial-gradient(ellipse 60% 80% at 80% 60%, rgba(80, 180, 140, 0.05) 0%, transparent 55%),
      radial-gradient(ellipse 70% 50% at 50% 90%, rgba(180, 140, 100, 0.04) 0%, transparent 55%)
    `,
    pointerEvents: 'none',
  },

  // ===== 内容区 =====
  content: {
    position: 'relative',
    maxWidth: 720,
    margin: '0 auto',
    padding: '64px 28px 80px',
    animation: 'fadeIn 0.6s ease-out',
  },

  // ===== Logo =====
  logoSection: {
    textAlign: 'center' as const,
    marginBottom: 48,
  },
  logoIcon: {
    marginBottom: 20,
    display: 'inline-block',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: '#e8d5b0',
    marginBottom: 6,
    letterSpacing: '1px',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b5e4e',
    fontWeight: 400,
    letterSpacing: '0.5px',
  },

  // ===== 分区 =====
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 12,
    color: '#6b5e4e',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  },

  // ===== 版本卡片 =====
  versionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 10,
  },
  versionCard: {
    position: 'relative',
    background: '#141210',
    border: '1px solid #1f1b16',
    borderRadius: 10,
    padding: '18px 20px 14px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.25s ease',
    color: '#8a7a65',
  },
  versionCardHover: {
    background: '#1a1612',
    borderColor: '#3a3028',
    transform: 'translateY(-1px)',
  },
  versionCardActive: {
    background: '#1a1410',
    border: '1px solid #c88040',
    color: '#e8d5b8',
    boxShadow: '0 0 0 1px rgba(200, 128, 64, 0.15), 0 4px 20px rgba(0,0,0,0.3)',
  },
  versionCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  versionIcon: {
    fontSize: 24,
  },
  badge: {
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 6,
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.6px',
  },
  versionLabel: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 4,
  },
  versionFeatures: {
    fontSize: 12,
    color: '#6b5e4e',
    marginBottom: 6,
  },
  versionProtocol: {
    fontSize: 10,
    color: '#4a3f32',
    fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
  },

  // ===== 模式选择 =====
  modeRow: {
    display: 'flex',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '16px 20px',
    background: '#141210',
    border: '1px solid #2a1f16',
    borderRadius: 10,
    color: '#8a7a65',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    textAlign: 'left' as const,
  },
  modeButtonActive: {
    background: '#1a1610',
    borderColor: '#c88040',
    color: '#e8d5b8',
    boxShadow: '0 0 0 1px rgba(200, 128, 64, 0.15)',
  },
  modeIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: 'rgba(200,128,64,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modeIcon: {
    fontSize: 22,
  },
  modeContent: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 2,
  },
  modeDesc: {
    fontSize: 11,
    color: '#5a4a38',
  },

  // ===== 输入框 =====
  inputGroup: {
    marginTop: 14,
    animation: 'fadeIn 0.3s ease-out',
  },
  label: {
    fontSize: 12,
    color: '#6b5e4e',
    marginBottom: 8,
    fontWeight: 500,
  },

  input: {
    width: '100%',
    padding: '13px 16px',
    background: '#141210',
    border: '1px solid #2a1f16',
    borderRadius: 8,
    color: '#d4c4a8',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },

  // ===== 按钮 =====
  actions: {
    marginTop: 36,
  },
  launchButton: {
    width: '100%',
    padding: '16px 0',
    background: 'linear-gradient(135deg, #c88040 0%, #a06830 100%)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 2px 12px rgba(200, 128, 64, 0.25)',
    letterSpacing: '1px',
  },

  // ===== 底部 =====
  footer: {
    textAlign: 'center' as const,
    marginTop: 40,
  },
  footerText: {
    fontSize: 11,
    color: '#3a3028',
    letterSpacing: '0.5px',
  },
};