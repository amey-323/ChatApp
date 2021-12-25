import React from "react";
import { Button } from "@chakra-ui/react";
import { Route } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage";

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
