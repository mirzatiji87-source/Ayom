<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Hanya lansia/remaja yang boleh membuat pengeluaran atas nama diri sendiri.
        return in_array($this->user()->role, ['lansia', 'remaja']);
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1'],
            'category' => [
                'required',
                Rule::in(['makanan', 'transportasi', 'hiburan', 'tagihan', 'kesehatan', 'pendidikan', 'lainnya']),
            ],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}