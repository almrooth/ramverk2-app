var express = require('express');
var router = express.Router();

const dsn = process.env.DBWEBB_DSN || 'mongodb://127.0.0.1:27017/birdreport';
const auth = require('../src/auth')(dsn, 'users');
const Obs = require('mongo-crud-simple')(dsn, 'observations');


// Obeservations page, all observations
router.get('/', async (req, res, next) => {
    try {
        let data = await Obs.index();

        data.forEach(obs => {
            obs.isOwner = (res.locals.user._id == obs.user._id);
        });

        return res.render('observations/index', {
            title: 'Observationer',
            locals: res.locals,
            observations: data
        });
    } catch (error) {
        next(error);
    }
});

// Get observation
router.get('/show/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let obs = await Obs.read(id);

        obs.isOwner = (res.locals.user._id == obs.user._id);

        return res.render('observations/observation', {
            title: `${obs.date} - ${obs.bird}`,
            locals: res.locals,
            obs: obs
        });
    } catch (error) {
        next(error);
    }
});

router.get('/create', auth.isLoggedIn, (req, res) => {
    return res.render('observations/create', {
        title: 'Ny observation',
        locals: res.locals
    });
});

router.post('/create', auth.isLoggedIn, async (req, res, next) => {
    try {
        let obs = {
            bird: req.body.bird,
            date: req.body.date,
            location: req.body.location,
            text: req.body.text,
            image: req.body.image,
            user: req.session.user
        };

        await Obs.create(obs);

        req.flash('message', 'Ny observation postad');
        return res.redirect('/observations');
    } catch (error) {
        next(error);
    }
});

router.get('/edit/:id', auth.isLoggedIn, async (req, res, next) => {
    try {
        let id = req.params.id;
        let obs = await Obs.read(id);

        if (res.locals.user.role != 'admin') {
            if (obs.user._id != res.locals.user._id) {
                return res.redirect('/observations');
            }
        }

        return res.render('observations/edit', {
            title: 'Redigera observation',
            locals: res.locals,
            obs: obs
        });
    } catch (error) {
        next(error);
    }
});

router.post('/edit/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let obs = await Obs.read(id);

        if (res.locals.user.role != 'admin') {
            if (obs.user._id != res.locals.user._id) {
                return res.redirect('/observations');
            }
        }

        let data = {
            bird: req.body.bird,
            date: req.body.date,
            location: req.body.location,
            text: req.body.text,
            image: req.body.image
        };

        await Obs.update(id, data);
        req.flash('message', 'Observation updaterad');
        return res.redirect('/observations/show/' + id);
    } catch (error) {
        next(error);
    }
});

router.get('/delete/:id', auth.isLoggedIn, async (req, res, next) => {
    try {
        let id = req.params.id;
        let obs = await Obs.read(id);

        if (res.locals.user.role === 'user') {
            if (obs.user._id != res.locals.user._id) {
                // throw new Error('Not authorized');
                return res.redirect('/observations');
            }
        }

        await Obs.delete(id);
        req.flash('message', 'Observation raderad');
        return res.redirect('/observations');
    } catch (error) {
        next(error);
    }
});

router.get('/overview', auth.isLoggedInAdmin, async (req, res, next) => {
    try {
        let data = await Obs.index();

        data.forEach(obs => {
            obs.isOwner = (res.locals.user._id == obs.user._id);
        });

        return res.render('observations/overview', {
            title: 'Observationer',
            locals: res.locals,
            obs: data
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
