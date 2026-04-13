import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, RefreshControl, useWindowDimensions, Platform, Share, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  getNowPlayingApi, getNewsApi, getShowsApi, getEventsApi,
  getContestsApi, getPodcastsApi, getDjsApi
} from '@/src/services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/src/theme';
import AdvancedPlayer from '@/src/components/AdvancedPlayer';
import WeatherWidget from '@/src/components/WeatherWidget';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web' && width >= 900;

  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [djs, setDjs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdvancedPlayer, setShowAdvancedPlayer] = useState(false);
  const [songRating, setSongRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

  const shareSong = async () => {
    try {
      await Share.share({
        message: `🎵 Now Playing on The Beat 515: ${nowPlaying?.song_title} by ${nowPlaying?.artist}\n\nListen live: https://opener-2.preview.emergentagent.com`,
        title: 'Share Now Playing'
      });
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const rateSong = async (rating: number) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to rate songs');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/songs/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          song_id: `${nowPlaying?.song_title}_${nowPlaying?.artist}`.replace(/\s/g, '_'),
          song_title: nowPlaying?.song_title,
          artist: nowPlaying?.artist,
          rating
        })
      });
      if (res.ok) {
        setSongRating(rating);
        Alert.alert('Success', `Rated ${rating} stars!`);
      }
    } catch (e) {
      console.error('Rating failed:', e);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to favorite songs');
      return;
    }
    try {
      const songId = `${nowPlaying?.song_title}_${nowPlaying?.artist}`.replace(/\s/g, '_');
      const res = await fetch(`${API_BASE}/api/songs/${songId}/favorite?song_title=${encodeURIComponent(nowPlaying?.song_title)}&artist=${encodeURIComponent(nowPlaying?.artist)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.favorited);
        Alert.alert('Success', data.message);
      }
    } catch (e) {
      console.error('Favorite failed:', e);
    }
  };

  const loadData = useCallback(async () => {
    try {
      const [np, n, s, e, c, p, d] = await Promise.all([
        getNowPlayingApi(), getNewsApi(), getShowsApi(),
        getEventsApi(), getContestsApi(), getPodcastsApi(), getDjsApi()
      ]);
      setNowPlaying(np); setNews(n); setShows(s);
      setEvents(e); setContests(c); setPodcasts(p); setDjs(d);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadData(); const i = setInterval(loadData, 120000); return () => clearInterval(i); }, [loadData]); // Refresh every 2 minutes
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  if (isWeb) return <WebLayout {...{ user, router, nowPlaying, news, shows, events, contests, podcasts, djs, isPlaying, setIsPlaying, onRefresh, refreshing }} />;

  // ============ MOBILE LAYOUT ============
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
        <View style={s.mPad}>
          <View style={s.mHeader}>
            <View>
              <Text style={s.mBrand}>THE BEAT 515</Text>
              <Text style={s.mTag}>PROUD. LOUD. LOCAL.</Text>
            </View>
            {!user ? (
              <TouchableOpacity testID="home-login-btn" onPress={() => router.push('/(auth)/login')} style={s.mSignIn}>
                <Text style={s.mSignInTxt}>Sign In</Text>
              </TouchableOpacity>
            ) : user.role === 'admin' || user.role === 'dj' ? (
              <TouchableOpacity testID="admin-nav-btn" onPress={() => router.push('/admin')} style={s.mIconBtn}>
                <Ionicons name="settings" size={20} color={Colors.secondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={s.mHero}>
            <View style={s.mLiveRow}><View style={s.mLiveBadge}><View style={s.mLiveDot} /><Text style={s.mLiveTxt}>LIVE</Text></View><Text style={s.mDj}>{nowPlaying?.dj_name || 'AutoDJ'}</Text></View>
            <Text style={s.mSong}>{nowPlaying?.song_title || 'The Beat 515'}</Text>
            <Text style={s.mArtist}>{nowPlaying?.artist || 'Live Radio'}</Text>
            
            {/* Rating Stars */}
            {user && (
              <View style={s.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => rateSong(star)}>
                    <Ionicons 
                      name={star <= songRating ? 'star' : 'star-outline'} 
                      size={24} 
                      color={star <= songRating ? Colors.accent : Colors.border} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={s.actionRow}>
              <TouchableOpacity testID="play-radio-button" style={s.mPlay} onPress={() => setIsPlaying(!isPlaying)}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" />
              </TouchableOpacity>
              
              {user && (
                <TouchableOpacity style={s.actionBtn} onPress={toggleFavorite}>
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={28} color={isFavorite ? Colors.primary : Colors.textSecondary} />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={s.actionBtn} onPress={shareSong}>
                <Ionicons name="share-social-outline" size={28} color={Colors.secondary} />
              </TouchableOpacity>

              <TouchableOpacity style={s.actionBtn} onPress={() => setShowAdvancedPlayer(true)}>
                <Ionicons name="options-outline" size={28} color={Colors.secondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.push('/recently-played')} style={s.mRecentLink}>
              <Ionicons name="time-outline" size={14} color={Colors.secondary} />
              <Text style={s.mRecentTxt}>Recently Played</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/charts')} style={s.mRecentLink}>
              <Ionicons name="stats-chart-outline" size={14} color={Colors.accent} />
              <Text style={[s.mRecentTxt, {color: Colors.accent}]}>Charts</Text>
            </TouchableOpacity>
          </View>
          <View style={s.mQuick}>
            {[{icon:'musical-notes',label:'Request',c:Colors.primary,t:'/(tabs)/requests'},{icon:'newspaper',label:'News',c:Colors.secondary,t:'/(tabs)/news'},{icon:'gift',label:'Rewards',c:Colors.accent,t:'/(tabs)/rewards'}].map(q=>(
              <TouchableOpacity key={q.label} style={s.mQBtn} onPress={()=>router.push(q.t as any)}>
                <Ionicons name={q.icon as any} size={22} color={q.c} /><Text style={s.mQLbl}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Weather Widget */}
          <View style={{ marginHorizontal: Spacing.lg, marginTop: Spacing.lg }}>
            <WeatherWidget />
          </View>

          {shows.length>0&&<><Text style={s.secTitle}>ON-AIR SHOWS</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{shows.map(sh=>(<View key={sh.show_id} style={s.mShowCard}>{sh.image_url?<Image source={{uri:sh.image_url}} style={s.mShowImg}/>:<View style={[s.mShowImg,s.mShowPh]}><Ionicons name="mic" size={28} color={Colors.primary}/></View>}<Text style={s.mShowNm} numberOfLines={1}>{sh.name}</Text><Text style={s.mShowSch}>{sh.schedule}</Text></View>))}</ScrollView></>}
          {news.length>0&&<><View style={s.secRow}><Text style={s.secTitle}>LATEST NEWS</Text><TouchableOpacity onPress={()=>router.push('/(tabs)/news')}><Text style={s.seeAll}>See All</Text></TouchableOpacity></View>{news.slice(0,3).map(a=>(<TouchableOpacity key={a.news_id} style={s.mNewsCard} onPress={()=>router.push(`/news/${a.news_id}`)}>{a.image_url?<Image source={{uri:a.image_url}} style={s.mNewsImg}/>:null}<View style={s.mNewsTxt}><Text style={s.mNewsCat}>{a.category?.toUpperCase()}</Text><Text style={s.mNewsTitle} numberOfLines={2}>{a.title}</Text></View></TouchableOpacity>))}</>}
          <View style={{height:40}}/>
        </View>
      </ScrollView>

      {/* Advanced Player Modal */}
      <AdvancedPlayer 
        visible={showAdvancedPlayer}
        onClose={() => setShowAdvancedPlayer(false)}
        nowPlaying={nowPlaying}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
      />
    </SafeAreaView>
  );
}

// ============ FULL WEB LAYOUT (iHeartRadio style) ============
function WebLayout({ user, router, nowPlaying, news, shows, events, contests, podcasts, djs, isPlaying, setIsPlaying, onRefresh, refreshing }: any) {
  return (
    <ScrollView style={s.wPage} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>
      {/* ===== TOP NAV BAR ===== */}
      <View style={s.wNav}>
        <View style={s.wNavInner}>
          <View style={s.wNavLeft}>
            <Text style={s.wLogo}>THE BEAT <Text style={s.wLogo515}>515</Text></Text>
          </View>
          <View style={s.wNavLinks}>
            {[{l:'Home',t:'/(tabs)/home'},{l:'News',t:'/(tabs)/news'},{l:'Request Line',t:'/(tabs)/requests'},{l:'Rewards',t:'/(tabs)/rewards'}].map(n=>(
              <TouchableOpacity key={n.l} onPress={()=>router.push(n.t as any)} style={s.wNavLink}><Text style={s.wNavLinkTxt}>{n.l.toUpperCase()}</Text></TouchableOpacity>
            ))}
          </View>
          <View style={s.wNavRight}>
            {!user ? (
              <TouchableOpacity testID="web-login-btn" onPress={()=>router.push('/(auth)/login')} style={s.wLoginBtn}>
                <Ionicons name="person" size={16} color="#fff"/><Text style={s.wLoginTxt}>SIGN IN</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={()=>router.push('/(tabs)/profile')} style={s.wUserBtn}>
                <View style={s.wAvatar}><Text style={s.wAvatarTxt}>{user.name?.charAt(0)}</Text></View>
                <Text style={s.wUserName}>{user.name}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ===== FULL-WIDTH HERO ===== */}
      <View style={s.wHero}>
        <Image source={{uri:'https://images.unsplash.com/photo-1724185773486-0b39642e607e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMG5lb24lMjBzb3VuZHdhdmV8ZW58MHx8fHwxNzc2MDcwNjQzfDA&ixlib=rb-4.1.0&q=85'}} style={s.wHeroBg}/>
        <View style={s.wHeroOverlay}/>
        <View style={s.wHeroContent}>
          <View style={s.wHeroLeft}>
            <View style={s.wLiveBadge}><View style={s.mLiveDot}/><Text style={s.wLiveTxt}>ON AIR NOW</Text></View>
            <Text style={s.wHeroSong}>{nowPlaying?.song_title || 'The Beat 515'}</Text>
            <Text style={s.wHeroArtist}>{nowPlaying?.artist || 'Live Radio'}</Text>
            <Text style={s.wHeroDj}>with {nowPlaying?.dj_name || 'AutoDJ'}</Text>
            <View style={s.wHeroBtns}>
              <TouchableOpacity testID="play-radio-button" style={s.wPlayBtn} onPress={()=>setIsPlaying(!isPlaying)}>
                <Ionicons name={isPlaying?'pause':'play'} size={24} color="#fff"/><Text style={s.wPlayTxt}>{isPlaying?'PAUSE':'LISTEN LIVE'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.wReqBtn} onPress={()=>router.push('/(tabs)/requests')}>
                <Ionicons name="musical-notes" size={18} color={Colors.primary}/><Text style={s.wReqTxt}>REQUEST A SONG</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.wRecentBtn} onPress={()=>router.push('/recently-played')}>
                <Ionicons name="time-outline" size={18} color={Colors.secondary}/><Text style={s.wRecentTxt}>Recently Played</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.wHeroRight}>
            <Text style={s.wTagBig}>PROUD.</Text>
            <Text style={s.wTagBig}>LOUD.</Text>
            <Text style={s.wTagBig}>LOCAL.</Text>
          </View>
        </View>
      </View>

      <View style={s.wContainer}>
        {/* ===== WEATHER WIDGET ===== */}
        <View style={[s.wSection, { marginTop: Spacing.xl }]}>
          <WeatherWidget />
        </View>

        {/* ===== SHOWS & DJS ===== */}
        <View style={s.wSection}>
          <View style={s.wSecHeader}><Text style={s.wSecTitle}>SHOWS & DJS</Text><Text style={s.wSecSub}>Meet your on-air talent</Text></View>
          <View style={s.wGrid4}>
            {shows.map(sh=>(
              <View key={sh.show_id} style={s.wShowCard}>
                {sh.image_url?<Image source={{uri:sh.image_url}} style={s.wShowImg}/>:<View style={[s.wShowImg,s.wShowPh]}><Ionicons name="mic" size={36} color={Colors.primary}/></View>}
                <View style={s.wShowInfo}><Text style={s.wShowNm}>{sh.name}</Text><Text style={s.wShowSch}>{sh.schedule}</Text><Text style={s.wShowDj}>{sh.dj_name}</Text><Text style={s.wShowDesc} numberOfLines={2}>{sh.description}</Text></View>
              </View>
            ))}
            {djs.map(d=>(
              <View key={d.user_id} style={s.wDjCard}>
                <View style={s.wDjAvatar}><Text style={s.wDjInit}>{d.name?.charAt(0)}</Text></View>
                <Text style={s.wDjNm}>{d.name}</Text>
                <Text style={s.wDjBio} numberOfLines={2}>{d.bio}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ===== MAIN CONTENT: NEWS + SIDEBAR ===== */}
        <View style={s.wMainRow}>
          <View style={s.wMainContent}>
            <View style={s.wSecHeader}><Text style={s.wSecTitle}>LATEST NEWS</Text><TouchableOpacity onPress={()=>router.push('/(tabs)/news')}><Text style={s.wSeeAll}>VIEW ALL</Text></TouchableOpacity></View>
            {news.slice(0,1).map(a=>(
              <TouchableOpacity key={a.news_id} style={s.wFeatured} onPress={()=>router.push(`/news/${a.news_id}`)}>
                {a.image_url?<Image source={{uri:a.image_url}} style={s.wFeatImg}/>:null}
                <View style={s.wFeatOverlay}/>
                <View style={s.wFeatContent}><Text style={s.wFeatCat}>{a.category?.toUpperCase()}</Text><Text style={s.wFeatTitle}>{a.title}</Text><Text style={s.wFeatSum} numberOfLines={2}>{a.summary}</Text></View>
              </TouchableOpacity>
            ))}
            <View style={s.wNewsGrid}>
              {news.slice(1,4).map(a=>(
                <TouchableOpacity key={a.news_id} style={s.wNewsCard} onPress={()=>router.push(`/news/${a.news_id}`)}>
                  {a.image_url?<Image source={{uri:a.image_url}} style={s.wNewsCImg}/>:null}
                  <View style={{padding:12}}><Text style={s.wNewsCCat}>{a.category?.toUpperCase()}</Text><Text style={s.wNewsCTitle} numberOfLines={2}>{a.title}</Text></View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SIDEBAR */}
          <View style={s.wSidebar}>
            {/* Active Contests */}
            <View style={s.wSideSection}>
              <Text style={s.wSideTitle}>CONTESTS & GIVEAWAYS</Text>
              {contests.map(c=>(
                <View key={c.contest_id} style={s.wContestCard}>
                  <Ionicons name="trophy" size={20} color={Colors.accent}/>
                  <View style={{flex:1,marginLeft:10}}><Text style={s.wContestNm}>{c.title}</Text><Text style={s.wContestPrize}>{c.prize}</Text><Text style={s.wContestEnd}>Ends: {c.end_date}</Text></View>
                </View>
              ))}
            </View>

            {/* Upcoming Events */}
            <View style={s.wSideSection}>
              <Text style={s.wSideTitle}>UPCOMING EVENTS</Text>
              {events.map(e=>(
                <View key={e.event_id} style={s.wEventCard}>
                  <View style={s.wEventDate}><Text style={s.wEventDay}>{new Date(e.date+'T00:00:00').toLocaleDateString('en-US',{month:'short'}).toUpperCase()}</Text><Text style={s.wEventNum}>{new Date(e.date+'T00:00:00').getDate()}</Text></View>
                  <View style={{flex:1,marginLeft:12}}><Text style={s.wEventNm}>{e.title}</Text><Text style={s.wEventVen}>{e.venue}</Text><Text style={s.wEventTime}>{e.time}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ===== PODCASTS & REPLAYS ===== */}
        <View style={s.wSection}>
          <View style={s.wSecHeader}><Text style={s.wSecTitle}>PODCASTS & REPLAYS</Text><Text style={s.wSecSub}>Catch up on what you missed</Text></View>
          <View style={s.wGrid4}>
            {podcasts.map(p=>(
              <View key={p.podcast_id} style={s.wPodCard}>
                {p.image_url?<Image source={{uri:p.image_url}} style={s.wPodImg}/>:<View style={[s.wPodImg,s.wPodPh]}><Ionicons name="headset" size={32} color={Colors.secondary}/></View>}
                <View style={s.wPodInfo}><Text style={s.wPodShow}>{p.show_name}</Text><Text style={s.wPodTitle} numberOfLines={2}>{p.title}</Text><View style={s.wPodMeta}><Ionicons name="time" size={12} color={Colors.textMuted}/><Text style={s.wPodDur}>{p.duration}</Text><Text style={s.wPodDj}>{p.dj_name}</Text></View></View>
              </View>
            ))}
          </View>
        </View>

        {/* ===== FOOTER ===== */}
        <View style={s.wFooter}>
          <View style={s.wFooterInner}>
            <View style={s.wFootCol}>
              <Text style={s.wFootBrand}>THE BEAT <Text style={{color:Colors.primary}}>515</Text></Text>
              <Text style={s.wFootTag}>Proud. Loud. Local.</Text>
              <Text style={s.wFootDesc}>Your #1 Top 40 radio station serving the 515 area. Playing the biggest hits, supporting local artists, and keeping the community connected through music.</Text>
            </View>
            <View style={s.wFootCol}>
              <Text style={s.wFootHead}>LISTEN</Text>
              <Text style={s.wFootLink}>Live Stream</Text>
              <Text style={s.wFootLink}>Show Schedule</Text>
              <Text style={s.wFootLink}>Podcasts</Text>
              <Text style={s.wFootLink}>Request Line</Text>
            </View>
            <View style={s.wFootCol}>
              <Text style={s.wFootHead}>CONNECT</Text>
              <Text style={s.wFootLink}>Contact Us</Text>
              <Text style={s.wFootLink}>Advertise</Text>
              <Text style={s.wFootLink}>Careers</Text>
              <Text style={s.wFootLink}>Contest Rules</Text>
            </View>
            <View style={s.wFootCol}>
              <Text style={s.wFootHead}>FOLLOW US</Text>
              <View style={s.wSocials}>
                {['logo-instagram','logo-twitter','logo-facebook','logo-tiktok'].map(ic=>(
                  <View key={ic} style={s.wSocialIcon}><Ionicons name={ic as any} size={20} color={Colors.white}/></View>
                ))}
              </View>
            </View>
          </View>
          <View style={s.wFootBottom}><Text style={s.wFootCopy}>&copy; 2026 The Beat 515. All rights reserved.</Text></View>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  // ===== MOBILE =====
  safe:{flex:1,backgroundColor:Colors.background},scroll:{flex:1},mPad:{paddingHorizontal:Spacing.lg},
  mHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingTop:Spacing.md,paddingBottom:Spacing.sm},
  mBrand:{fontSize:FontSizes.xl,fontWeight:'900',color:Colors.primary,letterSpacing:3},mTag:{fontSize:FontSizes.xs,fontWeight:'600',color:Colors.secondary,letterSpacing:3,marginTop:2},
  mSignIn:{backgroundColor:Colors.primary,borderRadius:BorderRadius.round,paddingHorizontal:16,paddingVertical:8},mSignInTxt:{color:'#fff',fontWeight:'700',fontSize:FontSizes.sm},
  mIconBtn:{width:40,height:40,borderRadius:20,backgroundColor:Colors.surface,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:Colors.border},
  mHero:{backgroundColor:Colors.surface,borderRadius:BorderRadius.xl,padding:Spacing.lg,borderWidth:1,borderColor:'rgba(255,0,127,0.3)',alignItems:'center',marginTop:Spacing.md},
  mLiveRow:{flexDirection:'row',alignItems:'center',marginBottom:Spacing.md},mLiveBadge:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,240,0,0.15)',paddingHorizontal:10,paddingVertical:4,borderRadius:BorderRadius.round,marginRight:8},
  mLiveDot:{width:8,height:8,borderRadius:4,backgroundColor:Colors.accent,marginRight:6},mLiveTxt:{fontSize:FontSizes.xs,fontWeight:'800',color:Colors.accent,letterSpacing:2},
  mDj:{fontSize:FontSizes.sm,color:Colors.textSecondary,fontWeight:'600'},mSong:{fontSize:FontSizes.xxl,fontWeight:'800',color:'#fff',textAlign:'center',marginBottom:4},
  mArtist:{fontSize:FontSizes.lg,color:Colors.textSecondary,textAlign:'center',marginBottom:Spacing.lg},
  mPlay:{width:72,height:72,borderRadius:36,backgroundColor:Colors.primary,alignItems:'center',justifyContent:'center'},
  ratingRow:{flexDirection:'row',gap:6,marginTop:Spacing.md,marginBottom:Spacing.sm},
  actionRow:{flexDirection:'row',alignItems:'center',gap:Spacing.md,marginTop:Spacing.md},
  actionBtn:{width:48,height:48,borderRadius:24,backgroundColor:Colors.surface,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:Colors.border},
  mRecentLink:{flexDirection:'row',alignItems:'center',gap:6,marginTop:Spacing.md,paddingVertical:8,paddingHorizontal:12,borderRadius:BorderRadius.round,backgroundColor:'rgba(255,255,255,0.05)'},
  mRecentTxt:{fontSize:FontSizes.xs,color:Colors.secondary,fontWeight:'600',letterSpacing:1},
  mQuick:{flexDirection:'row',justifyContent:'space-around',marginVertical:Spacing.lg},mQBtn:{alignItems:'center',backgroundColor:Colors.surface,borderRadius:BorderRadius.lg,padding:Spacing.md,width:90,borderWidth:1,borderColor:Colors.border},
  mQLbl:{fontSize:FontSizes.xs,color:Colors.textSecondary,fontWeight:'600',marginTop:6},
  secTitle:{fontSize:FontSizes.xs,fontWeight:'800',color:Colors.secondary,letterSpacing:3,marginBottom:Spacing.md,marginTop:Spacing.sm},
  secRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:Spacing.md},seeAll:{fontSize:FontSizes.sm,color:Colors.primary,fontWeight:'600'},
  mShowCard:{width:160,marginRight:Spacing.md,backgroundColor:Colors.surface,borderRadius:BorderRadius.lg,overflow:'hidden',borderWidth:1,borderColor:Colors.border},
  mShowImg:{width:'100%',height:100},mShowPh:{backgroundColor:Colors.surfaceLight,alignItems:'center',justifyContent:'center'},
  mShowNm:{fontSize:FontSizes.md,fontWeight:'700',color:'#fff',padding:8,paddingBottom:2},mShowSch:{fontSize:FontSizes.xs,color:Colors.secondary,paddingHorizontal:8,paddingBottom:8},
  mNewsCard:{backgroundColor:Colors.surface,borderRadius:BorderRadius.lg,marginBottom:Spacing.sm,overflow:'hidden',borderWidth:1,borderColor:Colors.border},
  mNewsImg:{width:'100%',height:120},mNewsTxt:{padding:Spacing.md},mNewsCat:{fontSize:FontSizes.xs,fontWeight:'700',color:Colors.secondary,letterSpacing:2,marginBottom:4},
  mNewsTitle:{fontSize:FontSizes.lg,fontWeight:'700',color:'#fff'},

  // ===== WEB =====
  wPage:{flex:1,backgroundColor:Colors.background},
  // Nav
  wNav:{backgroundColor:'rgba(9,9,11,0.95)',borderBottomWidth:1,borderBottomColor:'rgba(255,0,127,0.15)',paddingVertical:12,position:'sticky' as any,top:0,zIndex:100},
  wNavInner:{maxWidth:1200,alignSelf:'center',width:'100%',flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:32},
  wNavLeft:{},wLogo:{fontSize:22,fontWeight:'900',color:Colors.primary,letterSpacing:2},wLogo515:{color:'#fff'},
  wNavLinks:{flexDirection:'row',gap:32},wNavLink:{paddingVertical:4},wNavLinkTxt:{fontSize:12,fontWeight:'700',color:Colors.textSecondary,letterSpacing:2},
  wNavRight:{flexDirection:'row',alignItems:'center'},wLoginBtn:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:Colors.primary,borderRadius:BorderRadius.round,paddingHorizontal:20,paddingVertical:10},
  wLoginTxt:{fontSize:12,fontWeight:'800',color:'#fff',letterSpacing:1},
  wUserBtn:{flexDirection:'row',alignItems:'center',gap:8},wAvatar:{width:32,height:32,borderRadius:16,backgroundColor:Colors.primary,alignItems:'center',justifyContent:'center'},
  wAvatarTxt:{color:'#fff',fontWeight:'800',fontSize:14},wUserName:{color:'#fff',fontWeight:'600',fontSize:14},
  // Hero
  wHero:{height:420,position:'relative',overflow:'hidden'},wHeroBg:{position:'absolute',width:'100%',height:'100%'},
  wHeroOverlay:{position:'absolute',width:'100%',height:'100%',backgroundColor:'rgba(9,9,11,0.75)'},
  wHeroContent:{position:'absolute',width:'100%',height:'100%',maxWidth:1200,alignSelf:'center',flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:32},
  wHeroLeft:{flex:1},wLiveBadge:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,240,0,0.2)',paddingHorizontal:14,paddingVertical:6,borderRadius:BorderRadius.round,alignSelf:'flex-start',marginBottom:16},
  wLiveTxt:{fontSize:11,fontWeight:'800',color:Colors.accent,letterSpacing:3},
  wHeroSong:{fontSize:48,fontWeight:'900',color:'#fff',letterSpacing:-1},wHeroArtist:{fontSize:22,color:Colors.textSecondary,marginTop:4},
  wHeroDj:{fontSize:14,color:Colors.textMuted,marginTop:8,marginBottom:24},
  wHeroBtns:{flexDirection:'row',gap:16},wPlayBtn:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:Colors.primary,borderRadius:BorderRadius.round,paddingHorizontal:28,paddingVertical:14},
  wPlayTxt:{fontSize:13,fontWeight:'800',color:'#fff',letterSpacing:1},wReqBtn:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'transparent',borderRadius:BorderRadius.round,paddingHorizontal:24,paddingVertical:14,borderWidth:1,borderColor:Colors.primary},
  wReqTxt:{fontSize:12,fontWeight:'700',color:Colors.primary,letterSpacing:1},
  wRecentBtn:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'rgba(255,255,255,0.05)',borderRadius:BorderRadius.round,paddingHorizontal:20,paddingVertical:14},
  wRecentTxt:{fontSize:12,fontWeight:'700',color:Colors.secondary,letterSpacing:1},
  wHeroRight:{alignItems:'flex-end'},wTagBig:{fontSize:64,fontWeight:'900',color:'rgba(255,255,255,0.06)',letterSpacing:8,lineHeight:70},
  // Container
  wContainer:{maxWidth:1200,alignSelf:'center',width:'100%',paddingHorizontal:32},
  // Sections
  wSection:{marginTop:48},wSecHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',marginBottom:24},
  wSecTitle:{fontSize:22,fontWeight:'900',color:'#fff',letterSpacing:2},wSecSub:{fontSize:13,color:Colors.textMuted,marginTop:4},wSeeAll:{fontSize:12,fontWeight:'700',color:Colors.primary,letterSpacing:1},
  wGrid4:{flexDirection:'row',flexWrap:'wrap',gap:20},
  // Shows
  wShowCard:{width:'23%',backgroundColor:Colors.surface,borderRadius:BorderRadius.lg,overflow:'hidden',borderWidth:1,borderColor:Colors.border},
  wShowImg:{width:'100%',height:140},wShowPh:{backgroundColor:Colors.surfaceLight,alignItems:'center',justifyContent:'center'},
  wShowInfo:{padding:16},wShowNm:{fontSize:16,fontWeight:'700',color:'#fff'},wShowSch:{fontSize:12,color:Colors.secondary,marginTop:4},
  wShowDj:{fontSize:12,color:Colors.textMuted,marginTop:2},wShowDesc:{fontSize:12,color:Colors.textSecondary,marginTop:8,lineHeight:18},
  wDjCard:{width:'23%',backgroundColor:Colors.surface,borderRadius:BorderRadius.lg,padding:20,alignItems:'center',borderWidth:1,borderColor:Colors.border},
  wDjAvatar:{width:64,height:64,borderRadius:32,backgroundColor:Colors.primary,alignItems:'center',justifyContent:'center',marginBottom:12},
  wDjInit:{fontSize:28,fontWeight:'900',color:'#fff'},wDjNm:{fontSize:16,fontWeight:'700',color:'#fff'},wDjBio:{fontSize:12,color:Colors.textSecondary,textAlign:'center',marginTop:8,lineHeight:18},
  // Main row
  wMainRow:{flexDirection:'row',marginTop:48,gap:32},wMainContent:{flex:2},wSidebar:{flex:1},
  // Featured news
  wFeatured:{borderRadius:BorderRadius.xl,overflow:'hidden',height:300,position:'relative',marginBottom:20},wFeatImg:{width:'100%',height:'100%'},
  wFeatOverlay:{position:'absolute',width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,0.5)'},
  wFeatContent:{position:'absolute',bottom:0,left:0,right:0,padding:24},wFeatCat:{fontSize:11,fontWeight:'700',color:Colors.secondary,letterSpacing:2},
  wFeatTitle:{fontSize:28,fontWeight:'800',color:'#fff',marginTop:6},wFeatSum:{fontSize:14,color:'rgba(255,255,255,0.7)',marginTop:8,lineHeight:20},
  wNewsGrid:{flexDirection:'row',gap:16},wNewsCard:{flex:1,backgroundColor:Colors.surface,borderRadius:BorderRadius.lg,overflow:'hidden',borderWidth:1,borderColor:Colors.border},
  wNewsCImg:{width:'100%',height:120},wNewsCCat:{fontSize:10,fontWeight:'700',color:Colors.secondary,letterSpacing:2},wNewsCTitle:{fontSize:14,fontWeight:'700',color:'#fff',marginTop:4},
  // Sidebar
  wSideSection:{backgroundColor:Colors.surface,borderRadius:BorderRadius.xl,padding:20,marginBottom:20,borderWidth:1,borderColor:Colors.border},
  wSideTitle:{fontSize:12,fontWeight:'800',color:Colors.accent,letterSpacing:2,marginBottom:16},
  wContestCard:{flexDirection:'row',alignItems:'flex-start',marginBottom:16,paddingBottom:16,borderBottomWidth:1,borderBottomColor:Colors.border},
  wContestNm:{fontSize:14,fontWeight:'700',color:'#fff'},wContestPrize:{fontSize:12,color:Colors.primary,marginTop:2},wContestEnd:{fontSize:11,color:Colors.textMuted,marginTop:4},
  wEventCard:{flexDirection:'row',alignItems:'center',marginBottom:16},
  wEventDate:{width:48,height:48,borderRadius:8,backgroundColor:'rgba(255,0,127,0.1)',alignItems:'center',justifyContent:'center'},
  wEventDay:{fontSize:10,fontWeight:'700',color:Colors.primary,letterSpacing:1},wEventNum:{fontSize:20,fontWeight:'900',color:'#fff'},
  wEventNm:{fontSize:14,fontWeight:'700',color:'#fff'},wEventVen:{fontSize:12,color:Colors.textSecondary,marginTop:2},wEventTime:{fontSize:11,color:Colors.textMuted,marginTop:2},
  // Podcasts
  wPodCard:{width:'23%',backgroundColor:Colors.surface,borderRadius:BorderRadius.lg,overflow:'hidden',borderWidth:1,borderColor:Colors.border},
  wPodImg:{width:'100%',height:130},wPodPh:{backgroundColor:Colors.surfaceLight,alignItems:'center',justifyContent:'center'},
  wPodInfo:{padding:14},wPodShow:{fontSize:10,fontWeight:'700',color:Colors.secondary,letterSpacing:1},wPodTitle:{fontSize:14,fontWeight:'700',color:'#fff',marginTop:4},
  wPodMeta:{flexDirection:'row',alignItems:'center',gap:6,marginTop:8},wPodDur:{fontSize:11,color:Colors.textMuted},wPodDj:{fontSize:11,color:Colors.textMuted},
  // Footer
  wFooter:{marginTop:64,backgroundColor:Colors.surface,borderTopWidth:1,borderTopColor:'rgba(255,0,127,0.15)',paddingTop:48,paddingBottom:24},
  wFooterInner:{maxWidth:1200,alignSelf:'center',width:'100%',flexDirection:'row',paddingHorizontal:32,gap:48},
  wFootCol:{flex:1},wFootBrand:{fontSize:24,fontWeight:'900',color:'#fff',letterSpacing:2},wFootTag:{fontSize:12,color:Colors.secondary,letterSpacing:3,marginTop:4},
  wFootDesc:{fontSize:13,color:Colors.textSecondary,marginTop:12,lineHeight:20},
  wFootHead:{fontSize:12,fontWeight:'800',color:Colors.accent,letterSpacing:2,marginBottom:16},wFootLink:{fontSize:13,color:Colors.textSecondary,marginBottom:10},
  wSocials:{flexDirection:'row',gap:12},wSocialIcon:{width:40,height:40,borderRadius:20,backgroundColor:'rgba(255,255,255,0.1)',alignItems:'center',justifyContent:'center'},
  wFootBottom:{maxWidth:1200,alignSelf:'center',width:'100%',paddingHorizontal:32,marginTop:32,paddingTop:16,borderTopWidth:1,borderTopColor:Colors.border},
  wFootCopy:{fontSize:12,color:Colors.textMuted},
});
