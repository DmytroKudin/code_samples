<?php

namespace App\Http\Requests;

use App\Http\Requests\Traits\RequestItemTrait;
use App\Models\Item;
use App\Models\ItemType;
use App\Models\Overlay;
use App\Rules\CheckExistenceWorkershipLocationRule;
use App\Rules\CheckExistenceItemCategoryRule;
use App\Rules\CheckExistenceItemFeatureRule;
use App\Rules\CheckExistenceItemTypeRule;
use App\Rules\CheckItemHiddenFileRule;
use App\Rules\CheckItemImageRule;
use App\Rules\CheckItemPdfRule;
use App\Rules\CheckItemSpecificsFieldRule;
use App\Rules\CheckItemStockCharsRule;
use App\Rules\CheckItemStockRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ItemStoreRequest extends FormRequest
{
    use RequestItemTrait;

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        $watercraftTypeId = ItemType::where('name', 'Watercraft')->first()->id;
        $typeId = isset($this->specifics['item_type_id']) ?
            $this->specifics['item_type_id'] :
            null;
        $locationId = isset($this->specifics['workership_location_id']) ?
            $this->specifics['workership_location_id'] :
            null;
        $categoryId = isset($this->specifics['item_category_id']) ?
            $this->specifics['item_category_id'] :
            null;

        return array_merge(
            [
                'specifics' => [
                    'required',
                    'array',
                ],
                'specifics.title' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'specifics.item_type_id' => [
                    'required',
                    'int',
                    new CheckExistenceItemTypeRule(
                        $typeId
                    ),
                ],
                'specifics.stock' => [
                    'required',
                    'string',
                    'max:255',
                    new CheckItemStockCharsRule(),
                    new CheckItemStockRule(
                        $locationId
                    ),
                ],
                'specifics.condition' => [
                    'required',
                    'string',
                    Rule::in(Item::CONDITION),
                ],
                'specifics.autopopulate' => [
                    'nullable',
                    'string',
                ],
                'specifics.year' => [
                    'required',
                    'int',
                    'min:1900',
                    'max:'.date("Y", strtotime('+2 years')),
                ],
                'specifics.manufacturer' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::exists('item_manufacturers', 'name'),
                ],
                'specifics.status' => [
                    'required',
                    'string',
                    Rule::in(Item::STATUS),
                ],
                'specifics.workership_location_id' => [
                    'required',
                    'int',
                    new CheckExistenceWorkershipLocationRule(
                        $locationId
                    ),
                ],
                'specifics.vin' => [
                    'nullable',
                    'string',
                ],
                'specifics.model_name' => [
                    'required',
                    'string',
                    'max:255',
                ],
                'specifics.item_category_id' => [
                    'required',
                    'int',
                    new CheckExistenceItemCategoryRule(
                        $categoryId,
                        $typeId
                    ),
                ],
                'specifics.brand' => [
                    Rule::requiredIf($typeId === $watercraftTypeId),
                    new CheckItemSpecificsFieldRule(
                        'brand',
                        $typeId
                    ),
                    'string',
                    'max:255',
                ],
                'specifics.chassis_year' => [
                    'nullable',
                    new CheckItemSpecificsFieldRule(
                        'chassis_year',
                        $typeId
                    ),
                    'int',
                    'min:1900',
                    'max:'.date("Y", strtotime('+2 years')),
                ],
                'specifics.overlay_setting' => [
                    'nullable',
                    'string',
                    Rule::in(Overlay::DEFAULT_SETTING),
                ],
                'features' => [
                    'nullable',
                    'array',
                    new CheckExistenceItemFeatureRule(
                        $this->features ?? []
                    ),
                ],
                'images' => [
                    'nullable',
                    'array',
                ],
                'images.*' => [
                    'nullable',
                    new CheckItemImageRule(),
                ],
                'pdfs' => [
                    'nullable',
                    'array',
                ],
                'pdfs.*' => [
                    'nullable',
                    new CheckItemPdfRule(),
                ],
                'hidden_files' => [
                    'nullable',
                    'array',
                ],
                'hidden_files.*' => [
                    'nullable',
                    new CheckItemHiddenFileRule(),
                ],
            ],
            $this->getItemCustomFeaturesRules(),
            $this->getItemDetailsRules(),
            $this->getItemAdminDetailsRules(),
            $this->getItemAttributesRules(),
            $this->getItemWebsiteConfigRules($locationId),
        );
    }
}
