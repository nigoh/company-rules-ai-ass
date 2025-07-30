import React from 'react'

interface LogoProps {
  size?: number
  variant?: 'full' | 'icon'
}

interface LogoIconProps {
  size?: number
}

export function LogoIcon({ size = 32 }: LogoIconProps) {
  return (
    <div className="relative flex items-center justify-center">
      <div 
        className="relative bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* 本と AI のシンボルを組み合わせたアイコン */}
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
          <line x1="7" y1="7" x2="17" y2="7" stroke="white" strokeWidth="0.5" opacity="0.7"/>
          <line x1="7" y1="10" x2="17" y2="10" stroke="white" strokeWidth="0.5" opacity="0.7"/>
          <line x1="7" y1="13" x2="14" y2="13" stroke="white" strokeWidth="0.5" opacity="0.7"/>
          
          {/* AI シンボル - 回路パターン */}
          <circle cx="15" cy="16" r="2" fill="none" stroke="white" strokeWidth="0.8" opacity="0.8"/>
          <circle cx="15" cy="16" r="0.5" fill="white" opacity="0.8"/>
          <line x1="13" y1="16" x2="11" y2="16" stroke="white" strokeWidth="0.6" opacity="0.6"/>
          <line x1="17" y1="16" x2="19" y2="16" stroke="white" strokeWidth="0.6" opacity="0.6"/>
          <line x1="15" y1="14" x2="15" y2="12" stroke="white" strokeWidth="0.6" opacity="0.6"/>
        </svg>
        
        {/* 光沢効果 */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-lg"
          style={{ 
            background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)'
          }}
        />
      </div>
    </div>
  )
}

export function Logo({ size = 48, variant = 'full' }: LogoProps) {
  if (variant === 'icon') {
    return <LogoIcon size={size} />
  }

  const isCompact = size < 40
  const textSize = isCompact ? 'text-lg' : 'text-2xl'
  const subTextSize = isCompact ? 'text-xs' : 'text-sm'

  return (
    <div className="flex items-center gap-3">
      {/* アイコン部分 */}
      <LogoIcon size={size} />
      
      {/* テキスト部分 */}
      <div className="flex flex-col">
        <h1 className={`${textSize} font-bold text-foreground tracking-tight`}>
          社則AI
        </h1>
        <p className={`${subTextSize} text-muted-foreground -mt-1`}>
          Company Rules AI
        </p>
      </div>
    </div>
  )
}