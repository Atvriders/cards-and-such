import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingOfTokyoFullState, KingOfTokyoFullAction, KingOfTokyoFullSettings, Face } from "./state.js";
import { isTerminal, POWER_CARDS, MAX_ROLLS } from "./state.js";
import "./Game.css";

const FACE_GLYPH: Record<Face, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  claw: "Claw",
  heart: "Heart",
  energy: "Bolt",
};

const FACE_LABEL: Record<Face, string> = {
  "1": "one",
  "2": "two",
  "3": "three",
  claw: "claw (attack)",
  heart: "heart (heal)",
  energy: "energy",
};

export function KingOfTokyoFullGame(
  props: GameProps<KingOfTokyoFullState, KingOfTokyoFullSettings>
): JSX.Element {
  const { state, dispatch, onGameOver } = props;

  // Terminal guard
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // CPU auto-step driver: when it's a CPU's turn or yieldPrompt for a CPU occupant,
  // schedule a `cpuStep` dispatch with a short delay for readability.
  useEffect(() => {
    if (state.phase === "gameOver") return;
    const cur = state.players[state.current];
    const yieldByCpu =
      state.phase === "yieldPrompt" &&
      state.tokyo !== null &&
      state.players[state.tokyo]?.isCpu === true;
    const cpuActing = cur?.isCpu === true && (state.phase === "rolling" || state.phase === "buyPhase");
    if (!cpuActing && !yieldByCpu) return;
    const t = setTimeout(() => {
      dispatch({ type: "cpuStep" } as KingOfTokyoFullAction);
    }, 650);
    return () => clearTimeout(t);
  }, [state, dispatch]);

  const me = state.players[0]!;
  const cur = state.players[state.current]!;
  const isMyTurn = state.current === 0 && !cur.isCpu;
  const t = isTerminal(state);

  return (
    <div className="kot-wrap fade-in">
      <header className="kot-header">
        <div className="kot-title">King of Tokyo</div>
        <div className="kot-tokyo">
          Tokyo:{" "}
          <span className="kot-tokyo-name">
            {state.tokyo !== null ? state.players[state.tokyo]!.name : "(empty)"}
          </span>
        </div>
        <div className="kot-vp pulse" data-testid="kot-vp">
          You: {me.vp} VP
        </div>
      </header>

      <section className="kot-board">
        {state.players.map((p, i) => {
          const inTokyo = state.tokyo === i;
          const active = state.current === i;
          return (
            <div
              key={i}
              className={[
                "kot-monster",
                active ? "active" : "",
                inTokyo ? "in-tokyo" : "",
                !p.alive ? "dead" : "",
                i === 0 ? "you" : "",
              ].filter(Boolean).join(" ")}
              data-testid={`kot-monster-${i}`}
            >
              <div className="kot-monster-name">
                {p.name} {i === 0 ? "(you)" : "(CPU)"} {inTokyo && <span className="kot-badge">TOKYO</span>}
              </div>
              <div className="kot-stats">
                <span className="kot-hp" title="hit points">HP {p.hp}</span>
                <span className="kot-vp-small" title="victory points">VP {p.vp}</span>
                <span className="kot-energy" title="energy tokens">E {p.energy}</span>
              </div>
              {p.cards.length > 0 && (
                <div className="kot-cards-mini" title="power cards held">
                  Cards: {p.cards.join(", ")}
                </div>
              )}
              {!p.alive && <div className="kot-dead-label">DEFEATED</div>}
            </div>
          );
        })}
      </section>

      {t && state.winnerIndex !== null && (
        <div className="kot-done bounce-in" role="status">
          <h2>{state.players[state.winnerIndex]!.name} wins!</h2>
          <div className="kot-final">
            You finished with {me.vp} VP{" "}
            {state.winnerIndex === 0 ? " — Victory!" : " — Defeat."}
          </div>
        </div>
      )}

      {!t && (
        <section className="kot-play">
          <div className="kot-message" data-testid="kot-message">{state.message}</div>

          {(state.phase === "rolling" || state.phase === "resolving") && (
            <>
              <div className="kot-roll-info">
                Roll {state.rollsUsed} of {MAX_ROLLS} — {cur.name}'s turn
              </div>
              <div className="kot-dice" data-testid="kot-dice">
                {state.dice.map((d, i) => {
                  const kept = state.kept[i];
                  const disabled = !isMyTurn;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`kot-die face-${d} ${kept ? "kept" : ""}`}
                      title={`${FACE_LABEL[d]} — click to ${kept ? "release" : "keep"}`}
                      aria-label={`Die ${i + 1}: ${FACE_LABEL[d]}${kept ? " (kept)" : ""}`}
                      data-testid={`kot-die-${i}`}
                      disabled={disabled}
                      onClick={() => dispatch({ type: "toggleKeep", index: i } as KingOfTokyoFullAction)}
                    >
                      <span className="kot-die-glyph">{FACE_GLYPH[d]}</span>
                    </button>
                  );
                })}
              </div>

              {isMyTurn && (
                <div className="kot-actions">
                  <button
                    type="button"
                    className="kot-btn primary"
                    title="Reroll dice that are not kept"
                    data-testid="hint-target-king-of-tokyo-full-primary"
                    disabled={state.rollsUsed >= MAX_ROLLS}
                    onClick={() => dispatch({ type: "reroll" } as KingOfTokyoFullAction)}
                  >
                    Reroll ({MAX_ROLLS - state.rollsUsed} left)
                  </button>
                  <button
                    type="button"
                    className="kot-btn"
                    title="Stop rolling and resolve dice now"
                    data-testid="kot-end-rolling"
                    onClick={() => dispatch({ type: "endRolling" } as KingOfTokyoFullAction)}
                  >
                    Resolve dice
                  </button>
                </div>
              )}
            </>
          )}

          {state.phase === "yieldPrompt" && (
            <div className="kot-yield">
              {state.tokyo !== null && state.players[state.tokyo]!.isCpu === false ? (
                <>
                  <div className="kot-yield-question">
                    Yield Tokyo to {state.players[state.pendingAttacker ?? 0]!.name}?
                  </div>
                  <div className="kot-actions">
                    <button
                      type="button"
                      className="kot-btn"
                      title="Leave Tokyo to escape further damage"
                      data-testid="kot-yield-yes"
                      onClick={() => dispatch({ type: "yieldTokyo", yield: true } as KingOfTokyoFullAction)}
                    >
                      Yield Tokyo
                    </button>
                    <button
                      type="button"
                      className="kot-btn primary"
                      title="Stay in Tokyo for more VP"
                      data-testid="kot-yield-no"
                      onClick={() => dispatch({ type: "yieldTokyo", yield: false } as KingOfTokyoFullAction)}
                    >
                      Stay
                    </button>
                  </div>
                </>
              ) : (
                <div className="kot-yield-question">CPU is deciding...</div>
              )}
            </div>
          )}

          {state.phase === "buyPhase" && (
            <div className="kot-buy">
              <div className="kot-buy-title">
                {isMyTurn ? `You have ${me.energy} energy. Buy a card?` : `${cur.name} is shopping...`}
              </div>
              <div className="kot-cards">
                {POWER_CARDS.map((c) => {
                  const owned = isMyTurn && c.kind === "keep" && me.cards.includes(c.id);
                  const affordable = isMyTurn && me.energy >= c.cost && !owned;
                  return (
                    <div key={c.id} className={`kot-card ${affordable ? "affordable" : ""}`}>
                      <div className="kot-card-name">
                        {c.name} <span className="kot-card-cost">{c.cost}E</span>
                      </div>
                      <div className="kot-card-desc">{c.description}</div>
                      <button
                        type="button"
                        className="kot-btn small"
                        title={owned ? "Already owned" : affordable ? `Buy ${c.name}` : "Not enough energy"}
                        disabled={!affordable}
                        data-testid={`kot-buy-${c.id}`}
                        onClick={() => dispatch({ type: "buy", cardId: c.id } as KingOfTokyoFullAction)}
                      >
                        {owned ? "Owned" : `Buy ${c.cost}E`}
                      </button>
                    </div>
                  );
                })}
              </div>
              {isMyTurn && (
                <div className="kot-actions">
                  <button
                    type="button"
                    className="kot-btn primary"
                    title="End your turn and pass to the next monster"
                    data-testid="kot-skip-buy"
                    onClick={() => dispatch({ type: "skipBuy" } as KingOfTokyoFullAction)}
                  >
                    End turn
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <details className="kot-log-wrap">
        <summary>Game log</summary>
        <ul className="kot-log" aria-label="Game log">
          {state.log.slice().reverse().map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
