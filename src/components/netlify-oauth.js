import React, { useEffect, useState } from 'react';
import { redirectToAuth, getTokenFromHash } from '../util/auth.js';
import { updateSiteSettings, createDeploy } from '../util/netlify-api';
import { SelectSite } from './select-site';
import styles from '../styles/app.module.css';

export function NetlifyOAuth() {
  const [token, setToken] = useState();
  const [deploy, setDeploy] = useState(false);

  useEffect(() => {
    // if an authorization code exists, grab it from the hash and validate it
    setToken(getTokenFromHash());
  }, []);

  async function configureSelectedSite(site) {
    await updateSiteSettings({
      site,
      token,
      env: {
        // set any environment variable(s) required for your integration here
        ENV_VAR_NAME: 'some env var value',
      },
      plugins: [
        // add any build plugin(s) required for your integration here
        { package: 'netlify-plugin-minify-html' },
      ],
    });

    // trigger a new build so your integration takes effect
    const deployURL = await createDeploy({ site, token });

    setDeploy(deployURL);
  }

  // if we have a valid token, show the site selector
  if (token && !deploy) {
    return <SelectSite token={token} submitCallback={configureSelectedSite} />;
  }

  // if a new deploy has been created, show the confirmation screen
  if (deploy) {
    return (
      <p>
        Successfully configured! Your site is rebuilding now with our plugin
        installed. <a href={deploy}>See the deploy log.</a>
      </p>
    );
  }

  // if the user has not authorized the app yet, show an auth button
  return (
    <div className={styles.auth}>
      <h1>Add Our Integration To Your Netlify Site!</h1>
      <p>
        Click the button below to integrate our great service with your Netlify
        site!
      </p>
      <button onClick={() => redirectToAuth()}>
        Connect Your Netlify Account
      </button>
    </div>
  );
}
