// =============================================================================
// 🗄️ 사용자 리포지토리 (src/database/repositories/users.ts)
// =============================================================================

import { supabase, supabaseAdmin } from '@/database/supabase/client';
import type { User } from '@/types/user';
import type { Repository, FilterOptions } from '@/types/database';

export class UserRepository implements Repository<User> {
  
  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        did: data.did,
        username: data.username,
        email: data.email,
        display_name: data.displayName,
        avatar: data.avatar,
        auth_method: data.authMethod,
        status: data.status,
        preferences: data.preferences,
        profile: data.profile,
        security: data.security,
        subscription: data.subscription,
        metadata: data.metadata,
        last_login_at: data.lastLoginAt
      })
      .select()
      .single();

    if (error) throw new Error(`사용자 생성 실패: ${error.message}`);
    return this.mapFromDB(user);
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`사용자 조회 실패: ${error.message}`);
    }

    return data ? this.mapFromDB(data) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`사용자명으로 조회 실패: ${error.message}`);
    }

    return data ? this.mapFromDB(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`이메일로 조회 실패: ${error.message}`);
    }

    return data ? this.mapFromDB(data) : null;
  }

  async findByDID(did: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('did', did)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`DID로 조회 실패: ${error.message}`);
    }

    return data ? this.mapFromDB(data) : null;
  }

  async findMany(filters?: FilterOptions<User>): Promise<User[]> {
    let query = supabase.from('users').select('*');

    if (filters?.where) {
      Object.entries(filters.where).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(this.mapFieldToDB(key), value);
        }
      });
    }

    if (filters?.orderBy) {
      filters.orderBy.forEach(({ field, direction }) => {
        query = query.order(this.mapFieldToDB(field as string), { ascending: direction === 'asc' });
      });
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw new Error(`사용자 목록 조회 실패: ${error.message}`);
    return data.map(user => this.mapFromDB(user));
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const dbUpdates: any = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt') {
        dbUpdates[this.mapFieldToDB(key)] = value;
      }
    });

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`사용자 업데이트 실패: ${error.message}`);
    return data ? this.mapFromDB(data) : null;
  }

  async updateLastLogin(id: string, lastLoginAt: Date): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ last_login_at: lastLoginAt.toISOString() })
      .eq('id', id);

    if (error) throw new Error(`최종 로그인 시간 업데이트 실패: ${error.message}`);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    return !error;
  }

  async count(filters?: FilterOptions<User>): Promise<number> {
    let query = supabase.from('users').select('*', { count: 'exact', head: true });

    if (filters?.where) {
      Object.entries(filters.where).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(this.mapFieldToDB(key), value);
        }
      });
    }

    const { count, error } = await query;
    if (error) throw new Error(`사용자 수 조회 실패: ${error.message}`);
    return count || 0;
  }

  private mapFromDB(dbUser: any): User {
    return {
      id: dbUser.id,
      did: dbUser.did,
      username: dbUser.username,
      email: dbUser.email,
      displayName: dbUser.display_name,
      avatar: dbUser.avatar,
      authMethod: dbUser.auth_method,
      status: dbUser.status,
      preferences: dbUser.preferences,
      profile: dbUser.profile,
      security: dbUser.security,
      subscription: dbUser.subscription,
      metadata: dbUser.metadata,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
      lastLoginAt: dbUser.last_login_at ? new Date(dbUser.last_login_at) : undefined
    };
  }

  private mapFieldToDB(field: string): string {
    const fieldMap: Record<string, string> = {
      displayName: 'display_name',
      authMethod: 'auth_method',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      lastLoginAt: 'last_login_at'
    };
    return fieldMap[field] || field;
  }
}

// =============================================================================
// 🔐 WebAuthn 자격증명 리포지토리 (src/database/repositories/credentials.ts)
// =============================================================================

import type { WebAuthnCredential } from '@/types/webauthn';

export class CredentialRepository implements Repository<WebAuthnCredential> {
  
