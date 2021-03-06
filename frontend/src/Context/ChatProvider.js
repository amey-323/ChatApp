import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  //Related to Calling
  const [caller, setCaller] = useState({});
  const [receiver, setReceiver] = useState({});
  const [calling, setCalling] = useState(false);
  const [isCaller, setIsCaller] = useState(false);

  //Delete Messages, chat
  const [deleteChatMode, setDeleteChatMode] = useState(false);
  const [deleteMsgsMode, setDeleteMsgsMode] = useState(false);
  const [isDeleteMe, setIsDeleteMe] = useState(true);
  const [selectedMsgs, setSelectedMsgs] = useState([]);

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) history.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        chats,
        setChats,
        notification,
        setNotification,
        //related to calls
        caller,
        setCaller,
        calling,
        setCalling,
        isCaller,
        setIsCaller,
        receiver,
        setReceiver,
        //Related to deletion
        deleteChatMode,
        setDeleteChatMode,
        deleteMsgsMode,
        setDeleteMsgsMode,
        selectedMsgs,
        setSelectedMsgs,
        isDeleteMe,
        setIsDeleteMe,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
