import React from "react";
import { Button } from "@chakra-ui/react";
import { Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";
import CallPage from "./Pages/CallPage";
import "./App.css";
import GroupCall from "./Pages/GroupCall";

const App = () => {
  return (
    <div className="App">
      <Route exact path="/" component={HomePage}></Route>
      <Route exact path="/chats" component={ChatPage}></Route>
      <Route exact path="/call" component={CallPage}></Route>
      <Route exact path="/groupCall/:roomID" component={GroupCall}></Route>
      {/* <Button colorScheme="blue">Button</Button> */}
    </div>
  );
};

export default App;
