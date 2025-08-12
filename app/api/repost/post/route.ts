
import prisma from '../../../../utils/connect'

//POST JOURNAL
export async function POST(req:Request) {
 
 const body = await req.json()

 const {
 journalId,
 baseUserId 
 } = body

 try {
  if (!baseUserId || !journalId) {
   return new Response(
    JSON.stringify({ error: "please input a journalId and baseUserId", }),
    { status: 500, headers: { "Content-Type": "application/json" } }
   )
  }

  const createJournal = await prisma.repost.create({

   data: {
    journalId,
    baseUserId  
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