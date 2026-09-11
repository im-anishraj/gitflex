// Notify the background script that the user successfully authorized the app
chrome.runtime.sendMessage({ action: "deviceFlowSuccess" });
