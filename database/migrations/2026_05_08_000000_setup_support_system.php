<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add role to users
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('admin')->after('email');
        });

        // Create support_conversations
        Schema::create('support_conversations', function (Blueprint $table) {
            $table->id();
            $table->string('guest_name');
            $table->string('guest_email')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['open', 'pending', 'closed'])->default('open');
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        // Create support_messages
        Schema::create('support_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('support_conversations')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); 
            $table->enum('sender_type', ['guest', 'agent']);
            $table->text('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_messages');
        Schema::dropIfExists('support_conversations');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
