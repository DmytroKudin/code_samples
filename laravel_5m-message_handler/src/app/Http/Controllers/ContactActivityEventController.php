<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateCampaignChunks;
use App\Services\QueryBuilderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Process;


class ContactActivityEventController extends Controller
{
    /**
     * @throws \Throwable
     */
    public function initiateJob (Request $request) {
        Cache::forever('globalEmailsCount', 0);
        Process::path(storage_path())->run('rm logs/laravel.log');
        $campaigns=$request->get('campaigns');
        $queryBuilderService = resolve(QueryBuilderService::class);
        $validCampaigns = $queryBuilderService->transformCampaigns($campaigns);
        GenerateCampaignChunks::dispatch($validCampaigns);

        return response()->json(['status'=>200]);
    }
}
