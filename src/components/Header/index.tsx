import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <span>
          <img src="/logo.svg" alt="spacetraveling" />
          spacetraveling
          <strong>.</strong>
        </span>
      </div>
    </header>
  )
}
