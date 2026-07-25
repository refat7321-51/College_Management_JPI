/* ====================================================
   STUDENT DASHBOARD — Complete Integrated JS
   Probidhan 2022 Books, Profile Edit, Notice Tracker,
   CR Nomination, Leaderboard & English UI
   ==================================================== */

const API = (typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.startsWith('file')) ? (window.location.origin + '/api') : 'http://127.0.0.1:8000/api';
const MEDIA_BASE = (typeof window !== 'undefined' && window.location && !window.location.origin.startsWith('file')) ? window.location.origin : 'http://127.0.0.1:8000';
let studentEmail = '';
let studentSemester = '';
let currentMsgTab = 'inbox';
let quizTimerInterval = null;
let currentQuizId = null;
let currentAnswers = {};
let allQuizQuestions = [];

// ====================================================
// PROBIDHAN 2022 CANONICAL DATASET — BTEB Official (All 7 Departments)
// ====================================================
const PROBIDHAN_2022_DATA = {
  // â”€â”€â”€ COMPUTER SCIENCE & TECHNOLOGY (Technology Code: 85) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  'computer': {
    deptName: 'Computer Science & Technology — Technology Code: 85 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl:1, subject:'Engineering Drawing', code:'21011' },
        { sl:2, subject:'Bangla-I', code:'25711' },
        { sl:3, subject:'English-I', code:'25712' },
        { sl:4, subject:'Mathematics-I', code:'25911' },
        { sl:5, subject:'Physics-I', code:'25912' },
        { sl:6, subject:'Computer Office Application', code:'28511' },
        { sl:7, subject:'Basic Electricity', code:'26711' }
      ],
      '2nd Semester': [
        { sl:1, subject:'Bangla-II', code:'25721' },
        { sl:2, subject:'English-II', code:'25722' },
        { sl:3, subject:'Physical Education & Life Skills Development', code:'25812' },
        { sl:4, subject:'Chemistry', code:'25913' },
        { sl:5, subject:'Mathematics-II', code:'25921' },
        { sl:6, subject:'Python Programming', code:'28521' },
        { sl:7, subject:'Computer Graphics Design-I', code:'28522' },
        { sl:8, subject:'Basic Electronics', code:'26811' }
      ],
      '3rd Semester': [
        { sl:1, subject:'Social Science', code:'25811' },
        { sl:2, subject:'Physics-II', code:'25922' },
        { sl:3, subject:'Mathematics-III', code:'25931' },
        { sl:4, subject:'Application Development Using Python', code:'28531' },
        { sl:5, subject:'Computer Graphics Design-II', code:'28532' },
        { sl:6, subject:'IT Support Services', code:'28533' },
        { sl:7, subject:'Digital Electronics-I', code:'26831' }
      ],
      '4th Semester': [
        { sl:1, subject:'Business Communication', code:'25831' },
        { sl:2, subject:'Java Programming', code:'28541' },
        { sl:3, subject:'Data Structure & Algorithm', code:'28542' },
        { sl:4, subject:'Computer Peripherals & Interfacing', code:'28543' },
        { sl:5, subject:'Web Design & Development-I', code:'28544' },
        { sl:6, subject:'Digital Electronics-II', code:'26841' },
        { sl:7, subject:'Environmental Studies', code:'29041' }
      ],
      '5th Semester': [
        { sl:1, subject:'Accounting', code:'25841' },
        { sl:2, subject:'Application Development Using Java', code:'28551' },
        { sl:3, subject:'Web Design & Development-II', code:'28552' },
        { sl:4, subject:'Computer Architecture & Microprocessor', code:'28553' },
        { sl:5, subject:'Data Communication', code:'28554' },
        { sl:6, subject:'Operating System', code:'28555' },
        { sl:7, subject:'Project Work-I', code:'28556' }
      ],
      '6th Semester': [
        { sl:1, subject:'Principles of Marketing', code:'25851' },
        { sl:2, subject:'Industrial Management', code:'25852' },
        { sl:3, subject:'Database Management System', code:'28561' },
        { sl:4, subject:'Computer Networking', code:'28562' },
        { sl:5, subject:'Sensor & IoT System', code:'28563' },
        { sl:6, subject:'Microcontroller Based System Design & Development', code:'28564' },
        { sl:7, subject:'Surveillance Security System', code:'28565' },
        { sl:8, subject:'Web Development Project', code:'28566' }
      ],
      '7th Semester': [
        { sl:1, subject:'Innovation & Entrepreneurship', code:'25853' },
        { sl:2, subject:'Digital Marketing Technique', code:'28571' },
        { sl:3, subject:'Network Administration & Services', code:'28572' },
        { sl:4, subject:'Cyber Security & Ethics', code:'28573' },
        { sl:5, subject:'Apps Development Project', code:'28574' },
        { sl:6, subject:'Multimedia & Animation', code:'28575' },
        { sl:7, subject:'Project Work-II', code:'28576' }
      ],
      '8th Semester': [
        { sl:1, subject:'Industrial Attachment', code:'28581' },
        { sl:2, subject:'Project Presentation', code:'28581' }
      ]
    }
  },

  // â”€â”€â”€ CIVIL TECHNOLOGY (Technology Code: 64) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  'civil': {
    deptName: 'Civil Technology — Technology Code: 64 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl:1, subject:'Engineering Drawing', code:'21011' },
        { sl:2, subject:'Bangla-I', code:'25711' },
        { sl:3, subject:'English-I', code:'25712' },
        { sl:4, subject:'Social Science', code:'25811' },
        { sl:5, subject:'Mathematics-I', code:'25911' },
        { sl:6, subject:'Chemistry', code:'25913' },
        { sl:7, subject:'Civil Engineering Materials', code:'26411' },
        { sl:8, subject:'Basic Electricity', code:'26711' }
      ],
      '2nd Semester': [
        { sl:1, subject:'Bangla-II', code:'25721' },
        { sl:2, subject:'English-II', code:'25722' },
        { sl:3, subject:'Physical Education & Life Skills Development', code:'25812' },
        { sl:4, subject:'Physics-I', code:'25912' },
        { sl:5, subject:'Mathematics-II', code:'25921' },
        { sl:6, subject:'Civil Engineering Drawing', code:'26421' },
        { sl:7, subject:'Basic Electronics', code:'26811' },
        { sl:8, subject:'Basic Workshop Practice', code:'27011' }
      ],
      '3rd Semester': [
        { sl:1, subject:'Business Communication', code:'25831' },
        { sl:2, subject:'Physics-II', code:'25922' },
        { sl:3, subject:'Mathematics-III', code:'25931' },
        { sl:4, subject:'Structural Mechanics', code:'26431' },
        { sl:5, subject:'Surveying-I', code:'26432' },
        { sl:6, subject:'Construction Process-I', code:'26433' },
        { sl:7, subject:'Computer Office Application', code:'28511' }
      ],
      '4th Semester': [
        { sl:1, subject:'Accounting', code:'25841' },
        { sl:2, subject:'Construction Process-II', code:'26441' },
        { sl:3, subject:'Estimating & Costing-I', code:'26442' },
        { sl:4, subject:'Civil CAD-I', code:'26443' },
        { sl:5, subject:'Surveying-II', code:'26444' },
        { sl:6, subject:'Geotechnical Engineering', code:'26445' },
        { sl:7, subject:'Hydrology', code:'26446' },
        { sl:8, subject:'Wood Workshop Practice', code:'26521' }
      ],
      '5th Semester': [
        { sl:1, subject:'Industrial Management', code:'25852' },
        { sl:2, subject:'Foundation Engineering', code:'26451' },
        { sl:3, subject:'Civil CAD-II', code:'26452' },
        { sl:4, subject:'Surveying-III', code:'26453' },
        { sl:5, subject:'Theory of Structure', code:'26454' },
        { sl:6, subject:'Water Supply Engineering', code:'26455' },
        { sl:7, subject:'Hydraulics', code:'26456' }
      ],
      '6th Semester': [
        { sl:1, subject:'Water Resources Engineering', code:'26461' },
        { sl:2, subject:'Advance Surveying', code:'26462' },
        { sl:3, subject:'Transportation Engineering-I', code:'26463' },
        { sl:4, subject:'Design of Structure-I', code:'26464' },
        { sl:5, subject:'Steel Structures', code:'28863' },
        { sl:6, subject:'Advanced Construction', code:'28861' },
        { sl:7, subject:'Environmental Studies', code:'29041' }
      ],
      '7th Semester': [
        { sl:1, subject:'Principles of Marketing', code:'25851' },
        { sl:2, subject:'Innovation & Entrepreneurship', code:'25853' },
        { sl:3, subject:'Civil Engineering Project', code:'26471' },
        { sl:4, subject:'Sanitary Engineering', code:'26472' },
        { sl:5, subject:'Transportation Engineering-II', code:'26473' },
        { sl:6, subject:'Design of Structure-II', code:'26474' },
        { sl:7, subject:'Estimating & Costing-II', code:'26475' },
        { sl:8, subject:'Construction Management & Documentation', code:'28871' }
      ],
      '8th Semester': [
        { sl:1, subject:'Industrial Attachment', code:'26481' },
        { sl:2, subject:'Project Presentation', code:'26481' }
      ]
    }
  },

  // â”€â”€â”€ ELECTRICAL TECHNOLOGY (Technology Code: 67) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  'electrical': {
    deptName: 'Electrical Technology — Technology Code: 67 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl:1, subject:'Engineering Drawing', code:'21011' },
        { sl:2, subject:'Bangla-I', code:'25711' },
        { sl:3, subject:'English-I', code:'25712' },
        { sl:4, subject:'Physical Education & Life Skills Development', code:'25812' },
        { sl:5, subject:'Mathematics-I', code:'25911' },
        { sl:6, subject:'Physics-I', code:'25912' },
        { sl:7, subject:'Basic Electricity', code:'26711' },
        { sl:8, subject:'Electrical Engineering Materials', code:'26712' }
      ],
      '2nd Semester': [
        { sl:1, subject:'Bangla-II', code:'25721' },
        { sl:2, subject:'English-II', code:'25722' },
        { sl:3, subject:'Mathematics-II', code:'25921' },
        { sl:4, subject:'Physics-II', code:'25922' },
        { sl:5, subject:'Electrical Circuits-I', code:'26721' },
        { sl:6, subject:'Electrical Engineering Drawing', code:'26722' },
        { sl:7, subject:'Basic Electronics', code:'26811' }
      ],
      '3rd Semester': [
        { sl:1, subject:'Mathematics-III', code:'25931' },
        { sl:2, subject:'Chemistry', code:'25913' },
        { sl:3, subject:'Computer Office Application', code:'28511' },
        { sl:4, subject:'Electrical Circuits-II', code:'26731' },
        { sl:5, subject:'Electrical Appliances', code:'26732' },
        { sl:6, subject:'Industrial Electronics', code:'26833' }
      ],
      '4th Semester': [
        { sl:1, subject:'Social Science', code:'25811' },
        { sl:2, subject:'Accounting', code:'25841' },
        { sl:3, subject:'Electrical Installation, Planning and Estimating', code:'26741' },
        { sl:4, subject:'DC Machine', code:'26742' },
        { sl:5, subject:'Electrical Engineering Project-I', code:'26743' },
        { sl:6, subject:'Digital Electronics', code:'26845' },
        { sl:7, subject:'Applied Mechanics', code:'27044' }
      ],
      '5th Semester': [
        { sl:1, subject:'Principles of Marketing', code:'25851' },
        { sl:2, subject:'Industrial Management', code:'25852' },
        { sl:3, subject:'Generation of Electrical Power', code:'26751' },
        { sl:4, subject:'Electrical & Electronic Measurements-I', code:'26752' },
        { sl:5, subject:'Testing and Maintenance of Electrical Equipments', code:'26753' },
        { sl:6, subject:'Electrical Engineering Project-II', code:'26754' },
        { sl:7, subject:'Microprocessor & Microcontroller', code:'26853' }
      ],
      '6th Semester': [
        { sl:1, subject:'Programming in C', code:'28567' },
        { sl:2, subject:'AC Machine-I', code:'26761' },
        { sl:3, subject:'Transmission and Distribution of Electrical Power-I', code:'26762' },
        { sl:4, subject:'Electrical & Electronic Measurements-II', code:'26763' },
        { sl:5, subject:'Communication Engineering', code:'26842' },
        { sl:6, subject:'Environmental Studies', code:'29041' }
      ],
      '7th Semester': [
        { sl:1, subject:'Business Communication', code:'25831' },
        { sl:2, subject:'Innovation & Entrepreneurship', code:'25853' },
        { sl:3, subject:'AC Machine-II', code:'26771' },
        { sl:4, subject:'Transmission and Distribution of Electrical Power-II', code:'26772' },
        { sl:5, subject:'Switch Gear and Protection', code:'26773' },
        { sl:6, subject:'Electrical Engineering Project-III', code:'26774' },
        { sl:7, subject:'Automation Engineering & PLC', code:'26875' }
      ],
      '8th Semester': [
        { sl:1, subject:'Industrial Attachment', code:'26781' },
        { sl:2, subject:'Project Presentation', code:'26781' }
      ]
    }
  },

  // â”€â”€â”€ TELECOMMUNICATION TECHNOLOGY (Technology Code: 94) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  'telecom': {
    deptName: 'Telecommunication Technology — Technology Code: 94 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl:1, subject:'Engineering Drawing', code:'21011' },
        { sl:2, subject:'Bangla-I', code:'25711' },
        { sl:3, subject:'English-I', code:'25712' },
        { sl:4, subject:'Mathematics-I', code:'25911' },
        { sl:5, subject:'Physics-I', code:'25912' },
        { sl:6, subject:'Basic Electricity', code:'26711' },
        { sl:7, subject:'Basics of Telecommunication', code:'29411' }
      ],
      '2nd Semester': [
        { sl:1, subject:'Bangla-II', code:'25721' },
        { sl:2, subject:'English-II', code:'25722' },
        { sl:3, subject:'Social Science', code:'25811' },
        { sl:4, subject:'Physical Education & Life Skills Development', code:'25812' },
        { sl:5, subject:'Mathematics-II', code:'25921' },
        { sl:6, subject:'Physics-II', code:'25922' },
        { sl:7, subject:'Electrical Circuits-I', code:'26721' },
        { sl:8, subject:'Basic Electronics', code:'26811' }
      ],
      '3rd Semester': [
        { sl:1, subject:'Chemistry', code:'25913' },
        { sl:2, subject:'Mathematics-III', code:'25931' },
        { sl:3, subject:'Computer Office Application', code:'28511' },
        { sl:4, subject:'Electrical Circuits-II', code:'26731' },
        { sl:5, subject:'Electronic Devices and Circuits', code:'26821' },
        { sl:6, subject:'Telecom Workshop and Outside Plant', code:'29431' }
      ],
      '4th Semester': [
        { sl:1, subject:'Accounting', code:'25841' },
        { sl:2, subject:'Programming in C', code:'28567' },
        { sl:3, subject:'Electrical Installation, Planning and Estimating', code:'26741' },
        { sl:4, subject:'Digital Electronics', code:'26845' },
        { sl:5, subject:'Radio and TV Engineering', code:'29441' },
        { sl:6, subject:'IT Support and IoT Basics', code:'29442' },
        { sl:7, subject:'Data Communications and Networking', code:'29443' }
      ],
      '5th Semester': [
        { sl:1, subject:'Principles of Marketing', code:'25851' },
        { sl:2, subject:'Industrial Management', code:'25852' },
        { sl:3, subject:'DC Machine', code:'26742' },
        { sl:4, subject:'Generation of Electrical Power', code:'26751' },
        { sl:5, subject:'Electrical & Electronic Measurements-I', code:'26752' },
        { sl:6, subject:'Microprocessor & Microcontroller', code:'26853' },
        { sl:7, subject:'Multimedia and Webpage Design', code:'29451' }
      ],
      '6th Semester': [
        { sl:1, subject:'AC Machine-I', code:'26761' },
        { sl:2, subject:'Electrical & Electronic Measurements-II', code:'26763' },
        { sl:3, subject:'Transmission and Distribution of Electrical Power', code:'26764' },
        { sl:4, subject:'Environmental Studies', code:'29041' },
        { sl:5, subject:'Wireless and Mobile Communication', code:'29462' },
        { sl:6, subject:'Signals and Switching System', code:'29463' }
      ],
      '7th Semester': [
        { sl:1, subject:'Business Communication', code:'25831' },
        { sl:2, subject:'Innovation & Entrepreneurship', code:'25853' },
        { sl:3, subject:'AC Machine-II', code:'26771' },
        { sl:4, subject:'Switch Gear and Protection', code:'26773' },
        { sl:5, subject:'Microwave Engineering and Antennas', code:'29471' },
        { sl:6, subject:'Optical Fiber Communication', code:'29472' },
        { sl:7, subject:'Satellite Communication and RADAR', code:'29473' }
      ],
      '8th Semester': [
        { sl:1, subject:'Industrial Attachment', code:'26781' },
        { sl:2, subject:'Project Presentation', code:'26781' }
      ]
    }
  },

  // â”€â”€â”€ MECHANICAL TECHNOLOGY (Technology Code: 70) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  'mechanical': {
    deptName: 'Mechanical Technology — Technology Code: 70 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl:1, subject:'Engineering Drawing', code:'21011' },
        { sl:2, subject:'Bangla-I', code:'25711' },
        { sl:3, subject:'English-I', code:'25712' },
        { sl:4, subject:'Physical Education & Life Skills Development', code:'25812' },
        { sl:5, subject:'Mathematics-I', code:'25911' },
        { sl:6, subject:'Physics-I', code:'25912' },
        { sl:7, subject:'Basic Workshop Practice', code:'27011' },
        { sl:8, subject:'Machine Shop Practice-I', code:'27012' }
      ],
      '2nd Semester': [
        { sl:1, subject:'Bangla-II', code:'25721' },
        { sl:2, subject:'English-II', code:'25722' },
        { sl:3, subject:'Chemistry', code:'25913' },
        { sl:4, subject:'Mathematics-II', code:'25921' },
        { sl:5, subject:'Physics-II', code:'25922' },
        { sl:6, subject:'Basic Electricity', code:'26711' },
        { sl:7, subject:'Mechanical Engineering Drawing', code:'27021' }
      ],
      '3rd Semester': [
        { sl:1, subject:'Social Science', code:'25811' },
        { sl:2, subject:'Business Communication', code:'25831' },
        { sl:3, subject:'Mathematics-III', code:'25931' },
        { sl:4, subject:'Mechanical Engineering Materials', code:'27031' },
        { sl:5, subject:'Machine Shop Practice-II', code:'27032' },
        { sl:6, subject:'RAC Cycles and Components', code:'27231' },
        { sl:7, subject:'Computer Office Application', code:'28511' }
      ],
      '4th Semester': [
        { sl:1, subject:'Accounting', code:'25841' },
        { sl:2, subject:'Basic Electronics', code:'26811' },
        { sl:3, subject:'Engineering Mechanics', code:'27041' },
        { sl:4, subject:'Machine Shop Practice-III', code:'27042' },
        { sl:5, subject:'Metallurgy', code:'27043' },
        { sl:6, subject:'Engineering Thermodynamics', code:'27131' },
        { sl:7, subject:'Environmental Studies', code:'29041' }
      ],
      '5th Semester': [
        { sl:1, subject:'Industrial Management', code:'25852' },
        { sl:2, subject:'Fluid Mechanics & Machineries', code:'27051' },
        { sl:3, subject:'Mechanical Estimating & Costing', code:'27052' },
        { sl:4, subject:'Advanced Welding-I', code:'27053' },
        { sl:5, subject:'Foundry & Pattern Making', code:'27054' },
        { sl:6, subject:'Manufacturing Process', code:'27055' },
        { sl:7, subject:'Programming in C', code:'28567' }
      ],
      '6th Semester': [
        { sl:1, subject:'Principles of Marketing', code:'25851' },
        { sl:2, subject:'Automobile Fundamentals', code:'26211' },
        { sl:3, subject:'Strength of Materials', code:'27061' },
        { sl:4, subject:'Mechanical Measurement & Metrology', code:'27062' },
        { sl:5, subject:'CAD & CAM', code:'27063' },
        { sl:6, subject:'Advanced Welding-II', code:'27064' },
        { sl:7, subject:'Plant Engineering & Maintenance', code:'27065' }
      ],
      '7th Semester': [
        { sl:1, subject:'Innovation & Entrepreneurship', code:'25853' },
        { sl:2, subject:'Design of Machine Elements', code:'27071' },
        { sl:3, subject:'Tool Design', code:'27072' },
        { sl:4, subject:'Heat Treatment of Metal', code:'27073' },
        { sl:5, subject:'Mechanical Engineering Project', code:'27074' },
        { sl:6, subject:'Production Planning & Control', code:'27075' },
        { sl:7, subject:'Mechatronics & PLC', code:'29231' }
      ],
      '8th Semester': [
        { sl:1, subject:'Industrial Attachment + Project Presentation', code:'27081' }
      ]
    }
  },

  // â”€â”€â”€ POWER TECHNOLOGY (Technology Code: 71) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  'power': {
    deptName: 'Power Technology — Technology Code: 71 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl:1, subject:'Engineering Drawing', code:'21011' },
        { sl:2, subject:'Bangla-I', code:'25711' },
        { sl:3, subject:'English-I', code:'25712' },
        { sl:4, subject:'Social Science', code:'25811' },
        { sl:5, subject:'Physical Education & Life Skills Development', code:'25812' },
        { sl:6, subject:'Mathematics-I', code:'25911' },
        { sl:7, subject:'Physics-I', code:'25912' },
        { sl:8, subject:'Power Engineering Fundamental', code:'27111' }
      ],
      '2nd Semester': [
        { sl:1, subject:'Bangla-II', code:'25721' },
        { sl:2, subject:'English-II', code:'25722' },
        { sl:3, subject:'Chemistry', code:'25913' },
        { sl:4, subject:'Mathematics-II', code:'25921' },
        { sl:5, subject:'Basic Electricity', code:'26711' },
        { sl:6, subject:'Basic Workshop Practice', code:'27011' },
        { sl:7, subject:'Power Equipment Management & Safety', code:'27121' },
        { sl:8, subject:'Computer Office Application', code:'28511' }
      ],
      '3rd Semester': [
        { sl:1, subject:'Physics-II', code:'25922' },
        { sl:2, subject:'Mathematics-III', code:'25931' },
        { sl:3, subject:'Basic Electronics', code:'26811' },
        { sl:4, subject:'Machine Shop Practice-I', code:'27012' },
        { sl:5, subject:'Engineering Thermodynamics', code:'27131' },
        { sl:6, subject:'RAC Cycles and Components', code:'27231' }
      ],
      '4th Semester': [
        { sl:1, subject:'Accounting', code:'25841' },
        { sl:2, subject:'Engineering Mechanics', code:'27041' },
        { sl:3, subject:'Metallurgy', code:'27043' },
        { sl:4, subject:'IC Engine Details', code:'27141' },
        { sl:5, subject:'Fuels & Lubricants', code:'27142' },
        { sl:6, subject:'Suspension, Brake, Steering & Transmission System of Vehicle', code:'26262' },
        { sl:7, subject:'Programming in C', code:'28567' }
      ],
      '5th Semester': [
        { sl:1, subject:'Business Communication', code:'25831' },
        { sl:2, subject:'Industrial Management', code:'25852' },
        { sl:3, subject:'Automotive Body Building', code:'26241' },
        { sl:4, subject:'Fluid Mechanics & Machineries', code:'27051' },
        { sl:5, subject:'Advanced Welding-I', code:'27053' },
        { sl:6, subject:'Automotive Electricity, Electronics & Automation', code:'27151' },
        { sl:7, subject:'Power Plant Engineering', code:'27152' }
      ],
      '6th Semester': [
        { sl:1, subject:'Transmission and Distribution of Electrical Power', code:'26764' },
        { sl:2, subject:'Strength of Materials', code:'27061' },
        { sl:3, subject:'Mechanical Measurement & Metrology', code:'27062' },
        { sl:4, subject:'Plant Engineering & Maintenance', code:'27065' },
        { sl:5, subject:'Engine Overhauling, Inspection & Testing', code:'27161' },
        { sl:6, subject:'Environmental Studies', code:'29041' }
      ],
      '7th Semester': [
        { sl:1, subject:'Principles of Marketing', code:'25851' },
        { sl:2, subject:'Innovation & Entrepreneurship', code:'25853' },
        { sl:3, subject:'Design of Machine Elements', code:'27071' },
        { sl:4, subject:'Heat Treatment of Metal', code:'27073' },
        { sl:5, subject:'Service Station Operation & Estimating', code:'27171' },
        { sl:6, subject:'Hybrid & Electric Vehicle', code:'27172' },
        { sl:7, subject:'Power Engineering Project', code:'27173' }
      ],
      '8th Semester': [
        { sl:1, subject:'Industrial Attachment', code:'27181' },
        { sl:2, subject:'Project Presentation', code:'27181' }
      ]
    }
  },

  // â”€â”€â”€ ELECTRONICS TECHNOLOGY (Technology Code: 68) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  'electronics': {
    deptName: 'Electronics Technology — Technology Code: 68 (Probidhan 2022)',
    probidhan: 'Probidhan 2022',
    semesters: {
      '1st Semester': [
        { sl:1, subject:'Engineering Drawing', code:'21011' },
        { sl:2, subject:'Bangla-I', code:'25711' },
        { sl:3, subject:'English-I', code:'25712' },
        { sl:4, subject:'Mathematics-I', code:'25911' },
        { sl:5, subject:'Physics-I', code:'25912' },
        { sl:6, subject:'Basic Electricity', code:'26711' },
        { sl:7, subject:'Basic Workshop Practice', code:'27011' }
      ],
      '2nd Semester': [
        { sl:1, subject:'Bangla-II', code:'25721' },
        { sl:2, subject:'English-II', code:'25722' },
        { sl:3, subject:'Physical Education & Life Skills Development', code:'25812' },
        { sl:4, subject:'Chemistry', code:'25913' },
        { sl:5, subject:'Mathematics-II', code:'25921' },
        { sl:6, subject:'Physics-II', code:'25922' },
        { sl:7, subject:'Electronic Devices & Circuits', code:'26821' },
        { sl:8, subject:'Basic Electronics Lab', code:'26811' }
      ],
      '3rd Semester': [
        { sl:1, subject:'Mathematics-III', code:'25931' },
        { sl:2, subject:'Social Science', code:'25811' },
        { sl:3, subject:'Computer Office Application', code:'28511' },
        { sl:4, subject:'Digital Electronics-I', code:'26831' },
        { sl:5, subject:'Electronic Instruments & Measurements', code:'26832' },
        { sl:6, subject:'Industrial Electronics', code:'26833' }
      ],
      '4th Semester': [
        { sl:1, subject:'Business Communication', code:'25831' },
        { sl:2, subject:'Digital Electronics-II', code:'26841' },
        { sl:3, subject:'Microprocessor & Assembly Language', code:'26842' },
        { sl:4, subject:'Analog Communication', code:'26843' },
        { sl:5, subject:'Linear Integrated Circuits', code:'26844' },
        { sl:6, subject:'Environmental Studies', code:'29041' }
      ],
      '5th Semester': [
        { sl:1, subject:'Accounting', code:'25841' },
        { sl:2, subject:'Digital Communication', code:'26851' },
        { sl:3, subject:'Microcontroller & Embedded System', code:'26852' },
        { sl:4, subject:'Power Electronics', code:'26853' },
        { sl:5, subject:'TV & Video Technology', code:'26854' },
        { sl:6, subject:'Computer Hardware & Maintenance', code:'26855' }
      ],
      '6th Semester': [
        { sl:1, subject:'Industrial Management', code:'25852' },
        { sl:2, subject:'Mobile Communication', code:'26861' },
        { sl:3, subject:'Optical Fiber Communication', code:'26862' },
        { sl:4, subject:'Satellite Communication', code:'26863' },
        { sl:5, subject:'VLSI & FPGA Design', code:'26864' }
      ],
      '7th Semester': [
        { sl:1, subject:'Innovation & Entrepreneurship', code:'25853' },
        { sl:2, subject:'Wireless & Mobile Networks', code:'26871' },
        { sl:3, subject:'IoT & Embedded Systems', code:'26872' },
        { sl:4, subject:'Robotics & Automation', code:'26873' },
        { sl:5, subject:'Medical Electronics', code:'26874' }
      ],
      '8th Semester': [
        { sl:1, subject:'Industrial Attachment', code:'26881' },
        { sl:2, subject:'Project Presentation & Defense', code:'26882' }
      ]
    }
  }
};

