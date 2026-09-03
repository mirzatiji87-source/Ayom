<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Wallet;

class WalletPolicy
{
    public function manage(User $actor, Wallet $wallet): bool
    {
        if ($actor->isAdmin()) {
            return true;
        }

        return $actor->isGuardianOf($wallet->user);
    }
}