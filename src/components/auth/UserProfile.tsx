import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { User, SignOut, Shield, UserCheck, Users } from '@phosphor-icons/react'

interface UserInfo {
  email: string
  role: 'admin' | 'hr' | 'employee'
  name: string
}

interface UserProfileProps {
  user: UserInfo
  onLogout: () => void
}

const roleConfig = {
  admin: {
    label: '管理者',
    icon: Shield,
    color: 'destructive' as const,
    permissions: ['規則管理', 'ユーザー管理', 'システム設定']
  },
  hr: {
    label: '人事部',
    icon: UserCheck,
    color: 'default' as const,
    permissions: ['規則管理', 'FAQ管理']
  },
  employee: {
    label: '一般社員',
    icon: Users,
    color: 'secondary' as const,
    permissions: ['規則閲覧', 'AI質問']
  }
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  // Ensure user has a valid role
  if (!user || !user.role || !roleConfig[user.role]) {
    console.error('Invalid user object or role:', user)
    return (
      <Button variant="outline" onClick={onLogout}>
        <User size={16} className="mr-2" />
        Unknown User
      </Button>
    )
  }

  const config = roleConfig[user.role]
  const IconComponent = config.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <IconComponent size={16} />
          {user.name}
          <Badge variant={config.color} className="ml-1">
            {config.label}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>アカウント情報</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-sm">
          <div className="font-medium">{user.name}</div>
          <div className="text-muted-foreground text-xs">{user.email}</div>
          <div className="flex items-center gap-1 mt-1">
            <IconComponent size={12} />
            <span className="text-xs">{config.label}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>権限</DropdownMenuLabel>
        {config.permissions.map((permission, index) => (
          <DropdownMenuItem key={index} className="text-xs">
            • {permission}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onLogout}
          className="text-destructive focus:text-destructive"
        >
          <SignOut size={16} className="mr-2" />
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}