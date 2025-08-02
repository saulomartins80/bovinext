// debounce.ts
// Utilitário de debounce para funções em TypeScript
/* eslint-disable no-unused-vars */

export function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (..._args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(..._args), wait);
  };
}
