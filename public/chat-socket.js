

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzMsImNyZWF0ZWRBdCI6IjIwMjEtMTEtMTJUMDA6NDg6NDAuMTQ4WiIsInVwZGF0ZWRBdCI6IjIwMjEtMTEtMjFUMTE6MzE6NDIuNjcwWiIsImZpbyI6ImZhZmEiLCJlbWFpbCI6bnVsbCwiYXZhdGFyIjp7Im5hbWUiOiIyZTdmYjkwNS03ZjJiLTRlNDktYTYwNi1kYTA3Mjk0ZjJkOWUvODcwLmpwZyIsInVybCI6Imh0dHBzOi8vMWRhcmRlbW8uaGIuYml6bXJnLmNvbS8yZTdmYjkwNS03ZjJiLTRlNDktYTYwNi1kYTA3Mjk0ZjJkOWUvODcwLmpwZyJ9LCJsb2dpbiI6ImlsaGFtLnBpcm1AZ21haWwuY29tIiwicGhvbmUiOiIrNzk5ODc4NzQxNTIiLCJwYXNzd29yZCI6IiQyYiQxMCRpTEhxQ0ZSS0Q3WTQwcjZ1UmFURFNPQjF1b003RDRReTc1U0NTcmFvMkdIZ0JtR0JlS0RHNiIsImZ1bGxuZXNzIjo5NywiY29tcGFueV9uYW1lIjoi0JjQu9GM0YXQsNC8IiwiY29tcGFueV9hZGRyZXNzIjoiYWZmYSIsImNvbXBhbnlfcmVhbF9hZGRyZXNzIjoiZmFmZiIsInBvc2l0aW9uIjoiYWZmYSIsInNpZ24iOiJ0cnVlIiwicmlnaHRzX25vIjoiZmFhZmZhIiwicmlnaHRzX2RhdGUiOiIxOTk4LTAzLTE1VDIwOjAwOjAwLjAwMFoiLCJyaWdodHNfZXhwaXJlIjoiMjAyMS0xMi0wOVQyMDowMDowMC4wMDBaIiwiY2l0eSI6IkJha3UiLCJpbm4iOiJhZmZhIiwia3BwIjoiYWZmYSIsIm9ncm4iOiJhZmZhIiwi0YFoZWNraW5nX2FjY291bnQiOiIzMjQyNCIsImNvcnBvcmF0ZV9hY2NvdW50IjoiMjI0MjQiLCJiaWsiOiIzMjQyNDQyYWZmYWEiLCJiYW5rX25hbWUiOiJ0ZXN0c3RzdHN0MTExMSIsInNpdGUiOm51bGwsImZpbGVzIjpudWxsLCJjdXN0b21lcl90eXBlIjoibmtvIiwiY3VycmVudEhhc2hlZFJlZnJlc2hUb2tlbiI6IiQyYiQxMiRtWHJneVA1UlZTc2RzVFFBbi5YcHBPbHczRVdVRWNhWGxZaTFhbWhTaE1iQjdQZGdkZGhnLiIsImNvbmZpcm1lZF9lbWFpbCI6ZmFsc2UsImNvbmZpcm1lZF9waG9uZSI6ZmFsc2UsImJhbm5lZCI6ZmFsc2UsInZlcmlmaWVkIjp0cnVlLCJvbmxpbmUiOmZhbHNlLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE2Mzc2ODY2MjksImV4cCI6MTYzNzk3MzAyOX0.5-QuWi1JTJO-Gt0VPUEv8YPQrChmDouxD020FsPoQo8";
const socket = io(window.location.origin, {
  auth: {
    token: token
  },
  query: {
    chat_id: 0, // посылать 0 если просто нужно указать что онлайн
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