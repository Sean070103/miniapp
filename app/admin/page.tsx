import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Upload, Database, Users, FileText, Settings } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="container-mobile py-responsive-lg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-responsive-lg">
          <h1 className="text-responsive-2xl sm:text-responsive-3xl lg:text-responsive-4xl font-bold space-responsive-sm">
            Admin Dashboard
          </h1>
          <p className="text-responsive-base text-muted-foreground">
            Manage your miniapp database and bulk operations
          </p>
        </div>

        <div className="grid-responsive-1 sm:grid-responsive-2 lg:grid-responsive-3 gap-responsive-md space-responsive-lg">
          {/* CSV Upload Card */}
          <Card className="hover:shadow-lg transition-shadow card-mobile">
            <CardHeader className="space-responsive-sm">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <Upload className="h-5 w-5" />
                CSV Upload
              </CardTitle>
              <CardDescription className="text-responsive-sm">
                Bulk import users, journals, and comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/csv-upload">
                <Button className="w-full touch-friendly">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-responsive-sm">Go to Upload</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Database Test Card */}
          <Card className="hover:shadow-lg transition-shadow card-mobile">
            <CardHeader className="space-responsive-sm">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <Database className="h-5 w-5" />
                Database Status
              </CardTitle>
              <CardDescription className="text-responsive-sm">
                Test database connection and view stats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/api/test-db">
                <Button variant="outline" className="w-full touch-friendly">
                  <Database className="h-4 w-4 mr-2" />
                  <span className="text-responsive-sm">Test Connection</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* API Endpoints Card */}
          <Card className="hover:shadow-lg transition-shadow card-mobile">
            <CardHeader className="space-responsive-sm">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <Settings className="h-5 w-5" />
                API Endpoints
              </CardTitle>
              <CardDescription className="text-responsive-sm">
                View and test API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-responsive-sm">
              <div className="text-responsive-sm space-responsive-xs">
                <p><strong>Users:</strong> /api/baseuser/post</p>
                <p><strong>Journals:</strong> /api/journal/post</p>
                <p><strong>Comments:</strong> /api/comment/post</p>
                <p><strong>CSV Upload:</strong> /api/upload/csv</p>
              </div>
            </CardContent>
          </Card>

          {/* Sample Data Card */}
          <Card className="hover:shadow-lg transition-shadow card-mobile">
            <CardHeader className="space-responsive-sm">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <Users className="h-5 w-5" />
                Sample Data
              </CardTitle>
              <CardDescription className="text-responsive-sm">
                Download sample CSV files for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-responsive-sm">
              <Link href="/sample-users.csv">
                <Button variant="outline" size="sm" className="w-full touch-friendly">
                  <span className="text-responsive-xs">Download Users CSV</span>
                </Button>
              </Link>
              <Link href="/sample-journals.csv">
                <Button variant="outline" size="sm" className="w-full touch-friendly">
                  <span className="text-responsive-xs">Download Journals CSV</span>
                </Button>
              </Link>
              <Link href="/sample-comments.csv">
                <Button variant="outline" size="sm" className="w-full touch-friendly">
                  <span className="text-responsive-xs">Download Comments CSV</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Database Schema Card */}
          <Card className="hover:shadow-lg transition-shadow card-mobile">
            <CardHeader className="space-responsive-sm">
              <CardTitle className="flex items-center gap-2 text-responsive-lg">
                <FileText className="h-5 w-5" />
                Database Schema
              </CardTitle>
              <CardDescription className="text-responsive-sm">
                View your database structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-responsive-sm space-responsive-xs">
                <p><strong>BaseUsers:</strong> id, baseUserId, bio, profile, dateCreated</p>
                <p><strong>Journal:</strong> id, baseUserId, photo, journal, likes, tags, privacy, dateCreated</p>
                <p><strong>Comment:</strong> id, baseUserId, journalId, comment, dateCreated</p>
                <p><strong>Repost:</strong> id, journalId, baseUserId, dateCreated</p>
                <p><strong>Chaincomments:</strong> id, commentId, baseUserId, comment, dateCreated</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="hover:shadow-lg transition-shadow card-mobile">
            <CardHeader className="space-responsive-sm">
              <CardTitle className="text-responsive-lg">Quick Actions</CardTitle>
              <CardDescription className="text-responsive-sm">
                Common database operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-responsive-sm">
              <Button variant="outline" size="sm" className="w-full touch-friendly">
                <span className="text-responsive-xs">View All Users</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full touch-friendly">
                <span className="text-responsive-xs">View All Journals</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full touch-friendly">
                <span className="text-responsive-xs">View All Comments</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center space-responsive-sm">
          <p className="text-responsive-sm text-muted-foreground">
            Your database is connected to MongoDB Atlas with Prisma ORM
          </p>
        </div>
      </div>
    </div>
  )
}
