import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, UserPlus, Lock } from '@phosph
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, UserPlus, Lock } from '@phosphor-icons/react'
import { toast } from 'sonner'

  { id: '2', name: '佐藤花子', 

  const [isLoading, setIsLoading] = use
  const [registerForm, setRegisterForm] = useState({
 


    setIsLoading(tr
    // Simulate API call delay

 

      onOpenChange(false)
    } else {
    }
  const [registerForm, setRegisterForm] = useState({

    if (registe
      return

    

    setIsLoading(true)
    // Simulate API ca
    
    // Simulate API call delay
      toast.error('このメールアドレスは既に登録されています')


    
      email: re
    }
    onAuthenticated(newUser)
      onOpenChange(false)
  }
    } else {
      <DialogContent className="sm:max-w-md">
    }
    
    setIsLoading(false)
   

              ログイン
            <TabsTrigger value="register" className="flex items-c
              新規登録
      return
     

                id="login-email"
                placeholder="admin@compan
            
     

    setIsLoading(true)
    
                onChange={(e) 
            </div>
    
              <p>一般: user@company.co
            <Button 
              disabled=
            >
              {isLoading 
          </
    }

                id="r
                value={registerF
              />
            <div className="spac
              <Input
     

    onAuthenticated(newUser)
            <div classN
              <Input
                type="p
  }

  return (
              <Input
      <DialogContent className="sm:max-w-md">
                value=
              />
            <Button 
              disabled={isLoading || !regist
            >
        </DialogHeader>
        
      </DialogContent>
  )


              ログイン



              新規登録







                id="login-email"





            </div>















            <Button 



            >













              />



              <Input





              />



              <Input









              <Input

                type="password"



              />

            <Button 



            >





      </DialogContent>

  )
