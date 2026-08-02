'use client';

import { useState } from 'react';

interface ModManagerProps {
  onBack: () => void;
}

interface ModEntry {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  builtin: boolean;
}

const BUILTIN_MODS: ModEntry[] = [
  {
    id: 'csl.minimap',
    name: 'CSL 小地图',
    version: '1.0.0',
    description: '显示附近地形的小地图覆盖层',
    author: 'CSL Team',
    enabled: true,
    builtin: true,
  },
  {
    id: 'csl.itemviewer',
    name: 'CSL 物品查看器',
    version: '1.0.0',
    description: '查看所有物品和合成配方',
    author: 'CSL Team',
    enabled: true,
    builtin: true,
  },
  {
    id: 'csl.optifine',
    name: 'CSL 性能优化',
    version: '1.0.0',
    description: '性能优化和图形设置',
    author: 'CSL Team',
    enabled: true,
    builtin: true,
  },
];

export default function ModManager({ onBack }: ModManagerProps) {
  const [mods, setMods] = useState<ModEntry[]>(BUILTIN_MODS);
  const [dragOver, setDragOver] = useState(false);

  const toggleMod = (id: string) => {
    setMods(prev => prev.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.wasm') || file.name.endsWith('.jar')) {
        // In production, this would load the mod into the engine
        const newMod: ModEntry = {
          id: `mod_${Date.now()}_${i}`,
          name: file.name.replace(/\.(wasm|jar)$/, ''),
          version: '1.0.0',
          description: '用户添加的模组',
          author: 'User',
          enabled: true,
          builtin: false,
        };
        setMods(prev => [...prev, newMod]);
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* 背景渐变 */}
      <div style={styles.bgGradient} />

      <div style={styles.content}>
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backBtn}>← 返回</button>
          <h1 style={styles.title}>
            <span style={styles.titleIcon}>🧩</span>
            <span style={styles.titleText}>模组管理</span>
          </h1>
        </div>

        <div
          style={{
            ...styles.dropZone,
            ...(dragOver ? styles.dropZoneActive : {}),
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
        >
          <div style={styles.dropIcon}>📦</div>
          <p style={styles.dropText}>拖拽 .wasm 或 .jar 模组文件到此处</p>
          <p style={styles.dropHint}>支持 Minecraft 模组格式</p>
        </div>

        <div style={styles.modList}>
          <h2 style={styles.sectionTitle}>已安装模组 ({mods.length})</h2>
          {mods.map((mod) => (
            <div key={mod.id} style={styles.modCard}>
              <div style={styles.modInfo}>
                <div style={styles.modHeader}>
                  <h3 style={styles.modName}>{mod.name}</h3>
                  <span style={styles.modVersion}>v{mod.version}</span>
                  {mod.builtin && <span style={styles.builtinBadge}>内置</span>}
                </div>
                <p style={styles.modDesc}>{mod.description}</p>
                <p style={styles.modAuthor}>作者: {mod.author}</p>
              </div>
              <button
                onClick={() => toggleMod(mod.id)}
                style={{
                  ...styles.toggleBtn,
                  ...(mod.enabled ? styles.toggleEnabled : styles.toggleDisabled),
                }}
              >
                {mod.enabled ? '已启用' : '已禁用'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
  content: {
    position: 'relative',
    maxWidth: 800,
    margin: '0 auto',
    padding: '40px 24px 60px',
    animation: 'fadeIn 0.6s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  backBtn: {
    padding: '8px 16px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-soft)',
    borderRadius: 10,
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: 0,
  },
  titleIcon: {
    fontSize: 22,
  },
  titleText: {
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  dropZone: {
    position: 'relative',
    border: '2px dashed var(--border-strong)',
    borderRadius: 16,
    padding: '40px 20px',
    textAlign: 'center' as const,
    color: 'var(--text-tertiary)',
    marginBottom: 28,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'var(--bg-elevated)',
  },
  dropZoneActive: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-soft)',
    color: 'var(--accent)',
    transform: 'scale(1.01)',
    boxShadow: '0 0 0 4px var(--accent-border)',
  },
  dropIcon: {
    fontSize: 36,
    marginBottom: 12,
    opacity: 0.7,
  },
  dropText: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    margin: 0,
  },
  dropHint: {
    fontSize: 12,
    marginTop: 6,
    color: 'var(--text-muted)',
    margin: 0,
  },
  modList: {
    maxWidth: 800,
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    marginBottom: 14,
  },
  modCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 10,
    transition: 'all 0.25s ease',
  },
  modInfo: {
    flex: 1,
  },
  modHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  modName: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
  modVersion: {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontFamily: '"SF Mono", "Fira Code", monospace',
  },
  builtinBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    background: 'var(--accent-soft)',
    border: '1px solid var(--accent-border)',
    borderRadius: 6,
    color: 'var(--accent)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  modDesc: {
    fontSize: 13,
    color: 'var(--text-tertiary)',
    marginBottom: 2,
    margin: 0,
  },
  modAuthor: {
    fontSize: 11,
    color: 'var(--text-muted)',
    margin: 0,
  },
  toggleBtn: {
    padding: '8px 18px',
    border: 'none',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    letterSpacing: '0.3px',
  },
  toggleEnabled: {
    background: 'var(--secondary-soft)',
    color: 'var(--secondary)',
    border: '1px solid var(--secondary)',
  },
  toggleDisabled: {
    background: 'rgba(248, 113, 113, 0.08)',
    color: '#f87171',
    border: '1px solid rgba(248, 113, 113, 0.3)',
  },
};