// components/ai-sidebar.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PlusCircle } from 'lucide-react'

export default function Sidebar() {
  const [chats, setChats] = useState([
    { id: 1, title: 'Previous Chat 1' },
    { id: 2, title: 'Previous Chat 2' },
    { id: 3, title: 'Previous Chat 3' },
  ])

  const startNewChat = () => {
    const newChat = { id: Date.now(), title: 'New Chat' }
    setChats([newChat, ...chats])
  }

  return (
    <div className="w-64 bg-gray-100 h-screen overflow-hidden flex flex-col">
      <div className="p-4">
        <Button onClick={startNewChat} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant="ghost"
              className="w-full justify-start"
            >
              {chat.title}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}