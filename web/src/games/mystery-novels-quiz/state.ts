import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MysteryNovelsQuizSettings { questions: "10" | "20" | "30"; }
export interface MysteryNovelsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MysteryNovelsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'Murder on the Orient Express'?", choices: ["Doyle","Christie","Sayers","Chandler"], correct: 1 },
  { question: "Who created Hercule Poirot?", choices: ["Sayers","Christie","Marsh","Allingham"], correct: 1 },
  { question: "Who created Miss Marple?", choices: ["Christie","Sayers","Allingham","James"], correct: 0 },
  { question: "Who created Sherlock Holmes?", choices: ["Doyle","Christie","Stevenson","Wilde"], correct: 0 },
  { question: "Sherlock Holmes lives at what address?", choices: ["221A Baker St","221B Baker St","222B Baker St","Baker 21B"], correct: 1 },
  { question: "Who is Holmes' sidekick?", choices: ["Watson","Lestrade","Mycroft","Hudson"], correct: 0 },
  { question: "Who wrote 'The Hound of the Baskervilles'?", choices: ["Doyle","Christie","Stevenson","Collins"], correct: 0 },
  { question: "Who wrote 'The Moonstone' (1868)?", choices: ["Dickens","Collins","Doyle","Stoker"], correct: 1 },
  { question: "Who wrote 'The Maltese Falcon'?", choices: ["Hammett","Chandler","Cain","Spillane"], correct: 0 },
  { question: "Sam Spade was created by?", choices: ["Chandler","Hammett","Cain","Macdonald"], correct: 1 },
  { question: "Who created Philip Marlowe?", choices: ["Hammett","Chandler","Cain","Spillane"], correct: 1 },
  { question: "Who wrote 'The Big Sleep'?", choices: ["Hammett","Chandler","Cain","Macdonald"], correct: 1 },
  { question: "Who wrote 'The Postman Always Rings Twice'?", choices: ["Cain","Chandler","Hammett","Thompson"], correct: 0 },
  { question: "Who created Lord Peter Wimsey?", choices: ["Christie","Sayers","Marsh","Allingham"], correct: 1 },
  { question: "Who wrote 'And Then There Were None'?", choices: ["Sayers","Christie","Doyle","Marsh"], correct: 1 },
  { question: "Who created Inspector Morse?", choices: ["Dexter","Rendell","James","Rankin"], correct: 0 },
  { question: "Who created Inspector Rebus?", choices: ["Dexter","Rankin","Rendell","James"], correct: 1 },
  { question: "Who created Adam Dalgliesh?", choices: ["P.D. James","Ruth Rendell","Sayers","Marsh"], correct: 0 },
  { question: "Who created Inspector Wexford?", choices: ["Rendell","James","Marsh","Allingham"], correct: 0 },
  { question: "Who wrote 'The Girl with the Dragon Tattoo'?", choices: ["Larsson","Mankell","Nesbo","Lackberg"], correct: 0 },
  { question: "Who created detective Kurt Wallander?", choices: ["Larsson","Mankell","Nesbo","Indridason"], correct: 1 },
  { question: "Who created Harry Hole?", choices: ["Larsson","Mankell","Nesbo","Adler-Olsen"], correct: 2 },
  { question: "Who wrote 'The Da Vinci Code'?", choices: ["Brown","Patterson","Grisham","Clancy"], correct: 0 },
  { question: "Who created Robert Langdon?", choices: ["Brown","Patterson","Grisham","Connelly"], correct: 0 },
  { question: "Who created detective Harry Bosch?", choices: ["Connelly","Patterson","Grisham","Child"], correct: 0 },
  { question: "Who created Jack Reacher?", choices: ["Child","Connelly","Patterson","Grisham"], correct: 0 },
  { question: "Who wrote 'In Cold Blood'?", choices: ["Capote","Mailer","Wolfe","Thompson"], correct: 0 },
  { question: "Who wrote 'Gone Girl'?", choices: ["Flynn","Hawkins","Ware","French"], correct: 0 },
  { question: "Who wrote 'The Silence of the Lambs'?", choices: ["King","Harris","Koontz","Patterson"], correct: 1 },
  { question: "Hannibal Lecter was created by?", choices: ["Stephen King","Thomas Harris","James Patterson","Dean Koontz"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MysteryNovelsQuizSettings): MysteryNovelsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MysteryNovelsQuizState, action: MysteryNovelsQuizAction): MysteryNovelsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MysteryNovelsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
