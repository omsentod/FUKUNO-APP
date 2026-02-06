<?php

namespace App\Providers;
use Illuminate\Support\Facades\View;
use App\View\Composers\NotificationComposer;
use Carbon\Carbon;
use Illuminate\Support\ServiceProvider;

use Illuminate\Pagination\Paginator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();
        Carbon::setLocale('id');
        View::composer('layouts.nav-side', NotificationComposer::class);
    }
}
