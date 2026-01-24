import { useEffect, useState } from "react";

const getSystemPreference = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const useTheme = (storageKey = "formHandlerThemeReact") => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const stored = window.localStorage.getItem(storageKey);
    return stored === "dark" || stored === "light" ? stored : getSystemPreference();
  });

  useEffect(() => {
    document.body.classList.toggle("theme-dark", theme === "dark");
    window.localStorage.setItem(storageKey, theme);
  }, [storageKey, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  };
};

export default useTheme;
