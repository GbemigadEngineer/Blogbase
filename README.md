# Blogbase

A personal single-author article publishing platform with subscription-based notifications and reader engagement.

## Project Structure

```
Blogbase/
├── backend/                  # Node.js + Express REST API
│   ├── config/               # DB, Cloudinary, Swagger setup
│   ├── controllers/          # Route logic
│   ├── middleware/           # Auth, error handling, subscriber verification
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routers
│   ├── services/             # Email service
│   ├── utils/                # AppError, seed script
│   ├── app.js                # Express app
│   ├── server.js             # Entry point
│   └── .env.example          # Environment variable template
├── frontend/                 # React (Vite) — coming soon
└── README.md
```

## Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your MongoDB URI, JWT secret, Cloudinary keys, and email credentials
```

### 3. Run the server

```bash
npm run dev        # development (nodemon + auto-restart)
npm start          # production
```

The server automatically seeds the admin account and default tags on first run.

### Default admin credentials (change in .env before deploying)

- Username: `admin`
- Password: `changeme123`

---

## API Documentation

Interactive Swagger docs available at:

```
http://localhost:5000/api-docs
```

Only available in development mode.

---

## API Endpoints

### Auth

| Method | Route             | Access | Description       |
| ------ | ----------------- | ------ | ----------------- |
| POST   | `/api/auth/login` | Public | Admin login       |
| GET    | `/api/auth/me`    | Admin  | Get current admin |

### Tags

| Method | Route           | Access | Description  |
| ------ | --------------- | ------ | ------------ |
| GET    | `/api/tags`     | Public | Get all tags |
| POST   | `/api/tags`     | Admin  | Create a tag |
| PUT    | `/api/tags/:id` | Admin  | Update a tag |
| DELETE | `/api/tags/:id` | Admin  | Delete a tag |

### Articles

| Method | Route                       | Access | Description                          |
| ------ | --------------------------- | ------ | ------------------------------------ |
| GET    | `/api/articles`             | Public | Get all published articles           |
| GET    | `/api/articles/:slug`       | Public | Get single article by slug           |
| GET    | `/api/articles/admin/all`   | Admin  | Get all articles including drafts    |
| POST   | `/api/articles`             | Admin  | Create article (multipart/form-data) |
| PUT    | `/api/articles/:id`         | Admin  | Update article (multipart/form-data) |
| PATCH  | `/api/articles/:id/publish` | Admin  | Toggle publish/unpublish             |
| DELETE | `/api/articles/:id`         | Admin  | Delete article                       |
| POST   | `/api/articles/:id/react`   | Public | Like or dislike article              |
| POST   | `/api/articles/:id/share`   | Public | Increment share count                |

### Comments

| Method | Route                                                  | Access     | Description              |
| ------ | ------------------------------------------------------ | ---------- | ------------------------ |
| GET    | `/api/articles/:id/comments`                           | Public     | Get comments for article |
| POST   | `/api/articles/:id/comments`                           | Subscriber | Add a comment            |
| GET    | `/api/articles/comments/all`                           | Admin      | Get all comments         |
| DELETE | `/api/articles/:articleId/comments/:commentId`         | Admin      | Delete a comment         |
| PATCH  | `/api/articles/:articleId/comments/:commentId/approve` | Admin      | Toggle approve comment   |

### Subscriptions

| Method | Route                                   | Access | Description                |
| ------ | --------------------------------------- | ------ | -------------------------- |
| POST   | `/api/subscriptions`                    | Public | Subscribe to tags          |
| POST   | `/api/subscriptions/verify`             | Public | Verify subscription status |
| GET    | `/api/subscriptions/unsubscribe/:token` | Public | Unsubscribe via email link |
| GET    | `/api/subscriptions`                    | Admin  | Get all subscribers        |

### Analytics

| Method | Route                        | Access | Description                 |
| ------ | ---------------------------- | ------ | --------------------------- |
| GET    | `/api/analytics/overview`    | Admin  | Overall dashboard stats     |
| GET    | `/api/analytics/articles`    | Admin  | Per-article stats           |
| GET    | `/api/analytics/subscribers` | Admin  | Subscriber growth over time |

---

## Request & Response Examples

### Login

**Request**

```json
POST /api/auth/login
{
  "username": "admin",
  "password": "changeme123"
}
```

**Response**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "username": "admin"
  }
}
```

### Create Article

**Request**

```
POST /api/articles
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: My Article Title
content: <p>Article content here</p>
tag: 64f1a2b3c4d5e6f7a8b9c0d1
excerpt: A short description
coverImage: (binary file)
```

**Response**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "title": "My Article Title",
    "slug": "my-article-title",
    "content": "<p>Article content here</p>",
    "excerpt": "A short description",
    "tag": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Sports",
      "slug": "sports"
    },
    "isPublished": false,
    "views": 0,
    "likes": 0,
    "dislikes": 0,
    "shares": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Subscribe

**Request**

```json
POST /api/subscriptions
{
  "displayName": "FootballFan",
  "email": "user@example.com",
  "tags": ["64f1a2b3c4d5e6f7a8b9c0d1"]
}
```

**Response**

```json
{
  "success": true,
  "message": "Subscribed successfully! You can now comment on articles.",
  "data": {
    "displayName": "FootballFan",
    "email": "user@example.com",
    "tags": ["64f1a2b3c4d5e6f7a8b9c0d1"]
  }
}
```

### Add Comment

**Request**

```json
POST /api/articles/:id/comments
{
  "email": "user@example.com",
  "content": "Great article!"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "displayName": "FootballFan",
    "content": "Great article!",
    "parentComment": null,
    "isApproved": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### React to Article

**Request**

```json
POST /api/articles/:id/react
{
  "type": "like"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "likes": 1,
    "dislikes": 0
  }
}
```

---

## Environment Variables

| Variable                | Description               | Example                  |
| ----------------------- | ------------------------- | ------------------------ |
| `PORT`                  | Server port               | `5000`                   |
| `NODE_ENV`              | Environment               | `development`            |
| `MONGO_URI`             | MongoDB connection string | `mongodb+srv://...`      |
| `JWT_SECRET`            | JWT signing secret        | `your_secret_key`        |
| `JWT_EXPIRES_IN`        | JWT expiry                | `7d`                     |
| `ADMIN_USERNAME`        | Admin username            | `admin`                  |
| `ADMIN_PASSWORD`        | Admin password            | `changeme123`            |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name     | `your_cloud_name`        |
| `CLOUDINARY_API_KEY`    | Cloudinary API key        | `your_api_key`           |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret     | `your_api_secret`        |
| `EMAIL_HOST`            | SMTP host                 | `smtp.resend.com`        |
| `EMAIL_PORT`            | SMTP port                 | `587`                    |
| `EMAIL_USER`            | SMTP user                 | `resend`                 |
| `EMAIL_PASS`            | SMTP password/API key     | `your_api_key`           |
| `EMAIL_FROM`            | From email address        | `noreply@yourdomain.com` |
| `EMAIL_FROM_NAME`       | From name                 | `Blogbase`               |
| `CLIENT_URL`            | Frontend URL              | `http://localhost:5173`  |

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JWT, Nodemailer, Cloudinary, Multer, Swagger

**Frontend (coming soon):** React, Vite, TailwindCSS, React Router, Axios, Chart.js
