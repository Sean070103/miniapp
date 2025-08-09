
import prisma from '../../../../../utils/connect'

//POST comment
export async function POST(req:Request) {
 
 const body = await req.json()

 const {
 commentId,
 BaseUserId,  
 comment,    
 } = body

 try {
  if (!BaseUserId|| !commentId) {
   return new Response(
    JSON.stringify({ error: "please input a BaseUserId or commentId", }),
    { status: 500, headers: { "Content-Type": "application/json" } }
   )
  }

  const createChainComment  = await prisma.chaincomments.create({
   data: {
    commentId,
    BaseUserId,  
    comment, 
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