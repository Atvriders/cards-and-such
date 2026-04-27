import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FantasyNovelsQuizSettings { questions: "10" | "20" | "30"; }
export interface FantasyNovelsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FantasyNovelsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'The Lord of the Rings'?", choices: ["Tolkien","Lewis","Jordan","Martin"], correct: 0 },
  { question: "Who wrote 'The Hobbit'?", choices: ["Tolkien","Lewis","Pullman","Le Guin"], correct: 0 },
  { question: "Frodo carries what?", choices: ["Sword","One Ring","Mithril","Crown"], correct: 1 },
  { question: "Sauron's dark realm is?", choices: ["Mordor","Mirkwood","Rohan","Moria"], correct: 0 },
  { question: "Gandalf is a?", choices: ["Wizard","Elf","Dwarf","Hobbit"], correct: 0 },
  { question: "Who wrote 'The Chronicles of Narnia'?", choices: ["Tolkien","Lewis","Jordan","Sanderson"], correct: 1 },
  { question: "The lion in Narnia is named?", choices: ["Mufasa","Aslan","Cael","Ruatha"], correct: 1 },
  { question: "Who wrote the Harry Potter series?", choices: ["Pratchett","Rowling","Pullman","Le Guin"], correct: 1 },
  { question: "Harry's school is?", choices: ["Beauxbatons","Hogwarts","Durmstrang","Ilvermorny"], correct: 1 },
  { question: "Voldemort's previous name?", choices: ["Tom Riddle","Salazar","Severus","Lucius"], correct: 0 },
  { question: "Who wrote 'A Game of Thrones'?", choices: ["Martin","Jordan","Sanderson","Goodkind"], correct: 0 },
  { question: "House Stark's words are?", choices: ["Hear me roar","Winter is coming","Fire and blood","Family duty"], correct: 1 },
  { question: "Who wrote 'The Wheel of Time'?", choices: ["Jordan","Sanderson","Martin","Tolkien"], correct: 0 },
  { question: "Who finished 'The Wheel of Time'?", choices: ["Sanderson","Tolkien","Pratchett","Goodkind"], correct: 0 },
  { question: "Who wrote 'The Stormlight Archive'?", choices: ["Sanderson","Jordan","Hobb","Erikson"], correct: 0 },
  { question: "Who wrote 'Mistborn'?", choices: ["Sanderson","Jordan","Hobb","Rothfuss"], correct: 0 },
  { question: "Who wrote 'The Name of the Wind'?", choices: ["Rothfuss","Sanderson","Lynch","Abercrombie"], correct: 0 },
  { question: "Kvothe is the hero of?", choices: ["The Name of the Wind","The Way of Kings","Mistborn","The First Law"], correct: 0 },
  { question: "Who wrote 'The First Law' trilogy?", choices: ["Abercrombie","Lynch","Sanderson","Lawrence"], correct: 0 },
  { question: "Who wrote the 'Discworld' novels?", choices: ["Pratchett","Adams","Gaiman","Holt"], correct: 0 },
  { question: "Discworld is supported by?", choices: ["A turtle","A dragon","Atlas","Pillars"], correct: 0 },
  { question: "Who wrote 'American Gods'?", choices: ["Gaiman","Pratchett","Mieville","King"], correct: 0 },
  { question: "Who wrote 'The Sandman' (graphic novels)?", choices: ["Gaiman","Moore","Ennis","Miller"], correct: 0 },
  { question: "Who wrote 'Good Omens' (with Pratchett)?", choices: ["Gaiman","Adams","Moore","King"], correct: 0 },
  { question: "Who wrote 'A Wizard of Earthsea'?", choices: ["Le Guin","Pullman","McKinley","McKillip"], correct: 0 },
  { question: "Who wrote 'His Dark Materials'?", choices: ["Pullman","Lewis","Rowling","Pratchett"], correct: 0 },
  { question: "Lyra and Pan are from?", choices: ["His Dark Materials","Narnia","Earthsea","Eragon"], correct: 0 },
  { question: "Who wrote 'Eragon'?", choices: ["Paolini","Pullman","Sanderson","Funke"], correct: 0 },
  { question: "Who wrote 'The Once and Future King'?", choices: ["White","Tolkien","Lewis","Stewart"], correct: 0 },
  { question: "Who wrote 'The Mists of Avalon'?", choices: ["Bradley","Stewart","McCaffrey","Norton"], correct: 0 },
  { question: "Who wrote 'Dragonriders of Pern'?", choices: ["McCaffrey","Bradley","Norton","Le Guin"], correct: 0 },
  { question: "Who wrote 'The Belgariad'?", choices: ["Eddings","Brooks","Feist","Donaldson"], correct: 0 },
  { question: "Who wrote 'Sword of Shannara'?", choices: ["Brooks","Eddings","Feist","Donaldson"], correct: 0 },
  { question: "Who wrote 'Magician'?", choices: ["Feist","Eddings","Brooks","Donaldson"], correct: 0 },
  { question: "Who wrote 'The Broken Earth' trilogy?", choices: ["Jemisin","Okorafor","Liu","Wells"], correct: 0 },
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
