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
//let locations = {}; //to store locations later
let locations = [];

io.on('connection', (socket) => {
    // Initialize user object on new connection
    users[socket.id] = { username: '', role: '' };
    
     socket.on('set username', (username) => {
        if (users[socket.id]) {
            users[socket.id].username = username;
            // Emit updated user list to all clients
            io.emit('user list', Object.values(users).map(user => user.username));
        }
        else{
            console.log('no users i think');
        }
    });
//    socket.on('send locations', (customLocations) => {
        //console.log('in the socket part: ' + customLocations);
//        assignLocation(customLocations); // assign custom locations
//    });
    socket.on('start game', () => {
        socket.on('send locations', (customLocations) => {
          //console.log('in the socket part: ' + customLocations);
          assignLocation(customLocations); // assign custom locations
        });
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
        //assignLocation();
        if(locations.length > 0){
            let randomLocation = locations[Math.floor(Math.random() * locations.length)];
            ids.forEach(id => {
               if(users[id].role === 'Crewmate'){
                    console.log('crewmates are assigned to: ' + randomLocation);
                    io.to(id).emit('location notification', randomLocation);
               }
            });
        }
     }
}

function assignLocation(customLocations) {
     const locationsArray = customLocations.split(',').map(location => location.trim());

     const cleanLocationsArray = locationsArray.filter(location => location !== ''); // clean up the array
     //locations.push(locationsArray);
     locations = [...cleanLocationsArray];
     let random = Math.floor(Math.random() * locations.length);
     console.log("custom locations: " + customLocations);
     console.log("Amount of locations: " + locations.length);
     console.log("picking from array number: " + random);
     console.log("Location: " + locations[random]);
     assignRolesAndNotify();
}

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

