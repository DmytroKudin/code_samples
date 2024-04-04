<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contact_activity_event_twos', function (Blueprint $table) {
            $table->unsignedBigInteger('email_id');
            $table->unsignedBigInteger('summary_id');
            $table->unsignedTinyInteger('type');
            $table->unsignedBigInteger('ext_campaign_id');
            $table->string('country_code',45);
            $table->timestamp('added');
            $table->timestamp('modified');
            $table->timestamp('event_time');
            $table->timestamp('campaign_plan');
            $table->timestamp('report_date');
            $table->integer('int_list_id');
            $table->unsignedTinyInteger('source_id');
            $table->string('email', 255);
            $table->integer('product_id');
            $table->integer('product_niche_id');
            $table->integer('master_list_id');
            $table->string('sl_hash',32);
            $table->string('camp_hash',32);
            $table->string('ext_campaign_uid', 100);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_activity_event_twos');
    }
};
