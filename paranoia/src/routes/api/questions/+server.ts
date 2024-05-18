import type { RequestHandler } from "@sveltejs/kit";
import { getQuestions, addQuestion } from "$lib/server/questions";


export async function GET({ request, platform }) {
    let questions = await getQuestions();
    return new Response(JSON.stringify(questions));
}

export async function POST({ request, platform }) {
    let data = await request.json();
    data.text = data.text.toLowerCase();
    data.text = data.text.replace(/[^a-z0-9 ]/g, '');
    data.text = data.text.trim();
    if (data.text.length < 1) {
        return new Response(JSON.stringify({ error: "Question must be at least 1 character" }), { status: 400 });
    }
    // check if it already exists
    let questions = await getQuestions();
    if (questions.includes(data.text)) {
        return new Response(JSON.stringify({ error: "Question already exists" }), { status: 400 });
    }
    await addQuestion(data.text);
    return new Response(JSON.stringify({ success: true }));
}