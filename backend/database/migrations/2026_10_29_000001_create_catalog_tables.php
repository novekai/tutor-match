<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('levels', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('cycle');
            $table->unsignedSmallInteger('rank')->unique();
        });

        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('hint');
            $table->string('icon');
            $table->unsignedSmallInteger('position')->default(0);
        });

        Schema::create('tutors', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('photo_url');
            $table->string('credential');
            $table->string('school');
            $table->string('headline');
            $table->text('bio');
            $table->json('tags');
            $table->decimal('rating', 2, 1);
            $table->unsignedInteger('reviews_count');
            $table->unsignedSmallInteger('years_experience');
            $table->unsignedInteger('lessons_count');
            $table->unsignedSmallInteger('response_rate');
            $table->unsignedSmallInteger('hourly_rate');
            $table->unsignedSmallInteger('lesson_minutes')->default(90);
            $table->timestampsTz();
        });

        Schema::create('tutor_teachings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('level_min_rank');
            $table->unsignedSmallInteger('level_max_rank');
            $table->boolean('is_major')->default(false);
            $table->unique(['tutor_id', 'subject_id']);
            $table->index(['subject_id', 'level_min_rank', 'level_max_rank']);
        });

        Schema::create('availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('weekday'); // 1 = lundi … 7 = dimanche
            $table->time('start_time');
            $table->time('end_time');
            $table->index(['tutor_id', 'weekday']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('availabilities');
        Schema::dropIfExists('tutor_teachings');
        Schema::dropIfExists('tutors');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('levels');
    }
};
