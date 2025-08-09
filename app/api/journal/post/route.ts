
import prisma from '../../../../utils/connect'


export async function POST(req:Request) {
 
 const body = await req.json()

 const {
    photo,      
    journal,    
    likes, 
    tags,
    privacy,    
 } = body

 try {
  if (!journal|| !privacy) {
   return new Response(
    JSON.stringify({ error: "please input a journal or privacy", }),
    { status: 500, headers: { "Content-Type": "application/json" } }
   )
  }

  const createJournal = await prisma.journal.create({

   data: {
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