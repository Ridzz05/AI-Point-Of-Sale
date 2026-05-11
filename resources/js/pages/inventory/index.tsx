import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
    Search, 
    Filter, 
    ArrowUpDown, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle,
    Plus,
    Minus,
    RefreshCw,
    History,
    Boxes
} from "lucide-react"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { 
    Cube as PhosphorCube,
    Warning as PhosphorWarning,
    CheckCircle as PhosphorCheck,
    Prohibit as PhosphorProhibit,
    ArrowsCounterClockwise
} from "@phosphor-icons/react"

interface Inventory {
    id: number;
    inventoryable_id: number;
    inventoryable_type: string;
    quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    min_stock_level: number;
    last_cost: number | null;
    updated_at: string;
    inventoryable: {
        id: number;
        name: string;
        sku: string;
        barcode: string | null;
        category?: { name: string };
        product?: { name: string }; // For variants
    }
}

export default function Index({ inventories, filters }: PageProps<{ 
    inventories: { data: Inventory[], links: any, total: number }, 
    filters: { search?: string, stock_status?: string } 
}>) {
    const [search, setSearch] = useState(filters.search || '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || 'all');
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
    const [adjustType, setAdjustType] = useState<'add' | 'deduct' | 'set'>('add');

    const { data, setData, post, processing, errors, reset } = useForm({
        quantity: 0,
        reason: '',
        cost: '',
    });

    const handleSearch = () => {
        router.get(route('inventory.index'), { search, stock_status: stockStatus }, { preserveState: true });
    };

    const onAdjust = (inventory: Inventory, type: 'add' | 'deduct' | 'set') => {
        setSelectedInventory(inventory);
        setAdjustType(type);
        reset();
        setIsAdjustOpen(true);
    };

    const submitAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInventory) return;

        const url = adjustType === 'add' ? route('inventory.add', selectedInventory.id) :
                    adjustType === 'deduct' ? route('inventory.deduct', selectedInventory.id) :
                    route('inventory.adjust', selectedInventory.id);

        post(url, {
            onSuccess: () => {
                setIsAdjustOpen(false);
                reset();
            }
        });
    };

    const getStockBadge = (inventory: Inventory) => {
        const qty = inventory.available_quantity;
        if (qty <= 0) return <Badge variant="destructive" className="rounded-full gap-1"><XCircle className="h-3 w-3" /> Out of Stock</Badge>;
        if (qty <= 5) return <Badge variant="warning" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 rounded-full gap-1 font-bold"><AlertTriangle className="h-3 w-3" /> Low Stock</Badge>;
        return <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 rounded-full gap-1 font-bold"><CheckCircle2 className="h-3 w-3" /> In Stock</Badge>;
    };

    return (
        <AuthenticatedLayout header="Inventory Management">
            <Head title="Inventory" />

            <div className="flex flex-col gap-8 p-4 md:p-8 pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Manajemen Stok</h1>
                        <p className="text-muted-foreground font-medium">Pantau dan sesuaikan tingkat persediaan produk Anda secara real-time.</p>
                    </div>
                </div>

                {/* Filter Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="p-4 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <PhosphorCheck weight="bold" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-emerald-600/70 tracking-widest">In Stock</p>
                                <p className="text-2xl font-black">78 <span className="text-sm font-medium text-muted-foreground">Items</span></p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 bg-amber-50/50 border-amber-100 dark:bg-amber-900/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                <PhosphorWarning weight="bold" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-amber-600/70 tracking-widest">Low Stock</p>
                                <p className="text-2xl font-black">12 <span className="text-sm font-medium text-muted-foreground">Items</span></p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 bg-red-50/50 border-red-100 dark:bg-red-900/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                                <PhosphorProhibit weight="bold" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-red-600/70 tracking-widest">Out of Stock</p>
                                <p className="text-2xl font-black">5 <span className="text-sm font-medium text-muted-foreground">Items</span></p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Cari nama produk, SKU, atau barcode..." 
                                className="pl-10 h-11 rounded-xl"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={stockStatus} onValueChange={(val) => {
                                setStockStatus(val);
                                router.get(route('inventory.index'), { search, stock_status: val }, { preserveState: true });
                            }}>
                                <SelectTrigger className="h-11 w-[160px] rounded-xl font-bold">
                                    <SelectValue placeholder="Status Stok" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="in_stock">In Stock</SelectItem>
                                    <SelectItem value="low_stock">Low Stock</SelectItem>
                                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={handleSearch}>
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 hover:bg-transparent">
                                    <TableHead className="w-[300px] font-bold">Produk / Item</TableHead>
                                    <TableHead className="font-bold">SKU / Barcode</TableHead>
                                    <TableHead className="font-bold">Kategori</TableHead>
                                    <TableHead className="text-center font-bold">
                                        <div className="flex items-center justify-center gap-1">Stok <ArrowUpDown className="h-3 w-3" /></div>
                                    </TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventories.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-50">
                                                <Boxes size={48} className="mb-4" />
                                                <p className="text-lg font-bold">Data stok tidak ditemukan</p>
                                                <p className="text-sm">Coba ubah kata kunci pencarian atau filter Anda.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    inventories.data.map((item) => (
                                        <TableRow key={item.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/80 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        <PhosphorCube weight="duotone" size={24} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black leading-tight text-base">{item.inventoryable.name}</span>
                                                        {item.inventoryable_type.includes('ProductVariant') && (
                                                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Variant: {item.inventoryable.product?.name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs font-bold text-muted-foreground">{item.inventoryable.sku}</span>
                                                    <span className="text-[10px] text-muted-foreground">{item.inventoryable.barcode || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="rounded-full font-bold bg-muted/50">
                                                    {item.inventoryable.category?.name || 'Uncategorized'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-xl font-black ${item.available_quantity <= 5 ? 'text-red-600' : ''}`}>
                                                        {item.available_quantity}
                                                    </span>
                                                    {item.reserved_quantity > 0 && (
                                                        <span className="text-[10px] text-amber-600 font-bold">Reserved: {item.reserved_quantity}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStockBadge(item)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-emerald-50 hover:text-emerald-600" onClick={() => onAdjust(item, 'add')}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600" onClick={() => onAdjust(item, 'deduct')}>
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-blue-50 hover:text-blue-600" onClick={() => onAdjust(item, 'set')}>
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Adjustment Dialog */}
                <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
                    <DialogContent className="sm:max-w-[450px] rounded-3xl">
                        <form onSubmit={submitAdjustment}>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                                    {adjustType === 'add' ? <Plus className="text-emerald-500" /> : 
                                     adjustType === 'deduct' ? <Minus className="text-red-500" /> : 
                                     <RefreshCw className="text-blue-500" />}
                                    {adjustType === 'add' ? 'Tambah Stok' : 
                                     adjustType === 'deduct' ? 'Kurangi Stok' : 
                                     'Update Total Stok'}
                                </DialogTitle>
                                <DialogDescription className="font-medium">
                                    Menyesuaikan persediaan untuk <span className="font-bold text-foreground">"{selectedInventory?.inventoryable.name}"</span>.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="quantity" className="font-bold">
                                        {adjustType === 'add' ? 'Jumlah Tambahan' : 
                                         adjustType === 'deduct' ? 'Jumlah Pengurangan' : 
                                         'Jumlah Total Baru'}
                                    </Label>
                                    <Input 
                                        id="quantity" 
                                        type="number"
                                        value={data.quantity} 
                                        onChange={e => setData('quantity', parseInt(e.target.value) || 0)}
                                        className="h-12 rounded-xl text-lg font-bold"
                                        min={adjustType === 'set' ? 0 : 1}
                                    />
                                    {errors.quantity && <p className="text-xs text-destructive font-medium">{errors.quantity}</p>}
                                </div>

                                {adjustType === 'add' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="cost" className="font-bold text-muted-foreground">Harga Beli per Unit (Opsional)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold opacity-40">Rp</span>
                                            <Input 
                                                id="cost" 
                                                type="number"
                                                value={data.cost} 
                                                onChange={e => setData('cost', e.target.value)}
                                                className="h-12 pl-10 rounded-xl font-bold"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="reason" className="font-bold">Alasan Penyesuaian</Label>
                                    <Input 
                                        id="reason" 
                                        value={data.reason} 
                                        onChange={e => setData('reason', e.target.value)}
                                        placeholder="Contoh: Restock, Barang Rusak, Koreksi Stok" 
                                        className="h-12 rounded-xl"
                                    />
                                    {errors.reason && <p className="text-xs text-destructive font-medium">{errors.reason}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing} className={`w-full h-12 rounded-xl font-black text-white shadow-lg ${
                                    adjustType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' :
                                    adjustType === 'deduct' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                                    'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                }`}>
                                    Konfirmasi Penyesuaian
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`rounded-3xl border shadow-sm ${className}`}>
            {children}
        </div>
    );
}
