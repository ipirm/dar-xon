const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImNyZWF0ZWRBdCI6IjIwMjEtMTAtMDVUMTc6MjM6NTcuMzU2WiIsInVwZGF0ZWRBdCI6IjIwMjEtMTAtMDZUMTE6NTg6MzAuNDIwWiIsImZpbyI6ItCd0LjQuiIsImVtYWlsIjoibmlja0BkYXItb3guY29tIiwiYXZhdGFyIjp7Im5hbWUiOiJ0ZWgtaW1nMy5qcGciLCJ1cmwiOiJodHRwczovL3Bob3RvLWJpcmppLnMzLmV1LW5vcnRoLTEuYW1hem9uYXdzLmNvbS90ZWgtaW1nMy5qcGcifSwibG9naW4iOiJuaWNrZXJsYW4xMjMiLCJwaG9uZSI6Iis5NTk1MzYzMzM0IiwicGFzc3dvcmQiOiIkMmIkMTAkUDJoalFsZnAvLzdaQmtBNHRXSndxT1NIVHBseTE1TERFYmkvZlpzWmVLaWtSeTJOYWVPS1MiLCJjb21wYW55X25hbWUiOiJBcHBsZSIsImNvbXBhbnlfYWRkcmVzcyI6IkYuWC5Yb3lza2kgNzkiLCJpbm4iOiIxNDg5NTUyIiwiYmlrIjoiMTQ4OTU1MiIsIm9ncm4iOiJBWjg5QUlJQjQxMDUwMEM2NDM0MDEwMTY4MTE4Iiwi0YFoZWNraW5nX2FjY291bnQiOiJBWjg5QUlJQjQxMDUwMEM2NDM0MDEwMTY4MTE4IiwiYmFua19uYW1lIjoiS2FwaXRhbCBiYW5rIiwiY29ycG9yYXRlX2FjY291bnQiOiJBWjg5QUlJQjQxMDUwMEM2NDM0MDEwMTY4MTE4Iiwic25pbHMiOiJBWjg5QUlJQjQxMDUwMEM2NDM0MDEwMTY4MTE4Iiwic2l0ZSI6Imh0dHBzOi8vdHZpc2VyLmFnZW5jeSIsImZpbGVzIjpbeyJuYW1lIjoidGVoLWltZzMuanBnIiwidXJsIjoiaHR0cHM6Ly9waG90by1iaXJqaS5zMy5ldS1ub3J0aC0xLmFtYXpvbmF3cy5jb20vdGVoLWltZzMuanBnIn0seyJuYW1lIjoidGVoLWltZzIuanBnIiwidXJsIjoiaHR0cHM6Ly9waG90by1iaXJqaS5zMy5ldS1ub3J0aC0xLmFtYXpvbmF3cy5jb20vdGVoLWltZzIuanBnIn0seyJuYW1lIjoidGVoLWltZy5qcGciLCJ1cmwiOiJodHRwczovL3Bob3RvLWJpcmppLnMzLmV1LW5vcnRoLTEuYW1hem9uYXdzLmNvbS90ZWgtaW1nLmpwZyJ9XSwiY3VzdG9tZXJfdHlwZSI6InNlbGYtZW1wbG95ZWQiLCJjb25maXJtZWQiOmZhbHNlLCJ2ZXJpZmllZCI6ZmFsc2UsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTYzMzczNjAzNCwiZXhwIjoxNjM0MDIyNDM0fQ.Od2eNq50BCX2WWHAFMex5By5AZHchAo3VMLpWUkleoA";
const chat_id = 2;
const socket = io(window.location.origin, {
  auth: {
    token: token
  },
  query: {
    chat_id: chat_id
  }
});

const message = document.getElementById("message");
const messages = document.getElementById("messages");

console.log(socket);
const handleSubmitNewMessage = () => {
  socket.emit("message", { data: message.value });

};

const handdleLeave = () => {
  socket.emit("leave", { data: chat_id });
};

socket.on("message", ({ data }) => {
  handleNewMessage(data);
});

const handleNewMessage = (message) => {
  messages.appendChild(buildNewMessage(message));
};

const buildNewMessage = (message) => {
  const li = document.createElement("li");
  li.appendChild(document.createTextNode(message));
  return li;
};