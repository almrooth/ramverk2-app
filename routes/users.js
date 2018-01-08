const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const dsn = process.env.DBWEBB_DSN || 'mongodb://127.0.0.1:27017/birdreport';
const Users = require('mongo-crud-simple')(dsn, 'users');
const auth = require('../src/auth')(dsn, 'users');

/**
* Get all users
*/
router.get('/', auth.isLoggedInAdmin, async (req, res, next) => {
    try {
        let data = await Users.index();

        res.render('users/index', {
            title: 'Användare',
            users: data,
            locals: res.locals
        });
    } catch (error) {
        next(error);
    }
});


/**
 * GET - User profile page
 */
router.get('/profile/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let user = await Users.read(id);

        res.render('users/profile', {
            title: user.username,
            locals: res.locals,
            user: user
        });
    } catch (error) {
        next(error);
    }
});


/**
* GET - Create new user
*/
router.get('/create', auth.isLoggedInAdmin, (req, res) => {
    res.render('users/create', {
        title: 'Ny användare',
        locals: res.locals
    });
});


/**
* POST - Create new user
*/
router.post('/create', auth.isLoggedInAdmin, async (req, res) => {
    if (await auth.checkUsername(req.body.username)) {
        req.flash('errors', 'Användarnamnet upptaget');
        return res.redirect('/users/create');
    }

    if (req.body.password !== req.body.password2) {
        req.flash('errors', 'Lösenorden matchar inte');
        return res.redirect('/users/create');
    }

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.password, salt);

    let user = {
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        image: req.body.image,
        password: hash
    };

    await Users.create(user);
    req.flash('message', `Användare ${user.username} skapad`);
    return res.redirect('/users');
});


/**
 * GET - Edit user
 */
router.get('/edit/:id', async (req, res) => {
    let id = req.params.id;
    let user = await Users.read(id);

    if (!(res.locals.user._id == user._id || res.locals.user.role == 'admin')) {
        return res.redirect('/');
    }

    res.render('users/edit', {
        title: 'Redigera användare',
        locals: res.locals,
        user: user,
        role: (user.role == 'user') ? true : false
    });
});


/**
 * POST - Edit user
 */
router.post('/edit/:id', async (req, res) => {
    let id = req.params.id;
    let user = await Users.read(id);

    if (!(res.locals.user._id == user._id || res.locals.user.role == 'admin')) {
        return res.redirect('/');
    }

    if (await auth.checkUsername(req.body.username) && req.body.username !== user.username) {
        req.flash('errors', 'Användarnamnet upptaget');
        return res.redirect('/users/edit/' + id);
    }

    let data = {
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
        role: req.body.role
    };

    await Users.update(id, data);
    req.flash('message', `Användare ${data.username} updaterad`);
    res.redirect('/users/profile/' + id);
});


/**
 * GET - Delete user
 */
router.get('/delete/:id', auth.isLoggedInAdmin, async (req, res) => {
    let id = req.params.id;

    await Users.delete(id);
    req.flash('message', 'Användare raderad');
    return res.redirect('/users');
});


/**
 * GET - Change password
 */
router.get('/pwd/:id', async (req, res) => {
    let id = req.params.id;
    let user = await Users.read(id);

    if (!(res.locals.user._id == user._id || res.locals.user.role == 'admin')) {
        return res.redirect('/');
    }

    res.render('users/pwd', {
        title: 'Byt lösenord',
        locals: res.locals,
        user: user
    });
});


/**
 * POST - Byt lösenord
 */
router.post('/pwd/:id', async (req, res) => {
    let id = req.params.id;
    let user = await Users.read(id);

    if (!(res.locals.user._id == user._id || res.locals.user.role == 'admin')) {
        return res.redirect('/');
    }

    if (req.body.password !== req.body.password2) {
        req.flash('errors', 'Lösenorden matchar inte');
        return res.redirect('/users/pwd/' + id);
    }

    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.password, salt);

    let data = {
        password: hash
    };

    await Users.update(id, data);
    req.flash('message', `Användare ${user.username} updaterad`);
    return res.redirect('/users/pwd/' + id);
});


/**
* Export routes
*/
module.exports = router;
