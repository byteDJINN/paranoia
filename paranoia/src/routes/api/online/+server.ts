import { changeBroadcaster } from "$lib/server/questions";
import { error } from "@sveltejs/kit";

export async function GET({ request, platform }) {
  if (request.url.includes("userId=")) {
    let userId = request.url.split("userId=")[1];
    if (!userId) {
      return new Response(JSON.stringify({ error: "Invalid userId" }), { status: 400 });
    }
    return new Response(JSON.stringify({ count: changeBroadcaster.getWaitingUsers().length, online: changeBroadcaster.getWaitingUsers().includes(userId) }));
  }
  return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
}