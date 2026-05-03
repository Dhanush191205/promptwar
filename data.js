/**
 * @fileoverview Election Explorer — Data Layer
 * @description Central data source for the Election Explorer application.
 * Contains country-specific election process data, comparison tables,
 * election types, and quiz questions. All data objects are deeply frozen
 * at module load to prevent runtime mutation and prototype pollution.
 * @module data
 * @version 2.0.0
 * @license MIT
 * @author Dhanush191205
 */

'use strict';

// ──────────────────────────────────────────────────────────────
// Type Definitions
// ──────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ElectionStep
 * @property {string} icon    - Emoji icon for the step
 * @property {string} title   - Short title (e.g. "Registration")
 * @property {string} badge   - Phase label (e.g. "Phase 1")
 * @property {string} desc    - Detailed description paragraph
 * @property {string[]} points - Bullet-point details for the step
 */

/**
 * @typedef {Object} TimelinePhase
 * @property {string} title - Phase name
 * @property {string} days  - Duration descriptor (e.g. "Day 1 – 30")
 * @property {string} desc  - Explanation of what happens in this phase
 */

/**
 * @typedef {Object} Role
 * @property {string} icon  - Emoji icon for the role
 * @property {string} title - Title of the role/institution
 * @property {string} desc  - Description of responsibilities
 */

/**
 * @typedef {Object} CountryData
 * @property {ElectionStep[]}   steps    - The 5 election process steps
 * @property {TimelinePhase[]}  timeline - Timeline phases
 * @property {Role[]}           roles    - Key roles and institutions
 * @property {string}           dyk      - "Did you know?" fact
 * @property {string[]}         overview - Overview paragraphs (4 cards)
 */

/**
 * @typedef {Object} ElectionType
 * @property {string} icon  - Emoji icon
 * @property {string} title - Type name
 * @property {string} desc  - Description of the election type
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string}   q       - The question text
 * @property {string[]} opts    - Array of 4 answer options
 * @property {number}   ans     - Index of the correct answer (0-3)
 * @property {string}   explain - Explanation shown after answering
 */

// ──────────────────────────────────────────────────────────────
// Country Election Data
// ──────────────────────────────────────────────────────────────

/**
 * Election data organized by country key.
 * @readonly
 * @type {Object<string, CountryData>}
 */
