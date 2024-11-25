// components/ai-chatbot.tsx
'use client'

import { useChat } from 'ai/react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AIChatbot() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    await handleSubmit(e)
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-screen">
      <ScrollArea className="flex-1 p-4">
        {messages.map((m, index) => (
          <div
            key={index}
            className={`flex items-start mb-4 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role !== 'user' && (
              <Avatar className="mr-2">
                <AvatarImage src="/ai-avatar.png" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`p-2 rounded-lg max-w-[80%] ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && (
              <Avatar className="ml-2">
                <AvatarImage src="/user-avatar.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={onSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  )
}