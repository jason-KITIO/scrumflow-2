@extends('layouts.app')

@section('title', 'Dashboard Administrateur - ProManage')
@section('page-title', 'Dashboard Administrateur')

@section('content')
<div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Projets Actifs</p>
                    <p class="text-2xl font-bold text-gray-900 mt-2">{{ $activeProjects }}</p>
                    <p class="text-sm text-green-600 mt-2">+12% ce mois</p>
                </div>
                <div class="p-3 rounded-lg bg-blue-50">
                    <i class="fas fa-folder text-blue-600 text-xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Utilisateurs Total</p>
                    <p class="text-2xl font-bold text-gray-900 mt-2">{{ $totalUsers }}</p>
                    <p class="text-sm text-green-600 mt-2">+5% ce mois</p>
                </div>
                <div class="p-3 rounded-lg bg-green-50">
                    <i class="fas fa-users text-green-600 text-xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Tâches en Retard</p>
                    <p class="text-2xl font-bold text-gray-900 mt-2">{{ $delayedTasks }}</p>
                    <p class="text-sm text-red-600 mt-2">-3% ce mois</p>
                </div>
                <div class="p-3 rounded-lg bg-red-50">
                    <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Efficacité Globale</p>
                    <p class="text-2xl font-bold text-gray-900 mt-2">87%</p>
                    <p class="text-sm text-green-600 mt-2">+2% ce mois</p>
                </div>
                <div class="p-3 rounded-lg bg-purple-50">
                    <i class="fas fa-chart-line text-purple-600 text-xl"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Projects -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Projets Récents</h3>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    @foreach($projects as $project)
                        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div class="flex-1">
                                <h4 class="font-medium text-gray-900">{{ $project->name }}</h4>
                                <p class="text-sm text-gray-500 mt-1">{{ Str::limit($project->description, 60) }}</p>
                                <div class="flex items-center mt-2 space-x-4">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full 
                                        @if($project->status === 'active') bg-green-100 text-green-800
                                        @elseif($project->status === 'planning') bg-yellow-100 text-yellow-800
                                        @elseif($project->status === 'completed') bg-blue-100 text-blue-800
                                        @else bg-gray-100 text-gray-800 @endif">
                                        @if($project->status === 'active') Actif
                                        @elseif($project->status === 'planning') Planification
                                        @elseif($project->status === 'completed') Terminé
                                        @else En attente @endif
                                    </span>
                                    <span class="text-sm text-gray-500">{{ $project->progress }}% complété</span>
                                </div>
                            </div>
                            <div class="ml-4">
                                <div class="w-16 h-16 relative">
                                    <svg class="w-16 h-16 transform -rotate-90">
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="transparent" class="text-gray-200"/>
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" fill="transparent" 
                                                stroke-dasharray="{{ 2 * pi() * 28 }}" 
                                                stroke-dashoffset="{{ 2 * pi() * 28 * (1 - $project->progress / 100) }}" 
                                                class="text-blue-600"/>
                                    </svg>
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <span class="text-sm font-medium text-gray-900">{{ $project->progress }}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>

        <!-- Activity Feed -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Activité Récente</h3>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    @foreach($notifications as $notification)
                        <div class="flex items-start space-x-3">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center
                                @if($notification->type === 'success') bg-green-100
                                @elseif($notification->type === 'warning') bg-yellow-100
                                @elseif($notification->type === 'error') bg-red-100
                                @else bg-blue-100 @endif">
                                <i class="fas 
                                    @if($notification->type === 'success') fa-check text-green-600
                                    @elseif($notification->type === 'warning') fa-exclamation-triangle text-yellow-600
                                    @elseif($notification->type === 'error') fa-times text-red-600
                                    @else fa-info text-blue-600 @endif text-sm"></i>
                            </div>
                            <div class="flex-1">
                                <p class="text-sm text-gray-900">{{ $notification->message }}</p>
                                <p class="text-xs text-gray-500 mt-1">{{ $notification->created_at->diffForHumans() }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</div>
@endsection