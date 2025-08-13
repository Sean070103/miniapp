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
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">CSV Upload System</h1>
          <p className="text-muted-foreground">
            Bulk import users, journals, and comments to your database using CSV files
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sample CSV Files
                </CardTitle>
                <CardDescription>
                  Download these sample files to test the upload functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Users CSV</h4>
                    <p className="text-sm text-muted-foreground">Sample user data with walletAddress, username, and bio</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleDownloadSample('sample-users.csv')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Journals CSV</h4>
                    <p className="text-sm text-muted-foreground">Sample journal entries with content, privacy, and tags</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleDownloadSample('sample-journals.csv')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Comments CSV</h4>
                    <p className="text-sm text-muted-foreground">Sample comments with baseUserId, journalId, and comment text</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleDownloadSample('sample-comments.csv')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  CSV Format Requirements
                </CardTitle>
                <CardDescription>
                  Follow these formats for successful uploads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Users Format:</h4>
                  <code className="text-xs bg-muted p-2 rounded block">
                    walletAddress,username,email,profilePicture,bio
                  </code>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Journals Format:</h4>
                  <code className="text-xs bg-muted p-2 rounded block">
                    baseUserId,journal,privacy,photo,likes,tags
                  </code>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Comments Format:</h4>
                  <code className="text-xs bg-muted p-2 rounded block">
                    baseUserId,journalId,comment
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. Download a sample CSV file or create your own</p>
                <p>2. Ensure your CSV has the correct headers</p>
                <p>3. Fill in your data following the format</p>
                <p>4. Upload the CSV file using the form</p>
                <p>5. Check the results and database records</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
