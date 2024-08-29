# PaperMate UI

## Architecture
```
├── ui/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── results/
│   │   │   ├── Export.tsx
│   │   │   ├── page.tsx
│   │   │   └── ResultGrid.tsx
│   │   ├── search/
│   │   │   └── SearchForm.tsx
│   │   └── ...
│   ├── public/
│   ├── .env.local
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── <env>.Dockerfile
│   ├── next-env.d.ts
│   ├── next.config.mjs
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── tsconfig.json
```

## Launch UI

### 0. Node.js
Make sure you've installed `Node.js` later than version 18.

### 1. Dependencies
Run `npm install` to install all needed dependencies for the app.

### 2. Launch
Run `npm run dev` and access `http://localhost:3000/`.

## Favicon.ico
<a href="https://www.flaticon.com/free-icons/automation" title="automation icons">Automation icons created by Dewi Sari - Flaticon</a>