import { Box } from "@chakra-ui/react";
import Button from "@material-ui/core/Button";
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import { ChatState } from "../Context/ChatProvider";
import "./CallPage.css";

const socket = io.connect("http://localhost:5000");

const CallPage = () => {
  const [stream, setStream] = useState();
  const [callEnded, setCallEnded] = useState(false);

  const history = useHistory();
  const { user, selectedChat, isCaller, caller, receiver } = ChatState();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    if (!user) history.push("/");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((str) => {
        console.log("Inside navigator");
        setStream(str);
        myVideo.current.srcObject = str;
        socket.emit("setup", user);
        console.log("Outside navigator");
        socket.on("connected", () => console.log("Connected in CallPage"));

        if (isCaller && selectedChat && receiver) {
          callUser(selectedChat, str);
        } else if (caller.from) {
          socket.on("callUser", async (data) => {
            console.log(data);
            const { signal } = data;
            answerCall(signal, str);
          });
        }
      });
  }, []);

  const callUser = (chat, myStream) => {
    console.log(userVideo);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: myStream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: chat,
        signalData: data,
        from: user._id,
        name: user.name,
      });
    });
    peer.on("stream", (str) => {
      userVideo.current.srcObject = str;
    });
    socket.on("callAccepted", (signal) => {
      // console.log(signal);
      peer.signal(signal);
      connectionRef.current = peer;
    });
  };

  const answerCall = (cSignal, myStream) => {
    console.log(cSignal);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: myStream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (str) => {
      console.log(str);
      userVideo.current.srcObject = str;
    });
    peer.signal(cSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Call</h1>
      <div className="container">
        <div className="video-container">
          <div className="video">
            {stream && (
              <>
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  style={{ width: "300px" }}
                />
                <div>My Video</div>
              </>
            )}
          </div>
          <div className="video">
            {!callEnded && (
              <>
                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  style={{ width: "300px" }}
                />
                <div>{isCaller ? receiver?.name : caller?.name}</div>
              </>
            )}
          </div>
        </div>

        <div className="myId">
          <Box
            className="call-button"
            d="flex"
            alignItems="center"
            justifyContent="center"
            flexDir="column"
          >
            {!callEnded ? (
              <Button
                variant="contained"
                color="secondary"
                px={5}
                onClick={leaveCall}
              >
                End Call
              </Button>
            ) : (
              <div>Call has ended</div>
            )}
            Call with {isCaller ? receiver?.name : caller?.name}
          </Box>
        </div>
      </div>
    </>
  );
};

export default CallPage;
