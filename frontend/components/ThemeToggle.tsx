import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useIsMounted } from "../src/hooks/useIsMounted";

export default function ThemeToggle() {
  const isMounted = useIsMounted();
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  if (!isMounted) {
    return (
      <button className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
        <Monitor className="h-5 w-5" />
      </button>
    );
  }

  // ✅ CORREÇÃO: Usar o toggleTheme do contexto e mostrar ícone correto
  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-5 w-5" />;
    }
    return theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
  };

  const getAriaLabel = () => {
    if (theme === 'system') {
      return 'Modo sistema ativo';
    }
    return theme === 'light' ? 'Mudar para modo escuro' : 'Mudar para modo claro';
  };

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
      aria-label={getAriaLabel()}
    >
      {getIcon()}
    </button>
  );
}