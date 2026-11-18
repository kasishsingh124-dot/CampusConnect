
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Club = require("./models/Club");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
const RecruitmentApplication = require("./models/RecruitmentApplication");
const Admin = require("./models/Admin");

const app = express();
const PORT = 5000;


// ==================================================
// MONGODB CONNECTION
// ==================================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB connected successfully");
        console.log(
            "Database name:",
            mongoose.connection.name
        );

    })
    .catch(error => {

        console.error(
            "MongoDB connection failed:",
            error
        );

    });


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());

app.use(express.json());


// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {

    res.send("CampusConnect Backend is Running!");

});


// ==================================================
// ADMIN AUTHENTICATION
// ==================================================

function authenticateAdmin(req, res, next) {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            message: "Admin authentication required."
        });

    }

    const parts =
        authHeader.split(" ");

    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {

        return res.status(401).json({
            message: "Invalid authorization format."
        });

    }

    const token = parts[1];

    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        req.admin = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired admin token."
        });

    }

}


// ==================================================
// ADMIN CREATE
// ==================================================

app.post("/api/admin/create", async (req, res) => {

    try {

        const email =
            "admin@campusconnect.com";

        const existingAdmin =
            await Admin.findOne({
                email: email
            });

        if (existingAdmin) {

            return res.json({
                message: "Admin already exists."
            });

        }

        const hashedPassword =
            await bcrypt.hash(
                "Admin@12345",
                10
            );

        await Admin.create({

            name: "CampusConnect Admin",

            email: email,

            password: hashedPassword

        });

        res.status(201).json({
            message: "Admin created successfully."
        });

    } catch (error) {

        console.error(
            "Admin creation error:",
            error
        );

        res.status(500).json({
            message: "Failed to create admin."
        });

    }

});


// ==================================================
// ADMIN LOGIN
// ==================================================

app.post("/api/admin/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required."
            });

        }

        const admin =
            await Admin.findOne({
                email: email
            });

        if (!admin) {

            return res.status(401).json({
                message:
                    "Invalid email or password."
            });

        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                admin.password
            );

        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password."
            });

        }

        const token =
            jwt.sign(

                {
                    adminId:
                        admin._id.toString(),

                    email:
                        admin.email,

                    name:
                        admin.name

                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "2h"
                }

            );

        res.json({

            message:
                "Login successful.",

            token:
                token

        });

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        res.status(500).json({
            message: "Login failed."
        });

    }

});


// ==================================================
// VERIFY ADMIN
// ==================================================

app.get(
    "/api/admin/verify",
    authenticateAdmin,
    (req, res) => {

        res.json({

            authenticated: true,

            admin: req.admin

        });

    }
);


// ==================================================
// CLUBS
// ==================================================


// --------------------------------------------------
// SEED CLUBS
// --------------------------------------------------

app.post("/api/clubs/seed", async (req, res) => {

    try {

        const existingClubs =
            await Club.countDocuments();

        if (existingClubs > 0) {

            return res.json({
                message:
                    "Clubs already exist in database."
            });

        }

        const clubsToInsert = [

            {
                name: "Coding Club",

                category: "Technical",

                description:
                    "A club for programming, development and technology enthusiasts.",

                members: 45,

                recruitmentOpen: true,

                recruitmentDeadline:
                    "2026-11-25"

            },

            {
                name: "Photography Club",

                category: "Media",

                description:
                    "A community for photography and visual storytelling.",

                members: 32,

                recruitmentOpen: true,

                recruitmentDeadline:
                    "2026-11-22"

            },

            {
                name: "Cultural Club",

                category: "Cultural",

                description:
                    "A club for music, dance, drama and cultural activities.",

                members: 50,

                recruitmentOpen: false,

                recruitmentDeadline: ""

            }

        ];

        await Club.insertMany(
            clubsToInsert
        );

        res.status(201).json({

            message:
                "Clubs added to MongoDB successfully."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to add clubs.",

            error:
                error.message

        });

    }

});


// --------------------------------------------------
// GET ALL CLUBS
// --------------------------------------------------

app.get("/api/clubs", async (req, res) => {

    try {

        const clubs =
            await Club.find();

        res.json(clubs);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to fetch clubs.",

            error:
                error.message

        });

    }

});


