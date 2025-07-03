<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->enum('status', ['planning', 'active', 'on_hold', 'completed'])->default('planning');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('progress')->default(0);
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('project_manager_id')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};