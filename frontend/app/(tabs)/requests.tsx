import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { getRequestsApi, createRequestApi, getChatApi, sendChatApi } from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { WebNavBar, WebContainer, WebFooter, useIsWebDesktop } from '@/src/components/WebShell';

export default function RequestsScreen() {
  const { user } = useAuth();
  const isWeb = useIsWebDesktop();
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

  const loadData = useCallback(async () => { const [r, m] = await Promise.all([getRequestsApi(), getChatApi()]); setRequests(r); setChatMessages(m); }, []);
  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (tab === 'chat') { const i = setInterval(async () => { setChatMessages(await getChatApi()); }, 5000); return () => clearInterval(i); } }, [tab]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const handleSubmitRequest = async () => {
    if (!songTitle.trim()) { Alert.alert('Required', 'Please enter a song title'); return; }
    if (!user) { Alert.alert('Sign In Required', 'Please sign in to make a request'); return; }
    setSubmitting(true);
    try { await createRequestApi({ song_title: songTitle, artist, message }); setSongTitle(''); setArtist(''); setMessage(''); await loadData(); Alert.alert('Sent!', 'Your request has been submitted'); } catch (e: any) { Alert.alert('Error', e.message); } finally { setSubmitting(false); }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !user) return;
    try { await sendChatApi(chatInput); setChatInput(''); setChatMessages(await getChatApi()); setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100); } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const getRoleBadgeColor = (role: string) => { switch (role) { case 'admin': return Colors.accent; case 'dj': return Colors.primary; case 'editor': return Colors.secondary; default: return Colors.textMuted; } };

  const content = (
    <View style={isWeb ? { flexDirection: 'row', gap: 32, paddingTop: 40, paddingBottom: 40 } : undefined}>
      {/* Request Form */}
      <View style={isWeb ? { flex: 1 } : undefined}>
        <Text style={[st.title, isWeb && { fontSize: 32 }]}>REQUEST LINE</Text>
        <Text style={st.subtitle}>Make your voice heard on The Beat 515</Text>
        <View style={[st.formCard, isWeb && { marginTop: 24 }]}>
          <Text style={st.formTitle}>Drop a Request</Text>
          <Text style={st.label}>SONG TITLE *</Text>
          <TextInput testID="request-song-input" style={st.input} value={songTitle} onChangeText={setSongTitle} placeholder="What do you want to hear?" placeholderTextColor={Colors.textMuted} />
          <Text style={st.label}>ARTIST</Text>
          <TextInput testID="request-artist-input" style={st.input} value={artist} onChangeText={setArtist} placeholder="Who sings it?" placeholderTextColor={Colors.textMuted} />
          <Text style={st.label}>MESSAGE</Text>
          <TextInput testID="request-message-input" style={[st.input, { height: 80, textAlignVertical: 'top' }]} value={message} onChangeText={setMessage} placeholder="Shoutout or dedication?" placeholderTextColor={Colors.textMuted} multiline />
          <TouchableOpacity testID="submit-request-button" style={[st.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmitRequest} disabled={submitting}>
            <Ionicons name="send" size={18} color="#fff" /><Text style={st.submitText}>{submitting ? 'SENDING...' : 'SEND REQUEST'}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent requests */}
        <Text style={[st.secTitle, { marginTop: 24 }]}>RECENT REQUESTS</Text>
        {requests.slice(0, 8).map((req) => (
          <View key={req.request_id} style={st.reqCard}>
            <View style={st.reqHeader}><Text style={st.reqSong}>{req.song_title}</Text><View style={[st.statusBadge, req.status === 'played' && st.statusPlayed]}><Text style={st.statusText}>{req.status?.toUpperCase()}</Text></View></View>
            {req.artist ? <Text style={st.reqArtist}>{req.artist}</Text> : null}
            {req.message ? <Text style={st.reqMsg}>"{req.message}"</Text> : null}
            <Text style={st.reqBy}>— {req.user_name}</Text>
          </View>
        ))}
      </View>

      {/* Live Chat */}
      <View style={isWeb ? { flex: 1 } : { marginTop: 24 }}>
        <Text style={[st.secTitle, isWeb && { marginTop: 0 }]}>LIVE CHAT</Text>
        <View style={[st.chatBox, isWeb && { height: 500 }]}>
          <ScrollView ref={scrollRef} style={{ flex: 1, padding: 12 }} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            {chatMessages.map((msg) => (
              <View key={msg.message_id} style={[st.chatBubble, msg.user_id === user?.user_id && st.chatBubbleMine]}>
                <View style={st.chatHeader}><Text style={[st.chatName, { color: getRoleBadgeColor(msg.user_role) }]}>{msg.user_name}</Text>{msg.user_role !== 'listener' && <Text style={[st.roleBadge, { color: getRoleBadgeColor(msg.user_role) }]}>{msg.user_role?.toUpperCase()}</Text>}</View>
                <Text style={st.chatMsg}>{msg.message}</Text>
                <Text style={st.chatTime}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={st.chatInputRow}>
            <TextInput testID="chat-input" style={st.chatInputField} value={chatInput} onChangeText={setChatInput} placeholder={user ? "Type a message..." : "Sign in to chat"} placeholderTextColor={Colors.textMuted} editable={!!user} />
            <TouchableOpacity testID="chat-send-button" style={st.chatSendBtn} onPress={handleSendChat} disabled={!user || !chatInput.trim()}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (isWeb) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        <WebNavBar />
        <WebContainer>{content}</WebContainer>
        <WebFooter />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, paddingHorizontal: Spacing.lg }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
          <View style={{ paddingTop: Spacing.md }}>{content}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSizes.xxl, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  formCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.md },
  formTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: '#fff', marginBottom: Spacing.md },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.secondary, letterSpacing: 2, marginBottom: 4, marginTop: Spacing.sm },
  input: { backgroundColor: Colors.background, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSizes.md, color: '#fff', borderWidth: 1, borderColor: Colors.border },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.round, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg, gap: 8 },
  submitText: { fontSize: FontSizes.md, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  secTitle: { fontSize: FontSizes.xs, fontWeight: '800', color: Colors.secondary, letterSpacing: 3, marginBottom: Spacing.md, marginTop: Spacing.sm },
  reqCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reqSong: { fontSize: FontSizes.base, fontWeight: '700', color: '#fff', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.round, backgroundColor: 'rgba(255,240,0,0.15)' },
  statusPlayed: { backgroundColor: 'rgba(34,197,94,0.15)' },
  statusText: { fontSize: 9, fontWeight: '800', color: Colors.accent, letterSpacing: 1 },
  reqArtist: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  reqMsg: { fontSize: FontSizes.sm, color: Colors.textMuted, fontStyle: 'italic', marginTop: 4 },
  reqBy: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },
  chatBox: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: Colors.border, height: 350, overflow: 'hidden' },
  chatBubble: { backgroundColor: Colors.background, borderRadius: BorderRadius.lg, padding: Spacing.sm, marginBottom: Spacing.sm, maxWidth: '85%', alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.border },
  chatBubbleMine: { alignSelf: 'flex-end', borderColor: 'rgba(255,0,127,0.3)' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  chatName: { fontSize: FontSizes.xs, fontWeight: '700' },
  roleBadge: { fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  chatMsg: { fontSize: FontSizes.sm, color: '#fff', lineHeight: 18 },
  chatTime: { fontSize: 9, color: Colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  chatInputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  chatInputField: { flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.round, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSizes.md, color: '#fff', borderWidth: 1, borderColor: Colors.border },
  chatSendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
