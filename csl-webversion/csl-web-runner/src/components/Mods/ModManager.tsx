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
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>← 返回</button>
        <h1 style={styles.title}>🧩 模组管理</h1>
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
        <p>拖拽 .wasm 或 .jar 模组文件到此处</p>
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
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    overflow: 'auto',
    padding: 20,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  backBtn: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8,
    color: '#fff',
    cursor: 'pointer',
  },
  title: {
    fontSize: 28,
    color: '#fff',
  },
  dropZone: {
    border: '2px dashed rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 40,
    textAlign: 'center',
    color: '#888',
    marginBottom: 24,
    transition: 'all 0.2s',
  },
  dropZoneActive: {
    borderColor: '#667eea',
    background: 'rgba(102, 126, 234, 0.1)',
    color: '#fff',
  },
  dropHint: {
    fontSize: 12,
    marginTop: 8,
  },
  modList: {
    maxWidth: 800,
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 16,
  },
  modCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modInfo: {
    flex: 1,
  },
  modHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  modName: {
    fontSize: 16,
    color: '#fff',
  },
  modVersion: {
    fontSize: 12,
    color: '#888',
  },
  builtinBadge: {
    fontSize: 11,
    padding: '2px 8px',
    background: 'rgba(102, 126, 234, 0.3)',
    borderRadius: 4,
    color: '#667eea',
  },
  modDesc: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  modAuthor: {
    fontSize: 11,
    color: '#666',
  },
  toggleBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleEnabled: {
    background: 'rgba(0, 200, 100, 0.2)',
    color: '#0c0',
  },
  toggleDisabled: {
    background: 'rgba(200, 0, 0, 0.2)',
    color: '#c00',
  },
};