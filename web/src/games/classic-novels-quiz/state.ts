import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ClassicNovelsQuizSettings { questions: "10" | "20" | "30"; }
export interface ClassicNovelsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ClassicNovelsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who wrote 'Pride and Prejudice'?", choices: ["Charlotte Bronte","Jane Austen","Emily Dickinson","Mary Shelley"], correct: 1 },
  { question: "'It was the best of times, it was the worst of times' opens which novel?", choices: ["Bleak House","Great Expectations","A Tale of Two Cities","Oliver Twist"], correct: 2 },
  { question: "Who wrote 'War and Peace'?", choices: ["Dostoevsky","Tolstoy","Turgenev","Chekhov"], correct: 1 },
  { question: "Who wrote 'Anna Karenina'?", choices: ["Dostoevsky","Tolstoy","Pasternak","Gogol"], correct: 1 },
  { question: "Who wrote 'Crime and Punishment'?", choices: ["Tolstoy","Dostoevsky","Turgenev","Solzhenitsyn"], correct: 1 },
  { question: "Who is the protagonist of 'Crime and Punishment'?", choices: ["Raskolnikov","Karamazov","Bezukhov","Vronsky"], correct: 0 },
  { question: "Who wrote 'Jane Eyre'?", choices: ["Charlotte Bronte","Emily Bronte","Anne Bronte","George Eliot"], correct: 0 },
  { question: "Who wrote 'Wuthering Heights'?", choices: ["Charlotte Bronte","Emily Bronte","Anne Bronte","Jane Austen"], correct: 1 },
  { question: "Heathcliff is from which novel?", choices: ["Wuthering Heights","Jane Eyre","Tess","Mill on the Floss"], correct: 0 },
  { question: "Who wrote 'Madame Bovary'?", choices: ["Hugo","Flaubert","Dumas","Balzac"], correct: 1 },
  { question: "Who wrote 'Les Miserables'?", choices: ["Hugo","Flaubert","Zola","Dumas"], correct: 0 },
  { question: "Jean Valjean is from?", choices: ["The Count of Monte Cristo","Les Miserables","Notre-Dame de Paris","Germinal"], correct: 1 },
  { question: "Who wrote 'The Count of Monte Cristo'?", choices: ["Hugo","Dumas","Verne","Zola"], correct: 1 },
  { question: "Who wrote 'Don Quixote'?", choices: ["Lorca","Cervantes","Borges","Marquez"], correct: 1 },
  { question: "Don Quixote's faithful squire?", choices: ["Sancho Panza","Sanchez","Pedro","Diego"], correct: 0 },
  { question: "Who wrote 'Moby-Dick'?", choices: ["Melville","Hawthorne","Poe","Twain"], correct: 0 },
  { question: "Captain Ahab pursues which whale?", choices: ["White","Black","Blue","Grey"], correct: 0 },
  { question: "Who wrote 'The Scarlet Letter'?", choices: ["Hawthorne","Melville","James","Twain"], correct: 0 },
  { question: "Who wrote 'Frankenstein'?", choices: ["Stoker","Shelley","Poe","Wilde"], correct: 1 },
  { question: "Who wrote 'Dracula'?", choices: ["Shelley","Stoker","Poe","Stevenson"], correct: 1 },
  { question: "Who wrote 'The Picture of Dorian Gray'?", choices: ["Wilde","Stoker","Hardy","Eliot"], correct: 0 },
  { question: "Who wrote 'Tess of the d'Urbervilles'?", choices: ["Hardy","Dickens","Eliot","Trollope"], correct: 0 },
  { question: "Who wrote 'Middlemarch'?", choices: ["Eliot","Hardy","Trollope","Gaskell"], correct: 0 },
  { question: "Who wrote 'Bleak House'?", choices: ["Dickens","Trollope","Eliot","Thackeray"], correct: 0 },
  { question: "Who wrote 'Vanity Fair' (1848)?", choices: ["Thackeray","Dickens","Eliot","Hardy"], correct: 0 },
  { question: "Pip is the narrator in?", choices: ["David Copperfield","Great Expectations","Bleak House","Oliver Twist"], correct: 1 },
  { question: "Who wrote 'The Brothers Karamazov'?", choices: ["Tolstoy","Dostoevsky","Turgenev","Gogol"], correct: 1 },
  { question: "Who wrote 'Fathers and Sons'?", choices: ["Tolstoy","Dostoevsky","Turgenev","Chekhov"], correct: 2 },
  { question: "Who wrote 'Dead Souls'?", choices: ["Tolstoy","Dostoevsky","Gogol","Pushkin"], correct: 2 },
  { question: "'Emma' is by which author?", choices: ["Austen","Eliot","Gaskell","Trollope"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ClassicNovelsQuizSettings): ClassicNovelsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ClassicNovelsQuizState, action: ClassicNovelsQuizAction): ClassicNovelsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ClassicNovelsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
