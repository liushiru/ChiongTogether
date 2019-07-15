exports = module.exports = function(io) {
    // Set socket.io listeners.
    var result = _.without(['three','seven','eleven'], 'seven');
    io.on('connection', (socket) => {
        console.log('new socket connected: ' + socket.id);
        

        socket.on('openess', (info) => {
            console.log('info.openerId: '+ info.openerId);
            var a = info.openerId;
                    socket.on('chat', function(data) {
                    console.log('data.senderSocket: ' + data.senderSocket);
                    console.log(a + '===' + data.recipient);
                    if(info.openerId === data.recipient) {
                        io.to(`${info.openerSocket}`).emit('chat', data);
                        console.log('event 1')
                    }

                    if (equal(a, data.recipient)) {
                        console.log(equal(a, data.recipient));
                        console.log('event_1');
                    }
                    
                    //To one self;
                    io.to(`${data.senderSocket}`).emit('chat', data);
                    console.log('event 2')
                });
                    console.log(1);
                    //function helper ()
        });

        //To oneself;
        socket.on('chat', function(data) {
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

