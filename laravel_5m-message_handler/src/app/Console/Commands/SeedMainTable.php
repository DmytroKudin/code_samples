<?php

namespace App\Console\Commands;

use App\Models\ContactActivityEvent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SeedMainTable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:seed-main-table';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
//    public function handle()
//    {
//        $numberOfRecords = 1000000000;
//        $batchSize = 1000;
//
//        ContactActivityEvent::unsetEventDispatcher();
//        DB::connection()->disableQueryLog();
//
//
//        DB::beginTransaction();
//        try {
//            for ($i = 0; $i < $numberOfRecords / $batchSize; $i++) {
//                $res = ContactActivityEvent::factory($batchSize)->create();
//
//                if (($i + 1) % 10 === 0) { // Commit every 10 batches
//                    DB::commit();
//                    DB::beginTransaction();
//                }
//
//                $info = $this->formatmem(memory_get_usage());
//                $this->info('Items processed: '.$i * $batchSize.' | Memory: '.$info);
//                unset($res, $info);
//                gc_collect_cycles();
//            }
//            DB::commit(); // Ensure any remaining transactions are committed
//        } catch (\Exception $e) {
//            DB::rollBack();
//            $this->error('Error: ' . $e->getMessage());
//        }
//    }
//
//    private function formatmem($m)
//    {
//        if ($m) {
//            $unit = array('b', 'kb', 'mb', 'gb', 'tb', 'pb');
//            $m = @round($m / pow(1024, ($i = floor(log($m, 1024)))), 2).' '.$unit[$i];
//        }
//        return trim(str_pad($m, 15, ' ', STR_PAD_LEFT));
//    }


    public function handle()
    {
        $numberOfRecords = 1000000000;
        $batchSize = 1000; // Adjust based on your server's capability

        // Disable query logging to save memory
        DB::connection()->disableQueryLog();

        // Optional: Disable model events if not needed
        // ContactActivityEvent::unsetEventDispatcher();

        $this->info("Starting to seed {$numberOfRecords} records.");

        for ($i = 0; $i < $numberOfRecords / $batchSize; $i++) {
            // Use a transaction to bundle each batch insert
            DB::transaction(function () use ($batchSize) {
                ContactActivityEvent::factory($batchSize)->create();
            });

            // Output progress and memory usage
            if ($i % 100 === 0) {
                $currentMemoryUsage = $this->formatMemory(memory_get_usage(true));
                $this->info("Processed " . ($i * $batchSize) . " records. Memory Usage: {$currentMemoryUsage} MB");
            }

            // Manually trigger garbage collection
            if ($i % 1000 === 0) {
                gc_collect_cycles();
            }
        }

        $this->info("Completed seeding {$numberOfRecords} records.");
    }

    /**
     * Format bytes into megabytes.
     *
     * @param int $bytes The number of bytes.
     * @return string The memory usage in megabytes.
     */
    protected function formatMemory($bytes)
    {
        return number_format($bytes / 1024 / 1024, 2) . ' MB';
    }

}
