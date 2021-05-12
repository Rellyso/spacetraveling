import Link from 'next/link'
import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/" prefetch={false}>
          <a>
            <img src="/logo.svg" alt="logo" />
          spacetraveling
          <strong>.</strong>
          </a>
        </Link>
      </div>
    </header>
  )
}
