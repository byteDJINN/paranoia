import { generateUserId } from "$lib/server/questions";


export async function GET({ request, platform }) { 
  return new Response(JSON.stringify({ userId: generateUserId() }));
}