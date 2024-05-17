import type { RequestHandler } from "@sveltejs/kit";


/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ request, platform }) {
    console.log(platform);
    let result = await platform.env.PARANOIA_DB.prepare(
        "SELECT * FROM questions"
    ).run();
    return new Response(JSON.stringify(result));
}

export async function POST({ request, platform }) {
    const data = await request.json();
    let result = await platform.env.PARANOIA_DB.prepare(
        "INSERT INTO questions (question) VALUES (?)"
    ).run(data.text);
    return new Response(JSON.stringify(result));
}