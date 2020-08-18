const { redirect_uri, oauth } = require('./util/oauth');

exports.handler = async (event) => {
  if (!event.queryStringParameters) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: 'Missing required parameters `url` and `csrf`',
      }),
    };
  }

  const { csrf: csrfToken, url: redirectURL } = event.queryStringParameters;

  const authorizationURI = oauth.authorizeURL({
    redirect_uri,
    state: `url=${redirectURL}&csrf=${csrfToken}`,

    // for now, this is always blank. in the future, specific scopes will need
    // to be requested to perform actions on the user’s behalf
    scope: '',
  });

  return {
    statusCode: 302,
    headers: {
      Location: authorizationURI,
      'Cache-Control': 'no-cache',
    },
    body: 'redirecting to authorization...',
  };
};
