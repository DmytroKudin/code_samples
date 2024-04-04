<?php

namespace App\Jobs;

use App\Services\QueryBuilderService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateCampaignChunks implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */

    private $validCampaigns;
    private $queryBuilderService;
    public function __construct($validCampaigns)
    {
        $this->onQueue('campaign');
        $this->validCampaigns = $validCampaigns;
        $this->queryBuilderService = resolve(QueryBuilderService::class);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $limits = collect([]);
        Log::info(json_encode($limits));
        return;

        foreach ($this->validCampaigns as $campaign) {
            $response = $this->queryBuilderService->getMinMax($campaign);
            $maxId = $response['max'];
            $minId = $response['min'];

            $limits[$campaign['name']] = ['min' => $minId, 'max' => $maxId];
        }

        $maxDiffItem = $limits->values()->map(function ($item, $key) {
            $item['diff'] = $item['max'] - $item['min'];
            $item['name'] = $key; // Keep track of the key/campaign name
            return $item;
        })->reduce(function ($carry, $item) {
            return $carry === null || $item['diff'] > $carry['diff'] ? $item : $carry;
        });

        $steps = round($maxDiffItem['diff']/config('database.hippomailer_limits.chunk_limit')) + 1;
        for($i=0; $i<=$steps; $i++) {
            foreach ($this->validCampaigns as $campaign) {
                $from = $limits[$campaign['name']]['min'] + $i * config('database.hippomailer_limits.chunk_limit');
                $to = $from + config('database.hippomailer_limits.chunk_limit');

                if ($from>$limits[$campaign['name']]['max']) {
                    continue;
                }

                $whereBetween = [
                    [
                        'type' => 'whereBetween',
                        'column' => 'id',
                        'values' => [$from, $to]
                    ]
                ];

                $requestParams = [...$campaign];
                $requestParams['conditions'] = [...$whereBetween, ...$requestParams['conditions']];

                ActivityEventResultHandler::dispatch($requestParams);
            }
        }
    }
}
