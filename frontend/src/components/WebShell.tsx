import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Colors, BorderRadius } from '@/src/theme';

export function useIsWebDesktop() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= 900;
}

export function WebNavBar() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={ns.nav}>
      <View style={ns.inner}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')}>
          <Text style={ns.logo}>THE BEAT <Text style={ns.logo515}>515</Text></Text>
        </TouchableOpacity>
        <View style={ns.links}>
          {[
            { l: 'Home', t: '/(tabs)/home' },
            { l: 'News', t: '/(tabs)/news' },
            { l: 'Request Line', t: '/(tabs)/requests' },
            { l: 'Rewards', t: '/(tabs)/rewards' },
          ].map((n) => (
            <TouchableOpacity key={n.l} onPress={() => router.push(n.t as any)} style={ns.link}>
              <Text style={ns.linkTxt}>{n.l.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={ns.right}>
          {!user ? (
            <TouchableOpacity testID="web-nav-login" onPress={() => router.push('/(auth)/login')} style={ns.loginBtn}>
              <Ionicons name="person" size={14} color="#fff" />
              <Text style={ns.loginTxt}>SIGN IN</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={ns.userBtn}>
              <View style={ns.avatar}>
                <Text style={ns.avatarTxt}>{user.name?.charAt(0)}</Text>
              </View>
              <Text style={ns.userName}>{user.name}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export function WebContainer({ children }: { children: React.ReactNode }) {
  return <View style={ns.container}>{children}</View>;
}

export function WebFooter() {
  return (
    <View style={ns.footer}>
      <View style={ns.footInner}>
        <View style={ns.footCol}>
          <Text style={ns.footBrand}>THE BEAT <Text style={{ color: Colors.primary }}>515</Text></Text>
          <Text style={ns.footTag}>Proud. Loud. Local.</Text>
        </View>
        <View style={ns.footCol}>
          <Text style={ns.footHead}>LISTEN</Text>
          <Text style={ns.footLink}>Live Stream</Text>
          <Text style={ns.footLink}>Show Schedule</Text>
          <Text style={ns.footLink}>Podcasts</Text>
        </View>
        <View style={ns.footCol}>
          <Text style={ns.footHead}>CONNECT</Text>
          <Text style={ns.footLink}>Contact Us</Text>
          <Text style={ns.footLink}>Advertise</Text>
          <Text style={ns.footLink}>Contest Rules</Text>
        </View>
        <View style={ns.footCol}>
          <Text style={ns.footHead}>FOLLOW US</Text>
          <View style={ns.socials}>
            {['logo-instagram', 'logo-twitter', 'logo-facebook', 'logo-tiktok'].map((ic) => (
              <View key={ic} style={ns.socialIcon}>
                <Ionicons name={ic as any} size={18} color={Colors.white} />
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={ns.footBottom}>
        <Text style={ns.footCopy}>&copy; 2026 The Beat 515. All rights reserved.</Text>
      </View>
    </View>
  );
}

const ns = StyleSheet.create({
  nav: {
    backgroundColor: 'rgba(9,9,11,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,0,127,0.15)',
    paddingVertical: 12,
    position: 'sticky' as any,
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1200, alignSelf: 'center', width: '100%',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  logo: { fontSize: 22, fontWeight: '900', color: Colors.primary, letterSpacing: 2 },
  logo515: { color: '#fff' },
  links: { flexDirection: 'row', gap: 32 },
  link: { paddingVertical: 4 },
  linkTxt: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 2 },
  right: { flexDirection: 'row', alignItems: 'center' },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.round,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  loginTxt: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  userBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  userName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  container: { maxWidth: 1200, alignSelf: 'center', width: '100%', paddingHorizontal: 32 },
  footer: {
    marginTop: 64, backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: 'rgba(255,0,127,0.15)',
    paddingTop: 40, paddingBottom: 24,
  },
  footInner: {
    maxWidth: 1200, alignSelf: 'center', width: '100%',
    flexDirection: 'row', paddingHorizontal: 32, gap: 48,
  },
  footCol: { flex: 1 },
  footBrand: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  footTag: { fontSize: 11, color: Colors.secondary, letterSpacing: 3, marginTop: 4 },
  footHead: { fontSize: 11, fontWeight: '800', color: Colors.accent, letterSpacing: 2, marginBottom: 12 },
  footLink: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  socials: { flexDirection: 'row', gap: 10 },
  socialIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  footBottom: {
    maxWidth: 1200, alignSelf: 'center', width: '100%',
    paddingHorizontal: 32, marginTop: 24, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  footCopy: { fontSize: 12, color: Colors.textMuted },
});
