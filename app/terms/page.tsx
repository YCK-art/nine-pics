export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-inconsolata">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">이용약관</h2>
            <p className="text-gray-600 mb-6">
              nine-pics 서비스를 이용하기 전에 다음 약관을 주의 깊게 읽어주세요.
            </p>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">서비스 이용</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>서비스는 개인적인 용도로만 사용해야 합니다</li>
              <li>타인의 권리를 침해하는 콘텐츠는 업로드할 수 없습니다</li>
              <li>서비스의 안정성을 해치는 행위는 금지됩니다</li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">콘텐츠 정책</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>저작권이 있는 콘텐츠는 업로드할 수 없습니다</li>
              <li>음란하거나 폭력적인 콘텐츠는 금지됩니다</li>
              <li>개인정보가 포함된 콘텐츠는 업로드할 수 없습니다</li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">책임 제한</h3>
            <p className="text-gray-600 mb-6">
              서비스 이용으로 인한 손해에 대해 nine-pics는 책임을 지지 않습니다.
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