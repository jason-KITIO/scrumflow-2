import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/database'
import { Message, User } from '../types'
import { 
  Send, 
  Search, 
  Plus,
  MessageCircle,
  Users as UsersIcon
} from 'lucide-react'

export default function Messages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadMessages()
    loadUsers()
  }, [user])

  const loadMessages = () => {
    const allMessages = db.getMessages()
    // Filter messages where current user is sender or receiver
    const userMessages = allMessages.filter(msg => 
      msg.senderId === user?.id || msg.receiverId === user?.id
    )
    
    // Add sender and receiver data
    const messagesWithUsers = userMessages.map(message => ({
      ...message,
      sender: db.getUserById(message.senderId),
      receiver: message.receiverId ? db.getUserById(message.receiverId) : undefined
    }))

    setMessages(messagesWithUsers)
  }

  const loadUsers = () => {
    const allUsers = db.getUsers()
    // Filter out current user
    const otherUsers = allUsers.filter(u => u.id !== user?.id)
    setUsers(otherUsers)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser || !user) return

    db.createMessage({
      content: newMessage,
      senderId: user.id,
      receiverId: selectedUser.id,
      isRead: false,
      type: 'private'
    })

    setNewMessage('')
    loadMessages()
  }

  const getConversationMessages = (userId: string) => {
    return messages.filter(msg => 
      (msg.senderId === user?.id && msg.receiverId === userId) ||
      (msg.senderId === userId && msg.receiverId === user?.id)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  const getLastMessage = (userId: string) => {
    const conversationMessages = getConversationMessages(userId)
    return conversationMessages[conversationMessages.length - 1]
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique users who have conversations with current user
  const conversationUsers = users.filter(u => 
    messages.some(msg => 
      (msg.senderId === user?.id && msg.receiverId === u.id) ||
      (msg.senderId === u.id && msg.receiverId === user?.id)
    )
  )

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar - Conversations */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher des utilisateurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Existing conversations */}
          {conversationUsers.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Conversations</h3>
              <div className="space-y-2">
                {conversationUsers.map((conversationUser) => {
                  const lastMessage = getLastMessage(conversationUser.id)
                  return (
                    <button
                      key={conversationUser.id}
                      onClick={() => setSelectedUser(conversationUser)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedUser?.id === conversationUser.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={conversationUser.avatar}
                          alt={conversationUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{conversationUser.name}</p>
                          {lastMessage && (
                            <p className="text-sm text-gray-500 truncate">
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* All users */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Tous les utilisateurs</h3>
            <div className="space-y-2">
              {filteredUsers.map((otherUser) => (
                <button
                  key={otherUser.id}
                  onClick={() => setSelectedUser(otherUser)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedUser?.id === otherUser.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{otherUser.name}</p>
                      <p className="text-sm text-gray-500 truncate capitalize">
                        {otherUser.role.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {selectedUser.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {getConversationMessages(selectedUser.id).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-500">
                Choisissez un utilisateur pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}