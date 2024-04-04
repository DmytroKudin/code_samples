<?php

namespace App\Models;

use App\Models\Interfaces\FilteredInterface;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

/**
 * Class Item
 * @package App\Models
 */
class Item extends Model implements FilteredInterface
{
    use HasFactory;

    public const INVENTORY_ACTIVE = 'active';
    public const INVENTORY_ARCHIVED = 'archived';
    public const INVENTORY_ALL = 'all';

    public const INVENTORY = [
        self::INVENTORY_ACTIVE,
        self::INVENTORY_ARCHIVED,
        self::INVENTORY_ALL,
    ];

    public const CONDITION = [
        'New',
        'Used',
        'Re-manufactured',
        'Consignment',
    ];

    public const STATUS_AVAILABLE = 'Available';
    public const STATUS_SOLD = 'Sold';
    public const STATUS_ON_ORDER = 'On Order';
    public const STATUS_PENDING_SALE = 'Pending Sale';
    public const STATUS_SPECIAL_ORDER = 'Special Order';

    public const STATUS = [
        self::STATUS_AVAILABLE,
        self::STATUS_SOLD,
        self::STATUS_ON_ORDER,
        self::STATUS_PENDING_SALE,
        self::STATUS_SPECIAL_ORDER,
    ];

    public const SORT_OPTIONS = [
        'title',
        'stock',
        'year',
        'manufacturer',
        'status',
        'price',
        'created_at',
        'updated_at',
        'length',
        'location',
        'images_count',
    ];

    public const ITEMS_URI = 'items/';

