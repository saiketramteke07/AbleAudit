const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Dummy user storage (replace with DB logic if needed)
let user = {};

passport.serializeUser((userObj, done) => {
  done(null, userObj);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  user = profile;
  return done(null, profile);
}));
