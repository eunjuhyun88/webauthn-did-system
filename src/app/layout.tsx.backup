/**
 * 🌟 Root Layout with Authentication Integration (수정됨)
 * WebAuthn + DID 시스템과 완전 통합된 레이아웃
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ToastProvider, Toaster } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fusion AI Dashboard',
  description: 'The future of AI interaction with secure biometric authentication',
  keywords: ['AI', 'WebAuthn', 'DID', 'Biometric', 'Security', 'Dashboard'],
  authors: [{ name: 'Fusion AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Fusion AI Dashboard',
    description: 'Secure AI interaction platform with biometric authentication',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fusion AI Dashboard',
    description: 'The future of AI interaction',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3B82F6" />
        
        {/* WebAuthn & Security Headers */}
        <meta httpEquiv="Content-Security-Policy" 
              content="default-src 'self'; 
                       script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; 
                       style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
                       font-src 'self' https://fonts.gstatic.com;
                       img-src 'self' data: https:;
                       connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com wss:;
                       frame-src 'self' https://accounts.google.com;" />
        
        {/* WebAuthn Origin Binding */}
        <meta name="webauthn-origin" content={process.env.NEXT_PUBLIC_APP_URL} />
        
        {/* Preconnect to AI Services */}
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="preconnect" href="https://api.anthropic.com" />
        <link rel="preconnect" href="https://generativelanguage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        {/* Toast Provider는 최상위에 위치 */}
        <ToastProvider>
          {/* Global Error Boundary */}
          <ErrorBoundary>
            {/* Authentication Context Provider */}
            <AuthProvider>
              {/* Global Loading State */}
              <div id="global-loading" className="hidden fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Loading...</p>
                </div>
              </div>

              {/* Main Content */}
              <main className="min-h-full">
                {children}
              </main>

              {/* Global Toast Notifications */}
              <Toaster />
              
              {/* Network Status Indicator */}
              <NetworkStatus />
              
              {/* Debug Panel (Development Only) */}
              {process.env.NODE_ENV === 'development' && <DebugPanel />}
            </AuthProvider>
          </ErrorBoundary>
        </ToastProvider>

        {/* Global Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global error handler
              window.addEventListener('error', function(e) {
                console.error('Global error:', e.error);
              });
              
              // WebAuthn feature detection
              window.webauthnSupported = !!window.PublicKeyCredential;
              
              // Global loading state helpers
              window.showGlobalLoading = function() {
                document.getElementById('global-loading')?.classList.remove('hidden');
              };
              
              window.hideGlobalLoading = function() {
                document.getElementById('global-loading')?.classList.add('hidden');
              };
              
              // Performance monitoring
              if (typeof window !== 'undefined' && 'performance' in window) {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                  }, 0);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

/**
 * 🛡️ Global Error Boundary Component
 */
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="error-boundary">
      {children}
    </div>
  );
}

/**
 * 📡 Network Status Indicator
 */
function NetworkStatus() {
  return (
    <div id="network-status" className="fixed bottom-4 left-4 z-40">
      {/* This will be populated by client-side JavaScript */}
    </div>
  );
}

/**
 * 🔧 Development Debug Panel
 */
function DebugPanel() {
  return (
    <div className="fixed bottom-4 right-4 z-40 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono max-w-sm">
      <div className="mb-2 font-bold">🔧 Debug Info</div>
      <div>Environment: {process.env.NODE_ENV}</div>
      <div>WebAuthn: <span id="debug-webauthn">Checking...</span></div>
      <div>Origin: {process.env.NEXT_PUBLIC_APP_URL}</div>
      <div>Platform: <span id="debug-platform">Detecting...</span></div>
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Update debug info
            document.addEventListener('DOMContentLoaded', function() {
              const webauthnEl = document.getElementById('debug-webauthn');
              const platformEl = document.getElementById('debug-platform');
              
              if (webauthnEl) {
                webauthnEl.textContent = window.PublicKeyCredential ? 'Supported' : 'Not Supported';
              }
              
              if (platformEl) {
                platformEl.textContent = navigator.platform || 'Unknown';
              }
            });
          `,
        }}
      />
    </div>
  );
}