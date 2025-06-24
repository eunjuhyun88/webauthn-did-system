'use client';

/**
 * 🏠 Main Landing Page with Authentication Integration
 * 인증 상태에 따른 스마트 라우팅이 포함된 메인 페이지
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Shield, Brain, Database, Globe, ArrowRight, 
  CheckCircle, Eye, Fingerprint, Zap, Award, Users,
  BarChart3, Lock, Cpu, Network, Heart, Info,
  Star, TrendingUp, Clock, UserCheck
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // 페이지 로드 애니메이션
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 인증된 사용자는 대시보드로 자동 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('✅ Authenticated user detected, redirecting to dashboard');
      router.push('/chat');
    }
  }, [isAuthenticated, isLoading, router]);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Fusion AI Dashboard...</p>
        </div>
      </div>
    );
  }

  // 인증된 사용자는 리다이렉트 중
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Welcome back! Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // 메인 랜딩 페이지 (비인증 사용자)
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Fusion AI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/demo"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Demo
              </Link>
              <Link 
                href="/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                <span>Secure • Biometric • Zero-Password</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The Future of
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI Interaction</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience seamless AI conversations with military-grade biometric security. 
                Your personal AI agent learns, adapts, and protects your digital identity 
                across all platforms.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              <Link 
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Start with Biometrics</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              
              <Link 
                href="/demo"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Watch Demo</span>
                </div>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>W3C Standards</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Privacy-First</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-2xl p-1">
            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Biometric Auth Visual */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Fingerprint className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Biometric Login</h3>
                  <p className="text-sm text-gray-300">Touch ID, Face ID, Windows Hello</p>
                </div>

                {/* AI Agent Visual */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Personal AI Agent</h3>
                  <p className="text-sm text-gray-300">Learns your patterns & preferences</p>
                </div>

                {/* Data Ownership Visual */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Data Ownership</h3>
                  <p className="text-sm text-gray-300">Complete control over your data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Revolutionary AI Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fusion AI combines cutting-edge security with intelligent personalization 
              to create the most advanced AI interaction platform ever built.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: <Shield className="w-8 h-8 text-blue-600" />,
                title: "Military-Grade Security",
                description: "Hardware-backed biometric authentication with zero-knowledge architecture",
                highlight: "99.9% Attack Resistance"
              },
              {
                icon: <Brain className="w-8 h-8 text-purple-600" />,
                title: "Adaptive AI Agent",
                description: "Your personal AI learns from every interaction to provide better assistance",
                highlight: "Level Up System"
              },
              {
                icon: <Network className="w-8 h-8 text-green-600" />,
                title: "Cross-Platform Sync",
                description: "Seamlessly continue conversations across ChatGPT, Claude, and Gemini",
                highlight: "95% Context Preservation"
              },
              {
                icon: <Database className="w-8 h-8 text-indigo-600" />,
                title: "Complete Data Ownership",
                description: "Your data stays yours. Zero-knowledge architecture ensures privacy",
                highlight: "100% Private"
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-600" />,
                title: "Lightning Fast",
                description: "Optimized for speed with predictive UI and instant responses",
                highlight: "Sub-second Response"
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-emerald-600" />,
                title: "Advanced Analytics",
                description: "Deep insights into your AI interactions and productivity patterns",
                highlight: "Real-time Insights"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors group">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <div className="text-sm font-medium text-blue-600">{feature.highlight}</div>
                  </div>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Security Experts</h2>
            <p className="text-xl text-blue-100">Industry-leading security meets cutting-edge AI</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "99.9%", label: "Uptime Guarantee", icon: <TrendingUp className="w-6 h-6 text-blue-300" /> },
              { number: "256-bit", label: "AES Encryption", icon: <Lock className="w-6 h-6 text-blue-300" /> },
              { number: "< 0.8s", label: "Response Time", icon: <Clock className="w-6 h-6 text-blue-300" /> },
              { number: "100%", label: "Data Ownership", icon: <UserCheck className="w-6 h-6 text-blue-300" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Developers & Security Teams
            </h2>
            <p className="text-xl text-gray-600">See what our users are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Finally, an AI platform that takes security seriously. The biometric authentication is seamless and the AI agent is incredibly smart.",
                author: "Sarah Chen",
                role: "Senior Security Engineer",
                avatar: "👩‍💻",
                rating: 5
              },
              {
                quote: "The cross-platform context preservation is game-changing. I can start a conversation in ChatGPT and continue seamlessly in Claude.",
                author: "Marcus Rodriguez",
                role: "AI Researcher",
                avatar: "👨‍🔬",
                rating: 5
              },
              {
                quote: "Complete data ownership with enterprise-grade security. This is exactly what we needed for our organization.",
                author: "Dr. Aisha Patel",
                role: "CTO, TechCorp",
                avatar: "👩‍⚕️",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built on Modern Standards
            </h2>
            <p className="text-xl text-gray-600">
              Leveraging the latest in web security and AI technology
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { name: "WebAuthn", description: "W3C Standard", icon: "🔐" },
              { name: "DID", description: "Decentralized ID", icon: "🆔" },
              { name: "OpenAI", description: "GPT-4 Integration", icon: "🤖" },
              { name: "Claude", description: "Anthropic AI", icon: "🧠" },
              { name: "Gemini", description: "Google AI", icon: "✨" },
              { name: "Next.js", description: "React Framework", icon: "⚛️" },
              { name: "Supabase", description: "Database & Auth", icon: "🗄️" },
              { name: "TypeScript", description: "Type Safety", icon: "📝" }
            ].map((tech, index) => (
              <div key={index} className="p-4">
                <div className="text-4xl mb-2">{tech.icon}</div>
                <div className="font-semibold text-gray-900">{tech.name}</div>
                <div className="text-sm text-gray-600">{tech.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have already upgraded to secure, intelligent AI interaction.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <Link 
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center justify-center space-x-3">
                <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Start Free with Biometrics</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            
            <Link 
              href="/demo"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-3">
                <Eye className="w-5 h-5" />
                <span>Watch Demo</span>
              </div>
            </Link>
          </div>

          <p className="text-sm text-blue-200">
            No credit card required • Setup in under 2 minutes • Enterprise-grade security
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-blue-100">Zero-password authentication</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-blue-100">Complete data ownership</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-blue-100">Cross-platform AI sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Fusion AI</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The future of AI interaction with secure biometric authentication and complete data ownership. 
                Experience seamless, intelligent conversations across all platforms.
              </p>
              <div className="text-sm text-gray-500">
                © 2024 Fusion AI. All rights reserved.
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-sm text-gray-500">
              Built with ❤️ using Next.js, WebAuthn, and W3C DID standards
            </div>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}