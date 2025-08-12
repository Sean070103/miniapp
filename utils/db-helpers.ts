import prisma from './connect'

// Helper function to handle database errors
export const handleDbError = (error: unknown) => {
  console.error('Database error:', error)
  
  if (error instanceof Error) {
    return {
      error: true,
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
  
  return {
    error: true,
    message: 'An unknown database error occurred'
  }
}

// Helper function to validate required fields
export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]) => {
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    return {
      error: true,
      message: `Missing required fields: ${missingFields.join(', ')}`
    }
  }
  
  return { error: false }
}

// Helper function to create a user
export const createUser = async (userData: {
  baseUserId: string
  bio?: string
  profile?: string
}) => {
  try {
    const validation = validateRequiredFields(userData, ['baseUserId'])
    if (validation.error) {
      return validation
    }

    const user = await prisma.baseUsers.create({
      data: userData
    })

    return { error: false, data: user }
  } catch (error) {
    return handleDbError(error)
  }
}

// Helper function to create a journal
export const createJournal = async (journalData: {
  baseUserId: string
  journal: string
  privacy: string
  photo?: string
  likes?: number
  tags?: string[]
}) => {
  try {
    const validation = validateRequiredFields(journalData, ['baseUserId', 'journal', 'privacy'])
    if (validation.error) {
      return validation
    }

    const journal = await prisma.journal.create({
      data: journalData
    })

    return { error: false, data: journal }
  } catch (error) {
    return handleDbError(error)
  }
}

// Helper function to create a comment
export const createComment = async (commentData: {
  baseUserId: string
  journalId: string
  comment: string
}) => {
  try {
    const validation = validateRequiredFields(commentData, ['baseUserId', 'journalId', 'comment'])
    if (validation.error) {
      return validation
    }

    const comment = await prisma.comment.create({
      data: commentData
    })

    return { error: false, data: comment }
  } catch (error) {
    return handleDbError(error)
  }
}

// Helper function to create a repost
export const createRepost = async (repostData: {
  baseUserId: string
  journalId: string
}) => {
  try {
    const validation = validateRequiredFields(repostData, ['baseUserId', 'journalId'])
    if (validation.error) {
      return validation
    }

    const repost = await prisma.repost.create({
      data: repostData
    })

    return { error: false, data: repost }
  } catch (error) {
    return handleDbError(error)
  }
}

// Helper function to create a chain comment
export const createChainComment = async (chainCommentData: {
  baseUserId: string
  commentId: string
  comment: string
}) => {
  try {
    const validation = validateRequiredFields(chainCommentData, ['baseUserId', 'commentId', 'comment'])
    if (validation.error) {
      return validation
    }

    const chainComment = await prisma.chaincomments.create({
      data: chainCommentData
    })

    return { error: false, data: chainComment }
  } catch (error) {
    return handleDbError(error)
  }
}
