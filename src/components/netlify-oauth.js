import React, { useEffect, useState } from 'react';
import { generateCsrfToken, validateHash } from '../util/auth.js';

export function NetlifyOAuth() {
  const [token, setToken] = useState();
  const [loading, setLoading] = useState(true);
  const [allSites, setSites] = useState();
  const [selectedSite, setSelectedSite] = useState();
  const [deploy, setDeploy] = useState(false);

  useEffect(() => {
    const response = validateHash(window.location.hash);

    setToken(response.token);
  }, []);

  function handleAuth(event) {
    event.preventDefault();

    const { location, localStorage } = window;
    const csrfToken = generateCsrfToken();

    localStorage.setItem(csrfToken, 'true');

    const redirectURL = `${location.origin}${location.pathname}`;

    window.location.href = `/.netlify/functions/auth-start?url=${redirectURL}&csrf=${csrfToken}`;
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    async function loadSites() {
      const response = await fetch(
        'https://api.netlify.com/api/v1/sites?filter=all&sort_by=updated_at',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      ).then((res) => res.json());

      setSites(response);
      setLoading(false);
    }

    loadSites();
  }, [token]);

  if (deploy) {
    return (
      <p>
        Successfully configured! Your site is rebuilding now with our plugin
        installed.{' '}
        <a
          href={`https://app.netlify.com/sites/${selectedSite.name}/deploys/${deploy.deploy_id}`}
        >
          See the deploy log.
        </a>
      </p>
    );
  }

  if (allSites) {
    async function handleSubmit(event) {
      event.preventDefault();

      if (!selectedSite) {
        alert('please choose a site!');
      }

      const environmentVariables = {
        // make sure to keep any existing environment variables!
        ...selectedSite.build_settings.env,

        // define any environment variables required for your integration
        ENV_VAR_NAME: 'some env var value',
      };

      // add plugins and filter to avoid any duplicates
      const plugins = [
        // make sure to keep the existing plugins
        ...selectedSite.plugins,

        // add your integration’s required plugin(s) here
        { package: 'netlify-plugin-minify-html' },
      ].filter(
        (plugin, index, allPlugins) =>
          index === allPlugins.findIndex((p) => p.package === plugin.package),
      );

      // set the env vars and install the build plugin
      await fetch(`https://api.netlify.com/api/v1/sites/${selectedSite.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          build_settings: {
            env: environmentVariables,
          },
          plugins,
        }),
      });

      // trigger a new build
      const response = await fetch(
        `https://api.netlify.com/api/v1/sites/${selectedSite.id}/builds`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clear_cache: false }),
        },
      ).then((res) => res.json());

      // show a link to see the build in progress
      setDeploy(response);
    }

    return (
      <form onSubmit={handleSubmit}>
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
    );
  }

  if (token && loading) {
    return <p>loading your sites...</p>;
  }

  if (!token) {
    return <button onClick={handleAuth}>Connect Your Netlify Account</button>;
  }
  // if the user hasn’t authenticated, show them the OAuth button
  return null;
}
