import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/database'
import { Team, Project, User } from '../types'
import { 
  Plus, 
  Search, 
  Users as UsersIcon, 
  User as UserIcon,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  X
} from 'lucide-react'

export default function Teams() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    projectId: '',
    leaderId: ''
  })

  useEffect(() => {
    loadTeams()
    loadProjects()
    loadUsers()
  }, [user])

  const loadTeams = () => {
    const allTeams = db.getTeams()
    let filteredTeams = allTeams

    // Filter based on user role
    if (user?.role === 'team_leader') {
      filteredTeams = allTeams.filter(t => t.leaderId === user.id)
    } else if (user?.role === 'project_manager') {
      const userProjects = db.getProjects().filter(p => p.projectManagerId === user.id)
      filteredTeams = allTeams.filter(t => userProjects.some(project => project.id === t.projectId))
    }

    // Add related data
    const teamsWithData = filteredTeams.map(team => ({
      ...team,
      project: db.getProjectById(team.projectId),
      leader: db.getUserById(team.leaderId),
      members: db.getTeamMembersByTeamId(team.id)
    }))

    setTeams(teamsWithData)
  }

  const loadProjects = () => {
    setProjects(db.getProjects())
  }

  const loadUsers = () => {
    setUsers(db.getUsers())
  }

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault()
    
    const createdTeam = db.createTeam({
      ...newTeam,
      status: 'active'
    })

    loadTeams()
    setShowCreateModal(false)
    setNewTeam({
      name: '',
      description: '',
      projectId: '',
      leaderId: ''
    })
  }

  const handleShowMembers = (team: Team) => {
    setSelectedTeam(team)
    const teamMembers = db.getTeamMembersByTeamId(team.id)
    const teamMemberIds = teamMembers.map(m => m.id)
    const available = users.filter(u => 
      (u.role === 'employee' || u.role === 'team_leader') && 
      !teamMemberIds.includes(u.id) &&
      u.id !== team.leaderId
    )
    setAvailableUsers(available)
    setShowMembersModal(true)
  }

  const handleAddMember = (userId: string) => {
    if (selectedTeam) {
      db.addTeamMember(selectedTeam.id, userId)
      loadTeams()
      
      // Update available users
      const teamMembers = db.getTeamMembersByTeamId(selectedTeam.id)
      const teamMemberIds = teamMembers.map(m => m.id)
      const available = users.filter(u => 
        (u.role === 'employee' || u.role === 'team_leader') && 
        !teamMemberIds.includes(u.id) &&
        u.id !== selectedTeam.leaderId
      )
      setAvailableUsers(available)
      
      // Update selected team members
      setSelectedTeam({
        ...selectedTeam,
        members: db.getTeamMembersByTeamId(selectedTeam.id)
      })
    }
  }

  const handleRemoveMember = (userId: string) => {
    if (selectedTeam) {
      db.removeTeamMember(selectedTeam.id, userId)
      loadTeams()
      
      // Update available users
      const teamMembers = db.getTeamMembersByTeamId(selectedTeam.id)
      const teamMemberIds = teamMembers.map(m => m.id)
      const available = users.filter(u => 
        (u.role === 'employee' || u.role === 'team_leader') && 
        !teamMemberIds.includes(u.id) &&
        u.id !== selectedTeam.leaderId
      )
      setAvailableUsers(available)
      
      // Update selected team members
      setSelectedTeam({
        ...selectedTeam,
        members: db.getTeamMembersByTeamId(selectedTeam.id)
      })
    }
  }

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const canCreateTeam = user?.role === 'admin' || user?.role === 'project_manager'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Équipes</h1>
          <p className="text-gray-600">Gérez vos équipes et leurs membres</p>
        </div>
        {canCreateTeam && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Équipe</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Rechercher des équipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h3>
                  <p className="text-gray-600 text-sm">{team.description}</p>
                </div>
                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(team.status)}`}>
                    {team.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <UserIcon className="h-4 w-4" />
                    <span>Chef: {team.leader?.name}</span>
                  </div>
                  {team.project && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Projet: {team.project.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <img
                    src={team.leader?.avatar}
                    alt={team.leader?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{team.leader?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{team.leader?.role?.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Team Members Preview */}
                {team.members && team.members.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Membres</span>
                      <span className="text-xs text-gray-500">{team.members.length}</span>
                    </div>
                    <div className="flex -space-x-2">
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
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleShowMembers(team)}
                  className="flex items-center justify-center space-x-2 w-full bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <UsersIcon className="h-4 w-4" />
                  <span>Gérer les membres</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <UsersIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune équipe trouvée</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre première équipe'
            }
          </p>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nouvelle Équipe</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'équipe
                </label>
                <input
                  type="text"
                  required
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projet
                </label>
                <select
                  required
                  value={newTeam.projectId}
                  onChange={(e) => setNewTeam({ ...newTeam, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un projet</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chef d'équipe
                </label>
                <select
                  required
                  value={newTeam.leaderId}
                  onChange={(e) => setNewTeam({ ...newTeam, leaderId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un chef d'équipe</option>
                  {users.filter(u => u.role === 'team_leader').map(leader => (
                    <option key={leader.id} value={leader.id}>{leader.name}</option>
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
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Members Modal */}
      {showMembersModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Membres de l'équipe: {selectedTeam.name}
              </h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current Members */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Membres actuels</h3>
              <div className="space-y-2">
                {/* Team Leader */}
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedTeam.leader?.avatar}
                      alt={selectedTeam.leader?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedTeam.leader?.name}</p>
                      <p className="text-sm text-gray-500">Chef d'équipe</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Leader
                  </span>
                </div>

                {/* Team Members */}
                {selectedTeam.members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{member.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Retirer du groupe"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {(!selectedTeam.members || selectedTeam.members.length === 0) && (
                  <p className="text-gray-500 text-center py-4">Aucun membre dans cette équipe</p>
                )}
              </div>
            </div>

            {/* Available Users */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ajouter des membres</h3>
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(user.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Ajouter au groupe"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {availableUsers.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucun utilisateur disponible</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}