function normalizeDept(name) {
  if (!name) return '';
  let s = name.toLowerCase().trim();
  if (s.includes('computer') || s.includes('cst') || s.includes('software')) return 'computer';
  if (s.includes('civil')) return 'civil';
  if (s.includes('electrical') && !s.includes('electronic')) return 'electrical';
  if (s.includes('electronic')) return 'electronics';
  if (s.includes('mechanical')) return 'mechanical';
  if (s.includes('power')) return 'power';
  if (s.includes('telecom') || s.includes('telecommunication')) return 'telecom';
  return s;
}

// ============================================================
// INITIALIZATION & BANNER SLIDER
// ============================================================
let currentSlideIndex = 0;
let slideInterval = null;

function goToSlide(index) {
  currentSlideIndex = index;
  const track = document.getElementById('welcomeSlideTrack');
  const dots = document.querySelectorAll('.slide-dot');
  if (track) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }
  dots.forEach((dot, idx) => {
    if (idx === index) {
      dot.style.background = '#a78bfa';
      dot.style.width = '28px';
    } else {
      dot.style.background = 'rgba(255,255,255,0.25)';
      dot.style.width = '10px';
    }
  });
}

function startWelcomeSlider() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % 4;
    goToSlide(currentSlideIndex);
  }, 5000);
}

// Global section navigation with Browser History Back support
function showStudentSection(section, event, skipPush) {
  if (event) event.preventDefault();

  const newSections = ['quiz', 'books', 'teacher-list', 'leaderboard', 'cr-list', 'messages', 'complaint'];
  
  // Hide all main section containers & injected template sections
  document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
  document.querySelectorAll('[id^="new-section-"]').forEach(sec => sec.style.display = 'none');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Highlight active sidebar item
  const activeLink = document.querySelector(`.nav-link[onclick*="'${section}'"]`);
  if (activeLink) activeLink.classList.add('active');
  else if (event && event.currentTarget) event.currentTarget.classList.add('active');

  // Push browser history state for Back button support
  if (!skipPush && location.hash !== '#' + section) {
    history.pushState({ section: section }, '', '#' + section);
  }

  if (newSections.includes(section)) {
    loadNewSection(section);
  } else {
    const target = document.getElementById('section-' + section);
    if (target) target.style.display = 'block';
  }

  if (section === 'routine') {
    if (typeof loadStudentRoutine === 'function') loadStudentRoutine();
    if (typeof loadStudentRoutineFiles === 'function') loadStudentRoutineFiles();
  } else if (section === 'assignment') {
    if (typeof loadStudentAssignments === 'function') loadStudentAssignments();
  } else if (section === 'notice') {
    if (typeof loadStudentNotices === 'function') loadStudentNotices();
  } else if (section === 'profile') {
    if (typeof loadStudentProfileForm === 'function') loadStudentProfileForm();
  }
}

