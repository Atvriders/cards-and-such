import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FantasyNovelsQuizSettings { questions: "10" | "20" | "30"; }
export interface FantasyNovelsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FantasyNovelsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'The Lord of the Rings'?", choices: ["Tolkien","Lewis","Jordan","Martin"], correct: 0 },
  { question: "Who wrote 'The Hobbit'?", choices: ["Lewis","Tolkien","Pratchett","Le Guin"], correct: 1 },
  { question: "Frodo carries the Ring to?", choices: ["Mordor","Rivendell","Mirkwood","Rohan"], correct: 0 },
  { question: "Aragorn is heir to the throne of?", choices: ["Gondor","Rohan","Arnor","Lindon"], correct: 0 },
  { question: "Who wrote 'The Chronicles of Narnia'?", choices: ["Tolkien","Lewis","Pullman","Rowling"], correct: 1 },
  { question: "The lion in Narnia is named?", choices: ["Aslan","Reepicheep","Tash","Jadis"], correct: 0 },
  { question: "Who wrote 'Harry Potter and the Philosopher's Stone'?", choices: ["Rowling","Pullman","Riordan","Tolkien"], correct: 0 },
  { question: "Hogwarts is divided into how many houses?", choices: ["3","4","5","7"], correct: 1 },
  { question: "Who wrote 'A Game of Thrones'?", choices: ["Martin","Jordan","Sanderson","Erikson"], correct: 0 },
  { question: "House Stark's words are?", choices: ["Hear Me Roar","Winter Is Coming","Fire and Blood","Family, Duty, Honor"], correct: 1 },
  { question: "Who wrote 'The Wheel of Time'?", choices: ["Jordan","Sanderson","Martin","Erikson"], correct: 0 },
  { question: "Who completed 'The Wheel of Time' after Jordan's death?", choices: ["Sanderson","Martin","Erikson","Rothfuss"], correct: 0 },
  { question: "Who wrote 'The Name of the Wind'?", choices: ["Rothfuss","Sanderson","Lynch","Abercrombie"], correct: 0 },
  { question: "Kvothe is the protagonist of?", choices: ["Mistborn","The Name of the Wind","The Lies of Locke Lamora","Gentleman Bastard"], correct: 1 },
  { question: "Who wrote the 'Mistborn' series?", choices: ["Sanderson","Rothfuss","Jordan","Martin"], correct: 0 },
  { question: "Who wrote 'The Way of Kings'?", choices: ["Sanderson","Rothfuss","Jordan","Erikson"], correct: 0 },
  { question: "Who wrote 'The Lies of Locke Lamora'?", choices: ["Lynch","Abercrombie","Sanderson","Rothfuss"], correct: 0 },
  { question: "Who wrote 'The First Law' trilogy?", choices: ["Abercrombie","Lynch","Sanderson","Erikson"], correct: 0 },
  { question: "Who wrote the 'Discworld' series?", choices: ["Pratchett","Adams","Gaiman","Martin"], correct: 0 },
  { question: "Who wrote 'American Gods'?", choices: ["Gaiman","Pratchett","Mieville","King"], correct: 0 },
  { question: "Who co-wrote 'Good Omens'?", choices: ["Gaiman & Pratchett","Gaiman & Mieville","Pratchett & Adams","King & Gaiman"], correct: 0 },
  { question: "Who wrote 'A Wizard of Earthsea'?", choices: ["Le Guin","McKillip","Norton","Bradley"], correct: 0 },
  { question: "Who wrote 'The Mists of Avalon'?", choices: ["Bradley","McCaffrey","Le Guin","Lackey"], correct: 0 },
  { question: "Who wrote 'Dragonflight' (Pern series)?", choices: ["McCaffrey","Le Guin","Bradley","Norton"], correct: 0 },
  { question: "Who wrote 'His Dark Materials'?", choices: ["Pullman","Rowling","Lewis","Riordan"], correct: 0 },
  { question: "Lyra Belacqua is the heroine of?", choices: ["Narnia","His Dark Materials","Earthsea","Mistborn"], correct: 1 },
  { question: "Who wrote 'Percy Jackson and the Lightning Thief'?", choices: ["Riordan","Rowling","Colfer","Pullman"], correct: 0 },
  { question: "Who wrote 'The Last Unicorn'?", choices: ["Beagle","Le Guin","McKillip","Lackey"], correct: 0 },
  { question: "Who wrote 'Jonathan Strange & Mr Norrell'?", choices: ["Clarke","Gaiman","Mieville","Pratchett"], correct: 0 },
  { question: "Who wrote 'The Fifth Season'?", choices: ["Jemisin","Butler","Le Guin","Okorafor"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FantasyNovelsQuizSettings): FantasyNovelsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FantasyNovelsQuizState, action: FantasyNovelsQuizAction): FantasyNovelsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FantasyNovelsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
