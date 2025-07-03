<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Project;
use App\Models\Team;
use App\Models\Task;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Comment;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Users
        $admin = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'admin@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'avatar' => 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $pm1 = User::create([
            'name' => 'Michael Chen',
            'email' => 'pm@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'project_manager',
            'avatar' => 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $pm2 = User::create([
            'name' => 'Jennifer Davis',
            'email' => 'jennifer.davis@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'project_manager',
            'avatar' => 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $tl1 = User::create([
            'name' => 'Emma Rodriguez',
            'email' => 'tl@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'team_leader',
            'avatar' => 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $tl2 = User::create([
            'name' => 'James Wilson',
            'email' => 'james.wilson@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'team_leader',
            'avatar' => 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $emp1 = User::create([
            'name' => 'David Kim',
            'email' => 'emp@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'avatar' => 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $emp2 = User::create([
            'name' => 'Sophie Martin',
            'email' => 'sophie.martin@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'avatar' => 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $emp3 = User::create([
            'name' => 'Alex Thompson',
            'email' => 'alex.thompson@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'avatar' => 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $emp4 = User::create([
            'name' => 'Maria Garcia',
            'email' => 'maria.garcia@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'avatar' => 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $emp5 = User::create([
            'name' => 'Robert Chen',
            'email' => 'robert.chen@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'avatar' => 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $client1 = User::create([
            'name' => 'Lisa Thompson',
            'email' => 'client@promanage.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'avatar' => 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        $client2 = User::create([
            'name' => 'John Anderson',
            'email' => 'john.anderson@client.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'avatar' => 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            'status' => 'active',
        ]);

        // Create Projects
        $project1 = Project::create([
            'name' => 'E-commerce Platform Redesign',
            'description' => 'Complete redesign of the company e-commerce platform with modern UI/UX and enhanced functionality',
            'status' => 'active',
            'start_date' => '2024-01-15',
            'end_date' => '2024-06-30',
            'progress' => 65,
            'client_id' => $client1->id,
            'project_manager_id' => $pm1->id,
        ]);

        $project2 = Project::create([
            'name' => 'Mobile App Development',
            'description' => 'Native mobile application for iOS and Android with cross-platform compatibility',
            'status' => 'planning',
            'start_date' => '2024-03-01',
            'end_date' => '2024-09-15',
            'progress' => 25,
            'client_id' => $client1->id,
            'project_manager_id' => $pm1->id,
        ]);

        $project3 = Project::create([
            'name' => 'Data Analytics Dashboard',
            'description' => 'Business intelligence dashboard for executive reporting and data visualization',
            'status' => 'completed',
            'start_date' => '2023-09-01',
            'end_date' => '2024-01-31',
            'progress' => 100,
            'client_id' => $client2->id,
            'project_manager_id' => $pm2->id,
        ]);

        $project4 = Project::create([
            'name' => 'CRM System Integration',
            'description' => 'Integration of customer relationship management system with existing infrastructure',
            'status' => 'active',
            'start_date' => '2024-02-01',
            'end_date' => '2024-07-31',
            'progress' => 40,
            'client_id' => $client2->id,
            'project_manager_id' => $pm2->id,
        ]);

        $project5 = Project::create([
            'name' => 'Security Audit & Enhancement',
            'description' => 'Comprehensive security audit and implementation of enhanced security measures',
            'status' => 'planning',
            'start_date' => '2024-04-01',
            'end_date' => '2024-08-31',
            'progress' => 10,
            'client_id' => $client1->id,
            'project_manager_id' => $pm1->id,
        ]);

        // Create Teams
        $team1 = Team::create([
            'name' => 'Frontend Development',
            'description' => 'Équipe responsable du développement frontend et de l\'interface utilisateur',
            'project_id' => $project1->id,
            'leader_id' => $tl1->id,
            'status' => 'active',
        ]);

        $team2 = Team::create([
            'name' => 'Backend Development',
            'description' => 'Équipe responsable de l\'architecture backend et des APIs',
            'project_id' => $project1->id,
            'leader_id' => $tl2->id,
            'status' => 'active',
        ]);

        $team3 = Team::create([
            'name' => 'Mobile Development',
            'description' => 'Équipe dédiée au développement de l\'application mobile native',
            'project_id' => $project2->id,
            'leader_id' => $tl1->id,
            'status' => 'active',
        ]);

        $team4 = Team::create([
            'name' => 'Data Analytics',
            'description' => 'Équipe spécialisée dans l\'analyse de données et la business intelligence',
            'project_id' => $project3->id,
            'leader_id' => $tl2->id,
            'status' => 'active',
        ]);

        $team5 = Team::create([
            'name' => 'Integration Team',
            'description' => 'Équipe d\'intégration système et middleware',
            'project_id' => $project4->id,
            'leader_id' => $tl1->id,
            'status' => 'active',
        ]);

        $team6 = Team::create([
            'name' => 'Security Team',
            'description' => 'Équipe de sécurité et audit',
            'project_id' => $project5->id,
            'leader_id' => $tl2->id,
            'status' => 'active',
        ]);

        // Add team members
        $team1->members()->attach([$emp1->id, $emp2->id, $emp3->id]);
        $team2->members()->attach([$emp4->id, $emp5->id]);
        $team3->members()->attach([$emp1->id, $emp3->id]);
        $team4->members()->attach([$emp2->id, $emp4->id]);
        $team5->members()->attach([$emp5->id, $emp1->id]);
        $team6->members()->attach([$emp2->id, $emp3->id, $emp4->id]);

        // Create Tasks
        $task1 = Task::create([
            'title' => 'Design System Creation',
            'description' => 'Create comprehensive design system with components library for consistent UI/UX',
            'status' => 'in_progress',
            'priority' => 'high',
            'progress' => 80,
            'start_date' => '2024-01-15',
            'end_date' => '2024-02-28',
            'project_id' => $project1->id,
            'team_id' => $team1->id,
            'assigned_to' => $emp1->id,
        ]);

        $task2 = Task::create([
            'title' => 'Homepage Redesign',
            'description' => 'Complete redesign of the homepage with new layout and modern components',
            'status' => 'pending',
            'priority' => 'medium',
            'progress' => 0,
            'start_date' => '2024-03-01',
            'end_date' => '2024-03-15',
            'project_id' => $project1->id,
            'team_id' => $team1->id,
            'assigned_to' => $emp2->id,
        ]);

        $task3 = Task::create([
            'title' => 'API Integration',
            'description' => 'Integrate with payment gateway and inventory management APIs',
            'status' => 'in_progress',
            'priority' => 'high',
            'progress' => 45,
            'start_date' => '2024-02-01',
            'end_date' => '2024-03-30',
            'project_id' => $project1->id,
            'team_id' => $team2->id,
            'assigned_to' => $emp4->id,
        ]);

        $task4 = Task::create([
            'title' => 'Database Optimization',
            'description' => 'Optimize database queries and implement caching strategies',
            'status' => 'completed',
            'priority' => 'medium',
            'progress' => 100,
            'start_date' => '2024-01-20',
            'end_date' => '2024-02-15',
            'project_id' => $project1->id,
            'team_id' => $team2->id,
            'assigned_to' => $emp5->id,
        ]);

        $task5 = Task::create([
            'title' => 'User Authentication System',
            'description' => 'Implement secure user authentication with multi-factor authentication',
            'status' => 'delayed',
            'priority' => 'high',
            'progress' => 30,
            'start_date' => '2024-01-10',
            'end_date' => '2024-02-10',
            'project_id' => $project1->id,
            'team_id' => $team2->id,
            'assigned_to' => $emp4->id,
        ]);

        $task6 = Task::create([
            'title' => 'Mobile App Architecture',
            'description' => 'Design and implement the core architecture for the mobile application',
            'status' => 'in_progress',
            'priority' => 'high',
            'progress' => 60,
            'start_date' => '2024-03-01',
            'end_date' => '2024-04-15',
            'project_id' => $project2->id,
            'team_id' => $team3->id,
            'assigned_to' => $emp1->id,
        ]);

        $task7 = Task::create([
            'title' => 'iOS App Development',
            'description' => 'Develop native iOS application with Swift',
            'status' => 'pending',
            'priority' => 'medium',
            'progress' => 0,
            'start_date' => '2024-04-01',
            'end_date' => '2024-07-31',
            'project_id' => $project2->id,
            'team_id' => $team3->id,
            'assigned_to' => $emp3->id,
        ]);

        $task8 = Task::create([
            'title' => 'Android App Development',
            'description' => 'Develop native Android application with Kotlin',
            'status' => 'pending',
            'priority' => 'medium',
            'progress' => 0,
            'start_date' => '2024-04-01',
            'end_date' => '2024-07-31',
            'project_id' => $project2->id,
            'team_id' => $team3->id,
            'assigned_to' => $emp1->id,
        ]);

        $task9 = Task::create([
            'title' => 'Data Visualization Dashboard',
            'description' => 'Create interactive data visualization dashboard with charts and graphs',
            'status' => 'completed',
            'priority' => 'high',
            'progress' => 100,
            'start_date' => '2023-09-01',
            'end_date' => '2023-12-31',
            'project_id' => $project3->id,
            'team_id' => $team4->id,
            'assigned_to' => $emp2->id,
        ]);

        $task10 = Task::create([
            'title' => 'Report Generation System',
            'description' => 'Implement automated report generation with scheduling capabilities',
            'status' => 'completed',
            'priority' => 'medium',
            'progress' => 100,
            'start_date' => '2023-11-01',
            'end_date' => '2024-01-31',
            'project_id' => $project3->id,
            'team_id' => $team4->id,
            'assigned_to' => $emp4->id,
        ]);

        $task11 = Task::create([
            'title' => 'CRM API Integration',
            'description' => 'Integrate with third-party CRM system APIs',
            'status' => 'in_progress',
            'priority' => 'high',
            'progress' => 70,
            'start_date' => '2024-02-01',
            'end_date' => '2024-04-30',
            'project_id' => $project4->id,
            'team_id' => $team5->id,
            'assigned_to' => $emp5->id,
        ]);

        $task12 = Task::create([
            'title' => 'Data Migration',
            'description' => 'Migrate existing customer data to new CRM system',
            'status' => 'pending',
            'priority' => 'medium',
            'progress' => 0,
            'start_date' => '2024-05-01',
            'end_date' => '2024-06-30',
            'project_id' => $project4->id,
            'team_id' => $team5->id,
            'assigned_to' => $emp1->id,
        ]);

        $task13 = Task::create([
            'title' => 'Security Assessment',
            'description' => 'Comprehensive security assessment of current infrastructure',
            'status' => 'pending',
            'priority' => 'high',
            'progress' => 0,
            'start_date' => '2024-04-01',
            'end_date' => '2024-05-31',
            'project_id' => $project5->id,
            'team_id' => $team6->id,
            'assigned_to' => $emp2->id,
        ]);

        $task14 = Task::create([
            'title' => 'Penetration Testing',
            'description' => 'Conduct penetration testing to identify vulnerabilities',
            'status' => 'pending',
            'priority' => 'high',
            'progress' => 0,
            'start_date' => '2024-06-01',
            'end_date' => '2024-07-31',
            'project_id' => $project5->id,
            'team_id' => $team6->id,
            'assigned_to' => $emp3->id,
        ]);

        $task15 = Task::create([
            'title' => 'Security Implementation',
            'description' => 'Implement security enhancements based on audit findings',
            'status' => 'pending',
            'priority' => 'high',
            'progress' => 0,
            'start_date' => '2024-07-01',
            'end_date' => '2024-08-31',
            'project_id' => $project5->id,
            'team_id' => $team6->id,
            'assigned_to' => $emp4->id,
        ]);

        // Create Subtasks
        Task::create([
            'title' => 'Color Palette Definition',
            'description' => 'Define primary and secondary color palettes with accessibility considerations',
            'status' => 'completed',
            'priority' => 'medium',
            'progress' => 100,
            'start_date' => '2024-01-15',
            'end_date' => '2024-01-25',
            'project_id' => $project1->id,
            'team_id' => $team1->id,
            'assigned_to' => $emp1->id,
            'parent_task_id' => $task1->id,
        ]);

        Task::create([
            'title' => 'Typography Guidelines',
            'description' => 'Establish typography hierarchy and font selection guidelines',
            'status' => 'in_progress',
            'priority' => 'medium',
            'progress' => 60,
            'start_date' => '2024-01-20',
            'end_date' => '2024-02-05',
            'project_id' => $project1->id,
            'team_id' => $team1->id,
            'assigned_to' => $emp1->id,
            'parent_task_id' => $task1->id,
        ]);

        Task::create([
            'title' => 'Component Library',
            'description' => 'Create reusable UI components library',
            'status' => 'pending',
            'priority' => 'high',
            'progress' => 0,
            'start_date' => '2024-02-01',
            'end_date' => '2024-02-28',
            'project_id' => $project1->id,
            'team_id' => $team1->id,
            'assigned_to' => $emp2->id,
            'parent_task_id' => $task1->id,
        ]);

        // Add task dependencies
        $task2->dependencies()->attach($task1->id);
        $task7->dependencies()->attach($task6->id);
        $task8->dependencies()->attach($task6->id);
        $task12->dependencies()->attach($task11->id);
        $task14->dependencies()->attach($task13->id);
        $task15->dependencies()->attach($task14->id);

        // Create Messages
        Message::create([
            'content' => 'The design system is progressing well. Color palette has been finalized and approved.',
            'sender_id' => $emp1->id,
            'receiver_id' => $tl1->id,
            'project_id' => $project1->id,
            'type' => 'private',
            'is_read' => false,
        ]);

        Message::create([
            'content' => 'Great work on the homepage mockups! Can we schedule a review meeting for tomorrow?',
            'sender_id' => $pm1->id,
            'receiver_id' => $tl1->id,
            'project_id' => $project1->id,
            'type' => 'private',
            'is_read' => true,
        ]);

        Message::create([
            'content' => 'Team meeting scheduled for Friday at 2 PM to discuss API integration progress.',
            'sender_id' => $tl2->id,
            'team_id' => $team2->id,
            'project_id' => $project1->id,
            'type' => 'team',
            'is_read' => false,
        ]);

        Message::create([
            'content' => 'The mobile app architecture document is ready for review. Please check the shared folder.',
            'sender_id' => $emp1->id,
            'receiver_id' => $pm1->id,
            'project_id' => $project2->id,
            'type' => 'private',
            'is_read' => false,
        ]);

        Message::create([
            'content' => 'Security audit planning meeting tomorrow at 10 AM. All team members please attend.',
            'sender_id' => $tl2->id,
            'team_id' => $team6->id,
            'project_id' => $project5->id,
            'type' => 'team',
            'is_read' => false,
        ]);

        // Create Notifications
        Notification::create([
            'type' => 'info',
            'title' => 'Task Assignment',
            'message' => 'You have been assigned to "Homepage Redesign" task',
            'user_id' => $emp2->id,
            'project_id' => $project1->id,
            'task_id' => $task2->id,
            'is_read' => false,
        ]);

        Notification::create([
            'type' => 'warning',
            'title' => 'Deadline Approaching',
            'message' => 'User Authentication System task is overdue',
            'user_id' => $emp4->id,
            'project_id' => $project1->id,
            'task_id' => $task5->id,
            'is_read' => false,
        ]);

        Notification::create([
            'type' => 'success',
            'title' => 'Task Completed',
            'message' => 'Database Optimization has been marked as completed',
            'user_id' => $pm1->id,
            'project_id' => $project1->id,
            'task_id' => $task4->id,
            'is_read' => true,
        ]);

        Notification::create([
            'type' => 'info',
            'title' => 'New Team Member',
            'message' => 'Alex Thompson has been added to Frontend Development team',
            'user_id' => $tl1->id,
            'project_id' => $project1->id,
            'is_read' => false,
        ]);

        Notification::create([
            'type' => 'warning',
            'title' => 'Project Milestone',
            'message' => 'E-commerce Platform Redesign has reached 65% completion',
            'user_id' => $client1->id,
            'project_id' => $project1->id,
            'is_read' => false,
        ]);

        // Create Comments
        Comment::create([
            'content' => 'Great progress on the color system! The contrast ratios look perfect and meet accessibility standards.',
            'user_id' => $tl1->id,
            'project_id' => $project1->id,
            'task_id' => $task1->id,
        ]);

        Comment::create([
            'content' => 'Can you also include the dark mode variants in the next update? This will be important for user experience.',
            'user_id' => $pm1->id,
            'project_id' => $project1->id,
            'task_id' => $task1->id,
        ]);

        Comment::create([
            'content' => 'The API integration is going smoothly. Payment gateway is already connected and tested.',
            'user_id' => $emp4->id,
            'project_id' => $project1->id,
            'task_id' => $task3->id,
        ]);

        Comment::create([
            'content' => 'Excellent work on the mobile architecture! The modular approach will make development much easier.',
            'user_id' => $tl1->id,
            'project_id' => $project2->id,
            'task_id' => $task6->id,
        ]);

        Comment::create([
            'content' => 'The data visualization dashboard looks amazing. The charts are very intuitive and informative.',
            'user_id' => $client2->id,
            'project_id' => $project3->id,
            'task_id' => $task9->id,
        ]);
    }
}