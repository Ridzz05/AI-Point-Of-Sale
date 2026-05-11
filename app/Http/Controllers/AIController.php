<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\Customer;
use App\Models\Project;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AIController extends Controller
{
    public function index()
    {
        $messages = ChatMessage::where('user_id', Auth::id())
            ->orWhereNull('user_id')
            ->oldest()
            ->get(['role', 'content']);

        return Inertia::render('ai/index', [
            'initialMessages' => $messages
        ]);
    }

    public function getInsight()
    {
        $apiKey = config('services.openrouter.key');
        
        if (!$apiKey) {
            return response()->json(['insight' => 'API Key belum dikonfigurasi.']);
        }

        $context = $this->getSystemContext();
        
        try {   
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name'),
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'poolside/laguna-xs.2:free',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $context . "\n\nCOMMAND: Berikan 1 ringkasan singkat (maksimal 3 kalimat) tentang kondisi bisnis saat ini dan 1 saran strategis. Gunakan bahasa yang santai tapi profesional. Panggil user dengan 'Boss' atau 'Tim'. Wajib Bahasa Indonesia."
                    ],
                    [
                        'role' => 'user',
                        'content' => "Berikan insight dashboard hari ini."
                    ]
                ],
                'max_tokens' => 200,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'insight' => $data['choices'][0]['message']['content']
                ]);
            }

            Log::error('OpenRouter Insight Error: ' . $response->body());
            return response()->json(['insight' => 'Gagal mengambil insight saat ini. Cek log sistem.']);

        } catch (\Exception $e) {
            return response()->json(['insight' => 'Error: ' . $e->getMessage()]);
        }
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        // 1. Save User Message to Database
        ChatMessage::create([
            'role' => 'user',
            'content' => $request->message,
            'user_id' => Auth::id(),
        ]);

        $apiKey = config('services.openrouter.key');
        
        if (!$apiKey) {
            return response()->json([
                'error' => 'OpenRouter API Key not found. Please add OPENROUTER_API_KEY to your .env file.'
            ], 500);
        }

        // Gather context from the system
        $context = $this->getSystemContext();

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name'),
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => 'poolside/laguna-xs.2:free',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $context
                    ],
                    [
                        'role' => 'user',
                        'content' => $request->message
                    ]
                ],
                'max_tokens' => 10000,
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $aiContent = $data['choices'][0]['message']['content'];

                // 2. Save AI Response to Database
                ChatMessage::create([
                    'role' => 'assistant',
                    'content' => $aiContent,
                    'user_id' => Auth::id(),
                ]);

                return response()->json($data);
            }

            Log::error('OpenRouter Chat Error: ' . $response->body());
            return response()->json([
                'error' => 'Failed to communicate with AI: ' . $response->body()
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'AI Error: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getSystemContext()
    {
        // Aggregating Data for AI Context
        $customersCount = Customer::count();
        $leadsCount = Customer::where('status', 'Lead')->count();
        $activeCustomers = Customer::where('status', 'Active')->count();
        
        $projectsCount = Project::count();
        $projectsInProgress = Project::where('status', 'In Progress')->count();
        $completedProjects = Project::where('status', 'Completed')->count();
        
        $totalRevenue = Transaction::where('status', 'Paid')->sum('amount');
        $pendingRevenue = Transaction::where('status', 'Pending')->sum('amount');

        $activeProjectsList = Project::where('status', 'In Progress')->with('customer')->latest()->take(5)->get()
            ->map(fn($p) => "- {$p->name} (Client: {$p->customer->name}, Progress: {$p->progress}%)")
            ->implode("\n");

        $recentTransactions = Transaction::with('customer')->latest()->take(3)->get()
            ->map(fn($t) => "- IDR " . number_format($t->amount, 0, ',', '.') . " for client {$t->customer->name} (Status: {$t->status})")
            ->implode("\n");

        return "You are 'KitaAI', a Senior Business & CRM Analyst for the 'AI-Smart-Agency-Dashboard' system. 
        Your primary goal is to help the agency administrator manage their business effectively.

        TEAM ROLES:
        - Rizki (Ki): Lead Developer & System Architect.
        - Jonathan (Jo/Jojo): Client Manager.
        - Nathan (Nath/Than): Marketing Consultant.

        CORE SYSTEM KNOWLEDGE:
        - CUSTOMERS: Total: {$customersCount} (Active: {$activeCustomers}, Leads: {$leadsCount})
        - PROJECTS: Total: {$projectsCount} (In Progress: {$projectsInProgress}, Completed: {$completedProjects})
        - FINANCIALS: Total Revenue: IDR " . number_format($totalRevenue, 0, ',', '.') . ", Pending: IDR " . number_format($pendingRevenue, 0, ',', '.') . "

        DETAILED CONTEXT:
        Active Projects:\n{$activeProjectsList}
        Recent Transactions:\n{$recentTransactions}

        YOUR BEHAVIOR RULES:
        1. FOCUS: Always prioritize answering based on the CRM data provided above.
        2. TONE: Professional, analytical, but friendly. You may use the team's nicknames (Ki, Jo, Nath) to make the conversation feel more internal and collaborative.
        3. GENERAL KNOWLEDGE: You can answer general business questions but relate them to this CRM.
        4. DATA LIMITS: If the user asks for specific data NOT listed in your context (like a specific transaction from 2 years ago), politely tell them to check the 'Transactions' or 'Projects' module for more details.
        5. FORMAT: Use bullet points for lists and keep paragraphs short.
        6. LANGUAGE: Always respond using Indonesian language (Bahasa Indonesia) ONLY.

        You are now ready to assist the Administrator.";
    }
}
