import React, { useEffect, useState } from 'react';
import { loadAllNetlifySites } from '../util/netlify-api';
import styles from '../styles/select-site.module.css';

export function SelectSite({ token, submitCallback = () => {} }) {
  const [allSites, setSites] = useState();
  const [selectedSite, setSelectedSite] = useState();

  useEffect(() => {
    if (!token) {
      return;
    }

    loadAllNetlifySites({ token }).then((sites) => setSites(sites));
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedSite) {
      alert('please choose a site!');
    }

    submitCallback(selectedSite);
  }

  return !allSites ? (
    <p>loading your sites...</p>
  ) : (
    <div className={styles.wrapper}>
      <h1>Choose a Site to Add Our Service To</h1>
      <p>
        When you click configure, we’ll add all the necessary configuration to
        seamlessly integrate our service into your site!
      </p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="site">
          Select a site
          <select
            id="site"
            name="site"
            onChange={(event) => {
              const site = allSites.find((s) => s.id === event.target.value);
              setSelectedSite(site);
            }}
            defaultValue=""
          >
            <option disabled value="">
              -- please choose a site to configure --
            </option>
            {allSites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.ssl_url}
              </option>
            ))}
          </select>
        </label>
        <button>Configure Your Site</button>
      </form>
    </div>
  );
}
