

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsImNyZWF0ZWRBdCI6IjIwMjEtMTAtMTBUMTM6MzE6NTMuMjAyWiIsInVwZGF0ZWRBdCI6IjIwMjEtMTAtMTBUMTM6MzE6NTMuMjAyWiIsImZpbyI6bnVsbCwiZW1haWwiOiJpbGhhbS5waXJtMkBnbWFpbC5jb20iLCJhdmF0YXIiOm51bGwsImxvZ2luIjoidzMzaGFhYSIsInBob25lIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCRieDZBM1JGc1ZJdWU3cndiUTQ4TFhPbW9mTHhoSVUvUFZwWTdJb05lM29Ia2hJTGJ6RzhiUyIsImNvbXBhbnlfbmFtZSI6bnVsbCwiY29tcGFueV9hZGRyZXNzIjpudWxsLCJpbm4iOm51bGwsImJpayI6bnVsbCwib2dybiI6bnVsbCwi0YFoZWNraW5nX2FjY291bnQiOm51bGwsImJhbmtfbmFtZSI6bnVsbCwiY29ycG9yYXRlX2FjY291bnQiOm51bGwsInNuaWxzIjpudWxsLCJzaXRlIjpudWxsLCJmaWxlcyI6bnVsbCwiY3VzdG9tZXJfdHlwZSI6InNlbGYtZW1wbG95ZWQiLCJjb25maXJtZWQiOmZhbHNlLCJ2ZXJpZmllZCI6ZmFsc2UsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTYzNDA0MDI4OCwiZXhwIjoxNjM0MzI2Njg4fQ._6VF5iCdOnQId3K4dSdPmZnCKBVcfsl1qW_bRK3E3MQ"
const socket = io(window.location.origin, {
  auth: {
    token: token
  },
  query: {
    chat_id: 6
  }
});

const message = document.getElementById("message");
const messages = document.getElementById("messages");

const handleSubmitNewMessage = () => {
  socket.emit("message", {
    data: { text: message.value , m_type: "text" }
  });
};

socket.on("message", ({ data }) => {
  console.log(data);
  if (data.m_type === "text") {
    handleNewMessage(data.text);
  }
});

const handleFile = () => {
    socket.emit("message", {
      data: {
        file: {
          "url": "https://photo-birji.s3.eu-north-1.amazonaws.com/photo_2021-08-23_16-08-00.jpg",
          "name": "photo_2021-08-23_16-08-00.jpg"
        },
        m_type: "file"
      }
    });
  }
;

const handleRead = () => {
  socket.emit("read", { data: [69] }); // id сообщений прочитаных
};
const handleNewMessage = (message) => {

  messages.appendChild(buildNewMessage(message));
};

const buildNewMessage = (message) => {
  const li = document.createElement("li");
  li.appendChild(document.createTextNode(message));
  return li;
};