  async create(data: Omit<WebAuthnCredential, 'id'>): Promise<WebAuthnCredential> {
    const { data: credential, error } = await supabaseAdmin
      .from('webauthn_credentials')
      .insert({
        user_id: (data as any).userId,
        credential_id: data.credentialID,
        public_key: data.publicKey,
        counter: data.counter,
        device_type: data.deviceType,
        backed_up: data.backedUp,
        transports: data.transports,
        biometric_type: data.biometricType,
        nickname: data.nickname,
        device_info: data.deviceInfo,
        created_at: data.createdAt?.toISOString(),
        last_used: data.lastUsed?.toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`자격증명 생성 실패: ${error.message}`);
    return this.mapFromDB(credential);
  }

  async findById(id: string): Promise<WebAuthnCredential | null> {
    const { data, error } = await supabase
      .from('webauthn_credentials')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`자격증명 조회 실패: ${error.message}`);
    }

    return data ? this.mapFromDB(data) : null;
  }

  async findByCredentialId(credentialId: string): Promise<WebAuthnCredential | null> {
    const { data, error } = await supabase
      .from('webauthn_credentials')
      .select('*')
      .eq('credential_id', credentialId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`자격증명 ID로 조회 실패: ${error.message}`);
    }

    return data ? this.mapFromDB(data) : null;
  }

  async findByUserId(userId: string): Promise<WebAuthnCredential[]> {
    const { data, error } = await supabase
      .from('webauthn_credentials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`사용자 자격증명 조회 실패: ${error.message}`);
    return data.map(cred => this.mapFromDB(cred));
  }

  async findMany(filters?: FilterOptions<WebAuthnCredential>): Promise<WebAuthnCredential[]> {
    let query = supabase.from('webauthn_credentials').select('*');

    if (filters?.where) {
      Object.entries(filters.where).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(this.mapFieldToDB(key), value);
        }
      });
    }

    if (filters?.orderBy) {
      filters.orderBy.forEach(({ field, direction }) => {
        query = query.order(this.mapFieldToDB(field as string), { ascending: direction === 'asc' });
      });
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw new Error(`자격증명 목록 조회 실패: ${error.message}`);
    return data.map(cred => this.mapFromDB(cred));
  }

  async update(id: string, updates: Partial<WebAuthnCredential>): Promise<WebAuthnCredential | null> {
    const dbUpdates: any = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        dbUpdates[this.mapFieldToDB(key)] = value;
      }
    });

    const { data, error } = await supabaseAdmin
      .from('webauthn_credentials')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`자격증명 업데이트 실패: ${error.message}`);
    return data ? this.mapFromDB(data) : null;
  }

  async updateCounter(id: string, counter: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('webauthn_credentials')
      .update({ counter })
      .eq('id', id);

    if (error) throw new Error(`카운터 업데이트 실패: ${error.message}`);
  }

  async updateLastUsed(id: string, lastUsed: Date): Promise<void> {
    const { error } = await supabaseAdmin
      .from('webauthn_credentials')
      .update({ last_used: lastUsed.toISOString() })
      .eq('id', id);

    if (error) throw new Error(`최종 사용 시간 업데이트 실패: ${error.message}`);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('webauthn_credentials')
      .delete()
      .eq('id', id);

    return !error;
  }

  async count(filters?: FilterOptions<WebAuthnCredential>): Promise<number> {
    let query = supabase.from('webauthn_credentials').select('*', { count: 'exact', head: true });

    if (filters?.where) {
      Object.entries(filters.where).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(this.mapFieldToDB(key), value);
        }
      });
    }

    const { count, error } = await query;
    if (error) throw new Error(`자격증명 수 조회 실패: ${error.message}`);
    return count || 0;
  }

  private mapFromDB(dbCred: any): WebAuthnCredential {
    return {
      id: dbCred.id,
      credentialID: dbCred.credential_id,
      publicKey: dbCred.public_key,
      counter: dbCred.counter,
      deviceType: dbCred.device_type,
      backedUp: dbCred.backed_up,
      transports: dbCred.transports,
      biometricType: dbCred.biometric_type,
      nickname: dbCred.nickname,
      deviceInfo: dbCred.device_info,
      createdAt: new Date(dbCred.created_at),
      lastUsed: new Date(dbCred.last_used)
    };
  }

  private mapFieldToDB(field: string): string {
    const fieldMap: Record<string, string> = {
      credentialID: 'credential_id',
      publicKey: 'public_key',
      deviceType: 'device_type',
      backedUp: 'backed_up',
      biometricType: 'biometric_type',
      deviceInfo: 'device_info',
      createdAt: 'created_at',
      lastUsed: 'last_used'
    };
    return fieldMap[field] || field;
  }
}

