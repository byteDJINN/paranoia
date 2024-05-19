import { changeBroadcaster } from "$lib/server/questions";

export async function GET({ request, platform }) {
  return new Response(JSON.stringify({ count: changeBroadcaster.getWaitingUsers().filter((v, i, a) => a.indexOf(v) === i).length }));
}