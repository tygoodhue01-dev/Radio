import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getNewsApi } from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import { WebNavBar, WebContainer, WebFooter, useIsWebDesktop } from '@/src/components/WebShell';

const CATEGORIES = ['all', 'music', 'events', 'local', 'contests'];

export default function NewsScreen() {
  const router = useRouter();
  const isWeb = useIsWebDesktop();
  const [news, setNews] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadNews = useCallback(async () => {
    const data = await getNewsApi(category === 'all' ? '' : category);
    setNews(data);
  }, [category]);

  useEffect(() => { loadNews(); }, [loadNews]);
  const onRefresh = async () => { setRefreshing(true); await loadNews(); setRefreshing(false); };

  const content = (
    <>
      <View style={[st.header, isWeb && { paddingTop: 40 }]}>
        <Text style={[st.title, isWeb && { fontSize: 32 }]}>NEWS</Text>
        <Text style={st.subtitle}>Stay in the loop with The Beat 515</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.catRow} contentContainerStyle={st.catContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat} testID={`category-${cat}`} style={[st.catBtn, category === cat && st.catBtnActive]} onPress={() => setCategory(cat)}>
            <Text style={[st.catText, category === cat && st.catTextActive]}>{cat.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {news.length === 0 ? (
        <View style={st.empty}><Ionicons name="newspaper-outline" size={48} color={Colors.textMuted} /><Text style={st.emptyText}>No news articles yet</Text></View>
      ) : isWeb ? (
        <View style={st.webGrid}>
          {news.map((article, idx) => (
            <TouchableOpacity key={article.news_id} testID={`news-card-${article.news_id}`} style={[st.webCard, idx === 0 && st.webFeatured]} onPress={() => router.push(`/news/${article.news_id}`)}>
              {article.image_url ? <Image source={{ uri: article.image_url }} style={idx === 0 ? st.webFeatImg : st.webCardImg} /> : null}
              {idx === 0 && <View style={st.webFeatOverlay} />}
              <View style={idx === 0 ? st.webFeatContent : st.webCardContent}>
                <View style={st.metaRow}><Text style={st.catLabel}>{article.category?.toUpperCase()}</Text><Text style={st.date}>{new Date(article.created_at).toLocaleDateString()}</Text></View>
                <Text style={idx === 0 ? st.webFeatTitle : st.cardTitle} numberOfLines={2}>{article.title}</Text>
                <Text style={st.summary} numberOfLines={idx === 0 ? 3 : 2}>{article.summary}</Text>
                <Text style={st.author}>By {article.author_name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        news.map((article, idx) => (
          <TouchableOpacity key={article.news_id} testID={`news-card-${article.news_id}`} style={[st.card, idx === 0 && st.heroCard]} onPress={() => router.push(`/news/${article.news_id}`)}>
            {article.image_url ? <Image source={{ uri: article.image_url }} style={idx === 0 ? st.heroImage : st.cardImage} /> : null}
            <View style={st.cardContent}>
              <View style={st.metaRow}><Text style={st.catLabel}>{article.category?.toUpperCase()}</Text><Text style={st.date}>{new Date(article.created_at).toLocaleDateString()}</Text></View>
              <Text style={idx === 0 ? st.heroTitle : st.cardTitle} numberOfLines={2}>{article.title}</Text>
              <Text style={st.summary} numberOfLines={idx === 0 ? 3 : 2}>{article.summary}</Text>
              <Text style={st.author}>By {article.author_name}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
      <View style={{ height: 40 }} />
    </>
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
      <ScrollView style={st.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        <View style={{ paddingHorizontal: Spacing.lg }}>{content}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background }, scroll: { flex: 1 },
  header: { paddingTop: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '900', color: Colors.white, letterSpacing: 3 },
  subtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  catRow: { marginTop: Spacing.md, maxHeight: 44 }, catContent: { gap: Spacing.sm },
  catBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm },
  catBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1 },
  catTextActive: { color: Colors.white },
  empty: { alignItems: 'center', paddingTop: 80 }, emptyText: { color: Colors.textMuted, marginTop: Spacing.md, fontSize: FontSizes.md },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, marginTop: Spacing.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  heroCard: { borderColor: 'rgba(0,240,255,0.3)' },
  cardImage: { width: '100%', height: 120 }, heroImage: { width: '100%', height: 200 },
  cardContent: { padding: Spacing.md },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.secondary, letterSpacing: 2 },
  date: { fontSize: FontSizes.xs, color: Colors.textMuted },
  heroTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  summary: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  author: { fontSize: FontSizes.xs, color: Colors.textMuted },
  // Web grid
  webGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginTop: 24 },
  webFeatured: { width: '100%', height: 320, position: 'relative', borderRadius: BorderRadius.xl },
  webFeatImg: { width: '100%', height: '100%', borderRadius: BorderRadius.xl },
  webFeatOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: BorderRadius.xl },
  webFeatContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 28 },
  webFeatTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 6 },
  webCard: { width: '31%', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  webCardImg: { width: '100%', height: 160 },
  webCardContent: { padding: 16 },
});
