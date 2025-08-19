import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'

interface OptimizedLogoProps {
  size?: number
  showText?: boolean
  href?: string
  className?: string
}

export default function OptimizedLogo({ 
  size = 40, 
  showText = true, 
  href = "/", 
  className = "" 
}: OptimizedLogoProps) {
  const { resolvedTheme } = useTheme()

  const logoContent = (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Image 
        src="/finnextho.png" 
        alt="Logo Finnextho" 
        width={size} 
        height={size}
        priority={size >= 40} // Priority for larger logos
        quality={85}
        sizes={`${size}px`}
        style={{
          width: size,
          height: size,
          objectFit: 'contain'
        }}
      />
      {showText && (
        <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 ${
          resolvedTheme === 'dark' ? '' : 'text-gray-900'
        }`}>
          fin<span className="text-blue-300">nextho</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{logoContent}</Link>
  }

  return logoContent
}
