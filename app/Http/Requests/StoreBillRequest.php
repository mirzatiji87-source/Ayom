<?php

namespace App\Http\Requests;

use App\Models\Bill;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBillRequest extends FormRequest
{
    public function authorize(): bool
    {
        $actor = $this->user();

        if (! ($actor->isAdmin() || $actor->isOrangTua())) {
            return false;
        }

        // Saat update: pastikan tagihan yang diedit memang milik anggota yang boleh dikelola.
        $bill = $this->route('bill');
        if ($bill instanceof Bill) {
            return $actor->isAdmin() || $actor->isGuardianOf($bill->user);
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'exists:users,id',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $actor = $this->user();
                    $target = User::find($value);

                    if (! $target || $target->isAdmin()) {
                        return $fail('Anggota tidak valid.');
                    }

                    if (! $actor->isAdmin() && ! $actor->isGuardianOf($target)) {
                        return $fail('Anda tidak berhak mengelola tagihan untuk anggota ini.');
                    }

                    if ($target->isDeceased()) {
                        return $fail('Anggota ini sudah dilaporkan meninggal; tagihan tidak dapat dibuat atau diubah.');
                    }
                },
            ],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::in(['listrik', 'air', 'bpjs', 'obat', 'internet', 'lainnya'])],
            'amount' => ['required', 'numeric', 'min:1'],
            'frequency' => ['required', Rule::in(['daily', 'weekly', 'monthly'])],
            'next_due_date' => ['required', 'date'],
            'auto_pay' => ['boolean'],
        ];
    }
}