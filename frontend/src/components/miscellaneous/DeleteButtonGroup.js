import { DeleteIcon, SmallCloseIcon } from "@chakra-ui/icons";
import React from "react";
import { ChatState } from "../../Context/ChatProvider";
import DeleteMsgButton from "./DeleteMsgButton";

const DeleteButtonGroup = ({ delMsgsUser, delMsgsEveryone, deleteChat }) => {
  const { isDeleteMe, setDeleteChatMode, setDeleteMsgsMode, setSelectedMsgs } =
    ChatState();
  return (
    <>
      <DeleteMsgButton
        bgColor="red"
        title="Cancel"
        onClick={() => {
          setDeleteMsgsMode(false);
          setDeleteChatMode(false);
          setSelectedMsgs([]);
        }}
        icon={<SmallCloseIcon color="white" />}
      />
      {!deleteChat ? (
        <DeleteMsgButton
          title="Delete Messages"
          onClick={isDeleteMe ? delMsgsUser : delMsgsEveryone}
          icon={<DeleteIcon color="white" />}
        />
      ) : (
        <DeleteMsgButton
          title="Delete Chat"
          onClick={deleteChat}
          icon={<DeleteIcon color="white" />}
        />
      )}
    </>
  );
};

export default DeleteButtonGroup;