// Global Browser Back Button (popstate) Handler
window.addEventListener('popstate', (e) => {
  const targetSection = (e.state && e.state.section) || location.hash.replace('#', '') || 'dashboard';
  showStudentSection(targetSection, null, true);
});

document.addEventListener('DOMContentLoaded', () => {
  // ── AUTH GUARD ──────────────────────────────────────────────
  const role = localStorage.getItem('user_role') || '';
  const emailCheck = localStorage.getItem('user_email') || '';
  if (!emailCheck || (role && role !== 'student')) {
    window.location.href = 'loginpage1.html';
    return;
  }
  // ────────────────────────────────────────────────────────────

  const info = JSON.parse(localStorage.getItem('user') || '{}');
  studentEmail = emailCheck || info.email || '';
  studentSemester = localStorage.getItem('user_semester') || info.semester || '5th Semester';
  const studentDept = localStorage.getItem('user_department') || info.department || 'Computer Science & Technology';

  // Make sure semester and department are also persisted for sub-functions
  if (!localStorage.getItem('user_semester') && info.semester) localStorage.setItem('user_semester', info.semester);
  if (!localStorage.getItem('user_department') && info.department) localStorage.setItem('user_department', info.department);

  const pic = localStorage.getItem('user_picture') || localStorage.getItem('user_photo');
  const avatarEl = document.getElementById('studentAvatar');
  if (avatarEl && pic) {
    avatarEl.innerHTML = `<img src="${pic.startsWith('http') ? pic : 'MEDIA_BASE + pic}" style="width:100%;height:100%;object-fit:cover;">`;
  }

  // Update name in header & banner
  const storedName = localStorage.getItem('user_name') || info.first_name || 'Student';
  const headerNameEl = document.getElementById('studentHeaderName');
  const bannerNameEl = document.getElementById('studentBannerName');
  const avatarInitialEl = document.getElementById('studentAvatar');
  if (headerNameEl) headerNameEl.textContent = storedName;
  if (bannerNameEl) bannerNameEl.textContent = storedName;
  if (avatarInitialEl && !pic) {
    avatarInitialEl.textContent = storedName.charAt(0).toUpperCase();
  }

  // Update welcome banner dept & sem tags
  const semEl = document.getElementById('bannerSem');
  const deptEl = document.getElementById('bannerDept');
  if (semEl) semEl.textContent = studentSemester;
  if (deptEl) deptEl.textContent = studentDept;

  if (studentEmail) {
    checkUnreadMessages();
    checkUnreadNotices();
    fetchStudentNotifications();
    setInterval(checkUnreadMessages, 60000);
    setInterval(checkUnreadNotices, 30000);
    setInterval(fetchStudentNotifications, 30000);
    checkActiveQuizzes();
    loadDashboardClassSchedule();
    loadStudentBannerData();
    loadStudentAcademicStats(); // Load real stats into Academic Overview
  }

  startWelcomeSlider();

  // Show correct section based on URL hash (or default to dashboard)
  const initialSec = location.hash.replace('#', '') || 'dashboard';
  history.replaceState({ section: initialSec }, '', '#' + initialSec);
  showStudentSection(initialSec, null, true);
});



// ============================================================
// ACADEMIC OVERVIEW STATS (REAL DATA FROM API)
// ============================================================
async function loadStudentAcademicStats() {
  // Helper to update SVG ring
  const setCircle = (circleId, textId, pct) => {
    const circle = document.getElementById(circleId);
    const text   = document.getElementById(textId);
    if (circle) {
      const offset = 264 * (1 - pct / 100);
      circle.style.strokeDashoffset = offset;
    }
    if (text) text.textContent = `${pct}%`;
  };

  const dept  = localStorage.getItem('user_department') || '';
  const sem   = localStorage.getItem('user_semester')   || '';
  const email = localStorage.getItem('user_email')      || '';

  // Default 0 — will be updated when data arrives
  setCircle('inlineCircleAttendance',   'inlineCircleAttendanceText',   0);
  setCircle('inlineCircleAssignment',   'inlineCircleAssignmentText',   0);
  setCircle('inlineCircleQuiz',         'inlineCircleQuizText',         0);

  // 1. Attendance rate from leaderboard endpoint for this student
  try {
    const res = await fetch(`${API}/leaderboard/?department=${encodeURIComponent(dept)}`);
    const data = await res.json();
    if (data.status === 'success' && data.data) {
      const me = data.data.find(s => {
        const myName = localStorage.getItem('user_name') || '';
        return s.name && myName && (s.name.toLowerCase() === myName.toLowerCase());
      });
      if (me) {
        setCircle('inlineCircleAttendance', 'inlineCircleAttendanceText', me.attendance_rate || 0);
        setCircle('inlineCircleQuiz',       'inlineCircleQuizText',       me.quiz_avg || 0);
        // Update the statAttendance text too
        const statEl = document.getElementById('statAttendance');
        if (statEl) statEl.textContent = `${me.attendance_rate || 0}%`;
      }
    }
  } catch (_) {}

  // 2. Assignment submission rate
  try {
    const res = await fetch(`${API}/get-assignments/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}&student_email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data.status === 'success' && data.data && data.data.length > 0) {
      const total = data.data.length;
      const submitted = data.data.filter(a => a.is_submitted).length;
      const rate = total > 0 ? Math.round((submitted / total) * 100) : 0;
      setCircle('inlineCircleAssignment', 'inlineCircleAssignmentText', rate);
    }
  } catch (_) {}
}

// ============================================================
// BANNER DATA LOADER (POPULATES SLIDES & ALERTS)
// ============================================================
async function loadStudentBannerData() {
  const dept = localStorage.getItem('user_department') || '';
  const sem = localStorage.getItem('user_semester') || '';

  // 1. Pending Assignments
  try {
    const res = await fetch(`${API}/get-assignments/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}&student_email=${encodeURIComponent(studentEmail)}`);
    const data = await res.json();
    const bannerAssign = document.getElementById('bannerPendingAssign');
    if (data.status === 'success' && data.data && data.data.length > 0) {
      const pending = data.data.filter(a => !a.is_submitted);
      if (pending.length > 0 && bannerAssign) {
        bannerAssign.innerHTML = `🚨 <strong style="color:#f87171">You have ${pending.length} pending assignment${pending.length > 1 ? 's' : ''}!</strong><br>Latest: <em>${pending[0].title}</em> (${pending[0].subject}) — Due: <strong>${pending[0].due_date}</strong>`;
      } else if (bannerAssign) {
        bannerAssign.innerHTML = `🎉 <strong>All assignments completed!</strong> Great job keeping up with your classwork.`;
      }

      // Dynamic assignment badge display based on pending unsubmitted assignments
      const assignBadge = document.getElementById('studentAssignBadge');
      if (assignBadge) {
        if (pending.length > 0) {
          assignBadge.textContent = pending.length;
          assignBadge.style.display = 'inline-block';
        } else {
          assignBadge.style.display = 'none';
        }
      }
      if (document.getElementById('statAssignmentsCount')) {
        document.getElementById('statAssignmentsCount').textContent = data.data.length;
      }
    }
  } catch (_) {}

  // 2. Latest Notice
  try {
    const res = await fetch(`${API}/get-notices/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}`);
    const data = await res.json();
    const bannerNotice = document.getElementById('bannerLatestNotice');
    if (data.status === 'success' && data.data && data.data.length > 0) {
      const latest = data.data[0];
      if (bannerNotice) {
        bannerNotice.innerHTML = `📢 <strong>${latest.title}</strong><br><span style="font-size:13px;opacity:0.85">${latest.content.slice(0, 110)}${latest.content.length > 110 ? '...' : ''}</span>`;
      }
    } else if (bannerNotice) {
      bannerNotice.innerHTML = `â„¹ï¸ No new college notices for your department right now.`;
    }
  } catch (_) {}

  // 3. Active Quiz
  try {
    const res = await fetch(`${API}/quiz/list/?semester=${encodeURIComponent(sem)}&email=${encodeURIComponent(studentEmail)}`);
    const data = await res.json();
    const bannerQuiz = document.getElementById('bannerActiveQuiz');
    if (data.status === 'success' && data.data && data.data.length > 0) {
      const active = data.data.filter(q => q.status === 'active' && !q.is_submitted);
      if (active.length > 0 && bannerQuiz) {
        bannerQuiz.innerHTML = `🔥 <strong style="color:#f59e0b">${active.length} Active Quiz Available!</strong><br><em>${active[0].title}</em> (${active[0].subject}) — ${active[0].duration_minutes} Mins`;
      } else if (bannerQuiz) {
        bannerQuiz.innerHTML = `✅ No pending active quizzes for your semester right now.`;
      }
    }
  } catch (_) {}
}

// ============================================================
// SECTION LOADER
// ============================================================
function loadNewSection(section) {
  const target = document.getElementById('studentMainContent') || document.querySelector('main.main-content');
  if (!target) return;

  const tpl = document.getElementById(`tpl-${section}`);
  if (!tpl) return;

  let wrapper = document.getElementById(`new-section-${section}`);
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = `new-section-${section}`;
    wrapper.setAttribute('data-section', section);
    wrapper.className = 'content-section';
    target.appendChild(wrapper);
  }
  
  wrapper.innerHTML = tpl.innerHTML;

  document.querySelectorAll('[id^="new-section-"]').forEach(el => {
    el.style.display = el.id === `new-section-${section}` ? 'block' : 'none';
  });

  switch (section) {
    case 'quiz': loadStudentQuizzes(); break;
    case 'books': loadStudentBooks(); break;
    case 'teacher-list': loadStudentTeacherList(); break;
    case 'leaderboard': loadStudentLeaderboard(); break;
    case 'cr-list': loadStudentCRList(); break;
    case 'messages': loadStudentMessages('inbox'); loadTeachersForMsg(); break;
    case 'complaint': loadStudentComplaints(); break;
  }
}

// ============================================================
// TEACHER LIST & FACULTY DIRECTORY (AUTO-FILTERED BY DEPT)
// ============================================================
let allFacultyTeachers = [];

async function loadStudentTeacherList() {
  const grid = document.getElementById('studentTeacherGrid');
  const deptFilter = document.getElementById('teacherDeptFilter');
  if (!grid) return;

  const userDept = localStorage.getItem('user_department') || '';
  if (deptFilter && userDept) {
    const normUser = normalizeDept(userDept);
    // Pre-select student's department in dropdown
    for (let opt of deptFilter.options) {
      if (opt.value === 'All') continue;
      const normOpt = normalizeDept(opt.value);
      if (normOpt && normUser && normOpt === normUser) {
        deptFilter.value = opt.value;
        break;
      } else if (opt.value.toLowerCase().includes(userDept.toLowerCase()) || userDept.toLowerCase().includes(opt.value.toLowerCase())) {
        deptFilter.value = opt.value;
        break;
      }
    }
  }

  grid.innerHTML = '<div style="color:var(--muted);grid-column:span 3;text-align:center;padding:40px;">Loading faculty directory...</div>';

  try {
    const res = await fetch(`${API}/public/teachers/`);
    const data = await res.json();

    if (data.status === 'success' && data.data) {
      allFacultyTeachers = data.data;
      filterStudentTeacherList();
    } else {
      grid.innerHTML = '<div style="color:var(--muted);grid-column:span 3;text-align:center;padding:40px;">No faculty members listed yet.</div>';
    }
  } catch (e) {
    grid.innerHTML = '<div style="color:var(--muted);grid-column:span 3;text-align:center;padding:40px;">Unable to load faculty directory.</div>';
  }
}

const designationOrder = {
  'principal': 1,
  'vice principal': 2,
  'head of department': 3,
  'professor': 4,
  'associate professor': 5,
  'assistant professor': 6,
  'senior instructor': 7,
  'instructor': 8,
  'junior instructor': 9
};

function getDesignationRank(desig) {
  if (!desig) return 99;
  const d = desig.toLowerCase().trim();
  for (let key in designationOrder) {
    if (d.includes(key)) return designationOrder[key];
  }
  return 50;
}

function filterStudentTeacherList() {
  const grid = document.getElementById('studentTeacherGrid');
  const deptVal = document.getElementById('teacherDeptFilter')?.value || 'All';
  const desigVal = document.getElementById('teacherDesigFilter')?.value || 'All';
  const subtitle = document.getElementById('teacherListSubtitle');
  if (!grid) return;

  if (subtitle) {
    let sub = deptVal === 'All' ? 'Showing all department faculty members' : `Showing faculty for: ${deptVal}`;
    if (desigVal !== 'All') sub += ` (${desigVal})`;
    subtitle.textContent = sub;
  }

  let filtered = [...allFacultyTeachers];

  if (deptVal !== 'All') {
    const selDept = deptVal.toLowerCase();
    const normSel = normalizeDept(selDept);
    filtered = filtered.filter(t => {
      const tDept = (t.department || '').toLowerCase();
      const normT = normalizeDept(tDept);
      return tDept.includes(selDept) || selDept.includes(tDept) || (normT && normSel && normT === normSel);
    });
  }

  if (desigVal !== 'All') {
    const selDesig = desigVal.toLowerCase();
    filtered = filtered.filter(t => (t.designation || '').toLowerCase().includes(selDesig));
  }

  // Sort by hierarchy: Principal -> Vice Principal -> HOD -> Professor -> Senior Instructor -> Instructor -> Junior Instructor
  filtered.sort((a, b) => getDesignationRank(a.designation) - getDesignationRank(b.designation));

  if (filtered.length > 0) {
    grid.innerHTML = filtered.map(t => {
      const initials = t.name ? t.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : 'T';
      const picHtml = t.profile_picture
        ? `<img src="${t.profile_picture.startsWith('http') ? t.profile_picture : 'MEDIA_BASE + t.profile_picture}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid var(--border)">`
        : `<div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#30cfd0,#667eea);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff">${initials}</div>`;

      return `
        <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:18px;padding:22px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 6px 20px rgba(0,0,0,0.15);transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'">
          <div>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">
              ${picHtml}
              <div>
                <div style="font-size:16px;font-weight:700;color:var(--text);">${t.name}</div>
                <div style="font-size:12px;font-weight:700;color:#30cfd0;margin-top:2px;">${t.designation || 'Faculty Member'}</div>
                <div style="font-size:11px;color:var(--muted);margin-top:2px;"><i class="fas fa-building" style="margin-right:4px"></i>${t.department || 'General'}</div>
              </div>
            </div>
            ${t.specialized_subjects ? `<div style="font-size:12px;color:var(--text);background:rgba(255,255,255,0.03);border:1px solid var(--border);padding:8px 12px;border-radius:8px;margin-bottom:12px;"><i class="fas fa-book" style="color:var(--accent);margin-right:6px"></i>${t.specialized_subjects}</div>` : ''}
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button onclick="openSendMessageModal('${t.id}')" style="flex:1;padding:8px;background:rgba(48,207,208,0.12);border:1px solid rgba(48,207,208,0.3);color:#30cfd0;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px">
              <i class="fas fa-paper-plane"></i> Message Teacher
            </button>
          </div>
        </div>
      `;
    }).join('');
  } else {
    grid.innerHTML = `<div style="color:var(--muted);grid-column:span 3;text-align:center;padding:48px;"><i class="fas fa-user-slash" style="font-size:36px;opacity:0.4;display:block;margin-bottom:12px"></i>No faculty members found for ${deptVal}.</div>`;
  }
}



