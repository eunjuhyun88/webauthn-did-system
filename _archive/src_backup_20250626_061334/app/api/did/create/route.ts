
export async function POST(req: Request) {
  return new Response(JSON.stringify({ message: 'DID created' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
