import { processVotes } from "$lib/server/questions";


export async function POST({ request, platform }) {
  let data = await request.json();
  if (!data.userId) {
    return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
  }
  if (!data.data || !Array.isArray(data.data)) {
    return new Response(JSON.stringify({ error: "Missing data" }), { status: 400 });
  }
  processVotes(data.userId, data.data);
  return new Response(JSON.stringify({ success: true }));
}