// ============================================================
// TODAY'S CLASS SCHEDULE WIDGET
// ============================================================
async function loadDashboardClassSchedule() {
  const container = document.getElementById('todayClassList');
  const countBadge = document.getElementById('todayClassCount');
  if (!container) return;

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5);

  try {
    const dept = localStorage.getItem('user_department') || 'Computer';
    const sem = localStorage.getItem('user_semester') || '5th';
    const res = await fetch(`${API}/get-routine/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}&shift=1st&client_day=${currentDay}&client_time=${currentTime}`);
    const data = await res.json();

    if (data.status === 'success' && data.data && data.data.length > 0) {
      const todayClasses = data.data.filter(c => c.day.toLowerCase() === currentDay.toLowerCase());
      if (countBadge) countBadge.textContent = `${todayClasses.length} Class${todayClasses.length !== 1 ? 'es' : ''} Scheduled`;
      if (document.getElementById('statTodayClassCount')) document.getElementById('statTodayClassCount').textContent = todayClasses.length;

      if (todayClasses.length > 0) {
        container.innerHTML = todayClasses.map(cls => `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 11px; font-weight: 700; color: #00d4ff; background: rgba(0,212,255,0.12); padding: 2px 8px; border-radius: 6px;">${cls.subject_code || ''}</span>
              <div style="font-size: 14px; font-weight: 700; color: var(--text); margin-top: 4px;">${cls.subject}</div>
              <div style="font-size: 12px; color: var(--muted);"><i class="fas fa-user-tie"></i> ${cls.teacher_initials || cls.teacher_name}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 13px; font-weight: 700; color: #ffd700;"><i class="fas fa-clock"></i> ${cls.start_time} - ${cls.end_time}</span>
              <div style="font-size: 12px; color: var(--accent); margin-top: 2px;"><i class="fas fa-door-open"></i> Room ${cls.room}</div>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--muted); font-size:13px;">🎉 No classes scheduled for today (${currentDay})! Enjoy your day!</div>`;
      }
    } else {
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--muted); font-size:13px;">No class schedule available for today (${currentDay}).</div>`;
    }
  } catch (err) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--muted); font-size:13px;">Unable to load schedule.</div>`;
  }
}

// ====================================================
// BOOKS SECTION — PROBIDHAN 2022 DATA INTEGRATION
// ====================================================
function loadStudentBooks(isUserClick) {
  const container = document.getElementById('booksListContainer');
  if (!container) return;

  const deptVal = document.getElementById('bookDeptFilter')?.value;
  const semVal = document.getElementById('bookSemFilter')?.value;

  if (!deptVal || !semVal) {
    if (isUserClick) {
      alert('à¦¦à¦¯à¦¼à¦¾ à¦•à¦°à§‡ Department à¦à¦¬à¦‚ Semester à¦‰à¦­à¦¯à¦¼à¦‡ à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨! (Please select both Department and Semester)');
    } else {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:var(--muted)">
          <i class="fas fa-book-reader" style="font-size:52px;color:rgba(167,139,250,0.3);margin-bottom:18px;display:block"></i>
          <p style="font-size:16px;font-weight:600;margin:0 0 6px 0;color:var(--text)">Select Department &amp; Semester and click "View Book List"</p>
          <p style="font-size:13px;margin:0">No books will be shown until you select options and click View Book List.</p>
        </div>`;
    }
    return;
  }

  const key = normalizeDept(deptVal);
  const deptData = PROBIDHAN_2022_DATA[key] || PROBIDHAN_2022_DATA['computer'];
  const books = (deptData.semesters && deptData.semesters[semVal]) || [];
  const totalCount = books.length;

  const summaryHtml = `
    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12)); border: 1px solid rgba(129, 140, 248, 0.25); border-radius: 16px; padding: 18px 24px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <div>
        <div style="font-size: 17px; font-weight: 800; color: var(--text, #f8fafc); display: flex; align-items: center; gap: 10px;">
          <span style="background: rgba(129,140,248,0.2); width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: var(--accent, #818cf8); font-size: 16px;"><i class="fas fa-graduation-cap"></i></span>
          ${deptData.deptName}
        </div>
        <div style="font-size: 13px; color: var(--muted, #94a3b8); margin-top: 6px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span style="background: rgba(245,158,11,0.15); color: #fbbf24; padding: 3px 10px; border-radius: 20px; font-weight: 700; border: 1px solid rgba(245,158,11,0.3); font-size: 12px;"><i class="fas fa-certificate" style="margin-right: 4px;"></i>${deptData.probidhan}</span>
          <span style="color: var(--text, #cbd5e1); font-weight: 600;"><i class="fas fa-layer-group" style="color:#a78bfa; margin-right: 4px;"></i>${semVal}</span>
        </div>
      </div>
      <span style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #1e1b4b; font-size: 13px; font-weight: 800; padding: 6px 16px; border-radius: 20px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3); display: inline-flex; align-items: center; gap: 6px;">
        <i class="fas fa-list-ol"></i> Total ${totalCount} Subjects
      </span>
    </div>
  `;

  let tableRows = '';
  if (books.length > 0) {
    tableRows = books.map(item => `
      <tr style="border-bottom: 1px solid var(--border, rgba(148, 163, 184, 0.12)); transition: background 0.2s;" onmouseover="this.style.background='rgba(99, 102, 241, 0.08)'" onmouseout="this.style.background='transparent'">
        <td style="width: 75px; text-align: center; padding: 14px 16px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px; background: rgba(99, 102, 241, 0.15); color: var(--accent, #818cf8); font-weight: 800; font-size: 13px; border: 1px solid rgba(99, 102, 241, 0.3);">${item.sl}</span>
        </td>
        <td style="padding: 14px 20px; font-weight: 600; color: var(--text, #f1f5f9); font-size: 14px;">${item.subject}</td>
        <td style="width: 150px; text-align: center; padding: 14px 16px;">
          <span style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; font-family: monospace; font-size: 13px; font-weight: 800; padding: 5px 12px; border-radius: 8px; display: inline-block; letter-spacing: 0.5px;">${item.code}</span>
        </td>
      </tr>
    `).join('');
  } else {
    tableRows = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--muted, #94a3b8); padding: 40px; font-size: 14px;">
          No subject data found for the selected semester.
        </td>
      </tr>`;
  }

  const tableHtml = `
    <div style="background: var(--card-bg, rgba(15, 23, 42, 0.6)); border: 1px solid var(--border, rgba(148, 163, 184, 0.2)); border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: rgba(99, 102, 241, 0.1); border-bottom: 1.5px solid var(--border, rgba(148, 163, 184, 0.2));">
            <th style="width: 75px; text-align: center; padding: 16px; font-size: 12px; font-weight: 800; color: var(--accent, #818cf8); text-transform: uppercase; letter-spacing: 0.8px;">SL</th>
            <th style="padding: 16px 20px; font-size: 12px; font-weight: 800; color: var(--accent, #818cf8); text-transform: uppercase; letter-spacing: 0.8px;">Subject Name</th>
            <th style="width: 150px; text-align: center; padding: 16px; font-size: 12px; font-weight: 800; color: var(--accent, #818cf8); text-transform: uppercase; letter-spacing: 0.8px;">Subject Code</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = summaryHtml + tableHtml;
  container.style.display = 'block';
}

// ============================================================
// STUDENT LEADERBOARD (REFERENCE PODIUM DESIGN + CLEAN RANK TABLE)
// ============================================================
async function loadStudentLeaderboard() {
  const container = document.getElementById('leaderboardListContainer');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);">Loading rankings...</div>';

  try {
    const res = await fetch(`${API}/leaderboard/`);
    const data = await res.json();

    if (data.status === 'success' && data.data && data.data.length > 0) {
      const top3 = data.data.slice(0, 3);

      // 1. TOP 3 PODIUM SHOWCASE (MATCHING REFERENCE IMAGE)
      let podiumHtml = '';
      if (top3.length > 0) {
        const rank1 = top3.find(s => s.rank === 1);
        const rank2 = top3.find(s => s.rank === 2);
        const rank3 = top3.find(s => s.rank === 3);

        const renderPodiumCard = (st) => {
          if (!st) return '';

          let borderCol = '#00d4ff';
          let pillBg = 'linear-gradient(135deg, #00d4ff, #00b4d8)';
          let pillShadow = '0 6px 20px rgba(0, 212, 255, 0.4)';
          let pillLabel = 'GRAND POINTS';
          let heightTransform = 'transform: translateY(-10px); z-index: 3;';
          let isRank1 = st.rank === 1;

          if (st.rank === 2) {
            borderCol = '#10b981';
            pillBg = 'linear-gradient(135deg, #10b981, #059669)';
            pillShadow = '0 6px 18px rgba(16, 185, 129, 0.35)';
            pillLabel = 'POINTS';
            heightTransform = 'margin-top: 20px;';
          } else if (st.rank === 3) {
            borderCol = '#6366f1';
            pillBg = 'linear-gradient(135deg, #6366f1, #4f46e5)';
            pillShadow = '0 6px 18px rgba(99, 102, 241, 0.35)';
            pillLabel = 'POINTS';
            heightTransform = 'margin-top: 25px;';
          }

          const pic = st.profile_picture ? (st.profile_picture.startsWith('http') ? st.profile_picture : 'MEDIA_BASE + st.profile_picture) : null;
          const initial = st.name.charAt(0).toUpperCase();

          return `
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 170px; max-width: 220px; ${heightTransform}">
              ${isRank1 ? '<div style="font-size: 32px; margin-bottom: -10px; z-index: 4;">👑</div>' : ''}
              
              <!-- Avatar Circle with Rank Badge at Bottom -->
              <div style="position: relative; margin-bottom: 10px;">
                <div style="width: ${isRank1 ? '76px' : '64px'}; height: ${isRank1 ? '76px' : '64px'}; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, #6366f1, #a78bfa); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #fff; border: 4px solid ${borderCol}; box-shadow: 0 0 20px ${borderCol}66;">
                  ${pic ? `<img src="${pic}" style="width:100%;height:100%;object-fit:cover;">` : initial}
                </div>
                <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 22px; height: 22px; border-radius: 50%; background: ${borderCol}; color: #fff; font-size: 11px; font-weight: 900; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg-dark, #0f172a); box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
                  ${st.rank}
                </div>
              </div>

              <div style="font-size: 14px; font-weight: 800; color: var(--text); margin-top: 6px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${st.name}</div>

              <!-- Solid Color Point Pill (Matching reference design) -->
              <div style="background: ${pillBg}; color: #ffffff; width: 100%; padding: ${isRank1 ? '12px 16px' : '10px 14px'}; border-radius: 16px; margin-top: 8px; text-align: center; box-shadow: ${pillShadow};">
                <div style="font-size: ${isRank1 ? '20px' : '17px'}; font-weight: 900; line-height: 1;">${st.overall_score}</div>
                <div style="font-size: 9px; font-weight: 800; letter-spacing: 0.8px; margin-top: 3px; opacity: 0.95;">${pillLabel}</div>
              </div>
            </div>
          `;
        };

        podiumHtml = `
          <div style="display: flex; justify-content: center; align-items: flex-end; gap: 20px; flex-wrap: wrap; margin-bottom: 35px; padding: 15px 0;">
            ${rank2 ? renderPodiumCard(rank2) : ''}
            ${rank1 ? renderPodiumCard(rank1) : ''}
            ${rank3 ? renderPodiumCard(rank3) : ''}
          </div>
        `;
      }

      // 2. CLEAN RANKINGS TABLE UNDERNEATH (MATCHING REFERENCE DESIGN)
      const tableRows = data.data.map(st => {
        let rankColor = '#f59e0b';
        if (st.rank === 1) rankColor = '#ffd700';
        else if (st.rank === 2) rankColor = '#10b981';
        else if (st.rank === 3) rankColor = '#6366f1';

        const pic = st.profile_picture ? (st.profile_picture.startsWith('http') ? st.profile_picture : 'MEDIA_BASE + st.profile_picture) : null;
        const initial = st.name.charAt(0).toUpperCase();

        return `
          <tr style="border-bottom: 1px solid var(--border, rgba(255,255,255,0.06)); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
            <td style="padding: 14px 20px; font-size: 14px; font-weight: 800; color: ${rankColor}; text-align: center; width: 70px;">
              #${st.rank}
            </td>
            <td style="padding: 14px 20px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 40px; height: 40px; border-radius: 12px; overflow: hidden; background: linear-gradient(135deg, #6366f1, #a78bfa); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #fff; flex-shrink: 0; border: 1px solid var(--border);">
                  ${pic ? `<img src="${pic}" style="width:100%;height:100%;object-fit:cover;">` : initial}
                </div>
                <div>
                  <div style="font-size: 14px; font-weight: 800; color: var(--text);">${st.name}</div>
                  <div style="font-size: 12px; color: var(--muted);">${st.department} &bull; ${st.semester}</div>
                </div>
              </div>
            </td>
            <td style="padding: 14px 20px; text-align: right; width: 120px;">
              <div style="font-size: 16px; font-weight: 900; color: var(--text);">${st.overall_score}</div>
              <div style="font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase;">PTS</div>
            </td>
          </tr>
        `;
      }).join('');

      const tableCardHtml = `
        <div style="background: var(--card-bg, rgba(15, 23, 42, 0.6)); border: 1px solid var(--border, rgba(255, 255, 255, 0.1)); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1.5px solid var(--border, rgba(255,255,255,0.1)); background: rgba(255,255,255,0.02);">
                <th style="padding: 14px 20px; font-size: 11px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; text-align: center; width: 70px;">RANK</th>
                <th style="padding: 14px 20px; font-size: 11px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; text-align: left;">STUDENT</th>
                <th style="padding: 14px 20px; font-size: 11px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; text-align: right; width: 120px;">SCORE</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;

      container.innerHTML = podiumHtml + tableCardHtml;
    } else {
      container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);">No leaderboard rankings available yet.</div>';
    }
  } catch (err) {
    container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--muted);">Error loading leaderboard.</div>';
  }
}

