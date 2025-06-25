'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Shield, Fingerprint, Zap, Eye, Brain, 
  ArrowRight, CheckCircle, Globe, Database, Cpu,
  Lock, Key, Heart, Award, Wifi, Clock, Network
} from 'lucide-react';

interface WebAuthnSupport {
  supported: boolean;
  platform: boolean;
  conditional: boolean;
  biometricType?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [webauthnSupport, setWebauthnSupport] = useState<WebAuthnSupport>({
    supported: false,
    platform: false,
    conditional: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWebAuthnSupport = async () => {
      try {
        const supported = !!window.PublicKeyCredential;
        let platform = false;
        let conditional = false;
        let biometricType = 'Unknown';

        if (supported) {
          try {
            platform = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            conditional = await PublicKeyCredential.isConditionalMediationAvailable?.() || false;
            
            const userAgent = navigator.userAgent;
            if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
              biometricType = 'Face ID / Touch ID';
            } else if (userAgent.includes('Android')) {
              biometricType = 'Fingerprint / Face';
            } else if (userAgent.includes('Windows')) {
              biometricType = 'Windows Hello';
            } else if (userAgent.includes('Mac')) {
              biometricType = 'Touch ID';
            } else {
              biometricType = 'Platform Authenticator';
            }
          } catch (error) {
            console.warn('WebAuthn feature detection failed:', error);
          }
        }

        setWebauthnSupport({
          supported,
          platform,
          conditional,
          biometricType
        });
      } catch (error) {
        console.error('WebAuthn support check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWebAuthnSupport();
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'AI Passport 시스템',
      description: 'WebAuthn 생체인증과 DID 기반 통합 신원 관리',
      highlight: true
    },
    {
      icon: Brain,
      title: 'Zauri RAG-DAG',
      description: '지식 그래프 기반 개인화 AI와 크로스플랫폼 동기화',
      highlight: true
    },
    {
      icon: Network,
      title: '28:1 압축 기술',
      description: '88% 의미 보존으로 플랫폼 간 실시간 컨텍스트 전송'
    },
    {
      icon: Database,
      title: '데이터 볼트',
      description: '암호화된 개인 데이터 저장소와 CUE 토큰 채굴'
    },
    {
      icon: Zap,
      title: '토큰 경제',
      description: 'ZAURI, ZGT, ZRP 다중 토큰으로 대화마다 보상'
    },
    {
      icon: Globe,
      title: '플랫폼 통합',
      description: 'ChatGPT, Claude, Notion 등과 완전 연동'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-10 h-10 text-blue-600 absolute top-5 left-1/2 transform -translate-x-1/2" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Zauri + AI Passport</h1>
          <p className="text-blue-600 font-medium">시스템 초기화 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-75"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-150"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <div className={`absolute -top-2 -right-2 w-8 h-8 ${webauthnSupport.supported ? 'bg-green-500' : 'bg-yellow-500'} rounded-full flex items-center justify-center shadow-lg`}>
                  {webauthnSupport.supported ? (
                    <Shield className="w-4 h-4 text-white" />
                  ) : (
                    <Clock className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Zauri
              </span>
              <br />
              <span className="text-4xl md:text-5xl">+ AI Passport</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto leading-relaxed">
              차세대 AI 개인화 플랫폼 • 
              <span className="font-semibold text-blue-600"> 생체인증</span> + 
              <span className="font-semibold text-purple-600"> RAG-DAG</span> + 
              <span className="font-semibold text-green-600"> 크로스플랫폼</span>
            </p>

            <div className="mb-8">
              {webauthnSupport.supported ? (
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {webauthnSupport.biometricType} 지원됨
                  </span>
                  {webauthnSupport.platform && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">WebAuthn 미지원 (기본 로그인 가능)</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/dashboard"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>지금 시작하기</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/dashboard"
                className="group bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 flex items-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>라이브 데모</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-gray-600">시스템 가동률</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">&lt;0.8s</div>
                <div className="text-gray-600">응답 속도</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">28:1</div>
                <div className="text-gray-600">압축률</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              통합 AI 개인화 시스템
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI Passport와 Zauri 시스템이 하나로 통합된 차세대 AI 상호작용 플랫폼
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`group p-8 rounded-2xl transition-all duration-300 hover:shadow-xl ${
                  feature.highlight 
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-300' 
                    : 'bg-white border border-gray-200 hover:border-gray-300'
                } hover:transform hover:scale-105`}
              >
                <div className={`w-12 h-12 ${
                  feature.highlight ? 'bg-blue-600' : 'bg-gray-100'
                } rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.highlight ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                {feature.highlight && (
                  <div className="mt-4 inline-flex items-center text-blue-600 text-sm font-medium">
                    <Award className="w-4 h-4 mr-1" />
                    핵심 기능
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Preview */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">완전 통합 시스템</h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              AI Passport + Zauri = 하나의 완성된 생태계
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">WebAuthn</h3>
              <p className="text-blue-200 text-sm">FIDO2 표준 생체인증</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">DID</h3>
              <p className="text-blue-200 text-sm">탈중앙화 신원 증명</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">RAG-DAG</h3>
              <p className="text-blue-200 text-sm">지식 그래프 AI</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Network className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">크로스플랫폼</h3>
              <p className="text-blue-200 text-sm">실시간 동기화</p>
            </div>
          </div>

          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8">시스템 호환성</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`w-12 h-12 ${webauthnSupport.supported ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">WebAuthn 지원</h4>
                <p className="text-blue-200 text-sm">
                  {webauthnSupport.supported ? '완전 지원됨' : '부분 지원'}
                </p>
              </div>

              <div className="text-center">
                <div className={`w-12 h-12 ${webauthnSupport.platform ? 'bg-green-500' : 'bg-yellow-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Fingerprint className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">생체 인증</h4>
                <p className="text-blue-200 text-sm">
                  {webauthnSupport.platform ? 
                    (webauthnSupport.biometricType || '사용 가능') : 
                    '외부 장치 필요'
                  }
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">플랫폼 연동</h4>
                <p className="text-blue-200 text-sm">모든 주요 AI 플랫폼</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              미래의 AI 경험을 시작하세요
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI Passport와 Zauri가 통합된 혁신적인 개인화 AI 플랫폼을 경험해보세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link 
                href="/dashboard"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>통합 대시보드 체험</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>✓ 신용카드 불필요</p>
              <p>✓ 2분 내 설정 완료</p>
              <p>✓ 엔터프라이즈급 보안</p>
              <p>✓ AI Passport + Zauri 완전 통합</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Zauri + AI Passport</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                차세대 AI 개인화 플랫폼. 생체인증, RAG-DAG 지식 그래프, 크로스플랫폼 동기화가 
                하나로 통합된 혁신적인 시스템입니다.
              </p>
              <div className="flex space-x-4">
                <div className="text-gray-400 text-sm">
                  AI의 미래를 위해 ❤️로 개발되었습니다
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">주요 기능</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">통합 대시보드</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">AI Passport</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Zauri RAG-DAG</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">크로스플랫폼</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">기술</h3>
              <ul className="space-y-2 text-gray-400">
                <li><span className="hover:text-white transition-colors">WebAuthn</span></li>
                <li><span className="hover:text-white transition-colors">DID</span></li>
                <li><span className="hover:text-white transition-colors">RAG-DAG</span></li>
                <li><span className="hover:text-white transition-colors">토큰 경제</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 Zauri + AI Passport. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-gray-400 text-sm flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>WebAuthn으로 보호됨</span>
              </div>
              <div className="text-gray-400 text-sm flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>RAG-DAG 기반</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
