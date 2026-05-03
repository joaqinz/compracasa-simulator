# CompraCasa Simulator

Interactive mortgage affordability simulator for Chile, built with React, TypeScript, and Vite.

The app helps a user estimate:

- how much property they can realistically afford
- whether a target property is feasible
- how dividend, income requirements, and financing change with rate, term, and down payment assumptions
- how different bank presets compare using CMF-based reference data

It is designed to be published as a public static webpage and works well as a personal portfolio project hosted from GitHub and deployed to Netlify.

## Features

- Chile-focused mortgage simulation using `UF` and `CLP`
- Two main modes:
  - affordability from income and savings
  - feasibility for a target property
- Live UF lookup with graceful fallbacks
- Bank preset selector backed by CMF simulator data
- Sensitivity analysis for:
  - property price
  - down payment
  - mortgage term
  - interest rate
- Charts and scenario tables for quick comparisons
- Shareable scenarios through URL parameters
- Static frontend deployment with no required backend for v1

## Tech Stack

- `React 19`
- `TypeScript`
- `Vite`
- `Tailwind CSS`
- `Plotly`

## Project Structure

```text
src/
  components/        UI and charts
  data/              default assumptions, glossary, bank presets
  lib/               mortgage math, UF service, formatting, URL state
  types/             shared TypeScript types
scripts/
  update-cmf-rates.mjs
public/
  _redirects         SPA routing for Netlify
```

## How the App Works

The simulator combines:

- user inputs such as income, savings, price target, rate, term, and down payment
- mortgage calculation utilities in `src/lib/`
- a UF value fetched at runtime
- bank preset data stored in `src/data/bankPresets.json`

The frontend is fully static. At runtime, it fetches UF data in the browser and computes all results client-side.

## Data Sources

### UF value

The app tries these sources in order:

1. `mindicador.cl`
2. `SII` via a CORS proxy fallback
3. a fallback UF value stored in `src/data/defaultAssumptions.json`

This makes the app easy to deploy, but it also means runtime UF reliability depends partly on third-party services. For a more production-grade version, move UF fetching into a small serverless function.

### Bank presets

Bank presets are stored locally in `src/data/bankPresets.json` and are intended to be refreshed from the CMF mortgage simulator with:

```bash
npm run update:cmf-rates
```

That script updates the preset dataset used by the app. Keeping the presets local avoids CORS and scraping problems in the public browser session.

## Local Development

### Requirements

- `Node.js` 20+ recommended
- `npm`

### Install

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

Or on this Windows setup:

```powershell
.\start.ps1
```

### Build for production

```bash
npm run build
```

The production-ready static site is generated in `dist/`.

### Preview the production build

```bash
npm run preview
```

## Deployment

This project is a good fit for static hosting.

### Recommended services

- `GitHub` for source control and public project hosting
- `Netlify` for deployment
- optional custom domain if you want a cleaner public URL

### Why Netlify

The repo already includes `public/_redirects` for single-page app routing:

```text
/* /index.html 200
```

That makes Netlify a smooth default choice for this project.

### Netlify configuration

- Build command: `npm run build`
- Publish directory: `dist`

### Typical publish flow

1. Create a GitHub repository
2. Push this project to GitHub
3. Create a Netlify site from that GitHub repo
4. Set the build command to `npm run build`
5. Set the publish directory to `dist`
6. Deploy

After that, every push to your main branch can trigger a new deployment automatically.

## Suggested Personal Project Setup

If your main goal is to make this public and keep it in your GitHub portfolio, the simplest setup is:

- GitHub repository for the code
- Netlify for hosting
- README with screenshots and deployment link
- optional custom domain later

That is enough for a solid public version without adding unnecessary infrastructure.

## Production Notes

This app is already deployable as a static site, but there are two important caveats:

1. UF fetching currently happens in the browser, so it depends on external public services.
2. Bank presets are only as current as the latest `update:cmf-rates` run.

For a stronger production version, consider:

- a serverless endpoint for UF data
- a scheduled job to refresh CMF-based bank presets
- analytics and error tracking such as Google Analytics or Sentry

## Available Scripts

- `npm run dev`: start local Vite development server
- `npm run build`: type-check and create a production build
- `npm run preview`: preview the production build locally
- `npm run lint`: run ESLint
- `npm run update:cmf-rates`: refresh bank preset data from the CMF simulator flow

## Future Improvements

- add automated tests for core mortgage calculations
- add CI checks for linting and builds
- move UF lookup to a serverless backend
- automate bank preset refreshes on a schedule
- improve README with screenshots once the public deployment is live

## License

No license has been added yet. If you want this to be clearly open-source, add a license file such as `MIT`.
