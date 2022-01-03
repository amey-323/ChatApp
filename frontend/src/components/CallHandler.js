import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import io from "socket.io-client";
import { Box, Button, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

const ENDPOINT = "http://localhost:5000";

var socket;

const CallHandler = () => {
  const {
    user,
    selectedChat,
    calling,
    setCalling,
    setIsCaller,
    setCaller,
    setReceiver,
  } = ChatState();

  const history = useHistory();

  const [acceptedByMe, setAcceptedByMe] = useState(false);
  const [rejectedByMe, setRejectedByMe] = useState(false);
  const [acceptedByUser, setAcceptedByUser] = useState(false);
  const [rejectedByUser, setRejectedByUser] = useState(false);
  const [callFrom, setCallFrom] = useState({});

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      console.log("Connected");
    });
    socket.on("makingCall", (data) => {
      console.log(data);
      setAcceptedByMe(false);
      setRejectedByMe(false);
      setCallFrom(data);
    });
    socket.on("isCallAccepted", (data) => {
      setCalling(false);
      setAcceptedByUser(true);
      setRejectedByUser(false);
      setIsCaller(true);
      setReceiver(data);
      history.push("/call");
      console.log(data);
    });
    socket.on("isCallRejected", (data) => {
      setCalling(false);
      setAcceptedByUser(false);
      setRejectedByUser(true);
      console.log(data);
    });
  }, []);

  const acceptCall = (cFrom) => {
    setAcceptedByMe(true);
    socket.emit("acceptCall", {
      by: user._id,
      name: user.name,
      of: cFrom.from,
    });
    setCaller(cFrom);
    history.push("/call");
  };

  const rejectCall = () => {
    setRejectedByMe(true);
    socket.emit("rejectCall", {
      by: user._id,
      name: user.name,
      of: callFrom.from,
    });
    setCallFrom({});
  };

  // console.log(callerData);

  if (calling) {
    // console.log(selectedChat.users);

    var text = "Calling ";
    selectedChat.users.forEach((u) => {
      if (u._id !== user._id) {
        text += `${u.name} `;
      }
    });

    return (
      <Box
        d="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDir={{ base: "column", md: "row" }}
        px={5}
        py={3}
        mt={2}
        mx={3}
        bgColor="grey"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text>{text}</Text>
      </Box>
    );
  }

  if (acceptedByUser) {
    return <div>Call accepted</div>;
  }

  if (rejectedByUser) {
    return <div>Call rejected</div>;
  }

  return !acceptedByMe && !rejectedByMe && callFrom.name ? (
    <Box
      d="flex"
      alignItems="center"
      justifyContent="space-between"
      flexDir={{ base: "column", md: "row" }}
      px={5}
      py={3}
      mt={2}
      mx={3}
      bgColor="grey"
      borderRadius="lg"
      borderWidth="1px"
    >
      <Text pb={{ base: 2, md: 0 }} color="white">
        {callFrom.name} is calling...
      </Text>
      <div>
        <Button
          mr={2}
          bgColor="green"
          color="white"
          onClick={() => acceptCall(callFrom)}
        >
          Accept
        </Button>
        <Button ml={2} bgColor="red" color="white" onClick={() => rejectCall()}>
          Reject
        </Button>
      </div>
    </Box>
  ) : null;
};

export default CallHandler;
