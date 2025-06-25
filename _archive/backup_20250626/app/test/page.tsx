'use client';

import { useState } from 'react';

export default function MultilingualTestPage() {
  const [result, setResult] = useState<any>(null);
  const [language, setLanguage] = useState('korean');
  const [testText, setTestText] = useState('안녕하세요. WebAuthn으로 등록하고 싶습니다.');

  const testMultilingualAPI = async () => {
    try {
      const response = await fetch('/api/webauthn/multilingual/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: '테스트 사용자',
          userLanguage: language,
          interactionHistory: [
            {
              id: '1',
              content: testText,
              timestamp: new Date().toISOString(),
              type: 'user_input',
              context: 'registration'
            }
          ]
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('API 테스트 오류:', error);
      setResult({ error: error.message });
    }
  };

  const testLanguageDetection = async () => {
    try {
      const response = await fetch('/api/webauthn/multilingual/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: '테스트 사용자',
          // userLanguage 없이 보내서 자동 감지 테스트
          interactionHistory: [
            {
              id: '1',
              content: testText,
              timestamp: new Date().toISOString(),
              type: 'user_input',
              context: 'registration'
            }
          ]
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('언어 감지 테스트 오류:', error);
      setResult({ error: error.message });
    }
  };

  const sampleTexts = {
    korean: '안녕하세요. WebAuthn으로 등록하고 싶습니다.',
    english: 'Hello, I would like to register with WebAuthn.',
    japanese: 'こんにちは。WebAuthnで登録したいです。',
    chinese: '你好，我想用WebAuthn注册。',
    spanish: 'Hola, me gustaría registrarme con WebAuthn.'
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          🌍 다국어 WebAuthn 시스템 테스트
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">언어 선택 테스트</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              언어 선택:
            </label>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="korean">한국어</option>
              <option value="english">English</option>
              <option value="japanese">日本語</option>
              <option value="chinese">中文</option>
              <option value="spanish">Español</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              테스트 텍스트:
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
            <div className="mt-2 space-x-2">
              {Object.entries(sampleTexts).map(([lang, text]) => (
                <button
                  key={lang}
                  onClick={() => setTestText(text)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="space-x-4">
            <button
              onClick={testMultilingualAPI}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🎯 언어 지정 테스트
            </button>
            
            <button
              onClick={testLanguageDetection}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🔍 자동 언어 감지 테스트
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">테스트 결과</h2>
            
            {result.success ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800">✅ 성공!</h3>
                  <p className="text-green-700">감지된 언어: <strong>{result.detectedLanguage}</strong></p>
                  <p className="text-green-700">메시지 제목: <strong>{result.messages.title}</strong></p>
                  <p className="text-green-700">설명: {result.messages.description}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">전체 응답:</h4>
                  <pre className="text-sm overflow-auto bg-gray-100 p-2 rounded">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800">❌ 오류 발생</h3>
                <pre className="text-sm text-red-700 mt-2">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
