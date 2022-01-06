import { Avatar } from "@chakra-ui/avatar";
import { Checkbox } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user, deleteMsgsMode, selectedMsgs, setSelectedMsgs } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
            {/* <div>{m.date}</div> */}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
              }}
            >
              {m.content}
            </span>
            <span>{m.time}</span>
            {deleteMsgsMode && m.sender._id === user._id && (
              <Checkbox
                borderColor="#209fe7"
                ml={2}
                isChecked={selectedMsgs.includes(m._id) ? true : false}
                onChange={() => {
                  // console.log("Hello");
                  // console.log(selectedMsgs);
                  var array = [...selectedMsgs];
                  var index = array.indexOf(m._id);
                  array.splice(index, 1);
                  if (index !== -1) {
                    setSelectedMsgs(array);
                  } else {
                    setSelectedMsgs([...selectedMsgs, m._id]);
                  }
                }}
              />
            )}
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
