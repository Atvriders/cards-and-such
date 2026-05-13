import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  SkipBoFullState,
  SkipBoFullAction,
  SkipBoFullSettings,
  CardObj,
  PlaySource,
} from "./state.js";
import { isTerminal, nextRequired, valueMatches } from "./state.js";
import "./Game.css";

type Dispatch = (a: SkipBoFullAction) => void;

function cardLabel(c: CardObj | null | undefined): string {
  if (!c) return "";
  return c.value === 0 ? "SB" : String(c.value);
}

function cardClass(c: CardObj | null | undefined): string {
  if (!c) return "skipbof-card empty";
  if (c.value === 0) return "skipbof-card wild";
  if (c.value >= 1 && c.value <= 4) return "skipbof-card lo";
  if (c.value >= 5 && c.value <= 8) return "skipbof-card mid";
  return "skipbof-card hi";
}

export function SkipBoFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SkipBoFullState, SkipBoFullSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Drive CPU turns: while it's a CPU's turn and game isn't over, dispatch cpuStep
  // on a short delay so the player sees the moves animate.
  useEffect(() => {
    if (state.phase === "done") return;
    if (state.turn === 0) return;
    const id = window.setTimeout(() => {
      (dispatch as Dispatch)({ type: "cpuStep" });
    }, 550);
    return () => window.clearTimeout(id);
  }, [state.turn, state.phase, state.cpuTick, dispatch]);

  const [selected, setSelected] = useState<PlaySource | null>(null);

  // If turn changes or game ends, clear selection.
  useEffect(() => { setSelected(null); }, [state.turn, state.phase]);

  const youSeat = 0;
  const sb = state.seats[youSeat]!;
  const isYourTurn = state.turn === youSeat && state.phase === "playing";
  const winner = state.winner;

  function getSourceCard(src: PlaySource | null): CardObj | null {
    if (!src) return null;
    if (src.kind === "hand") return sb.hand[src.index] ?? null;
    if (src.kind === "stock") return sb.stock.at(-1) ?? null;
    return sb.discards[src.index]!.at(-1) ?? null;
  }

  const selectedCard = getSourceCard(selected);

  function selectSource(src: PlaySource) {
    if (!isYourTurn) return;
    const card = getSourceCard(src);
    if (!card) return;
    setSelected(src);
  }

  function clickBuild(b: 0 | 1 | 2 | 3) {
    if (!isYourTurn || !selected) return;
    (dispatch as Dispatch)({ type: "play", source: selected, buildIndex: b });
    setSelected(null);
  }

  function clickDiscard(d: 0 | 1 | 2 | 3) {
    if (!isYourTurn) return;
    if (!selected || selected.kind !== "hand") return;
    (dispatch as Dispatch)({ type: "discard", handIndex: selected.index, discardIndex: d });
    setSelected(null);
  }

  function canPlayOnBuild(b: 0 | 1 | 2 | 3): boolean {
    if (!selected) return false;
    const card = selectedCard;
    if (!card) return false;
    const req = nextRequired(state.buildPiles[b]!);
    return valueMatches(card.value, req);
  }

  const statusLine = (() => {
    if (state.phase === "done") {
      if (winner === 0) return "You emptied your stockpile — you win!";
      return `${winner === null ? "Game" : `CPU ${winner}`} won the round.`;
    }
    if (!isYourTurn) return `CPU ${state.turn} thinking…`;
    if (selected) {
      const c = selectedCard;
      return `Selected ${cardLabel(c)} — click a build pile, or click a discard pile (hand cards only).`;
    }
    return "Your turn — pick a card to play, or a hand card to discard.";
  })();

  // Find the primary hint button for the hint pulser.
  // Priority: stock if playable, else first hand card that can play, else any discard top playable, else "Hint" button.
  function findPrimaryTestId(): string {
    if (!isYourTurn) return "skipbof-primary";
    const stockTop = sb.stock.at(-1);
    if (stockTop) {
      for (let b = 0; b < 4; b++) {
        if (valueMatches(stockTop.value, nextRequired(state.buildPiles[b]!))) return "skipbof-stock";
      }
    }
    for (let i = 0; i < sb.hand.length; i++) {
      const c = sb.hand[i];
      if (!c) continue;
      for (let b = 0; b < 4; b++) {
        if (valueMatches(c.value, nextRequired(state.buildPiles[b]!))) return `skipbof-hand-${i}`;
      }
    }
    return "skipbof-primary";
  }
  // Set the testid on the most plausible action via a ref-based attribute.
  // We just give every interactive element a fixed test id and rely on `hint` returning the right selector via state.

  const activeCpus = state.settings.cpuCount;

  return (
    <div className="skipbof-wrap fade-in" data-testid="skipbof-primary">
      <div className="skipbof-hud">
        <div className="skipbof-status">{statusLine}</div>
        <div className="skipbof-counts">
          <span>Draw: <b>{state.draw.length}</b></span>
          <span>Recycle: <b>{state.completed.length}</b></span>
        </div>
      </div>

      <div className="skipbof-opps">
        {[1, 2, 3].slice(0, activeCpus).map((seat) => {
          const op = state.seats[seat]!;
          const active = state.turn === seat && state.phase === "playing";
          return (
            <div key={seat} className={`skipbof-opp ${active ? "active" : ""}`}>
              <div className="skipbof-opp-name">CPU {seat}</div>
              <div className="skipbof-opp-row">
                <div className="skipbof-opp-stock">
                  <div className="skipbof-tag">Stock {op.stock.length}</div>
                  <div className={op.stock.at(-1) ? cardClass(op.stock.at(-1)) : "skipbof-card empty"}>
                    {op.stock.at(-1) ? cardLabel(op.stock.at(-1)) : "—"}
                  </div>
                </div>
                <div className="skipbof-opp-hand">
                  <div className="skipbof-tag">Hand</div>
                  <div className="skipbof-tight-row">
                    {op.hand.map((_c, i) => (
                      <div key={i} className="skipbof-card back" aria-hidden="true">?</div>
                    ))}
                  </div>
                </div>
                <div className="skipbof-opp-discards">
                  <div className="skipbof-tag">Discards</div>
                  <div className="skipbof-tight-row">
                    {op.discards.map((d, i) => (
                      <div key={i} className={d.at(-1) ? cardClass(d.at(-1)) : "skipbof-card empty"}>
                        {d.at(-1) ? cardLabel(d.at(-1)) : "—"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="skipbof-center">
        <div className="skipbof-tag center-tag">Build Piles (1 → 12)</div>
        <div className="skipbof-builds">
          {[0, 1, 2, 3].map((b) => {
            const pile = state.buildPiles[b]!;
            const top = pile.at(-1);
            const req = nextRequired(pile);
            const playable = isYourTurn && canPlayOnBuild(b as 0 | 1 | 2 | 3);
            return (
              <button
                key={b}
                className={`skipbof-build ${playable ? "playable" : ""}`}
                disabled={!playable}
                onClick={() => clickBuild(b as 0 | 1 | 2 | 3)}
                data-testid={`skipbof-build-${b}`}
                title={`Build pile ${b + 1} — needs ${req <= 12 ? req : 12}`}
                aria-label={`Build pile ${b + 1}, top ${top ? top.value : "empty"}, needs ${req <= 12 ? req : 12}`}
              >
                <div className={top ? cardClass(top) : "skipbof-card empty"}>
                  {top ? cardLabel(top) : "—"}
                </div>
                <div className="skipbof-build-need">needs {req <= 12 ? req : "12"}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="skipbof-you">
        <div className="skipbof-you-row">
          <div className="skipbof-stock-col">
            <div className="skipbof-tag">Your Stock ({sb.stock.length})</div>
            <button
              type="button"
              className={`skipbof-card-btn ${selected?.kind === "stock" ? "sel" : ""}`}
              onClick={() => selectSource({ kind: "stock" })}
              disabled={!isYourTurn || sb.stock.length === 0}
              data-testid="skipbof-stock"
              title="Your stockpile top — empty it to win"
              aria-label={`Stockpile top ${cardLabel(sb.stock.at(-1)) || "empty"}`}
            >
              <div className={sb.stock.at(-1) ? cardClass(sb.stock.at(-1)) : "skipbof-card empty"}>
                {sb.stock.at(-1) ? cardLabel(sb.stock.at(-1)) : "—"}
              </div>
            </button>
          </div>

          <div className="skipbof-hand-col">
            <div className="skipbof-tag">Your Hand</div>
            <div className="skipbof-hand-row">
              {sb.hand.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  className={`skipbof-card-btn ${selected?.kind === "hand" && selected.index === i ? "sel" : ""}`}
                  onClick={() => c && selectSource({ kind: "hand", index: i })}
                  disabled={!isYourTurn || !c}
                  data-testid={`skipbof-hand-${i}`}
                  title={c ? `Hand card ${cardLabel(c)}` : "Empty hand slot"}
                  aria-label={c ? `Hand card ${i + 1} value ${cardLabel(c)}` : `Hand slot ${i + 1} empty`}
                >
                  <div className={cardClass(c)}>{c ? cardLabel(c) : "—"}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="skipbof-discards-col">
            <div className="skipbof-tag">Your Discards (click to dump a hand card)</div>
            <div className="skipbof-discards-row">
              {sb.discards.map((d, i) => {
                const top = d.at(-1);
                const canDump =
                  isYourTurn && selected?.kind === "hand" && sb.hand[selected.index] !== null;
                const isSelectedSrc = selected?.kind === "discard" && selected.index === i;
                return (
                  <div key={i} className="skipbof-discard-stack">
                    <button
                      type="button"
                      className={`skipbof-card-btn ${isSelectedSrc ? "sel" : ""}`}
                      onClick={() => top && selectSource({ kind: "discard", index: i as 0 | 1 | 2 | 3 })}
                      disabled={!isYourTurn || !top}
                      data-testid={`skipbof-discard-src-${i}`}
                      title={`Discard pile ${i + 1} — click to select top to play`}
                      aria-label={`Discard pile ${i + 1} top ${cardLabel(top) || "empty"}, depth ${d.length}`}
                    >
                      <div className={top ? cardClass(top) : "skipbof-card empty"}>
                        {top ? cardLabel(top) : "—"}
                      </div>
                      <div className="skipbof-discard-depth">{d.length}</div>
                    </button>
                    <button
                      type="button"
                      className="skipbof-dump-btn"
                      disabled={!canDump}
                      onClick={() => clickDiscard(i as 0 | 1 | 2 | 3)}
                      data-testid={`skipbof-discard-dump-${i}`}
                      title={`Dump selected hand card onto discard pile ${i + 1} to end turn`}
                      aria-label={`Dump selected hand card onto discard pile ${i + 1}`}
                    >
                      Dump
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="skipbof-log" aria-live="polite">
        {state.log.slice(-4).map((line, i) => (
          <div key={i} className="skipbof-log-line">{line}</div>
        ))}
      </div>

      {state.phase === "done" && (
        <div className="skipbof-done bounce-in" role="status">
          <h2>{winner === 0 ? "You win!" : `CPU ${winner} wins`}</h2>
          {winner === 0 && (
            <div className="pulse">
              Score: <b>{(isTerminal(state)?.score ?? 0)}</b>
            </div>
          )}
        </div>
      )}

      {/* Hidden marker so plugin hint() can target an always-present element. */}
      <span hidden data-testid={findPrimaryTestId()} aria-hidden="true" />
    </div>
  );
}
