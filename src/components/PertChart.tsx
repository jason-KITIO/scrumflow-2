import React, { useMemo, useRef } from 'react'
import { Task } from '../types'
import { Printer, Download } from 'lucide-react'

interface PertNode {
  id: string
  taskId?: string
  title: string
  duration: number
  earliestStart: number
  earliestFinish: number
  latestStart: number
  latestFinish: number
  slack: number
  x: number
  y: number
  isCritical: boolean
  isStart?: boolean
  isEnd?: boolean
}

interface PertEdge {
  from: string
  to: string
  fromX: number
  fromY: number
  toX: number
  toY: number
}

interface PertChartProps {
  tasks: Task[]
  projectStartDate: string
}

export default function PertChart({ tasks, projectStartDate }: PertChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const { nodes, edges, criticalPath } = useMemo(() => {
    if (tasks.length === 0) {
      return { nodes: [], edges: [], criticalPath: [] }
    }

    // Create nodes for each task plus start and end nodes
    const taskNodes: PertNode[] = tasks.map((task, index) => ({
      id: task.id,
      taskId: task.id,
      title: task.title,
      duration: Math.ceil((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)),
      earliestStart: 0,
      earliestFinish: 0,
      latestStart: 0,
      latestFinish: 0,
      slack: 0,
      x: 0,
      y: 0,
      isCritical: false
    }))

    // Add start and end nodes
    const startNode: PertNode = {
      id: 'start',
      title: 'Début',
      duration: 0,
      earliestStart: 0,
      earliestFinish: 0,
      latestStart: 0,
      latestFinish: 0,
      slack: 0,
      x: 0,
      y: 0,
      isCritical: true,
      isStart: true
    }

    const endNode: PertNode = {
      id: 'end',
      title: 'Fin',
      duration: 0,
      earliestStart: 0,
      earliestFinish: 0,
      latestStart: 0,
      latestFinish: 0,
      slack: 0,
      x: 0,
      y: 0,
      isCritical: true,
      isEnd: true
    }

    const allNodes = [startNode, ...taskNodes, endNode]

    // Calculate dependencies
    const dependencies: { [key: string]: string[] } = {}
    tasks.forEach(task => {
      dependencies[task.id] = task.dependencies?.map(dep => dep.id) || []
    })

    // Find tasks with no dependencies (connect to start)
    const tasksWithNoDeps = tasks.filter(task => !task.dependencies || task.dependencies.length === 0)
    tasksWithNoDeps.forEach(task => {
      if (!dependencies['start']) dependencies['start'] = []
      dependencies['start'].push(task.id)
    })

    // Find tasks with no dependents (connect to end)
    const tasksWithNoDependents = tasks.filter(task => 
      !tasks.some(otherTask => 
        otherTask.dependencies?.some(dep => dep.id === task.id)
      )
    )
    tasksWithNoDependents.forEach(task => {
      if (!dependencies[task.id]) dependencies[task.id] = []
      dependencies[task.id].push('end')
    })

    // Forward pass - calculate earliest start and finish times
    const calculateEarliestTimes = (nodeId: string, visited: Set<string> = new Set()): number => {
      if (visited.has(nodeId)) return 0
      visited.add(nodeId)

      const node = allNodes.find(n => n.id === nodeId)
      if (!node) return 0

      if (nodeId === 'start') {
        node.earliestStart = 0
        node.earliestFinish = 0
        return 0
      }

      // Find all predecessors
      const predecessors = Object.entries(dependencies)
        .filter(([_, deps]) => deps.includes(nodeId))
        .map(([predId, _]) => predId)

      if (predecessors.length === 0) {
        node.earliestStart = 0
      } else {
        node.earliestStart = Math.max(
          ...predecessors.map(predId => {
            const predNode = allNodes.find(n => n.id === predId)
            if (!predNode) return 0
            calculateEarliestTimes(predId, visited)
            return predNode.earliestFinish
          })
        )
      }

      node.earliestFinish = node.earliestStart + node.duration
      return node.earliestFinish
    }

    allNodes.forEach(node => calculateEarliestTimes(node.id))

    // Backward pass - calculate latest start and finish times
    const projectDuration = Math.max(...allNodes.map(n => n.earliestFinish))
    endNode.latestFinish = projectDuration
    endNode.latestStart = projectDuration

    const calculateLatestTimes = (nodeId: string, visited: Set<string> = new Set()): number => {
      if (visited.has(nodeId)) return 0
      visited.add(nodeId)

      const node = allNodes.find(n => n.id === nodeId)
      if (!node) return 0

      if (nodeId === 'end') {
        return node.latestStart
      }

      // Find all successors
      const successors = dependencies[nodeId] || []

      if (successors.length === 0) {
        node.latestFinish = projectDuration
      } else {
        node.latestFinish = Math.min(
          ...successors.map(succId => {
            const succNode = allNodes.find(n => n.id === succId)
            if (!succNode) return projectDuration
            calculateLatestTimes(succId, visited)
            return succNode.latestStart
          })
        )
      }

      node.latestStart = node.latestFinish - node.duration
      return node.latestStart
    }

    allNodes.forEach(node => calculateLatestTimes(node.id))

    // Calculate slack and identify critical path
    allNodes.forEach(node => {
      node.slack = node.latestStart - node.earliestStart
      node.isCritical = node.slack === 0
    })

    // Position nodes for visualization
    const levels: { [key: number]: PertNode[] } = {}
    const getNodeLevel = (nodeId: string, visited: Set<string> = new Set()): number => {
      if (visited.has(nodeId)) return 0
      visited.add(nodeId)

      if (nodeId === 'start') return 0

      const predecessors = Object.entries(dependencies)
        .filter(([_, deps]) => deps.includes(nodeId))
        .map(([predId, _]) => predId)

      if (predecessors.length === 0) return 0

      return Math.max(...predecessors.map(predId => getNodeLevel(predId, visited))) + 1
    }

    allNodes.forEach(node => {
      const level = getNodeLevel(node.id)
      if (!levels[level]) levels[level] = []
      levels[level].push(node)
    })

    // Position nodes
    const nodeWidth = 120
    const nodeHeight = 80
    const levelSpacing = 200
    const nodeSpacing = 100

    Object.entries(levels).forEach(([levelStr, levelNodes]) => {
      const level = parseInt(levelStr)
      levelNodes.forEach((node, index) => {
        node.x = level * levelSpacing + 60
        node.y = index * (nodeHeight + nodeSpacing) + 60
      })
    })

    // Create edges
    const pertEdges: PertEdge[] = []
    Object.entries(dependencies).forEach(([fromId, toIds]) => {
      const fromNode = allNodes.find(n => n.id === fromId)
      if (!fromNode) return

      toIds.forEach(toId => {
        const toNode = allNodes.find(n => n.id === toId)
        if (!toNode) return

        pertEdges.push({
          from: fromId,
          to: toId,
          fromX: fromNode.x + nodeWidth,
          fromY: fromNode.y + nodeHeight / 2,
          toX: toNode.x,
          toY: toNode.y + nodeHeight / 2
        })
      })
    })

    const criticalPathNodes = allNodes.filter(node => node.isCritical).map(node => node.id)

    return { 
      nodes: allNodes, 
      edges: pertEdges, 
      criticalPath: criticalPathNodes 
    }
  }, [tasks])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow && svgRef.current) {
      const svgContent = svgRef.current.outerHTML
      printWindow.document.write(`
        <html>
          <head>
            <title>Diagramme PERT - Scrum Flow</title>
            <style>
              body { margin: 0; padding: 20px; }
              svg { max-width: 100%; height: auto; }
              @media print {
                body { margin: 0; }
                svg { width: 100%; height: auto; }
              }
            </style>
          </head>
          <body>
            <h1>Diagramme PERT</h1>
            ${svgContent}
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
      downloadLink.download = 'diagramme-pert.svg'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(svgUrl)
    }
  }

  const svgWidth = Math.max(800, ...nodes.map(n => n.x + 140))
  const svgHeight = Math.max(600, ...nodes.map(n => n.y + 100))

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Diagramme PERT</h3>
          <p className="text-sm text-gray-600">Réseau de tâches avec chemin critique</p>
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
      
      <div className="p-4 overflow-auto">
        {nodes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Aucune tâche disponible pour générer le diagramme PERT</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="border border-gray-200 rounded"
          >
            {/* Edges */}
            {edges.map((edge, index) => {
              const isCritical = criticalPath.includes(edge.from) && criticalPath.includes(edge.to)
              return (
                <g key={index}>
                  <line
                    x1={edge.fromX}
                    y1={edge.fromY}
                    x2={edge.toX}
                    y2={edge.toY}
                    stroke={isCritical ? "#dc2626" : "#6b7280"}
                    strokeWidth={isCritical ? "3" : "2"}
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              )
            })}

            {/* Arrow marker */}
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
                  fill="#6b7280"
                />
              </marker>
            </defs>

            {/* Nodes */}
            {nodes.map((node) => (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width="120"
                  height="80"
                  fill={node.isCritical ? "#fef2f2" : "#f9fafb"}
                  stroke={node.isCritical ? "#dc2626" : "#d1d5db"}
                  strokeWidth={node.isCritical ? "3" : "2"}
                  rx="8"
                />
                
                {/* Node content */}
                <text
                  x={node.x + 60}
                  y={node.y + 15}
                  textAnchor="middle"
                  className="text-xs font-semibold"
                  fill={node.isCritical ? "#dc2626" : "#374151"}
                >
                  {node.title.length > 12 ? `${node.title.substring(0, 12)}...` : node.title}
                </text>
                
                {/* Duration */}
                <text
                  x={node.x + 60}
                  y={node.y + 30}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#6b7280"
                >
                  Durée: {node.duration}j
                </text>
                
                {/* Times */}
                <text
                  x={node.x + 30}
                  y={node.y + 50}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#374151"
                >
                  ES: {node.earliestStart}
                </text>
                
                <text
                  x={node.x + 90}
                  y={node.y + 50}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#374151"
                >
                  EF: {node.earliestFinish}
                </text>
                
                <text
                  x={node.x + 30}
                  y={node.y + 65}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#374151"
                >
                  LS: {node.latestStart}
                </text>
                
                <text
                  x={node.x + 90}
                  y={node.y + 65}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#374151"
                >
                  LF: {node.latestFinish}
                </text>
                
                {/* Slack */}
                {node.slack > 0 && (
                  <text
                    x={node.x + 60}
                    y={node.y + 78}
                    textAnchor="middle"
                    className="text-xs font-medium"
                    fill="#059669"
                  >
                    Marge: {node.slack}j
                  </text>
                )}
              </g>
            ))}
          </svg>
        )}
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-50 border-2 border-red-600 rounded"></div>
            <span>Chemin critique</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 border-2 border-gray-300 rounded"></div>
            <span>Tâche normale</span>
          </div>
          <div className="text-xs text-gray-600">
            ES: Début au plus tôt | EF: Fin au plus tôt | LS: Début au plus tard | LF: Fin au plus tard
          </div>
        </div>
      </div>
    </div>
  )
}