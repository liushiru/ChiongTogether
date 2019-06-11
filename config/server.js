const server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.PORT || 5000);
console.log('Server running...');

app.get('/chatroom', (req, res) => {
    res.sendfile(__dirname + '/index.html');
})