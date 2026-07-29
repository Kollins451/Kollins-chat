const API_URL =
    "https://kollins-chat-backend.onrender.com";


/* ================================
   STORAGE
================================ */


function getToken() {

    return localStorage.getItem(
        "kollinsToken"
    );

}


function getUser() {

    const savedUser =
        localStorage.getItem(
            "kollinsUser"
        );


    if (!savedUser) {

        return null;

    }


    try {

        return JSON.parse(
            savedUser
        );

    } catch {

        return null;

    }

}


/* ================================
   API REQUEST
================================ */


async function apiRequest(
    endpoint,
    options = {}
) {

    const headers = {

        "Content-Type":
            "application/json"

    };


    const token =
        getToken();


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );


    let data;


    try {

        data =
            await response.json();

    } catch {

        data = {};

    }


    if (!response.ok) {

        throw new Error(

            data.message ||
            "Something went wrong. Please try again."

        );

    }


    return data;

}


/* ================================
   REGISTER
================================ */


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
                    .value
                    .trim();


            const username =
                document
                    .getElementById(
                        "username"
                    )
                    .value
                    .trim();


            const phoneNumber =
                document
                    .getElementById(
                        "phoneNumber"
                    )
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


            const button =
                registerForm.querySelector(
                    "button[type='submit']"
                );


            button.disabled =
                true;


            button.textContent =
                "Creating Account...";


            message.textContent =
                "";


            try {

                const data =
                    await apiRequest(
                        "/api/register",
                        {

                            method:
                                "POST",

                            body:
                                JSON.stringify({

                                    fullName,

                                    username,

                                    phoneNumber,

                                    password

                                })

                        }
                    );


                /*
                   SAVE LOGIN INFORMATION
                */


                if (
                    data.token
                ) {

                    localStorage.setItem(
                        "kollinsToken",
                        data.token
                    );

                }


                if (
                    data.user
                ) {

                    localStorage.setItem(

                        "kollinsUser",

                        JSON.stringify(
                            data.user
                        )

                    );

                }


                /*
                   ACCOUNT CREATED
                   GO DIRECTLY TO CHAT
                */


                message.textContent =
                    "Account created successfully!";


                window.location.replace(
                    "chat.html"
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                message.textContent =
                    error.message;


                button.disabled =
                    false;


                button.textContent =
                    "Create Account";

            }

        }
    );

}


/* ================================
   LOGIN
================================ */


const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const identifier =
                document
                    .getElementById(
                        "loginIdentifier"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            const button =
                loginForm.querySelector(
                    "button[type='submit']"
                );


            button.disabled =
                true;


            button.textContent =
                "Logging In...";


            message.textContent =
                "";


            try {

                const data =
                    await apiRequest(
                        "/api/login",
                        {

                            method:
                                "POST",

                            body:
                                JSON.stringify({

                                    identifier,

                                    password

                                })

                        }
                    );


                /*
                   SAVE LOGIN INFORMATION
                */


                if (
                    data.token
                ) {

                    localStorage.setItem(
                        "kollinsToken",
                        data.token
                    );

                }


                if (
                    data.user
                ) {

                    localStorage.setItem(

                        "kollinsUser",

                        JSON.stringify(
                            data.user
                        )

                    );

                }


                /*
                   GO DIRECTLY TO CHAT
                */


                window.location.replace(
                    "chat.html"
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                message.textContent =
                    error.message;


                button.disabled =
                    false;


                button.textContent =
                    "Log In";

            }

        }
    );

}


/* ================================
   CHAT PAGE PROTECTION
================================ */


const chatPage =
    document.querySelector(
        ".chat-page"
    );


if (chatPage) {

    const token =
        getToken();


    const user =
        getUser();


    if (
        !token ||
        !user
    ) {

        window.location.replace(
            "login.html"
        );

    } else {

        const usernameElement =
            document.getElementById(
                "myUsername"
            );


        if (
            usernameElement
        ) {

            usernameElement.textContent =
                `@${user.username}`;

        }


        loadContacts();

    }

}


/* ================================
   ADD FRIEND BUTTON
================================ */


const addFriendBtn =
    document.getElementById(
        "addFriendBtn"
    );


if (addFriendBtn) {

    addFriendBtn.addEventListener(
        "click",
        function() {

            const box =
                document.getElementById(
                    "addFriendBox"
                );


            if (
                box.style.display ===
                "none" ||
                box.style.display ===
                ""
            ) {

                box.style.display =
                    "block";

            } else {

                box.style.display =
                    "none";

            }

        }
    );

}


/* ================================
   ADD FRIEND
================================ */


const addFriendSubmit =
    document.getElementById(
        "addFriendSubmit"
    );


if (addFriendSubmit) {

    addFriendSubmit.addEventListener(
        "click",
        addFriend
    );

}


