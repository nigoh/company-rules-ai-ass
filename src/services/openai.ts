/**
 * Provides enhanced AI capabilities using

exp

  jsonMode: boolean

  role: 'system' | 'user' | 'assi
}
export interface AI
  result: any
 

    modelUsed: string
}
/**
 

  private readonly defaultConfig: Ope
    temperatur
    jsonMode:


    if (!OpenA
    }
  }
  /**
   
 

   
      // Spark Runti
        `${msg.role}: ${msg.cont
   
      
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
        ## 分析要件
        prompt, 
        3. **一貫性評価**: 既存規則と
        finalConfig.jsonMode
       
      
        JSON形式で詳細な分析結
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error('AI応答の生成に失敗しました')
     
  }

  /**
   * 規則分析機能
   * 規則の内容を分析し、改善提案や関連情報を提供
     
  async analyzeRule(
    rule: { title: string; content: string; category: string },
    existingRules: any[] = []
        confidence: analysis.overa
    const startTime = Date.now()
    
    try {
        }
        以下の規則を詳細に分析し、改善提案と品質評価を提供してください:

        ## 分析対象の規則
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
        ${conversation}

        名前: ${userContext.name}
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
       

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)
      
      return {
        type: 'rule_analysis',
        result: analysis,
        suggestions: summary.followUpQuestions,
        suggestions: analysis.improvements,
        metadata: {
          tokensUsed: response.length,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4o'
      thr
      }
    } catch (error) {
      console.error('Rule analysis error:', error)
      throw new Error('規則分析に失敗しました')
    }
   

  ): 
   * 会話要約機能
   * チャット履歴を分析して要約とインサイトを提供
     
  async generateConversationSummary(
        ## 現在の規則体系 (
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
            "bestPractices": ["推奨ベ
        4. **フォローアップ**: 推奨される追加質問や確認事項
        5. **行動提案**: ユーザーが取るべき具体的なアクション

              "priority": "高/中/低"
        {
            }
          "keyTopics": ["主要トピック1", "主要トピック2"],
          "userInterests": ["関心領域1", "関心領域2"],
          "knowledgeGaps": ["理解不足の領域1", "理解不足の領域2"],
          "followUpQuestions": ["追加質問候補1", "追加質問候補2"],
          "actionItems": ["推奨アクション1", "推奨アクション2"],
          "satisfactionLevel": "推定満足度(高/中/低)",
          "nextSteps": "次に取るべきステップ"
        c
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
  ): Promise<AIAnalysisRespon
        }
    try
    } catch (error) {
      console.error('Conversation summary error:', error)
      throw new Error('会話要約の生成に失敗しました')
     
  }

  /**
        ## ユーザー
   * 規則の不足や改善が必要な領域を特定
     
  async analyzePolicyGaps(

    interactionLogs: any[],
        2. **エンゲージメント**: システ
  ): Promise<AIAnalysisResponse> {

    
         
      const prompt = spark.llmPrompt`
        企業の規則体系と質問履歴を分析し、ポリシーギャップと改善提案を提供してください:

        ## 現在の規則体系 (${currentRules.length}件)
        ${currentRules.map(rule => `
        [${rule.category}] ${rule.title}
        内容: ${rule.content}
            "estimatedSatisfactio
            "contentGa

        ## 質問履歴分析 (${interactionLogs.length}件)
        ${interactionLogs.slice(-30).map(log => `



        `).join('\n')}

        ${industryContext ? `## 業界コンテキ��ト\n${industryContext}\n` : ''}

        ## 分析要件
        1. **カバレッジ分析**: 規則でカバーされていない領域
        2. **質問トレンド**: よく質問される未規則化領域

        4. **緊急度評価**: 新規則作成の優先順位


        {

            "coveredAreas": ["カバー済み領域"],
            "gapAreas": ["ギャップ領域"],
            "coverageScore": number
          },
          "questionTrends": {
            "frequentTopics": ["よく質問される話題"],
            "emergingConcerns": ["新しい関心事"],

          },

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

          "implementationPlan": "実装計画の概要"

      `

      const response = await spark.llm(prompt, 'gpt-4o', true)

      

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



























































































































