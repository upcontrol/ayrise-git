'use client'

import { useChat, Message } from 'ai/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mic, Send, Plus, Copy, MessageSquare, Trash } from 'lucide-react'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/DynamicBreadcrumb"
import { Separator } from "@/components/ui/separator"


interface ChatHistory {
  id: number
  title: string
  messages: Message[]
}

export default function AIPage() {
  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, setMessages } = useChat()
  const [model, setModel] = useState('GPT 4o mini')
  const [chats, setChats] = useState<ChatHistory[]>([])
  const [currentChatId, setCurrentChatId] = useState<number | null>(null)

  const exampleMessages = [
    {
      heading: 'What is the weather',
      message: 'in San Francisco?'
    },
    {
      heading: 'Help me draft an essay',
      message: 'about Silicon Valley'
    }
  ]

  useEffect(() => {
    const savedChats = localStorage.getItem('chatHistory')
    if (savedChats) {
      setChats(JSON.parse(savedChats))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: messages }
            : chat
        )
      )
    }
  }, [messages, currentChatId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentChatId) {
      const newChat = createNewChat()
      setCurrentChatId(newChat.id)
    }
    await originalHandleSubmit(e)
  }

  const loadChat = (chatHistory: ChatHistory) => {
    setCurrentChatId(chatHistory.id)
    setMessages(chatHistory.messages)
  }

  const deleteChat = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setChats(prevChats => prevChats.filter(chat => chat.id !== id))
    if (currentChatId === id) {
      setCurrentChatId(null)
      setMessages([])
    }
  }

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: `New Chat ${chats.length + 1}`,
      messages: []
    }
    setChats(prevChats => [newChat, ...prevChats])
    setMessages([])
    setCurrentChatId(newChat.id)
    return newChat
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
        </header>
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/40">
        <div className="flex h-14 items-center justify-between px-4 border-b">
          <span className="font-semibold">Chat History</span>
          <Button variant="ghost" size="icon" onClick={createNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-2 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer group ${
                currentChatId === chat.id ? 'bg-muted' : ''
              }`}
              onClick={() => loadChat(chat)}
            >
              <span className="text-sm truncate">{chat.title}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={(e) => deleteChat(chat.id, e)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between w-full h-14 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Chatbot</h1>
            <Button size="icon" variant="ghost" className="ml-2" onClick={createNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue>{model}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GPT 4o mini">GPT 4o mini</SelectItem>
                <SelectItem value="GPT-4">GPT-4</SelectItem>
                <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center justify-center text-center px-4">
                    <div className="flex items-center justify-center w-20 h-20 mb-8 rounded-full bg-primary/10">
                      <MessageSquare className="w-10 h-10 text-primary" />
                    </div>
                    <p className="max-w-2xl mb-8 text-sm text-muted-foreground">
                      This is an open source chatbot template built with Next.js and the AI SDK by Vercel. It uses the streamText function in the server and the useChat hook on the client to create a seamless chat experience.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {exampleMessages.map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-start"
                          onClick={() => handleInputChange({ target: { value: example.message } } as React.ChangeEvent<HTMLInputElement>)}
                        >
                          <span className="font-semibold">{example.heading}</span>
                          <span className="text-sm text-muted-foreground">{example.message}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 space-y-4 p-4">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t bg-gradient-to-t from-background/90 to-background/50 backdrop-blur-sm p-4">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 max-w-4xl mx-auto"
              >
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Send a message..."
                  className="flex-1"
                />
                <Button size="icon" type="button">
                  <Mic className="h-4 w-4" />
                  <span className="sr-only">Use voice input</span>
                </Button>
                <Button size="icon" type="submit">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
    
    </SidebarInset>
    </SidebarProvider>
  )
}