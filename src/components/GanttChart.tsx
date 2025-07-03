import React, { useMemo, useRef } from 'react'
import { Task } from '../types'
import { Printer, Download } from 'lucide-react'

interface GanttChartProps {
  tasks: Task[]
  startDate: string
  endDate: string
}

export default function GanttChart({ tasks, startDate, endDate }: GanttChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const { chartData, timelineData } = useMemo(() => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    // Generate timeline (weeks)
    const timeline = []
    const current = new Date(start)
    while (current <= end) {
      timeline.push({
        date: new Date(current),
        week: `Sem ${Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1}`
      })
      current.setDate(current.getDate() + 7)
    }
    
    // Process tasks for Gantt display
    const processedTasks = tasks.map(task => {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)
      
      const startOffset = Math.max(0, (taskStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const duration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)
      
      return {
        ...task,
        startOffset: (startOffset / totalDays) * 100,
        width: (duration / totalDays) * 100,
        isOverdue: taskEnd < new Date() && task.status !== 'completed'
      }
    })
    
    return {
      chartData: processedTasks,
      timelineData: timeline
    }
  }, [tasks, startDate, endDate])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow && svgRef.current) {
      const svgContent = svgRef.current.outerHTML
      printWindow.document.write(`
        <html>
          <head>
            <title>Diagramme de Gantt - Scrum Flow</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              h1 { color: #1f2937; margin-bottom: 20px; }
              .gantt-container { width: 100%; overflow-x: auto; }
              .gantt-chart { min-width: 800px; }
              @media print {
                body { margin: 0; }
                .gantt-container { overflow: visible; }
                .gantt-chart { width: 100%; }
              }
            </style>
          </head>
          <body>
            <h1>Diagramme de Gantt</h1>
            <div class="gantt-container">
              <div class="gantt-chart">${svgContent}</div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleDownload = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = svgUrl
      downloadLink.download = 'diagramme-gantt.svg'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(svgUrl)
    }
  }

  const getStatusColor = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-red-500'
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'pending': return 'bg-yellow-500'
      case 'delayed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-600'
      case 'medium': return 'border-l-4 border-yellow-600'
      case 'low': return 'border-l-4 border-green-600'
      default: return 'border-l-4 border-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Diagramme de Gantt</h3>
          <p className="text-sm text-gray-600">Planification et suivi des tâches</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px]" ref={svgRef}>
          {/* Timeline Header */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-64 p-3 font-medium text-gray-900 border-r border-gray-200">
              Tâches
            </div>
            <div className="flex-1 flex">
              {timelineData.map((week, index) => (
                <div
                  key={index}
                  className="flex-1 p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200"
                >
                  {week.week}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="divide-y divide-gray-200">
            {chartData.map((task) => (
              <div key={task.id} className="flex items-center hover:bg-gray-50">
                <div className="w-64 p-3 border-r border-gray-200">
                  <div className={`p-2 rounded ${getPriorityBorder(task.priority)}`}>
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {task.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'delayed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.progress}%
                      </span>
                      {task.assignedUser && (
                        <img
                          src={task.assignedUser.avatar}
                          alt={task.assignedUser.name}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 relative h-16 p-2">
                  <div
                    className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded ${getStatusColor(task.status, task.isOverdue)} opacity-80 hover:opacity-100 transition-opacity`}
                    style={{
                      left: `${task.startOffset}%`,
                      width: `${Math.max(task.width, 2)}%`
                    }}
                    title={`${task.title} (${task.progress}%)`}
                  >
                    <div className="h-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium px-1 truncate">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Dependencies lines */}
                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                      {task.dependencies.map((dep) => {
                        const depTask = chartData.find(t => t.id === dep.id)
                        if (!depTask) return null
                        
                        return (
                          <svg
                            key={dep.id}
                            className="absolute inset-0 w-full h-full"
                            style={{ zIndex: 1 }}
                          >
                            <line
                              x1={`${depTask.startOffset + depTask.width}%`}
                              y1="50%"
                              x2={`${task.startOffset}%`}
                              y2="50%"
                              stroke="#6B7280"
                              strokeWidth="2"
                              strokeDasharray="4,4"
                              markerEnd="url(#arrowhead)"
                            />
                            <defs>
                              <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="7"
                                refX="9"
                                refY="3.5"
                                orient="auto"
                              >
                                <polygon
                                  points="0 0, 10 3.5, 0 7"
                                  fill="#6B7280"
                                />
                              </marker>
                            </defs>
                          </svg>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Terminé</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>En cours</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>En attente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>En retard</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 border-l-4 border-red-600 bg-gray-200"></div>
            <span>Priorité haute</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 border-l-4 border-yellow-600 bg-gray-200"></div>
            <span>Priorité moyenne</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 border-l-4 border-green-600 bg-gray-200"></div>
            <span>Priorité basse</span>
          </div>
        </div>
      </div>
    </div>
  )
}