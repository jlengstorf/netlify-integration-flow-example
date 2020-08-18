import React from 'react';
import { NetlifyOAuth } from './netlify-oauth';
import styles from '../styles/app.module.css';

export function App() {
  return (
    <>
      <header className={styles.header}>
        <span className={styles.title}>Netlify Integration Flow Example</span>
      </header>
      <main className={styles.main}>
        <NetlifyOAuth />
      </main>
      <footer className={styles.footer}>
        <p>TODO add links to source, etc.</p>
      </footer>
    </>
  );
}
