const express = require('express');
const passport = require('passport');
const analysis = require('../models/analysis');
const router = express.Router();
const Analysis = require('../models/analysis');


// Start Google login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  async(req, res) => {
      res.redirect("/")
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
