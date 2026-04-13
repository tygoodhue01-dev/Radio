import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Alert, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getRewardsApi, getMyPointsApi, getMyHistoryApi,
  getLeaderboardApi, dailyCheckInApi, redeemRewardApi
} from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { WebNavBar, WebContainer, WebFooter, useIsWebDesktop } from '@/src/components/WebShell';

const ICON_MAP: Record<string, string> = {
  megaphone: 'megaphone', flash: 'flash', star: 'star',
  'shield-checkmark': 'shield-checkmark', ticket: 'ticket', people: 'people',
};

export default function RewardsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const maxW = isDesktop ? 960 : undefined;

  const [tab, setTab] = useState<'rewards' | 'leaderboard' | 'history'>('rewards');
  const [rewards, setRewards] = useState<any[]>([]);
  const [points, setPoints] = useState<any>({ points: 0, lifetime_points: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const loadData = useCallback(async () => {
    const [r, lb] = await Promise.all([getRewardsApi(), getLeaderboardApi()]);
    setRewards(r);
    setLeaders(lb);
    if (user) {
      const [p, h] = await Promise.all([getMyPointsApi(), getMyHistoryApi()]);
      setPoints(p);
      setHistory(h);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const handleCheckIn = async () => {
    if (!user) { router.push('/(auth)/login'); return; }
    setCheckingIn(true);
    try {
      const res = await dailyCheckInApi();
      Alert.alert('Check-In!', res.message);
      await loadData();
    } catch (e: any) {
      Alert.alert('Oops', e.message);
    } finally { setCheckingIn(false); }
  };

  const handleRedeem = (reward: any) => {
    if (!user) { router.push('/(auth)/login'); return; }
    Alert.alert('Redeem Reward', `Spend ${reward.points_cost} points for "${reward.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Redeem', onPress: async () => {
          try {
            const res = await redeemRewardApi(reward.reward_id);
            Alert.alert('Redeemed!', res.message);
            await loadData();
          } catch (e: any) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  const isWeb = useIsWebDesktop();

  const innerContent = (
        <View style={[styles.inner, isWeb ? { maxWidth: 960, alignSelf: 'center' as any, width: '100%', paddingTop: 40 } : undefined]}>
          <View style={styles.header}>
            <Text style={[styles.title, isWeb && { fontSize: 32 }]}>REWARDS</Text>
            <Text style={styles.subtitle}>Earn points. Get perks.</Text>
          </View>

          {/* Points Banner */}
          <View style={styles.pointsBanner}>
            <View style={styles.pointsMain}>
              <Ionicons name="diamond" size={28} color={Colors.accent} />
              <Text style={styles.pointsNum}>{user ? points.points : 0}</Text>
              <Text style={styles.pointsLabel}>POINTS</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsLifetime}>
              <Text style={styles.lifetimeNum}>{user ? points.lifetime_points : 0}</Text>
              <Text style={styles.lifetimeLabel}>LIFETIME</Text>
            </View>
            <TouchableOpacity
              testID="daily-checkin-btn"
              style={[styles.checkinBtn, checkingIn && { opacity: 0.6 }]}
              onPress={handleCheckIn}
              disabled={checkingIn}
            >
              <Ionicons name="sunny" size={18} color={Colors.background} />
              <Text style={styles.checkinText}>{checkingIn ? '...' : 'CHECK IN'}</Text>
            </TouchableOpacity>
          </View>

          {/* How to Earn */}
          <View style={styles.earnRow}>
            <View style={styles.earnItem}>
              <Ionicons name="musical-notes" size={20} color={Colors.primary} />
              <Text style={styles.earnPts}>+10</Text>
              <Text style={styles.earnLabel}>Request</Text>
            </View>
            <View style={styles.earnItem}>
              <Ionicons name="chatbubble" size={20} color={Colors.secondary} />
              <Text style={styles.earnPts}>+5</Text>
              <Text style={styles.earnLabel}>Chat</Text>
            </View>
            <View style={styles.earnItem}>
              <Ionicons name="sunny" size={20} color={Colors.accent} />
              <Text style={styles.earnPts}>+25</Text>
              <Text style={styles.earnLabel}>Check-In</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {(['rewards', 'leaderboard', 'history'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                testID={`rewards-tab-${t}`}
                style={[styles.tabBtn, tab === t && styles.tabActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'rewards' ? (
            <View style={isDesktop ? styles.rewardsGrid : undefined}>
              {rewards.map((r) => (
                <View key={r.reward_id} style={[styles.rewardCard, isDesktop && styles.rewardCardDesktop]}>
                  <View style={styles.rewardIcon}>
                    <Ionicons name={(ICON_MAP[r.icon] || 'gift') as any} size={28} color={Colors.primary} />
                  </View>
                  <Text style={styles.rewardName}>{r.name}</Text>
                  <Text style={styles.rewardDesc} numberOfLines={2}>{r.description}</Text>
                  <View style={styles.rewardBottom}>
                    <View style={styles.costBadge}>
                      <Ionicons name="diamond" size={12} color={Colors.accent} />
                      <Text style={styles.costText}>{r.points_cost}</Text>
                    </View>
                    <TouchableOpacity
                      testID={`redeem-${r.reward_id}`}
                      style={[styles.redeemBtn, (points.points || 0) < r.points_cost && styles.redeemDisabled]}
                      onPress={() => handleRedeem(r)}
                    >
                      <Text style={styles.redeemText}>REDEEM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : tab === 'leaderboard' ? (
            <View>
              {leaders.map((l, idx) => (
                <View key={l.user_id} style={styles.leaderRow}>
                  <Text style={[styles.leaderRank, idx < 3 && { color: Colors.accent }]}>#{idx + 1}</Text>
                  <View style={styles.leaderInfo}>
                    <Text style={styles.leaderName}>{l.name}</Text>
                    <Text style={styles.leaderRole}>{l.role?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.leaderPts}>
                    <Ionicons name="diamond" size={14} color={Colors.accent} />
                    <Text style={styles.leaderPtsText}>{l.lifetime_points}</Text>
                  </View>
                </View>
              ))}
              {leaders.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="trophy-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>No leaders yet. Be the first!</Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              {!user ? (
                <View style={styles.emptyState}>
                  <Ionicons name="lock-closed-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>Sign in to see your history</Text>
                  <TouchableOpacity testID="rewards-login-btn" style={styles.loginPrompt} onPress={() => router.push('/(auth)/login')}>
                    <Text style={styles.loginPromptText}>SIGN IN</Text>
                  </TouchableOpacity>
                </View>
              ) : history.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>No activity yet. Start earning!</Text>
                </View>
              ) : (
                history.map((tx) => (
                  <View key={tx.transaction_id} style={styles.historyRow}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDesc}>{tx.description}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[styles.historyPts, tx.points > 0 ? styles.ptsPositive : styles.ptsNegative]}>
                      {tx.points > 0 ? '+' : ''}{tx.points}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
  );

  if (isWeb) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        <WebNavBar />
        <WebContainer>{innerContent}</WebContainer>
        <WebFooter />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        <View style={styles.inner}>{innerContent}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: Spacing.lg },
  header: { paddingTop: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '900', color: Colors.white, letterSpacing: 3 },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  pointsBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginTop: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(255,240,0,0.2)',
  },
  pointsMain: { alignItems: 'center', flex: 1 },
  pointsNum: { fontSize: 36, fontWeight: '900', color: Colors.white, marginTop: 4 },
  pointsLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.accent, letterSpacing: 2 },
  pointsDivider: { width: 1, height: 50, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  pointsLifetime: { alignItems: 'center', flex: 1 },
  lifetimeNum: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textSecondary },
  lifetimeLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, letterSpacing: 1 },
  checkinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accent, borderRadius: BorderRadius.round,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  checkinText: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.background, letterSpacing: 1 },
  earnRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: Spacing.lg, marginBottom: Spacing.md,
  },
  earnItem: { alignItems: 'center' },
  earnPts: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.white, marginTop: 4 },
  earnLabel: { fontSize: FontSizes.xs, color: Colors.textMuted },
  tabRow: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round, padding: 4, marginBottom: Spacing.lg,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.round, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
  tabTextActive: { color: Colors.white },
  rewardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  rewardCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  rewardCardDesktop: { width: '48%' },
  rewardIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,0,127,0.1)', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  rewardName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  rewardDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing.md },
  rewardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  costBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  costText: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.accent },
  redeemBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.round,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  redeemDisabled: { opacity: 0.4 },
  redeemText: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.white, letterSpacing: 1 },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  leaderRank: { fontSize: FontSizes.lg, fontWeight: '900', color: Colors.textMuted, width: 36 },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.white },
  leaderRole: { fontSize: 9, color: Colors.textMuted, letterSpacing: 1, marginTop: 2 },
  leaderPts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderPtsText: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.accent },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  historyInfo: { flex: 1 },
  historyDesc: { fontSize: FontSizes.sm, color: Colors.white },
  historyDate: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  historyPts: { fontSize: FontSizes.lg, fontWeight: '800' },
  ptsPositive: { color: Colors.success },
  ptsNegative: { color: Colors.error },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textMuted, marginTop: Spacing.md, fontSize: FontSizes.md },
  loginPrompt: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.round,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: Spacing.lg,
  },
  loginPromptText: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.white, letterSpacing: 1 },
});
