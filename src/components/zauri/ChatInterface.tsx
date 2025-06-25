'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, Database, Network, Sparkles, Zap, Activity } from 'lucide-react';
import { ZauriMessage, ZauriUser } from '@/types/zauri';

interface ChatInterfaceProps {
  user: ZauriUser;
  messages: ZauriMessage[];
  onSendMessage: (content: string) => void;
  isTyping?: boolean;
  activeTransfers?: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  user,
  messages,
  onSendMessage,
  isTyping = false,
  activeTransfers = 0
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
        <Brain className="w-10 h-10 text-indigo-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Zauri와 대화하기</h2>
      <p className="text-gray-600 text-lg mb-8 leading-relaxed">
        RAG-DAG 기반 개인화 AI와 대화하면서 크로스플랫폼 맥락을 실시간으로 동기화하고 토큰을 채굴하세요.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
          <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">RAG-DAG 개인화</h3>
          <p className="text-sm text-gray-600">지식 그래프 기반 맞춤 응답</p>
        </div>
        
        <div className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
          <Network className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">크로스플랫폼</h3>
          <p className="text-sm text-gray-600">28:1 압축, 88% 의미 보존</p>
        </div>
        
        <div className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all">
          <Sparkles className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">토큰 채굴</h3>
          <p className="text-sm text-gray-600">대화마다 자동 ZRP 획득</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <span className="text-lg">{user.agentPassport.avatar}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.agentPassport.name}</h3>
            <p className="text-sm text-gray-500">Level {user.agentPassport.level} • {user.agentPassport.trustScore}% Trust</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {activeTransfers > 0 && (
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              <Activity className="w-3 h-3 animate-pulse" />
              <span className="text-xs font-medium">{activeTransfers} 동기화</span>
            </div>
          )}
          
          <div className="text-right">
            <div className="text-sm font-semibold text-green-600">
              +{user.agentPassport.earningsToday} ZRP
            </div>
            <div className="text-xs text-gray-500">오늘 수익</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] lg:max-w-[70%]`}>
                  {message.type === 'ai' && (
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{user.agentPassport.avatar}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user.agentPassport.name}</span>
                      {message.ragRelevance && (
                        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <Database className="w-3 h-3" />
                          <span className="text-xs">RAG {Math.round(message.ragRelevance * 100)}%</span>
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
                    
                    {message.type === 'ai' && (message.contextUsed || message.tokensEarned || message.platforms) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {message.contextUsed && (
                          <div className="mb-2">
                            <div className="text-xs text-gray-600 mb-1">사용된 컨텍스트:</div>
                            <div className="flex flex-wrap gap-1">
                              {message.contextUsed.map((context, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                  {context}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-4">
                            {message.tokensEarned && (
                              <div className="flex items-center space-x-1 text-green-600">
                                <Sparkles className="w-3 h-3" />
                                <span>+{message.tokensEarned} ZRP</span>
                              </div>
                            )}
                            
                            {message.compressionRatio && (
                              <div className="flex items-center space-x-1 text-purple-600">
                                <Zap className="w-3 h-3" />
                                <span>{Math.round((1 - message.compressionRatio) * 100)}% 압축</span>
                              </div>
                            )}
                          </div>
                          
                          {message.platforms && (
                            <div className="text-gray-500">
                              동기화: {message.platforms.join(', ')}
                            </div>
                          )}
                        </div>
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
                    <span className="text-sm text-gray-600">RAG-DAG 분석 중...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
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
                placeholder="Zauri와 대화하며 RAG-DAG 지식 그래프를 구축하고 토큰을 채굴하세요..."
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
