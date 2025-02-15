

import { useEffect, useRef, useState } from "react"


function  Receiver (){
    const videoRef = useRef<HTMLVideoElement | null>(null); 
        
    const [socket, setSocket] = useState <WebSocket | null>(null)
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        setSocket(socket)
        console.log(socket);
        
      
    }, []);
    

    function startReceiving(socket: WebSocket | null) {
       console.log(socket);
       

        const pc = new RTCPeerConnection();
        pc.ontrack = (event) => {
            console.log(event);
            
            if (videoRef.current) {
                videoRef.current.srcObject = new MediaStream([event.track]);
            }
        };
      
        
       if(socket)
       {
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {
                console.log("offer received");
                
                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        }
       }
    }

    return <div>

    <div>
       <video ref={videoRef} autoPlay playsInline  ></video>

       <button onClick = { () =>  {
        startReceiving(socket)
       }}>
        Receive Video 
       </button>
       </div>
    </div>
}

export default Receiver