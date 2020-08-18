module.exports = function (io, socket, onlineList) {
    socket.once('join', function (data) {
        data = JSON.parse(data);
        //Remember to check
        //Every peer in room received new peer coming message
        //New peer received online peer id

        var onlinePeerId = Array.from(onlineList.get(data.roomId));

        io.to(data.roomId).emit('new-peer-join', JSON.stringify({ peerId: data.peerId }));
        socket.join(data.roomId);
        socket.emit('join-successed', JSON.stringify({
            onlineIdList:  onlinePeerId
        }));

        onlineList.get(data.roomId).push(data.peerId);



        socket.on('disconnect', (reason) => {
            onlineList.set(data.roomId,onlineList.get(data.roomId).filter(function (value, index, arr) { return value != data.peerId; }));
            io.to(data.roomId).emit('disconnected',JSON.stringify({peerId: data.peerId}));
        });
    });

}