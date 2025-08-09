import prisma from '../../../../../utils/connect';


// get post bu baseUserId
export async function POST(req: Request) {
  const body = await req.json();
  const { commentId } = body;

  if (!commentId) {
    return new Response(JSON.stringify({ error: "Missing commentId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
   const chainCommentUser = await prisma.chaincomments.findMany({
     where: { commentId: commentId },
   });


    return new Response(JSON.stringify(chainCommentUser), {
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
