import { useApiKeysStore } from "@/stores/use-app-settings";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  HelperText,
  Snackbar,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export function ApiKeysSeettings() {
  const { colors } = useTheme();
  const { githubApiKey, wakatimeApiKey, setGithubApiKey, setWakatimeApiKey } = useApiKeysStore();

  const [githubKey, setGithubKey] = useState(githubApiKey || "");
  const [wakatimeKey, setWakatimeKey] = useState(wakatimeApiKey || "");
  const [githubSecure, setGithubSecure] = useState(true);
  const [wakatimeSecure, setWakatimeSecure] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSaveGithub = () => {
    setGithubApiKey(githubKey.trim() || null);
    setSnackbarMessage("GitHub API key saved");
    setSnackbarVisible(true);
  };

  const handleSaveWakatime = () => {
    setWakatimeApiKey(wakatimeKey.trim() || null);
    setSnackbarMessage("Wakatime API key saved");
    setSnackbarVisible(true);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 20}
    >
      <Surface style={styles.container}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="bodyMedium" style={styles.description}>
            Add your API keys to connect to external services. These keys are stored securely on your
            device.
          </Text>
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              GitHub
            </Text>
            <HelperText type="info">Used to fetch your repositories and activity data</HelperText>
            <Link
              target="_blank"
              href={"https://github.com/settings/tokens"}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                gap: 8,
                paddingVertical: 8,
                textDecorationLine: "underline",
                textDecorationColor: colors.inversePrimary,
              }}>
              <Text variant="bodySmall">
                • GitHub: Go to Settings → Developer Settings → Personal access tokens
              </Text>
              <EvilIcons name="external-link" size={20} color={colors.primary} />
            </Link>
            <TextInput
              mode="outlined"
              label="GitHub API Key"
              value={githubKey}
              onChangeText={setGithubKey}
              secureTextEntry={githubSecure}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={githubSecure ? "eye" : "eye-off"}
                  onPress={() => setGithubSecure(!githubSecure)}
                />
              }
            />
            <Button
              mode="contained"
              onPress={handleSaveGithub}
              style={styles.button}
              icon="content-save">
              Save GitHub API Key
            </Button>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Wakatime
            </Text>
            <HelperText type="info">Used to track your coding activity and statistics</HelperText>
            <Link
              target="_blank"
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                gap: 8,
                paddingVertical: 8,
                textDecorationLine: "underline",
                textDecorationColor: colors.inversePrimary,
              }}
              href={"https://wakatime.com/settings/api-key"}>
              <Text variant="bodySmall">• Wakatime: Go to Settings → API Key </Text>
              <EvilIcons name="external-link" size={20} color={colors.primary} />
            </Link>
            <TextInput
              mode="outlined"
              label="Wakatime API Key"
              value={wakatimeKey}
              onChangeText={setWakatimeKey}
              secureTextEntry={wakatimeSecure}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={wakatimeSecure ? "eye" : "eye-off"}
                  onPress={() => setWakatimeSecure(!wakatimeSecure)}
                />
              }
            />
            <Button
              mode="contained"
              onPress={handleSaveWakatime}
              style={styles.button}
              icon="content-save">
              Save Wakatime API Key
            </Button>
          </View>
          
          {/* Add extra padding at bottom to ensure content remains visible when keyboard is open */}
          <View style={{ height: 100 }} />
        </ScrollView>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: "Close",
            onPress: () => setSnackbarVisible(false),
          }}>
          {snackbarMessage}
        </Snackbar>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  input: {
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 8,
    paddingBottom: 24,
    gap: 8,
  },
  infoText: {
    marginBottom: 6,
    opacity: 0.8,
  },
});
