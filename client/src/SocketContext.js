import React, { useEffect, useRef, useState, createContext } from "react";
import { io } from "socket.io-client";
import peer from "simple-peer";

const SocketContext = createContext();

const socket = io("http://localhost:5000");

const ContextProvider = ({ children }) => {
	const [stream, setStream] = useState(null);
	const [me, setMe] = useState("");
	const [call, setCall] = useState({});
	const [callAccepted, setcallAccepted] = useState(false);
	const [callEnded, setcallEnded] = useState(false);
	const [name, setName] = useState("");
	const myVideo = useRef();
	const userVideo = useRef();
	const connectionRef = useRef();
	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((currentStream) => {
				setStream(currentStream);
				myVideo.current.srcObject = currentStream;
			});

		socket.on("me", (id) => setMe(id));
		socket.on("calluser", ({ from, name: callName, signal }) => {
			setCall({ isRecieved: true, from, name: callName, signal });
		});
	}, []);

	const answerCall = () => {
		setcallAccepted(true);

		const peer = new peer({ initiator: false, tricker: false, stream });

		peer.on("signal", (data) => {
			socket.emit("answercall", { signal: data, to: call.from });
		});

		peer.on("stream", (currentStream) => {
			userVideo.current.srcObject = currentStream;
		});

		peer.signal(call.signal);

		connectionRef.current = peer;
	};

	const callUser = (id) => {
		const peer = new peer({ initiator: true, tricker: false, stream });

		peer.on("signal", (data) => {
			socket.emit("calluser", {
				userTocall: id,
				signalData: data,
				from: me,
				name,
			});
		});

		peer.on("stream", (currentStream) => {
			userVideo.current.srcObject = currentStream;
		});

		socket.on("callaccepted", (signal) => {
			setcallAccepted(true);
			peer.signal(signal);
		});

		connectionRef.current = peer;
	};

	const leaveCall = () => {
		setcallEnded(true);
		connectionRef.current.destroy();
		window.location.reload();
	};

	return (
		<SocketContext.Provider
			value={{
				call,
				callAccepted,
				myVideo,
				userVideo,
				stream,
				name,
				setName,
				callEnded,
				me,
				callUser,
				leaveCall,
				answerCall,
			}}>
			{children}
		</SocketContext.Provider>
	);
};

export { ContextProvider, SocketContext };
