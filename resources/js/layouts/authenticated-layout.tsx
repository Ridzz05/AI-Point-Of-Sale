import { PropsWithChildren, ReactNode, useState, useEffect } from "react";
import {AppSidebar} from "@/components/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import AppearanceDropdown from "@/components/appearance-dropdown";
import { usePage } from "@inertiajs/react";
import { Toast } from "@/components/ui/toast-simple";
import SupportWidget from "@/components/support-widget";

export default function AuthenticatedLayout({
    header,
    children
}: PropsWithChildren<{
    header?: ReactNode;
}>) {
    const { flash } = usePage().props as any;
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (flash.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <header className="sticky top-0 bg-background/60 backdrop-blur-xl z-50 flex h-16 shrink-0 items-center gap-2 justify-between p-4 px-6 md:rounded-t-xl transition-all border-b border-zinc-100/50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{header}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div>
                        <AppearanceDropdown />
                    </div>
                </header>

                <main className="p-4 md:pt-0 h-full">
                    {children}
                </main>
            </SidebarInset>

            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
            <SupportWidget />
        </SidebarProvider>
    );
}
