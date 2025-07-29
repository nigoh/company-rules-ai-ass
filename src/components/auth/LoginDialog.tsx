import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UserInfo {
  email: string
  role: 'admin' | 'hr' | 'employee'
  name: string
}

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLogin: (user: UserInfo) => void
}

export function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as 'admin' | 'hr' | 'employee'
  })

  // Demo users for testing
  const demoUsers = [
    { email: 'admin@company.com', password: 'admin123', role: 'admin' as const, name: '管理者' },
    { email: 'hr@company.com', password: 'hr123', role: 'hr' as const, name: '人事部' },
    { email: 'employee@company.com', password: 'emp123', role: 'employee' as const, name: '一般社員' }
  ]

  const handleDemoLogin = async (demoUser: typeof demoUsers[0]) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onLogin({
      email: demoUser.email,
      role: demoUser.role,
      name: demoUser.name
    })
    onOpenChange(false)
    toast.success(`${demoUser.name}としてログインしました`)
    setLoginForm({ email: '', password: '' })
    setIsLoading(false)
  }

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error('メールアドレスとパスワードを入力してください')
      return
    }

    setIsLoading(true)
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = demoUsers.find(u => 
      u.email === loginForm.email && u.password === loginForm.password
    )

    if (user) {
      onLogin({
        email: user.email,
        role: user.role,
        name: user.name
      })
      onOpenChange(false)
      toast.success(`${user.name}としてログインしました`)
      setLoginForm({ email: '', password: '' })
    } else {
      toast.error('メールアドレスまたはパスワードが正しくありません')
    }
    
    setIsLoading(false)
  }

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error('すべての項目を入力してください')
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('パスワードが一致しません')
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    onLogin({
      email: registerForm.email,
      role: registerForm.role,
      name: registerForm.name
    })
    onOpenChange(false)
    toast.success(`${registerForm.name}としてアカウントを作成しました`)
    setRegisterForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'employee'
    })
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} />
            ログイン
          </DialogTitle>
          <DialogDescription>
            社則AIにアクセスするためにログインしてください
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">ログイン</TabsTrigger>
            <TabsTrigger value="register">新規登録</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@company.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="text-center text-sm text-muted-foreground">
                または デモアカウントでログイン
              </div>
              {demoUsers.map((user) => (
                <Button
                  key={user.email}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDemoLogin(user)}
                >
                  <Lock size={14} className="mr-2" />
                  {user.name} ({user.role})
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reg-name">氏名</Label>
                <Input
                  id="reg-name"
                  placeholder="山田太郎"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="reg-email">メールアドレス</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="your@company.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="reg-role">役職</Label>
                <select
                  id="reg-role"
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm(prev => ({ 
                    ...prev, 
                    role: e.target.value as 'admin' | 'hr' | 'employee' 
                  }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="employee">一般社員</option>
                  <option value="hr">人事部</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
              <div>
                <Label htmlFor="reg-password">パスワード</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="reg-confirm">パスワード確認</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleRegister} 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? '登録中...' : 'アカウント作成'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}