# Memorial frontend

See the [project README](../README.md) for setup, API configuration, verification and deployment. The frontend uses Next.js, React, Three.js/R3F and Zustand. Amiri and IBM Plex Sans Arabic are served from installed Fontsource packages.

Run `npm ci`, then `npm run dev`. The same-origin `/api` proxy connects to the backend specified by the server-side `API_URL` environment variable. Set that variable before building for production.

Design ownership is recorded in [DESIGN.md](../DESIGN.md) and [UX-CONTRACT.md](../UX-CONTRACT.md).
