import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NbaLegendsQuizSettings { questions: "10" | "20" | "30"; }
export interface NbaLegendsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NbaLegendsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who won 6 NBA Finals MVPs?",
    "choices": [
      "LeBron James",
      "Magic Johnson",
      "Michael Jordan",
      "Larry Bird"
    ],
    "correct": 2
  },
  {
    "question": "Which Lakers legend wore #24 (and #8)?",
    "choices": [
      "Magic Johnson",
      "Kobe Bryant",
      "Shaquille O'Neal",
      "Wilt Chamberlain"
    ],
    "correct": 1
  },
  {
    "question": "Wilt Chamberlain famously scored how many points in one game?",
    "choices": [
      "81",
      "100",
      "61",
      "73"
    ],
    "correct": 1
  },
  {
    "question": "Who scored 81 points in a single game in 2006?",
    "choices": [
      "LeBron James",
      "Kobe Bryant",
      "Allen Iverson",
      "Tracy McGrady"
    ],
    "correct": 1
  },
  {
    "question": "Larry Bird played for which franchise?",
    "choices": [
      "Lakers",
      "Celtics",
      "Pacers",
      "Bucks"
    ],
    "correct": 1
  },
  {
    "question": "Magic Johnson played for which franchise?",
    "choices": [
      "Lakers",
      "Celtics",
      "76ers",
      "Nuggets"
    ],
    "correct": 0
  },
  {
    "question": "How many championships did Michael Jordan win?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 3
  },
  {
    "question": "Which player is the NBA all-time leading scorer (career)?",
    "choices": [
      "Kareem Abdul-Jabbar",
      "Karl Malone",
      "Kobe Bryant",
      "LeBron James"
    ],
    "correct": 3
  },
  {
    "question": "Who is the NBA's career assists leader?",
    "choices": [
      "Magic Johnson",
      "Jason Kidd",
      "John Stockton",
      "Steve Nash"
    ],
    "correct": 2
  },
  {
    "question": "Who is the NBA's career rebounds leader?",
    "choices": [
      "Bill Russell",
      "Wilt Chamberlain",
      "Kareem",
      "Hakeem"
    ],
    "correct": 1
  },
  {
    "question": "Bill Russell won how many NBA championships?",
    "choices": [
      "8",
      "9",
      "10",
      "11"
    ],
    "correct": 3
  },
  {
    "question": "Who played in 14 All-Star games in a 20-year career as a center for Houston?",
    "choices": [
      "David Robinson",
      "Hakeem Olajuwon",
      "Patrick Ewing",
      "Shaquille O'Neal"
    ],
    "correct": 1
  },
  {
    "question": "What is Shaquille O'Neal's first NBA team?",
    "choices": [
      "Lakers",
      "Magic",
      "Heat",
      "Suns"
    ],
    "correct": 1
  },
  {
    "question": "Tim Duncan won championships with which team?",
    "choices": [
      "Lakers",
      "Spurs",
      "Mavericks",
      "Rockets"
    ],
    "correct": 1
  },
  {
    "question": "Who has the most regular-season MVPs?",
    "choices": [
      "LeBron",
      "Jordan",
      "Kareem",
      "Russell"
    ],
    "correct": 2
  },
  {
    "question": "How many NBA MVPs does Kareem Abdul-Jabbar have?",
    "choices": [
      "4",
      "5",
      "6",
      "7"
    ],
    "correct": 2
  },
  {
    "question": "Stephen Curry is famous for revolutionizing?",
    "choices": [
      "Defense",
      "Three-point shooting",
      "Post play",
      "Free throws"
    ],
    "correct": 1
  },
  {
    "question": "Curry plays for which team?",
    "choices": [
      "Warriors",
      "Lakers",
      "Celtics",
      "Suns"
    ],
    "correct": 0
  },
  {
    "question": "Who is nicknamed 'The King'?",
    "choices": [
      "LeBron James",
      "Kobe Bryant",
      "Michael Jordan",
      "Magic Johnson"
    ],
    "correct": 0
  },
  {
    "question": "Which Greek star won MVPs with Milwaukee?",
    "choices": [
      "Giannis Antetokounmpo",
      "Vassilis Spanoulis",
      "Theofanis Christodoulou",
      "Jakob Tsakalidis"
    ],
    "correct": 0
  },
  {
    "question": "Bill Russell played for which franchise?",
    "choices": [
      "Celtics",
      "Lakers",
      "Bulls",
      "Pistons"
    ],
    "correct": 0
  },
  {
    "question": "Tim Duncan's nickname is?",
    "choices": [
      "Big Fundamental",
      "The Mailman",
      "The Admiral",
      "The Glove"
    ],
    "correct": 0
  },
  {
    "question": "Karl Malone's nickname is?",
    "choices": [
      "The Mailman",
      "The Admiral",
      "The Worm",
      "The Round Mound"
    ],
    "correct": 0
  },
  {
    "question": "Dennis Rodman led the league in?",
    "choices": [
      "Scoring",
      "Assists",
      "Rebounds",
      "Blocks"
    ],
    "correct": 2
  },
  {
    "question": "Who was Michael Jordan's longtime teammate, sometimes 'Robin'?",
    "choices": [
      "Scottie Pippen",
      "Dennis Rodman",
      "Toni Kukoc",
      "Horace Grant"
    ],
    "correct": 0
  },
  {
    "question": "Allen Iverson played mostly for which team?",
    "choices": [
      "76ers",
      "Pistons",
      "Nuggets",
      "Knicks"
    ],
    "correct": 0
  },
  {
    "question": "Dirk Nowitzki played his entire career for?",
    "choices": [
      "Mavericks",
      "Spurs",
      "Rockets",
      "Wizards"
    ],
    "correct": 0
  },
  {
    "question": "Which team did Kevin Durant win his first championship with?",
    "choices": [
      "Thunder",
      "Warriors",
      "Nets",
      "Suns"
    ],
    "correct": 1
  },
  {
    "question": "Who is the youngest MVP in NBA history?",
    "choices": [
      "LeBron James",
      "Kobe Bryant",
      "Derrick Rose",
      "Allen Iverson"
    ],
    "correct": 2
  },
  {
    "question": "Who won the 1994 and 1995 Finals MVP?",
    "choices": [
      "Hakeem Olajuwon",
      "Patrick Ewing",
      "David Robinson",
      "Charles Barkley"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NbaLegendsQuizSettings): NbaLegendsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NbaLegendsQuizState, action: NbaLegendsQuizAction): NbaLegendsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NbaLegendsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
