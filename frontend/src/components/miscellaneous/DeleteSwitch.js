import { HStack } from "@chakra-ui/react";
import Switch from "react-switch";
import { ChatState } from "../../Context/ChatProvider";

const DeleteMeSwitch = () => {
  const { isDeleteMe, setIsDeleteMe } = ChatState();
  return (
    <label>
      <HStack d="flex" justify={{ base: "center", md: "end" }} my={3}>
        <span>Delete For Me</span>
        <Switch
          onChange={() => {
            setIsDeleteMe(true);
          }}
          checked={isDeleteMe}
        />
      </HStack>
    </label>
  );
};

const DeleteAllSwitch = () => {
  const { isDeleteMe, setIsDeleteMe, setSelectedMsgs } = ChatState();
  return (
    <label>
      <HStack d="flex" justify={{ base: "center", md: "end" }} my={3}>
        <span>Delete For Everyone</span>
        <Switch
          onChange={() => {
            setIsDeleteMe(false);

            setSelectedMsgs([]);
          }}
          checked={!isDeleteMe}
        />
      </HStack>
    </label>
  );
};

export { DeleteMeSwitch, DeleteAllSwitch };
