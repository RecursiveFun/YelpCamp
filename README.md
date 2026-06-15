# YelpCamp

A full-stack campground review app built with Express, MongoDB, and EJS. Users can register, log in, create and manage campgrounds, upload images to Cloudinary, view camps on interactive Mapbox maps, and leave reviews.

## Features

- User authentication with Passport (register, login, logout)
- CRUD for campgrounds with image upload and deletion
- Geocoding via the Mapbox API
- Interactive cluster and detail maps
- Reviews on individual campgrounds
- Flash messages, form validation, and security middleware (Helmet, mongo-sanitize)

## Tech Stack

- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Auth:** Passport, passport-local-mongoose, express-session, connect-mongo
- **Views:** EJS, ejs-mate
- **Images:** Cloudinary, multer
- **Maps:** Mapbox GL JS, @mapbox/mapbox-sdk
- **Deployment:** Vercel (serverless)

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas))
- [Mapbox](https://account.mapbox.com) access token
- [Cloudinary](https://cloudinary.com) account

### Installation

```bash
git clone <your-repo-url>
cd YelpCamp
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
API_KEY=your_mongodb_connection_string
MAPBOX_TOKEN=your_mapbox_token
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SESSION_SECRET=your_long_random_secret
```

| Variable | Description |
| --- | --- |
| `API_KEY` | MongoDB connection string |
| `MAPBOX_TOKEN` | Mapbox API access token |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SESSION_SECRET` | Random string used to sign session cookies (make your own; 32+ characters) |

### Run Locally

```bash
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Seed the Database (optional)

```bash
node seeds/index.js
```

## Deploying to Vercel

1. Push the project to GitHub and import it in [Vercel](https://vercel.com).
2. Add all environment variables from the table above in **Project Settings → Environment Variables**.
3. In MongoDB Atlas, allow network access from `0.0.0.0/0` (Vercel serverless functions use dynamic IPs).
4. Deploy. Vercel will use `api/index.js` as the serverless entry point.

Static files in `public/` are served by Vercel's CDN. EJS templates in `views/` are bundled via `vercel.json`.

## Project Structure

```
├── api/            # Vercel serverless entry point
├── controllers/    # Route handlers
├── models/         # Mongoose models
├── routes/         # Express routes
├── views/          # EJS templates
├── public/         # Static assets (CSS, JS)
├── middlewares.js  # Auth and validation middleware
├── app.js          # Express app setup
└── vercel.json     # Vercel deployment config
```

## License

ISC
