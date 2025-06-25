'use client';

// =============================================================================
// 🏠 메인 페이지 - Fusion AI Dashboard 진입점
// 파일: src/app/page.tsx
// =============================================================================

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Shield, Fingerprint, Zap, Eye, Brain, 
  ArrowRight, CheckCircle, Globe, Database, Cpu,
  Lock, Key, Heart, Award, Wifi, Clock
X, } from 'lucide-react';

// =============================================================================
// 📋 타입 정의
// =============================================================================

interface WebAuthnSupport {
  supported: boolean;
  platform: boolean;
  conditional: boolean;
  biometricType?: string;
}

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight?: boolean;
}

// =============================================================================
// 🎨 메인 페이지 컴포넌트
// =============================================================================

export default function HomePage() {
  const router = useRouter();
  const [webauthnSupport, setWebauthnSupport] = useState<WebAuthnSupport>({
    supported: false,
    platform: false,
    conditional: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // =============================================================================
  // 🔄 WebAuthn 지원 확인
  // =============================================================================

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
            
            // 생체 인증 타입 감지
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

    // 전역 WebAuthn 지원 이벤트 리스너
    const handleWebAuthnSupport = (event: any) => {
      const { supported, platform, conditional } = event.detail;
      setWebauthnSupport(prev => ({
        ...prev,
        supported,
        platform,
        conditional
      }));
    };

    window.addEventListener('webauthn-support-detected', handleWebAuthnSupport);
    
    return () => {
      window.removeEventListener('webauthn-support-detected', handleWebAuthnSupport);
    };
  }, []);

  // =============================================================================
  // 🎯 기능 목록
  // =============================================================================

  const features: Feature[] = [
    {
      icon: Shield,
      title: 'Biometric Security',
      description: 'Enterprise-grade authentication with your fingerprint, face, or device',
      highlight: true
    },
    {
      icon: Brain,
      title: 'AI Agent Personalization',
      description: 'Advanced AI that learns your patterns and adapts to your workflow',
      highlight: true
    },
    {
      icon: Eye,
      title: 'Real-time Learning',
      description: 'Continuous context awareness across all your connected platforms'
    },
    {
      icon: Database,
      title: 'Complete Data Ownership',
      description: 'Your data stays yours with decentralized identity (DID) technology'
    },
    {
      icon: Zap,
      title: 'Predictive Interface',
      description: 'AI anticipates your needs and suggests relevant actions'
    },
    {
      icon: Globe,
      title: 'Cross-platform Sync',
      description: 'Seamless integration with Gmail, Calendar, Slack, and more'
    }
  ];

  // =============================================================================
  // 🎨 렌더링
  // =============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-10 h-10 text-blue-600 absolute top-5 left-1/2 transform -translate-x-1/2" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Fusion AI Dashboard</h1>
          <p className="text-blue-600 font-medium">Checking device capabilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* 배경 애니메이션 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-75"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-150"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* 로고 및 상태 */}
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

            {/* 제목 및 설명 */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Fusion AI
              </span>
              <br />
              Dashboard
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              The future of AI interaction with{' '}
              <span className="font-semibold text-blue-600">biometric authentication</span>
            </p>

            {/* 디바이스 상태 */}
            <div className="mb-8">
              {webauthnSupport.supported ? (
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {webauthnSupport.biometricType} Ready
                  </span>
                  {webauthnSupport.platform && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">WebAuthn Not Supported</span>
                </div>
              )}
            </div>

            {/* CTA 버튼들 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/login"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/login"
                className="group bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 flex items-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>Live Demo</span>
              </Link>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">&lt;0.8s</div>
                <div className="text-gray-600">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">SSS</div>
                <div className="text-gray-600">Security Level</div>
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
              Revolutionary AI Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by cutting-edge technology to deliver the most secure and intelligent AI interaction platform
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
                    Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built on Modern Standards</h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Enterprise-grade security meets cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">WebAuthn</h3>
              <p className="text-blue-200 text-sm">FIDO2 standard for passwordless authentication</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">DID</h3>
              <p className="text-blue-200 text-sm">Decentralized Identity for data ownership</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced AI</h3>
              <p className="text-blue-200 text-sm">GPT-4, Claude, and Gemini integration</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Edge Computing</h3>
              <p className="text-blue-200 text-sm">Real-time processing and learning</p>
            </div>
          </div>

          {/* WebAuthn 지원 상태 상세 */}
          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Your Device Capabilities</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`w-12 h-12 ${webauthnSupport.supported ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {webauthnSupport.supported ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <X className="w-6 h-6 text-white" />
                  )}
                </div>
                <h4 className="font-semibold mb-2">WebAuthn Support</h4>
                <p className="text-blue-200 text-sm">
                  {webauthnSupport.supported ? 'Fully Supported' : 'Not Available'}
                </p>
              </div>

              <div className="text-center">
                <div className={`w-12 h-12 ${webauthnSupport.platform ? 'bg-green-500' : 'bg-yellow-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Fingerprint className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Biometric Auth</h4>
                <p className="text-blue-200 text-sm">
                  {webauthnSupport.platform ? 
                    (webauthnSupport.biometricType || 'Available') : 
                    'External Device Required'
                  }
                </p>
              </div>

              <div className="text-center">
                <div className={`w-12 h-12 ${webauthnSupport.conditional ? 'bg-green-500' : 'bg-gray-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Advanced Features</h4>
                <p className="text-blue-200 text-sm">
                  {webauthnSupport.conditional ? 'Conditional UI' : 'Basic Mode'}
                </p>
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
              Ready to Experience the Future?
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already discovered the power of secure, intelligent AI interaction.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link 
                href="/login"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>Start Your Journey</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>✓ No credit card required</p>
              <p>✓ Setup in under 2 minutes</p>
              <p>✓ Enterprise-grade security</p>
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
                <span className="text-xl font-bold">Fusion AI Dashboard</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The most secure and intelligent AI interaction platform, powered by biometric authentication and decentralized identity.
              </p>
              <div className="flex space-x-4">
                <div className="text-gray-400 text-sm">
                  Built with ❤️ for the future of AI
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Integration</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 Fusion AI Dashboard. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-gray-400 text-sm flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Secured by WebAuthn</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}