// --------------------------------------------------
// GET ONE CLUB
// --------------------------------------------------

app.get("/api/clubs/:id", async (req, res) => {

    try {

        const club =
            await Club.findById(
                req.params.id
            );

        if (!club) {

            return res.status(404).json({

                message:
                    "Club not found."

            });

        }

        res.json(club);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to fetch club.",

            error:
                error.message

        });

    }

});


// ==================================================
// ADMIN CLUB MANAGEMENT
// ==================================================


// --------------------------------------------------
// CREATE CLUB
// --------------------------------------------------

app.post(
    "/api/admin/clubs",
    authenticateAdmin,
    async (req, res) => {

        try {

            const {
                name,
                category,
                description,
                members,
                recruitmentOpen,
                recruitmentDeadline
            } = req.body;

            if (
                !name ||
                !category ||
                !description
            ) {

                return res.status(400).json({

                    message:
                        "Name, category and description are required."

                });

            }

            const club =
                await Club.create({

                    name: name,

                    category: category,

                    description: description,

                    members:
                        Number(members) || 0,

                    recruitmentOpen:
                        recruitmentOpen === true,

                    recruitmentDeadline:
                        recruitmentDeadline || ""

                });

            res.status(201).json({

                message:
                    "Club created successfully.",

                club: club

            });

        } catch (error) {

            console.error(
                "CREATE CLUB ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to create club.",

                error:
                    error.message

            });

        }

    }
);


// --------------------------------------------------
// UPDATE CLUB
// --------------------------------------------------

app.put(
    "/api/admin/clubs/:id",
    authenticateAdmin,
    async (req, res) => {

        try {

            const {
                name,
                category,
                description,
                members,
                recruitmentOpen,
                recruitmentDeadline
            } = req.body;


            if (
                !name ||
                !category ||
                !description
            ) {

                return res.status(400).json({

                    message:
                        "Name, category and description are required."

                });

            }


            const club =
                await Club.findByIdAndUpdate(

                    req.params.id,

                    {
                        name:
                            name,

                        category:
                            category,

                        description:
                            description,

                        members:
                            Number(members) || 0,

                        recruitmentOpen:
                            recruitmentOpen === true,

                        recruitmentDeadline:
                            recruitmentDeadline || ""

                    },

                    {
                        new: true,

                        runValidators: true

                    }

                );


            if (!club) {

                return res.status(404).json({

                    message:
                        "Club not found."

                });

            }


            res.status(200).json({

                message:
                    "Club updated successfully.",

                club:
                    club

            });

        } catch (error) {

            console.error(
                "UPDATE CLUB ERROR:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to update club.",

                error:
                    error.message

            });

        }

    }
);


// --------------------------------------------------
// DELETE CLUB
// --------------------------------------------------

app.delete(
    "/api/admin/clubs/:id",
    authenticateAdmin,
    async (req, res) => {

        try {

            const club =
                await Club.findByIdAndDelete(
                    req.params.id
                );

            if (!club) {

                return res.status(404).json({

                    message:
                        "Club not found."

                });

            }

            res.json({

                message:
                    "Club deleted successfully."

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to delete club.",

                error:
                    error.message

            });

        }

    }
);


// --------------------------------------------------
// RECRUITMENT SETUP
// --------------------------------------------------

app.put(
    "/api/clubs/recruitment/setup",
    authenticateAdmin,
    async (req, res) => {

        try {

            await Club.updateOne(

                {
                    name:
                        "Coding Club"
                },

                {
                    recruitmentOpen:
                        true,

                    recruitmentDeadline:
                        "2026-11-25"
                }

            );

            await Club.updateOne(

                {
                    name:
                        "Photography Club"
                },

                {
                    recruitmentOpen:
                        true,

                    recruitmentDeadline:
                        "2026-11-22"
                }

            );

            await Club.updateOne(

                {
                    name:
                        "Cultural Club"
                },

                {
                    recruitmentOpen:
                        false,

                    recruitmentDeadline:
                        ""
                }

            );

            res.json({

                message:
                    "Recruitment information updated."

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to update recruitment."

            });

        }

    }
);


// ==================================================
// EVENTS
// ==================================================


// --------------------------------------------------
// SEED EVENTS
// --------------------------------------------------

