<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'ProManage - Gestion de Projets')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex">
        @auth
            <!-- Sidebar -->
            <div class="w-64 bg-white shadow-lg">
                <div class="p-6 border-b border-gray-200">
                    <h1 class="text-2xl font-bold text-blue-600">ProManage</h1>
                    <div class="mt-4 flex items-center space-x-3">
                        <img src="{{ auth()->user()->avatar }}" alt="{{ auth()->user()->name }}" class="w-10 h-10 rounded-full object-cover">
                        <div>
                            <p class="font-medium text-gray-900">{{ auth()->user()->name }}</p>
                            <p class="text-sm text-gray-500 capitalize">{{ str_replace('_', ' ', auth()->user()->role) }}</p>
                        </div>
                    </div>
                </div>

                <nav class="p-4 space-y-2">
                    <a href="{{ route('dashboard') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg {{ request()->routeIs('dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50' }}">
                        <i class="fas fa-home w-5"></i>
                        <span>Dashboard</span>
                    </a>

                    @if(in_array(auth()->user()->role, ['admin', 'project_manager', 'team_leader']))
                        <a href="{{ route('projects.index') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg {{ request()->routeIs('projects.*') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50' }}">
                            <i class="fas fa-folder w-5"></i>
                            <span>Projets</span>
                        </a>
                    @endif

                    @if(in_array(auth()->user()->role, ['employee', 'team_leader']))
                        <a href="{{ route('tasks.my') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg {{ request()->routeIs('tasks.my') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50' }}">
                            <i class="fas fa-tasks w-5"></i>
                            <span>Mes Tâches</span>
                        </a>
                    @endif

                    @if(in_array(auth()->user()->role, ['admin', 'project_manager', 'team_leader']))
                        <a href="{{ route('teams.index') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg {{ request()->routeIs('teams.*') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50' }}">
                            <i class="fas fa-users w-5"></i>
                            <span>Équipes</span>
                        </a>
                    @endif

                    @if(auth()->user()->role === 'admin')
                        <a href="{{ route('users.index') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg {{ request()->routeIs('users.*') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50' }}">
                            <i class="fas fa-user-circle w-5"></i>
                            <span>Utilisateurs</span>
                        </a>
                    @endif

                    @if(in_array(auth()->user()->role, ['admin', 'project_manager', 'client']))
                        <a href="{{ route('analytics.index') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg {{ request()->routeIs('analytics.*') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50' }}">
                            <i class="fas fa-chart-bar w-5"></i>
                            <span>Rapports</span>
                        </a>
                    @endif

                    <a href="{{ route('messages.index') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg {{ request()->routeIs('messages.*') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50' }}">
                        <i class="fas fa-envelope w-5"></i>
                        <span>Messages</span>
                    </a>

                    <a href="{{ route('notifications.index') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg {{ request()->routeIs('notifications.*') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50' }}">
                        <i class="fas fa-bell w-5"></i>
                        <span>Notifications</span>
                        @if(auth()->user()->notifications()->where('is_read', false)->count() > 0)
                            <span class="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {{ auth()->user()->notifications()->where('is_read', false)->count() }}
                            </span>
                        @endif
                    </a>
                </nav>

                <div class="absolute bottom-4 left-4 right-4">
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                            <i class="fas fa-sign-out-alt w-5"></i>
                            <span>Déconnexion</span>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex-1 flex flex-col">
                <!-- Header -->
                <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-semibold text-gray-900">@yield('page-title', 'Dashboard')</h2>
                        <div class="flex items-center space-x-4">
                            <div class="relative">
                                <input type="text" placeholder="Rechercher..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                            <a href="{{ route('notifications.index') }}" class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <i class="fas fa-bell"></i>
                                @if(auth()->user()->notifications()->where('is_read', false)->count() > 0)
                                    <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {{ auth()->user()->notifications()->where('is_read', false)->count() }}
                                    </span>
                                @endif
                            </a>
                            <a href="{{ route('messages.index') }}" class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <i class="fas fa-envelope"></i>
                            </a>
                        </div>
                    </div>
                </header>

                <!-- Page Content -->
                <main class="flex-1 p-6 overflow-auto">
                    @if(session('success'))
                        <div class="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {{ session('success') }}
                        </div>
                    @endif

                    @if(session('error'))
                        <div class="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {{ session('error') }}
                        </div>
                    @endif

                    @yield('content')
                </main>
            </div>
        @else
            @yield('content')
        @endauth
    </div>

    <script>
        // CSRF Token for AJAX requests
        window.Laravel = {
            csrfToken: '{{ csrf_token() }}'
        };
    </script>
    @stack('scripts')
</body>
</html>