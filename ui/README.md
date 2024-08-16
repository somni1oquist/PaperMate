# PaperMate UI

## Archetecture

```
/app
├── favicon.ico
├── globals.css
├── layout.tsx
├── page.tsx           # Now the landing page (formerly search/page.tsx)
├── search              # Folder for search page components
│   ├── SearchForm.tsx  # Component for search form
├── results             # Folder for results page
│   ├── page.tsx        # Results page component
│   └── ResultItem.tsx  # Component for displaying individual result items
├── public              # Folder for static assets
│   └── logo            # Folder for logos and images
│       └── app-logo.png # App logo image
└── components          # Folder for reusable components
    ├── Header.tsx      # Header component
    ├── Footer.tsx      # Footer component
    └── Sidebar.tsx     # Sidebar component
```

## Steps to launch the UI app
