"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Activity, DollarSign, Users, CreditCard, Download, CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function TotalEarningComp() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2023, 0, 20),
    to: new Date(2023, 1, 9)
  })

  const handleDownload = () => {
    // Implement download logic here
    console.log("Downloading data for range:", date)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={handleDownload} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold">$45,231.89</h2>
              <p className="text-sm text-green-600">
                +20.1%
                <span className="text-xs text-muted-foreground ml-1">from last month</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Subscriptions</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold">+2,350</h2>
              <p className="text-sm text-green-600">
                +180.1%
                <span className="text-xs text-muted-foreground ml-1">from last month</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Sales</p>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold">+12,234</h2>
              <p className="text-sm text-green-600">
                +19%
                <span className="text-xs text-muted-foreground ml-1">from last month</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Active Now</p>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold">+573</h2>
              <p className="text-sm text-green-600">
                +201
                <span className="text-xs text-muted-foreground ml-1">since last hour</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}