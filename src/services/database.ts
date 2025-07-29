/**
 * データベース設計とデータ管理サービス
 * 社則AI システムのデータ構造と管理機能を提供
 */

// ===== 基本的なデータ型定義 =====

export interface Rule {
  id: string
  title: string
  content: string
  category: string
  lastUpdated: string
  status: 'published' | 'pending' | 'rejected' | 'draft'
  submittedBy?: string
  submittedAt?: string
  reviewedBy?: string
  reviewedAt?: string
  reviewComment?: string
  version: number
  tags: string[]
  relatedRules: string[] // 関連規則のID
  importance: 'high' | 'medium' | 'low'
  applicableRoles: string[] // 適用対象の役職
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  relatedRules: string[]
  popularity: number // アクセス頻度
  lastUpdated: string
  createdBy: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'hr' | 'employee'
  department?: string
  position?: string
  joinDate?: string
  permissions: string[]
  lastLogin?: string
  preferences: {
    aiPersonality: 'professional' | 'friendly' | 'detailed'
    notificationSettings: {
      emailNotifications: boolean
      ruleUpdates: boolean
      systemAnnouncements: boolean
    }
    dashboardLayout: any
  }
}

export interface ChatMessage {
  id: string
  conversationId: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: string
  userId: string
  metadata: {
    responseTime?: number
    confidence?: number
    rulesReferenced?: string[]
    feedback?: 'helpful' | 'not_helpful'
    tags?: string[]
  }
}

export interface Conversation {
  id: string
  userId: string
  title: string
  startTime: string
  endTime?: string
  messageCount: number
  summary?: string
  tags: string[]
  category: string
  satisfaction?: number // 1-5 rating
}

export interface InteractionLog {
  id: string
  userId: string
  sessionId: string
  action: 'search' | 'chat' | 'view_rule' | 'create_rule' | 'edit_rule'
  timestamp: string
  details: {
    query?: string
    ruleId?: string
    responseTime?: number
    success: boolean
    errorMessage?: string
  }
  userAgent?: string
  ipAddress?: string
}

export interface AnalyticsData {
  id: string
  date: string
  metrics: {
    totalQuestions: number
    uniqueUsers: number
    averageResponseTime: number
    successRate: number
    popularCategories: { [key: string]: number }
    userSatisfaction: number
    systemUptime: number
  }
  insights: {
    trendingTopics: string[]
    improvementAreas: string[]
    userFeedback: string[]
  }
}

export interface Notification {
  id: string
  userId: string
  type: 'rule_update' | 'system_announcement' | 'approval_request' | 'feedback_request'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionRequired: boolean
  relatedId?: string // 関連するRule IDなど
}

export interface SystemConfig {
  id: string
  key: string
  value: any
  description: string
  lastUpdated: string
  updatedBy: string
  environment: 'production' | 'staging' | 'development'
}

// ===== データベース操作サービス =====

/**
 * データベース管理サービス
 * Spark KV APIを基盤とした高レベルデータ操作を提供
 */
export class DatabaseService {
  private static instance: DatabaseService
  
  // データキーの定数定義
  private readonly KEYS = {
    RULES: 'company-rules',
    USERS: 'system-users',
    FAQS: 'company-faqs',
    CONVERSATIONS: 'user-conversations',
    MESSAGES: 'chat-messages',
    INTERACTION_LOGS: 'interaction-logs',
    ANALYTICS: 'system-analytics',
    NOTIFICATIONS: 'user-notifications',
    SYSTEM_CONFIG: 'system-config',
    AI_INSIGHTS: 'ai-insights-cache'
  } as const

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // ===== 規則管理 =====

  async getRules(status?: Rule['status']): Promise<Rule[]> {
    try {
      const rules = await spark.kv.get<Rule[]>(this.KEYS.RULES) || []
      return status ? rules.filter(rule => rule.status === status) : rules
    } catch (error) {
      console.error('Failed to get rules:', error)
      return []
    }
  }

  async getRuleById(id: string): Promise<Rule | null> {
    try {
      const rules = await this.getRules()
      return rules.find(rule => rule.id === id) || null
    } catch (error) {
      console.error('Failed to get rule by ID:', error)
      return null
    }
  }

