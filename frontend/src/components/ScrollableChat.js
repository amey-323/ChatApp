import { Avatar } from "@chakra-ui/avatar";
import { Checkbox } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  getDate,
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user, deleteMsgsMode, selectedMsgs, setSelectedMsgs, isDeleteMe } =
    ChatState();

  const onChange = (m) => {
    var array = [...selectedMsgs];
    var index = array.indexOf(m._id);
    array.splice(index, 1);
    if (index !== -1) {
      setSelectedMsgs(array);
    } else {
      setSelectedMsgs([...selectedMsgs, m._id]);
    }
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div key={m._id}>
            {getDate(messages, m, i) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#38B2AC",
                  marginTop: "10px",
                  paddingBottom: "1px",
                  color: "white",
                  fontSize: "12px",
                  width: "25%",
                  margin: "auto",
                }}
              >
                <div>{getDate(messages, m, i)}</div>
              </div>
            )}
            <div style={{ display: "flex" }}>
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip
                  label={m.sender.name}
                  placement="bottom-start"
                  hasArrow
                >
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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: `${m.sender._id === user._id ? "end" : "start"}`,
                }}
              >
                <div>{m.content}</div>
                <div style={{ fontSize: "11px" }}>{m.time}</div>
              </span>

              {deleteMsgsMode && isDeleteMe && (
                <Checkbox
                  borderColor="#209fe7"
                  ml={2}
                  isChecked={selectedMsgs.includes(m._id) ? true : false}
                  onChange={() => onChange(m)}
                />
              )}
              {deleteMsgsMode && !isDeleteMe && m.sender._id === user._id && (
                <Checkbox
                  borderColor="#209fe7"
                  ml={2}
                  isChecked={selectedMsgs.includes(m._id) ? true : false}
                  onChange={() => onChange(m)}
                />
              )}
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
