<?php

namespace App\Console\Commands;

use App\Models\ContactActivityEventSmall;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SeedSmallTable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:seed-small-table';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $numberOfRecords = 100000;
        $batchSize = 1000; // Adjust based on your server's capability

        // Disable query logging to save memory
        DB::connection()->disableQueryLog();

        // Optional: Disable model events if not needed
        // ContactActivityEvent::unsetEventDispatcher();

        $this->info("Starting to seed {$numberOfRecords} records.");

        for ($i = 0; $i < $numberOfRecords / $batchSize; $i++) {
            // Use a transaction to bundle each batch insert
            DB::transaction(function () use ($batchSize) {
                ContactActivityEventSmall::factory($batchSize)->create();
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
