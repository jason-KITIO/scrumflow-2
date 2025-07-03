export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'project_manager' | 'team_leader' | 'employee' | 'client'
  avatar: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed'
  startDate: string
  endDate: string
  progress: number
  clientId: string
  projectManagerId: string
  createdAt: string
  client?: User
  projectManager?: User
  teams?: Team[]
  tasks?: Task[]
}

export interface Team {
  id: string
  name: string
  description: string
  projectId: string
  leaderId: string
  status: 'active' | 'inactive'
  createdAt: string
  project?: Project
  leader?: User
  members?: User[]
  tasks?: Task[]
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  priority: 'low' | 'medium' | 'high'
  progress: number
  startDate: string
  endDate: string
  projectId: string
  teamId?: string
  assignedTo?: string
  parentTaskId?: string
  createdAt: string
  project?: Project
  team?: Team
  assignedUser?: User
  parentTask?: Task
  subtasks?: Task[]
  dependencies?: Task[]
}

export interface Message {
  id: string
  content: string
  senderId: string
  receiverId?: string
  projectId?: string
  teamId?: string
  isRead: boolean
  type: 'private' | 'team' | 'project'
  createdAt: string
  sender?: User
  receiver?: User
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  userId: string
  projectId?: string
  taskId?: string
  isRead: boolean
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  userId: string
  projectId?: string
  taskId?: string
  createdAt: string
  user?: User
}