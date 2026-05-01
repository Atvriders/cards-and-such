import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CybersecQuizSettings { questions: "10" | "20" | "30"; }
export interface CybersecQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CybersecQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What does TLS primarily provide?", choices: ["Data compression", "Encryption and integrity in transit", "Faster routing", "Increased storage"], correct: 1 },
  { question: "Which attack tries every possible password combination?", choices: ["Phishing", "Brute force", "Man-in-the-middle", "DDoS"], correct: 1 },
  { question: "Phishing is best described as what?", choices: ["A network port scan", "Tricking users into revealing credentials or info", "A type of encryption", "A patch management process"], correct: 1 },
  { question: "A DDoS attack overwhelms a service using what?", choices: ["A distributed flood of traffic from many sources", "A single misconfigured disk", "An operating system bug", "A DNS cache wipe"], correct: 0 },
  { question: "Which kind of cryptography uses a public/private key pair?", choices: ["Symmetric", "Asymmetric", "Hashing", "Steganography"], correct: 1 },
  { question: "AES is best classified as what?", choices: ["A symmetric block cipher", "A public-key algorithm", "A hash function", "A network protocol"], correct: 0 },
  { question: "RSA is which type of cryptosystem?", choices: ["Symmetric cipher", "Asymmetric public-key algorithm", "Cryptographic hash", "Stream cipher"], correct: 1 },
  { question: "What does 2FA stand for?", choices: ["Two-factor authentication", "Two-fold antivirus", "Two-file access", "Two-flag audit"], correct: 0 },
  { question: "Which of these is a cryptographic hash function?", choices: ["AES", "RSA", "SHA-256", "DES"], correct: 2 },
  { question: "SQL injection is the act of doing what?", choices: ["Inserting malicious SQL via untrusted input", "Optimizing a database index", "Scanning a network range", "Backing up a database"], correct: 0 },
  { question: "XSS stands for what?", choices: ["Cross-Site Scripting", "Extra Service System", "Extended Site Security", "External Server Scan"], correct: 0 },
  { question: "Ransomware typically does what?", choices: ["Encrypts files and demands payment for the key", "Displays harmless ads", "Logs keystrokes only", "Scans for open ports"], correct: 0 },
  { question: "VPN stands for what?", choices: ["Virtual Private Network", "Verified Public Node", "Virtual Public Network", "Validated Personal Network"], correct: 0 },
  { question: "Which team is credited with breaking the Enigma cipher?", choices: ["Bletchley Park, led by Alan Turing", "Bell Labs", "MIT Lincoln Lab", "Stanford SRI"], correct: 0 },
  { question: "Which 1988 worm crippled much of the early internet?", choices: ["Morris worm", "Stuxnet", "WannaCry", "ILOVEYOU"], correct: 0 },
  { question: "Which malware famously sabotaged Iranian nuclear centrifuges?", choices: ["WannaCry", "Stuxnet", "Mirai", "Conficker"], correct: 1 },
  { question: "A firewall is best described as what?", choices: ["An antivirus product", "A network traffic filter", "A backup utility", "A compression tool"], correct: 1 },
  { question: "Salting in password storage means doing what?", choices: ["Adding random data before hashing", "Encrypting twice", "Storing the hash in plaintext", "Skipping hashing entirely"], correct: 0 },
  { question: "Which company suffered the major 2017 consumer credit data breach?", choices: ["Target", "Equifax", "Yahoo", "Sony"], correct: 1 },
  { question: "What does the CIA triad stand for in information security?", choices: ["Confidentiality, Integrity, Availability", "Computer, Internet, Access", "Central Information Authority", "Code, Integrity, Audit"], correct: 0 },
  { question: "A zero-day refers to what?", choices: ["The day a patch is released", "An unpatched, undisclosed vulnerability", "A clean install with no data", "A wiped backup"], correct: 1 },
  { question: "MFA stands for what?", choices: ["Multi-factor authentication", "More Firewall Active", "Managed File Access", "Major Flow Authority"], correct: 0 },
  { question: "Wireshark is primarily what kind of tool?", choices: ["Antivirus scanner", "Network packet analyzer", "Host-based firewall", "Disk encryption tool"], correct: 1 },
  { question: "The 2020 SolarWinds incident is best described as what?", choices: ["A phishing campaign", "A supply-chain compromise via Orion updates", "A volumetric DDoS", "A USB drop attack"], correct: 1 },
  { question: "Which is commonly used to secure email contents end-to-end?", choices: ["FTP", "SMTP alone", "PGP or S/MIME", "DNS"], correct: 2 },
  { question: "WannaCry (2017) is best classified as what?", choices: ["Adware", "Ransomware worm exploiting SMB", "Banking trojan", "Rootkit"], correct: 1 },
  { question: "Of RSA and AES, which is asymmetric?", choices: ["AES", "RSA", "Both", "Neither"], correct: 1 },
  { question: "Social engineering refers primarily to what?", choices: ["Code injection", "Manipulating people into breaking security practices", "Network port scanning", "Memory exploits"], correct: 1 },
  { question: "What is the default TCP port for HTTPS?", choices: ["80", "443", "8080", "21"], correct: 1 },
  { question: "A honeypot is best described as what?", choices: ["A decoy system designed to attract and study attackers", "A specialized firewall", "A hardware authentication token", "A VPN endpoint"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CybersecQuizSettings): CybersecQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CybersecQuizState, action: CybersecQuizAction): CybersecQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CybersecQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
