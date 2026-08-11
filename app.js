if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const ejsMate = require('ejs-mate');
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Models
const Review = require("./models/review");
const Listing = require("./models/listing");
const User = require("./models/user");
// Utilities & Error Handling
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

// Route Handlers
const reviews = require("./routes/review.js");
const listings = require("./routes/listing.js");
const user = require("./routes/user.js");
const verifications = require("./routes/verification.js");
const bookings = require("./routes/booking.js");
const chats = require("./routes/chat.js");
const app = express();

const dns = require("dns");
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

/* ================= DATABASE CONNECTION ================= */
const dbUrl = process.env.ATLAS_URL || process.env.MONGO_URL || "mongodb://127.0.0.1:27017/UniRooms";
const localDbUrl = "mongodb://127.0.0.1:27017/UniRooms";

async function seedAdminAccount() {
    try {
        const adminExists = await User.findOne({ username: "adminhost" });
        if (!adminExists) {
            const adminUser = new User({
                username: "adminhost",
                email: "admin@unirooms.com",
                fullname: "UniRooms Admin Host",
                role: "Admin",
                isAdmin: true,
                isVerifiedOwner: true,
                phoneNumber: "9999999999",
                address: "UniRooms HQ"
            });
            await User.register(adminUser, "AdminHostPassword123");
            console.log("--> Admin Host Account Seeded Successfully!");
        } else {
            adminExists.role = "Admin";
            adminExists.isAdmin = true;
            adminExists.isVerifiedOwner = true;
            await adminExists.save();
        }
    } catch (e) {
        console.error("Error seeding Admin Host account:", e.message);
    }
}

async function connectDB() {
    try {
        await mongoose.connect(dbUrl);
        console.log(`Connected to MongoDB (${dbUrl.includes("mongodb+srv") ? "Atlas" : "Local"})`);
        await seedAdminAccount();
    } catch (err) {
        if (dbUrl.includes("mongodb+srv")) {
            console.warn("Atlas DNS Lookup failed (ECONNREFUSED). Falling back to local MongoDB...");
            try {
                await mongoose.connect(localDbUrl);
                console.log("Connected to Local MongoDB");
                await seedAdminAccount();
            } catch (fallbackErr) {
                console.error("MongoDB Connection Error:", fallbackErr.message);
            }
        } else {
            console.error("MongoDB Connection Error:", err.message);
        }
    }
}

connectDB();


/* ================= VIEW ENGINE SETUP ================= */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


/* ================= MIDDLEWARE ================= */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://*.tile.openstreetmap.org", "https://unpkg.com", "https://images.unsplash.com", "https://images.unsplash.com/"],
            connectSrc: ["'self'", "ws:", "wss:", "http:", "https:", "https://nominatim.openstreetmap.org"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"]
        }
    }
}));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100,
    message: "Too many requests. Please try again later."
});
app.use("/login", authLimiter);
app.use("/signup", authLimiter);

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(methodOverride("_method")); // Allow PUT/PATCH/DELETE via _method query param

// Static files configuration
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= Express Session & Flash ================= */
const secretKey = process.env.SECRET || process.env.SESSION_SECRET || "MySupperSecretCode";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secretKey
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOption = {
    store,
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};
app.use(expressSession(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global locals middleware (Available in all EJS templates)
app.use(async (req, res, next) => {
    res.locals.success = req.flash("success"); // Success notifications
    res.locals.error = req.flash("error");     // Error notifications
    res.locals.currentPath = req.path;         // Useful for highlighting active navbar links
    res.locals.currUser = req.user;
    
    if (req.user) {
        if (req.user.role === "Owner") {
            const Verification = require("./models/verification");
            res.locals.ownerVerification = await Verification.findOne({ user: req.user._id });
        } else {
            res.locals.ownerVerification = null;
        }
    } else {
        res.locals.ownerVerification = null;
    }
    next();
});
// new line



/* ================= ROUTE HANDLERS ================= */

// Root Route: Redirect to listings index
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Resource Routes
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", user);
app.use("/", verifications);
app.use("/", bookings);
app.use("/", chats);
/* ================= ERROR HANDLING ================= */

// 404 Route Handler - matches anything that wasn't caught by the above routes
app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error", { message });
});

/* ================= SERVER INITIALIZATION ================= */
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Active Socket Registrations: userId -> socketId
const activeSockets = new Map();

io.on("connection", (socket) => {
    // Authenticate socket user
    socket.on("register", (userId) => {
        socket.userId = userId;
        activeSockets.set(userId, socket.id);
        io.emit("userStatus", { userId, status: "online" });
    });
    
    // Typing indicator forwarding
    socket.on("typing", (data) => {
        const { recipientId, isTyping } = data;
        const recipientSocketId = activeSockets.get(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("typingStatus", {
                senderId: socket.userId,
                isTyping
            });
        }
    });

    // Handle incoming messages
    socket.on("sendMessage", async (data) => {
        const { recipientId, text } = data;
        if (!socket.userId || !recipientId || !text) return;
        
        try {
            const Message = require("./models/message");
            const newMsg = new Message({
                sender: socket.userId,
                receiver: recipientId,
                text
            });
            await newMsg.save();
            
            const recipientSocketId = activeSockets.get(recipientId);
            const msgPayload = {
                _id: newMsg._id,
                sender: socket.userId,
                receiver: recipientId,
                text,
                createdAt: newMsg.createdAt
            };
            
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("receiveMessage", msgPayload);
            }
            
            socket.emit("messageSent", msgPayload);
        } catch (e) {
            console.error("Socket save message error:", e);
        }
    });
    
    // Disconnect
    socket.on("disconnect", () => {
        if (socket.userId) {
            activeSockets.delete(socket.userId);
            io.emit("userStatus", { userId: socket.userId, status: "offline" });
        }
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