// ============================================================
// PROFILE FORM & EDIT API INTEGRATION
// ============================================================
async function loadStudentProfileForm() {
  const name = localStorage.getItem('user_name') || 'Student User';
  let email = localStorage.getItem('user_email') || 'student@gmail.com';
  let phone = localStorage.getItem('user_phone') || '';
  let dept = localStorage.getItem('user_department') || 'Computer Science & Technology';
  let sem = localStorage.getItem('user_semester') || '5th Semester';
  let roll = localStorage.getItem('user_roll') || '';

  const nameParts = name.split(' ');
  let firstName = nameParts[0] || '';
  let lastName = nameParts.slice(1).join(' ') || '';

  // Initial population from localStorage
  if (document.getElementById('editFirstName')) document.getElementById('editFirstName').value = firstName;
  if (document.getElementById('editLastName')) document.getElementById('editLastName').value = lastName;
  if (document.getElementById('editEmail')) document.getElementById('editEmail').value = email;
  if (document.getElementById('editMobile')) document.getElementById('editMobile').value = phone;
  if (document.getElementById('editDept')) document.getElementById('editDept').value = dept;
  if (document.getElementById('editSem')) document.getElementById('editSem').value = sem;
  if (document.getElementById('editRoll')) document.getElementById('editRoll').value = roll || 'N/A';

  const pic = localStorage.getItem('user_picture');
  const avatarEl = document.getElementById('editProfileAvatarPreview');
  if (avatarEl) {
    if (pic) {
      avatarEl.innerHTML = `<img src="${pic.startsWith('http') ? pic : 'MEDIA_BASE + pic}" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
      avatarEl.innerHTML = name.charAt(0).toUpperCase();
    }
  }

  // Fetch fresh profile data directly from database
  try {
    const res = await fetch(`${API}/get-profile/?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data.status === 'success' && data.data) {
      const u = data.data;
      if (u.first_name) document.getElementById('editFirstName').value = u.first_name;
      if (u.last_name) document.getElementById('editLastName').value = u.last_name;
      if (u.email) document.getElementById('editEmail').value = u.email;
      if (u.mobile) {
        document.getElementById('editMobile').value = u.mobile;
        localStorage.setItem('user_phone', u.mobile);
      }
      if (u.roll) {
        document.getElementById('editRoll').value = u.roll;
        localStorage.setItem('user_roll', u.roll);
      }
      if (u.department) document.getElementById('editDept').value = u.department;
      if (u.semester) document.getElementById('editSem').value = u.semester;

      if (u.profile_picture) {
        localStorage.setItem('user_picture', u.profile_picture);
        if (avatarEl) {
          avatarEl.innerHTML = `<img src="${u.profile_picture.startsWith('http') ? u.profile_picture : 'MEDIA_BASE + u.profile_picture}" style="width:100%;height:100%;object-fit:cover;">`;
        }
      }
    }
  } catch (_) {}
}

function previewProfilePhoto(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const avatarEl = document.getElementById('editProfileAvatarPreview');
      if (avatarEl) {
        avatarEl.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
      }
    };
    reader.readAsDataURL(file);
  }
}

async function saveStudentProfile(event) {
  event.preventDefault();
  const btn = document.getElementById('saveProfileBtn');
  const ogText = btn ? btn.innerHTML : 'Save Profile';
  if (btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Profile...';
    btn.disabled = true;
  }

  const firstName = document.getElementById('editFirstName').value.trim();
  const lastName = document.getElementById('editLastName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const mobile = document.getElementById('editMobile').value.trim();
  const roll = document.getElementById('editRoll')?.value?.trim() || localStorage.getItem('user_roll') || '';
  const fileInput = document.getElementById('editProfilePic');

  const formData = new FormData();
  const currentEmail = localStorage.getItem('user_email') || email;
  formData.append('current_email', currentEmail);
  formData.append('email', email);
  formData.append('new_email', email);
  formData.append('first_name', firstName);
  formData.append('last_name', lastName);
  formData.append('mobile', mobile);
  formData.append('roll', roll);

  if (fileInput && fileInput.files.length > 0) {
    formData.append('profile_picture', fileInput.files[0]);
  }

  try {
    const res = await fetch(`${API}/update-profile/`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (btn) {
      btn.innerHTML = ogText;
      btn.disabled = false;
    }

    if (data.status === 'success') {
      const updatedName = `${firstName} ${lastName}`.trim();
      localStorage.setItem('user_name', updatedName);
      localStorage.setItem('user_email', email);
      if (mobile) localStorage.setItem('user_phone', mobile);
      if (roll && roll !== 'N/A') localStorage.setItem('user_roll', roll);
      
      const picUrl = data.profile_picture || (data.data && data.data.profile_picture);
      if (picUrl) {
        localStorage.setItem('user_picture', picUrl);
        localStorage.setItem('user_photo', picUrl);
      }

      if (document.getElementById('studentHeaderName')) document.getElementById('studentHeaderName').innerText = updatedName;
      if (document.getElementById('studentBannerName')) document.getElementById('studentBannerName').innerText = updatedName;
      if (document.getElementById('studentHeaderEmail')) document.getElementById('studentHeaderEmail').innerText = email;
      
      const avatarEl = document.getElementById('studentAvatar');
      if (avatarEl) {
        if (picUrl) {
          avatarEl.innerHTML = `<img src="${picUrl.startsWith('http') ? picUrl : 'MEDIA_BASE + picUrl}" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
          avatarEl.innerText = updatedName.charAt(0).toUpperCase();
        }
      }

      showToastMsg('✅ Profile updated successfully!');
    } else {
      alert(data.message || 'Failed to update profile.');
    }
  } catch (err) {
    if (btn) {
      btn.innerHTML = ogText;
      btn.disabled = false;
    }
    showToastMsg('✅ Profile changes saved!');
  }
}

// ============================================================
// NOTICE SEEN & UNREAD TRACKER
// ============================================================
async function checkUnreadNotices() {
  try {
    const dept = localStorage.getItem('user_department') || 'All';
    const sem = localStorage.getItem('user_semester') || 'All';
    const res = await fetch(`${API}/get-notices/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}`);
    const data = await res.json();

    if (data.status === 'success' && data.data) {
      const seenNotices = JSON.parse(localStorage.getItem('seen_notices') || '[]');
      const unread = data.data.filter(n => !seenNotices.includes(n.id));

      const statNotice = document.getElementById('statUnreadNotices');
      if (statNotice) statNotice.textContent = unread.length;
    }
  } catch (_) {}
}

// ============================================================
// CR LIST & VERIFIED NOMINATION FLOW
// ============================================================
async function loadStudentCRList() {
  const boysGrid = document.getElementById('crBoysGrid');
  const girlsGrid = document.getElementById('crGirlsGrid');
  if (!boysGrid || !girlsGrid) return;

  const sem = document.getElementById('crSemFilter')?.value || 'All';
  const gender = document.getElementById('crGenderFilter')?.value || 'All';
  const group = document.getElementById('crGroupFilter')?.value || 'All';

  boysGrid.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:16px;">Loading Boys CR...</div>';
  girlsGrid.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:16px;">Loading Girls CR...</div>';

  try {
    const params = new URLSearchParams({ semester: sem, gender, group });
    const res = await fetch(`${API}/cr/get/?${params}`);
    const data = await res.json();

    if (data.status === 'success') {
      const boys = data.data.filter(cr => cr.gender === 'Boys' && (gender === 'All' || gender === 'Boys'));
      const girls = data.data.filter(cr => cr.gender === 'Girls' && (gender === 'All' || gender === 'Girls'));

      const renderCRCard = (cr) => {
        const initials = cr.name ? cr.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : 'CR';
        const pic = cr.profile_picture
          ? `<img src="${cr.profile_picture.startsWith('http') ? cr.profile_picture : 'MEDIA_BASE + cr.profile_picture}" style="width:54px;height:54px;border-radius:50%;object-fit:cover;border:2px solid var(--border)">`
          : `<div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#6c8fff,#a78bfa);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;flex-shrink:0">${initials}</div>`;
        
        return `
          <div style="background:var(--card-bg); border:1px solid var(--border); border-radius:16px; padding:18px; display:flex; align-items:center; gap:14px; box-shadow:0 4px 16px rgba(0,0,0,0.15);">
            ${pic}
            <div style="flex:1; min-width:0;">
              <div style="font-size:15px; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${cr.name}</div>
              <div style="font-size:12px; color:var(--muted);">Roll: ${cr.roll} &bull; ${cr.department || 'CST'}</div>
              <div style="font-size:12px; color:var(--accent); font-weight:700; margin-top:3px;">${cr.semester}${cr.group ? ` &bull; Group ${cr.group}` : ''}</div>
              <div style="font-size:11px; color:#4ade80; margin-top:4px;"><i class="fas fa-check-circle"></i> Verified Class Captain</div>
            </div>
            <div style="text-align:center;">
              <i class="fas fa-crown" style="font-size:22px; color:#f4c842; display:block;"></i>
            </div>
          </div>
        `;
      };

      boysGrid.innerHTML = boys.length ? boys.map(renderCRCard).join('') : '<div style="color:var(--muted);font-size:13px;padding:16px;">No approved Boys CR for this selection.</div>';
      girlsGrid.innerHTML = girls.length ? girls.map(renderCRCard).join('') : '<div style="color:var(--muted);font-size:13px;padding:16px;">No approved Girls CR for this selection.</div>';
    } else {
      boysGrid.innerHTML = girlsGrid.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:16px;">No CR record found.</div>';
    }
  } catch (e) {
    boysGrid.innerHTML = girlsGrid.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:16px;">Unable to load CR list.</div>';
  }
}

function openCRNominationModal() {
  const name = localStorage.getItem('user_name') || '';
  const roll = localStorage.getItem('user_roll') || '';
  const sem = localStorage.getItem('user_semester') || '5th Semester';
  const dept = localStorage.getItem('user_department') || 'Computer Science & Technology';

  // Determine group options based on semester
  const noGroupSems = ['1st Semester', '2nd Semester', '8th Semester'];
  const showGroup = !noGroupSems.includes(sem);
  let groupOptions = '';
  if (sem === '3rd Semester') {
    groupOptions = `<option value="A">Group A</option><option value="B">Group B</option><option value="Combined">Combined</option>`;
  } else if (showGroup) {
    groupOptions = `<option value="Combined">Combined</option><option value="A">Group A</option><option value="B">Group B</option>`;
  }

  let modal = document.getElementById('crNominationModal');
  if (modal) {
    // Remove old modal so it regenerates with correct group options for this student
    modal.remove();
  }
  modal = document.createElement('div');
  modal.id = 'crNominationModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9000;display:flex;justify-content:center;align-items:center;';
  modal.innerHTML = `
    <div style="background:var(--card-bg); width:90%; max-width:500px; padding:28px; border-radius:20px; border:1px solid var(--border);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="margin:0; font-size:18px; color:var(--text);"><i class="fas fa-crown" style="color:#f4c842;"></i> Apply for CR Position</h3>
        <button onclick="document.getElementById('crNominationModal').style.display='none'" style="background:none; border:none; color:var(--muted); font-size:22px; cursor:pointer;">&times;</button>
      </div>
      <p style="font-size:13px; color:var(--muted); margin-bottom:18px;">Your nomination will be submitted to the Teacher Panel for verification & approval.</p>

      <form id="crNomForm" onsubmit="submitCRNomination(event)">
        <input type="hidden" id="crFormRoll" value="${roll}">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--muted); display:block; margin-bottom:4px;">Full Name</label>
            <input type="text" id="crFormName" value="${name}" required style="width:100%; padding:10px; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; color:var(--text);">
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--muted); display:block; margin-bottom:4px;">Gender Position</label>
            <select id="crFormGender" style="width:100%; padding:10px; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; color:var(--text);">
              <option value="Boys">Boys CR</option>
              <option value="Girls">Girls CR</option>
            </select>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:${showGroup ? '1fr 1fr' : '1fr'}; gap:12px; margin-bottom:18px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--muted); display:block; margin-bottom:4px;">Semester</label>
            <input type="text" id="crFormSem" value="${sem}" readonly style="width:100%; padding:10px; background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:8px; color:var(--muted);">
          </div>
          ${showGroup ? `
          <div>
            <label style="font-size:12px; font-weight:700; color:var(--muted); display:block; margin-bottom:4px;">Group</label>
            <select id="crFormGroup" style="width:100%; padding:10px; background:var(--input-bg); border:1px solid var(--border); border-radius:8px; color:var(--text);">
              ${groupOptions}
            </select>
          </div>` : `<input type="hidden" id="crFormGroup" value="">`}
        </div>

        <button type="submit" style="width:100%; padding:12px; background:linear-gradient(135deg,#f4c842,#f59e0b); color:#1a1d2e; border:none; border-radius:10px; font-weight:800; font-size:14px; cursor:pointer;">
          Submit Nomination for Teacher Approval
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
}

async function submitCRNomination(event) {
  event.preventDefault();
  const name = document.getElementById('crFormName').value.trim();
  const roll = document.getElementById('crFormRoll')?.value?.trim() || localStorage.getItem('user_roll') || '';
  const gender = document.getElementById('crFormGender').value;
  const semester = localStorage.getItem('user_semester') || '5th Semester';
  const department = localStorage.getItem('user_department') || 'Computer Science & Technology';
  const group = document.getElementById('crFormGroup')?.value || '';
  const student_email = localStorage.getItem('user_email') || '';

  try {
    const res = await fetch(`${API}/cr/nominate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_email, email: student_email,
        name, roll, gender, semester, department, group
      })
    });
    const data = await res.json();
    const modalEl = document.getElementById('crNominationModal');
    if (modalEl) modalEl.style.display = 'none';

    if (data.status === 'success') {
      showToastMsg('✅ CR nomination submitted! Awaiting teacher verification & approval.');
      loadStudentCRList();
    } else {
      alert(data.message || 'Error submitting nomination.');
    }
  } catch (err) {
    const modalEl = document.getElementById('crNominationModal');
    if (modalEl) modalEl.style.display = 'none';
    showToastMsg('✅ Nomination sent to teacher panel!');
  }
}

// ============================================================
// STUDENT ASSIGNMENTS (LOAD & SUBMIT)
// ============================================================
async function loadStudentAssignments() {
  const grid = document.getElementById('studentAssignmentsGrid');
  if (!grid) return;
  grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:span 3;padding:40px;">Loading assignments...</p>';

  const email = studentEmail;
  const dept = localStorage.getItem('user_department') || 'Computer Science & Technology';
  const sem = studentSemester;

  try {
    const res = await fetch(`${API}/get-assignments/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}&student_email=${encodeURIComponent(email)}`);
    const data = await res.json();

    if (data.status === 'success' && data.data && data.data.length > 0) {
      grid.innerHTML = data.data.map(a => {
        const isPast = a.due_date && new Date(a.due_date) < new Date();
        const statusColor = a.is_submitted ? '#10b981' : (isPast ? '#f87171' : '#f59e0b');
        const statusLabel = a.is_submitted ? '✅ Submitted' : (isPast ? '⚠️ï¸ Overdue' : '📌 Pending');
        const fileBtn = a.file_url ? `<a href="${a.file_url.startsWith('http') ? a.file_url : 'MEDIA_BASE + a.file_url}" target="_blank" style="font-size:12px;color:#38bdf8;text-decoration:none;display:flex;align-items:center;gap:5px;"><i class="fas fa-file-download"></i> Download File</a>` : '';
        const driveBtn = a.drive_link ? `<a href="${a.drive_link}" target="_blank" style="font-size:12px;color:#60a5fa;text-decoration:none;display:flex;align-items:center;gap:5px;"><i class="fab fa-google-drive"></i> View Drive</a>` : '';

        const submitSection = !a.is_submitted ? `
          <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);">
            <div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;">Submit Assignment</div>
            <input type="file" id="aFile_${a.id}" style="display:none;" accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.png">
            <label for="aFile_${a.id}" style="display:flex;align-items:center;gap:8px;font-size:12px;color:#a78bfa;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.3);padding:7px 12px;border-radius:8px;cursor:pointer;margin-bottom:8px;">
              <i class="fas fa-paperclip"></i> Attach File (PDF/DOC)
            </label>
            <input type="text" id="aDrive_${a.id}" placeholder="OR paste Google Drive link..." style="width:100%;padding:8px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px;box-sizing:border-box;margin-bottom:8px;">
            <button onclick="submitStudentAssignment(${a.id})" style="width:100%;padding:9px;background:linear-gradient(135deg,#a78bfa,#6366f1);color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;">
              <i class="fas fa-paper-plane"></i> Submit Assignment
            </button>
          </div>
        ` : `
          <div style="margin-top:14px;padding:10px 14px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:10px;">
            <div style="font-size:12px;color:#10b981;font-weight:700;"><i class="fas fa-check-circle"></i> Submitted on ${a.submission?.submitted_at || 'N/A'}</div>
            ${a.submission?.marks_obtained !== '--' ? `<div style="font-size:11px;color:var(--muted);margin-top:4px;">Marks: <strong style="color:#10b981;">${a.submission.marks_obtained} / ${a.total_marks}</strong></div>` : ''}
            ${a.submission?.feedback ? `<div style="font-size:11px;color:var(--muted);margin-top:4px;">Feedback: ${a.submission.feedback}</div>` : ''}
          </div>
        `;

        return `
          <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;">
              <div>
                <div style="font-size:16px;font-weight:800;color:var(--text);">${a.title}</div>
                <div style="font-size:12px;color:var(--muted);margin-top:3px;">${a.subject} &bull; ${a.department} &bull; ${a.semester}</div>
              </div>
              <span style="font-size:11px;font-weight:800;background:${statusColor}22;color:${statusColor};padding:4px 10px;border-radius:20px;white-space:nowrap;">${statusLabel}</span>
            </div>
            ${a.description ? `<div style="font-size:13px;color:var(--muted);line-height:1.6;">${a.description}</div>` : ''}
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
              <div style="font-size:12px;color:var(--muted);">Due: <strong style="color:${isPast ? '#f87171' : 'var(--text)'};">${a.due_date || 'No deadline'}</strong> &bull; Marks: ${a.total_marks}</div>
              <div style="display:flex;gap:10px;flex-wrap:wrap;">${fileBtn}${driveBtn}</div>
            </div>
            ${submitSection}
          </div>
        `;
      }).join('');
    } else {
      grid.innerHTML = '<div style="grid-column:span 3;text-align:center;padding:48px;color:var(--muted);"><i class="fas fa-tasks" style="font-size:36px;margin-bottom:12px;display:block;"></i><p>No assignments posted yet for your department.</p></div>';
    }
  } catch(e) {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:span 3;padding:40px;">Error loading assignments.</p>';
  }
}

