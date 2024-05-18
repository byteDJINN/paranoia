
// in-memory storage for questions
let questions: string[] = [];

export async function getQuestions() {
    return questions;
}

export async function addQuestion(question: string) {
    questions.push(question);
}