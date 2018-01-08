var express = require('express');
var router = express.Router();

const bcrypt = require('bcryptjs');

const dsn = process.env.DBWEBB_DSN || 'mongodb://127.0.0.1:27017/birdreport';
const Users = require('mongo-crud-simple')(dsn, 'users');
const auth = require('../src/auth')(dsn, 'users');

// GET register page
router.get('/register', auth.guest, (req, res) => {
    res.render('auth/register', {
        title: 'Registrera',
        locals: res.locals
    });
});

// POST register page
router.post('/register', auth.guest, async (req, res) => {
    if (await auth.checkUsername(req.body.username)) {
        req.flash('errors', 'Användanamnet upptaget');
        return res.redirect('/auth/register');
    }

    if (req.body.password !== req.body.password2) {
        req.flash('errors', 'Lösenorden matchar inte');
        return res.redirect('/auth/register');
    }

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.password, salt);

    let user = {
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        role: 'user',
        image: req.body.image,
        password: hash
    };

    await Users.create(user);
    req.flash('message', 'Användare skapad');
    return res.redirect('/auth/login');
});

// GET login route
router.get('/login', auth.guest, (req, res) => {
    res.render('auth/login', {
        title: 'Logga in',
        locals: res.locals
    });
});

// POST login route
router.post('/login', auth.guest, async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let user = await auth.getUser(username);

    if (user === null) {
        req.flash('errors', 'Användaren finns inte');
        return res.redirect('/auth/login');
    }

    if (bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        return res.redirect('/');
    } else {
        req.flash('errors', 'Felaktigt lösenord');
        return res.redirect('/auth/login');
    }
});

// GET logout route
router.get('/logout', auth.isLoggedIn, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;
