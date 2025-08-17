import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('csvFile') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No CSV file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Please upload a CSV file' },
        { status: 400 }
      )
    }

    const fileBuffer = await file.arrayBuffer()
    const fileContent = new TextDecoder().decode(fileBuffer)
    
    // Simple CSV parsing (you can use a library like csv-parse for more robust parsing)
    const lines = fileContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    const records = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const record: any = {}
      headers.forEach((header, index) => {
        record[header] = values[index] || ''
      })
      return record
    })

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no valid data' },
        { status: 400 }
      )
    }

    // Determine upload type and process
    const uploadType = determineUploadType(headers)
    const results = await processUpload(uploadType, records)

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${results.length} records`,
      uploadType,
      data: results
    })

  } catch (error) {
    console.error('CSV upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    )
  }
}

function determineUploadType(headers: string[]): string {
  if (headers.includes('walletAddress')) {
    return 'users'
  } else if (headers.includes('baseUserId') && headers.includes('journal')) {
    return 'journals'
  } else if (headers.includes('baseUserId') && headers.includes('journalId') && headers.includes('comment')) {
    return 'comments'
  }
  return 'unknown'
}

async function processUpload(uploadType: string, records: any[]) {
  switch (uploadType) {
    case 'users':
      return await uploadUsers(records)
    case 'journals':
      return await uploadJournals(records)
    case 'comments':
      return await uploadComments(records)
    default:
      throw new Error('Unsupported upload type')
  }
}

async function uploadUsers(records: any[]) {
  const results = []
  for (const record of records) {
    try {
      const user = await prisma.baseUser.create({
        data: {
          walletAddress: record.walletAddress,
          username: record.username || null,
          email: record.email || null,
          profilePicture: record.profilePicture || null,
          bio: record.bio || null
        }
      })
      results.push(user)
    } catch (error: any) {
      console.error('Error creating user:', error)
      results.push({ error: `Failed to create user ${record.walletAddress}: ${error?.message || 'Unknown error'}` })
    }
  }
  return results
}

async function uploadJournals(records: any[]) {
  const results = []
  for (const record of records) {
    try {
      const journal = await prisma.journal.create({
        data: {
          baseUserId: record.baseUserId,
          journal: record.journal,
          privacy: record.privacy || 'public',
          photos: record.photo || null,
          likes: parseInt(record.likes) || 0,
          tags: record.tags ? record.tags.split(',').map((tag: string) => tag.trim()) : []
        }
      })
      results.push(journal)
    } catch (error: any) {
      console.error('Error creating journal:', error)
      results.push({ error: `Failed to create journal for user ${record.baseUserId}: ${error?.message || 'Unknown error'}` })
    }
  }
  return results
}

async function uploadComments(records: any[]) {
  const results = []
  for (const record of records) {
    try {
      const comment = await prisma.comment.create({
        data: {
          baseUserId: record.baseUserId,
          journalId: record.journalId,
          comment: record.comment
        }
      })
      results.push(comment)
    } catch (error: any) {
      console.error('Error creating comment:', error)
      results.push({ error: `Failed to create comment for journal ${record.journalId}: ${error?.message || 'Unknown error'}` })
    }
  }
  return results
}
