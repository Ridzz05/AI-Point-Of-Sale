<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterService
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.api_key') ?? env('OPENROUTER_API_KEY');
        $this->model = config('services.openrouter.model') ?? env('OPENROUTER_MODEL', 'google/gemini-2.5-pro');
        $this->baseUrl = 'https://openrouter.ai/api/v1';
    }

    public function processTransactionPrompt(string $prompt, array $availableProducts): array
    {
        $systemPrompt = $this->buildSystemPrompt($availableProducts);

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
                'HTTP-Referer' => request()->getHost(),
                'X-Title' => 'SmartPOS',
            ])->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt,
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.1, // Lower temperature for more consistent JSON
                'max_tokens' => 1000,
                'response_format' => [
                    'type' => 'json_object',
                ],
            ]);

            if (!$response->successful()) {
                $errorBody = $response->json();
                $errorMessage = $errorBody['error']['message'] ?? ($errorBody['error']['metadata']['raw'] ?? $response->body());

                Log::error('OpenRouter API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('Failed to process AI request: ' . $errorMessage);
            }

            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? null;

            if (!$content) {
                throw new \Exception('No content in AI response');
            }

            // Log raw response for debugging
            Log::debug('AI Raw Response', ['content' => $content]);

            return json_decode($content, true) ?? [];
        } catch (\Exception $e) {
            Log::error('OpenRouter Service Error', [
                'message' => $e->getMessage(),
                'prompt' => $prompt,
            ]);
            throw $e;
        }
    }

    protected function buildSystemPrompt(array $products): string
    {
        $productList = collect($products)->map(function ($product) {
            $description = strlen($product['description']) > 100
                ? substr($product['description'], 0, 100) . '...'
                : $product['description'];
            return "- ID: {$product['id']}, Nama: {$product['name']}, Kategori: {$product['category']}, Harga: {$product['price']}, Stok: {$product['stock']}, Deskripsi: {$description}";
        })->implode("\n");

        if (empty($productList)) {
            $productList = "TIDAK ADA PRODUK TERSEDIA SAAT INI.";
        }

        return <<<PROMPT
Anda adalah asisten operasi SmartPOS yang sangat cerdas. Anda dapat menangani tiga jenis perintah utama:
1. **Transaksi (TRANSACTION)**: Menjual produk ke pelanggan.
2. **Cek Inventaris (INVENTORY_CHECK)**: Memberikan daftar produk yang tersedia atau mencari produk tertentu.
3. **Analisis Bisnis (ANALYSIS)**: Menganalisa stok, memberikan rekomendasi, atau merangkum kondisi produk.

Daftar Produk Saat Ini:
{$productList}

Aturan Penanganan Intent:
- **TRANSACTION**: Ekstrak item, kuantitas, dan hitung subtotal. Pastikan stok cukup.
- **INVENTORY_CHECK**: Jika user bertanya "produk apa saja", berikan daftar ringkas dalam field 'message' atau 'data'.
- **ANALYSIS**: Analisa data produk di atas. Misal: sebutkan produk dengan stok paling sedikit, atau kategori yang paling dominan.

Format JSON yang HARUS dikembalikan:
{
    "intent": "transaction | inventory_check | analysis",
    "success": true,
    "message": "Pesan ringkasan untuk pengguna",
    "items": [ // Hanya untuk intent 'transaction'
        {
            "product_id": 1,
            "name": "Nama Produk",
            "quantity": 2,
            "price": 25000,
            "subtotal": 50000
        }
    ],
    "total_amount": 50000, // Total untuk 'transaction'
    "data": { // Digunakan untuk 'inventory_check' atau 'analysis'
        "highlights": ["Poin analisa 1", "Poin analisa 2"],
        "recommended_action": "Tindakan yang disarankan"
    }
}

Aturan Khusus:
1. Gunakan Bahasa Indonesia yang profesional dan ramah.
2. Jika stok habis atau produk tidak ada (untuk TRANSACTION), set "success": false.
3. Untuk ANALYSIS, jadilah analitis. Misal: "Ada 2 produk dengan stok di bawah 5 (Latte, Croissant). Disarankan restock segera."

Kembalikan HANYA JSON.
PROMPT;
    }
}
