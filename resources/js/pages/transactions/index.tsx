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
import { Plus, Trash2, Edit, ExternalLink, Paperclip, Search } from "lucide-react"
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { useState, useEffect } from "react"

interface Transaction {
    id: number;
    customer_id: number;
    amount: number;
    status: 'Pending' | 'Paid' | 'Cancelled';
    invoice_url: string | null;
    attachment_path: string | null;
    customer?: { id: number; name: string };
    created_at: string;
}

export default function Index({ transactions, customers, filters }: PageProps<{ 
    transactions: Transaction[], 
    customers: {id: number, name: string}[],
    filters: { search?: string }
}>) {
    const [search, setSearch] = useState(filters.search || '');
    const [isOpen, setIsOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        customer_id: '',
        amount: '',
        status: 'Pending' as Transaction['status'],
        invoice_url: '',
        attachment: null as File | null,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(route('transactions.index'), { search }, {
                    preserveState: true,
                    replace: true
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTransaction) {
            put(route('transactions.update', editingTransaction.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditingTransaction(null);
                    reset();
                },
            });
        } else {
            post(route('transactions.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const onEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setData({
            customer_id: transaction.customer_id.toString(),
            amount: transaction.amount.toString(),
            status: transaction.status,
            invoice_url: transaction.invoice_url || '',
        });
        setIsOpen(true);
    };

    const onDelete = (id: number) => {
        destroy(route('transactions.destroy', id));
    };

    return (
        <AuthenticatedLayout
            header="Transactions"
        >
            <Head title="Transactions" />

            <div className="flex flex-col gap-6 p-4 md:p-6 pt-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
                        <p className="text-sm text-muted-foreground">Monitor sales and handle invoices.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search transactions..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        
                        <Dialog open={isOpen} onOpenChange={(open) => {
                            setIsOpen(open);
                            if (!open) {
                                setEditingTransaction(null);
                                reset();
                                clearErrors();
                            }
                        }}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={onSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
                                    <DialogDescription>
                                        Record a new payment or update existing transaction details.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Field>
                                        <FieldLabel htmlFor="customer_id">Customer</FieldLabel>
                                        <Select
                                            value={data.customer_id}
                                            onValueChange={value => setData('customer_id', value)}
                                        >
                                            <SelectTrigger id="customer_id">
                                                <SelectValue placeholder="Select Customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map(customer => (
                                                    <SelectItem key={customer.id} value={customer.id.toString()}>{customer.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.customer_id && <FieldDescription className="text-red-500">{errors.customer_id}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="amount">Amount (IDR)</FieldLabel>
                                        <Input 
                                            id="amount" 
                                            type="number"
                                            value={data.amount} 
                                            onChange={e => setData('amount', e.target.value)}
                                            placeholder="500000" 
                                        />
                                        {errors.amount && <FieldDescription className="text-red-500">{errors.amount}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="status">Status</FieldLabel>
                                        <Select
                                            value={data.status}
                                            onValueChange={value => setData('status', value as any)}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Paid">Paid</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <FieldDescription className="text-red-500">{errors.status}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="invoice_url">Invoice URL (Link)</FieldLabel>
                                        <Input 
                                            id="invoice_url" 
                                            type="url"
                                            value={data.invoice_url} 
                                            onChange={e => setData('invoice_url', e.target.value)}
                                            placeholder="https://..." 
                                        />
                                        {errors.invoice_url && <FieldDescription className="text-red-500">{errors.invoice_url}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="attachment">Attachment (Proof of Payment)</FieldLabel>
                                        <Input 
                                            id="attachment" 
                                            type="file"
                                            onChange={e => setData('attachment', e.target.files?.[0] || null)}
                                        />
                                        {errors.attachment && <FieldDescription className="text-red-500">{errors.attachment}</FieldDescription>}
                                    </Field>
                                </div>
                                <DialogFooter className="mt-6">
                                    <Button type="submit" disabled={processing} className="w-full">
                                        {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

                {/* Mobile View: Cards */}
                <div className="grid gap-4 md:hidden">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center border rounded-lg bg-card text-muted-foreground">
                            No transactions found.
                        </div>
                    ) : (
                        transactions.map((transaction) => (
                            <div key={transaction.id} className="p-4 border rounded-lg bg-card shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">{new Date(transaction.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        <h3 className="font-bold text-lg text-primary">Rp {new Intl.NumberFormat('id-ID').format(transaction.amount)}</h3>
                                    </div>
                                    <Badge variant={
                                        transaction.status === 'Paid' ? 'default' :
                                        transaction.status === 'Pending' ? 'secondary' : 'destructive'
                                    }>
                                        {transaction.status}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-2 text-sm border-y py-3">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Customer</p>
                                        <p className="font-medium truncate">{transaction.customer?.name || '-'}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex gap-3">
                                        {transaction.invoice_url && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={transaction.invoice_url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 mr-1.5" /> Invoice
                                                </a>
                                            </Button>
                                        )}
                                        {transaction.attachment_path && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`/storage/${transaction.attachment_path}`} target="_blank" rel="noopener noreferrer">
                                                    <Paperclip className="h-4 w-4 mr-1.5" /> Proof
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="w-[90vw] max-w-md rounded-lg">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                                                    <AlertDialogDescription>Are you sure?</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDelete(transaction.id)} className="bg-red-500">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Docs</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="text-sm">{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{transaction.customer?.name || '-'}</TableCell>
                                    <TableCell>Rp {new Intl.NumberFormat('id-ID').format(transaction.amount)}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            transaction.status === 'Paid' ? 'default' :
                                            transaction.status === 'Pending' ? 'secondary' : 'destructive'
                                        }>
                                            {transaction.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {transaction.invoice_url && (
                                                <a href={transaction.invoice_url} target="_blank" rel="noopener noreferrer" title="View Invoice">
                                                    <ExternalLink className="h-4 w-4 text-blue-500 hover:text-blue-600" />
                                                </a>
                                            )}
                                            {transaction.attachment_path && (
                                                <a href={`/storage/${transaction.attachment_path}`} target="_blank" rel="noopener noreferrer" title="View Attachment">
                                                    <Paperclip className="h-4 w-4 text-muted-foreground hover:text-blue-500" />
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                                                        <AlertDialogDescription>Are you sure?</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDelete(transaction.id)} className="bg-red-500">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
