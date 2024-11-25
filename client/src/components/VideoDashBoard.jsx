import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import peer from "simple-peer";
import { FcEndCall } from "react-icons/fc";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import { MdScreenShare } from "react-icons/md";
import { MdStopScreenShare } from "react-icons/md";
import useScreenCapture from "../context/useScreenCapture";

export default function VideoDashBoard() {
  const {
    socket,
    myVideoRef,
    userVideoRef,
    stream,
    setStream,
    connectionRef,
    EndCall,
    onCall,

    toggleAudio,
    toggleVideo,
    audioEnabled,
    videoEnabled,
  } = useSocket();

  const { shareScreen, stopScreenShare, screenSharing } = useScreenCapture();

  return (
    <div className="flex-1 flex flex-col h-full p-4 w-[100%] bg-red-100">
      <h1 className="text-2xl font-bold text-center">Video DashBoard</h1>
      <div className="w-full h-full flex flex-1 items-center justify-center">
        <div>
          <h1>Local Video</h1>
          <video ref={myVideoRef} autoPlay muted></video>
        </div>
        <div>
          <h1>Remote Video</h1>
          <video ref={userVideoRef} autoPlay></video>
        </div>
      </div>
      <div className="my-4 w-full p-2 flex items-center justify-center gap-3">
        <button onClick={toggleAudio} className="p-2 rounded-full bg-gray-200">
          {audioEnabled ? (
            <FaMicrophone size={24} />
          ) : (
            <FaMicrophoneSlash size={24} />
          )}
        </button>
        <button onClick={toggleVideo} className="p-2 rounded-full bg-gray-200">
          {videoEnabled ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
        </button>
        {screenSharing ? (
          <button
            onClick={stopScreenShare}
            className="p-2 rounded-full bg-gray-200"
            title="Stop Screen Sharing"
          >
            <MdStopScreenShare size={24} />
          </button>
        ) : (
          <button
            onClick={shareScreen}
            className="p-2 rounded-full bg-gray-200"
            title="Share Screen"
          >
            <MdScreenShare size={24} />
          </button>
        )}
        <FcEndCall size={30} onClick={EndCall} />
      </div>
    </div>
  );
}
