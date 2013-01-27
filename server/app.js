var http = require('http'),
    ss = require('socketstream');

var express = require('express');
var app = express();
var routes = require('./routes');
var path = require('path');

// Code & Template Formatters
ss.client.formatters.add(require('ss-stylus'));
ss.client.templateEngine.use(require('ss-hogan'));

// Define a single-page client
ss.client.define('main', {
        view: 'app.html',
        //css:  ['base.css', 'GGS.css'],
        css:  ['base.css'],
        code: [ 'libs', 'app' ],
        tmpl: '*'
});

app.use(express.static(path.join(__dirname, 'public')));

/*
// Serve this client on the root URL
ss.http.route( '/', function( req, res ) {
  res.serveClient('main');
});
*/

// Use Express to route requests
app.get('/', function(req, res){
  res.serveClient('main');
});
// Voice routes
app.all('/voice/:user/:text/:UrlOnly', routes.voice);
app.post('/voice/:user', routes.voice);
app.get('/voice/:user', routes.voice);
app.get('/tts/:id', routes.retrieveVoice);

// Use server-side compiled Hogan (Mustache) templates. Others engines available

// Minimize and pack assets if you type: SS_ENV=production node app.js
if ( ss.env === 'production' ) {
        ss.client.packAssets();
}

server = app.listen(3000);
//ss.start(server);
// Start web server
//var server = http.Server( ss.http.middleware );
//server.listen(3000);

// Start SocketStream
ss.start( server );
app.stack = ss.http.middleware.stack.concat(app.stack);
