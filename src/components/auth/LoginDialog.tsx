import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, 
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock } from '@phosphor-icons/react'
  open: boolean


  const [loginF
    name: '', 
    password: '', 
 

  // Demo users for testing
    { email: 'admin@company.com', password: 'admin123', role: 'admin' as 
    { email: 'employee@company.com', password: 'emp12

    if (!loginF
      return

    
    
    const user = demoUsers.find(u => 

    if (user) {
        email: user.e
        name: user.name
      onOpenChange(false)
      setLoginForm({ email: '', password: '' })
  ]

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


      email: registerForm.email,
      name: registerForm.name
    onOpenCh
    s

      confirmPassword: '',
    })
    setIsLoa


      role: demoUser.role,
    })
    toast.su


        <DialogHeader>
    
          </DialogTitle>
            社則AIにアクセスするためにログインしてください

        <Tabs defaultValue="login" 
            <TabsTrigger value="login">ログイン</TabsTrigger>
          </TabsList>
          <TabsContent value="login" clas
              <div>
            
     

             
              <div>
                <Input
                  type="passw
      
              </div>
                onClick={handleLogin} 
                disabl
                
            </div
            <div cla
                または デモアカウン
              {demoUse
      
    
                  onCli
   

            </div>

            <div className="
                <Label htm
                  id="reg
      
                />
              <div>
   

          
                />
              <div>
                <selec
                  value={registerForm.role}
                    ...prev, 
                
                >
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
}                  <option value="employee">一般社員</option>
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