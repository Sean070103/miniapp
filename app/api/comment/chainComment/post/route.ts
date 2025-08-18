
import prisma from '../../../../../utils/connect'

//POST comment
export async function POST(req:Request) {
 
 const body = await req.json()

 const {
 commentId,
 baseUserId,  
 chainComment,    
 } = body

 try {
  if (!baseUserId || !commentId) {
   return new Response(
    JSON.stringify({ error: "please input a baseUserId and commentId", }),
    { status: 500, headers: { "Content-Type": "application/json" } }
   )
  }

  const createChainComment  = await prisma.chaincomments.create({
   data: {
    commentId,
    baseUserId,  
    chainComment, 
   }
  })
  

  return new Response(JSON.stringify(createChainComment), {
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