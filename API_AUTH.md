# Dashboard API authentication

Google login stores an application JWT in `auth_token`. Dashboard requests must
send it as `Authorization: Bearer <JWT>`; the email query parameter does not
authenticate the caller.

`app/plugins/api-auth.client.js` initializes sign-in state before components mount
and attaches the current JWT through `app/utils/api-auth.js`. This covers existing
Nuxt/ofetch, native fetch and Axios requests. Tokens are sent only to `/api/`
under the configured API base, including a production path prefix. Other origins
and explicit Authorization headers are preserved. A 401 for the current token
ends the session and returns to login; 403 role denials do not end the session.
This client plugin uses the existing localStorage login; it does not authenticate
server-rendered requests.

## Production configuration without a .env file

Configure these values in the Nuxt server's environment through your process
manager, hosting settings, or service configuration:

```text
NUXT_PUBLIC_API_URL=https://apipdp.lsu.edu.ph/buang_ka_eyy
NUXT_AUTH_SECRET=<same private signing secret as Django ANIMORUN_AUTH_SECRET>
```

`NUXT_AUTH_SECRET` is server-only. Never put it in `runtimeConfig.public` or browser
code. If configuring Nuxt directly in `nuxt.config.ts`, the equivalent private
setting is `runtimeConfig.authSecret`; the API base is `runtimeConfig.public.apiUrl`.
The OAuth callback reads the private runtime setting and refuses to sign tokens
if it is missing. Django also accepts `ANIMORUN_CENTRAL_AUTH_SECRET` for an
independently configured frontend. The existing `AUTH_SECRET` build-time setting
is still supported by `nuxt.config.ts`.

Deploy the new plugin and utility together with `server/api/auth/callback.get.ts`,
run `npm run build`, and restart the Nuxt server with the production environment.
If a signing secret changes, sign out and sign in again to obtain a matching JWT.
No database migrations or Django endpoint permission changes are required.

In browser DevTools, an authenticated request to
`/buang_ka_eyy/api/cits/role-permissions/list/` should contain a Bearer Authorization
header. If that header is present but Django still reports that credentials are
missing, check that the reverse proxy forwards Authorization. If Django reports
an invalid sign-in token, check that both servers use the same signing secret.
An API IP-denied 403 is a separate `ALLOWED_API_IPS` configuration issue.

`adsbygoogle.js` reporting `ERR_BLOCKED_BY_CLIENT` is a browser/ad-blocking issue.
It does not authenticate API requests and does not prevent dashboard use. Allow
the advertising script in the browser if ads are desired.

## Verification

```text
node --test tests/api-auth.test.mjs
npm run build
```

The Django authentication suite also tests the production prefix:

```text
python manage.py test api.test_security --settings=api.security_test_settings
```
