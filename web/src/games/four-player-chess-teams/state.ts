import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FourPlayerChessTeamsSettings { questions: "10"; }
export interface FourPlayerChessTeamsState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FourPlayerChessTeamsAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Four-Player Teams: board shape?", choices: ["Square 14×14 with corners removed", "Standard 8×8", "Hexagonal", "Round"], correct: 0 },
  { question: "Teams sit on the board where?", choices: ["Opposite sides (across)", "Adjacent corners", "All same side", "Random"], correct: 0 },
  { question: "Move order rotates clockwise — your move sequence is?", choices: ["You, partner, opp1, opp2", "You, opp1, partner, opp2", "Random", "All at once"], correct: 1 },
  { question: "Best early-game plan?", choices: ["Coordinate diagonal control with partner", "Ignore partner", "Rush the king", "Trade queens"], correct: 0 },
  { question: "Your queen can fork two opponents' pieces or check the partner-side opponent. Pick?", choices: ["Double attack on opponents", "Help your partner side", "Waste move", "Resign"], correct: 0 },
  { question: "If your partner gets checkmated, you?", choices: ["Continue alone with your own pieces", "Lose immediately", "Inherit their pieces", "Game ends"], correct: 0 },
  { question: "Most powerful piece in 4-player chess?", choices: ["Queen — long diagonals across larger board", "Pawn", "King", "Knight"], correct: 0 },
  { question: "Why are pawns slower to be useful?", choices: ["Long path to promotion across diagonal of board", "They can't capture", "Only 2 per side", "They move backwards"], correct: 0 },
  { question: "A free check across the board to opp1: do it?", choices: ["Yes — keeps tempo on opponents", "No, waste of move", "Only if mate", "Always trade"], correct: 0 },
  { question: "Endgame heuristic?", choices: ["Concentrate firepower with partner on weakest opponent", "Spread out", "Run king", "Trade everything"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: FourPlayerChessTeamsSettings): FourPlayerChessTeamsState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FourPlayerChessTeamsState, action: FourPlayerChessTeamsAction): FourPlayerChessTeamsState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FourPlayerChessTeamsState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
