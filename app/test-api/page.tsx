'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/apiClient'

export default function TestAPIPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }])
  }

  const clearResults = () => setResults([])

  const testBaseUser = async () => {
    setLoading(true)
    try {
      // Test creating a user
      const createResult = await apiClient.baseUser.create({
        walletAddress: `0x${Math.random().toString(36).substring(2, 15)}`,
        username: `testuser_${Date.now()}`,
        bio: 'Test user created via API'
      })
      addResult('Create BaseUser', createResult)

      if (createResult.success) {
        const userId = createResult.data.id
        
        // Test getting user by ID
        const getResult = await apiClient.baseUser.getById(userId)
        addResult('Get BaseUser by ID', getResult)

        // Test updating user
        const updateResult = await apiClient.baseUser.update(userId, {
          bio: 'Updated bio via API test'
        })
        addResult('Update BaseUser', updateResult)

        // Test getting all users
        const getAllResult = await apiClient.baseUser.getAll()
        addResult('Get All BaseUsers', getAllResult)
      }
    } catch (error) {
      addResult('BaseUser Test Error', { error: error.message })
    }
    setLoading(false)
  }

  const testJournal = async () => {
    setLoading(true)
    try {
      // First create a user to use
      const userResult = await apiClient.baseUser.create({
        walletAddress: `0x${Math.random().toString(36).substring(2, 15)}`,
        username: `journaluser_${Date.now()}`
      })

      if (userResult.success) {
        const userId = userResult.data.id

        // Test creating a journal
        const createResult = await apiClient.journal.create({
          baseUserId: userId,
          journal: 'This is a test journal entry created via API',
          tags: ['test', 'api'],
          privacy: 'public'
        })
        addResult('Create Journal', createResult)

        if (createResult.success) {
          const journalId = createResult.data.id

          // Test getting journal by ID
          const getResult = await apiClient.journal.getById(journalId)
          addResult('Get Journal by ID', getResult)

          // Test updating journal
          const updateResult = await apiClient.journal.update(journalId, {
            journal: 'Updated journal content via API test',
            tags: ['test', 'api', 'updated']
          })
          addResult('Update Journal', updateResult)

          // Test getting all journals
          const getAllResult = await apiClient.journal.getAll()
          addResult('Get All Journals', getAllResult)
        }
      }
    } catch (error) {
      addResult('Journal Test Error', { error: error.message })
    }
    setLoading(false)
  }

  const testComment = async () => {
    setLoading(true)
    try {
      // Create user and journal first
      const userResult = await apiClient.baseUser.create({
        walletAddress: `0x${Math.random().toString(36).substring(2, 15)}`,
        username: `commentuser_${Date.now()}`
      })

      if (userResult.success) {
        const userId = userResult.data.id

        const journalResult = await apiClient.journal.create({
          baseUserId: userId,
          journal: 'Test journal for comments'
        })

        if (journalResult.success) {
          const journalId = journalResult.data.id

          // Test creating a comment
          const createResult = await apiClient.comment.create({
            baseUserId: userId,
            journalId: journalId,
            comment: 'This is a test comment created via API'
          })
          addResult('Create Comment', createResult)

          if (createResult.success) {
            const commentId = createResult.data.id

            // Test getting comment by ID
            const getResult = await apiClient.comment.getById(commentId)
            addResult('Get Comment by ID', getResult)

            // Test updating comment
            const updateResult = await apiClient.comment.update(commentId, {
              comment: 'Updated comment via API test'
            })
            addResult('Update Comment', updateResult)

            // Test getting all comments
            const getAllResult = await apiClient.comment.getAll()
            addResult('Get All Comments', getAllResult)
          }
        }
      }
    } catch (error) {
      addResult('Comment Test Error', { error: error.message })
    }
    setLoading(false)
  }

  const testRepost = async () => {
    setLoading(true)
    try {
      // Create user and journal first
      const userResult = await apiClient.baseUser.create({
        walletAddress: `0x${Math.random().toString(36).substring(2, 15)}`,
        username: `repostuser_${Date.now()}`
      })

      if (userResult.success) {
        const userId = userResult.data.id

        const journalResult = await apiClient.journal.create({
          baseUserId: userId,
          journal: 'Test journal for reposts'
        })

        if (journalResult.success) {
          const journalId = journalResult.data.id

          // Test creating a repost
          const createResult = await apiClient.repost.create({
            baseUserId: userId,
            journalId: journalId
          })
          addResult('Create Repost', createResult)

          if (createResult.success) {
            const repostId = createResult.data.id

            // Test getting repost by ID
            const getResult = await apiClient.repost.getById(repostId)
            addResult('Get Repost by ID', getResult)

            // Test getting all reposts
            const getAllResult = await apiClient.repost.getAll()
            addResult('Get All Reposts', getAllResult)
          }
        }
      }
    } catch (error) {
      addResult('Repost Test Error', { error: error.message })
    }
    setLoading(false)
  }

  const testChainComment = async () => {
    setLoading(true)
    try {
      // Create user, journal, and comment first
      const userResult = await apiClient.baseUser.create({
        walletAddress: `0x${Math.random().toString(36).substring(2, 15)}`,
        username: `chainuser_${Date.now()}`
      })

      if (userResult.success) {
        const userId = userResult.data.id

        const journalResult = await apiClient.journal.create({
          baseUserId: userId,
          journal: 'Test journal for chain comments'
        })

        if (journalResult.success) {
          const journalId = journalResult.data.id

          const commentResult = await apiClient.comment.create({
            baseUserId: userId,
            journalId: journalId,
            comment: 'Test comment for chain comments'
          })

          if (commentResult.success) {
            const commentId = commentResult.data.id

            // Test creating a chain comment
            const createResult = await apiClient.chainComment.create({
              baseUserId: userId,
              commentId: commentId,
              chainComment: 'This is a test chain comment created via API'
            })
            addResult('Create ChainComment', createResult)

            if (createResult.success) {
              const chainCommentId = createResult.data.id

              // Test getting chain comment by ID
              const getResult = await apiClient.chainComment.getById(chainCommentId)
              addResult('Get ChainComment by ID', getResult)

              // Test updating chain comment
              const updateResult = await apiClient.chainComment.update(chainCommentId, {
                chainComment: 'Updated chain comment via API test'
              })
              addResult('Update ChainComment', updateResult)

              // Test getting all chain comments
              const getAllResult = await apiClient.chainComment.getAll()
              addResult('Get All ChainComments', getAllResult)
            }
          }
        }
      }
    } catch (error) {
      addResult('ChainComment Test Error', { error: error.message })
    }
    setLoading(false)
  }

  const runAllTests = async () => {
    setLoading(true)
    clearResults()
    
    await testBaseUser()
    await testJournal()
    await testComment()
    await testRepost()
    await testChainComment()
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Testing Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testBaseUser}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            Test BaseUser API
          </button>
          
          <button
            onClick={testJournal}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            Test Journal API
          </button>
          
          <button
            onClick={testComment}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            Test Comment API
          </button>
          
          <button
            onClick={testRepost}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            Test Repost API
          </button>
          
          <button
            onClick={testChainComment}
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            Test ChainComment API
          </button>
          
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded"
          >
            Run All Tests
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          <button
            onClick={clearResults}
            className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm"
          >
            Clear Results
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="mt-2">Running tests...</p>
          </div>
        )}

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-blue-400">{result.test}</h3>
                <span className="text-xs text-gray-400">{result.timestamp}</span>
              </div>
              <pre className="text-sm bg-gray-900 p-3 rounded overflow-x-auto">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">
            No test results yet. Click a test button to start testing the APIs.
          </div>
        )}
      </div>
    </div>
  )
}
