import { User, Project, Team, Task, Message, Notification, Comment } from '../types'

// Simuler une base de données avec localStorage
class Database {
  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data))
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // Users
  getUsers(): User[] {
    return this.getFromStorage<User>('users')
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(user => user.id === id)
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(user => user.email === email)
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers()
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
    users.push(newUser)
    this.saveToStorage('users', users)
    return newUser
  }

  updateUser(id: string, userData: Partial<User>): User | null {
    const users = this.getUsers()
    const index = users.findIndex(user => user.id === id)
    if (index === -1) return null
    
    users[index] = { ...users[index], ...userData }
    this.saveToStorage('users', users)
    return users[index]
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers()
    const filteredUsers = users.filter(user => user.id !== id)
    if (filteredUsers.length === users.length) return false
    
    this.saveToStorage('users', filteredUsers)
    return true
  }

  // Projects
  getProjects(): Project[] {
    return this.getFromStorage<Project>('projects')
  }

  getProjectById(id: string): Project | undefined {
    return this.getProjects().find(project => project.id === id)
  }

  createProject(projectData: Omit<Project, 'id' | 'createdAt'>): Project {
    const projects = this.getProjects()
    const newProject: Project = {
      ...projectData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
    projects.push(newProject)
    this.saveToStorage('projects', projects)
    return newProject
  }

  updateProject(id: string, projectData: Partial<Project>): Project | null {
    const projects = this.getProjects()
    const index = projects.findIndex(project => project.id === id)
    if (index === -1) return null
    
    projects[index] = { ...projects[index], ...projectData }
    this.saveToStorage('projects', projects)
    return projects[index]
  }

  deleteProject(id: string): boolean {
    const projects = this.getProjects()
    const filteredProjects = projects.filter(project => project.id !== id)
    if (filteredProjects.length === projects.length) return false
    
    this.saveToStorage('projects', filteredProjects)
    return true
  }

  // Teams
  getTeams(): Team[] {
    return this.getFromStorage<Team>('teams')
  }

  getTeamById(id: string): Team | undefined {
    return this.getTeams().find(team => team.id === id)
  }

  createTeam(teamData: Omit<Team, 'id' | 'createdAt'>): Team {
    const teams = this.getTeams()
    const newTeam: Team = {
      ...teamData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
    teams.push(newTeam)
    this.saveToStorage('teams', teams)
    return newTeam
  }

  updateTeam(id: string, teamData: Partial<Team>): Team | null {
    const teams = this.getTeams()
    const index = teams.findIndex(team => team.id === id)
    if (index === -1) return null
    
    teams[index] = { ...teams[index], ...teamData }
    this.saveToStorage('teams', teams)
    return teams[index]
  }

  deleteTeam(id: string): boolean {
    const teams = this.getTeams()
    const filteredTeams = teams.filter(team => team.id !== id)
    if (filteredTeams.length === teams.length) return false
    
    this.saveToStorage('teams', filteredTeams)
    return true
  }

  // Team Members
  getTeamMembers(): { id: string; teamId: string; userId: string; createdAt: string }[] {
    return this.getFromStorage('team_members')
  }

  addTeamMember(teamId: string, userId: string): boolean {
    const members = this.getTeamMembers()
    const exists = members.some(m => m.teamId === teamId && m.userId === userId)
    if (exists) return false

    members.push({
      id: this.generateId(),
      teamId,
      userId,
      createdAt: new Date().toISOString()
    })
    this.saveToStorage('team_members', members)
    return true
  }

  removeTeamMember(teamId: string, userId: string): boolean {
    const members = this.getTeamMembers()
    const filteredMembers = members.filter(m => !(m.teamId === teamId && m.userId === userId))
    if (filteredMembers.length === members.length) return false
    
    this.saveToStorage('team_members', filteredMembers)
    return true
  }

  getTeamMembersByTeamId(teamId: string): User[] {
    const members = this.getTeamMembers().filter(m => m.teamId === teamId)
    const users = this.getUsers()
    return members.map(m => users.find(u => u.id === m.userId)).filter(Boolean) as User[]
  }

  // Tasks
  getTasks(): Task[] {
    return this.getFromStorage<Task>('tasks')
  }

  getTaskById(id: string): Task | undefined {
    return this.getTasks().find(task => task.id === id)
  }

  createTask(taskData: Omit<Task, 'id' | 'createdAt'>): Task {
    const tasks = this.getTasks()
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
    tasks.push(newTask)
    this.saveToStorage('tasks', tasks)
    return newTask
  }

  updateTask(id: string, taskData: Partial<Task>): Task | null {
    const tasks = this.getTasks()
    const index = tasks.findIndex(task => task.id === id)
    if (index === -1) return null
    
    tasks[index] = { ...tasks[index], ...taskData }
    this.saveToStorage('tasks', tasks)
    return tasks[index]
  }

  deleteTask(id: string): boolean {
    const tasks = this.getTasks()
    const filteredTasks = tasks.filter(task => task.id !== id)
    if (filteredTasks.length === tasks.length) return false
    
    this.saveToStorage('tasks', filteredTasks)
    return true
  }

  // Task Dependencies
  getTaskDependencies(): { id: string; taskId: string; dependencyId: string; createdAt: string }[] {
    return this.getFromStorage('task_dependencies')
  }

  addTaskDependency(taskId: string, dependencyId: string): boolean {
    const dependencies = this.getTaskDependencies()
    const exists = dependencies.some(d => d.taskId === taskId && d.dependencyId === dependencyId)
    if (exists) return false

    dependencies.push({
      id: this.generateId(),
      taskId,
      dependencyId,
      createdAt: new Date().toISOString()
    })
    this.saveToStorage('task_dependencies', dependencies)
    return true
  }

  removeTaskDependency(taskId: string, dependencyId: string): boolean {
    const dependencies = this.getTaskDependencies()
    const filteredDeps = dependencies.filter(d => !(d.taskId === taskId && d.dependencyId === dependencyId))
    if (filteredDeps.length === dependencies.length) return false
    
    this.saveToStorage('task_dependencies', filteredDeps)
    return true
  }

  getTaskDependenciesByTaskId(taskId: string): Task[] {
    const dependencies = this.getTaskDependencies().filter(d => d.taskId === taskId)
    const tasks = this.getTasks()
    return dependencies.map(d => tasks.find(t => t.id === d.dependencyId)).filter(Boolean) as Task[]
  }

  // Messages
  getMessages(): Message[] {
    return this.getFromStorage<Message>('messages')
  }

  createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Message {
    const messages = this.getMessages()
    const newMessage: Message = {
      ...messageData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
    messages.push(newMessage)
    this.saveToStorage('messages', messages)
    return newMessage
  }

  markMessageAsRead(messageId: string): boolean {
    const messages = this.getMessages()
    const index = messages.findIndex(m => m.id === messageId)
    if (index === -1) return false
    
    messages[index].isRead = true
    this.saveToStorage('messages', messages)
    return true
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.getFromStorage<Notification>('notifications')
  }

  createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const notifications = this.getNotifications()
    const newNotification: Notification = {
      ...notificationData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
    notifications.push(newNotification)
    this.saveToStorage('notifications', notifications)
    return newNotification
  }

  markNotificationAsRead(notificationId: string): boolean {
    const notifications = this.getNotifications()
    const index = notifications.findIndex(n => n.id === notificationId)
    if (index === -1) return false
    
    notifications[index].isRead = true
    this.saveToStorage('notifications', notifications)
    return true
  }

  // Comments
  getComments(): Comment[] {
    return this.getFromStorage<Comment>('comments')
  }

  createComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Comment {
    const comments = this.getComments()
    const newComment: Comment = {
      ...commentData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }
    comments.push(newComment)
    this.saveToStorage('comments', comments)
    return newComment
  }

  // Authentication
  authenticateUser(email: string, password: string): User | null {
    const users = this.getUsers()
    const user = users.find(u => u.email === email)
    
    // For demo purposes, we'll store a simple hash of the password
    if (user && this.verifyPassword(password, user.id)) {
      return user
    }
    return null
  }

  private hashPassword(password: string, userId: string): string {
    // Simple hash for demo - in production use proper hashing
    return btoa(password + userId).slice(0, 20)
  }

  private verifyPassword(password: string, userId: string): boolean {
    const storedHash = localStorage.getItem(`password_${userId}`)
    return storedHash === this.hashPassword(password, userId)
  }

  setUserPassword(userId: string, password: string): void {
    const hash = this.hashPassword(password, userId)
    localStorage.setItem(`password_${userId}`, hash)
  }

  // Initialize with sample data
  initializeData(): void {
    if (this.getUsers().length === 0) {
      this.seedDatabase()
    }
  }

  private seedDatabase(): void {
    // Create users
    const admin = this.createUser({
      name: 'Sarah Johnson',
      email: 'admin@scrumflow.com',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(admin.id, 'password')

    const pm1 = this.createUser({
      name: 'Michael Chen',
      email: 'pm@scrumflow.com',
      role: 'project_manager',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(pm1.id, 'password')

    const pm2 = this.createUser({
      name: 'Jennifer Davis',
      email: 'jennifer.davis@scrumflow.com',
      role: 'project_manager',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(pm2.id, 'password')

    const tl1 = this.createUser({
      name: 'Emma Rodriguez',
      email: 'tl@scrumflow.com',
      role: 'team_leader',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(tl1.id, 'password')

    const tl2 = this.createUser({
      name: 'James Wilson',
      email: 'james.wilson@scrumflow.com',
      role: 'team_leader',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(tl2.id, 'password')

    const emp1 = this.createUser({
      name: 'David Kim',
      email: 'emp@scrumflow.com',
      role: 'employee',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(emp1.id, 'password')

    const emp2 = this.createUser({
      name: 'Sophie Martin',
      email: 'sophie.martin@scrumflow.com',
      role: 'employee',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(emp2.id, 'password')

    const emp3 = this.createUser({
      name: 'Alex Thompson',
      email: 'alex.thompson@scrumflow.com',
      role: 'employee',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(emp3.id, 'password')

    const emp4 = this.createUser({
      name: 'Maria Garcia',
      email: 'maria.garcia@scrumflow.com',
      role: 'employee',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(emp4.id, 'password')

    const emp5 = this.createUser({
      name: 'Robert Chen',
      email: 'robert.chen@scrumflow.com',
      role: 'employee',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(emp5.id, 'password')

    const client1 = this.createUser({
      name: 'Lisa Thompson',
      email: 'client@scrumflow.com',
      role: 'client',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(client1.id, 'password')

    const client2 = this.createUser({
      name: 'John Anderson',
      email: 'john.anderson@client.com',
      role: 'client',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      status: 'active'
    })
    this.setUserPassword(client2.id, 'password')

    // Create projects
    const project1 = this.createProject({
      name: 'E-commerce Platform Redesign',
      description: 'Complete redesign of the company e-commerce platform with modern UI/UX and enhanced functionality',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      progress: 65,
      clientId: client1.id,
      projectManagerId: pm1.id
    })

    const project2 = this.createProject({
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android with cross-platform compatibility',
      status: 'planning',
      startDate: '2024-03-01',
      endDate: '2024-09-15',
      progress: 25,
      clientId: client1.id,
      projectManagerId: pm1.id
    })

    const project3 = this.createProject({
      name: 'Data Analytics Dashboard',
      description: 'Business intelligence dashboard for executive reporting and data visualization',
      status: 'completed',
      startDate: '2023-09-01',
      endDate: '2024-01-31',
      progress: 100,
      clientId: client2.id,
      projectManagerId: pm2.id
    })

    const project4 = this.createProject({
      name: 'CRM System Integration',
      description: 'Integration of customer relationship management system with existing infrastructure',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-07-31',
      progress: 40,
      clientId: client2.id,
      projectManagerId: pm2.id
    })

    const project5 = this.createProject({
      name: 'Security Audit & Enhancement',
      description: 'Comprehensive security audit and implementation of enhanced security measures',
      status: 'planning',
      startDate: '2024-04-01',
      endDate: '2024-08-31',
      progress: 10,
      clientId: client1.id,
      projectManagerId: pm1.id
    })

    // Create teams
    const team1 = this.createTeam({
      name: 'Frontend Development',
      description: 'Équipe responsable du développement frontend et de l\'interface utilisateur',
      projectId: project1.id,
      leaderId: tl1.id,
      status: 'active'
    })

    const team2 = this.createTeam({
      name: 'Backend Development',
      description: 'Équipe responsable de l\'architecture backend et des APIs',
      projectId: project1.id,
      leaderId: tl2.id,
      status: 'active'
    })

    const team3 = this.createTeam({
      name: 'Mobile Development',
      description: 'Équipe dédiée au développement de l\'application mobile native',
      projectId: project2.id,
      leaderId: tl1.id,
      status: 'active'
    })

    const team4 = this.createTeam({
      name: 'Data Analytics',
      description: 'Équipe spécialisée dans l\'analyse de données et la business intelligence',
      projectId: project3.id,
      leaderId: tl2.id,
      status: 'active'
    })

    const team5 = this.createTeam({
      name: 'Integration Team',
      description: 'Équipe d\'intégration système et middleware',
      projectId: project4.id,
      leaderId: tl1.id,
      status: 'active'
    })

    const team6 = this.createTeam({
      name: 'Security Team',
      description: 'Équipe de sécurité et audit',
      projectId: project5.id,
      leaderId: tl2.id,
      status: 'active'
    })

    // Add team members
    this.addTeamMember(team1.id, emp1.id)
    this.addTeamMember(team1.id, emp2.id)
    this.addTeamMember(team1.id, emp3.id)
    this.addTeamMember(team2.id, emp4.id)
    this.addTeamMember(team2.id, emp5.id)
    this.addTeamMember(team3.id, emp1.id)
    this.addTeamMember(team3.id, emp3.id)
    this.addTeamMember(team4.id, emp2.id)
    this.addTeamMember(team4.id, emp4.id)
    this.addTeamMember(team5.id, emp5.id)
    this.addTeamMember(team5.id, emp1.id)
    this.addTeamMember(team6.id, emp2.id)
    this.addTeamMember(team6.id, emp3.id)
    this.addTeamMember(team6.id, emp4.id)

    // Create tasks with more realistic dates and dependencies
    const task1 = this.createTask({
      title: 'Design System Creation',
      description: 'Create comprehensive design system with components library for consistent UI/UX',
      status: 'completed',
      priority: 'high',
      progress: 100,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      projectId: project1.id,
      teamId: team1.id,
      assignedTo: emp1.id
    })

    const task2 = this.createTask({
      title: 'Homepage Redesign',
      description: 'Complete redesign of the homepage with new layout and modern components',
      status: 'in_progress',
      priority: 'medium',
      progress: 60,
      startDate: '2024-02-16',
      endDate: '2024-03-15',
      projectId: project1.id,
      teamId: team1.id,
      assignedTo: emp2.id
    })

    const task3 = this.createTask({
      title: 'Product Catalog Interface',
      description: 'Design and implement the product catalog with filtering and search capabilities',
      status: 'pending',
      priority: 'high',
      progress: 0,
      startDate: '2024-03-16',
      endDate: '2024-04-30',
      projectId: project1.id,
      teamId: team1.id,
      assignedTo: emp3.id
    })

    const task4 = this.createTask({
      title: 'API Architecture Setup',
      description: 'Design and implement the core API architecture with authentication and authorization',
      status: 'completed',
      priority: 'high',
      progress: 100,
      startDate: '2024-01-15',
      endDate: '2024-02-28',
      projectId: project1.id,
      teamId: team2.id,
      assignedTo: emp4.id
    })

    const task5 = this.createTask({
      title: 'Payment Gateway Integration',
      description: 'Integrate with payment gateway and implement secure payment processing',
      status: 'in_progress',
      priority: 'high',
      progress: 45,
      startDate: '2024-03-01',
      endDate: '2024-04-15',
      projectId: project1.id,
      teamId: team2.id,
      assignedTo: emp5.id
    })

    const task6 = this.createTask({
      title: 'Inventory Management System',
      description: 'Implement inventory tracking and management system',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      startDate: '2024-04-16',
      endDate: '2024-05-31',
      projectId: project1.id,
      teamId: team2.id,
      assignedTo: emp4.id
    })

    const task7 = this.createTask({
      title: 'User Authentication System',
      description: 'Implement secure user authentication with multi-factor authentication',
      status: 'delayed',
      priority: 'high',
      progress: 30,
      startDate: '2024-02-01',
      endDate: '2024-03-01',
      projectId: project1.id,
      teamId: team2.id,
      assignedTo: emp5.id
    })

    const task8 = this.createTask({
      title: 'Shopping Cart Functionality',
      description: 'Implement shopping cart with session management and persistence',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      startDate: '2024-04-01',
      endDate: '2024-04-30',
      projectId: project1.id,
      teamId: team1.id,
      assignedTo: emp1.id
    })

    const task9 = this.createTask({
      title: 'Order Management System',
      description: 'Complete order processing workflow from cart to fulfillment',
      status: 'pending',
      priority: 'high',
      progress: 0,
      startDate: '2024-05-01',
      endDate: '2024-06-15',
      projectId: project1.id,
      teamId: team2.id,
      assignedTo: emp4.id
    })

    const task10 = this.createTask({
      title: 'Performance Optimization',
      description: 'Optimize application performance and implement caching strategies',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      projectId: project1.id,
      teamId: team2.id,
      assignedTo: emp5.id
    })

    // Add task dependencies
    this.addTaskDependency(task2.id, task1.id) // Homepage depends on Design System
    this.addTaskDependency(task3.id, task1.id) // Product Catalog depends on Design System
    this.addTaskDependency(task5.id, task4.id) // Payment Gateway depends on API Architecture
    this.addTaskDependency(task6.id, task4.id) // Inventory depends on API Architecture
    this.addTaskDependency(task8.id, task2.id) // Shopping Cart depends on Homepage
    this.addTaskDependency(task8.id, task7.id) // Shopping Cart depends on Authentication
    this.addTaskDependency(task9.id, task5.id) // Order Management depends on Payment Gateway
    this.addTaskDependency(task9.id, task6.id) // Order Management depends on Inventory
    this.addTaskDependency(task10.id, task9.id) // Performance depends on Order Management

    // Mobile app tasks
    const mobileTask1 = this.createTask({
      title: 'Mobile App Architecture',
      description: 'Design and implement the core architecture for the mobile application',
      status: 'in_progress',
      priority: 'high',
      progress: 60,
      startDate: '2024-03-01',
      endDate: '2024-04-15',
      projectId: project2.id,
      teamId: team3.id,
      assignedTo: emp1.id
    })

    const mobileTask2 = this.createTask({
      title: 'iOS App Development',
      description: 'Develop native iOS application with Swift',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      startDate: '2024-04-16',
      endDate: '2024-07-31',
      projectId: project2.id,
      teamId: team3.id,
      assignedTo: emp3.id
    })

    const mobileTask3 = this.createTask({
      title: 'Android App Development',
      description: 'Develop native Android application with Kotlin',
      status: 'pending',
      priority: 'medium',
      progress: 0,
      startDate: '2024-04-16',
      endDate: '2024-07-31',
      projectId: project2.id,
      teamId: team3.id,
      assignedTo: emp1.id
    })

    this.addTaskDependency(mobileTask2.id, mobileTask1.id)
    this.addTaskDependency(mobileTask3.id, mobileTask1.id)

    // Create notifications
    this.createNotification({
      type: 'info',
      title: 'Task Assignment',
      message: 'You have been assigned to "Homepage Redesign" task',
      userId: emp2.id,
      projectId: project1.id,
      taskId: task2.id,
      isRead: false
    })

    this.createNotification({
      type: 'warning',
      title: 'Deadline Approaching',
      message: 'User Authentication System task is overdue',
      userId: emp5.id,
      projectId: project1.id,
      taskId: task7.id,
      isRead: false
    })

    this.createNotification({
      type: 'success',
      title: 'Task Completed',
      message: 'Design System Creation has been marked as completed',
      userId: pm1.id,
      projectId: project1.id,
      taskId: task1.id,
      isRead: true
    })

    this.createNotification({
      type: 'info',
      title: 'New Team Member',
      message: 'Alex Thompson has been added to Frontend Development team',
      userId: tl1.id,
      projectId: project1.id,
      isRead: false
    })

    this.createNotification({
      type: 'warning',
      title: 'Project Milestone',
      message: 'E-commerce Platform Redesign has reached 65% completion',
      userId: client1.id,
      projectId: project1.id,
      isRead: false
    })

    // Create messages
    this.createMessage({
      content: 'The design system is progressing well. Color palette has been finalized and approved.',
      senderId: emp1.id,
      receiverId: tl1.id,
      projectId: project1.id,
      type: 'private',
      isRead: false
    })

    this.createMessage({
      content: 'Great work on the homepage mockups! Can we schedule a review meeting for tomorrow?',
      senderId: pm1.id,
      receiverId: tl1.id,
      projectId: project1.id,
      type: 'private',
      isRead: true
    })

    this.createMessage({
      content: 'Team meeting scheduled for Friday at 2 PM to discuss API integration progress.',
      senderId: tl2.id,
      teamId: team2.id,
      projectId: project1.id,
      type: 'team',
      isRead: false
    })

    // Create comments
    this.createComment({
      content: 'Great progress on the color system! The contrast ratios look perfect and meet accessibility standards.',
      userId: tl1.id,
      projectId: project1.id,
      taskId: task1.id
    })

    this.createComment({
      content: 'Can you also include the dark mode variants in the next update? This will be important for user experience.',
      userId: pm1.id,
      projectId: project1.id,
      taskId: task1.id
    })

    this.createComment({
      content: 'The API integration is going smoothly. Payment gateway is already connected and tested.',
      userId: emp5.id,
      projectId: project1.id,
      taskId: task5.id
    })
  }
}

export const db = new Database()