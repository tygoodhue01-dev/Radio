import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform,
  TextInput, Image, useWindowDimensions, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '@/src/theme';
import { getMyFavoritesApi, updateProfileApi, getMyStatsApi } from '@/src/services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function MyProfileScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 900;

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [name, setName] = useState(user?.name || '');

  useEffect(() => {
    loadProfileData();
  }, []);

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

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: { label: string; color: string; icon: string } } = {
      admin: { label: 'STATION ADMIN', color: Colors.accent, icon: 'shield-checkmark' },
      dj: { label: 'ON-AIR TALENT', color: Colors.primary, icon: 'mic' },
      editor: { label: 'NEWS EDITOR', color: Colors.secondary, icon: 'create' },
      listener: { label: 'LISTENER', color: Colors.textMuted, icon: 'headset' }
    };
    return badges[role] || badges.listener;
  };

  if (!user) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.centerContent}>
          <Ionicons name="person-circle-outline" size={80} color={Colors.textMuted} />
          <Text style={s.noAuthTitle}>Sign In Required</Text>
          <Text style={s.noAuthSub}>Sign in to view your profile</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={s.primaryBtnTxt}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const roleBadge = getRoleBadge(user.role);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={s.heroWrapper}>
          <LinearGradient
            colors={[roleBadge.color + '40', Colors.background]}
            style={s.heroGradient}
          />
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={[s.heroContent, isWeb && { maxWidth: 800, alignSelf: 'center' }]}>
            {/* Avatar */}
            <View style={[s.avatarOuter, { borderColor: roleBadge.color }]}>
              <LinearGradient colors={[roleBadge.color, Colors.primary]} style={s.avatarInner}>
                <Text style={s.avatarText}>{user.name?.charAt(0)?.toUpperCase()}</Text>
              </LinearGradient>
            </View>

            {/* Name & Role */}
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

            {/* Role Badge */}
            <View style={[s.roleBadge, { backgroundColor: roleBadge.color + '20', borderColor: roleBadge.color }]}>
              <Ionicons name={roleBadge.icon as any} size={14} color={roleBadge.color} />
              <Text style={[s.roleText, { color: roleBadge.color }]}>{roleBadge.label}</Text>
            </View>

            {/* Bio */}
            {editing ? (
              <TextInput
                style={s.bioInput}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={s.bio}>{user.bio || 'No bio yet. Tap Edit to add one!'}</Text>
            )}

            {/* Edit / Save Button */}
            {editing ? (
              <View style={s.editBtns}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { setEditing(false); setName(user.name || ''); setBio(user.bio || ''); }}>
                  <Text style={s.cancelBtnTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={handleSaveProfile}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={s.saveBtnTxt}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={s.editBtn} onPress={() => setEditing(true)}>
                <Ionicons name="pencil" size={16} color={Colors.primary} />
                <Text style={s.editBtnTxt}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[s.contentArea, isWeb && { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
          {/* Stats Grid */}
          <View style={s.statsGrid}>
            <View style={s.statCard}>
              <Ionicons name="heart" size={24} color={Colors.primary} />
              <Text style={s.statValue}>{favorites.length}</Text>
              <Text style={s.statLabel}>Favorites</Text>
            </View>
            <View style={s.statCard}>
              <Ionicons name="musical-notes" size={24} color={Colors.secondary} />
              <Text style={s.statValue}>{stats.requests_made || 0}</Text>
              <Text style={s.statLabel}>Requests</Text>
            </View>
            <View style={s.statCard}>
              <Ionicons name="star" size={24} color={Colors.accent} />
              <Text style={s.statValue}>{stats.songs_rated || 0}</Text>
              <Text style={s.statLabel}>Rated</Text>
            </View>
            <View style={s.statCard}>
              <Ionicons name="gift" size={24} color={Colors.success} />
              <Text style={s.statValue}>{stats.points || 0}</Text>
              <Text style={s.statLabel}>Points</Text>
            </View>
          </View>

          {/* Favorite Songs */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionTitleRow}>
                <View style={[s.sectionDot, { backgroundColor: Colors.primary }]} />
                <Text style={s.sectionTitle}>FAVORITE SONGS</Text>
              </View>
              <Text style={s.sectionCount}>{favorites.length} songs</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
            ) : favorites.length > 0 ? (
              <View style={s.favoritesList}>
                {favorites.slice(0, 10).map((fav, idx) => (
                  <View key={fav.song_id || idx} style={s.favoriteCard}>
                    <View style={s.favRank}>
                      <Text style={s.favRankTxt}>{idx + 1}</Text>
                    </View>
                    <View style={s.favInfo}>
                      <Text style={s.favSong} numberOfLines={1}>{fav.song_title}</Text>
                      <Text style={s.favArtist} numberOfLines={1}>{fav.artist}</Text>
                    </View>
                    <Ionicons name="heart" size={18} color={Colors.primary} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={s.emptyState}>
                <Ionicons name="heart-outline" size={48} color={Colors.textMuted} />
                <Text style={s.emptyText}>No favorites yet</Text>
                <Text style={s.emptySub}>Tap the ❤️ button on songs you love!</Text>
              </View>
            )}
          </View>

          {/* Staff Section - Only for DJs/Admins */}
          {(user.role === 'dj' || user.role === 'admin') && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={s.sectionTitleRow}>
                  <View style={[s.sectionDot, { backgroundColor: Colors.secondary }]} />
                  <Text style={s.sectionTitle}>STAFF INFO</Text>
                </View>
              </View>
              <View style={s.staffCard}>
                <View style={s.staffRow}>
                  <Ionicons name="radio" size={20} color={Colors.secondary} />
                  <View style={s.staffInfo}>
                    <Text style={s.staffLabel}>On-Air Status</Text>
                    <Text style={s.staffValue}>Available</Text>
                  </View>
                </View>
                <View style={s.staffRow}>
                  <Ionicons name="calendar" size={20} color={Colors.secondary} />
                  <View style={s.staffInfo}>
                    <Text style={s.staffLabel}>Next Show</Text>
                    <Text style={s.staffValue}>Check schedule</Text>
                  </View>
                </View>
                <TouchableOpacity style={s.dashboardBtn} onPress={() => router.push('/admin')}>
                  <Ionicons name="grid" size={18} color="#fff" />
                  <Text style={s.dashboardBtnTxt}>Go to Dashboard</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionTitleRow}>
                <View style={[s.sectionDot, { backgroundColor: Colors.accent }]} />
                <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
              </View>
            </View>
            <View style={s.actionsGrid}>
              <TouchableOpacity style={s.actionCard} onPress={() => router.push('/(tabs)/requests')}>
                <Ionicons name="musical-notes" size={28} color={Colors.primary} />
                <Text style={s.actionLabel}>Request Song</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionCard} onPress={() => router.push('/(tabs)/rewards')}>
                <Ionicons name="gift" size={28} color={Colors.accent} />
                <Text style={s.actionLabel}>Rewards</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionCard} onPress={() => router.push('/charts')}>
                <Ionicons name="trending-up" size={28} color={Colors.secondary} />
                <Text style={s.actionLabel}>Charts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionCard} onPress={() => router.push('/schedule')}>
                <Ionicons name="calendar" size={28} color={Colors.success} />
                <Text style={s.actionLabel}>Schedule</Text>
              </TouchableOpacity>
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
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  noAuthTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: '#fff', marginTop: Spacing.lg },
  noAuthSub: { fontSize: FontSizes.md, color: Colors.textMuted, marginTop: Spacing.sm },
  primaryBtn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: BorderRadius.round, marginTop: Spacing.xl },
  primaryBtnTxt: { color: '#fff', fontWeight: '700', fontSize: FontSizes.md, letterSpacing: 1 },

  heroWrapper: { position: 'relative' },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  backBtn: { position: 'absolute', top: Spacing.lg, left: Spacing.lg, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg },

  avatarOuter: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, padding: 4 },
  avatarInner: { flex: 1, borderRadius: 56, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 48, fontWeight: '900', color: '#fff' },

  userName: { fontSize: FontSizes.xxl, fontWeight: '800', color: '#fff', marginTop: Spacing.md },
  userEmail: { fontSize: FontSizes.md, color: Colors.textSecondary, marginTop: 4 },
  nameInput: { fontSize: FontSizes.xxl, fontWeight: '800', color: '#fff', marginTop: Spacing.md, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: Colors.primary, paddingVertical: 8, minWidth: 200 },

  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.round, borderWidth: 1, marginTop: Spacing.md },
  roleText: { fontSize: FontSizes.xs, fontWeight: '800', letterSpacing: 1 },

  bio: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.lg, paddingHorizontal: Spacing.xl, lineHeight: 22 },
  bioInput: { fontSize: FontSizes.md, color: '#fff', textAlign: 'center', marginTop: Spacing.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, minHeight: 80, width: '100%', maxWidth: 400 },

  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.round, backgroundColor: 'rgba(255,0,127,0.15)', borderWidth: 1, borderColor: Colors.primary, marginTop: Spacing.lg },
  editBtnTxt: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.primary },
  editBtns: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.round, backgroundColor: Colors.surface },
  cancelBtnTxt: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.round, backgroundColor: Colors.primary },
  saveBtnTxt: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff' },

  contentArea: { paddingHorizontal: Spacing.lg },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: -40 },
  statCard: { flex: 1, minWidth: 80, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: FontSizes.xl, fontWeight: '800', color: '#fff', marginTop: Spacing.xs },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },

  section: { marginTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionDot: { width: 4, height: 16, borderRadius: 2 },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 2 },
  sectionCount: { fontSize: FontSizes.xs, color: Colors.textMuted },

  favoritesList: { gap: Spacing.sm },
  favoriteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  favRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  favRankTxt: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.primary },
  favInfo: { flex: 1, marginLeft: Spacing.md },
  favSong: { fontSize: FontSizes.md, fontWeight: '700', color: '#fff' },
  favArtist: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },

  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border },
  emptyText: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.md },
  emptySub: { fontSize: FontSizes.sm, color: Colors.textMuted, marginTop: 4 },

  staffCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.borderCyan },
  staffRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  staffInfo: { flex: 1 },
  staffLabel: { fontSize: FontSizes.xs, color: Colors.textMuted },
  staffValue: { fontSize: FontSizes.md, fontWeight: '600', color: '#fff', marginTop: 2 },
  dashboardBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.secondary, borderRadius: BorderRadius.round, paddingVertical: 12, marginTop: Spacing.md },
  dashboardBtnTxt: { fontSize: FontSizes.sm, fontWeight: '700', color: '#fff' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: { flex: 1, minWidth: 80, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  actionLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600', marginTop: Spacing.sm, textAlign: 'center' },
});
