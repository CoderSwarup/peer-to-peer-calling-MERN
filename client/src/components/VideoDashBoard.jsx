import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import peer from "simple-peer";
import { FcEndCall } from "react-icons/fc";

export default function VideoDashBoard() {
  const { socket, myVideoRef, stream, setStream, connectionRef, EndCall } =
    useSocket();

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
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full p-4 w-[100%] bg-red-100">
      <h1 className="text-2xl font-bold text-center">Video DashBoard</h1>
      <div className="w-full h-full flex flex-1 items-center justify-center">
        <div>
          <h1>Local Video</h1>
          <video ref={myVideoRef} autoPlay muted></video>
        </div>
      </div>
      <div className="my-4 w-full p-2 flex items-center justify-center gap-3">
        <FcEndCall size={30} onClick={EndCall} />
      </div>
    </div>
  );
}
