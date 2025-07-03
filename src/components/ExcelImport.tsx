import React, { useState } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Download } from 'lucide-react'

interface ExcelTask {
  nom: string
  description: string
  priorite: 'low' | 'medium' | 'high'
  temps: number
  anteriorites: string
}

interface ExcelImportProps {
  projectId: string
  onImport: (tasks: ExcelTask[]) => void
  onClose: () => void
}

export default function ExcelImport({ projectId, onImport, onClose }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<ExcelTask[]>([])

  const downloadTemplate = () => {
    const csvContent = `nom,description,priorite,temps,anteriorites
Analyse des besoins,Analyser et documenter les besoins du projet,high,3,
Conception architecture,Concevoir l'architecture technique du système,high,5,1
Développement module A,Développer le premier module de l'application,medium,8,2
Développement module B,Développer le second module de l'application,medium,6,2
Tests unitaires,Effectuer les tests unitaires des modules,medium,4,3 4
Tests d'intégration,Effectuer les tests d'intégration du système,high,3,5
Déploiement,Déployer l'application en production,high,2,6`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'modele-taches-scrum-flow.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          selectedFile.type !== 'application/vnd.ms-excel' &&
          !selectedFile.name.endsWith('.csv')) {
        setError('Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV')
        return
      }
      setFile(selectedFile)
      setError('')
      parseFile(selectedFile)
    }
  }

  const parseFile = async (file: File) => {
    setLoading(true)
    setError('')

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('Le fichier doit contenir au moins une ligne d\'en-tête et une ligne de données')
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredColumns = ['nom', 'description', 'priorite', 'temps', 'anteriorites']
      
      const missingColumns = requiredColumns.filter(col => !headers.includes(col))
      if (missingColumns.length > 0) {
        throw new Error(`Colonnes manquantes: ${missingColumns.join(', ')}. Colonnes requises: ${requiredColumns.join(', ')}`)
      }

      const tasks: ExcelTask[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        
        if (values.length < headers.length) {
          console.warn(`Ligne ${i + 1} ignorée: nombre de colonnes insuffisant`)
          continue
        }

        const task: any = {}
        headers.forEach((header, index) => {
          task[header] = values[index]
        })

        // Validation des données
        if (!task.nom || !task.description) {
          throw new Error(`Ligne ${i + 1}: nom et description sont obligatoires`)
        }

        if (!['low', 'medium', 'high'].includes(task.priorite)) {
          throw new Error(`Ligne ${i + 1}: priorité doit être 'low', 'medium' ou 'high'`)
        }

        const temps = parseInt(task.temps)
        if (isNaN(temps) || temps <= 0) {
          throw new Error(`Ligne ${i + 1}: temps doit être un nombre positif`)
        }

        tasks.push({
          nom: task.nom,
          description: task.description,
          priorite: task.priorite as 'low' | 'medium' | 'high',
          temps: temps,
          anteriorites: task.anteriorites || ''
        })
      }

      setPreview(tasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la lecture du fichier')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview)
      onClose()
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Importer des tâches depuis Excel</h2>
            <p className="text-sm text-gray-600 mt-1">
              Importez vos tâches depuis un fichier Excel ou CSV
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Template Download */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-900 mb-1">Fichier modèle</h3>
                <p className="text-sm text-green-800">
                  Téléchargez le fichier modèle avec les en-têtes et exemples de données
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger le modèle</span>
              </button>
            </div>
          </div>

          {/* Format Requirements */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Format requis</h3>
            <p className="text-sm text-blue-800 mb-3">
              Votre fichier doit contenir les colonnes suivantes (en en-tête) :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-900">nom</div>
                <div className="text-blue-700">Nom de la tâche (obligatoire)</div>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-900">description</div>
                <div className="text-blue-700">Description détaillée (obligatoire)</div>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-900">priorite</div>
                <div className="text-blue-700">low, medium ou high</div>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-900">temps</div>
                <div className="text-blue-700">Durée en jours (nombre entier)</div>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200 md:col-span-2">
                <div className="font-semibold text-blue-900">anteriorites</div>
                <div className="text-blue-700">Numéros des tâches antérieures séparés par des espaces (ex: "1 3 5")</div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un fichier
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600 mb-2">
                  Cliquez pour sélectionner un fichier Excel ou CSV
                </p>
                <p className="text-sm text-gray-500">
                  Formats supportés: .xlsx, .xls, .csv (max 10MB)
                </p>
              </label>
            </div>
            {file && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Fichier sélectionné:</span> {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  Taille: {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900">Erreur de validation</h4>
                  <p className="text-sm text-red-800 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mb-6 flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Analyse du fichier en cours...</span>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-gray-900">
                  Aperçu des tâches ({preview.length} tâche{preview.length > 1 ? 's' : ''} trouvée{preview.length > 1 ? 's' : ''})
                </h3>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priorité
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durée
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Antériorités
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.map((task, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {task.nom}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="max-w-xs truncate" title={task.description}>
                              {task.description}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priorite)}`}>
                              {getPriorityLabel(task.priorite)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {task.temps} jour{task.temps > 1 ? 's' : ''}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {task.anteriorites || (
                              <span className="text-gray-400 italic">Aucune</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            disabled={preview.length === 0 || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>
              Importer {preview.length > 0 ? `${preview.length} tâche${preview.length > 1 ? 's' : ''}` : 'les tâches'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}