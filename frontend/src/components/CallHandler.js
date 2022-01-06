import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import io from "socket.io-client";
import { Box, Button, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import Lottie from "react-lottie";

import { callOptions, callRejectionOptions } from "../config/AnimationOptions";

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

  const [acceptOrRejectByMe, setAcceptOrRejectByMe] = useState(false);
  const [acceptedByUser, setAcceptedByUser] = useState(false);
  const [rejectedByUser, setRejectedByUser] = useState(false);
  // const [errorMsg, setErrorMsg] = useState("");
  const [callFrom, setCallFrom] = useState({});

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      console.log("Connected");
    });

    socket.on("makingCall", (data) => {
      console.log(data);
      setAcceptOrRejectByMe(false);
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
    setAcceptOrRejectByMe(true);
    socket.emit("acceptCall", {
      by: user._id,
      name: user.name,
      of: cFrom.from,
    });
    setCaller(cFrom);
    history.push("/call");
  };

  const rejectCall = () => {
    setAcceptOrRejectByMe(true);
    socket.emit("rejectCall", {
      by: user._id,
      name: user.name,
      of: callFrom.from,
    });
    setCallFrom({});
  };

  if (calling) {
    return (
      <Box
        d="flex"
        alignItems="center"
        justifyContent="start"
        flexDir={{ base: "column", md: "row" }}
        px={5}
        py={3}
        mt={2}
        mx={3}
        bg="#38B2AC"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text
          color="white"
          mr={{ base: 0, md: 5 }}
          ml={{ base: 0, md: 3 }}
          fontSize={20}
        >
          Calling...
        </Text>

        {selectedChat.users.map((u) => {
          return u._id !== user._id ? (
            <Box
              bg="white"
              color="black"
              px={5}
              py={2}
              mx={2}
              my={{ base: 2, md: 0 }}
              borderRadius="lg"
              key={u._id}
            >
              {u.name}
            </Box>
          ) : null;
        })}
        <Lottie options={callOptions} height={100} width={100} />
      </Box>
    );
  }

  if (acceptedByUser) {
    return (
      <Box
        d="flex"
        alignItems="center"
        justifyContent="start"
        flexDir={{ base: "column", md: "row" }}
        px={5}
        py={3}
        mt={2}
        mx={3}
        bg="#38B2AC"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text
          color="white"
          mr={{ base: 0, md: 5 }}
          ml={{ base: 0, md: 3 }}
          fontSize={20}
        >
          Call accepted
        </Text>
      </Box>
    );
  }

  if (rejectedByUser) {
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
        bg="#38B2AC"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text
          color="white"
          mr={{ base: 0, md: 5 }}
          ml={{ base: 0, md: 3 }}
          fontSize={20}
        >
          Call rejected
        </Text>
        <Lottie options={callRejectionOptions} height={70} width={70} />
      </Box>
    );
  }

  return !acceptOrRejectByMe && callFrom.name ? (
    <Box
      d="flex"
      alignItems="center"
      justifyContent="space-between"
      flexDir={{ base: "column", md: "row" }}
      px={5}
      py={3}
      mt={2}
      mx={3}
      bg="#38B2AC"
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        d="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDir={{ base: "column", md: "row" }}
      >
        <Text
          color="white"
          mr={{ base: 0, md: 5 }}
          ml={{ base: 0, md: 3 }}
          fontSize={20}
        >
          {callFrom.name} is calling...
        </Text>
        <Lottie options={callOptions} height={100} width={100} />
      </Box>
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
