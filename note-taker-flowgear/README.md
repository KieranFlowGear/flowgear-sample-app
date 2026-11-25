# Note Taker | Flowgear

An embedded Flowgear Console app for creating and editing personal notes with deadlines and statuses. The date range uses inclusive UTC save dates. Within that range, users can search headers, filter by status and deadline, and sort notes.

## Run and package

1. Copy `.env.example` to `.env.local` and enter the Flowgear tenant, site, and Test environment keys.
2. Run `npm ci` and `npm run dev`. Accept the local HTTPS certificate, then use the Flowgear Console debug tab.
3. Run `npm run build`. Zip the contents of `dist` with `app.json`, `index.html`, `icon.svg`, and `assets` at the ZIP root.

The Console authorizes SDK calls with a Cookie API Key assigned to the three Note Taker workflows and the users who need access. Each workflow uses the authenticated caller to select the user's Key/Value collection. Configure a separate Cookie API Key in each environment where users need to run the app.

[Flowgear app setup and publishing](https://help.flowgear.net/v2/features/apps)
