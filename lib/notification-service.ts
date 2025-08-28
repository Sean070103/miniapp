// Simple Notification Service
// Utility functions for creating notifications from various actions

import { SimpleNotification, createNotificationMessage } from './simple-notifications'

export interface CreateNotificationParams {
  type: SimpleNotification['type']
  senderId?: string
  receiverId: string
  postId?: string
  senderName?: string
  postContent?: string
  data?: any
}

export class NotificationService {
  // Create a notification and save it to the database
  static async createNotification(params: CreateNotificationParams): Promise<SimpleNotification | null> {
    try {
      const { type, senderId, receiverId, postId, senderName, postContent, data } = params

      // Don't create notification if sender and receiver are the same
      if (senderId && senderId === receiverId) {
        return null
      }

      const title = this.getNotificationTitle(type)
      const message = createNotificationMessage(type, senderName || 'Someone', postContent)

      const response = await fetch('/api/simple-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title,
          message,
          senderId,
          receiverId,
          postId,
          data
        }),
      })

      if (response.ok) {
        const result = await response.json()
        return result.notification
      }

      console.error('Failed to create notification:', response.statusText)
      return null
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  }

  // Create like notification
  static async createLikeNotification(
    senderId: string,
    receiverId: string,
    postId: string,
    senderName?: string
  ) {
    return this.createNotification({
      type: 'like',
      senderId,
      receiverId,
      postId,
      senderName
    })
  }

  // Create comment notification
  static async createCommentNotification(
    senderId: string,
    receiverId: string,
    postId: string,
    senderName?: string
  ) {
    return this.createNotification({
      type: 'comment',
      senderId,
      receiverId,
      postId,
      senderName
    })
  }

  // Create repost notification
  static async createRepostNotification(
    senderId: string,
    receiverId: string,
    postId: string,
    senderName?: string
  ) {
    return this.createNotification({
      type: 'repost',
      senderId,
      receiverId,
      postId,
      senderName
    })
  }

  // Create follow notification
  static async createFollowNotification(
    senderId: string,
    receiverId: string,
    senderName?: string
  ) {
    return this.createNotification({
      type: 'follow',
      senderId,
      receiverId,
      senderName
    })
  }

  // Create mention notification
  static async createMentionNotification(
    senderId: string,
    receiverId: string,
    postId: string,
    senderName?: string,
    postContent?: string
  ) {
    return this.createNotification({
      type: 'mention',
      senderId,
      receiverId,
      postId,
      senderName,
      postContent
    })
  }

  // Create system notification
  static async createSystemNotification(
    receiverId: string,
    title: string,
    message: string,
    data?: any
  ) {
    return this.createNotification({
      type: 'system',
      receiverId,
      data: { title, message, ...data }
    })
  }

  // Get notification title based on type
  private static getNotificationTitle(type: SimpleNotification['type']): string {
    switch (type) {
      case 'like':
        return 'New Like'
      case 'comment':
        return 'New Comment'
      case 'repost':
        return 'New Repost'
      case 'follow':
        return 'New Follower'
      case 'mention':
        return 'Mentioned You'
      case 'system':
        return 'System Notice'
      default:
        return 'New Notification'
    }
  }

  // Batch create notifications (useful for system-wide notifications)
  static async createBatchNotifications(
    receiverIds: string[],
    params: Omit<CreateNotificationParams, 'receiverId'>
  ) {
    const promises = receiverIds.map(receiverId =>
      this.createNotification({ ...params, receiverId })
    )
    
    return Promise.allSettled(promises)
  }
}
