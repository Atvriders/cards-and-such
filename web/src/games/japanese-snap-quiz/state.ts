import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface JapaneseSnapSettings { questions: "10"; }
export interface JapaneseSnapState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type JapaneseSnapAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Japanese Snap is most similar to which Western games?", choices: ["Bridge and Hearts","Speed and Slapjack","Solitaire and Bridge","Crazy Eights"], correct: 1 },
  { question: "The basic action in Japanese Snap is to?", choices: ["Discard slowly","Slap matching pairs first","Bid then play","Draw and pass"], correct: 1 },
  { question: "A 'snap' is called when?", choices: ["A jack appears","A matching card pair occurs","Time runs out","Hands are equal"], correct: 1 },
  { question: "Japanese Snap typically uses?", choices: ["Hanafuda","A standard deck","Mahjong tiles","Dominoes"], correct: 1 },
  { question: "The losing player in a slap traditionally?", choices: ["Takes the cards","Loses the cards to the slapper","Drinks","Skips"], correct: 1 },
  { question: "The game is suitable for how many players?", choices: ["1","2-4","8+","Tournament-only"], correct: 1 },
  { question: "Japanese Snap demands which skill above all?", choices: ["Memory","Reflexes","Patience","Strategy"], correct: 1 },
  { question: "A round of Japanese Snap typically lasts?", choices: ["Hours","Minutes","Seconds","Days"], correct: 1 },
  { question: "The winner of Japanese Snap is the player who?", choices: ["Has fewest cards","Has the most cards","Has the lowest card","Has all cards"], correct: 1 },
  { question: "Japanese Snap is also called?", choices: ["Speed-Japan","Slapjack-Japan","Japan-Snap","Tegami"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: JapaneseSnapSettings): JapaneseSnapState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: JapaneseSnapState, action: JapaneseSnapAction): JapaneseSnapState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: JapaneseSnapState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
