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
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, Edit, Search } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
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
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Project {
    id: number;
    customer_id: number;
    name: string;
    description: string | null;
    status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
    deadline: string | null;
    progress: number;
    customer?: {
        id: number;
        name: string;
    }
}

export default function Index({ projects, customers, filters }: PageProps<{ 
    projects: Project[], 
    customers: {id: number, name: string}[],
    filters: { search?: string }
}>) {
    const [search, setSearch] = useState(filters.search || '');
    const [isOpen, setIsOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        customer_id: '',
        name: '',
        description: '',
        status: 'Planning' as Project['status'],
        deadline: '',
        progress: 0,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(route('projects.index'), { search }, {
                    preserveState: true,
                    replace: true
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            put(route('projects.update', editingProject.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditingProject(null);
                    reset();
                },
            });
        } else {
            post(route('projects.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const onEdit = (project: Project) => {
        setEditingProject(project);
        setData({
            customer_id: project.customer_id.toString(),
            name: project.name,
            description: project.description || '',
            status: project.status,
            deadline: project.deadline || '',
            progress: project.progress,
        });
        setIsOpen(true);
    };

    const onDelete = (id: number) => {
        destroy(route('projects.destroy', id));
    };

    return (
        <AuthenticatedLayout
            header="Projects"
        >
            <Head title="Projects" />

            <div className="flex flex-col gap-6 p-4 md:p-6 pt-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
                        <p className="text-sm text-muted-foreground">Manage your active projects and track progress.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search projects..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        
                        <Dialog open={isOpen} onOpenChange={(open) => {
                            setIsOpen(open);
                            if (!open) {
                                setEditingProject(null);
                                reset();
                                clearErrors();
                            }
                        }}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Add Project
                            </Button>
                        </DialogTrigger>
                        {/* ... DialogContent remains the same ... */}
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={onSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below to {editingProject ? 'update the' : 'create a new'} project.
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
                                        <FieldLabel htmlFor="name">Project Name</FieldLabel>
                                        <Input 
                                            id="name" 
                                            value={data.name} 
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Website Redesign" 
                                        />
                                        {errors.name && <FieldDescription className="text-red-500">{errors.name}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="description">Description</FieldLabel>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Project details..."
                                        />
                                        {errors.description && <FieldDescription className="text-red-500">{errors.description}</FieldDescription>}
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
                                                <SelectItem value="Planning">Planning</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="On Hold">On Hold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <FieldDescription className="text-red-500">{errors.status}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <div className="flex justify-between">
                                            <FieldLabel htmlFor="progress">Progress ({data.progress}%)</FieldLabel>
                                        </div>
                                        <div className="pt-2">
                                            <Slider
                                                id="progress"
                                                min={0}
                                                max={100}
                                                step={1}
                                                value={[data.progress]}
                                                onValueChange={(value) => setData('progress', value[0])}
                                            />
                                        </div>
                                        {errors.progress && <FieldDescription className="text-red-500">{errors.progress}</FieldDescription>}
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
                                        <div className="flex flex-col gap-2 pt-1">
                                            <Popover modal={true}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal h-10",
                                                            !data.deadline && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {data.deadline ? format(new Date(data.deadline), "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={data.deadline ? new Date(data.deadline) : undefined}
                                                        onSelect={(date) => setData('deadline', date ? format(date, 'yyyy-MM-dd') : '')}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        {errors.deadline && <FieldDescription className="text-red-500">{errors.deadline}</FieldDescription>}
                                    </Field>
                                </div>
                                <DialogFooter className="mt-6">
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {editingProject ? 'Update Project' : 'Save Project'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

                {/* Mobile View: Cards */}
                <div className="grid gap-4 md:hidden">
                    {projects.length === 0 ? (
                        <div className="p-8 text-center border rounded-lg bg-card text-muted-foreground">
                            No projects found.
                        </div>
                    ) : (
                        projects.map((project) => (
                            <div key={project.id} className="p-4 border rounded-lg bg-card shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{project.name}</h3>
                                        <p className="text-sm text-muted-foreground">{project.customer?.name || 'No Customer'}</p>
                                    </div>
                                    <Badge variant={
                                        project.status === 'Completed' ? 'default' :
                                        project.status === 'In Progress' ? 'secondary' : 'outline'
                                    }>
                                        {project.status}
                                    </Badge>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>Progress</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-2" />
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <div className="text-xs text-muted-foreground">
                                        <p>Deadline</p>
                                        <p className="font-medium text-foreground">{project.deadline || '-'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
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
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Delete <strong>{project.name}</strong>?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDelete(project.id)} className="bg-red-500">
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
                                <TableHead>Project Name</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">{project.name}</TableCell>
                                    <TableCell>{project.customer?.name || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            project.status === 'Completed' ? 'default' :
                                            project.status === 'In Progress' ? 'secondary' : 'outline'
                                        }>
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="w-[150px]">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-muted-foreground">{project.progress}%</span>
                                            <Progress value={project.progress} className="h-1.5" />
                                        </div>
                                    </TableCell>
                                    <TableCell>{project.deadline || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(project)}>
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
                                                            This will delete the project <strong>{project.name}</strong>.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDelete(project.id)} className="bg-red-500">
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
