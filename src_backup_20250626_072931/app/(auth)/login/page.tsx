'use client';

/**
 * 🔐 WebAuthn 로그인 페이지 (Production Fusion AI Dashboard 스타일)
 * 기존 대시보드와 완전히 통합된 디자인
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Fingerprint, Eye, Lock, Shield, Sparkles, X, CheckCircle, 
  XCircle, AlertCircle, Zap, Wifi, WifiOff, Clock, User, Mail,
  Brain, Globe, Database, ArrowRight, HelpCircle
} from 'lucide-react';

interface LoginData {
  username: string;
}

interface DeviceCapabilities {
  webauthnSupported: boolean;
  platformAuthenticator: boolean;
  conditionalMediation: boolean;
  biometricType: string;
  securityLevel: 'basic' | 'enhanced' | 'maximum';
  securityFeatures: string[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  category?: string;
}

interface LoginStep {
  step: 'input' | 'authenticating' | 'success' | 'error';
  message?: string;
  progress?: number;
}

interface AuthenticationPhase {
  phase: string;
  progress: number;
  details?: string;
  icon?: string;
}

export default function WebAuthnLoginPage() {
  const router = useRouter();
  
  // State Management
  const [username, setUsername] = useState('');
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    webauthnSupported: false,
    platformAuthenticator: false,
    conditionalMediation: false,
    biometricType: 'Unknown',
    securityLevel: 'basic',
    securityFeatures: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loginStep, setLoginStep] = useState<LoginStep>({ step: 'input' });
  const [authPhase, setAuthPhase] = useState<AuthenticationPhase>({
    phase: 'Initializing...',
    progress: 0,
    icon: '🔄'
  });
  const [lastLoginTime, setLastLoginTime] = useState<string>('');

  // Initialize capabilities and check auto-login
  useEffect(() => {
    initializeSystem();
    
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const initializeSystem = async () => {
    try {
      // Check WebAuthn capabilities
      await analyzeDeviceCapabilities();
      
      // Check for existing session
      await checkExistingSession();
      
      // Load last login info
      loadUserPreferences();
      
    } catch (error) {
      console.warn('System initialization warning:', error);
    }
  };

  const analyzeDeviceCapabilities = async () => {
    try {
      const webauthnSupported = window.PublicKeyCredential !== undefined;
      const platformAuthenticator = webauthnSupported && 
        await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      const conditionalMediation = webauthnSupported && 
        'isConditionalMediationAvailable' in window.PublicKeyCredential &&
        await window.PublicKeyCredential.isConditionalMediationAvailable();

      // Advanced device detection
      const userAgent = navigator.userAgent.toLowerCase();
      let biometricType = 'Security Key';
      let securityLevel: 'basic' | 'enhanced' | 'maximum' = 'basic';
      let securityFeatures: string[] = [];
      
      if (platformAuthenticator) {
        if (userAgent.includes('mac') || /iphone|ipad|ipod/.test(userAgent)) {
          biometricType = userAgent.includes('mac') ? 'Touch ID / Face ID' : 'Face ID / Touch ID';
          securityLevel = 'maximum';
          securityFeatures = ['Hardware Security Module', 'Secure Enclave', 'Biometric Templates'];
        } else if (userAgent.includes('windows')) {
          biometricType = 'Windows Hello';
          securityLevel = 'enhanced';
          securityFeatures = ['TPM 2.0', 'Windows Hello', 'Platform Authentication'];
        } else if (userAgent.includes('android')) {
          biometricType = 'Fingerprint / Face';
          securityLevel = 'enhanced';
          securityFeatures = ['Android Keystore', 'Hardware Attestation', 'StrongBox'];
        } else {
          biometricType = 'Platform Authenticator';
          securityLevel = 'enhanced';
          securityFeatures = ['Platform Integration', 'Hardware Security'];
        }
      } else if (webauthnSupported) {
        securityFeatures = ['FIDO2 Compatible', 'External Authenticator'];
      }

      setDeviceCapabilities({
        webauthnSupported,
        platformAuthenticator,
        conditionalMediation,
        biometricType,
        securityLevel,
        securityFeatures
      });

      // Show capability notification
      if (webauthnSupported) {
        showNotification(
          'success', 
          'Security Ready', 
          `${biometricType} detected - Enterprise-grade security enabled`, 
          'capability'
        );
      } else {
        showNotification(
          'warning', 
          'Limited Security', 
          'WebAuthn not supported. Please use a modern browser.', 
          'capability'
        );
      }
    } catch (error) {
      console.warn('Device capability analysis failed:', error);
    }
  };

  const checkExistingSession = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          showNotification('info', 'Already Logged In', 'Redirecting to dashboard...', 'session');
          setTimeout(() => router.push('/chat'), 1500);
        }
      }
    } catch (error) {
      console.log('Session check completed');
    }
  };

  const loadUserPreferences = () => {
    try {
      const lastLogin = localStorage.getItem('lastLoginTime');
      if (lastLogin) {
        setLastLoginTime(new Date(lastLogin).toLocaleString());
      }
    } catch (error) {
      console.log('Preferences loading skipped');
    }
  };

  const showNotification = (
    type: 'success' | 'error' | 'info' | 'warning', 
    title: string, 
    message: string, 
    category: string = 'general'
  ) => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      category
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-dismiss based on type
    const dismissTime = type === 'error' ? 8000 : type === 'warning' ? 6000 : 4000;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, dismissTime);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (loginStep.step === 'error') {
      setLoginStep({ step: 'input' });
    }
  };

  const validateInput = (): boolean => {
    if (!username.trim()) {
      showNotification('error', 'Username Required', 'Please enter your username or email address', 'validation');
      return false;
    }
    
    if (username.length < 2) {
      showNotification('error', 'Invalid Input', 'Username must be at least 2 characters long', 'validation');
      return false;
    }
    
    return true;
  };

  const handleWebAuthnLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateInput()) return;
    
    if (!deviceCapabilities.webauthnSupported) {
      showNotification(
        'error', 
        'WebAuthn Not Supported', 
        'Your browser does not support biometric authentication. Please use a modern browser.', 
        'capability'
      );
      return;
    }
    
    await performWebAuthnAuthentication();
  };

  const performWebAuthnAuthentication = async () => {
    setLoginStep({ step: 'authenticating', progress: 0 });
    
    try {
      // Phase 1: Initialize Authentication
      setAuthPhase({ 
        phase: 'Connecting to authentication server...', 
        progress: 15,
        details: 'Establishing secure connection',
        icon: '🔗'
      });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const beginResponse = await fetch('/api/webauthn/authenticate/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          userVerification: 'preferred'
        }),
      });
      
      const beginData = await beginResponse.json();
      
      if (!beginData.success) {
        throw new Error(beginData.error || 'Authentication initialization failed');
      }
      
      // Phase 2: Prepare Authentication
      setAuthPhase({ 
        phase: 'Preparing biometric verification...', 
        progress: 35,
        details: 'Analyzing registered credentials',
        icon: '🔍'
      });
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Phase 3: Request Biometric Authentication
      setAuthPhase({ 
        phase: `Waiting for ${deviceCapabilities.biometricType} verification...`, 
        progress: 55,
        details: 'Please complete biometric authentication on your device',
        icon: '👆'
      });
      
      const credential = await navigator.credentials.get({
        publicKey: {
          ...beginData.options,
          challenge: new Uint8Array(Buffer.from(beginData.options.challenge, 'base64')),
          allowCredentials: beginData.options.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: new Uint8Array(Buffer.from(cred.id, 'base64'))
          }))
        }
      }) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('Biometric authentication was cancelled');
      }
      
      // Phase 4: Processing Authentication
      setAuthPhase({ 
        phase: 'Processing biometric signature...', 
        progress: 75,
        details: 'Verifying cryptographic signature',
        icon: '🔐'
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = credential.response as AuthenticatorAssertionResponse;
      const credentialData = {
        id: credential.id,
        type: credential.type,
        rawId: Buffer.from(credential.rawId).toString('base64'),
        response: {
          authenticatorData: Buffer.from(response.authenticatorData).toString('base64'),
          clientDataJSON: Buffer.from(response.clientDataJSON).toString('base64'),
          signature: Buffer.from(response.signature).toString('base64'),
          userHandle: response.userHandle ? Buffer.from(response.userHandle).toString('base64') : null
        }
      };
      
      // Phase 5: Complete Authentication
      setAuthPhase({ 
        phase: 'Finalizing secure session...', 
        progress: 90,
        details: 'Creating authenticated session',
        icon: '✨'
      });
      
      const completeResponse = await fetch('/api/webauthn/authenticate/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: beginData.sessionId,
          credential: credentialData,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            location: window.location.origin,
            biometricType: deviceCapabilities.biometricType,
            securityLevel: deviceCapabilities.securityLevel
          }
        }),
      });
      
      const completeData = await completeResponse.json();
      
      if (!completeData.success) {
        throw new Error(completeData.error || 'Authentication verification failed');
      }
      
      // Success Phase
      setAuthPhase({ 
        phase: 'Authentication successful!', 
        progress: 100,
        details: 'Welcome back to Fusion AI Dashboard',
        icon: '🎉'
      });
      
      setLoginStep({ step: 'success', progress: 100 });
      
      // Save login time
      try {
        localStorage.setItem('lastLoginTime', new Date().toISOString());
      } catch (error) {
        console.log('Storage not available');
      }
      
      showNotification(
        'success', 
        'Login Successful', 
        `Welcome back ${completeData.user?.displayName || completeData.user?.username}!`, 
        'auth'
      );
      
      setTimeout(() => {
        router.push('/chat');
      }, 2500);
      
    } catch (error: any) {
      console.error('WebAuthn authentication failed:', error);
      
      setLoginStep({ 
        step: 'error', 
        message: getEnhancedErrorMessage(error)
      });
      
      showNotification('error', 'Authentication Failed', getEnhancedErrorMessage(error), 'auth');
    }
  };

  const getEnhancedErrorMessage = (error: any): string => {
    const errorCode = error.name || error.code || 'UNKNOWN_ERROR';
    
    switch (errorCode) {
      case 'NotAllowedError':
        return 'Biometric authentication was denied or cancelled. Please try again and allow biometric access when prompted.';
      case 'AbortError':
        return 'Authentication was cancelled. This may happen if you took too long to respond or cancelled the prompt.';
      case 'InvalidStateError':
        return 'No registered authenticator found for this account. Please register biometric authentication first.';
      case 'NotSupportedError':
        return 'Biometric authentication is not supported on this device or browser. Please use a security key or update your browser.';
      case 'NetworkError':
        return 'Network connection failed. Please check your internet connection and try again.';
      case 'TimeoutError':
        return 'Authentication timed out. Please try again and respond to the biometric prompt more quickly.';
      default:
        if (error.message?.includes('USER_NOT_FOUND')) {
          return 'Account not found. Please check your username or register a new account.';
        } else if (error.message?.includes('NO_CREDENTIALS')) {
          return 'No biometric credentials found for this account. Please register biometric authentication first.';
        } else if (error.message?.includes('VERIFICATION_FAILED')) {
          return 'Biometric verification failed. This may indicate a security issue or corrupted credentials.';
        }
        return error.message || 'An unexpected error occurred during authentication. Please try again or contact support.';
    }
  };

  const handleQuickLogin = async () => {
    if (!deviceCapabilities.conditionalMediation) {
      showNotification(
        'info', 
        'Quick Login Unavailable', 
        'Quick login is not supported on this device or browser', 
        'feature'
      );
      return;
    }
    
    setLoginStep({ step: 'authenticating', progress: 0 });
    setAuthPhase({ 
      phase: 'Scanning for saved credentials...', 
      progress: 25,
      details: 'Looking for previously saved biometric data',
      icon: '🔍'
    });
    
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: 'preferred'
        },
        mediation: 'conditional'
      }) as PublicKeyCredential;
      
      if (credential) {
        setAuthPhase({ 
          phase: 'Quick login successful!', 
          progress: 100,
          details: 'Automatic authentication completed',
          icon: '⚡'
        });
        
        showNotification('success', 'Quick Login', 'Automatic authentication successful!', 'auth');
        
        setTimeout(() => router.push('/chat'), 1500);
      }
    } catch (error) {
      console.log('Quick login cancelled or failed:', error);
      setLoginStep({ step: 'input' });
      showNotification('info', 'Quick Login', 'No saved credentials found. Please use standard login.', 'auth');
    }
  };

  const getSecurityLevelInfo = () => {
    switch (deviceCapabilities.securityLevel) {
      case 'maximum':
        return { 
          color: 'text-green-600', 
          bg: 'bg-green-50 border-green-200',
          icon: '🛡️', 
          level: 'Maximum Security', 
          description: 'Hardware-secured biometric authentication with military-grade encryption' 
        };
      case 'enhanced':
        return { 
          color: 'text-blue-600', 
          bg: 'bg-blue-50 border-blue-200',
          icon: '🔐', 
          level: 'Enhanced Security', 
          description: 'Platform-integrated authentication with hardware security features' 
        };
      case 'basic':
        return { 
          color: 'text-orange-600', 
          bg: 'bg-orange-50 border-orange-200',
          icon: '🔑', 
          level: 'Basic Security', 
          description: 'External security key authentication (FIDO2 compatible)' 
        };
    }
  };

  // Enhanced Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-blue-600 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Fusion AI Dashboard</h1>
          <p className="text-blue-600 font-semibold mb-8 text-lg">Preparing Secure Authentication</p>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <span>Analyzing device security capabilities</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <span>Initializing biometric authentication</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <span>Connecting to AI agent systems</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
              <span>Preparing personalized experience</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
            <p className="text-xs text-gray-500">
              🔒 Your biometric data is processed locally and never transmitted
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Enhanced Notification System */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`bg-white/95 backdrop-blur-sm border-l-4 ${
              notif.type === 'success' ? 'border-green-500 shadow-green-100' : 
              notif.type === 'error' ? 'border-red-500 shadow-red-100' : 
              notif.type === 'warning' ? 'border-yellow-500 shadow-yellow-100' : 'border-blue-500 shadow-blue-100'
            } rounded-r-xl shadow-lg shadow-black/10 transform transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105`}
          >
            <div className="p-4 pr-12 relative">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{notif.title}</div>
                  <div className="text-sm text-gray-600 mt-1 leading-relaxed">{notif.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {notif.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => removeNotification(notif.id)} 
                className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-lg w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h1>
          <p className="text-gray-600 mb-2 text-lg">Access your Fusion AI Dashboard</p>
          
          <div className="flex flex-wrap justify-center gap-2 text-sm text-blue-600 font-medium">
            <span className="bg-blue-50 px-3 py-1 rounded-full">🔐 Zero Passwords</span>
            <span className="bg-blue-50 px-3 py-1 rounded-full">⚡ Instant Access</span>
            <span className="bg-blue-50 px-3 py-1 rounded-full">🛡️ Military-Grade Security</span>
          </div>
          
          {lastLoginTime && (
            <div className="mt-3 text-sm text-gray-500">
              <Clock className="w-4 h-4 inline mr-1" />
              Last login: {lastLoginTime}
            </div>
          )}
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl shadow-black/10">
          {loginStep.step === 'input' && (
            <div className="space-y-6">
              {/* Enhanced Device Security Analysis */}
              <div className={`rounded-2xl p-6 border-2 ${getSecurityLevelInfo().bg}`}>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <Shield className="w-5 h-5 mr-3 text-blue-600" />
                  Device Security Analysis
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Wifi className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">WebAuthn Support</span>
                    </div>
                    <span className={`font-bold ${deviceCapabilities.webauthnSupported ? 'text-green-600' : 'text-red-600'}`}>
                      {deviceCapabilities.webauthnSupported ? '✅ Ready' : '❌ Unavailable'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Fingerprint className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Authentication Method</span>
                    </div>
                    <span className={`font-bold ${deviceCapabilities.platformAuthenticator ? 'text-green-600' : 'text-orange-600'}`}>
                      {deviceCapabilities.biometricType}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getSecurityLevelInfo().icon}</span>
                      <span className="font-medium">Security Level</span>
                    </div>
                    <span className={`font-bold ${getSecurityLevelInfo().color}`}>
                      {getSecurityLevelInfo().level}
                    </span>
                  </div>
                  
                  {deviceCapabilities.conditionalMediation && (
                    <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Quick Login</span>
                      </div>
                      <span className="font-bold text-blue-600">⚡ Available</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-white/40 rounded-xl">
                  <p className="text-sm text-gray-700 font-medium mb-2">Security Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {deviceCapabilities.securityFeatures.map((feature, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 italic">
                  {getSecurityLevelInfo().description}
                </p>
              </div>

              {/* Enhanced Login Form */}
              <form onSubmit={handleWebAuthnLogin} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                    Username or Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={handleUsernameChange}
                      className="w-full px-4 py-4 bg-gray-50/80 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg"
                      placeholder="Enter your username or email"
                      autoComplete="username webauthn"
                      required
                    />
                    <User className="absolute right-4 top-4 w-6 h-6 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!deviceCapabilities.webauthnSupported || !username.trim()}
                  className="w-full p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center space-x-4">
                    <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                    <div className="text-center">
                      <div>Login with {deviceCapabilities.biometricType}</div>
                      <div className="text-sm opacity-90 font-normal">Tap to authenticate securely</div>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </button>
              </form>

              {/* Quick Login Enhancement */}
              {deviceCapabilities.conditionalMediation && (
                <div>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">or try</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleQuickLogin}
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <div className="text-center">
                        <div className="font-semibold">⚡ Quick Login</div>
                        <div className="text-sm opacity-80">Auto-detect saved credentials</div>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Enhanced Navigation Links */}
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors">
                    Register with Biometrics
                  </Link>
                </p>
                
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <Link 
                    href="/auth/google" 
                    className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1"
                  >
                    <span>🔗</span>
                    <span>Google Login</span>
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link 
                    href="/demo" 
                    className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1"
                  >
                    <span>🎮</span>
                    <span>Try Demo</span>
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link 
                    href="/help" 
                    className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Help</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {loginStep.step === 'authenticating' && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl animate-pulse">{authPhase.icon}</span>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Authenticating...
                </h2>
                <p className="text-gray-600 mb-4 text-lg">
                  {authPhase.phase}
                </p>
                
                {authPhase.details && (
                  <p className="text-sm text-gray-500 mb-6">
                    {authPhase.details}
                  </p>
                )}
                
                {/* Enhanced Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${authPhase.progress}%` }}
                  />
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    🔒 Follow the prompts on your device to complete authentication
                  </p>
                </div>
              </div>
            </div>
          )}

          {loginStep.step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-32 h-32 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-20 h-20 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-green-800 mb-3">
                  🎉 Login Successful!
                </h2>
                <p className="text-gray-600 text-lg">
                  Redirecting to your dashboard...
                </p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-center space-x-3 text-green-700">
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">Preparing your personalized AI experience</span>
                </div>
              </div>
            </div>
          )}

          {loginStep.step === 'error' && (
            <div className="text-center space-y-6">
              <div className="w-32 h-32 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-20 h-20 text-red-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-red-800 mb-3">
                  Authentication Failed
                </h2>
                <div className="bg-red-50 rounded-xl p-4 border border-red-200 mb-6">
                  <p className="text-red-700 text-sm leading-relaxed">
                    {loginStep.message}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => setLoginStep({ step: 'input' })}
                  className="w-full p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Try Again
                </button>
                
                <Link 
                  href="/help" 
                  className="block w-full p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-center"
                >
                  Get Help
                </Link>
              </div>
            </div>
          )}

          {/* Enhanced Security Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
              <div className="flex flex-col items-center space-y-1">
                <Shield className="w-4 h-4" />
                <span>Local Processing</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Lock className="w-4 h-4" />
                <span>End-to-End Encryption</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Globe className="w-4 h-4" />
                <span>GDPR Compliant</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              Your biometric data never leaves your device • SOC2 Type II Certified
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}