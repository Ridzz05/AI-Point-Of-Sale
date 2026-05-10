<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Customer;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $transactions = Transaction::with(['customer', 'project'])
            ->when($search, function($query, $search) {
                $query->whereHas('customer', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('project', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhere('amount', 'like', "%{$search}%");
            })
            ->latest()
            ->get();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'customers' => Customer::select('id', 'name')->get(),
            'projects' => Project::select('id', 'name')->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'project_id' => 'nullable|exists:projects,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:Pending,Paid,Cancelled',
            'invoice_url' => 'nullable|url',
            'attachment' => 'nullable|file|max:2048',
        ]);

        if ($request->hasFile('attachment')) {
            $validated['attachment_path'] = $request->file('attachment')->store('attachments', 'public');
        }

        Transaction::create($validated);

        return redirect()->back()->with('success', 'Transaction created successfully.');
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'project_id' => 'nullable|exists:projects,id',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:Pending,Paid,Cancelled',
            'invoice_url' => 'nullable|url',
            'attachment' => 'nullable|file|max:2048',
        ]);

        if ($request->hasFile('attachment')) {
            $validated['attachment_path'] = $request->file('attachment')->store('attachments', 'public');
        }

        $transaction->update($validated);

        return redirect()->back()->with('success', 'Transaction updated successfully.');
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();

        return redirect()->back()->with('success', 'Transaction deleted successfully.');
    }
}
