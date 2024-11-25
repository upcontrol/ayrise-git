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

interface CopyTaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onTaskCopied: (newTask: Task) => void
}

export function CopyTaskModal({ task, isOpen, onClose, onTaskCopied }: CopyTaskModalProps) {
  const [title, setTitle] = useState(`${task.title} (Copy)`)
  const [status, setStatus] = useState(task.status)
  const [priority, setPriority] = useState(task.priority)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setTitle(`${task.title} (Copy)`)
    setStatus(task.status)
    setPriority(task.priority)
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = { title, status, priority }
      console.log('Sending payload:', payload) // Log the payload for debugging

      const response = await fetch(`/api/tasks/${task.id}/copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log('Response status:', response.status) // Log the response status

      const responseText = await response.text()
      console.log('Response text:', responseText) // Log the raw response text

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (error) {
        console.error('Error parsing response JSON:', error)
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        throw new Error(responseData.error || "Görev kopyalanırken bir hata oluştu")
      }

      onTaskCopied(responseData)
      onClose()
      toast({
        title: "Başarılı",
        description: "Görev başarıyla kopyalandı.",
      })
    } catch (error) {
      console.error('Error copying task:', error)
      toast({
        title: "Hata",
        description: error.message,
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
          <DialogTitle>Görevi Kopyala</DialogTitle>
          <DialogDescription>
            Görevi kopyalamak için aşağıdaki formu doldurun. Bilgileri düzenleyebilirsiniz.
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
              {isSubmitting ? "Kopyalanıyor..." : "Kopyala ve Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}