const DATA = {
  india: {
    steps: [
      { icon: '📋', title: 'Registration', badge: 'Phase 1', desc: 'Citizens who are 18 years or older register themselves on the electoral roll. Think of it like signing up for a school election — you need to be on the list to vote!', points: ['Voter ID card (EPIC) is issued', 'Electoral rolls are updated by the Election Commission', 'You can register online via the NVSP portal', 'Verification by Booth Level Officers (BLOs)'] },
      { icon: '📢', title: 'Campaigning', badge: 'Phase 2', desc: 'Political parties and candidates spread their message to win voter support. Rallies, speeches, advertisements, and door-to-door outreach are used — like candidates giving their "pitch" to the people.', points: ['Parties release manifestos outlining promises', 'Campaign period typically lasts 2-3 weeks', 'Code of conduct enforced by Election Commission', 'Campaigning must stop 48 hours before voting'] },
      { icon: '🗳️', title: 'Voting Day', badge: 'Phase 3', desc: 'The big day! Voters go to their assigned polling stations and cast their vote using Electronic Voting Machines (EVMs). It\'s secret and secure — nobody can see who you voted for.', points: ['Polling happens from 7 AM to 6 PM typically', 'EVMs with VVPAT ensure transparency', 'Indelible ink is applied on the finger', 'Security forces guard every polling booth'] },
      { icon: '📊', title: 'Counting', badge: 'Phase 4', desc: 'After voting ends, all the EVMs are securely stored and then opened on counting day. Each vote is tallied carefully under strict supervision — like opening sealed exam papers.', points: ['Counting happens at designated centers', 'Postal ballots counted first', 'EVM counts verified with VVPAT slips (sample)', 'Results tallied round by round'] },
      { icon: '🏆', title: 'Results', badge: 'Phase 5', desc: 'Winners are declared! The candidate with the most votes in each constituency wins. The party (or coalition) with the majority forms the government.', points: ['Results announced by Returning Officers', 'Party/coalition with 272+ seats forms govt (Lok Sabha)', 'Winning candidates get certificates of election', 'New government takes oath of office'] }
    ],
    timeline: [
      { title: 'Registration Phase', days: 'Day 1 – 30', desc: 'Electoral rolls are revised. New voters register and corrections are made. This usually happens months before the election.' },
      { title: 'Nomination & Campaigning', days: 'Day 31 – 65', desc: 'Candidates file nominations, scrutiny happens, and intense campaigning begins across constituencies.' },
      { title: 'Voting Day(s)', days: 'Day 66 – 72', desc: 'Voting may happen in multiple phases across different states. India\'s 2024 elections had 7 phases over 44 days.' },
      { title: 'Counting Day', days: 'Day 73 – 75', desc: 'EVMs are unsealed, votes counted, and preliminary results start flowing in. Usually completed in one day.' },
      { title: 'Results & Swearing In', days: 'Day 76 – 90', desc: 'Final results declared. The winning party stakes claim. The new PM and cabinet take oath at Rashtrapati Bhavan.' }
    ],
    roles: [
      { icon: '⚖️', title: 'Election Commission of India', desc: 'The independent constitutional body that conducts all elections in India. Headed by the Chief Election Commissioner.' },
      { icon: '👤', title: 'Chief Election Commissioner', desc: 'Heads the ECI. Ensures free, fair elections. Cannot be removed easily — ensuring independence.' },
      { icon: '📋', title: 'Returning Officer', desc: 'Appointed for each constituency. Manages nomination, polling, counting, and declares the winner.' },
      { icon: '🛡️', title: 'Polling Officers', desc: 'Staff at each booth who verify voter identity, manage EVMs, and ensure smooth voting.' },
      { icon: '👁️', title: 'Election Observers', desc: 'Independent observers deployed to ensure code of conduct compliance and fair elections.' },
      { icon: '🏛️', title: 'Political Parties', desc: 'Organizations that field candidates, create manifestos, and campaign for votes across constituencies.' }
    ],
    dyk: 'India conducts the world\'s largest elections! In the 2024 General Elections, over 960 million voters were eligible to vote across 543 constituencies.',
    overview: [
      'Elections are the heartbeat of democracy. Think of it like choosing the captain of your team — everyone gets a voice, and the majority decision wins.',
      'Every single vote counts. Elections ensure that power belongs to the people, and leaders are accountable to those who elected them.',
      'The Election Commission of India (ECI) ensures elections are conducted fairly, without bias or manipulation.',
      'Elections happen every 5 years for Lok Sabha (national) and State Assemblies, ensuring fresh mandates and democratic renewal.'
    ]
  },
  usa: {
    steps: [
      { icon: '📋', title: 'Registration', badge: 'Phase 1', desc: 'Citizens 18+ must register to vote. Unlike India, registration rules vary by state — some allow same-day registration, others require weeks in advance.', points: ['Registration rules differ by state', 'Some states have automatic voter registration', 'You can register online, by mail, or in person', 'Must be a U.S. citizen to vote'] },
      { icon: '📢', title: 'Primaries & Campaigning', badge: 'Phase 2', desc: 'Parties hold primaries/caucuses to choose their candidate. Then comes the general election campaign — debates, ads, and rally tours across swing states.', points: ['Primary elections narrow down candidates', 'National conventions officially nominate candidates', 'Presidential debates are key moments', 'Campaign spending runs into billions of dollars'] },
      { icon: '🗳️', title: 'Election Day', badge: 'Phase 3', desc: 'Held on the first Tuesday after the first Monday in November. Voters cast ballots at polling places, by mail, or through early voting.', points: ['Election Day is in November every 4 years (President)', 'Paper ballots and electronic machines are used', 'Early voting and mail-in ballots widely available', 'Voter ID requirements vary by state'] },
      { icon: '📊', title: 'Counting & Electoral College', badge: 'Phase 4', desc: 'Votes are counted state by state. The President is actually chosen by the Electoral College (538 electors), not directly by popular vote.', points: ['270 electoral votes needed to win presidency', 'Most states use winner-take-all system', 'Electors formally vote in December', 'Congress certifies results in January'] },
      { icon: '🏆', title: 'Inauguration', badge: 'Phase 5', desc: 'The new President is inaugurated on January 20th. They take the oath of office on the steps of the Capitol Building in Washington, D.C.', points: ['Inauguration Day is January 20th', 'President takes oath of office', 'Inaugural address outlines vision', 'Peaceful transfer of power is a tradition'] }
    ],
    timeline: [
      { title: 'Registration Period', days: 'Varies by state', desc: 'Voter registration deadlines range from 30 days before election to same-day registration depending on the state.' },
      { title: 'Primaries & Conventions', days: 'Feb – August', desc: 'Parties hold primary elections and caucuses, culminating in national conventions where nominees are officially chosen.' },
      { title: 'General Election Campaign', days: 'Sep – November', desc: 'Intense campaigning, presidential debates, and get-out-the-vote efforts across the country.' },
      { title: 'Election Day & Counting', days: 'November (1st Tue after 1st Mon)', desc: 'Voters cast ballots. Results typically known on election night, though close races may take days.' },
      { title: 'Electoral College & Inauguration', days: 'Dec – Jan 20', desc: 'Electors cast votes in December. Congress certifies in January. President inaugurated January 20th.' }
    ],
    roles: [
      { icon: '🏛️', title: 'Federal Election Commission (FEC)', desc: 'Regulates campaign finance in federal elections — how much money can be raised and spent.' },
      { icon: '👤', title: 'Secretary of State', desc: 'Each state\'s chief election official. Manages voter rolls, certifies results, and oversees election administration.' },
      { icon: '⚖️', title: 'Electoral College', desc: '538 electors who formally elect the President. Each state gets electors equal to its Congressional delegation.' },
      { icon: '📋', title: 'Poll Workers', desc: 'Volunteers and staff at polling places who check in voters, manage equipment, and ensure smooth voting.' },
      { icon: '🏛️', title: 'Political Parties', desc: 'Democrats, Republicans, and third parties nominate candidates and run campaigns at all levels.' },
      { icon: '📺', title: 'Media & Observers', desc: 'Free press covers elections. Non-partisan observers monitor for fairness and transparency.' }
    ],
    dyk: 'The U.S. Electoral College means a candidate can win the presidency without winning the popular vote — this happened in 2000 and 2016!',
    overview: [
      'U.S. elections are a cornerstone of American democracy. From local school boards to the presidency, citizens choose their leaders at every level.',
      'Every vote matters — many elections have been decided by just a handful of votes. Your voice is your power.',
      'The Federal Election Commission (FEC) and state Secretaries of State ensure elections follow the rules.',
      'Presidential elections happen every 4 years. Congressional elections every 2 years. Many local elections happen annually.'
    ]
  },
  uk: {
    steps: [
      { icon: '📋', title: 'Registration', badge: 'Phase 1', desc: 'UK citizens 18+ must be on the electoral register to vote. Registration is done individually (not by household anymore) and can be completed online in minutes.', points: ['Register online at gov.uk', 'Must be a British, Irish, or qualifying Commonwealth citizen', 'Registration deadline is usually 12 working days before election', 'Student? You can register at both home and uni addresses'] },
      { icon: '📢', title: 'Dissolution & Campaigning', badge: 'Phase 2', desc: 'Parliament is dissolved 25 days before the election. Parties campaign vigorously — manifesto launches, leader debates, and canvassing across constituencies.', points: ['Parliament dissolves 25 working days before polling', 'Parties release detailed manifestos', 'Regulated spending limits per constituency', 'Broadcast debates between party leaders'] },
      { icon: '🗳️', title: 'Polling Day', badge: 'Phase 3', desc: 'Voting happens on a Thursday (tradition, not law!). You go to your local polling station, get your ballot paper, and mark an X next to your chosen candidate.', points: ['Polling stations open 7 AM – 10 PM', 'Paper ballots marked with a pencil', 'Photo ID required since 2023', 'Postal and proxy voting available'] },
      { icon: '📊', title: 'The Count', badge: 'Phase 4', desc: 'Counting begins as soon as polls close at 10 PM. Ballot boxes are taken to counting centers. Some results come in within hours — it\'s an exciting overnight event!', points: ['Counting starts immediately after polls close', 'First results often declared by midnight', 'Each constituency counted separately', 'Candidates and agents can observe counting'] },
      { icon: '🏆', title: 'Results & Government', badge: 'Phase 5', desc: 'The party winning 326+ seats (out of 650) forms the government. The party leader becomes Prime Minister and visits the King at Buckingham Palace to be appointed.', points: ['326 seats needed for a majority', 'PM visits the monarch to form government', 'Cabinet appointed within days', 'Parliament reconvenes for Queen\'s/King\'s Speech'] }
    ],
    timeline: [
      { title: 'Registration', days: 'Ongoing – closes 12 days before', desc: 'Voter registration is ongoing but closes 12 working days before polling day. A last-minute rush is common!' },
      { title: 'Dissolution & Nominations', days: 'Day 1 – 6', desc: 'Parliament dissolves. Candidates formally nominated. The short campaign period begins.' },
      { title: 'Campaigning', days: 'Day 6 – 24', desc: 'Intense 3-4 week campaign. Manifesto launches, debates, canvassing, and media coverage dominate.' },
      { title: 'Polling Day', days: 'Day 25 (Thursday)', desc: 'Voters head to polling stations. Voting runs 7 AM to 10 PM. Exit poll released at 10 PM sharp.' },
      { title: 'Results & Government Formation', days: 'Day 25 night – Day 27', desc: 'Overnight count. PM usually known by Friday morning. New PM visits Buckingham Palace same day.' }
    ],
    roles: [
      { icon: '⚖️', title: 'Electoral Commission', desc: 'Independent body overseeing elections, regulating party finances, and setting standards for electoral administration.' },
      { icon: '👤', title: 'Returning Officer', desc: 'Appointed for each constituency. Responsible for managing the election locally and declaring the result.' },
      { icon: '📋', title: 'Electoral Registration Officer', desc: 'Maintains the electoral register for each local authority area. Ensures eligible voters are registered.' },
      { icon: '🛡️', title: 'Presiding Officer', desc: 'Runs each individual polling station. Manages staff, ballot papers, and ensures proper procedure.' },
      { icon: '🏛️', title: 'Political Parties', desc: 'Conservatives, Labour, Liberal Democrats, and others field candidates and campaign across the UK.' },
      { icon: '👁️', title: 'Election Observers', desc: 'Accredited observers from civil society and international organizations monitor the process.' }
    ],
    dyk: 'UK general elections use the "First Past the Post" system — the candidate with the most votes wins, even without a majority! The whole campaign is just 25 days.',
    overview: [
      'The UK is a parliamentary democracy. Voters elect Members of Parliament (MPs) to the House of Commons, and the leader of the majority party becomes Prime Minister.',
      'Every vote shapes the government. The UK\'s system means local representation — you vote for YOUR local MP, not directly for PM.',
      'The Electoral Commission ensures elections are run fairly and parties follow spending rules.',
      'General elections must happen at least every 5 years, but the PM can call one earlier with parliamentary approval.'
    ]
  }
};

