

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiY3JlYXRlZEF0IjoiMjAyMS0xMC0yMFQwMjozNjo0Ni44ODdaIiwidXBkYXRlZEF0IjoiMjAyMS0xMC0yMFQwMjozNjo0Ni44ODdaIiwiZmlvIjpudWxsLCJwaG9uZSI6IjU1NiIsImxvZ2luIjpudWxsLCJhdmF0YXIiOm51bGwsImVtYWlsIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCREUkpDc0JtRFFrVERDQzVNTmhXY01Pa000cEpQQVdXSXRwbnIub0VVdDBzdC45aFp2RVBtTyIsInJhdGluZyI6IjUiLCJwX3NlcmllcyI6bnVsbCwicF9udW1iZXIiOm51bGwsInBfYnkiOm51bGwsInBfaXNzdWVfdGltZSI6bnVsbCwicF9iaXJ0aF9kYXRlIjpudWxsLCJwX3NjYW4iOm51bGwsInBfcGluayI6bnVsbCwiY29uZmlybWVkIjpmYWxzZSwiYmFubmVkIjpmYWxzZSwidmVyaWZpZWQiOmZhbHNlLCJvbmxpbmUiOmZhbHNlLCJjaXR5IjpudWxsLCJyb2xlIjoiZXhlY3V0b3IiLCJpYXQiOjE2MzQ3MTI0NTEsImV4cCI6MTYzNDk5ODg1MX0.NT1gNJq2e7pTp1mZM405yclltGa6ICFdATrKFat-XTo";
const socket = io(window.location.origin, {
  auth: {
    token: token
  },
  query: {
    chat_id: 8, // посылать 0 если просто нужно указать что онлайн
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