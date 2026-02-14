if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

console.log("Environment Variables:", process.env.SECRET);


const express =require('express');
const app =express();
const mongoose =require('mongoose');

const Listing =require('./models/listing.js');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const { errorHandler, notFoundHandler, asyncHandler } = require("./utils/errorHandler.js");
const ExpressError = require("./utils/ExpressError.js");
const { validateListing, validateListingUpdate, validateId, validateReview, validateReviewId, validateReviewUpdate } = require("./utils/validateSchema.js");
const Review = require('./models/review.js');
const { sanitizeReviewData } = require('./utils/reviewUtils.js');


const passport = require("passport");
const LocalStrategy = require("passport-local");
const User= require("./models/user.js");
const  listingRoutes = require('./routes/listing.js');
const reviewRoutes = require('./routes/review.js');
//const User = require("./routes/user.js");
// app.use('/users', userRoutes);
const userRoutes = require('./routes/user.js');
const insightsRoutes = require('./routes/insights.js');
const servicesRoutes = require('./routes/services.js');
const journeyRoutes = require('./routes/journey.js');
const { requireAuth, redirectIfAuthenticated } = require('./middleware/auth.js');


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/planmystay';

async function main(params) {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB successfully");
        if (process.env.NODE_ENV !== "production") {
            const db = mongoose.connection.db;
            const collections = await db.listCollections().toArray();
            console.log("Available collections:", collections.map(c => c.name));
            const testListing = new Listing({
                title: "Test Listing",
                propertyType: "Hotel",
                price: 100,
                location: "Test Location",
                country: "Test Country"
            });
            console.log("Listing model test:", testListing);
        }
    } catch (error) {
        console.error("Error in main function:", error);
        throw error;
    }
}
main()
.then(()=>{
    console.log("connected to mongodb");
})
.catch((err)=>{
    console.error("error connecting to mongodb:",err);
});



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true})); // to parse form data
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// Session configuration (must be before passport.session)
const sessionConfig = {
    secret: process.env.SESSION_SECRET || "a-very-secure-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make user and flash messages available in all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use('/', userRoutes);




// Mount routers
app.use('/listings', requireAuth, listingRoutes);
app.use('/listings/:id/reviews', requireAuth, reviewRoutes);
app.use('/users', userRoutes);
app.use('/api/insights', requireAuth, insightsRoutes);
app.use('/services', requireAuth, servicesRoutes);
app.use('/api/journey', journeyRoutes);

// Home page route
app.get('/', (req, res) => {
    res.render('home', { layout: 'layouts/boilerplate' });
});

// Journey page route
app.get('/journey', (req, res) => {
    res.render('journey/index', { layout: 'layouts/boilerplate' });
});

// Seed journey data route (for testing)
app.get('/seed-journey', async (req, res) => {
    try {
        const { seedJourneyData } = require('./init/journeyData.js');
        await seedJourneyData();
        res.json({ success: true, message: 'Journey data seeded successfully' });
    } catch (error) {
        console.error('Error seeding journey data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// AI Prediction API endpoint
app.post('/api/predict-price', async (req, res) => {
    try {
        const { predictPrice } = require('./utils/pricePredictor.js');
        const prediction = await predictPrice(req.body);
        res.json(prediction);
    } catch (error) {
        console.error('Error in price prediction API:', error);
        res.status(500).json({ error: 'Failed to get price prediction' });
    }
});

// 404 handler - must be last before error handler
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);


const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`🚀 PlanMyStay Server is running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`🏨 Welcome to PlanMyStay - Your Perfect Travel Companion!`);
});

// Handle server errors gracefully
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please try one of the following:`);
        console.error(`   1. Kill the existing process: taskkill /f /im node.exe`);
        console.error(`   2. Use a different port: PORT=3001 nodemon app.js`);
        console.error(`   3. Wait a few seconds and try again`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});