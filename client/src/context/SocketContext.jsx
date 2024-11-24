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

  const myVideoRef = useRef();
  const [stream, setStream] = useState();

  const connectionRef = useRef(); // Peer Connection Refrence

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

    connectionRef.current = peer;
  };

  const EndCall = () => {
    setOnCall(false);
    console.log(stream);
    // Stop all media tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null); // Clear the stream state
    }

    // Optionally clear the video element
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = null;
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
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socket,
        users: users,
        currentUser: currentUser,
        myVideoRef,
        stream,
        setStream,
        connectionRef,
        onCall,
        setOnCall,
        CallToUser,
        EndCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
