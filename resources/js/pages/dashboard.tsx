import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Users, 
    Package, 
    Receipt, 
    CurrencyDollar, 
    TrendUp, 
    Plus, 
    Sparkle, 
    ArrowUpRight, 
    Clock,
    ShoppingCart
} from "@phosphor-icons/react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { useState, useEffect } from "react";
import axios from "axios";

const COLORS = ["#fbbf24", "#d97706", "#f59e0b", "#451a03"];

export default function Dashboard({
    stats,
    projectsByStatus,
    revenueData,
    activities,
}: any) {
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isLoadingInsight, setIsLoadingInsight] = useState(true);

    useEffect(() => {
        axios.get(route('ai.insight'))
            .then(res => {
                setAiInsight(res.data.insight);
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoadingInsight(false));
    }, []);

    const chartConfig = {
        total: {
            label: "Revenue",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8 p-4 md:p-8 pt-6">
                {/* Greeting Hero Widget */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-8 text-black shadow-lg border border-white/20">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Badge className="bg-black/10 hover:bg-black/20 text-black border-none backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                    Admin Intelligence Activated
                                </Badge>
                            </div>
                            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
                                Welcome Back, Gess! 👋
                            </h2>
                            <p className="text-lg text-amber-950 leading-relaxed opacity-80">
                                Performa bisnis Anda naik <span className="font-bold">12%</span> minggu ini. 
                                Ada <span className="font-bold">{stats?.totalOrders || 0} pesanan</span> yang telah diproses.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link href={route('products.create')} className="group inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-bold text-amber-400 transition-all hover:bg-slate-900 shadow-md active:scale-95">
                                    <Plus weight="bold" className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" /> Produk Baru
                                </Link>
                                <Link href={route('transactions.index')} className="inline-flex items-center justify-center rounded-xl bg-black/5 px-6 py-3 text-sm font-bold text-black backdrop-blur-md border border-black/10 transition-all hover:bg-black/10 active:scale-95">
                                    <CurrencyDollar weight="bold" className="mr-2 h-5 w-5" /> Catat Transaksi
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:flex flex-col items-center gap-4">
                            <div className="flex -space-x-6">
                                {['Ki', 'Jo', 'Na'].map((name, i) => (
                                    <div key={name} 
                                         className={`h-20 w-20 rounded-full border-4 border-background flex items-center justify-center text-black font-black text-2xl shadow-lg transform hover:-translate-y-2 transition-transform cursor-pointer
                                         ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-amber-500' : 'bg-amber-300'}`}>
                                        {name}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-lg border border-white/10">
                                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-[10px] text-white/80 font-bold uppercase tracking-[0.2em]">Core Team Online</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl opacity-30"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-full bg-gradient-to-b from-white/5 to-transparent"></div>
                </div>

                {/* AI Insight Widget */}
                <Card className="border border-amber-200/50 shadow-sm bg-gradient-to-r from-amber-50 to-amber-100/30 dark:from-zinc-900/50 dark:to-zinc-900/20 overflow-hidden relative border-l-4 border-l-amber-400">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkle weight="light" className="h-24 w-24 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardHeader className="flex flex-row items-center gap-3 pb-2 relative z-10">
                        <div className="h-10 w-10 rounded-xl bg-amber-400 flex items-center justify-center text-black shadow-lg shadow-amber-400/30">
                            <Sparkle weight="bold" className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">AI Smart Insights</CardTitle>
                            <CardDescription>Generated by KitaAI Senior Analyst</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {isLoadingInsight ? (
                            <div className="flex flex-col gap-2">
                                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                            </div>
                        ) : (
                            <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed text-lg">
                                "{aiInsight}"
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { title: "Total Customers", value: stats?.totalCustomers, icon: Users, color: "text-amber-600", bg: "bg-amber-100/50", desc: "Leads & Active Clients" },
                        { title: "Total Products", value: stats?.totalProducts, icon: Package, color: "text-amber-600", bg: "bg-amber-100/50", desc: "Available in catalog" },
                        { title: "Total Revenue", value: `Rp ${new Intl.NumberFormat('id-ID').format(stats?.totalRevenue || 0)}`, icon: CurrencyDollar, color: "text-amber-600", bg: "bg-amber-100/50", desc: "Completed sales" },
                        { title: "Total Orders", value: stats?.totalOrders, icon: Receipt, color: "text-amber-600", bg: "bg-amber-100/50", desc: "Processed transactions" }
                    ].map((item, i) => (
                        <Card key={i} className="group hover:shadow-md transition-all duration-300 border border-zinc-100 dark:border-zinc-800 bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{item.title}</CardTitle>
                                <div className={`p-2 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                    <item.icon weight="light" className="h-5 w-5" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black tracking-tight mb-1">{item.value || 0}</div>
                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                    <ArrowUpRight weight="bold" className="h-3 w-3 text-emerald-500" /> {item.desc}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4 border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b pb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Revenue Analytics</CardTitle>
                                    <CardDescription>Performance trends over the last 6 months</CardDescription>
                                </div>
                                <Badge variant="outline" className="font-bold border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-300">
                                    IDR Currency
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData || []} margin={{ left: 12, right: 12, top: 12 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={false}
                                            tick={{ fontSize: 12, fontWeight: 600 }}
                                        />
                                        <YAxis 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tickFormatter={(value) => `${value / 1000000}M`}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <ChartTooltip
                                            content={<ChartTooltipContent />}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="total" 
                                            stroke="var(--color-total)" 
                                            strokeWidth={4}
                                            fillOpacity={1} 
                                            fill="url(#colorTotal)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-3 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <CardHeader className="border-b pb-6">
                            <CardTitle className="text-xl font-bold">Recent Pulse</CardTitle>
                            <CardDescription>Live updates from your team and clients</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {activities && activities.length > 0 ? (
                                    activities.map((activity: any, i: number) => (
                                        <div key={i} className="group flex items-start gap-4 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 shadow-sm transition-transform group-hover:scale-110 ${
                                                activity.type === 'customer' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                activity.type === 'order' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                'bg-amber-50 border-amber-100 text-amber-600'
                                            }`}>
                                                {activity.type === 'customer' ? <Users weight="light" className="h-5 w-5" /> :
                                                 activity.type === 'order' ? <Receipt weight="light" className="h-5 w-5" /> :
                                                 <CurrencyDollar weight="light" className="h-5 w-5" />}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-sm font-bold leading-tight">{activity.title}</p>
                                                <p className="text-sm text-muted-foreground font-medium">{activity.description}</p>
                                                <p className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase mt-1">
                                                    <Clock className="h-3 w-3" /> {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 mb-4 flex items-center justify-center">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-bold">No active pulses recorded.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4">
                            <Button variant="outline" className="w-full font-bold text-xs uppercase tracking-widest rounded-xl py-6">
                                View System Logs
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                
            </div>
        </AuthenticatedLayout>
    );
}
