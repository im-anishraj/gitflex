const BADGE_INFO = {
  pullShark: { name: 'Pull Shark', desc: 'Merged PRs' },
  starstruck: { name: 'Starstruck', desc: 'Max Repo Stars' },
  pairExtraordinaire: { name: 'Pair Extraordinaire', desc: 'Co-authored Commits' },
  galaxyBrain: { name: 'Galaxy Brain', desc: 'Accepted Answers' },
  yolo: { name: 'YOLO', desc: 'Unreviewed PRs' }
};

const GITHUB_CLIENT_ID = 'Ov23liWc0aNED1kEvaSD';

document.addEventListener('DOMContentLoaded', () => {
  const authSection = document.getElementById('auth-section');
  const mainSection = document.getElementById('main-section');
  const loginBtn = document.getElementById('login-btn');
  const authStatus = document.getElementById('auth-status');
  const refreshBtn = document.getElementById('refresh-btn');

  // View routing
  const navItems = document.querySelectorAll('.nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  const currentViewTitle = document.getElementById('current-view-title');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Update active nav link
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Update title
      currentViewTitle.textContent = item.textContent;

      // Show the correct view panel
      const targetView = item.getAttribute('data-view');
      viewPanels.forEach(panel => {
        if (panel.id === targetView) {
          panel.classList.remove('hidden-view');
          panel.classList.add('active-view');
        } else {
          panel.classList.remove('active-view');
          panel.classList.add('hidden-view');
        }
      });
    });
  });

  // Helper function to poll GitHub
  function startPolling(device_code, client_id, intervalSeconds) {
    const interval = (intervalSeconds || 5) * 1000;
    const poll = setInterval(async () => {
      try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: client_id,
            device_code: device_code,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
          })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.access_token) {
          clearInterval(poll);
          chrome.storage.local.set({ 'github_pat': tokenData.access_token });
          chrome.storage.local.remove(['pending_device_code', 'client_id']);
          authStatus.innerHTML = 'Authenticated successfully!';
          authStatus.style.color = '#2ea043';
          setTimeout(() => {
            showMainSection();
            loginBtn.style.display = 'flex';
            authStatus.innerHTML = '';
          }, 1000);
        } else if (tokenData.error !== 'authorization_pending') {
          clearInterval(poll);
          chrome.storage.local.remove(['pending_device_code', 'client_id']);
          authStatus.textContent = `Error: ${tokenData.error_description}`;
          authStatus.style.color = '#f85149';
          loginBtn.style.display = 'flex';
        }
      } catch (err) {
        clearInterval(poll);
      }
    }, interval);
  }

  // Check initial state
  chrome.storage.local.get(['github_pat', 'pending_device_code', 'client_id'], async (result) => {
    if (result.github_pat) {
      showMainSection();
    } else if (result.pending_device_code && result.client_id) {
      // If popup was closed during login, check if they finished!
      showAuthSection();
      loginBtn.style.display = 'none';
      authStatus.innerHTML = 'Verifying login status...';
      authStatus.style.color = '#8b949e';
      
      try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: result.client_id,
            device_code: result.pending_device_code,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
          })
        });
        const tokenData = await tokenResponse.json();
        
        if (tokenData.access_token) {
          chrome.storage.local.set({ 'github_pat': tokenData.access_token });
          chrome.storage.local.remove(['pending_device_code', 'client_id']);
          authStatus.innerHTML = 'Authenticated successfully!';
          authStatus.style.color = '#2ea043';
          setTimeout(() => {
            showMainSection();
            loginBtn.style.display = 'flex';
            authStatus.innerHTML = '';
          }, 1000);
        } else if (tokenData.error === 'authorization_pending') {
          authStatus.innerHTML = 'Still waiting for authorization on GitHub...';
          startPolling(result.pending_device_code, result.client_id, 5);
        } else {
          chrome.storage.local.remove(['pending_device_code', 'client_id']);
          authStatus.textContent = 'Login session expired. Please try again.';
          authStatus.style.color = '#f85149';
          loginBtn.style.display = 'flex';
        }
      } catch (e) {
        chrome.storage.local.remove(['pending_device_code', 'client_id']);
        showAuthSection();
      }
    } else {
      showAuthSection();
    }
  });

  loginBtn.addEventListener('click', async () => {
    loginBtn.style.display = 'none';
    authStatus.innerHTML = 'Connecting to GitHub...';
    authStatus.style.color = '#8b949e';

    try {
      const response = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          scope: 'repo' 
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error_description);
      
      // Save device code to storage so it survives popup closures!
      chrome.storage.local.set({ 
        'pending_device_code': data.device_code,
        'client_id': GITHUB_CLIENT_ID
      });
      
      authStatus.innerHTML = `
        <div style="margin-top: 10px; padding: 12px; background: #161b22; border-radius: 8px; border: 1px solid #30363d;">
          <p style="margin-top: 0;">1. Copy this 8-digit code:</p>
          <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin: 10px 0;">
            <h2 style="color: #58a6ff; letter-spacing: 2px; margin: 0;">${data.user_code}</h2>
            <button id="copy-code-btn" title="Copy code" style="background: none; border: none; cursor: pointer; color: #8b949e; padding: 4px; display: flex; align-items: center;">
              <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>
            </button>
          </div>
          <p>2. Paste it on GitHub to authorize:</p>
          <button id="open-github-btn" class="primary-btn" style="width: 100%;">Open GitHub</button>
          <p style="font-size: 11px; margin-top: 12px; margin-bottom: 0; text-align: center;">Waiting for authorization...</p>
        </div>
      `;
      
      document.getElementById('copy-code-btn').addEventListener('click', (e) => {
        navigator.clipboard.writeText(data.user_code);
        const icon = e.currentTarget;
        const originalHtml = icon.innerHTML;
        icon.innerHTML = `<svg height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true" fill="#2ea043"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>`;
        setTimeout(() => { icon.innerHTML = originalHtml; }, 2000);
      });

      document.getElementById('open-github-btn').addEventListener('click', () => {
        chrome.tabs.create({ url: data.verification_uri });
      });
      
      startPolling(data.device_code, GITHUB_CLIENT_ID, data.interval);
  
    } catch (err) {
      authStatus.textContent = `Error: ${err.message}`;
      authStatus.style.color = '#f85149';
      loginBtn.style.display = 'flex';
    }
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      chrome.storage.local.remove('github_pat', () => {
        showAuthSection();
      });
    });
  }

  refreshBtn.addEventListener('click', () => {
    fetchAndRenderProgress();
  });

  function showMainSection() {
    authSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    fetchAndRenderProgress();
  }

  function showAuthSection() {
    mainSection.classList.add('hidden');
    authSection.classList.remove('hidden');
  }

  function fetchAndRenderProgress() {
    const loading = document.getElementById('loading-indicator');
    const errorMsg = document.getElementById('error-message');
    
    // Hide containers while loading
    document.getElementById('badges-container').classList.add('hidden');
    document.getElementById('stars-container').classList.add('hidden');
    document.getElementById('stats-container').classList.add('hidden');
    
    loading.classList.remove('hidden');
    errorMsg.classList.add('hidden');
    refreshBtn.disabled = true;
    refreshBtn.style.opacity = '0.5';

    chrome.runtime.sendMessage({ action: 'fetchProgress' }, (response) => {
      loading.classList.add('hidden');
      refreshBtn.disabled = false;
      refreshBtn.style.opacity = '1';

      if (chrome.runtime.lastError || !response) {
        errorMsg.textContent = 'Error connecting to background script.';
        errorMsg.classList.remove('hidden');
        return;
      }

      if (response.error) {
        errorMsg.textContent = response.error;
        errorMsg.classList.remove('hidden');
        return;
      }
      
      if (response.data && response.data.profileStats && response.data.profileStats.username) {
        document.getElementById('user-profile-name').textContent = '@' + response.data.profileStats.username;
      }

      renderBadges(response.data);
      renderStars(response.data);
      renderStats(response.data);
      
      document.getElementById('badges-container').classList.remove('hidden');
      document.getElementById('stars-container').classList.remove('hidden');
      document.getElementById('stats-container').classList.remove('hidden');
    });
  }

  function renderBadges(data) {
    const container = document.getElementById('badges-container');
    container.innerHTML = ''; 

    for (const [key, info] of Object.entries(data)) {
      if (key === 'profileStats') continue;
      const badgeMeta = BADGE_INFO[key];
      if (!badgeMeta) continue;

      if (info.error) {
        container.innerHTML += `
          <div class="badge-card">
            <div class="badge-header">
              <div class="badge-title"><strong>${badgeMeta.name}</strong></div>
            </div>
            <div class="error-msg">Error: ${info.error}</div>
          </div>
        `;
        continue;
      }
      
      const isMaxed = info.nextTier === "Maxed";
      let percentage = 0;
      if (isMaxed) {
        percentage = 100;
      } else {
        percentage = Math.min(100, Math.round((info.count / info.nextCount) * 100));
      }

      const html = `
        <div class="badge-card badge-${key}">
          <div class="badge-header">
            <div class="badge-title">
              <strong>${badgeMeta.name}</strong> 
              <span class="badge-tier tier-${info.currentTier.toLowerCase()}">${info.currentTier}</span>
            </div>
            <div class="badge-desc">${badgeMeta.desc}</div>
          </div>
          <div class="progress-info">
            <span>${info.count} / ${isMaxed ? "Max" : info.nextCount}</span>
            ${!isMaxed ? `<span class="next-tier">Next: ${info.nextTier}</span>` : ''}
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar ${isMaxed ? 'tier-max' : ''}" style="width: ${percentage}%"></div>
          </div>
          ${info.remaining > 0 ? `<div class="remaining-text">${info.remaining} left to go!</div>` : ''}
        </div>
      `;
      container.innerHTML += html;
    }
  }

  function renderStars(data) {
    const container = document.getElementById('stars-container');
    container.innerHTML = '';
    
    if (data.starstruck && data.starstruck.totalStars !== undefined) {
      container.innerHTML += `
        <div class="badge-card badge-starstruck">
          <div class="badge-header" style="justify-content: center; padding: 8px 0;">
            <div style="text-align: center;">
              <div class="badge-desc" style="margin-bottom: 4px;">Grand Total Stars</div>
              <strong style="font-size: 24px; color: #fbbf24;">★ ${data.starstruck.totalStars}</strong> 
            </div>
          </div>
        </div>
      `;

      if (data.starstruck.topRepos && data.starstruck.topRepos.length > 0) {
        let reposHtml = '<div class="badge-card"><h4 style="margin: 0 0 12px 0; font-size: 13px; color: #ffffff;">Top 3 Repositories</h4>';
        data.starstruck.topRepos.forEach((repo, index) => {
          reposHtml += `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: ${index === 2 ? 'none' : '1px solid #27272a'};">
              <span style="font-weight: 500; font-size: 13px;">${index + 1}. ${repo.name}</span>
              <span style="color: #fbbf24; font-size: 13px; font-weight: 600;">★ ${repo.stargazerCount}</span>
            </div>
          `;
        });
        reposHtml += '</div>';
        container.innerHTML += reposHtml;
      }
    }
  }

  function renderStats(data) {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';
    
    if (data.profileStats) {
      const stats = data.profileStats;
      container.innerHTML += `
        <div class="badge-card">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
            <span style="font-size: 13px; color: #a1a1aa;">Total Commits (This Year)</span>
            <strong style="font-size: 15px; color: #3b82f6;">${stats.contributions || 0}</strong>
          </div>
        </div>
        <div class="badge-card">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
            <span style="font-size: 13px; color: #a1a1aa;">Total Repositories</span>
            <strong style="font-size: 15px; color: #10b981;">${stats.repos || 0}</strong>
          </div>
        </div>
        <div class="badge-card">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
            <span style="font-size: 13px; color: #a1a1aa;">Followers</span>
            <strong style="font-size: 15px; color: #c084fc;">${stats.followers || 0}</strong>
          </div>
        </div>
      `;
    }
  }
});
