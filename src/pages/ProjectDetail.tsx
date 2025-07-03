import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../lib/database'
import { Project, Task, Team, User } from '../types'
import GanttChart from '../components/GanttChart'
import PertChart from '../components/PertChart'
import ExcelImport from '../components/ExcelImport'
import { NotificationService } from '../lib/notifications'
import { useAuth } from '../contexts/AuthContext'
import { 
  ArrowLeft, 
  Calendar, 
  User as UserIcon, 
  Users, 
  CheckSquare, 
  Plus,
  BarChart3,
  MessageSquare,
  Settings,
  Upload,
  Network
} from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [showExcelImport, setShowExcelImport] = useState(false)

  useEffect(() => {
    if (id) {
      loadProjectData(id)
    }
  }, [id])

  const loadProjectData = (projectId: string) => {
    const projectData = db.getProjectById(projectId)
    if (projectData) {
      const projectWithUsers = {
        ...projectData,
        client: db.getUserById(projectData.clientId),
        projectManager: db.getUserById(projectData.projectManagerId)
      }
      setProject(projectWithUsers)

      // Load tasks with dependencies
      const projectTasks = db.getTasks().filter(task => task.projectId === projectId)
      const tasksWithData = projectTasks.map(task => ({
        ...task,
        assignedUser: task.assignedTo ? db.getUserById(task.assignedTo) : undefined,
        dependencies: db.getTaskDependenciesByTaskId(task.id)
      }))
      setTasks(tasksWithData)

      // Load teams
      const projectTeams = db.getTeams().filter(team => team.projectId === projectId)
      const teamsWithUsers = projectTeams.map(team => ({
        ...team,
        leader: db.getUserById(team.leaderId),
        members: db.getTeamMembersByTeamId(team.id)
      }))
      setTeams(teamsWithUsers)
    }
  }

  const handleExcelImport = (excelTasks: any[]) => {
    if (!project || !user) return

    const createdTasks: Task[] = []
    const taskMap = new Map<string, string>() // Map task number to task ID

    // First pass: create all tasks
    excelTasks.forEach((excelTask, index) => {
      const taskNumber = (index + 1).toString()
      const startDate = new Date(project.startDate)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + excelTask.temps)

      const newTask = db.createTask({
        title: excelTask.nom,
        description: excelTask.description,
        status: 'pending',
        priority: excelTask.priorite,
        progress: 0,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        projectId: project.id,
        teamId: undefined,
        assignedTo: undefined
      })

      createdTasks.push(newTask)
      taskMap.set(taskNumber, newTask.id)
    })

    // Second pass: create dependencies
    excelTasks.forEach((excelTask, index) => {
      if (excelTask.anteriorites && excelTask.anteriorites.trim()) {
        const taskNumber = (index + 1).toString()
        const taskId = taskMap.get(taskNumber)
        
        if (taskId) {
          const dependencies = excelTask.anteriorites.trim().split(/\s+/)
          dependencies.forEach((depNumber: string) => {
            const depTaskId = taskMap.get(depNumber)
            if (depTaskId) {
              db.addTaskDependency(taskId, depTaskId)
            }
          })
        }
      }
    })

    // Update project end date and create notifications
    NotificationService.updateProjectEndDateIfNeeded(project.id, 'Importation de nouvelles tâches depuis Excel')
    NotificationService.createTaskCreationNotification(createdTasks, project, user, true)

    // Reload data
    loadProjectData(project.id)
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <CheckSquare className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Projet non trouvé</h3>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'on_hold': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'planning': return 'Planification'
      case 'completed': return 'Terminé'
      case 'on_hold': return 'En attente'
      case 'in_progress': return 'En cours'
      case 'pending': return 'En attente'
      case 'delayed': return 'En retard'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute'
      case 'medium': return 'Moyenne'
      case 'low': return 'Basse'
      default: return priority
    }
  }

  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: BarChart3 },
    { id: 'tasks', label: 'Tâches', icon: CheckSquare },
    { id: 'teams', label: 'Équipes', icon: Users },
    { id: 'gantt', label: 'Gantt', icon: Calendar },
    { id: 'pert', label: 'PERT', icon: Network },
  ]

  const canImportTasks = user?.role === 'admin' || user?.role === 'project_manager' || 
                        (user?.role === 'team_leader' && teams.some(team => team.leaderId === user.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/projects"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600">{project.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          {canImportTasks && (
            <button
              onClick={() => setShowExcelImport(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Importer Excel</span>
            </button>
          )}
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
            {getStatusLabel(project.status)}
          </span>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progression</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{project.progress}%</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200"/>
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - project.progress / 100)}`}
                  className="text-indigo-600"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tâches</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{completedTasks}/{totalTasks}</p>
              <p className="text-sm text-green-600 mt-1">{completionRate}% terminées</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Équipes</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{teams.length}</p>
              <p className="text-sm text-blue-600 mt-1">Actives</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Durée</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(project.startDate).toLocaleDateString('fr-FR')} - {new Date(project.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du projet</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Chef de projet</p>
                    <p className="font-medium text-gray-900">{project.projectManager?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium text-gray-900">{project.client?.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Période</p>
                    <p className="font-medium text-gray-900">
                      {new Date(project.startDate).toLocaleDateString('fr-FR')} - {new Date(project.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tâches récentes</h3>
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{task.progress}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Tâches du projet</h3>
              <div className="flex items-center space-x-2">
                {canImportTasks && (
                  <button
                    onClick={() => setShowExcelImport(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Importer Excel</span>
                  </button>
                )}
                <Link
                  to="/tasks"
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouvelle tâche</span>
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                        {task.assignedUser && (
                          <div className="flex items-center space-x-1">
                            <img
                              src={task.assignedUser.avatar}
                              alt={task.assignedUser.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-xs text-gray-500">{task.assignedUser.name}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(task.endDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-gray-900">{task.progress}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Équipes du projet</h3>
              <Link
                to="/teams"
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Nouvelle équipe</span>
              </Link>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team) => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{team.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(team.status)}`}>
                        {team.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{team.description}</p>
                    <div className="flex items-center space-x-2 mb-3">
                      <img
                        src={team.leader?.avatar}
                        alt={team.leader?.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">Chef: {team.leader?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{team.members?.length || 0} membres</span>
                    </div>
                    {team.members && team.members.length > 0 && (
                      <div className="flex -space-x-2 mt-2">
                        {team.members.slice(0, 4).map((member) => (
                          <img
                            key={member.id}
                            src={member.avatar}
                            alt={member.name}
                            className="w-6 h-6 rounded-full border-2 border-white object-cover"
                            title={member.name}
                          />
                        ))}
                        {team.members.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{team.members.length - 4}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gantt' && (
          <GanttChart 
            tasks={tasks}
            startDate={project.startDate}
            endDate={project.endDate}
          />
        )}

        {activeTab === 'pert' && (
          <PertChart 
            tasks={tasks}
            projectStartDate={project.startDate}
          />
        )}
      </div>

      {/* Excel Import Modal */}
      {showExcelImport && (
        <ExcelImport
          projectId={project.id}
          onImport={handleExcelImport}
          onClose={() => setShowExcelImport(false)}
        />
      )}
    </div>
  )
}