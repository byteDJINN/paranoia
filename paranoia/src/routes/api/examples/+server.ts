/**
 * This file uses the fs module isn't allowed in cloudflare deployment. 
 * So instead, only uncomment this in development to access the output and paste it into the examples.ts file.
 */

// import { readFileSync } from 'fs';
// import { resolve } from 'path';

// export async function GET({ request, platform }) {
//   try {
//     const filePath = resolve('static/examples.txt');
//     const examples = readFileSync(filePath, 'utf-8').split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
//     return new Response(JSON.stringify(examples), { status: 200 });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: error.message }), { status: 500 });
//   } 
// }
