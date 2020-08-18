const express = require('express');
const fs = require('fs');
const favicon = require('serve-favicon');
const setupSocket = require('./config/setupSocket');
const roomRouter = require('./config/routes/roomRouter');

const app = express();
exports.app = app;

const server =
    app
        .set('view engine', 'ejs')
        .set('views', __dirname + '/public/views')
        .use(favicon(__dirname + '/public/favicon/favicon.ico'))
        .use(function (req, res, next) {//Debugging request
            console.log(req.method + " " + req.path);
            next();
        })
        .get('/', function (req, res) {//Main page
            console.log("Receive index");
            res.render('index.ejs', {
                rooms: Array.from(roomRouter.onlineList.keys())
            });
            console.log("Ended index");
        }
        )
        .use(roomRouter.router)//Router handler
        .use(express.static(__dirname + '/public/'))//Static file
        .get('*', function (req, res) {
            res.status(404).send('404 Page not found !');
        })
        .use(function (err, req, res, next) {
            res.status(500).send('500 Something broke!')
        })
        .listen(3000);
//Set up socket 
const io = require('socket.io')(server);
io.eio.pingTimeout = 2000;
io.eio.pingInterval = 5000;
io.on('connection', client => {
    setupSocket(io, client, roomRouter.onlineList);
})
