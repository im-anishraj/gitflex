# Contributing to GitFlex

First off, thank you for considering contributing to **GitFlex**! It's people like you that make open source such a great community.

## 🚀 How to Contribute

### 1. Find an Issue
- Look through our [Issue Tracker](https://github.com/im-anishraj/gitflex/issues) for issues labeled `good first issue` or `help wanted`.
- If you have a new idea, please **open an issue first** so we can discuss it before you write any code!

### 2. Fork & Clone
1. Fork the repository to your own GitHub account.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/gitflex.git
   ```

### 3. Create a Branch
Always create a new branch for your work:
```bash
git checkout -b feature/your-feature-name
```
or 
```bash
git checkout -b fix/your-bug-fix
```

### 4. Make Your Changes
- Ensure your code follows the existing style (vanilla JS, clean CSS).
- Test the extension locally by loading it unpacked in `chrome://extensions/`.

### 5. Commit & Push
Use clear and descriptive commit messages (we prefer Conventional Commits format):
```bash
git commit -m "feat: added new badge to tracker"
```
Push to your fork:
```bash
git push origin feature/your-feature-name
```

### 6. Submit a Pull Request
- Open a Pull Request against the `main` branch of the `im-anishraj/gitflex` repository.
- Fill out the Pull Request template completely.
- Wait for a review!

## 🧑‍💻 Code Guidelines
- We do not use React, Vue, or Tailwind. Keep it vanilla!
- If you are modifying the GitHub API calls, try to use the GraphQL API in `background.js` to minimize network requests.
- All styles belong in `popup.css`. No inline styling unless strictly necessary for dynamic elements.
