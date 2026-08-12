import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000, // To render over the map
        background: theme === 'light' ? 'var(--primary)' : 'var(--primary)',
        color: 'var(--primary-text)',
        padding: '10px 16px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        boxShadow: 'var(--shadow-medium)'
      }}
    >
      {theme === 'light' ? '🌙 Karanlık Mod' : '☀️ Aydınlık Mod'}
    </button>
  );
}
