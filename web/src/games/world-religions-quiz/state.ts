import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldReligionsQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldReligionsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldReligionsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which religion has the most adherents worldwide?",
    "choices": [
      "Christianity",
      "Islam",
      "Hinduism",
      "Buddhism"
    ],
    "correct": 0
  },
  {
    "question": "Who founded Christianity?",
    "choices": [
      "Paul",
      "Jesus",
      "Peter",
      "Constantine"
    ],
    "correct": 1
  },
  {
    "question": "What is the holy book of Islam?",
    "choices": [
      "Bible",
      "Torah",
      "Quran",
      "Vedas"
    ],
    "correct": 2
  },
  {
    "question": "Who founded Islam?",
    "choices": [
      "Ali",
      "Muhammad",
      "Abraham",
      "Moses"
    ],
    "correct": 1
  },
  {
    "question": "What is the holiest city of Islam?",
    "choices": [
      "Medina",
      "Jerusalem",
      "Mecca",
      "Damascus"
    ],
    "correct": 2
  },
  {
    "question": "What is the Jewish holy day of rest?",
    "choices": [
      "Sunday",
      "Friday",
      "Saturday",
      "Monday"
    ],
    "correct": 2
  },
  {
    "question": "What is the central scripture of Judaism?",
    "choices": [
      "Quran",
      "Torah",
      "New Testament",
      "Avesta"
    ],
    "correct": 1
  },
  {
    "question": "Who founded Sikhism?",
    "choices": [
      "Guru Nanak",
      "Guru Gobind Singh",
      "Kabir",
      "Mahavira"
    ],
    "correct": 0
  },
  {
    "question": "How many Sikh Gurus are there?",
    "choices": [
      "7",
      "9",
      "10",
      "12"
    ],
    "correct": 2
  },
  {
    "question": "What is the holy text of Sikhism?",
    "choices": [
      "Adi Granth (Guru Granth Sahib)",
      "Vedas",
      "Ramayana",
      "Bhagavad Gita"
    ],
    "correct": 0
  },
  {
    "question": "Who founded Jainism's modern form?",
    "choices": [
      "Mahavira",
      "Parshvanatha",
      "Rishabha",
      "Buddha"
    ],
    "correct": 0
  },
  {
    "question": "What is the central virtue of Jainism?",
    "choices": [
      "Wealth",
      "Ahimsa (non-violence)",
      "Knowledge",
      "Faith"
    ],
    "correct": 1
  },
  {
    "question": "What religion was founded by Zoroaster?",
    "choices": [
      "Zoroastrianism",
      "Manichaeism",
      "Mithraism",
      "Yazidism"
    ],
    "correct": 0
  },
  {
    "question": "Bahaism originated in which country?",
    "choices": [
      "India",
      "Iran (Persia)",
      "Egypt",
      "Lebanon"
    ],
    "correct": 1
  },
  {
    "question": "What is the Christian sacrament of joining the faith?",
    "choices": [
      "Communion",
      "Baptism",
      "Confirmation",
      "Ordination"
    ],
    "correct": 1
  },
  {
    "question": "What is the Five Pillars-counted obligation of Islam?",
    "choices": [
      "Confession",
      "Prayer (Salah)",
      "Fasting in Ramadan",
      "All five — shahada, salah, zakat, sawm, hajj"
    ],
    "correct": 3
  },
  {
    "question": "Who in Islam led the early community after Muhammad?",
    "choices": [
      "Caliphs",
      "Imams",
      "Prophets",
      "Sultans"
    ],
    "correct": 0
  },
  {
    "question": "What does 'Yom Kippur' mean?",
    "choices": [
      "Day of Atonement",
      "Day of Light",
      "New Year",
      "Festival of Booths"
    ],
    "correct": 0
  },
  {
    "question": "What Hindu concept describes cosmic moral law?",
    "choices": [
      "Karma",
      "Dharma",
      "Moksha",
      "Atman"
    ],
    "correct": 1
  },
  {
    "question": "What is liberation from samsara called in Hinduism?",
    "choices": [
      "Nirvana",
      "Moksha",
      "Atman",
      "Brahman"
    ],
    "correct": 1
  },
  {
    "question": "What Christian denomination has the most adherents?",
    "choices": [
      "Roman Catholic",
      "Eastern Orthodox",
      "Anglican",
      "Baptist"
    ],
    "correct": 0
  },
  {
    "question": "Where do Christians believe Jesus was crucified?",
    "choices": [
      "Jerusalem",
      "Bethlehem",
      "Nazareth",
      "Galilee"
    ],
    "correct": 0
  },
  {
    "question": "What is Shia and Sunni's main difference about?",
    "choices": [
      "Bible",
      "Successor of Muhammad",
      "Direction of prayer",
      "Use of icons"
    ],
    "correct": 1
  },
  {
    "question": "Confucianism originated in which country?",
    "choices": [
      "China",
      "Japan",
      "Korea",
      "India"
    ],
    "correct": 0
  },
  {
    "question": "Shinto is native to which country?",
    "choices": [
      "China",
      "Korea",
      "Japan",
      "Vietnam"
    ],
    "correct": 2
  },
  {
    "question": "What concept of Daoism describes the natural way?",
    "choices": [
      "Wuwei",
      "Karma",
      "Mitzvot",
      "Sunya"
    ],
    "correct": 0
  },
  {
    "question": "Who was the Hebrew patriarch said to receive the Ten Commandments?",
    "choices": [
      "Abraham",
      "Moses",
      "David",
      "Solomon"
    ],
    "correct": 1
  },
  {
    "question": "What is the Holy Spirit in Christian theology?",
    "choices": [
      "First Person of the Trinity",
      "Second Person",
      "Third Person",
      "Fourth Person"
    ],
    "correct": 2
  },
  {
    "question": "What is the call to prayer in Islam called?",
    "choices": [
      "Adhan",
      "Qiblah",
      "Wudu",
      "Iftar"
    ],
    "correct": 0
  },
  {
    "question": "Buddhism arose as a reaction within which broader tradition?",
    "choices": [
      "Zoroastrianism",
      "Hinduism (Vedic)",
      "Jainism",
      "Christianity"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldReligionsQuizSettings): WorldReligionsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldReligionsQuizState, action: WorldReligionsQuizAction): WorldReligionsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldReligionsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
