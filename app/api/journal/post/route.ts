
import prisma from '../../../../utils/connect'

//POST JOURNAL
export async function POST(req:Request) {
 
 const body = await req.json()

 const {
    baseUserId,
    photo,      
    journal,    
    likes, 
    tags,
    privacy,    
 } = body

 try {
  if (!journal || !privacy || !baseUserId) {
   return new Response(
    JSON.stringify({ error: "please input journal, privacy, and baseUserId", }),
    { status: 500, headers: { "Content-Type": "application/json" } }
   )
  }

  const createJournal = await prisma.journal.create({

   data: {
    baseUserId,
    photo,      
    journal,    
    likes, 
    tags,
    privacy, 
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