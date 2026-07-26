'use client';

import { createContext, useContext, ReactNode } from 'react';

type SettingsContextType = {
  settings: Record<string, any>;
};

const SettingsContext = createContext<SettingsContextType>({ settings: {} });

export function SettingsProvider({
  children,
  settings,
}: {
  children: ReactNode;
  settings: Record<string, any>;
}) {
  return (
    <SettingsContext.Provider value={{ settings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
