import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ValentinesQuizSettings { questions: "10" | "20" | "30"; }
export interface ValentinesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ValentinesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Valentine's Day is celebrated on?",
    "choices": [
      "Feb 1",
      "Feb 7",
      "Feb 14",
      "Feb 28"
    ],
    "correct": 2
  },
  {
    "question": "St. Valentine was a saint of which religion?",
    "choices": [
      "Hindu",
      "Buddhist",
      "Christian",
      "Muslim"
    ],
    "correct": 2
  },
  {
    "question": "Cupid is the Roman god of?",
    "choices": [
      "War",
      "Wisdom",
      "Love",
      "Sea"
    ],
    "correct": 2
  },
  {
    "question": "Cupid's Greek counterpart is?",
    "choices": [
      "Apollo",
      "Eros",
      "Ares",
      "Hermes"
    ],
    "correct": 1
  },
  {
    "question": "Roses on Valentine's symbolize?",
    "choices": [
      "Friendship",
      "Love",
      "Marriage",
      "Loss"
    ],
    "correct": 1
  },
  {
    "question": "Hallmark started selling cards in?",
    "choices": [
      "1900",
      "1913",
      "1929",
      "1945"
    ],
    "correct": 1
  },
  {
    "question": "Most popular Valentine's gift?",
    "choices": [
      "Chocolate",
      "Flowers",
      "Cards",
      "Jewelry"
    ],
    "correct": 2
  },
  {
    "question": "Which color rose means 'true love'?",
    "choices": [
      "Yellow",
      "White",
      "Red",
      "Pink"
    ],
    "correct": 2
  },
  {
    "question": "Sweetheart candies are also known as?",
    "choices": [
      "Necco hearts",
      "Conversation hearts",
      "Sugar hearts",
      "Love hearts"
    ],
    "correct": 1
  },
  {
    "question": "Valentine's was first associated with romance by?",
    "choices": [
      "Shakespeare",
      "Chaucer",
      "Dante",
      "Petrarch"
    ],
    "correct": 1
  },
  {
    "question": "Lupercalia, the Roman fest, was held in?",
    "choices": [
      "January",
      "February",
      "March",
      "May"
    ],
    "correct": 1
  },
  {
    "question": "Which country celebrates 'White Day' on March 14?",
    "choices": [
      "China",
      "Korea",
      "Japan",
      "Taiwan"
    ],
    "correct": 2
  },
  {
    "question": "Galentine's Day is on?",
    "choices": [
      "Feb 12",
      "Feb 13",
      "Feb 14",
      "Feb 15"
    ],
    "correct": 1
  },
  {
    "question": "Heart-shaped boxes for chocolates were popularized by?",
    "choices": [
      "Hershey",
      "Cadbury",
      "Russell Stover",
      "Richard Cadbury"
    ],
    "correct": 3
  },
  {
    "question": "Which 1929 event is St. Valentine's Day Massacre?",
    "choices": [
      "Mob killing in Chicago",
      "Fire in NYC",
      "Wall St crash",
      "Banking panic"
    ],
    "correct": 0
  },
  {
    "question": "Which Disney film features lovers Tramp and?",
    "choices": [
      "Lady",
      "Belle",
      "Cinderella",
      "Aurora"
    ],
    "correct": 0
  },
  {
    "question": "Which Shakespeare play is most romantic?",
    "choices": [
      "Hamlet",
      "Macbeth",
      "Romeo and Juliet",
      "Othello"
    ],
    "correct": 2
  },
  {
    "question": "Verona, Italy is associated with?",
    "choices": [
      "Casablanca",
      "Romeo and Juliet",
      "Cinderella",
      "Tristan"
    ],
    "correct": 1
  },
  {
    "question": "Roses are red, ___ are blue?",
    "choices": [
      "Skies",
      "Violets",
      "Eyes",
      "Daisies"
    ],
    "correct": 1
  },
  {
    "question": "Chaucer's 'Parliament of Fowls' linked Valentine's to?",
    "choices": [
      "Wedding",
      "Birds choosing mates",
      "Easter",
      "Christmas"
    ],
    "correct": 1
  },
  {
    "question": "Number of cards sent annually in US?",
    "choices": [
      "50M",
      "150M",
      "300M",
      "1B"
    ],
    "correct": 1
  },
  {
    "question": "Red and which color are Valentine's main?",
    "choices": [
      "Pink",
      "White",
      "Gold",
      "Black"
    ],
    "correct": 0
  },
  {
    "question": "X has long meant?",
    "choices": [
      "Hug",
      "Kiss",
      "Swear",
      "Love"
    ],
    "correct": 1
  },
  {
    "question": "Anti-Valentine's holiday is sometimes called?",
    "choices": [
      "Singles Day",
      "Black Day",
      "Lonely Day",
      "Forever Alone"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ValentinesQuizSettings): ValentinesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ValentinesQuizState, action: ValentinesQuizAction): ValentinesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ValentinesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
