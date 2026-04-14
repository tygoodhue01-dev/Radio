import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useWindowDimensions, Platform, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://radio-production-3743.up.railway.app';

export default function LeaderboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'ratings' | 'points'>('requests');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/leaderboard/${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'requests', label: 'Top Requesters', icon: 'musical-notes' },
    { key: 'ratings', label: 'Top Raters', icon: 'star' },
    { key: 'points', label: 'Most Points', icon: 'gift' },
  ];

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { bg: '#FFD70020', border: '#FFD700', icon: 'trophy' as const, iconColor: '#FFD700' };
    if (rank === 2) return { bg: '#C0C0C020', border: '#C0C0C0', icon: 'medal' as const, iconColor: '#C0C0C0' };
    if (rank === 3) return { bg: '#CD7F3220', border: '#CD7F32', icon: 'ribbon' as const, iconColor: '#CD7F32' };
    return { bg: Colors.surface, border: Colors.border, icon: null, iconColor: Colors.textMuted };
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Leaderboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[s.content, isWeb && s.contentWeb]}>
          {/* Hero */}
          <View style={s.heroSection}>
            <LinearGradient
              colors={['#FFD70030', Colors.primary + '20', 'transparent']}
              style={s.heroGradient}
            />
            <Ionicons name="trophy" size={48} color="#FFD700" />
            <Text style={s.heroTitle}>Top Listeners</Text>
            <Text style={s.heroDesc}>
              See who's making the most requests, rating songs, and earning rewards!
            </Text>
          </View>

          {/* Tabs */}
          <View style={s.tabsRow}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[s.tab, activeTab === tab.key && s.tabActive]}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={18} 
                  color={activeTab === tab.key ? Colors.primary : Colors.textMuted} 
                />
                <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Leaderboard List */}
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : leaderboard.length > 0 ? (
            <View style={s.listSection}>
              {leaderboard.map((user, idx) => {
                const rank = idx + 1;
                const rankStyle = getRankStyle(rank);
                return (
                  <View 
                    key={user.user_id || idx} 
                    style={[s.userCard, { backgroundColor: rankStyle.bg, borderColor: rankStyle.border }]}
                  >
                    <View style={[s.rankBadge, { backgroundColor: rankStyle.border + '30' }]}>
                      {rankStyle.icon ? (
                        <Ionicons name={rankStyle.icon} size={18} color={rankStyle.iconColor} />
                      ) : (
                        <Text style={s.rankText}>{rank}</Text>
                      )}
                    </View>

                    {user.avatar_url ? (
                      <Image source={{ uri: user.avatar_url }} style={s.userAvatar} />
                    ) : (
                      <View style={s.userAvatarFallback}>
                        <Text style={s.avatarText}>{user.name?.charAt(0)?.toUpperCase()}</Text>
                      </View>
                    )}

                    <View style={s.userInfo}>
                      <Text style={s.userName}>{user.name || 'Anonymous'}</Text>
                      <Text style={s.userRole}>{user.role || 'Listener'}</Text>
                    </View>

                    <View style={s.statBadge}>
                      <Text style={s.statValue}>
                        {activeTab === 'requests' && (user.request_count || 0)}
                        {activeTab === 'ratings' && (user.rating_count || 0)}
                        {activeTab === 'points' && (user.points || 0)}
                      </Text>
                      <Text style={s.statLabel}>
                        {activeTab === 'requests' && 'requests'}
                        {activeTab === 'ratings' && 'ratings'}
                        {activeTab === 'points' && 'points'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={s.emptyState}>
              <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
              <Text style={s.emptyText}>No data yet</Text>
              <Text style={s.emptySub}>Be the first to make it on the leaderboard!</Text>
            </View>
          )}

          {/* How to Rank */}
          <View style={s.howToSection}>
            <Text style={s.howToTitle}>🏆 HOW TO CLIMB THE RANKS</Text>
            <View style={s.howToGrid}>
              {[
                { icon: 'musical-notes', title: 'Request Songs', desc: 'Submit song requests during shows', color: Colors.secondary },
                { icon: 'star', title: 'Rate Songs', desc: 'Rate songs to earn points', color: Colors.accent },
                { icon: 'gift', title: 'Earn Rewards', desc: 'Complete challenges and earn points', color: Colors.success },
                { icon: 'heart', title: 'Favorite Songs', desc: 'Build your favorites list', color: Colors.primary },
              ].map((item, idx) => (
                <View key={idx} style={s.howToCard}>
                  <View style={[s.howToIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </View>
                  <Text style={s.howToCardTitle}>{item.title}</Text>
                  <Text style={s.howToCardDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: '#fff' },
  content: { paddingHorizontal: Spacing.lg },
  contentWeb: { maxWidth: 800, alignSelf: 'center', width: '100%' },

  // Hero
  heroSection: { alignItems: 'center', paddingVertical: Spacing.xl, position: 'relative' },
  heroGradient: { position: 'absolute', top: 0, left: -50, right: -50, bottom: 0, borderRadius: 100 },
  heroTitle: { fontSize: FontSizes.xxl, fontWeight: '900', color: '#fff', marginTop: Spacing.sm },
  heroDesc: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, maxWidth: 400 },

  // Tabs
  tabsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.surface, borderRadius: BorderRadius.round, paddingVertical: 12, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
  tabText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textMuted },
  tabTextActive: { color: Colors.primary },

  // List
  listSection: { marginTop: Spacing.lg },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, borderWidth: 1 },
  rankBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.textMuted },
  userAvatar: { width: 44, height: 44, borderRadius: 22, marginLeft: Spacing.md },
  userAvatarFallback: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '30', alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.md },
  avatarText: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.primary },
  userInfo: { flex: 1, marginLeft: Spacing.md },
  userName: { fontSize: FontSizes.md, fontWeight: '700', color: '#fff' },
  userRole: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  statBadge: { alignItems: 'center', backgroundColor: Colors.background, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.md },
  statValue: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 10, color: Colors.textMuted },

  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.md },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 4 },

  // How To
  howToSection: { marginTop: Spacing.xxl },
  howToTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.accent, letterSpacing: 2, marginBottom: Spacing.md },
  howToGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  howToCard: { flex: 1, minWidth: 150, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  howToIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  howToCardTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff', textAlign: 'center' },
  howToCardDesc: { fontSize: FontSizes.xs, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
});
