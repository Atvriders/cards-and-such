import { useEffect, useState } from "react";
import {
  LeaderboardRowSchema,
  GlobalLeaderboardRowSchema,
  type LeaderboardRow,
  type GlobalLeaderboardRow,
} from "@cards/shared";
import { z } from "zod";
import { OnlineNowPanel } from "./leaderboard/OnlineNowPanel.js";
import "./LeaderboardPage.css";

type Tab = "per-game" | "global" | "online";

export default function LeaderboardPage(): JSX.Element {
  const [tab, setTab] = useState<Tab>("per-game");
  return (
    <div className="leaderboard-layout">
      <section className="leaderboard-main">
        <h1>Leaderboard</h1>
        <nav className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "per-game"} onClick={() => setTab("per-game")}>Per-game</button>
          <button role="tab" aria-selected={tab === "global"} onClick={() => setTab("global")}>Global</button>
          <button role="tab" aria-selected={tab === "online"} onClick={() => setTab("online")}>Online now</button>
        </nav>
        {tab === "per-game" && <PerGamePanel />}
        {tab === "global" && <GlobalPanel />}
        {tab === "online" && <div className="online-standalone"><OnlineNowPanel /></div>}
      </section>
      {tab !== "online" && <OnlineNowPanel />}
    </div>
  );
}

function PerGamePanel(): JSX.Element {
  const [gameId, setGameId] = useState("klondike");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    setErr(null);
    fetch(`/api/leaderboard/game/${gameId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`http_${r.status}`);
        const j = await r.json();
        setRows(z.array(LeaderboardRowSchema).parse(j));
      })
      .catch((e: Error) => setErr(e.message));
  }, [gameId]);
  return (
    <div>
      <label>Game: <input value={gameId} onChange={(e) => setGameId(e.target.value)} aria-label="game id" /></label>
      {err && <div role="alert">{err}</div>}
      <ol className="scores">
        {rows.map((r) => (
          <li key={`${r.rank}-${r.username}`}><span>{r.rank}. {r.username}</span><span>{r.score}</span></li>
        ))}
      </ol>
    </div>
  );
}

function GlobalPanel(): JSX.Element {
  const [rows, setRows] = useState<GlobalLeaderboardRow[]>([]);
  useEffect(() => {
    fetch("/api/leaderboard/global").then(async (r) => {
      const j = await r.json();
      setRows(z.array(GlobalLeaderboardRowSchema).parse(j));
    });
  }, []);
  return (
    <ol className="scores">
      {rows.map((r) => (
        <li key={r.username}><span>{r.rank}. {r.username}</span><span>{r.gamesPlayed} games</span></li>
      ))}
    </ol>
  );
}
