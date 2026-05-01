import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SciFiNovelsQuizSettings { questions: "10" | "20" | "30"; }
export interface SciFiNovelsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SciFiNovelsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote the 'Foundation' series?", choices: ["Asimov","Heinlein","Clarke","Le Guin"], correct: 0 },
  { question: "Who wrote 'Dune'?", choices: ["Asimov","Herbert","Heinlein","Clarke"], correct: 1 },
  { question: "Paul Atreides is the protagonist of?", choices: ["Foundation","Dune","Ringworld","Hyperion"], correct: 1 },
  { question: "Who wrote '2001: A Space Odyssey'?", choices: ["Asimov","Clarke","Heinlein","Bradbury"], correct: 1 },
  { question: "Who wrote 'Childhood's End'?", choices: ["Asimov","Clarke","Heinlein","Niven"], correct: 1 },
  { question: "Who wrote 'Stranger in a Strange Land'?", choices: ["Asimov","Clarke","Heinlein","Bradbury"], correct: 2 },
  { question: "Who wrote 'Starship Troopers'?", choices: ["Heinlein","Card","Haldeman","Asimov"], correct: 0 },
  { question: "Who wrote 'Ender's Game'?", choices: ["Card","Heinlein","Asimov","Clarke"], correct: 0 },
  { question: "Who wrote 'The Forever War'?", choices: ["Haldeman","Heinlein","Card","Niven"], correct: 0 },
  { question: "Who wrote 'I, Robot'?", choices: ["Asimov","Heinlein","Clarke","Bradbury"], correct: 0 },
  { question: "Asimov's Three Laws govern?", choices: ["AI software","Robotics","Spaceships","Genetics"], correct: 1 },
  { question: "Who wrote 'Fahrenheit 451'?", choices: ["Asimov","Bradbury","Heinlein","Vonnegut"], correct: 1 },
  { question: "Who wrote 'The Martian Chronicles'?", choices: ["Asimov","Bradbury","Clarke","Le Guin"], correct: 1 },
  { question: "Who wrote 'Slaughterhouse-Five'?", choices: ["Vonnegut","Heller","Bradbury","Asimov"], correct: 0 },
  { question: "Billy Pilgrim is from?", choices: ["Cat's Cradle","Slaughterhouse-Five","Player Piano","Sirens of Titan"], correct: 1 },
  { question: "Who wrote 'Do Androids Dream of Electric Sheep?'?", choices: ["Dick","Asimov","Heinlein","Clarke"], correct: 0 },
  { question: "Who wrote 'The Man in the High Castle'?", choices: ["Dick","Asimov","Bradbury","Heinlein"], correct: 0 },
  { question: "Who wrote 'The Left Hand of Darkness'?", choices: ["Le Guin","Russ","Tiptree","Butler"], correct: 0 },
  { question: "Who wrote 'A Wizard of Earthsea'?", choices: ["Le Guin","McCaffrey","Norton","Bradley"], correct: 0 },
  { question: "Who wrote 'Neuromancer'?", choices: ["Gibson","Stephenson","Sterling","Dick"], correct: 0 },
  { question: "Who wrote 'Snow Crash'?", choices: ["Gibson","Stephenson","Stross","Egan"], correct: 1 },
  { question: "Who wrote 'Hyperion'?", choices: ["Simmons","Card","Banks","Reynolds"], correct: 0 },
  { question: "Who wrote 'Ringworld'?", choices: ["Niven","Pournelle","Asimov","Heinlein"], correct: 0 },
  { question: "Who wrote 'Rendezvous with Rama'?", choices: ["Asimov","Clarke","Heinlein","Niven"], correct: 1 },
  { question: "Who wrote 'The War of the Worlds'?", choices: ["Verne","Wells","Doyle","Stoker"], correct: 1 },
  { question: "Who wrote 'The Time Machine'?", choices: ["Wells","Verne","Doyle","Stoker"], correct: 0 },
  { question: "Who wrote 'Twenty Thousand Leagues Under the Sea'?", choices: ["Verne","Wells","Hugo","Dumas"], correct: 0 },
  { question: "Who wrote 'Kindred'?", choices: ["Butler","Le Guin","Russ","Jemisin"], correct: 0 },
  { question: "Who wrote 'The Three-Body Problem'?", choices: ["Liu Cixin","Ken Liu","Ted Chiang","Becky Chambers"], correct: 0 },
  { question: "Who wrote 'The Handmaid's Tale'?", choices: ["Atwood","Le Guin","Butler","Russ"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SciFiNovelsQuizSettings): SciFiNovelsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SciFiNovelsQuizState, action: SciFiNovelsQuizAction): SciFiNovelsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SciFiNovelsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
