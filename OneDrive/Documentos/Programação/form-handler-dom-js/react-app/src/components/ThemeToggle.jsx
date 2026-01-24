const ThemeToggle = ({ isDark, onToggle }) => {
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-pressed={isDark}
      onClick={onToggle}
    >
      <span className="theme-toggle__text">{isDark ? "Modo claro" : "Modo escuro"}</span>
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  );
};

export default ThemeToggle;
