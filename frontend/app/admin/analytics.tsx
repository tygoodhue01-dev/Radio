import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [stats, setStats] = useState<any>(null);
  const [userGrowth, setUserGrowth] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = user?.access_token;
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [overview, growth] = await Promise.all([
        fetch(`${API_BASE}/api/analytics/overview`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/analytics/users`, { headers }).then(r => r.json())
      ]);
      
      setStats(overview);
      setUserGrowth(growth.daily_signups || {});
      setLoading(false);
    } catch (e) {
      console.error('Failed to load analytics:', e);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dates = Object.keys(userGrowth).sort();
  const maxSignups = Math.max(...Object.values(userGrowth).map(v => Number(v)), 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <TouchableOpacity onPress={loadAnalytics} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={24} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={[styles.container, isDesktop && styles.containerDesktop]}>
          {/* Key Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={[styles.metricsGrid, isDesktop && styles.metricsGridDesktop]}>
              <View style={[styles.metricCard, isDesktop && styles.metricCardDesktop]}>
                <Ionicons name="people" size={32} color={Colors.primary} />
                <Text style={styles.metricValue}>{stats?.total_users || 0}</Text>
                <Text style={styles.metricLabel}>Total Users</Text>
                <View style={styles.badge}>
                  <Ionicons name="trending-up" size={12} color={Colors.accent} />
                  <Text style={styles.badgeText}>+{stats?.new_users_7d || 0} this week</Text>
                </View>
              </View>

              <View style={[styles.metricCard, isDesktop && styles.metricCardDesktop]}>
                <Ionicons name="musical-notes" size={32} color={Colors.secondary} />
                <Text style={styles.metricValue}>{stats?.total_songs_played || 0}</Text>
                <Text style={styles.metricLabel}>Songs Played</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats?.songs_played_today || 0} today</Text>
                </View>
              </View>

              <View style={[styles.metricCard, isDesktop && styles.metricCardDesktop]}>
                <Ionicons name="star" size={32} color={Colors.accent} />
                <Text style={styles.metricValue}>{stats?.total_ratings || 0}</Text>
                <Text style={styles.metricLabel}>Song Ratings</Text>
              </View>

              <View style={[styles.metricCard, isDesktop && styles.metricCardDesktop]}>
                <Ionicons name="chatbubbles" size={32} color={Colors.primary} />
                <Text style={styles.metricValue}>{stats?.total_requests || 0}</Text>
                <Text style={styles.metricLabel}>Requests</Text>
              </View>
            </View>
          </View>

        {/* User Growth Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Growth (Last 30 Days)</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chart}>
              {dates.slice(-30).map((date, i) => {
                const count = userGrowth[date] || 0;
                const height = (count / maxSignups) * 120;
                return (
                  <View key={i} style={styles.barWrapper}>
                    <View style={[styles.bar, { height: Math.max(height, 2) }]}>
                      {count > 0 && <Text style={styles.barLabel}>{count}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartXAxis}>
              <Text style={styles.axisLabel}>{dates[0]?.substring(5)}</Text>
              <Text style={styles.axisLabel}>Today</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          
          <View style={styles.statRow}>
            <Ionicons name="calendar" size={20} color={Colors.secondary} />
            <Text style={styles.statText}>New users this week:</Text>
            <Text style={styles.statValue}>{stats?.new_users_7d || 0}</Text>
          </View>

          <View style={styles.statRow}>
            <Ionicons name="play" size={20} color={Colors.secondary} />
            <Text style={styles.statText}>Songs played today:</Text>
            <Text style={styles.statValue}>{stats?.songs_played_today || 0}</Text>
          </View>

          <View style={styles.statRow}>
            <Ionicons name="person-add" size={20} color={Colors.secondary} />
            <Text style={styles.statText}>Average daily signups:</Text>
            <Text style={styles.statValue}>
              {dates.length > 0 ? Math.round(stats?.new_users_7d / 7) : 0}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/admin')}>
            <Ionicons name="settings" size={24} color={Colors.primary} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Manage Content</Text>
              <Text style={styles.actionDesc}>News, shows, events & more</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/charts')}>
            <Ionicons name="stats-chart" size={24} color={Colors.secondary} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>View Charts</Text>
              <Text style={styles.actionDesc}>Top rated & trending songs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/admin')}>
            <Ionicons name="people" size={24} color={Colors.accent} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>User Management</Text>
              <Text style={styles.actionDesc}>Manage roles & permissions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

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
  refreshBtn: {
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
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  metricLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,240,0,0.1)',
  },
  badgeText: {
    fontSize: FontSizes.xs,
    color: Colors.accent,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 2,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 2,
  },
  barLabel: {
    fontSize: 8,
    color: Colors.white,
    fontWeight: '700',
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  axisLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  // Desktop responsive styles
  headerDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  containerDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  metricsGridDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCardDesktop: {
    minWidth: 'calc(25% - 12px)',
    flex: 0,
  },
});
