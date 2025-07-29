/**
 * OpenAI API統合サービス
 * Spark Runtime APIとの統合を提供し、AI機能の一元管理を行う
 */

export interface OpenAIConfig {
  model: 'gpt-4o' | 'gpt-4o-mini'
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIAnalysisRequest {
  type: 'rule_analysis' | 'conversation_summary' | 'policy_gap' | 'user_behavior'
  data: any
  context?: any
}

export interface AIAnalysisResponse {
  type: string
  result: any
  confidence: number
  suggestions?: string[]
  metadata?: {
    tokensUsed: number
    processingTime: number
    modelUsed: string
  }
}

/**
 * OpenAI APIサービスクラス
 * Spark Runtime APIを使用したAI機能の統合管理
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

        ## 分析対象規則
        タイトル: ${rule.title}
        カテゴリ: ${rule.category}
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
          "risks": ["潜在的リスク1", "潜在的リスク2"],
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
   * 会話要約機能の強化版
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
        回答長: ${log.responseLength}文字
        日時: ${log.timestamp}
        `).join('\n')}

        ${industryContext ? `## 業界コンテキスト\n${industryContext}\n` : ''}

        ## 分析要件
        1. **カバレッジ分析**: 規則でカバーされていない領域
        2. **質問トレンド**: よく質問される未規則化領域
        3. **業界標準比較**: 一般的な企業規則との比較
        4. **緊急度評価**: 新規則作成の優先順位
        5. **実装提案**: 具体的な規則案

        JSON形式で包括的な分析を提供してください:
        {
          "coverageAnalysis": {
            "coveredAreas": ["カバー済み領域"],
            "gapAreas": ["ギャップ領域"],
            "coverageScore": number
          },
          "questionTrends": {
            "frequentTopics": ["よく質問される話題"],
            "emergingConcerns": ["新しい関心事"],
            "unaddressedQuestions": ["未対応の質問パターン"]
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
              "draftContent": "規則案の概要"
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
        ユーザー: ${log.userId}
        質問: ${log.question}
        回答長: ${log.responseLength}文字
        日時: ${log.timestamp}
        `).join('\n')}

        ## ユーザープロファイル
        ${userProfiles.map(user => `
        ${user.name} (${user.role}): ${user.email}
        `).join('\n')}

        ## 分析要件
        1. **質問パターン**: ユーザー別・時間別の質問傾向
        2. **理解度評価**: 質問の複雑さと理解レベル
        3. **エンゲージメント**: システム利用の深度と頻度
        4. **満足度推定**: 質問-回答サイクルから推定される満足度
        5. **改善提案**: UI/UX改善とコンテンツ強化提案

        JSON形式で詳細な行動分析を提供してください:
        {
          "questionPatterns": {
            "peakTimes": ["ピーク利用時間"],
            "commonQuestionTypes": ["一般的な質問タイプ"],
            "userSegments": {
              "beginners": number,
              "intermediate": number,
              "advanced": number
            }
          },
          "comprehensionAnalysis": {
            "averageQuestionComplexity": "簡単/中程度/複雑",
            "learningProgress": "学習進歩の評価",
            "confusionPoints": ["混乱しやすいポイント"]
          },
          "engagement": {
            "averageSessionLength": number,
            "returnUserRate": number,
            "deepDiveTopics": ["深掘りされるトピック"]
          },
          "satisfactionIndicators": {
            "estimatedSatisfaction": "高/中/低",
            "successfulResolutions": number,
            "followUpQuestions": number
          },
          "improvementSuggestions": {
            "uiEnhancements": ["UI改善提案"],
            "contentGaps": ["コンテンツ不足領域"],
            "featureRequests": ["機能追加提案"]
          }
        }
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)
      
      return {
        type: 'user_behavior',
        result: analysis,
        confidence: 0.75,
        suggestions: analysis.improvementSuggestions?.uiEnhancements || [],
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
   * 質問候補生成（改善版）
   */
  async generateQuestionSuggestions(
    currentInput: string,
    conversationHistory: any[],
    userContext: any,
    availableRules: any[]
  ): Promise<string[]> {
    try {
      const prompt = spark.llmPrompt`
        現在のユーザー入力と文脈に基づいて、最も有用な質問候補を生成してください:

        ## 現在の入力
        "${currentInput}"

        ## 会話履歴
        ${conversationHistory.slice(-5).map(msg => 
          `${msg.type}: ${msg.content}`
        ).join('\n')}

        ## ユーザーコンテキスト
        権限: ${userContext.role}
        名前: ${userContext.name}

        ## 利用可能な規則
        ${availableRules.slice(0, 10).map(rule => 
          `[${rule.category}] ${rule.title}`
        ).join('\n')}

        ## 生成要件
        - 入力に直接関連する質問
        - 会話の文脈を考慮した発展的質問
        - ユーザーの権限レベルに適した質問
        - 実務的で具体的な質問
        - 各質問は30文字以内

        JSON配列形式で3-5個の質問候補を提供してください:
        ["質問候補1", "質問候補2", "質問候補3"]
      `

      const response = await spark.llm(prompt, 'gpt-4o-mini', true)
      const suggestions = JSON.parse(response)
      
      return Array.isArray(suggestions) ? suggestions.slice(0, 5) : []
    } catch (error) {
      console.error('Question suggestion error:', error)
      return []
    }
  }
}

// シングルトンインスタンスをエクスポート
export const openaiService = OpenAIService.getInstance()