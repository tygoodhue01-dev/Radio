import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
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
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const isTablet = width >= 600 && width < 900;
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

  // Desktop layout
  if (isDesktop) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.desktopContainer}>
          {/* Desktop Header */}
          <View style={styles.desktopHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.desktopTitleArea}>
              <Text style={styles.desktopTitle}>Analytics Dashboard</Text>
              <Text style={styles.desktopSubtitle}>Monitor your radio station performance</Text>
            </View>
            <TouchableOpacity onPress={loadAnalytics} style={styles.refreshBtnDesktop}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.refreshBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Top Metrics Row */}
            <View style={styles.desktopMetricsRow}>
              <View style={[styles.desktopMetricCard, { borderLeftColor: Colors.primary }]}>
                <View style={styles.desktopMetricIcon}>
                  <Ionicons name="people" size={28} color={Colors.primary} />
                </View>
                <View style={styles.desktopMetricInfo}>
                  <Text style={styles.desktopMetricValue}>{stats?.total_users || 0}</Text>
                  <Text style={styles.desktopMetricLabel}>Total Users</Text>
                  <Text style={styles.desktopMetricTrend}>
                    <Ionicons name="trending-up" size={14} color={Colors.accent} /> +{stats?.new_users_7d || 0} this week
                  </Text>
                </View>
              </View>

              <View style={[styles.desktopMetricCard, { borderLeftColor: Colors.secondary }]}>
                <View style={styles.desktopMetricIcon}>
                  <Ionicons name="musical-notes" size={28} color={Colors.secondary} />
                </View>
                <View style={styles.desktopMetricInfo}>
                  <Text style={styles.desktopMetricValue}>{stats?.total_songs_played || 0}</Text>
                  <Text style={styles.desktopMetricLabel}>Songs Played</Text>
                  <Text style={styles.desktopMetricTrend}>{stats?.songs_played_today || 0} today</Text>
                </View>
              </View>

              <View style={[styles.desktopMetricCard, { borderLeftColor: Colors.accent }]}>
                <View style={styles.desktopMetricIcon}>
                  <Ionicons name="star" size={28} color={Colors.accent} />
                </View>
                <View style={styles.desktopMetricInfo}>
                  <Text style={styles.desktopMetricValue}>{stats?.total_ratings || 0}</Text>
                  <Text style={styles.desktopMetricLabel}>Song Ratings</Text>
                  <Text style={styles.desktopMetricTrend}>User engagement</Text>
                </View>
              </View>

              <View style={[styles.desktopMetricCard, { borderLeftColor: '#8b5cf6' }]}>
                <View style={styles.desktopMetricIcon}>
                  <Ionicons name="chatbubbles" size={28} color="#8b5cf6" />
                </View>
                <View style={styles.desktopMetricInfo}>
                  <Text style={styles.desktopMetricValue}>{stats?.total_requests || 0}</Text>
                  <Text style={styles.desktopMetricLabel}>Song Requests</Text>
                  <Text style={styles.desktopMetricTrend}>All time</Text>
                </View>
              </View>

              <View style={[styles.desktopMetricCard, { borderLeftColor: '#ec4899' }]}>
                <View style={styles.desktopMetricIcon}>
                  <Ionicons name="heart" size={28} color="#ec4899" />
                </View>
                <View style={styles.desktopMetricInfo}>
                  <Text style={styles.desktopMetricValue}>{stats?.total_favorites || 0}</Text>
                  <Text style={styles.desktopMetricLabel}>Song Favorites</Text>
                  <Text style={styles.desktopMetricTrend}>User engagement</Text>
                </View>
              </View>
            </View>

            {/* Main Content Grid */}
            <View style={styles.desktopContentGrid}>
              {/* Left Column - Chart */}
              <View style={styles.desktopChartSection}>
                <View style={styles.desktopSectionHeader}>
                  <Ionicons name="analytics" size={24} color={Colors.primary} />
                  <Text style={styles.desktopSectionTitle}>User Growth</Text>
                  <Text style={styles.desktopSectionSubtitle}>Last 30 days</Text>
                </View>
                <View style={styles.desktopChartContainer}>
                  <View style={styles.desktopChart}>
                    {dates.slice(-30).map((date, i) => {
                      const count = userGrowth[date] || 0;
                      const height = (count / maxSignups) * 180;
                      return (
                        <View key={i} style={styles.desktopBarWrapper}>
                          <View style={[styles.desktopBar, { height: Math.max(height, 4) }]}>
                            {count > 0 && <Text style={styles.desktopBarLabel}>{count}</Text>}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.chartXAxis}>
                    <Text style={styles.axisLabel}>{dates[0]?.substring(5) || 'Start'}</Text>
                    <Text style={styles.axisLabel}>Today</Text>
                  </View>
                </View>
              </View>

              {/* Right Column - Stats & Actions */}
              <View style={styles.desktopRightColumn}>
                {/* Quick Stats */}
                <View style={styles.desktopStatsCard}>
                  <View style={styles.desktopSectionHeader}>
                    <Ionicons name="speedometer" size={24} color={Colors.secondary} />
                    <Text style={styles.desktopSectionTitle}>Quick Stats</Text>
                  </View>
                  <View style={styles.desktopStatsList}>
                    <View style={styles.desktopStatRow}>
                      <View style={styles.desktopStatIcon}><Ionicons name="person-add" size={18} color={Colors.primary} /></View>
                      <Text style={styles.desktopStatLabel}>New users this week</Text>
                      <Text style={styles.desktopStatValue}>{stats?.new_users_7d || 0}</Text>
                    </View>
                    <View style={styles.desktopStatRow}>
                      <View style={styles.desktopStatIcon}><Ionicons name="play" size={18} color={Colors.secondary} /></View>
                      <Text style={styles.desktopStatLabel}>Songs played today</Text>
                      <Text style={styles.desktopStatValue}>{stats?.songs_played_today || 0}</Text>
                    </View>
                    <View style={styles.desktopStatRow}>
                      <View style={styles.desktopStatIcon}><Ionicons name="bar-chart" size={18} color={Colors.accent} /></View>
                      <Text style={styles.desktopStatLabel}>Avg daily signups</Text>
                      <Text style={styles.desktopStatValue}>{dates.length > 0 ? Math.round((stats?.new_users_7d || 0) / 7) : 0}</Text>
                    </View>
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.desktopActionsCard}>
                  <View style={styles.desktopSectionHeader}>
                    <Ionicons name="flash" size={24} color={Colors.accent} />
                    <Text style={styles.desktopSectionTitle}>Quick Actions</Text>
                  </View>
                  <TouchableOpacity style={styles.desktopActionBtn} onPress={() => router.push('/admin')}>
                    <Ionicons name="settings" size={20} color={Colors.primary} />
                    <Text style={styles.desktopActionText}>Manage Content</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.desktopActionBtn} onPress={() => router.push('/charts')}>
                    <Ionicons name="stats-chart" size={20} color={Colors.secondary} />
                    <Text style={styles.desktopActionText}>View Charts</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.desktopActionBtn} onPress={() => router.push('/admin')}>
                    <Ionicons name="people" size={20} color={Colors.accent} />
                    <Text style={styles.desktopActionText}>User Management</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Top Favorited Songs */}
                {stats?.top_favorites?.length > 0 && (
                  <View style={[styles.desktopStatsCard, { marginTop: 20 }]}>
                    <View style={styles.desktopSectionHeader}>
                      <Ionicons name="heart" size={24} color="#ec4899" />
                      <Text style={styles.desktopSectionTitle}>Top Favorites</Text>
                    </View>
                    <View style={styles.desktopStatsList}>
                      {stats.top_favorites.slice(0, 5).map((fav: any, idx: number) => (
                        <View key={idx} style={styles.desktopStatRow}>
                          <View style={[styles.desktopStatIcon, { backgroundColor: '#ec489920' }]}>
                            <Text style={{ color: '#ec4899', fontWeight: '800', fontSize: 12 }}>{idx + 1}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.desktopStatLabel} numberOfLines={1}>{fav.song}</Text>
                            <Text style={{ color: Colors.textMuted, fontSize: 11 }}>{fav.artist}</Text>
                          </View>
                          <Text style={styles.desktopStatValue}>{fav.count} ❤️</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // Mobile/Tablet Layout
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <TouchableOpacity onPress={loadAnalytics} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={24} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.container}>
          {/* Key Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={[styles.metricsGrid, isTablet && styles.metricsGridTablet]}>
              <View style={[styles.metricCard, isTablet && styles.metricCardTablet]}>
                <Ionicons name="people" size={32} color={Colors.primary} />
                <Text style={styles.metricValue}>{stats?.total_users || 0}</Text>
                <Text style={styles.metricLabel}>Total Users</Text>
                <View style={styles.badge}>
                  <Ionicons name="trending-up" size={12} color={Colors.accent} />
                  <Text style={styles.badgeText}>+{stats?.new_users_7d || 0} this week</Text>
                </View>
              </View>

              <View style={[styles.metricCard, isTablet && styles.metricCardTablet]}>
                <Ionicons name="musical-notes" size={32} color={Colors.secondary} />
                <Text style={styles.metricValue}>{stats?.total_songs_played || 0}</Text>
                <Text style={styles.metricLabel}>Songs Played</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats?.songs_played_today || 0} today</Text>
                </View>
              </View>

              <View style={[styles.metricCard, isTablet && styles.metricCardTablet]}>
                <Ionicons name="star" size={32} color={Colors.accent} />
                <Text style={styles.metricValue}>{stats?.total_ratings || 0}</Text>
                <Text style={styles.metricLabel}>Song Ratings</Text>
              </View>

              <View style={[styles.metricCard, isTablet && styles.metricCardTablet]}>
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
  container: {},
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
  metricsGridTablet: {
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricCardTablet: {
    minWidth: '22%',
    flex: 0,
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
  // Desktop styles
  desktopContainer: {
    flex: 1,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
  },
  desktopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 20,
  },
  desktopTitleArea: {
    flex: 1,
  },
  desktopTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
  },
  desktopSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  refreshBtnDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  refreshBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  desktopMetricsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 30,
  },
  desktopMetricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
  },
  desktopMetricIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopMetricInfo: {
    flex: 1,
  },
  desktopMetricValue: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
  },
  desktopMetricLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  desktopMetricTrend: {
    fontSize: 12,
    color: Colors.accent,
    marginTop: 4,
  },
  desktopContentGrid: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 24,
  },
  desktopChartSection: {
    flex: 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  desktopSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  desktopSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
  },
  desktopSectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  desktopChartContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 20,
  },
  desktopChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    gap: 4,
  },
  desktopBarWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  desktopBar: {
    width: '80%',
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  desktopBarLabel: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '700',
  },
  desktopRightColumn: {
    flex: 1,
    gap: 24,
  },
  desktopStatsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  desktopStatsList: {
    gap: 0,
  },
  desktopStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  desktopStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  desktopStatLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  desktopStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  desktopActionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  desktopActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  desktopActionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
});
