const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage  = require('./utils/messages');
const app  = express();
const server = http.createServer(app);
const io = socketio(server);
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chaterpillar Bot';

//client connection
io.on('connection', socket => {

    socket.on('joinroom', ({username, room}) => {
        //console.log(username);
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //console.log(user.username);
        //welcome current user (only current user will see)
        socket.emit('message', formatMessage(botName, 'Welcome to Chaterpillar!'));

        //user connects (everybody else will see)
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined`));

        //users info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //console.log('connected...');

    //catch chat msg
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username,msg));
    });

    //user disconnects (everybody will see)
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user) {
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} left`));

            //users info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
        
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server started at ${PORT}`);
})