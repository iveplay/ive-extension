import clsx from 'clsx'
import styles from './Logo.module.scss'

type LogoProps = {
  size?: number
  className?: string
}

export const Logo = ({ className, size }: LogoProps) => (
  <span className={clsx(styles.logo, className)} style={{ fontSize: size }}>
    IVE
  </span>
)
