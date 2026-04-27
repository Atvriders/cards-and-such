import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WesternPhilosophyQuizSettings { questions: "10" | "20" | "30"; }
export interface WesternPhilosophyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WesternPhilosophyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who wrote 'The Republic'?",
    "choices": [
      "Plato",
      "Aristotle",
      "Socrates",
      "Cicero"
    ],
    "correct": 0
  },
  {
    "question": "Who taught Plato?",
    "choices": [
      "Aristotle",
      "Pythagoras",
      "Socrates",
      "Heraclitus"
    ],
    "correct": 2
  },
  {
    "question": "Who taught Aristotle?",
    "choices": [
      "Plato",
      "Socrates",
      "Diogenes",
      "Epicurus"
    ],
    "correct": 0
  },
  {
    "question": "Who wrote 'Meditations'?",
    "choices": [
      "Marcus Aurelius",
      "Cicero",
      "Seneca",
      "Epictetus"
    ],
    "correct": 0
  },
  {
    "question": "'I think, therefore I am' was said by?",
    "choices": [
      "Hume",
      "Locke",
      "Descartes",
      "Kant"
    ],
    "correct": 2
  },
  {
    "question": "Who wrote 'Critique of Pure Reason'?",
    "choices": [
      "Hegel",
      "Kant",
      "Schopenhauer",
      "Wittgenstein"
    ],
    "correct": 1
  },
  {
    "question": "Who wrote 'Thus Spoke Zarathustra'?",
    "choices": [
      "Marx",
      "Nietzsche",
      "Freud",
      "Heidegger"
    ],
    "correct": 1
  },
  {
    "question": "Who founded modern empiricism with 'An Essay Concerning Human Understanding'?",
    "choices": [
      "Locke",
      "Hobbes",
      "Berkeley",
      "Hume"
    ],
    "correct": 0
  },
  {
    "question": "Who wrote 'A Treatise of Human Nature'?",
    "choices": [
      "Hume",
      "Locke",
      "Berkeley",
      "Mill"
    ],
    "correct": 0
  },
  {
    "question": "Who wrote 'Leviathan'?",
    "choices": [
      "Locke",
      "Hobbes",
      "Rousseau",
      "Spinoza"
    ],
    "correct": 1
  },
  {
    "question": "Who wrote 'The Social Contract'?",
    "choices": [
      "Locke",
      "Hobbes",
      "Rousseau",
      "Voltaire"
    ],
    "correct": 2
  },
  {
    "question": "Who wrote 'On Liberty'?",
    "choices": [
      "Mill",
      "Locke",
      "Bentham",
      "Kant"
    ],
    "correct": 0
  },
  {
    "question": "Who founded utilitarianism?",
    "choices": [
      "Bentham",
      "Mill",
      "Sidgwick",
      "Kant"
    ],
    "correct": 0
  },
  {
    "question": "Who wrote 'Being and Time'?",
    "choices": [
      "Sartre",
      "Heidegger",
      "Husserl",
      "Camus"
    ],
    "correct": 1
  },
  {
    "question": "Who wrote 'Being and Nothingness'?",
    "choices": [
      "Camus",
      "Beauvoir",
      "Sartre",
      "Marcel"
    ],
    "correct": 2
  },
  {
    "question": "Who wrote 'The Second Sex'?",
    "choices": [
      "Beauvoir",
      "Arendt",
      "Murdoch",
      "Anscombe"
    ],
    "correct": 0
  },
  {
    "question": "Who founded phenomenology?",
    "choices": [
      "Husserl",
      "Heidegger",
      "Sartre",
      "Merleau-Ponty"
    ],
    "correct": 0
  },
  {
    "question": "Who wrote 'Tractatus Logico-Philosophicus'?",
    "choices": [
      "Frege",
      "Russell",
      "Wittgenstein",
      "Quine"
    ],
    "correct": 2
  },
  {
    "question": "Who wrote 'A Theory of Justice'?",
    "choices": [
      "Nozick",
      "Rawls",
      "Rorty",
      "Sen"
    ],
    "correct": 1
  },
  {
    "question": "Who wrote 'Anarchy, State, and Utopia'?",
    "choices": [
      "Nozick",
      "Rawls",
      "Hayek",
      "Friedman"
    ],
    "correct": 0
  },
  {
    "question": "Hegel's philosophical method is often called?",
    "choices": [
      "Empirical",
      "Dialectical",
      "Pragmatic",
      "Existential"
    ],
    "correct": 1
  },
  {
    "question": "Marx is known for which kind of materialism?",
    "choices": [
      "Naive",
      "Historical/dialectical",
      "Atomic",
      "Spiritual"
    ],
    "correct": 1
  },
  {
    "question": "Who said 'God is dead'?",
    "choices": [
      "Marx",
      "Nietzsche",
      "Freud",
      "Sartre"
    ],
    "correct": 1
  },
  {
    "question": "Who founded Stoicism?",
    "choices": [
      "Zeno of Citium",
      "Epicurus",
      "Diogenes",
      "Pyrrho"
    ],
    "correct": 0
  },
  {
    "question": "Who founded Epicureanism?",
    "choices": [
      "Zeno",
      "Epicurus",
      "Plotinus",
      "Pyrrho"
    ],
    "correct": 1
  },
  {
    "question": "Plotinus is the central figure of?",
    "choices": [
      "Stoicism",
      "Skepticism",
      "Neoplatonism",
      "Cynicism"
    ],
    "correct": 2
  },
  {
    "question": "St. Augustine wrote?",
    "choices": [
      "Confessions",
      "Summa Theologica",
      "Consolation of Philosophy",
      "City of Heaven"
    ],
    "correct": 0
  },
  {
    "question": "Aquinas wrote?",
    "choices": [
      "Confessions",
      "Summa Theologica",
      "Discourse on Method",
      "Ethics"
    ],
    "correct": 1
  },
  {
    "question": "Spinoza's major work is?",
    "choices": [
      "Ethics",
      "Method",
      "Discourse",
      "Letters"
    ],
    "correct": 0
  },
  {
    "question": "Pragmatism is associated with which American philosopher?",
    "choices": [
      "William James",
      "Bertrand Russell",
      "A.J. Ayer",
      "Quine"
    ],
    "correct": 0
  }
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
