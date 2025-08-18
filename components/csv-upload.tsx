'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Upload, FileText, Users, MessageSquare, BookOpen } from 'lucide-react'

interface CSVUploadProps {
  onUploadSuccess?: (data: any) => void
  onUploadError?: (error: string) => void
}

export default function CSVUpload({ onUploadSuccess, onUploadError }: CSVUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'info' | null
    message: string
  }>({ type: null, message: '' })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file)
        setUploadStatus({ type: 'info', message: `Selected file: ${file.name}` })
      } else {
        setUploadStatus({ type: 'error', message: 'Please select a CSV file' })
        setSelectedFile(null)
      }
    }
  }

  const handleUploadFile = async () => {
    if (!selectedFile) {
      setUploadStatus({ type: 'error', message: 'Please select a file' })
      return
    }

    setIsUploading(true)
    setUploadStatus({ type: 'info', message: 'Uploading...' })

    try {
      const formData = new FormData()
      formData.append('csvFile', selectedFile)

      const response = await fetch('/api/upload/csv', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadStatus({ 
          type: 'success', 
          message: result.message || 'Upload successful!' 
        })
        onUploadSuccess?.(result)
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: result.error || 'Upload failed' 
        })
        onUploadError?.(result.error)
      }
    } catch (error) {
      console.error('Error uploading CSV:', error)
      setUploadStatus({ 
        type: 'error', 
        message: 'Upload failed - Network error' 
      })
      onUploadError?.('Network error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  const getUploadTypeIcon = () => {
    if (!selectedFile) return <FileText className="h-6 w-6" />
    
    // You could add logic here to determine file type based on content
    return <FileText className="h-6 w-6" />
  }

  return (
    <Card className="w-full max-w-md mx-auto card-mobile">
      <CardHeader className="space-responsive-sm">
        <CardTitle className="flex items-center gap-2 text-responsive-lg">
          <Upload className="h-5 w-5" />
          CSV Upload
        </CardTitle>
        <CardDescription className="text-responsive-sm">
          Upload CSV files to bulk import users, journals, or comments
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-responsive-md">
        {/* File Selection */}
        <div className="space-responsive-sm">
          <Label htmlFor="csv-file" className="text-responsive-base">Select CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isUploading}
            className="form-mobile-input"
          />
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="flex items-center gap-2 p-responsive-sm bg-muted rounded-responsive-lg">
            {getUploadTypeIcon()}
            <div className="flex-1 space-responsive-xs">
              <p className="font-medium text-responsive-sm">{selectedFile.name}</p>
              <p className="text-responsive-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUploadFile}
          disabled={!selectedFile || isUploading}
          className="w-full touch-friendly form-mobile-button"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              <span className="text-responsive-sm">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              <span className="text-responsive-sm">Upload CSV</span>
            </>
          )}
        </Button>

        {/* Status Messages */}
        {uploadStatus.type && (
          <Alert className={`${uploadStatus.type === 'error' ? 'border-red-200 bg-red-50' : 
                          uploadStatus.type === 'success' ? 'border-green-200 bg-green-50' : 
                          'border-blue-200 bg-blue-50'} rounded-responsive-md`}>
            <AlertDescription className={`${uploadStatus.type === 'error' ? 'text-red-800' : 
                                       uploadStatus.type === 'success' ? 'text-green-800' : 
                                       'text-blue-800'} text-responsive-sm`}>
              {uploadStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {/* CSV Format Examples */}
        <div className="mt-6 space-responsive-sm">
          <h4 className="font-medium text-responsive-sm">Supported CSV Formats:</h4>
          
          <div className="space-responsive-sm">
            <div className="flex items-center gap-2 text-responsive-xs">
              <Users className="h-3 w-3" />
              <span>Users: walletAddress, username, email, profilePicture, bio</span>
            </div>
            <div className="flex items-center gap-2 text-responsive-xs">
              <BookOpen className="h-3 w-3" />
              <span>Journals: baseUserId, journal, privacy, photo, likes, tags</span>
            </div>
            <div className="flex items-center gap-2 text-responsive-xs">
              <MessageSquare className="h-3 w-3" />
              <span>Comments: baseUserId, journalId, comment</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
