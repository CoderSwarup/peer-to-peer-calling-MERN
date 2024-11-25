import "./App.css";
import IncomingCallDialog from "./components/IncomingCallDialog";
import SideBar from "./components/SideBar";
import VideoDashBoard from "./components/VideoDashBoard";
import { useSocket } from "./context/SocketContext";

function App() {
  const { onCall, setOnCall } = useSocket();
  return (
    <div className="w-[100vw] h-[100vh] overflow-hidden flex items-center justify-center ">
      <SideBar />
      {onCall ? (
        <VideoDashBoard />
      ) : (
        <div className="flex-1 flex flex-col h-full p-4 w-[100%] items-center justify-center">
          <h1>Call To The User</h1>
        </div>
      )}
      <IncomingCallDialog />
    </div>
  );
}

export default App;
