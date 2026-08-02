'use client';

import { useState, useCallback } from 'react';
import Launcher from '@/components/Launcher/Launcher';
import GameCanvas from '@/components/Game/GameCanvas';
import EaglercraftFrame from '@/components/Game/EaglercraftFrame';
import { MultiplayerMode } from '@/lib/multiplayer-core';

type PageState = 'launcher' | 'game';

function isEaglercraft(version: string): boolean {
  return version.startsWith('eaglercraft_');
}

export default function Home() {
  const [pageState, setPageState] = useState<PageState>('launcher');
  const [selectedVersion, setSelectedVersion] = useState('eaglercraft_1_12');
  const [serverAddress, setServerAddress] = useState('');
  const [singleplayerSeed, setSingleplayerSeed] = useState('');
  const [networkMode, setNetworkMode] = useState<MultiplayerMode>('relay');
  const [frpIni, setFrpIni] = useState('');

  const handleLaunch = useCallback((version: string, server?: string, seed?: string, mode?: MultiplayerMode, ini?: string) => {
    setSelectedVersion(version);
    setServerAddress(server || '');
    setSingleplayerSeed(seed || '');
    setNetworkMode(mode || 'relay');
    setFrpIni(ini || '');
    setPageState('game');
  }, []);

  const handleBackToLauncher = useCallback(() => {
    setPageState('launcher');
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {pageState === 'launcher' && (
        <Launcher
          onLaunch={handleLaunch}
        />
      )}
      {pageState === 'game' && isEaglercraft(selectedVersion) && (
        <EaglercraftFrame
          version={selectedVersion}
          serverAddress={serverAddress}
          networkMode={networkMode}
          onBack={handleBackToLauncher}
        />
      )}
      {pageState === 'game' && !isEaglercraft(selectedVersion) && (
        <GameCanvas
          version={selectedVersion}
          serverAddress={serverAddress}
          seed={singleplayerSeed}
          networkMode={networkMode}
          frpIni={frpIni}
          onBack={handleBackToLauncher}
        />
      )}
    </div>
  );
}