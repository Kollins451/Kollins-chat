// ==========================================
// BACKEND CONNECTION
// ==========================================

const API_URL =
    "https://kollins-chat-backend.onrender.com";


// ==========================================
// AUTHENTICATION HELPERS
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


// ==========================================
// API REQUEST FUNCTION
// ==========================================

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
// REGISTER
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
                        "password"
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


            try {

                if (
                    password !==
                    confirmPassword
                ) {

                    throw new Error(
                        "Passwords do not match."
                    );

                }


                message.textContent =
                    "Creating your account...";


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
                    );


                saveLoginData(
                    data
                );


                message.textContent =
                    "Account created successfully!";


                setTimeout(
                    function() {

                        window.location.href =
                            "chat.html";

                    },
                    1000
                );


            } catch (error) {

                message.textContent =
                    error.message;

            }

        }
    );

}


// ==========================================
// LOGIN
// ==========================================

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
                        "identifier"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "password"
                    )
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            try {

                message.textContent =
                    "Logging in...";


                const data =
                    await apiRequest(
                        "/api/login",
                        {

                            method:
                                "POST",

                            body:
                                JSON.stringify(
                                    {
                                        identifier,
                                        password
                                    }
                                )

                        }
                    );


                saveLoginData(
                    data
                );


                message.textContent =
                    "Login successful!";


                setTimeout(
                    function() {

                        window.location.href =
                            "chat.html";

                    },
                    700
                );


            } catch (error) {

                message.textContent =
                    error.message;

            }

        }
    );

}


// ==========================================
// CHAT VARIABLES
// ==========================================

let selectedUser =
    null;


// ==========================================
// CHAT PAGE
// ==========================================

const chatPage =
    document.querySelector(
        ".chat-page"
    );


if (chatPage) {

    const currentUser =
        getCurrentUser();


    if (!getToken() || !currentUser) {

        window.location.href =
            "login.html";

    }


    const myUsername =
        document.getElementById(
            "myUsername"
        );


    if (myUsername) {

        myUsername.textContent =
            `@${currentUser.username}`;

    }


    loadChatPage();

}


// ==========================================
// LOAD CHAT PAGE
// ==========================================

function loadChatPage() {

    const searchButton =
        document.getElementById(
            "searchUsersBtn"
        );


    const searchInput =
        document.getElementById(
            "userSearchInput"
        );


    const messageForm =
        document.getElementById(
            "messageForm"
        );


    const logoutButton =
        document.getElementById(
            "logoutBtn"
        );


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            searchForUsers
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    searchForUsers();

                }

            }
        );

    }


    if (messageForm) {

        messageForm.addEventListener(
            "submit",
            sendChatMessage
        );

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutUser
        );

    }

}


// ==========================================
// SEARCH USERS
// ==========================================

async function searchForUsers() {

    const searchInput =
        document.getElementById(
            "userSearchInput"
        );


    const resultsContainer =
        document.getElementById(
            "searchResults"
        );


    const query =
        searchInput.value.trim();


    if (!query) {

        resultsContainer.innerHTML =
            "<p>Enter a name or username.</p>";

        return;

    }


    resultsContainer.innerHTML =
        "<p>Searching...</p>";


    try {

        const users =
            await apiRequest(
                `/api/users/search?q=${encodeURIComponent(query)}`
            );


        if (
            !users ||
            users.length === 0
        ) {

            resultsContainer.innerHTML =
                "<p>No users found.</p>";

            return;

        }


        resultsContainer.innerHTML =
            "";


        users.forEach(
            function(user) {

                const userButton =
                    document.createElement(
                        "button"
                    );


                userButton.className =
                    "user-result";


                userButton.innerHTML =

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


                userButton.addEventListener(
                    "click",
                    function() {

                        openConversation(
                            user
                        );

                    }
                );


                resultsContainer.appendChild(
                    userButton
                );

            }
        );


    } catch (error) {

        resultsContainer.innerHTML =
            `<p>${escapeHtml(
                error.message
            )}</p>`;

    }

}


// ==========================================
// OPEN CONVERSATION
// ==========================================

function openConversation(
    user
) {

    selectedUser =
        user;


    const emptyChat =
        document.getElementById(
            "emptyChat"
        );


    const activeChat =
        document.getElementById(
            "activeChat"
        );


    const chatUserName =
        document.getElementById(
            "chatUserName"
        );


    const chatUserUsername =
        document.getElementById(
            "chatUserUsername"
        );


    if (emptyChat) {

        emptyChat.style.display =
            "none";

    }


    if (activeChat) {

        activeChat.style.display =
            "flex";

    }


    if (chatUserName) {

        chatUserName.textContent =
            user.fullName;

    }


    if (chatUserUsername) {

        chatUserUsername.textContent =
            `@${user.username}`;

    }


    loadMessages();

}


// ==========================================
// LOAD MESSAGES
// ==========================================

async function loadMessages() {

    if (!selectedUser) {

        return;

    }


    const messagesContainer =
        document.getElementById(
            "messagesContainer"
        );


    messagesContainer.innerHTML =
        "<p>Loading messages...</p>";


    try {

        const messages =
            await apiRequest(
                `/api/messages/${selectedUser._id}`
            );


        messagesContainer.innerHTML =
            "";


        if (
            !messages ||
            messages.length === 0
        ) {

            messagesContainer.innerHTML =
                "<p class=\"no-messages\">No messages yet. Start the conversation!</p>";

            return;

        }


        const currentUser =
            getCurrentUser();


        messages.forEach(
            function(message) {

                const messageElement =
                    document.createElement(
                        "div"
                    );


                const isMine =
                    message.sender._id ===
                    currentUser.id;


                messageElement.className =
                    isMine
                        ? "message sent"
                        : "message received";


                messageElement.innerHTML =

                    `<div class="message-bubble">

                        <p>
                            ${escapeHtml(
                                message.message
                            )}
                        </p>

                        <small>
                            ${formatTime(
                                message.createdAt
                            )}
                        </small>

                    </div>`;


                messagesContainer.appendChild(
                    messageElement
                );

            }
        );


        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;


    } catch (error) {

        messagesContainer.innerHTML =
            `<p>${escapeHtml(
                error.message
            )}</p>`;

    }

}


// ==========================================
// SEND MESSAGE
// ==========================================

async function sendChatMessage(
    event
) {

    event.preventDefault();


    if (!selectedUser) {

        alert(
            "Select a user first."
        );

        return;

    }


    const messageInput =
        document.getElementById(
            "messageInput"
        );


    const message =
        messageInput.value.trim();


    if (!message) {

        return;

    }


    try {

        messageInput.disabled =
            true;


        await apiRequest(
            "/api/messages",
            {

                method:
                    "POST",

                body:
                    JSON.stringify(
                        {
                            receiverId:
                                selectedUser._id,

                            message:
                                message
                        }
                    )

            }
        );


        messageInput.value =
            "";


        await loadMessages();


    } catch (error) {

        alert(
            error.message
        );


    } finally {

        messageInput.disabled =
            false;


        messageInput.focus();

    }

}


// ==========================================
// LOGOUT
// ==========================================

function logoutUser() {

    localStorage.removeItem(
        "kollinsToken"
    );


    localStorage.removeItem(
        "kollinsUser"
    );


    window.location.href =
        "login.html";

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(
    dateString
) {

    const date =
        new Date(
            dateString
        );


    return date.toLocaleTimeString(
        [],
        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


// ==========================================
// SECURITY
// ==========================================

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
