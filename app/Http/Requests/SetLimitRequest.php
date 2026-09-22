<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetLimitRequest extends FormRequest
{
    /**
     * Otorisasi akses ditangani lewat WalletPolicy::manage() di controller
     * (WalletController::setLimit memanggil $this->authorize('manage', $wallet)),
     * jadi di sini cukup true - form request ini fokus ke validasi input saja.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'daily_limit' => ['nullable', 'numeric', 'min:0'],
            'monthly_limit' => ['nullable', 'numeric', 'min:0'],
            'approval_threshold' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'daily_limit.numeric' => 'Limit harian harus berupa angka.',
            'monthly_limit.numeric' => 'Limit bulanan harus berupa angka.',
            'approval_threshold.numeric' => 'Ambang approval harus berupa angka.',
        ];
    }
}