    public const RELATIONS = [
        'workershipLocation',
        'itemType',
        'itemCategory',
        'itemDetails',
        'itemAdminDetails',
        'itemAttributes',
        'featureOptions',
        'customFeatures',
        'itemConfiguration',
        'itemImages',
        'itemPdfs',
        'itemHiddenFiles',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'item_type_id',
        'stock',
        'condition',
        'autopopulate',
        'year',
	    'manufacturer_id',
        'status',
        'workership_location_id',
        'vin',
        'model_name',
        'item_category_id',
        'brand',
        'chassis_year',
        'is_archived',
        'overlay_setting',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<int, string>
     */
    protected $casts = [
        'year' => 'date:Y',
        'chassis_year' => 'date:Y',
        'is_archived' => 'boolean',
    ];

    /**
     * @param string $year
     * @return string
     */
    public function getYearAttribute(string $year): string
    {
        return (new Carbon($year))->format('Y');
    }

    /**
     * @param string|null $chassisYear
     * @return string|null
     */
    public function getChassisYearAttribute(?string $chassisYear = null): string|null
    {
        return !is_null($chassisYear) ? (new Carbon($chassisYear))->format('Y') : null;
    }

	/**
	 * @return BelongsTo
	 */
	public function workerPlan(): BelongsTo
	{
		return $this->belongsTo(WorkerPlan::class, 'id', 'item_id');
	}

    /**
     * @return BelongsTo
     */
    public function itemType(): BelongsTo
    {
        return $this->belongsTo(ItemType::class);
    }

    /**
     * @return BelongsTo
     */
    public function workershipLocation(): BelongsTo
    {
        return $this->belongsTo(WorkershipLocation::class);
    }

    /**
     * @return Worker
     */
    public function getWorkerAttribute(): Worker
    {
        return $this->workershipLocation->worker;
    }

    /**
     * @return BelongsTo
     */
    public function itemCategory(): BelongsTo
    {
        return $this->belongsTo(ItemCategory::class);
    }

    /**
     * @return HasMany
     */
    public function customFeatures(): HasMany
    {
        return $this->hasMany(FeatureOption::class);
    }

    /**
     * @return BelongsToMany
     */
    public function featureOptions(): BelongsToMany
    {
        return $this->belongsToMany(
            FeatureOption::class,
            'item_feature_option_association'
        )->withTimestamps();
    }

    /**
     * @return HasOne
     */
    public function itemDetails(): HasOne
    {
        return $this->hasOne(ItemDetail::class);
    }

    /**
     * @return HasOne
     */
    public function itemAdminDetails(): HasOne
    {
        return $this->hasOne(ItemAdminDetail::class);
    }

    /**
     * @return HasOne
     */
    public function itemAttributes(): HasOne
    {
        return $this->hasOne(ItemAttribute::class);
    }

    /**
     * @return HasOne
     */
    public function itemConfiguration(): HasOne
    {
        return $this->hasOne(ItemConfiguration::class);
    }

	/**
	 * @return HasOne
	 */
	public function itemManufacturer(): HasOne
	{
		return $this->hasOne(ItemManufacturer::class, 'id', 'manufacturer_id');
	}

    /**
     * @return HasMany
     */
    public function itemImages(): HasMany
    {
        return $this->hasMany(ItemImage::class);
    }

    /**
     * @return HasMany
     */
    public function itemPdfs(): HasMany
    {
        return $this->hasMany(ItemPdf::class);
    }

    /**
     * @return HasMany
     */
    public function itemHiddenFiles(): HasMany
    {
        return $this->hasMany(ItemHiddenFile::class);
    }

    /**
     * @param Builder $query
     * @param array $params
     * @return Builder
     */
    public function scopeFilter(Builder $query, array $params): Builder
    {
		$descriptionSearch = isset($params['description_search']);

        foreach ($params as $field => $value) {
            $this->modifyQueryWithFieldAndValue($query, $field, $value, $params['is_inventory_manager'], $descriptionSearch);
        }

        if ($params['is_inventory_manager']) {
            $params['sort'] = $params['sort'] ?? FilteredInterface::DEFAULT_SORT_FIELD;
            $this->attachSort($query, $params);

        } else {
	        $this->attachFilterIsActive($query);

            if (isset($params['sort'])) {
                $this->attachSort($query, $params);

            } else {
                if (isset($params['status_sort'])) {
                    $this->attachStatusSort($query, $params);
                } else {
                    $this->attachConfigSort($query, $params);
                }

                $params['sort'] = $params['sort'] ?? FilteredInterface::DEFAULT_SORT_FIELD;
                $this->attachSort($query, $params);
            }
        }

        return $query;
    }

    /**
     * @param Builder $query
     * @param string $field
     * @param mixed $value
     * @param bool $inventory
     * @return Builder
     */
    protected function modifyQueryWithFieldAndValue(Builder $query, string $field, $value, bool $inventory): Builder
    {
        switch ($field) {
            case 'archived':
                $query->where('is_archived', $value);

                break;
            case 'condition':
                $query->whereIn('condition', $value);

                break;
            case 'status':
                $query->whereIn('status', $value);

                break;
            case 'manufacturer':
				$manufacturerIds = ItemManufacturer::whereIn('name', $value)->pluck('id');
				$query->whereIn('manufacturer_id', $manufacturerIds);

				break;
	        case 'pull_type':
		        $query->whereHas('itemAttributes', function (Builder $query) use ($value) {
			        $query->whereIn('pull_type', $value);
		        });

		        break;
            case 'location_id':
                $query->whereIn('workership_location_id', $value);

                break;
            case 'worker_id':
                $locationIds = WorkershipLocation::whereIn('worker_id', $value)->pluck('id');
                $query->whereIn('workership_location_id', $locationIds);

                break;
            case 'category_id':
                $query->whereIn('item_category_id', $value);

                break;
            case 'length':
                sort($value);
                $query->whereHas('itemDetails', function (Builder $query) use ($value) {
                    $query->whereIn('floor_length', range(...$value));
                });

                break;
            case 'gvwr':
                sort($value);
                $query->whereHas('itemDetails', function (Builder $query) use ($value) {
                    $query->whereIn('gvwr', range(...$value));
                });

                break;
            case 'payload_capacity':
                sort($value);
                $query->whereHas('itemDetails', function (Builder $query) use ($value) {
                    $query->whereIn('payload_capacity', range(...$value));
                });

                break;
            case 'price':
                sort($value);
                $query->whereHas('itemDetails', function (Builder $query) use ($value) {
                    $query->whereIn('price', range(...$value));
                });

                break;
            case 'year':
                sort($value);
                $query->whereYear('year', '>=', $value[0])
                    ->whereYear('year', '<=', $value[1]);

                break;
            case 'color':
                $query->whereHas('itemAttributes', function (Builder $query) use ($value) {
                    $query->whereIn('color', $value);
                });

                break;
            case 'suspension_type':
                $query->whereHas('itemAttributes', function (Builder $query) use ($value) {
                    $query->whereIn('suspension_type', $value);
                });

                break;
            case 'is_featured':
                $query->whereHas('itemConfiguration', function (Builder $query) use ($value) {
                    $query->where('is_featured', $value);
                });

                break;
            case 'is_on_special':
                $query->whereHas('itemConfiguration', function (Builder $query) use ($value) {
                    $query->where('is_on_special', $value);
                });

                break;
            case 'search':
                $attributeColumns = AttributeConfig::pluck('name');

                $query->where(function ($query) use ($value, $attributeColumns, $inventory) {
                    $searchValue = '%' . trim($value) . '%';

                    $query->where('title', 'LIKE', $searchValue)
						->orWhere('stock', 'LIKE', $searchValue)
						->orWhereHas('itemManufacturer', function (Builder $query) use ($searchValue, $inventory) {
							$query->where('name', 'LIKE', $searchValue);
						})
						->orWhere('model_name', 'LIKE', $searchValue)
						->whereYear('year', 'LIKE', $searchValue, 'or')
						->orWhereHas('itemDetails', function (Builder $query) use ($searchValue, $inventory) {
							$query->where('price', 'LIKE', $searchValue);
							if ($inventory) {
								$query->orWhere('notes', 'LIKE', $searchValue);
							}
						})
						->orWhereHas('itemDetails', function (Builder $query) use ($searchValue) {
							$query->where('sales_price', 'LIKE', $searchValue);
						})
						->orWhereHas('itemAttributes', function (Builder $query) use ($searchValue, $attributeColumns) {
							$query->where($attributeColumns[0], 'LIKE', $searchValue);
							foreach ($attributeColumns as $column) {
								$query->orWhere($column, 'LIKE', $searchValue);
							}
						})
						->orWhereHas('featureOptions', function (Builder $query) use ($searchValue) {
							$query->where('name', 'LIKE', $searchValue);
						});
                });

                break;
            case 'search_shortcode':
                $query->where(function ($query) use ($value) {
                    $searchValue = '%' . trim($value) . '%';

                    $query->where('title', 'LIKE', $searchValue)
                        ->orWhereHas('itemDetails', function (Builder $query) use ($searchValue) {
                            $query->where('description', 'LIKE', $searchValue);
                        });
                });

                break;
            default:
                break;
        }

        return $query;
    }

    /**
     * @param Builder $query
     * @param array $params
     * @return Builder
     */
    private function attachSort(Builder $query, array $params): Builder
    {
        $order = $params['order'];
        $sort = $params['sort'];

        switch ($sort) {
            case 'title':
            case 'stock':
            case 'year':
            case 'status':
            case 'created_at':
            case 'updated_at':
                $query->orderBy($sort, $order);

                break;
	        case 'manufacturer':
		        $query->select('items.*')
		              ->leftJoin('item_manufacturers', 'item_manufacturers.id', '=', 'items.manufacturer_id')
		              ->orderBy('item_manufacturers.name', $order);
				break;

            case 'images_count':
                $query->withCount('itemImages')->orderBy('item_images_count', $params['order']);

                break;
            case 'location':
                $query->select('items.*')
                    ->leftJoin('workership_locations', 'workership_locations.id', '=', 'items.workership_location_id')
                    ->orderBy('workership_locations.name', $order);

                break;
            case 'price':
                $query->select('items.*')
                    ->leftJoin('item_details', 'item_details.item_id', '=', 'items.id')
                    ->orderBy('item_details.price', $order);

                break;
            case 'length':
                $query->select('items.*')
                    ->leftJoin('item_details', 'item_details.item_id', '=', 'items.id')
                    ->orderBy('item_details.floor_length', $order);

                break;
            default:
                break;
        }

        return $query;
    }

    /**
     * @param Builder $query
     * @param array $params
     * @return Builder
     */
    private function attachStatusSort(Builder $query, array $params): Builder
    {
        $order = implode("', '", $params['status_sort']);

        $query->orderByRaw("FIELD(status, '" . $order . "')");

        return $query;
    }

    /**
     * @param Builder $query
     * @return Builder
     */
    private function attachConfigSort(Builder $query): Builder
    {
        $query->select('items.*')
            ->leftJoin('item_configurations', 'item_configurations.item_id', '=', 'items.id')
            ->orderByRaw("CASE
                WHEN item_configurations.is_featured ='1' AND status ='Available' THEN 1
                WHEN item_configurations.is_on_special ='1' AND status ='Available' THEN 2
                WHEN status ='Available' THEN 3
                WHEN status ='On Order' THEN 4
                WHEN status ='Pending Sale' THEN 5
                ELSE 6
                END ASC");

        return $query;
    }

	private function attachFilterIsActive(Builder $query): Builder
	{
		$query->whereHas('itemConfiguration', function (Builder $query) {
			$query->where('is_active', true);
		});

		return $query;
	}
}
