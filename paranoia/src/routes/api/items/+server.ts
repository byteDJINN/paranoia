import type { RequestHandler } from "@sveltejs/kit";


/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ request, platform }) {
    console.log(platform);
    let result = await platform.env.PARANOIA_DB.prepare(
        "SELECT * FROM questions"
    ).run();
    return new Response(JSON.stringify(result));
}