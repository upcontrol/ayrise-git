"use client"

import * as React from "react"
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/tasks/data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { useTasksData } from "./use-tasks-data"
import { DataTableColumnHeader } from "./data-table-column-header"
import { priorities, statuses } from "@/data/data"
import { Task } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { toast } from "@/hooks/use-toast"
import { EditTaskModal } from "./edit-task-modal"
import { CopyTaskModal } from "./copy-task-modal"

export function TasksPage() {
  const { data: tasks, isLoading, isError, refetch } = useTasksData()
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [copyingTask, setCopyingTask] = React.useState<Task | null>(null)

  const addTask = async (newTask: Task) => {
    await refetch()
    toast({
      title: "Görev Eklendi",
      description: "Yeni görev başarıyla eklendi.",
    })
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Görev silinemedi')
      await refetch()
      toast({
        title: "Görev Silindi",
        description: `Görev başarıyla silindi.`,
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Görev silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const editTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleTaskUpdated = async (updatedTask: Task) => {
    await refetch()
    setEditingTask(null)
  }

  const copyTask = (task: Task) => {
    setCopyingTask(task)
  }

  const toggleFavorite = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/favorite`, { method: 'POST' })
      if (!response.ok) throw new Error('Favori durumu değiştirilemedi')
      await refetch()
      toast({
        title: "Favoriler",
        description: `Görev ${taskId} favori durumu güncellendi.`,
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Favori durumu değiştirilirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const addLabel = async (taskId: string, label: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label })
      })
      if (!response.ok) throw new Error('Etiket eklenemedi')
      const updatedTask = await response.json()
      await refetch()
      toast({
        title: "Etiket Eklendi",
        description: `"${label}" etiketi Görev ${taskId}'ye eklendi.`,
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Etiket eklenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => <div className="w-[100px]">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {row.original.labels?.map((label) => (
            <span key={label} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full border border-gray-300 text-xs">
              {label}
            </span>
          ))}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue("status")
        )
        return status ? (
          <div className="flex w-[100px] items-center">
            {status.icon && (
              <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            <span>{status.label}</span>
          </div>
        ) : null
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = priorities.find(
          (priority) => priority.value === row.getValue("priority")
        )
        return priority ? (
          <div className="flex items-center">
            {priority.icon && (
              <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            <span>{priority.label}</span>
          </div>
        ) : null
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                <DotsHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onSelect={() => editTask(task)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => copyTask(task)}>
                Make a copy
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toggleFavorite(task.id)}>
                Favorite
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onSelect={() => addLabel(task.id, "Bug")}>Bug</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => addLabel(task.id, "Feature")}>Feature</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => addLabel(task.id, "Documentation")}>Documentation</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => deleteTask(task.id)} className="text-destructive">
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: tasks || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isLoading) {
    return <div>Yükleniyor...</div>
  }

  if (isError) {
    return <div>Bir hata oluştu. Lütfen daha sonra tekrar deneyin.</div>
  }

  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hoş geldiniz!</h2>
          <p className="text-muted-foreground">
            İşte bu ay için görevlerinizin listesi!
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <DataTableToolbar table={table} onTaskAdded={addTask} />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} >{header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Sonuç bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} />
      </div>
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
      {copyingTask && (
        <CopyTaskModal
          task={copyingTask}
          isOpen={!!copyingTask}
          onClose={() => setCopyingTask(null)}
          onTaskCopied={async (newTask) => {
            await refetch();
            setCopyingTask(null);
            toast({
              title: "Kopyalandı",
              description: `Görev ${newTask.id} kopyalandı.`,
            });
          }}
        />
      )}
    </div>
  )
}