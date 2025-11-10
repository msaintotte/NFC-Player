import { useState, useEffect } from 'react';

const KEEP_AWAKE_KEY = 'pudis-keep-awake-enabled';

export const useKeepAwakeSettings = () => {
  const [isKeepAwakeEnabled, setIsKeepAwakeEnabled] = useState(() => {
    // Por defecto activado (true)
    const saved = localStorage.getItem(KEEP_AWAKE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const toggleKeepAwake = () => {
    setIsKeepAwakeEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem(KEEP_AWAKE_KEY, String(newValue));
      return newValue;
    });
  };

  return {
    isKeepAwakeEnabled,
    toggleKeepAwake,
  };
};
