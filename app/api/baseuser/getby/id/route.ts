import prisma from '../../../../../utils/connect'


export async function GET(req: Request) {
 
 const body = await req.json()

 const {baseUserId}= body

 try {

  if (!baseUserId) {
   return new Response(JSON.stringify("no baseUserId!"),{
    status: 500,
    headers:{"Content-Type":"application/json"}
  })
  }

  const baseUserDetails = await prisma.baseUsers.findFirst({
   where: {
    base:baseUserId
   }
  })

  return new Response(JSON.stringify(baseUserDetails),
   {
    status: 200,
    headers:{"Content-type":"application/json"}
   }
  )
  
  
 } catch (e) {
  return new Response(JSON.stringify({ error: "error at getting baseuser", details: e }),
   {
    status: 500,
    headers:{"Content-Type":"application/json"}
  }
  )
 }
}