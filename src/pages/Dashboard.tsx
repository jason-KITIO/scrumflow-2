import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/database'
import { Project, Task, User, Team } from '../types'
import { 
  FolderOpen, 
  Users, 
  CheckSquare, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Clock,
  Target
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    delayedTasks: 0,
    totalUsers: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = () => {
    const allProjects = db.getProjects()
    const allTasks = db.getTasks()
    const allTeams = db.getTeams()
    const allUsers = db.getUsers()

    // Filter data based on user role
    let filteredProjects = allProjects
    let filteredTasks = allTasks
    let filteredTeams = allTeams

    if (user?.role === 'project_manager') {
      filteredProjects = allProjects.filter(p => p.projectManagerId === user.id)
      filteredTasks = allTasks.filter(t => filteredProjects.some(p => p.id === t.projectId))
    } else if (user?.role === 'team_leader') {
      filteredTeams = allTeams.filter(t => t.leaderId === user.id)
      filteredProjects = allProjects.filter(p => filteredTeams.some(t => t.projectId === p.id))
      filteredTasks = allTasks.filter(t => filteredTeams.some(team => team.id === t.teamId))
    } else if (user?.role === 'employee') {
      filteredTasks = allTasks.filter(t => t.assignedTo === user.id)
      filteredProjects = allProjects.filter(p => filteredTasks.some(t => t.projectId === p.id))
    } else if (user?.role === 'client') {
      filteredProjects = allProjects.filter(p => p.clientId === user.id)
      filteredTasks = allTasks.filter(t => filteredProjects.some(p => p.id === t.projectId))
    }

    setProjects(filteredProjects)
    setTasks(filteredTasks)
    setTeams(filteredTeams)
    setUsers(allUsers)

    // Calculate stats
    setStats({
      totalProjects: filteredProjects.length,
      activeProjects: filteredProjects.filter(p => p.status === 'active').length,
      totalTasks: filteredTasks.length,
      completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
      delayedTasks: filteredTasks.filter(t => t.status === 'delayed').length,
      totalUsers: allUsers.length
    })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 50) return 'text-yellow-600'
    return 'text-red-600'
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bienvenue, {user?.name} !
        </h1>
        <p className="text-indigo-100">
          Voici un aperçu de vos activités récentes et de vos projets en cours.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projets Actifs</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeProjects}</p>
              <p className="text-sm text-green-600 mt-2">
                {stats.totalProjects} au total
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tâches Terminées</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completedTasks}</p>
              <p className="text-sm text-green-600 mt-2">
                {stats.totalTasks} au total
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tâches en Retard</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.delayedTasks}</p>
              <p className="text-sm text-red-600 mt-2">Attention requise</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                <p className="text-sm text-blue-600 mt-2">Actifs</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Projets Récents</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.description.length > 60 
                        ? `${project.description.substring(0, 60)}...` 
                        : project.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                      <span className="text-sm text-gray-500">{project.progress}% complété</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="w-16 h-16 relative">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle 
                          cx="32" 
                          cy="32" 
                          r="28" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          fill="transparent" 
                          className="text-gray-200"
                        />
                        <circle 
                          cx="32" 
                          cy="32" 
                          r="28" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          fill="transparent" 
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - project.progress / 100)}`}
                          className={getProgressColor(project.progress)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Tâches Récentes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {task.description.length > 50 
                        ? `${task.description.substring(0, 50)}...` 
                        : task.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(task.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{task.progress}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(task.progress).replace('text-', 'bg-')}`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}