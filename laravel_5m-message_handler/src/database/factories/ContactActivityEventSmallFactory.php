<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ContactActivityEventSmall>
 */
class ContactActivityEventSmallFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => $this->faker->numberBetween(1000000000, 100000000000),
            'email_id' => $this->faker->numberBetween(1000000, 2000000000),
            'summary_id' => $this->faker->numberBetween(1000000, 2000000000),
            'type' => $this->faker->numberBetween(0, 15),
            'ext_campaign_id' => $this->faker->numberBetween(1000000, 2000000000),
            'country_code' => $this->faker->countryCode,
            'added' => $this->faker->dateTime(),
            'modified' => $this->faker->dateTime(),
            'event_time' => $this->faker->dateTime(),
            'campaign_plan' => $this->faker->dateTime(),
            'report_date' => $this->faker->dateTime(),
            'int_list_id' => $this->faker->numberBetween(1000000, 2000000000),
            'source_id' => $this->faker->numberBetween(1, 15),
            'email' => $this->faker->safeEmail,
            'product_id' => $this->faker->numberBetween(1000, 2000000000),
            'product_niche_id' => $this->faker->numberBetween(1, 1000),
            'master_list_id' => $this->faker->numberBetween(1, 1000),
            'sl_hash' => $this->faker->md5,
            'camp_hash' => $this->faker->md5,
            'ext_campaign_uid' => $this->faker->numberBetween(1000000000, 3000000000)
        ];
    }
}
