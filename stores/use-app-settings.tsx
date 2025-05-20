import { useColorScheme } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "dark" | "light" | null;

interface SettingsState {
  theme: Theme;
  localBackupPath: string | null;
  dynamicColors: boolean;
  lastBackup: Date | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleDynamicColors: () => void;
  setLocalBackupPath: (path: string | null) => void;
  setLastBackup: (date: Date | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: null,
      localBackupPath: null,
      dynamicColors: true,
      lastBackup: null,

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      toggleDynamicColors: () =>
        set((state) => ({
          dynamicColors: !state.dynamicColors,
        })),

      setLocalBackupPath: (localBackupPath) => set({ localBackupPath }),

      setLastBackup: (lastBackup) => set({ lastBackup }),
    }),
    {
      name: "app-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useThemeStore() {
  const colorScheme = useColorScheme();
  const [theme, toggleTheme, setTheme] = useSettingsStore((state) => [
    state.theme,
    state.toggleTheme,
    state.setTheme,
  ]);

  // Use the system theme if no theme is set
  const actualTheme = theme ?? colorScheme ?? "light";
  const isDarkMode = actualTheme === "dark";

  return {
    theme: actualTheme as "dark" | "light",
    toggleTheme,
    setTheme,
    isDarkMode,
  };
}
