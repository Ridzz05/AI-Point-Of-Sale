"use client"

import * as React from "react"
import { 
    House, 
    UsersThree, 
    Kanban, 
    Receipt, 
    MagicWand, 
    Question, 
    Buildings,
    Storefront,
    Package
} from "@phosphor-icons/react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavTeams } from "@/components/nav-teams"
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
import {Link, usePage} from "@inertiajs/react";
import {PageProps} from "@/types";

const data = {
  user: {
    id: 0,
    name: "AI-Smart-Agency-Dashboard",
    email: "admin@kita.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "AdminCRM Kita",
      logo: Buildings,
      plan: "Agency Plan",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: route('dashboard'),
      icon: House,
      isActive: true,
    },
    {
      title: "Customers",
      url: route('customers.index'),
      icon: UsersThree,
    },
    {
      title: "Projects",
      url: route('projects.index'),
      icon: Kanban,
    },
    {
      title: "Transactions",
      url: route('transactions.index'),
      icon: Receipt,
    },
    {
      title: "Point of Sale",
      url: '/pos',
      icon: Storefront,
    },
    {
      title: "Products",
      url: '/products',
      icon: Package,
    },
    {
      title: "AI Assistant",
      url: route('ai.index'),
      icon: MagicWand,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: Question,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<PageProps>().props;

    return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <NavTeams teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={auth.user ?? data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
