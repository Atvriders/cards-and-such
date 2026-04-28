import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KyogiKarutaSettings { questions: "10"; }
export interface KyogiKarutaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KyogiKarutaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Kyogi Karuta is competitive form of?", choices: ["Iroha Karuta", "Hyakunin Isshu", "Obake Karuta", "Hwatu"], correct: 1 },
  { question: "A Kyogi match is played by how many players?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Each player arranges how many cards in their territory?", choices: ["13", "20", "25", "50"], correct: 2 },
  { question: "A match uses how many cards in total on the field?", choices: ["50", "75", "100", "200"], correct: 0 },
  { question: "Top players can react in approximately?", choices: ["1 second", "Half a second", "Tens of milliseconds", "Two seconds"], correct: 2 },
  { question: "After a successful strike, a card may be?", choices: ["Discarded", "Sent to opponent's territory", "Read aloud", "Auctioned"], correct: 1 },
  { question: "Kyogi Karuta is played seated on?", choices: ["Chairs", "Cushions", "Tatami", "Stools"], correct: 2 },
  { question: "The first to clear their own territory?", choices: ["Loses", "Wins", "Reshuffles", "Rotates"], correct: 1 },
  { question: "The governing body of Kyogi Karuta is?", choices: ["JKA – All-Japan Karuta Association", "NHK", "JOC", "JKL"], correct: 0 },
  { question: "A famous manga/anime about Kyogi Karuta is?", choices: ["Hikaru no Go", "Chihayafuru", "Naruto", "Slam Dunk"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KyogiKarutaSettings): KyogiKarutaState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KyogiKarutaState, action: KyogiKarutaAction): KyogiKarutaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KyogiKarutaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
