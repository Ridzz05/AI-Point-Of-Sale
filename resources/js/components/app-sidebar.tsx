"use client"

import * as React from "react"
import { 
    House, 
    UsersThree, 
    Receipt, 
    MagicWand, 
    Question, 
    Buildings,
    Storefront,
    Package,
    Tag,
    Cube,
    SquaresFour
} from "@phosphor-icons/react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavTeams } from "@/components/nav-teams"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {Link, usePage} from "@inertiajs/react";
import {PageProps} from "@/types";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<PageProps>().props;
    const url = usePage().url;

    const navMain = [
        {
            title: "Dashboard",
            url: route('dashboard'),
            icon: House,
            isActive: url === '/dashboard',
        },
        {
            title: "Point of Sale",
            url: route('pos.index'),
            icon: Storefront,
            isActive: url.startsWith('/pos'),
        },
        {
            title: "Catalog",
            url: "#", // Changed to # to prevent navigation conflict with collapsible
            icon: SquaresFour,
            isActive: url.startsWith('/products') || url.startsWith('/categories') || url.startsWith('/inventory'),
            items: [
                {
                    title: "Products",
                    url: route('products.index'),
                },
                {
                    title: "Categories",
                    url: route('categories.index'),
                },
                {
                    title: "Inventory",
                    url: route('inventory.index'),
                },
            ],
        },
        {
            title: "Sales & Transactions",
            url: route('transactions.index'),
            icon: Receipt,
            isActive: url.startsWith('/transactions'),
        },
        {
            title: "Customers",
            url: route('customers.index'),
            icon: UsersThree,
            isActive: url.startsWith('/customers'),
        },
        {
            title: "AI Business Assistant",
            url: route('ai.index'),
            icon: MagicWand,
            isActive: url.startsWith('/ai'),
        },
    ];

    const sidebarData = {
        user: {
            id: auth.user?.id || 0,
            name: auth.user?.name || "Admin",
            email: auth.user?.email || "admin@example.com",
            avatar: "/avatars/admin.jpg",
        },
        teams: [
            {
                name: "AdminCRM Kita",
                logo: Buildings,
                plan: "Agency Plan",
            },
        ],
        navMain: navMain,
        navSecondary: [
            {
                title: "Support",
                url: "#",
                icon: Question,
            },
        ],
    };

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <NavTeams teams={sidebarData.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={sidebarData.navMain} />
                <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={sidebarData.user} />
            </SidebarFooter>
        </Sidebar>
    );
}
