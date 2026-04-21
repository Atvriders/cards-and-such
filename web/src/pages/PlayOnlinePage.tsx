import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createRoom, joinRoomByCode } from "../platform/api/rooms.js";
import { GAMES } from "../games/registry.js";
import "./PlayOnlinePage.css";

export default function PlayOnlinePage(): JSX.Element {
  const { gameId, roomId } = useParams<{ gameId: string; roomId?: string }>();
  const plugin = GAMES.find((g) => g.id === gameId);
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (roomId) {
    return (
      <div className="play-online-room" data-testid="play-online-room">
        <h1>In room {roomId.slice(0, 4).toUpperCase()}</h1>
        <p>Multiplayer game UI will render here (Tasks C4, C5).</p>
        <Link to="/">Back to lobby</Link>
      </div>
    );
  }

  if (!plugin) {
    return <div className="play-online-missing"><p>Unknown game</p><Link to="/">Back</Link></div>;
  }
  if (!plugin.players.multiplayer) {
    return (
      <div className="play-online-missing">
        <p>{plugin.title} does not support online play.</p>
        <Link to={`/play/${plugin.id}`}>Play locally</Link>
      </div>
    );
  }

  const onCreate = async (): Promise<void> => {
    setErr(null); setBusy(true);
    try {
      const r = await createRoom(plugin.id);
      navigate(`/play/${plugin.id}/online/${r.room.id}`);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  const onJoin = async (): Promise<void> => {
    setErr(null); setBusy(true);
    try {
      const trimmed = code.trim().toUpperCase();
      const r = await joinRoomByCode(trimmed);
      navigate(`/play/${plugin.id}/online/${r.room.id}`);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <div className="play-online-page" data-testid="play-online-page">
      <header>
        <h1>{plugin.title} — Online</h1>
        <Link to={`/play/${plugin.id}`} className="link-local">Play single-player →</Link>
      </header>

      <section className="option">
        <h2>Create a private room</h2>
        <p>Share the code with a friend.</p>
        <button onClick={onCreate} disabled={busy} data-testid="create-room">Create</button>
      </section>

      <section className="option">
        <h2>Join by code</h2>
        <div className="join-row">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX"
            maxLength={4}
            aria-label="room code"
            data-testid="room-code-input"
          />
          <button onClick={onJoin} disabled={busy || code.length !== 4} data-testid="join-room">Join</button>
        </div>
      </section>

      {err && <div role="alert" className="error">{err}</div>}
    </div>
  );
}
