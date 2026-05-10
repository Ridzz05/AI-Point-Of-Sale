<?php

namespace App\Http\Controllers;

use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SupportController extends Controller
{
    /**
     * Public: Initialize Chat
     */
    public function initChat(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        // Find an available CS agent (first user with role 'cs' or default to admin)
        $agent = User::where('role', 'cs')->first() ?? User::where('role', 'admin')->first();

        $conversation = SupportConversation::create([
            'guest_name' => $request->name,
            'guest_email' => $request->email,
            'assigned_to' => $agent?->id,
            'status' => 'open',
            'last_message_at' => now(),
        ]);

        return response()->json([
            'conversation' => $conversation,
            'agent' => $agent ? ['name' => $agent->name] : null
        ]);
    }

    /**
     * Public/Admin: Send Message
     */
    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string',
            'sender_type' => 'required|in:guest,agent',
        ]);

        $conversation = SupportConversation::findOrFail($id);
        
        $message = SupportMessage::create([
            'conversation_id' => $conversation->id,
            'user_id' => $request->sender_type === 'agent' ? Auth::id() : null,
            'sender_type' => $request->sender_type,
            'content' => $request->content,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json($message);
    }

    /**
     * Admin: List Conversations
     */
    public function adminIndex()
    {
        $conversations = SupportConversation::with(['agent'])
            ->orderBy('last_message_at', 'desc')
            ->get();

        return Inertia::render('support/index', [
            'conversations' => $conversations
        ]);
    }

    /**
     * Admin: View Messages in Conversation
     */
    public function getMessages($id)
    {
        $messages = SupportMessage::where('conversation_id', $id)
            ->oldest()
            ->get();

        return response()->json($messages);
    }

    /**
     * Admin: Close Conversation
     */
    public function closeChat($id)
    {
        $conversation = SupportConversation::findOrFail($id);
        $conversation->update(['status' => 'closed']);
        
        return response()->json(['success' => true]);
    }
}
