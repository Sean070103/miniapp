import prisma from '../../../../../utils/connect';

//find user by baseUserId
export async function POST(req: Request) {
  const body = await req.json();
  const { baseUserId } = body;

  if (!baseUserId) {
    return new Response(JSON.stringify({ error: "Missing baseUserId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const baseUserDetails = await prisma.baseUsers.findFirst({
      where: { baseUserId: baseUserId },
    });

    if (!baseUserDetails) {
      return new Response(JSON.stringify({ error: "Base user not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(baseUserDetails), {
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