  async createRule(rule: Omit<Rule, 'id' | 'version'>): Promise<Rule> {
    try {
      const newRule: Rule = {
        ...rule,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        version: 1
      }
      
      const rules = await this.getRules()
      const updatedRules = [...rules, newRule]
      
      await spark.kv.set(this.KEYS.RULES, updatedRules)
      return newRule
    } catch (error) {
      console.error('Failed to create rule:', error)
      throw new Error('規則の作成に失敗しました')
    }
  }

  async updateRule(id: string, updates: Partial<Rule>): Promise<Rule> {
    try {
      const rules = await this.getRules()
      const ruleIndex = rules.findIndex(rule => rule.id === id)
      
      if (ruleIndex === -1) {
        throw new Error('規則が見つかりません')
      }
      
      const updatedRule: Rule = {
        ...rules[ruleIndex],
        ...updates,
        version: rules[ruleIndex].version + 1,
        lastUpdated: new Date().toISOString()
      }
      
      rules[ruleIndex] = updatedRule
      await spark.kv.set(this.KEYS.RULES, rules)
      
      return updatedRule
    } catch (error) {
      console.error('Failed to update rule:', error)
      throw new Error('規則の更新に失敗しました')
    }
  }

  async deleteRule(id: string): Promise<boolean> {
    try {
      const rules = await this.getRules()
      const filteredRules = rules.filter(rule => rule.id !== id)
      
      if (filteredRules.length === rules.length) {
        return false // 削除対象が見つからない
      }
      
      await spark.kv.set(this.KEYS.RULES, filteredRules)
      return true
    } catch (error) {
      console.error('Failed to delete rule:', error)
      throw new Error('規則の削除に失敗しました')
    }
  }

  async searchRules(query: string, category?: string): Promise<Rule[]> {
    try {
      const rules = await this.getRules('published')
      const lowercaseQuery = query.toLowerCase()
      
      return rules.filter(rule => {
        const matchesQuery = 
          rule.title.toLowerCase().includes(lowercaseQuery) ||
          rule.content.toLowerCase().includes(lowercaseQuery) ||
          rule.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        
        const matchesCategory = !category || category === 'all' || rule.category === category
        
        return matchesQuery && matchesCategory
      })
    } catch (error) {
      console.error('Failed to search rules:', error)
      return []
    }
  }

  // ===== ユーザー管理 =====

  async getUsers(): Promise<User[]> {
    try {
      return await spark.kv.get<User[]>(this.KEYS.USERS) || []
    } catch (error) {
      console.error('Failed to get users:', error)
      return []
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      return users.find(user => user.id === id) || null
    } catch (error) {
      console.error('Failed to get user by ID:', error)
      return null
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      return users.find(user => user.email === email) || null
    } catch (error) {
      console.error('Failed to get user by email:', error)
      return null
    }
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      const newUser: User = {
        ...user,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      const users = await this.getUsers()
      const updatedUsers = [...users, newUser]
      
      await spark.kv.set(this.KEYS.USERS, updatedUsers)
      return newUser
    } catch (error) {
      console.error('Failed to create user:', error)
      throw new Error('ユーザーの作成に失敗しました')
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const users = await this.getUsers()
      const userIndex = users.findIndex(user => user.id === id)
      
      if (userIndex === -1) {
        throw new Error('ユーザーが見つかりません')
      }
      
      const updatedUser: User = { ...users[userIndex], ...updates }
      users[userIndex] = updatedUser
      
      await spark.kv.set(this.KEYS.USERS, users)
      return updatedUser
    } catch (error) {
      console.error('Failed to update user:', error)
      throw new Error('ユーザーの更新に失敗しました')
    }
  }

  // ===== 会話管理 =====

