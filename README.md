<p align="center">
  <img src="readme.png" alt="GitFlex Logo" width="300" />
</p>

<h1 align="center">GitFlex 👑</h1>

<p align="center">
  <strong>Flex your GitHub achievements.</strong><br>
  <em>A sleek browser extension to track your Pull Shark progress, find your most starred repositories, and monitor your global GitHub impact.</em>
</p>

<p align="center">
  <a href="https://github.com/im-anishraj/gitflex/issues">
    <img src="https://img.shields.io/github/issues/im-anishraj/gitflex?style=for-the-badge&color=58a6ff" alt="Issues">
  </a>
  <a href="https://github.com/im-anishraj/gitflex/pulls">
    <img src="https://img.shields.io/github/issues-pr/im-anishraj/gitflex?style=for-the-badge&color=2ea043" alt="Pull Requests">
  </a>
  <a href="https://github.com/im-anishraj/gitflex/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/im-anishraj/gitflex?style=for-the-badge&color=8b949e" alt="License">
  </a>
</p>

---

## ✨ Features

- 🏆 **Live Badge Tracking:** See exactly how many PRs you need to merge to reach your next `Pull Shark` tier.
- ⭐️ **Star Analytics:** View your global total stars across all repositories, and see a ranked leaderboard of your Top 3 repos.
- 📊 **Profile Metrics:** Track your total contributions this year, repository count, and followers.
- 🔒 **Stateless & Secure OAuth:** Uses GitHub's official Device Flow. Your token never leaves your local machine, and the extension functions securely without maintaining brittle background sessions.

## 🚀 Installation

Currently, **GitFlex** is available to install manually via Chrome Developer Mode:

1. Clone the repository:
   ```bash
   git clone https://github.com/im-anishraj/gitflex.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the cloned `gitflex` folder.
5. Click the GitFlex icon in your browser toolbar, log in with GitHub, and flex your stats!

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (No heavy frameworks!)
- **Data Engine:** GitHub GraphQL API v4
- **Auth:** GitHub OAuth App (Device Flow)
- **Design:** Matte Neon UI with CSS Grid

## 🤝 Contributing

We love open source and welcome contributions from everyone! Whether you're a beginner looking for your first PR or an expert adding advanced GraphQL analytics, we want your help.

1. Read our [Contributing Guidelines](CONTRIBUTING.md).
2. Check the [open issues](https://github.com/im-anishraj/gitflex/issues) for something to work on.
3. Make a fork, create a branch, and submit a Pull Request!

## 📜 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
