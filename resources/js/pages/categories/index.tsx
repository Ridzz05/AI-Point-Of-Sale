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
import { Plus, Trash2, Edit, Tag, Palette, ListNumbers, Info } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { 
    Tag as PhosphorTag,
    Palette as PhosphorPalette,
    ArrowsDownUp
} from "@phosphor-icons/react"

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    sort_order: number;
    is_active: boolean;
    active_products_count?: number;
}

export default function Index({ categories }: PageProps<{ categories: Category[] }>) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        color: '#3b82f6',
        icon: 'tag',
        sort_order: 0,
        is_active: true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('categories.update', editingCategory.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditingCategory(null);
                    reset();
                },
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const onEdit = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
            color: category.color || '#3b82f6',
            icon: category.icon || 'tag',
            sort_order: category.sort_order,
            is_active: category.is_active,
        });
        setIsOpen(true);
    };

    const onDelete = (id: number) => {
        destroy(route('categories.destroy', id));
    };

    return (
        <AuthenticatedLayout header="Categories">
            <Head title="Categories" />

            <div className="flex flex-col gap-8 p-4 md:p-8 pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Kategori Produk</h1>
                        <p className="text-muted-foreground font-medium">Kelola kategori untuk mengorganisir produk Anda.</p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={(open) => {
                        setIsOpen(open);
                        if (!open) {
                            setEditingCategory(null);
                            reset();
                            clearErrors();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
                                <Plus className="mr-2 h-5 w-5" /> Tambah Kategori
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-2xl">
                            <form onSubmit={onSubmit}>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">
                                        {editingCategory ? 'Edit Kategori' : 'Kategori Baru'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Isi detail kategori di bawah ini. Klik simpan jika sudah selesai.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="font-bold flex items-center gap-2">
                                            <Tag className="h-4 w-4" /> Nama Kategori
                                        </Label>
                                        <Input 
                                            id="name" 
                                            value={data.name} 
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Contoh: Makanan, Minuman, Elektronik" 
                                            className="h-11 rounded-lg"
                                        />
                                        {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description" className="font-bold flex items-center gap-2">
                                            <Info className="h-4 w-4" /> Deskripsi
                                        </Label>
                                        <Textarea 
                                            id="description" 
                                            value={data.description} 
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Deskripsi singkat kategori..." 
                                            className="rounded-lg min-h-[100px]"
                                        />
                                        {errors.description && <p className="text-xs text-destructive font-medium">{errors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="color" className="font-bold flex items-center gap-2">
                                                <Palette className="h-4 w-4" /> Warna
                                            </Label>
                                            <div className="flex gap-2 items-center">
                                                <Input 
                                                    id="color" 
                                                    type="color"
                                                    value={data.color} 
                                                    onChange={e => setData('color', e.target.value)}
                                                    className="h-11 w-11 p-1 rounded-lg cursor-pointer"
                                                />
                                                <Input 
                                                    value={data.color} 
                                                    onChange={e => setData('color', e.target.value)}
                                                    className="h-11 flex-1 font-mono uppercase"
                                                />
                                            </div>
                                            {errors.color && <p className="text-xs text-destructive font-medium">{errors.color}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="sort_order" className="font-bold flex items-center gap-2">
                                                <ListNumbers className="h-4 w-4" /> Urutan
                                            </Label>
                                            <Input 
                                                id="sort_order" 
                                                type="number"
                                                value={data.sort_order} 
                                                onChange={e => setData('sort_order', parseInt(e.target.value) || 0)}
                                                className="h-11 rounded-lg"
                                            />
                                            {errors.sort_order && <p className="text-xs text-destructive font-medium">{errors.sort_order}</p>}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing} className="w-full h-12 rounded-xl font-bold">
                                        {editingCategory ? 'Perbarui Kategori' : 'Simpan Kategori'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.length === 0 ? (
                        <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/30">
                            <PhosphorTag size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-xl font-bold">Belum ada kategori</h3>
                            <p className="text-muted-foreground">Mulai dengan menambahkan kategori pertama Anda.</p>
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div key={category.id} className="group relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="absolute top-0 right-0 p-6 opacity-5 transition-transform group-hover:scale-125 group-hover:rotate-12">
                                    <PhosphorTag size={80} weight="fill" style={{ color: category.color || '#3b82f6' }} />
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div 
                                            className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                                            style={{ backgroundColor: category.color || '#3b82f6', boxShadow: `0 8px 16px -4px ${category.color}44` }}
                                        >
                                            <Tag className="h-6 w-6" />
                                        </div>
                                        <Badge variant={category.is_active ? "secondary" : "outline"} className="rounded-full px-3 py-1 font-bold">
                                            {category.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </div>

                                    <h3 className="text-xl font-black mb-1">{category.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[2.5rem]">
                                        {category.description || 'Tidak ada deskripsi.'}
                                    </p>

                                    <div className="mt-auto pt-6 border-t flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">Produk</span>
                                            <span className="text-lg font-black">{category.active_products_count || 0}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-amber-50 hover:text-amber-600" onClick={() => onEdit(category)}>
                                                <Edit className="h-5 w-5" />
                                            </Button>
                                            
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-600">
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-3xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-2xl font-black">Hapus Kategori?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tindakan ini tidak dapat dibatalkan. Kategori <span className="font-bold text-foreground">"{category.name}"</span> akan dihapus secara permanen.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-xl font-bold">Batal</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => onDelete(category.id)} 
                                                            className="bg-red-600 hover:bg-red-700 rounded-xl font-bold"
                                                            disabled={category.active_products_count ? category.active_products_count > 0 : false}
                                                        >
                                                            Hapus
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
