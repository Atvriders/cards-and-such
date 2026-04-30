import { useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { GAMES } from "../games/registry.js";
import { SettingsForm } from "../platform/game-plugin/settings.js";
import { defaultsOf } from "../platform/game-plugin/types.js";
import { submitScore } from "../platform/game-plugin/submitScore.js";
import "./PlayPage.css";

function HowToPlayContent({ text }: { text: string }): JSX.Element {
  return (
    <div className="how-to-play">
      <h3>How to play</h3>
      {text.split("\n\n").map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

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
  const [helpOpen, setHelpOpen] = useState(false);

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
        <div className="play-header-titleblock">
          <span className={`play-category play-category--${plugin.category}`}>{plugin.category}</span>
          <h1>{plugin.title}</h1>
        </div>
        <div className="play-header-actions">
          {plugin.howToPlay && phase === "playing" && (
            <button
              className="play-iconbtn"
              onClick={() => setHelpOpen(true)}
              title="How to play"
              aria-label="How to play"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.5 9.5a2.5 2.5 0 1 1 4.5 1.5c-.7.6-2 1.2-2 2.5"></path>
                <line x1="12" y1="17" x2="12" y2="17"></line>
              </svg>
            </button>
          )}
          {phase === "playing" && (
            <button
              className="play-iconbtn"
              onClick={() => setPhase("setup")}
              title="Settings"
              aria-label="Settings"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          )}
          <Link to="/" className="play-backbtn" title="Back to lobby" aria-label="Back to lobby">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Lobby</span>
          </Link>
        </div>
      </header>

      {helpOpen && plugin.howToPlay && (
        <div className="help-modal-backdrop" onClick={() => setHelpOpen(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setHelpOpen(false)}>✕</button>
            <h2>How to play — {plugin.title}</h2>
            {plugin.howToPlay.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {phase === "setup" && (
        <section className="setup-panel" data-testid="setup-panel">
          {plugin.howToPlay && <HowToPlayContent text={plugin.howToPlay} />}
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
