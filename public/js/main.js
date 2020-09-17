const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username and room id
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

console.log(username, room);

// join room
socket.emit('joinroom', {username, room});

//get rooms and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

//message from server
socket.on('message', msg => {
    console.log(msg);
    outputMessage(msg);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e)=> {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value='';
    e.target.elements.msg.focus();
});

const outputMessage = msg => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta"> ${msg.username} <span>${msg.time}</span></p>
    <p class="text">
        ${msg.text}
    </p>` ;
    document.querySelector('.chat-messages').appendChild(div); 
};

//add room name to dom 
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users to dom
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}