import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          🚀 Zauri AI Passport
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          WebAuthn + AI Agent 통합 플랫폼
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/zauri"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🎯 Zauri 데모 체험
          </Link>
        </div>
      </div>
    </div>
  );
}
