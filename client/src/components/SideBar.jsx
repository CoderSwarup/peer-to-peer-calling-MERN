import React, { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { TbPhoneCall } from "react-icons/tb";
import { FcVideoCall } from "react-icons/fc";
import { FaCircleUser } from "react-icons/fa6";

export default function SideBar() {
  const { currentUser, users, CallToUser } = useSocket();
  const [activeUser, setActiveUser] = React.useState([]);

  useEffect(() => {
    if (users.length > 0) {
      setActiveUser(users.filter((user) => user.id !== currentUser.id));
    }
  }, [users]);

  return (
    <div className="w-[200px] border-r-4 border-indigo-500	h-full ">
      <h1 className="font-bold text-xl text-center">USERS LIST</h1>
      <div className="flex flex-col justify-between h-full p-4">
        {activeUser?.map((user, idx) => {
          return (
            <div key={idx} className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FaCircleUser
                  className="w-8 h-8
                  rounded-full"
                />
                <span className="ml-2">{user.name}</span>
              </div>
              <div className="flex items-center justify-center ml-auto gap-2">
                <TbPhoneCall
                  color="green"
                  size={20}
                  className="cursor-pointer"
                  onClick={() => CallToUser(user.id)}
                />
                <FcVideoCall
                  size={20}
                  className="cursor-pointer"
                  onClick={() => CallToUser(user.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
