import { Broadcaster } from './broadcaster';

const maxQuestions = 10;
// the voteDuration should also be the polling interval in the client
const voteDuration = 30 * 1000; // 10 seconds

interface QuestionData {
  text: string;
  votes: number;
  timestamp: number;
}

interface Vote {
  questions: string[];
  timestamp: number;
}

// In-memory storage for questions
let questions: { [key: string]: QuestionData } = {};

// Queue to store vote records
let votes: { [key: number]: Vote } = {};

export const changeBroadcaster: Broadcaster = new Broadcaster();

export function getQuestions() {
  return {questions: questions, votes: votes};
}

export function addQuestion(question: string) {
  questions[question] = {
    text: question,
    votes: 0,
    timestamp: Date.now(),
  };
  checkQuestions();
  changeBroadcaster.broadcast();
}

export function existsQuestion(question: string) {
  return question in questions;
}

function checkQuestions() {
  if (Object.keys(questions).length > maxQuestions) {
    // Find the oldest question with the least votes
    let oldestQuestion: string | null = null;
    let minVotes = Infinity;
    let oldestTimestamp = Infinity;

    for (const question in questions) {
      const data = questions[question];
      if (data.votes < minVotes || (data.votes === minVotes && data.timestamp < oldestTimestamp)) {
        oldestQuestion = question;
        minVotes = data.votes;
        oldestTimestamp = data.timestamp;
      }
    }

    // Delete the found question
    if (oldestQuestion !== null) {
      delete questions[oldestQuestion];
    }
  }
}

function checkVotes() {
  const now = Date.now();
  for (const userId in votes) {
    if (!changeBroadcaster.getWaitingUsers().includes(parseInt(userId))) {
      votes[userId].questions.forEach((question) => {
        if (existsQuestion(question)) {
          questions[question].votes -= 1;
        }
      });
      delete votes[userId];
    }
  }
}

export function processVotes(userId: number, newVotes: string[]) {

  if (!(userId in votes)) {
    votes[userId] = {
      questions: [],
      timestamp: Date.now(),
    };
  }

  votes[userId].questions.forEach((question) => {
    if (existsQuestion(question)) {
      questions[question].votes -= 1;
    }
  });

  votes[userId] = {
    questions: newVotes,
    timestamp: Date.now(),
  };

  votes[userId].questions.forEach((question) => {
    if (existsQuestion(question)) {
      questions[question].votes += 1;
    }
  });
  checkVotes();
  changeBroadcaster.broadcast();
}

export function generateUserId() {
  let userId = Math.floor(Math.random() * 1000000);
  for (let i = 0; i < 10; i++) {
    if (userId in votes) {
      userId = Math.floor(Math.random() * 1000000);
    }
  }
  if (userId in votes) {
    return null;
  }
  return userId; 
}
