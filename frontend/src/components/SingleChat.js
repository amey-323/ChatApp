import { ArrowBackIcon, PhoneIcon } from "@chakra-ui/icons";
import "./styles.css";
import {
  Box,
  Button,
  FormControl,
  HStack,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import Picker from "emoji-picker-react";
import SendIcon from "@material-ui/icons/Send";
import InputEmoji from "react-input-emoji";
import io from "socket.io-client";
import { useHistory } from "react-router-dom";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    calling,
    setCalling,
  } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [typer, setTyper] = useState("");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const inputRef = useRef();
  const history = useHistory();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    return () => {};
  }, [inputRef]);

  const onEmojiClick = (event, emojiObject) => {
    setNewMessage(newMessage + emojiObject.emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const toast = useToast();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", (t) => {
      setIsTyping(true);
      console.log(t);
      setTyper(t);
    });
    socket.on("stop typing", () => {
      setIsTyping(false);
      setTyper("");
    });
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  const sendMessage = async (event) => {
    setOpenEmojiPicker(false);
    if ((!event.key || event.key === "Enter") && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        // console.log(data);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
        // give notification
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chat: selectedChat._id, typer: user.name });
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    return () => {
      console.log("cleaned up");
    };
  }, []);

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            position="relative"
            zIndex={1}
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <Box
                  d="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexDir="row"
                  fontSize={{ base: "28px", md: "30px" }}
                >
                  <Tooltip
                    label="Start Video Call"
                    hasArrow
                    placement="bottom-end"
                  >
                    <IconButton
                      marginRight={4}
                      icon={<PhoneIcon />}
                      onClick={() => {
                        setCalling(true);
                        socket.emit("makingCall", {
                          from: user._id,
                          name: user.name,
                          to: selectedChat,
                        });
                      }}
                    />
                  </Tooltip>
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </Box>
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <Box
                  d="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexDir="row"
                  fontSize={{ base: "28px", md: "30px" }}
                >
                  <Tooltip
                    label="Start Video Call"
                    hasArrow
                    placement="bottom-end"
                  >
                    <IconButton
                      marginRight={4}
                      icon={<PhoneIcon />}
                      onClick={() => {
                        setCalling(true);
                        socket.emit("makingCall", {
                          from: user._id,
                          name: user.name,
                          to: selectedChat,
                        });
                      }}
                    />
                  </Tooltip>
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                  />
                </Box>
              </>
            )}
          </Box>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  {typer ? (
                    <Box
                      alignItems="center"
                      flexDir="column"
                      fontSize={16}
                      bg="white"
                      w={{ base: "11%", md: "15%" }}
                      borderRadius="lg"
                      borderWidth="1px"
                    >
                      {typer} is typing
                    </Box>
                  ) : null}
                  <Lottie
                    options={defaultOptions}
                    height={20}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <HStack align="end" justify="left">
                <Input
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  ref={inputRef}
                />
                <VStack align="end">
                  {openEmojiPicker && (
                    <Picker
                      position="relative"
                      zIndex={5}
                      preload={false}
                      onEmojiClick={onEmojiClick}
                    />
                  )}
                  <button
                    className="emotes"
                    onClick={(e) => {
                      setOpenEmojiPicker(!openEmojiPicker);
                    }}
                  >
                    😊
                  </button>
                </VStack>
                {/* <InputEmoji
                  value={newMessage}
                  onChange={(e) => {
                    typingHandler(e);
                  }}
                  onEnter={sendMessage}
                  placeholder="Type a message"
                /> */}

                <Button onClick={sendMessage} className="send-msg">
                  <SendIcon />
                </Button>
              </HStack>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
