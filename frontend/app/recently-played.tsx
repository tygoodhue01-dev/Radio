import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getRecentlyPlayedApi } from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

export default function RecentlyPlayedScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSongs = async () => {
    try {
      const data = await getRecentlyPlayedApi();
      setSongs(data);
    } catch (e) {
      console.error('Failed to load recently played:', e);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSongs();
    setRefreshing(false);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Recently Played</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            {songs.length} {songs.length === 1 ? 'song' : 'songs'} played recently
          </Text>

          {songs.map((song, index) => (
            <View key={song.song_id || index} style={styles.songCard}>
              <View style={styles.songIcon}>
                <Ionicons name="musical-note" size={20} color={Colors.primary} />
              </View>
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>
                  {song.song_title}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {song.artist}
                </Text>
              </View>
              <Text style={styles.songTime}>{formatTime(song.played_at)}</Text>
            </View>
          ))}

          {songs.length === 0 && !refreshing && (
            <View style={styles.emptyState}>
              <Ionicons name="musical-notes-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No songs played yet</Text>
              <Text style={styles.emptySubtext}>
                Recently played songs will appear here
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    fontWeight: '600',
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  songIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,0,127,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  songInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  songTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  songArtist: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  songTime: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
});
