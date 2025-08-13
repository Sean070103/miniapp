
import prisma from '../../../../utils/connect'

//POST comment
export async function POST(req:Request) {
 
 const body = await req.json()

 const {
 baseUserId,
 journalId,  
 comment,    
 } = body

 try {
  if (!baseUserId || !journalId) {
   return new Response(
    JSON.stringify({ error: "please input a journalId and baseUserId", }),
    { status: 500, headers: { "Content-Type": "application/json" } }
   )
  }

  const createComment  = await prisma.comment.create({
   data: {
     baseUserId,
     journalId,  
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