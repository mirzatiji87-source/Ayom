<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin() || $this->user()->isOrangTua();
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::in(['listrik', 'air', 'bpjs', 'obat', 'internet', 'lainnya'])],
            'amount' => ['required', 'numeric', 'min:1'],
            'frequency' => ['required', Rule::in(['daily', 'weekly', 'monthly'])],
            'next_due_date' => ['required', 'date'],
            'auto_pay' => ['boolean'],
        ];
    }
}