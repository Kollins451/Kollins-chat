const app = document.querySelector(".app");

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const searchInput = document.getElementById("searchInput");
const chatList = document.getElementById("chatList");

const newChatBtn = document.getElementById("newChatBtn");
const newChatModal = document.getElementById("newChatModal");
const closeModalBtn = document.getElementById("closeModalBtn");

const usernameInput = document.getElementById("usernameInput");
const startChatBtn = document.getElementById("startChatBtn");
const userResult = document.getElementById("userResult");

const chatUserName = document.getElementById("chatUserName");
const chatUserStatus = document.getElementById("chatUserStatus");

const emojiBtn = document.getElementById("emojiBtn");


// =========================
// SEND MESSAGE
// =========================

function sendMessage() {

const text = messageInput.value.trim();

if (text === "") {
return;
}

const message = document.createElement("div");

message.className = "message sent";

const time = new Date().toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit"
});

message.innerHTML = `
<p>${escapeHTML(text)}</p>
<span>${time}</span>
`;

messages.appendChild(message);

messageInput.value = "";

scrollToBottom();

// Later:
// This is where we will send the message
// to the backend server.
}


// Send button
sendBtn.addEventListener("click", sendMessage);


// Enter key
messageInput.addEventListener("keydown", function(event) {

if (event.key === "Enter") {
sendMessage();
}

});


// =========================
// EMOJI
// =========================

emojiBtn.addEventListener("click", function() {

messageInput.value += " 😊";

messageInput.focus();

});


// =========================
// SEARCH CHATS
// =========================

searchInput.addEventListener("input", function() {

const search = searchInput.value.toLowerCase();

const chats = document.querySelectorAll(".chat-item");

chats.forEach(chat => {

const name = chat.dataset.name.toLowerCase();

if (name.includes(search)) {
chat.style.display = "flex";
} else {
chat.style.display = "none";
}

});

});


// =========================
// SELECT CHAT
// =========================

document.addEventListener("click", function(event) {

const chat = event.target.closest(".chat-item");

if (!chat) {
return;
}

document.querySelectorAll(".chat-item")
.forEach(item => item.classList.remove("active"));

chat.classList.add("active");

const name = chat.dataset.name;

chatUserName.textContent = name;

chatUserStatus.textContent = "Online";

// Mobile: open chat
app.classList.add("chat-open");

});


// =========================
// NEW CHAT MODAL
// =========================

newChatBtn.addEventListener("click", function() {

newChatModal.classList.remove("hidden");

usernameInput.focus();

});


closeModalBtn.addEventListener("click", function() {

newChatModal.classList.add("hidden");

});


newChatModal.addEventListener("click", function(event) {

if (event.target === newChatModal) {
newChatModal.classList.add("hidden");
}

});


// =========================
// FIND USER
// =========================

startChatBtn.addEventListener("click", function() {

const username = usernameInput.value.trim();

if (username === "") {

userResult.textContent =
"Please enter a username.";

return;
}

userResult.textContent =
"Searching for " + username + "...";

/*
BACKEND CONNECTION WILL COME HERE.

Later, this will send the username
to our backend:

fetch("/api/users/" + username)

The backend will check the database
and return the user's information.
*/

setTimeout(function() {

userResult.textContent =
"Backend not connected yet. We will connect it later.";

}, 700);

});


// =========================
// HELPERS
// =========================

function scrollToBottom() {

messages.scrollTop = messages.scrollHeight;

}


function escapeHTML(text) {

const div = document.createElement("div");

div.textContent = text;

return div.innerHTML;

}


// =========================
// SERVICE WORKER
// =========================

if ("serviceWorker" in navigator) {

window.addEventListener("load", function() {

navigator.serviceWorker
.register("service-worker.js")
.then(function() {

console.log(
"Service Worker registered successfully."
);

})
.catch(function(error) {

console.log(
"Service Worker registration failed:",
error
);

});

});

}
