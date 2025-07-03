import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/database'
import { NotificationService } from '../lib/notifications'
import { Task, Project, User, Team } from '../types'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User as UserIcon,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Columns,
  BarChart3,
  CheckSquare
} from 'lucide-react'

export default function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'gantt'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    startDate: '',
    endDate: '',
    projectId: '',
    teamId: '',
    assignedTo: ''
  })

  useEffect(() => {
    loadTasks()
    loadProjects()
    loadTeams()
    loadUsers()
  }, [user])

  const loadTasks = () => {
    const allTasks = db.getTasks()
    let filteredTasks = allTasks

    // Filter based on user role
    if (user?.role === 'employee') {
      filteredTasks = allTasks.filter(t => t.assignedTo === user.id)
    } else if (user?.role === 'team_leader') {
      const userTeams = db.getTeams().filter(t => t.leaderId === user.id)
      filteredTasks = allTasks.filter(t => userTeams.some(team => team.id === t.teamId))
    } else if (user?.role === 'project_manager') {
      const userProjects = db.getProjects().filter(p => p.projectManagerId === user.id)
      filteredTasks = allTasks.filter(t => userProjects.some(project => project.id === t.projectId))
    }

    // Add related data
    const tasksWithData = filteredTasks.map(task => ({
      ...task,
      project: db.getProjectById(task.projectId),
      team: task.teamId ? db.getTeamById(task.teamId) : undefined,
      assignedUser: task.assignedTo ? db.getUserById(task.assignedTo) : undefined
    }))

    setTasks(tasksWithData)
  }

  const loadProjects = () => {
    setProjects(db.getProjects())
  }

  const loadTeams = () => {
    setTeams(db.getTeams())
  }

  const loadUsers = () => {
    setUsers(db.getUsers())
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    
    const createdTask = db.createTask({
      ...newTask,
      status: 'pending',
      progress: 0
    })

    // Create notifications if task is assigned
    if (newTask.assignedTo && newTask.projectId && user) {
      const assignedUser = db.getUserById(newTask.assignedTo)
      const project = db.getProjectById(newTask.projectId)
      
      if (assignedUser && project) {
        NotificationService.createTaskAssignmentNotification(createdTask, assignedUser, project)
      }
    }

    // Update project end date if needed
    if (newTask.projectId) {
      NotificationService.updateProjectEndDateIfNeeded(newTask.projectId, 'Création d\'une nouvelle tâche')
    }

    loadTasks()
    setShowCreateModal(false)
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      startDate: '',
      endDate: '',
      projectId: '',
      teamId: '',
      assignedTo: ''
    })
  }

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const progress = newStatus === 'completed' ? 100 : 
                    newStatus === 'in_progress' ? 50 : 
                    newStatus === 'delayed' ? 25 : 0

    const task = tasks.find(t => t.id === taskId)
    db.updateTask(taskId, { status: newStatus, progress })
    
    // Update project end date if needed
    if (task?.projectId) {
      NotificationService.updateProjectEndDateIfNeeded(task.projectId, 'Modification du statut d\'une tâche')
    }
    
    loadTasks()
  }

  const handleAssignTask = (taskId: string, userId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || !user) return

    db.updateTask(taskId, { assignedTo: userId })

    // Create notifications
    const assignedUser = db.getUserById(userId)
    const project = db.getProjectById(task.projectId)
    
    if (assignedUser && project) {
      NotificationService.createTaskAssignmentNotification(task, assignedUser, project)
    }

    loadTasks()
  }

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task)
    setShowDeleteModal(true)
  }

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      db.deleteTask(taskToDelete.id)
      
      // Update project end date if needed
      if (taskToDelete.projectId) {
        NotificationService.updateProjectEndDateIfNeeded(taskToDelete.projectId, 'Suppression d\'une tâche')
      }
      
      loadTasks()
      setShowDeleteModal(false)
      setTaskToDelete(null)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || task.status === statusFilter
    const matchesPriority = !priorityFilter || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé'
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

  const canCreateTask = user?.role !== 'client'
  const canDeleteTask = user?.role === 'admin' || user?.role === 'project_manager'

  // Kanban columns
  const kanbanColumns = [
    { id: 'pending', title: 'En attente', status: 'pending' },
    { id: 'in_progress', title: 'En cours', status: 'in_progress' },
    { id: 'completed', title: 'Terminé', status: 'completed' },
    { id: 'delayed', title: 'En retard', status: 'delayed' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tâches</h1>
          <p className="text-gray-600">Gérez et suivez vos tâches</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Columns className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'gantt' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
          {canCreateTask && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle Tâche</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminé</option>
          <option value="delayed">En retard</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Toutes les priorités</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
        </select>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      {task.project && (
                        <span className="flex items-center space-x-1">
                          <span>Projet: {task.project.name}</span>
                        </span>
                      )}
                      {task.assignedUser && (
                        <div className="flex items-center space-x-1">
                          <img
                            src={task.assignedUser.avatar}
                            alt={task.assignedUser.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>{task.assignedUser.name}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(task.endDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{task.progress}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">En attente</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminé</option>
                        <option value="delayed">En retard</option>
                      </select>
                      {!task.assignedTo && canCreateTask && (
                        <select
                          onChange={(e) => e.target.value && handleAssignTask(task.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          defaultValue=""
                        >
                          <option value="">Assigner à...</option>
                          {users.filter(u => u.role === 'employee' || u.role === 'team_leader').map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                      )}
                      {canDeleteTask && (
                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer la tâche"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kanbanColumns.map((column) => (
            <div key={column.id} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
                {column.title}
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {filteredTasks.filter(task => task.status === column.status).length}
                </span>
              </h3>
              <div className="space-y-3">
                {filteredTasks
                  .filter(task => task.status === column.status)
                  .map((task) => (
                    <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer relative group">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                        <div className="flex items-center space-x-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                          {canDeleteTask && (
                            <button
                              onClick={() => handleDeleteTask(task)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        {task.assignedUser && (
                          <img
                            src={task.assignedUser.avatar}
                            alt={task.assignedUser.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-900">{task.progress}%</div>
                          <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'gantt' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagramme de Gantt</h3>
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Le diagramme de Gantt sera disponible prochainement</p>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CheckSquare className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter || priorityFilter
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre première tâche'
            }
          </p>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle Tâche</h2>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la tâche
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    required
                    value={newTask.startDate}
                    onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    required
                    value={newTask.endDate}
                    onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projet
                </label>
                <select
                  required
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un projet</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Équipe (optionnel)
                </label>
                <select
                  value={newTask.teamId}
                  onChange={(e) => setNewTask({ ...newTask, teamId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Aucune équipe</option>
                  {teams.filter(team => team.projectId === newTask.projectId).map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigné à
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Non assigné</option>
                  {users.filter(u => u.role === 'employee' || u.role === 'team_leader').map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Supprimer la tâche</h3>
                <p className="text-sm text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">{taskToDelete.title}</h4>
              <p className="text-sm text-gray-600">{taskToDelete.description}</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteTask}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}