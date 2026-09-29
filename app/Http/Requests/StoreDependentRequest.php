<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDependentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->canCreateDependents();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['orang_tua', 'lansia', 'remaja'])],
            'phone' => ['nullable', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date'],
            // hanya admin yang boleh (dan wajib) memilih family_id manual
            'family_id' => [
                Rule::requiredIf(fn () => $this->user()->isAdmin()),
                'nullable',
                'exists:families,id',
            ],
            'daily_limit' => ['nullable', 'numeric', 'min:0'],
            'monthly_limit' => ['nullable', 'numeric', 'min:0'],
            'approval_threshold' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}