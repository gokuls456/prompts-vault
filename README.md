# PromptVault 🗝️

A production-ready full-stack AI prompt discovery platform built with React, Node.js, Express, and MongoDB.

---

## ✨ Features

- **Dark glassmorphism UI** with Framer Motion animations
- **Responsive masonry grid** for prompt cards
- **Animated hero section** with floating orbs
- **Real-time search + category/type filtering**
- **Copy-to-clipboard** with toast notifications
- **Prompt detail modal** with full information
- **JWT authentication** (cookie + localStorage)
- **Role-based access** (admin / user)
- **Admin dashboard** — manage prompts, upload images, manage users
- **File upload** via Multer (local storage, swap for Cloudinary easily)
- **Rate limiting** and security headers (Helmet)
- **Loading skeleton UI**
- **Pagination**

---

## 📁 Project Structure

```
prompt-vault/
├── client/               # React frontend (Vite + Tailwind + Framer Motion)
│   ├── public/
│   └── src/
│       ├── api/          # Axios API layer
│       ├── components/
│       │   ├── admin/    # PromptForm, UserTable
│       │   ├── layout/   # Navbar, Footer
│       │   ├── prompts/  # PromptCard, PromptModal, PromptGrid, FilterBar
│       │   └── ui/       # Modal, Skeleton
│       ├── contexts/     # AuthContext
│       └── pages/        # Home, Login, Register, Dashboard
│
└── server/               # Node.js + Express backend
    ├── config/           # Database connection
    ├── controllers/      # Auth, Prompt, User controllers
    ├── middleware/        # Auth guard, Multer upload
    ├── models/           # User, Prompt schemas
    ├── routes/           # API routes
    ├── uploads/          # Local image storage
    └── seeder.js         # Database seeder
```

---

## 🚀 Running Locally

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (or a MongoDB Atlas URI)

### 1. Clone and install

```bash
git clone <repo-url>
cd prompt-vault

# Install all dependencies (root + server + client)
npm run install:all
```

### 2. Configure environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your MONGO_URI, JWT_SECRET, ADMIN_EMAIL, etc.

# Client (optional — defaults work for local dev)
cp client/.env.example client/.env
```

**`server/.env` example:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/promptvault
JWT_SECRET=change_this_to_a_long_random_secret
ADMIN_EMAIL=admin@promptvault.com
ADMIN_PASSWORD=admin123456
CLIENT_URL=http://localhost:5173
```

### 3. Seed the database (optional but recommended)

```bash
npm run seed
```

This creates:
- An **admin** user (`admin@promptvault.com` / `admin123456`)
- A **demo** user (`user@promptvault.com` / `user123456`)
- **15 sample prompts** across multiple categories

### 4. Start development servers

```bash
# Runs both backend (port 5000) and frontend (port 5173) concurrently
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔐 Authentication

| Route       | Access        |
|-------------|---------------|
| `/`         | Public        |
| `/login`    | Public        |
| `/register` | Public        |
| `/dashboard`| Admin only    |

- JWT is stored in `localStorage` (`pv_token`) and also set as an HTTP-only cookie
- Token auto-restored on page reload
- Admin role auto-assigned when email matches `ADMIN_EMAIL` env var

---

## 🌐 API Reference

### Auth
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | `/api/auth/register`  | Register new user |
| POST   | `/api/auth/login`     | Login             |
| POST   | `/api/auth/logout`    | Logout            |
| GET    | `/api/auth/me`        | Get current user  |

### Prompts
| Method | Endpoint              | Auth   | Description         |
|--------|-----------------------|--------|---------------------|
| GET    | `/api/prompts`        | Public | List prompts (search/filter/paginate) |
| GET    | `/api/prompts/:id`    | Public | Get single prompt   |
| GET    | `/api/prompts/categories` | Public | Get categories list |
| POST   | `/api/prompts`        | Admin  | Create prompt       |
| PUT    | `/api/prompts/:id`    | Admin  | Update prompt       |
| DELETE | `/api/prompts/:id`    | Admin  | Delete prompt       |

**Query params for `GET /api/prompts`:**
- `search` — full-text search
- `category` — filter by category
- `type` — `photo` or `video`
- `tags` — comma-separated tags
- `page` — page number (default: 1)
- `limit` — per page (default: 12, max: 50)

### Users (Admin only)
| Method | Endpoint              | Description      |
|--------|-----------------------|------------------|
| GET    | `/api/users`          | List all users   |
| DELETE | `/api/users/:id`      | Delete user      |
| PATCH  | `/api/users/:id/role` | Change user role |

---

## 🖼️ File Upload

Images are uploaded via **Multer** to `/server/uploads/` and served statically at `/uploads/<filename>`.

### Switching to Cloudinary

1. `npm install cloudinary multer-storage-cloudinary` in `/server`
2. Update `server/middleware/upload.js`:

```js
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ cloud_name: process.env.CLOUD_NAME, api_key: ..., api_secret: ... });

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'promptvault', allowed_formats: ['jpg', 'png', 'webp', 'gif'] },
});
```

3. Add `CLOUDINARY_URL` to your `.env`

---

## 🚢 Deployment

### Backend → Render / Railway

1. Create a new web service pointing to the `server/` directory
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add all environment variables (especially `NODE_ENV=production`)
5. Update `CLIENT_URL` to your Vercel/Netlify frontend URL

### Frontend → Vercel / Netlify

1. Set the **root directory** to `client/`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`

> **Important:** Remove the Vite proxy config from `vite.config.js` for production, and ensure `VITE_API_URL` points to the live backend.

---

## 🔮 Future Enhancements

- [ ] Cloudinary integration for production image hosting
- [ ] User collections / bookmarks system
- [ ] Prompt rating & likes
- [ ] Social auth (Google OAuth)
- [ ] Prompt generation history
- [ ] Prompt sharing with custom links
- [ ] Dark/light mode toggle
- [ ] Bulk import/export (CSV/JSON)
- [ ] AI-powered prompt suggestions
- [ ] Comments & community discussion

---

## 🛡️ Security Notes

- Passwords hashed with **bcryptjs** (12 rounds)
- JWTs expire after **7 days**
- **Helmet** sets security headers
- **Rate limiting** on all API routes (stricter on auth endpoints)
- **CORS** restricted to configured `CLIENT_URL`
- Admin-only routes protected by `protect + adminOnly` middleware chain
- File uploads restricted to image types only, max 5 MB

---

## 📄 License

MIT — free to use, modify and distribute.
