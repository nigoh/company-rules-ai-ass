import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useKV } from '@github/spark/hooks'
import { Search, MessageCircle, Book, Settings, User, Plus, Edit2, Trash2, Send, SignIn, Check, X, Clock, Eye, UserCheck, Sparkle, FileText, Lightbulb } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { LoginDialog } from '@/components/auth/LoginDialog'
import { UserProfile } from '@/components/auth/UserProfile'
import { ProtectedRoute, usePermissions } from '@/components/auth/ProtectedRoute'

interface Rule {
  id: string
  title: string
  content: string
  category: string
  lastUpdated: string
  status: 'published' | 'pending' | 'rejected'
  submittedBy?: string
  submittedAt?: string
  reviewedBy?: string
  reviewedAt?: string
  reviewComment?: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: string
}

interface UserInfo {
  email: string
  role: 'admin' | 'hr' | 'employee'
  name: string
}

// AIインサイトパネルコンポーネント
function AIInsightsPanel({ exportConversationData }: { exportConversationData: () => void }) {
  const [logs, setLogs] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      const interactionLogs = await spark.kv.get<any[]>('ai-interaction-logs') || []
      setLogs(interactionLogs.slice(-20)) // 最新20件
    } catch (error) {
      console.error('Failed to load insights:', error)
    }
  }

  const generateAnalytics = async () => {
    if (logs.length < 5) {
      toast.error('分析に十分なデータがありません（最低5件の質問が必要）')
      return
    }

    setIsGenerating(true)
    try {
      const recentQuestions = logs.slice(-15).map(log => log.question).join('\n')
      const questionCategories = logs.map(log => log.question).join('\n')
      
      // Get current rules for context
      const currentRules = await spark.kv.get<Rule[]>('company-rules') || []
      const publishedRules = currentRules.filter(rule => rule.status === 'published')
      
      const prompt = spark.llmPrompt`
        以下のAI質問履歴と現在の会社規則を総合的に分析し、詳細なインサイトを提供してください:

        ## 質問履歴 (最新15件):
        ${recentQuestions}

        ## 現在の会社規則:
        ${publishedRules.map(rule => `
        [${rule.category}] ${rule.title}
        内容: ${rule.content}
        最終更新: ${rule.lastUpdated}
        `).join('\n')}

        ## 統計データ:
        - 総質問数: ${logs.length}件
        - 分析対象期間: 最新${Math.min(logs.length, 15)}件
        - アクティブユーザー数: ${[...new Set(logs.map(log => log.userId))].length}人
        - 平均回答長: ${logs.length > 0 ? Math.round(logs.reduce((sum, log) => sum + log.responseLength, 0) / logs.length) : 0}文字

        ## 詳細分析要求:

        ### 1. カテゴリ別需要分析
        - 最も質問されるカテゴリの特定
        - カテゴリごとの質問傾向
        - 需要の季節性や時間的パターン

        ### 2. 規則のギャップ分析
        - 質問内容と既存規則の比較
        - 規則が不足している領域の特定
        - 規則の明確性・理解しやすさの評価

        ### 3. ユーザー行動パターン
        - 質問の複雑さレベル分析
        - リピート質問の特定
        - ユーザーの理解度評価

        ### 4. 業務効率化提案
        - よく聞かれる質問のFAQ化提案
        - 規則の整備・改善提案
        - 社員教育・周知の改善点

        ### 5. 予測的インサイト
        - 今後増加すると予想される質問カテゴリ
        - 潜在的な問題領域の予測
        - 規則整備の優先順位

        JSON形式で以下の構造で回答してください:
        {
          "categoryAnalysis": {
            "topCategories": ["カテゴリ1", "カテゴリ2", "カテゴリ3"],
            "categoryTrends": "カテゴリ別の詳細な需要分析",
            "seasonalPatterns": "時間的・季節的パターンの分析"
          },
          "gapAnalysis": {
            "missingRules": ["不足している規則領域1", "不足している規則領域2"],
            "unclearRules": ["不明確な規則1", "不明確な規則2"],
            "improvementAreas": ["改善が必要な領域1", "改善が必要な領域2"]
          },
          "userBehavior": {
            "complexityLevel": "質問の複雑さレベル（簡単/中程度/複雑）",
            "repeatQuestions": ["よく繰り返される質問1", "よく繰り返される質問2"],
            "comprehensionLevel": "ユーザーの理解度評価"
          },
          "efficiency": {
            "suggestedFAQs": [
              {"question": "FAQ候補質問1", "category": "カテゴリ", "priority": "高/中/低"},
              {"question": "FAQ候補質問2", "category": "カテゴリ", "priority": "高/中/低"}
            ],
            "ruleImprovements": ["規則改善提案1", "規則改善提案2"],
            "trainingNeeds": ["社員教育が必要な分野1", "社員教育が必要な分野2"]
          },
          "predictions": {
            "emergingTopics": ["今後注目される話題1", "今後注目される話題2"],
            "potentialIssues": ["潜在的な問題1", "潜在的な問題2"],
            "priorityActions": ["優先すべきアクション1", "優先すべきアクション2"]
          },
          "overallInsights": "総合的な洞察とレコメンデーション",
          "actionItems": ["具体的な改善アクション1", "具体的な改善アクション2", "具体的な改善アクション3"]
        }
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analyticsData = JSON.parse(response)
      setAnalytics(analyticsData)
      toast.success('高度な分析が完了しました')
    } catch (error) {
      console.error('Analytics generation error:', error)
      toast.error('分析の生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AIインサイト</h3>
        <div className="flex items-center gap-2">
          <Button 
            onClick={exportConversationData} 
            variant="outline"
            size="sm"
          >
            <FileText size={14} className="mr-2" />
            データ出力
          </Button>
          <Button 
            onClick={generateAnalytics} 
            disabled={isGenerating || logs.length < 5}
            variant="outline"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                分析中...
              </>
            ) : (
              <>
                <Sparkle size={16} className="mr-2" />
                分析実行
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">質問統計</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">総質問数:</span>
              <span className="font-medium">{logs.length}件</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">今日の質問:</span>
              <span className="font-medium">
                {logs.filter(log => 
                  new Date(log.timestamp).toDateString() === new Date().toDateString()
                ).length}件
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">平均回答長:</span>
              <span className="font-medium">
                {logs.length > 0 ? Math.round(logs.reduce((sum, log) => sum + log.responseLength, 0) / logs.length) : 0}文字
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">アクティブユーザー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...new Set(logs.slice(-10).map(log => log.userId))].slice(0, 5).map((userId, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate">{userId}</span>
                  <span className="font-medium">
                    {logs.filter(log => log.userId === userId).length}件
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {analytics && (
        <div className="space-y-4">
          {/* Category Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                📊 カテゴリ別需要分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">人気カテゴリ</h4>
                <div className="flex flex-wrap gap-2">
                  {analytics.categoryAnalysis?.topCategories?.map((category: string, index: number) => (
                    <Badge key={index} variant="secondary">{category}</Badge>
                  ))}
                </div>
              </div>
              
              {analytics.categoryAnalysis?.categoryTrends && (
                <div>
                  <h4 className="font-medium mb-2">カテゴリ傾向</h4>
                  <p className="text-sm text-muted-foreground">{analytics.categoryAnalysis.categoryTrends}</p>
                </div>
              )}
              
              {analytics.categoryAnalysis?.seasonalPatterns && (
                <div>
                  <h4 className="font-medium mb-2">時間的パターン</h4>
                  <p className="text-sm text-muted-foreground">{analytics.categoryAnalysis.seasonalPatterns}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gap Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                🔍 規則ギャップ分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.gapAnalysis?.missingRules?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-orange-600">不足している規則領域</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {analytics.gapAnalysis.missingRules.map((rule: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-500">⚠️</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analytics.gapAnalysis?.unclearRules?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-blue-600">明確化が必要な規則</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {analytics.gapAnalysis.unclearRules.map((rule: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500">💡</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analytics.gapAnalysis?.improvementAreas?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-green-600">改善領域</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {analytics.gapAnalysis.improvementAreas.map((area: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500">🔧</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                👥 ユーザー行動分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.userBehavior?.complexityLevel && (
                <div>
                  <h4 className="font-medium mb-2">質問の複雑さ</h4>
                  <Badge variant="outline">{analytics.userBehavior.complexityLevel}</Badge>
                </div>
              )}
              
              {analytics.userBehavior?.repeatQuestions?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">よく繰り返される質問</h4>
                  <div className="space-y-1">
                    {analytics.userBehavior.repeatQuestions.map((question: string, index: number) => (
                      <p key={index} className="text-sm p-2 bg-secondary/50 rounded">
                        {question}
                      </p>
                    ))}
                  </div>
                </div>
      // Get conversation history for context
      const recentHistory = chatMessages.slice(-6).map(msg => 
        `${msg.type === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
      ).join('\n')

      // Enhanced personality instructions with context awareness
                </div>
        professional: '簡潔で業務的な回答を心がけ、要点を整理して効率的に情報を提供してください。箇条書きや番号付きリストを活用し、実践的なアドバイスを含めてください。',
        friendly: '親しみやすく丁寧な口調で、相手の立場に立った温かい回答を提供してください。共感を示し、具体例を交えて分かりやすく説明してください。',
        detailed: '詳細な説明と背景情報を含め、関連する規則や手続きを包括的に解説してください。法的根拠や実務上の注意点も合わせて提供し、深い理解を促してください。'

          {/* Efficiency Recommendations */}
      // Build enhanced company context
      const companyContext = {
        policies: publishedRules.map(rule => ({
          category: rule.category,
          title: rule.title,
          content: rule.content,
          lastUpdated: rule.lastUpdated
        })),
        faqs: faqs.map(faq => ({
          category: faq.category,
          question: faq.question,
          answer: faq.answer
        })),
        categories: [...new Set(publishedRules.map(rule => rule.category))],
        totalRules: publishedRules.length
      }

                            className="text-xs"
        あなたは「社則AI」という高度な企業人事システムのAIアシスタントです。以下の詳細な会社情報と専門知識を基に、最も有用で正確な回答を提供してください。
                            {faq.priority}
        ## システム情報
        - システム名: 社則AI (Company Rules AI Assistant)
        - 役割: 企業規則・人事制度の専門アドバイザー/p>
        - 対応言語: 日本語
        - 専門分野: 労務管理、人事制度、法的コンプライアンス
 </div>
        ## 回答スタイル設定
              )}
      
        ## 会話履歴（文脈理解用）eImprovements?.length > 0 && (
        ${recentHistory ? `過去の会話:\n${recentHistory}\n` : ''}
