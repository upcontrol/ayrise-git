"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { priorities, statuses } from "@/data/data"
import { Plus } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { Task } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"

interface AddTaskModalProps {
  onTaskAdded: (task: Task) => void
}

const labels = ["Bug", "Feature", "Documentation"]

export function AddTaskModal({ onTaskAdded }: AddTaskModalProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return;
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, status, priority, labels: selectedLabels }),
      })

      if (!response.ok) {
        throw new Error('Görev eklenirken bir hata oluştu')
      }

      const result = await response.json()
      console.log('Sunucu yanıtı:', result)

      onTaskAdded(result.task) // This will trigger a refetch in the parent component
      setOpen(false)
      toast({
        title: "Başarılı",
        description: "Yeni görev başarıyla eklendi.",
      })

      // Reset form
      setTitle("")
      setStatus("")
      setPriority("")
      setSelectedLabels([])
    } catch (error) {
      console.error('Görev eklenirken hata:', error)
      toast({
        title: "Hata",
        description: "Görev eklenirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLabel = (label: string) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="mr-2 h-4 w-4" /> Görev Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Görev Ekle</DialogTitle>
          <DialogDescription>
            Yeni bir görev eklemek için aşağıdaki formu doldurun.
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
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Durum
              </Label>
              <Select value={status} onValueChange={setStatus} required>
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
              <Select value={priority} onValueChange={setPriority} required>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Etiketler</Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {labels.map((label) => (
                  <div key={label} className="flex items-center">
                    <Checkbox
                      id={`label-${label}`}
                      checked={selectedLabels.includes(label)}
                      onCheckedChange={() => toggleLabel(label)}
                    />
                    <label
                      htmlFor={`label-${label}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ekleniyor..." : "Görev Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}