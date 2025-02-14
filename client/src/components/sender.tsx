import { useEffect, useState,useRef } from "react"


function Sender() {

    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null); 
    
    useEffect( () =>{

        const socket = new WebSocket('ws://localhost:8080')
        setSocket(socket)
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: "sender"
            }))
        }
    } , [])

    const initiateConn = () => {
        if(!socket) 
        {
            return 
        }
        if(pc)
        {
            
            socket.onmessage = async (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'createAnswer') {
                    await pc.setRemoteDescription(message.sdp);
                } else if (message.type === 'iceCandidate') {
                    pc.addIceCandidate(message.candidate);
                }
            }
        }

        const newPc = new RTCPeerConnection()
        setPc(newPc)

        
        if(pc)
        {
                
            pc.onicecandidate = (event) =>{
            
                if(event.candidate)
                {
                    socket.send(JSON.stringify({type : "iceCandidate" , candiate : event.candidate}))
                }


            }

            pc.onnegotiationneeded = async() => {
                const offer =  await pc.createOffer()
                await pc.setLocalDescription(offer)
                socket?.send(JSON.stringify({
                    type: 'createOffer',
                    sdp: pc.localDescription
                }));

                sendStream(pc)

            }

        }
        const sendStream = async (pc : RTCPeerConnection) => {
            try{
                const stream = await navigator.mediaDevices.getUserMedia({
                    video:true, audio:true
                })

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                pc.addTrack(stream.getTracks()[0])

            }

            catch(e)
            {
                console.log(e);
                
            }
        }
      



    }

    return (
    <div >
        <video ref={videoRef} ></video>
      <button onClick={initiateConn}> send video </button>
    </div>
  )
}

export default Sender