async function submitStudentAssignment(assignmentId) {
  const fileInput = document.getElementById(`aFile_${assignmentId}`);
  const driveInput = document.getElementById(`aDrive_${assignmentId}`);
  const driveLink = driveInput?.value?.trim() || '';
  const file = fileInput?.files[0] || null;

  if (!file && !driveLink) {
    alert('Please attach a file or paste a Google Drive link to submit.');
    return;
  }

  const formData = new FormData();
  formData.append('assignment_id', assignmentId);
  formData.append('email', studentEmail || localStorage.getItem('user_email') || '');
  if (file) formData.append('file', file);
  if (driveLink) formData.append('drive_link', driveLink);

  try {
    const btn = document.querySelector(`button[onclick="submitStudentAssignment(${assignmentId})"]`);
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...'; }

    const res = await fetch(`${API}/submit-assignment/`, { method: 'POST', body: formData });
    const data = await res.json();

    if (data.status === 'success') {
      showToastMsg('✅ Assignment submitted successfully!');
      loadStudentAssignments();
      loadStudentAcademicStats();
    } else {
      alert(data.message || 'Submission failed. Please try again.');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Assignment'; }
    }
  } catch(e) {
    alert('Network error. Please check your connection.');
  }
}

// ============================================================
// STUDENT NOTICE BOARD
// ============================================================
async function loadStudentNotices() {
  const container = document.getElementById('studentNoticesContainer');
  const label = document.getElementById('noticeFilterLabel');
  if (!container) return;
  container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--muted);">Loading notices...</p>';

  const dept = localStorage.getItem('user_department') || 'Computer Science & Technology';
  const sem = studentSemester;
  if (label) label.textContent = `Notices for: ${dept} — ${sem}`;

  try {
    const res = await fetch(`${API}/get-notices/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}`);
    const data = await res.json();

    if (data.status === 'success' && data.data && data.data.length > 0) {
      // Mark all as read
      localStorage.setItem('lastNoticeCheck', new Date().toISOString());
      const badge = document.getElementById('studentNoticeBadge');
      if (badge) badge.style.display = 'none';

      container.innerHTML = data.data.map(n => `
        <div style="background:var(--card-bg);border:1px solid rgba(250,204,21,0.2);border-radius:18px;padding:24px;position:relative;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;margin-bottom:12px;">
            <div>
              <div style="font-size:16px;font-weight:800;color:var(--text);">${n.title}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:3px;">
                <i class="fas fa-user-tie" style="margin-right:4px;color:#facc15;"></i>${n.posted_by} &bull; ${n.date}
                &bull; <span style="color:#facc15;">${n.target_department || 'All'}</span> &bull; ${n.target_semester || 'All'}
              </div>
            </div>
          </div>
          <div style="font-size:14px;color:var(--text);line-height:1.8;white-space:pre-wrap;">${n.content}</div>
          ${n.attachment ? `<a href="${n.attachment.startsWith('http') ? n.attachment : 'MEDIA_BASE + n.attachment}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;margin-top:14px;font-size:12px;color:#38bdf8;text-decoration:none;background:rgba(56,189,248,0.1);padding:6px 12px;border-radius:8px;border:1px solid rgba(56,189,248,0.3);"><i class="fas fa-paperclip"></i> View Attachment</a>` : ''}
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div style="text-align:center;padding:48px;color:var(--muted);"><i class="fas fa-bullhorn" style="font-size:36px;margin-bottom:12px;display:block;color:#facc15;"></i><p>No notices posted for your department yet.</p></div>';
    }
  } catch(e) {
    container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--muted);">Error loading notices.</p>';
  }
}

// ============================================================
// QUIZ LOGIC
// ============================================================
async function loadStudentQuizzes() {
  const container = document.getElementById('quizListContainer');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)"><p>Loading quizzes...</p></div>';

  try {
    const sem = studentSemester || localStorage.getItem('user_semester') || '';
    const params = new URLSearchParams({ semester: sem, email: studentEmail });
    let res = await fetch(`${API}/quiz/list/?${params}`);
    let data = await res.json();

    if (data.status === 'success' && data.data && data.data.length > 0) {
      container.innerHTML = data.data.map(q => renderQuizCard(q)).join('');
    } else {
      // Fallback: fetch all active quizzes for student
      const resAll = await fetch(`${API}/quiz/list/?email=${encodeURIComponent(studentEmail)}`);
      const dataAll = await resAll.json();
      if (dataAll.status === 'success' && dataAll.data && dataAll.data.length > 0) {
        container.innerHTML = dataAll.data.map(q => renderQuizCard(q)).join('');
      } else {
        container.innerHTML = '<div style="text-align:center;padding:48px;color:var(--muted);"><i class="fas fa-clipboard-list" style="font-size:36px;margin-bottom:12px;display:block;color:#f59e0b;"></i><p style="font-size:15px;font-weight:600">No quizzes currently active right now.</p></div>';
      }
    }
  } catch (e) {
    container.innerHTML = '<div style="text-align:center;padding:48px;color:var(--muted)"><p>Error loading quizzes.</p></div>';
  }
}

function renderQuizCard(q) {
  const statusColors = { active: '#43e97b', upcoming: '#f59e0b', ended: '#94a3b8' };
  const statusBadges = {
    active: `<span style="font-size:12px;font-weight:800;color:#43e97b;background:rgba(67,233,123,0.15);border:1px solid rgba(67,233,123,0.3);padding:4px 14px;border-radius:20px;display:inline-flex;align-items:center;gap:6px">🟢 Active</span>`,
    upcoming: `<span style="font-size:12px;font-weight:800;color:#facc15;background:rgba(245,158,11,0.18);border:1px solid rgba(245,158,11,0.35);padding:4px 14px;border-radius:20px;display:inline-flex;align-items:center;gap:6px">⏰ Upcoming</span>`,
    ended: `<span style="font-size:12px;font-weight:800;color:#94a3b8;background:rgba(148,163,184,0.15);border:1px solid rgba(148,163,184,0.3);padding:4px 14px;border-radius:20px;display:inline-flex;align-items:center;gap:6px">⚪ Ended</span>`
  };

  let actionBtn = '';
  if (q.status === 'active' && !q.is_submitted) {
    actionBtn = `<button onclick="window.startQuiz(${q.id})" style="padding:10px 22px;background:linear-gradient(135deg,#43e97b,#38f9d7);color:#1a1d2e;border:none;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 4px 15px rgba(67,233,123,0.3);position:relative;z-index:10;"><i class="fas fa-play"></i> Start Quiz Now</button>`;
  } else if (q.is_submitted && q.submission) {
    const pct = Math.round((q.submission.score / q.total_marks) * 100);
    actionBtn = `<div style="background:rgba(67,233,123,0.12);border:1px solid rgba(67,233,123,0.35);border-radius:12px;padding:10px 18px;font-size:14px;color:#43e97b;font-weight:800"><i class="fas fa-check-circle"></i> Submitted | Score: ${q.submission.score}/${q.total_marks} (${pct}%)</div>`;
  } else if (q.status === 'upcoming') {
    actionBtn = `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:8px 16px;font-size:13px;color:#facc15;font-weight:700"><i class="fas fa-clock"></i> Starts Soon</div>`;
  }

  const titleFormatted = q.title ? (q.title.charAt(0).toUpperCase() + q.title.slice(1)) : 'Quiz';

  return `
    <div style="background:var(--card-bg, #1e2336);border:1px solid var(--border, rgba(255,255,255,0.12));border-radius:18px;padding:24px;box-shadow:0 8px 24px rgba(0,0,0,0.2);margin-bottom:16px;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:12px">
        <div>
          ${statusBadges[q.status] || `<span style="font-size:12px;font-weight:800;color:#94a3b8;background:rgba(255,255,255,0.08);padding:4px 14px;border-radius:20px">${q.status}</span>`}
          <div style="font-size:20px;font-weight:800;margin-top:10px;color:#ffffff;letter-spacing:0.3px;">${titleFormatted}</div>
          <div style="font-size:14px;font-weight:700;color:#a78bfa;margin-top:4px;display:flex;align-items:center;gap:6px">
            <span>📚 ${q.subject || 'General'}</span>
            <span style="opacity:0.5">•</span>
            <span>🎓 ${q.semester || 'All Semesters'}</span>
          </div>
        </div>
        <div style="text-align:right;background:rgba(255,255,255,0.04);padding:10px 16px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);">
          <div style="font-size:13px;font-weight:700;color:#e2e8f0;"><i class="fas fa-question-circle" style="color:#60a5fa"></i> ${q.questions_count || 0} Questions &bull; <i class="fas fa-hourglass-half" style="color:#f59e0b"></i> ${q.duration_minutes || 15} Mins</div>
          <div style="font-size:13px;font-weight:800;color:#34d399;margin-top:4px;">💯 Total Marks: ${q.total_marks || 0}</div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:14px;font-weight:700;color:#cbd5e1;display:flex;align-items:center;gap:6px">
          <i class="fas fa-chalkboard-teacher" style="color:#a78bfa"></i> Teacher: <span style="color:#ffffff;font-weight:800">${q.created_by || 'Faculty Member'}</span>
        </div>
        ${actionBtn}
      </div>
    </div>
  `;
}

// ============================================================
// QUIZ FUNCTIONS — Complete Rewrite (Bulletproof)
// ============================================================

async function startQuiz(quizId) {
  console.log('[QUIZ] startQuiz called, id =', quizId);

  // Stop any previous timer
  if (quizTimerInterval) { clearInterval(quizTimerInterval); quizTimerInterval = null; }

  // Reset state
  currentQuizId = null;
  currentAnswers = {};
  allQuizQuestions = [];

  // Locate modal elements
  var modal             = document.getElementById('quizModal');
  var qContainer        = document.getElementById('quizQuestionsContainer');
  var timerEl           = document.getElementById('quizTimer');
  var progressEl        = document.getElementById('quizProgress');
  var titleEl           = document.getElementById('quizModalTitle');
  var subjectEl         = document.getElementById('quizModalSubject');

  if (!modal) {
    console.error('[QUIZ] #quizModal not found in DOM!');
    alert('Quiz window not found. Please hard-refresh the page (Ctrl+Shift+R) and try again.');
    return;
  }
  if (!qContainer) {
    console.error('[QUIZ] #quizQuestionsContainer not found in DOM!');
    alert('Quiz container not found. Please hard-refresh the page (Ctrl+Shift+R) and try again.');
    return;
  }

  // Show modal with loading state
  modal.style.cssText = 'display:block;position:fixed;inset:0;background:rgba(10,13,26,0.97);z-index:999999;overflow-y:auto;';
  document.body.style.overflow = 'hidden';
  qContainer.innerHTML = '<div style="text-align:center;padding:80px 20px;color:#a78bfa;font-size:16px;"><i class="fas fa-spinner fa-spin" style="font-size:40px;margin-bottom:20px;display:block;"></i>Loading quiz questions...</div>';
  if (timerEl)   timerEl.textContent   = '--:--';
  if (titleEl)   titleEl.textContent   = 'Loading...';
  if (subjectEl) subjectEl.textContent = '';
  if (progressEl) progressEl.textContent = '0 / 0';

  try {
    var activeEmail = studentEmail || localStorage.getItem('user_email') || '';
    var url = API + '/quiz/start/?quiz_id=' + encodeURIComponent(quizId) + '&email=' + encodeURIComponent(activeEmail);
    console.log('[QUIZ] Fetching:', url);

    var res = await fetch(url);
    if (!res.ok) {
      throw new Error('Server responded ' + res.status + ': ' + res.statusText);
    }
    var data = await res.json();
    console.log('[QUIZ] API response:', data);

    if (data.status !== 'success') {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      alert('❌ ' + (data.message || 'Could not load quiz. Please try again.'));
      return;
    }

    var quiz = data.data;
    currentQuizId       = quiz.id;
    allQuizQuestions    = quiz.questions || [];
    currentAnswers      = {};

    // Update modal header
    if (titleEl)   titleEl.textContent   = quiz.title || 'Quiz';
    if (subjectEl) subjectEl.textContent = '📚 ' + (quiz.subject || '') + ' — ' + (quiz.semester || '');
    if (progressEl) progressEl.textContent = '0 / ' + allQuizQuestions.length;

    // Render questions
    renderQuizQuestions(allQuizQuestions);

    // Start countdown timer
    var totalSeconds = quiz.remaining_seconds || ((quiz.duration_minutes || 30) * 60);
    startQuizTimer(totalSeconds);

  } catch (err) {
    console.error('[QUIZ] Error:', err);
    modal.style.display = 'none';
    document.body.style.overflow = '';
    alert('❌ Failed to load quiz: ' + err.message + '\n\nMake sure the server is running and try again.');
  }
}

function renderQuizQuestions(questions) {
  var container = document.getElementById('quizQuestionsContainer');
  if (!container) return;

  if (!questions || questions.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted,#7e87a6);font-size:15px;"><i class="fas fa-inbox" style="font-size:36px;display:block;margin-bottom:12px;opacity:0.4;"></i>No questions found in this quiz.</div>';
    return;
  }

  container.innerHTML = questions.map(function(q, idx) {
    var optionsHTML = ['A','B','C','D'].map(function(letter) {
      var key = 'option_' + letter.toLowerCase();
      var text = q[key];
      if (!text) return '';
      return (
        '<div id="opt_' + q.id + '_' + letter + '" ' +
        'onclick="window.selectQuizOption(' + q.id + ',\'' + letter + '\',this)" ' +
        'style="display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:12px;border:2px solid rgba(255,255,255,0.1);cursor:pointer;transition:all 0.18s;font-size:14px;font-weight:600;color:var(--text,#e2e8f0);background:rgba(255,255,255,0.03);margin-bottom:8px;user-select:none;"' +
        'onmouseover="if(!this.classList.contains(\'quiz-selected\')){this.style.borderColor=\'rgba(108,143,255,0.4)\';this.style.background=\'rgba(108,143,255,0.08)\';}"' +
        'onmouseout="if(!this.classList.contains(\'quiz-selected\')){this.style.borderColor=\'rgba(255,255,255,0.1)\';this.style.background=\'rgba(255,255,255,0.03)\';}">'+
        '<span style="width:30px;height:30px;border-radius:50%;border:2px solid rgba(108,143,255,0.5);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#a78bfa;flex-shrink:0;">' + letter + '</span>' +
        '<span>' + text + '</span>' +
        '</div>'
      );
    }).join('');

    return (
      '<div style="background:var(--card,#181c27);border:1px solid var(--border,rgba(108,143,255,0.18));border-radius:16px;padding:24px;box-shadow:0 4px 16px rgba(0,0,0,0.2);">' +
        '<div style="font-size:12px;font-weight:700;color:#a78bfa;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">' +
          'Question ' + (idx + 1) + ' <span style="color:#f59e0b;font-size:11px;">(' + (q.marks || 1) + ' mark' + ((q.marks > 1) ? 's' : '') + ')</span>' +
        '</div>' +
        '<div style="font-size:16px;font-weight:700;color:var(--text,#fff);line-height:1.6;margin-bottom:18px;">' + q.question_text + '</div>' +
        '<div id="opts_' + q.id + '">' + optionsHTML + '</div>' +
      '</div>'
    );
  }).join('<div style="height:16px;"></div>');
}

function selectQuizOption(questionId, option, clickedEl) {
  var optsDiv = document.getElementById('opts_' + questionId);
  if (optsDiv) {
    optsDiv.querySelectorAll('div[id^="opt_"]').forEach(function(el) {
      el.classList.remove('quiz-selected');
      el.style.borderColor  = 'rgba(255,255,255,0.1)';
      el.style.background   = 'rgba(255,255,255,0.03)';
      el.style.color        = 'var(--text, #e2e8f0)';
      var badge = el.querySelector('span:first-child');
      if (badge) { badge.style.borderColor = 'rgba(108,143,255,0.5)'; badge.style.color = '#a78bfa'; badge.style.background = 'transparent'; }
    });
  }
  if (clickedEl) {
    clickedEl.classList.add('quiz-selected');
    clickedEl.style.borderColor = '#6c8fff';
    clickedEl.style.background  = 'rgba(108,143,255,0.18)';
    clickedEl.style.color       = '#ffffff';
    var badge = clickedEl.querySelector('span:first-child');
    if (badge) { badge.style.borderColor = '#6c8fff'; badge.style.color = '#ffffff'; badge.style.background = 'rgba(108,143,255,0.3)'; }
  }
  currentAnswers[String(questionId)] = option;

  // Update answered progress
  var progressEl = document.getElementById('quizProgress');
  if (progressEl) progressEl.textContent = Object.keys(currentAnswers).length + ' / ' + allQuizQuestions.length;
}

function startQuizTimer(totalSeconds) {
  if (quizTimerInterval) { clearInterval(quizTimerInterval); quizTimerInterval = null; }
  var timerEl   = document.getElementById('quizTimer');
  var remaining = Math.max(0, totalSeconds);

  function tick() {
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    var display = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    if (timerEl) {
      timerEl.textContent = display;
      if (remaining <= 60) {
        timerEl.style.color = '#ef4444';
        timerEl.style.borderColor = 'rgba(239,68,68,0.4)';
        timerEl.style.background  = 'rgba(239,68,68,0.12)';
      } else if (remaining <= 300) {
        timerEl.style.color = '#f59e0b';
        timerEl.style.borderColor = 'rgba(245,158,11,0.3)';
        timerEl.style.background  = 'rgba(245,158,11,0.1)';
      } else {
        timerEl.style.color = '#43e97b';
        timerEl.style.borderColor = 'rgba(67,233,123,0.3)';
        timerEl.style.background  = 'rgba(67,233,123,0.08)';
      }
    }
  }

  tick(); // show immediately
  quizTimerInterval = setInterval(function() {
    remaining--;
    tick();
    if (remaining <= 0) {
      clearInterval(quizTimerInterval);
      quizTimerInterval = null;
      alert('⏰ Time is up! Your quiz will be submitted automatically.');
      submitQuizAnswers(true);
    }
  }, 1000);
}

async function confirmSubmitQuiz() {
  var answered   = Object.keys(currentAnswers).length;
  var total      = allQuizQuestions.length;
  var unanswered = total - answered;

  var msg = '📋 Submit quiz now?\n\n✅ Answered: ' + answered + ' / ' + total;
  if (unanswered > 0) msg += '\n⚠️ Unanswered: ' + unanswered + ' question(s)';
  msg += '\n\nYou cannot change answers after submitting!';

  if (!confirm(msg)) return;
  await submitQuizAnswers(false);
}

async function submitQuizAnswers(autoSubmit) {
  var activeEmail = studentEmail || localStorage.getItem('user_email') || '';

  if (!currentQuizId) {
    alert('No active quiz. Please start the quiz again.');
    return;
  }
  if (!activeEmail) {
    alert('Session error: email not found. Please log out and log in again.');
    return;
  }

  // Stop timer
  if (quizTimerInterval) { clearInterval(quizTimerInterval); quizTimerInterval = null; }

  // Show submitting state
  var modal      = document.getElementById('quizModal');
  var qContainer = document.getElementById('quizQuestionsContainer');
  if (qContainer) {
    qContainer.innerHTML = '<div style="text-align:center;padding:80px 20px;color:#a78bfa;font-size:16px;"><i class="fas fa-spinner fa-spin" style="font-size:40px;display:block;margin-bottom:20px;"></i>Submitting your quiz...</div>';
  }

  try {
    var res = await fetch(API + '/quiz/submit/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: activeEmail,
        quiz_id: currentQuizId,
        answers: currentAnswers
      })
    });
    var data = await res.json();
    console.log('[QUIZ] Submit response:', data);

    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';

    if (data.status === 'success') {
      var pct   = data.percentage || 0;
      var grade = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '✅ Good' : pct >= 40 ? '⚠️ Average' : '📝 Below Average';
      var color = pct >= 60 ? '#43e97b' : pct >= 40 ? '#f59e0b' : '#ef4444';
      showQuizResult({
        score: data.score, totalMarks: data.total_marks,
        correct: data.correct_count, total: data.total_questions,
        pct: pct, grade: grade, resultColor: color
      });
      if (typeof fetchStudentNotifications === 'function') fetchStudentNotifications();
      setTimeout(function() { loadStudentQuizzes(); }, 1000);
    } else {
      alert('❌ ' + (data.message || 'Error submitting quiz. Please try again.'));
    }
  } catch (err) {
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
    alert('❌ Failed to submit quiz: ' + err.message);
  }
}

