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

## GitHub Pages Deployment

This project is configured for GitHub Pages via GitHub Actions.

1. Push your code to the GitHub repository.
2. Go to **Settings > Pages** in your GitHub repository.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. The site will automatically build and deploy. You can see progress in the **Actions** tab.

## Data Structure
Verbs are stored in `src/data/verbs.json`. Each verb has:
- `infinitive`: The base verb.
- `forms`: Conjugations for `present`, `past`, and `perfect` tenses.
- Multiple correct answers can be specified using the `|` delimiter (e.g., `"kan|kunt"`).