app.post("/api/events/seed", async (req, res) => {

    try {

        const existingEvents =
            await Event.countDocuments();

        if (existingEvents > 0) {

            return res.json({

                message:
                    "Events already exist in database."

            });

        }

        const eventsToInsert = [

            {
                title:
                    "Hackathon 2026",

                club:
                    "Coding Club",

                category:
                    "Technical",

                description:
                    "A 24-hour coding competition where students build innovative projects.",

                date:
                    "2026-11-20",

                time:
                    "10:00 AM",

                venue:
                    "Main Auditorium",

                registrationDeadline:
                    "2026-11-18",

                seats:
                    100

            },

            {
                title:
                    "Photography Walk",

                club:
                    "Photography Club",

                category:
                    "Media",

                description:
                    "Explore the campus and capture creative photographs.",

                date:
                    "2026-11-25",

                time:
                    "4:00 PM",

                venue:
                    "College Campus",

                registrationDeadline:
                    "2026-11-24",

                seats:
                    30

            },

            {
                title:
                    "Open Mic Night",

                club:
                    "Cultural Club",

                category:
                    "Cultural",

                description:
                    "An evening of music, poetry, comedy and student performances.",

                date:
                    "2026-11-28",

                time:
                    "6:00 PM",

                venue:
                    "Seminar Hall",

                registrationDeadline:
                    "2026-11-27",

                seats:
                    150

            }

        ];

        await Event.insertMany(
            eventsToInsert
        );

        res.status(201).json({

            message:
                "Events added to MongoDB successfully."

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to add events.",

            error:
                error.message

        });

    }

});


// --------------------------------------------------
// GET ALL EVENTS
// --------------------------------------------------

app.get("/api/events", async (req, res) => {

    try {

        const events =
            await Event.find();

        res.json(events);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to fetch events.",

            error:
                error.message

        });

    }

});


// --------------------------------------------------
// GET ONE EVENT
// --------------------------------------------------

app.get("/api/events/:id", async (req, res) => {

    try {

        const event =
            await Event.findById(
                req.params.id
            );

        if (!event) {

            return res.status(404).json({

                message:
                    "Event not found."

            });

        }

        res.json(event);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to fetch event.",

            error:
                error.message

        });

    }

});


// ==================================================
// ADMIN EVENT MANAGEMENT
// ==================================================


// --------------------------------------------------
// CREATE EVENT
// --------------------------------------------------

app.post(
    "/api/admin/events",
    authenticateAdmin,
    async (req, res) => {

        try {

            const {
                title,
                club,
                category,
                description,
                date,
                time,
                venue,
                registrationDeadline,
                seats
            } = req.body;

            if (
                !title ||
                !club ||
                !category ||
                !description ||
                !date ||
                !time ||
                !venue
            ) {

                return res.status(400).json({

                    message:
                        "Please provide all required event details."

                });

            }

            const event =
                await Event.create({

                    title:
                        title,

                    club:
                        club,

                    category:
                        category,

                    description:
                        description,

                    date:
                        date,

                    time:
                        time,

                    venue:
                        venue,

                    registrationDeadline:
                        registrationDeadline || "",

                    seats:
                        Number(seats) || 0

                });

            res.status(201).json({

                message:
                    "Event created successfully.",

                event:
                    event

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to create event.",

                error:
                    error.message

            });

        }

    }
);


// --------------------------------------------------
// UPDATE EVENT
// --------------------------------------------------

app.put(
    "/api/admin/events/:id",
    authenticateAdmin,
    async (req, res) => {

        try {

            const event =
                await Event.findByIdAndUpdate(

                    req.params.id,

                    req.body,

                    {
                        new: true,

                        runValidators: true

                    }

                );

            if (!event) {

                return res.status(404).json({

                    message:
                        "Event not found."

                });

            }

            res.json({

                message:
                    "Event updated successfully.",

                event:
                    event

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to update event.",

                error:
                    error.message

            });

        }

    }
);


// --------------------------------------------------
// DELETE EVENT
// --------------------------------------------------

app.delete(
    "/api/admin/events/:id",
    authenticateAdmin,
    async (req, res) => {

        try {

            const event =
                await Event.findByIdAndDelete(
                    req.params.id
                );

            if (!event) {

                return res.status(404).json({

                    message:
                        "Event not found."

                });

            }

            res.json({

                message:
                    "Event deleted successfully."

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to delete event.",

                error:
                    error.message

            });

        }

    }
);


