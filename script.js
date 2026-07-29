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

    } catch (error) {

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


    let data = {};


    try {

        data =
            await response.json();

    } catch (error) {

        data = {};

    }


    if (!response.ok) {

        throw new Error(

            data.message ||
            `Request failed: ${response.status}`

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


            const button =
                registerForm.querySelector(
                    "button[type='submit']"
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


                localStorage.removeItem(
                    "kollinsToken"
                );


                localStorage.removeItem(
                    "kollinsUser"
                );


                message.textContent =
                    "Account created successfully!";


                setTimeout(
                    function() {

                        window.location.replace(
                            "login.html"
                        );

                    },
                    500
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
   CHAT PAGE
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


    const currentUser =
        getUser();


    if (!currentUser) {

        message.textContent =
            "Please log in again.";

        return;

    }


    addFriendSubmit.disabled =
        true;


    addFriendSubmit.textContent =
        "Finding...";


    message.textContent =
        "";


    try {

        /*
           FIND USER BY PHONE NUMBER
        */

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


        if (!user) {

            throw new Error(
                "User was not found."
            );

        }


        /*
           MAKE SURE THE USER HAS AN ID

           The backend may return either
           _id or id.
        */

        const userId =
            user._id ||
            user.id;


        if (!userId) {

            throw new Error(
                "User ID was not returned by the server."
            );

        }


        /*
           CREATE A STANDARD USER OBJECT

           This prevents ID mismatch problems.
        */

        const friend = {

            _id:
                userId,

            id:
                userId,

            fullName:
                user.fullName,

            username:
                user.username,

            phoneNumber:
                user.phoneNumber

        };


        /*
           SAVE FRIEND LOCALLY

           This allows the friend to appear
           immediately in the Chats list.
        */

        saveContact(
            friend
        );


        /*
           UPDATE CHAT LIST
        */

        await loadContacts();


        /*
           SHOW SUCCESS
        */

        message.textContent =
            "Friend found successfully!";


        phoneInput.value =
            "";


        /*
           CLOSE ADD FRIEND BOX
        */

        document.getElementById(
            "addFriendBox"
        ).style.display =
            "none";


        /*
           OPEN CHAT DIRECTLY
        */

        openChat(
            friend
        );


    } catch (error) {

        console.error(
            "Add friend error:",
            error
        );


        message.textContent =
            error.message ||
            "Something went wrong. Please try again.";

    }


    addFriendSubmit.disabled =
        false;


    addFriendSubmit.textContent =
        "Add";

}


/* ================================
   SAVE CONTACT LOCALLY
================================ */

function saveContact(
    friend
) {

    const savedContacts =
        localStorage.getItem(
            "kollinsContacts"
        );


    let contacts = [];


    try {

        contacts =
            savedContacts
                ? JSON.parse(
                    savedContacts
                )
                : [];

    } catch (error) {

        contacts = [];

    }


    const friendId =
        String(
            friend._id ||
            friend.id
        );


    const alreadyExists =
        contacts.some(
            function(contact) {

                return String(
                    contact._id ||
                    contact.id
                ) ===
                friendId;

            }
        );


    if (
        !alreadyExists
    ) {

        contacts.push(
            friend
        );

    }


    localStorage.setItem(

        "kollinsContacts",

        JSON.stringify(
            contacts
        )

    );

}


/* ================================
   GET SAVED CONTACTS
================================ */

function getSavedContacts() {

    const savedContacts =
        localStorage.getItem(
            "kollinsContacts"
        );


    if (!savedContacts) {

        return [];

    }


    try {

        return JSON.parse(
            savedContacts
        );

    } catch (error) {

        return [];

    }

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


    /*
       LOAD LOCAL CONTACTS FIRST

       This means the friend appears
       immediately after being added.
    */

    let contacts =
        getSavedContacts();


    /*
       TRY TO LOAD CONTACTS FROM SERVER

       If the backend supports the
       /api/contacts endpoint, use it.
    */

    try {

        const serverContacts =
            await apiRequest(
                "/api/contacts"
            );


        if (
            Array.isArray(
                serverContacts
            )
        ) {

            serverContacts.forEach(
                function(serverUser) {

                    const serverId =
                        String(
                            serverUser._id ||
                            serverUser.id
                        );


                    const exists =
                        contacts.some(
                            function(contact) {

                                return String(
                                    contact._id ||
                                    contact.id
                                ) ===
                                serverId;

                            }
                        );


                    if (
                        !exists
                    ) {

                        contacts.push({

                            _id:
                                serverUser._id ||
                                serverUser.id,

                            id:
                                serverUser._id ||
                                serverUser.id,

                            fullName:
                                serverUser.fullName,

                            username:
                                serverUser.username,

                            phoneNumber:
                                serverUser.phoneNumber

                        });

                    }

                }
            );

        }


        localStorage.setItem(

            "kollinsContacts",

            JSON.stringify(
                contacts
            )

        );


    } catch (error) {

        console.warn(
            "Could not load server contacts:",
            error.message
        );

    }


    list.innerHTML =
        "";


    if (
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
                        user.fullName ||
                        "User"
                    )}

                </strong>

                <span>

                    @${escapeHtml(
                        user.username ||
                        ""
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

}


/* ================================
   OPEN CHAT
================================ */

let currentChatUser =
    null;


function openChat(
    user
) {

    const userId =
        user._id ||
        user.id;


    if (!userId) {

        alert(
            "This user does not have a valid ID."
        );

        return;

    }


    currentChatUser = {

        _id:
            userId,

        id:
            userId,

        fullName:
            user.fullName,

        username:
            user.username,

        phoneNumber:
            user.phoneNumber

    };


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
            currentChatUser.fullName;

    }


    if (
        username
    ) {

        username.textContent =
            `@${currentChatUser.username}`;

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


    const userId =
        currentChatUser._id ||
        currentChatUser.id;


    try {

        const messages =
            await apiRequest(

                `/api/messages/${userId}`

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


                const senderId =
                    message.sender?._id ||
                    message.sender?.id ||
                    message.senderId;


                const currentUserId =
                    currentUser?._id ||
                    currentUser?.id;


                const mine =
                    String(
                        senderId
                    ) ===
                    String(
                        currentUserId
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

                alert(
                    "Please select a chat first."
                );

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


            const receiverId =
                currentChatUser._id ||
                currentChatUser.id;


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

                                receiverId,

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
