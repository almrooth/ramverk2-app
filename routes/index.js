var express = require('express');
var router = express.Router();

const dsn = process.env.DBWEBB_DSN || 'mongodb://127.0.0.1:27017/birdreport';
const auth = require('../src/auth')(dsn, 'users');

// GET home page
router.get('/', (req, res) =>  {
    res.render('base/index', { title: 'Välkommen', locals: res.locals });
});

// GET about page
router.get('/about', (req, res) => {
    res.render('base/about', { title: 'Om', locals: res.locals });
});

// GET chat page
router.get('/chat', auth.isLoggedIn, (req, res) => {
    res.render('base/chat', {
        title: 'Fågelsnack',
        locals: res.locals,
        port: process.env.DBWEBB_PORT || 1337,
        username: res.locals.user.username
    });
});

module.exports = router;