  async createConversation(userId: string, title: string): Promise<Conversation> {
    try {
      const conversation: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title,
        startTime: new Date().toISOString(),
        messageCount: 0,
        tags: [],
        category: 'general',
        satisfaction: undefined
      }
      
      const conversations = await spark.kv.get<Conversation[]>(this.KEYS.CONVERSATIONS) || []
      await spark.kv.set(this.KEYS.CONVERSATIONS, [...conversations, conversation])
      
      return conversation
    } catch (error) {
      console.error('Failed to create conversation:', error)
      throw new Error('会話の作成に失敗しました')
    }
  }

  async addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    try {
      const newMessage: ChatMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      const messages = await spark.kv.get<ChatMessage[]>(this.KEYS.MESSAGES) || []
      await spark.kv.set(this.KEYS.MESSAGES, [...messages, newMessage])
      
      // 会話の情報を更新
      await this.updateConversationMessageCount(message.conversationId)
      
      return newMessage
    } catch (error) {
      console.error('Failed to add message:', error)
      throw new Error('メッセージの追加に失敗しました')
    }
  }

  private async updateConversationMessageCount(conversationId: string): Promise<void> {
    try {
      const conversations = await spark.kv.get<Conversation[]>(this.KEYS.CONVERSATIONS) || []
      const convIndex = conversations.findIndex(conv => conv.id === conversationId)
      
      if (convIndex !== -1) {
        conversations[convIndex].messageCount += 1
        await spark.kv.set(this.KEYS.CONVERSATIONS, conversations)
      }
    } catch (error) {
      console.error('Failed to update conversation message count:', error)
    }
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    try {
      const conversations = await spark.kv.get<Conversation[]>(this.KEYS.CONVERSATIONS) || []
      return conversations.filter(conv => conv.userId === userId)
    } catch (error) {
      console.error('Failed to get conversations by user:', error)
      return []
    }
  }

  async getMessagesByConversation(conversationId: string): Promise<ChatMessage[]> {
    try {
      const messages = await spark.kv.get<ChatMessage[]>(this.KEYS.MESSAGES) || []
      return messages.filter(msg => msg.conversationId === conversationId)
    } catch (error) {
      console.error('Failed to get messages by conversation:', error)
      return []
    }
  }

  // ===== 分析・ログ管理 =====

  async logInteraction(log: Omit<InteractionLog, 'id'>): Promise<void> {
    try {
      const newLog: InteractionLog = {
        ...log,
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      const logs = await spark.kv.get<InteractionLog[]>(this.KEYS.INTERACTION_LOGS) || []
      
      // 最新1000件のみ保持
      const updatedLogs = [...logs.slice(-999), newLog]
      await spark.kv.set(this.KEYS.INTERACTION_LOGS, updatedLogs)
    } catch (error) {
      console.error('Failed to log interaction:', error)
    }
  }

  async getInteractionLogs(userId?: string, limit: number = 100): Promise<InteractionLog[]> {
    try {
      const logs = await spark.kv.get<InteractionLog[]>(this.KEYS.INTERACTION_LOGS) || []
      const filteredLogs = userId ? logs.filter(log => log.userId === userId) : logs
      
      return filteredLogs.slice(-limit).reverse()
    } catch (error) {
      console.error('Failed to get interaction logs:', error)
      return []
    }
  }

  async saveAnalytics(analytics: AnalyticsData): Promise<void> {
    try {
      const allAnalytics = await spark.kv.get<AnalyticsData[]>(this.KEYS.ANALYTICS) || []
      const updatedAnalytics = [...allAnalytics.slice(-29), analytics] // 最新30日分
      
      await spark.kv.set(this.KEYS.ANALYTICS, updatedAnalytics)
    } catch (error) {
      console.error('Failed to save analytics:', error)
    }
  }

  async getAnalytics(days: number = 7): Promise<AnalyticsData[]> {
    try {
      const analytics = await spark.kv.get<AnalyticsData[]>(this.KEYS.ANALYTICS) || []
      return analytics.slice(-days)
    } catch (error) {
      console.error('Failed to get analytics:', error)
      return []
    }
  }

  // ===== 通知管理 =====

  async createNotification(notification: Omit<Notification, 'id'>): Promise<Notification> {
    try {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      const notifications = await spark.kv.get<Notification[]>(this.KEYS.NOTIFICATIONS) || []
      await spark.kv.set(this.KEYS.NOTIFICATIONS, [...notifications, newNotification])
      
      return newNotification
    } catch (error) {
      console.error('Failed to create notification:', error)
      throw new Error('通知の作成に失敗しました')
    }
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    try {
      const notifications = await spark.kv.get<Notification[]>(this.KEYS.NOTIFICATIONS) || []
      return notifications.filter(notif => notif.userId === userId).reverse()
    } catch (error) {
      console.error('Failed to get notifications by user:', error)
      return []
    }
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    try {
      const notifications = await spark.kv.get<Notification[]>(this.KEYS.NOTIFICATIONS) || []
      const notifIndex = notifications.findIndex(notif => notif.id === id)
      
      if (notifIndex !== -1) {
        notifications[notifIndex].read = true
        await spark.kv.set(this.KEYS.NOTIFICATIONS, notifications)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  }

  // ===== システム設定管理 =====

  async getSystemConfig(key: string): Promise<SystemConfig | null> {
    try {
      const configs = await spark.kv.get<SystemConfig[]>(this.KEYS.SYSTEM_CONFIG) || []
      return configs.find(config => config.key === key) || null
    } catch (error) {
      console.error('Failed to get system config:', error)
      return null
    }
  }

  async setSystemConfig(config: Omit<SystemConfig, 'id'>): Promise<SystemConfig> {
    try {
      const configs = await spark.kv.get<SystemConfig[]>(this.KEYS.SYSTEM_CONFIG) || []
      const existingIndex = configs.findIndex(c => c.key === config.key)
      
      const newConfig: SystemConfig = {
        ...config,
        id: existingIndex !== -1 ? configs[existingIndex].id : `config_${Date.now()}`
      }
      
      if (existingIndex !== -1) {
        configs[existingIndex] = newConfig
      } else {
        configs.push(newConfig)
      }
      
      await spark.kv.set(this.KEYS.SYSTEM_CONFIG, configs)
      return newConfig
    } catch (error) {
      console.error('Failed to set system config:', error)
      throw new Error('システム設定の保存に失敗しました')
    }
  }

  // ===== データエクスポート機能 =====

  async exportAllData(): Promise<{
    rules: Rule[]
    users: User[]
    conversations: Conversation[]
    messages: ChatMessage[]
    logs: InteractionLog[]
    analytics: AnalyticsData[]
    notifications: Notification[]
    config: SystemConfig[]
  }> {
    try {
      const [rules, users, conversations, messages, logs, analytics, notifications, config] = await Promise.all([
        this.getRules(),
        this.getUsers(),
        spark.kv.get<Conversation[]>(this.KEYS.CONVERSATIONS).then(result => result || []),
        spark.kv.get<ChatMessage[]>(this.KEYS.MESSAGES).then(result => result || []),
        this.getInteractionLogs(),
        this.getAnalytics(30),
        spark.kv.get<Notification[]>(this.KEYS.NOTIFICATIONS).then(result => result || []),
        spark.kv.get<SystemConfig[]>(this.KEYS.SYSTEM_CONFIG).then(result => result || [])
      ])

      return {
        rules,
        users,
        conversations,
        messages,
        logs,
        analytics,
        notifications,
        config
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      throw new Error('データのエクスポートに失敗しました')
    }
  }

  // ===== キャッシュ管理 =====

  async clearCache(): Promise<void> {
    try {
      await spark.kv.delete(this.KEYS.AI_INSIGHTS)
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  async getCachedInsights(key: string): Promise<any> {
    try {
      const cache = await spark.kv.get<{ [key: string]: any }>(this.KEYS.AI_INSIGHTS) || {}
      return cache[key]
    } catch (error) {
      console.error('Failed to get cached insights:', error)
      return null
    }
  }

  async setCachedInsights(key: string, data: any, ttl: number = 3600000): Promise<void> {
    try {
      const cache = await spark.kv.get<{ [key: string]: any }>(this.KEYS.AI_INSIGHTS) || {}
      cache[key] = {
        data,
        timestamp: Date.now(),
        ttl
      }
      await spark.kv.set(this.KEYS.AI_INSIGHTS, cache)
    } catch (error) {
      console.error('Failed to set cached insights:', error)
    }
  }
}

// シングルトンインスタンスをエクスポート
export const databaseService = DatabaseService.getInstance()

// ユーティリティ関数
export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const validateRule = (rule: Partial<Rule>): string[] => {
  const errors: string[] = []
  
  if (!rule.title?.trim()) {
    errors.push('タイトルは必須です')
  }
  
  if (!rule.content?.trim()) {
    errors.push('内容は必須です')
  }
  
  if (!rule.category?.trim()) {
    errors.push('カテゴリは必須です')
  }
  
  if (rule.title && rule.title.length > 100) {
    errors.push('タイトルは100文字以内で入力してください')
  }
  
  if (rule.content && rule.content.length > 5000) {
    errors.push('内容は5000文字以内で入力してください')
  }
  
  return errors
}