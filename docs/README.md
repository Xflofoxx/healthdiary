# Healthdiary Documentation

This folder contains the source files for the Healthdiary GitHub Pages site.

## Live Site

The documentation is available at: **https://xflofoxx.github.io/healthdiary/**

## Setup GitHub Pages

1. Go to repository Settings
2. Navigate to Pages
3. Source: Deploy from a branch
4. Branch: `master` /docs folder
5. Save

## Local Development

To preview locally:

```bash
# Using a simple HTTP server
cd docs
python -m http.server 8000
# or
npx serve
```

Then open http://localhost:8000

## Contributing

To update the documentation:
1. Edit the HTML/CSS files in this folder
2. Commit and push changes
3. GitHub Pages will auto-deploy
