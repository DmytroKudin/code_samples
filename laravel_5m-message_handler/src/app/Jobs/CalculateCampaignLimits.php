<?php

namespace App\Jobs;

use App\Services\QueryBuilderService;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class CalculateCampaignLimits implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */

    private $campaign;
    private QueryBuilderService $queryBuilderService;

    public function __construct($campaign)
    {
        $this->onQueue('campaign');
        $this->campaign=$campaign;
        $this->queryBuilderService = resolve(QueryBuilderService::class);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $limits = $this->queryBuilderService->getMinMax($this->campaign);
            $maxId = $limits['max'];
            $minId = $limits['min'];

            $resultArr = [$this->campaign['name'] => ['min' => $minId, 'max' => $maxId]];

            Redis::command('RPUSH',["campaign_limits", json_encode($resultArr)]);
        } catch (\Exception $exception) {
            Log::info("\nCalculateCampaignLimitsERROR: ".$exception->getMessage());
        }
    }
}
