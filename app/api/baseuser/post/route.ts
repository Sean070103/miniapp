
import prisma from '../../../../utils/connect'


export async function POST(req:Request) {
 
 const body = await req.json()

 const {
  base,
  Bio,
  profile,
 } = body

 try {
  if (!base) {
   return new Response(
    JSON.stringify({ error: "please input a baseId", }),
    { status: 500, headers: { "Content-Type": "application/json" } }
   )
  }

  const createUser = await prisma.baseUsers.create({

   data: {
     base,
     Bio,
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