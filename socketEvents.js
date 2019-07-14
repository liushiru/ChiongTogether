exports = module.exports = function(io) {
    // Set socket.io listeners.
    io.on('connection', (socket) => {
        console.log('new user connected');

        socket.on('chat', function(data) {
            //two users//////////////////////////////////////////////////////////////////////////
            //io.sockets.emit('chat', data);
            console.log(data);
            io.to(`${data.senderSocket}`).emit('chat', data);

        });
        /*
        // On conversation entry, join broadcast channel
        socket.on('enter conversation', (conversation) => {
            socket.leave(conversation);
        });

        socket.on('leave conversation', (conversation) => {
            socket.leave(conversation);
            console.log(conversation);
        });

        socket.on('new message', (conversation) => {
            io.sockets.in(conversation).emit('refresh messages', conversation);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        socket.on('typing', function(data){
            socket.broadcast.emit('typing', data)
        });*/
        //event
    });

    io.on('toOne', (socket) => {
        console.log
    });
}

