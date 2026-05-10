import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit, Search } from "lucide-react"
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
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    status: 'Lead' | 'Active' | 'Past';
}

export default function Index({ customers, filters }: PageProps<{ 
    customers: Customer[],
    filters: { search?: string }
}>) {
    const [search, setSearch] = useState(filters.search || '');
    const [isOpen, setIsOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'Lead' as Customer['status'],
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(route('customers.index'), { search }, {
                    preserveState: true,
                    replace: true
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCustomer) {
            put(route('customers.update', editingCustomer.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditingCustomer(null);
                    reset();
                },
            });
        } else {
            post(route('customers.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const onEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            address: customer.address || '',
            status: customer.status,
        });
        setIsOpen(true);
    };

    const onDelete = (id: number) => {
        destroy(route('customers.destroy', id));
    };

    return (
        <AuthenticatedLayout
            header="Customers"
        >
            <Head title="Customers" />

            <div className="flex flex-col gap-6 p-4 md:p-6 pt-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                        <p className="text-sm text-muted-foreground">Manage your client relationships and leads.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search customers..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        
                        <Dialog open={isOpen} onOpenChange={(open) => {
                            setIsOpen(open);
                            if (!open) {
                                setEditingCustomer(null);
                                reset();
                                clearErrors();
                            }
                        }}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Add Customer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={onSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below to {editingCustomer ? 'update the' : 'create a new'} customer.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <Field>
                                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                        <Input 
                                            id="name" 
                                            value={data.name} 
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="John Doe" 
                                        />
                                        {errors.name && <FieldDescription className="text-red-500">{errors.name}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="email">Email Address</FieldLabel>
                                        <Input 
                                            id="email" 
                                            type="email" 
                                            value={data.email} 
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="john@example.com" 
                                        />
                                        {errors.email && <FieldDescription className="text-red-500">{errors.email}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                                        <Input 
                                            id="phone" 
                                            value={data.phone} 
                                            onChange={e => setData('phone', e.target.value)}
                                            placeholder="+62..." 
                                        />
                                        {errors.phone && <FieldDescription className="text-red-500">{errors.phone}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="address">Address</FieldLabel>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            placeholder="Full address..."
                                        />
                                        {errors.address && <FieldDescription className="text-red-500">{errors.address}</FieldDescription>}
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
                                                <SelectItem value="Lead">Lead</SelectItem>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Past">Past</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <FieldDescription className="text-red-500">{errors.status}</FieldDescription>}
                                    </Field>
                                </div>
                                <DialogFooter className="mt-6">
                                    <Button type="submit" disabled={processing} className="w-full">
                                        {editingCustomer ? 'Update Customer' : 'Save Customer'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

                {/* Mobile View: Cards */}
                <div className="grid gap-4 md:hidden">
                    {customers.length === 0 ? (
                        <div className="p-8 text-center border rounded-lg bg-card text-muted-foreground">
                            No customers found.
                        </div>
                    ) : (
                        customers.map((customer) => (
                            <div key={customer.id} className="p-4 border rounded-lg bg-card shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{customer.name}</h3>
                                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                                    </div>
                                    <Badge variant={
                                        customer.status === 'Active' ? 'default' :
                                        customer.status === 'Lead' ? 'secondary' : 'outline'
                                    }>
                                        {customer.status}
                                    </Badge>
                                </div>
                                
                                <div className="text-sm">
                                    <p className="text-muted-foreground">Phone</p>
                                    <p className="font-medium">{customer.phone || '-'}</p>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t">
                                    <Button variant="outline" size="sm" onClick={() => onEdit(customer)}>
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                    
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="w-[90vw] max-w-md rounded-lg">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete <strong>{customer.name}</strong>?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDelete(customer.id)} className="bg-red-500">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.phone || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            customer.status === 'Active' ? 'default' :
                                            customer.status === 'Lead' ? 'secondary' : 'outline'
                                        }>
                                            {customer.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(customer)}>
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
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Delete <strong>{customer.name}</strong>?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDelete(customer.id)} className="bg-red-500">
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
