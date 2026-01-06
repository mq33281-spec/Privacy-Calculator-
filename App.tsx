
import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import Calculator from './components/Calculator';
import Vault from './components/Vault';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CALCULATOR);
  const [passcode, setPasscode] = useState<string>('1234');

  useEffect(() => {
    const savedCode = localStorage.getItem('ak_vault_passcode');
    if (savedCode) {
      setPasscode(savedCode);
    } else {
      // Default initial setup for demo
      localStorage.setItem('ak_vault_passcode', '1234');
    }
  }, []);

  const handleUnlock = (code: string) => {
    if (code === passcode) {
      setAppState(AppState.VAULT);
    }
  };

  const handleUpdatePasscode = (newCode: string) => {
    setPasscode(newCode);
    localStorage.setItem('ak_vault_passcode', newCode);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-0 md:p-10 font-sans">
      <div className="w-full max-w-full md:max-w-6xl h-full md:h-[800px] flex items-center justify-center">
        {appState === AppState.CALCULATOR ? (
          <div className="w-full max-w-md mx-auto h-full">
            <Calculator onUnlock={handleUnlock} passcode={passcode} />
            <div className="text-center mt-4 text-zinc-700 text-xs">
              <p>Type your 4-digit secret code and hit '=' to enter vault.</p>
              <p className="mt-1">Hint: Default code is 1234</p>
            </div>
          </div>
        ) : (
          <Vault 
            onLock={() => setAppState(AppState.CALCULATOR)} 
            passcode={passcode} 
            setPasscode={handleUpdatePasscode}
          />
        )}
      </div>
    </div>
  );
};

export default App;
