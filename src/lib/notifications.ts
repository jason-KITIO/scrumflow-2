import { db } from './database'
import { User, Project, Task } from '../types'

export class NotificationService {
  static createTaskAssignmentNotification(task: Task, assignedUser: User, project: Project) {
    // Notification pour l'utilisateur assigné
    db.createNotification({
      type: 'info',
      title: 'Nouvelle tâche assignée',
      message: `Vous avez été assigné(e) à la tâche "${task.title}" dans le projet "${project.name}"`,
      userId: assignedUser.id,
      projectId: project.id,
      taskId: task.id,
      isRead: false
    })

    // Notification pour le chef d'équipe si la tâche est assignée à une équipe
    if (task.teamId) {
      const team = db.getTeamById(task.teamId)
      if (team && team.leaderId !== assignedUser.id) {
        const teamLeader = db.getUserById(team.leaderId)
        if (teamLeader) {
          db.createNotification({
            type: 'info',
            title: 'Tâche assignée dans votre équipe',
            message: `La tâche "${task.title}" a été assignée à ${assignedUser.name} dans l'équipe "${team.name}"`,
            userId: teamLeader.id,
            projectId: project.id,
            taskId: task.id,
            isRead: false
          })
        }
      }
    }

    // Notification pour le chef de projet
    const projectManager = db.getUserById(project.projectManagerId)
    if (projectManager && projectManager.id !== assignedUser.id) {
      db.createNotification({
        type: 'info',
        title: 'Tâche assignée dans votre projet',
        message: `La tâche "${task.title}" a été assignée à ${assignedUser.name} dans le projet "${project.name}"`,
        userId: projectManager.id,
        projectId: project.id,
        taskId: task.id,
        isRead: false
      })
    }

    // Notification pour les administrateurs
    const admins = db.getUsers().filter(user => user.role === 'admin')
    admins.forEach(admin => {
      if (admin.id !== assignedUser.id && admin.id !== projectManager?.id) {
        db.createNotification({
          type: 'info',
          title: 'Nouvelle assignation de tâche',
          message: `La tâche "${task.title}" a été assignée à ${assignedUser.name} dans le projet "${project.name}"`,
          userId: admin.id,
          projectId: project.id,
          taskId: task.id,
          isRead: false
        })
      }
    })
  }

  static createProjectDateChangeNotification(project: Project, oldEndDate: string, newEndDate: string, reason: string) {
    const affectedUsers = new Set<string>()

    // Ajouter le chef de projet
    affectedUsers.add(project.projectManagerId)

    // Ajouter le client
    affectedUsers.add(project.clientId)

    // Ajouter les chefs d'équipe du projet
    const projectTeams = db.getTeams().filter(team => team.projectId === project.id)
    projectTeams.forEach(team => {
      affectedUsers.add(team.leaderId)
    })

    // Ajouter les membres des équipes
    projectTeams.forEach(team => {
      const members = db.getTeamMembersByTeamId(team.id)
      members.forEach(member => {
        affectedUsers.add(member.id)
      })
    })

    // Ajouter les administrateurs
    const admins = db.getUsers().filter(user => user.role === 'admin')
    admins.forEach(admin => {
      affectedUsers.add(admin.id)
    })

    // Créer les notifications
    const oldDate = new Date(oldEndDate).toLocaleDateString('fr-FR')
    const newDate = new Date(newEndDate).toLocaleDateString('fr-FR')
    const isDelay = new Date(newEndDate) > new Date(oldEndDate)

    affectedUsers.forEach(userId => {
      const user = db.getUserById(userId)
      if (user) {
        db.createNotification({
          type: isDelay ? 'warning' : 'info',
          title: isDelay ? 'Retard de projet détecté' : 'Date de fin de projet modifiée',
          message: `La date de fin du projet "${project.name}" a été ${isDelay ? 'reportée' : 'avancée'} du ${oldDate} au ${newDate}. Raison: ${reason}`,
          userId: userId,
          projectId: project.id,
          isRead: false
        })
      }
    })
  }

  static createTaskCreationNotification(tasks: Task[], project: Project, createdBy: User, isImported: boolean = false) {
    const affectedUsers = new Set<string>()

    // Ajouter le chef de projet
    affectedUsers.add(project.projectManagerId)

    // Ajouter les chefs d'équipe concernés
    tasks.forEach(task => {
      if (task.teamId) {
        const team = db.getTeamById(task.teamId)
        if (team) {
          affectedUsers.add(team.leaderId)
        }
      }
    })

    // Ajouter les administrateurs
    const admins = db.getUsers().filter(user => user.role === 'admin')
    admins.forEach(admin => {
      affectedUsers.add(admin.id)
    })

    // Créer les notifications
    const taskCount = tasks.length
    const method = isImported ? 'importées depuis Excel' : 'créées manuellement'

    affectedUsers.forEach(userId => {
      if (userId !== createdBy.id) {
        const user = db.getUserById(userId)
        if (user) {
          db.createNotification({
            type: 'info',
            title: `Nouvelles tâches ${isImported ? 'importées' : 'créées'}`,
            message: `${taskCount} nouvelle${taskCount > 1 ? 's' : ''} tâche${taskCount > 1 ? 's ont' : ' a'} été ${method} dans le projet "${project.name}" par ${createdBy.name}`,
            userId: userId,
            projectId: project.id,
            isRead: false
          })
        }
      }
    })
  }

  static calculateProjectEndDate(projectId: string, projectStartDate: string): { endDate: string, hasChanged: boolean } {
    const tasks = db.getTasks().filter(task => task.projectId === projectId)
    
    if (tasks.length === 0) {
      return { endDate: projectStartDate, hasChanged: false }
    }

    // Calculer la date de fin basée sur les tâches et leurs dépendances
    const taskEndDates = tasks.map(task => new Date(task.endDate))
    const latestTaskEndDate = new Date(Math.max(...taskEndDates.map(date => date.getTime())))
    
    const project = db.getProjectById(projectId)
    if (!project) {
      return { endDate: latestTaskEndDate.toISOString().split('T')[0], hasChanged: false }
    }

    const currentEndDate = new Date(project.endDate)
    const hasChanged = latestTaskEndDate.getTime() !== currentEndDate.getTime()

    return {
      endDate: latestTaskEndDate.toISOString().split('T')[0],
      hasChanged
    }
  }

  static updateProjectEndDateIfNeeded(projectId: string, reason: string = 'Modification des tâches') {
    const project = db.getProjectById(projectId)
    if (!project) return

    const { endDate: newEndDate, hasChanged } = this.calculateProjectEndDate(projectId, project.startDate)
    
    if (hasChanged) {
      const oldEndDate = project.endDate
      
      // Mettre à jour la date de fin du projet
      db.updateProject(projectId, { endDate: newEndDate })
      
      // Créer les notifications
      this.createProjectDateChangeNotification(project, oldEndDate, newEndDate, reason)
    }
  }
}