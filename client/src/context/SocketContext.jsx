import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

export const SOCKET_URL = "http://localhost:3000";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io("http://localhost:3000/"), []);

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState();

  const [onCall, setOnCall] = useState(false);

  const [inComingCall, setInComingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [inComingCallDetails, setInComingCallDetails] = useState(null);

  const [callEnded, setCallEnded] = useState(false);

  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const [stream, setStream] = useState();

  const connectionRef = useRef();

  const CallToUser = async (userSocketId) => {
    if (onCall) return;
    setOnCall(true);
    console.log(stream);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      console.log("Call User With Signal", data);
      socket.emit("CALL:TO:USER", {
        callToUserId: userSocketId,
        signal: data,
        fromUser: currentUser,
      });
    });

    peer.on("stream", (stream) => {
      console.log("Received remote stream:", stream); // Debugging log
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
    });
    socket.once("CALL:ACCEPT", (data) => {
      console.log("CALL ACCEPT FROM THE USER ", data);

      setCallAccepted(true);
      setInComingCall(false);
      setInComingCallDetails(data);

      peer.signal(data.signal);
    });

    connectionRef.current = peer;
  };

  const handleRejectCall = () => {
    socket.emit("REJECT:CALL", {
      rejectedFrom: currentUser,
      to: inComingCallDetails.fromUser,
    });
    setCallAccepted(false);
    setInComingCall(false);
    setInComingCallDetails(null);
    window.location.reload();
  };

  const handleAcceptCall = () => {
    setCallAccepted(true);
    setOnCall(true);
    setInComingCall(false);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      console.log("Accept Call With Signal", data);
      socket.emit("ACCEPT:CALL", {
        signal: data,
        fromUser: currentUser,
        to: inComingCallDetails.fromUser,
      });
    });

    peer.on("stream", (stream) => {
      userVideoRef.current.srcObject = stream;
    });
    console.log("CALLER SIGNAL", inComingCallDetails.signal);
    if (!inComingCallDetails.signal) return;

    peer.signal(inComingCallDetails.signal);

    connectionRef.current = peer;
  };

  const EndCall = () => {
    socket.emit("END:CALL", {
      fromUser: currentUser,
      to: inComingCallDetails.fromUser,
    });
    setOnCall(false);
    setCallAccepted(false);
    setInComingCall(false);
    setCallEnded(true);
    // Stop all media tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null); // Clear the stream state

    // Optionally clear the video element
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = null;
    }

    if (userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.on("newUsers", (data) => {
      setUsers(data);
    });

    socket.on("me", (value) => {
      setCurrentUser(value);
    });

    socket.on("INCOMING:CALL", (data) => {
      console.log("Incoming Call", data);

      setInComingCall(true);
      setInComingCallDetails(data);
    });

    socket.on("CALL:END", (data) => {
      setOnCall(false);
      setCallAccepted(false);
      setInComingCall(false);
      setCallEnded(true);
      // Stop all media tracks
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setStream(null); // Clear the stream state

      // Optionally clear the video element
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = null;
      }

      if (userVideoRef.current) {
        userVideoRef.current.srcObject = null;
      }
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      window.location.reload();
    });

    return () => {
      socket.off("newUsers");
      socket.off("me");
      socket.off(" INCOMING:CALL");
      socket.off("CALL:END");

      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on("CALL:REJECTED", (data) => {
      alert("Call Rejected From " + data.rejectedFrom.name);
      setOnCall(false);

      // Stop all media tracks
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setStream(null); // Clear the stream state

      // Optionally clear the video element
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = null;
      }
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      window.location.reload();
    });

    socket.on("USER:DISCONNECT", (data) => {
      if (data.fromUser === inComingCallDetails?.fromUser.id) {
        setOnCall(false);
        setCallAccepted(false);
        setInComingCall(false);
        setCallEnded(true);
        // Stop all media tracks
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setStream(null); // Clear the stream state

        // Optionally clear the video element
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = null;
        }

        if (userVideoRef.current) {
          userVideoRef.current.srcObject = null;
        }
        if (connectionRef.current) {
          connectionRef.current.destroy();
        }
      }
    });
    return () => {
      socket.off("CALL:REJECTED");
      socket.off("USER:DISCONNECT");
    };
  }, [stream, inComingCallDetails]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
      });

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onCall]);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        console.error("No audio track found!");
        return;
      }

      // Toggle local track
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);

      // Replace track in peer connection
      if (connectionRef.current) {
        const audioSender = connectionRef.current._pc
          .getSenders()
          .find((sender) => sender.track?.kind === "audio");

        if (audioSender) {
          audioSender
            .replaceTrack(audioTrack)
            .catch((err) => console.error("Error replacing audio track:", err));
        } else {
          console.warn("No audio sender found in peer connection!");
        }
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        console.error("No video track found!");
        return;
      }

      // Toggle local track
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);

      // Replace track in peer connection
      if (connectionRef.current) {
        const videoSender = connectionRef.current._pc
          .getSenders()
          .find((sender) => sender.track?.kind === "video");

        if (videoSender) {
          videoSender
            .replaceTrack(videoTrack)
            .catch((err) => console.error("Error replacing video track:", err));
        } else {
          console.warn("No video sender found in peer connection!");
        }
      }
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socket,
        users: users,
        currentUser: currentUser,
        myVideoRef,
        userVideoRef,
        stream,
        setStream,
        connectionRef,
        onCall,
        setOnCall,
        CallToUser,
        EndCall,
        inComingCall,
        callAccepted,
        inComingCallDetails,
        setInComingCall,
        setCallAccepted,
        handleRejectCall,
        handleAcceptCall,

        toggleAudio,
        toggleVideo,
        audioEnabled,
        videoEnabled,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
