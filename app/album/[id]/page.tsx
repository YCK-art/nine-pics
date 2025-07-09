'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, Share2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getFirestore, doc, getDoc, updateDoc, onSnapshot, increment } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'
import ViewsModal from '../../components/ViewsModal';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyD0464CV_q1OwDzte8XOwyOaP6BlO6lm9A",
  authDomain: "nine-pics-a761a.firebaseapp.com",
  projectId: "nine-pics-a761a",
  storageBucket: "nine-pics-a761a.firebasestorage.app",
  messagingSenderId: "149224975487",
  appId: "1:149224975487:web:3e669ea918435f5319a34a",
  measurementId: "G-TNE9LHNHMN"
}

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

interface Photo {
  id: string
  url: string
  alt: string
}

interface Album {
  id: string
  photos: Photo[]
  viewCount: number
  createdAt: string
}

export default function AlbumPage({ params }: { params: { id: string } }) {
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [showViewsModal, setShowViewsModal] = useState(false);
  const [totalViews, setTotalViews] = useState(0);
  const [createdAt, setCreatedAt] = useState(null);
  const [viewsByDate, setViewsByDate] = useState({});

  // 실시간 구독 및 unique visitor 집계
  useEffect(() => {
    setShowViewsModal(true); // 페이지 진입 시 무조건 ViewsModal 띄우기 (임시)
    if (!params.id) return;
    const db = getFirestore();
    const albumRef = doc(db, 'albums', params.id);
    // 실시간 구독
    const unsubscribe = onSnapshot(albumRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTotalViews(data.totalViews || 0);
        setCreatedAt(data.createdAt || null);
        setViewsByDate(data.viewsByDate || {});
      }
    });
    // unique visitor 집계 (1인 1회)
    const localKey = `visited_album_${params.id}`;
    if (!localStorage.getItem(localKey)) {
      updateDoc(albumRef, {
        totalViews: increment(1),
        [`viewsByDate.${getTodayString()}`]: increment(1),
      });
      localStorage.setItem(localKey, '1');
    } else {
      // 이미 방문한 경우에도 viewsByDate, totalViews는 증가 X (1인 1회만 허용)
    }
    return () => unsubscribe();
  }, [params.id]);

  function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  }

  // D+N 계산
  const daysSinceCreated = createdAt ? Math.max(1, Math.ceil((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 1;

  // 최근 7일 조회수 합계
  const last7DaysViews = Object.entries(viewsByDate)
    .filter(([date]) => {
      const d = new Date(date);
      return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, [, count]) => sum + (typeof count === 'number' ? count : 0), 0);

  // Most Active Day 계산
  let mostActiveDay = '-';
  let mostActiveCount = 0;
  Object.entries(viewsByDate).forEach(([date, count]) => {
    if (typeof count === 'number' && count > mostActiveCount) {
      mostActiveDay = date;
      mostActiveCount = count;
    }
  });

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true)
      try {
        const db = getFirestore()
        const albumRef = doc(db, 'albums', params.id)
        const albumSnap = await getDoc(albumRef)
        
        if (albumSnap.exists()) {
          const albumData = albumSnap.data() as Album
          setAlbum(albumData)
          // 조회수 증가
          await updateDoc(albumRef, { 
            viewCount: (albumData.viewCount || 0) + 1 
          })
        } else {
          setAlbum(null)
        }
      } catch (error) {
        console.error('앨범 불러오기 오류:', error)
        setAlbum(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAlbum()
  }, [params.id])

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Nine Pics 앨범',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  useEffect(() => {
    // ViewsModal 툴바 연동
    const handler = (e: any) => {
      if (e.detail === 'views') setShowViewsModal(true);
    };
    window.addEventListener('open-modal', handler);
    return () => window.removeEventListener('open-modal', handler);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">앨범을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">앨범을 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-4">링크를 다시 확인해주세요</p>
          <Link href="/" className="text-primary hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* ViewsModal 트리거 임시 버튼 제거 */}
      {showViewsModal && (
        <ViewsModal
          totalViews={totalViews}
          daysSinceCreated={daysSinceCreated}
          onClose={() => setShowViewsModal(false)}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5 mr-2" />
            홈으로
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                liked ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span>{liked ? '좋아요' : '좋아요'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>공유</span>
            </button>
          </div>
        </div>

        {/* 앨범 정보 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nine Pics 앨범</h1>
          <p className="text-gray-600 mb-4">특별한 순간들을 담은 디지털 앨범</p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span>조회수: {album.viewCount}</span>
            <span>사진: {album.photos.length}장</span>
          </div>
        </div>

        {/* 사진 그리드 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }, (_, index) => {
              const photo = album.photos[index]

              return (
                <div
                  key={index}
                  className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center ${
                    photo ? 'border-transparent bg-white' : 'border-gray-200 bg-gray-100'
                  }`}
                >
                  {photo ? (
                    <div className="relative w-full h-full group">
                      <Image
                        src={photo.url}
                        alt={photo.alt}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                          <p className="text-sm font-medium">{photo.alt}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
                      <p className="text-xs text-gray-400">빈 슬롯</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">댓글</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">정말 아름다운 사진들이네요! 🌸</p>
                <p className="text-xs text-gray-400 mt-1">2시간 전</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                B
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">자연의 아름다움이 잘 담겨있어요</p>
                <p className="text-xs text-gray-400 mt-1">5시간 전</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 