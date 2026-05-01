import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BoxingLegendsQuizSettings { questions: "10" | "20" | "30"; }
export interface BoxingLegendsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BoxingLegendsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who's known as 'The Greatest'?", choices: ["Muhammad Ali","Mike Tyson","Just Ali","Both"], correct: 0 },
  { question: "What was Muhammad Ali's birth name?", choices: ["Cassius Clay","Just Cassius","Both","Just Clay"], correct: 2 },
  { question: "How many heavyweight world titles did Ali win?", choices: ["3","2","4","5"], correct: 0 },
  { question: "Who's known as Iron Mike?", choices: ["Mike Tyson","Just Tyson","Both","Iron Joe"], correct: 0 },
  { question: "At what age did Tyson become youngest heavyweight champ?", choices: ["20","18","22","19"], correct: 0 },
  { question: "Who was Joe Louis?", choices: ["The Brown Bomber","Heavyweight legend","Both","Just Brown Bomber"], correct: 2 },
  { question: "Who's known as Sugar Ray?", choices: ["Sugar Ray Robinson, Sugar Ray Leonard","Just Robinson","Both Sugar Rays","Just Leonard"], correct: 2 },
  { question: "Who's regarded as pound-for-pound greatest?", choices: ["Sugar Ray Robinson (often)","Just Robinson","Both","Multiple cited"], correct: 3 },
  { question: "What 1971 fight was the Fight of the Century?", choices: ["Ali vs Frazier I","Just first Ali-Frazier","Both","Just Frazier"], correct: 2 },
  { question: "Who won Ali vs Frazier I?", choices: ["Frazier","Ali","Draw","Tied"], correct: 0 },
  { question: "What 1974 fight was the Rumble in the Jungle?", choices: ["Ali vs Foreman","Just Foreman","Both","In Zaire"], correct: 2 },
  { question: "Where was Rumble in the Jungle held?", choices: ["Zaire (DRC)","Manila","NYC","Vegas"], correct: 0 },
  { question: "What 1975 fight was Thrilla in Manila?", choices: ["Ali vs Frazier III","Just third","Both","In Manila"], correct: 2 },
  { question: "Who's George Foreman?", choices: ["Heavyweight champ, then again at 45","Just heavyweight","Both","Just champ"], correct: 2 },
  { question: "Who's known as the Manassa Mauler?", choices: ["Jack Dempsey","Just Dempsey","Both","Joe Louis"], correct: 0 },
  { question: "Who's Floyd Mayweather Jr's record?", choices: ["50-0","49-0","Both eras","Just 50"], correct: 0 },
  { question: "Who's Manny Pacquiao?", choices: ["Filipino multi-weight champion","Just Filipino","Both","Just multi-weight"], correct: 2 },
  { question: "What weight class is heavyweight (over)?", choices: ["Over 200 lbs (varies)","Over 175","Over 165","Over 220"], correct: 0 },
  { question: "What weight class is lightweight?", choices: ["~135 lbs","~145","~155","~125"], correct: 0 },
  { question: "What's the highest weight class?", choices: ["Heavyweight (no upper limit)","Cruiser","Bridger","Just Heavy"], correct: 2 },
  { question: "What sanctioning bodies exist?", choices: ["WBA, WBC, IBF, WBO (and more)","Just one","Multiple","Just four"], correct: 2 },
  { question: "What's a knockout?", choices: ["Stopped fight by hit","Just KO","Both","Just stop"], correct: 2 },
  { question: "What's TKO?", choices: ["Technical knockout (referee/doctor stops fight)","Just TKO","Both","Just decision"], correct: 2 },
  { question: "How many rounds in pro championship fight?", choices: ["12 (typically)","15 historically","Both","Just 12"], correct: 2 },
  { question: "How long is each round?", choices: ["3 minutes","2 min","Both formats","Just 3"], correct: 0 },
  { question: "Who's Lennox Lewis?", choices: ["British heavyweight champion","Just British","Both","Just champ"], correct: 2 },
  { question: "Who's Evander Holyfield?", choices: ["Heavyweight champion (4-time)","Just heavyweight","Both","Just champ"], correct: 2 },
  { question: "What infamous 1997 incident in Tyson-Holyfield II?", choices: ["Tyson bit Holyfield's ear","Just bit ear","Both","Just bite"], correct: 2 },
  { question: "Who's known as the Golden Boy?", choices: ["Oscar De La Hoya","Just De La Hoya","Both","Just Golden Boy"], correct: 0 },
  { question: "How many weight classes did De La Hoya hold titles in?", choices: ["6","5","4","7"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BoxingLegendsQuizSettings): BoxingLegendsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BoxingLegendsQuizState, action: BoxingLegendsQuizAction): BoxingLegendsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BoxingLegendsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
