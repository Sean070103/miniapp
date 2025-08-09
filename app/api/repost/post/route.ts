
import prisma from '../../../../utils/connect'

//POST JOURNAL
export async function POST(req:Request) {
 
 const body = await req.json()

 const {
 journalId,
 BaseUserId 
 } = body

 try {
  if (!BaseUserId|| !journalId) {
   return new Response(
    JSON.stringify({ error: "please input a journalId or BaseUserId", }),
    { status: 500, headers: { "Content-Type": "application/json" } }
   )
  }

  const createJournal = await prisma.repost.create({

   data: {
    journalId,
    BaseUserId  
   }
  })
  

  return new Response(JSON.stringify(createJournal), {
     status:201,
     headers: {"Content-Type": "application/json"},
  })

  
 } catch (e) {
  return new Response(
   JSON.stringify({
    error: "error at",
    details: e
   }),
   {
    status: 500,
    headers:{"Content-Type":"application/json"},
   }
  )
 }

}