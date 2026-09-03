<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetLimitRequest extends FormRequest
{
    public function authorize(): bool
    {
        // otorisasi detail (harus guardian dari user target) dicek di controller
        // via $this->user()->isGuardianOf($member) atau admin
        return $this->user()->isAdmin() || $this->user()->isOrangTua();
    }

    public function rules(): array
    {
        return [
            'daily_limit' => ['nullable', 'numeric', 'min:0'],
            'monthly_limit' => ['nullable', 'numeric', 'min:0'],
            'approval_threshold' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}