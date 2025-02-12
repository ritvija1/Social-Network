const CLIENT_ID = "wPt0LzlocnpVzTP965cFlQ";  // Replace with your actual Client ID
const REDIRECT_URI = "https://bndnmfgacfmmeledhcaddcijkimmeell.chromiumapp.org/"; // Replace with actual extension ID

const AUTH_URL = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=token&state=randomstring&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&duration=temporary&scope=identity read`;

// Function to start OAuth login
function authenticateUser() {
    console.log("🔵 Starting OAuth authentication...");

    chrome.identity.launchWebAuthFlow(
        {
            url: AUTH_URL,
            interactive: true
        },
        function (redirectUrl) {
            if (chrome.runtime.lastError || !redirectUrl) {
                console.error("❌ OAuth failed:", chrome.runtime.lastError);
                return;
            }

            // Extract access token
            const token = new URL(redirectUrl).hash.split("&")[0].split("=")[1];
            console.log("✅ Access Token:", token);

            // Store token
            chrome.storage.local.set({ "reddit_token": token }, () => {
                console.log("🔵 Token saved successfully!");
            });

            // Notify popup
            chrome.runtime.sendMessage({ action: "logged_in", token });
        }
    );
}

// Listen for login request from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in background:", message);

    if (message.action === "authenticate") {
        console.log("Starting authentication...");
        authenticateUser();
        sendResponse({ status: "Authentication started" });
    } else {
        console.error("Unknown message action:", message.action);
    }
    return true;  // Keeps the service worker alive for async operations
});

chrome.identity.launchWebAuthFlow(
    {
        url: AUTH_URL,
        interactive: true
    },
    function (redirectUrl) {
        if (chrome.runtime.lastError || !redirectUrl) {
            console.error("OAuth failed:", chrome.runtime.lastError || "No redirect URL");
            return;
        }

        try {
            // Extract token from URL
            const urlParams = new URL(redirectUrl).hash.substring(1);
            const params = new URLSearchParams(urlParams);
            const token = params.get("access_token");

            if (!token) throw new Error("Access token missing in response");

            console.log("Access Token:", token);

            // Store token in Chrome's storage
            chrome.storage.local.set({ "reddit_token": token }, () => {
                console.log("Token saved successfully!");
            });
        } catch (err) {
            console.error("Error parsing OAuth response:", err);
        }
    }
);

