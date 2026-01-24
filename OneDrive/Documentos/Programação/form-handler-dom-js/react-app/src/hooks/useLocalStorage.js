import { useEffect, useState } from "react";

const readStoredValue = (key, initialValue) => {
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error("Erro ao ler Local Storage:", error);
    return initialValue;
  }
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => readStoredValue(key, initialValue));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Erro ao salvar Local Storage:", error);
    }
  }, [key, storedValue]);

  const setValue = (value) => {
    setStoredValue((prev) => (typeof value === "function" ? value(prev) : value));
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
