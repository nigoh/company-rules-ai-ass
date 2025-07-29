/**
 * Spark Runtime AP

  m

}
export interface ChatCompletionMe
  content: string

  type: 'rule_analys
 

  type: string
  confidence: number
  metadata?: {
 


 * OpenAI APIサービスクラス
 */
  private stati
 

  }
  private cons
  static getI
      OpenAIService.
    return OpenAIService

   * 基本的なチャット補完機能
  async chatCompletion(
    config: Partial<O
   
 

   
      const prompt =
      // LLM API呼び出し
   
        finalConfig.jsonMode
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
          "consistenc
      console.error('OpenAI API Error:', error)
      throw new Error('AI応答の生成に失敗しました')
    }
   


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

  /**
        タイトル: ${rule.title}
  async generateConversationSu
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
        2
          "clarity": {"score": number, "comment": "評価コメント"},
          "completeness": {"score": number, "comment": "評価コメント"},
          "consistency": {"score": number, "comment": "評価コメント"},
          "practicality": {"score": number, "comment": "評価コメント"},
          "overallScore": number,
          "improvements": ["改善提案1", "改善提案2"],
          "relatedRules": ["関連規則1", "関連規則2"],
          "actionItems": ["推奨アクション1", "推奨ア
          "recommendations": ["推奨事項1", "推奨事項2"]
        }
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)
      
        confid
        type: 'rule_analysis',
          tokensUsed: res
        confidence: analysis.overallScore / 10,
        suggestions: analysis.improvements,
        metadata: {
          tokensUsed: response.length,
          processingTime: Date.now() - startTime,
  }
        }
      }
    } catch (error) {
      console.error('Rule analysis error:', error)
      throw new Error('規則分析に失敗しました')
    i
  }

  /**
        企業の規則体系
   */
  async generateConversationSummary(
    messages: any[],
    userContext: { name: string; role: string; email: string }
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now()
    
        回
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
         
          "summary": "会話の簡潔な要約",
          "keyTopics": ["主要トピック1", "主要トピック2"],
          "userInterests": ["関心領域1", "関心領域2"],
          "knowledgeGaps": ["理解不足の領域1", "理解不足の領域2"],
          "followUpQuestions": ["追加質問候補1", "追加質問候補2"],
          "actionItems": ["推奨アクション1", "推奨アクション2"],
          "satisfactionLevel": "推定満足度(高/中/低)",
          "nextSteps": "次に取るべきステップ"
        }
       

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const summary = JSON.parse(response)
      
      return {
        type: 'conversation_summary',
        result: summary,
        confidence: 0.85,
        suggestions: summary.followUpQuestions,
  async analyzeUser
          tokensUsed: response.length,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4o'
    try {
      }
    } catch (error) {
      console.error('Conversation summary error:', error)
        ユーザー: ${log.userId}
    }
   

  /**
   * ポリシーギャップ分析
   * 規則の不足や改善が必要な領域を特定
   */
        1. **質問パターン**: ユーザ
    currentRules: any[],
        4. **満足度推定**: 質問-回答
    industryContext?: string
        JSON形式で詳細な行動分析を提供してください:
    const startTime = Date.now()
    
    try {
      const prompt = spark.llmPrompt`
        企業の規則体系と質問履歴を分析し、ポリシーギャップと改善提案を提供してください:

        ## 現在の規則体系 (${currentRules.length}件)
        ${currentRules.map(rule => `
        [${rule.category}] ${rule.title}
        内容: ${rule.content}
        最終更新: ${rule.lastUpdated}
            "returnUse

        ## 質問履歴分析 (${interactionLogs.length}件)
        ${interactionLogs.slice(-30).map(log => `
            "followUpQuesti
        回答���: ${log.responseLength}文字
            "uiEnhancements"
        `).join('\n')}

        ${industryContext ? `## 業界コンテキスト\n${industryContext}\n` : ''}

        ## 分析要件
        1. **カバレッジ分析**: 規則でカバーされていない領域
        2. **質問トレンド**: よく質問される未規則化領域
        result: analysis,
        4. **緊急度評価**: 新規則作成の優先順位
        metadata: {

          modelUsed: 'gpt-4o'
        {
    } catch (error) {
            "coveredAreas": ["カバー済み領域"],
            "gapAreas": ["ギャップ領域"],
            "coverageScore": number
          },
          "questionTrends": {
            "frequentTopics": ["よく質問される話題"],
            "emergingConcerns": ["新しい関心事"],
    userContext: any,
          },
    try {
            "missingStandards": ["不足している業界標準"],
            "bestPractices": ["推奨ベストプラクティス"]
          },
          "priorityRecommendations": [
            {
              "title": "推奨規則タイトル",
              "category": "カテゴリ",
              "priority": "高/中/低",
              "rationale": "必要性の理由",

            }
          `[
          "implementationPlan": "実装計画の概要"
        #
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)

      
      `
        type: 'policy_gap',
        result: analysis,
        confidence: 0.8,
        suggestions: analysis.priorityRecommendations?.map((rec: any) => rec.title) || [],
        metadata: {
          tokensUsed: response.length,
          processingTime: Date.now() - startTime,

        }

    } catch (error) {
      console.error('Policy gap analysis error:', error)
      throw new Error('ポリシーギャップ分析に失敗しました')
    }
  }

  /**
   * ユーザー行動分析
   * 質問パターンやユーザーの理解度を分析

  async analyzeUserBehavior(
    interactionLogs: any[],
    userProfiles: any[] = []

    const startTime = Date.now()

    try {

        ユーザーの質問パターンと行動を分析し、システム改善のインサイトを提供してください:

        ## インタラクションログ (${interactionLogs.length}件)






























































































































