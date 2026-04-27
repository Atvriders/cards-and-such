import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EthicsQuizSettings { questions: "10" | "20" | "30"; }
export interface EthicsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EthicsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Utilitarianism evaluates actions by?",
    "choices": [
      "Their consequences/utility",
      "Their motives",
      "Their custom",
      "Their authority"
    ],
    "correct": 0
  },
  {
    "question": "Bentham's utilitarian principle measures?",
    "choices": [
      "Pleasure and pain",
      "Duty",
      "Virtue",
      "Faith"
    ],
    "correct": 0
  },
  {
    "question": "Mill distinguished between?",
    "choices": [
      "Higher and lower pleasures",
      "Long and short lives",
      "Public and private",
      "Rich and poor"
    ],
    "correct": 0
  },
  {
    "question": "Kantian ethics is most associated with?",
    "choices": [
      "Categorical imperative",
      "Hedonic calculus",
      "Virtues",
      "Care"
    ],
    "correct": 0
  },
  {
    "question": "Which formulation says treat persons as ends, never merely means?",
    "choices": [
      "Universal law",
      "Humanity formula",
      "Kingdom of ends",
      "Hedonic"
    ],
    "correct": 1
  },
  {
    "question": "Aristotle's ethics centers on?",
    "choices": [
      "Virtue and eudaimonia",
      "Pleasure",
      "Duty",
      "Will to power"
    ],
    "correct": 0
  },
  {
    "question": "Eudaimonia is best translated as?",
    "choices": [
      "Happiness/flourishing",
      "Bliss",
      "Heaven",
      "Status"
    ],
    "correct": 0
  },
  {
    "question": "Which is a virtue ethics philosopher?",
    "choices": [
      "MacIntyre",
      "Singer",
      "Sidgwick",
      "Smart"
    ],
    "correct": 0
  },
  {
    "question": "Care ethics is associated with?",
    "choices": [
      "Carol Gilligan",
      "Peter Singer",
      "Bernard Williams",
      "R.M. Hare"
    ],
    "correct": 0
  },
  {
    "question": "Peter Singer is famous for arguing about?",
    "choices": [
      "Animal ethics",
      "Divine command",
      "Stoic ethics",
      "Egoism"
    ],
    "correct": 0
  },
  {
    "question": "Which view says morality comes from God's commands?",
    "choices": [
      "Divine command theory",
      "Ethical egoism",
      "Contractualism",
      "Virtue ethics"
    ],
    "correct": 0
  },
  {
    "question": "Trolley problems test?",
    "choices": [
      "Logic puzzles",
      "Moral intuitions about consequences vs. constraints",
      "Math skills",
      "Memory"
    ],
    "correct": 1
  },
  {
    "question": "Rawls's veil of ignorance helps derive?",
    "choices": [
      "Principles of justice",
      "Categorical imperative",
      "Hedonic calculus",
      "Stoic apatheia"
    ],
    "correct": 0
  },
  {
    "question": "Nozick is associated with?",
    "choices": [
      "Libertarian/entitlement justice",
      "Egalitarian justice",
      "Communitarianism",
      "Virtue ethics"
    ],
    "correct": 0
  },
  {
    "question": "Deontology is the ethics of?",
    "choices": [
      "Duty/rules",
      "Outcomes",
      "Character",
      "Self-interest"
    ],
    "correct": 0
  },
  {
    "question": "Consequentialism is the ethics of?",
    "choices": [
      "Duty",
      "Outcomes",
      "Character",
      "Tradition"
    ],
    "correct": 1
  },
  {
    "question": "Hume's is/ought problem warns against?",
    "choices": [
      "Deriving prescriptions from facts",
      "Logic from emotion",
      "Ethics from religion",
      "Politics from ethics"
    ],
    "correct": 0
  },
  {
    "question": "Moral relativism holds that?",
    "choices": [
      "Values vary by culture/individual",
      "Values are absolute",
      "Values are God-given",
      "Values are biological"
    ],
    "correct": 0
  },
  {
    "question": "Bioethics is concerned with?",
    "choices": [
      "Medical and life-science ethics",
      "Stock markets",
      "Foreign policy",
      "Aesthetics"
    ],
    "correct": 0
  },
  {
    "question": "Informed consent is a key principle in?",
    "choices": [
      "Bioethics",
      "Tax law",
      "Aesthetics",
      "Logic"
    ],
    "correct": 0
  },
  {
    "question": "Which famous principle is 'first, do no harm'?",
    "choices": [
      "Non-maleficence",
      "Beneficence",
      "Justice",
      "Autonomy"
    ],
    "correct": 0
  },
  {
    "question": "Beneficence means?",
    "choices": [
      "Doing good",
      "Avoiding harm",
      "Truth telling",
      "Confidentiality"
    ],
    "correct": 0
  },
  {
    "question": "Autonomy in bioethics means?",
    "choices": [
      "Patient self-determination",
      "Doctor's discretion",
      "State control",
      "Family approval"
    ],
    "correct": 0
  },
  {
    "question": "Which ethical theory emphasizes social contract origins?",
    "choices": [
      "Contractualism",
      "Egoism",
      "Virtue",
      "Care"
    ],
    "correct": 0
  },
  {
    "question": "Stoic ethics aims at?",
    "choices": [
      "Apathy/equanimity (apatheia)",
      "Pleasure",
      "Power",
      "Faith"
    ],
    "correct": 0
  },
  {
    "question": "Existentialist ethics emphasizes?",
    "choices": [
      "Radical freedom and responsibility",
      "Divine command",
      "Tradition",
      "Utility"
    ],
    "correct": 0
  },
  {
    "question": "What is the doctrine of double effect?",
    "choices": [
      "Foreseen but unintended harm may be permissible",
      "Two motives are required",
      "Two witnesses are required",
      "Two harms cancel"
    ],
    "correct": 0
  },
  {
    "question": "Just war theory distinguishes?",
    "choices": [
      "Jus ad bellum and jus in bello",
      "Public and private war",
      "Defensive and offensive war",
      "Civil and total war"
    ],
    "correct": 0
  },
  {
    "question": "Environmental ethicists like Aldo Leopold proposed a?",
    "choices": [
      "Land ethic",
      "Capital ethic",
      "Tech ethic",
      "Science ethic"
    ],
    "correct": 0
  },
  {
    "question": "Which philosopher wrote 'After Virtue'?",
    "choices": [
      "Alasdair MacIntyre",
      "Bernard Williams",
      "Philippa Foot",
      "G.E.M. Anscombe"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EthicsQuizSettings): EthicsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EthicsQuizState, action: EthicsQuizAction): EthicsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EthicsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
