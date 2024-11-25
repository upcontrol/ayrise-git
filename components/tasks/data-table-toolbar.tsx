import { Table } from "@tanstack/react-table"
import { X } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/tasks/data-table-view-options"
import { priorities, statuses } from "@/data/data"
import { DataTableFacetedFilter } from "@/components/tasks/data-table-faceted-filter"
import { AddTaskModal } from "@/components/tasks/add-task-modal"
import { Task } from "@/types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onTaskAdded: (newTask: Task) => void
}

export function DataTableToolbar<TData>({
  table,
  onTaskAdded,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <AddTaskModal onTaskAdded={onTaskAdded} />
      <DataTableViewOptions table={table} />
    </div>
  )
}