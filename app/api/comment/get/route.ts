import prisma from '../../../../utils/connect';


// get post bu baseUserId
export async function POST(req: Request) {
  const body = await req.json();
  const { journalId } = body;

  if (!journalId) {
    return new Response(JSON.stringify({ error: "Missing journalId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
   const userRepost = await prisma.comment.findMany({
     where: { journalId: journalId },
   });


    return new Response(JSON.stringify(userRepost), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "Error fetching base user",
        details: e instanceof Error ? e.message : String(e),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
