import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EasternPhilosophyQuizSettings { questions: "10" | "20" | "30"; }
export interface EasternPhilosophyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EasternPhilosophyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who founded Confucianism?",
    "choices": [
      "Lao Tzu",
      "Confucius",
      "Mencius",
      "Zhuangzi"
    ],
    "correct": 1
  },
  {
    "question": "Who is traditionally said to have founded Daoism?",
    "choices": [
      "Confucius",
      "Lao Tzu",
      "Han Feizi",
      "Mozi"
    ],
    "correct": 1
  },
  {
    "question": "What is the central text of Daoism?",
    "choices": [
      "Tao Te Ching",
      "Analects",
      "Book of Changes",
      "Zhuangzi"
    ],
    "correct": 0
  },
  {
    "question": "What is the central collection of Confucius's sayings?",
    "choices": [
      "Mencius",
      "Analects",
      "Book of Rites",
      "Doctrine of the Mean"
    ],
    "correct": 1
  },
  {
    "question": "What concept means effortless action in Daoism?",
    "choices": [
      "Wuwei",
      "Ren",
      "Li",
      "Yi"
    ],
    "correct": 0
  },
  {
    "question": "What Confucian virtue is humaneness or benevolence?",
    "choices": [
      "Yi",
      "Li",
      "Ren",
      "Zhi"
    ],
    "correct": 2
  },
  {
    "question": "What term means propriety/ritual in Confucian thought?",
    "choices": [
      "Ren",
      "Li",
      "Yi",
      "De"
    ],
    "correct": 1
  },
  {
    "question": "Mozi taught the doctrine of?",
    "choices": [
      "Filial piety",
      "Universal love",
      "Strict legalism",
      "Quietism"
    ],
    "correct": 1
  },
  {
    "question": "Han Feizi is most associated with?",
    "choices": [
      "Daoism",
      "Mohism",
      "Legalism",
      "Confucianism"
    ],
    "correct": 2
  },
  {
    "question": "What is the Yin-Yang principle about?",
    "choices": [
      "Conflict",
      "Complementary opposites",
      "Static order",
      "Pure spirit"
    ],
    "correct": 1
  },
  {
    "question": "Who developed Indian Yoga philosophy in sutras?",
    "choices": [
      "Patanjali",
      "Shankara",
      "Ramanuja",
      "Nagarjuna"
    ],
    "correct": 0
  },
  {
    "question": "Adi Shankara is associated with which school?",
    "choices": [
      "Advaita Vedanta",
      "Visistadvaita",
      "Dvaita",
      "Mimamsa"
    ],
    "correct": 0
  },
  {
    "question": "Nagarjuna is famous in Buddhist philosophy for?",
    "choices": [
      "Madhyamaka (emptiness)",
      "Yogacara (mind-only)",
      "Theravada",
      "Vinaya"
    ],
    "correct": 0
  },
  {
    "question": "Yogacara school taught primacy of?",
    "choices": [
      "Form",
      "Mind/consciousness",
      "Substance",
      "Numbers"
    ],
    "correct": 1
  },
  {
    "question": "Who is the great Korean Zen master Wonhyo associated with?",
    "choices": [
      "7th c. Korea",
      "17th c. Japan",
      "11th c. China",
      "19th c. Tibet"
    ],
    "correct": 0
  },
  {
    "question": "Zen's emphasis is on?",
    "choices": [
      "Memorization",
      "Direct experience",
      "Devotion to icons",
      "Logic"
    ],
    "correct": 1
  },
  {
    "question": "Who founded the Chan/Zen school in China (legendary)?",
    "choices": [
      "Bodhidharma",
      "Huineng",
      "Linji",
      "Dogen"
    ],
    "correct": 0
  },
  {
    "question": "Dogen founded which school in Japan?",
    "choices": [
      "Soto Zen",
      "Rinzai Zen",
      "Pure Land",
      "Nichiren"
    ],
    "correct": 0
  },
  {
    "question": "What does 'koan' mean?",
    "choices": [
      "Riddle for awakening",
      "Sutra",
      "Mantra",
      "Mudra"
    ],
    "correct": 0
  },
  {
    "question": "Mencius believed human nature is?",
    "choices": [
      "Evil",
      "Good",
      "Neutral",
      "Indifferent"
    ],
    "correct": 1
  },
  {
    "question": "Xunzi believed human nature is?",
    "choices": [
      "Good",
      "Evil",
      "Neutral",
      "Divine"
    ],
    "correct": 1
  },
  {
    "question": "Zhuangzi is famous for the 'butterfly' parable about?",
    "choices": [
      "Reality and dreaming",
      "Filial piety",
      "Government",
      "War"
    ],
    "correct": 0
  },
  {
    "question": "I Ching means?",
    "choices": [
      "Book of Songs",
      "Book of Changes",
      "Book of Documents",
      "Book of Rites"
    ],
    "correct": 1
  },
  {
    "question": "Sun Tzu wrote which classic?",
    "choices": [
      "The Art of War",
      "Analects",
      "Mencius",
      "Five Classics"
    ],
    "correct": 0
  },
  {
    "question": "What does 'qi' refer to?",
    "choices": [
      "Vital energy",
      "Stone",
      "Honor",
      "Family"
    ],
    "correct": 0
  },
  {
    "question": "Neo-Confucianism's leading thinker was?",
    "choices": [
      "Wang Yangming",
      "Zhu Xi",
      "Han Yu",
      "Sima Qian"
    ],
    "correct": 1
  },
  {
    "question": "Wang Yangming taught the unity of?",
    "choices": [
      "Knowledge and action",
      "Ruler and minister",
      "Heaven and earth",
      "Father and son"
    ],
    "correct": 0
  },
  {
    "question": "The Bushido code is primarily associated with?",
    "choices": [
      "Japanese samurai ethics",
      "Indian sages",
      "Chinese sages",
      "Tibetan monks"
    ],
    "correct": 0
  },
  {
    "question": "Who is the Japanese philosopher of Kyoto School?",
    "choices": [
      "Nishida Kitaro",
      "Yukio Mishima",
      "Soseki Natsume",
      "Kobo Abe"
    ],
    "correct": 0
  },
  {
    "question": "'Satori' refers to?",
    "choices": [
      "Sudden enlightenment",
      "Long meditation",
      "Burial rite",
      "Pilgrimage"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EasternPhilosophyQuizSettings): EasternPhilosophyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EasternPhilosophyQuizState, action: EasternPhilosophyQuizAction): EasternPhilosophyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EasternPhilosophyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
