import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KempsState, KempsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { isRed, rankLabel } from "../../engines/deck/index.js";
import type { Card } from "../../engines/deck/index.js";
import "./Kemps.css";

type KempsAction =
  | { type: "swap"; handIdx: number; centerIdx: number }
  | { type: "signal" }
  | { type: "stop-kemps" }
  | { type: "next-round" }
  | { type: "bot-tick" }
  | { type: "restart" };

function KCard({ card, selected, onClick, facedown }: { card?: Card | null; selected?: boolean; onClick?: () => void; facedown?: boolean }) {
  if (facedown || !card) {
    return <div className="kemps-card facedown" onClick={onClick}>🂠</div>;
  }
  const colorClass = isRed(card.suit) ? "red-suit" : "black-suit";
  return (
    <div className={`kemps-card ${colorClass}${selected ? " selected" : ""}`} onClick={onClick}>
      <div>{rankLabel(card.rank)}</div>
      <div>{card.suit}</div>
    </div>
  );
}

export function Kemps({ state, dispatch, onGameOver }: GameProps<KempsState, KempsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedHandIdx, setSelectedHandIdx] = useState<number | null>(null);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "swapping") {
      tickRef.current = setInterval(() => dispatch({ type: "bot-tick" } as KempsAction), 800);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  function dis(a: KempsAction) { dispatch(a); }

  function handleCenterClick(centerIdx: number) {
    if (selectedHandIdx === null) return;
    dis({ type: "swap", handIdx: selectedHandIdx, centerIdx });
    setSelectedHandIdx(null);
  }

  const playerHand = state.hands[0]!;

  return (
    <div className="kemps-game">
      <div className="kemps-title">KEMPS</div>
      <div className="kemps-score">
        Your Team: {state.teamScore} | Opponents: {state.oppScore} | Round {state.roundsPlayed + 1} of {state.targetRounds}
      </div>

      {terminal && (
        <div className="kemps-game-over">
          {state.winner === "team" ? "Your team wins the match!" : "Opponents win the match."}<br />
          Score: {terminal.score}
        </div>
      )}

      {state.phase === "round-over" && (
        <div className="kemps-round-over">
          {state.roundMessage}
          <div style={{ marginTop: "0.5rem" }}>
            <button className="kemps-btn next" onClick={() => dis({ type: "next-round" })}>Next Round</button>
          </div>
        </div>
      )}

      <div className="kemps-bot-hands">
        <div className="kemps-bot-hand">
          <div className="kemps-label">Partner (bot)</div>
          <div className="kemps-hand">
            {state.hands[1]!.map((_, i) => <KCard key={i} facedown />)}
          </div>
        </div>
        <div className="kemps-bot-hand">
          <div className="kemps-label">Opp 1 (bot)</div>
          <div className="kemps-hand">
            {state.hands[2]!.map((_, i) => <KCard key={i} facedown />)}
          </div>
        </div>
        <div className="kemps-bot-hand">
          <div className="kemps-label">Opp 2 (bot)</div>
          <div className="kemps-hand">
            {state.hands[3]!.map((_, i) => <KCard key={i} facedown />)}
          </div>
        </div>
      </div>

      <div className="kemps-section">
        <div className="kemps-label">Center — click a center card after selecting your card</div>
        <div className="kemps-center">
          {state.center.map((card, i) => (
            <div key={i} className={`kemps-card ${isRed(card.suit) ? "red-suit" : "black-suit"}${selectedHandIdx !== null ? " center-sel" : ""}`} onClick={() => handleCenterClick(i)}>
              <div>{rankLabel(card.rank)}</div>
              <div>{card.suit}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="kemps-section">
        <div className="kemps-label">Your Hand — click a card to select, then click center card to swap</div>
        <div className="kemps-hand">
          {playerHand.map((card, i) => (
            <KCard key={i} card={card} selected={selectedHandIdx === i} onClick={() => setSelectedHandIdx(s => s === i ? null : i)} />
          ))}
        </div>
      </div>

      {state.phase === "swapping" && (
        <div className="kemps-actions">
          <button className="kemps-btn signal" onClick={() => dis({ type: "signal" })}>
            Signal Partner (KEMPS!)
          </button>
          <button className="kemps-btn stop" onClick={() => dis({ type: "stop-kemps" })}>
            Stop-KEMPS on Opp
          </button>
        </div>
      )}

      <div className="kemps-hint">
        {selectedHandIdx !== null
          ? `Card ${rankLabel(playerHand[selectedHandIdx]!.rank)}${playerHand[selectedHandIdx]!.suit} selected — click a center card to swap.`
          : "Build 4-of-a-kind, then signal your partner to call KEMPS. Or call Stop-KEMPS if opponents have 4-of-a-kind."
        }
      </div>

      {terminal && (
        <button className="kemps-btn primary" onClick={() => dis({ type: "restart" })}>Play Again</button>
      )}
    </div>
  );
}
