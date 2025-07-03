<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Models\Notification;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $data = [
            'user' => $user,
            'notifications' => $user->notifications()->latest()->take(5)->get(),
        ];

        switch ($user->role) {
            case 'admin':
                $data['projects'] = Project::with(['client', 'projectManager'])->latest()->take(6)->get();
                $data['totalProjects'] = Project::count();
                $data['activeProjects'] = Project::where('status', 'active')->count();
                $data['totalUsers'] = User::count();
                $data['delayedTasks'] = Task::where('status', 'delayed')->count();
                break;

            case 'project_manager':
                $data['projects'] = $user->managedProjects()->with(['client', 'teams'])->latest()->get();
                $data['totalProjects'] = $user->managedProjects()->count();
                $data['activeTasks'] = Task::whereIn('project_id', $user->managedProjects()->pluck('id'))->where('status', 'in_progress')->count();
                $data['completedTasks'] = Task::whereIn('project_id', $user->managedProjects()->pluck('id'))->where('status', 'completed')->count();
                $data['pendingTasks'] = Task::whereIn('project_id', $user->managedProjects()->pluck('id'))->where('status', 'pending')->count();
                break;

            case 'team_leader':
                $data['teams'] = $user->ledTeams()->with(['project', 'members'])->get();
                $data['projects'] = Project::whereIn('id', $user->ledTeams()->pluck('project_id'))->with(['client'])->get();
                $data['totalTeams'] = $user->ledTeams()->count();
                $data['activeTasks'] = Task::whereIn('team_id', $user->ledTeams()->pluck('id'))->where('status', 'in_progress')->count();
                $data['completedTasks'] = Task::whereIn('team_id', $user->ledTeams()->pluck('id'))->where('status', 'completed')->count();
                $data['pendingTasks'] = Task::whereIn('team_id', $user->ledTeams()->pluck('id'))->where('status', 'pending')->count();
                break;

            case 'employee':
                $data['tasks'] = $user->assignedTasks()->with(['project', 'team'])->latest()->take(5)->get();
                $data['totalTasks'] = $user->assignedTasks()->count();
                $data['inProgressTasks'] = $user->assignedTasks()->where('status', 'in_progress')->count();
                $data['completedTasks'] = $user->assignedTasks()->where('status', 'completed')->count();
                $data['delayedTasks'] = $user->assignedTasks()->where('status', 'delayed')->count();
                break;

            case 'client':
                $data['projects'] = $user->clientProjects()->with(['projectManager', 'teams'])->get();
                $data['totalProjects'] = $user->clientProjects()->count();
                $data['activeProjects'] = $user->clientProjects()->where('status', 'active')->count();
                $data['completedProjects'] = $user->clientProjects()->where('status', 'completed')->count();
                $data['averageProgress'] = $user->clientProjects()->avg('progress') ?? 0;
                break;
        }

        return view('dashboard.' . $user->role, $data);
    }
}