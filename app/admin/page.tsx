import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Upload, Database, Users, FileText, Settings } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your miniapp database and bulk operations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CSV Upload Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                CSV Upload
              </CardTitle>
              <CardDescription>
                Bulk import users, journals, and comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/csv-upload">
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Go to Upload
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Database Test Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Status
              </CardTitle>
              <CardDescription>
                Test database connection and view stats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/api/test-db">
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* API Endpoints Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                API Endpoints
              </CardTitle>
              <CardDescription>
                View and test API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <p><strong>Users:</strong> /api/baseuser/post</p>
                <p><strong>Journals:</strong> /api/journal/post</p>
                <p><strong>Comments:</strong> /api/comment/post</p>
                <p><strong>CSV Upload:</strong> /api/upload/csv</p>
              </div>
            </CardContent>
          </Card>

          {/* Sample Data Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sample Data
              </CardTitle>
              <CardDescription>
                Download sample CSV files for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/sample-users.csv">
                <Button variant="outline" size="sm" className="w-full">
                  Download Users CSV
                </Button>
              </Link>
              <Link href="/sample-journals.csv">
                <Button variant="outline" size="sm" className="w-full">
                  Download Journals CSV
                </Button>
              </Link>
              <Link href="/sample-comments.csv">
                <Button variant="outline" size="sm" className="w-full">
                  Download Comments CSV
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Database Schema Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Database Schema
              </CardTitle>
              <CardDescription>
                View your database structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p><strong>BaseUsers:</strong> id, baseUserId, bio, profile, dateCreated</p>
                <p><strong>Journal:</strong> id, baseUserId, photo, journal, likes, tags, privacy, dateCreated</p>
                <p><strong>Comment:</strong> id, baseUserId, journalId, comment, dateCreated</p>
                <p><strong>Repost:</strong> id, journalId, baseUserId, dateCreated</p>
                <p><strong>Chaincomments:</strong> id, commentId, baseUserId, comment, dateCreated</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common database operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                View All Users
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                View All Journals
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                View All Comments
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Your database is connected to MongoDB Atlas with Prisma ORM
          </p>
        </div>
      </div>
    </div>
  )
}
