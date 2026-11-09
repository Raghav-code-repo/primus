import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "../auth/tokenStorage";

export interface ClassroomSocketState {
  socket: Socket | null;
  connected: boolean;
}

export function useClassroomSocket(classId: string | undefined): ClassroomSocketState {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!classId) {
      console.warn("[Classroom Socket] Missing classId");
      setConnected(false);
      setSocket(null);
      return;
    }

    const token = getAccessToken();

    if (!token) {
      console.error("[Classroom Socket] Access token unavailable");
      setConnected(false);
      setSocket(null);
      return;
    }

    console.log("[Classroom Socket] Connecting...", { classId });

    const s: Socket = io("http://localhost:8091", {
      auth: { token },

      // Start with polling and attempt WebSocket upgrade.
      transports: ["polling", "websocket"],

      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = s;
    setSocket(s);
    setConnected(false);

    s.on("connect", () => {
      console.log("[Classroom Socket] Connected:", s.id);
      setConnected(true);
      s.emit("CLASSROOM_JOIN", { classId });
      s.emit("chat:join", { classId });
    });

    s.io.on("reconnect", () => {
      setConnected(true);
      s.emit("CLASSROOM_JOIN", { classId });
      s.emit("chat:join", { classId });
    });

    s.on("connect_error", (error) => {
      console.error("[Classroom Socket] Connection error:", error.message);
      setConnected(false);
    });

    s.on("disconnect", (reason) => {
      console.warn("[Classroom Socket] Disconnected:", reason);
      setConnected(false);
    });

    s.on("error", (error) => {
      console.error("[Classroom Socket] Error:", error);
    });

    return () => {
      console.log("[Classroom Socket] Cleaning up:", classId);

      s.emit("CLASSROOM_LEAVE", { classId });
      s.emit("chat:leave", { classId });

      s.disconnect();

      if (socketRef.current === s) {
        socketRef.current = null;
      }

      setSocket((current) => (current === s ? null : current));
      setConnected(false);
    };
  }, [classId]);

  return { socket, connected };
}
