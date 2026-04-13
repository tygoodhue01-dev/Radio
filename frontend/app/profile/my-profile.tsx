import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function MyProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [favoriteGenre, setFavoriteGenre] = useState(user?.favorite_genre || '');
  const [stats, setStats] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadFavorites();
  }, []);

  const loadProfile = async () => {
    try {
      const token = user?.access_token;
      const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setName(data.name || '');
        setBio(data.bio || '');
        setLocation(data.location || '');
        setFavoriteGenre(data.favorite_genre || '');
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  };

  const loadFavorites = async () => {
    try {
      const token = user?.access_token;
      const res = await fetch(`${API_BASE}/api/users/me/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
  };

  const saveProfile = async () => {
    try {
      const token = user?.access_token;
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, bio, location, favorite_genre: favoriteGenre })
      });
      
      if (res.ok) {
        Alert.alert('Success', 'Profile updated!');
        setEditing(false);
        loadProfile();
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={editing ? saveProfile : () => setEditing(true)} style={styles.editBtn}>
          <Ionicons name={editing ? 'checkmark' : 'create-outline'} size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color={Colors.primary} />
          </View>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.userRole}>{user?.role || 'listener'}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="heart" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{stats?.favorite_songs || 0}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{stats?.total_ratings || 0}</Text>
            <Text style={styles.statLabel}>Ratings</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color={Colors.secondary} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
              />
            ) : (
              <Text style={styles.value}>{name || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            {editing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.value}>{bio || 'No bio yet'}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="City, State"
                placeholderTextColor={Colors.textMuted}
              />
            ) : (
              <Text style={styles.value}>{location || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Favorite Genre</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={favoriteGenre}
                onChangeText={setFavoriteGenre}
                placeholder="e.g. Pop, Rock, Hip-Hop"
                placeholderTextColor={Colors.textMuted}
              />
            ) : (
              <Text style={styles.value}>{favoriteGenre || 'Not set'}</Text>
            )}
          </View>
        </View>

        {/* Favorite Songs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Songs ({favorites.length})</Text>
          {favorites.slice(0, 5).map((fav, index) => (
            <View key={index} style={styles.favSong}>
              <Ionicons name="heart" size={16} color={Colors.primary} />
              <View style={styles.favInfo}>
                <Text style={styles.favTitle}>{fav.song_title}</Text>
                <Text style={styles.favArtist}>{fav.artist}</Text>
              </View>
            </View>
          ))}
          {favorites.length === 0 && (
            <Text style={styles.emptyText}>No favorite songs yet. Start liking songs!</Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/charts')}>
            <Ionicons name="stats-chart" size={20} color={Colors.secondary} />
            <Text style={styles.actionText}>View Charts</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/recently-played')}>
            <Ionicons name="time" size={20} color={Colors.secondary} />
            <Text style={styles.actionText}>Recently Played</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ff4444" />
            <Text style={[styles.actionText, { color: '#ff4444' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
  editBtn: {
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
  scroll: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,0,127,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  userName: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.white,
    marginTop: Spacing.md,
  },
  userRole: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: 4,
  },
  statsSection: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
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
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  value: {
    fontSize: FontSizes.md,
    color: Colors.white,
    paddingVertical: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  favSong: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  favInfo: {
    flex: 1,
  },
  favTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
  },
  favArtist: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  actionText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.white,
    fontWeight: '600',
  },
  logoutBtn: {
    borderBottomWidth: 0,
    marginTop: Spacing.md,
  },
});
