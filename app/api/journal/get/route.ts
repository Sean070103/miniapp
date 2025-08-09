import prisma from '../../../../utils/connect'

export async function GET() {
  try {
    const allJournal = await prisma.Journal.findMany();

    return new Response(
      JSON.stringify(allJournal),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (e) {
    console.log(`Error at GET /Journal`, e);
    return new Response(
      JSON.stringify({ error: "Failed to get letterOrder", details: e }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}