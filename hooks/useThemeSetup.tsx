import {
  Colors,
  defaultMaterial3PrimaryDarkTheme,
  defaultMaterial3PrimaryLightTheme,
} from "@/constants/Colors";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { Material3Theme, useMaterial3Theme } from "@pchmn/expo-material3-theme";
import merge from "deepmerge";
import { create } from "zustand";
import { useEffect } from "react";

// Theme type definitions
type ThemePreference = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemePreference;
  isDarkMode: boolean;
  paperTheme: any;
  setTheme: (theme: ThemePreference) => void;
  toggleDarkMode: () => void;
  updatePaperTheme: (paperTheme: any) => void;
}

// Create the Zustand store
export const useThemeStore = create<ThemeState>((set) => ({
  theme: "system",
  isDarkMode: false,
  paperTheme: {},
  setTheme: (theme) => set({ theme }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  updatePaperTheme: (paperTheme) => set({ paperTheme }),
}));

// Helper function to determine which theme to use
function materialYouThemeOrMyTheme(theme: Material3Theme) {
  if (
    theme.dark.primary === defaultMaterial3PrimaryDarkTheme &&
    theme.light.primary === defaultMaterial3PrimaryLightTheme
  ) {
    return {
      light: Colors.light,
      dark: Colors.dark,
    };
  } else {
    return {
      light: theme.light,
      dark: theme.dark,
    };
  }
}

// Hook that sets up the theme
export function useThemeSetup(dynamicColors: boolean = false) {
  // Get device-generated Material You theme
  const { theme: material3Theme } = useMaterial3Theme();

  // Get store actions and state
  const { isDarkMode, theme: userThemePreference, updatePaperTheme } = useThemeStore();

  useEffect(() => {
    const { DarkTheme, LightTheme } = adaptNavigationTheme({
      reactNavigationLight: NavigationDefaultTheme,
      reactNavigationDark: NavigationDarkTheme,
    });

    // Use Material You theme if available, otherwise fall back to custom theme
    const lightThemeColors = dynamicColors
      ? materialYouThemeOrMyTheme(material3Theme).light
      : Colors.light;

    const darkThemeColors = dynamicColors
      ? materialYouThemeOrMyTheme(material3Theme).dark
      : Colors.dark;

    // Create combined themes (Material You or fallback)
    const lightBasedTheme = merge(LightTheme, {
      ...MD3LightTheme,
      colors: lightThemeColors,
    });

    const darkBasedTheme = merge(DarkTheme, {
      ...MD3DarkTheme,
      colors: darkThemeColors,
    });

    // Use the appropriate theme based on user preference
    const paperTheme = isDarkMode ? darkBasedTheme : lightBasedTheme;

    // Update the theme in the store
    updatePaperTheme(paperTheme);
  }, [isDarkMode, material3Theme, dynamicColors, updatePaperTheme]);

  return {
    paperTheme: useThemeStore.getState().paperTheme,
    colorScheme: userThemePreference,
    isDarkMode,
  };
}
