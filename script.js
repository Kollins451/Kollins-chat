const express = require("express");

const cors = require("cors");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const sqlite3 =
    require("sqlite3")
        .verbose();

require("dotenv").config();


const app =
    express();


const PORT =
    process.env.PORT ||
    10000;


const JWT_SECRET =
    process.env.JWT_SECRET ||
    "kollins-chat-secret";


app.use(
    cors({
        origin: [
            "https://kollins451.github.io"
        ]
    })
);


app.use(
    express.json()
);


const db =
    new sqlite3.Database(
        "./kollins-chat.db"
    );


db.serialize(
    function() {

        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fullName TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                phoneNumber TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);


        db.run(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                friendId INTEGER NOT NULL,
                UNIQUE(userId, friendId)
            )
        `);


        db.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                senderId INTEGER NOT NULL,
                receiverId INTEGER NOT NULL,
                message TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

    }
);


/* AUTH */

function authenticate(
    request,
    response,
    next
) {

    const header =
        request.headers.authorization;


    const token =
        header &&
        header.split(" ")[1];


    if (!token) {

        return response
            .status(401)
            .json({
                message:
                    "Please log in."
            });

    }


    try {

        const user =
            jwt.verify(
                token,
                JWT_SECRET
            );


        request.user =
            user;


        next();


    } catch {

        response
            .status(401)
            .json({
                message:
                    "Invalid login session."
            });

    }

}


/* HOME */

app.get(
    "/",
    function(
        request,
        response
    ) {

        response.json({
            message:
                "Kollins Chat backend is running."
        });

    }
);


/* REGISTER */

app.post(
    "/api/register",
    function(
        request,
        response
    ) {

        const {
            fullName,
            username,
            phoneNumber,
            password
        } =
            request.body;


        if (
            !fullName ||
            !username ||
            !phoneNumber ||
            !password
        ) {

            return response
                .status(400)
                .json({
                    message:
                        "Please fill in all fields."
                });

        }


        const cleanUsername =
            username
                .replace(
                    "@",
                    ""
                )
                .trim()
                .toLowerCase();


        const hashedPassword =
            bcrypt.hashSync(
                password,
                10
            );


        const query = `

            INSERT INTO users
            (
                fullName,
                username,
                phoneNumber,
                password
            )

            VALUES
            (?, ?, ?, ?)

        `;


        db.run(
            query,
            [
                fullName.trim(),
                cleanUsername,
                phoneNumber.trim(),
                hashedPassword
            ],
            function(error) {

                if (error) {

                    return response
                        .status(400)
                        .json({
                            message:
                                "Username or phone number already exists."
                        });

                }


                const token =
                    jwt.sign(
                        {
                            id:
                                this.lastID
                        },
                        JWT_SECRET,
                        {
                            expiresIn:
                                "7d"
                        }
                    );


                response
                    .status(201)
                    .json({

                        token,

                        user: {

                            _id:
                                this.lastID,

                            fullName:
                                fullName.trim(),

                            username:
                                cleanUsername,

                            phoneNumber:
                                phoneNumber.trim()

                        }

                    });

            }
        );

    }
);


/* LOGIN */

app.post(
    "/api/login",
    function(
        request,
        response
    ) {

        const {
            identifier,
            password
        } =
            request.body;


        db.get(
            `
            SELECT *
            FROM users
            WHERE username = ?
            OR phoneNumber = ?
            `,
            [
                identifier
                    .replace(
                        "@",
                        ""
                    )
                    .trim()
                    .toLowerCase(),

                identifier.trim()
            ],
            function(
                error,
                user
            ) {

                if (
                    error ||
                    !user
                ) {

                    return response
                        .status(401)
                        .json({
                            message:
                                "Invalid login details."
                        });

                }


                const valid =
                    bcrypt.compareSync(
                        password,
                        user.password
                    );


                if (!valid) {

                    return response
                        .status(401)
                        .json({
                            message:
                                "Invalid login details."
                        });

                }


                const token =
                    jwt.sign(
                        {
                            id:
                                user.id
                        },
                        JWT_SECRET,
                        {
                            expiresIn:
                                "7d"
                        }
                    );


                response.json({

                    token,

                    user: {

                        _id:
                            user.id,

                        fullName:
                            user.fullName,

                        username:
                            user.username,

                        phoneNumber:
                            user.phoneNumber

                    }

                });

            }
        );

    }
);


/* FIND FRIEND BY PHONE */

app.post(
    "/api/users/find",
    authenticate,
    function(
        request,
        response
    ) {

        const {
            phoneNumber
        } =
            request.body;


        db.get(
            `
            SELECT
                id,
                fullName,
                username,
                phoneNumber
            FROM users
            WHERE phoneNumber = ?
            `,
            [
                phoneNumber.trim()
            ],
            function(
                error,
                user
            ) {

                if (
                    error ||
                    !user
                ) {

                    return response
                        .status(404)
                        .json({
                            message:
                                "No registered user found with that phone number."
                        });

                }


                if (
                    user.id ===
                    request.user.id
                ) {

                    return response
                        .status(400)
                        .json({
                            message:
                                "You cannot add yourself."
                        });

                }


                db.run(
                    `
                    INSERT OR IGNORE INTO contacts
                    (
                        userId,
                        friendId
                    )
                    VALUES
                    (?, ?)
                    `,
                    [
                        request.user.id,
                        user.id
                    ]
                );


                db.run(
                    `
                    INSERT OR IGNORE INTO contacts
                    (
                        userId,
                        friendId
                    )
                    VALUES
                    (?, ?)
                    `,
                    [
                        user.id,
                        request.user.id
                    ]
                );


                response.json({

                    _id:
                        user.id,

                    fullName:
                        user.fullName,

                    username:
                        user.username,

                    phoneNumber:
                        user.phoneNumber

                });

            }
        );

    }
);


/* CONTACTS */

app.get(
    "/api/contacts",
    authenticate,
    function(
        request,
        response
    ) {

        db.all(
            `
            SELECT
                users.id AS _id,
                users.fullName,
                users.username,
                users.phoneNumber
            FROM contacts
            JOIN users
            ON users.id = contacts.friendId
            WHERE contacts.userId = ?
            `,
            [
                request.user.id
            ],
            function(
                error,
                users
            ) {

                if (error) {

                    return response
                        .status(500)
                        .json({
                            message:
                                "Unable to load contacts."
                        });

                }


                response.json(
                    users
                );

            }
        );

    }
);


/* SEND MESSAGE */

app.post(
    "/api/messages",
    authenticate,
    function(
        request,
        response
    ) {

        const {
            receiverId,
            message
        } =
            request.body;


        if (
            !receiverId ||
            !message
        ) {

            return response
                .status(400)
                .json({
                    message:
                        "Message cannot be empty."
                });

        }


        db.run(
            `
            INSERT INTO messages
            (
                senderId,
                receiverId,
                message
            )
            VALUES
            (?, ?, ?)
            `,
            [
                request.user.id,
                receiverId,
                message.trim()
            ],
            function(error) {

                if (error) {

                    return response
                        .status(500)
                        .json({
                            message:
                                "Unable to send message."
                        });

                }


                response.json({

                    message:
                        "Message sent.",

                    id:
                        this.lastID

                });

            }
        );

    }
);


/* GET MESSAGES */

app.get(
    "/api/messages/:userId",
    authenticate,
    function(
        request,
        response
    ) {

        const otherUser =
            request.params.userId;


        db.all(
            `
            SELECT
                id,
                senderId,
                receiverId,
                message,
                createdAt
            FROM messages

            WHERE
            (
                senderId = ?
                AND
                receiverId = ?
            )

            OR

            (
                senderId = ?
                AND
                receiverId = ?
            )

            ORDER BY
            createdAt ASC
            `,
            [
                request.user.id,
                otherUser,
                otherUser,
                request.user.id
            ],
            function(
                error,
                messages
            ) {

                if (error) {

                    return response
                        .status(500)
                        .json({
                            message:
                                "Unable to load messages."
                        });

                }


                response.json(
                    messages
                );

            }
        );

    }
);


/* START SERVER */

app.listen(
    PORT,
    function() {

        console.log(
            `Kollins Chat backend running on port ${PORT}`
        );

    }
);
