'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Shield } from 'lucide-react';
import { usePassport } from '@/hooks/passport/use-passport';
import { useChat } from '@/hooks/chat/use-chat';

export const ChatInterface: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { passport } = usePassport();
  const { messages, isTyping, sendMessage } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
              <Brain className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">개인화 AI와 대화하기</h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              당신의 AI Passport 데이터를 활용한 완전 맞춤형 AI와 대화하세요. 
              대화할 때마다 CUE 토큰을 채굴하고 개성이 더욱 정확해집니다.
            </p>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] lg:max-w-[70%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.type === 'ai' && (
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">AI Passport Agent</span>
                      {message.verification && (
                        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <Shield className="w-3 h-3" />
                          <span className="text-xs">검증됨</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`p-4 lg:p-5 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-white border border-gray-200 shadow-sm'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm lg:text-base leading-relaxed">
                      {message.content}
                    </div>
                    
                    {message.usedPassportData && (
                      <div className="mt-4 pt-4 border-t border-indigo-200">
                        <div className="text-xs text-indigo-200 mb-2">사용된 AI Passport 데이터:</div>
                        <div className="flex flex-wrap gap-1">
                          {message.usedPassportData.map((data, idx) => (
                            <span key={idx} className="bg-indigo-500 bg-opacity-30 px-2 py-1 rounded text-xs">
                              {data}
                            </span>
                          ))}
                        </div>
                        {message.cueTokensEarned && (
                          <div className="text-xs text-indigo-200 mt-2">
                            💎 +{message.cueTokensEarned} CUE 토큰 채굴됨
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-4 lg:p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-sm text-gray-600">AI가 개성 데이터를 분석 중...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-gray-200 p-4 lg:p-6 bg-white flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4 items-end">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyPress={handleKeyPress}
                placeholder="AI Passport 데이터를 활용한 개인화 응답을 받고 CUE를 채굴하세요..."
                className={`w-full min-h-[52px] max-h-[120px] px-4 lg:px-5 py-3 lg:py-4 bg-gray-50 border-2 rounded-2xl resize-none focus:outline-none focus:bg-white transition-all text-sm lg:text-base ${
                  inputFocused ? 'border-indigo-500 shadow-lg' : 'border-gray-200'
                }`}
                rows={1}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-semibold transition-all flex items-center space-x-2 shadow-lg ${
                newMessage.trim()
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden sm:inline">전송</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
