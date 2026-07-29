/* =========================
LOGIN
========================= */

const loginForm =
document.getElementById("loginForm");


if (loginForm) {


loginForm.addEventListener(
"submit",
function(event) {


event.preventDefault();


const identifier =
document
.getElementById("loginIdentifier")
.value
.trim();


const password =
document
.getElementById("loginPassword")
.value
.trim();


const message =
document.getElementById(
"loginMessage"
);


if (
!identifier ||
!password
) {


message.textContent =
"Please fill in all fields.";


return;


}


/*
BACKEND CONNECTION

Later, we will connect this
form to the backend.

Example:

fetch("/api/login", {
method: "POST",
headers: {
"Content-Type":
"application/json"
},
body: JSON.stringify({
identifier:
identifier,
password:
password
})
});

*/


message.textContent =
"Login system is ready for backend connection.";


}
);


}


/* =========================
REGISTER
========================= */

const registerForm =
document.getElementById(
"registerForm"
);


if (registerForm) {


registerForm.addEventListener(
"submit",
function(event) {


event.preventDefault();


const fullName =
document
.getElementById("fullName")
.value
.trim();


const username =
document
.getElementById("username")
.value
.trim();


const phoneNumber =
document
.getElementById("phoneNumber")
.value
.trim();


const password =
document
.getElementById(
"registerPassword"
)
.value;


const confirmPassword =
document
.getElementById(
"confirmPassword"
)
.value;


const message =
document.getElementById(
"registerMessage"
);


if (
!fullName ||
!username ||
!phoneNumber ||
!password ||
!confirmPassword
) {


message.textContent =
"Please fill in all fields.";


return;


}


if (
password !==
confirmPassword
) {


message.textContent =
"Passwords do not match.";


return;


}


/*
BACKEND CONNECTION

Later, we will connect this
registration form to the backend.

Example:

fetch("/api/register", {
method: "POST",
headers: {
"Content-Type":
"application/json"
},
body: JSON.stringify({
fullName:
fullName,
username:
username,
phoneNumber:
phoneNumber,
password:
password
})
});

*/


message.textContent =
"Registration form is ready for backend connection.";


}
);


}


/* =========================
CHAT
========================= */

const messages =
document.getElementById(
"messages"
);


const messageInput =
document.getElementById(
"messageInput"
);


const sendBtn =
document.getElementById(
"sendBtn"
);


/* Send Button */

if (sendBtn) {


sendBtn.addEventListener(
"click",
sendMessage
);


}


/* Enter Key */

if (messageInput) {


messageInput.addEventListener(
"keydown",
function(event) {


if (
event.key ===
"Enter"
) {


sendMessage();


}


}
);


}


/* Send Message Function */

function sendMessage() {


if (
!messageInput ||
!messages
) {


return;


}


const text =
messageInput
.value
.trim();


if (
text === ""
) {


return;


}


const message =
document.createElement(
"div"
);


message.className =
"message sent";


const time =
new Date()
.toLocaleTimeString(
[],
{
hour:
"2-digit",

minute:
"2-digit"
}
);


message.innerHTML = `

<p>
${escapeHTML(text)}
</p>

<span>
${time}
</span>

`;


messages.appendChild(
message
);


messageInput.value =
"";


messages.scrollTop =
messages.scrollHeight;


/*
BACKEND CONNECTION

Later, this message will be sent
to the backend server.

The backend will store the message
and deliver it to the other user.
*/


}


/* =========================
FIND USER MODAL
========================= */

const newChatBtn =
document.getElementById(
"newChatBtn"
);


const newChatModal =
document.getElementById(
"newChatModal"
);


const closeModalBtn =
document.getElementById(
"closeModalBtn"
);


/* Open Modal */

if (
newChatBtn &&
newChatModal
) {


newChatBtn.addEventListener(
"click",
function() {


newChatModal.classList.remove(
"hidden"
);


}
);


}


/* Close Modal */

if (
closeModalBtn &&
newChatModal
) {


closeModalBtn.addEventListener(
"click",
function() {


newChatModal.classList.add(
"hidden"
);


}
);


}


/* Close Modal By Clicking Outside */

if (newChatModal) {


newChatModal.addEventListener(
"click",
function(event) {


if (
event.target ===
newChatModal
) {


newChatModal.classList.add(
"hidden"
);


}


}
);


}


/* =========================
SEARCH CHATS
========================= */

const searchInput =
document.getElementById(
"searchInput"
);


if (searchInput) {


searchInput.addEventListener(
"input",
function() {


const search =
searchInput
.value
.toLowerCase();


const chats =
document.querySelectorAll(
".chat-item"
);


chats.forEach(
function(chat) {


const name =
chat
.dataset
.name
.toLowerCase();


if (
name.includes(
search
)
) {


chat.style.display =
"flex";


} else {


chat.style.display =
"none";


}


}
);


}
);


}


/* =========================
SELECT CHAT
========================= */

document.addEventListener(
"click",
function(event) {


const chat =
event.target.closest(
".chat-item"
);


if (!chat) {


return;


}


const chatItems =
document.querySelectorAll(
".chat-item"
);


chatItems.forEach(
function(item) {


item.classList.remove(
"active"
);


}
);


chat.classList.add(
"active"
);


const name =
chat.dataset.name;


const chatUserName =
document.getElementById(
"chatUserName"
);


const chatUserStatus =
document.getElementById(
"chatUserStatus"
);


if (chatUserName) {


chatUserName.textContent =
name;


}


if (chatUserStatus) {


chatUserStatus.textContent =
"Online";


}


const app =
document.querySelector(
".app"
);


if (app) {


app.classList.add(
"chat-open"
);


}


}
);


/* =========================
EMOJI BUTTON
========================= */

const emojiBtn =
document.getElementById(
"emojiBtn"
);


if (emojiBtn) {


emojiBtn.addEventListener(
"click",
function() {


if (!messageInput) {


return;


}


messageInput.value +=
" 😊";


messageInput.focus();


}
);


}


/* =========================
SERVICE WORKER
========================= */

if (
"serviceWorker"
in navigator
) {


window.addEventListener(
"load",
function() {


navigator.serviceWorker
.register(
"service-worker.js"
)
.then(
function() {


console.log(
"Service Worker registered successfully."
);


}
)
.catch(
function(error) {


console.log(
"Service Worker registration failed:",
error
);


}
);


}
);


}


/* =========================
SECURITY HELPER
========================= */

function escapeHTML(
text
) {


const div =
document.createElement(
"div"
);


div.textContent =
text;


return div.innerHTML;


}
