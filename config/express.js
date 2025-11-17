var express = require('express');
var load = require('express-load');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');

 
module.exports = function () {
    var app = express();

    app.set('view engine', 'ejs');
    app.set('views', './app/views');

    app.use(express.static('./app/public'));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use(expressValidator());

    app.use(session({
        secret: 'seuSegredoAqui',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            secure: false,
            sameSite: 'lax',
            httpOnly: true
        }
    }));

    load('routes', { cwd: 'app' })
        .then('infra')
        .into(app);

    return app;
};
