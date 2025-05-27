import { GitHubSDK } from '@/lib/api/github/github-sdk';
import { WakatimeSDK } from '@/lib/api/wakatime/wakatime-sdk';
import { useApiKeysStore } from '@/stores/use-app-settings';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Surface, Text, useTheme } from 'react-native-paper';

type WakatimeStats = {
  todayHours: string;
  totalHours: string;
  currentProject: string;
  topLanguage: string;
};

type GitHubActivity = {
  recentRepos: { name: string; updated_at: string; language: string }[];
  totalRepos: number;
  totalStars: number;
};

type SpotifyTracks = {
  tracks: { name: string; artist: string; album: string }[];
};

export function Overview() {
  const { colors } = useTheme();
  const router = useRouter();
  const { wakatimeApiKey, githubApiKey, spotifyAccessToken } = useApiKeysStore();
  
  const [wakatimeStats, setWakatimeStats] = useState<WakatimeStats | null>(null);
  const [githubActivity, setGithubActivity] = useState<GitHubActivity | null>(null);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTracks | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWakatimeStats = useCallback(async () => {
    if (!wakatimeApiKey) return;
    
    try {
      const sdk = new WakatimeSDK(wakatimeApiKey);
      const today = new Date().toISOString().split('T')[0];
      const stats = await sdk.getUserStats({ start: today, end: today });
      
      if (stats.data) {
        setWakatimeStats({
          todayHours: stats.data.human_readable_total || '0 hrs 0 mins',
          totalHours: stats.data.human_readable_total_including_other_language || '0 hrs',
          currentProject: stats.data.projects?.[0]?.name || 'No project',
          topLanguage: stats.data.languages?.[0]?.name || 'No language'
        });
      }
    } catch (error) {
      console.error('Failed to fetch Wakatime stats:', error);
    }
  }, [wakatimeApiKey]);

  const fetchGitHubActivity = useCallback(async () => {
    if (!githubApiKey) return;
    
    try {
      const sdk = new GitHubSDK(githubApiKey);
      const [reposResponse, userResponse] = await Promise.all([
        sdk.getRepositories({ sort: 'updated', per_page: 3 }),
        sdk.getCurrentUser()
      ]);
      
      if (reposResponse.data && userResponse.data) {
        setGithubActivity({
          recentRepos: reposResponse.data.map((repo: any) => ({
            name: repo.name,
            updated_at: repo.updated_at,
            language: repo.language
          })),
          totalRepos: userResponse.data.public_repos,
          totalStars: reposResponse.data.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0)
        });
      }
    } catch (error) {
      console.error('Failed to fetch GitHub activity:', error);
    }
  }, [githubApiKey]);

  const fetchSpotifyTracks = async () => {
    // Mock data for now - you'll need to implement Spotify API
    setSpotifyTracks({
      tracks: [
        { name: 'Song Title 1', artist: 'Artist 1', album: 'Album 1' },
        { name: 'Song Title 2', artist: 'Artist 2', album: 'Album 2' },
        { name: 'Song Title 3', artist: 'Artist 3', album: 'Album 3' }
      ]
    });
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchWakatimeStats(),
      fetchGitHubActivity(),
      fetchSpotifyTracks()
    ]);
    setLoading(false);
  }, [fetchWakatimeStats, fetchGitHubActivity]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Surface style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text variant="headlineMedium" style={styles.title}>
          Overview
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Your coding activity at a glance
        </Text>

        {/* Wakatime Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
              <Text variant="titleMedium" style={styles.cardTitle}>
                Wakatime Stats
              </Text>
            </View>
            
            {wakatimeApiKey ? (
              wakatimeStats ? (
                <View style={styles.statsContainer}>
                  <View style={styles.statRow}>
                    <Text variant="bodyLarge" style={styles.statLabel}>Today:</Text>
                    <Text variant="bodyLarge" style={styles.statValue}>{wakatimeStats.todayHours}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text variant="bodyMedium" style={styles.statLabel}>Current Project:</Text>
                    <Chip mode="outlined" compact>{wakatimeStats.currentProject}</Chip>
                  </View>
                  <View style={styles.statRow}>
                    <Text variant="bodyMedium" style={styles.statLabel}>Top Language:</Text>
                    <Chip mode="outlined" compact>{wakatimeStats.topLanguage}</Chip>
                  </View>
                </View>
              ) : (
                <Text variant="bodyMedium" style={styles.loadingText}>
                  {loading ? 'Loading stats...' : 'No data available'}
                </Text>
              )
            ) : (
              <Text variant="bodyMedium" style={styles.noApiText}>
                Add your Wakatime API key in settings to see stats
              </Text>
            )}
          </Card.Content>
          <Card.Actions>
            {wakatimeApiKey ? (
              <Button 
                mode="text" 
                onPress={() => router.push('/wakatime')}
                icon="arrow-right"
              >
                View Details
              </Button>
            ) : (
              <Button 
                mode="contained-tonal" 
                onPress={() => router.push('/api-keys')}
                icon="key"
              >
                Add API Key
              </Button>
            )}
          </Card.Actions>
        </Card>

        {/* GitHub Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="github" size={24} color={colors.primary} />
              <Text variant="titleMedium" style={styles.cardTitle}>
                GitHub Activity
              </Text>
            </View>
            
            {githubApiKey ? (
              githubActivity ? (
                <View style={styles.statsContainer}>
                  <View style={styles.statRow}>
                    <Text variant="bodyMedium" style={styles.statLabel}>Total Repos:</Text>
                    <Text variant="bodyMedium" style={styles.statValue}>{githubActivity.totalRepos}</Text>
                  </View>
                  
                  <Text variant="bodyMedium" style={[styles.statLabel, { marginTop: 12, marginBottom: 8 }]}>
                    Recent Repositories:
                  </Text>
                  {githubActivity.recentRepos.map((repo, index) => (
                    <View key={index} style={styles.repoItem}>
                      <View style={styles.repoInfo}>
                        <Text variant="bodyMedium" style={styles.repoName}>{repo.name}</Text>
                        <Text variant="bodySmall" style={styles.repoTime}>
                          {formatTimeAgo(repo.updated_at)}
                        </Text>
                      </View>
                      {repo.language && (
                        <Chip mode="outlined" compact>{repo.language}</Chip>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text variant="bodyMedium" style={styles.loadingText}>
                  {loading ? 'Loading activity...' : 'No data available'}
                </Text>
              )
            ) : (
              <Text variant="bodyMedium" style={styles.noApiText}>
                Add your GitHub API key in settings to see activity
              </Text>
            )}
          </Card.Content>
          <Card.Actions>
            {githubApiKey ? (
              <Button 
                mode="text" 
                onPress={() => router.push('/github')}
                icon="arrow-right"
              >
                View Details
              </Button>
            ) : (
              <Button 
                mode="contained-tonal" 
                onPress={() => router.push('/api-keys')}
                icon="key"
              >
                Add API Key
              </Button>
            )}
          </Card.Actions>
        </Card>

        {/* Spotify Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="spotify" size={24} color="#1DB954" />
              <Text variant="titleMedium" style={styles.cardTitle}>
                Recent Tracks
              </Text>
            </View>
            
            {spotifyTracks ? (
              <View style={styles.statsContainer}>
                {spotifyTracks.tracks.map((track, index) => (
                  <View key={index} style={styles.trackItem}>
                    <View style={styles.trackInfo}>
                      <Text variant="bodyMedium" style={styles.trackName}>{track.name}</Text>
                      <Text variant="bodySmall" style={styles.trackArtist}>
                        {track.artist} • {track.album}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="music-note" size={20} color={colors.onSurfaceVariant} />
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="bodyMedium" style={styles.loadingText}>
                {loading ? 'Loading tracks...' : spotifyAccessToken ? 'No recent tracks found' : 'Add your Spotify access token in settings to see tracks'}
              </Text>
            )}
          </Card.Content>
          <Card.Actions>
            {spotifyAccessToken ? (
              <Button 
                mode="text" 
                onPress={() => router.push('/spotify')}
                icon="arrow-right"
              >
                View Details
              </Button>
            ) : (
              <Button 
                mode="contained-tonal" 
                onPress={() => router.push('/api-keys')}
                icon="key"
              >
                Add Access Token
              </Button>
            )}
          </Card.Actions>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  statsContainer: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
  },
  repoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  repoInfo: {
    flex: 1,
  },
  repoName: {
    fontWeight: '500',
  },
  repoTime: {
    opacity: 0.6,
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontWeight: '500',
  },
  trackArtist: {
    opacity: 0.6,
  },
  loadingText: {
    textAlign: 'center',
    opacity: 0.6,
    paddingVertical: 16,
  },
  noApiText: {
    textAlign: 'center',
    opacity: 0.6,
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 24,
  },
});
