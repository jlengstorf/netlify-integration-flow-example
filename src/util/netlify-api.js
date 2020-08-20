// load all sites for this user from the Netlify API
export function loadAllNetlifySites({ token }) {
  /*
   * NOTE: this only loads the first 50 sites, with the most recently updated
   * sites showing up at the top of the list. This will work for most users, but
   * for anyone with a lot of sites, you may want to implement pagination or a
   * “load more” flow.
   *
   * If you like to live dangerously, you can also remove the `page` and
   * `per_page` parameters to load all sites at once, but for people with a ton
   * of sites this will be pretty dang slow — and it may time out entirely.
   */
  return fetch(
    'https://api.netlify.com/api/v1/sites?filter=all&sort_by=updated_at&page=1&per_page=50',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  ).then((res) => res.json());
}

export function updateSiteSettings({ site, token, env = {}, plugins = [] }) {
  // add plugins and filter to avoid any duplicates
  const updatedPlugins = [...site.plugins, ...plugins].filter(
    (plugin, index, allPlugins) =>
      index === allPlugins.findIndex((p) => p.package === plugin.package),
  );

  return fetch(`https://api.netlify.com/api/v1/sites/${site.id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      build_settings: {
        env: { ...site.build_settings.env, ...env },
      },
      plugins: updatedPlugins,
    }),
  });
}

export async function createDeploy({ site, token, clear_cache = false }) {
  const { deploy_id } = await fetch(
    `https://api.netlify.com/api/v1/sites/${site.id}/builds`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clear_cache }),
    },
  ).then((res) => res.json());

  // create a URL to view the deploy log on Netlify
  return `https://app.netlify.com/sites/${site.name}/deploys/${deploy_id}`;
}
