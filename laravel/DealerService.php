<?php

namespace App\Http\Services;

use App\Http\Repositories\WorkerRepository;
use App\Http\Resources\WorkerResource;
use App\Http\Resources\WorkerShortResource;
use App\Models\Worker;
use App\Models\WorkerMainLocationAssociation;
use App\Models\WorkerPlan;
use App\Models\WorkershipLocation;
use App\Models\Item;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Class WorkerService
 * @package App\Http\Services
 */
class WorkerService
{
    private FileUploadService $fileUploadService;
    private WorkerRepository $repository;
    private ItemService $itemService;
    private FtpFeedService $ftpFeedService;
    private WorkerPlanProfileService $workerPlanProfileService;
    private KslFeedService $kslFeedService;

    public function __construct(
        FileUploadService $fileUploadService,
        WorkerRepository $workerRepository,
        ItemService $itemService,
        FtpFeedService $ftpFeedService,
        WorkerPlanProfileService $workerPlanProfileService,
        KslFeedService $kslFeedService
    ) {
        $this->fileUploadService = $fileUploadService;
        $this->repository = $workerRepository;
        $this->itemService = $itemService;
        $this->ftpFeedService = $ftpFeedService;
        $this->workerPlanProfileService = $workerPlanProfileService;
        $this->kslFeedService = $kslFeedService;
    }

    /**
     * @param array $params
     * @return AnonymousResourceCollection
     */
    public function getWorkers(array $params): AnonymousResourceCollection
    {
        $query = Worker::query();

        $query = $this->repository->prepareQueryForGet($query, $params);

        $workers = $query->paginate($params['limit']);

        return WorkerResource::collection($workers);
    }

    /**
     * @param Worker $worker
     * @return WorkerResource
     */
    public function showWorker(Worker $worker): WorkerResource
    {
        return new WorkerResource($worker);
    }

    /**
     * @param array $data
     * @return WorkerResource
     */
    public function createWorker(array $data): WorkerResource
    {
        DB::beginTransaction();

        try {
            $data['worker_data']['code'] = self::generateUniqueCode();

            if (isset($data['worker_data']['fb_token'])) {
                $data['worker_data']['fb_token'] = str_replace(' ', '', $data['worker_data']['fb_token']);
            }

            $worker = Worker::create($data['worker_data']);

            $userData = [
                'email' => $data['worker_data']['primary_email'],
                'password' => $data['worker_data']['password'],
                'stripe_id' => $data['worker_data']['stripe_id'] ?? null,
            ];

            $user = $worker->users()->create($userData);
            $user->assignRole(Role::NAME_DEALER);

	        if (!empty($data['access_planr'])) {
		        $user->assignRole(Role::ACCESS_SCHEDULER);
	        }

            $mainLocation = $worker->workershipLocations()->create($data['main_location']);

            $workerMainLocationAssociation = new WorkerMainLocationAssociation();
            $workerMainLocationAssociation->worker_id = $worker->getKey();
            $workerMainLocationAssociation->workership_location_id = $mainLocation->getKey();
            $workerMainLocationAssociation->save();

            if (isset($data['locations'])) {
                foreach ($data['locations'] as $location) {
                    $worker->workershipLocations()->create($location);
                }
            }

            $worker->overlay()->create();

            DB::commit();
        } catch (Throwable $e) {
            if (DB::transactionLevel()) {
                DB::rollBack();
            }

            throw $e;
        }

        return new WorkerResource($worker);
    }

