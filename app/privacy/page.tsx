export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-inconsolata">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">개인정보 처리방침</h2>
            <p className="text-gray-600 mb-6">
              nine-pics는 사용자의 개인정보를 보호하기 위해 최선을 다하고 있습니다.
            </p>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">수집하는 정보</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>이메일 주소</li>
              <li>프로필 정보</li>
              <li>업로드된 이미지</li>
              <li>서비스 이용 기록</li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">정보 사용 목적</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>서비스 제공 및 개선</li>
              <li>고객 지원</li>
              <li>보안 및 사기 방지</li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">정보 보호</h3>
            <p className="text-gray-600 mb-6">
              모든 개인정보는 암호화되어 안전하게 저장되며, 무단 접근을 방지하기 위한 보안 조치를 취하고 있습니다.
            </p>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                최종 업데이트: 2024년 1월 1일
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 