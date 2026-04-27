import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BritishLitQuizSettings { questions: "10" | "20" | "30"; }
export interface BritishLitQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BritishLitQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'The Canterbury Tales'?", choices: ["Chaucer","Malory","Spenser","Sidney"], correct: 0 },
  { question: "'The Canterbury Tales' was written in?", choices: ["8th century","12th century","14th century","16th century"], correct: 2 },
  { question: "Who wrote 'Paradise Lost'?", choices: ["Milton","Donne","Marvell","Pope"], correct: 0 },
  { question: "Who wrote 'Robinson Crusoe'?", choices: ["Defoe","Swift","Sterne","Richardson"], correct: 0 },
  { question: "Who wrote 'Gulliver's Travels'?", choices: ["Defoe","Swift","Smollett","Fielding"], correct: 1 },
  { question: "Who wrote 'Tom Jones' (1749)?", choices: ["Fielding","Richardson","Sterne","Smollett"], correct: 0 },
  { question: "Who wrote 'Tristram Shandy'?", choices: ["Sterne","Fielding","Smollett","Burney"], correct: 0 },
  { question: "Who wrote 'Pride and Prejudice'?", choices: ["Charlotte Bronte","Jane Austen","George Eliot","Mary Shelley"], correct: 1 },
  { question: "Who wrote 'Jane Eyre'?", choices: ["Charlotte Bronte","Emily Bronte","Anne Bronte","Austen"], correct: 0 },
  { question: "Who wrote 'Wuthering Heights'?", choices: ["Charlotte","Emily","Anne","Branwell"], correct: 1 },
  { question: "Who wrote 'The Tenant of Wildfell Hall'?", choices: ["Charlotte","Emily","Anne","Gaskell"], correct: 2 },
  { question: "Who wrote 'Bleak House'?", choices: ["Dickens","Eliot","Trollope","Thackeray"], correct: 0 },
  { question: "Who wrote 'Middlemarch'?", choices: ["Eliot","Hardy","Trollope","Gaskell"], correct: 0 },
  { question: "Who wrote 'Tess of the d'Urbervilles'?", choices: ["Hardy","Eliot","Lawrence","Forster"], correct: 0 },
  { question: "Who wrote 'Far from the Madding Crowd'?", choices: ["Hardy","Eliot","Trollope","Lawrence"], correct: 0 },
  { question: "Who wrote 'A Room with a View'?", choices: ["Forster","Lawrence","Woolf","Bennett"], correct: 0 },
  { question: "Who wrote 'Mrs Dalloway'?", choices: ["Mansfield","Woolf","Forster","Lawrence"], correct: 1 },
  { question: "Who wrote 'To the Lighthouse'?", choices: ["Woolf","Mansfield","Forster","Eliot"], correct: 0 },
  { question: "Who wrote 'Sons and Lovers'?", choices: ["Lawrence","Forster","Hardy","Joyce"], correct: 0 },
  { question: "Who wrote 'Lady Chatterley's Lover'?", choices: ["Lawrence","Forster","Maugham","Greene"], correct: 0 },
  { question: "Who wrote '1984'?", choices: ["Huxley","Orwell","Wells","Greene"], correct: 1 },
  { question: "Who wrote 'Animal Farm'?", choices: ["Orwell","Huxley","Greene","Auden"], correct: 0 },
  { question: "Who wrote 'Brave New World'?", choices: ["Orwell","Huxley","Wells","Greene"], correct: 1 },
  { question: "Who wrote 'The Time Machine'?", choices: ["Wells","Verne","Huxley","Orwell"], correct: 0 },
  { question: "Who wrote 'The War of the Worlds'?", choices: ["Wells","Verne","Asimov","Clarke"], correct: 0 },
  { question: "Who wrote 'Brideshead Revisited'?", choices: ["Waugh","Greene","Maugham","Forster"], correct: 0 },
  { question: "Who wrote 'The End of the Affair'?", choices: ["Waugh","Greene","Maugham","Wodehouse"], correct: 1 },
  { question: "Who wrote 'Of Human Bondage'?", choices: ["Maugham","Greene","Forster","Lawrence"], correct: 0 },
  { question: "Who wrote 'Lord of the Flies'?", choices: ["Golding","Lessing","Murdoch","Spark"], correct: 0 },
  { question: "Who wrote 'A Clockwork Orange'?", choices: ["Burgess","Amis","McEwan","Barnes"], correct: 0 },
  { question: "Who wrote 'Atonement'?", choices: ["McEwan","Amis","Barnes","Mitchell"], correct: 0 },
  { question: "Who wrote 'Wolf Hall'?", choices: ["Mantel","Atwood","Mitchell","Byatt"], correct: 0 },
  { question: "Who wrote 'Possession'?", choices: ["Byatt","Mantel","Carter","Drabble"], correct: 0 },
  { question: "Who wrote 'Cloud Atlas'?", choices: ["Mitchell","McEwan","Amis","Barnes"], correct: 0 },
  { question: "Who wrote 'The Remains of the Day'?", choices: ["Ishiguro","McEwan","Barnes","Mitchell"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BritishLitQuizSettings): BritishLitQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BritishLitQuizState, action: BritishLitQuizAction): BritishLitQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BritishLitQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
