import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
  useWindowDimensions, ActivityIndicator, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { getMyFavoritesApi, getMyStatsApi, updateProfileApi } from '@/src/services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 768;

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      loadProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [favs, userStats] = await Promise.all([
        getMyFavoritesApi().catch(() => []),
        getMyStatsApi().catch(() => ({}))
      ]);
      setFavorites(favs);
      setStats(userStats);
    } catch (e) {
      console.error('Failed to load profile data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileApi({ name, bio });
      await refreshUser?.();
      setEditing(false);
      Platform.OS === 'web' ? alert('Profile updated!') : Alert.alert('Success', 'Profile updated!');
    } catch (e: any) {
      Platform.OS === 'web' ? alert(e.message) : Alert.alert('Error', e.message);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        logout();
        router.replace('/(tabs)/home');
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(tabs)/home'); } }
      ]);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: { label: string; color: string; icon: string } } = {
      admin: { label: 'ADMIN', color: Colors.accent, icon: 'shield-checkmark' },
      dj: { label: 'DJ', color: Colors.primary, icon: 'mic' },
      editor: { label: 'EDITOR', color: Colors.secondary, icon: 'create' },
      listener: { label: 'LISTENER', color: Colors.textMuted, icon: 'headset' }
    };
    return badges[role] || badges.listener;
  };

  // Not logged in
  if (!user) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.notAuth}>
          <View style={s.notAuthIcon}>
            <Ionicons name="person-circle-outline" size={80} color={Colors.textMuted} />
          </View>
          <Text style={s.notAuthTitle}>Not Signed In</Text>
          <Text style={s.notAuthSub}>Sign in to access your profile, favorites, and more</Text>
          <TouchableOpacity testID="profile-login-btn" style={s.signInBtn} onPress={() => router.push('/(auth)/login')}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={s.signInBtnTxt}>SIGN IN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.createAccBtn} onPress={() => router.push('/(auth)/register')}>
            <Text style={s.createAccTxt}>Create an Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const roleBadge = getRoleBadge(user.role);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={[s.container, isWeb && s.containerWeb]}>
          
          {/* Header Card */}
          <View style={s.headerCard}>
            <LinearGradient
              colors={[roleBadge.color + '30', 'transparent']}
              style={s.headerGradient}
            />
            
            {/* Avatar & Info Row */}
            <View style={s.profileRow}>
              <View style={[s.avatar, { borderColor: roleBadge.color }]}>
                <Text style={s.avatarText}>{user.name?.charAt(0)?.toUpperCase()}</Text>
              </View>
              
              <View style={s.profileInfo}>
                {editing ? (
                  <TextInput
                    style={s.nameInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={Colors.textMuted}
                  />
                ) : (
                  <Text style={s.userName}>{user.name}</Text>
                )}
                <Text style={s.userEmail}>{user.email}</Text>
                <View style={[s.roleBadge, { backgroundColor: roleBadge.color + '20', borderColor: roleBadge.color }]}>
                  <Ionicons name={roleBadge.icon as any} size={12} color={roleBadge.color} />
                  <Text style={[s.roleText, { color: roleBadge.color }]}>{roleBadge.label}</Text>
                </View>
              </View>
              
              {!editing && (
                <TouchableOpacity style={s.editIconBtn} onPress={() => setEditing(true)}>
                  <Ionicons name="pencil" size={18} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Bio Section */}
            {editing ? (
              <View style={s.bioEditSection}>
                <TextInput
                  style={s.bioInput}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
                <View style={s.editActions}>
                  <TouchableOpacity style={s.cancelBtn} onPress={() => { setEditing(false); setName(user.name || ''); setBio(user.bio || ''); }}>
                    <Text style={s.cancelBtnTxt}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.saveBtn} onPress={handleSaveProfile}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={s.saveBtnTxt}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : user.bio ? (
              <Text style={s.bio}>{user.bio}</Text>
            ) : null}
          </View>

          {/* Stats Row */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Ionicons name="heart" size={20} color={Colors.primary} />
              <Text style={s.statValue}>{stats.favorites || favorites.length || 0}</Text>
              <Text style={s.statLabel}>Favorites</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Ionicons name="musical-notes" size={20} color={Colors.secondary} />
              <Text style={s.statValue}>{stats.requests_made || 0}</Text>
              <Text style={s.statLabel}>Requests</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Ionicons name="star" size={20} color={Colors.accent} />
              <Text style={s.statValue}>{stats.songs_rated || 0}</Text>
              <Text style={s.statLabel}>Rated</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Ionicons name="gift" size={20} color={Colors.success} />
              <Text style={s.statValue}>{stats.points || 0}</Text>
              <Text style={s.statLabel}>Points</Text>
            </View>
          </View>

          {/* Favorites Section */}
          {favorites.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Ionicons name="heart" size={18} color={Colors.primary} />
                <Text style={s.sectionTitle}>MY FAVORITES</Text>
                <Text style={s.sectionCount}>{favorites.length}</Text>
              </View>
              {favorites.slice(0, 5).map((fav, idx) => (
                <View key={fav.song_id || idx} style={s.favItem}>
                  <View style={s.favRank}><Text style={s.favRankTxt}>{idx + 1}</Text></View>
                  <View style={s.favInfo}>
                    <Text style={s.favSong} numberOfLines={1}>{fav.song_title}</Text>
                    <Text style={s.favArtist} numberOfLines={1}>{fav.artist}</Text>
                  </View>
                  <Ionicons name="heart" size={16} color={Colors.primary} />
                </View>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="apps" size={18} color={Colors.secondary} />
              <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
            </View>
            
            {/* Staff Dashboard */}
            {(user.role === 'admin' || user.role === 'dj' || user.role === 'editor') && (
              <TouchableOpacity style={s.menuItem} onPress={() => router.push('/admin')}>
                <View style={[s.menuIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <Ionicons name="grid" size={20} color={Colors.primary} />
                </View>
                <View style={s.menuInfo}>
                  <Text style={s.menuTitle}>Dashboard</Text>
                  <Text style={s.menuSub}>Manage station content</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={s.menuItem} onPress={() => router.push('/(tabs)/requests')}>
              <View style={[s.menuIcon, { backgroundColor: Colors.secondary + '20' }]}>
                <Ionicons name="musical-notes" size={20} color={Colors.secondary} />
              </View>
              <View style={s.menuInfo}>
                <Text style={s.menuTitle}>Request a Song</Text>
                <Text style={s.menuSub}>Get your favorite songs on air</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={s.menuItem} onPress={() => router.push('/(tabs)/rewards')}>
              <View style={[s.menuIcon, { backgroundColor: Colors.accent + '20' }]}>
                <Ionicons name="gift" size={20} color={Colors.accent} />
              </View>
              <View style={s.menuInfo}>
                <Text style={s.menuTitle}>Rewards</Text>
                <Text style={s.menuSub}>Redeem points for prizes</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={s.menuItem} onPress={() => router.push('/schedule')}>
              <View style={[s.menuIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                <Ionicons name="calendar" size={20} color="#8b5cf6" />
              </View>
              <View style={s.menuInfo}>
                <Text style={s.menuTitle}>Show Schedule</Text>
                <Text style={s.menuSub}>See what's coming up</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity testID="logout-button" style={s.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={s.logoutTxt}>Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  container: { padding: Spacing.lg },
  containerWeb: { maxWidth: 600, alignSelf: 'center', width: '100%', paddingTop: 40 },

  // Not Authenticated
  notAuth: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  notAuthIcon: { marginBottom: Spacing.lg },
  notAuthTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: '#fff' },
  notAuthSub: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, maxWidth: 280 },
  signInBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: BorderRadius.round, marginTop: Spacing.xl },
  signInBtnTxt: { color: '#fff', fontWeight: '700', fontSize: FontSizes.md, letterSpacing: 1 },
  createAccBtn: { marginTop: Spacing.lg },
  createAccTxt: { color: Colors.secondary, fontWeight: '600', fontSize: FontSizes.md },

  // Header Card
  headerCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', position: 'relative' },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  profileInfo: { flex: 1 },
  userName: { fontSize: FontSizes.xl, fontWeight: '800', color: '#fff' },
  userEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  nameInput: { fontSize: FontSizes.xl, fontWeight: '800', color: '#fff', borderBottomWidth: 2, borderBottomColor: Colors.primary, paddingVertical: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.round, borderWidth: 1, alignSelf: 'flex-start', marginTop: Spacing.sm },
  roleText: { fontSize: FontSizes.xs, fontWeight: '800', letterSpacing: 1 },
  editIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  bio: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: Spacing.md, lineHeight: 22 },
  bioEditSection: { marginTop: Spacing.md },
  bioInput: { fontSize: FontSizes.md, color: '#fff', padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, minHeight: 80, textAlignVertical: 'top' },
  editActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.round, backgroundColor: Colors.surfaceLight },
  cancelBtnTxt: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.round, backgroundColor: Colors.primary },
  saveBtnTxt: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff' },

  // Stats Row
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSizes.lg, fontWeight: '800', color: '#fff', marginTop: 4 },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },

  // Sections
  section: { marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 2, flex: 1 },
  sectionCount: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textMuted },

  // Favorites
  favItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  favRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  favRankTxt: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.primary },
  favInfo: { flex: 1, marginLeft: Spacing.md },
  favSong: { fontSize: FontSizes.md, fontWeight: '700', color: '#fff' },
  favArtist: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },

  // Menu Items
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuInfo: { flex: 1, marginLeft: Spacing.md },
  menuTitle: { fontSize: FontSizes.md, fontWeight: '700', color: '#fff' },
  menuSub: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.error + '40' },
  logoutTxt: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.error },
});