lassName="font-medium mb-2">規則改善提案</h4>
        ## 包括的な会社データベースd space-y-1">
cy.ruleImprovements.map((improvement: string, index: number) => (
        ### 📋 現在の会社規則 (${companyContext.totalRules}件)
        ${companyContext.policies.map(rule => `
        ▼ カテゴリ: ${rule.category}
        規則名: ${rule.title}
        詳細内容: ${rule.content}
                  </ul>
        ────────────────
              )}
              
        ### ❓ FAQ データベースs?.length > 0 && (
        ${companyContext.faqs.map(faq => `
        [${faq.category}] ${faq.question}
        回答: ${faq.answer}-foreground space-y-1">
        ────────────────ngNeeds.map((need: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">🎓</span>
        ### 📊 規則カテゴリ一覧
        利用可能なカテゴリ: ${companyContext.categories.join(', ')}

        ## ユーザープロファイルl>
        - 権限レベル: ${currentUser.role === 'admin' ? '管理者（全権限）' : currentUser.role === 'hr' ? '人事部（規則管理・承認権限）' : '一般社員（閲覧・質問権限）'}
        - 識別名: ${currentUser.name}
        - メールアドレス: ${currentUser.email}
d>
        ## 現在の質問
        「${currentInput}」

        ## 高度な回答指針
me="text-base flex items-center gap-2">
        ### 1. 情報分析と関連性評価
        - 質問内容を詳細に分析し、関連する規則を包括的に特定
        - 直接的な関連規則だけでなく、間接的に影響する可能性のある規則も考慮
        - FAQとの関連性も評価し、既存の回答パターンを参考にする

        ### 2. 構造化された回答提供
        - **該当規則**: 具体的な規則名と内容を正確に引用
        - **実務的な解釈**: 規則の実際の運用における意味を説明
        - **手続きガイダンス**: 必要な手続きや連絡先を具体的に案内
        - **関連情報**: 併せて知っておくべき関連規則や注意事項
        - **例外・特記事項**: 特殊なケースや例外的な取り扱いがある場合は明記

        ### 3. 権限レベル別対応
        - 一般社員: 基本的な情報と手続き方法を中心に案内
        - 人事部: 管理・運用の観点からより詳細な情報を提供
        - 管理者: 制度設計や法的背景も含む包括的な情報を提供

        ### 4. 品質保証
        - 情報の正確性を最優先とし、推測や憶測は避ける
        - 規則に明記されていない内容は一般的なガイダンスとして区別して提示
        - 法的な専門性が必要な場合は適切な専門機関への相談を推奨
        - 緊急性や重要度に応じて適切な連絡先や対応方法を案内

        ### 5. ユーザビリティ向上
        - 読みやすい形式（見出し、箇条書き、番号付きリスト）を活用
        - 絵文字や記号を適度に使用して視認性を向上
        - 専門用語は必要に応じて分かりやすく解説
        - 次のアクションが明確になるよう具体的な指示を含める

        上記の方針に従い、最も価値のある専門的な回答を日本語で提供してください。
                <div>
                  <h4 className="font-medium mb-2 text-green-600">優先アクション</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {analytics.predictions.priorityActions.map((action: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500">🎯</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overall Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                💡 総合インサイト
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.overallInsights && (
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{analytics.overallInsights}</p>
                </div>
              )}
              
              {analytics.actionItems?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">具体的な改善アクション</h4>
                  <div className="space-y-2">
                    {analytics.actionItems.map((action: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <span className="text-primary font-medium text-sm">#{index + 1}</span>
                        <p className="text-sm flex-1">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近の質問履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logs.slice(-10).reverse().map((log, index) => (
              <div key={index} className="text-sm border-l-2 border-accent pl-3 py-2">
                <p className="font-medium truncate">{log.question}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{log.userId}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleString('ja-JP')}</span>
                  <span>•</span>
                  <span>{log.responseLength}文字</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function App() {
  const [rules, setRules] = useKV<Rule[]>('company-rules', [
    {
      id: '1',
      title: '勤務時間に関する規則',
      content: '標準勤務時間は9:00-18:00（休憩1時間含む）です。フレックスタイム制を採用しており、コアタイム10:00-15:00を除き、8:00-20:00の間で勤務時間を調整できます。',
      category: '勤務',
      lastUpdated: '2024-01-15',
      status: 'published'
    },
    {
      id: '2', 
      title: '有給休暇の取得について',
      content: '有給休暇は入社日から6ヶ月経過後に付与されます。取得時は3営業日前までに申請が必要です。年次有給休暇の取得促進のため、計画的付与制度を導入しています。',
      category: '休暇',
      lastUpdated: '2024-01-10',
      status: 'published'
    },
    {
      id: '3',
      title: '服装規定について',
      content: 'ビジネスカジュアルを基本とします。お客様との面談がある日はスーツ着用を推奨します。安全上の理由から、サンダルでの勤務は禁止です。',
      category: '服装',
      lastUpdated: '2024-01-05',
      status: 'published'
    }
  ])

  const [faqs] = useKV<FAQ[]>('company-faqs', [
    {
      id: '1',
      question: '残業代はどのように計算されますか？',
      answer: '法定時間外労働に対して25%の割増賃金を支給します。深夜労働（22:00-5:00）は35%割増となります。',
      category: '給与'
    },
    {
      id: '2',
      question: 'リモートワークは可能ですか？',
      answer: '週3日までリモートワーク可能です。事前に上司の承認を得て、業務に支障がない範囲で実施してください。',
      category: '勤務'
    }
  ])

  const [chatMessages, setChatMessages] = useKV<ChatMessage[]>('chat-history', [])
  const [currentUser, setCurrentUser] = useKV<UserInfo | null>('current-user', null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [newRule, setNewRule] = useState({ title: '', content: '', category: '' })
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [activeAdminTab, setActiveAdminTab] = useState<'add' | 'manage' | 'pending' | 'insights'>('add')
  const [reviewComment, setReviewComment] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [chatPersonality, setChatPersonality] = useKV<'professional' | 'friendly' | 'detailed'>('ai-personality', 'professional')

  // Reset admin tab for HR users who don't have access to pending/insights
  const handleAdminTabChange = (value: string) => {
    if ((value === 'pending' || value === 'insights') && currentUser?.role !== 'admin') {
      return // Don't allow HR users to access pending/insights tabs
    }
    setActiveAdminTab(value as any)
  }

  const permissions = usePermissions(currentUser)

  const categories = ['all', '勤務', '休暇', '服装', '給与', '福利厚生']

  const filteredRules = rules.filter(rule => {
    // Only show published rules in search view
    if (rule.status !== 'published') return false
    
    const matchesSearch = searchQuery === '' || 
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const pendingRules = rules.filter(rule => rule.status === 'pending')
  const publishedRules = rules.filter(rule => rule.status === 'published')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return
    if (!currentUser) {
      toast.error('AI質問機能を利用するにはログインが必要です')
      setShowLoginDialog(true)
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    }

    setChatMessages(current => [...current, userMessage])
    setIsLoading(true)
    const currentInput = chatInput
    setChatInput('')

    try {
      // Get conversation history for context
      const recentHistory = chatMessages.slice(-6).map(msg => 
        `${msg.type === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
      ).join('\n')

      // Enhanced personality instructions with context awareness
      const personalityInstructions = {
        professional: '簡潔で業務的な回答を心がけ、要点を整理して効率的に情報を提供してください。箇条書きや番号付きリストを活用し、実践的なアドバイスを含めてください。',
        friendly: '親しみやすく丁寧な口調で、相手の立場に立った温かい回答を提供してください。共感を示し、具体例を交えて分かりやすく説明してください。',
        detailed: '詳細な説明と背景情報を含め、関連する規則や手続きを包括的に解説してください。法的根拠や実務上の注意点も合わせて提供し、深い理解を促してください。'
      }

      // Build enhanced company context
      const companyContext = {
        policies: publishedRules.map(rule => ({
          category: rule.category,
          title: rule.title,
          content: rule.content,
          lastUpdated: rule.lastUpdated
        })),
        faqs: faqs.map(faq => ({
          category: faq.category,
          question: faq.question,
          answer: faq.answer
        })),
        categories: [...new Set(publishedRules.map(rule => rule.category))],
        totalRules: publishedRules.length
      }

      const prompt = spark.llmPrompt`
        あなたは「社則AI」という高度な企業人事システムのAIアシスタントです。以下の詳細な会社情報と専門知識を基に、最も有用で正確な回答を提供してください。

        ## システム情報
        - システム名: 社則AI (Company Rules AI Assistant)
        - 役割: 企業規則・人事制度の専門アドバイザー
        - 対応言語: 日本語
        - 専門分野: 労務管理、人事制度、法的コンプライアンス

        ## 回答スタイル設定
        ${personalityInstructions[chatPersonality]}

        ## 会話履歴（文脈理解用）
        ${recentHistory ? `過去の会話:\n${recentHistory}\n` : ''}

        ## 包括的な会社データベース

        ### 📋 現在の会社規則 (${companyContext.totalRules}件)
        ${companyContext.policies.map(rule => `
        ▼ カテゴリ: ${rule.category}
        規則名: ${rule.title}
        詳細内容: ${rule.content}
        最終更新: ${rule.lastUpdated}
        ────────────────
        `).join('\n')}

        ### ❓ FAQ データベース
        ${companyContext.faqs.map(faq => `
        [${faq.category}] ${faq.question}
        回答: ${faq.answer}
        ────────────────
        `).join('\n')}

        ### 📊 規則カテゴリ一覧
        利用可能なカテゴリ: ${companyContext.categories.join(', ')}

        ## ユーザープロファイル
        - 権限レベル: ${currentUser.role === 'admin' ? '管理者（全権限）' : currentUser.role === 'hr' ? '人事部（規則管理・承認権限）' : '一般社員（閲覧・質問権限）'}
        - 識別名: ${currentUser.name}
        - メールアドレス: ${currentUser.email}

        ## 現在の質問
        「${currentInput}」

        ## 高度な回答指針

        ### 1. 情報分析と関連性評価
        - 質問内容を詳細に分析し、関連する規則を包括的に特定
        - 直接的な関連規則だけでなく、間接的に影響する可能性のある規則も考慮
        - FAQとの関連性も評価し、既存の回答パターンを参考にする

        ### 2. 構造化された回答提供
        - **該当規則**: 具体的な規則名と内容を正確に引用
        - **実務的な解釈**: 規則の実際の運用における意味を説明
        - **手続きガイダンス**: 必要な手続きや連絡先を具体的に案内
        - **関連情報**: 併せて知っておくべき関連規則や注意事項
        - **例外・特記事項**: 特殊なケースや例外的な取り扱いがある場合は明記

        ### 3. 権限レベル別対応
        - 一般社員: 基本的な情報と手続き方法を中心に案内
        - 人事部: 管理・運用の観点からより詳細な情報を提供
        - 管理者: 制度設計や法的背景も含む包括的な情報を提供

        ### 4. 品質保証
        - 情報の正確性を最優先とし、推���や憶測は避ける
        - 規則に明記されていない内容は一般的なガイダンスとして区別して提示
        - 法的な専門性が必要な場合は適切な専門機関への相談を推奨
        - 緊急性や重要度に応じて適切な連絡先や対応方法を案内

        ### 5. ユーザビリティ向上
        - 読みやすい形式（見出し、箇条書き、番号付きリスト）を活用
        - 絵文字や記号を適度に使用して視認性を向上
        - 専門用語は必要に応じて分かりやすく解説
        - 次のアクションが明確になるよう具体的な指示を含める

        上記の方針に従い、最も価値のある専門的な回答を日本語で提供してください。
      `

      const response = await spark.llm(prompt, 'gpt-4o')

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date().toISOString()
      }

      setChatMessages(current => [...current, aiMessage])
      
      // AI応答の品質を記録（将来の改善のため）
      const interactionLog = {
        userId: currentUser.email,
        question: currentInput,
        response: response,
        timestamp: new Date().toISOString(),
        rulesReferenced: publishedRules.length,
        responseLength: response.length
      }
      
      // インタラクションログを保存
      const logs = await spark.kv.get<any[]>('ai-interaction-logs') || []
      await spark.kv.set('ai-interaction-logs', [...logs.slice(-100), interactionLog]) // 最新100件のみ保持

    } catch (error) {
      console.error('AI Response Error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '申し訳ございません。現在AIシステムに問題が発生しています。しばらく時間をおいてから再度お試しください。緊急の場合は人事部まで直接お問い合わせください。',
        timestamp: new Date().toISOString()
      }
      setChatMessages(current => [...current, errorMessage])
      toast.error('AIからの回答を取得できませんでした')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRule = () => {
    if (!newRule.title || !newRule.content || !newRule.category) {
      toast.error('すべての項目を入力してください')
      return
    }

    if (!currentUser) {
      toast.error('ログインが必要です')
      return
    }

    const rule: Rule = {
      id: Date.now().toString(),
      title: newRule.title,
      content: newRule.content,
      category: newRule.category,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: currentUser.role === 'admin' ? 'published' : 'pending',
      submittedBy: currentUser.name,
      submittedAt: new Date().toISOString()
    }

    setRules(current => [...current, rule])
    setNewRule({ title: '', content: '', category: '' })
    
    if (currentUser.role === 'admin') {
      toast.success('規則を公開しました')
    } else {
      toast.success('規則を承認待ちリストに追加しました')
    }
  }

  const handleUpdateRule = () => {
    if (!editingRule || !currentUser) return

    setRules(current => current.map(rule => 
      rule.id === editingRule.id 
        ? { 
            ...editingRule, 
            lastUpdated: new Date().toISOString().split('T')[0],
            status: currentUser.role === 'admin' ? 'published' : 'pending',
            submittedBy: editingRule.submittedBy || currentUser.name,
            submittedAt: editingRule.submittedAt || new Date().toISOString()
          }
        : rule
    ))
    setEditingRule(null)
    
    if (currentUser.role === 'admin') {
      toast.success('規則を更新しました')
    } else {
      toast.success('規則の変更を承認待ちリストに追加しました')
    }
  }

  const handleApproveRule = (ruleId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('承認権限がありません')
      return
    }

    setRules(current => current.map(rule => 
      rule.id === ruleId 
        ? { 
            ...rule, 
            status: 'published',
            reviewedBy: currentUser.name,
            reviewedAt: new Date().toISOString(),
            reviewComment: reviewComment || undefined
          }
        : rule
    ))
    setReviewComment('')
    toast.success('規則を承認・公開しました')
  }

  const handleRejectRule = (ruleId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('承認権限がありません')
      return
    }

    if (!reviewComment.trim()) {
      toast.error('却下理由を入力してください')
      return
    }

    setRules(current => current.map(rule => 
      rule.id === ruleId 
        ? { 
            ...rule, 
            status: 'rejected',
            reviewedBy: currentUser.name,
            reviewedAt: new Date().toISOString(),
            reviewComment: reviewComment
          }
        : rule
    ))
    setReviewComment('')
    toast.success('規則を却下しました')
  }

  // AI提案機能 - 入力に基づいて関連質問を提案
  const generateSuggestions = async (input: string) => {
    if (input.length < 3) {
      setAiSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      // Get recent conversation context
      const recentContext = chatMessages.slice(-4).map(msg => 
        `${msg.type}: ${msg.content}`
      ).join('\n')

      const prompt = spark.llmPrompt`
        現在のユーザー入力「${input}」と以下の情報を基に、最も有用な質問候補を提案してください。

        ## 会社規則データベース:
        ${publishedRules.map(rule => `[${rule.category}] ${rule.title}: ${rule.content.substring(0, 100)}...`).join('\n')}

        ## FAQ例:
        ${faqs.map(faq => `Q: ${faq.question}`).join('\n')}

        ## 最近の会話履歴:
        ${recentContext}

        ## ユーザープロファイル:
        - 権限: ${currentUser?.role === 'admin' ? '管理者' : currentUser?.role === 'hr' ? '人事部' : '一般社員'}
        - 名前: ${currentUser?.name}

        ## 提案要件:
        1. ユーザーの入力に直接関連する質問
        2. 現在の会話の文脈を考慮した発展的な質問
        3. ユーザーの権限レベルに適した質問
        4. 実務的で具体的な質問
        5. 各質問は25文字以内で簡潔に

        ## 出力形式:
        JSON配列: ["具体的質問1", "関連質問2", "発展的質問3"]

        最も価値のある3つの質問候補を提案してください。
      `

      const response = await spark.llm(prompt, 'gpt-4o-mini', true)
      const suggestions = JSON.parse(response)
      
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        setAiSuggestions(suggestions.slice(0, 3))
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
    }
  }

  // AI応答の要約機能
  const generateConversationSummary = async () => {
    if (chatMessages.length < 4) return

    try {
      const conversation = chatMessages.map(msg => 
        `${msg.type === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
      ).join('\n')

      const userInfo = `${currentUser?.name} (${currentUser?.role === 'admin' ? '管理者' : currentUser?.role === 'hr' ? '人事部' : '一般社員'})`

      const prompt = spark.llmPrompt`
        以下の社則AIとの会話を専門的に要約し、実務的な価値を提供してください:

        ## 会話履歴:
        ${conversation}

        ## ユーザー情報:
        ${userInfo}

        ## 現在の会社規則 (参考):
        ${publishedRules.map(rule => `[${rule.category}] ${rule.title}`).join('\n')}

        ## 要約要件:
        1. **主要な質問内容** - 何について聞かれたか
        2. **提供された情報** - どの規則・制度が説明されたか
        3. **関連規則・制度** - 言及された具体的な規則名
        4. **実務的なアドバイス** - 具体的な手続きや注意点
        5. **今後のアクション** - ユーザーが取るべき次のステップ
        6. **追加の検討事項** - 関連して確認すべき事項
        7. **重要なポイント** - 特に記憶すべき要点

        ## 出力形式:
        構造化されたMarkdown形式で、実務担当者が後で参照しやすい形式で要約してください。
        各セクションは明確に分けて、具体的で実行可能な情報を含めてください。
      `

      const summary = await spark.llm(prompt, 'gpt-4o')
      
      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `📋 **会話の要約**\n\n${summary}`,
        timestamp: new Date().toISOString()
      }

      setChatMessages(current => [...current, summaryMessage])
      
      // 要約をログとして保存
      const summaryLog = {
        userId: currentUser?.email || 'unknown',
        type: 'conversation_summary',
        content: summary,
        timestamp: new Date().toISOString(),
        messageCount: chatMessages.length
      }
      
      const logs = await spark.kv.get<any[]>('ai-interaction-logs') || []
      await spark.kv.set('ai-interaction-logs', [...logs.slice(-99), summaryLog])
      
      toast.success('会話を詳細に要約しました')
    } catch (error) {
      console.error('Summary generation error:', error)
      toast.error('要約の生成に失敗しました')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setChatMessages([])
    toast.success('ログアウトしました')
  }

  const handleDeleteRule = (id: string) => {
    setRules(current => current.filter(rule => rule.id !== id))
    toast.success('規則を削除しました')
  }

  const handleLogin = (user: UserInfo) => {
    setCurrentUser(user)
    toast.success(`${user.name}としてログインしました`)
  }

  // Export conversation insights for analysis
  const exportConversationData = async () => {
    try {
      const logs = await spark.kv.get<any[]>('ai-interaction-logs') || []
      const conversations = await spark.kv.get<ChatMessage[]>('chat-history') || []
      
      const exportData = {
        timestamp: new Date().toISOString(),
        user: currentUser?.name,
        stats: {
          totalQuestions: logs.length,
          totalConversations: conversations.length,
          averageResponseLength: logs.length > 0 ? Math.round(logs.reduce((sum, log) => sum + log.responseLength, 0) / logs.length) : 0,
          activeUsers: [...new Set(logs.map(log => log.userId))].length
        },
        recentLogs: logs.slice(-50),
        currentRules: publishedRules.map(rule => ({
          title: rule.title,
          category: rule.category,
          lastUpdated: rule.lastUpdated
        }))
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `company-rules-ai-insights-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('データをエクスポートしました')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('エクスポートに失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Book size={32} weight="bold" className="text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">社則AI</h1>
              <p className="text-muted-foreground">Company Rules AI Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {currentUser ? (
              <UserProfile user={currentUser} onLogout={handleLogout} />
            ) : (
              <Button onClick={() => setShowLoginDialog(true)} variant="outline">
                <SignIn size={16} className="mr-2" />
                ログイン
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search size={16} />
              規則検索
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="flex items-center gap-2"
              disabled={!permissions.canAskAI}
            >
              <MessageCircle size={16} />
              AI質問
              {!currentUser && <span className="text-xs">(要ログイン)</span>}
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <User size={16} />
              FAQ
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center gap-2"
              disabled={!permissions.canViewAdmin}
            >
              <Settings size={16} />
              管理
              {currentUser?.role === 'admin' && pendingRules.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {pendingRules.length}
                </Badge>
              )}
              {!permissions.canViewAdmin && <span className="text-xs">(権限不足)</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div className="flex gap-4">
              <Input
                placeholder="規則を検索..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'すべて' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4">
              {filteredRules.map(rule => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{rule.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{rule.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            更新日: {rule.lastUpdated}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">{rule.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <ProtectedRoute
              user={currentUser}
              allowedRoles={['admin', 'hr', 'employee']}
              fallback={
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      AI質問機能を利用するにはログインが必要です
                    </p>
                    <Button onClick={() => setShowLoginDialog(true)}>
                      <SignIn size={16} className="mr-2" />
                      ログイン
                    </Button>
                  </CardContent>
                </Card>
              }
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkle size={20} className="text-primary" />
                        AI質問応答
                      </CardTitle>
                      <CardDescription>
                        会社の規則について質問してください。AIが適切な回答を提供します。
                        <span className="block text-xs mt-1 text-primary">
                          📚 現在{publishedRules.length}件の規則と{faqs.length}件のFAQを参照可能
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={chatPersonality}
                        onChange={(e) => setChatPersonality(e.target.value as any)}
                        className="text-xs px-2 py-1 border border-input rounded bg-background"
                      >
                        <option value="professional">業務的</option>
                        <option value="friendly">親しみやすい</option>
                        <option value="detailed">詳細</option>
                      </select>
                      {chatMessages.length >= 4 && (
                        <Button
                          onClick={generateConversationSummary}
                          variant="outline"
                          size="sm"
                        >
                          <FileText size={14} className="mr-1" />
                          要約
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-96 overflow-y-auto space-y-4 p-4 border rounded-lg bg-secondary/50">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Lightbulb size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="mb-2">AIに何でも質問してください</p>
                        <div className="text-xs space-y-1">
                          <p>例: 「有給の取得方法は？」</p>
                          <p>例: 「残業代の計算方法を教えて」</p>
                          <p>例: 「服装規定について詳しく」</p>
                        </div>
                      </div>
                    )}
                    {chatMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card text-card-foreground border'
                          }`}
                        >
                          {message.type === 'ai' && message.content.includes('**会話の要約**') ? (
                            <div className="text-sm space-y-2">
                              {message.content.split('\n').map((line, index) => (
                                <p key={index} className={line.startsWith('**') ? 'font-medium' : ''}>
                                  {line.replace(/\*\*/g, '')}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card text-card-foreground border px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            <p className="text-sm">AIが回答を生成中...</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {showSuggestions && aiSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Lightbulb size={14} />
                        関連する質問候補:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => {
                              setChatInput(suggestion)
                              setShowSuggestions(false)
                            }}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Textarea
                      placeholder="規則について質問してください..."
                      value={chatInput}
                      onChange={(e) => {
                        setChatInput(e.target.value)
                        generateSuggestions(e.target.value)
                      }}
                      className="flex-1 resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleChatSubmit()
                        }
                      }}
                    />
                    <Button 
                      onClick={handleChatSubmit} 
                      disabled={isLoading || !chatInput.trim()}
                      className="self-end"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    💡 ヒント: Enterで送信、Shift+Enterで改行
                  </div>
                </CardContent>
              </Card>
            </ProtectedRoute>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>よくある質問</CardTitle>
                <CardDescription>
                  社員からよく寄せられる質問とその回答をまとめています。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{faq.category}</Badge>
                      <h3 className="font-medium">{faq.question}</h3>
                    </div>
                    <p className="text-muted-foreground pl-4 border-l-2 border-accent">
                      {faq.answer}
                    </p>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <ProtectedRoute
              user={currentUser}
              allowedRoles={['admin', 'hr']}
              fallback={
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      管理機能にアクセスするには管理者または人事部の権限が必要です
                    </p>
                    {!currentUser && (
                      <Button onClick={() => setShowLoginDialog(true)}>
                        <SignIn size={16} className="mr-2" />
                        ログイン
                      </Button>
                    )}
                  </CardContent>
                </Card>
              }
            >
              <Card>
                <CardHeader>
                  <CardTitle>規則管理</CardTitle>
                  <CardDescription>
                    会社規則の追加・編集・削除を行います。
                    {currentUser && (
                      <span className="block mt-1 text-xs">
                        現在のアクセス権限: {currentUser.role === 'admin' ? '管理者' : '人事部'}
                        {currentUser.role === 'hr' && (
                          <span className="text-orange-600 ml-2">※ 人事部の投稿は管理者の承認が必要です</span>
                        )}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeAdminTab} onValueChange={handleAdminTabChange}>
                    <TabsList className={`grid w-full ${currentUser?.role === 'admin' ? 'grid-cols-4' : 'grid-cols-2'}`}>
                      <TabsTrigger value="add" className="flex items-center gap-2">
                        <Plus size={16} />
                        新規作成
                      </TabsTrigger>
                      <TabsTrigger value="manage" className="flex items-center gap-2">
                        <Eye size={16} />
                        公開中の規則
                      </TabsTrigger>
                      {currentUser?.role === 'admin' && (
                        <>
                          <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock size={16} />
                            承認待ち
                            {pendingRules.length > 0 && (
                              <Badge variant="destructive" className="ml-1 text-xs">
                                {pendingRules.length}
                              </Badge>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="insights" className="flex items-center gap-2">
                            <Sparkle size={16} />
                            AIインサイト
                          </TabsTrigger>
                        </>
                      )}
                    </TabsList>

                    <TabsContent value="add" className="space-y-4 mt-6">
                      <h3 className="text-lg font-medium">新しい規則を追加</h3>
                      <div className="grid gap-4">
                        <Input
                          placeholder="規則のタイトル"
                          value={newRule.title}
                          onChange={(e) => setNewRule(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <select
                          value={newRule.category}
                          onChange={(e) => setNewRule(prev => ({ ...prev, category: e.target.value }))}
                          className="px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="">カテゴリを選択</option>
                          {categories.slice(1).map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        <Textarea
                          placeholder="規則の内容"
                          value={newRule.content}
                          onChange={(e) => setNewRule(prev => ({ ...prev, content: e.target.value }))}
                          rows={4}
                        />
                        <Button onClick={handleAddRule} className="w-fit">
                          <Plus size={16} className="mr-2" />
                          {currentUser?.role === 'admin' ? '規則を公開' : '規則を申請'}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="manage" className="space-y-4 mt-6">
                      <h3 className="text-lg font-medium">公開中の規則</h3>
                      {publishedRules.map(rule => (
                        <Card key={rule.id}>
                          <CardContent className="pt-6">
                            {editingRule?.id === rule.id ? (
                              <div className="space-y-4">
                                <Input
                                  value={editingRule.title}
                                  onChange={(e) => setEditingRule(prev => 
                                    prev ? { ...prev, title: e.target.value } : prev
                                  )}
                                />
                                <select
                                  value={editingRule.category}
                                  onChange={(e) => setEditingRule(prev => 
                                    prev ? { ...prev, category: e.target.value } : prev
                                  )}
                                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                                >
                                  {categories.slice(1).map(category => (
                                    <option key={category} value={category}>{category}</option>
                                  ))}
                                </select>
                                <Textarea
                                  value={editingRule.content}
                                  onChange={(e) => setEditingRule(prev => 
                                    prev ? { ...prev, content: e.target.value } : prev
                                  )}
                                  rows={4}
                                />
                                <div className="flex gap-2">
                                  <Button onClick={handleUpdateRule} size="sm">
                                    {currentUser?.role === 'admin' ? '保存' : '変更申請'}
                                  </Button>
                                  <Button 
                                    onClick={() => setEditingRule(null)} 
                                    variant="outline" 
                                    size="sm"
                                  >
                                    キャンセル
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium">{rule.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary">{rule.category}</Badge>
                                      <Badge variant="outline" className="text-green-600 border-green-200">
                                        公開中
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => setEditingRule(rule)}
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Edit2 size={14} />
                                    </Button>
                                    {currentUser?.role === 'admin' && (
                                      <Button
                                        onClick={() => handleDeleteRule(rule.id)}
                                        variant="destructive"
                                        size="sm"
                                      >
                                        <Trash2 size={14} />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{rule.content}</p>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <p>更新日: {rule.lastUpdated}</p>
                                  {rule.submittedBy && (
                                    <p>作成者: {rule.submittedBy}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    {currentUser?.role === 'admin' && (
                      <TabsContent value="pending" className="space-y-4 mt-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">承認待ちの規則</h3>
                          {pendingRules.length > 0 && (
                            <Badge variant="secondary">
                              {pendingRules.length}件の申請
                            </Badge>
                          )}
                        </div>
                        
                        {pendingRules.length === 0 ? (
                          <Card>
                            <CardContent className="pt-6 text-center">
                              <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">
                                現在、承認待ちの規則はありません
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          pendingRules.map(rule => (
                            <Card key={rule.id} className="border-orange-200">
                              <CardContent className="pt-6">
                                <div className="space-y-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-medium">{rule.title}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary">{rule.category}</Badge>
                                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                                          承認待ち
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-foreground">{rule.content}</p>
                                  
                                  <div className="text-xs text-muted-foreground space-y-1 bg-secondary/50 p-3 rounded">
                                    <p className="flex items-center gap-2">
                                      <UserCheck size={12} />
                                      申請者: {rule.submittedBy}
                                    </p>
                                    {rule.submittedAt && (
                                      <p className="flex items-center gap-2">
                                        <Clock size={12} />
                                        申請日時: {new Date(rule.submittedAt).toLocaleString('ja-JP')}
                                      </p>
                                    )}
                                  </div>

                                  <div className="space-y-3">
                                    <Textarea
                                      placeholder="承認・却下理由（却下の場合は必須）"
                                      value={reviewComment}
                                      onChange={(e) => setReviewComment(e.target.value)}
                                      rows={2}
                                      className="text-sm"
                                    />
                                    
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleApproveRule(rule.id)}
                                        variant="default"
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check size={14} className="mr-2" />
                                        承認・公開
                                      </Button>
                                      <Button
                                        onClick={() => handleRejectRule(rule.id)}
                                        variant="destructive"
                                        size="sm"
                                      >
                                        <X size={14} className="mr-2" />
                                        却下
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>
                    )}

                    {currentUser?.role === 'admin' && (
                      <TabsContent value="insights" className="space-y-4 mt-6">
                        <AIInsightsPanel exportConversationData={exportConversationData} />
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </ProtectedRoute>
          </TabsContent>
        </Tabs>

        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          onLogin={handleLogin}
        />
      </div>
    </div>
  )
}

export default App