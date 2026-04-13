import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  Alert, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getAdminUsersApi, getAdminStatsApi, updateUserRoleApi,
  getAdminRequestsApi, updateRequestStatusApi, createNewsApi,
  updateNowPlayingApi
} from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

type AdminTab = 'overview' | 'users' | 'requests' | 'content';

export default function AdminScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // News form
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState('general');

  // Now playing form
  const [npSong, setNpSong] = useState('');
  const [npArtist, setNpArtist] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [s, u, r] = await Promise.all([
        getAdminStatsApi(),
        getAdminUsersApi(),
        getAdminRequestsApi(),
      ]);
      setStats(s);
      setUsers(u);
      setRequests(r);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRoleChange = (userId: string, currentRole: string) => {
    const roles = ['listener', 'editor', 'dj', 'admin'].filter(r => r !== currentRole);
    Alert.alert('Change Role', 'Select new role:', [
      ...roles.map(r => ({
        text: r.charAt(0).toUpperCase() + r.slice(1),
        onPress: async () => {
          await updateUserRoleApi(userId, r);
          await loadData();
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRequestAction = async (requestId: string, status: string) => {
    await updateRequestStatusApi(requestId, status);
    await loadData();
  };

  const handleCreateNews = async () => {
    if (!newsTitle.trim() || !newsContent.trim()) {
      Alert.alert('Required', 'Title and content are required');
      return;
    }
    try {
      await createNewsApi({ title: newsTitle, content: newsContent, category: newsCategory });
      setNewsTitle('');
      setNewsContent('');
      Alert.alert('Published!', 'News article created');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleUpdateNowPlaying = async () => {
    if (!npSong.trim()) return;
    try {
      await updateNowPlayingApi({ song_title: npSong, artist: npArtist });
      setNpSong('');
      setNpArtist('');
      Alert.alert('Updated!', 'Now Playing updated');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (!user || !['admin', 'dj', 'editor'].includes(user.role)) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.noAccess}>
          <Ionicons name="lock-closed" size={48} color={Colors.textMuted} />
          <Text style={styles.noAccessText}>Access Denied</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity testID="admin-back-btn" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DASHBOARD</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
        {(['overview', 'users', 'requests', 'content'] as AdminTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            testID={`admin-tab-${t}`}
            style={[styles.tabBtn, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
        ) : tab === 'overview' ? (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={28} color={Colors.primary} />
              <Text style={styles.statNum}>{stats.total_users || 0}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="newspaper" size={28} color={Colors.secondary} />
              <Text style={styles.statNum}>{stats.total_news || 0}</Text>
              <Text style={styles.statLabel}>Articles</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="musical-notes" size={28} color={Colors.accent} />
              <Text style={styles.statNum}>{stats.total_requests || 0}</Text>
              <Text style={styles.statLabel}>Requests</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={28} color={Colors.primaryLight} />
              <Text style={styles.statNum}>{stats.pending_requests || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="mic" size={28} color={Colors.success} />
              <Text style={styles.statNum}>{stats.total_shows || 0}</Text>
              <Text style={styles.statLabel}>Shows</Text>
            </View>

            {/* Quick Now Playing Update */}
            {(user.role === 'admin' || user.role === 'dj') && (
              <View style={styles.npCard}>
                <Text style={styles.npTitle}>Update Now Playing</Text>
                <TextInput
                  testID="np-song-input"
                  style={styles.npInput}
                  value={npSong}
                  onChangeText={setNpSong}
                  placeholder="Song title"
                  placeholderTextColor={Colors.textMuted}
                />
                <TextInput
                  testID="np-artist-input"
                  style={styles.npInput}
                  value={npArtist}
                  onChangeText={setNpArtist}
                  placeholder="Artist"
                  placeholderTextColor={Colors.textMuted}
                />
                <TouchableOpacity testID="np-update-btn" style={styles.npBtn} onPress={handleUpdateNowPlaying}>
                  <Text style={styles.npBtnText}>UPDATE</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : tab === 'users' && user.role === 'admin' ? (
          <View style={styles.section}>
            {users.map((u) => (
              <View key={u.user_id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userNameText}>{u.name}</Text>
                  <Text style={styles.userEmailText}>{u.email}</Text>
                </View>
                <TouchableOpacity
                  testID={`role-btn-${u.user_id}`}
                  style={styles.roleBtn}
                  onPress={() => handleRoleChange(u.user_id, u.role)}
                >
                  <Text style={styles.roleBtnText}>{u.role?.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : tab === 'requests' ? (
          <View style={styles.section}>
            {requests.map((req) => (
              <View key={req.request_id} style={styles.reqCard}>
                <View style={styles.reqInfo}>
                  <Text style={styles.reqSong}>{req.song_title}</Text>
                  {req.artist ? <Text style={styles.reqArtist}>{req.artist}</Text> : null}
                  <Text style={styles.reqBy}>{req.user_name}</Text>
                </View>
                <View style={styles.reqActions}>
                  {req.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        testID={`approve-${req.request_id}`}
                        style={styles.approveBtn}
                        onPress={() => handleRequestAction(req.request_id, 'approved')}
                      >
                        <Ionicons name="checkmark" size={18} color={Colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        testID={`play-${req.request_id}`}
                        style={styles.playedBtn}
                        onPress={() => handleRequestAction(req.request_id, 'played')}
                      >
                        <Ionicons name="play" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                    </>
                  )}
                  <Text style={styles.reqStatus}>{req.status?.toUpperCase()}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CREATE NEWS ARTICLE</Text>
            <TextInput
              testID="news-title-input"
              style={styles.formInput}
              value={newsTitle}
              onChangeText={setNewsTitle}
              placeholder="Article title"
              placeholderTextColor={Colors.textMuted}
            />
            <TextInput
              testID="news-content-input"
              style={[styles.formInput, { height: 120, textAlignVertical: 'top' }]}
              value={newsContent}
              onChangeText={setNewsContent}
              placeholder="Article content"
              placeholderTextColor={Colors.textMuted}
              multiline
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              {['general', 'music', 'events', 'local', 'contests'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, newsCategory === cat && styles.catActive]}
                  onPress={() => setNewsCategory(cat)}
                >
                  <Text style={[styles.catText, newsCategory === cat && styles.catTextActive]}>
                    {cat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity testID="publish-news-btn" style={styles.publishBtn} onPress={handleCreateNews}>
              <Ionicons name="send" size={18} color={Colors.white} />
              <Text style={styles.publishText}>PUBLISH</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSizes.lg, fontWeight: '900', color: Colors.white, letterSpacing: 3 },
  tabScroll: { maxHeight: 44 },
  tabContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  tabBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: BorderRadius.round, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
  tabTextActive: { color: Colors.white },
  scroll: { flex: 1, paddingTop: Spacing.md },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md,
  },
  statCard: {
    width: '46%', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  statNum: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white, marginTop: 8 },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, fontWeight: '600', marginTop: 4 },
  npCard: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.borderActive, marginTop: Spacing.sm,
  },
  npTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.white, marginBottom: Spacing.md },
  npInput: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSizes.md,
    color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
  },
  npBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.round,
    paddingVertical: 10, alignItems: 'center', marginTop: Spacing.sm,
  },
  npBtnText: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.white, letterSpacing: 1 },
  section: { paddingHorizontal: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.secondary, letterSpacing: 3, marginBottom: Spacing.md },
  userCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  userInfo: { flex: 1 },
  userNameText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.white },
  userEmailText: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  roleBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.round,
    borderWidth: 1, borderColor: Colors.secondary,
  },
  roleBtnText: { fontSize: 10, fontWeight: '700', color: Colors.secondary, letterSpacing: 1 },
  reqCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  reqInfo: { flex: 1 },
  reqSong: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.white },
  reqArtist: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  reqBy: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  reqActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  approveBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  playedBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,0,127,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  reqStatus: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
  formInput: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSizes.md,
    color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  catBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  catActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  catText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textMuted },
  catTextActive: { color: Colors.background },
  publishBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.round,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  publishText: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.white, letterSpacing: 1 },
  noAccess: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noAccessText: { fontSize: FontSizes.lg, color: Colors.textMuted, marginTop: Spacing.md },
  backLink: { fontSize: FontSizes.md, color: Colors.primary, marginTop: Spacing.md },
});
