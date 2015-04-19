// Require our dependencies
var express = require('express'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  exphbs = require('express-handlebars'),
  http = require('http'),
  secret = require('./config/app.js').secret;
  routes = require('./routes');


// Create an express instance and set a port variable
var app = express();
var port = process.env.PORT || 8080;

// Set handlebars as the templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Disable etag headers on responses
app.disable('etag');

// Let's use sessions to store incoming session_token from freebox and use the api
app.use("/", express.static(__dirname + "/public/"));

app.use(cookieParser());
app.use(session({secret: secret, resave: true, saveUninitialized: true}));

// Fire this bitch up (start our server)
var server = http.createServer(app).listen(port, function() {
  console.log('Express server listening on port ' + port);
});

// Initialize socket.io
var io = require('socket.io').listen(server);

// Index Route
app.get('/logout', routes.logout);
app.get('/', routes.home(io));
