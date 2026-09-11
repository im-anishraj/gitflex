// Notify the background script that the user successfully authorized the app
chrome.runtime.sendMessage({ action: "deviceFlowSuccess" });

// Inject a beautiful custom toast notification into the GitHub DOM
const iconUrl = chrome.runtime.getURL('gitflex-icon.png');

const toast = document.createElement('div');
toast.style.position = 'fixed';
toast.style.bottom = '-100px';
toast.style.right = '24px';
toast.style.width = '360px';
toast.style.background = '#161b22';
toast.style.border = '1px solid #30363d';
toast.style.borderRadius = '12px';
toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
toast.style.display = 'flex';
toast.style.alignItems = 'center';
toast.style.padding = '16px';
toast.style.gap = '16px';
toast.style.zIndex = '999999';
toast.style.transition = 'bottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
toast.style.color = '#c9d1d9';
toast.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

toast.innerHTML = `
  <img src="${iconUrl}" style="width: 48px; height: 48px; border-radius: 8px; flex-shrink: 0;">
  <div>
    <h4 style="margin: 0; color: #58a6ff; font-size: 15px; margin-bottom: 4px;">GitFlex Connected!</h4>
    <p style="margin: 0; font-size: 13px; line-height: 1.4;">Congratulations, you are all set! Click the extension icon to view your stats.</p>
  </div>
  <button id="gitflex-toast-close" style="background: none; border: none; color: #8b949e; cursor: pointer; position: absolute; top: 12px; right: 12px; padding: 4px; border-radius: 4px;">
    <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path></svg>
  </button>
`;

document.body.appendChild(toast);

// Animate in
setTimeout(() => {
  toast.style.bottom = '24px';
}, 100);

// Close button logic
document.getElementById('gitflex-toast-close').addEventListener('click', () => {
  toast.style.bottom = '-100px';
  setTimeout(() => toast.remove(), 500);
});

// Auto-remove after 8 seconds
setTimeout(() => {
  if (document.body.contains(toast)) {
    toast.style.bottom = '-100px';
    setTimeout(() => toast.remove(), 500);
  }
}, 8000);
