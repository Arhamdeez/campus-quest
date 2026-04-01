export const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/events', label: 'Events' },
  { to: '/challenges', label: 'Challenges' },
  { to: '/study-groups', label: 'Study Groups' },
  { to: '/quizzes', label: 'Quizzes' },
  { to: '/rewards', label: 'Rewards' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/profile', label: 'Profile' },
]

export const leaderboard = [
  ['Fatima Khan', 312, 15, '6/6', 20],
  ['Ayesha Malik', 245, 12, '4/6', 15],
  ['Hassan Ali', 198, 8, '3/6', 12],
  ['Muhammad Arham Babar', 0, 0, '0/6', 0],
]

export const eventFeed = [
  {
    id: 'ev1',
    title: 'AI Career Fair',
    datetime: 'Mar 28, 11:00 AM',
    location: 'Main Hall',
    points: 120,
    organizer: 'Career Services',
    price: 'Free',
    capacity: 300,
    details: 'Meet recruiters, review resumes, and attend mini sessions for AI/ML roles.',
    ticketUrl: 'https://tickets.campusquest.local/ai-career-fair',
  },
  {
    id: 'ev2',
    title: 'Hack Night',
    datetime: 'Apr 01, 5:30 PM',
    location: 'Innovation Lab',
    points: 150,
    organizer: 'Developer Club',
    price: '$5',
    capacity: 120,
    details: 'Build with teammates, get mentor feedback, and pitch your project.',
    ticketUrl: 'https://tickets.campusquest.local/hack-night',
  },
  {
    id: 'ev3',
    title: 'Volunteer Drive',
    datetime: 'Apr 03, 9:00 AM',
    location: 'Campus Lawn',
    points: 80,
    organizer: 'Community Cell',
    price: 'Free',
    capacity: 200,
    details: 'Join campus cleanup and outreach activities with local organizations.',
    ticketUrl: 'https://tickets.campusquest.local/volunteer-drive',
  },
]

export const initialStudyGroups = [
  {
    id: 'sg1',
    name: 'Data Structures Study Group',
    topic: 'Computer Science',
    schedule: 'Tuesdays 6:00 PM',
    location: 'Library Room 203',
    capacity: 6,
    members: ['Fatima Khan', 'Hassan Ali'],
    messages: [
      { id: 'm1', author: 'Fatima Khan', text: 'Today we will cover graphs and BFS.', time: '6:02 PM' },
      { id: 'm2', author: 'Hassan Ali', text: 'I can bring sample interview questions.', time: '6:06 PM' },
    ],
  },
  {
    id: 'sg2',
    name: 'Calculus Problem Solvers',
    topic: 'Mathematics',
    schedule: 'Thursday 4:00 PM',
    location: 'Study Hall B',
    capacity: 5,
    members: ['Fatima Khan'],
    messages: [
      { id: 'm1', author: 'Fatima Khan', text: 'Let us revise integration by parts first.', time: '4:03 PM' },
    ],
  },
  {
    id: 'sg3',
    name: 'Web Development Workshop',
    topic: 'Computer Science',
    schedule: 'Friday 5:30 PM',
    location: 'Lab 2',
    capacity: 8,
    members: ['Ayesha Malik', 'Hassan Ali', 'Fatima Khan'],
    messages: [{ id: 'm1', author: 'Ayesha Malik', text: 'React routing practice tonight.', time: '5:31 PM' }],
  },
]

export const dummyUsers = [
  {
    id: 'u1',
    name: 'Muhammad Arham Babar',
    email: 'arham@campus.edu',
    role: 'Student',
    points: 0,
  },
  {
    id: 'u2',
    name: 'Fatima Khan',
    email: 'fatima@campus.edu',
    role: 'Student',
    points: 312,
  },
  {
    id: 'u3',
    name: 'Ayesha Malik',
    email: 'ayesha@campus.edu',
    role: 'Student',
    points: 245,
  },
]

export const quizCatalog = [
  {
    id: 'q1',
    title: 'Data Structures Basics',
    description: 'Test your knowledge of fundamentals',
    points: 30,
    duration: '10 min',
    questions: [
      {
        id: 'q1-1',
        topic: 'Arrays',
        question: 'What is the average time complexity for accessing an element by index in an array?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 0,
        explanation: 'Array indexing is direct memory access, so average access is O(1).',
      },
      {
        id: 'q1-2',
        topic: 'Trees',
        question: 'Which traversal visits nodes in sorted order for a BST?',
        options: ['Preorder', 'Postorder', 'Inorder', 'Level order'],
        correctIndex: 2,
        explanation: 'Inorder traversal of a Binary Search Tree returns values in sorted order.',
      },
      {
        id: 'q1-3',
        topic: 'Hashing',
        question: 'What is the primary purpose of a hash function in a hash table?',
        options: ['Sort elements', 'Map keys to bucket indices', 'Compress files', 'Encrypt data'],
        correctIndex: 1,
        explanation: 'Hash functions transform keys into bucket indices for fast lookup.',
      },
    ],
  },
  {
    id: 'q2',
    title: 'Calculus Quick Quiz',
    description: 'Test your understanding of calculus concepts',
    points: 20,
    duration: '5 min',
    questions: [
      {
        id: 'q2-1',
        topic: 'Differentiation',
        question: 'The derivative of x^2 is:',
        options: ['x', '2x', 'x^3', '2'],
        correctIndex: 1,
        explanation: 'By power rule d/dx(x^n) = n*x^(n-1), so derivative is 2x.',
      },
      {
        id: 'q2-2',
        topic: 'Integration',
        question: 'Integral of 2x dx is:',
        options: ['x^2 + C', '2x + C', 'x + C', 'x^3 + C'],
        correctIndex: 0,
        explanation: 'Reverse power rule gives integral of 2x as x^2 + C.',
      },
    ],
  },
  {
    id: 'q3',
    title: 'React Fundamentals',
    description: 'Test your React knowledge',
    points: 35,
    duration: '15 min',
    questions: [
      {
        id: 'q3-1',
        topic: 'Hooks',
        question: 'Which hook is used to manage local component state?',
        options: ['useMemo', 'useEffect', 'useState', 'useRef'],
        correctIndex: 2,
        explanation: 'useState is specifically for stateful values in function components.',
      },
      {
        id: 'q3-2',
        topic: 'Rendering',
        question: 'What helps React identify list items uniquely?',
        options: ['id attribute', 'name prop', 'key prop', 'className'],
        correctIndex: 2,
        explanation: 'React uses the key prop to track list item identity across renders.',
      },
      {
        id: 'q3-3',
        topic: 'Lifecycle',
        question: 'useEffect with an empty dependency array runs:',
        options: ['On every render', 'Only on mount', 'Only on unmount', 'Never'],
        correctIndex: 1,
        explanation: 'Empty dependency array means effect runs once after initial mount.',
      },
    ],
  },
]
