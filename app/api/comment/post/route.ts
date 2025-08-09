
import prisma from '../../../../utils/connect'

//POST comment
export async function POST(req:Request) {
 
 const body = await req.json()

 const {
 BaseUserId,
 JournalId,  
 comment,    
 } = body

 try {
  if (!BaseUserId|| !JournalId) {
   return new Response(
    JSON.stringify({ error: "please input a journalId or BaseUserId", }),
    { status: 500, headers: { "Content-Type": "application/json" } }
   )
  }

  const createComment  = await prisma.comment.create({
   data: {
     BaseUserId,
     JournalId,  
     comment, 
   }
  })
  

  return new Response(JSON.stringify(createComment), {
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