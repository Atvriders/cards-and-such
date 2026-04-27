import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AmericanLitQuizSettings { questions: "10" | "20" | "30"; }
export interface AmericanLitQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AmericanLitQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'The Adventures of Huckleberry Finn'?", choices: ["Twain","Hemingway","Melville","Faulkner"], correct: 0 },
  { question: "Mark Twain's real name?", choices: ["Samuel Clemens","Stephen Crane","Sherwood Anderson","Sinclair Lewis"], correct: 0 },
  { question: "Who wrote 'The Old Man and the Sea'?", choices: ["Steinbeck","Hemingway","Faulkner","Fitzgerald"], correct: 1 },
  { question: "Who wrote 'A Farewell to Arms'?", choices: ["Hemingway","Fitzgerald","Steinbeck","Dos Passos"], correct: 0 },
  { question: "Who wrote 'For Whom the Bell Tolls'?", choices: ["Steinbeck","Hemingway","Fitzgerald","Faulkner"], correct: 1 },
  { question: "Who wrote 'The Great Gatsby'?", choices: ["Hemingway","Fitzgerald","Steinbeck","Dos Passos"], correct: 1 },
  { question: "Daisy Buchanan is from?", choices: ["The Sun Also Rises","Tender Is the Night","The Great Gatsby","Babbitt"], correct: 2 },
  { question: "Jay Gatsby is in love with?", choices: ["Daisy","Jordan","Myrtle","Nicole"], correct: 0 },
  { question: "Who wrote 'The Grapes of Wrath'?", choices: ["Hemingway","Steinbeck","Faulkner","Fitzgerald"], correct: 1 },
  { question: "Who wrote 'Of Mice and Men'?", choices: ["Steinbeck","Faulkner","Hemingway","Cather"], correct: 0 },
  { question: "Who wrote 'East of Eden'?", choices: ["Steinbeck","Cather","Faulkner","Lewis"], correct: 0 },
  { question: "Who wrote 'The Sound and the Fury'?", choices: ["Faulkner","Hemingway","Steinbeck","Wolfe"], correct: 0 },
  { question: "Who wrote 'As I Lay Dying'?", choices: ["Faulkner","Hemingway","Steinbeck","Anderson"], correct: 0 },
  { question: "Who wrote 'Beloved'?", choices: ["Walker","Morrison","Hurston","Angelou"], correct: 1 },
  { question: "Who wrote 'Song of Solomon'?", choices: ["Morrison","Walker","Naylor","Erdrich"], correct: 0 },
  { question: "Who wrote 'The Color Purple'?", choices: ["Morrison","Walker","Hurston","Gaines"], correct: 1 },
  { question: "Who wrote 'Their Eyes Were Watching God'?", choices: ["Hurston","Walker","Morrison","Brooks"], correct: 0 },
  { question: "Who wrote 'Invisible Man' (1952, novel about race)?", choices: ["Wright","Ellison","Baldwin","Hughes"], correct: 1 },
  { question: "Who wrote 'Native Son'?", choices: ["Wright","Ellison","Baldwin","DuBois"], correct: 0 },
  { question: "Who wrote 'Go Tell It on the Mountain'?", choices: ["Wright","Ellison","Baldwin","Wright"], correct: 2 },
  { question: "Who wrote 'To Kill a Mockingbird'?", choices: ["Lee","O'Connor","McCullers","Welty"], correct: 0 },
  { question: "Atticus Finch is in?", choices: ["The Help","To Kill a Mockingbird","Beloved","Light in August"], correct: 1 },
  { question: "Who wrote 'The Catcher in the Rye'?", choices: ["Salinger","Kerouac","Heller","Capote"], correct: 0 },
  { question: "Holden Caulfield narrates?", choices: ["On the Road","The Catcher in the Rye","Catch-22","In Cold Blood"], correct: 1 },
  { question: "Who wrote 'On the Road'?", choices: ["Kerouac","Burroughs","Ginsberg","Bukowski"], correct: 0 },
  { question: "Who wrote 'Catch-22'?", choices: ["Vonnegut","Heller","Mailer","Roth"], correct: 1 },
  { question: "Who wrote 'Slaughterhouse-Five'?", choices: ["Vonnegut","Heller","Pynchon","Updike"], correct: 0 },
  { question: "Who wrote 'In Cold Blood'?", choices: ["Capote","Mailer","Wolfe","Didion"], correct: 0 },
  { question: "Who wrote 'The Scarlet Letter'?", choices: ["Hawthorne","Melville","Twain","Cooper"], correct: 0 },
  { question: "Who wrote 'Moby-Dick'?", choices: ["Melville","Hawthorne","Cooper","Stowe"], correct: 0 },
  { question: "Who wrote 'Walden'?", choices: ["Emerson","Thoreau","Whitman","Dickinson"], correct: 1 },
  { question: "Who wrote 'Leaves of Grass'?", choices: ["Whitman","Dickinson","Frost","Plath"], correct: 0 },
  { question: "Who wrote 'The Road'?", choices: ["McCarthy","DeLillo","Pynchon","Updike"], correct: 0 },
  { question: "Who wrote 'Blood Meridian'?", choices: ["McCarthy","DeLillo","Pynchon","Bellow"], correct: 0 },
  { question: "Who wrote 'A Streetcar Named Desire'?", choices: ["Williams","Miller","O'Neill","Wilson"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AmericanLitQuizSettings): AmericanLitQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AmericanLitQuizState, action: AmericanLitQuizAction): AmericanLitQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AmericanLitQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