// =============================================================================
// 🆔 DID 리포지토리 (src/database/repositories/did.ts)
// =============================================================================

import type { DIDRecord, DIDListFilters } from '@/types/did';

export class DIDRepository {
  
  async create(record: Omit<DIDRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DIDRecord> {
    const { data, error } = await supabaseAdmin
      .from('did_documents')
      .insert({
        did: record.did,
        document: record.didDocument,
        method: record.method,
        controller: record.controller,
        status: record.status,
        metadata: record.metadata
      })
      .select()
      .single();

    if (error) throw new Error(`DID 문서 생성 실패: ${error.message}`);
    return this.mapFromDB(data);
  }

  async findByDID(did: string): Promise<DIDRecord | null> {
    const { data, error } = await supabase
      .from('did_documents')
      .select('*')
      .eq('did', did)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`DID 문서 조회 실패: ${error.message}`);
    }

    return data ? this.mapFromDB(data) : null;
  }

  async findByController(controller: string): Promise<DIDRecord[]> {
    const { data, error } = await supabase
      .from('did_documents')
      .select('*')
      .eq('controller', controller)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`컨트롤러별 DID 조회 실패: ${error.message}`);
    return data.map(doc => this.mapFromDB(doc));
  }

  async update(did: string, updates: Partial<DIDRecord>): Promise<DIDRecord | null> {
    const dbUpdates: any = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt') {
        const dbField = key === 'didDocument' ? 'document' : this.mapFieldToDB(key);
        dbUpdates[dbField] = value;
      }
    });

    const { data, error } = await supabaseAdmin
      .from('did_documents')
      .update(dbUpdates)
      .eq('did', did)
      .select()
      .single();

    if (error) throw new Error(`DID 문서 업데이트 실패: ${error.message}`);
    return data ? this.mapFromDB(data) : null;
  }

  async delete(did: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('did_documents')
      .delete()
      .eq('did', did);

    return !error;
  }

  async list(filters?: DIDListFilters): Promise<DIDRecord[]> {
    let query = supabase.from('did_documents').select('*');

    if (filters?.method) {
      query = query.eq('method', filters.method);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.controller) {
      query = query.eq('controller', filters.controller);
    }

    if (filters?.createdAfter) {
      query = query.gte('created_at', filters.createdAfter.toISOString());
    }

    if (filters?.createdBefore) {
      query = query.lte('created_at', filters.createdBefore.toISOString());
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('metadata->tags', filters.tags);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw new Error(`DID 목록 조회 실패: ${error.message}`);
    return data.map(doc => this.mapFromDB(doc));
  }

  private mapFromDB(dbDoc: any): DIDRecord {
    return {
      id: dbDoc.id,
      did: dbDoc.did,
      didDocument: dbDoc.document,
      method: dbDoc.method,
      controller: dbDoc.controller,
      status: dbDoc.status,
      metadata: dbDoc.metadata,
      createdAt: new Date(dbDoc.created_at),
      updatedAt: new Date(dbDoc.updated_at)
    };
  }

  private mapFieldToDB(field: string): string {
    const fieldMap: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };
    return fieldMap[field] || field;
  }
}

// =============================================================================
// 💬 AI 대화 리포지토리 (src/database/repositories/conversations.ts)
// =============================================================================

import type { AIConversation, AIMessage } from '@/types/ai';

export class ConversationRepository implements Repository<AIConversation> {
  
  async create(data: Omit<AIConversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIConversation> {
    const { data: conversation, error } = await supabaseAdmin
      .from('ai_conversations')
      .insert({
        user_id: data.userId,
        title: data.title,
        settings: data.settings,
        analytics: data.analytics,
        tags: data.tags,
        status: data.status,
        last_message_at: data.lastMessageAt?.toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`대화 생성 실패: ${error.message}`);
    return this.mapFromDB(conversation);
  }

  async findById(id: string): Promise<AIConversation | null> {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`대화 조회 실패: ${error.message}`);
    }

    if (!data) return null;

    // 메시지도 함께 조회
    const messages = await this.getConversationMessages(id);
    const conversation = this.mapFromDB(data);
    conversation.messages = messages;

    return conversation;
  }

