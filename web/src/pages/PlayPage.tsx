import { useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import { SettingsForm } from "../platform/game-plugin/settings.js";
import { defaultsOf } from "../platform/game-plugin/types.js";
import { submitScore } from "../platform/game-plugin/submitScore.js";
import "./PlayPage.css";

export default function PlayPage(): JSX.Element {
  const { gameId } = useParams<{ gameId: string }>();
  const plugin = useMemo(() => GAMES.find((g) => g.id === gameId), [gameId]);

  if (!plugin) {
    return (
      <div className="play-not-found" data-testid="game-not-found">
        <p>Unknown game: {gameId}</p>
        <Link to="/">Back to lobby</Link>
      </div>
    );
  }

  return <PlayGame key={plugin.id} plugin={plugin} />;
}

function PlayGame({ plugin }: { plugin: (typeof GAMES)[number] }): JSX.Element {
  const [settings, setSettings] = useState(() => defaultsOf(plugin.settings));
  const [phase, setPhase] = useState<"setup" | "playing" | "ended">("setup");
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const [state, setState] = useState(() => plugin.initialState(seed, settings));
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const start = useCallback(() => {
    const next = plugin.initialState(seed, settings);
    setState(next);
    setPhase("playing");
  }, [plugin, seed, settings]);

  const dispatch = useCallback((action: unknown) => {
    setState((s: unknown) => {
      const next = plugin.reducer(s, action);
      const term = plugin.isTerminal(next);
      if (term) {
        setFinalScore(term.score);
        setPhase("ended");
        void submitScore(plugin.id, term.score, settings as Record<string, unknown>);
      }
      return next;
    });
  }, [plugin, settings]);

  const onGameOver = useCallback((score: number) => {
    setFinalScore(score);
    setPhase("ended");
    void submitScore(plugin.id, score, settings as Record<string, unknown>);
  }, [plugin.id, settings]);

  return (
    <div className="play-page">
      <header className="play-header">
        <h1>{plugin.title}</h1>
        <Link to="/" className="back-link">← Lobby</Link>
      </header>

      {phase === "setup" && (
        <section className="setup-panel" data-testid="setup-panel">
          <SettingsForm
            schema={plugin.settings}
            values={settings}
            onChange={(k, v) => setSettings((s) => ({ ...s, [k]: v } as typeof s))}
          />
          <button onClick={start} className="start-btn" data-testid="start-game">Start</button>
        </section>
      )}

      {phase === "playing" && (
        <section className="play-panel">
          <plugin.component state={state} settings={settings} dispatch={dispatch} onGameOver={onGameOver} />
        </section>
      )}

      {phase === "ended" && finalScore !== null && (
        <section className="end-panel" data-testid="end-panel">
          <h2>Game over</h2>
          <div className="final-score">Score: {finalScore}</div>
          <button onClick={start} className="play-again-btn">Play again</button>
        </section>
      )}
    </div>
  );
}
