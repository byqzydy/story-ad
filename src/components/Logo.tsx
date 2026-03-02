import { Link } from 'react-router-dom'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }
  
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative">
        {/* 使用有趣的手写/装饰字体风格 */}
        <span className={`font-bold tracking-widest ${sizeClasses[size]} relative`}>
          {/* W - 带一点创意效果 */}
          <span className="bg-gradient-to-r from-ambient-blue via-ambient-purple to-ambient-cyan bg-clip-text text-transparent group-hover:from-ambient-purple group-hover:via-ambient-pink group-hover:to-ambient-orange transition-all duration-500 drop-shadow-sm">
            W
          </span>
          {/* A - 带有趣的装饰 */}
          <span className="inline-block bg-gradient-to-r from-ambient-cyan via-ambient-blue to-ambient-purple bg-clip-text text-transparent group-hover:from-ambient-pink group-hover:via-ambient-red group-hover:to-ambient-orange transition-all duration-500">
            A
          </span>
          {/* S - 带有趣的样式 */}
          <span className="inline-block bg-gradient-to-r from-ambient-purple via-ambient-pink to-ambient-red bg-clip-text text-transparent group-hover:from-ambient-orange group-hover:via-ambient-yellow group-hover:to-ambient-green transition-all duration-500">
            S
          </span>
          {/* A - 重复 */}
          <span className="inline-block bg-gradient-to-r from-ambient-pink via-ambient-red to-ambient-orange bg-clip-text text-transparent group-hover:from-green-400 group-hover:via-ambient-cyan group-hover:to-ambient-blue transition-all duration-500">
            A
          </span>
          {/* I - 带点趣味 */}
          <span className="inline-block bg-gradient-to-r from-ambient-red via-ambient-orange to-ambient-yellow bg-clip-text text-transparent group-hover:from-ambient-blue group-hover:via-ambient-purple group-hover:to-ambient-pink transition-all duration-500">
            I
          </span>
        </span>
        {/* 装饰性点 */}
        <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-ambient-purple animate-pulse group-hover:bg-ambient-pink transition-colors" />
        <span className="absolute -bottom-0.5 -left-1 w-1 h-1 rounded-full bg-ambient-cyan animate-pulse group-hover:bg-ambient-blue transition-colors delay-100" />
      </div>
    </Link>
  )
}
