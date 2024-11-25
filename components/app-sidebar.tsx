// "use client"

// import * as React from "react"
// import {
//   BookOpen,
//   Command,
//   Frame,
//   LifeBuoy,
//   Map,
//   PieChart,
//   Send,
//   Settings,
//   Search,
//   Sparkles,
//   Home,
//   Inbox,
//   Archive,
//   Calendar1,
//   ClipboardCheck,
//   NotebookPen,
// } from "lucide-react"

// import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
// import { NavSecondary } from "@/components/nav-secondary"
// import { NavThird } from "@/components/nav-third"
// import { NavUser } from "@/components/nav-user"
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"

// const data = {
//   user: {
//     name: "shadcn",
//     email: "m@example.com",
//     avatar: "https://github.com/shadcn.png",
//   },
//   navMain: [
//     {
//       title: "Search",
//       url: "#",
//       icon: Search,
//     },
//     {
//       title: "Ask AI",
//       url: "/chat",
//       icon: Sparkles,
//     },
//     {
//       title: "Home",
//       url: "/dashboard",
//       icon: Home,
//       isActive: true,
//     },
//     {
//       title: "Inbox",
//       url: "/mail",
//       icon: Inbox,
//       badge: "10",
//     },
//   ],
//   navSecondary: [
//     {
//       title: "Support",
//       url: "#",
//       icon: LifeBuoy,
//     },
//     {
//       title: "Feedback",
//       url: "#",
//       icon: Send,
//     },
//   ],
//   navThird: [
//     {
//       title: "Calendar",
//       url: "/calendar",
//       icon: Calendar1,
//     },
//     {
//       title: "Invoice",
//       url: "/invoice",
//       icon: Archive,
//       items: [
//         {
//           title: "List",
//           url: "#",
//         },
//         {
//           title: "Add Invoice",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Chat",
//       url: "/chat",
//       icon: BookOpen,
//     },
//     {
//       title: "To-Do",
//       url: "/todo",
//       icon: ClipboardCheck,
//       items: [
//         {
//           title: "Tasks",
//           url: "/todo/tasks",
//         },
//         {
//           title: "Team",
//           url: "#",
//         },
//         {
//           title: "Billing",
//           url: "#",
//         },
//         {
//           title: "Limits",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "notes",
//       url: "http://localhost:3000/notes",
//       icon: NotebookPen,
//     },
//     {
//       title: "Settings",
//       url: "http://localhost:3000/settings",
//       icon: Settings,
//       items: [
//         {
//           title: "Profile",
//           url: "/settings",
//         },
//         {
//           title: "Account",
//           url: "/settings/account",
//         },
//         {
//           title: "Appearance",
//           url: "/settings/appearance",
//         },
//         {
//           title: "Notifications",
//           url: "/settings/notifications",
//         },
//         {
//           title: "Display",
//           url: "/settings/display",
//         },
//       ],
//     },
//   ],
//   projects: [
//     {
//       name: "Design Engineering",
//       url: "#",
//       icon: Frame,
//     },
//     {
//       name: "Sales & Marketing",
//       url: "#",
//       icon: PieChart,
//     },
//     {
//       name: "Travel",
//       url: "#",
//       icon: Map,
//     },
//   ],
// }

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   return (
//     <Sidebar variant="inset" {...props}>
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton size="lg" asChild>
//               <a href="#">
//                 <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
//                   <Command className="size-4" />
//                 </div>
//                 <div className="grid flex-1 text-left text-sm leading-tight">
//                   <span className="truncate font-semibold">Ayrise LLC</span>
//                   <span className="truncate text-xs">Enterprise</span>
//                 </div>
//               </a>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent>
//         <NavMain items={data.navMain} />
//         <NavThird items={data.navThird} />
//         <NavProjects projects={data.projects} />
//         <NavSecondary items={data.navSecondary} className="mt-auto" />
//       </SidebarContent>
//       <SidebarFooter>
//         <NavUser user={data.user} />
//       </SidebarFooter>
//     </Sidebar>
//   )
// }

"use client"

import * as React from "react"
import {
  BookOpen,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings,
  Search,
  Sparkles,
  Home,
  Inbox,
  Archive,
  Calendar1,
  ClipboardCheck,
  NotebookPen,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavThird } from "@/components/nav-third"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from '@/app/contexts/AuthContext'

const data = {
  navMain: [
    { title: "Search", url: "#", icon: Search },
    { title: "Ask AI", url: "/ai", icon: Sparkles },
    { title: "Home", url: "/dashboard", icon: Home, isActive: true },
    { title: "Inbox", url: "/mail", icon: Inbox, badge: "10" },
  ],
  navSecondary: [
    { title: "Support", url: "#", icon: LifeBuoy },
    { title: "Feedback", url: "#", icon: Send },
  ],
  navThird: [
    { title: "Calendar", url: "/calendar", icon: Calendar1 },
    {
      title: "Invoice",
      url: "/invoice",
      icon: Archive,
      items: [
        { title: "List", url: "/invoice" },
        { title: "Add Invoice", url: "/add-invoice" },
      ],
    },
    { title: "Chat", url: "/chat", icon: BookOpen },
    {
      title: "To-Do",
      url: "/todo",
      icon: ClipboardCheck,
      items: [
        { title: "Tasks", url: "/todo/tasks" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
    { title: "notes", url: "/notes", icon: NotebookPen },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        { title: "Profile", url: "/settings" },
        { title: "Account", url: "/settings/account" },
        { title: "Appearance", url: "/settings/appearance" },
        { title: "Notifications", url: "/settings/notifications" },
        { title: "Display", url: "/settings/display" },
      ],
    },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Ayrise LLC</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavThird items={data.navThird} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
      {isLoading ? (
          <div>Loading...</div>
        ) : isAuthenticated && user ? (
          <NavUser user={user} />
        ) : (
          <div>
            <a href="/auth/login">Login</a>
          </div>
        )}
</SidebarFooter>
    </Sidebar>
  )
}