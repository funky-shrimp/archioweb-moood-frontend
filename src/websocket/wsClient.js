import { WSClient } from "wsmini";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8887";

const wsClient = new WSClient(WS_URL);

async function connectToNotifications(token) {
  try {
    //envoie du token car il contient déjà toutes les infos de l'user
    await wsClient.connect(token);
    console.log("WebSocket connected");

    //inscription aux notifications (pour avoir les likes)
    await wsClient.sub("notifications", (notification) => {
      console.log("New notification received:", notification);
    });

    //des qu'on reçoit un like
    wsClient.onCmd("like", (data) => {
      console.log("Like command received:", data);
    });
  } catch (err) {
    console.error("WebSocket connection error:", err);
    return;
  }
}

export {wsClient, connectToNotifications};
