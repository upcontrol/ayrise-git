"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Plus } from 'lucide-react'

export default function Component() {
  const [tasks, setTasks] = React.useState<string[]>([])
  const [newTask, setNewTask] = React.useState("")

  const addTask = () => {
    if (newTask.trim() !== "") {
      setTasks([...tasks, newTask])
      setNewTask("")
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Görev Yöneticisi</h1>
      
      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Yeni görev ekle"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
        />
        <Button onClick={addTask}>
          <Plus className="mr-2 h-4 w-4" /> Ekle
        </Button>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded">
            <span>{task}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">...</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {
                  const updatedTasks = [...tasks]
                  updatedTasks.splice(index, 1)
                  setTasks(updatedTasks)
                }}>
                  Sil
                </DropdownMenuItem>
                <DropdownMenuItem>Düzenle</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  )
}