<?php

namespace App\Jobs;

use App\Services\QueryBuilderService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;

class ActivityEventResultHandler implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */

    private  $requestParams;
    private QueryBuilderService $queryBuilderService;

    public function __construct($requestParams)
    {
        $this->onQueue('mail');
        $this->requestParams = $requestParams;
        $this->queryBuilderService = resolve(QueryBuilderService::class);;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $curValue = Cache::get('globalEmailsCount');

            if ($curValue >= config('database.hippomailer_limits.email_limit')) {
                Log::info('FLUSH');
                Artisan::call('horizon:pause');
                Artisan::call("horizon:clear --queue=mail");
                Artisan::call('horizon:continue');

                return;
            }

            ini_set('memory_limit', '-1');
            $query = $this->queryBuilderService->getQuery($this->requestParams);
            $result = $query->pluck('email');
            $emails = implode(PHP_EOL, $result->toArray());

            if (!empty($emails)) {
                file_put_contents("nette.safe://storage/result/{$this->requestParams['name']}.csv", "$emails\n", FILE_APPEND);
            }

            $count = count($result->toArray());
            unset($result);
            unset($emails);

            $curValue = Cache::get('globalEmailsCount');
            $newValue = $curValue + $count;
            Cache::forever('globalEmailsCount', $newValue);

        } catch (\Exception $exception) {
            Log::info("QUEUE_EXCEPTION: ".$exception->getMessage()."\n\n\n");
        }
    }
}
