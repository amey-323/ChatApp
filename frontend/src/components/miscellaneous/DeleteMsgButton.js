import { HStack, Text } from "@chakra-ui/react";

const DeleteMsgButton = ({ onClick, bgColor, textColor, title, icon }) => {
  return (
    <HStack
      d="flex"
      align="center"
      justify="center"
      bg={bgColor ? bgColor : "#38B2AC"}
      py={2}
      mt={2}
      borderRadius={5}
      onClick={onClick}
      cursor="pointer"
    >
      <Text
        color={textColor ? textColor : "white"}
        fontSize={16}
        mx={{ base: 2, md: 0 }}
      >
        {title}
      </Text>
      {icon}
    </HStack>
  );
};

export default DeleteMsgButton;
