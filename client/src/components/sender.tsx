import { useEffect, useState,useRef } from "react"


function Sender() {

    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null); 
    
    useEffect( () =>{

        const socket = new WebSocket('ws://localhost:8080')
        setSocket(socket)

        if(socket)
        {
            socket.onopen = () => {
                socket?.send(JSON.stringify({
                    type: "sender"
                }))
            }
        }
       
    } , [])

    const initiateConn = () => {
        console.log("initiating conn");
        
        if(!socket) 
        {
            console.log("no socket");
            
            return 
           
            
        }
        const pc = new RTCPeerConnection()
        setPc(pc)
     
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

     

        
        if(pc)
        {
            sendStream(pc)

            pc.onicecandidate = (event) =>{
            
                if(event.candidate)
                {
                    socket.send(JSON.stringify({type : "iceCandidate" , candidate : event.candidate}))
                }


            }

            pc.onnegotiationneeded = async() => {
                console.log("offer creating ");
                
                const offer =  await pc.createOffer()
                await pc.setLocalDescription(offer)
                socket?.send(JSON.stringify({
                    type: 'createOffer',
                    sdp: pc.localDescription
                }));

               

            }
        

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

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

        }

        catch(e)
        {
            console.log(e);
            
        }
    }
  

    return (
    <div >
       <div>
       <video ref={videoRef} autoPlay playsInline  ></video>
       </div>
      <button onClick={initiateConn}> send video </button>
    </div>
  )
}

export default Sender
