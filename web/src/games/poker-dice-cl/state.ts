import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PokerDiceClSettings { questions: "10"; }
export interface PokerDiceClState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PokerDiceClAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Poker Dice are played with?', choices: ['Five dice', 'Three dice', 'Six dice', 'One die'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Faces on Poker Dice are?', choices: ['9, 10, J, Q, K, A', '1 through 6', '1 through 9', 'Just letters'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of rolls allowed per turn is?', choices: ['Three rolls', 'One roll', 'Five rolls', 'Ten rolls'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Highest hand in Poker Dice is?', choices: ['Five of a Kind', 'Royal Flush', 'Straight Flush', 'Four of a Kind'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hand rankings are based on?', choices: ['Standard poker hand rankings', 'Yacht categories', 'Backgammon scoring', 'Sushi cards'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Full House' in Poker Dice means?", choices: ['Three of one rank and two of another', 'All five same', 'Five different ranks in sequence', 'Any five dice'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Players may re-roll?', choices: ['Any subset of dice between rolls', 'Only all five always', 'Only one die', 'None'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Origin of Poker Dice is?', choices: ['Late 19th-century American/British saloons', 'Ancient Egypt', 'Renaissance Italy', '1950s Japan'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of players is?', choices: ['Two or more', 'Solo only', 'Exactly four', 'Always six'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'A common Poker Dice variant adds?', choices: ['Betting rounds between rolls', 'Trump suits', 'Card draws', 'Tile placements'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PokerDiceClSettings): PokerDiceClState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PokerDiceClState, action: PokerDiceClAction): PokerDiceClState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PokerDiceClState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
