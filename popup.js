console.log("✅ popup.js is running!");
alert("Popup script loaded!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("popup.js loaded successfully!");  // Debugging log

    const loginButton = document.getElementById("loginButton");
    
    if (!loginButton) {
        console.error("Login button NOT found!");
        return;
    }

    console.log("Login button found!");

    loginButton.addEventListener("click", function () {
        console.log("Login button clicked! Sending message to background.js...");

        chrome.runtime.sendMessage({ action: "authenticate" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError);
            } else {
                console.log("Response from background.js:", response);
                if (response && response.status === "success") {
                    document.getElementById("status").textContent = "Logged in";
                }
            }
        });
    });
});
