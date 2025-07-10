export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-inconsolata">Contact</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">문의하기</h2>
            <p className="text-gray-600 mb-6">
              nine-pics에 대한 문의사항이 있으시면 언제든지 연락주세요.
            </p>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">연락처</h3>
            <ul className="list-none pl-0 mb-6 text-gray-600">
              <li className="mb-2">
                <strong>이메일:</strong> support@ninepics.com
              </li>
              <li className="mb-2">
                <strong>운영시간:</strong> 평일 09:00 - 18:00 (KST)
              </li>
              <li className="mb-2">
                <strong>응답시간:</strong> 24시간 이내
              </li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">문의 유형</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-600">
              <li>기술 지원</li>
              <li>계정 관련 문의</li>
              <li>서비스 개선 제안</li>
              <li>버그 리포트</li>
              <li>기타 문의사항</li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-800 mb-3">자주 묻는 질문</h3>
            <div className="mb-6">
              <details className="mb-3">
                <summary className="cursor-pointer font-semibold text-gray-800">서비스는 무료인가요?</summary>
                <p className="mt-2 text-gray-600">네, nine-pics는 현재 무료로 제공되고 있습니다.</p>
              </details>
              <details className="mb-3">
                <summary className="cursor-pointer font-semibold text-gray-800">업로드할 수 있는 이미지 형식은?</summary>
                <p className="mt-2 text-gray-600">JPG, PNG, GIF 형식을 지원합니다.</p>
              </details>
              <details className="mb-3">
                <summary className="cursor-pointer font-semibold text-gray-800">계정을 삭제할 수 있나요?</summary>
                <p className="mt-2 text-gray-600">네, 설정에서 계정 삭제가 가능합니다.</p>
              </details>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                더 자세한 정보가 필요하시면 이메일로 문의해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 