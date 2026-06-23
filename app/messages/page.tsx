'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { motion, AnimatePresence } from 'framer-motion'
import { useRequireAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import { Send, Search, MessageSquare, Loader2, ArrowLeft, User, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const ROLE_COLORS: Record<string, string> = {
  STUDENT: 'from-blue-500 to-blue-600',
  CLIENT: 'from-emerald-500 to-emerald-600',
  RECRUITER: 'from-purple-500 to-purple-600',
  TPO: 'from-amber-500 to-amber-600',
  ADMIN: 'from-red-500 to-red-600',
}

function getInitials(name: string) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function Avatar({ user, size = 'md' }: { user: any, size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  const gradient = ROLE_COLORS[user?.role] || 'from-gray-500 to-gray-600'
  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {user?.avatarUrl
        ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-xl object-cover" />
        : getInitials(user?.name || '?')
      }
    </div>
  )
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function MessagesPage() {
  const { user } = useRequireAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showConvList, setShowConvList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)

  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiClient('/messages/conversations')
      setConversations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    fetchConversations()
  }, [user, fetchConversations])

  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true)
    try {
      const data = await apiClient(`/messages/conversations/${convId}/messages`)
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  const selectConversation = useCallback(async (convId: string) => {
    setActiveConvId(convId)
    setShowConvList(false)
    await loadMessages(convId)
    // Update unread in local state
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c))
    // Start polling for new messages
    clearInterval(pollRef.current)
    pollRef.current = setInterval(() => loadMessages(convId), 4000)
  }, [loadMessages])

  useEffect(() => {
    return () => clearInterval(pollRef.current)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvId || sending) return
    setSending(true)
    const optimistic = {
      id: `opt-${Date.now()}`,
      content: newMessage,
      senderId: user?.id,
      sender: { id: user?.id, name: user?.name, role: user?.role, avatarUrl: user?.avatarUrl },
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    setMessages(prev => [...prev, optimistic])
    setNewMessage('')
    try {
      const sent = await apiClient(`/messages/conversations/${activeConvId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: newMessage }),
      })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? sent : m))
      // Update conversation preview
      setConversations(prev => prev.map(c =>
        c.id === activeConvId ? { ...c, lastMessagePreview: sent.content, lastMessageAt: sent.createdAt } : c
      ))
    } catch (err: any) {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  const activeConv = conversations.find(c => c.id === activeConvId)
  const otherUser = activeConv?.participants?.[0]

  const handleSearchUsers = async (q: string) => {
    setUserSearchQuery(q)
    if (!q || q.length < 2) {
      setSearchResults([])
      return
    }
    setSearchingUsers(true)
    try {
      const res = await apiClient(`/users/search?q=${encodeURIComponent(q)}`)
      setSearchResults(res || [])
    } catch (err) {
      console.error('Failed to search users', err)
    } finally {
      setSearchingUsers(false)
    }
  }

  const startNewConversation = async (recipientId: string) => {
    setIsSearchOpen(false)
    try {
      const conv = await apiClient('/messages/conversations', {
        method: 'POST',
        body: JSON.stringify({ recipientId })
      })
      // If it's a new conversation not in our list, add it
      setConversations(prev => {
        if (!prev.find(c => c.id === conv.id)) {
          return [{
            id: conv.id,
            participants: conv.participants.map((p: any) => p.user).filter((u: any) => u.id !== user?.id),
            unreadCount: 0,
            lastMessagePreview: null,
            lastMessageAt: null
          }, ...prev]
        }
        return prev
      })
      selectConversation(conv.id)
    } catch (err) {
      toast.error('Failed to start conversation')
    }
  }

  if (!user) return null

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      <div className="flex flex-1 pt-16 overflow-hidden">

        {/* Conversation List */}
        <div className={`${showConvList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 border-r border-white/5 bg-black/20 flex-shrink-0`}>
          <div className="p-4 border-b border-white/5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">Messages</h2>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10" onClick={() => setIsSearchOpen(true)}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-foreground/40" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <MessageSquare className="w-12 h-12 text-foreground/20 mb-4" />
                <p className="text-sm font-semibold text-foreground/60 mb-1">No conversations yet</p>
                <p className="text-xs text-foreground/40">Messages from clients and TPOs will appear here</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map(conv => {
                  const other = conv.participants?.[0]
                  const isActive = conv.id === activeConvId
                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        isActive
                          ? 'bg-blue-500/10 border border-blue-500/20'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <Avatar user={other} size="md" />
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-sm font-medium truncate ${conv.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'}`}>
                            {other?.name || 'Unknown'}
                          </p>
                          {conv.lastMessageAt && (
                            <span className="text-[10px] text-foreground/40 flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-foreground/70' : 'text-foreground/40'}`}>
                          {conv.lastMessagePreview || 'Start a conversation'}
                        </p>
                        <span className="text-[10px] text-foreground/30 capitalize">{other?.role?.toLowerCase()}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${!showConvList ? 'flex' : 'hidden'} md:flex flex-col flex-1 overflow-hidden`}>
          {activeConvId && otherUser ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-black/10">
                <button onClick={() => setShowConvList(true)} className="md:hidden p-1 hover:bg-white/5 rounded-lg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Avatar user={otherUser} size="md" />
                <div>
                  <p className="font-semibold text-sm">{otherUser.name}</p>
                  <p className="text-xs text-foreground/50 capitalize">{otherUser.role?.toLowerCase()}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-foreground/40" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                      <MessageSquare className="w-7 h-7 text-blue-400" />
                    </div>
                    <p className="font-semibold text-foreground/60 mb-1">Say hello to {otherUser.name}!</p>
                    <p className="text-sm text-foreground/40">This is the start of your conversation</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.id
                      const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId)
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {!isMe && (showAvatar
                            ? <Avatar user={msg.sender} size="sm" />
                            : <div className="w-8" />
                          )}
                          <div className={`max-w-[70%] group`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-white/8 border border-white/5 text-foreground rounded-bl-sm'
                            }`}>
                              {msg.content}
                            </div>
                            <p className={`text-[10px] mt-1 text-foreground/30 ${isMe ? 'text-right' : 'text-left'}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/5 bg-black/10">
                <form
                  onSubmit={e => { e.preventDefault(); handleSend() }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={`Message ${otherUser.name}...`}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm placeholder-foreground/30 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/20 transition-all"
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="h-11 w-11 p-0 bg-blue-600 hover:bg-blue-500 rounded-xl flex-shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-xs">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/10 flex items-center justify-center mx-auto mb-5">
                  <MessageSquare className="w-9 h-9 text-blue-400/60" />
                </div>
                <h3 className="font-bold text-lg mb-2">Your Messages</h3>
                <p className="text-sm text-foreground/50">Select a conversation from the left or wait for clients and TPOs to contact you</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-lg">New Message</h3>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => setIsSearchOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 border-b border-white/10 relative">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                autoFocus
                placeholder="Search users by name..."
                value={userSearchQuery}
                onChange={e => handleSearchUsers(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 min-h-[300px]">
              {searchingUsers ? (
                <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-foreground/40" /></div>
              ) : searchResults.length > 0 ? (
                searchResults.map(u => (
                  <button
                    key={u.id}
                    onClick={() => startNewConversation(u.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                  >
                    <Avatar user={u} size="md" />
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-foreground/50 capitalize">{u.role.toLowerCase()}</p>
                    </div>
                  </button>
                ))
              ) : userSearchQuery.length > 1 ? (
                <div className="text-center py-10 text-foreground/40 text-sm">No users found</div>
              ) : (
                <div className="text-center py-10 text-foreground/40 text-sm">Type a name to search</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
