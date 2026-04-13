import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { getNowPlayingApi, getNewsApi, getShowsApi } from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [np, n, s] = await Promise.all([
        getNowPlayingApi(),
        getNewsApi(),
        getShowsApi(),
      ]);
      setNowPlaying(np);
      setNews(n.slice(0, 3));
      setShows(s.slice(0, 3));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.stationName}>THE BEAT 515</Text>
            <Text style={styles.tagline}>PROUD. LOUD. LOCAL.</Text>
          </View>
          {user && (user.role === 'admin' || user.role === 'dj') && (
            <TouchableOpacity testID="admin-nav-btn" onPress={() => router.push('/admin')} style={styles.adminBtn}>
              <Ionicons name="settings" size={20} color={Colors.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Now Playing Hero */}
        <View style={styles.heroCard}>
          <View style={styles.liveRow}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.djName}>{nowPlaying?.dj_name || 'AutoDJ'}</Text>
          </View>
          <Text style={styles.heroSong} numberOfLines={1}>{nowPlaying?.song_title || 'The Beat 515'}</Text>
          <Text style={styles.heroArtist} numberOfLines={1}>{nowPlaying?.artist || 'Live Radio'}</Text>

          <View style={styles.playerControls}>
            <TouchableOpacity
              testID="play-radio-button"
              style={styles.playBtn}
              onPress={() => setIsPlaying(!isPlaying)}
              activeOpacity={0.7}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.streamNote}>
            {isPlaying ? 'Streaming Live' : 'Tap to Listen Live'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity testID="quick-request-btn" style={styles.quickBtn} onPress={() => router.push('/(tabs)/requests')}>
            <Ionicons name="musical-notes" size={24} color={Colors.primary} />
            <Text style={styles.quickLabel}>Request</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="quick-news-btn" style={styles.quickBtn} onPress={() => router.push('/(tabs)/news')}>
            <Ionicons name="newspaper" size={24} color={Colors.secondary} />
            <Text style={styles.quickLabel}>News</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="quick-shows-btn" style={styles.quickBtn} onPress={() => {}}>
            <Ionicons name="mic" size={24} color={Colors.accent} />
            <Text style={styles.quickLabel}>Shows</Text>
          </TouchableOpacity>
        </View>

        {/* Shows Section */}
        {shows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ON-AIR SHOWS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {shows.map((show) => (
                <View key={show.show_id} style={styles.showCard}>
                  {show.image_url ? (
                    <Image source={{ uri: show.image_url }} style={styles.showImage} />
                  ) : (
                    <View style={[styles.showImage, styles.showPlaceholder]}>
                      <Ionicons name="mic" size={32} color={Colors.primary} />
                    </View>
                  )}
                  <Text style={styles.showName} numberOfLines={1}>{show.name}</Text>
                  <Text style={styles.showSchedule} numberOfLines={1}>{show.schedule}</Text>
                  <Text style={styles.showDj}>{show.dj_name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Latest News */}
        {news.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>LATEST NEWS</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/news')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {news.map((article) => (
              <TouchableOpacity
                key={article.news_id}
                testID={`news-item-${article.news_id}`}
                style={styles.newsCard}
                onPress={() => router.push(`/news/${article.news_id}`)}
              >
                {article.image_url ? (
                  <Image source={{ uri: article.image_url }} style={styles.newsImage} />
                ) : null}
                <View style={styles.newsContent}>
                  <Text style={styles.newsCategory}>{article.category?.toUpperCase()}</Text>
                  <Text style={styles.newsTitle} numberOfLines={2}>{article.title}</Text>
                  <Text style={styles.newsSummary} numberOfLines={2}>{article.summary}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  stationName: { fontSize: FontSizes.xl, fontWeight: '900', color: Colors.primary, letterSpacing: 3 },
  tagline: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.secondary, letterSpacing: 3, marginTop: 2 },
  adminBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  heroCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,0,127,0.3)',
    alignItems: 'center',
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,240,0,0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.round,
    marginRight: Spacing.sm,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent, marginRight: 6 },
  liveText: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.accent, letterSpacing: 2 },
  djName: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  heroSong: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white, textAlign: 'center', marginBottom: 4 },
  heroArtist: { fontSize: FontSizes.lg, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  playerControls: { flexDirection: 'row', alignItems: 'center' },
  playBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  streamNote: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: Spacing.sm, letterSpacing: 1 },
  quickActions: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg,
  },
  quickBtn: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: 90,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600', marginTop: 6 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: FontSizes.xs, fontWeight: '800', color: Colors.secondary,
    letterSpacing: 3, marginBottom: Spacing.md,
  },
  seeAll: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '600' },
  showCard: {
    width: 160, marginRight: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  showImage: { width: '100%', height: 100 },
  showPlaceholder: { backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  showName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, padding: Spacing.sm, paddingBottom: 2 },
  showSchedule: { fontSize: FontSizes.xs, color: Colors.secondary, paddingHorizontal: Spacing.sm },
  showDj: { fontSize: FontSizes.xs, color: Colors.textMuted, paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm },
  newsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newsImage: { width: '100%', height: 140 },
  newsContent: { padding: Spacing.md },
  newsCategory: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.secondary, letterSpacing: 2, marginBottom: 4 },
  newsTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  newsSummary: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18 },
});
