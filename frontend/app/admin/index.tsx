import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  Alert, RefreshControl, ActivityIndicator, Platform, useWindowDimensions, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getAdminUsersApi, getAdminStatsApi, updateUserRoleApi,
  getAdminRequestsApi, updateRequestStatusApi, createNewsApi,
  updateNowPlayingApi, deleteUserApi, getNewsApi, updateNewsApi, deleteNewsApi
} from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { WebNavBar, WebFooter } from '@/src/components/WebShell';

type AdminTab = 'overview' | 'users' | 'requests' | 'content' | 'nowplaying' | 'manage-news';

export default function AdminScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 900;
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState('general');
  const [npSong, setNpSong] = useState('');
  const [npArtist, setNpArtist] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [s, u, r] = await Promise.all([getAdminStatsApi(), getAdminUsersApi(), getAdminRequestsApi()]);
      setStats(s); setUsers(u); setRequests(r);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const handleRoleChange = (userId: string, currentRole: string) => {
    const roles = ['listener', 'editor', 'dj', 'admin'].filter(r => r !== currentRole);
    Alert.alert('Change Role', 'Select new role:', [
      ...roles.map(r => ({ text: r.charAt(0).toUpperCase() + r.slice(1), onPress: async () => { await updateUserRoleApi(userId, r); await loadData(); } })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    Alert.alert('Delete User', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteUserApi(userId); await loadData(); } },
    ]);
  };

  const handleRequestAction = async (requestId: string, status: string) => { await updateRequestStatusApi(requestId, status); await loadData(); };

  const handleCreateNews = async () => {
    if (!newsTitle.trim() || !newsContent.trim()) { Alert.alert('Required', 'Title and content are required'); return; }
    try { await createNewsApi({ title: newsTitle, content: newsContent, category: newsCategory }); setNewsTitle(''); setNewsContent(''); Alert.alert('Published!', 'News article created'); } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleUpdateNowPlaying = async () => {
    if (!npSong.trim()) return;
    try { await updateNowPlayingApi({ song_title: npSong, artist: npArtist }); setNpSong(''); setNpArtist(''); Alert.alert('Updated!', 'Now Playing updated'); } catch (e: any) { Alert.alert('Error', e.message); }
  };

  if (!user || !['admin', 'dj', 'editor'].includes(user.role)) {
    return (
      <SafeAreaView style={st.safe}>
        {isWeb && <WebNavBar />}
        <View style={st.noAccess}><Ionicons name="lock-closed" size={48} color={Colors.textMuted} /><Text style={st.noAccessText}>Access Denied</Text><TouchableOpacity onPress={() => router.back()}><Text style={st.backLink}>Go Back</Text></TouchableOpacity></View>
      </SafeAreaView>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) { case 'admin': return Colors.accent; case 'dj': return Colors.primary; case 'editor': return Colors.secondary; default: return Colors.textMuted; }
  };

  const sidebarItems: { key: AdminTab; label: string; icon: string; roles: string[] }[] = [
    { key: 'overview', label: 'Overview', icon: 'grid', roles: ['admin', 'dj', 'editor'] },
    { key: 'nowplaying', label: 'Now Playing', icon: 'radio', roles: ['admin', 'dj'] },
    { key: 'requests', label: 'Requests', icon: 'musical-notes', roles: ['admin', 'dj'] },
    { key: 'users', label: 'Users', icon: 'people', roles: ['admin'] },
    { key: 'content', label: 'Publish News', icon: 'create', roles: ['admin', 'editor'] },
  ];

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  // ============ RENDER CONTENT PANELS ============
  const renderOverview = () => (
    <View>
      <Text style={st.panelTitle}>Station Overview</Text>
      <View style={[st.statsRow, isWeb && { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }]}>
        {[
          { label: 'Total Users', value: stats.total_users || 0, icon: 'people', color: Colors.primary },
          { label: 'News Articles', value: stats.total_news || 0, icon: 'newspaper', color: Colors.secondary },
          { label: 'Total Requests', value: stats.total_requests || 0, icon: 'musical-notes', color: Colors.accent },
          { label: 'Pending', value: stats.pending_requests || 0, icon: 'time', color: '#f97316' },
          { label: 'Shows', value: stats.total_shows || 0, icon: 'mic', color: Colors.success },
        ].map((s) => (
          <View key={s.label} style={[st.statCard, isWeb && { width: '18%', minWidth: 140 }]}>
            <View style={[st.statIconWrap, { backgroundColor: s.color + '20' }]}><Ionicons name={s.icon as any} size={22} color={s.color} /></View>
            <Text style={st.statValue}>{s.value}</Text>
            <Text style={st.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick summary of pending requests */}
      {pendingCount > 0 && (
        <TouchableOpacity style={st.alertBanner} onPress={() => setTab('requests')}>
          <Ionicons name="alert-circle" size={20} color={Colors.accent} />
          <Text style={st.alertText}>{pendingCount} request{pendingCount > 1 ? 's' : ''} awaiting approval</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
        </TouchableOpacity>
      )}

      {/* Analytics Link */}
      <TouchableOpacity style={st.analyticsCard} onPress={() => router.push('/admin/analytics')}>
        <View style={st.analyticsIcon}>
          <Ionicons name="analytics" size={32} color={Colors.primary} />
        </View>
        <View style={st.analyticsInfo}>
          <Text style={st.analyticsTitle}>Advanced Analytics</Text>
          <Text style={st.analyticsDesc}>View detailed statistics, charts & user growth</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  const renderNowPlaying = () => (
    <View>
      <Text style={st.panelTitle}>Update Now Playing</Text>
      <Text style={st.panelSub}>Set the currently playing song that listeners see on the homepage.</Text>
      <View style={[st.formCard, isWeb && { maxWidth: 500 }]}>
        <Text style={st.inputLabel}>SONG TITLE</Text>
        <TextInput testID="np-song-input" style={st.input} value={npSong} onChangeText={setNpSong} placeholder="Enter song title" placeholderTextColor={Colors.textMuted} />
        <Text style={st.inputLabel}>ARTIST</Text>
        <TextInput testID="np-artist-input" style={st.input} value={npArtist} onChangeText={setNpArtist} placeholder="Enter artist name" placeholderTextColor={Colors.textMuted} />
        <TouchableOpacity testID="np-update-btn" style={st.primaryBtn} onPress={handleUpdateNowPlaying}>
          <Ionicons name="radio" size={18} color="#fff" /><Text style={st.primaryBtnTxt}>UPDATE NOW PLAYING</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRequests = () => (
    <View>
      <Text style={st.panelTitle}>Song Requests</Text>
      <Text style={st.panelSub}>Approve or mark requests as played. Only approved requests show publicly.</Text>
      {/* Filter tabs */}
      <View style={st.filterRow}>
        {['all', 'pending', 'approved', 'played'].map(f => (
          <TouchableOpacity key={f} style={[st.filterBtn, f === 'all' && st.filterActive]} onPress={() => {}}>
            <Text style={[st.filterTxt, f === 'all' && st.filterTxtActive]}>{f.toUpperCase()}{f === 'pending' ? ` (${pendingCount})` : ''}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Requests table */}
      {isWeb ? (
        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.th, { flex: 2 }]}>Song</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Artist</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Requested By</Text>
            <Text style={[st.th, { flex: 1 }]}>Message</Text>
            <Text style={[st.th, { flex: 0.8 }]}>Status</Text>
            <Text style={[st.th, { flex: 1 }]}>Actions</Text>
          </View>
          {requests.map(req => (
            <View key={req.request_id} style={st.tableRow}>
              <Text style={[st.td, { flex: 2, fontWeight: '600', color: '#fff' }]}>{req.song_title}</Text>
              <Text style={[st.td, { flex: 1.5 }]}>{req.artist || '—'}</Text>
              <Text style={[st.td, { flex: 1.5 }]}>{req.user_name}</Text>
              <Text style={[st.td, { flex: 1, fontStyle: req.message ? 'italic' : 'normal' }]} numberOfLines={1}>{req.message || '—'}</Text>
              <View style={{ flex: 0.8, justifyContent: 'center' }}>
                <View style={[st.statusBadge, req.status === 'approved' && st.statusApproved, req.status === 'played' && st.statusPlayed]}>
                  <Text style={[st.statusTxt, req.status === 'approved' && { color: Colors.success }, req.status === 'played' && { color: Colors.secondary }]}>{req.status?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {req.status === 'pending' && (
                  <>
                    <TouchableOpacity testID={`approve-${req.request_id}`} style={st.actionBtn} onPress={() => handleRequestAction(req.request_id, 'approved')}>
                      <Ionicons name="checkmark" size={16} color={Colors.success} /><Text style={[st.actionTxt, { color: Colors.success }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity testID={`play-${req.request_id}`} style={st.actionBtn} onPress={() => handleRequestAction(req.request_id, 'played')}>
                      <Ionicons name="play" size={16} color={Colors.primary} /><Text style={[st.actionTxt, { color: Colors.primary }]}>Played</Text>
                    </TouchableOpacity>
                  </>
                )}
                {req.status === 'approved' && (
                  <TouchableOpacity style={st.actionBtn} onPress={() => handleRequestAction(req.request_id, 'played')}>
                    <Ionicons name="play" size={16} color={Colors.primary} /><Text style={[st.actionTxt, { color: Colors.primary }]}>Mark Played</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        requests.map(req => (
          <View key={req.request_id} style={st.mReqCard}>
            <View style={st.mReqTop}><Text style={st.mReqSong}>{req.song_title}</Text><View style={[st.statusBadge, req.status === 'approved' && st.statusApproved, req.status === 'played' && st.statusPlayed]}><Text style={[st.statusTxt, req.status === 'approved' && { color: Colors.success }, req.status === 'played' && { color: Colors.secondary }]}>{req.status?.toUpperCase()}</Text></View></View>
            {req.artist ? <Text style={st.mReqArtist}>{req.artist}</Text> : null}
            <Text style={st.mReqBy}>{req.user_name}</Text>
            {req.status === 'pending' && (
              <View style={st.mReqActions}>
                <TouchableOpacity style={[st.mActionBtn, { backgroundColor: 'rgba(34,197,94,0.15)' }]} onPress={() => handleRequestAction(req.request_id, 'approved')}><Ionicons name="checkmark" size={16} color={Colors.success} /><Text style={{ color: Colors.success, fontWeight: '700', fontSize: 12 }}>Approve</Text></TouchableOpacity>
                <TouchableOpacity style={[st.mActionBtn, { backgroundColor: 'rgba(255,0,127,0.15)' }]} onPress={() => handleRequestAction(req.request_id, 'played')}><Ionicons name="play" size={16} color={Colors.primary} /><Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 12 }}>Played</Text></TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderUsers = () => (
    <View>
      <Text style={st.panelTitle}>User Management</Text>
      <Text style={st.panelSub}>Manage user roles and accounts. Click a role badge to change it.</Text>
      {isWeb ? (
        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.th, { flex: 2 }]}>Name</Text>
            <Text style={[st.th, { flex: 2 }]}>Email</Text>
            <Text style={[st.th, { flex: 1 }]}>Role</Text>
            <Text style={[st.th, { flex: 1 }]}>Joined</Text>
            <Text style={[st.th, { flex: 1 }]}>Actions</Text>
          </View>
          {users.map(u => (
            <View key={u.user_id} style={st.tableRow}>
              <Text style={[st.td, { flex: 2, fontWeight: '600', color: '#fff' }]}>{u.name}</Text>
              <Text style={[st.td, { flex: 2 }]}>{u.email}</Text>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <TouchableOpacity testID={`role-btn-${u.user_id}`} style={[st.roleBadge, { borderColor: getRoleColor(u.role) }]} onPress={() => handleRoleChange(u.user_id, u.role)}>
                  <Text style={[st.roleTxt, { color: getRoleColor(u.role) }]}>{u.role?.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[st.td, { flex: 1 }]}>{new Date(u.created_at).toLocaleDateString()}</Text>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleDeleteUser(u.user_id, u.name)} style={st.deleteBtn}>
                  <Ionicons name="trash" size={14} color={Colors.error} /><Text style={{ color: Colors.error, fontSize: 12, fontWeight: '600' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        users.map(u => (
          <View key={u.user_id} style={st.mUserCard}>
            <View style={st.mUserInfo}><Text style={st.mUserName}>{u.name}</Text><Text style={st.mUserEmail}>{u.email}</Text></View>
            <TouchableOpacity style={[st.roleBadge, { borderColor: getRoleColor(u.role) }]} onPress={() => handleRoleChange(u.user_id, u.role)}><Text style={[st.roleTxt, { color: getRoleColor(u.role) }]}>{u.role?.toUpperCase()}</Text></TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const renderContent = () => (
    <View>
      <Text style={st.panelTitle}>Publish News Article</Text>
      <Text style={st.panelSub}>Create and publish news articles that appear in the News feed.</Text>
      <View style={[st.formCard, isWeb && { maxWidth: 600 }]}>
        <Text style={st.inputLabel}>TITLE</Text>
        <TextInput testID="news-title-input" style={st.input} value={newsTitle} onChangeText={setNewsTitle} placeholder="Article headline" placeholderTextColor={Colors.textMuted} />
        <Text style={st.inputLabel}>CONTENT</Text>
        <TextInput testID="news-content-input" style={[st.input, { height: 140, textAlignVertical: 'top' }]} value={newsContent} onChangeText={setNewsContent} placeholder="Write your article..." placeholderTextColor={Colors.textMuted} multiline />
        <Text style={st.inputLabel}>CATEGORY</Text>
        <View style={st.catRow}>
          {['general', 'music', 'events', 'local', 'contests'].map(cat => (
            <TouchableOpacity key={cat} style={[st.catBtn, newsCategory === cat && st.catActive]} onPress={() => setNewsCategory(cat)}>
              <Text style={[st.catTxt, newsCategory === cat && st.catTxtActive]}>{cat.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity testID="publish-news-btn" style={st.primaryBtn} onPress={handleCreateNews}>
          <Ionicons name="send" size={18} color="#fff" /><Text style={st.primaryBtnTxt}>PUBLISH ARTICLE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPanel = () => {
    if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />;
    switch (tab) {
      case 'overview': return renderOverview();
      case 'nowplaying': return renderNowPlaying();
      case 'requests': return renderRequests();
      case 'users': return renderUsers();
      case 'content': return renderContent();
    }
  };

  // ============ WEB LAYOUT ============
  if (isWeb) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <WebNavBar />
        <View style={st.webLayout}>
          {/* Sidebar */}
          <View style={st.sidebar}>
            <View style={st.sidebarHeader}>
              <Ionicons name="grid" size={20} color={Colors.primary} />
              <Text style={st.sidebarTitle}>Dashboard</Text>
            </View>
            {sidebarItems.filter(i => i.roles.includes(user.role)).map(item => (
              <TouchableOpacity key={item.key} testID={`admin-tab-${item.key}`} style={[st.sidebarItem, tab === item.key && st.sidebarItemActive]} onPress={() => setTab(item.key)}>
                <Ionicons name={item.icon as any} size={18} color={tab === item.key ? Colors.primary : Colors.textMuted} />
                <Text style={[st.sidebarItemTxt, tab === item.key && st.sidebarItemTxtActive]}>{item.label}</Text>
                {item.key === 'requests' && pendingCount > 0 && (
                  <View style={st.badge}><Text style={st.badgeTxt}>{pendingCount}</Text></View>
                )}
              </TouchableOpacity>
            ))}
            <View style={st.sidebarDivider} />
            <TouchableOpacity style={st.sidebarItem} onPress={() => router.push('/(tabs)/home')}>
              <Ionicons name="arrow-back" size={18} color={Colors.textMuted} />
              <Text style={st.sidebarItemTxt}>Back to Site</Text>
            </TouchableOpacity>
          </View>
          {/* Main Content */}
          <ScrollView style={st.mainContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
            <View style={st.mainInner}>{renderPanel()}</View>
            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      </View>
    );
  }

  // ============ MOBILE LAYOUT ============
  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <View style={st.mHeader}>
        <TouchableOpacity testID="admin-back-btn" onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={st.mHeaderTitle}>DASHBOARD</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.mTabScroll} contentContainerStyle={st.mTabContent}>
        {sidebarItems.filter(i => i.roles.includes(user.role)).map(item => (
          <TouchableOpacity key={item.key} testID={`admin-tab-${item.key}`} style={[st.mTabBtn, tab === item.key && st.mTabActive]} onPress={() => setTab(item.key)}>
            <Text style={[st.mTabTxt, tab === item.key && st.mTabTxtActive]}>{item.label.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={{ flex: 1, paddingHorizontal: Spacing.lg }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        {renderPanel()}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  noAccess: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noAccessText: { fontSize: 18, color: Colors.textMuted, marginTop: 16 },
  backLink: { fontSize: 14, color: Colors.primary, marginTop: 12 },

  // Web layout
  webLayout: { flex: 1, flexDirection: 'row' },
  sidebar: { width: 240, backgroundColor: '#0d0d0f', borderRightWidth: 1, borderRightColor: Colors.border, paddingTop: 24, paddingHorizontal: 16 },
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 24 },
  sidebarTitle: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  sidebarItemActive: { backgroundColor: 'rgba(255,0,127,0.1)' },
  sidebarItemTxt: { fontSize: 14, color: Colors.textMuted, fontWeight: '500', flex: 1 },
  sidebarItemTxtActive: { color: '#fff', fontWeight: '600' },
  badge: { backgroundColor: Colors.primary, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
  sidebarDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  mainContent: { flex: 1 },
  mainInner: { padding: 32, maxWidth: 1000 },

  // Panel common
  panelTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  panelSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 },

  // Stats
  statsRow: { gap: 12, marginBottom: 24 },
  statCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 20, borderWidth: 1, borderColor: Colors.border, width: '46%', marginBottom: 12 },
  statIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 4, fontWeight: '500' },

  // Alert banner
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,240,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,240,0,0.2)', borderRadius: 12, padding: 16, marginTop: 8 },
  alertText: { flex: 1, fontSize: 14, color: Colors.accent, fontWeight: '600' },

  // Table (web)
  table: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  th: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
  tableRow: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', alignItems: 'center' },
  td: { fontSize: 13, color: Colors.textSecondary },

  // Status badges
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: 'rgba(255,240,0,0.12)', alignSelf: 'flex-start' },
  statusApproved: { backgroundColor: 'rgba(34,197,94,0.12)' },
  statusPlayed: { backgroundColor: 'rgba(0,240,255,0.12)' },
  statusTxt: { fontSize: 10, fontWeight: '800', color: Colors.accent, letterSpacing: 1 },

  // Actions
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  actionTxt: { fontSize: 12, fontWeight: '600' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },

  // Role badge
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  roleTxt: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  // Form
  formCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: 24, borderWidth: 1, borderColor: Colors.border },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.secondary, letterSpacing: 2, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#fff', borderWidth: 1, borderColor: Colors.border },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, marginTop: 24 },
  primaryBtnTxt: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  catRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  catBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  catActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  catTxt: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
  catTxtActive: { color: Colors.background },

  // Filter row
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTxt: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
  filterTxtActive: { color: '#fff' },

  // Mobile
  mHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  mHeaderTitle: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  mTabScroll: { maxHeight: 44 },
  mTabContent: { paddingHorizontal: Spacing.lg, gap: 8 },
  mTabBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  mTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  mTabTxt: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1 },
  mTabTxtActive: { color: '#fff' },
  mReqCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  mReqTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mReqSong: { fontSize: 15, fontWeight: '600', color: '#fff', flex: 1 },
  mReqArtist: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  mReqBy: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  mReqActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  mActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  mUserCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  mUserInfo: { flex: 1 },
  mUserName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  mUserEmail: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  // Analytics Card
  analyticsCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: 'rgba(255,0,127,0.1)', borderRadius: BorderRadius.xl, padding: Spacing.lg, marginTop: Spacing.lg, borderWidth: 2, borderColor: Colors.primary },
  analyticsIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,0,127,0.2)', alignItems: 'center', justifyContent: 'center' },
  analyticsInfo: { flex: 1 },
  analyticsTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  analyticsDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary },
});
