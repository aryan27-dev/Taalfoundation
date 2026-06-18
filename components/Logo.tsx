import Image from 'next/image'

type LogoProps = {
  size?: number
  className?: string
  priority?: boolean
}

export default function Logo({ size = 40, className = '', priority = false }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Taal Foundation — Kathak Dance Academy"
      width={size}
      height={size}
      className={`object-contain shrink-0 ${className}`}
      priority={priority}
    />
  )
}
