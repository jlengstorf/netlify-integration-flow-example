# Netlify Integration Flow Example

This is an example of connecting to a Netlify user’s account using OAuth, selecting a site, then configuring and enabling a build plugin to allow deep integration with Netlify in a way that feels seamless for the users.

## What’s the big idea?

By integrating with a Netlify user’s site(s), your company can:

- automatically add your app’s functionality by injecting a JavaScript snippet
- post-process the site to measure, analyze, or otherwise process the built site
- pre-process the site to provide preflight checks, tests, or other safeguards
- deeply customize the build output by directly processing production-ready site code

This is all possible using [build plugins][plugins], but this requires a bit of setup on the user’s end that adds friction and can increase churn: generating API keys, setting environment variables, configuring plugins, and so on.

**The flow in this repo allows you to configure a Netlify site with the required environment variables and build plugins necessary to integrate your app into their site in a UI-driven, low-friction way.**

## tl;dr: how does this work?

The process of integrating with Netlify consists of four steps:

1. Ask your users to authorize your app to make changes to Netlify on their behalf
2. Your user chooses which site they want to integrate with your service
3. Your code programmatically any environment variables and/or build plugins needed for the integration
4. Your code kicks off a new build of the site that will use the newly added integration

## Step-by-step setup instructions

To set this up, you can fork this example as a starting point, or use these instructions to set up your own custom integration flow.

### Create a new Netlify OAuth application

In your Netlify dashboard, visit the <https://app.netlify.com/user/applications> (click your avatar, select User Settings, then click the Applications tab).

![Create a new OAuth app in the Netlify dashboard](https://res.cloudinary.com/jlengstorf/image/upload/f_auto,q_auto,w_800/v1597879827/netlify/integrations/create-oauth-app.png)

Use any name you want. For the Redirect URI, set this to wherever you want to handle the callback portion of the OAuth flow. If you’re using this repo, the URI will be `https://example.com/.netlify/functions/auth-callback`, replacing `example.com` with your deployed site’s domain.

> **Heads up!** For testing, you can use [Netlify Dev][dev] and run this flow locally. For local testing, set the Redirect URI to `http://localhost:8888/.netlify/functions/auth-callback`. Don’t forget to change it back when you deploy!

### Add the OAuth application details to your environment

After saving your app, you’ll be provided with a client ID and secret.

![Netlify OAuth app credentials](https://res.cloudinary.com/jlengstorf/image/upload/f_auto,q_auto,w_800/v1597879830/netlify/integrations/oauth-app-credentials.png)

Add those to your site’s environment variables along with the Redirect URI:

```
NETLIFY_OAUTH_REDIRECT_URI=<your Netlify OAuth app redirect URI>
NETLIFY_OAUTH_CLIENT_ID=<your Netlify OAuth app client ID>
NETLIFY_OAUTH_CLIENT_SECRET=<your Netlify OAuth app secret>
```

### Request an authorization code

To start the integration, your app needs an access token generated through the [authorization code flow][auth]. To make this painless, you can use a package like [`simple-oauth2`][simple-oauth2].

The Netlify endpoints for the authorization codes are:

- Authorization endpoint: `https://app.netlify.com/authorize`
- Token exchange endpoint: `https://api.netlify.com/oauth/token`

To see how this is configured, see [the `auth-start.js` function in this repo](./functions/auth-start.js).

### Exchange the authorization code for an access token

Once the user authorizes your app, an authorization code will be sent to your app’s Redirect URI. You’ll need to exchange that code for an access token that will allow you to act on behalf of the user.

To see how this works, see [the `auth-callback.js` function in this repo](./functions/auth-callback.js).

### Retrieve the access token from the URL hash

A successful OAuth flow will send you to the success URL (in this repo, the same page where the OAuth flow started) with a hash in the URL that contains the access token and a [cross-site request forgery (CSRF)][csrf] token.

Retrieve the access token, then remove the hash from the URL. For an example, see the [`getTokenFromHash()` function](./src/util/auth.js).

### Get a list of the user’s sites

Using the access token, send a request to the Netlify API to load a list of the user’s sites.

```js
fetch(
  'https://api.netlify.com/api/v1/sites?filter=all&sort_by=updated_at&page=1&per_page=50',
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
).then((res) => res.json());
```

> NOTE: this only loads the first 50 sites, with the most recently updated
> sites showing up at the top of the list. This will work for most users, but
> for anyone with a lot of sites, you may want to implement pagination or a
> “load more” flow.
>
> If you like to live dangerously, you can also remove the `page` and
> `per_page` parameters to load all sites at once, but for people with a ton
> of sites this will be pretty dang slow — and it may time out entirely.

### Ask the user to choose which site they want to add your integration to

The user needs to choose one of their sites from the list so you know which one to modify.

For an example of how this can be done, check [the `SelectSite` component](./src/components/select-site.js).

### Add environment variables and/or build plugins for the site

Once you have the site info, you’re able to set any required environment variables for the site, as well as installing build plugins that can modify the user’s site during the build.

This is possible by sending a `PUT` request to the Netlify API with the new environment variables and build plugins.

For an example, see [the `updateSiteSettings()` function](src/util/netlify-api.js).

### Kick off a new deploy to rebuild the site with the integration active

For the integration to take effect, a new build of the site needs to happen. Send a `POST` request to the Netlify API to kick off a new deploy for the site.

The `deploy_id` returned can be used to link the user to the new build so they can check the deploy log.

For an example, see [the `createDeploy()` function](src/util/netlify-api.js).

## More Info

- Learn more about [Netlify build plugins][plugins]
- See the [Netlify API reference][api] to see what else your integration can control

[plugins]: https://www.netlify.com/products/build/plugins/?utm_source=github&utm_medium=integration-jl&utm_campaign=devex
[dev]: https://www.netlify.com/products/dev/?utm_source=github&utm_medium=integrations-jl&utm_campaign=devex
[auth]: https://developer.okta.com/blog/2018/04/10/oauth-authorization-code-grant-type
[simple-oauth2]: https://www.npmjs.com/package/simple-oauth2
[csrf]: https://owasp.org/www-community/attacks/csrf
[api]: https://open-api.netlify.com/