import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
  Modal, Animated, Dimensions, TextInput, Alert, Pressable, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { getMyFavoritesApi, getMyStatsApi, updateProfileApi } from '@/src/services/api';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ visible, onClose }: ProfileDrawerProps) {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const slideAnim = React.useRef(new Animated.Value(400)).current;

  const [favorites, setFavorites] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showAvatarInput, setShowAvatarInput] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      
      if (user) {
        setName(user.name || '');
        setBio(user.bio || '');
        setAvatarUrl(user.avatar_url || '');
        loadProfileData();
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, user]);

  const loadProfileData = async () => {
    try {
      const [favs, userStats] = await Promise.all([
        getMyFavoritesApi().catch(() => []),
        getMyStatsApi().catch(() => ({}))
      ]);
      setFavorites(favs);
      setStats(userStats);
    } catch (e) {
      console.error('Failed to load profile data:', e);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileApi({ name, bio, avatar_url: avatarUrl || undefined });
      await refreshUser?.();
      setEditing(false);
      setShowAvatarInput(false);
      alert('Profile updated!');
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      onClose();
      router.replace('/(tabs)/home');
    }
  };

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path as any);
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

  if (!user) return null;

  const roleBadge = getRoleBadge(user.role);
  const displayAvatarUrl = avatarUrl || user.avatar_url;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={s.backdrop} onPress={onClose}>
        <Animated.View style={[s.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false} style={s.scrollContent}>
              {/* Header */}
              <View style={s.header}>
                <Text style={s.headerTitle}>Profile</Text>
                <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Profile Card */}
              <View style={s.profileCard}>
                <LinearGradient
                  colors={[roleBadge.color + '30', 'transparent']}
                  style={s.profileGradient}
                />
                
                <View style={s.profileRow}>
                  {/* Avatar with edit option */}
                  <TouchableOpacity 
                    style={[s.avatarContainer, { borderColor: roleBadge.color }]}
                    onPress={() => setShowAvatarInput(!showAvatarInput)}
                  >
                    {displayAvatarUrl ? (
                      <Image source={{ uri: displayAvatarUrl }} style={s.avatarImage} />
                    ) : (
                      <LinearGradient colors={[roleBadge.color, Colors.primary]} style={s.avatarFallback}>
                        <Text style={s.avatarText}>{user.name?.charAt(0)?.toUpperCase()}</Text>
                      </LinearGradient>
                    )}
                    <View style={s.avatarEditBadge}>
                      <Ionicons name="camera" size={12} color="#fff" />
                    </View>
                  </TouchableOpacity>
                  
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
                      <Ionicons name={roleBadge.icon as any} size={10} color={roleBadge.color} />
                      <Text style={[s.roleText, { color: roleBadge.color }]}>{roleBadge.label}</Text>
                    </View>
                  </View>
                </View>

                {/* Avatar URL Input */}
                {showAvatarInput && (
                  <View style={s.avatarInputSection}>
                    <Text style={s.inputLabel}>Profile Photo URL</Text>
                    <TextInput
                      style={s.avatarInput}
                      value={avatarUrl}
                      onChangeText={setAvatarUrl}
                      placeholder="https://example.com/your-photo.jpg"
                      placeholderTextColor={Colors.textMuted}
                      autoCapitalize="none"
                    />
                    <Text style={s.inputHint}>Paste a link to your profile photo (Imgur, Discord, etc.)</Text>
                  </View>
                )}

                {/* Bio */}
                {editing ? (
                  <View style={s.bioEditSection}>
                    <Text style={s.inputLabel}>Bio</Text>
                    <TextInput
                      style={s.bioInput}
                      value={bio}
                      onChangeText={setBio}
                      placeholder="Tell us about yourself..."
                      placeholderTextColor={Colors.textMuted}
                      multiline
                      numberOfLines={2}
                    />
                    <View style={s.editActions}>
                      <TouchableOpacity style={s.cancelBtn} onPress={() => { 
                        setEditing(false); 
                        setShowAvatarInput(false);
                        setName(user.name || ''); 
                        setBio(user.bio || ''); 
                        setAvatarUrl(user.avatar_url || '');
                      }}>
                        <Text style={s.cancelBtnTxt}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.saveBtn} onPress={handleSaveProfile}>
                        <Text style={s.saveBtnTxt}>Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={s.bioRow}>
                    <Text style={s.bio} numberOfLines={2}>{user.bio || 'No bio yet'}</Text>
                    <TouchableOpacity style={s.editBtn} onPress={() => setEditing(true)}>
                      <Ionicons name="pencil" size={14} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Stats */}
              <View style={s.statsRow}>
                <View style={s.statItem}>
                  <Ionicons name="heart" size={16} color={Colors.primary} />
                  <Text style={s.statValue}>{stats.favorites || favorites.length || 0}</Text>
                  <Text style={s.statLabel}>Favorites</Text>
                </View>
                <View style={s.statItem}>
                  <Ionicons name="musical-notes" size={16} color={Colors.secondary} />
                  <Text style={s.statValue}>{stats.requests_made || 0}</Text>
                  <Text style={s.statLabel}>Requests</Text>
                </View>
                <View style={s.statItem}>
                  <Ionicons name="star" size={16} color={Colors.accent} />
                  <Text style={s.statValue}>{stats.songs_rated || 0}</Text>
                  <Text style={s.statLabel}>Rated</Text>
                </View>
                <View style={s.statItem}>
                  <Ionicons name="gift" size={16} color={Colors.success} />
                  <Text style={s.statValue}>{stats.points || 0}</Text>
                  <Text style={s.statLabel}>Points</Text>
                </View>
              </View>

              {/* Favorites */}
              {favorites.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>MY FAVORITES</Text>
                  {favorites.slice(0, 4).map((fav, idx) => (
                    <View key={fav.song_id || idx} style={s.favItem}>
                      <Ionicons name="heart" size={14} color={Colors.primary} />
                      <Text style={s.favSong} numberOfLines={1}>{fav.song_title}</Text>
                      <Text style={s.favArtist} numberOfLines={1}>{fav.artist}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Quick Links */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
                
                {(user.role === 'admin' || user.role === 'dj' || user.role === 'editor') && (
                  <TouchableOpacity style={s.linkItem} onPress={() => handleNavigate('/admin')}>
                    <Ionicons name="grid" size={18} color={Colors.primary} />
                    <Text style={s.linkText}>Dashboard</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={s.linkItem} onPress={() => handleNavigate('/(tabs)/requests')}>
                  <Ionicons name="musical-notes" size={18} color={Colors.secondary} />
                  <Text style={s.linkText}>Request a Song</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity style={s.linkItem} onPress={() => handleNavigate('/(tabs)/rewards')}>
                  <Ionicons name="gift" size={18} color={Colors.accent} />
                  <Text style={s.linkText}>Rewards</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity style={s.linkItem} onPress={() => handleNavigate('/schedule')}>
                  <Ionicons name="calendar" size={18} color="#8b5cf6" />
                  <Text style={s.linkText}>Show Schedule</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Sign Out */}
              <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                <Text style={s.logoutTxt}>Sign Out</Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: Math.min(380, screenWidth * 0.9),
    height: '100%',
    backgroundColor: Colors.background,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  scrollContent: {
    flex: 1,
    padding: Spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: '#fff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile Card
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  profileGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: '#fff',
  },
  userEmail: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  nameInput: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Avatar Input
  avatarInputSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  avatarInput: {
    fontSize: FontSizes.sm,
    color: '#fff',
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  inputHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Bio
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 8,
  },
  bio: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bioEditSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bioInput: {
    fontSize: FontSizes.sm,
    color: '#fff',
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    minHeight: 60,
    backgroundColor: Colors.background,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surfaceLight,
  },
  cancelBtnTxt: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
  },
  saveBtnTxt: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#fff',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    marginRight: 1,
    borderRadius: BorderRadius.sm,
  },
  statValue: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Sections
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },

  // Favorites
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  favSong: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: '#fff',
  },
  favArtist: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    maxWidth: 100,
  },

  // Links
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  linkText: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#fff',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.xl,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  logoutTxt: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.error,
  },
});
