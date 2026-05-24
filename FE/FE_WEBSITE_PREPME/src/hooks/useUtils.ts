import { useState, useEffect, useCallback } from 'react';

export const useDebounce = <T>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`useLocalStorage: error setting key "${key}"`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
};

export const useDisclosure = (initial = false) => {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return { isOpen, open, close, toggle };
};

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
};

export const useIsMobile = (): boolean => useMediaQuery('(max-width: 768px)');
export const useIsTablet = (): boolean => useMediaQuery('(max-width: 1024px)');

export const useExamTimer = (initialSeconds: number, onTimeUp?: () => void) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      onTimeUp?.();
      return;
    }
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onTimeUp]);

  return {
    secondsLeft,
    isRunning,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset: () => setSecondsLeft(initialSeconds),
  };
};
