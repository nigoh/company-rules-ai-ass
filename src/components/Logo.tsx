import React from 'react'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
  variant?: 'default' | 'compact' | 'icon-only'
}

export function Logo({ size = 40, className = '', showText = true, variant = 'default' }: LogoProps) {
  if (variant === 'icon-only') {
    return <LogoIcon size={size} className={className} />
  }

  const isCompact = variant === 'compact'
  const textSize = isCompact ? 'text-lg' : 'text-2xl'
  const subTextSize = isCompact ? 'text-xs' : 'text-sm'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* アイコン部分 - 本と AI のシンボルを組み合わせたデザイン */}
      <div 
        className="relative flex items-center justify-center bg-gradient-to-br from-primary to-accent rounded-lg shadow-lg"
        style={{ width: size, height: size }}
      >
        {/* 本のベース */}
        <svg 
          width={size * 0.7} 
          height={size * 0.7} 
          viewBox="0 0 24 24" 
          fill="none" 
          className="text-primary-foreground"
        >
          {/* 本の背景 */}
          <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" opacity="0.9"/>
          
          {/* ページの線 */}
          <line x1="7" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
          <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
          <line x1="7" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="0.5" opacity="0.7"/>
          
          {/* AI シンボル - 回路パターン */}
          <circle cx="15" cy="16" r="2" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.8"/>
          <circle cx="15" cy="16" r="0.5" fill="currentColor" opacity="0.8"/>
          <line x1="13" y1="16" x2="11" y2="16" stroke="currentColor" strokeWidth="0.6" opacity="0.6"/>
          <line x1="17" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="0.6" opacity="0.6"/>
          <line x1="15" y1="14" x2="15" y2="12" stroke="currentColor" strokeWidth="0.6" opacity="0.6"/>
        </svg>
        
        {/* 光る効果 */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-lg"
          style={{ 
            background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)'
          }}
        />
      </div>
      
      {/* テキスト部分 */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSize} font-bold text-foreground tracking-tight`}>
            社則AI
          </h1>
          {!isCompact && (
            <p className={`${subTextSize} text-muted-foreground -mt-1`}>
              Company Rules AI
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function LogoIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div 
      className={`relative flex items-center justify-center bg-gradient-to-br from-primary to-accent rounded-md shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size * 0.7} 
        height={size * 0.7} 
        viewBox="0 0 24 24" 
        fill="none" 
        className="text-primary-foreground"
      >
        {/* 簡略化されたアイコン版 */}
        <rect x="5" y="4" width="14" height="16" rx="1.5" fill="currentColor" opacity="0.9"/>
        <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
        <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
        <line x1="8" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
        
        {/* AI インジケーター */}
        <circle cx="15" cy="16" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.8"/>
        <circle cx="15" cy="16" r="0.3" fill="currentColor" opacity="0.8"/>
      </svg>
      
      <div 
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-md"
        style={{ 
          background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)'
        }}
      />
    </div>
  )
}

// ロゴのバリエーション例を表示するコンポーネント（デモ用）
export function LogoShowcase() {
  return (
    <div className="space-y-8 p-6 bg-card rounded-lg border">
      <h3 className="text-lg font-medium">ロゴバリエーション</h3>
      
      <div className="grid gap-6">
        {/* メインロゴ */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">メインロゴ（デフォルト）</p>
          <Logo size={48} />
        </div>
        
        {/* コンパクト版 */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">コンパクト版</p>
          <Logo size={32} variant="compact" />
        </div>
        
        {/* アイコンのみ */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">アイコンのみ</p>
          <div className="flex items-center gap-4">
            <LogoIcon size={48} />
            <LogoIcon size={32} />
            <LogoIcon size={24} />
            <LogoIcon size={16} />
          </div>
        </div>
        
        {/* テキストなし */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">アイコンのみ（大サイズ）</p>
          <Logo size={64} showText={false} />
        </div>
      </div>
    </div>
  )
}