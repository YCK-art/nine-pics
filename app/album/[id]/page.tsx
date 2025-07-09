'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, Share2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

  // 실제 구현에서는 API에서 앨범 데이터를 가져와야 합니다
  // 여기서는 데모용으로 더미 데이터를 사용합니다
  useEffect(() => {
    // 시뮬레이션된 로딩
    setTimeout(() => {
      const dummyAlbum: Album = {
        id: params.id,
        photos: [
          {
            id: '1',
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            alt: '자연 풍경'
          },
          {
            id: '2',
            url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
            alt: '숲속 풍경'
          },
          {
            id: '3',
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            alt: '산맥 풍경'
          }
        ],
        viewCount: 156,
        createdAt: new Date().toISOString()
      }
      setAlbum(dummyAlbum)
      setLoading(false)
    }, 1000)
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