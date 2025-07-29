/**
 * OpenAI API Service for Company Rules AI
 * Provides enhanced AI capabilities using Spark Runtime API
 */

// Configuration interfaces
export interface OpenAIConfig {
  model: 'gpt-4o' | 'gpt-4o-mini'
  temperature: number
  maxTokens: number
  jsonMode: boolean
}

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIAnalysisResponse {
  type: string
  result: any
  confidence: number
  suggestions: string[]
  metadata?: {
    tokensUsed: number
    processingTime: number
    modelUsed: string
  }
}

/**
 * OpenAI APIサービスクラス
 * Spark Runtime APIを使用してAI機能を提供
 */
export class OpenAIService {
  private static instance: OpenAIService
  private readonly defaultConfig: OpenAIConfig = {
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2000,
    jsonMode: false
  }

  private constructor() {}

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService()
    }
    return OpenAIService.instance
  }

  /**
   * 基本的なチャット補完機能
   */
  async chatCompletion(
    messages: ChatCompletionMessage[], 
    config: Partial<OpenAIConfig> = {}
  ): Promise<string> {
    const finalConfig = { ...this.defaultConfig, ...config }
    
    try {
      // Spark Runtime APIを使用してプロンプトを構築
      const conversationContext = messages.map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n')
      
      const prompt = spark.llmPrompt`${conversationContext}`
      
      // LLM API呼び出し
      const response = await spark.llm(
        prompt, 
        finalConfig.model, 
        finalConfig.jsonMode
      )
      
      return response
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error('AI応答の生成に失敗しました')
    }
  }

  /**
   * 規則分析機能
   * 規則の内容を分析し、改善提案や関連情報を提供
   */
  async analyzeRule(
    rule: { title: string; content: string; category: string },
    existingRules: any[] = []
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now()
    
    try {
      const prompt = spark.llmPrompt`
        以下の規則を詳細に分析し、改善提案と品質評価を提供してください:

        ## 分析対象の規則
        カテゴリ: ${rule.category}
        タイトル: ${rule.title}
        内容: ${rule.content}

        ## 既存規則データベース (${existingRules.length}件)
        ${existingRules.map(r => `[${r.category}] ${r.title}: ${r.content.substring(0, 100)}...`).join('\n')}

        ## 分析要件
        1. **明確性評価**: 規則の理解しやすさ (1-10点)
        2. **完全性評価**: 必要情報の網羅度 (1-10点)
        3. **一貫性評価**: 既存規則との整合性 (1-10点)
        4. **実用性評価**: 実務での適用可能性 (1-10点)
        5. **改善提案**: 具体的な改善点
        6. **関連規則**: 関連する既存規則の特定
        7. **リスク評価**: 潜在的な問題点

        JSON形式で詳細な分析結果を返してください:
        {
          "clarity": {"score": number, "comment": "評価コメント"},
          "completeness": {"score": number, "comment": "評価コメント"},
          "consistency": {"score": number, "comment": "評価コメント"},
          "practicality": {"score": number, "comment": "評価コメント"},
          "overallScore": number,
          "improvements": ["改善提案1", "改善提案2"],
          "relatedRules": ["関連規則1", "関連規則2"],
          "potentialRisks": ["リスク1", "リスク2"],
          "actionItems": ["推奨アクション1", "推奨アクション2"],
          "recommendations": ["推奨事項1", "推奨事項2"]
        }
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)
      
      return {
        type: 'rule_analysis',
        result: analysis,
        confidence: analysis.overallScore / 10,
        suggestions: analysis.improvements,
        metadata: {
          tokensUsed: response.length,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4o'
        }
      }
    } catch (error) {
      console.error('Rule analysis error:', error)
      throw new Error('規則分析に失敗しました')
    }
  }

  /**
   * 会話要約機能
   * チャット履歴を分析して要約とインサイトを提供
   */
  async generateConversationSummary(
    messages: any[],
    userContext: { name: string; role: string; email: string }
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now()
    
    try {
      const conversation = messages.map(msg => 
        `${msg.type === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
      ).join('\n')

      const prompt = spark.llmPrompt`
        以下の社則AIとの会話を分析し、包括的な要約とインサイトを提供してください:

        ## 会話履歴
        ${conversation}

        ## ユーザー情報
        名前: ${userContext.name}
        役職: ${userContext.role}
        メール: ${userContext.email}

        ## 分析要件
        1. **会話の概要**: 主要な質問と回答の要約
        2. **ユーザーの関心領域**: 質問パターンから読み取れる関心事
        3. **知識ギャップ**: 理解が不足している領域
        4. **フォローアップ**: 推奨される追加質問や確認事項
        5. **行動提案**: ユーザーが取るべき具体的なアクション

        JSON形式で構造化された要約を提供してください:
        {
          "summary": "会話の簡潔な要約",
          "keyTopics": ["主要トピック1", "主要トピック2"],
          "userInterests": ["関心領域1", "関心領域2"],
          "knowledgeGaps": ["理解不足の領域1", "理解不足の領域2"],
          "followUpQuestions": ["追加質問候補1", "追加質問候補2"],
          "actionItems": ["推奨アクション1", "推奨アクション2"],
          "satisfactionLevel": "推定満足度(高/中/低)",
          "nextSteps": "次に取るべきステップ"
        }
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const summary = JSON.parse(response)
      
      return {
        type: 'conversation_summary',
        result: summary,
        confidence: 0.85,
        suggestions: summary.followUpQuestions,
        metadata: {
          tokensUsed: response.length,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4o'
        }
      }
    } catch (error) {
      console.error('Conversation summary error:', error)
      throw new Error('会話要約の生成に失敗しました')
    }
  }

  /**
   * ポリシーギャップ分析
   * 規則の不足や改善が必要な領域を特定
   */
  async analyzePolicyGaps(
    currentRules: any[],
    interactionLogs: any[],
    industryContext?: string
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now()
    
    try {
      const prompt = spark.llmPrompt`
        企業の規則体系と質問履歴を分析し、ポリシーギャップと改善提案を提供してください:

        ## 現在の規則体系 (${currentRules.length}件)
        ${currentRules.map(rule => `
        [${rule.category}] ${rule.title}
        内容: ${rule.content}
        最終更新: ${rule.lastUpdated}
        `).join('\n')}

        ## 質問履歴分析 (${interactionLogs.length}件)
        ${interactionLogs.slice(-30).map(log => `
        質問: ${log.question}
        ユーザー: ${log.userId}
        回答長: ${log.responseLength}文字
        `).join('\n')}

        ${industryContext ? `## 業界コンテキスト\n${industryContext}\n` : ''}

        ## 分析要件
        1. **カバレッジ分析**: 規則でカバーされていない領域
        2. **質問トレンド**: よく質問される未規則化領域
        3. **業界標準**: 一般的な企業が持つべき規則との比較
        4. **緊急度評価**: 新規則作成の優先順位

        JSON形式で詳細なギャップ分析を提供してください:
        {
          "coverage": {
            "coveredAreas": ["カバー済み領域"],
            "gapAreas": ["ギャップ領域"],
            "coverageScore": number
          },
          "questionTrends": {
            "frequentTopics": ["よく質問される話題"],
            "emergingConcerns": ["新しい関心事"],
            "unaddressedQuestions": ["対応されていない質問"]
          },
          "industryComparison": {
            "missingStandards": ["不足している業界標準"],
            "bestPractices": ["推奨ベストプラクティス"]
          },
          "priorityRecommendations": [
            {
              "title": "推奨規則タイトル",
              "category": "カテゴリ",
              "priority": "高/中/低",
              "rationale": "必要性の理由",
              "urgency": "緊急度(1-10)"
            }
          ],
          "implementationPlan": "実装計画の概要"
        }
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)
      
      return {
        type: 'policy_gap',
        result: analysis,
        confidence: 0.8,
        suggestions: analysis.priorityRecommendations?.map((rec: any) => rec.title) || [],
        metadata: {
          tokensUsed: response.length,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4o'
        }
      }
    } catch (error) {
      console.error('Policy gap analysis error:', error)
      throw new Error('ポリシーギャップ分析に失敗しました')
    }
  }

  /**
   * ユーザー行動分析
   * 質問パターンやユーザーの理解度を分析
   */
  async analyzeUserBehavior(
    interactionLogs: any[],
    userProfiles: any[] = []
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now()

    try {
      const prompt = spark.llmPrompt`
        ユーザーの質問パターンと行動を分析し、システム改善のインサイトを提供してください:

        ## インタラクションログ (${interactionLogs.length}件)
        ${interactionLogs.slice(-50).map(log => `
        質問: ${log.question}
        ユーザー: ${log.userId}
        応答長: ${log.responseLength}文字
        タイムスタンプ: ${log.timestamp}
        `).join('\n')}

        ## ユーザープロファイル (${userProfiles.length}名)
        ${userProfiles.map(user => `
        ユーザー: ${user.name}
        役職: ${user.role}
        質問回数: ${interactionLogs.filter(log => log.userId === user.email).length}件
        `).join('\n')}

        ## 分析要件
        1. **質問パターン**: ユーザーの質問傾向と頻度
        2. **エンゲージメント**: システム利用の深度と持続性
        3. **理解レベル**: 質問の複雑さから推定される理解度
        4. **満足度推定**: 質問-回答の流れから推定される満足度

        JSON形式で詳細な行動分析を提供してください:
        {
          "userActivity": {
            "activeUsers": number,
            "averageQuestionsPerUser": number,
            "engagementScore": number
          },
          "questionPatterns": {
            "simpleQuestions": number,
            "complexQuestions": number,
            "repeatQuestions": number,
            "topCategories": ["人気カテゴリ1", "人気カテゴリ2"]
          },
          "userSatisfaction": {
            "estimatedSatisfaction": "高/中/低",
            "improvementAreas": ["改善領域1", "改善領域2"],
            "userFeedback": "推定フィードバック"
          },
          "systemRecommendations": {
            "contentGaps": ["コンテンツ不足領域"],
            "uiEnhancements": ["UI改善提案"],
            "featureRequests": ["機能追加要求"]
          },
          "retentionInsights": {
            "returnUsers": number,
            "churnRisk": "離脱リスク評価",
            "engagementTrends": "エンゲージメント傾向"
          }
        }
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)
      
      return {
        type: 'user_behavior',
        result: analysis,
        confidence: 0.75,
        suggestions: analysis.systemRecommendations?.featureRequests || [],
        metadata: {
          tokensUsed: response.length,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4o'
        }
      }
    } catch (error) {
      console.error('User behavior analysis error:', error)
      throw new Error('ユーザー行動分析に失敗しました')
    }
  }

  /**
   * 質問候補生成機能
   * 入力に基づいて関連する質問候補を提案
   */
  async generateQuestionSuggestions(
    input: string,
    chatHistory: any[],
    userContext: any,
    availableRules: any[]
  ): Promise<string[]> {
    try {
      const recentHistory = chatHistory.slice(-5).map(msg => 
        `${msg.type}: ${msg.content}`
      ).join('\n')

      const prompt = spark.llmPrompt`
        ユーザーの入力と文脈に基づいて、関連する質問候補を3-5個生成してください:

        ## 現在の入力
        ${input}

        ## 最近の会話履歴
        ${recentHistory}

        ## ユーザー情報
        役職: ${userContext.role}

        ## 利用可能な規則カテゴリ
        ${[...new Set(availableRules.map(rule => rule.category))].join(', ')}

        ## 要件
        - 入力内容に関連する自然な質問を生成
        - 会社規則に関連する実用的な質問を優先
        - 15-30文字程度の簡潔な質問
        - 重複や類似する質問は避ける

        質問候補のみを配列形式で返してください（JSON形式）:
        ["質問候補1", "質問候補2", "質問候補3"]
      `

      const response = await spark.llm(prompt, 'gpt-4o-mini', true)
      const suggestions = JSON.parse(response)
      
      return Array.isArray(suggestions) ? suggestions : []
    } catch (error) {
      console.error('Question suggestion generation error:', error)
      return []
    }
  }
}

// シングルトンインスタンスを作成してエクスポート
export const openaiService = OpenAIService.getInstance()