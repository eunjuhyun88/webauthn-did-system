// =============================================================================
// 🔄 플랫폼 간 동기화 관리자
// src/lib/cue/PlatformSyncManager.ts
// ChatGPT, Claude, Discord 등 플랫폼에서 대화 데이터를 수집하고 Cue 추출
// =============================================================================

import { PlatformSyncStatus, MessageContext, PersonalCue } from '@/types/cue';
import CueExtractor from './CueExtractor';

export interface PlatformAdapter {
  platformName: string;
  connect(authConfig: any): Promise<boolean>;
  fetchMessages(since?: Date, limit?: number): Promise<MessageContext[]>;
  getConnectionStatus(): PlatformSyncStatus;
  disconnect(): Promise<void>;
}

export interface SyncResult {
  platform: string;
  success: boolean;
  messagesProcessed: number;
  cuesExtracted: number;
  cuesReinforced: number;
  errors: string[];
  syncDuration: number;
  nextSyncAt?: Date;
}

export class PlatformSyncManager {
  private adapters: Map<string, PlatformAdapter>;
  private cueExtractor: CueExtractor;
  private syncScheduler: Map<string, NodeJS.Timeout>;

  constructor() {
    this.adapters = new Map();
    this.cueExtractor = new CueExtractor();
    this.syncScheduler = new Map();
    
    this.initializeAdapters();
  }

  // =============================================================================
  // 🔧 플랫폼 어댑터 초기화
  // =============================================================================

  private initializeAdapters(): void {
    // ChatGPT 어댑터
    this.adapters.set('chatgpt', new ChatGPTAdapter());
    
    // Claude 어댑터  
    this.adapters.set('claude', new ClaudeAdapter());
    
    // Discord 어댑터
    this.adapters.set('discord', new DiscordAdapter());
    
    // Gmail 어댑터
    this.adapters.set('gmail', new GmailAdapter());
    
    // Notion 어댑터
    this.adapters.set('notion', new NotionAdapter());
    
    // Slack 어댑터
    this.adapters.set('slack', new SlackAdapter());
  }

  // =============================================================================
  // 🚀 메인 동기화 메서드
  // =============================================================================

  async syncAllPlatforms(userDid: string): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    
    // 활성화된 플랫폼들 가져오기
    const activePlatforms = await this.getActivePlatforms(userDid);
    
    // 병렬로 동기화 실행
    const syncPromises = activePlatforms.map(platform => 
      this.syncPlatform(userDid, platform.platform)
    );
    
    const syncResults = await Promise.allSettled(syncPromises);
    
    syncResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          platform: activePlatforms[index].platform,
          success: false,
          messagesProcessed: 0,
          cuesExtracted: 0,
          cuesReinforced: 0,
          errors: [result.reason?.message || 'Unknown error'],
          syncDuration: 0
        });
      }
    });

    return results;
  }

  async syncPlatform(userDid: string, platformName: string): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      platform: platformName,
      success: false,
      messagesProcessed: 0,
      cuesExtracted: 0,
      cuesReinforced: 0,
      errors: [],
      syncDuration: 0
    };

    try {
      // 어댑터 가져오기
      const adapter = this.adapters.get(platformName);
      if (!adapter) {
        throw new Error(`No adapter found for platform: ${platformName}`);
      }

      // 마지막 동기화 시점 확인
      const syncStatus = await this.getPlatformSyncStatus(userDid, platformName);
      const lastSync = syncStatus?.lastSyncAt;

      // 메시지 가져오기
      const messages = await adapter.fetchMessages(lastSync, 1000);
      result.messagesProcessed = messages.length;

      if (messages.length === 0) {
        result.success = true;
        result.syncDuration = Date.now() - startTime;
        return result;
      }

      // 기존 큐 가져오기
      const existingCues = await this.getExistingCues(userDid);

      // Cue 추출
      const extractionResult = await this.cueExtractor.extractCues(messages, existingCues);
      
      result.cuesExtracted = extractionResult.newCues.length;
      result.cuesReinforced = extractionResult.reinforcedCues.length;

      // 새로운 큐 저장
      if (extractionResult.newCues.length > 0) {
        await this.saveCues(userDid, extractionResult.newCues);
      }

      // 기존 큐 강화
      if (extractionResult.reinforcedCues.length > 0) {
        await this.reinforceCues(extractionResult.reinforcedCues);
      }

      // 동기화 상태 업데이트
      await this.updateSyncStatus(userDid, platformName, {
        lastSyncAt: new Date(),
        totalCuesExtracted: syncStatus ? syncStatus.totalCuesExtracted + result.cuesExtracted : result.cuesExtracted,
        extractedMessagesCount: syncStatus ? syncStatus.extractedMessagesCount + result.messagesProcessed : result.messagesProcessed,
        syncQuality: extractionResult.extractionQuality,
        lastError: undefined,
        errorCount: 0
      });

      result.success = true;
      
    } catch (error) {
      console.error(`Sync failed for ${platformName}:`, error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      
      // 에러 카운트 업데이트
      await this.incrementErrorCount(userDid, platformName, error instanceof Error ? error.message : 'Unknown error');
    }

    result.syncDuration = Date.now() - startTime;
    result.nextSyncAt = this.calculateNextSync(platformName, result.success);
    
    return result;
  }

  // =============================================================================
  // 📅 자동 동기화 스케줄링
  // =============================================================================

  async scheduleAutoSync(userDid: string): Promise<void> {
    const platforms = await this.getActivePlatforms(userDid);
    
    for (const platform of platforms) {
      if (platform.autoSync) {
        const intervalMs = platform.syncIntervalMinutes * 60 * 1000;
        
        // 기존 스케줄 정리
        const existingTimer = this.syncScheduler.get(`${userDid}-${platform.platform}`);
        if (existingTimer) {
          clearInterval(existingTimer);
        }
        
        // 새 스케줄 설정
        const timer = setInterval(async () => {
          try {
            await this.syncPlatform(userDid, platform.platform);
          } catch (error) {
            console.error(`Scheduled sync failed for ${platform.platform}:`, error);
          }
        }, intervalMs);
        
        this.syncScheduler.set(`${userDid}-${platform.platform}`, timer);
      }
    }
  }

  stopAutoSync(userDid: string, platformName?: string): void {
    if (platformName) {
      const timer = this.syncScheduler.get(`${userDid}-${platformName}`);
      if (timer) {
        clearInterval(timer);
        this.syncScheduler.delete(`${userDid}-${platformName}`);
      }
    } else {
      // 모든 스케줄 정지
      for (const [key, timer] of this.syncScheduler.entries()) {
        if (key.startsWith(userDid)) {
          clearInterval(timer);
          this.syncScheduler.delete(key);
        }
      }
    }
  }

  // =============================================================================
  // 🔌 플랫폼 연결 관리
  // =============================================================================

  async connectPlatform(
    userDid: string, 
    platformName: string, 
    authConfig: any
  ): Promise<boolean> {
    try {
      const adapter = this.adapters.get(platformName);
      if (!adapter) {
        throw new Error(`No adapter found for platform: ${platformName}`);
      }

      const connected = await adapter.connect(authConfig);
      
      if (connected) {
        // 플랫폼 동기화 상태 초기화
        await this.initializePlatformSync(userDid, platformName, authConfig);
        
        // 즉시 첫 동기화 실행
        await this.syncPlatform(userDid, platformName);
        
        // 자동 동기화 스케줄링
        await this.scheduleAutoSync(userDid);
      }

      return connected;
      
    } catch (error) {
      console.error(`Failed to connect ${platformName}:`, error);
      return false;
    }
  }

  async disconnectPlatform(userDid: string, platformName: string): Promise<boolean> {
    try {
      const adapter = this.adapters.get(platformName);
      if (adapter) {
        await adapter.disconnect();
      }
      
      // 자동 동기화 중지
      this.stopAutoSync(userDid, platformName);
      
      // 동기화 상태를 비활성화로 변경
      await this.updateSyncStatus(userDid, platformName, {
        syncStatus: 'disabled'
      });
      
      return true;
      
    } catch (error) {
      console.error(`Failed to disconnect ${platformName}:`, error);
      return false;
    }
  }

  // =============================================================================
  // 💾 데이터베이스 상호작용 (실제 구현에서는 repository 사용)
  // =============================================================================

  private async getActivePlatforms(userDid: string): Promise<PlatformSyncStatus[]> {
    // 실제 구현에서는 데이터베이스에서 가져옴
    // 현재는 mock 데이터 반환
    return [
      {
        id: '1',
        userDid,
        platform: 'chatgpt',
        syncStatus: 'active',
        syncIntervalMinutes: 60,
        autoSync: true,
        totalCuesExtracted: 0,
        extractedMessagesCount: 0,
        syncQuality: 0.8,
        errorCount: 0,
        consecutiveErrors: 0,
        syncOnlyNewMessages: true,
        respectRateLimit: true,
        maxMessagesPerSync: 1000,
        permissionsGranted: ['read_conversations'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private async getExistingCues(userDid: string): Promise<PersonalCue[]> {
    // 실제 구현에서는 데이터베이스에서 가져옴
    return [];
  }

  private async saveCues(userDid: string, cues: PersonalCue[]): Promise<void> {
    // 실제 구현에서는 데이터베이스에 저장
    console.log(`Saving ${cues.length} new cues for user ${userDid}`);
  }

  private async reinforceCues(cueIds: string[]): Promise<void> {
    // 실제 구현에서는 기존 큐의 confidence 업데이트
    console.log(`Reinforcing ${cueIds.length} existing cues`);
  }

  private async getPlatformSyncStatus(userDid: string, platform: string): Promise<PlatformSyncStatus | null> {
    // 실제 구현에서는 데이터베이스에서 가져옴
    return null;
  }

  private async updateSyncStatus(
    userDid: string, 
    platform: string, 
    updates: Partial<PlatformSyncStatus>
  ): Promise<void> {
    // 실제 구현에서는 데이터베이스 업데이트
    console.log(`Updating sync status for ${platform}:`, updates);
  }

  private async initializePlatformSync(
    userDid: string, 
    platform: string, 
    authConfig: any
  ): Promise<void> {
    // 실제 구현에서는 데이터베이스에 초기 상태 생성
    console.log(`Initializing sync for ${platform}`);
  }

  private async incrementErrorCount(
    userDid: string, 
    platform: string, 
    error: string
  ): Promise<void> {
    // 실제 구현에서는 에러 카운트 증가
    console.log(`Error in ${platform}: ${error}`);
  }

  private calculateNextSync(platform: string, success: boolean): Date {
    const baseInterval = success ? 60 : 120; // 성공하면 60분, 실패하면 120분 후
    return new Date(Date.now() + baseInterval * 60 * 1000);
  }
}

// =============================================================================
// 🔌 플랫폼별 어댑터들
// =============================================================================

class ChatGPTAdapter implements PlatformAdapter {
  platformName = 'chatgpt';
  private isConnected = false;

  async connect(authConfig: any): Promise<boolean> {
    // ChatGPT API 연결 로직
    // 실제로는 ChatGPT의 conversation history API를 사용
    this.isConnected = true;
    return true;
  }

  async fetchMessages(since?: Date, limit = 100): Promise<MessageContext[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to ChatGPT');
    }

    // Mock 데이터 - 실제로는 ChatGPT API 호출
    return [
      {
        id: 'chatgpt-msg-1',
        content: 'TypeScript에서 React 컴포넌트 만드는 방법을 간단히 설명해줘',
        timestamp: new Date(),
        platform: 'chatgpt',
        userRole: 'user',
        conversationId: 'chatgpt-conv-1'
      },
      {
        id: 'chatgpt-msg-2',
        content: 'TypeScript React 컴포넌트는 다음과 같이 만들 수 있습니다...',
        timestamp: new Date(),
        platform: 'chatgpt',
        userRole: 'assistant',
        conversationId: 'chatgpt-conv-1'
      }
    ];
  }

  getConnectionStatus(): PlatformSyncStatus {
    return {
      id: 'chatgpt-status',
      userDid: '',
      platform: 'chatgpt',
      syncStatus: this.isConnected ? 'active' : 'disabled',
      syncIntervalMinutes: 60,
      totalCuesExtracted: 0,
      extractedMessagesCount: 0,
      syncQuality: 0.8,
      errorCount: 0,
      consecutiveErrors: 0,
      autoSync: true,
      syncOnlyNewMessages: true,
      respectRateLimit: true,
      maxMessagesPerSync: 1000,
      permissionsGranted: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }
}

class ClaudeAdapter implements PlatformAdapter {
  platformName = 'claude';
  private isConnected = false;

  async connect(authConfig: any): Promise<boolean> {
    // Claude API 연결 로직
    this.isConnected = true;
    return true;
  }

  async fetchMessages(since?: Date, limit = 100): Promise<MessageContext[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Claude');
    }

    // Mock 데이터 - 실제로는 Claude API 호출
    return [
      {
        id: 'claude-msg-1',
        content: 'Claude야, 내가 프로그래밍할 때 항상 상세한 예시를 포함해서 설명해줘. 그리고 TypeScript를 주로 사용해.',
        timestamp: new Date(),
        platform: 'claude',
        userRole: 'user',
        conversationId: 'claude-conv-1'
      },
      {
        id: 'claude-msg-2',
        content: '네, 앞으로 TypeScript 예시와 함께 상세하게 설명드리겠습니다...',
        timestamp: new Date(),
        platform: 'claude',
        userRole: 'assistant',
        conversationId: 'claude-conv-1'
      }
    ];
  }

  getConnectionStatus(): PlatformSyncStatus {
    return {
      id: 'claude-status',
      userDid: '',
      platform: 'claude',
      syncStatus: this.isConnected ? 'active' : 'disabled',
      syncIntervalMinutes: 30,
      totalCuesExtracted: 0,
      extractedMessagesCount: 0,
      syncQuality: 0.9,
      errorCount: 0,
      consecutiveErrors: 0,
      autoSync: true,
      syncOnlyNewMessages: true,
      respectRateLimit: true,
      maxMessagesPerSync: 500,
      permissionsGranted: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }
}

class DiscordAdapter implements PlatformAdapter {
  platformName = 'discord';
  private isConnected = false;

  async connect(authConfig: any): Promise<boolean> {
    // Discord Bot API 연결 로직
    this.isConnected = true;
    return true;
  }

  async fetchMessages(since?: Date, limit = 100): Promise<MessageContext[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Discord');
    }

    return [
      {
        id: 'discord-msg-1',
        content: '!ai 코딩할 때 항상 주석 많이 달아줘',
        timestamp: new Date(),
        platform: 'discord',
        userRole: 'user',
        conversationId: 'discord-channel-1',
        metadata: {
          channelId: 'discord-channel-1',
          guildId: 'discord-guild-1'
        }
      }
    ];
  }

  getConnectionStatus(): PlatformSyncStatus {
    return {
      id: 'discord-status',
      userDid: '',
      platform: 'discord',
      syncStatus: this.isConnected ? 'active' : 'disabled',
      syncIntervalMinutes: 15,
      totalCuesExtracted: 0,
      extractedMessagesCount: 0,
      syncQuality: 0.7,
      errorCount: 0,
      consecutiveErrors: 0,
      autoSync: true,
      syncOnlyNewMessages: true,
      respectRateLimit: true,
      maxMessagesPerSync: 200,
      permissionsGranted: ['read_messages'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }
}

class GmailAdapter implements PlatformAdapter {
  platformName = 'gmail';
  private isConnected = false;

  async connect(authConfig: any): Promise<boolean> {
    // Gmail API 연결 로직
    this.isConnected = true;
    return true;
  }

  async fetchMessages(since?: Date, limit = 100): Promise<MessageContext[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Gmail');
    }

    return [
      {
        id: 'gmail-msg-1',
        content: '회의 일정을 정리해서 보내주세요. 가능하면 표 형태로.',
        timestamp: new Date(),
        platform: 'gmail',
        userRole: 'user',
        conversationId: 'gmail-thread-1',
        metadata: {
          threadId: 'gmail-thread-1',
          subject: '회의 일정 정리 요청'
        }
      }
    ];
  }

  getConnectionStatus(): PlatformSyncStatus {
    return {
      id: 'gmail-status',
      userDid: '',
      platform: 'gmail',
      syncStatus: this.isConnected ? 'active' : 'disabled',
      syncIntervalMinutes: 120,
      totalCuesExtracted: 0,
      extractedMessagesCount: 0,
      syncQuality: 0.6,
      errorCount: 0,
      consecutiveErrors: 0,
      autoSync: false, // Gmail은 수동 동기화 기본
      syncOnlyNewMessages: true,
      respectRateLimit: true,
      maxMessagesPerSync: 50,
      permissionsGranted: ['read_emails'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }
}

class NotionAdapter implements PlatformAdapter {
  platformName = 'notion';
  private isConnected = false;

  async connect(authConfig: any): Promise<boolean> {
    // Notion API 연결 로직
    this.isConnected = true;
    return true;
  }

  async fetchMessages(since?: Date, limit = 100): Promise<MessageContext[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Notion');
    }

    return [
      {
        id: 'notion-msg-1',
        content: 'AI 도구들을 정리한 데이터베이스를 만들어줘. 기능별로 분류해서.',
        timestamp: new Date(),
        platform: 'notion',
        userRole: 'user',
        conversationId: 'notion-page-1',
        metadata: {
          pageId: 'notion-page-1',
          workspaceId: 'notion-workspace-1'
        }
      }
    ];
  }

  getConnectionStatus(): PlatformSyncStatus {
    return {
      id: 'notion-status',
      userDid: '',
      platform: 'notion',
      syncStatus: this.isConnected ? 'active' : 'disabled',
      syncIntervalMinutes: 240, // 4시간마다
      totalCuesExtracted: 0,
      extractedMessagesCount: 0,
      syncQuality: 0.8,
      errorCount: 0,
      consecutiveErrors: 0,
      autoSync: true,
      syncOnlyNewMessages: true,
      respectRateLimit: true,
      maxMessagesPerSync: 100,
      permissionsGranted: ['read_pages'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }
}

class SlackAdapter implements PlatformAdapter {
  platformName = 'slack';
  private isConnected = false;

  async connect(authConfig: any): Promise<boolean> {
    // Slack API 연결 로직
    this.isConnected = true;
    return true;
  }

  async fetchMessages(since?: Date, limit = 100): Promise<MessageContext[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Slack');
    }

    return [
      {
        id: 'slack-msg-1',
        content: '@ai-bot 프로젝트 상태를 요약해줘. 개발자가 이해하기 쉽게.',
        timestamp: new Date(),
        platform: 'slack',
        userRole: 'user',
        conversationId: 'slack-channel-1',
        metadata: {
          channelId: 'slack-channel-1',
          teamId: 'slack-team-1'
        }
      }
    ];
  }

  getConnectionStatus(): PlatformSyncStatus {
    return {
      id: 'slack-status',
      userDid: '',
      platform: 'slack',
      syncStatus: this.isConnected ? 'active' : 'disabled',
      syncIntervalMinutes: 30,
      totalCuesExtracted: 0,
      extractedMessagesCount: 0,
      syncQuality: 0.75,
      errorCount: 0,
      consecutiveErrors: 0,
      autoSync: true,
      syncOnlyNewMessages: true,
      respectRateLimit: true,
      maxMessagesPerSync: 300,
      permissionsGranted: ['read_messages'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }
}

// =============================================================================
// 🎯 동기화 매니저 팩토리 및 유틸리티
// =============================================================================

export class SyncManagerFactory {
  private static instance: PlatformSyncManager;

  static getInstance(): PlatformSyncManager {
    if (!this.instance) {
      this.instance = new PlatformSyncManager();
    }
    return this.instance;
  }

  static async createUserSyncManager(userDid: string): Promise<PlatformSyncManager> {
    const manager = this.getInstance();
    
    // 사용자별 자동 동기화 설정
    await manager.scheduleAutoSync(userDid);
    
    return manager;
  }
}

// =============================================================================
// 📊 동기화 통계 및 인사이트
// =============================================================================

export interface SyncStats {
  userDid: string;
  totalPlatforms: number;
  activePlatforms: number;
  totalSyncs: number;
  successfulSyncs: number;
  totalMessages: number;
  totalCuesExtracted: number;
  averageSyncDuration: number;
  lastSyncAt?: Date;
  syncEfficiency: number; // 0.0 ~ 1.0
  platformStats: Record<string, {
    syncs: number;
    messages: number;
    cues: number;
    errors: number;
    avgDuration: number;
    lastSync?: Date;
  }>;
}

export class SyncStatsCollector {
  private syncHistory: Map<string, SyncResult[]> = new Map();

  recordSyncResult(userDid: string, result: SyncResult): void {
    const key = `${userDid}-${result.platform}`;
    const history = this.syncHistory.get(key) || [];
    history.push(result);
    
    // 최근 100개 결과만 유지
    if (history.length > 100) {
      history.shift();
    }
    
    this.syncHistory.set(key, history);
  }

  generateStats(userDid: string): SyncStats {
    const platforms = new Set<string>();
    const allResults: SyncResult[] = [];
    
    // 사용자의 모든 동기화 결과 수집
    for (const [key, results] of this.syncHistory.entries()) {
      if (key.startsWith(userDid)) {
        const platform = key.split('-')[1];
        platforms.add(platform);
        allResults.push(...results);
      }
    }

    const successfulSyncs = allResults.filter(r => r.success);
    const totalMessages = allResults.reduce((sum, r) => sum + r.messagesProcessed, 0);
    const totalCues = allResults.reduce((sum, r) => sum + r.cuesExtracted, 0);
    const avgDuration = allResults.length > 0 
      ? allResults.reduce((sum, r) => sum + r.syncDuration, 0) / allResults.length 
      : 0;

    // 플랫폼별 통계
    const platformStats: Record<string, any> = {};
    for (const platform of platforms) {
      const platformResults = allResults.filter(r => r.platform === platform);
      platformStats[platform] = {
        syncs: platformResults.length,
        messages: platformResults.reduce((sum, r) => sum + r.messagesProcessed, 0),
        cues: platformResults.reduce((sum, r) => sum + r.cuesExtracted, 0),
        errors: platformResults.filter(r => !r.success).length,
        avgDuration: platformResults.length > 0 
          ? platformResults.reduce((sum, r) => sum + r.syncDuration, 0) / platformResults.length 
          : 0,
        lastSync: platformResults.length > 0 
          ? new Date(Math.max(...platformResults.map(r => Date.now()))) 
          : undefined
      };
    }

    return {
      userDid,
      totalPlatforms: platforms.size,
      activePlatforms: platforms.size, // 실제로는 활성 상태 체크 필요
      totalSyncs: allResults.length,
      successfulSyncs: successfulSyncs.length,
      totalMessages,
      totalCuesExtracted: totalCues,
      averageSyncDuration: avgDuration,
      lastSyncAt: allResults.length > 0 
        ? new Date(Math.max(...allResults.map(r => Date.now()))) 
        : undefined,
      syncEfficiency: allResults.length > 0 ? successfulSyncs.length / allResults.length : 0,
      platformStats
    };
  }
}

export default PlatformSyncManager;