import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BritishLitQuizSettings { questions: "10" | "20" | "30"; }
export interface BritishLitQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BritishLitQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'The Canterbury Tales'?", choices: ["Chaucer","Malory","Spenser","Sidney"], correct: 0 },
  { question: "Who wrote 'Paradise Lost'?", choices: ["Milton","Donne","Marvell","Dryden"], correct: 0 },
  { question: "Who wrote 'Beowulf' (modern translation by)?", choices: ["Heaney","Tolkien","Pound","Eliot"], correct: 0 },
  { question: "Who wrote 'The Faerie Queene'?", choices: ["Spenser","Sidney","Marlowe","Shakespeare"], correct: 0 },
  { question: "Who wrote 'Hamlet'?", choices: ["Marlowe","Shakespeare","Jonson","Kyd"], correct: 1 },
  { question: "Who wrote 'Doctor Faustus'?", choices: ["Marlowe","Shakespeare","Webster","Jonson"], correct: 0 },
  { question: "Who wrote 'Pride and Prejudice'?", choices: ["Bronte","Austen","Eliot","Gaskell"], correct: 1 },
  { question: "Who wrote 'Jane Eyre'?", choices: ["Charlotte Bronte","Emily Bronte","Anne Bronte","George Eliot"], correct: 0 },
  { question: "Who wrote 'Wuthering Heights'?", choices: ["Charlotte Bronte","Emily Bronte","Anne Bronte","Austen"], correct: 1 },
  { question: "Who wrote 'Great Expectations'?", choices: ["Dickens","Hardy","Eliot","Thackeray"], correct: 0 },
  { question: "Who wrote 'Oliver Twist'?", choices: ["Dickens","Thackeray","Trollope","Collins"], correct: 0 },
  { question: "Who wrote 'A Christmas Carol'?", choices: ["Dickens","Thackeray","Eliot","Hardy"], correct: 0 },
  { question: "Who wrote 'Middlemarch'?", choices: ["Eliot","Hardy","Gaskell","Trollope"], correct: 0 },
  { question: "Who wrote 'Tess of the d'Urbervilles'?", choices: ["Hardy","Eliot","Dickens","Conrad"], correct: 0 },
  { question: "Who wrote 'Heart of Darkness'?", choices: ["Conrad","Forster","Lawrence","Greene"], correct: 0 },
  { question: "Who wrote 'A Passage to India'?", choices: ["Forster","Conrad","Lawrence","Greene"], correct: 0 },
  { question: "Who wrote 'Mrs Dalloway'?", choices: ["Woolf","Mansfield","Bowen","Lessing"], correct: 0 },
  { question: "Who wrote 'To the Lighthouse'?", choices: ["Woolf","Mansfield","Murdoch","Lessing"], correct: 0 },
  { question: "Who wrote 'Brave New World'?", choices: ["Huxley","Orwell","Wells","Lewis"], correct: 0 },
  { question: "Who wrote 'Nineteen Eighty-Four'?", choices: ["Huxley","Orwell","Wells","Burgess"], correct: 1 },
  { question: "Who wrote 'Animal Farm'?", choices: ["Orwell","Huxley","Wells","Greene"], correct: 0 },
  { question: "Who wrote 'Lord of the Flies'?", choices: ["Golding","Greene","Murdoch","Lessing"], correct: 0 },
  { question: "Who wrote 'Brideshead Revisited'?", choices: ["Waugh","Greene","Forster","Maugham"], correct: 0 },
  { question: "Who wrote 'The End of the Affair'?", choices: ["Greene","Waugh","Forster","Maugham"], correct: 0 },
  { question: "Who wrote 'Sons and Lovers'?", choices: ["Lawrence","Forster","Conrad","Hardy"], correct: 0 },
  { question: "Who wrote 'A Clockwork Orange'?", choices: ["Burgess","Orwell","Greene","Amis"], correct: 0 },
  { question: "Who wrote 'Remains of the Day'?", choices: ["Ishiguro","Rushdie","McEwan","Barnes"], correct: 0 },
  { question: "Who wrote 'Midnight's Children'?", choices: ["Rushdie","Ishiguro","Naipaul","Smith"], correct: 0 },
  { question: "Who wrote 'Atonement'?", choices: ["McEwan","Barnes","Amis","Ishiguro"], correct: 0 },
  { question: "Who wrote 'Gulliver's Travels'?", choices: ["Defoe","Swift","Sterne","Fielding"], correct: 1 },
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
