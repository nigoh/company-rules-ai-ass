import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useKV } from '@github/spark/hooks'
import { Search, MessageCircle, Book, Settings, User, Plus, Edit2, Trash2, Send, SignIn } from '@phosphor-icons/react'
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

function App() {
  const [rules, setRules] = useKV<Rule[]>('company-rules', [
    {
      id: '1',
      title: '勤務時間に関する規則',
      content: '標準勤務時間は9:00-18:00（休憩1時間含む）です。フレックスタイム制を採用しており、コアタイム10:00-15:00を除き、8:00-20:00の間で勤務時間を調整できます。',
      category: '勤務',
      lastUpdated: '2024-01-15'
    },
    {
      id: '2', 
      title: '有給休暇の取得について',
      content: '有給休暇は入社日から6ヶ月経過後に付与されます。取得時は3営業日前までに申請が必要です。年次有給休暇の取得促進のため、計画的付与制度を導入しています。',
      category: '休暇',
      lastUpdated: '2024-01-10'
    },
    {
      id: '3',
      title: '服装規定',
      content: 'ビジネスカジュアルを基本とします。お客様との面談がある日はスーツ着用を推奨します。安全上の理由から、サンダルでの勤務は禁止です。',
      category: '服装',
      lastUpdated: '2024-01-05'
    }
  ])

  const [faqs, setFaqs] = useKV<FAQ[]>('company-faqs', [
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

  const permissions = usePermissions(currentUser)

  const categories = ['all', '勤務', '休暇', '服装', '給与', '福利厚生']

  const filteredRules = rules.filter(rule => {
    const matchesSearch = searchQuery === '' || 
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
    setChatInput('')

    try {
      const prompt = spark.llmPrompt`
        あなたは会社の人事部のAIアシスタントです。以下の会社規則に基づいて質問に答えてください。

        会社規則:
        ${rules.map(rule => `${rule.title}: ${rule.content}`).join('\n')}

        FAQ:
        ${faqs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n')}

        質問: ${chatInput}

        日本語で丁寧に回答してください。該当する規則がない場合は、そのことを明確に伝えてください。
      `

      const response = await spark.llm(prompt)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date().toISOString()
      }

      setChatMessages(current => [...current, aiMessage])
    } catch (error) {
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

    const rule: Rule = {
      id: Date.now().toString(),
      title: newRule.title,
      content: newRule.content,
      category: newRule.category,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    setRules(current => [...current, rule])
    setNewRule({ title: '', content: '', category: '' })
    toast.success('規則を追加しました')
  }

  const handleUpdateRule = () => {
    if (!editingRule) return

    setRules(current => current.map(rule => 
      rule.id === editingRule.id 
        ? { ...editingRule, lastUpdated: new Date().toISOString().split('T')[0] }
        : rule
    ))
    setEditingRule(null)
    toast.success('規則を更新しました')
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
                  <CardTitle>AI質問応答</CardTitle>
                  <CardDescription>
                    会社の規則について質問してください。AIが適切な回答を提供します。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-96 overflow-y-auto space-y-4 p-4 border rounded-lg bg-secondary/50">
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
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card text-card-foreground border px-4 py-2 rounded-lg">
                          <p className="text-sm">回答を生成中...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="規則について質問してください..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
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
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
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
                        規則を追加
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">既存の規則</h3>
                    {rules.map(rule => (
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
                                  保存
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
                                  <Badge variant="secondary" className="mt-1">{rule.category}</Badge>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => setEditingRule(rule)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Edit2 size={14} />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteRule(rule.id)}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{rule.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                更新日: {rule.lastUpdated}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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