import { Biohazard } from 'lucide-react'
import prisma from '../../../../utils/connect'


export async function POST(req:Request) {
 
 const body = await req.json()

 const {
  base,
  Bio,
  profile,
 } = body
 
}