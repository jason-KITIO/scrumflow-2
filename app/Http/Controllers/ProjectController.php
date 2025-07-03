<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\User;
use App\Models\Task;

class ProjectController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $query = Project::with(['client', 'projectManager', 'teams']);
        
        if ($user->role === 'project_manager') {
            $query->where('project_manager_id', $user->id);
        } elseif ($user->role === 'team_leader') {
            $teamProjectIds = $user->ledTeams()->pluck('project_id');
            $query->whereIn('id', $teamProjectIds);
        } elseif ($user->role === 'client') {
            $query->where('client_id', $user->id);
        }
        
        $projects = $query->latest()->get();
        
        return view('projects.index', compact('projects'));
    }

    public function show(Project $project)
    {
        $project->load(['client', 'projectManager', 'teams.members', 'tasks.assignedUser', 'comments.user']);
        
        return view('projects.show', compact('project'));
    }

    public function create()
    {
        $this->authorize('create', Project::class);
        
        $clients = User::where('role', 'client')->get();
        $projectManagers = User::where('role', 'project_manager')->get();
        
        return view('projects.create', compact('clients', 'projectManagers'));
    }

    public function store(Request $request)
    {
        $this->authorize('create', Project::class);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'client_id' => 'required|exists:users,id',
            'project_manager_id' => 'required|exists:users,id',
        ]);

        $project = Project::create($validated);

        return redirect()->route('projects.show', $project)->with('success', 'Projet créé avec succès.');
    }

    public function edit(Project $project)
    {
        $this->authorize('update', $project);
        
        $clients = User::where('role', 'client')->get();
        $projectManagers = User::where('role', 'project_manager')->get();
        
        return view('projects.edit', compact('project', 'clients', 'projectManagers'));
    }

    public function update(Request $request, Project $project)
    {
        $this->authorize('update', $project);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:planning,active,on_hold,completed',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'progress' => 'required|integer|min:0|max:100',
            'client_id' => 'required|exists:users,id',
            'project_manager_id' => 'required|exists:users,id',
        ]);

        $project->update($validated);

        return redirect()->route('projects.show', $project)->with('success', 'Projet mis à jour avec succès.');
    }

    public function destroy(Project $project)
    {
        $this->authorize('delete', $project);
        
        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Projet supprimé avec succès.');
    }

    public function gantt(Project $project)
    {
        $tasks = $project->tasks()->with(['assignedUser', 'dependencies', 'subtasks'])->get();
        
        return view('projects.gantt', compact('project', 'tasks'));
    }
}