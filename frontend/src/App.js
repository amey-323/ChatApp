import React from "react";
import { Button } from "@chakra-ui/react";
import { Route } from "react-router-dom";
import HomePage from "./Pages/Homepage";
import ChatPage from "./Pages/Chatpage";
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <Route exact path="/" component={HomePage}></Route>
      <Route exact path="/chats" component={ChatPage}></Route>
      {/* <Button colorScheme="blue">Button</Button> */}
    </div>
  );
};

export default App;
