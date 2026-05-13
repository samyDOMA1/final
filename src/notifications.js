import * as signalR from "@microsoft/signalr";

let connection = null;

export const startConnection = async (token, onNotification) => {
  if (connection) return;

  connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5067/hubs/notifications", {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();

  connection.on("ReceiveNotification", (data) => {
    onNotification(data);
  });

  try {
    await connection.start();
    console.log("SignalR connected");
  } catch (err) {
    console.error("SignalR connection failed:", err);
  }
};

export const stopConnection = async () => {
  if (connection) {
    await connection.stop();
    connection = null;
  }
};
