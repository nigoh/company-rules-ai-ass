import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { User, SignOut, Gear as Settings, Crown } from '@phosphor-icons/react'

interface UserMenuProps {
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
  }
  onLogout: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? '管理者' : '一般ユーザー'
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <div className="flex items-center gap-2">
              <p className="font-medium">{user.name}</p>
              {user.role === 'admin' && <Crown size={14} className="text-yellow-600" />}
            </div>
            <div className="flex items-center gap-2">
              <p className="w-[120px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>プロフィール</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>設定</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-red-600">
          <SignOut className="mr-2 h-4 w-4" />
          <span>ログアウト</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}