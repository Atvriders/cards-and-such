import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MlbLegendsQuizSettings { questions: "10" | "20" | "30"; }
export interface MlbLegendsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MlbLegendsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Who is the MLB career home run leader?",
    "choices": [
      "Babe Ruth",
      "Hank Aaron",
      "Barry Bonds",
      "Albert Pujols"
    ],
    "correct": 2
  },
  {
    "question": "Who held the career home run record for decades after Ruth?",
    "choices": [
      "Hank Aaron",
      "Willie Mays",
      "Mickey Mantle",
      "Sammy Sosa"
    ],
    "correct": 0
  },
  {
    "question": "Babe Ruth's nickname?",
    "choices": [
      "The Bambino",
      "The Splendid Splinter",
      "The Iron Horse",
      "The Yankee Clipper"
    ],
    "correct": 0
  },
  {
    "question": "Who is the 'Yankee Clipper'?",
    "choices": [
      "Babe Ruth",
      "Joe DiMaggio",
      "Lou Gehrig",
      "Mickey Mantle"
    ],
    "correct": 1
  },
  {
    "question": "Lou Gehrig's nickname?",
    "choices": [
      "The Iron Horse",
      "The Splendid Splinter",
      "The Mick",
      "The Big Train"
    ],
    "correct": 0
  },
  {
    "question": "Ted Williams's nickname?",
    "choices": [
      "The Splendid Splinter",
      "The Iron Horse",
      "Mr. October",
      "The Kid (also)"
    ],
    "correct": 0
  },
  {
    "question": "Reggie Jackson is famously?",
    "choices": [
      "Mr. October",
      "The Iron Horse",
      "The Big Hurt",
      "The Hammer"
    ],
    "correct": 0
  },
  {
    "question": "Hank Aaron's nickname?",
    "choices": [
      "The Hammer",
      "The Bambino",
      "The Mick",
      "Charlie Hustle"
    ],
    "correct": 0
  },
  {
    "question": "Pete Rose is nicknamed?",
    "choices": [
      "Charlie Hustle",
      "The Stinger",
      "The Blade",
      "Joltin' Joe"
    ],
    "correct": 0
  },
  {
    "question": "Who said 'Say hey'? (Hint: famous Giants outfielder)",
    "choices": [
      "Willie Mays",
      "Hank Aaron",
      "Mickey Mantle",
      "Joe DiMaggio"
    ],
    "correct": 0
  },
  {
    "question": "Mike Trout plays for?",
    "choices": [
      "Angels",
      "Yankees",
      "Dodgers",
      "Astros"
    ],
    "correct": 0
  },
  {
    "question": "Derek Jeter played his career for?",
    "choices": [
      "Yankees",
      "Red Sox",
      "Marlins",
      "Mets"
    ],
    "correct": 0
  },
  {
    "question": "How many career hits does Pete Rose have (record)?",
    "choices": [
      "3,000",
      "3,500",
      "4,256",
      "4,500"
    ],
    "correct": 2
  },
  {
    "question": "Cy Young's career win total?",
    "choices": [
      "511",
      "500",
      "450",
      "400"
    ],
    "correct": 0
  },
  {
    "question": "Who broke the color barrier in 1947?",
    "choices": [
      "Jackie Robinson",
      "Larry Doby",
      "Roy Campanella",
      "Hank Thompson"
    ],
    "correct": 0
  },
  {
    "question": "Jackie Robinson played for?",
    "choices": [
      "Dodgers",
      "Giants",
      "Cardinals",
      "Yankees"
    ],
    "correct": 0
  },
  {
    "question": "Sandy Koufax played for?",
    "choices": [
      "Dodgers",
      "Giants",
      "Pirates",
      "Reds"
    ],
    "correct": 0
  },
  {
    "question": "Nolan Ryan holds the career strikeouts record at?",
    "choices": [
      "5,714",
      "6,000",
      "5,000",
      "4,500"
    ],
    "correct": 0
  },
  {
    "question": "Cal Ripken Jr.'s consecutive games played streak?",
    "choices": [
      "2,632",
      "2,000",
      "1,500",
      "3,000"
    ],
    "correct": 0
  },
  {
    "question": "Who hit 73 home runs in 2001?",
    "choices": [
      "Mark McGwire",
      "Sammy Sosa",
      "Barry Bonds",
      "Albert Pujols"
    ],
    "correct": 2
  },
  {
    "question": "Who hit 70 in 1998?",
    "choices": [
      "Mark McGwire",
      "Sammy Sosa",
      "Barry Bonds",
      "Ken Griffey Jr."
    ],
    "correct": 0
  },
  {
    "question": "Ken Griffey Jr. was known for?",
    "choices": [
      "Sweet swing",
      "Long beard",
      "Submarine pitches",
      "Knuckleball"
    ],
    "correct": 0
  },
  {
    "question": "Greg Maddux played mostly for?",
    "choices": [
      "Braves and Cubs",
      "Yankees",
      "Red Sox",
      "Astros"
    ],
    "correct": 0
  },
  {
    "question": "Tom Seaver is associated with?",
    "choices": [
      "Mets",
      "Yankees",
      "Cubs",
      "Red Sox"
    ],
    "correct": 0
  },
  {
    "question": "Mariano Rivera was known as?",
    "choices": [
      "Greatest closer ever",
      "Greatest starter ever",
      "Greatest hitter ever",
      "Greatest CF ever"
    ],
    "correct": 0
  },
  {
    "question": "Albert Pujols played most of his career for?",
    "choices": [
      "Cardinals",
      "Angels",
      "Dodgers",
      "Marlins"
    ],
    "correct": 0
  },
  {
    "question": "Ichiro Suzuki primarily played for?",
    "choices": [
      "Mariners",
      "Marlins",
      "Yankees",
      "All three (yes, but mostly Mariners)"
    ],
    "correct": 3
  },
  {
    "question": "Roberto Clemente played for?",
    "choices": [
      "Pirates",
      "Cubs",
      "Cardinals",
      "Reds"
    ],
    "correct": 0
  },
  {
    "question": "Stan Musial played for?",
    "choices": [
      "Cardinals",
      "Cubs",
      "Pirates",
      "Reds"
    ],
    "correct": 0
  },
  {
    "question": "Yogi Berra was a famous?",
    "choices": [
      "Catcher",
      "Pitcher",
      "Outfielder",
      "Shortstop"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MlbLegendsQuizSettings): MlbLegendsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MlbLegendsQuizState, action: MlbLegendsQuizAction): MlbLegendsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MlbLegendsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
