import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WesternPhilosophyQuizSettings { questions: "10" | "20" | "30"; }
export interface WesternPhilosophyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WesternPhilosophyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who's known as the father of Western philosophy?", choices: ["Socrates","Plato","Aristotle","Thales"], correct: 0 },
  { question: "Who taught Plato?", choices: ["Socrates","Aristotle","Both","Just Socrates"], correct: 0 },
  { question: "Who taught Aristotle?", choices: ["Plato","Socrates","Both","Just Plato"], correct: 0 },
  { question: "Who did Aristotle famously tutor?", choices: ["Alexander the Great","Plato","Just Alexander","Both"], correct: 0 },
  { question: "What's Plato's most famous work?", choices: ["The Republic","Apology","Both major","Phaedo"], correct: 2 },
  { question: "What's Aristotle's logical work?", choices: ["Organon","Metaphysics","Politics","Ethics"], correct: 0 },
  { question: "What's the Allegory of the Cave from?", choices: ["Plato's Republic","Aristotle","Both","Just Plato"], correct: 0 },
  { question: "What did Socrates famously say about wisdom?", choices: ["I know that I know nothing","Know thyself","Both attributed","Just first"], correct: 2 },
  { question: "How did Socrates die?", choices: ["Hemlock execution by Athens","Battle","Old age","Sickness"], correct: 0 },
  { question: "What's Stoicism's main teaching?", choices: ["Virtue, accept what cannot change","Just acceptance","Both","Just virtue"], correct: 2 },
  { question: "Who was Marcus Aurelius?", choices: ["Roman emperor and Stoic philosopher","Just emperor","Both","Just philosopher"], correct: 2 },
  { question: "What's Marcus Aurelius's book?", choices: ["Meditations","Stoic philosophy","Both","Just title"], correct: 0 },
  { question: "Who wrote Confessions?", choices: ["Augustine","Aquinas","Both","Just Augustine"], correct: 0 },
  { question: "Who wrote Summa Theologica?", choices: ["Aquinas","Augustine","Both","Just Aquinas"], correct: 0 },
  { question: "Who said 'I think therefore I am'?", choices: ["Descartes","Kant","Hume","Locke"], correct: 0 },
  { question: "What's Descartes's Latin phrase?", choices: ["Cogito ergo sum","Just Cogito","Both","Just sum"], correct: 2 },
  { question: "Who wrote Leviathan?", choices: ["Thomas Hobbes","John Locke","Rousseau","Both"], correct: 0 },
  { question: "Who wrote Two Treatises of Government?", choices: ["John Locke","Hobbes","Rousseau","Mill"], correct: 0 },
  { question: "Who wrote The Social Contract?", choices: ["Rousseau","Locke","Hobbes","Mill"], correct: 0 },
  { question: "Who wrote Critique of Pure Reason?", choices: ["Kant","Hegel","Hume","Schopenhauer"], correct: 0 },
  { question: "What's Kant's categorical imperative?", choices: ["Act so action could be universal law","Just duty","Both","Just rule"], correct: 2 },
  { question: "Who wrote The Phenomenology of Spirit?", choices: ["Hegel","Kant","Schopenhauer","Marx"], correct: 0 },
  { question: "Who said 'God is dead'?", choices: ["Nietzsche","Hegel","Kierkegaard","Sartre"], correct: 0 },
  { question: "Who wrote Thus Spoke Zarathustra?", choices: ["Nietzsche","Heidegger","Sartre","Both"], correct: 0 },
  { question: "Who wrote Being and Time?", choices: ["Heidegger","Sartre","Nietzsche","Husserl"], correct: 0 },
  { question: "Who's the founder of phenomenology?", choices: ["Husserl","Heidegger","Sartre","All related"], correct: 0 },
  { question: "Who wrote Being and Nothingness?", choices: ["Sartre","Heidegger","Camus","Both Sartre"], correct: 0 },
  { question: "Who's the existentialist that wrote The Stranger?", choices: ["Camus","Sartre","Both existentialists","Just Camus"], correct: 0 },
  { question: "Who founded utilitarianism formally?", choices: ["Jeremy Bentham","JS Mill","Both","Just Mill"], correct: 0 },
  { question: "Who wrote On Liberty?", choices: ["JS Mill","Bentham","Both","Just Mill"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WesternPhilosophyQuizSettings): WesternPhilosophyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WesternPhilosophyQuizState, action: WesternPhilosophyQuizAction): WesternPhilosophyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WesternPhilosophyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
