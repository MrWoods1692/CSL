'use client';

interface HUDProps {
  fps: number;
  position: { x: number; y: number; z: number };
  version: string;
  onBack: () => void;
}

export default function HUD({ fps, position, version, onBack }: HUDProps) {
  const fpsColor = fps >= 60 ? '#4f8' : fps >= 30 ? '#fa0' : '#f44';

  return (
    <>
      {/* 准星 */}
      <div style={styles.crosshair}>
        <div style={styles.crosshairOuter}>
          <div style={styles.crosshairH} />
          <div style={styles.crosshairV} />
        </div>
        <div style={styles.crosshairDot} />
      </div>

      {/* 左上角信息面板 */}
      <div style={styles.topLeft}>
        <div style={styles.topLeftInner}>
          <div style={styles.brandRow}>
            <span style={styles.brandName}>CSL Web Runner</span>
            <span style={styles.brandVersion}>Minecraft {version}</span>
          </div>
          <div style={styles.fpsRow}>
            <span style={styles.fpsLabel}>FPS</span>
            <span style={{ ...styles.fpsValue, color: fpsColor }}>{fps}</span>
            <div style={styles.fpsBar}>
              <div style={{ ...styles.fpsBarFill, width: `${Math.min(fps / 120 * 100, 100)}%`, background: fpsColor }} />
            </div>
          </div>
        </div>
      </div>

      {/* 右上角位置信息 */}
      <div style={styles.topRight}>
        <div style={styles.posPanel}>
          <div style={styles.posHeader}>
            <span style={styles.posIcon}>📍</span>
            <span style={styles.posLabel}>位置</span>
          </div>
          <div style={styles.posValues}>
            <div style={styles.posRow}>
              <span style={styles.posAxis}>X</span>
              <span style={styles.posNum}>{position?.x?.toFixed(1) ?? '0.0'}</span>
            </div>
            <div style={styles.posRow}>
              <span style={styles.posAxis}>Y</span>
              <span style={styles.posNum}>{position?.y?.toFixed(1) ?? '0.0'}</span>
            </div>
            <div style={styles.posRow}>
              <span style={styles.posAxis}>Z</span>
              <span style={styles.posNum}>{position?.z?.toFixed(1) ?? '0.0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部控制提示 */}
      <div style={styles.controls}>
        <div style={styles.controlsInner}>
          <div style={styles.controlKey}>W A S D</div>
          <span style={styles.controlSep}>·</span>
          <span style={styles.controlLabel}>移动</span>
          <span style={styles.controlDivider}>|</span>
          <span style={styles.controlIcon}>🖱️</span>
          <span style={styles.controlLabel}>视角</span>
          <span style={styles.controlDivider}>|</span>
          <div style={styles.controlKey}>Space</div>
          <span style={styles.controlLabel}>跳跃</span>
          <span style={styles.controlDivider}>|</span>
          <div style={styles.controlKey}>Shift</div>
          <span style={styles.controlLabel}>潜行</span>
          <span style={styles.controlDivider}>|</span>
          <div style={styles.controlKey}>ESC</div>
          <span style={styles.controlLabel}>退出</span>
        </div>
      </div>

      {/* 退出按钮 */}
      <button onClick={onBack} className="csl-hud-back-btn" style={styles.backBtn}>
        <span style={styles.backBtnIcon} className="csl-hud-back-icon">✕</span>
        <span style={styles.backBtnText}>退出</span>
      </button>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // ===== 准星 =====
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 10,
  },
  crosshairOuter: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  crosshairH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    background: 'rgba(255,255,255,0.85)',
    transform: 'translateY(-0.5px)',
    boxShadow: '0 0 3px rgba(255,255,255,0.3)',
  },
  crosshairV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    background: 'rgba(255,255,255,0.85)',
    transform: 'translateX(-0.5px)',
    boxShadow: '0 0 3px rgba(255,255,255,0.3)',
  },
  crosshairDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 2,
    height: 2,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.5)',
  },

  // ===== 左上角信息面板 =====
  topLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  topLeftInner: {
    background: 'var(--bg-overlay)',
    backdropFilter: 'blur(16px)',
    borderRadius: 14,
    padding: '12px 18px',
    border: '1px solid var(--border-overlay)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minWidth: 180,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  brandName: {
    fontSize: 14,
    fontWeight: 800,
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.2px',
  },
  brandVersion: {
    fontSize: 10,
    color: 'var(--text-overlay-muted)',
    fontWeight: 500,
    padding: '2px 8px',
    background: 'var(--border-overlay)',
    borderRadius: 6,
  },
  fpsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  fpsLabel: {
    fontSize: 10,
    color: 'var(--text-overlay-muted)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  fpsValue: {
    fontSize: 22,
    fontWeight: 900,
    fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
    lineHeight: 1,
    minWidth: 40,
  },
  fpsBar: {
    flex: 1,
    height: 3,
    background: 'var(--border-overlay)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fpsBarFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease-out',
    boxShadow: '0 0 6px currentColor',
  },

  // ===== 右上角位置面板 =====
  topRight: {
    position: 'absolute',
    top: 16,
    right: 80,
    zIndex: 10,
  },
  posPanel: {
    background: 'var(--bg-overlay)',
    backdropFilter: 'blur(16px)',
    borderRadius: 14,
    padding: '12px 16px',
    border: '1px solid var(--border-overlay)',
  },
  posHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '1px solid var(--border-overlay)',
  },
  posIcon: {
    fontSize: 12,
  },
  posLabel: {
    fontSize: 10,
    color: 'var(--text-overlay-muted)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  posValues: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  posRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  posAxis: {
    fontSize: 11,
    fontWeight: 800,
    color: 'var(--accent)',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    width: 14,
  },
  posNum: {
    fontSize: 12,
    color: 'var(--text-overlay-muted)',
    fontFamily: '"SF Mono", "Fira Code", monospace',
  },

  // ===== 底部控制提示 =====
  controls: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
  },
  controlsInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--bg-overlay)',
    backdropFilter: 'blur(12px)',
    borderRadius: 12,
    padding: '10px 20px',
    border: '1px solid var(--border-overlay)',
    whiteSpace: 'nowrap',
  },
  controlKey: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-overlay)',
    padding: '3px 7px',
    background: 'var(--border-overlay-strong)',
    borderRadius: 5,
    fontFamily: '"SF Mono", "Fira Code", monospace',
    letterSpacing: '0.3px',
  },
  controlSep: {
    color: 'var(--text-overlay-faint)',
    fontSize: 10,
  },
  controlLabel: {
    fontSize: 11,
    color: 'var(--text-overlay-muted)',
    fontWeight: 500,
  },
  controlDivider: {
    color: 'var(--border-overlay-strong)',
    fontSize: 12,
  },
  controlIcon: {
    fontSize: 13,
  },

  // ===== 退出按钮 =====
  backBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: 'var(--bg-overlay)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-overlay-strong)',
    borderRadius: 10,
    color: 'var(--text-overlay)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  backBtnIcon: {
    fontSize: 11,
    color: 'var(--text-overlay-muted)',
    transition: 'transform 0.2s ease',
  },
  backBtnText: {
    fontSize: 13,
  },
};