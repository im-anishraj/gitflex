const MILESTONES = {
  pullShark: [
    { name: 'Base', count: 2 },
    { name: 'Bronze', count: 16 },
    { name: 'Silver', count: 128 },
    { name: 'Gold', count: 1024 }
  ],
  starstruck: [
    { name: 'Base', count: 16 },
    { name: 'Bronze', count: 128 },
    { name: 'Silver', count: 512 },
    { name: 'Gold', count: 4096 }
  ],
  pairExtraordinaire: [
    { name: 'Base', count: 1 },
    { name: 'Bronze', count: 10 },
    { name: 'Silver', count: 24 },
    { name: 'Gold', count: 48 }
  ],
  galaxyBrain: [
    { name: 'Base', count: 2 },
    { name: 'Bronze', count: 8 },
    { name: 'Silver', count: 16 },
    { name: 'Gold', count: 32 }
  ],
  yolo: [
    { name: 'Unlocked', count: 1 }
  ],
  quickdraw: [
    { name: 'Unlocked', count: 1 }
  ],
  publicSponsor: [
    { name: 'Unlocked', count: 1 }
  ]
};

function getMilestoneInfo(current, milestones) {
  let currentTier = "None";
  let nextTierObj = milestones[0];

  for (let i = 0; i < milestones.length; i++) {
    if (current >= milestones[i].count) {
      currentTier = milestones[i].name;
      nextTierObj = milestones[i + 1] || null; // Null if Gold is reached
    } else {
      break;
    }
  }

  if (nextTierObj === null) {
    return {
      currentTier,
      nextTier: "Maxed",
      nextCount: milestones[milestones.length - 1].count,
      remaining: 0
    };
  }

  return {
    currentTier,
    nextTier: nextTierObj.name,
    nextCount: nextTierObj.count,
    remaining: Math.max(0, nextTierObj.count - current)
  };
}

async function fetchGitHubAPI(endpoint, token, options = {}) {
  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchGraphQL(query, token) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error(`GraphQL Error: ${response.status}`);
  }

  return response.json();
}

