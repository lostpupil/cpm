var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function(client) {
    let room = Math.random().toString(36);
    console.log(`Client connected to room ${room}`);
    client.join(room);
    client.on('test', function(data) {
        let rand = Math.random().toString(36);
        io.to(room).emit("testEcho", `echo ${rand}`);
    })
    client.on('disconnect', function(data) {
        console.log(`Client disconnected to room ${room}`);
    })
});

app.use(function(req, res, next) {
    res.io = io;
    next();
});

app.use('/', index);
app.use('/users', users);


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = {
    app: app,
    server: server
};