const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

let users = {}; // Store socket IDs and usernames

io.on('connection', (socket) => {
    socket.on('set username', (username) => {
        users[socket.id].username = username;
        io.emit('user list', Object.values(users).map(user => user.username)); // Send updated user list
    });

    socket.on('start game', () => {
        assignRolesAndNotify(); // This function remains the same as previously defined
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('user list', Object.values(users).map(user => user.username)); // Update user list on disconnect
    });
});

function assignRolesAndNotify() {
    const ids = Object.keys(users);
    if (ids.length > 1) { // Ensure there are enough users
        ids.forEach(id => {
            users[id].role = 'Crewmate'; // Default role
        });

        // Randomly select one Imposter
        const imposterId = ids[Math.floor(Math.random() * ids.length)];
        users[imposterId].role = 'Imposter';

        // Notify each user of their role
        ids.forEach(id => {
            const roleMessage = users[id].role;
            io.to(id).emit('role assignment', roleMessage);
        });
    }
}

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

