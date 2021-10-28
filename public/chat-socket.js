

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsImNyZWF0ZWRBdCI6IjIwMjEtMTAtMjdUMDY6MTA6NDAuMzg4WiIsInVwZGF0ZWRBdCI6IjIwMjEtMTAtMjdUMDY6MTA6NDAuMzg4WiIsImZpbyI6bnVsbCwiZW1haWwiOiJpbGhhbS5waXJtMkBnbWFpbC5jb20iLCJhdmF0YXIiOm51bGwsImxvZ2luIjoidzMzaGFhYTIyIiwicGhvbmUiOiIrOTk0NTAzMTkwMDQ0IiwicGFzc3dvcmQiOiIkMmIkMTAkY3lQTWV5RU1INlhGbFhRSFhMaTZ1T2NhdkVMRG12MVR2VmguOVFDb1E4MlVMZnNESTZESEsiLCJjb21wYW55X25hbWUiOm51bGwsImNvbXBhbnlfYWRkcmVzcyI6bnVsbCwiY29tcGFueV9yZWFsX2FkZHJlc3MiOm51bGwsInBvc2l0aW9uIjpudWxsLCJzaWduIjpudWxsLCJyaWdodHNfbm8iOm51bGwsInJpZ2h0c19kYXRlIjpudWxsLCJyaWdodHNfZXhwaXJlIjpudWxsLCJjaXR5IjpudWxsLCJpbm4iOm51bGwsImtwcCI6bnVsbCwib2dybiI6bnVsbCwi0YFoZWNraW5nX2FjY291bnQiOm51bGwsImNvcnBvcmF0ZV9hY2NvdW50IjpudWxsLCJiaWsiOm51bGwsImJhbmtfbmFtZSI6bnVsbCwic2l0ZSI6bnVsbCwiZmlsZXMiOm51bGwsImN1c3RvbWVyX3R5cGUiOiJzZWxmIiwiY29uZmlybWVkX2VtYWlsIjpmYWxzZSwiY29uZmlybWVkX3Bob25lIjpmYWxzZSwiYmFubmVkIjpmYWxzZSwidmVyaWZpZWQiOmZhbHNlLCJvbmxpbmUiOmZhbHNlLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE2MzU0MTgzMjQsImV4cCI6MTYzNTcwNDcyNH0.bONjd5acKcH8L-d_Q5ogBbHU44Rsd3oWHoaYC2gA8mU";
const socket = io(window.location.origin, {
  auth: {
    token: token
  },
  query: {
    chat_id: 7, // посылать 0 если просто нужно указать что онлайн
    page: 1,
    limit: 10
  }
});

const message = document.getElementById("message");
const messages = document.getElementById("messages");

const handleSubmitNewMessage = () => {
  socket.emit("message", {
    data: { text: message.value, m_type: "text" }
  });
};

socket.on("message", (data) => {
  console.log(data);
  if (data.m_type === "text") {
    handleNewMessage(data.text);
  }
});

socket.on("getUnRead", (data) => {
  console.log(data);
});

socket.on("getChats", (data) => {
  console.log(data);
});

socket.on("onlineList", (data) => {
  console.log(data);
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
  socket.emit("read", { data: [123,124,125] }); // id сообщений прочитаных
};
const handleNewMessage = (message) => {

  messages.appendChild(buildNewMessage(message));
};

const buildNewMessage = (message) => {
  const li = document.createElement("li");
  li.appendChild(document.createTextNode(message));
  return li;
};