import { changeBroadcaster, getQuestions, addQuestion, existsQuestion } from "$lib/server/questions";


export async function GET({ request, platform }) {
    if (request.url.includes("userId=")) {
        let userId = parseInt(request.url.split("userId=")[1]);
        if (!userId) {
            return new Response(JSON.stringify({ error: "Invalid userId" }), { status: 400 });
        }
        await changeBroadcaster.wait(userId);
    }
    let questions = getQuestions();
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
    let questions = getQuestions();
    if (existsQuestion(data.text)) {
        return new Response(JSON.stringify({ error: "Question already exists" }), { status: 400 });
    }
    addQuestion(data.text);
    return new Response(JSON.stringify({ success: true }));
}