// ──────────────────────────────────────────────────────────────
// Comparison Data
// ──────────────────────────────────────────────────────────────

/**
 * Comparison table data: each row is [Feature, India, USA, UK].
 * @readonly
 * @type {string[][]}
 */
const COMPARE_DATA = [
  ['System', 'Parliamentary (Westminster model)', 'Presidential + Congressional', 'Parliamentary (Westminster model)'],
  ['Head of Government', 'Prime Minister', 'President', 'Prime Minister'],
  ['Voting Age', '18 years', '18 years', '18 years'],
  ['Election Frequency', 'Every 5 years', 'Every 4 years (President)', 'Every 5 years (max)'],
  ['Voting Method', 'EVMs + VVPAT', 'Paper ballots + machines (varies)', 'Paper ballots + pencil'],
  ['Election Body', 'Election Commission of India', 'FEC + State officials', 'Electoral Commission'],
  ['Seats', '543 (Lok Sabha)', '435 House + 100 Senate', '650 (House of Commons)'],
  ['Voter ID', 'EPIC / Aadhaar', 'Varies by state', 'Photo ID (since 2023)'],
  ['Compulsory Voting', 'No', 'No', 'No']
];

// ──────────────────────────────────────────────────────────────
// Election Types
// ──────────────────────────────────────────────────────────────

