"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { TVPostContainer, PostHeader, PostContent, PostTags, PostActions } from "@/components/ui/tv-post-container"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Journal {
	id: string
	baseUserId: string
	journal: string
	photos: string[]
	tags: string[]
	dateCreated: string
}

export default function PostPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()
	const [post, setPost] = useState<Journal | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch(`/api/journal/getby/journal/${params.id}`)
				if (res.ok) {
					const data = await res.json()
					setPost(data)
				}
			} finally {
				setLoading(false)
			}
		}
		if (params?.id) load()
	}, [params?.id])

	return (
		<div className="min-h-screen w-full bg-grid-slate-800/20 py-8">
			<div className="max-w-3xl mx-auto px-4">
				<Card className="bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border border-purple-500/30 text-green-100 backdrop-blur-xl gaming-glow">
					<CardContent className="p-4 sm:p-6">
						<Button variant="outline" className="mb-4 text-green-200 hover:bg-green-900/30 border-green-500/40" onClick={() => router.back()}>
							← Back
						</Button>

						{loading && (
							<div className="space-y-3">
								<Skeleton className="h-6 w-40 bg-slate-700" />
								<Skeleton className="h-48 w-full bg-slate-700" />
							</div>
						)}

						{!loading && post && (
							<TVPostContainer>
								<PostHeader
									user={{ name: `User_${post.baseUserId.slice(0, 6)}`, address: post.baseUserId, avatar: "/placeholder-user.jpg" }}
									date={new Date(post.dateCreated)}
								/>
								<PostContent content={post.journal} photos={post.photos} />
								<PostTags tags={post.tags || []} />
								<PostActions
									likes={0}
									comments={0}
									reposts={0}
									onLike={() => {}}
									onComment={() => {}}
									onRepost={() => {}}
								/>
							</TVPostContainer>
						)}

						{!loading && !post && (
							<div className="text-green-200">Post not found.</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
