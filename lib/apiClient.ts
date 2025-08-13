// API Client helper functions for all models
// Each model has .getAll(), .getById(id), .create(data), .update(id, data), .delete(id) methods

// BaseUser API Client
export const baseUserAPI = {
  async getAll() {
    const response = await fetch('/api/baseuser')
    return response.json()
  },

  async getById(id: string) {
    const response = await fetch(`/api/baseuser?id=${id}`)
    return response.json()
  },

  async create(data: {
    walletAddress: string
    username?: string
    email?: string
    profilePicture?: string
    bio?: string
  }) {
    const response = await fetch('/api/baseuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async update(id: string, data: {
    username?: string
    email?: string
    profilePicture?: string
    bio?: string
  }) {
    const response = await fetch(`/api/baseuser?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async delete(id: string) {
    const response = await fetch(`/api/baseuser?id=${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}

// Journal API Client
export const journalAPI = {
  async getAll() {
    const response = await fetch('/api/journal')
    return response.json()
  },

  async getById(id: string) {
    const response = await fetch(`/api/journal?id=${id}`)
    return response.json()
  },

  async create(data: {
    baseUserId: string
    journal: string
    photo?: string
    tags?: string[]
    privacy?: 'public' | 'private' | 'friends'
  }) {
    const response = await fetch('/api/journal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async update(id: string, data: {
    journal?: string
    photo?: string
    tags?: string[]
    privacy?: 'public' | 'private' | 'friends'
  }) {
    const response = await fetch(`/api/journal?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async delete(id: string) {
    const response = await fetch(`/api/journal?id=${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}

// Repost API Client
export const repostAPI = {
  async getAll() {
    const response = await fetch('/api/repost')
    return response.json()
  },

  async getById(id: string) {
    const response = await fetch(`/api/repost?id=${id}`)
    return response.json()
  },

  async create(data: {
    baseUserId: string
    journalId: string
  }) {
    const response = await fetch('/api/repost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async update(id: string, data: {
    baseUserId?: string
    journalId?: string
  }) {
    const response = await fetch(`/api/repost?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async delete(id: string) {
    const response = await fetch(`/api/repost?id=${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}

// Comment API Client
export const commentAPI = {
  async getAll() {
    const response = await fetch('/api/comment')
    return response.json()
  },

  async getById(id: string) {
    const response = await fetch(`/api/comment?id=${id}`)
    return response.json()
  },

  async create(data: {
    baseUserId: string
    journalId: string
    comment: string
  }) {
    const response = await fetch('/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async update(id: string, data: {
    comment: string
  }) {
    const response = await fetch(`/api/comment?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async delete(id: string) {
    const response = await fetch(`/api/comment?id=${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}

// ChainComment API Client
export const chainCommentAPI = {
  async getAll() {
    const response = await fetch('/api/chaincomment')
    return response.json()
  },

  async getById(id: string) {
    const response = await fetch(`/api/chaincomment?id=${id}`)
    return response.json()
  },

  async create(data: {
    baseUserId: string
    commentId: string
    chainComment: string
  }) {
    const response = await fetch('/api/chaincomment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async update(id: string, data: {
    chainComment: string
  }) {
    const response = await fetch(`/api/chaincomment?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async delete(id: string) {
    const response = await fetch(`/api/chaincomment?id=${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}

// Export all API clients as a single object
export const apiClient = {
  baseUser: baseUserAPI,
  journal: journalAPI,
  repost: repostAPI,
  comment: commentAPI,
  chainComment: chainCommentAPI,
}
