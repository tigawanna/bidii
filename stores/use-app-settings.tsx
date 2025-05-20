import { useColorScheme } from "react-native";
import { observable } from "@legendapp/state";
import { use$ } from "@legendapp/state/react";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";

type SettingsStoreType = {
  theme: "dark" | "light" | null;
  localBackupPath: string | null;
  dynamicColors: boolean;
  toggleDynamicColors: () => void;
  toggleTheme: () => void;
  lastBackup: Date | null;
};

// Observables can be primitives or deep objects
export const settings$ = observable<SettingsStoreType>({
  theme: null,
  localBackupPath: null,
  dynamicColors: true,
  toggleDynamicColors: () => {
    settings$.dynamicColors.set(!settings$.dynamicColors.get());
  },
  toggleTheme: () => {
    settings$.theme.set(settings$.theme.get() === "light" ? "dark" : "light");
  },
  lastBackup: null,
});

syncObservable(settings$, {
  persist: {
    name: "app-settings",
    plugin: ObservablePersistLocalStorage,
  },
});

export function useSettingsStore() {
  const settings = use$(() => settings$.get());
  const updateSettings = (value: Partial<SettingsStoreType>) => {
    settings$.set({ ...settings, ...value });
  };
  return { settings, updateSettings };
}

export function useThemeStore() {
  const colorScheme = useColorScheme();
  const theme = use$(() => settings$.theme.get()) ?? colorScheme;
  const setTheme = (value: SettingsStoreType["theme"]) => {
    settings$.theme.set(value);
  };
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };
  const isDarkMode = theme === "dark";
  return { theme, toggleTheme, isDarkMode };
}
