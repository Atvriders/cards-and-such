import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BadugiState, BadugiAction, BadugiSettings } from "./state.js";
import { isTerminal, evaluateBadugi } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Badugi.css";

function describeHand(hand: Parameters<typeof evaluateBadugi>[0]): string {
  if (hand.length === 0) return "";
  const r = evaluateBadugi(hand);
  const maxCard = Math.max(...r.cards.map(c => c.rank));
  const label = maxCard === 1 ? "A" : String(maxCard);
  return `${r.size}-card (best: ${label})`;
}

export function Badugi({
  state,
  dispatch,
  onGameOver,
}: GameProps<BadugiState, BadugiSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, botBankroll, pot, playerHand, botHand,
    playerTurn, lastAction, lastResult, selectedToDiscard } = state;

  function dis(a: BadugiAction) { dispatch(a); }

  const ante = parseInt(state.settings.anteSize, 10);
  const toCall = state.botBet - state.playerBet;
  const isBetting = phase === "bet1" || phase === "bet2" || phase === "bet3";
  const isDraw = phase === "draw1" || phase === "draw2" || phase === "draw3";

  const canCheck = playerTurn && toCall <= 0;
  const canCall = playerTurn && toCall > 0;
  const canRaise = playerTurn && bankroll >= toCall + ante;

  const playerDesc = playerHand.length === 4 ? describeHand(playerHand) : "";
  const botDesc = phase === "showdown" && botHand.length === 4 ? describeHand(botHand) : "";

  const phaseLabel = phase === "bet1" ? "Bet Round 1" : phase === "bet2" ? "Bet Round 2" :
    phase === "bet3" ? "Bet Round 3" : phase === "draw1" ? "Draw Round 1" :
    phase === "draw2" ? "Draw Round 2" : phase === "draw3" ? "Draw Round 3" : phase;

  return (
    <div className="badugi">
      <div className="bg-header">
        <span>You: ${bankroll}</span>
        <span>Bot: ${botBankroll}</span>
        {phase !== "waiting" && phase !== "showdown" && <span className="bg-phase">{phaseLabel}</span>}
      </div>

      <div className="bg-goal">Goal: lowest 4-card hand · all different suits and ranks · Aces low</div>

      {lastResult && <div className="bg-result">{lastResult}</div>}
      {lastAction && !lastResult && <div className="bg-action-log">{lastAction}</div>}

      <div className="bg-table">
        <div className="bg-side">
          <div className="bg-side-label">Bot</div>
          <div className="bg-cards">
            {botHand.map((c, i) => (
              <Card key={c.id + i} card={c} faceDown={phase !== "showdown"} />
            ))}
            {botHand.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {botDesc && <div className="bg-hand-name">Badugi: {botDesc}</div>}
        </div>

        <div className="bg-side">
          <div className="bg-side-label">You {isDraw ? "(click to discard)" : ""}</div>
          <div className="bg-cards">
            {playerHand.map((c, i) => (
              <div
                key={c.id + i}
                className={`bg-card-wrapper${selectedToDiscard.includes(i) ? " selected" : ""}`}
                onClick={() => isDraw && dis({ type: "toggle-discard", index: i })}
              >
                <Card card={c} />
                {isDraw && selectedToDiscard.includes(i) && (
                  <span className="bg-discard-label">DISCARD</span>
                )}
              </div>
            ))}
            {playerHand.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {playerDesc && <div className="bg-hand-name">Badugi: {playerDesc}</div>}
        </div>
      </div>

      {isBetting && <div className="bg-pot">Pot: ${pot} {toCall > 0 ? `· To call: $${toCall}` : ""}</div>}
      {isDraw && (
        <div className="bg-draw-hint">
          Select cards to replace, then click Draw ({selectedToDiscard.length} selected — 0 = stand pat)
        </div>
      )}

      <div className="bg-actions">
        {(phase === "waiting" || phase === "showdown") && !terminal && (
          <button className="btn-deal" onClick={() => dis({ type: "deal" })}>Deal Hand</button>
        )}
        {isBetting && playerTurn && (
          <>
            <button className="btn-fold" onClick={() => dis({ type: "fold" })}>Fold</button>
            {canCheck && <button className="btn-check" onClick={() => dis({ type: "check" })}>Check</button>}
            {canCall && <button className="btn-call" onClick={() => dis({ type: "call" })}>Call ${toCall}</button>}
            {canRaise && (
              <button className="btn-raise" onClick={() => dis({ type: "raise" })}>
                {toCall > 0 ? `Raise $${toCall + ante}` : `Bet $${ante}`}
              </button>
            )}
          </>
        )}
        {isDraw && (
          <button className="btn-draw" onClick={() => dis({ type: "draw" })}>
            {selectedToDiscard.length === 0 ? "Stand Pat" : `Draw ${selectedToDiscard.length} card${selectedToDiscard.length !== 1 ? "s" : ""}`}
          </button>
        )}
        {terminal && <div className="bg-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