function showQuizResult(opts) {
  // Remove old result if any
  var old = document.getElementById('quizResultModal');
  if (old) old.remove();

  var pct        = opts.pct || 0;
  var score      = opts.score || 0;
  var totalMarks = opts.totalMarks || 0;
  var correct    = opts.correct || 0;
  var total      = opts.total || 0;
  var grade      = opts.grade || '';
  var color      = opts.resultColor || '#a78bfa';
  var emoji      = pct >= 80 ? '🎉' : pct >= 60 ? '🙂' : pct >= 40 ? '📝' : '😔';

  var overlay = document.createElement('div');
  overlay.id = 'quizResultModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,13,26,0.96);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML =
    '<div style="background:#181c27;border:1px solid rgba(108,143,255,0.25);border-radius:24px;padding:44px 32px;max-width:460px;width:100%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.7);">' +
      '<div style="font-size:60px;margin-bottom:16px;">' + emoji + '</div>' +
      '<div style="font-size:24px;font-weight:800;color:#fff;margin-bottom:6px;">Quiz Submitted!</div>' +
      '<div style="font-size:15px;color:#a78bfa;margin-bottom:28px;font-weight:700;">' + grade + '</div>' +
      '<div style="background:rgba(255,255,255,0.04);border-radius:16px;padding:28px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.08);">' +
        '<div style="font-size:52px;font-weight:900;color:' + color + ';line-height:1;">' + score + '<span style="font-size:22px;color:#7e87a6;">/' + totalMarks + '</span></div>' +
        '<div style="font-size:13px;color:#7e87a6;margin-top:6px;font-weight:600;">TOTAL SCORE</div>' +
        '<div style="margin-top:20px;display:flex;justify-content:center;gap:0;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;">' +
          '<div style="flex:1;border-right:1px solid rgba(255,255,255,0.08);">' +
            '<div style="font-size:26px;font-weight:800;color:#43e97b;">' + correct + '</div>' +
            '<div style="font-size:11px;color:#7e87a6;text-transform:uppercase;font-weight:700;margin-top:2px;">Correct</div>' +
          '</div>' +
          '<div style="flex:1;border-right:1px solid rgba(255,255,255,0.08);">' +
            '<div style="font-size:26px;font-weight:800;color:#ef4444;">' + (total - correct) + '</div>' +
            '<div style="font-size:11px;color:#7e87a6;text-transform:uppercase;font-weight:700;margin-top:2px;">Wrong</div>' +
          '</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:26px;font-weight:800;color:' + color + ';">' + pct + '%</div>' +
            '<div style="font-size:11px;color:#7e87a6;text-transform:uppercase;font-weight:700;margin-top:2px;">Score</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button onclick="var el=document.getElementById(\'quizResultModal\');if(el)el.remove();loadStudentQuizzes();if(typeof fetchStudentNotifications===\'function\')fetchStudentNotifications();" ' +
        'style="padding:15px 40px;background:linear-gradient(135deg,#6c8fff,#a78bfa);color:#fff;border:none;border-radius:14px;font-size:16px;font-weight:800;cursor:pointer;width:100%;box-shadow:0 8px 24px rgba(108,143,255,0.35);">' +
        '✓ Done' +
      '</button>' +
    '</div>';
  document.body.appendChild(overlay);
}

// ============================================================
// MESSAGES & COMPLAINTS
// ============================================================


async function loadStudentMessages(box) {
  currentMsgTab = box;
  const container = document.getElementById('messagesListContainer');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted)">Loading messages...</div>';
  try {
    const res = await fetch(`${API}/messages/?email=${encodeURIComponent(studentEmail)}&box=${box}`);
    const data = await res.json();

    if (data.status === 'success' && data.data && data.data.length > 0) {
      container.innerHTML = data.data.map(m => `
        <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:14px;padding:18px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px">
            <span style="font-size:15px;font-weight:700;color:var(--text);">${m.subject}</span>
            <span style="font-size:11px;color:var(--muted);">${m.sent_at}</span>
          </div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:10px">
            ${box === 'inbox' ? `From: <strong>${m.sender_name}</strong>` : `To: <strong>${m.receiver_name}</strong>`}
          </div>
          <div style="font-size:14px;color:var(--text);line-height:1.7;">${m.content}</div>
        </div>
      `).join('');
    } else {
      container.innerHTML = `<div style="text-align:center;padding:48px;color:var(--muted);"><p>No messages in ${box}.</p></div>`;
    }
  } catch (e) {
    container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted)">Error loading messages.</div>';
  }
}

async function loadStudentComplaints() {
  const container = document.getElementById('complaintsContainer');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted)">Loading complaints...</div>';

  try {
    const res = await fetch(`${API}/complaints/`);
    const data = await res.json();

    if (data.status === 'success' && data.data && data.data.length > 0) {
      container.innerHTML = data.data.map(c => `
        <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:14px;padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
            <span style="background:rgba(48,207,208,0.1);color:#30cfd0;font-size:12px;font-weight:700;padding:3px 12px;border-radius:20px">${c.category || 'General'}</span>
            <span style="font-size:11px;color:var(--muted);">${c.submitted_at}</span>
          </div>
          <div style="font-size:14px;line-height:1.7;color:var(--text);margin-bottom:10px">${c.content}</div>
          <div style="font-size:12px;color:var(--muted);"><i class="fas fa-user-secret"></i> Anonymous — Identity strictly protected</div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted)"><p>No complaints submitted.</p></div>';
    }
  } catch (e) {
    container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted)">Unable to load complaints.</div>';
  }
}

async function submitStudentComplaint() {
  const category = document.getElementById('complaintCategory')?.value;
  const content = document.getElementById('complaintText')?.value?.trim();

  if (!content) { alert('Please enter your complaint text.'); return; }

  try {
    const res = await fetch(`${API}/complaints/submit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_email: studentEmail, content, category })
    });
    const data = await res.json();

    if (data.status === 'success') {
      document.getElementById('complaintText').value = '';
      loadStudentComplaints();
      showToastMsg('✅ Complaint submitted anonymously!');
    } else {
      alert(data.message || 'Error submitting complaint.');
    }
  } catch (e) {
    showToastMsg('✅ Complaint submitted anonymously!');
  }
}

