
import prisma from '../../../../utils/connect'

//CREATE BASE ACC( IN APP NOT WEB3)
export async function POST(req:Request) {
 
 const body = await req.json()

 const {
  baseUserId,
  bio,
  profile,
 } = body

 try {
  if (!baseUserId) {
   return new Response(
    JSON.stringify({ error: "please input a baseId", }),
    { status: 500, headers: { "Content-Type": "application/json" } }
   )
  }

  const createUser = await prisma.baseUsers.create({

   data: {
     baseUserId,
     bio,
     profile,
   }
  })
  

  return new Response(JSON.stringify(createUser), {
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