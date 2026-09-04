# Dutch Verb Trainer

A static web application to practice Dutch verb conjugations across Present (TT), Past (OVT), and Perfect (VTT) tenses.

## Features
- Practice 4 persons (ik, jij, hij/zij, wij) across 3 tenses.
- 460 Dutch verbs: 277 regular (weak), 167 irregular (strong), 16 mixed.
- Filter a session by tense, person, and verb type - e.g. drill the irregulars only.
- Session persistence via `localStorage`.
- Mobile-friendly, clean UI.
- Deployed as a static site on GitHub Pages.

## Tech Stack
- **Vite** + **React** + **TypeScript**
- **CSS** (Custom minimal styling)

## Local Development

### Prerequisites
- Node.js (v18 or later recommended)
- npm

### Installation
```bash
npm install
```

### Running Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
npm run build
```
The build artifacts will be in the `dist/` directory.

## GitHub Pages Deployment

This project is configured for GitHub Pages via GitHub Actions.

1. Push your code to the GitHub repository.
2. Go to **Settings > Pages** in your GitHub repository.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. The site will automatically build and deploy. You can see progress in the **Actions** tab.

## Data Structure

Verbs are stored in `src/data/verbs.json`. Each verb has:
- `infinitive`: The base verb.
- `english`: English gloss.
- `type`: `regular` (weak), `irregular` (strong), or `mixed` - a weak past with a
  strong participle or the reverse, e.g. `vragen` -> `vroeg` / `gevraagd`.
- `aux`: perfect auxiliary, `hebben`, `zijn`, or both joined by `|` when either
  is current (`fietsen` -> *ik heb gefietst* / *ik ben gefietst*).
- `forms`: Conjugations for `present`, `past`, and `perfect` tenses, each with
  `ik`, `jij`, `hijzij`, `wij`.
- Multiple correct answers can be specified using the `|` delimiter (e.g., `"kan|kunt"`).

### Do not edit verbs.json by hand

It is generated. The source of truth is `scripts/verbs.source.mjs`, which records
only what needs human judgement - stems, ablaut, auxiliaries - while
`scripts/build-verbs.mjs` applies the mechanical Dutch rules: person endings, the
't kofschip rule for `-de`/`-te`, participle assembly with `ge-`/prefix handling
and tremas (`geëist`, `geïnformeerd`), and auxiliary agreement.

```bash
npm run build:verbs   # regenerate src/data/verbs.json
npm run check:verbs   # validate without writing
```

Both commands run a hand-verified spot-check table and report every form that
changed against the committed dataset, so a bad edit to the source shows up as a
diff rather than as a wrong answer in a quiz. Neither is wired into `npm run
build` - the generated JSON is committed, so the site builds without them.
