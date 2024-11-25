import React from "react";
import { useSocket } from "../context/SocketContext";
import { FaPhoneAlt, FaPhoneSlash } from "react-icons/fa";

export default function IncomingCallDialog() {
  const {
    inComingCall,
    inComingCallDetails,
    callAccepted,
    handleRejectCall,
    handleAcceptCall,
  } = useSocket();

  if (!inComingCall || callAccepted) {
    return null;
  }

  const { fromUser } = inComingCallDetails || {};
  const callerName = fromUser?.name || "Unknown Caller";

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md text-center">
        <h1 className="text-xl font-bold mb-4">Incoming Call</h1>
        <p className="text-gray-600 mb-6">📞 {callerName} is calling you...</p>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleAcceptCall}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 hover:bg-green-600 transition duration-200"
          >
            <FaPhoneAlt />
            Accept
          </button>
          <button
            onClick={handleRejectCall}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 hover:bg-red-600 transition duration-200"
          >
            <FaPhoneSlash />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