// ==================================================
// EVENT REGISTRATION
// ==================================================

app.post(
    "/api/events/:id/register",
    async (req, res) => {

        try {

            const event =
                await Event.findById(
                    req.params.id
                );

            if (!event) {

                return res.status(404).json({

                    message:
                        "Event not found."

                });

            }

            const {
                name,
                email,
                course,
                year,
                phone
            } = req.body;

            if (
                !name ||
                !email ||
                !course ||
                !year ||
                !phone
            ) {

                return res.status(400).json({

                    message:
                        "Please provide all registration details."

                });

            }

            const existingRegistration =
                await Registration.findOne({

                    eventId:
                        event._id,

                    email:
                        email

                });

            if (existingRegistration) {

                return res.status(400).json({

                    message:
                        "You are already registered for this event."

                });

            }

            const registration =
                await Registration.create({

                    eventId:
                        event._id,

                    eventName:
                        event.title,

                    name:
                        name,

                    email:
                        email,

                    course:
                        course,

                    year:
                        year,

                    phone:
                        phone

                });

            res.status(201).json({

                message:
                    "Event registration successful!",

                registrationId:
                    registration._id

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Registration failed.",

                error:
                    error.message

            });

        }

    }
);


// ==================================================
// RECRUITMENT APPLICATION
// ==================================================


// --------------------------------------------------
// SUBMIT APPLICATION
// --------------------------------------------------

app.post(
    "/api/clubs/:id/apply",
    async (req, res) => {

        try {

            const club =
                await Club.findById(
                    req.params.id
                );

            if (!club) {

                return res.status(404).json({

                    message:
                        "Club not found."

                });

            }

            if (!club.recruitmentOpen) {

                return res.status(400).json({

                    message:
                        "Recruitment is currently closed."

                });

            }

            const {
                name,
                email,
                course,
                year,
                skills,
                reason
            } = req.body;

            if (
                !name ||
                !email ||
                !course ||
                !year ||
                !skills ||
                !reason
            ) {

                return res.status(400).json({

                    message:
                        "Please provide all application details."

                });

            }

            const existingApplication =
                await RecruitmentApplication.findOne({

                    clubId:
                        club._id,

                    email:
                        email

                });

            if (existingApplication) {

                return res.status(400).json({

                    message:
                        "You have already applied to this club."

                });

            }

            const application =
                await RecruitmentApplication.create({

                    clubId:
                        club._id,

                    clubName:
                        club.name,

                    name:
                        name,

                    email:
                        email,

                    course:
                        course,

                    year:
                        year,

                    skills:
                        skills,

                    reason:
                        reason

                });

            res.status(201).json({

                message:
                    "Recruitment application submitted successfully!",

                applicationId:
                    application._id

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to submit recruitment application.",

                error:
                    error.message

            });

        }

    }
);


// --------------------------------------------------
// GET APPLICATIONS - ADMIN ONLY
// --------------------------------------------------

app.get(
    "/api/recruitment/applications",
    authenticateAdmin,
    async (req, res) => {

        try {

            const applications =
                await RecruitmentApplication
                    .find()
                    .sort({
                        createdAt:
                            -1
                    });

            res.json(
                applications
            );

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to fetch recruitment applications.",

                error:
                    error.message

            });

        }

    }
);


// --------------------------------------------------
// ACCEPT / REJECT APPLICATION
// --------------------------------------------------

app.put(
    "/api/recruitment/applications/:id",
    authenticateAdmin,
    async (req, res) => {

        try {

            const {
                status
            } = req.body;

            if (
                status !== "Accepted" &&
                status !== "Rejected"
            ) {

                return res.status(400).json({

                    message:
                        "Status must be Accepted or Rejected."

                });

            }

            const application =
                await RecruitmentApplication
                    .findByIdAndUpdate(

                        req.params.id,

                        {
                            status:
                                status
                        },

                        {
                            new:
                                true
                        }

                    );

            if (!application) {

                return res.status(404).json({

                    message:
                        "Application not found."

                });

            }

            res.json({

                message:
                    `Application ${status.toLowerCase()} successfully.`,

                application:
                    application

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to update application.",

                error:
                    error.message

            });

        }

    }
);


// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});
