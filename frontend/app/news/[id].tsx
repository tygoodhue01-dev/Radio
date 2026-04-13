import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getNewsDetailApi } from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { WebNavBar, WebContainer, WebFooter, useIsWebDesktop } from '@/src/components/WebShell';
import CommentsSection from '@/src/components/CommentsSection';

export default function NewsDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isWeb = useIsWebDesktop();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) { getNewsDetailApi(id).then(setArticle).catch(() => {}).finally(() => setLoading(false)); }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        {isWeb && <WebNavBar />}
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.safe}>
        {isWeb && <WebNavBar />}
        <View style={styles.notFound}><Text style={styles.notFoundText}>Article not found</Text><TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>Go Back</Text></TouchableOpacity></View>
      </SafeAreaView>
    );
  }

  const articleContent = (
    <View style={[isWeb && { maxWidth: 800, alignSelf: 'center' as any, width: '100%', paddingTop: 40, paddingBottom: 40 }]}>
      {!isWeb && (
        <TouchableOpacity testID="news-back-btn" style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
      )}
      {article.image_url ? <Image source={{ uri: article.image_url }} style={[styles.heroImage, isWeb && { borderRadius: 16 }]} /> : (
        <View style={styles.heroPlaceholder}><Ionicons name="newspaper" size={48} color={Colors.primary} /></View>
      )}
      <View style={styles.content}>
        <View style={styles.metaRow}><Text style={styles.category}>{article.category?.toUpperCase()}</Text><Text style={styles.date}>{new Date(article.created_at).toLocaleDateString()}</Text></View>
        <Text style={[styles.title, isWeb && { fontSize: 36 }]}>{article.title}</Text>
        <Text style={styles.author}>By {article.author_name}</Text>
        <Text style={[styles.body, isWeb && { fontSize: 17, lineHeight: 30 }]}>{article.content}</Text>
        
        {/* Comments Section */}
        {article.news_id && <CommentsSection postType="news" postId={article.news_id} />}
        
        {isWeb && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/news')} style={{ marginTop: 32, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="arrow-back" size={16} color={Colors.primary} /><Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 14 }}>Back to News</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isWeb) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: Colors.background }}>
        <WebNavBar />
        <WebContainer>{articleContent}</WebContainer>
        <WebFooter />
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll}>{articleContent}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  backBtn: {
    position: 'absolute', top: Spacing.md, left: Spacing.md, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  heroImage: { width: '100%', height: 260 },
  heroPlaceholder: {
    width: '100%', height: 200, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: Spacing.lg },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  category: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.secondary, letterSpacing: 2 },
  date: { fontSize: FontSizes.xs, color: Colors.textMuted },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.white, lineHeight: 34, marginBottom: Spacing.sm },
  author: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.lg },
  body: { fontSize: FontSizes.base, color: Colors.textSecondary, lineHeight: 26 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: FontSizes.lg, color: Colors.textMuted },
  backLink: { fontSize: FontSizes.md, color: Colors.primary, marginTop: Spacing.md },
});