/**
 * Types of elections with descriptions.
 * @readonly
 * @type {ElectionType[]}
 */
const TYPES_DATA = [
  { icon: '🏛️', title: 'National / General Elections', desc: 'Choose the national government. In India: Lok Sabha. In USA: President + Congress. In UK: House of Commons.' },
  { icon: '🏢', title: 'State / Regional Elections', desc: 'Choose state or regional governments. In India: Vidhan Sabha. In USA: Governor + State Legislature. In UK: Devolved assemblies.' },
  { icon: '🏘️', title: 'Local Body Elections', desc: 'Choose local representatives — mayors, councillors, panchayat members. These affect your daily life the most!' },
  { icon: '🔄', title: 'By-Elections', desc: 'Held when a seat becomes vacant mid-term due to death, resignation, or disqualification of the elected representative.' }
];

// ──────────────────────────────────────────────────────────────
// Quiz Questions
// ──────────────────────────────────────────────────────────────

/**
 * Quiz questions with options, correct answer index, and explanations.
 * @readonly
 * @type {QuizQuestion[]}
 */
const QUIZ_DATA = [
  { q: 'What is the minimum voting age in India?', opts: ['16 years', '18 years', '21 years', '25 years'], ans: 1, explain: 'The voting age in India was lowered from 21 to 18 by the 61st Amendment in 1988.' },
  { q: 'What does EVM stand for?', opts: ['Electronic Voting Machine', 'Electoral Vote Management', 'Election Verification Module', 'Electronic Voter Monitor'], ans: 0, explain: 'EVMs are Electronic Voting Machines used in India since the 1990s to make voting faster and more accurate.' },
  { q: 'How many seats are in India\'s Lok Sabha?', opts: ['245', '435', '543', '650'], ans: 2, explain: 'The Lok Sabha has 543 elected seats. A party needs 272 seats for a simple majority.' },
  { q: 'Which body conducts elections in India?', opts: ['Supreme Court', 'Parliament', 'Election Commission of India', 'President of India'], ans: 2, explain: 'The Election Commission of India (ECI) is an independent constitutional body that conducts all elections.' },
  { q: 'How many electoral votes are needed to win the U.S. presidency?', opts: ['200', '270', '326', '435'], ans: 1, explain: 'A candidate needs 270 out of 538 electoral votes to win the U.S. presidential election.' },
  { q: 'On which day does the UK traditionally hold elections?', opts: ['Monday', 'Wednesday', 'Thursday', 'Sunday'], ans: 2, explain: 'UK elections are traditionally held on Thursdays, though this is convention, not law.' },
  { q: 'What is VVPAT?', opts: ['Voter Verified Paper Audit Trail', 'Very Valid Polling Assessment Tool', 'Verified Vote Public Access Terminal', 'Voter Validation and Polling Tracker'], ans: 0, explain: 'VVPAT lets voters verify that the EVM recorded their vote correctly by printing a paper slip.' },
  { q: 'What is the "First Past the Post" system?', opts: ['A type of racing', 'Candidate with most votes wins', 'Every party gets seats proportionally', 'Voters rank candidates'], ans: 1, explain: 'FPTP means the candidate with the most votes in a constituency wins — even without a majority. Used in India, UK, and USA.' },
  { q: 'How many seats are in the UK House of Commons?', opts: ['435', '543', '600', '650'], ans: 3, explain: 'The House of Commons has 650 seats. A party needs 326 seats for a majority.' },
  { q: 'What color ink is applied to voters\' fingers in India?', opts: ['Blue', 'Red', 'Indelible purple/black', 'Green'], ans: 2, explain: 'Indelible ink is applied to the left index finger to prevent duplicate voting. It lasts several days!' }
];

// ──────────────────────────────────────────────────────────────
// Data Immutability — Deep Freeze
// ──────────────────────────────────────────────────────────────

/**
 * Recursively freezes an object and all nested objects to prevent
 * runtime mutation and prototype pollution attacks.
 * @param {Object} obj - The object to deep freeze
 * @returns {Object} The frozen object (same reference)
 */
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(function (prop) {
    var val = obj[prop];
    if (val !== null && (typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  });
  return obj;
}

deepFreeze(DATA);
deepFreeze(COMPARE_DATA);
deepFreeze(TYPES_DATA);
deepFreeze(QUIZ_DATA);
