function populateUserInfo() {
    var userInfo = JSON.parse(localStorage.getItem("userInfo"));
    var welcomeMessage = "Welcome, " + userInfo.firstName; 
    document.getElementById("userInfoContainer").textContent = welcomeMessage;
}