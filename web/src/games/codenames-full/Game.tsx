import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CodenamesFullState, CodenamesFullAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CodenamesFullGame({ state, dispatch, onGameOver }: GameProps<CodenamesFullState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // When it's BLUE's turn, the CPU plays the BLUE operative. Step it
  // forward with a short delay so the player can watch each guess.
  useEffect(() => {
    if (terminal) return;
    if (state.turn !== "blue") return;
    const t = window.setTimeout(() => {
      dispatch({ type: "cpuStep" } satisfies CodenamesFullAction);
    }, 900);
    return () => window.clearTimeout(t);
  }, [state, terminal, dispatch]);

  function handleTile(i: number) {
    if (terminal) return;
    // Only the human plays RED operative — block clicks during BLUE's turn.
    if (state.turn !== "red") return;
    if (state.tiles[i]?.revealed) return;
    dispatch({ type: "guess", tileIndex: i } satisfies CodenamesFullAction);
  }

  const won = state.winner === "red";
  const lost = state.winner === "blue";
  const turnClass = state.turn === "red" ? "cf-turn--red" : "cf-turn--blue";

  return (
    <div className={`cf-root fade-in ${turnClass}`}>
      <header className="cf-header">
        <div className="cf-title">Codenames</div>
        <div className="cf-score pulse">
          <span className="cf-score-red">Red: {state.redLeft}/{state.redTotal}</span>
          <span className="cf-score-sep">|</span>
          <span className="cf-score-blue">Blue: {state.blueLeft}/{state.blueTotal}</span>
        </div>
      </header>

      <div className={`cf-clue cf-clue--${state.turn}`}>
        <div className="cf-clue-label">Spymaster ({state.turn === "red" ? "RED" : "BLUE"})</div>
        <div className="cf-clue-text">
          "{state.clue?.word ?? "—"}" — {state.clue?.count ?? 0}
        </div>
        <div className="cf-clue-sub">
          Guesses left this turn: {state.guessesLeft}
          {state.turn === "blue" && !terminal && <span className="cf-clue-cpu"> · CPU operative thinking…</span>}
        </div>
      </div>

      {terminal && (
        <div className={`cf-result bounce-in ${won ? "cf-result--won" : "cf-result--lost"}`}>
          {won
            ? "RED wins! All red agents identified."
            : state.endedByAssassin === "red"
              ? "Assassin! Red operative is out — Blue wins."
              : "Blue completes its agents first — you lose."}
        </div>
      )}

      <div className="cf-grid">
        {state.tiles.map((tile, i) => {
          let cls = "cf-tile";
          if (tile.revealed) cls += ` cf-tile--revealed cf-tile--${tile.type}`;
          if (!tile.revealed && state.turn !== "red") cls += " cf-tile--idle";
          const word = tile.word.replace(/_/g, " ");
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => handleTile(i)}
              disabled={tile.revealed || terminal !== null || state.turn !== "red"}
              title={tile.revealed ? `${word} — ${tile.type}` : `Guess "${word}"`}
              aria-label={tile.revealed ? `${word}, ${tile.type}` : `Guess ${word}`}
              data-testid={i === 0 ? "hint-target-codenames-full-tile" : undefined}
            >
              {word}
            </button>
          );
        })}
      </div>

      {!terminal && state.turn === "red" && (
        <div className="cf-actions">
          <button
            type="button"
            className="cf-btn"
            onClick={() => dispatch({ type: "endGuessing" } satisfies CodenamesFullAction)}
            title="End your guessing and pass the turn to BLUE"
            data-testid="hint-target-codenames-full-action"
          >
            End Guessing (pass to Blue)
          </button>
        </div>
      )}

      <div className="cf-log" aria-label="Game log">
        {state.log.slice(-10).reverse().map((m, i) => (
          <div key={state.log.length - i} className="cf-log-line">{m}</div>
        ))}
      </div>
    </div>
  );
}
