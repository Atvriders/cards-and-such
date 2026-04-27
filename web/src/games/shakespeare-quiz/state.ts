import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ShakespeareQuizSettings { questions: "10" | "20" | "30"; }
export interface ShakespeareQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ShakespeareQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In which play does Lady Macbeth appear?", choices: ["Hamlet","Macbeth","King Lear","Othello"], correct: 1 },
  { question: "Who is Hamlet's father (the ghost)?", choices: ["Claudius","Polonius","King Hamlet","Fortinbras"], correct: 2 },
  { question: "Which play features the line 'A horse, a horse, my kingdom for a horse'?", choices: ["Henry V","Richard III","Macbeth","King John"], correct: 1 },
  { question: "Romeo and Juliet is set in which Italian city?", choices: ["Florence","Verona","Rome","Venice"], correct: 1 },
  { question: "Who is the moor of Venice?", choices: ["Iago","Othello","Cassio","Roderigo"], correct: 1 },
  { question: "Iago is the villain in?", choices: ["Macbeth","Hamlet","Othello","Lear"], correct: 2 },
  { question: "How many sonnets did Shakespeare write?", choices: ["104","124","154","174"], correct: 2 },
  { question: "'Shall I compare thee to a summer's day' is which sonnet?", choices: ["12","18","30","116"], correct: 1 },
  { question: "Who is Prospero?", choices: ["A king in Henry V","A duke in The Tempest","A merchant in Venice","A prince in Hamlet"], correct: 1 },
  { question: "What is the setting of A Midsummer Night's Dream?", choices: ["Athens and forest","Rome","Egypt","London"], correct: 0 },
  { question: "Puck appears in?", choices: ["Hamlet","A Midsummer Night's Dream","The Tempest","Twelfth Night"], correct: 1 },
  { question: "Who killed Julius Caesar (lead conspirator)?", choices: ["Antony","Brutus","Cassius","Casca"], correct: 1 },
  { question: "King Lear had how many daughters?", choices: ["2","3","4","5"], correct: 1 },
  { question: "Cordelia is the daughter of?", choices: ["Macbeth","Lear","Prospero","Theseus"], correct: 1 },
  { question: "Falstaff appears in?", choices: ["Henry IV","Henry V","Henry VI","All of these"], correct: 0 },
  { question: "The Globe Theatre was located in?", choices: ["Stratford","London","Windsor","Bath"], correct: 1 },
  { question: "Shakespeare was born in?", choices: ["London","Stratford-upon-Avon","Canterbury","Bristol"], correct: 1 },
  { question: "His wife's name was?", choices: ["Anne Hathaway","Mary Arden","Judith Quiney","Susanna Hall"], correct: 0 },
  { question: "'To be or not to be' is from?", choices: ["Macbeth","Hamlet","Othello","Lear"], correct: 1 },
  { question: "Yorick's skull appears in?", choices: ["Macbeth","Hamlet","King John","Richard III"], correct: 1 },
  { question: "Caliban is a character in?", choices: ["The Tempest","A Midsummer Night's Dream","As You Like It","Twelfth Night"], correct: 0 },
  { question: "Beatrice and Benedick spar in?", choices: ["Much Ado About Nothing","Twelfth Night","As You Like It","Love's Labour's Lost"], correct: 0 },
  { question: "Viola dresses as a man in?", choices: ["Twelfth Night","As You Like It","Cymbeline","Two Gentlemen"], correct: 0 },
  { question: "Rosalind is the heroine of?", choices: ["As You Like It","Twelfth Night","Two Gentlemen","Much Ado"], correct: 0 },
  { question: "Antonio is a merchant in?", choices: ["The Merchant of Venice","Two Gentlemen","Twelfth Night","Both Merchant and Twelfth Night"], correct: 3 },
  { question: "Shylock demands a pound of flesh in?", choices: ["The Merchant of Venice","Othello","Twelfth Night","Coriolanus"], correct: 0 },
  { question: "Three witches appear in?", choices: ["Hamlet","Macbeth","Lear","Othello"], correct: 1 },
  { question: "Banquo is murdered in?", choices: ["Hamlet","Macbeth","Lear","Henry V"], correct: 1 },
  { question: "Mercutio dies in?", choices: ["Romeo and Juliet","Hamlet","Othello","Lear"], correct: 0 },
  { question: "Tybalt is a Capulet in?", choices: ["Romeo and Juliet","Two Gentlemen","Twelfth Night","Cymbeline"], correct: 0 },
  { question: "Henry V's famous battle was at?", choices: ["Bosworth","Agincourt","Hastings","Bannockburn"], correct: 1 },
  { question: "Cleopatra dies by?", choices: ["Sword","Poison","Asp bite","Drowning"], correct: 2 },
  { question: "Mark Antony's love is?", choices: ["Cleopatra","Calphurnia","Portia","Helena"], correct: 0 },
  { question: "Coriolanus is set in?", choices: ["Greece","Rome","Egypt","Britain"], correct: 1 },
  { question: "Shakespeare died in what year?", choices: ["1588","1603","1616","1632"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ShakespeareQuizSettings): ShakespeareQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ShakespeareQuizState, action: ShakespeareQuizAction): ShakespeareQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ShakespeareQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
