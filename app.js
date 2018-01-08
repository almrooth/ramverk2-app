const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const http = require('http');

// import routes
const baseRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const observationRoutes = require('./routes/observations');
const usersRoutes = require('./routes/users.js');

const app = express();

const server = http.createServer(app);

// Websocket chat server
const wss = require('./src/chat/server');

wss(server);

// view engine setup
app.engine('.hbs', exphbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', 'hbs');

// static files
app.use(express.static(path.join(__dirname, 'public')));

// flash messages
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// sessions
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false
}));

// locals
app.use(function(req, res, next) {
    res.locals.errors = req.flash('errors');
    res.locals.message = req.flash('message');
    res.locals.user = (typeof req.session.user === 'undefined') ? false : req.session.user;
    res.locals.user.isAdmin = (res.locals.user.role === 'admin') ? true : false;
    // console.log(res.locals.user);
    next();
});

// use routes
app.use('/', baseRoutes);
app.use('/auth', authRoutes);
app.use('/observations', observationRoutes);
app.use('/users', usersRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');

    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    err.status = err.status || 500;
    res.status(err.status);
    res.render('error', {
        title: 'Error',
        error: err
    });
});

module.exports = app;
