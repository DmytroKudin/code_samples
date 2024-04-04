<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ContactActivityEventTwo>
 */
class ContactActivityEventTwoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email_id' => $this->faker->numberBetween(1, 9999999999),
            'summary_id' => $this->faker->numberBetween(1, 9999999999),
            'type' => $this->faker->numberBetween(1, 15),
            'ext_campaign_id' => $this->faker->numberBetween(1, 9999999999),
            'country_code' => $this->faker->countryCode,
            'added' => $this->faker->dateTime(),
            'modified' => $this->faker->dateTime(),
            'event_time' => $this->faker->dateTime(),
            'campaign_plan' => $this->faker->dateTime(),
            'report_date' => $this->faker->dateTime(),
            'int_list_id' => $this->faker->numberBetween(1, 9999),
            'source_id' => $this->faker->numberBetween(1, 30),
            'email' => $this->faker->safeEmail,
            'product_id' => $this->faker->numberBetween(1, 9999),
            'product_niche_id' => $this->faker->numberBetween(1, 9999),
            'master_list_id' => $this->faker->numberBetween(1, 9999),
            'sl_hash' => $this->faker->regexify('[A-Za-z0-9]{32}'),
            'camp_hash' => $this->faker->regexify('[A-Za-z0-9]{32}'),
            'ext_campaign_uid' => $this->faker->regexify('[A-Za-z0-9]{1,100}'),
        ];
    }
}
