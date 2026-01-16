# Dutch Verb Trainer

A static web application to practice Dutch verb conjugations across Present (TT), Past (OVT), and Perfect (VTT) tenses.

## Features
- Practice 4 persons (ik, jij, hij/zij, wij) across 3 tenses.
- 15+ common Dutch verbs (regular and irregular) included.
- Session persistence via `localStorage`.
- Mobile-friendly, clean UI.
- Deployed as a static site on GitLab Pages.

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

## GitLab Pages Deployment

This project is configured for GitLab Pages via `.gitlab-ci.yml`.

1. Push your code to a GitLab repository.
2. Ensure the default branch is named `main`.
3. GitLab CI will automatically build and deploy the site.
4. Go to **Settings > Pages** in your GitLab project to find the URL of your site.

## Data Structure
Verbs are stored in `src/data/verbs.json`. Each verb has:
- `infinitive`: The base verb.
- `forms`: Conjugations for `present`, `past`, and `perfect` tenses.
- Multiple correct answers can be specified using the `|` delimiter (e.g., `"kan|kunt"`).
