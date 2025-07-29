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
function AIInsightsPanel() {
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
      const recentQuestions = logs.slice(-10).map(log => log.question).join('\n')
      
      const prompt = spark.llmPrompt`
        以下のAI質問履歴を分析し、インサイトを提供してください:

        質問履歴:
        ${recentQuestions}

        分析項目:
        1. よく質問される規則カテゴリ
        2. 質問の傾向（複雑さ、頻度など）
        3. 規則の不備や改善提案
        4. 新しいFAQの提案
        5. 社員の関心事項

        JSON形式で回答:
        {
          "topCategories": ["カテゴリ1", "カテゴリ2"],
          "trends": "傾向の説明",
          "improvements": ["改善提案1", "改善提案2"],
          "suggestedFAQs": [{"question": "質問", "category": "カテゴリ"}],
          "insights": "全体的な洞察"
        }
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analyticsData = JSON.parse(response)
      setAnalytics(analyticsData)
      toast.success('分析が完了しました')
    } catch (error) {
      toast.error('分析の生成に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AIインサイト</h3>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI分析結果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">人気カテゴリ</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.topCategories?.map((category: string, index: number) => (
                  <Badge key={index} variant="secondary">{category}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">質問傾向</h4>
              <p className="text-sm text-muted-foreground">{analytics.trends}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">改善提案</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {analytics.improvements?.map((improvement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">推奨FAQ</h4>
              <div className="space-y-2">
                {analytics.suggestedFAQs?.map((faq: any, index: number) => (
                  <div key={index} className="text-sm p-2 bg-secondary/50 rounded">
                    <Badge variant="outline" className="text-xs mb-1">{faq.category}</Badge>
                    <p className="font-medium">{faq.question}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">総合インサイト</h4>
              <p className="text-sm text-muted-foreground">{analytics.insights}</p>
            </div>
          </CardContent>
        </Card>
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
      // より詳細で構造化されたプロンプト
      const personalityInstructions = {
        professional: '簡潔で業務的な回答を心がけ、必要な情報を効率的に提供してください。',
        friendly: '親しみやすく丁寧な口調で、相手の立場に立った温かい回答を提供してください。',
        detailed: '詳細な説明と背景情報を含め、関連する規則や手続きも合わせて包括的に回答してください。'
      }

      const prompt = spark.llmPrompt`
        あなたは日本の会社の専門的な人事AI「社則AI」です。以下の役割と規則に基づいて回答してください。

        ## あなたの役割
        - 会社規則の専門家として、正確で実用的な回答を提供
        - 法的観点や実務的な観点も含めた包括的なアドバイス
        - 必要に応じて関連する規則や手続きも提案
        
        ## 回答スタイル
        ${personalityInstructions[chatPersonality]}
        
        ## 利用可能な情報
        
        ### 会社規則データベース:
        ${publishedRules.map(rule => `
        【${rule.category}】${rule.title}
        内容: ${rule.content}
        最終更新: ${rule.lastUpdated}
        `).join('\n')}

        ### よくある質問データベース:
        ${faqs.map(faq => `
        カテゴリ: ${faq.category}
        Q: ${faq.question}
        A: ${faq.answer}
        `).join('\n')}

        ## ユーザー情報
        - 権限レベル: ${currentUser.role === 'admin' ? '管理者' : currentUser.role === 'hr' ? '人事部' : '一般社員'}
        - ユーザー名: ${currentUser.name}

        ## 質問
        ${currentInput}

        ## 回答指針
        1. 該当する規則が存在する場合は、具体的な規則名と内容を引用
        2. 複数の関連規則がある場合は、すべてを整理して提示
        3. 規則に記載がない場合は、一般的なガイダンスを提供
        4. 必要に応じて、関連する手続きや連絡先も案内
        5. 回答は構造化され、読みやすい形式で提供
        6. 法的な注意事項がある場合は明記

        日本語で丁寧かつ専門的に回答してください。
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
      const prompt = spark.llmPrompt`
        以下の会社規則データベースを基に、ユーザーの入力「${input}」に関連する質問候補を3つ提案してください。

        規則データベース:
        ${publishedRules.map(rule => `${rule.title}: ${rule.content}`).join('\n')}

        FAQ:
        ${faqs.map(faq => faq.question).join('\n')}

        要件:
        - 入力に関連する具体的で実用的な質問
        - 1つの質問は20文字以内
        - JSON配列形式で回答: ["質問1", "質問2", "質問3"]
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

      const prompt = spark.llmPrompt`
        以下の会話を要約し、主要なポイントを整理してください:

        ${conversation}

        要約は以下の形式で:
        - 質問の内容
        - 提供された情報
        - 関連する規則
        - 今後のアクション（該当する場合）
      `

      const summary = await spark.llm(prompt, 'gpt-4o-mini')
      
      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `📋 **会話の要約**\n\n${summary}`,
        timestamp: new Date().toISOString()
      }

      setChatMessages(current => [...current, summaryMessage])
      toast.success('会話を要約しました')
    } catch (error) {
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
                        <AIInsightsPanel />
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