async function calculateProgress(token) {
  const results = {};

  // 1. Pull Shark
  try {
    const prData = await fetchGitHubAPI('/search/issues?q=is:pr+is:merged+author:@me', token);
    const count = prData.total_count || 0;
    const info = getMilestoneInfo(count, MILESTONES.pullShark);
    results.pullShark = { count, ...info };
  } catch (e) {
    console.error("Pull Shark error:", e);
    results.pullShark = { error: e.message };
  }

  // 2. Starstruck and Total Stars
  try {
    const starQuery = `
      query {
        viewer {
          repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
            nodes {
              name
              stargazerCount
            }
          }
        }
      }
    `;
    const starData = await fetchGraphQL(starQuery, token);
    const nodes = starData.data?.viewer?.repositories?.nodes || [];
    
    let maxStars = 0;
    let totalStars = 0;
    let topRepos = [];
    nodes.forEach(repo => {
      totalStars += repo.stargazerCount;
      if (repo.stargazerCount > maxStars) {
        maxStars = repo.stargazerCount;
      }
    });
    
    // Sort and get top 3
    topRepos = nodes.sort((a, b) => b.stargazerCount - a.stargazerCount).slice(0, 3);

    const info = getMilestoneInfo(maxStars, MILESTONES.starstruck);
    results.starstruck = { count: maxStars, totalStars: totalStars, topRepos, ...info };
  } catch (e) {
    console.error("Starstruck error:", e);
    results.starstruck = { error: e.message };
  }

  // 3. Pair Extraordinaire
  try {
    const commitData = await fetchGitHubAPI('/search/commits?q=author:@me+"Co-authored-by"', token, {
      headers: {
        'Accept': 'application/vnd.github.cloak-preview+json'
      }
    });
    const count = commitData.total_count || 0;
    const info = getMilestoneInfo(count, MILESTONES.pairExtraordinaire);
    results.pairExtraordinaire = { count, ...info };
  } catch (e) {
    console.error("Pair Extraordinaire error:", e);
    results.pairExtraordinaire = { error: e.message };
  }

  // 4. Galaxy Brain
  try {
    const galaxyQuery = `
      query {
        viewer {
          repositoryDiscussionComments(onlyAnswers: true) {
            totalCount
          }
        }
      }
    `;
    const galaxyData = await fetchGraphQL(galaxyQuery, token);
    const count = galaxyData.data?.viewer?.repositoryDiscussionComments?.totalCount || 0;
    const info = getMilestoneInfo(count, MILESTONES.galaxyBrain);
    results.galaxyBrain = { count, ...info };
  } catch (e) {
    console.error("Galaxy Brain error:", e);
    results.galaxyBrain = { error: e.message };
  }

  // YOLO Badge
  try {
    const yoloData = await fetchGitHubAPI('/search/issues?q=is:pr+is:merged+author:@me+review:none', token);
    const count = yoloData.total_count || 0;
    const info = getMilestoneInfo(count, MILESTONES.yolo);
    results.yolo = { count, ...info };
  } catch (e) {
    console.error("YOLO error:", e);
    results.yolo = { error: e.message };
  }

  // Quickdraw Badge
  try {
    const qData = await fetchGitHubAPI('/search/issues?q=author:@me+is:closed&sort=created&order=desc&per_page=100', token);
    let earnedQuickdraw = 0;
    if (qData.items) {
      for (const item of qData.items) {
        if (item.created_at && item.closed_at) {
          const created = new Date(item.created_at);
          const closed = new Date(item.closed_at);
          const diffMinutes = (closed - created) / (1000 * 60);
          if (diffMinutes <= 5) {
            earnedQuickdraw = 1;
            break;
          }
        }
      }
    }
    const info = getMilestoneInfo(earnedQuickdraw, MILESTONES.quickdraw);
    results.quickdraw = { count: earnedQuickdraw, ...info };
  } catch (e) {
    console.error("Quickdraw error:", e);
    results.quickdraw = { error: e.message };
  }

  // 5. Profile Stats & Public Sponsor
  try {
    const statsQuery = `
      query {
        viewer {
          login
          followers { totalCount }
          repositories(ownerAffiliations: OWNER) { totalCount }
          contributionsCollection {
            contributionCalendar { totalContributions }
          }
          sponsorshipsAsSponsor(first: 1) { totalCount }
        }
      }
    `;
    const statsData = await fetchGraphQL(statsQuery, token);
    const viewer = statsData.data?.viewer || {};
    
    // Calculate Public Sponsor
    const sponsorCount = viewer.sponsorshipsAsSponsor?.totalCount || 0;
    const sponsorInfo = getMilestoneInfo(sponsorCount > 0 ? 1 : 0, MILESTONES.publicSponsor);
    results.publicSponsor = { count: sponsorCount > 0 ? 1 : 0, ...sponsorInfo };

    results.profileStats = {
      username: viewer.login || 'Unknown',
      followers: viewer.followers?.totalCount || 0,
      repos: viewer.repositories?.totalCount || 0,
      contributions: viewer.contributionsCollection?.contributionCalendar?.totalContributions || 0
    };
  } catch (e) {
    console.error("Profile stats error:", e);
    results.profileStats = { error: e.message };
  }

  return results;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startPolling') {
    startDeviceFlowPolling(request.device_code, request.interval, request.client_id);
    sendResponse({ status: 'polling_started' });
    return;
  }

  if (request.action === 'fetchProgress') {
    chrome.storage.local.get(['github_pat'], (data) => {
      const token = data.github_pat;
      if (!token) {
        sendResponse({ error: 'No token found' });
        return;
      }
      
      calculateProgress(token)
        .then(results => sendResponse({ success: true, data: results }))
        .catch(err => sendResponse({ error: err.message }));
    });
    return true; // Required for async sendResponse
  }
  
  if (request.action === 'deviceFlowSuccess') {
    chrome.storage.local.get(['pending_device_code', 'client_id'], async (data) => {
      if (data.pending_device_code && data.client_id) {
        try {
          const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: data.client_id,
              device_code: data.pending_device_code,
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
            })
          });
          const tokenData = await response.json();
          if (tokenData.access_token) {
            chrome.storage.local.set({ 'github_pat': tokenData.access_token });
            chrome.storage.local.remove(['pending_device_code', 'client_id']);
            
            chrome.notifications.create('gitflex-auth-success', {
              type: 'basic',
              iconUrl: 'gitflex-icon.png',
              title: 'GitFlex Connected!',
              message: 'Congratulations, you are all set! Click the extension icon to view your stats.',
              priority: 2
            });
          }
        } catch (e) {
          console.error("Error exchanging token on success:", e);
        }
      }
    });
    return true;
  }
});

function startDeviceFlowPolling(device_code, intervalSeconds, client_id) {
  const pollInterval = (intervalSeconds || 5) * 1000;
  
  const poll = setInterval(async () => {
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client_id,
          device_code: device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      });
      const data = await response.json();
      
      if (data.access_token) {
        clearInterval(poll);
        chrome.storage.local.set({ 'github_pat': data.access_token });
      } else if (data.error && data.error !== 'authorization_pending') {
        clearInterval(poll);
      }
    } catch (e) {
      console.error("Polling error:", e);
      clearInterval(poll);
    }
  }, pollInterval);
}
