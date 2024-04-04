<?php

namespace App\Jobs;

use App\Services\QueryBuilderService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use mysql_xdevapi\Exception;

class ProcessCompany implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $requestParams;
    private QueryBuilderService $queryBuilderService;

    /**
     * Create a new job instance.
     */
    public function __construct($requestParams)
    {
        $this->onQueue('company');
        $this->requestParams = $requestParams;
        $this->queryBuilderService = resolve(QueryBuilderService::class);;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $this->fitRequestParams();

            file_put_contents('nette.safe://storage/logs/time_'.$this->requestParams['name'].'.txt',"\n\n\n\n\n============ NEW RUN =============\n", FILE_APPEND);
            file_put_contents("nette.safe://storage/result/{$this->requestParams['name']}.csv", "email\n");

            $limits = $this->queryBuilderService->getMinMax($this->requestParams);
            $maxId = $limits['max'];
            $minId = $limits['min'];

            $step = config('database.hippomailer_limits.chunk_limit');
            $startTimeCampaign = "startTimeCampaign_{$this->requestParams['name']}";
            $startTimeJob = "startTimeJob_{$this->requestParams['name']}";

            Cache::forever($startTimeCampaign, time());
            Cache::forever($startTimeJob, time());

            for ($i = $minId; $i <= $maxId; $i += $step) {
                $curValue = Cache::get($this->requestParams['name']);
                if ($curValue >=config('database.hippomailer_limits.email_limit')) {
                    if (Cache::get($startTimeCampaign)) {
                        file_put_contents('nette.safe://storage/logs/time_'.$this->requestParams['name'].'.txt',"\n\n\nRESULT_TIME_CAMPAIGN: ".time()-Cache::get($startTimeCampaign)."\nCHUNK_NUMBER: ".config('database.hippomailer_limits.chunk_limit')."\nEMAIL_LIMIT: ".config('database.hippomailer_limits.email_limit')."\nPROCESSES_NUMBER: ".config('horizon.environments.local.supervisor-1.maxProcesses')-1, FILE_APPEND);
                        Cache::delete($startTimeCampaign);
                    }
                    return;
                }

                $from = $i;
                $to = $i + $step - 1;

                $whereBetween = [
                    [
                        'type' => 'whereBetween',
                        'column' => 'id',
                        'values' => [$from, $to]
                    ]
                ];

                $requestParams = [...$this->requestParams];
                $requestParams['conditions'] = [...$whereBetween, ...$requestParams['conditions']];

                ActivityEventResultHandler::dispatch($requestParams);
            }
        } catch (\Exception $e) {

            Log::info("!!!!==================".$e->getMessage());
        }
    }

    private function fitRequestParams(): void
    {
        foreach ($this->requestParams['campaigns'] as $campaignIndex  => $campaign) {
            foreach ($campaign['conditions'] as $conditionIndex => $condition) {
                switch ($condition['type']) {
                    case 'lastDays':
                    {
                        $days = $condition['value'];

                        $today = Carbon::today();

                        $from = $today->subDays($days)->format('Y-m-d H:i:s');
                        $to = $today->format('Y-m-d H:i:s');

                        $this->requestParams['campaigns'][$campaignIndex]['conditions'][$conditionIndex] = [
                            'type' => 'whereBetween',
                            'column' => $condition['column'],
                            'values' => [$from, $to]
                        ];

                        break;
                    }

                    case 'inMonth':
                    {
                        $month = $condition['value']; // Example: '2024-01' = January 2024

                        $startOfMonth = Carbon::createFromFormat('Y-m', $month)
                            ->startOfMonth()
                            ->format('Y-m-d H:i:s');
                        $endOfMonth = Carbon::createFromFormat('Y-m', $month)
                            ->endOfMonth()
                            ->format('Y-m-d H:i:s');

                        $this->requestParams['campaigns'][$campaignIndex]['conditions'][$conditionIndex] = [
                            'type' => 'whereBetween',
                            'column' => $condition['column'],
                            'values' => [$startOfMonth, $endOfMonth]
                        ];

                        break;
                    }

                    case 'lastMonths':
                    {
                        $months = $condition['value'] - 1;

                        $today = Carbon::today();

                        if ($months === 0) {
                            $from = $today
                                ->startOfMonth()
                                ->format('Y-m-d H:i:s');
                        } else {
                            $from = $today
                                ->subMonths($months)
                                ->startOfMonth()
                                ->format('Y-m-d H:i:s');
                        }

                        $to = Carbon::today()
                            ->format('Y-m-d H:i:s');

                        $this->requestParams['campaigns'][$campaignIndex]['conditions'][$conditionIndex] = [
                            'type' => 'whereBetween',
                            'column' => $condition['column'],
                            'values' => [$from, $to]
                        ];

                        break;
                    }
                }
            }
        }
    }
}