  async findByUserId(userId: string, limit: number = 50): Promise<AIConversation[]> {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw new Error(`사용자 대화 목록 조회 실패: ${error.message}`);
    return data.map(conv => this.mapFromDB(conv));
  }

  async findMany(filters?: FilterOptions<AIConversation>): Promise<AIConversation[]> {
    let query = supabase.from('ai_conversations').select('*');

    if (filters?.where) {
      Object.entries(filters.where).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(this.mapFieldToDB(key), value);
        }
      });
    }

    if (filters?.orderBy) {
      filters.orderBy.forEach(({ field, direction }) => {
        query = query.order(this.mapFieldToDB(field as string), { ascending: direction === 'asc' });
      });
    } else {
      query = query.order('updated_at', { ascending: false });
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw new Error(`대화 목록 조회 실패: ${error.message}`);
    return data.map(conv => this.mapFromDB(conv));
  }

  async update(id: string, updates: Partial<AIConversation>): Promise<AIConversation | null> {
    const dbUpdates: any = {};
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt' && key !== 'messages') {
        dbUpdates[this.mapFieldToDB(key)] = value;
      }
    });

    const { data, error } = await supabaseAdmin
      .from('ai_conversations')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`대화 업데이트 실패: ${error.message}`);
    return data ? this.mapFromDB(data) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('ai_conversations')
      .delete()
      .eq('id', id);

    return !error;
  }

  async count(filters?: FilterOptions<AIConversation>): Promise<number> {
    let query = supabase.from('ai_conversations').select('*', { count: 'exact', head: true });

    if (filters?.where) {
      Object.entries(filters.where).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(this.mapFieldToDB(key), value);
        }
      });
    }

    const { count, error } = await query;
    if (error) throw new Error(`대화 수 조회 실패: ${error.message}`);
    return count || 0;
  }

  // 메시지 관련 메소드들
  async addMessage(conversationId: string, message: Omit<AIMessage, 'id'>): Promise<AIMessage> {
    const { data, error } = await supabaseAdmin
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        metadata: message.metadata,
        attachments: message.attachments,
        status: message.status
      })
      .select()
      .single();

    if (error) throw new Error(`메시지 추가 실패: ${error.message}`);
    return this.mapMessageFromDB(data);
  }

  async getConversationMessages(conversationId: string, limit: number = 100): Promise<AIMessage[]> {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw new Error(`메시지 조회 실패: ${error.message}`);
    return data.map(msg => this.mapMessageFromDB(msg));
  }

  private mapFromDB(dbConv: any): AIConversation {
    return {
      id: dbConv.id,
      userId: dbConv.user_id,
      title: dbConv.title,
      messages: [], // 별도 조회 필요
      settings: dbConv.settings,
      analytics: dbConv.analytics,
      tags: dbConv.tags || [],
      status: dbConv.status,
      createdAt: new Date(dbConv.created_at),
      updatedAt: new Date(dbConv.updated_at),
      lastMessageAt: dbConv.last_message_at ? new Date(dbConv.last_message_at) : undefined
    };
  }

  private mapMessageFromDB(dbMsg: any): AIMessage {
    return {
      id: dbMsg.id,
      conversationId: dbMsg.conversation_id,
      role: dbMsg.role,
      content: dbMsg.content,
      timestamp: new Date(dbMsg.created_at),
      metadata: dbMsg.metadata,
      attachments: dbMsg.attachments || [],
      status: dbMsg.status
    };
  }

  private mapFieldToDB(field: string): string {
    const fieldMap: Record<string, string> = {
      userId: 'user_id',
      lastMessageAt: 'last_message_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };
    return fieldMap[field] || field;
  }
}

// =============================================================================
// 🚀 리포지토리 팩토리 및 내보내기
// =============================================================================

export function createRepositories() {
  return {
    users: new UserRepository(),
    credentials: new CredentialRepository(),
    did: new DIDRepository(),
    conversations: new ConversationRepository()
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

export {
  UserRepository,
  CredentialRepository,
  DIDRepository,
  ConversationRepository
};