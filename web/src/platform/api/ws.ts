import { useEffect, useRef, useState } from "react";
import {
  PresenceMessageSchema,
  WsServerMessageSchema,
  type PresenceMessage,
} from "@cards/shared";

const WS_URL = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/ws`;

export interface LobbyPresence {
  online: number;
  users: { username: string; game: string | null }[];
  connected: boolean;
}

export function useLobbyPresence(token: string | null): LobbyPresence {
  const [state, setState] = useState<LobbyPresence>({ online: 0, users: [], connected: false });
  const attemptRef = useRef(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = (): void => {
      if (cancelled) return;
      ws = new WebSocket(WS_URL);
      ws.addEventListener("open", () => {
        attemptRef.current = 0;
        ws!.send(JSON.stringify({ type: "auth", token }));
      });
      ws.addEventListener("message", (ev) => {
        let parsed;
        try { parsed = WsServerMessageSchema.parse(JSON.parse(ev.data)); } catch { return; }
        if (parsed.type === "auth_ok") {
          setState((s) => ({ ...s, connected: true }));
          ws!.send(JSON.stringify({ type: "subscribe", channel: "lobby" }));
        } else if (parsed.type === "presence") {
          const p: PresenceMessage = PresenceMessageSchema.parse(parsed);
          setState({ online: p.online, users: p.users, connected: true });
        }
      });
      ws.addEventListener("close", () => {
        setState((s) => ({ ...s, connected: false }));
        if (cancelled) return;
        attemptRef.current += 1;
        if (attemptRef.current > 5) return;
        const delay = Math.min(10000, 500 * Math.pow(2, attemptRef.current - 1));
        retryTimer = setTimeout(connect, delay);
      });
    };

    connect();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      ws?.close();
    };
  }, [token]);

  return state;
}
