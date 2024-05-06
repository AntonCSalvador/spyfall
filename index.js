const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
     connectionStateRecovery: {} //this is just for disconnect stuff 
});

app.get('/', (req, res) => {
     res.sendFile(join(__dirname, 'index.html'));
});

let roomId = '';

io.on('connection', (socket) => {
    let usernameSet = false;
    let username = '';

    socket.on('set username', (name) => {
        if (!usernameSet) {
            username = name;
            usernameSet = true;
            socket.emit('username set', true);
            io.emit('user list', Object.values(users).map(user => user.username));

        } else {
            socket.emit('username set', false);
        }
    });

    socket.on('chat message', (data) => {
        if (usernameSet) {
            const { username, message } = data;
            io.emit('chat message', { username, message });
        }
    });

    socket.on('disconnect', () => {
        console.log(`${username} disconnected`);
    });
});


server.listen(3000, () => {
     console.log('server running at http://localhost:3000');
});

/* THIS IS FOR "If you want to send a message to everyone except for a certain emitting socket, we have the broadcast flag for emitting from that socket"
io.on('connection', (socket) => {
  socket.broadcast.emit('hi');
}); */

/* to transfer from front end to backend, 
 * client does socket.emit('hello', 'world');
 * then server will look for the key w/socket.on and pass in the 2nd one as the arg, ex: 
 * io.on('connection', (socket) => {
       socket.on('hello', (arg) => {
         console.log(arg); // 'world'
       });
     });
you can also do it the opposite way with
Server

io.on('connection', (socket) => {
  socket.emit('hello', 'world');
});

Client

socket.on('hello', (arg) => {
  console.log(arg); // 'world'
});
*/
