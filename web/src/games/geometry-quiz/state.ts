import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface GeometryQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GeometryQuizSettings { questions: "10" | "20"; }
export interface GeometryQuizState { questions: GeometryQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GeometryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: GeometryQuizQuestion[] = [
  { question: "Sum of interior angles of a triangle?", choices: ["90°","180°","270°","360°"], correct: 1 },
  { question: "How many sides does a hexagon have?", choices: ["5","6","7","8"], correct: 1 },
  { question: "Area of a rectangle 5 by 8?", choices: ["13","30","40","45"], correct: 2 },
  { question: "Pythagorean theorem applies to which triangle?", choices: ["Equilateral","Right","Isosceles","Scalene"], correct: 1 },
  { question: "Circumference of a circle of radius r?", choices: ["πr","2πr","πr²","4πr"], correct: 1 },
  { question: "Area of a circle of radius r?", choices: ["πr","2πr","πr²","4πr"], correct: 2 },
  { question: "Sum of interior angles of a quadrilateral?", choices: ["180°","270°","360°","450°"], correct: 2 },
  { question: "A right angle measures?", choices: ["45°","90°","180°","360°"], correct: 1 },
  { question: "Polygon with 8 sides is called?", choices: ["Hexagon","Heptagon","Octagon","Nonagon"], correct: 2 },
  { question: "Volume of a cube with side 3?", choices: ["9","18","21","27"], correct: 3 },
  { question: "Area of a triangle base 6, height 8?", choices: ["24","26","28","48"], correct: 0 },
  { question: "In a 30-60-90 triangle, side ratios are?", choices: ["1:1:√2","1:√3:2","1:2:3","2:3:4"], correct: 1 },
  { question: "In a 45-45-90 triangle, side ratios are?", choices: ["1:1:√2","1:√3:2","1:2:3","2:3:4"], correct: 0 },
  { question: "Sum of exterior angles of any convex polygon?", choices: ["180°","270°","360°","720°"], correct: 2 },
  { question: "Volume of a sphere with radius r?", choices: ["πr²","(4/3)πr³","4πr²","2πr³"], correct: 1 },
  { question: "Surface area of a sphere with radius r?", choices: ["πr²","2πr","4πr²","(4/3)πr³"], correct: 2 },
  { question: "Volume of a cone, radius r, height h?", choices: ["πr²h","(1/3)πr²h","2πrh","(2/3)πr³"], correct: 1 },
  { question: "Volume of a cylinder, radius r, height h?", choices: ["πr²h","(1/3)πr²h","2πrh","4πr²h"], correct: 0 },
  { question: "How many faces does a tetrahedron have?", choices: ["3","4","5","6"], correct: 1 },
  { question: "How many edges does a cube have?", choices: ["8","10","12","16"], correct: 2 },
  { question: "Sum of interior angles of an n-gon?", choices: ["180n°","(n-2)·180°","360n°","n·90°"], correct: 1 },
  { question: "The longest side of a right triangle is the?", choices: ["Leg","Median","Hypotenuse","Altitude"], correct: 2 },
  { question: "Two lines that never meet (in a plane) are?", choices: ["Skew","Parallel","Perpendicular","Tangent"], correct: 1 },
  { question: "A chord through the center of a circle is the?", choices: ["Radius","Arc","Diameter","Sector"], correct: 2 },
  { question: "Area of a trapezoid with parallel sides a, b, height h?", choices: ["a·b·h","(a+b)·h","½(a+b)·h","½·a·b·h"], correct: 2 },
  { question: "Area of a parallelogram with base b and height h?", choices: ["½·b·h","b·h","2·b·h","b+h"], correct: 1 },
  { question: "Number of diagonals in a convex n-gon?", choices: ["n","n−2","n(n−3)/2","n²/2"], correct: 2 },
  { question: "Euler's formula for convex polyhedra V−E+F equals?", choices: ["0","1","2","n"], correct: 2 },
  { question: "An equilateral triangle has all interior angles equal to?", choices: ["45°","60°","90°","120°"], correct: 1 },
  { question: "The locus of points equidistant from two fixed points is the?", choices: ["Circle","Perpendicular bisector","Angle bisector","Median"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GeometryQuizSettings): GeometryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GeometryQuizState, action: GeometryQuizAction): GeometryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GeometryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
