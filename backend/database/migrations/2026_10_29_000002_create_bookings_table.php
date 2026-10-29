<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS btree_gist');

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 16)->unique();
            $table->foreignId('tutor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained();
            $table->foreignId('level_id')->constrained();
            $table->string('child_first_name');
            $table->string('parent_name');
            $table->string('parent_email');
            $table->boolean('sms_reminder')->default(false);
            $table->text('objective')->nullable();
            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at');
            $table->string('status', 16)->default('confirmed');
            $table->timestampsTz();
            $table->index(['tutor_id', 'starts_at']);
        });

        // Garantie en base : un tuteur ne peut pas avoir deux réservations confirmées qui se chevauchent,
        // même avec deux requêtes simultanées.
        DB::statement(<<<'SQL'
            ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
            EXCLUDE USING gist (tutor_id WITH =, tstzrange(starts_at, ends_at) WITH &&)
            WHERE (status = 'confirmed')
        SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
