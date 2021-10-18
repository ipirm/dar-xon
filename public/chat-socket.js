

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImNyZWF0ZWRBdCI6IjIwMjEtMTAtMDVUMTc6NDA6MTUuNDgzWiIsInVwZGF0ZWRBdCI6IjIwMjEtMTAtMTVUMDk6NDQ6MTguNjU0WiIsImZpbyI6ItCY0LvRjNGF0LDQvCDQn9C40YDQvNCw0LzQvNCw0LTQvtCyLNCS0YPQs9Cw0YAiLCJwaG9uZSI6Iis5OTU1NTU1NTUiLCJsb2dpbiI6Im5pY2tlcmxhbjEyMyIsImF2YXRhciI6eyJuYW1lIjoidGVoLWltZzIuanBnIiwidXJsIjoiaHR0cHM6Ly9waG90by1iaXJqaS5zMy5ldS1ub3J0aC0xLmFtYXpvbmF3cy5jb20vdGVoLWltZzIuanBnIn0sImVtYWlsIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR2WTRmbHdaakl3dWdZaXZ2NG5jbnZ1VDBwL29QeGVoVWNLb1hHS3duT0F0eGNPbGhid21zSyIsInJhdGluZyI6IjUiLCJwX3NlcmllcyI6IkFaRSIsInBfbnVtYmVyIjoiMTQ4ODk1MjIiLCJwX2J5IjoiQVNBTjEiLCJwX2lzc3VlX3RpbWUiOiIyOC4wNi4yMDE0IiwicF9iaXJ0aF9kYXRlIjoiMTYuMDMuMTk5OCIsInBfc2NhbiI6eyJuYW1lIjoidGVoLWltZzMuanBnIiwidXJsIjoiaHR0cHM6Ly9waG90by1iaXJqaS5zMy5ldS1ub3J0aC0xLmFtYXpvbmF3cy5jb20vdGVoLWltZzMuanBnIn0sInBfcGluayI6eyJuYW1lIjoibWFuLnBuZyIsInVybCI6Imh0dHBzOi8vcGhvdG8tYmlyamkuczMuZXUtbm9ydGgtMS5hbWF6b25hd3MuY29tL21hbi5wbmcifSwiY29uZmlybWVkIjpmYWxzZSwiYmFubmVkIjpmYWxzZSwidmVyaWZpZWQiOmZhbHNlLCJvbmxpbmUiOnRydWUsImNpdHkiOm51bGwsInJvbGUiOiJleGVjdXRvciIsImlhdCI6MTYzNDQ3MzY4NywiZXhwIjoxNjM0NzYwMDg3fQ.bGts2VYgyxZ3tOHp0GP9H5XyF9oZUqPU_6cvFqPCAKE";
const socket = io(window.location.origin, {
  auth: {
    token: token
  },
  query: {
    chat_id: 6,
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