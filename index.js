var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ha = require('homeaway-api');
var util = require('./util');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';//disabling strict ssl so the api module can make requests to test/stage

var envConfig = {
    cert: "ssl/prodAndStage.crt",
    clientId: process.env.HOMEAWAY_CLIENT_ID,
    clientSecret: process.env.HOMEAWAY_CLIENT_SECRET
}

var app = express();
app.set('views', './views');
app.set('view engine', 'jade');
app.use(cookieParser());
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public', './public'));

ha.init(envConfig.clientId, envConfig.clientSecret);

require('./traveler')(app, ha);
require('./owner')(app, ha);


/**
 * handle the authentication callback
 */
app.get('/auth', function (req, res) {
    ha.getUserToken(req.query.ticket, function (tokenRes) {
        util.handleJsonBody(tokenRes, function (body) {
            var token = body.value;
            var email = body.email;
            var newCookie = {token: token, email: email};

            if (req.cookies.ha_oauth_cookie) { //if they have a cookie, they may have been trying to do a user-specific op
                var lastLoc = req.cookies.ha_oauth_cookie.last;

                req.cookies.ha_oauth_cookie = newCookie;
                res.cookie("ha_oauth_cookie", newCookie, {secure: true});

                //default to /welcome if it was a /login request or we don't know where to take them
                if (lastLoc == "login" || lastLoc === undefined || lastLoc.length == 0 ) {
                    res.render("welcome", req.cookies.ha_oauth_cookie);
                } else {
                    global[lastLoc](req, res);
                }
            } else { //no cookie, so they were just logging in for the first time
                req.cookies.ha_oauth_cookie = newCookie;
                res.cookie("ha_oauth_cookie", newCookie, {secure: true});
                res.render("welcome", req.cookies.ha_oauth_cookie);
            }
        });
    });
});

/**
 * welcome page
 */
app.get('/welcome', function(req, res) {
    res.render("welcome", req.cookies.ha_oauth_cookie);
});

/**
 * generate the login page
 */
app.get('/login', function (req, res) {
    res.cookie("ha_oauth_cookie", {last: "login"}, {secure: true});
    res.writeHead(302, {
        'Location': ha.getAuthUrl()
    });
    res.end();
});

/**
 * need to run as HTTPS because we can only redirect to an HTTPS service
 */
var server = https.createServer({
    key: fs.readFileSync("ssl/file.pem"),
    cert: fs.readFileSync("ssl/file.crt")
}, app).listen(3443, function() {
    console.log("application listening on " + server.address().port);
});