async function addFriend() {

    const phoneInput =
        document.getElementById(
            "friendPhone"
        );


    const message =
        document.getElementById(
            "addFriendMessage"
        );


    const phone =
        phoneInput.value.trim();


    if (!phone) {

        message.textContent =
            "Enter your friend's phone number.";

        return;

    }


    addFriendSubmit.disabled =
        true;


    addFriendSubmit.textContent =
        "Searching...";


    message.textContent =
        "";


    try {

        const user =
            await apiRequest(
                "/api/users/find",
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            phoneNumber:
                                phone

                        })

                }
            );


        message.textContent =
            "Friend added successfully!";


        phoneInput.value =
            "";


        await loadContacts();


        setTimeout(
            function() {

                message.textContent =
                    "";

            },
            2000
        );


        openChat(
            user
        );


    } catch (error) {

        console.error(
            "Add friend error:",
            error
        );


        message.textContent =
            error.message;

    }


    addFriendSubmit.disabled =
        false;


    addFriendSubmit.textContent =
        "Add";

}


/* ================================
   LOAD CONTACTS
================================ */


async function loadContacts() {

    const list =
        document.getElementById(
            "contactsList"
        );


    if (!list) {

        return;

    }


    try {

        const contacts =
            await apiRequest(
                "/api/contacts"
            );


        list.innerHTML =
            "";


        if (
            !contacts ||
            contacts.length ===
            0
        ) {

            list.innerHTML =

                `<p class="empty-contacts">

                    No chats yet.
                    Tap + to add a friend.

                </p>`;

            return;

        }


        contacts.forEach(
            function(user) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.className =
                    "contact-item";


                button.innerHTML =

                    `<strong>

                        ${escapeHtml(
                            user.fullName
                        )}

                    </strong>

                    <span>

                        @${escapeHtml(
                            user.username
                        )}

                    </span>`;


                button.addEventListener(
                    "click",
                    function() {

                        openChat(
                            user
                        );

                    }
                );


                list.appendChild(
                    button
                );

            }
        );


    } catch (error) {

        console.error(
            "Contacts error:",
            error
        );

    }

}


/* ================================
   OPEN CHAT
================================ */


let currentChatUser =
    null;


function openChat(
    user
) {

    currentChatUser =
        user;


    const emptyChat =
        document.getElementById(
            "emptyChat"
        );


    const activeChat =
        document.getElementById(
            "activeChat"
        );


    if (
        emptyChat
    ) {

        emptyChat.style.display =
            "none";

    }


    if (
        activeChat
    ) {

        activeChat.style.display =
            "flex";

    }


    const name =
        document.getElementById(
            "chatUserName"
        );


    const username =
        document.getElementById(
            "chatUserUsername"
        );


    if (
        name
    ) {

        name.textContent =
            user.fullName;

    }


    if (
        username
    ) {

        username.textContent =
            `@${user.username}`;

    }


    loadMessages();

}


/* ================================
   LOAD MESSAGES
================================ */


async function loadMessages() {

    if (
        !currentChatUser
    ) {

        return;

    }


    const container =
        document.getElementById(
            "messagesContainer"
        );


    if (!container) {

        return;

    }


    try {

        const messages =
            await apiRequest(

                `/api/messages/${currentChatUser._id}`

            );


        container.innerHTML =
            "";


        const currentUser =
            getUser();


        messages.forEach(
            function(message) {

                const div =
                    document.createElement(
                        "div"
                    );


                const mine =
                    String(
                        message.senderId
                    ) ===
                    String(
                        currentUser._id
                    );


                div.className =
                    mine
                        ? "message sent"
                        : "message received";


                div.innerHTML =

                    `<div class="message-bubble">

                        ${escapeHtml(
                            message.message
                        )}

                        <small>

                            ${new Date(
                                message.createdAt
                            ).toLocaleTimeString()}

                        </small>

                    </div>`;


                container.appendChild(
                    div
                );

            }
        );


        container.scrollTop =
            container.scrollHeight;


    } catch (error) {

        console.error(
            "Messages error:",
            error
        );

    }

}


/* ================================
   SEND MESSAGE
================================ */


const messageForm =
    document.getElementById(
        "messageForm"
    );


if (messageForm) {

    messageForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (
                !currentChatUser
            ) {

                return;

            }


            const input =
                document.getElementById(
                    "messageInput"
                );


            const message =
                input.value.trim();


            if (!message) {

                return;

            }


            const button =
                messageForm.querySelector(
                    "button[type='submit']"
                );


            button.disabled =
                true;


            try {

                await apiRequest(
                    "/api/messages",
                    {

                        method:
                            "POST",

                        body:
                            JSON.stringify({

                                receiverId:
                                    currentChatUser._id,

                                message:
                                    message

                            })

                    }
                );


                input.value =
                    "";


                await loadMessages();


            } catch (error) {

                console.error(
                    "Send message error:",
                    error
                );


                alert(
                    error.message
                );

            }


            button.disabled =
                false;

        }
    );

}


/* ================================
   LOGOUT
================================ */


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "kollinsToken"
            );


            localStorage.removeItem(
                "kollinsUser"
            );


            window.location.replace(
                "login.html"
            );

        }
    );

}


/* ================================
   SECURITY
================================ */


function escapeHtml(
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
