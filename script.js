```javascript
// ==========================================
// 1. BACKEND CONNECTION
// ==========================================

const API_URL =
 "https://kollins-chat-backend.onrender.com";


// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

function getToken() {

 return localStorage.getItem(
 "kollinsToken"
 );

}


function getCurrentUser() {

 const user =
 localStorage.getItem(
 "kollinsUser"
 );

 return user
 ? JSON.parse(user)
 : null;

}


function saveLoginData(data) {

 localStorage.setItem(
 "kollinsToken",
 data.token
 );

 localStorage.setItem(
 "kollinsUser",
 JSON.stringify(data.user)
 );

}


async function apiRequest(
 endpoint,
 options = {}
) {

 const token =
 getToken();

 const headers = {

 "Content-Type":
 "application/json"

 };


 if (token) {

 headers.Authorization =
 Bearer ${token};

 }


 const response =
 await fetch(
 `${API_URL}${endpoint}`,
 {
 ...options,
 headers
 }
 );


 const data =
 await response.json();


 if (!response.ok) {

 throw new Error(
 data.message ||
 "Something went wrong."
 );

 }


 return data;

}


// ==========================================
// 3. REGISTER ACCOUNT
// ==========================================

const registerForm =
 document.getElementById(
 "registerForm"
 );


if (registerForm) {

 registerForm.addEventListener(
 "submit",
 async function(event) {

 event.preventDefault();


 const fullName =
 document
 .getElementById(
 "fullName"
 )
 ?.value
 .trim();


 const username =
 document
 .getElementById(
 "username"
 )
 ?.value
 .trim();


 const phoneNumber =
 document
 .getElementById(
 "phoneNumber"
 )
 ?.value
 .trim();


 const password =
 document
 .getElementById(
 "password"
 )
 ?.value;


 const message =
 document
 .getElementById(
 "registerMessage"
 );


 try {

 if (
 !fullName ||
 !username ||
 !phoneNumber ||
 !password
 ) {

 throw new Error(
 "Please fill in all fields."
 );

 }


 if (message) {

 message.textContent =
 "Creating your account...";

 }


 const data =
 await apiRequest(
 "/api/register",
 {

 method:
 "POST",

 body:
 JSON.stringify(
 {
 fullName,
 username,
 phoneNumber,
 password
 }
 )

 }
