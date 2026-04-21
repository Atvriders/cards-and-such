import { useEffect, useRef, useState } from "react";
import {
  WsServerMessageSchema,
  type Seat,
  type WsRoomStateMessage,
} from "@cards/shared";

const WS_URL = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`;

export interface RoomView {
  status: "connecting" | "authed" | "joined" | "closed";
  seat: Seat | null;
  state: unknown;
  phase: "waiting" | "playing" | "ended" | null;
  members: { seat: Seat; username: string }[];
  terminal: { winner: Seat | "draw"; score: number } | null;
}

export interface RoomControls {
  dispatch: (action: unknown) => void;
  leave: () => void;
}

export function useRoom(roomId: string | null, token: string | null): [RoomView, RoomControls] {
  const [view, setView] = useState<RoomView>({
    status: "connecting", seat: null, state: null, phase: null, members: [], terminal: null,
  });
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId || !token) return;
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    const onAuthOk = (): void => {
      ws.send(JSON.stringify({ type: "room-join", roomId }));
      setView((v) => ({ ...v, status: "authed" }));
    };

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "auth", token }));
    });

    ws.addEventListener("message", (ev) => {
      let parsed;
      try { parsed = WsServerMessageSchema.parse(JSON.parse(ev.data)); }
      catch { return; }
      if (parsed.type === "auth_ok") { onAuthOk(); return; }
      if (parsed.type === "room-joined" && parsed.roomId === roomId) {
        setView((v) => ({ ...v, status: "joined", seat: parsed.seat }));
        return;
      }
      if (parsed.type === "room-state" && parsed.roomId === roomId) {
        const m = parsed as WsRoomStateMessage;
        setView((v) => ({
          ...v,
          state: m.state,
          phase: m.phase,
          members: m.members,
          terminal: m.terminal,
        }));
        return;
      }
    });

    ws.addEventListener("close", () => setView((v) => ({ ...v, status: "closed" })));

    return () => { ws.close(); };
  }, [roomId, token]);

  const dispatch = (action: unknown): void => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== ws.OPEN || !roomId) return;
    ws.send(JSON.stringify({ type: "room-action", roomId, action }));
  };

  const leave = (): void => {
    const ws = socketRef.current;
    if (ws && ws.readyState === ws.OPEN && roomId) {
      ws.send(JSON.stringify({ type: "room-leave", roomId }));
    }
  };

  return [view, { dispatch, leave }];
}
