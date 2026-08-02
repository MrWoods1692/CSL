'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { MultiplayerMode, parseFrpIni } from '@/lib/multiplayer-core';

interface LauncherProps {
  onLaunch: (version: string, server?: string, seed?: string, mode?: MultiplayerMode, frpIni?: string) => void;
}

const MC_VERSIONS = [
  { id: 'eaglercraft_1_12', label: 'Eaglercraft 1.12.2', protocol: 340, features: '真正的 Minecraft！完整单人游戏', icon: '⭐', badge: '推荐', badgeColor: 'var(--accent)' },
  { id: 'eaglercraft_1_8', label: 'Eaglercraft 1.8.8', protocol: 47, features: '真正的 Minecraft！经典 PvP 版本', icon: '⚔️', badge: '经典', badgeColor: 'var(--secondary)' },
];

export default function Launcher({ onLaunch }: LauncherProps) {
  const [selectedVersion, setSelectedVersion] = useState('eaglercraft_1_12');
  const [serverAddress, setServerAddress] = useState('');
  const [seed, setSeed] = useState('');
  const [launchMode, setLaunchMode] = useState<'singleplayer' | 'multiplayer'>('singleplayer');
  const [networkMode, setNetworkMode] = useState<MultiplayerMode>('relay');
  const [frpIni, setFrpIni] = useState('');
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  const handleLaunch = () => {
    if (launchMode === 'multiplayer' && !serverAddress.trim()) {
      alert('请输入服务器地址');
      return;
    }
    if (networkMode === 'frp' && frpIni.trim()) {
      try {
        parseFrpIni(frpIni);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'FRP 配置无效');
        return;
      }
    }
    onLaunch(
      selectedVersion,
      launchMode === 'multiplayer' ? serverAddress : undefined,
      launchMode === 'singleplayer' ? seed || undefined : undefined,
      networkMode,
      networkMode === 'frp' ? frpIni : undefined
    );
  };

  return (
    <div style={styles.container}>
      {/* 背景 */}
      <div style={styles.bgGradient} />

      {/* 主题切换按钮 */}
      <button
        onClick={toggleTheme}
        className="csl-theme-toggle"
        style={styles.themeToggle}
        title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
        aria-label="切换主题"
      >
        <span style={styles.themeToggleIcon}>{theme === 'dark' ? '☀️' : '🌙'}</span>
      </button>

      <div style={styles.content}>
        {/* Logo 区域 */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <rect x="4" y="4" width="20" height="20" rx="4" fill="var(--accent-soft)" stroke="var(--accent-border)" strokeWidth="1.5"/>
              <rect x="32" y="4" width="20" height="20" rx="4" fill="var(--secondary-soft)" stroke="var(--secondary)" strokeWidth="1.5" strokeOpacity="0.45"/>
              <rect x="4" y="32" width="20" height="20" rx="4" fill="var(--accent-soft)" stroke="var(--accent-border)" strokeWidth="1.5"/>
              <rect x="32" y="32" width="20" height="20" rx="4" fill="var(--accent-soft)" stroke="var(--accent-border)" strokeWidth="1.5"/>
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
                  className="csl-version-card"
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
              <label style={styles.label}>连接方式</label>
              <div style={styles.modeRow}>
                {(['p2p', 'frp', 'relay'] as MultiplayerMode[]).map((mode) => (
                  <button key={mode} onClick={() => setNetworkMode(mode)} style={{ ...styles.modeButton, ...(networkMode === mode ? styles.modeButtonActive : {}) }}>
                    <div style={styles.modeLabel}>{mode === 'p2p' ? 'P2P 直连' : mode === 'frp' ? 'FRP 转发' : 'Relay 中继'}</div>
                    <div style={styles.modeDesc}>{mode === 'p2p' ? '低延迟，需网络支持' : mode === 'frp' ? '稳定，适合严格 NAT' : '浏览器直接可用'}</div>
                  </button>
                ))}
              </div>
              <label style={styles.label}>服务器地址</label>
              <input
                type="text"
                value={serverAddress}
                onChange={(e) => setServerAddress(e.target.value)}
                placeholder="例如: mc.hypixel.net:25565"
                style={styles.input}
              />
              {networkMode === 'frp' && (
                <>
                  <label style={styles.label}>frpc.ini（可选，留空使用默认配置）</label>
                  <textarea value={frpIni} onChange={(e) => setFrpIni(e.target.value)} placeholder={'[common]\nserver_addr = 47.107.155.180\nserver_port = 7000\ntls_enable = false\nuser = 你的用户\ntoken = 你的令牌\n\n[mc]\ntype = tcp\nlocal_ip = 127.0.0.1\nlocal_port = 25565\nremote_port = 16088'} style={styles.textarea} />
                  <p style={styles.helpText}>内置 frpc 只读取上述配置并连接指定 FRP 服务端；请勿把 token 分享给他人。</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div style={styles.actions}>
          <button onClick={handleLaunch} className="csl-launch-btn" style={styles.launchButton}>
            🚀 启动游戏
          </button>
        </div>

        {/* 底部信息 */}
        <div style={styles.footer}>
          <div style={styles.footerDivider} />
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
    background: 'var(--bg-base)',
    transition: 'background-color 0.3s ease',
  },
  bgGradient: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(ellipse 80% 60% at 20% 30%, var(--glow-1) 0%, transparent 55%),
      radial-gradient(ellipse 60% 80% at 80% 60%, var(--glow-2) 0%, transparent 55%),
      radial-gradient(ellipse 70% 50% at 50% 90%, var(--glow-3) 0%, transparent 55%)
    `,
    pointerEvents: 'none',
  },

  // ===== 主题切换按钮 =====
  themeToggle: {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 50,
    width: 42,
    height: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-soft)',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: 'var(--shadow-card)',
  },
  themeToggleIcon: {
    fontSize: 18,
    lineHeight: 1,
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
    animation: 'float 4s ease-in-out infinite',
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 6,
    letterSpacing: '1px',
    lineHeight: 1.2,
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--text-tertiary)',
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
    color: 'var(--text-tertiary)',
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
    background: 'var(--bg-elevated)',
    border: `1px solid var(--border-subtle)`,
    borderRadius: 12,
    padding: '18px 20px 14px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'var(--text-secondary)',
    overflow: 'hidden',
  },
  versionCardHover: {
    background: 'var(--bg-elevated-2)',
    borderColor: 'var(--border-strong)',
    transform: 'translateY(-2px)',
    boxShadow: 'var(--shadow-card)',
  },
  versionCardActive: {
    background: 'var(--bg-hover)',
    border: `1px solid var(--accent)`,
    color: 'var(--text-primary)',
    boxShadow: `0 0 0 1px var(--accent-border), 0 8px 24px var(--accent-glow)`,
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
    color: 'var(--text-tertiary)',
    marginBottom: 6,
  },
  versionProtocol: {
    fontSize: 10,
    color: 'var(--text-muted)',
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
    background: 'var(--bg-elevated)',
    border: `1px solid var(--border-soft)`,
    borderRadius: 12,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'left' as const,
  },
  modeButtonActive: {
    background: 'var(--bg-hover)',
    borderColor: 'var(--accent)',
    color: 'var(--text-primary)',
    boxShadow: `0 0 0 1px var(--accent-border), 0 4px 16px var(--accent-glow)`,
  },
  modeIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: 'var(--accent-soft)',
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
    color: 'var(--text-muted)',
  },

  // ===== 输入框 =====
  inputGroup: {
    marginTop: 14,
    animation: 'fadeIn 0.3s ease-out',
  },
  label: {
    fontSize: 12,
    color: 'var(--text-tertiary)',
    marginBottom: 8,
    fontWeight: 500,
  },

  input: {
    width: '100%',
    padding: '13px 16px',
    background: 'var(--bg-elevated)',
    border: `1px solid var(--border-soft)`,
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    minHeight: 190,
    padding: '13px 16px',
    background: 'var(--bg-elevated)',
    border: `1px solid var(--border-soft)`,
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontSize: 12,
    lineHeight: 1.6,
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
  },
  helpText: {
    margin: '8px 0 0',
    fontSize: 11,
    lineHeight: 1.5,
    color: 'var(--text-muted)',
  },

  // ===== 按钮 =====
  actions: {
    marginTop: 36,
  },
  launchButton: {
    width: '100%',
    padding: '16px 0',
    background: 'var(--accent-gradient)',
    border: 'none',
    borderRadius: 12,
    color: 'var(--text-on-accent)',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'var(--shadow-accent)',
    letterSpacing: '1px',
  },

  // ===== 底部 =====
  footer: {
    textAlign: 'center' as const,
    marginTop: 40,
  },
  footerDivider: {
    width: 60,
    height: 1,
    margin: '0 auto 20px',
    background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)',
  },
  footerText: {
    fontSize: 11,
    color: 'var(--text-faint)',
    letterSpacing: '0.5px',
  },
};