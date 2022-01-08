export const isSameSenderMargin = (messages, m, i, userId) => {
  // console.log(i === messages.length - 1);

  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 35;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

export const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const removeLoggedUser = (loggedUser, chat) => {
  return chat.users.filter((user) => user._id !== loggedUser._id);
};

export const getDate = (messages, m, i) => {
  if (i === 0 || messages[i - 1].date !== m.date) {
    // console.log(messages[i].date, m.date);
    // if (m.date === new Date().toLocaleDateString("en-IN")) {
    //   Date.parse()
    //   // console.log("today");
    //   console.log(m.date - new Date().toLocaleDateString);
    //   return "Today";
    // }

    const mDate = m.date.split("/");
    const today = new Date().toLocaleDateString("en-IN").split("/");

    if (mDate[1] === today[1] && mDate[2] === today[2]) {
      const mDay = parseInt(mDate[0]);
      const tDay = parseInt(today[0]);
      if (tDay - mDay === 1) {
        return "Yesterday";
      }
      if (tDay - mDay === 0) {
        return "Today";
      }
    }

    // console.log(today);
    return m.date;
  }
  return null;
};
