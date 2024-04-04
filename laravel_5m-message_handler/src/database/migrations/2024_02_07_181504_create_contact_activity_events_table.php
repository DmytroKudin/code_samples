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
        Schema::create('contact_activity_events', function (Blueprint $table) {
            $table->decimal('id',20,0);
            $table->decimal('email_id',20,0);
            $table->decimal('summary_id',20,0);
            $table->integer('type');
            $table->decimal('ext_campaign_id',20,0);
            $table->string('country_code');
            $table->timestamp('added');
            $table->timestamp('modified');
            $table->timestamp('event_time');
            $table->timestamp('campaign_plan');
            $table->timestamp('report_date');
            $table->integer('int_list_id');
            $table->integer('source_id');
            $table->string('email');
            $table->integer('product_id');
            $table->integer('product_niche_id');
            $table->integer('master_list_id');
            $table->string('sl_hash');
            $table->string('camp_hash');
            $table->string('ext_campaign_uid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
//        Schema::dropIfExists('contact_activity_events');
    }
};
