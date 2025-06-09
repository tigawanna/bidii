import { GitHubSDK } from '@/lib/api/github/github-sdk';
import { WakatimeSDK } from '@/lib/api/wakatime/wakatime-sdk';
import { useApiKeysStore } from '@/stores/use-app-settings';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, SegmentedButtons, Surface, Text, useTheme } from 'react-native-paper';
import { WakatimeMiniScreen } from '../wakatime/WakatimeMiniScreen';

type WakatimeStats = {
  todayHours: string;
  totalDurations: number;
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Generate last 5 days for date selection
  const getLastFiveDays = () => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return days;
  };

  const lastFiveDays = getLastFiveDays();

  // Wakatime query using the correct durations endpoint

  // GitHub query
  const {
    data: githubData,
    isLoading: githubLoading,
    refetch: refetchGithub,
  } = useQuery({
    queryKey: ['github-activity', githubApiKey],
    queryFn: async () => {
      if (!githubApiKey) return null;
      const sdk = new GitHubSDK(githubApiKey);
      const [reposResponse, userResponse] = await Promise.all([
        sdk.getRepositories({ sort: 'updated', per_page: 3 }),
        sdk.getCurrentUser()
      ]);
      
      if (reposResponse.data && userResponse.data) {
        return {
          recentRepos: reposResponse.data.map((repo: any) => ({
            name: repo.name,
            updated_at: repo.updated_at,
            language: repo.language
          })),
          totalRepos: userResponse.data.public_repos,
          totalStars: reposResponse.data.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0)
        };
      }
      return null;
    },
    enabled: !!githubApiKey,
  });

  // Spotify query (mock data for now)
  const {
    data: spotifyData,
    isLoading: spotifyLoading,
    refetch: refetchSpotify,
  } = useQuery({
    queryKey: ['spotify-tracks', spotifyAccessToken],
    queryFn: async () => {
      if (!spotifyAccessToken) return null;
      // Mock data - replace with actual Spotify API when implemented
      return {
        tracks: [
          { name: 'Song Title 1', artist: 'Artist 1', album: 'Album 1' },
          { name: 'Song Title 2', artist: 'Artist 2', album: 'Album 2' },
          { name: 'Song Title 3', artist: 'Artist 3', album: 'Album 3' }
        ]
      };
    },
    enabled: !!spotifyAccessToken,
  });

  const isLoading =  githubLoading || spotifyLoading;

  const onRefresh = async () => {
    await Promise.all([
      refetchGithub(),
      refetchSpotify(),
    ]);
  };

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
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Wakatime Section */}
        <WakatimeMiniScreen />

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
              githubData ? (
                <View style={styles.statsContainer}>
                  <View style={styles.statRow}>
                    <Text variant="bodyMedium" style={styles.statLabel}>Total Repos:</Text>
                    <Text variant="bodyMedium" style={styles.statValue}>{githubData.totalRepos}</Text>
                  </View>
                  
                  <Text variant="bodyMedium" style={[styles.statLabel, { marginTop: 12, marginBottom: 8 }]}>
                    Recent Repositories:
                  </Text>
                  {githubData.recentRepos.map((repo: any, index: number) => (
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
                  {githubLoading ? 'Loading activity...' : 'No data available'}
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
            
            {spotifyAccessToken ? (
              spotifyData ? (
                <View style={styles.statsContainer}>
                  {spotifyData.tracks.map((track: any, index: number) => (
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
                  {spotifyLoading ? 'Loading tracks...' : 'No recent tracks found'}
                </Text>
              )
            ) : (
              <Text variant="bodyMedium" style={styles.noApiText}>
                Add your Spotify access token in settings to see tracks
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
  dateSelector: {
    marginBottom: 16,
  },
  segmentedButtons: {
    width: '100%',
  },
});
