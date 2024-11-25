import { useState } from "react";
import { useSocket } from "./SocketContext";

export default function useScreenCapture() {
  const { stream, connectionRef, myVideoRef } = useSocket();
  const [screenSharing, setScreenSharing] = useState(false);

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      if (connectionRef?.current) {
        const sender = connectionRef.current._pc
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      }

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = screenStream;
      }

      setScreenSharing(true); // Update state

      screenTrack.onended = () => stopScreenShare();
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  const stopScreenShare = async () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (connectionRef?.current) {
        const sender = connectionRef.current._pc
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }
    }

    setScreenSharing(false); // Update state
  };

  return { shareScreen, stopScreenShare, screenSharing };
}
