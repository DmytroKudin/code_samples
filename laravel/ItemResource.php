<?php

namespace App\Http\Resources;

use App\Models\WorkershipLocation;
use App\Http\Services\FileUploadService;
use App\Models\Overlay;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

/**
 * Class ItemResource
 * @package App\Http\Resources
 */
class ItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'worker' => new WorkerShortResource($this->worker),
            'workership_location' => new WorkershipLocationShortResource($this->workershipLocation),
            'title' => $this->title,
            'item_type' => new ItemTypeResource($this->itemType),
            'item_category' => new ItemCategoryResource($this->itemCategory),
            'stock' => $this->stock,
            'condition' => $this->condition,
            'autopopulate' => $this->autopopulate,
            'year' => $this->year,
            'manufacturer' => $this->itemManufacturer->name,
            'status' => $this->status,
            'vin' => $this->vin,
            'model_name' => $this->model_name,
            'brand' => $this->whenNotNull($this->brand),
            'chassis_year' => $this->whenNotNull($this->chassis_year),
            'is_archived' => $this->is_archived,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'details' => new ItemDetailResource($this->itemDetails),
            'admin_details' => new ItemAdminDetailResource($this->itemAdminDetails),
            'attributes' => new ItemAttributeResource($this->itemAttributes),
            'features' => $this->getFeatureList($this->featureOptions, $this->customFeatures),
            'website_configuration' => new ItemConfigurationResource($this->itemConfiguration),
            'overlay_setting' => $this->overlay_setting,
            'images_count' => $this->itemImages->count(),
            'images' => ItemImageResource::collection($this->itemImages),
            'pdfs' => ItemPdfResource::collection($this->itemPdfs),
            'hidden_files' => ItemHiddenFileResource::collection($this->itemHiddenFiles),
            'user_overlay_settings' => $this->overlaySettings($this->worker->overlay, $this->workershipLocation),
        ];
    }


    /**
     * @param Collection $featureOptions
     * @param Collection $customOptions
     * @return array
     */
    protected function getFeatureList(Collection $featureOptions, Collection $customOptions): array
    {
        $featureOptions = $featureOptions->merge($customOptions);

        $featureList = $featureOptions
            ->groupBy(fn ($option, $key) => $option->itemFeature->name)
            ->map(fn ($feature, $key) => FeatureOptionResource::collection($feature));

        return $featureList->all();
    }

    /**
     * @param Overlay $overlay
     * @param WorkershipLocation $location
     * @return array
     */
    protected function overlaySettings(Overlay $overlay, WorkershipLocation $location): array
    {
        $upperText = Overlay::TEXT_DISABLED;
        $lowerText = Overlay::TEXT_DISABLED;

        switch ($overlay->upper_text) {
            case Overlay::TEXT_LOCATION_NAME:
                $upperText = $location->name;

                break;
            case Overlay::TEXT_LOCATION_PHONE:
                $upperText = $location->phone_number;

                break;
            default:

                break;
        }

        switch ($overlay->lower_text) {
            case Overlay::TEXT_LOCATION_NAME:
                $lowerText = $location->name;

                break;
            case Overlay::TEXT_LOCATION_PHONE:
                $lowerText = $location->phone_number;

                break;
            default:

                break;
        }

        return [
            'logo_url' => FileUploadService::getPublicUrl($overlay->logo_url),
            'logo_placement' => $overlay->logo_placement,
            'logo_size' => $overlay->logo_size,
            'upper_text' => $upperText,
            'upper_background_color' => $overlay->upper_background_color,
            'upper_text_color' => $overlay->upper_text_color,
            'lower_text' => $lowerText,
            'lower_background_color' => $overlay->lower_background_color,
            'lower_text_color' => $overlay->lower_text_color,
        ];
    }
}
