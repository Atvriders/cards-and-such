import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KiteFightState, KiteAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const KITE_EMOJI: Record<string, string> = {
  red: "🪁", blue: "🔵", green: "🟢", yellow: "🟡",
};

export function KiteFight({
  state,
  dispatch,
  onGameOver,
}: GameProps<KiteFightState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: KiteAction) => dispatch(a);

  // Build grid 9×9
  const grid: JSX.Element[] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const kitesHere = state.kites.filter(k => k.alive && k.x === col && k.y === row);
      const player = kitesHere.find(k => k.isPlayer);
      const opp = kitesHere.find(k => !k.isPlayer);
      const cls = player ? "kf-cell player" : opp ? "kf-cell opponent" : "kf-cell empty";
      const emoji = player ? "🪁" : opp ? KITE_EMOJI[opp.color] ?? "🟤" : "";
      grid.push(<div key={`${row}-${col}`} className={cls}>{emoji}</div>);
    }
  }

  return (
    <div className="kf-wrap">
      <div className="kf-header">
        <span className="kf-title">Kite Fight</span>
        <span className="kf-round">Round {state.round}/{state.maxRounds}</span>
        <span className="kf-score">Score: {state.score}</span>
      </div>

      <div className="kf-wind">
        Wind: {state.windDir} | Cuts: {state.cuts} | Alive: {state.kites.filter(k => !k.isPlayer && k.alive).length} opponents
      </div>

      <div className="kf-grid">{grid}</div>

      <div className="kf-message">{state.message}</div>

      {state.phase === "move" && (
        <>
          <div className="kf-controls">
            <button className="kf-btn empty-btn" />
            <button data-testid="hint-target-kite-fight-action" className="kf-btn" onClick={() => d({ type: "movePlayer", dx: 0, dy: -1 })}>↑</button>
            <button className="kf-btn empty-btn" />
            <button className="kf-btn" onClick={() => d({ type: "movePlayer", dx: -1, dy: 0 })}>←</button>
            <button className="kf-btn" onClick={() => d({ type: "confirmMove" })}>OK</button>
            <button className="kf-btn" onClick={() => d({ type: "movePlayer", dx: 1, dy: 0 })}>→</button>
            <button className="kf-btn empty-btn" />
            <button className="kf-btn" onClick={() => d({ type: "movePlayer", dx: 0, dy: 1 })}>↓</button>
            <button className="kf-btn empty-btn" />
          </div>
          <div className="kf-legend">
            <span>🪁 = You (red)</span>
            <span>🔵🟢🟡 = Opponents</span>
          </div>
        </>
      )}

      {state.phase === "done" && (
        <div className="kf-done">
          <div>Game Over! Score: {state.score}</div>
          <div>{state.cuts} kite{state.cuts !== 1 ? "s" : ""} cut</div>
          <div>{state.score >= 150 ? "Kite Master!" : state.score >= 70 ? "Good fight!" : "Keep practicing!"}</div>
        </div>
      )}
    </div>
  );
}
