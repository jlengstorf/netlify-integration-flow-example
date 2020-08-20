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
        <p>
          created with{' '}
          <img
            src="https://res.cloudinary.com/jlengstorf/image/upload/f_auto,q_auto,w_60/v1596146333/netlify/netliheart.png"
            alt="love"
          />{' '}
          by your friends at{' '}
          <a href="https://www.netlify.com/?utm_source=github&utm_medium=integrations-jl&utm_campaign=devex">
            Netlify
          </a>{' '}
          ·{' '}
          <a href="https://github.com/jlengstorf/netlify-integration-flow-example">
            source code & docs
          </a>
        </p>
      </footer>
    </>
  );
}
