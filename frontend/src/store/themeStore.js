import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // 'dark' | 'light' | 'system'
      language: 'es', // 'es' | 'en' | 'pt'
      
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        get().applyTheme(newTheme);
      },
      
      applyTheme: (theme) => {
        const root = window.document.documentElement;
        root.classList.remove('dark', 'light');
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },
      
      setLanguage: (language) => set({ language }),
      
      initTheme: () => {
        get().applyTheme(get().theme);
      }
    }),
    {
      name: 'quavemind-theme',
    }
  )
);