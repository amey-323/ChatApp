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

const DeleteMenu = () => {
  const {
    deleteChatMode,
    deleteMsgsMode,
    setDeleteChatMode,
    setDeleteMsgsMode,
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
              if (!deleteChatMode) setDeleteChatMode(true);
              if (deleteMsgsMode) setDeleteMsgsMode(false);
            }}
          >
            Delete Chat
          </MenuItem>
          <MenuDivider />
          <MenuItem
            onClick={() => {
              if (deleteChatMode) setDeleteChatMode(false);
              if (!deleteMsgsMode) setDeleteMsgsMode(true);
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
