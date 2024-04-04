<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QueryBuilderService
{
    public function getQuery($requestParams, $limitsColumn = null, $min = false)
    {
        $query = DB::table($requestParams['table'])
            ->selectRaw($limitsColumn ? 'id' : $requestParams['select']);

        foreach ($requestParams['conditions'] as $conditionValue)  {
            switch ($conditionValue['type']) {
                case 'where': {
                    if (!$limitsColumn) {
                        $query->where($conditionValue['column'], $conditionValue['operator'], $conditionValue['value']);
                    }

                    break;
                }

                case 'whereBetween':
                {
                    if (!$limitsColumn) {
                        $query->whereBetween($conditionValue['column'], $conditionValue['values']);

                        break;
                    }
                    if ($limitsColumn === $conditionValue['column']) {
                        $query->where(
                            $conditionValue['column'],
                            $min ? '>' : '>=',
                            $conditionValue['values'][$min ? 0 : 1]
                        );
                    }

                    break;
                }

                case 'whereIn':
                {
                    if (!$limitsColumn) {
                        $query->whereIn($conditionValue['column'], $conditionValue['values']);
                    }

                    break;
                }

                case 'orderBy':
                {
                    if (!$limitsColumn) {
                        $query->orderBy($conditionValue['column'], $conditionValue['direction']);
                    }

                    break;
                }

                case 'limit':
                {
                    if ($limitsColumn) {
                        $query->limit(1);
                    } else {
                        $query->limit($conditionValue['value']);
                    }

                    break;
                }

                case 'groupBy':
                {
                    if (!$limitsColumn) {
                        $query->groupBy(...$conditionValue['columns']);
                    }

                    break;
                }

                case 'having':
                {
                    if (!$limitsColumn) {
                        $query->having($conditionValue['column'], $conditionValue['operator'], $conditionValue['value']);
                    }

                    break;
                }

                default:break;
            }
        }

        return $query;
    }

    public function getMinMax($requestParams) {
        $maxQuery = $this->getQuery($requestParams, $requestParams['minMaxBaseColumn'],false);
        $minQuery = $this->getQuery($requestParams, $requestParams['minMaxBaseColumn'],true);

//        Log::info('MAXQ:'.$maxQuery->toSql());
//        Log::info('MAXV:'.json_encode($maxQuery->getBindings()));
//        Log::info('MINQ:'.$minQuery->toSql());
//        Log::info('MINV:'.json_encode($minQuery->getBindings()));


        $max = $maxQuery->first()?->id;
        $min = $minQuery->first()?->id;

        if (!$max) {
            $maxInDBParams = [
                ...$requestParams,
                "select" => "id",
                "conditions" => [
                    [
                        "type"=>"orderBy",
                        "column"=>"id",
                        "direction"=>"desc"
                    ],
                    [
                        "type"=>"limit",
                        "value"=>"1"
                    ]
                ]
            ];

            $maxInDBQuery = $this->getQuery($maxInDBParams);
            $max = $maxInDBQuery->first()?->id;
        }

        return [
            'min' => $min,
            'max' => $max
        ];
    }


    public function transformCampaigns($campaigns)
    {
        foreach ($campaigns as $campaignIndex  => $campaign) {
            foreach ($campaign['conditions'] as $conditionIndex => $condition) {
                switch ($condition['type']) {
                    case 'lastDays':
                    {
                        $days = $condition['value'];

                        $from = Carbon::today()->subDays($days)->format('Y-m-d H:i:s');
                        $to = Carbon::today()->format('Y-m-d H:i:s');

                        $campaigns[$campaignIndex]['conditions'][$conditionIndex] = [
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

                        $campaigns[$campaignIndex]['conditions'][$conditionIndex] = [
                            'type' => 'whereBetween',
                            'column' => $condition['column'],
                            'values' => [$startOfMonth, $endOfMonth]
                        ];

                        break;
                    }

                    case 'lastMonths':
                    {
                        $months = $condition['value'] - 1;

                        if ($months === 0) {
                            $from = Carbon::today()
                                ->startOfMonth()
                                ->format('Y-m-d H:i:s');
                        } else {
                            $from = Carbon::today()
                                ->subMonths($months)
                                ->startOfMonth()
                                ->format('Y-m-d H:i:s');
                        }

                        $to = Carbon::today()
                            ->format('Y-m-d H:i:s');

                        $campaigns[$campaignIndex]['conditions'][$conditionIndex] = [
                            'type' => 'whereBetween',
                            'column' => $condition['column'],
                            'values' => [$from, $to]
                        ];

                        break;
                    }
                }
            }
        }

        return $campaigns;
    }

}