    /**
     * @param array $data
     * @param Worker $worker
     * @return WorkerResource
     */
    public function updateWorker(array $data, Worker $worker): WorkerResource
    {
        DB::beginTransaction();

        try {
            if (isset($data['worker_data']['fb_token'])) {
                $data['worker_data']['fb_token'] = str_replace(' ', '', $data['worker_data']['fb_token']);
            }

            $worker->update($data['worker_data']);

            $newPassword = isset($data['worker_data']['password']) ?
                ['password' => $data['worker_data']['password']] :
                [];

            $stripeId = array_key_exists('stripe_id', $data['worker_data']) ?
                ['stripe_id' => $data['worker_data']['stripe_id']] :
                [];

            $userData = array_merge(
                [
                    'email' => $data['worker_data']['primary_email'],
                ],
                $newPassword,
                $stripeId
            );

			$user = User::where('worker_id', $worker->getKey())->first();
	        $user->update($userData);

	        !empty($data['access_planr'])
		        ? $user->assignRole(Role::ACCESS_SCHEDULER)
		        : $user->removeRole(Role::ACCESS_SCHEDULER);

			if(empty($data['access_planr'])) {
				$worker->users()->role( Role::ACCESS_SCHEDULER )->get()->map( function ( $user ) {
					$user->removeRole( Role::ACCESS_SCHEDULER );
				} );
			}

            $mainLocationId = $worker->mainLocationAssociation->workership_location_id;

            WorkershipLocation::find($mainLocationId)
                ->update($data['main_location']);

            $workerLocationIds = $worker->workershipLocations->pluck('id')
                ->filter(fn ($value) => $value !== $mainLocationId);

            if (isset($data['locations'])) {
                foreach ($data['locations'] as $location) {

                    if (isset($location['id']) && $workerLocationIds->contains($location['id'])) {
                        WorkershipLocation::find($location['id'])
                            ->update($location);
                    } else {
                        $worker->workershipLocations()->create($location);
                    }
                }
            }

            DB::commit();
        } catch (Throwable $e) {
            if (DB::transactionLevel()) {
                DB::rollBack();
            }

            throw $e;
        }

        return new WorkerResource($worker);
    }

    /**
     * @param Worker $worker
     * @return bool|null
     */
    public function deleteWorker(Worker $worker): bool|null
    {
        DB::beginTransaction();

        try {
            $worker->users()->delete();

            $locationIds = $worker->workershipLocations()->pluck('id')->all();
            $items = Item::whereIn('workership_location_id', $locationIds)->get();
            $csvFiles = $worker->csvFiles()->get();

            foreach ($items as $item) {
                $item->is_archived = true;
                $this->itemService->deleteItem($item);
            }

            foreach ($csvFiles as $csvFile) {
                $this->fileUploadService->removeFile($csvFile->url);
                $csvFile->delete();
            }

            $profileIds = $worker->planProfiles()->pluck('id')->all();
            $this->workerPlanProfileService->bulkDelete($profileIds);

            $worker->workershipLocations()->delete();

            $logoFilePath = $worker->overlay->logo_url;

            if ($logoFilePath) {
                $this->fileUploadService->removeFile($logoFilePath);
            }

	        $worker->plans()->delete();

	        $worker->planProfiles()->delete();

			$worker->providers()->delete();

            $worker->delete();

            DB::commit();
        } catch (Throwable $e) {
            if (DB::transactionLevel()) {
                DB::rollBack();
            }

            throw $e;
        }

        return true;
    }

    /**
     * @param array $data
     * @return void
     */
    public function bulkDelete(array $data): void
    {
        foreach ($data['ids'] as $id) {
            $worker = Worker::find($id);
            $this->deleteWorker($worker);
        }
    }

    /**
     * @param Worker $worker
     * @return bool
     */
    public function feedUpdate(Worker $worker): bool
    {
        return $this->ftpFeedService->feedUpdate($worker);
    }

    /**
     * @param Worker $worker
     * @return bool
     */
    public function kslFeed(Worker $worker): bool
    {
        return $this->kslFeedService->kslFeed($worker);
    }

    /**
     * @param int $code
     * @return array
     */
    public function getWorkerByCode(int $code): array
    {
        $worker = Worker::query()
        ->where('code', $code)
        ->firstOrFail();

        return [
            'worker_id' => $worker->id
        ];
    }

    /**
     * @return int
     */
    public static function generateUniqueCode(): int
    {
        $count = 0;

        do {
            $code = rand(10000, 99999);
            $count++;
            if ($count > 10) {
                break;
            }
        } while (Worker::where('code', $code)->exists());

        return $code;
    }

    /**
     * @param Worker $worker
     * @return array
     */
    public function getWorkerFbToken(Worker $worker): array
    {
        return [
            'fb_token' => $worker->fb_token
        ];
    }

	/**
	 * @param int $postingId
	 */
	public function getWorkerByPostingId(int $postingId)
	{
		$workerPlan = WorkerPlan::query()
		                ->where('posting_id', $postingId)
		                ->first();

		return ! empty ($workerPlan?->id)
			? new WorkerResource($workerPlan->worker)
			: new Worker();
	}

    /**
     * @param array $data
     * @param Worker $worker
     * @return WorkerShortResource
     */
    public function toggleAutoposting(array $data, Worker $worker): WorkerShortResource
    {
        $worker->update($data);

        return new WorkerShortResource($worker);
    }
}
