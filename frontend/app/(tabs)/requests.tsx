import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getRequestsApi, createRequestApi, getChatApi, sendChatApi
} from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';

export default function RequestsScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'request' | 'chat'>('request');
  const [requests, setRequests] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [message, setMessage] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const loadData = useCallback(async () => {
    const [reqs, msgs] = await Promise.all([getRequestsApi(), getChatApi()]);
    setRequests(reqs);
    setChatMessages(msgs);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (tab === 'chat') {
      const interval = setInterval(async () => {
        const msgs = await getChatApi();
        setChatMessages(msgs);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [tab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSubmitRequest = async () => {
    if (!songTitle.trim()) {
      Alert.alert('Required', 'Please enter a song title');
      return;
    }
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to make a request');
      return;
    }
    setSubmitting(true);
    try {
      await createRequestApi({ song_title: songTitle, artist, message });
      setSongTitle('');
      setArtist('');
      setMessage('');
      await loadData();
      Alert.alert('Sent!', 'Your request has been submitted');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !user) return;
    try {
      await sendChatApi(chatInput);
      setChatInput('');
      const msgs = await getChatApi();
      setChatMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return Colors.accent;
      case 'dj': return Colors.primary;
      case 'editor': return Colors.secondary;
      default: return Colors.textMuted;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>REQUEST LINE</Text>
        <Text style={styles.subtitle}>Make your voice heard</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          testID="tab-request"
          style={[styles.tabBtn, tab === 'request' && styles.tabActive]}
          onPress={() => setTab('request')}
        >
          <Ionicons name="musical-notes" size={16} color={tab === 'request' ? Colors.white : Colors.textMuted} />
          <Text style={[styles.tabText, tab === 'request' && styles.tabTextActive]}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="tab-chat"
          style={[styles.tabBtn, tab === 'chat' && styles.tabActive]}
          onPress={() => setTab('chat')}
        >
          <Ionicons name="chatbubbles" size={16} color={tab === 'chat' ? Colors.white : Colors.textMuted} />
          <Text style={[styles.tabText, tab === 'chat' && styles.tabTextActive]}>Live Chat</Text>
        </TouchableOpacity>
      </View>

      {tab === 'request' ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView
            style={styles.scroll}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          >
            {/* Request Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Drop a Request</Text>
              <Text style={styles.label}>SONG TITLE *</Text>
              <TextInput
                testID="request-song-input"
                style={styles.input}
                value={songTitle}
                onChangeText={setSongTitle}
                placeholder="What do you want to hear?"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.label}>ARTIST</Text>
              <TextInput
                testID="request-artist-input"
                style={styles.input}
                value={artist}
                onChangeText={setArtist}
                placeholder="Who sings it?"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.label}>MESSAGE</Text>
              <TextInput
                testID="request-message-input"
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Shoutout or dedication?"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                testID="submit-request-button"
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmitRequest}
                disabled={submitting}
              >
                <Ionicons name="send" size={18} color={Colors.white} />
                <Text style={styles.submitText}>
                  {submitting ? 'SENDING...' : 'SEND REQUEST'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recent Requests */}
            <Text style={styles.sectionTitle}>RECENT REQUESTS</Text>
            {requests.slice(0, 10).map((req) => (
              <View key={req.request_id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestSong}>{req.song_title}</Text>
                  <View style={[styles.statusBadge, req.status === 'played' && styles.statusPlayed]}>
                    <Text style={styles.statusText}>{req.status?.toUpperCase()}</Text>
                  </View>
                </View>
                {req.artist ? <Text style={styles.requestArtist}>{req.artist}</Text> : null}
                {req.message ? <Text style={styles.requestMsg}>"{req.message}"</Text> : null}
                <Text style={styles.requestBy}>— {req.user_name}</Text>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView
            ref={scrollRef}
            style={styles.chatScroll}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {chatMessages.map((msg) => (
              <View
                key={msg.message_id}
                style={[
                  styles.chatBubble,
                  msg.user_id === user?.user_id && styles.chatBubbleMine,
                ]}
              >
                <View style={styles.chatHeader}>
                  <Text style={[styles.chatName, { color: getRoleBadgeColor(msg.user_role) }]}>
                    {msg.user_name}
                  </Text>
                  {msg.user_role !== 'listener' && (
                    <Text style={[styles.roleBadge, { color: getRoleBadgeColor(msg.user_role) }]}>
                      {msg.user_role?.toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={styles.chatMsg}>{msg.message}</Text>
                <Text style={styles.chatTime}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
          <View style={styles.chatInputRow}>
            <TextInput
              testID="chat-input"
              style={styles.chatInputField}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder={user ? "Type a message..." : "Sign in to chat"}
              placeholderTextColor={Colors.textMuted}
              editable={!!user}
            />
            <TouchableOpacity
              testID="chat-send-button"
              style={styles.chatSendBtn}
              onPress={handleSendChat}
              disabled={!user || !chatInput.trim()}
            >
              <Ionicons name="send" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '900', color: Colors.white, letterSpacing: 3 },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  tabRow: {
    flexDirection: 'row', margin: Spacing.lg,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.round,
    padding: 4,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: BorderRadius.round, gap: 6,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textMuted },
  tabTextActive: { color: Colors.white },
  scroll: { flex: 1, paddingHorizontal: Spacing.lg },
  formCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  formTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginBottom: Spacing.md },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.secondary, letterSpacing: 2, marginBottom: 4, marginTop: Spacing.sm },
  input: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: FontSizes.md, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.round,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginTop: Spacing.lg, gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  submitText: { fontSize: FontSizes.md, fontWeight: '800', color: Colors.white, letterSpacing: 1 },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.secondary, letterSpacing: 3, marginBottom: Spacing.md, marginTop: Spacing.sm },
  requestCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestSong: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.white, flex: 1 },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,240,0,0.15)',
  },
  statusPlayed: { backgroundColor: 'rgba(34,197,94,0.15)' },
  statusText: { fontSize: 9, fontWeight: '800', color: Colors.accent, letterSpacing: 1 },
  requestArtist: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  requestMsg: { fontSize: FontSizes.sm, color: Colors.textMuted, fontStyle: 'italic', marginTop: 4 },
  requestBy: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },
  chatScroll: { flex: 1, paddingHorizontal: Spacing.lg },
  chatBubble: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.sm, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  chatBubbleMine: { alignSelf: 'flex-end', borderColor: 'rgba(255,0,127,0.3)' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  chatName: { fontSize: FontSizes.xs, fontWeight: '700' },
  roleBadge: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  chatMsg: { fontSize: FontSizes.sm, color: Colors.textPrimary, lineHeight: 18 },
  chatTime: { fontSize: 9, color: Colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  chatInputRow: {
    flexDirection: 'row', padding: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.surface, gap: Spacing.sm,
  },
  chatInputField: {
    flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    fontSize: FontSizes.md, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
  chatSendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
});
