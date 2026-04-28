import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TranscendentalChessSettings { questions: "10"; }
export interface TranscendentalChessState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TranscendentalChessAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Transcendental Chess starting position?", choices: ["Random back rank — same for both sides (mirror)", "Standard", "All pawns", "Random for each side"], correct: 0 },
  { question: "Designer?", choices: ["Maxwell Lawton (1978)", "Fischer", "Capablanca", "Glinski"], correct: 0 },
  { question: "Compared to Chess960?", choices: ["Both sides have SAME random position (transcendental); 960 is mirrored", "Identical", "Different sets per player", "Same"], correct: 0 },
  { question: "Bishops must?", choices: ["Be on opposite color squares (mirrored)", "Same color", "Anywhere", "Same file"], correct: 0 },
  { question: "Castling?", choices: ["Yes (Chess960-style)", "Forbidden", "Only short", "Only long"], correct: 0 },
  { question: "Why 'transcendental'?", choices: ["Goes beyond standard openings", "Religious origin", "Asian origin", "Mathematical term"], correct: 0 },
  { question: "Number of unique positions?", choices: ["Around 960 mirror-positions (similar to Chess960)", "1", "100", "Infinite"], correct: 0 },
  { question: "Opening prep value?", choices: ["Greatly diminished", "More important", "Same as classical", "None"], correct: 0 },
  { question: "Pawns at start?", choices: ["Standard 2nd rank", "Random", "Mirror", "On 4th"], correct: 0 },
  { question: "Best strategic principle?", choices: ["Find good piece coordination given new placement", "Always same plan", "Trade queens", "Push pawns"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TranscendentalChessSettings): TranscendentalChessState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TranscendentalChessState, action: TranscendentalChessAction): TranscendentalChessState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TranscendentalChessState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
