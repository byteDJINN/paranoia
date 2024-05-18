import { Broadcaster } from './broadcaster';
import { v4 as uuid } from 'uuid';
import { examples } from '$lib/examples';

const maxQuestions = 100;

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
let votes: { [key: string]: Vote } = {};

// use the $static/examples.txt split one on each line to list
let lastAutoPost = Date.now();
const autoPostInterval = 30000;

setInterval(() => {
  if (Date.now() - lastAutoPost > autoPostInterval) {
    lastAutoPost = Date.now();
    addQuestion(examples[Math.floor(Math.random() * examples.length)]);
  }
}, 10000);

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
  for (const userId in votes) {
    if (!changeBroadcaster.getWaitingUsers().includes(userId)) {
      votes[userId].questions.forEach((question) => {
        if (existsQuestion(question)) {
          questions[question].votes -= 1;
        }
      });
      delete votes[userId];
    }
  }
}

export function processVotes(userId: string, newVotes: string[]) {
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
    } else {
      // Remove the question from the vote if it doesn't exist
      votes[userId].questions = votes[userId].questions.filter((value) => value !== question);
    }
  });

  checkVotes();
  changeBroadcaster.broadcast();
}

export function generateUserId() {
  return uuid();
}
