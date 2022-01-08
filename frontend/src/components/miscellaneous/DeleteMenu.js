import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";

const DeleteMenu = ({ messages }) => {
  const {
    deleteChatMode,
    deleteMsgsMode,
    setDeleteChatMode,
    setDeleteMsgsMode,
    setSelectedMsgs,
  } = ChatState();
  return (
    <Box
      d="flex"
      justifyContent="space-between"
      alignItems="center"
      marginX={2}
    >
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
          <DeleteIcon />
        </MenuButton>
        <MenuList fontSize={20}>
          <MenuItem
            onClick={() => {
              if (deleteMsgsMode) setDeleteMsgsMode(false);
              if (!deleteChatMode) setDeleteChatMode(true);
              const messageIds = messages.map((m) => m._id);
              setSelectedMsgs(messageIds);
            }}
          >
            Delete Chat
          </MenuItem>
          <MenuDivider />
          <MenuItem
            onClick={() => {
              if (!deleteMsgsMode) {
                setDeleteMsgsMode(true);
                setSelectedMsgs([]);
              }
              if (deleteChatMode) setDeleteChatMode(false);
            }}
          >
            Delete Messages
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default DeleteMenu;
