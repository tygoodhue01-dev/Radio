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
  getAdminUsersApi, getAdminStatsApi, updateUserRoleApi, updateUserApi,
  getAdminRequestsApi, updateRequestStatusApi, createNewsApi,
  updateNowPlayingApi, deleteUserApi, getNewsApi, updateNewsApi, deleteNewsApi,
  getPendingCommentsApi, approveCommentApi, deleteCommentApi, deleteRequestApi,
  getScheduleApi, createScheduleSlotApi, updateScheduleSlotApi, deleteScheduleSlotApi,
  getJobApplicationsApi, updateJobApplicationStatusApi, deleteJobApplicationApi, sendEmailToApplicantApi
} from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { WebNavBar, WebFooter } from '@/src/components/WebShell';

type AdminTab = 'overview' | 'users' | 'requests' | 'content' | 'nowplaying' | 'manage-news' | 'comments' | 'schedule' | 'jobs';

export default function AdminScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 900;
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [allNews, setAllNews] = useState<any[]>([]);
  const [pendingComments, setPendingComments] = useState<any[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // News creation
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState('general');
  
  // Now Playing
  const [npSong, setNpSong] = useState('');
  const [npArtist, setNpArtist] = useState('');
  const [streamUrl, setStreamUrl] = useState('https://streaming.live365.com/a72818');
  
  // Edit modals
  const [editUserModal, setEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editNewsModal, setEditNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailingApplicant, setEmailingApplicant] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      console.log('Admin: Loading data...');
      const promises = [
        getAdminStatsApi(), 
        getAdminUsersApi(), 
        getAdminRequestsApi(),
        getNewsApi(),
        getScheduleApi(),
        getJobApplicationsApi(),
      ];
      
      // Only admins and editors can see pending comments
      if (user?.role === 'admin' || user?.role === 'editor') {
        console.log('Admin: User is admin/editor, loading pending comments...');
        promises.push(getPendingCommentsApi());
      } else {
        console.log('Admin: User role is:', user?.role, '- NOT loading comments');
      }
      
      console.log('Admin: Fetching', promises.length, 'promises...');
      const results = await Promise.all(promises);
      
      console.log('Admin: Results received:', {
        stats: results[0],
        users: results[1]?.length,
        requests: results[2]?.length,
        news: results[3]?.length,
        schedule: results[4]?.length,
        jobs: results[5]?.length,
        commentsIndex6: results[6],
        commentsLength: results[6]?.length
      });
      
      setStats(results[0]); 
      setUsers(results[1]); 
      setRequests(results[2]); 
      setAllNews(results[3]);
      setScheduleSlots(results[4]);
      setJobApplications(results[5]);
      
      if (results[6]) {
        console.log('Admin: Setting pending comments to:', results[6]);
        setPendingComments(results[6]);
      } else {
        console.log('Admin: No comments data in results[6]');
      }
    } catch (e) { 
      console.error('Admin: Load data error:', e); 
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

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
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
      if (confirmDelete) {
        deleteUserApi(userId).then(() => loadData()).catch(e => alert(e.message || 'Failed to delete user'));
      }
    } else {
      Alert.alert('Delete User', `Are you sure you want to delete ${name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { 
          try {
            await deleteUserApi(userId); 
            await loadData(); 
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete user');
          }
        } },
      ]);
    }
  };

  const handleRequestAction = async (requestId: string, status: string) => { await updateRequestStatusApi(requestId, status); await loadData(); };
  
  const handleDeleteRequest = (requestId: string, songTitle: string) => {
    const confirmDelete = Platform.OS === 'web' 
      ? window.confirm(`Delete request for "${songTitle}"?`)
      : true;
    
    if (Platform.OS === 'web') {
      if (confirmDelete) {
        deleteRequestApi(requestId).then(() => loadData());
      }
    } else {
      Alert.alert('Delete Request', `Delete request for "${songTitle}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await deleteRequestApi(requestId); await loadData(); } },
      ]);
    }
  };

  const handleEditUser = (userToEdit: any) => {
    setEditingUser(userToEdit);
    setEditUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      await updateUserApi(editingUser.user_id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        bio: editingUser.bio
      });
      setEditUserModal(false);
      setEditingUser(null);
      await loadData();
      const msg = 'User updated successfully';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Success', msg);
      }
    } catch (e: any) {
      const errMsg = e.message || 'Failed to update user';
      if (Platform.OS === 'web') {
        alert(errMsg);
      } else {
        Alert.alert('Error', errMsg);
      }
    }
  };

  const handleEditNews = (newsItem: any) => {
    setEditingNews(newsItem);
    setEditNewsModal(true);
  };

  const handleSaveNews = async () => {
    if (!editingNews) return;
    try {
      await updateNewsApi(editingNews.news_id, {
        title: editingNews.title,
        content: editingNews.content,
        category: editingNews.category,
        summary: editingNews.summary
      });
      setEditNewsModal(false);
      setEditingNews(null);
      await loadData();
      Alert.alert('Success', 'News article updated');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDeleteNews = (newsId: string, title: string) => {
    const confirmDelete = Platform.OS === 'web'
      ? window.confirm(`Delete article "${title}"?`)
      : true;
    
    if (Platform.OS === 'web') {
      if (confirmDelete) {
        deleteNewsApi(newsId).then(() => loadData());
      }
    } else {
      Alert.alert('Delete Article', `Delete "${title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await deleteNewsApi(newsId); await loadData(); } },
      ]);
    }
  };

  const handleApproveComment = async (commentId: string) => {
    try {
      await approveCommentApi(commentId);
      await loadData();
      const msg = 'Comment approved';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Success', msg);
      }
    } catch (e: any) {
      const errMsg = e.message || 'Failed to approve';
      if (Platform.OS === 'web') {
        alert(errMsg);
      } else {
        Alert.alert('Error', errMsg);
      }
    }
  };

  const handleDeleteComment = (commentId: string, userName: string) => {
    const confirmDelete = Platform.OS === 'web'
      ? window.confirm(`Delete comment from ${userName}?`)
      : true;
    
    if (Platform.OS === 'web') {
      if (confirmDelete) {
        deleteCommentApi(commentId).then(() => loadData());
      }
    } else {
      Alert.alert('Delete Comment', `Delete comment from ${userName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { 
          await deleteCommentApi(commentId); 
          await loadData(); 
        } },
      ]);
    }
  };

  const handleCreateNews = async () => {
    if (!newsTitle.trim() || !newsContent.trim()) { Alert.alert('Required', 'Title and content are required'); return; }
    try { await createNewsApi({ title: newsTitle, content: newsContent, category: newsCategory }); setNewsTitle(''); setNewsContent(''); Alert.alert('Published!', 'News article created'); } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleUpdateNowPlaying = async () => {
    if (!npSong.trim()) return;
    try { await updateNowPlayingApi({ song_title: npSong, artist: npArtist }); setNpSong(''); setNpArtist(''); Alert.alert('Updated!', 'Now Playing updated'); } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleDeleteScheduleSlot = (scheduleId: string, showName: string) => {
    const confirmDelete = Platform.OS === 'web' ? window.confirm(`Delete "${showName}" from schedule?`) : true;
    if (Platform.OS === 'web') {
      if (confirmDelete) deleteScheduleSlotApi(scheduleId).then(() => loadData());
    } else {
      Alert.alert('Delete Slot', `Delete "${showName}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await deleteScheduleSlotApi(scheduleId); await loadData(); } },
      ]);
    }
  };

  const handleSaveScheduleSlot = async () => {
    if (!editingSchedule) return;
    try {
      if (editingSchedule.schedule_id) {
        await updateScheduleSlotApi(editingSchedule.schedule_id, editingSchedule);
      } else {
        await createScheduleSlotApi(editingSchedule);
      }
      setScheduleModal(false);
      setEditingSchedule(null);
      await loadData();
      const msg = 'Schedule updated';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Success', msg);
    } catch (e: any) {
      Platform.OS === 'web' ? alert(e.message) : Alert.alert('Error', e.message);
    }
  };

  const handleApproveApplication = async (appId: string) => {
    try {
      await updateJobApplicationStatusApi(appId, 'approved');
      await loadData();
      const msg = 'Application approved';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Success', msg);
    } catch (e: any) {
      Platform.OS === 'web' ? alert(e.message) : Alert.alert('Error', e.message);
    }
  };

  const handleRejectApplication = async (appId: string) => {
    try {
      await updateJobApplicationStatusApi(appId, 'rejected');
      await loadData();
      const msg = 'Application rejected';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Success', msg);
    } catch (e: any) {
      Platform.OS === 'web' ? alert(e.message) : Alert.alert('Error', e.message);
    }
  };

  const handleDeleteApplication = (appId: string, name: string) => {
    const confirmDelete = Platform.OS === 'web' ? window.confirm(`Delete application from ${name}?`) : true;
    if (Platform.OS === 'web') {
      if (confirmDelete) deleteJobApplicationApi(appId).then(() => loadData());
    } else {
      Alert.alert('Delete Application', `Delete from ${name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await deleteJobApplicationApi(appId); await loadData(); } },
      ]);
    }
  };

  const handleSendEmailToApplicant = async () => {
    if (!emailingApplicant || !emailSubject || !emailMessage) {
      const msg = 'Please fill in subject and message';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Required', msg);
      return;
    }
    try {
      await sendEmailToApplicantApi(emailingApplicant.application_id, { subject: emailSubject, message: emailMessage });
      setEmailModal(false);
      setEmailingApplicant(null);
      setEmailSubject('');
      setEmailMessage('');
      const msg = 'Email sent successfully (mock)';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Success', msg);
    } catch (e: any) {
      Platform.OS === 'web' ? alert(e.message) : Alert.alert('Error', e.message);
    }
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
    { key: 'manage-news', label: 'Manage News', icon: 'newspaper', roles: ['admin', 'editor'] },
    { key: 'comments', label: 'Comments', icon: 'chatbubbles', roles: ['admin', 'editor'] },
    { key: 'schedule', label: 'Schedule', icon: 'calendar', roles: ['admin'] },
    { key: 'jobs', label: 'Job Applications', icon: 'briefcase', roles: ['admin'] },
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
      <Text style={st.panelSub}>Set the currently playing song and configure stream metadata source.</Text>
      
      {/* Stream Configuration */}
      <View style={[st.formCard, isWeb && { maxWidth: 600 }, { marginBottom: Spacing.lg }]}>
        <Text style={st.inputLabel}>STREAM URL / METADATA SOURCE</Text>
        <TextInput 
          style={st.input} 
          value={streamUrl} 
          onChangeText={setStreamUrl} 
          placeholder="https://streaming.live365.com/a72818" 
          placeholderTextColor={Colors.textMuted} 
        />
        <Text style={{ fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 }}>
          Configure the API address for automatic now playing updates from your stream provider
        </Text>
      </View>

      {/* Manual Update */}
      <View style={[st.formCard, isWeb && { maxWidth: 600 }]}>
        <Text style={[st.inputLabel, { marginTop: 0 }]}>MANUAL UPDATE</Text>
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
      <Text style={st.panelSub}>Mark pending requests as played or delete them.</Text>
      {/* Requests table */}
      {isWeb ? (
        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.th, { flex: 2 }]}>Song</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Artist</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Requested By</Text>
            <Text style={[st.th, { flex: 1 }]}>Message</Text>
            <Text style={[st.th, { flex: 0.8 }]}>Status</Text>
            <Text style={[st.th, { flex: 1.2 }]}>Actions</Text>
          </View>
          {requests.map(req => (
            <View key={req.request_id} style={st.tableRow}>
              <Text style={[st.td, { flex: 2, fontWeight: '600', color: '#fff' }]}>{req.song_title}</Text>
              <Text style={[st.td, { flex: 1.5 }]}>{req.artist || '—'}</Text>
              <Text style={[st.td, { flex: 1.5 }]}>{req.user_name}</Text>
              <Text style={[st.td, { flex: 1, fontStyle: req.message ? 'italic' : 'normal' }]} numberOfLines={1}>{req.message || '—'}</Text>
              <View style={{ flex: 0.8, justifyContent: 'center' }}>
                <View style={[st.statusBadge, (req.status === 'approved' || req.status === 'played') && st.statusPlayed]}>
                  <Text style={[st.statusTxt, (req.status === 'approved' || req.status === 'played') && { color: Colors.secondary }]}>
                    {req.status === 'pending' ? 'PENDING' : 'PLAYED'}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1.2, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {req.status === 'pending' && (
                  <TouchableOpacity testID={`play-${req.request_id}`} style={st.actionBtn} onPress={() => handleRequestAction(req.request_id, 'played')}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} /><Text style={[st.actionTxt, { color: Colors.success }]}>Played</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={st.deleteBtn} onPress={() => handleDeleteRequest(req.request_id, req.song_title)}>
                  <Ionicons name="trash" size={14} color={Colors.error} /><Text style={{ color: Colors.error, fontSize: 12, fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        requests.map(req => (
          <View key={req.request_id} style={st.mReqCard}>
            <View style={st.mReqTop}>
              <Text style={st.mReqSong}>{req.song_title}</Text>
              <View style={[st.statusBadge, (req.status === 'approved' || req.status === 'played') && st.statusPlayed]}>
                <Text style={[st.statusTxt, (req.status === 'approved' || req.status === 'played') && { color: Colors.secondary }]}>
                  {req.status === 'pending' ? 'PENDING' : 'PLAYED'}
                </Text>
              </View>
            </View>
            {req.artist ? <Text style={st.mReqArtist}>{req.artist}</Text> : null}
            <Text style={st.mReqBy}>{req.user_name}</Text>
            <View style={st.mReqActions}>
              {req.status === 'pending' && (
                <TouchableOpacity style={[st.mActionBtn, { backgroundColor: 'rgba(34,197,94,0.15)' }]} onPress={() => handleRequestAction(req.request_id, 'played')}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} /><Text style={{ color: Colors.success, fontWeight: '700', fontSize: 12 }}>Played</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[st.mActionBtn, { backgroundColor: 'rgba(239,68,68,0.15)' }]} onPress={() => handleDeleteRequest(req.request_id, req.song_title)}>
                <Ionicons name="trash" size={16} color={Colors.error} /><Text style={{ color: Colors.error, fontWeight: '700', fontSize: 12 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderUsers = () => (
    <View>
      <Text style={st.panelTitle}>User Management</Text>
      <Text style={st.panelSub}>Edit user details, manage roles, or remove accounts.</Text>
      {isWeb ? (
        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.th, { flex: 2 }]}>Name</Text>
            <Text style={[st.th, { flex: 2 }]}>Email</Text>
            <Text style={[st.th, { flex: 1 }]}>Role</Text>
            <Text style={[st.th, { flex: 1 }]}>Joined</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Actions</Text>
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
              <View style={{ flex: 1.5, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleEditUser(u)} style={st.actionBtn}>
                  <Ionicons name="create" size={14} color={Colors.accent} /><Text style={{ color: Colors.accent, fontSize: 12, fontWeight: '600' }}>Edit</Text>
                </TouchableOpacity>
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
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TouchableOpacity style={[st.roleBadge, { borderColor: getRoleColor(u.role) }]} onPress={() => handleRoleChange(u.user_id, u.role)}><Text style={[st.roleTxt, { color: getRoleColor(u.role) }]}>{u.role?.toUpperCase()}</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleEditUser(u)} style={{ padding: 8 }}>
                <Ionicons name="create" size={20} color={Colors.accent} />
              </TouchableOpacity>
            </View>
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

  const renderManageNews = () => (
    <View>
      <Text style={st.panelTitle}>Manage News Articles</Text>
      <Text style={st.panelSub}>View, edit, or delete published news articles.</Text>
      {allNews.length === 0 ? (
        <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: 40 }}>No news articles yet</Text>
      ) : (
        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.th, { flex: 2.5 }]}>Title</Text>
            <Text style={[st.th, { flex: 1 }]}>Category</Text>
            <Text style={[st.th, { flex: 1 }]}>Published</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Actions</Text>
          </View>
          {allNews.map(article => (
            <View key={article.news_id} style={st.tableRow}>
              <Text style={[st.td, { flex: 2.5, fontWeight: '600', color: '#fff' }]} numberOfLines={2}>{article.title}</Text>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={[st.statusBadge, { borderColor: Colors.accent }]}>
                  <Text style={[st.statusTxt, { color: Colors.accent }]}>{article.category?.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={[st.td, { flex: 1 }]}>{new Date(article.created_at).toLocaleDateString()}</Text>
              <View style={{ flex: 1.5, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleEditNews(article)} style={st.actionBtn}>
                  <Ionicons name="create" size={14} color={Colors.accent} /><Text style={{ color: Colors.accent, fontSize: 12, fontWeight: '600' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteNews(article.news_id, article.title)} style={st.deleteBtn}>
                  <Ionicons name="trash" size={14} color={Colors.error} /><Text style={{ color: Colors.error, fontSize: 12, fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderComments = () => {
    console.log('renderComments called, pendingComments:', pendingComments, 'length:', pendingComments.length);
    return (
    <View>
      <Text style={st.panelTitle}>Comment Moderation</Text>
      <Text style={st.panelSub}>Review and approve pending comments from users. ({pendingComments.length} pending)</Text>
      {pendingComments.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Ionicons name="chatbubbles-outline" size={60} color={Colors.textMuted} />
          <Text style={{ color: Colors.textMuted, marginTop: 16, fontSize: 16 }}>No pending comments</Text>
        </View>
      ) : (
        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.th, { flex: 2 }]}>Comment</Text>
            <Text style={[st.th, { flex: 1 }]}>User</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Article</Text>
            <Text style={[st.th, { flex: 1 }]}>Date</Text>
            <Text style={[st.th, { flex: 1.2 }]}>Actions</Text>
          </View>
          {pendingComments.map(comment => (
            <View key={comment.comment_id} style={st.tableRow}>
              <Text style={[st.td, { flex: 2 }]} numberOfLines={2}>{comment.content}</Text>
              <Text style={[st.td, { flex: 1 }]}>{comment.user_name}</Text>
              <Text style={[st.td, { flex: 1.5 }]} numberOfLines={1}>{comment.post_title || comment.post_id}</Text>
              <Text style={[st.td, { flex: 1 }]}>{new Date(comment.created_at).toLocaleDateString()}</Text>
              <View style={{ flex: 1.2, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleApproveComment(comment.comment_id)} style={st.actionBtn}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.success} /><Text style={{ color: Colors.success, fontSize: 12, fontWeight: '600' }}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteComment(comment.comment_id, comment.user_name)} style={st.deleteBtn}>
                  <Ionicons name="trash" size={14} color={Colors.error} /><Text style={{ color: Colors.error, fontSize: 12, fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )};

  const renderSchedule = () => (
    <View>
      <Text style={st.panelTitle}>Schedule Management</Text>
      <Text style={st.panelSub}>Manage the weekly on-air schedule for all shows.</Text>
      
      <TouchableOpacity style={[st.primaryBtn, { maxWidth: 200, marginBottom: Spacing.lg }]} onPress={() => {
        setEditingSchedule({ day_of_week: 'Monday', time_slot: '', show_name: '', dj_name: '', description: '' });
        setScheduleModal(true);
      }}>
        <Ionicons name="add-circle" size={18} color="#fff" />
        <Text style={st.primaryBtnTxt}>ADD TIME SLOT</Text>
      </TouchableOpacity>

      {scheduleSlots.length === 0 ? (
        <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: 40 }}>No schedule slots yet</Text>
      ) : (
        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.th, { flex: 1 }]}>Day</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Time</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Show</Text>
            <Text style={[st.th, { flex: 1.5 }]}>DJ</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Actions</Text>
          </View>
          {scheduleSlots.map(slot => (
            <View key={slot.schedule_id} style={st.tableRow}>
              <Text style={[st.td, { flex: 1 }]}>{slot.day_of_week}</Text>
              <Text style={[st.td, { flex: 1.5 }]}>{slot.time_slot}</Text>
              <Text style={[st.td, { flex: 1.5, fontWeight: '600', color: '#fff' }]}>{slot.show_name}</Text>
              <Text style={[st.td, { flex: 1.5 }]}>{slot.dj_name}</Text>
              <View style={{ flex: 1.5, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => { setEditingSchedule(slot); setScheduleModal(true); }} style={st.actionBtn}>
                  <Ionicons name="create" size={14} color={Colors.accent} /><Text style={{ color: Colors.accent, fontSize: 12, fontWeight: '600' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteScheduleSlot(slot.schedule_id, slot.show_name)} style={st.deleteBtn}>
                  <Ionicons name="trash" size={14} color={Colors.error} /><Text style={{ color: Colors.error, fontSize: 12, fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderJobApplications = () => (
    <View>
      <Text style={st.panelTitle}>Job Applications</Text>
      <Text style={st.panelSub}>Review and manage job applications from potential team members.</Text>
      
      {jobApplications.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
          <Ionicons name="briefcase-outline" size={60} color={Colors.textMuted} />
          <Text style={{ color: Colors.textMuted, marginTop: 16, fontSize: 16 }}>No applications yet</Text>
        </View>
      ) : (
        <View style={st.table}>
          <View style={st.tableHeader}>
            <Text style={[st.th, { flex: 1.5 }]}>Position</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Name</Text>
            <Text style={[st.th, { flex: 1.5 }]}>Email</Text>
            <Text style={[st.th, { flex: 1 }]}>Phone</Text>
            <Text style={[st.th, { flex: 0.8 }]}>Status</Text>
            <Text style={[st.th, { flex: 1 }]}>Date</Text>
            <Text style={[st.th, { flex: 2 }]}>Actions</Text>
          </View>
          {jobApplications.map(app => (
            <View key={app.application_id} style={st.tableRow}>
              <Text style={[st.td, { flex: 1.5, fontWeight: '600', color: '#fff' }]}>{app.position}</Text>
              <Text style={[st.td, { flex: 1.5 }]}>{app.name}</Text>
              <Text style={[st.td, { flex: 1.5 }]}>{app.email}</Text>
              <Text style={[st.td, { flex: 1 }]}>{app.phone || '—'}</Text>
              <View style={{ flex: 0.8, justifyContent: 'center' }}>
                <View style={[
                  st.statusBadge,
                  app.status === 'approved' && { borderColor: Colors.success },
                  app.status === 'rejected' && { borderColor: Colors.error }
                ]}>
                  <Text style={[
                    st.statusTxt,
                    app.status === 'approved' && { color: Colors.success },
                    app.status === 'rejected' && { color: Colors.error },
                    app.status === 'pending' && { color: Colors.secondary }
                  ]}>
                    {app.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[st.td, { flex: 1 }]}>{new Date(app.created_at).toLocaleDateString()}</Text>
              <View style={{ flex: 2, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                {app.status === 'pending' && (
                  <>
                    <TouchableOpacity onPress={() => handleApproveApplication(app.application_id)} style={[st.actionBtn, { paddingHorizontal: 6 }]}>
                      <Ionicons name="checkmark" size={14} color={Colors.success} /><Text style={{ color: Colors.success, fontSize: 11, fontWeight: '600' }}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRejectApplication(app.application_id)} style={[st.actionBtn, { paddingHorizontal: 6 }]}>
                      <Ionicons name="close" size={14} color={Colors.error} /><Text style={{ color: Colors.error, fontSize: 11, fontWeight: '600' }}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity onPress={() => { setEmailingApplicant(app); setEmailModal(true); }} style={[st.actionBtn, { paddingHorizontal: 6 }]}>
                  <Ionicons name="mail" size={14} color={Colors.accent} /><Text style={{ color: Colors.accent, fontSize: 11, fontWeight: '600' }}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteApplication(app.application_id, app.name)} style={[st.deleteBtn, { paddingHorizontal: 6 }]}>
                  <Ionicons name="trash" size={14} color={Colors.error} /><Text style={{ color: Colors.error, fontSize: 11, fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
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
      case 'manage-news': return renderManageNews();
      case 'comments': return renderComments();
      case 'schedule': return renderSchedule();
      case 'jobs': return renderJobApplications();
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
              <TouchableOpacity key={item.key} testID={`admin-tab-${item.key}`} style={[st.sidebarItem, tab === item.key && st.sidebarItemActive]} onPress={() => { console.log('TAB CLICKED:', item.key); setTab(item.key as AdminTab); }}>
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

        {/* Edit User Modal */}
        <Modal visible={editUserModal} transparent animationType="fade">
          <View style={st.modalOverlay}>
            <View style={st.modalContent}>
              <Text style={st.modalTitle}>Edit User</Text>
              {editingUser && (
                <View>
                  <Text style={st.inputLabel}>NAME</Text>
                  <TextInput style={st.input} value={editingUser.name} onChangeText={(val) => setEditingUser({...editingUser, name: val})} />
                  <Text style={st.inputLabel}>EMAIL</Text>
                  <TextInput style={st.input} value={editingUser.email} onChangeText={(val) => setEditingUser({...editingUser, email: val})} />
                  <Text style={st.inputLabel}>ROLE</Text>
                  <View style={st.catRow}>
                    {['listener', 'editor', 'dj', 'admin'].map(role => (
                      <TouchableOpacity key={role} style={[st.catBtn, editingUser.role === role && st.catActive]} onPress={() => setEditingUser({...editingUser, role})}>
                        <Text style={[st.catTxt, editingUser.role === role && st.catTxtActive]}>{role.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                    <TouchableOpacity style={[st.primaryBtn, { flex: 1 }]} onPress={handleSaveUser}>
                      <Text style={st.primaryBtnTxt}>SAVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[st.deleteBtn, { flex: 1, paddingVertical: 12 }]} onPress={() => { setEditUserModal(false); setEditingUser(null); }}>
                      <Text style={{ color: Colors.error, fontWeight: '700' }}>CANCEL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Edit News Modal */}
        <Modal visible={editNewsModal} transparent animationType="fade">
          <View style={st.modalOverlay}>
            <View style={[st.modalContent, { maxWidth: 600 }]}>
              <Text style={st.modalTitle}>Edit News Article</Text>
              {editingNews && (
                <View>
                  <Text style={st.inputLabel}>TITLE</Text>
                  <TextInput style={st.input} value={editingNews.title} onChangeText={(val) => setEditingNews({...editingNews, title: val})} />
                  <Text style={st.inputLabel}>CONTENT</Text>
                  <TextInput style={[st.input, { height: 140, textAlignVertical: 'top' }]} value={editingNews.content} onChangeText={(val) => setEditingNews({...editingNews, content: val})} multiline />
                  <Text style={st.inputLabel}>CATEGORY</Text>
                  <View style={st.catRow}>
                    {['general', 'music', 'events', 'local', 'contests'].map(cat => (
                      <TouchableOpacity key={cat} style={[st.catBtn, editingNews.category === cat && st.catActive]} onPress={() => setEditingNews({...editingNews, category: cat})}>
                        <Text style={[st.catTxt, editingNews.category === cat && st.catTxtActive]}>{cat.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                    <TouchableOpacity style={[st.primaryBtn, { flex: 1 }]} onPress={handleSaveNews}>
                      <Text style={st.primaryBtnTxt}>SAVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[st.deleteBtn, { flex: 1, paddingVertical: 12 }]} onPress={() => { setEditNewsModal(false); setEditingNews(null); }}>
                      <Text style={{ color: Colors.error, fontWeight: '700' }}>CANCEL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Schedule Modal - Web */}
        <Modal visible={scheduleModal} transparent animationType="fade">
          <View style={st.modalOverlay}>
            <View style={[st.modalContent, { maxWidth: 600 }]}>
              <Text style={st.modalTitle}>{editingSchedule?.schedule_id ? 'Edit' : 'Add'} Time Slot</Text>
              {editingSchedule && (
                <ScrollView>
                  <Text style={st.inputLabel}>DAY OF WEEK</Text>
                  <View style={st.catRow}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <TouchableOpacity key={day} style={[st.catBtn, editingSchedule.day_of_week === day && st.catActive]} onPress={() => setEditingSchedule({...editingSchedule, day_of_week: day})}>
                        <Text style={[st.catTxt, editingSchedule.day_of_week === day && st.catTxtActive]}>{day.substring(0,3).toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={st.inputLabel}>TIME SLOT</Text>
                  <TextInput style={st.input} value={editingSchedule.time_slot} onChangeText={(val) => setEditingSchedule({...editingSchedule, time_slot: val})} placeholder="e.g., 6:00 AM - 9:00 AM" placeholderTextColor={Colors.textMuted} />
                  <Text style={st.inputLabel}>SHOW NAME</Text>
                  <TextInput style={st.input} value={editingSchedule.show_name} onChangeText={(val) => setEditingSchedule({...editingSchedule, show_name: val})} placeholder="Show name" placeholderTextColor={Colors.textMuted} />
                  <Text style={st.inputLabel}>DJ NAME</Text>
                  <TextInput style={st.input} value={editingSchedule.dj_name} onChangeText={(val) => setEditingSchedule({...editingSchedule, dj_name: val})} placeholder="DJ name" placeholderTextColor={Colors.textMuted} />
                  <Text style={st.inputLabel}>DESCRIPTION (OPTIONAL)</Text>
                  <TextInput style={[st.input, { height: 80, textAlignVertical: 'top' }]} value={editingSchedule.description || ''} onChangeText={(val) => setEditingSchedule({...editingSchedule, description: val})} placeholder="Brief description" placeholderTextColor={Colors.textMuted} multiline />
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                    <TouchableOpacity style={[st.primaryBtn, { flex: 1 }]} onPress={handleSaveScheduleSlot}>
                      <Text style={st.primaryBtnTxt}>SAVE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[st.deleteBtn, { flex: 1, paddingVertical: 12 }]} onPress={() => { setScheduleModal(false); setEditingSchedule(null); }}>
                      <Text style={{ color: Colors.error, fontWeight: '700' }}>CANCEL</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Email Modal - Web */}
        <Modal visible={emailModal} transparent animationType="fade">
          <View style={st.modalOverlay}>
            <View style={[st.modalContent, { maxWidth: 600 }]}>
              <Text style={st.modalTitle}>Send Email to Applicant</Text>
              {emailingApplicant && (
                <ScrollView>
                  <Text style={{ color: Colors.textSecondary, marginBottom: 16 }}>To: {emailingApplicant.email}</Text>
                  <Text style={st.inputLabel}>SUBJECT</Text>
                  <TextInput style={st.input} value={emailSubject} onChangeText={setEmailSubject} placeholder="Email subject" placeholderTextColor={Colors.textMuted} />
                  <Text style={st.inputLabel}>MESSAGE</Text>
                  <TextInput style={[st.input, { height: 140, textAlignVertical: 'top' }]} value={emailMessage} onChangeText={setEmailMessage} placeholder="Your message..." placeholderTextColor={Colors.textMuted} multiline />
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                    <TouchableOpacity style={[st.primaryBtn, { flex: 1 }]} onPress={handleSendEmailToApplicant}>
                      <Text style={st.primaryBtnTxt}>SEND EMAIL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[st.deleteBtn, { flex: 1, paddingVertical: 12 }]} onPress={() => { setEmailModal(false); setEmailingApplicant(null); }}>
                      <Text style={{ color: Colors.error, fontWeight: '700' }}>CANCEL</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
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
      
      {/* Mobile Navigation Grid */}
      <View style={st.mNavGrid}>
        {sidebarItems.filter(i => i.roles.includes(user.role)).map(item => (
          <TouchableOpacity 
            key={item.key} 
            testID={`admin-tab-${item.key}`} 
            style={[st.mNavItem, tab === item.key && st.mNavItemActive]} 
            onPress={() => setTab(item.key)}
          >
            <View style={[st.mNavIconWrap, tab === item.key && st.mNavIconWrapActive]}>
              <Ionicons 
                name={item.icon as any} 
                size={22} 
                color={tab === item.key ? '#fff' : Colors.textMuted} 
              />
              {item.key === 'requests' && pendingCount > 0 && (
                <View style={st.mNavBadge}>
                  <Text style={st.mNavBadgeTxt}>{pendingCount}</Text>
                </View>
              )}
            </View>
            <Text style={[st.mNavLabel, tab === item.key && st.mNavLabelActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView style={{ flex: 1, paddingHorizontal: Spacing.lg }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        {renderPanel()}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modals for mobile too */}
      <Modal visible={editUserModal} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <Text style={st.modalTitle}>Edit User</Text>
            {editingUser && (
              <View>
                <Text style={st.inputLabel}>ROLE</Text>
                <View style={st.catRow}>
                  {['listener', 'editor', 'dj', 'admin'].map(role => (
                    <TouchableOpacity key={role} style={[st.catBtn, editingUser.role === role && st.catActive]} onPress={() => setEditingUser({...editingUser, role})}>
                      <Text style={[st.catTxt, editingUser.role === role && st.catTxtActive]}>{role.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <TouchableOpacity style={[st.primaryBtn, { flex: 1 }]} onPress={handleSaveUser}>
                    <Text style={st.primaryBtnTxt}>SAVE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[st.deleteBtn, { flex: 1, paddingVertical: 12 }]} onPress={() => { setEditUserModal(false); setEditingUser(null); }}>
                    <Text style={{ color: Colors.error, fontWeight: '700' }}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={editNewsModal} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <Text style={st.modalTitle}>Edit Article</Text>
            {editingNews && (
              <ScrollView>
                <Text style={st.inputLabel}>TITLE</Text>
                <TextInput style={st.input} value={editingNews.title} onChangeText={(val) => setEditingNews({...editingNews, title: val})} />
                <Text style={st.inputLabel}>CONTENT</Text>
                <TextInput style={[st.input, { height: 140, textAlignVertical: 'top' }]} value={editingNews.content} onChangeText={(val) => setEditingNews({...editingNews, content: val})} multiline />
                <Text style={st.inputLabel}>CATEGORY</Text>
                <View style={st.catRow}>
                  {['general', 'music', 'events', 'local'].map(cat => (
                    <TouchableOpacity key={cat} style={[st.catBtn, editingNews.category === cat && st.catActive]} onPress={() => setEditingNews({...editingNews, category: cat})}>
                      <Text style={[st.catTxt, editingNews.category === cat && st.catTxtActive]}>{cat.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <TouchableOpacity style={[st.primaryBtn, { flex: 1 }]} onPress={handleSaveNews}>
                    <Text style={st.primaryBtnTxt}>SAVE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[st.deleteBtn, { flex: 1, paddingVertical: 12 }]} onPress={() => { setEditNewsModal(false); setEditingNews(null); }}>
                    <Text style={{ color: Colors.error, fontWeight: '700' }}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Schedule Modal */}
      <Modal visible={scheduleModal} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={[st.modalContent, { maxWidth: 600 }]}>
            <Text style={st.modalTitle}>{editingSchedule?.schedule_id ? 'Edit' : 'Add'} Time Slot</Text>
            {editingSchedule && (
              <ScrollView>
                <Text style={st.inputLabel}>DAY OF WEEK</Text>
                <View style={st.catRow}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <TouchableOpacity key={day} style={[st.catBtn, editingSchedule.day_of_week === day && st.catActive]} onPress={() => setEditingSchedule({...editingSchedule, day_of_week: day})}>
                      <Text style={[st.catTxt, editingSchedule.day_of_week === day && st.catTxtActive]}>{day.substring(0,3).toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={st.inputLabel}>TIME SLOT</Text>
                <TextInput style={st.input} value={editingSchedule.time_slot} onChangeText={(val) => setEditingSchedule({...editingSchedule, time_slot: val})} placeholder="e.g., 6:00 AM - 9:00 AM" placeholderTextColor={Colors.textMuted} />
                <Text style={st.inputLabel}>SHOW NAME</Text>
                <TextInput style={st.input} value={editingSchedule.show_name} onChangeText={(val) => setEditingSchedule({...editingSchedule, show_name: val})} placeholder="Show name" placeholderTextColor={Colors.textMuted} />
                <Text style={st.inputLabel}>DJ NAME</Text>
                <TextInput style={st.input} value={editingSchedule.dj_name} onChangeText={(val) => setEditingSchedule({...editingSchedule, dj_name: val})} placeholder="DJ name" placeholderTextColor={Colors.textMuted} />
                <Text style={st.inputLabel}>DESCRIPTION (OPTIONAL)</Text>
                <TextInput style={[st.input, { height: 80, textAlignVertical: 'top' }]} value={editingSchedule.description || ''} onChangeText={(val) => setEditingSchedule({...editingSchedule, description: val})} placeholder="Brief description" placeholderTextColor={Colors.textMuted} multiline />
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <TouchableOpacity style={[st.primaryBtn, { flex: 1 }]} onPress={handleSaveScheduleSlot}>
                    <Text style={st.primaryBtnTxt}>SAVE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[st.deleteBtn, { flex: 1, paddingVertical: 12 }]} onPress={() => { setScheduleModal(false); setEditingSchedule(null); }}>
                    <Text style={{ color: Colors.error, fontWeight: '700' }}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Email Modal */}
      <Modal visible={emailModal} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={[st.modalContent, { maxWidth: 600 }]}>
            <Text style={st.modalTitle}>Send Email to Applicant</Text>
            {emailingApplicant && (
              <ScrollView>
                <Text style={{ color: Colors.textSecondary, marginBottom: 16 }}>To: {emailingApplicant.email}</Text>
                <Text style={st.inputLabel}>SUBJECT</Text>
                <TextInput style={st.input} value={emailSubject} onChangeText={setEmailSubject} placeholder="Email subject" placeholderTextColor={Colors.textMuted} />
                <Text style={st.inputLabel}>MESSAGE</Text>
                <TextInput style={[st.input, { height: 140, textAlignVertical: 'top' }]} value={emailMessage} onChangeText={setEmailMessage} placeholder="Your message..." placeholderTextColor={Colors.textMuted} multiline />
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <TouchableOpacity style={[st.primaryBtn, { flex: 1 }]} onPress={handleSendEmailToApplicant}>
                    <Ionicons name="send" size={16} color="#fff" />
                    <Text style={st.primaryBtnTxt}>SEND</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[st.deleteBtn, { flex: 1, paddingVertical: 12 }]} onPress={() => { setEmailModal(false); setEmailingApplicant(null); setEmailSubject(''); setEmailMessage(''); }}>
                    <Text style={{ color: Colors.error, fontWeight: '700' }}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Schedule & Email Modals for Mobile */}
      <Modal visible={scheduleModal} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <Text style={st.modalTitle}>{editingSchedule?.schedule_id ? 'Edit' : 'Add'} Slot</Text>
            {editingSchedule && (
              <ScrollView>
                <Text style={st.inputLabel}>DAY</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <TouchableOpacity key={day} style={[st.catBtn, editingSchedule.day_of_week === ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i] && st.catActive]} onPress={() => setEditingSchedule({...editingSchedule, day_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]})}>
                      <Text style={[st.catTxt, editingSchedule.day_of_week === ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i] && st.catTxtActive]}>{day.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={st.inputLabel}>TIME</Text>
                <TextInput style={st.input} value={editingSchedule.time_slot} onChangeText={(val) => setEditingSchedule({...editingSchedule, time_slot: val})} placeholder="6:00 AM - 9:00 AM" placeholderTextColor={Colors.textMuted} />
                <Text style={st.inputLabel}>SHOW</Text>
                <TextInput style={st.input} value={editingSchedule.show_name} onChangeText={(val) => setEditingSchedule({...editingSchedule, show_name: val})} placeholder="Show name" placeholderTextColor={Colors.textMuted} />
                <Text style={st.inputLabel}>DJ</Text>
                <TextInput style={st.input} value={editingSchedule.dj_name} onChangeText={(val) => setEditingSchedule({...editingSchedule, dj_name: val})} placeholder="DJ name" placeholderTextColor={Colors.textMuted} />
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <TouchableOpacity style={[st.primaryBtn, { flex: 1 }]} onPress={handleSaveScheduleSlot}>
                    <Text style={st.primaryBtnTxt}>SAVE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[st.deleteBtn, { flex: 1, paddingVertical: 12 }]} onPress={() => { setScheduleModal(false); setEditingSchedule(null); }}>
                    <Text style={{ color: Colors.error, fontWeight: '700' }}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={emailModal} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <Text style={st.modalTitle}>Email Applicant</Text>
            {emailingApplicant && (
              <ScrollView>
                <Text style={{ color: Colors.textSecondary, marginBottom: 12, fontSize: 13 }}>To: {emailingApplicant.email}</Text>
                <Text style={st.inputLabel}>SUBJECT</Text>
                <TextInput style={st.input} value={emailSubject} onChangeText={setEmailSubject} placeholder="Subject" placeholderTextColor={Colors.textMuted} />
                <Text style={st.inputLabel}>MESSAGE</Text>
                <TextInput style={[st.input, { height: 120, textAlignVertical: 'top' }]} value={emailMessage} onChangeText={setEmailMessage} placeholder="Message..." placeholderTextColor={Colors.textMuted} multiline />
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                  <TouchableOpacity style={[st.primaryBtn, { flex: 1 }]} onPress={handleSendEmailToApplicant}>
                    <Text style={st.primaryBtnTxt}>SEND</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[st.deleteBtn, { flex: 1, paddingVertical: 12 }]} onPress={() => { setEmailModal(false); setEmailingApplicant(null); }}>
                    <Text style={{ color: Colors.error, fontWeight: '700' }}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  
  // Mobile Navigation Grid
  mNavGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: Spacing.md, 
    paddingVertical: Spacing.sm,
    gap: 8,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mNavItem: { 
    width: '30%',
    alignItems: 'center', 
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.md,
  },
  mNavItemActive: { 
    backgroundColor: 'rgba(255,0,127,0.15)',
  },
  mNavIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  mNavIconWrapActive: {
    backgroundColor: Colors.primary,
  },
  mNavLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  mNavLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  mNavBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  mNavBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.background,
  },
  
  // Old mobile tabs (keeping for backwards compat)
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
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalContent: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: 24, width: '100%', maxWidth: 500, borderWidth: 1, borderColor: Colors.border },
  modalTitle: { fontSize: 20, fontWeight: '900', color: Colors.primary, marginBottom: 20, letterSpacing: 2 },
});

