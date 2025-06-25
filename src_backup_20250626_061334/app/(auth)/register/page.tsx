'use client';

/**
 * 🔐 WebAuthn 회원가입 페이지 (Production Fusion AI Dashboard 스타일)
 * 기존 대시보드와 완전히 통합된 디자인
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Fingerprint, Eye, Lock, Shield, Sparkles, X, CheckCircle, 
  XCircle, AlertCircle, Zap, User, Mail, UserCircle, ArrowRight,
  Brain, Database, Globe, Award
} from 'lucide-react';

interface RegistrationData {
  username: string;
  email: string;
  displayName: string;
}

interface DeviceCapabilities {
  webauthnSupported: boolean;
  platformAuthenticator: boolean;
  biometricType: string;
  securityLevel: 'basic' | 'enhanced' | 'maximum';
}

interface RegistrationStep {
  step: 'form' | 'biometric' | 'processing' | 'success' | 'error';
  message?: string;
  progress?: number;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
}

interface ProcessingPhase {
  phase: string;
  progress: number;
  details?: string;
}

export default function WebAuthnRegisterPage() {
  const router = useRouter();
  
  // State Management
  const [formData, setFormData] = useState<RegistrationData>({
    username: '',
    email: '',
    displayName: ''
  });
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    webauthnSupported: false,
    platformAuthenticator: false,
    biometricType: 'Unknown',
    securityLevel: 'basic'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>({ step: 'form' });
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>({
    phase: 'Initializing...',
    progress: 0
  });
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  // Initialize capabilities
  useEffect(() => {
    initializeCapabilities();
    
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const initializeCapabilities = async () => {
    try {
      const webauthnSupported = window.PublicKeyCredential !== undefined;
      const platformAuthenticator = webauthnSupported && 
        await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

      // Detect biometric type and security level
      const userAgent = navigator.userAgent.toLowerCase();
      let biometricType = 'Security Key';
      let securityLevel: 'basic' | 'enhanced' | 'maximum' = 'basic';
      
      if (platformAuthenticator) {
        if (userAgent.includes('mac') || /iphone|ipad|ipod/.test(userAgent)) {
          biometricType = userAgent.includes('mac') ? 'Touch ID / Face ID' : 'Face ID / Touch ID';
          securityLevel = 'maximum';
        } else if (userAgent.includes('windows')) {
          biometricType = 'Windows Hello';
          securityLevel = 'enhanced';
        } else if (userAgent.includes('android')) {
          biometricType = 'Fingerprint / Face';
          securityLevel = 'enhanced';
        } else {
          biometricType = 'Platform Authenticator';
          securityLevel = 'enhanced';
        }
      }

      setDeviceCapabilities({
        webauthnSupported,
        platformAuthenticator,
        biometricType,
        securityLevel
      });

      if (webauthnSupported) {
        showNotification('success', 'Biometric Ready', `${biometricType} available for secure registration`, 'capability');
      }
    } catch (error) {
      console.warn('WebAuthn capability check failed:', error);
    }
  };

  const showNotification = (
    type: 'success' | 'error' | 'info' | 'warning', 
    title: string, 
    message: string, 
    category: string = 'general'
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (registrationStep.step === 'error') {
      setRegistrationStep({ step: 'form' });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      showNotification('error', 'Username Required', 'Please enter a unique username', 'validation');
      return false;
    }
    
    if (formData.username.length < 3) {
      showNotification('error', 'Username Too Short', 'Username must be at least 3 characters long', 'validation');
      return false;
    }
    
    if (!formData.email.trim()) {
      showNotification('error', 'Email Required', 'Please enter your email address', 'validation');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showNotification('error', 'Invalid Email', 'Please enter a valid email address', 'validation');
      return false;
    }
    
    if (!formData.displayName.trim()) {
      showNotification('error', 'Display Name Required', 'Please enter your display name', 'validation');
      return false;
    }
    
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!deviceCapabilities.webauthnSupported) {
      showNotification('error', 'WebAuthn Not Supported', 'Your browser does not support secure biometric registration', 'capability');
      return;
    }
    
    setRegistrationStep({ step: 'biometric' });
  };

  const handleBiometricRegistration = async () => {
    setRegistrationStep({ step: 'processing', progress: 0 });
    
    try {
      // Phase 1: Initialize Registration
      setProcessingPhase({ 
        phase: 'Connecting to registration server...', 
        progress: 10,
        details: 'Establishing secure connection'
      });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const beginResponse = await fetch('/api/webauthn/register/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          displayName: formData.displayName,
          userVerification: 'required'
        }),
      });
      
      const beginData = await beginResponse.json();
      
      if (!beginData.success) {
        throw new Error(beginData.error || 'Registration initialization failed');
      }
      
      // Phase 2: Generate Cryptographic Keys
      setProcessingPhase({ 
        phase: 'Generating secure cryptographic keys...', 
        progress: 30,
        details: 'Creating unique identity keys'
      });
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Phase 3: Request Biometric Enrollment
      setProcessingPhase({ 
        phase: `Setting up ${deviceCapabilities.biometricType}...`, 
        progress: 50,
        details: 'Please complete biometric enrollment'
      });
      
      const credential = await navigator.credentials.create({
        publicKey: {
          ...beginData.options,
          challenge: new Uint8Array(Buffer.from(beginData.options.challenge, 'base64')),
          user: {
            ...beginData.options.user,
            id: new Uint8Array(Buffer.from(beginData.options.user.id, 'base64'))
          },
          excludeCredentials: beginData.options.excludeCredentials?.map((cred: any) => ({
            ...cred,
            id: new Uint8Array(Buffer.from(cred.id, 'base64'))
          }))
        }
      }) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('Biometric enrollment was cancelled');
      }
      
      // Phase 4: Process Biometric Data
      setProcessingPhase({ 
        phase: 'Processing biometric enrollment...', 
        progress: 70,
        details: 'Securing your biometric signature'
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialData = {
        id: credential.id,
        type: credential.type,
        rawId: Buffer.from(credential.rawId).toString('base64'),
        response: {
          attestationObject: Buffer.from(response.attestationObject).toString('base64'),
          clientDataJSON: Buffer.from(response.clientDataJSON).toString('base64'),
        }
      };
      
      // Phase 5: Create Account & DID
      setProcessingPhase({ 
        phase: 'Creating your digital identity...', 
        progress: 85,
        details: 'Generating W3C DID and AI agent profile'
      });
      
      const completeResponse = await fetch('/api/webauthn/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(completeData.error || 'Registration completion failed');
      }
      
      // Phase 6: Initialize AI Agent
      setProcessingPhase({ 
        phase: 'Initializing your AI agent...', 
        progress: 95,
        details: 'Personalizing your AI experience'
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Success!
      setProcessingPhase({ 
        phase: 'Registration complete!', 
        progress: 100,
        details: 'Welcome to Fusion AI Dashboard'
      });
      
      setRegistrationResult(completeData);
      setRegistrationStep({ step: 'success' });
      
      showNotification('success', 'Registration Successful', 'Your secure account has been created!', 'registration');
      
    } catch (error: any) {
      console.error('WebAuthn registration failed:', error);
      
      setRegistrationStep({ 
        step: 'error', 
        message: getErrorMessage(error)
      });
      
      showNotification('error', 'Registration Failed', getErrorMessage(error), 'registration');
    }
  };

  const getErrorMessage = (error: any): string => {
    if (error.name === 'NotAllowedError') {
      return 'Biometric enrollment was denied. Please try again and allow biometric access.';
    } else if (error.name === 'AbortError') {
      return 'Registration was cancelled. Please try again.';
    } else if (error.name === 'InvalidStateError') {
      return 'A credential already exists for this device. Please use login instead.';
    } else if (error.name === 'NotSupportedError') {
      return 'Biometric registration is not supported on this device.';
    } else if (error.message.includes('username')) {
      return 'Username already exists. Please choose a different username.';
    } else if (error.message.includes('email')) {
      return 'Email already registered. Please use a different email or try logging in.';
    }
    return error.message || 'An unexpected error occurred during registration';
  };

  const handleGoToDashboard = () => {
    router.push('/chat');
  };

  const getSecurityLevelInfo = () => {
    switch (deviceCapabilities.securityLevel) {
      case 'maximum':
        return { color: 'text-green-600', icon: '🛡️', level: 'Maximum Security', description: 'Hardware-secured biometrics' };
      case 'enhanced':
        return { color: 'text-blue-600', icon: '🔐', level: 'Enhanced Security', description: 'Platform-integrated authentication' };
      case 'basic':
        return { color: 'text-yellow-600', icon: '🔑', level: 'Basic Security', description: 'External security key required' };
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Sparkles className="w-10 h-10 text-blue-600 absolute top-5 left-1/2 transform -translate-x-1/2" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Fusion AI Dashboard</h1>
          <p className="text-blue-600 font-medium mb-6">Preparing Secure Registration</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Analyzing device security capabilities</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Preparing biometric enrollment</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Initializing AI agent systems</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Enhanced Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`bg-white border-l-4 ${
              notif.type === 'success' ? 'border-green-500' : 
              notif.type === 'error' ? 'border-red-500' : 
              notif.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
            } rounded-r-lg shadow-lg transform transition-all duration-300 ease-in-out hover:shadow-xl`}
          >
            <div className="p-4 pr-12 relative">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{notif.title}</div>
                  <div className="text-sm text-gray-600 mt-1 leading-relaxed">{notif.message}</div>
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
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              ['form', 'biometric', 'processing', 'success'].includes(registrationStep.step) ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
            <div className={`w-3 h-3 rounded-full ${
              ['biometric', 'processing', 'success'].includes(registrationStep.step) ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
            <div className={`w-3 h-3 rounded-full ${
              ['processing', 'success'].includes(registrationStep.step) ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
            <div className={`w-3 h-3 rounded-full ${
              registrationStep.step === 'success' ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-500">
              {registrationStep.step === 'form' && '1/4: Account Information'}
              {registrationStep.step === 'biometric' && '2/4: Security Setup'}
              {registrationStep.step === 'processing' && '3/4: Creating Account'}
              {registrationStep.step === 'success' && '4/4: Complete'}
              {registrationStep.step === 'error' && 'Registration Error'}
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Create Your Account</h1>
          <p className="text-gray-600 mb-2">Join the future of AI interaction</p>
          <div className="text-sm text-blue-600 space-y-1">
            <div>• Secure Biometric Registration • Zero Passwords • Complete Data Ownership</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 shadow-xl">
          {registrationStep.step === 'form' && (
            <div className="space-y-6">
              {/* Security Capabilities */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  🔍 Device Security Analysis
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>WebAuthn Support</span>
                    <span className={deviceCapabilities.webauthnSupported ? 'text-green-600 font-medium' : 'text-red-600'}>
                      {deviceCapabilities.webauthnSupported ? '✅ Ready' : '❌ Unavailable'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Biometric Type</span>
                    <span className={deviceCapabilities.platformAuthenticator ? 'text-green-600 font-medium' : 'text-orange-600'}>
                      {deviceCapabilities.biometricType}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Security Level</span>
                    <span className={`font-medium ${getSecurityLevelInfo().color}`}>
                      {getSecurityLevelInfo().icon} {getSecurityLevelInfo().level}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2 italic">
                  {getSecurityLevelInfo().description}
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Choose a unique username"
                      autoComplete="username"
                      required
                    />
                    <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                    />
                    <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Your display name"
                      autoComplete="name"
                      required
                    />
                    <UserCircle className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!deviceCapabilities.webauthnSupported}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <div className="text-center">
                      <div>Continue to Biometric Setup</div>
                      <div className="text-sm opacity-90">Next: {deviceCapabilities.biometricType}</div>
                    </div>
                  </div>
                </button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium underline">
                    Login with Biometrics
                  </Link>
                </p>
              </div>
            </div>
          )}

          {registrationStep.step === 'biometric' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Fingerprint className="w-12 h-12 text-blue-600" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Setup {deviceCapabilities.biometricType}
                </h2>
                <p className="text-gray-600 mb-4">
                  Your biometric signature will be your secure login method
                </p>
              </div>

              {/* Account Summary */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">👤 Account Summary</h3>
                <div className="text-sm text-blue-700 space-y-1 text-left">
                  <p><strong>Username:</strong> {formData.username}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Display Name:</strong> {formData.displayName}</p>
                  <p><strong>Security:</strong> {getSecurityLevelInfo().level}</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">🚀 What You'll Get</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>Personalized AI Agent (Level 1)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Secure Data Vault</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>W3C Standard DID Identity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>Enterprise-Grade Security</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBiometricRegistration}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <div>Enroll {deviceCapabilities.biometricType}</div>
                      <div className="text-sm opacity-90">Tap to start secure enrollment</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setRegistrationStep({ step: 'form' })}
                  className="w-full p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  ← Back to Form
                </button>
              </div>
            </div>
          )}

          {registrationStep.step === 'processing' && (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <Sparkles className="w-8 h-8 text-blue-600 absolute" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Creating Your Account...
                </h2>
                <p className="text-gray-600 mb-4">
                  {processingPhase.phase}
                </p>
                
                {processingPhase.details && (
                  <p className="text-sm text-blue-600 mb-4 italic">
                    {processingPhase.details}
                  </p>
                )}
                
                {/* Enhanced Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative"
                    style={{ width: `${processingPhase.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse"></div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Progress: {processingPhase.progress}%</p>
                  <p className="text-xs">Please do not close this window</p>
                </div>
              </div>

              {/* Processing Steps Visualization */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="space-y-2 text-sm">
                  <div className={`flex items-center space-x-2 ${processingPhase.progress >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${processingPhase.progress >= 10 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Server Connection</span>
                    {processingPhase.progress >= 10 && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div className={`flex items-center space-x-2 ${processingPhase.progress >= 30 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${processingPhase.progress >= 30 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Cryptographic Keys</span>
                    {processingPhase.progress >= 30 && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div className={`flex items-center space-x-2 ${processingPhase.progress >= 50 ? 'text-green-600' : processingPhase.progress >= 30 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${processingPhase.progress >= 50 ? 'bg-green-500' : processingPhase.progress >= 30 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span>Biometric Enrollment</span>
                    {processingPhase.progress >= 50 && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div className={`flex items-center space-x-2 ${processingPhase.progress >= 85 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${processingPhase.progress >= 85 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Digital Identity (DID)</span>
                    {processingPhase.progress >= 85 && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div className={`flex items-center space-x-2 ${processingPhase.progress >= 95 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${processingPhase.progress >= 95 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>AI Agent Setup</span>
                    {processingPhase.progress >= 95 && <CheckCircle className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {registrationStep.step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-green-800 mb-2">
                  🎉 Registration Complete!
                </h2>
                <p className="text-gray-600">
                  Welcome to the future of AI interaction
                </p>
              </div>

              {/* Success Details */}
              {registrationResult && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-left">
                  <h3 className="font-semibold text-green-800 mb-3 text-center">🎊 Your New Digital Identity</h3>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="font-medium text-gray-800 mb-1">Account Details</div>
                      <div className="space-y-1 text-xs">
                        <p><strong>Username:</strong> {registrationResult.user?.username}</p>
                        <p><strong>Email:</strong> {registrationResult.user?.email}</p>
                        <p><strong>Display Name:</strong> {registrationResult.user?.displayName}</p>
                        <p><strong>Created:</strong> {new Date().toLocaleString('ko-KR')}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="font-medium text-gray-800 mb-1">Digital Identity (DID)</div>
                      <div className="text-xs font-mono bg-gray-100 p-2 rounded border break-all">
                        {registrationResult.user?.did}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="font-medium text-gray-800 mb-1">Security Features</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Hardware-secured biometric authentication</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>W3C DID standard compliance</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Zero-knowledge architecture</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>Phishing-resistant authentication</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Agent Welcome */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">🤖 Your AI Agent is Ready</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">Fusion AI Agent</div>
                        <div className="text-xs text-gray-600">Level 1 • Personal Assistant</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>• Learning your preferences and patterns</p>
                      <p>• Ready for natural language conversations</p>
                      <p>• Secure data processing and storage</p>
                      <p>• Cross-platform context preservation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-3">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <div className="text-center">
                      <div>Enter Your Dashboard</div>
                      <div className="text-sm opacity-90">Start your AI-powered journey</div>
                    </div>
                  </div>
                </button>

                <div className="flex space-x-3 text-sm">
                  <button
                    onClick={() => showNotification('info', 'Getting Started', 'Welcome guide will be available in your dashboard', 'guide')}
                    className="flex-1 p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    📚 Quick Start Guide
                  </button>
                  <button
                    onClick={() => showNotification('info', 'Security Settings', 'Advanced security options available in settings', 'security')}
                    className="flex-1 p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    🔒 Security Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {registrationStep.step === 'error' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-red-800 mb-2">
                  Registration Failed
                </h2>
                <p className="text-gray-600 mb-4">
                  {registrationStep.message}
                </p>
              </div>

              {/* Error Help */}
              <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-left">
                <h3 className="font-semibold text-red-800 mb-2">💡 Troubleshooting Tips</h3>
                <div className="text-sm text-red-700 space-y-1">
                  <p>• Make sure your device supports biometric authentication</p>
                  <p>• Check that you've allowed biometric access in your browser</p>
                  <p>• Try refreshing the page and starting over</p>
                  <p>• Ensure you're using a secure HTTPS connection</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setRegistrationStep({ step: 'form' })}
                  className="w-full p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                
                <div className="text-center">
                  <Link 
                    href="/login" 
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Already have an account? Login here
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Security Footer */}
          <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Hardware Security</span>
              </div>
              <div className="flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Zero-Knowledge</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>W3C Standards</span>
              </div>
            </div>
            <p>Your biometric data never leaves your device • Complete data ownership guaranteed</p>
          </div>
        </div>
      </div>
    </div>
  );
}