import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function ChartsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'top-rated' | 'most-played' | 'trending'>('top-rated');
  const [songs, setSongs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadCharts = async (type: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/charts/${type}`);
      if (res.ok) {
        const data = await res.json();
        setSongs(data);
      }
    } catch (e) {
      console.error('Failed to load charts:', e);
    }
  };

  useEffect(() => {
    loadCharts(activeTab);
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCharts(activeTab);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Charts</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'top-rated' && styles.tabActive]} 
          onPress={() => setActiveTab('top-rated')}
        >
          <Ionicons name="star" size={18} color={activeTab === 'top-rated' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'top-rated' && styles.tabTextActive]}>Top Rated</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'most-played' && styles.tabActive]} 
          onPress={() => setActiveTab('most-played')}
        >
          <Ionicons name="headset" size={18} color={activeTab === 'most-played' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'most-played' && styles.tabTextActive]}>Most Played</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'trending' && styles.tabActive]} 
          onPress={() => setActiveTab('trending')}
        >
          <Ionicons name="trending-up" size={18} color={activeTab === 'trending' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'trending' && styles.tabTextActive]}>Trending</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <View style={styles.content}>
          {songs.map((song, index) => (
            <View key={index} style={styles.songCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>
                  {song.song_title}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {song.artist}
                </Text>
              </View>

              <View style={styles.stats}>
                {activeTab === 'top-rated' && (
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={14} color={Colors.accent} />
                    <Text style={styles.statText}>{song.average_rating}</Text>
                  </View>
                )}
                {(activeTab === 'most-played' || activeTab === 'trending') && (
                  <View style={styles.statItem}>
                    <Ionicons name="play" size={14} color={Colors.secondary} />
                    <Text style={styles.statText}>{song.play_count}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {songs.length === 0 && !refreshing && (
            <View style={styles.emptyState}>
              <Ionicons name="musical-notes-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No data yet</Text>
              <Text style={styles.emptySubtext}>
                Charts will appear as songs are played and rated
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
  tabs: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: 'rgba(255,0,127,0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
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
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,0,127,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: Colors.primary,
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
  stats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.white,
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
    textAlign: 'center',
  },
});
