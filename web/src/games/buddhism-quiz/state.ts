import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BuddhismQuizSettings { questions: "10" | "20" | "30"; }
export interface BuddhismQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BuddhismQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who founded Buddhism?",
    "choices": [
      "Mahavira",
      "Confucius",
      "Siddhartha Gautama",
      "Lao Tzu"
    ],
    "correct": 2
  },
  {
    "question": "What does 'Buddha' literally mean?",
    "choices": [
      "Teacher",
      "Awakened One",
      "Holy One",
      "Wanderer"
    ],
    "correct": 1
  },
  {
    "question": "In which country was the Buddha born?",
    "choices": [
      "India",
      "Nepal",
      "Sri Lanka",
      "Tibet"
    ],
    "correct": 1
  },
  {
    "question": "Under which tree did the Buddha attain enlightenment?",
    "choices": [
      "Banyan",
      "Bodhi (fig)",
      "Sal",
      "Pine"
    ],
    "correct": 1
  },
  {
    "question": "How many Noble Truths are there?",
    "choices": [
      "3",
      "4",
      "5",
      "8"
    ],
    "correct": 1
  },
  {
    "question": "How many steps in the Eightfold Path?",
    "choices": [
      "6",
      "7",
      "8",
      "10"
    ],
    "correct": 2
  },
  {
    "question": "What is the cycle of rebirth called?",
    "choices": [
      "Karma",
      "Samsara",
      "Dukkha",
      "Nirvana"
    ],
    "correct": 1
  },
  {
    "question": "What is the goal of Buddhist practice?",
    "choices": [
      "Heaven",
      "Nirvana",
      "Reincarnation",
      "Dharma"
    ],
    "correct": 1
  },
  {
    "question": "What is 'dukkha'?",
    "choices": [
      "Joy",
      "Suffering",
      "Knowledge",
      "Compassion"
    ],
    "correct": 1
  },
  {
    "question": "What does 'karma' refer to?",
    "choices": [
      "Desire",
      "Action and its consequences",
      "Suffering",
      "Meditation"
    ],
    "correct": 1
  },
  {
    "question": "Which is NOT a school of Buddhism?",
    "choices": [
      "Theravada",
      "Mahayana",
      "Vajrayana",
      "Vedanta"
    ],
    "correct": 3
  },
  {
    "question": "Which Buddhism is dominant in Tibet?",
    "choices": [
      "Theravada",
      "Pure Land",
      "Vajrayana",
      "Zen"
    ],
    "correct": 2
  },
  {
    "question": "Which school is dominant in Sri Lanka and Thailand?",
    "choices": [
      "Theravada",
      "Mahayana",
      "Vajrayana",
      "Nichiren"
    ],
    "correct": 0
  },
  {
    "question": "Which Mahayana school is famous in Japan for sitting meditation?",
    "choices": [
      "Pure Land",
      "Nichiren",
      "Zen",
      "Shingon"
    ],
    "correct": 2
  },
  {
    "question": "Who is the future Buddha to come?",
    "choices": [
      "Amitabha",
      "Maitreya",
      "Vairocana",
      "Tara"
    ],
    "correct": 1
  },
  {
    "question": "Who is the bodhisattva of compassion (Avalokitesvara, in Chinese)?",
    "choices": [
      "Manjushri",
      "Guanyin",
      "Samantabhadra",
      "Ksitigarbha"
    ],
    "correct": 1
  },
  {
    "question": "Who is the bodhisattva of wisdom?",
    "choices": [
      "Manjushri",
      "Maitreya",
      "Tara",
      "Akshobhya"
    ],
    "correct": 0
  },
  {
    "question": "What is the spiritual leader of Tibetan Buddhism's Gelug school?",
    "choices": [
      "Pope",
      "Dalai Lama",
      "Imam",
      "Bhante"
    ],
    "correct": 1
  },
  {
    "question": "What is a 'sangha'?",
    "choices": [
      "A monastery",
      "The Buddhist community",
      "A scripture",
      "A meditation"
    ],
    "correct": 1
  },
  {
    "question": "What are the Three Jewels (Triple Gem)?",
    "choices": [
      "Buddha, Dharma, Sangha",
      "Buddha, Karma, Nirvana",
      "Mind, Body, Spirit",
      "Wisdom, Faith, Compassion"
    ],
    "correct": 0
  },
  {
    "question": "What is the first precept for lay Buddhists?",
    "choices": [
      "Do not kill",
      "Do not steal",
      "Do not lie",
      "Do not drink alcohol"
    ],
    "correct": 0
  },
  {
    "question": "What is the Pali Canon written in?",
    "choices": [
      "Sanskrit",
      "Pali",
      "Tibetan",
      "Chinese"
    ],
    "correct": 1
  },
  {
    "question": "Mahayana scriptures are typically in which language?",
    "choices": [
      "Pali",
      "Sanskrit",
      "Persian",
      "Hebrew"
    ],
    "correct": 1
  },
  {
    "question": "Which sutra is famous for emptiness ('form is emptiness')?",
    "choices": [
      "Lotus Sutra",
      "Heart Sutra",
      "Diamond Sutra",
      "Avatamsaka"
    ],
    "correct": 1
  },
  {
    "question": "What does 'mantra' refer to?",
    "choices": [
      "Statue",
      "Sacred sound or phrase",
      "Sacred text",
      "Sacred place"
    ],
    "correct": 1
  },
  {
    "question": "Who is the Buddha of infinite light in Pure Land Buddhism?",
    "choices": [
      "Vairocana",
      "Amitabha",
      "Akshobhya",
      "Maitreya"
    ],
    "correct": 1
  },
  {
    "question": "Where did the Buddha die?",
    "choices": [
      "Lumbini",
      "Bodh Gaya",
      "Sarnath",
      "Kushinagar"
    ],
    "correct": 3
  },
  {
    "question": "Where did the Buddha give his first sermon?",
    "choices": [
      "Sarnath",
      "Bodh Gaya",
      "Lumbini",
      "Rajgir"
    ],
    "correct": 0
  },
  {
    "question": "What is meditation called in Pali?",
    "choices": [
      "Bhavana",
      "Yoga",
      "Tapas",
      "Puja"
    ],
    "correct": 0
  },
  {
    "question": "What is 'anatta'?",
    "choices": [
      "Compassion",
      "Non-self",
      "Karma",
      "Impermanence"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BuddhismQuizSettings): BuddhismQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BuddhismQuizState, action: BuddhismQuizAction): BuddhismQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BuddhismQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
