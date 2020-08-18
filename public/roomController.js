var videoMapping=new Map();//peer id, video stream element


var i = 0;
openStream().then(localStream => {

    var microphone=$('#microphone');
    var camera=$('#camera');
    microphone.prop("checked", true);
    camera.prop("checked", true);
    microphone.change(function(){
        setMicrophone(localStream, microphone);
    })
    camera.change(function(){
        setCamera(localStream, camera);
    })

    const socket = io('http://192.168.1.13:3000',{
        reconnection: false
    });
    socket.once('connect', function () {

        //Start peer connection
        const peer = new Peer({ host:'peerjs-server-mobchar26.herokuapp.com', secure: true, port:443});
        // const peer = new Peer();
        // peer.on('error', function(err) { console.log(err) });


        setAnswerCall(peer, localStream);

        peer.once('open', id => {
            //Handler disconnected 
            peer.on('disconnected',function(){
                try{
                    peer.reconnect();
                }
                catch(e){
                    alert('You have been disconnected. Reload the page !!!');
                    location.reload();
                }
            })
            playNewStream(id,localStream);

            socket.on('join-successed', function (data) {
                data = JSON.parse(data);
                //Call all people in the room
                let onlinePeerId = data.onlineIdList;
                onlinePeerId.forEach(peerId => {
                    callPeer(peerId, peer, localStream);
                });

            })
            socket.on('new-peer-join', data => {
                data = JSON.parse(data);
                if (data.peerId != id) {
                    callPeer(data.peerId, peer, localStream);
                }
            })

            socket.on('disconnected', data =>{
                data=JSON.parse(data);
                removeStream(data.peerId);
            })

            socket.on('disconnect',reason=>{
                alert('You have been disconnected. Reload the page !!!');
                location.reload();
            })

            // socket.on('reconnect',attempt=>{
            //     alert("Reconnet to server");
            //     try{
            //         peer.reconnect();//Try to reconnect with old peer id
            //         // emitJoinFrame(socket, id);
            //     }
            //     catch(e){
            //         alert("Unable to reconnect please reload the page");
            //     }
            // })

            // let pieces = window.location.pathname.split('/');
            // let data = { roomId: pieces[pieces.length - 1], peerId: id };
            // socket.emit('join', JSON.stringify(data));

            emitJoinFrame(socket, id);

            //Emit Json data to server socket.io
            // $('#yourPeerId').append(id);
        });

    })
})


function setMicrophone(stream, checkBox){
    if(checkBox.is(":checked")){
        stream.getTracks().forEach(function(track) {
            if (track.readyState == 'live' && track.kind === 'audio') {
                track.enabled=true;
            }
        });
    }
    else{
        stream.getTracks().forEach(function(track) {
            if (track.readyState == 'live' && track.kind === 'audio') {
                track.enabled=false;
            }
        });
    }
}

function setCamera(stream, checkBox){
    if(checkBox.is(":checked")){
        stream.getTracks().forEach(function(track) {
            if (track.readyState == 'live' && track.kind === 'video') {
                track.enabled=true;
            }
        });
    }
    else{
        stream.getTracks().forEach(function(track) {
            if (track.readyState == 'live' && track.kind === 'video') {
                track.enabled=false;
            }
        });
    }
}
//Notification
function notify(message){
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      }
    
      // Let's check whether notification permissions have already been granted
      else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(message);
      }
    
      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            var notification = new Notification(message);
          }
        });
      }
}

function emitJoinFrame(socket, yourPeerId){
    let pieces = window.location.pathname.split('/');
    let data = { roomId: pieces[pieces.length - 1], peerId: yourPeerId };
    socket.emit('join', JSON.stringify(data));
}

//Peer
function callPeer(id, peer, stream) {
    const call = peer.call(id, stream);
    call.once('stream', remoteStream => {
        playNewStream(id,remoteStream);
    });
}

function setAnswerCall(peer, stream) {
    peer.on('call', call => {
        peer.on('stream', remoteStream => {
            playNewStream(call.id, remoteStream);
            notify("User with id "+call.id+" have joined the room");
        });

        call.answer(stream);
    })
}
///////////////////////////////////////// Video Element handler
function openStream() {
    const config = { audio: true, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}

function playNewStream(id, stream) {
    $("#mainLayout").append('<div class="videoContainer"><video class="videoStream" controls></video></div>');
    var videoElement=$('.videoStream')[i];
    videoElement.srcObject =stream;

    //Mapping peer id with video stream element
    videoMapping.set(id,$('.videoContainer')[i]);
    videoElement.play();
    i++;
}

function removeStream(id){
    var videoElement=videoMapping.get(id);
    if(videoElement!=null){
        delete videoElement.srcObject;
        videoElement.remove();
        videoMapping.delete(id);
        --i;
    }
   
}



