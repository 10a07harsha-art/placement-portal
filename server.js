require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const Job = require("./models/Job");
const User = require("./models/User");
const Application = require("./models/Application");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect("mongodb+srv://admin:admin123@cluster0.yjatrvj.mongodb.net/placementDB")
.then(() => console.log("MongoDB Atlas Connected"))
.catch(err => console.log(err));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) return res.status(403).json({ message: "Token required" });

    try {
        const decoded = jwt.verify(token, "secretkey");
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.get("/seed-jobs", async (req, res) => {
    await Job.deleteMany();

    await Job.insertMany([
        {
            title: "Frontend Developer",
            company: "Google",
            location: "Bangalore",
            description: "Build UI using React"
        },
        {
            title: "Backend Developer",
            company: "Amazon",
            location: "Hyderabad",
            description: "Develop APIs using Node.js"
        },
        {
            title: "Full Stack Engineer",
            company: "Microsoft",
            location: "Pune",
            description: "Full stack development"
        }
    ]);

    res.send("Jobs Added");
});

app.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const fullName = `${firstName} ${lastName}`.toUpperCase();

        const user = new User({
            name: fullName,
            email,
            password: hashedPassword,
            phone,
            role: "student"
        });

        await user.save();

        res.json({ message: "Signup successful" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.json({ message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.json({ message: "Wrong password" });

        const token = jwt.sign(
            { userId: user._id, name: user.name, role: user.role },
            "secretkey",
            { expiresIn: "1h" }
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/jobs", async (req, res) => {
    const jobs = await Job.find();
    res.json(jobs);
});

app.post("/apply-job", verifyToken, upload.single("resume"), async (req, res) => {
    try {
        const { jobId } = req.body;

        const exists = await Application.findOne({
            userId: req.user.userId,
            jobId
        });

        if (exists) return res.json({ message: "Already applied" });

        const appData = new Application({
            userId: req.user.userId,
            jobId,
            resume: req.file ? req.file.filename : "",
            status: "Pending"
        });

        await appData.save();

        res.json({ message: "Applied successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/my-applications", verifyToken, async (req, res) => {
    const apps = await Application.find({ userId: req.user.userId })
        .populate("jobId");

    res.json(apps);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});