import { useTheme } from '../hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={theme === 'light' ? 'Karanlık Moda Geç' : 'Aydınlık Moda Geç'}
    >
      {theme === 'light' ? (
        <>
          <Moon size={16} />
          <span className="theme-toggle-text">Karanlık</span>
        </>
      ) : (
        <>
          <Sun size={16} />
          <span className="theme-toggle-text">Aydınlık</span>
        </>
      )}
    </button>
  );
}
