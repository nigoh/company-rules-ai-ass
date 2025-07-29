import { ReactNode } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldX } from '@phosphor-icons/react'

interface UserInfo {
  email: string
  role: 'admin' | 'hr' | 'employee'
  name: string
}

interface ProtectedRouteProps {
  user: UserInfo | null
  allowedRoles: ('admin' | 'hr' | 'employee')[]
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ user, allowedRoles, children, fallback }: ProtectedRouteProps) {
  if (!user) {
    return (
      fallback || (
        <Alert variant="destructive">
          <ShieldX size={16} />
          <AlertDescription>
            この機能を利用するにはログインが必要です。
          </AlertDescription>
        </Alert>
      )
    )
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <Alert variant="destructive">
          <ShieldX size={16} />
          <AlertDescription>
            この機能を利用する権限がありません。必要な権限: {allowedRoles.join(', ')}
          </AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}

export function usePermissions(user: UserInfo | null) {
  const permissions = {
    canViewRules: true, // Everyone can view published rules
    canSearchRules: true, // Everyone can search
    canAskAI: !!user, // Must be logged in
    canViewFAQ: true, // Everyone can view FAQ
    canCreateRules: user?.role === 'admin' || user?.role === 'hr', // HR can create, needs approval
    canManageRules: user?.role === 'admin' || user?.role === 'hr', // HR can manage but with workflow
    canApproveRules: user?.role === 'admin', // Only admin can approve
    canDeleteRules: user?.role === 'admin', // Only admin can delete
    canManageFAQ: user?.role === 'admin' || user?.role === 'hr',
    canManageUsers: user?.role === 'admin',
    canViewAdmin: user?.role === 'admin' || user?.role === 'hr',
    canViewPending: user?.role === 'admin' // Only admin sees pending rules
  }

  return permissions
}