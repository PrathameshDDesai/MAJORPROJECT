# 🏠 UniRooms

**UniRooms** is a full-stack web application that helps students and working professionals find and list rental rooms/accommodations. It supports user authentication, image uploads, reviews with ratings, location-based listings, and role-based access control.

---

## 🚀 Features

- 🔍 Browse and search room listings with filters (city, gender preference, price)
- 📝 Create, edit, and delete listings with multiple image uploads
- ⭐ Leave reviews and star ratings on listings
- 🔐 User authentication (Sign up / Login / Logout)
- 🗺️ Location-aware listings with city & address details
- 👤 Role-based access: only owners can edit/delete their listings
- 🔔 Flash notifications for success and error feedback
- 📱 Responsive UI with Bootstrap

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **EJS** (Embedded JavaScript) | Server-side HTML templating engine |
| **EJS-Mate** | Layout/partial support for EJS templates |
| **Bootstrap 5** | Responsive CSS framework for UI components |
| **Vanilla CSS** | Custom styles (`public/css/`) |
| **JavaScript (Client-side)** | Interactive UI behavior |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime environment |
| **Express.js v5** | Web application framework |
| **express-session** | Server-side session management |
| **connect-flash** | Flash messages for user feedback |
| **method-override** | Supports PUT/DELETE via HTML forms |
| **dotenv** | Environment variable management |

### Database
| Technology | Purpose |
|---|---|
| **MongoDB** | NoSQL document database |
| **Mongoose** | MongoDB ODM (Object Data Modeling) |

### Authentication
| Technology | Purpose |
|---|---|
| **Passport.js** | Authentication middleware |
| **passport-local** | Username/password authentication strategy |
| **passport-local-mongoose** | Mongoose plugin for Passport local strategy |
| **passport-google-oauth20** | Google OAuth 2.0 authentication strategy |

### File Handling
| Technology | Purpose |
|---|---|
| **Multer** | Multipart form data / image upload handling |

### Development Tools
| Tool | Purpose |
|---|---|
| **Nodemon** | Auto-restart server on file changes |
| **Git** | Version control |

---

## 📁 Project Structure

```
UniRooms/
├── app.js                  # Main application entry point
├── package.json            # Project metadata & dependencies
├── .env                    # Environment variables (not committed)
├── .gitignore              # Git ignored files
│
├── models/                 # Mongoose data models
│   ├── listing.js          # Room listing schema
│   ├── review.js           # Review & rating schema
│   └── user.js             # User account schema
│
├── routes/                 # Express route definitions
│   ├── listing.js          # Listing CRUD routes
│   ├── review.js           # Review routes
│   └── user.js             # Auth routes (login/signup/logout)
│
├── controllers/            # Route controller logic (MVC pattern)
│   ├── listing.js
│   ├── review.js
│   └── user.js
│
├── middleware/             # Custom middleware
│   └── index.js            # Auth checks, validation helpers
│
├── utils/                  # Utility helpers
│   ├── wrapAsync.js        # Async error wrapper
│   └── ExpressError.js     # Custom error class
│
├── views/                  # EJS templates
│   ├── layouts/            # Base layout (boilerplate)
│   ├── includes/           # Reusable partials (navbar, footer)
│   ├── listings/           # Listing pages (index, show, new, edit, error)
│   └── users/              # Auth pages (login, signup)
│
├── public/                 # Static assets served to browser
│   ├── css/                # Custom stylesheets
│   └── js/                 # Client-side JavaScript
│
├── uploads/                # Uploaded room images (local storage)
└── init/                   # Database seed scripts
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017`)
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/UniRooms.git
cd UniRooms

# 2. Install dependencies
npm install

# 3. Create a .env file and set environment variables
cp .env.example .env
```

### Environment Variables (`.env`)

```env
NODE_ENV=development
SESSION_SECRET=your_super_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Run the App

```bash
# Development mode (with auto-restart)
npx nodemon app.js

# Or using npm
npm start
```

The server will start at **http://localhost:8080**

---

## 📦 Dependencies Summary

```json
{
  "express": "^5.2.1",
  "mongoose": "^9.1.1",
  "ejs": "^3.1.10",
  "ejs-mate": "^4.0.0",
  "passport": "^0.7.0",
  "passport-local": "^1.0.0",
  "passport-local-mongoose": "^9.0.1",
  "passport-google-oauth20": "^2.0.0",
  "multer": "^2.0.2",
  "express-session": "^1.18.2",
  "connect-flash": "^0.1.1",
  "method-override": "^3.0.0",
  "dotenv": "^17.2.3"
}
```

---

## 🧑‍💻 Author

**Prathamesh Desai**  
Major Project — Web Development

---

## 📄 License

This project is for educational purposes.
