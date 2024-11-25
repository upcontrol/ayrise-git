'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Command, CommandInput } from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Sparkles, CircleUser, CreditCard, Bell, LogOut } from 'lucide-react'

export function Header() {
  const router = useRouter()

  const handleLogout = () => {
    console.log('Çıkış yapılıyor...')
    router.push('/')
  }

  return (
    <header className="flex justify-end items-center px-4 py-2">
      <div className="flex items-center space-x-2">
        <Command className="w-64 rounded-lg border shadow-sm">
          <CommandInput placeholder="Ara..." />
        </Command>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem className="flex flex-col items-start">
              <div className="font-medium">shadcn</div>
              <div className="text-sm text-muted-foreground">m@example.com</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/upgrade">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Upgrade to Pro</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account">
                <CircleUser className="mr-2 h-4 w-4" />
                <span>Account</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}