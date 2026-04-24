import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MississippiStudState, MississippiStudAction, MississippiStudSettings } from "./state.js";
import { visibleCommunity, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

const PHASE_LABELS: Record<string, string> = {
  "ante": "Place Ante",
  "third-street": "3rd Street — 0 community revealed",
  "fourth-street": "4th Street — 1 community revealed",
  "fifth-street": "5th Street — 2 community revealed",
  "settled": "Hand Complete",
};

export function MississippiStudGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<MississippiStudState, MississippiStudSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, playerCards, communityCards, bets, lastResult } = state;

  function dis(a: MississippiStudAction) { dispatch(a); }

  const ante = parseInt(settings.anteSize, 10);
  const visCount = visibleCommunity(phase);
  const totalBet = bets.reduce((a, b) => a + b, 0);

  return (
    <div className="msstud">
      <div className="msstud-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed + (phase !== "ante" && phase !== "settled" ? 1 : 0)}/{settings.hands}</span>
        <span>Ante: ${ante}</span>
      </div>

      <div className="msstud-phase-label">{PHASE_LABELS[phase]}</div>

      {lastResult && <div className="msstud-result">{lastResult}</div>}

      <div className="msstud-cards">
        <div className="msstud-label">Community (revealed one at a time)</div>
        <div className="msstud-hand">
          {communityCards.map((c, i) => (
            <Card key={c.id + i} card={c} faceDown={i >= visCount} />
          ))}
        </div>

        <div className="msstud-label">Your Hole Cards</div>
        <div className="msstud-hand">
          {playerCards.map((c, i) => <Card key={c.id + i} card={c} />)}
        </div>
      </div>

      {totalBet > 0 && (
        <div className="msstud-bets">
          Bets: {bets.map((b, i) => `$${b}`).join(" + ")} = ${totalBet}
        </div>
      )}

      <div className="msstud-actions">
        {(phase === "ante" || phase === "settled") && !terminal && (
          <button className="primary" onClick={() => dis({ type: "deal" })}>Deal</button>
        )}
        {(phase === "third-street" || phase === "fourth-street" || phase === "fifth-street") && (
          <>
            <button onClick={() => dis({ type: "bet", multiplier: 1 })}>Bet 1× (${ante})</button>
            <button onClick={() => dis({ type: "bet", multiplier: 2 })} disabled={bankroll < ante * 2}>Bet 2× (${ante * 2})</button>
            <button onClick={() => dis({ type: "bet", multiplier: 3 })} disabled={bankroll < ante * 3}>Bet 3× (${ante * 3})</button>
            <button className="fold-btn" onClick={() => dis({ type: "fold" })}>Fold</button>
          </>
        )}
        {terminal && <div className="msstud-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>

      <div className="msstud-paytable">
        Pay table (on total bet): Pair 6s+ → 1:1 | Two Pair → 2:1 | Trips → 3:1 | Straight → 4:1 | Flush → 6:1 | Full House → 10:1 | Quads → 40:1 | Straight Flush → 100:1
      </div>
    </div>
  );
}
