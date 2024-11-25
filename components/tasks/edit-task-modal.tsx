"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Task } from "@/types"
import { priorities, statuses } from "@/data/data"

interface EditTaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onTaskUpdated: (updatedTask: Task) => void
}

export function EditTaskModal({ task, isOpen, onClose, onTaskUpdated }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title)
  const [status, setStatus] = useState(task.status)
  const [priority, setPriority] = useState(task.priority)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setTitle(task.title)
    setStatus(task.status)
    setPriority(task.priority)
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, status, priority }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        console.error('Error response:', response.status, data)
        throw new Error(data.error || "Görev güncellenirken bir hata oluştu")
      }
  
      onTaskUpdated(data)
      onClose()
      toast({
        title: "Başarılı",
        description: "Görev başarıyla güncellendi.",
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Görev güncellenirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Görevi Düzenle</DialogTitle>
          <DialogDescription>
            Görev bilgilerini güncellemek için aşağıdaki formu doldurun.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Başlık
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Durum
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Öncelik
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Öncelik seçin" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}