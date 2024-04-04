<?php

namespace App\Http\Controllers;

use App\Http\Requests\WorkershipLocationBulkDeleteRequest;
use App\Http\Requests\WorkershipLocationGetRequest;
use App\Http\Requests\WorkershipLocationStoreRequest;
use App\Http\Requests\WorkershipLocationUpdateRequest;
use App\Http\Services\WorkershipLocationService;
use App\Models\WorkershipLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

/**
 * Class WorkershipLocationController
 * @package App\Http\Controllers
 */
class WorkershipLocationController extends Controller
{
    public const PERMISSION_DEALERSHIP_LOCATION_SHOW = 'workership location show';
    public const PERMISSION_DEALERSHIP_LOCATION_STORE = 'workership location store';
    public const PERMISSION_DEALERSHIP_LOCATION_UPDATE = 'workership location update';
    public const PERMISSION_DEALERSHIP_LOCATION_DESTROY = 'workership location destroy';

    private WorkershipLocationService $service;

    public function __construct(WorkershipLocationService $workershipLocationService)
    {
        $this->service = $workershipLocationService;

        $this->authorizeResource(WorkershipLocation::class, 'location');
    }

    /**
     * Display a listing of the resource.
     *
     * @param WorkershipLocationGetRequest $request
     * @return JsonResponse
     */
    public function index(WorkershipLocationGetRequest $request): JsonResponse
    {
        return response()->json(
            $this->service->getLocations($request->validated(), auth()->user())
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param WorkershipLocationStoreRequest $request
     * @return JsonResponse
     */
    public function store(WorkershipLocationStoreRequest $request): JsonResponse
    {
        return response()->json(
            $this->service->createLocation($request->validated(), auth()->user())
        );
    }

    /**
     * Display the specified resource.
     *
     * @param WorkershipLocation $location
     * @return JsonResponse
     */
    public function show(WorkershipLocation $location): JsonResponse
    {
        return response()->json(
            $this->service->showLocation($location)
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param WorkershipLocationUpdateRequest $request
     * @param WorkershipLocation $location
     * @return JsonResponse
     */
    public function update(
        WorkershipLocationUpdateRequest $request,
        WorkershipLocation $location
    ): JsonResponse
    {
        return response()->json(
            $this->service->updateLocation($request->validated(), $location)
        );
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param WorkershipLocation $location
     * @return Response
     */
    public function destroy(WorkershipLocation $location): Response
    {
        $this->service->deleteLocation($location);

        return response()->noContent();
    }

    /**
     * @param WorkershipLocation $location
     * @return JsonResponse
     */
    public function assignMain(WorkershipLocation $location): JsonResponse
    {
        $this->authorize('assignMain', $location);

        return response()->json(
            $this->service->assignMainLocation($location)
        );
    }

    /**
     * @param WorkershipLocationBulkDeleteRequest $request
     * @return Response
     */
    public function bulkDelete(WorkershipLocationBulkDeleteRequest $request): Response
    {
        $this->authorize('bulkDelete', [WorkershipLocation::class, $request->ids]);

        $this->service->bulkDelete($request->validated());

        return response()->noContent();
    }
}
