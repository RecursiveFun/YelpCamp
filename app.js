if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

const express = require ('express');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongo')(session);



const userRoutes = require('./routes/users');
const campRoutes = require('./routes/camps');
const reviewRoutes = require('./routes/reviews');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');



let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

function getMongoUrl() {
    const url = (process.env.API_KEY || '').trim();

    if (!url) {
        throw new Error('API_KEY environment variable is not set.');
    }

    if (!url.startsWith('mongodb://') && !url.startsWith('mongodb+srv://')) {
        throw new Error('API_KEY must be a MongoDB connection string.');
    }

    const credentials = url.split('@')[0] || '';
    if (credentials.includes('%3C') || credentials.includes('%3E')) {
        throw new Error(
            'API_KEY has angle brackets in the password (e.g. <berinde>). Atlas uses <password> as a placeholder — use only the real password, without < or >.'
        );
    }

    return url;
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    const mongoUrl = getMongoUrl();

    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoUrl, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 15000,
        }).then((mongooseInstance) => {
            console.log("Database connected");
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error("connection error:", error.message);
        throw error;
    }

    return cached.conn;
}

const app = express();

if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    app.set('trust proxy', 1);
}

app.engine('ejs', engine);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
if (!process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, 'public')));
}
app.use(mongoSanitize());

const sessionOptions = {
    name: 'session',
    secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

let sessionMiddleware;

app.use(async (req, res, next) => {
    try {
        await connectDB();

        if (!sessionMiddleware) {
            const store = new MongoDBStore({
                url: getMongoUrl(),
                secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!',
                touchAfter: 24 * 60 * 60,
            });

            store.on('error', (error) => {
                console.error('Session Store Error', error.message);
            });

            sessionMiddleware = session({ ...sessionOptions, store });
        }

        sessionMiddleware(req, res, next);
    } catch (error) {
        next(error);
    }
});

app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/do2b86jpr/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/camps', campRoutes);
app.use('/camps/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;

    if (err.name === 'MongooseServerSelectionError') {
        err.message = 'Unable to connect to MongoDB. Check your API_KEY connection string and Atlas network access (allow 0.0.0.0/0 for Vercel).';
    } else if (err.message?.includes('authentication failed') || err.message?.includes('bad auth')) {
        err.message = 'MongoDB authentication failed. Reset your Atlas database user password and update API_KEY in Vercel with a fresh connection string from Atlas.';
    } else if (err.message?.includes('querySrv')) {
        err.message = 'MongoDB DNS lookup failed. In Atlas, copy the standard connection string (mongodb://) instead of mongodb+srv://.';
    } else if (!err.message) {
        err.message = 'Something went wrong.';
    }

    res.locals.currentUser = res.locals.currentUser ?? null;
    res.locals.success = res.locals.success ?? null;
    res.locals.error = res.locals.error ?? null;

    res.status(statusCode).render('error', { err });
});

module.exports = app;

if (!process.env.VERCEL) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Serving on port ${port}`);
    });
}