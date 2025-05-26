if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
}

const express=require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsMate=require("ejs-mate")
const dotenv = require('dotenv');
const PORT = 3000;



const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('dotenv').config();
require('./auth/google'); 


// Connect to MongoDB
const dbUrl=process.env.ATLASDB_URL

async function main() {
  await mongoose.connect(dbUrl);
}
main().then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'/public')));


// Set up EJS
app.engine('ejs',ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
      secret:process.env.SESSION_SECRET
  },
  touchAfter:24*3600
  
})


const sessionOptions={
  store,
  secret:process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true

}
}

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
  res.locals.currUser=req.user;
  next()
});


// Import routes
const indexRoutes = require('./routes/index');
const analysisRoutes = require('./routes/analysis');
const authRoutes = require('./routes/auth');



// Use routes
app.use('/', indexRoutes);
app.use('/analysis', analysisRoutes);
app.use('/auth', authRoutes);

// Handle "Page Not Found" errors (404)
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Page Not Found',
    error: {}
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


