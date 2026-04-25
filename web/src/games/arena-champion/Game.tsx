import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ArenaChampionState, ArenaChampionAction, MoveType } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const MOVES: { type: MoveType; name: string; desc: string }[] = [
  { type: "heavy",  name: "Heavy Strike",  desc: "2d6+2 damage, high risk" },
  { type: "quick",  name: "Quick Strikes", desc: "2x 1d4+1 hits" },
  { type: "feint",  name: "Feint",         desc: "1d4 dmg + halve enemy attack" },
  { type: "brace",  name: "Brace",         desc: "+6 defense this exchange" },
];

export function ArenaChampion({ state, dispatch, onGameOver }: GameProps<ArenaChampionState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: ArenaChampionAction) => dispatch(a);
  const hpPct = Math.round((state.playerHp / state.playerMaxHp) * 100);
  const oppHpPct = Math.round((state.opponentHp / state.opponent.maxHp) * 100);

  return (
    <div className="ac-wrap">
      <div className="ac-header">
        <span className="ac-title">Arena Champion</span>
        <span className="ac-round">Fight {state.round}/{state.maxRounds} | Wins: {state.wins}</span>
      </div>

      <div className="ac-fighters">
        <div className="ac-side">
          <div className="ac-name">You</div>
          <div className="ac-hp-bar"><div className="ac-hp-fill ac-player-fill" style={{ width: `${hpPct}%` }} /></div>
          <div className="ac-hp-text">{state.playerHp}/{state.playerMaxHp}</div>
        </div>
        <div className="ac-vs">VS</div>
        <div className="ac-side">
          <div className="ac-name">{state.opponent.name}</div>
          <div className="ac-title-tag">"{state.opponent.title}"</div>
          <div className="ac-hp-bar"><div className="ac-hp-fill ac-opp-fill" style={{ width: `${oppHpPct}%` }} /></div>
          <div className="ac-hp-text">{state.opponentHp}/{state.opponent.maxHp} | Atk {state.opponent.attack} | Def {state.opponent.defense}</div>
          <div className="ac-special">{state.opponent.special}</div>
        </div>
      </div>

      {state.phase === "choose" && (
        <div className="ac-moves">
          {MOVES.map(m => (
            <button key={m.type} className="ac-move"
              onClick={() => d({ type: "move", move: m.type })}>
              <div className="ac-move-name">{m.name}</div>
              <div className="ac-move-desc">{m.desc}</div>
            </button>
          ))}
        </div>
      )}

      {state.phase === "result" && (
        <div className="ac-result">
          <div>{state.opponent.name} defeated! Victory!</div>
          <button className="ac-next" onClick={() => d({ type: "nextFight" })}>Next Fight →</button>
        </div>
      )}
      {state.phase === "done" && <div className="ac-done">Arena Champion! All {state.maxRounds} fights won! Score: 100</div>}
      {state.phase === "dead" && <div className="ac-dead">Defeated in fight {state.round}. Wins: {state.wins}. Score: {terminal?.score ?? 0}/100</div>}

      <div className="ac-log">
        {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="ac-log-line">{l}</div>)}
      </div>
    </div>
  );
}
