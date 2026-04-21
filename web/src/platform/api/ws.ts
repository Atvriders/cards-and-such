import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket(WS_URL);

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ type: "auth", token }));
    });

    ws.addEventListener("message", (ev) => {
      let parsed;
      try { parsed = WsServerMessageSchema.parse(JSON.parse(ev.data)); }
      catch { return; }
      if (parsed.type === "auth_ok") {
        setState((s) => ({ ...s, connected: true }));
        ws.send(JSON.stringify({ type: "subscribe", channel: "lobby" }));
      } else if (parsed.type === "presence") {
        const p: PresenceMessage = PresenceMessageSchema.parse(parsed);
        setState({ online: p.online, users: p.users, connected: true });
      }
    });

    ws.addEventListener("close", () => {
      setState((s) => ({ ...s, connected: false }));
    });

    return () => { ws.close(); };
  }, [token]);

  return state;
}
