import React, { useEffect, useRef, useState, createContext } from "react";
import { io } from "socket.io-client";
import Peer from "sample-peer";

const SocketContext = createContext();

const socket = io("http://localhost:5000");

const ContextProvider = ({ children }) => {
	const [stream, setStream] = useState(null);
    const [me, setMe] = useState('')
    const [call, setCall] = useState({})
    const [callAccepted, setcallAccepted] = useState(false)
    const [callEnded, setcallEnded] = useState(false)
    const myVideo = useRef();
	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((currentStream) => {
                setStream(currentStream);
                myVideo.current.srcObject = currentStream
            });

            socket.on('me',(id)=> setMe(id))
            socket.on('calluser',({ from, name:callName , signal})=>{
                setCall({isRecieved:true , from , name:callName , signal})
            })
	}, []);

	const answerCall = () => {
        setcallAccepted(true);

        const peer = new peer({ initiator:false , tricker:false , stream})

        peer.on('signal',(data)=>{
            socket.emit("answercall", {signal:data , to:call.from})
        })

        peer.on('stream', (currentStream)=>{

        })
    };

	const callUser = () => {};

	const leaveCall = () => {};
};
