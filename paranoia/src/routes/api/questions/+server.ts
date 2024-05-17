import type { RequestHandler } from "@sveltejs/kit";


/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ request, platform }) {
    let result = await platform.env.PARANOIA_DB.prepare(
        "SELECT * FROM questions"
    ).run();
    return new Response(JSON.stringify(result));
}

export async function POST({ request, platform }) {
    let data = await request.json();
    data.text = data.text.toLowerCase();
    data.text = data.text.replace(/[^a-z0-9 ]/g, '');
    data.text = data.text.trim();
    if (data.text.length < 1) {
        return new Response("Invalid question", { status: 400 });
    }
    // check if it already exists
    let exists = await platform.env.PARANOIA_DB.prepare(
        "SELECT * FROM questions WHERE question = ?"
    ).bind(data.text).run();
    if (exists.results.length > 0) {
        return new Response("Question already exists", { status: 409 });
    }
    let result = await platform.env.PARANOIA_DB.prepare(
        "INSERT INTO questions (question) VALUES (?)"
    ).bind(data.text).run();
    return new Response(JSON.stringify(result));
}