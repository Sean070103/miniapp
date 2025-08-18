'use client'

import CSVUpload from '../../components/csv-upload'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Download, FileText, Database } from 'lucide-react'

export default function CSVUploadPage() {
  const handleDownloadSample = (filename: string) => {
    const link = document.createElement('a')
    link.href = `/${filename}`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container-mobile py-responsive-lg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-responsive-lg">
          <h1 className="text-responsive-2xl sm:text-responsive-3xl lg:text-responsive-4xl font-bold space-responsive-sm">
            CSV Upload System
          </h1>
          <p className="text-responsive-base text-muted-foreground">
            Bulk import users, journals, and comments to your database using CSV files
          </p>
        </div>

        <div className="grid-responsive-1 lg:grid-responsive-2 gap-responsive-lg space-responsive-lg">
          {/* CSV Upload Component */}
          <div>
            <CSVUpload 
              onUploadSuccess={(data) => {
                console.log('Upload successful:', data)
                alert(`Successfully uploaded ${data.data.length} records!`)
              }}
              onUploadError={(error) => {
                console.error('Upload failed:', error)
                alert(`Upload failed: ${error}`)
              }}
            />
          </div>

          {/* Sample Files and Instructions */}
          <div className="space-responsive-md">
            <Card className="card-mobile">
              <CardHeader className="space-responsive-sm">
                <CardTitle className="flex items-center gap-2 text-responsive-lg">
                  <FileText className="h-5 w-5" />
                  Sample CSV Files
                </CardTitle>
                <CardDescription className="text-responsive-sm">
                  Download these sample files to test the upload functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-responsive-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-responsive-sm border rounded-responsive-lg space-responsive-sm">
                  <div className="space-responsive-xs">
                    <h4 className="font-medium text-responsive-base">Users CSV</h4>
                    <p className="text-responsive-xs text-muted-foreground">Sample user data with walletAddress, username, and bio</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleDownloadSample('sample-users.csv')}
                    className="flex items-center gap-2 touch-friendly w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-responsive-sm border rounded-responsive-lg space-responsive-sm">
                  <div className="space-responsive-xs">
                    <h4 className="font-medium text-responsive-base">Journals CSV</h4>
                    <p className="text-responsive-xs text-muted-foreground">Sample journal entries with content, privacy, and tags</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleDownloadSample('sample-journals.csv')}
                    className="flex items-center gap-2 touch-friendly w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-responsive-sm border rounded-responsive-lg space-responsive-sm">
                  <div className="space-responsive-xs">
                    <h4 className="font-medium text-responsive-base">Comments CSV</h4>
                    <p className="text-responsive-xs text-muted-foreground">Sample comments with baseUserId, journalId, and comment text</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleDownloadSample('sample-comments.csv')}
                    className="flex items-center gap-2 touch-friendly w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-mobile">
              <CardHeader className="space-responsive-sm">
                <CardTitle className="flex items-center gap-2 text-responsive-lg">
                  <Database className="h-5 w-5" />
                  CSV Format Requirements
                </CardTitle>
                <CardDescription className="text-responsive-sm">
                  Follow these formats for successful uploads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-responsive-md">
                <div className="space-responsive-sm">
                  <h4 className="font-medium text-responsive-sm space-responsive-xs">Users Format:</h4>
                  <code className="text-responsive-xs bg-muted p-responsive-sm rounded-responsive-sm block overflow-x-auto">
                    walletAddress,username,email,profilePicture,bio
                  </code>
                </div>
                
                <div className="space-responsive-sm">
                  <h4 className="font-medium text-responsive-sm space-responsive-xs">Journals Format:</h4>
                  <code className="text-responsive-xs bg-muted p-responsive-sm rounded-responsive-sm block overflow-x-auto">
                    baseUserId,journal,privacy,photo,likes,tags
                  </code>
                </div>
                
                <div className="space-responsive-sm">
                  <h4 className="font-medium text-responsive-sm space-responsive-xs">Comments Format:</h4>
                  <code className="text-responsive-xs bg-muted p-responsive-sm rounded-responsive-sm block overflow-x-auto">
                    baseUserId,journalId,comment
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card className="card-mobile">
              <CardHeader className="space-responsive-sm">
                <CardTitle className="text-responsive-lg">How to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-responsive-sm text-responsive-sm">
                <div className="space-responsive-xs">
                  <p>1. Download a sample CSV file or create your own</p>
                  <p>2. Ensure your CSV has the correct headers</p>
                  <p>3. Fill in your data following the format</p>
                  <p>4. Upload the CSV file using the form</p>
                  <p>5. Check the results and database records</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