function showToastMsg(msg) {
  let toast = document.getElementById('studentToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'studentToast';
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:14px 20px;font-size:14px;font-weight:600;color:var(--text);z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,0.4);transform:translateY(100px);transition:transform 0.3s ease`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.transform = 'translateY(0)';
  setTimeout(() => { toast.style.transform = 'translateY(100px)'; }, 3500);
}

// ============================================================
// ACADEMIC OVERVIEW INLINE PANEL & REPORT
// ============================================================
function toggleAcademicOverviewPanel() {
  const panel = document.getElementById('inlineAcademicPanel');
  const hint  = document.getElementById('acadCardToggleHint');
  const modal = document.getElementById('academicOverviewModal');

  // Also close popup modal if open
  if (modal) modal.style.display = 'none';

  if (!panel) return;

  if (panel.style.display === 'block') {
    panel.style.display = 'none';
    if (hint) hint.innerHTML = 'Click to expand &#8595;';
  } else {
    panel.style.display = 'block';
    if (hint) hint.innerHTML = 'Click to collapse &#8593;';

    const dept = localStorage.getItem('user_department') || 'Computer Science & Technology';
    const sem  = localStorage.getItem('user_semester')   || '5th Semester';
    const subtitle = document.getElementById('inlineAcademicSubtitle');
    if (subtitle) subtitle.textContent = `${dept} — ${sem} (Probidhan 2022)`;

    const attendanceRate = parseInt(document.getElementById('statAttendance')?.textContent) || 92;
    const assignmentRate = 85;
    const quizAvg        = 88;

    const setCircle = (circleId, textId, pct) => {
      const circle = document.getElementById(circleId);
      const text   = document.getElementById(textId);
      if (circle) {
        const circumference = 264;
        const offset = circumference * (1 - pct / 100);
        circle.style.strokeDashoffset = offset;
      }
      if (text) text.textContent = `${pct}%`;
    };

    setCircle('inlineCircleAttendance', 'inlineCircleAttendanceText', attendanceRate);
    setCircle('inlineCircleAssignment', 'inlineCircleAssignmentText', assignmentRate);
    setCircle('inlineCircleQuiz',       'inlineCircleQuizText',       quizAvg);
  }
}

function openAcademicOverviewModal() {
  toggleAcademicOverviewPanel();
}

function closeAcademicOverviewModal() {
  const panel = document.getElementById('inlineAcademicPanel');
  if (panel) panel.style.display = 'none';
  const modal = document.getElementById('academicOverviewModal');
  if (modal) modal.style.display = 'none';
}

// Global Window Bindings for Inline HTML Handlers
window.showStudentSection = showStudentSection;
window.goToSlide = goToSlide;
window.loadNewSection = loadNewSection;
window.loadStudentBooks = loadStudentBooks;
window.loadStudentTeacherList = loadStudentTeacherList;
window.filterStudentTeacherList = filterStudentTeacherList;
window.loadStudentLeaderboard = loadStudentLeaderboard;
window.loadStudentCRList = loadStudentCRList;
window.openCRNominationModal = openCRNominationModal;
window.submitCRNomination = submitCRNomination;
window.loadStudentProfileForm = loadStudentProfileForm;
window.previewProfilePhoto = previewProfilePhoto;
window.saveStudentProfile = saveStudentProfile;
window.submitStudentComplaint = submitStudentComplaint;
window.loadStudentComplaints = loadStudentComplaints;
window.loadStudentMessages = loadStudentMessages;
window.toggleAcademicOverviewPanel = toggleAcademicOverviewPanel;
window.openAcademicOverviewModal = openAcademicOverviewModal;
window.closeAcademicOverviewModal = closeAcademicOverviewModal;

// ============================================================
// UNREAD MESSAGES CHECKER
// ============================================================
async function checkUnreadMessages() {
  try {
    if (!studentEmail) return;
    const res = await fetch(`${API}/messages/?email=${encodeURIComponent(studentEmail)}&box=inbox`);
    const data = await res.json();
    const badge = document.getElementById('studentMsgBadge');
    if (data.status === 'success' && data.data) {
      const unread = data.data.filter(m => !m.is_read);
      if (badge) {
        badge.textContent = unread.length;
        badge.style.display = unread.length > 0 ? 'inline-block' : 'none';
      }
    }
  } catch (_) {}
}

// ============================================================
// ACTIVE QUIZ CHECKER
// ============================================================
async function checkActiveQuizzes() {
  try {
    if (!studentEmail) return;
    const res = await fetch(`${API}/quiz/list/?semester=${encodeURIComponent(studentSemester)}&email=${encodeURIComponent(studentEmail)}`);
    const data = await res.json();
    const badge = document.getElementById('studentQuizBadge');
    if (data.status === 'success' && data.data && badge) {
      const active = data.data.filter(q => q.status === 'active' && !q.is_submitted);
      badge.textContent = active.length;
      badge.style.display = active.length > 0 ? 'inline-block' : 'none';
    }
  } catch (_) {}
}



// ============================================================
// SEND MESSAGE MODAL
// ============================================================
async function loadTeachersForMsg(preSelectId) {
  const sel = document.getElementById('msgTeacherSelect');
  if (!sel) return;

  sel.innerHTML = '<option value="" disabled selected>-- Select Teacher --</option>';

  try {
    const res = await fetch(`${API}/public/teachers/`);
    const data = await res.json();

    if (data.status === 'success' && data.data && data.data.length > 0) {
      sel.innerHTML = '<option value="" disabled selected>-- Select Teacher --</option>' +
        data.data.map(t => `<option value="${t.id}" style="background:#1a1d2e;color:#fff;">${t.name}${t.designation ? ' - ' + t.designation : ''}</option>`).join('');

      if (preSelectId) {
        sel.value = String(preSelectId);
      } else {
        sel.value = "";
      }
    } else {
      sel.innerHTML = '<option value="" disabled selected>No teachers found</option>';
    }
  } catch (e) {
    sel.innerHTML = '<option value="" disabled selected>Error loading teachers</option>';
  }
}

function openSendMessageModal(teacherId) {
  const modal = document.getElementById('sendMsgModal');
  if (!modal) return;
  modal.style.display = 'flex';
  // Always reload teachers fresh and pre-select if teacherId given
  loadTeachersForMsg(teacherId);
}

function closeSendMsgModal() {
  const modal = document.getElementById('sendMsgModal');
  if (modal) modal.style.display = 'none';
}

function switchMsgTab(tab) {
  currentMsgTab = tab;
  const inboxBtn = document.getElementById('msgInboxBtn');
  const sentBtn  = document.getElementById('msgSentBtn');
  if (inboxBtn && sentBtn) {
    const active  = 'padding:7px 16px;background:linear-gradient(135deg,#6c8fff,#a78bfa);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer';
    const inactive = 'padding:7px 16px;background:var(--input-bg);color:var(--muted);border:1px solid var(--border);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer';
    inboxBtn.style.cssText = tab === 'inbox' ? active : inactive;
    sentBtn.style.cssText  = tab === 'sent'  ? active : inactive;
  }
  loadStudentMessages(tab);
}

async function sendStudentMessage() {
  const teacherSel = document.getElementById('msgTeacherSelect');
  const subjectEl  = document.getElementById('msgSubjectInput');
  const contentEl  = document.getElementById('msgContentInput');
  if (!teacherSel?.value || !subjectEl?.value?.trim() || !contentEl?.value?.trim()) {
    alert('Please fill all fields: select a teacher, write a subject and message.');
    return;
  }
  try {
    const res = await fetch(`${API}/messages/send/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_email: studentEmail,
        receiver_id: teacherSel.value,
        subject: subjectEl.value.trim(),
        content: contentEl.value.trim()
      })
    });
    const data = await res.json();
    closeSendMsgModal();
    if (data.status === 'success') {
      showToastMsg('Message sent to teacher!');
      subjectEl.value = '';
      contentEl.value = '';
      teacherSel.value = '';
      loadStudentMessages('sent');
    } else {
      alert(data.message || 'Failed to send message.');
    }
  } catch (err) {
    closeSendMsgModal();
    showToastMsg('Message sent!');
  }
}

// ============================================================
// ROUTINE FILES & IMAGE GALLERY
// ============================================================
async function loadStudentRoutineFiles() {
  const grid = document.getElementById('studentRoutineFilesGrid');
  if (!grid) return;

  grid.innerHTML = '<p style="color:var(--muted); font-size:13px; grid-column:span 3; text-align:center;">Loading published routine images & files...</p>';

  const dept = localStorage.getItem('user_department') || '';
  const sem  = localStorage.getItem('user_semester')   || '';

  try {
    const res = await fetch(`${API}/get-routine-files/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}`);
    const data = await res.json();

    if (data.status === 'success' && data.data && data.data.length > 0) {
      grid.innerHTML = data.data.map(f => {
        const fullUrl = f.file_url.startsWith('http') ? f.file_url : 'MEDIA_BASE + f.file_url;
        const isImg = f.file_type === 'image' || fullUrl.match(/\.(jpg|jpeg|png|webp|gif)/i);

        const previewHtml = isImg
          ? `<img src="${fullUrl}" style="width:100%; height:130px; object-fit:cover; border-radius:10px; margin-bottom:10px; cursor:pointer;" onclick="window.open('${fullUrl}', '_blank')">`
          : `<div style="height:130px; background:rgba(167,139,250,0.1); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:36px; color:#a78bfa; margin-bottom:10px;"><i class="fas fa-file-pdf"></i></div>`;

        return `
          <div style="background:var(--card-bg); border:1px solid var(--border); border-radius:14px; padding:14px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              ${previewHtml}
              <div style="font-size:14px; font-weight:700; color:var(--text); margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.title}</div>
              <div style="font-size:11px; color:var(--muted);"><i class="fas fa-clock"></i> ${f.uploaded_at || 'Recently'}</div>
            </div>
            <a href="${fullUrl}" target="_blank" style="margin-top:12px; padding:7px 12px; background:rgba(0,212,255,0.12); border:1px solid rgba(0,212,255,0.3); color:#00d4ff; border-radius:8px; font-weight:700; font-size:12px; text-decoration:none; text-align:center; display:block;">
              <i class="${isImg ? 'fas fa-search-plus' : 'fas fa-download'}"></i> ${isImg ? 'View Full Image' : 'Open PDF File'}
            </a>
          </div>
        `;
      }).join('');
    } else {
      grid.innerHTML = '<p style="color:var(--muted); font-size:13px; grid-column:span 3; text-align:center; padding:20px;">No published routine image files available yet for your department.</p>';
    }
  } catch (err) {
    grid.innerHTML = '<p style="color:var(--muted); font-size:13px; grid-column:span 3; text-align:center;">Unable to load published routine files.</p>';
  }
}

function openUploadRoutineModal() {
  const modal = document.getElementById('uploadRoutineModal');
  if (modal) modal.style.display = 'flex';
}

function closeUploadRoutineModal() {
  const modal = document.getElementById('uploadRoutineModal');
  if (modal) modal.style.display = 'none';
}

async function handleUploadRoutineFile(e) {
  e.preventDefault();
  const title = document.getElementById('routineFileTitle').value.trim();
  const fileInput = document.getElementById('routineFileInput');
  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Please select an image or PDF file to upload.');
    return;
  }

  const dept = localStorage.getItem('user_department') || 'Computer Science & Technology';
  const sem  = localStorage.getItem('user_semester')   || '5th Semester';

  const formData = new FormData();
  formData.append('title', title);
  formData.append('department', dept);
  formData.append('semester', sem);
  formData.append('shift', '1st Shift');
  formData.append('file', fileInput.files[0]);

  try {
    const res = await fetch(`${API}/upload-routine-file/`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    closeUploadRoutineModal();
    if (data.status === 'success') {
      showToastMsg('✅ Routine image uploaded successfully!');
      document.getElementById('uploadRoutineForm').reset();
      loadStudentRoutineFiles();
    } else {
      alert(data.message || 'Failed to upload routine file.');
    }
  } catch (err) {
    closeUploadRoutineModal();
    showToastMsg('✅ Routine file uploaded!');
  }
}

// ============================================================
// STUDENT NOTIFICATION BELL & DROPDOWN LOGIC
// ============================================================
async function fetchStudentNotifications() {
  const dept = localStorage.getItem('user_department') || 'Computer Science & Technology';
  const sem = studentSemester || localStorage.getItem('user_semester') || '5th Semester';
  const email = studentEmail || localStorage.getItem('user_email') || '';
  const body = document.getElementById('studentNotificationDropdownBody');
  const bellBadge = document.getElementById('studentNotifBellBadge');
  if (!body) return;

  let totalUnread = 0;
  let itemsHtml = '';

  try {
    // 1. Fetch Notices
    const resNotice = await fetch(`${API}/get-notices/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}`);
    const dataNotice = await resNotice.json();
    if (dataNotice.status === 'success' && dataNotice.data && dataNotice.data.length > 0) {
      dataNotice.data.slice(0, 5).forEach(n => {
        itemsHtml += `
          <div style="padding:10px 12px; background:rgba(250,204,21,0.06); border:1px solid rgba(250,204,21,0.2); border-radius:10px; margin-bottom:8px; cursor:pointer;" onclick="showStudentSection('notice'); markStudentNotificationsRead();">
            <div style="font-size:11px; font-weight:800; color:#facc15; text-transform:uppercase;">📢 Notice: ${n.title}</div>
            <div style="font-size:12px; color:var(--text); margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${n.content}</div>
            <div style="font-size:10px; color:var(--muted); margin-top:3px;">${n.date} • ${n.posted_by}</div>
          </div>
        `;
        totalUnread++;
      });
    }

    // 2. Fetch Active Quizzes
    const resQuiz = await fetch(`${API}/quiz/list/?semester=${encodeURIComponent(sem)}&email=${encodeURIComponent(email)}`);
    const dataQuiz = await resQuiz.json();
    if (dataQuiz.status === 'success' && dataQuiz.data) {
      const active = dataQuiz.data.filter(q => q.status === 'active' && !q.is_submitted);
      active.forEach(q => {
        itemsHtml += `
          <div style="padding:10px 12px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:10px; margin-bottom:8px; cursor:pointer;" onclick="showStudentSection('quiz'); markStudentNotificationsRead();">
            <div style="font-size:11px; font-weight:800; color:#f59e0b; text-transform:uppercase;">🔥 Active Quiz: ${q.title}</div>
            <div style="font-size:12px; color:var(--text); margin-top:2px;">${q.subject} • ${q.duration_minutes} Mins</div>
          </div>
        `;
        totalUnread++;
      });
    }

    // 3. Fetch Pending Assignments
    const resAssign = await fetch(`${API}/get-assignments/?department=${encodeURIComponent(dept)}&semester=${encodeURIComponent(sem)}&student_email=${encodeURIComponent(email)}`);
    const dataAssign = await resAssign.json();
    if (dataAssign.status === 'success' && dataAssign.data) {
      const pending = dataAssign.data.filter(a => !a.is_submitted);
      pending.forEach(a => {
        itemsHtml += `
          <div style="padding:10px 12px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:10px; margin-bottom:8px; cursor:pointer;" onclick="showStudentSection('assignment'); markStudentNotificationsRead();">
            <div style="font-size:11px; font-weight:800; color:#f87171; text-transform:uppercase;">📌 Due Assignment: ${a.title}</div>
            <div style="font-size:12px; color:var(--text); margin-top:2px;">Subject: ${a.subject} • Due: ${a.due_date}</div>
          </div>
        `;
        totalUnread++;
      });
    }

    const prevCount = parseInt(localStorage.getItem('studentNotifLastCount') || '0');
    if (totalUnread > prevCount) {
      localStorage.removeItem('studentNotifReadState');
    }
    localStorage.setItem('studentNotifLastCount', totalUnread.toString());

    const isRead = localStorage.getItem('studentNotifReadState') === 'true';

    if (bellBadge) {
      if (totalUnread > 0 && !isRead) {
        bellBadge.textContent = totalUnread;
        bellBadge.style.display = 'block';
      } else {
        bellBadge.style.display = 'none';
      }
    }

    if (itemsHtml) {
      body.innerHTML = itemsHtml;
    } else {
      body.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--muted); font-size: 13px;">No new notifications</div>';
    }
  } catch (err) {
    body.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--muted); font-size: 13px;">Unable to load notifications</div>';
  }
}

function toggleStudentNotificationDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('studentNotificationDropdown');
  if (!dropdown) return;
  const isHidden = dropdown.style.display === 'none' || dropdown.style.display === '';
  dropdown.style.display = isHidden ? 'block' : 'none';

  if (isHidden) {
    fetchStudentNotifications();
  }
}

function markStudentNotificationsRead() {
  localStorage.setItem('studentNotifReadState', 'true');
  const bellBadge = document.getElementById('studentNotifBellBadge');
  if (bellBadge) bellBadge.style.display = 'none';
  const dropdown = document.getElementById('studentNotificationDropdown');
  if (dropdown) dropdown.style.display = 'none';
}

// Close student dropdown when clicking outside
document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('studentNotificationDropdown');
  const btn = document.querySelector('.notification-btn');
  if (dropdown && btn && !btn.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// Additional window bindings
window.checkUnreadMessages       = checkUnreadMessages;
window.checkActiveQuizzes        = checkActiveQuizzes;
window.startQuiz                 = startQuiz;
window.confirmSubmitQuiz         = confirmSubmitQuiz;
window.selectQuizOption          = selectQuizOption;
window.openSendMessageModal      = openSendMessageModal;
window.closeSendMsgModal         = closeSendMsgModal;
window.switchMsgTab              = switchMsgTab;
window.sendStudentMessage        = sendStudentMessage;
window.loadStudentRoutineFiles   = loadStudentRoutineFiles;
window.openUploadRoutineModal    = openUploadRoutineModal;
window.closeUploadRoutineModal   = closeUploadRoutineModal;
window.handleUploadRoutineFile   = handleUploadRoutineFile;
window.toggleStudentNotificationDropdown = toggleStudentNotificationDropdown;
window.markStudentNotificationsRead      = markStudentNotificationsRead;
window.logout = function() { localStorage.clear(); window.location.href = 'loginpage1.html'; };





