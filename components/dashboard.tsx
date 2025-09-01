"use client"

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Wallet, User, Shield, Copy, Check, Calendar, Flame, BookOpen, Plus, MessageSquare, Heart, Share2, Menu, Home, Calculator, BarChart3, Settings, Target, X, LogOut, Bell, RotateCcw, Eye, Trophy, Search } from 'lucide-react'
import { DailyEntry } from "@/components/dashboard/daily-entry"
import { useAuth } from "@/contexts/auth-context"
import { ContributionGrid } from "@/components/dashboard/contribution-grid"
import { StreakTracker } from "@/components/dashboard/streak-tracker"
import { useToast } from "@/components/ui/use-toast"
import { Search as SearchComponent, SearchFilters } from "@/components/ui/search"
import { ImageUpload, useImageUpload } from "@/components/ui/image-upload"
import { UserProfile } from "@/components/ui/user-profile"
import { AchievementBadge, ACHIEVEMENTS } from "@/components/ui/achievement-badge"
import { ResponsiveSidebar, ResponsiveHeader, ResponsiveContainer, ResponsiveGrid, ResponsiveCard, ResponsiveText, useResponsive } from "@/components/ui/responsive-layout"
import { LayoutEnhancer, EnhancedSection, EnhancedGrid } from "@/components/ui/layout-enhancer"
import { UserRegistrationModal } from "@/components/auth/user-registration-modal"
import { ProfileManagement } from "@/components/auth/profile-management"
import { UserSearch } from "@/components/ui/user-search"
import { TVContainer, TVImage, TVImageGrid } from "@/components/ui/tv-container"
import { TVPostContainer, PostHeader, PostContent, PostTags, PostActions } from "@/components/ui/tv-post-container"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SimpleNotificationDropdown } from "@/components/ui/simple-notification-dropdown"
import { useSimpleNotifications } from "@/hooks/use-simple-notifications"
import { getNotificationColor, getNotificationIcon, formatTimeAgo } from "@/lib/simple-notifications"


interface DailyEntry {
  id: string
  date: string
  content: string
  tags: string[]
  photos?: string[]
  timestamp: number
}

interface DashboardProps {
  address: string
}

interface Journal {
  id: string;
  baseUserId: string;
  photos: string[];
  journal: string;
  likes: number;
  tags: string[];
  privacy: string;
  dateCreated: Date;
  archived?: boolean;
  archivedAt?: Date;
}

type SidebarItem = 'home' | 'calendar' | 'calculator' | 'stats' | 'streak' | 'notifications' | 'profile' | 'settings'

export default function Dashboard({ address }: DashboardProps) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState<SidebarItem>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [dbEntries, setDbEntries] = useState<Journal[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Toast notifications
  const { toasts, toast, dismiss } = useToast();

  // Comment and repost states
  const [dbComments, setDbComments] = useState<any[]>([]);
  const [currentJournalId, setCurrentJournalId] = useState<string | null>(null);
  const [userReposts, setUserReposts] = useState<any[]>([]);
  const [commentCounts, setCommentCounts] = useState<{[key: string]: number}>({});
  
  // Like states
  const [userLikes, setUserLikes] = useState<{[key: string]: boolean}>({});
  const [likeCounts, setLikeCounts] = useState<{[key: string]: number}>({});
  const [repostCounts, setRepostCounts] = useState<{[key: string]: number}>({});
  
  // Loading states for interactions
  const [loadingLikes, setLoadingLikes] = useState<{[key: string]: boolean}>({});
  const [loadingComments, setLoadingComments] = useState<{[key: string]: boolean}>({});
  const [loadingReposts, setLoadingReposts] = useState<{[key: string]: boolean}>({});
  
  // Create post states
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [newPostPrivacy, setNewPostPrivacy] = useState<'public' | 'private'>('public');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // Image upload
  const { images, handleImagesSelected, uploadImages, clearImages } = useImageUpload();
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  
  // Search states
  const [searchFilter, setSearchFilter] = useState<'all' | 'posts' | 'users' | 'tags'>('all');
  
  // Achievement states
  const [userAchievements, setUserAchievements] = useState(ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    progress: 0,
    unlocked: false
  })));
  
  // User stats - will be updated after allPosts is initialized
  const [userStats, setUserStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    totalLikes: 0,
    totalComments: 0,
    totalReposts: 0,
    streak: 0,
    level: 1,
    experience: 0
  });
  
  // Server-provided streak stats
  const [streakStats, setStreakStats] = useState<{ currentStreak: number; longestStreak: number; totalPosts: number }>({
    currentStreak: 0,
    longestStreak: 0,
    totalPosts: 0
  });
  
  // User authentication and profile states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  

  
  // User switching functionality
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [customBaseUserId, setCustomBaseUserId] = useState<string>('');
  
  // Reply functionality
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyToComment, setReplyToComment] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  // Inline edit state for comments
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [commentLiked, setCommentLiked] = useState<{[key:string]: boolean}>({});
  const [commentLikeCounts, setCommentLikeCounts] = useState<{[key:string]: number}>({});
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replyCounts, setReplyCounts] = useState<{[key:string]: number}>({});
  
  // Home feed states
  const [allPosts, setAllPosts] = useState<Journal[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Journal | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [feedFilter, setFeedFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [recentlyDeletedPost, setRecentlyDeletedPost] = useState<Journal | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  // Undo delete function
  const undoDelete = () => {
    if (recentlyDeletedPost) {
      setAllPosts(prev => [recentlyDeletedPost, ...prev]);
      setRecentlyDeletedPost(null);
      if (deleteTimerRef.current) {
        window.clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
    }
  };



  // TV styles order for image posts, typed as a readonly tuple to preserve literal types
  const tvStylesOrder = ['retro', 'modern', 'futuristic', 'vintage', 'minimal'] as const;

  // Gaming theme background
  const renderThemeBackground = () => {
    return (
      <div className="absolute inset-0">
        {/* Dark gaming background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-teal-900 to-slate-800" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,0,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,0,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Prominent horizontal dividing lines */}
        <div className="absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60" />
        <div className="absolute top-2/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60" />
        
        {/* Corner grid lines */}
        <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-green-400 to-transparent" />
        <div className="absolute top-0 left-0 w-1 h-32 bg-gradient-to-b from-green-400 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-green-400 to-transparent" />
        <div className="absolute top-0 right-0 w-1 h-32 bg-gradient-to-b from-green-400 to-transparent" />
        <div className="absolute bottom-0 left-0 w-32 h-1 bg-gradient-to-r from-green-400 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1 h-32 bg-gradient-to-t from-green-400 to-transparent" />
        <div className="absolute bottom-0 right-0 w-32 h-1 bg-gradient-to-l from-green-400 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1 h-32 bg-gradient-to-t from-green-400 to-transparent" />
        
        {/* Subtle scanlines effect */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)'
          }}
        />
      </div>
    );
  };

  // Calendar states
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculator states
  const [activeCalculatorTab, setActiveCalculatorTab] = useState("gas");
  const [gasPrice, setGasPrice] = useState("20");
  const [gasLimit, setGasLimit] = useState("21000");
  const [ethPrice, setEthPrice] = useState("2000");
  const [currencySwap, setCurrencySwap] = useState({
    fromAmount: "1",
    fromCurrency: "USD",
    toCurrency: "PHP",
    exchangeRate: 56.5,
  });
  const [liveExchangeRates, setLiveExchangeRates] = useState<{[key: string]: number}>({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [expenseEntries, setExpenseEntries] = useState<{
    id: string;
    date: string;
    category: string;
    description: string;
    amount: string;
    gasFee?: string;
    transactionHash?: string;
    notes?: string;
  }[]>([]);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Gas Fees",
    description: "",
    amount: "",
    gasFee: "",
    transactionHash: "",
    notes: "",
  });

  const expenseCategories = [
    "Gas Fees", "Trading", "NFTs", "DeFi", "Staking", "Bridging", 
    "Liquidity", "Gaming", "Education", "Food", "Fare", "Other"
  ];

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "KRW", name: "South Korean Won", symbol: "₩" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
    { code: "THB", name: "Thai Baht", symbol: "฿" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
    { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  ];

  const fallbackExchangeRates: { [key: string]: number } = {
    USD_PHP: 56.5, USD_EUR: 0.92, USD_GBP: 0.79, USD_JPY: 150.25,
    USD_CAD: 1.35, USD_AUD: 1.52, USD_CHF: 0.88, USD_CNY: 7.23,
    USD_INR: 83.15, USD_KRW: 1330.5, USD_SGD: 1.34, USD_THB: 35.8,
    USD_MYR: 4.75, USD_IDR: 15750.0, USD_VND: 24500.0,
    PHP_USD: 0.0177, PHP_EUR: 0.0163, PHP_GBP: 0.014, PHP_JPY: 2.66,
    PHP_CAD: 0.0239, PHP_AUD: 0.0269, PHP_CHF: 0.0156, PHP_CNY: 0.128,
    PHP_INR: 1.47, PHP_KRW: 23.55, PHP_SGD: 0.0237, PHP_THB: 0.634,
    PHP_MYR: 0.0841, PHP_IDR: 278.76, PHP_VND: 433.63,
  };

  // Get baseuser ID from user account
  const baseUserId = user?.account?.id;

  // Simple notification system
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    addNotification
  } = useSimpleNotifications(baseUserId || address);

  const [commentCursors, setCommentCursors] = useState<{ [key: string]: string | null }>({});

  const openPostModal = async (journalId: string) => {
    let post = allPosts.find(p => p.id === journalId) || dbEntries.find(p => p.id === journalId) || null;
    if (!post && journalId) {
      try {
        const res = await fetch(`/api/journal/getby/journal/${journalId}`);
        if (res.ok) {
          post = await res.json();
        }
      } catch (e) {
        console.error('Failed to fetch post by id', e);
      }
    }
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  // User switching functions
  const switchToUser = async (newUserId: string) => {
    setCustomBaseUserId(newUserId);
    // Update the baseUserId for the current session
    if (user?.account) {
      user.account.id = newUserId;
    }
    // Refresh data for the new user
    await fetchBaseUserJournal();
    await fetchAllPosts();
    toast({
      title: "User Switched",
      description: `Now using: ${newUserId.slice(0, 8)}...`,
      duration: 3000
    });
  };

  const addNewUser = () => {
    if (customBaseUserId && !availableUsers.includes(customBaseUserId)) {
      setAvailableUsers(prev => [...prev, customBaseUserId]);
      setCustomBaseUserId('');
      toast({
        title: "User Added",
        description: "New user added to switcher",
        duration: 2000
      });
    }
  };

  // Enhanced reply functionality
  const openReplyModal = async (commentData: any) => {
    setReplyToComment(commentData);
    setReplyContent('');
    setIsReplyModalOpen(true);
  };

  const submitReply = async () => {
    if (!replyContent.trim() || !replyToComment) return;
    
    setIsSubmittingReply(true);
    try {
      const response = await fetch('/api/comment/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUserId: user?.address || address,
          journalId: replyToComment.journalId,
          comment: `@${replyToComment.baseUserId.slice(0, 6)} ${replyContent}`
        })
      });

      if (response.ok) {
        toast({
          title: "Reply Posted",
          description: "Your reply has been posted successfully",
          duration: 3000
        });
        setIsReplyModalOpen(false);
        setReplyContent('');
        setReplyToComment(null);
        // Refresh comments for the post
        await fetchComments(replyToComment.journalId);
      } else {
        throw new Error('Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        duration: 3000
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const fetchComments = async (journalId: string) => {
    try {
      const response = await fetch(`/api/comment/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalId, cursor: commentCursors?.[journalId] || null, pageSize: 10 }),
      });
      if (response.ok) {
        const data = await response.json();
        setCommentCursors(prev => ({ ...prev, [journalId]: data.nextCursor }));
        return data.items || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  const loadMoreComments = async (journalId: string) => {
    const more = await fetchComments(journalId);
    setDbComments(prev => {
      const existing = prev.filter(c => c.journalId !== journalId);
      return [...existing, ...prev.filter(c=>c.journalId===journalId), ...more];
    });
  };

  // Fetch baseuser journal
  const fetchBaseUserJournal = async () => {
    if (!user?.address) return;

    try {
      const response = await fetch("/api/journal/getby/id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUserId: user.address }),
      });

      if (response.ok) {
        const data: Journal[] = await response.json();
        setDbEntries(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // Load entries from localStorage
  useEffect(() => {
    let savedEntries = null;
    if (baseUserId) {
      const baseUserEntries = localStorage.getItem(`dailybase-entries-${baseUserId}`);
      if (baseUserEntries) {
        try {
          savedEntries = JSON.parse(baseUserEntries);
        } catch (error) {
          console.error("Error loading entries:", error);
        }
      }
    }
    if (!savedEntries) {
      const addressEntries = localStorage.getItem(`dailybase-entries-${address}`);
      if (addressEntries) {
        try {
          savedEntries = JSON.parse(addressEntries);
        } catch (error) {
          console.error("Error loading entries:", error);
        }
      }
    }
    if (savedEntries) {
      setEntries(savedEntries);
    }
    setIsLoading(false);
  }, [address, baseUserId]);

  // Fetch data on mount
  useEffect(() => {
    fetchBaseUserJournal();
    fetchAllPosts();
    if (baseUserId) {
      getUserReposts(baseUserId).then(setUserReposts);
    }
  }, [user?.address, baseUserId]);

  // Hydrate calendar dates and streak from server (works with BaseUser.id or wallet address)
  useEffect(() => {
    const uid = baseUserId || address;
    if (!uid) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    // Fetch calendar dates
    fetch(`/api/calendar/dates?userId=${uid}&tz=${encodeURIComponent(tz)}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.dates)) {
          const hydrated: DailyEntry[] = data.dates.map((d: string): DailyEntry => ({
            id: `srv-${d}`,
            date: d,
            content: 'Posted',
            tags: [],
            timestamp: new Date(`${d}T00:00:00.000Z`).getTime(),
          }));
          setEntries(prev => {
            const byDate = new Map<string, DailyEntry>();
            // keep existing entries content if already present for a date
            prev.forEach(e => byDate.set(e.date, e));
            hydrated.forEach(e => {
              if (!byDate.has(e.date)) byDate.set(e.date, e);
            });
            return Array.from(byDate.values()).sort((a: DailyEntry, b: DailyEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
          });
        }
      })
      .catch(() => {});

    // Fetch streak stats
    fetch(`/api/streak?userId=${uid}&tz=${encodeURIComponent(tz)}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.success) {
          setStreakStats({
            currentStreak: data.currentStreak || 0,
            longestStreak: data.longestStreak || 0,
            totalPosts: data.totalPosts || 0,
          });
        }
      })
      .catch(() => {});
  }, [baseUserId, address]);

  // Fetch engagement data for all posts
  useEffect(() => {
    if (allPosts.length > 0) {
      allPosts.forEach(post => {
        fetchEngagementData(post.id);
      });
    }
  }, [allPosts]);

  // Update user stats when data changes
  useEffect(() => {
    setUserStats(prev => ({
      ...prev,
      posts: allPosts.length,
      likes: Object.values(likeCounts).reduce((sum, count) => sum + count, 0),
      comments: Object.values(commentCounts).reduce((sum, count) => sum + count, 0),
      reposts: Object.values(repostCounts).reduce((sum, count) => sum + count, 0),
    }));
  }, [allPosts, likeCounts, commentCounts, repostCounts]);

  // Load comments for all posts when they change
  useEffect(() => {
    console.log('Loading comments for posts:', allPosts.length);
    if (allPosts.length > 0) {
      allPosts.forEach(post => {
        console.log('Fetching comments for post:', post.id);
        fetchJournalComments(post.id).then(comments => {
          console.log('Fetched comments for post', post.id, ':', comments);
          setDbComments(prev => {
            const existing = prev.filter(c => c.journalId !== post.id);
            return [...existing, ...comments];
          });
          // fetch reply counts for each comment
          // TODO: Implement fetchReplyCount function
        });
      });
    }
  }, [allPosts]);

  // Save entries to localStorage
  const saveEntry = (entry: DailyEntry) => {
    const updatedEntries = entries.filter((e) => e.date !== entry.date);
    const newEntries = [...updatedEntries, entry].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setEntries(newEntries);

    if (baseUserId) {
      localStorage.setItem(`dailybase-entries-${baseUserId}`, JSON.stringify(newEntries));
    }
    localStorage.setItem(`dailybase-entries-${address}`, JSON.stringify(newEntries));
  };

  // Convert Journal to DailyEntry
  const handleJournalSave = async (journal: any) => {
    const dailyEntry: DailyEntry = {
      id: journal.id || Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      content: journal.journal,
      tags: journal.tags || [],
      timestamp: Date.now(),
    };
    saveEntry(dailyEntry);
  };

  // Convert DailyEntry to Journal
  const convertToJournal = (entry: DailyEntry | undefined) => {
    if (!entry) return undefined;
    return {
      id: entry.id,
      baseUserId: baseUserId || address,
      journal: entry.content,
      tags: entry.tags,
      photos: entry.photos || [],
      likes: 0,
      privacy: "public",
      dateCreated: new Date(entry.timestamp),
    };
  };

  // Utility functions
  const getTodayEntry = () => {
    const today = new Date().toISOString().split("T")[0];
    return entries.find((entry) => entry.date === today);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const getAddressDisplay = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Profile utility functions
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        localStorage.setItem(`profile-image-${address}`, result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    localStorage.removeItem(`profile-image-${address}`);
  };

  // Load profile image on mount
  useEffect(() => {
    const savedImage = localStorage.getItem(`profile-image-${address}`);
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, [address]);

  // Calendar utility functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const hasEntriesForDate = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return entries.some((entry) => entry.date === dateString);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    if (day) {
      setSelectedDate(new Date(currentYear, currentMonth, day));
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return months[month];
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToPreviousYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const goToNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
  };

  const calculateCurrentStreak = () => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = entries
      .map(entry => new Date(entry.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const currentDate = new Date(today);
    
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const dateString = currentDate.toISOString().split('T')[0];
      const hasEntry = entries.some(entry => entry.date === dateString);
      
      if (hasEntry) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Data management utility functions
  const exportData = () => {
    const dataToExport = {
      entries,
      expenseEntries,
      profileImage,
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json"
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailybase-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    if (confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      // Clear entries
      setEntries([]);
      localStorage.removeItem(`dailybase-entries-${address}`);
      if (baseUserId) {
        localStorage.removeItem(`dailybase-entries-${baseUserId}`);
      }
      
      // Clear expense entries
      setExpenseEntries([]);
      localStorage.removeItem(`dailybase-expenses-${address}`);
      if (baseUserId) {
        localStorage.removeItem(`dailybase-expenses-${baseUserId}`);
      }
      
      // Clear profile image
      setProfileImage(null);
      localStorage.removeItem(`profile-image-${address}`);
      
      alert("All data has been cleared successfully.");
    }
  };

  // Comment utility functions
  const postComment = async (journalId: string, comment: string) => {
    try {
      // optimistic insert
      const tempId = `temp-${Date.now()}`;
      const tempComment = {
        id: tempId,
        journalId,
        baseUserId: baseUserId || address,
        comment,
        dateCreated: new Date().toISOString(),
      } as any;
      setDbComments(prev => [tempComment, ...prev]);
      setCommentCounts(prev => ({ ...prev, [journalId]: (prev[journalId] || 0) + 1 }));

      const response = await fetch("/api/comment/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalId,
          comment,
          baseUserId: baseUserId || address,
        }),
      });
      if (!response.ok) throw new Error("Failed to post comment");
      const newComment = await response.json();
      // replace temp with real
      setDbComments(prev => {
        const withoutTemp = prev.filter(c => c.id !== tempId);
        return [newComment, ...withoutTemp];
      });
      
      // Update comment count
      // already incremented optimistically
      
      // Show success toast
              toast({
          title: "Success",
          description: "Comment posted successfully!"
        });
      
      return newComment;
    } catch (error) {
      console.error("Error posting comment:", error);
      // rollback optimistic
      setDbComments(prev => prev.filter(c => !(c.id as string)?.startsWith('temp-')));
      setCommentCounts(prev => ({
        ...prev,
        [journalId]: Math.max(0, (prev[journalId] || 1) - 1)
      }));
              toast({
          title: "Error",
          description: "Failed to post comment"
        });
      throw error;
    }
  };

  // Local edit/delete helpers (no server persistence yet)
  const startEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingText(currentText);
  };
  const saveEditComment = (commentId: string) => {
    setDbComments(prev => prev.map(c => c.id === commentId ? { ...c, comment: editingText } : c));
    setEditingCommentId(null);
    setEditingText('');
  };
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingText('');
  };
  const deleteLocalComment = (journalId: string, commentId: string) => {
    setDbComments(prev => prev.filter(c => c.id !== commentId));
    setCommentCounts(prev => ({ ...prev, [journalId]: Math.max(0, (prev[journalId] || 1) - 1) }));
  };

  const toggleLikeComment = (commentId: string) => {
    const liked = !!commentLiked[commentId];
    setCommentLiked(prev => ({ ...prev, [commentId]: !liked }));
    setCommentLikeCounts(prev => ({ ...prev, [commentId]: (prev[commentId] || 0) + (liked ? -1 : 1) }));
    // Optional: call API here to persist like
  };

  const submitInlineReply = async (parent: any) => {
    const text = replyText.trim();
    if (!text) return;
    try {
      // Try chain comment endpoint if present
      await fetch('/api/comment/chainComment/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: parent.id, baseUserId: baseUserId || address, chainComment: text })
      }).catch(()=>{});
      toast({ title: 'Replied', description: 'Your reply was posted.', duration: 2000 });
      setReplyText('');
      setReplyingToCommentId(null);
    } catch (_) {
      toast({ title: 'Error', description: 'Failed to reply.', duration: 3000 });
    }
  };

  // Enhanced Like, Comment, and Repost functions
  const handleLike = async (journalId: string) => {
    if (loadingLikes[journalId]) return; // Prevent double clicks
    
    setLoadingLikes(prev => ({ ...prev, [journalId]: true }));
    
    // Add a small delay to prevent rapid toggling
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const response = await fetch('/api/like/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journalId,
          userId: address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Like action successful:', data);
        
        // Show success toast
        toast({
          title: "Success",
          description: data.liked ? 'Post liked!' : 'Post unliked!',
          duration: 3000
        });
        
        // Notification is now created server-side in the like API
        
        // Update local state
        setUserLikes(prev => ({
          ...prev,
          [journalId]: data.liked
        }));
        
        // Update like count
        setLikeCounts(prev => ({
          ...prev,
          [journalId]: data.liked 
            ? (prev[journalId] || 0) + 1 
            : Math.max(0, (prev[journalId] || 0) - 1)
        }));
      } else {
        console.error('Like action failed');
        toast({
          title: "Error",
          description: "Failed to like post",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
          title: "Error",
          description: "Error liking post",
          duration: 3000
        });
    } finally {
      setLoadingLikes(prev => ({ ...prev, [journalId]: false }));
    }
  };

  const handleComment = async (journalId: string, commentText: string) => {
    try {
      const newComment = await postComment(journalId, commentText);
      
      // Notification is now created server-side in the comment API
      
      // Close comment section
      setCurrentJournalId(null);
      
      return newComment;
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleRepost = async (journalId: string) => {
    if (loadingReposts[journalId]) return; // Prevent double clicks
    
    if (!address) {
      console.error('No wallet address available for repost');
      toast({
          title: "Error",
          description: "Please connect your wallet to repost",
          duration: 3000
        });
      return;
    }
    
    console.log('Attempting repost for journalId:', journalId, 'address:', address);
    
    setLoadingReposts(prev => ({ ...prev, [journalId]: true }));
    
    try {
      const requestBody = {
        journalId,
        baseUserId: address,
      };
      console.log('Repost request body:', requestBody);
      
      const response = await fetch('/api/repost/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Repost action successful:', data);
        
        // Show success toast
        toast({
          title: "Success",
          description: data.reposted ? 'Post reposted!' : 'Repost removed!',
          duration: 3000
        });
        
        // Notification is now created server-side in the repost API
        
        // Update local state
        if (data.reposted) {
          setUserReposts(prev => [...prev, { journalId, id: data.repostId }]);
        } else {
          setUserReposts(prev => prev.filter(repost => repost.journalId !== journalId));
        }
        
        // Update repost count
        setRepostCounts(prev => ({
          ...prev,
          [journalId]: data.reposted 
            ? (prev[journalId] || 0) + 1 
            : Math.max(0, (prev[journalId] || 0) - 1)
        }));
      } else {
        const errorData = await response.text();
        console.error('Repost action failed:', response.status, errorData);
        toast({
          title: "Error",
          description: "Failed to repost",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error handling repost:', error);
      if (error instanceof Event) {
        console.error('Caught an Event object:', error.type, error.target);
      } else if (error instanceof Error) {
        console.error('Caught an Error object:', error.message, error.stack);
      } else {
        console.error('Caught an unknown error type:', typeof error, error);
      }
      toast({
          title: "Error",
          description: "Error reposting",
          duration: 3000
        });
    } finally {
      setLoadingReposts(prev => ({ ...prev, [journalId]: false }));
    }
  };

  // Create new post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || isCreatingPost) return;
    
    setIsCreatingPost(true);
    setIsProcessingImages(true);
    
    try {
      // Convert images to base64 for storage
      const imagePromises = images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
      });
      
      const imageBase64s = await Promise.all(imagePromises);
      setIsProcessingImages(false);
      
      const response = await fetch('/api/journal/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseUserId: address,
          journal: newPostContent,
          tags: newPostTags,
          photos: imageBase64s, // Send base64 images
          privacy: newPostPrivacy,
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        console.log('Post created successfully:', newPost);
        
        // Show success toast
        toast({
          title: "Success",
          description: "Post created successfully!",
          duration: 3000
        });
        
        // Update posts list
        setAllPosts(prev => [newPost, ...prev]);
        
        // Clear form
        setNewPostContent('');
        setNewPostTags([]);
        clearImages(); // Clear uploaded images
      } else {
        console.error('Failed to create post');
        toast({
          title: "Error",
          description: "Failed to create post",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
          title: "Error",
          description: "Error creating post",
          duration: 3000
        });
    } finally {
      setIsCreatingPost(false);
      setIsProcessingImages(false);
    }
  };

  // Add tag to new post
  const addTagToPost = (tag: string) => {
    if (tag.trim() && !newPostTags.includes(tag)) {
      setNewPostTags(prev => [...prev, tag]);
    }
  };

  // Remove tag from new post
  const removeTagFromPost = (tagToRemove: string) => {
    setNewPostTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Delete post function
  const handleDeletePost = async (journalId: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    // optimistic remove
    const previous = allPosts;
    const deleted = previous.find(p => p.id === journalId) || null;
        setAllPosts(prev => prev.filter(post => post.id !== journalId));
    setRecentlyDeletedPost(deleted);
    if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
    try {
      // delay actual delete 5s to allow undo
      deleteTimerRef.current = window.setTimeout(async () => {
        if (!recentlyDeletedPost || recentlyDeletedPost.id !== journalId) return;
        const response = await fetch(`/api/journal/delete?journalId=${journalId}&userId=${address}`, { method: 'DELETE' });
        if (!response.ok) {
          setAllPosts(previous);
        const errorData = await response.json();
          toast({ title: 'Error', description: errorData.error || 'Failed to delete post', duration: 3000 });
        } else {
          toast({ title: 'Deleted', description: 'Post removed.', duration: 3000 });
        }
        setRecentlyDeletedPost(null);
        deleteTimerRef.current && window.clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }, 5000) as unknown as number;
      toast({ title: 'Pending delete', description: 'Undo available for 5s', duration: 2000 });
    } catch (error) {
      setAllPosts(previous);
      console.error('Error deleting post:', error);
      toast({ title: 'Error', description: 'Error deleting post', duration: 3000 });
    }
  };

  // Archive post function
  const handleArchivePost = async (journalId: string) => {
    // optimistic toggle
    const prev = allPosts;
    setAllPosts(prevPosts => prevPosts.map(p => p.id === journalId ? { ...p, archived: !p.archived, archivedAt: !p.archived ? new Date() : undefined } : p));
    try {
      const action = 'archive';
      const response = await fetch(`/api/journal/archive?journalId=${journalId}&userId=${address}&action=${action}`, { method: 'PUT' });
      if (!response.ok) {
        setAllPosts(prev);
        const errorData = await response.json();
        toast({ title: 'Error', description: errorData.error || 'Failed to archive post', duration: 3000 });
        return;
      }
      const data = await response.json();
      toast({ title: 'Success', description: data.archived ? 'Post archived successfully!' : 'Post unarchived successfully!', duration: 3000 });
    } catch (error) {
      setAllPosts(prev);
      console.error('Error archiving post:', error);
      toast({ title: 'Error', description: 'Error archiving post', duration: 3000 });
    }
  };

  // Fetch engagement data for a post
  const fetchEngagementData = async (journalId: string) => {
    try {
      // Fetch likes
      const likeResponse = await fetch(`/api/like/post?journalId=${journalId}&userId=${address}`);
      if (likeResponse.ok) {
        const likeData = await likeResponse.json();
        setUserLikes(prev => ({
          ...prev,
          [journalId]: likeData.userLiked
        }));
        setLikeCounts(prev => ({
          ...prev,
          [journalId]: likeData.likeCount
        }));
      }

      // Fetch reposts
      const repostResponse = await fetch(`/api/repost/post?journalId=${journalId}&baseUserId=${address}`);
      if (repostResponse.ok) {
        const repostData = await repostResponse.json();
        setUserReposts(prev => {
          const existing = prev.find(r => r.journalId === journalId);
          if (repostData.userReposted && !existing) {
            return [...prev, { journalId, id: Date.now() }];
          } else if (!repostData.userReposted && existing) {
            return prev.filter(r => r.journalId !== journalId);
          }
          return prev;
        });
        setRepostCounts(prev => ({
          ...prev,
          [journalId]: repostData.repostCount
        }));
      }

      // Fetch comments
      const commentResponse = await fetch("/api/comment/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalId }),
      });
      if (commentResponse.ok) {
        const commentData = await commentResponse.json();
        console.log('Engagement data - comments for', journalId, ':', commentData);
        
        // Handle both old array format and new { items, nextCursor } format
        const comments = Array.isArray(commentData) ? commentData : (commentData.items || []);
        
        setCommentCounts(prev => ({
          ...prev,
          [journalId]: comments.length
        }));
        // Also update the dbComments state with the fetched comments
        setDbComments(prev => {
          const existingComments = prev.filter(c => c.journalId !== journalId);
          return [...existingComments, ...comments];
        });
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error);
    }
  };

  // Legacy functions for backward compatibility
  const createRepost = async (journalId: string) => {
    return handleRepost(journalId);
  };

  const getUserReposts = async (userId: string) => {
    try {
      const response = await fetch("/api/repost/getby/id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUserId: userId }),
      });
      if (response.ok) {
        const data = await response.json();
        return data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching user reposts:", error);
      return [];
    }
  };

  const getCommentCount = async (journalId: string) => {
    try {
      const response = await fetch("/api/comment/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalId }),
      });
      if (response.ok) {
        const commentData = await response.json();
        // Handle both old array format and new { items, nextCursor } format
        const comments = Array.isArray(commentData) ? commentData : (commentData.items || []);
        return comments.length || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching comment count:", error);
      return 0;
    }
  };

  const isReposted = (journalId: string) => {
    return userReposts.some(repost => repost.journalId === journalId);
  };

  const fetchJournalComments = async (journalId: string) => {
    try {
      const response = await fetch("/api/comment/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalId, cursor: commentCursors?.[journalId] || null, pageSize: 10 }),
      });
      if (response.ok) {
        const data = await response.json();
        setCommentCursors(prev => ({ ...prev, [journalId]: data.nextCursor }));
        return data.items || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };



  // Home feed functions
  const fetchAllPosts = async (silent: boolean = false) => {
    if (!silent) setIsLoadingFeed(true);
    try {
      const response = await fetch("/api/journal/get", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setAllPosts(data || []);
        extractTrendingTopics(data || []);
      }
    } catch (error) {
      console.error("Error fetching all posts:", error);
    } finally {
      if (!silent) setIsLoadingFeed(false);
    }
  };

  // Auto-refresh feed periodically and on focus/visibility
  useEffect(() => {
    const REFRESH_MS = 10000; // 10s
    const id = window.setInterval(() => {
      fetchAllPosts(true);
    }, REFRESH_MS);

    const onFocus = () => fetchAllPosts(true);
    const onVisibility = () => { if (!document.hidden) fetchAllPosts(true); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const extractTrendingTopics = (posts: Journal[]) => {
    const tagCounts: { [key: string]: number } = {};
    
    posts.forEach(post => {
      post.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const sortedTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

    setTrendingTopics(sortedTags);
  };

  const getFilteredPosts = () => {
    switch (feedFilter) {
      case 'trending':
        return allPosts.filter(post => 
          post.tags?.some(tag => trendingTopics.includes(tag))
        );
      case 'following':
        // For now, show all posts. In the future, implement following logic
        return allPosts;
      default:
        return allPosts;
    }
  };

  const getPostStats = (post: Journal) => {
    const repostCount = userReposts.filter(repost => repost.journalId === post.id).length;
    const commentCount = commentCounts[post.id] || 0;
    return { repostCount, commentCount };
  };

  // Calculator utility functions
  const calculateGasFee = () => {
    const gasPriceNum = parseFloat(gasPrice);
    const gasLimitNum = parseFloat(gasLimit);
    const ethPriceNum = parseFloat(ethPrice);

    const gasFeeGwei = gasPriceNum * gasLimitNum;
    const gasFeeEth = gasFeeGwei / 1000000000;
    const gasFeeUsd = gasFeeEth * ethPriceNum;

    return {
      gwei: gasFeeGwei.toFixed(0),
      eth: gasFeeEth.toFixed(6),
      usd: gasFeeUsd.toFixed(2),
    };
  };

  const getExchangeRate = (fromCurrency: string, toCurrency: string) => {
    const key = `${fromCurrency}_${toCurrency}`;
    return liveExchangeRates[key] || fallbackExchangeRates[key] || 1;
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    const rate = getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  };

  const swapCurrencies = () => {
    setCurrencySwap({
      ...currencySwap,
      fromCurrency: currencySwap.toCurrency,
      toCurrency: currencySwap.fromCurrency,
      exchangeRate: getExchangeRate(currencySwap.toCurrency, currencySwap.fromCurrency),
    });
  };

  const updateCurrencySwap = (field: string, value: string) => {
    if (field === "fromAmount") {
      setCurrencySwap({
        ...currencySwap,
        fromAmount: value,
        exchangeRate: getExchangeRate(currencySwap.fromCurrency, currencySwap.toCurrency),
      });
    } else if (field === "fromCurrency") {
      const newFromCurrency = value;
      const newExchangeRate = getExchangeRate(newFromCurrency, currencySwap.toCurrency);
      setCurrencySwap({
        ...currencySwap,
        fromCurrency: newFromCurrency,
        exchangeRate: newExchangeRate,
      });
    } else if (field === "toCurrency") {
      const newToCurrency = value;
      const newExchangeRate = getExchangeRate(currencySwap.fromCurrency, newToCurrency);
      setCurrencySwap({
        ...currencySwap,
        toCurrency: newToCurrency,
        exchangeRate: newExchangeRate,
      });
    }
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };

  const addExpenseEntry = () => {
    if (!newExpense.description || !newExpense.amount) return;

    const expense = {
      id: Date.now().toString(),
      ...newExpense,
    };

    setExpenseEntries([expense, ...expenseEntries]);
    setNewExpense({
      date: new Date().toISOString().split("T")[0],
      category: "Gas Fees",
      description: "",
      amount: "",
      gasFee: "",
      transactionHash: "",
      notes: "",
    });
  };

  const deleteExpenseEntry = (id: string) => {
    setExpenseEntries(expenseEntries.filter((expense) => expense.id !== id));
  };

  const getTotalExpenses = () => {
    return expenseEntries.reduce((total, expense) => total + parseFloat(expense.amount || "0"), 0);
  };

  const getTotalExpensesByCategory = (category: string) => {
    return expenseEntries
      .filter((expense) => expense.category === category)
      .reduce((total, expense) => total + parseFloat(expense.amount || "0"), 0);
  };

  const gasFeeResult = calculateGasFee();
  const convertedAmount = convertCurrency(
    parseFloat(currencySwap.fromAmount) || 0,
    currencySwap.fromCurrency,
    currencySwap.toCurrency
  );



  // Sidebar items configuration
  const sidebarItems = [
    { id: 'home' as SidebarItem, label: 'Home', icon: Home },
    { id: 'calendar' as SidebarItem, label: 'Calendar', icon: Calendar },
    { id: 'calculator' as SidebarItem, label: 'Calculator', icon: Calculator },
    { id: 'stats' as SidebarItem, label: 'Stats', icon: BarChart3 },
    { id: 'streak' as SidebarItem, label: 'Streak', icon: Flame },
    { 
      id: 'notifications' as SidebarItem, 
      label: 'Notifications', 
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { id: 'profile' as SidebarItem, label: 'Profile', icon: User },
    { id: 'settings' as SidebarItem, label: 'Settings', icon: Settings },
  ];



  const renderContent = () => {
    switch (activeSidebarItem) {
      case "home":
        return (
          <div className="space-y-6">

            {/* Farcaster-style Search Bar */}
            <div className="mb-6">
              <SearchComponent 
                onResultSelect={(result) => {
                  toast({
          title: "Info",
          description: `Selected: ${result.title}`
        });
                }}
                placeholder="Search posts, users, tags..."
                className="w-full"
              />
              <div className="mt-3">
                <SearchFilters 
                  activeFilter={searchFilter} 
                  onFilterChange={setSearchFilter} 
                />
              </div>
            </div>



            {/* Gaming-style Create Post */}
            <div className="rounded-xl p-3 sm:p-4 mb-6 scanlines pixel-card">
              <div className="flex items-start gap-2 sm:gap-3">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 pixel-avatar flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-green-600 to-green-700 text-green-100 text-xs sm:text-sm font-bold pixelated-text pixel-text-shadow">
                    {address.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                  <div>
                    <div className="mb-2 font-bold text-xs sm:text-sm pixelated-text text-green-100">
                      What's happening in your crypto world today?
                    </div>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share your thoughts, trades, or insights..."
                      className="w-full p-2 sm:p-3 rounded-lg resize-none transition-all duration-200 text-xs sm:text-sm pixelated-text text-green-100 placeholder-green-300/50 pixel-input"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-2 sm:space-y-0">
                        <span className="text-xs sm:text-sm pixelated-text text-green-300/70">
                        {newPostContent.length}/500
                      </span>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          className="rounded-lg px-2 sm:px-3 py-1 sm:py-2 transition-all duration-300 pixelated-text text-xs sm:text-sm w-full sm:w-auto text-green-100 hover:text-green-300 pixel-button"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {images.length > 0 ? `${images.length} Image${images.length > 1 ? 's' : ''}` : 'Add Photo'}
                        </Button>
                        
                        {/* Privacy Selector */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <select
                            value={newPostPrivacy}
                            onChange={(e) => setNewPostPrivacy(e.target.value as 'public' | 'private')}
                            className="rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm transition-all duration-300 pixelated-text w-full sm:w-auto text-green-100 pixel-input"
                          >
                            <option value="public">🌍 Public</option>
                            <option value="private">🔒 Private</option>
                          </select>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            handleImagesSelected(files);
                          }}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="space-y-2">
                      <ResponsiveText size="base" className="text-orange-500 text-xs sm:text-sm">
                        Selected Images ({images.length}):
                      </ResponsiveText>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border-2 border-orange-400/30 hover:border-orange-400/60 transition-all duration-300"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newImages = images.filter((_, i) => i !== index);
                                // Update images state by calling the clear function and then setting new images
                                clearImages();
                                newImages.forEach(img => {
                                  const input = document.getElementById('image-upload') as HTMLInputElement;
                                  if (input) {
                                    const dt = new DataTransfer();
                                    dt.items.add(img);
                                    input.files = dt.files;
                                  }
                                });
                              }}
                              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <X className="w-2 h-2 sm:w-3 sm:h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearImages}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 border-red-400/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Clear All Images
                      </Button>
                    </div>
                  )}

                  {/* Tags Display */}
                  {newPostTags.length > 0 && (
                    <div className="space-y-2">
                      <ResponsiveText size="base" className="text-blue-300 text-xs sm:text-sm">
                        Tags:
                      </ResponsiveText>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {newPostTags.map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1"
                          >
                            #{tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTagFromPost(tag)}
                              className="ml-1 p-0 h-auto text-blue-300 hover:text-blue-200"
                            >
                              <X className="w-2 h-2 sm:w-3 sm:h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Tags */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      id="tag-input"
                      type="text"
                      placeholder="Add tags..."
                                                                      className="flex-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-300 pixelated-text text-xs sm:text-sm text-green-100 placeholder-green-300/50 pixel-input"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            addTagToPost(input.value.trim());
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById('tag-input') as HTMLInputElement;
                        if (input.value.trim()) {
                          addTagToPost(input.value.trim());
                          input.value = '';
                        }
                      }}
                      variant="outline"
                      size="sm"
                                                                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 w-full sm:w-auto text-green-100 pixel-button"
                    >
                      Add Tag
                    </Button>
                  </div>

                  {/* Post Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || isCreatingPost}
                                                                      className="px-4 sm:px-6 py-2 disabled:opacity-50 text-xs sm:text-sm w-full sm:w-auto pixel-text-shadow text-green-100 pixel-button"
                    >
                      {isCreatingPost ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                          <span className="text-xs sm:text-sm">{isProcessingImages ? 'Processing Images...' : 'Posting...'}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">Post</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Feed Content with better responsive layout */}
            {isLoadingFeed ? (
              <div className="space-responsive-lg">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="bg-white/10 border-white/20 text-white backdrop-blur-2xl card-glass shadow-lg shadow-blue-400/30">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-full bg-slate-600" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 bg-slate-600 w-1/3" />
                          <Skeleton className="h-3 bg-slate-600 w-1/4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 bg-slate-600 w-full" />
                      <Skeleton className="h-4 bg-slate-600 w-3/4" />
                      <Skeleton className="h-4 bg-slate-600 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : getFilteredPosts().length === 0 ? (
              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/50 text-white backdrop-blur-sm card-glass shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                    <Home className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-responsive-2xl font-bold text-white pixelated-text mb-3">
                    No posts yet
                  </h3>
                  <p className="text-blue-300 text-center mb-8 max-w-md leading-relaxed text-responsive-base">
                    Be the first to share your crypto journey! Create a post to get started.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white pixelated-text px-8 py-3 text-lg hover:shadow-lg hover:shadow-blue-500/25">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-responsive-xl">
                {getFilteredPosts().map((entry, index) => {
                  const userRepost = userReposts.find(repost => repost.journalId === entry.id);
                  const commentCount = commentCounts[entry.id] || 0;
                  
                  return (
                    <div key={entry.id}>
                      <TVPostContainer
                        neonColor="cyan"
                        className="mb-10"
                        surface="dark"
                        hasImage={entry.photos && entry.photos.length > 0}
                        tvStyle={'retro'}
                      >
                        <PostHeader
                          user={{
                            address: entry.baseUserId,
                            name: entry.baseUserId.slice(0, 6) + "..." + entry.baseUserId.slice(-4)
                          }}
                          date={entry.dateCreated ? new Date(entry.dateCreated) : new Date()}
                          privacy={entry.privacy}
                        />
                        {entry.archived && (
                          <div className="px-3 py-1 mb-2 inline-flex items-center rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 text-xs font-semibold">
                            ARCHIVED
                          </div>
                        )}
                        <PostContent
                          content={entry.journal || "This user shared their crypto journey..."}
                          photos={entry.photos}
                        />
                        
                        <PostTags tags={entry.tags} />
                        
                        <PostActions
                          likes={likeCounts[entry.id] || entry.likes || 0}
                          comments={commentCount}
                          reposts={repostCounts[entry.id] || 0}
                          isLiked={userLikes[entry.id]}
                          loadingLikes={loadingLikes[entry.id]}
                          isOwner={entry.baseUserId === address}
                          onLike={() => handleLike(entry.id)}
                          onComment={() => {
                                  setCurrentJournalId(entry.id);
                                  setCommentCounts(prev => ({ ...prev, [entry.id]: commentCount }));
                                }}
                          onRepost={() => handleRepost(entry.id)}
                          onDelete={() => handleDeletePost(entry.id)}
                          onArchive={() => handleArchivePost(entry.id)}
                          theme={'dark'}
                        />
                      </TVPostContainer>
                        
                        {/* Enhanced Comments Section */}
                        {currentJournalId === entry.id && (
                          <div className="mt-6 p-6 rounded-2xl border backdrop-blur-sm shadow-inner border-slate-600/40 bg-slate-800/40">
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600/90 rounded-lg flex items-center justify-center shadow ring-2 ring-blue-400/30">
                                  <MessageSquare className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-blue-200 pixelated-text font-bold text-lg">Comments</span>
                                <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/40 pixelated-text text-sm font-medium">
                                  {commentCounts[entry.id] || 0}
                                </Badge>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setCurrentJournalId(null)}
                                className="text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-full p-2"
                                aria-label="Close comments"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {/* Input */}
                            <div className="flex gap-3 mb-5">
                              <Avatar className="w-10 h-10 ring-2 ring-blue-400/30 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">
                                {user?.address?.slice(0, 2).toUpperCase() || 'DB'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="relative group">
                                  <input
                                    type="text"
                                    placeholder="Share your thoughts on this post..."
                                    className="w-full border text-white px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 pixelated-text text-sm placeholder-slate-400 bg-slate-900/40 border-slate-600/60"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const target = e.target as HTMLInputElement;
                                        if (target.value.trim()) {
                                          handleComment(entry.id, target.value);
                                          target.value = '';
                                        }
                                      }
                                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        const target = e.target as HTMLInputElement;
                                        if (target.value.trim()) {
                                          handleComment(entry.id, target.value);
                                          target.value = '';
                                        }
                                      }
                                    }}
                                  />
                                    <Button 
                                      size="sm" 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full h-7 w-7 p-0 disabled:opacity-50"
                                    aria-label="Add comment"
                                      onClick={(e) => {
                                      const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                                        if (input && input.value.trim()) {
                                          handleComment(entry.id, input.value);
                                          input.value = '';
                                        }
                                      }}
                                    disabled={false}
                                    >
                                    <Plus className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                              </div>
                            </div>
                            
                            {/* List */}
                            <div className="space-y-4">
                              {dbComments
                                .filter(comment => comment.journalId === entry.id)
                                .map((comment, commentIndex) => (
                                                                      <div key={comment.id || commentIndex} className="flex gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-slate-600/20 to-slate-700/20 border-slate-500/20 hover:border-slate-500/40">
                                    <Avatar className="w-8 h-8 ring-1 ring-blue-400/20">
                                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs">
                                        {comment.baseUserId.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-blue-300 pixelated-text">
                                          {comment.baseUserId.slice(0, 6)}...{comment.baseUserId.slice(-4)}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                          {new Date(comment.dateCreated).toLocaleDateString()}
                                        </span>
                                        {(comment.baseUserId === (baseUserId || address)) && (
                                          <span className="ml-auto flex items-center gap-2">
                                            {editingCommentId === comment.id ? (
                                              <>
                                                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => saveEditComment(comment.id)}>Save</Button>
                                                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={cancelEditComment}>Cancel</Button>
                                              </>
                                            ) : (
                                              <>
                                                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => startEditComment(comment.id, comment.comment)}>Edit</Button>
                                                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-red-300 hover:text-red-200" onClick={() => deleteLocalComment(entry.id, comment.id)}>Delete</Button>
                                              </>
                                            )}
                                          </span>
                                        )}
                                      </div>
                                      {editingCommentId === comment.id ? (
                                        <input value={editingText} onChange={(e)=>setEditingText(e.target.value)} className="w-full bg-slate-900/40 border border-slate-600/60 text-white px-3 py-2 rounded-md text-sm" />
                                      ) : (
                                      <p className="text-sm text-white pixelated-text break-words">
                                        {comment.comment}
                                      </p>
                                      )}
                                      {/* Comment actions */}
                                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                                        <button className={`px-2 py-1 rounded-md border border-slate-600/50 hover:bg-slate-700/40 transition ${commentLiked[comment.id] ? 'text-green-400 border-green-600/40' : ''}`} onClick={()=>toggleLikeComment(comment.id)}>
                                          <span className="mr-1">❤️</span>{commentLikeCounts[comment.id] || 0}
                                        </button>
                                        <button className="px-2 py-1 rounded-md border border-slate-600/50 hover:bg-slate-700/40 transition" onClick={()=>{ setReplyingToCommentId(comment.id); setReplyText(''); }}>Reply{typeof comment.replyCount==='number' ? ` (${comment.replyCount})` : ''}</button>
                                      </div>
                                      {replyingToCommentId === comment.id && (
                                        <div className="mt-2 flex items-center gap-2">
                                          <input value={replyText} onChange={(e)=>setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 bg-slate-900/40 border border-slate-600/60 text-white px-3 py-2 rounded-md text-sm" onKeyDown={(e)=>{ if(e.key==='Enter' && (e.ctrlKey||e.metaKey)){ e.preventDefault(); submitInlineReply(comment); } }} />
                                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" onClick={()=>submitInlineReply(comment)} disabled={!replyText.trim()}>Send</Button>
                                          <Button size="sm" variant="ghost" onClick={()=>{ setReplyingToCommentId(null); setReplyText(''); }}>Cancel</Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              {dbComments.filter(comment => comment.journalId === entry.id).length === 0 && (
                                 <div className="text-center py-10">
                                   <MessageSquare className="w-9 h-9 text-slate-500 mx-auto mb-3" />
                                  <p className="text-slate-400 text-sm">No comments yet. Be the first to comment!</p>
                                </div>
                              )}
                              {commentCursors?.[entry.id] && (
                                <div className="pt-2">
                                  <Button variant="outline" size="sm" className="w-full" onClick={()=>loadMoreComments(entry.id)}>Load more comments</Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case "calendar":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-green-100 pixelated-text mb-3 pixel-text-shadow">
                Calendar View
              </h1>
              <p className="text-green-300 pixelated-text text-lg font-medium pixel-text-shadow">
                Track your daily entries and activities
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" size="sm" className="pixel-button pixel-rounded rgb-fringe">INSERT COIN</Button>
                <Button onClick={goToToday} size="sm" className="bg-green-600 hover:bg-green-700 text-white pixel-rounded flicker">START</Button>
                <Button variant="outline" size="sm" className="pixel-button pixel-rounded">SELECT</Button>
                <Button onClick={goToPreviousMonth} variant="outline" size="sm" className="pixel-button pixel-rounded">◀</Button>
                <Button onClick={goToNextMonth} variant="outline" size="sm" className="pixel-button pixel-rounded">▶</Button>
              </div>
            </div>

            {/* Gaming-style Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-transparent border-2 border-green-500/50 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-100 pixelated-text pixel-text-shadow mb-1">
                  {entries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
                  }).length}
                </div>
                <div className="text-sm text-green-300 pixelated-text">Entries This Month</div>
              </div>
              
              <div className="bg-transparent border-2 border-green-500/50 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center mb-1">
                  <Flame className="w-6 h-6 text-green-400 mr-2 pixel-text-glow" />
                  <span className="text-2xl font-bold text-green-100 pixelated-text pixel-text-shadow">
                    {streakStats.currentStreak}
                  </span>
                </div>
                <div className="text-sm text-green-300 pixelated-text">Day Streak</div>
              </div>
              
              <div className="bg-transparent border-2 border-green-500/50 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-green-100 pixelated-text pixel-text-shadow mb-1">
                  {Math.round((entries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
                  }).length / new Date(currentYear, currentMonth + 1, 0).getDate()) * 100)}%
                </div>
                <div className="text-sm text-green-300 pixelated-text">Monthly Completion</div>
              </div>
            </div>

            <Card className="bg-transparent border-2 border-green-500/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    onClick={goToPreviousYear}
                    variant="outline"
                    size="sm"
                    className="pixel-button text-green-100 pixelated-text hover:scale-105 transition-all duration-300"
                  >
                    {"<<"}
                  </Button>
                  <Button
                    onClick={goToPreviousMonth}
                    variant="outline"
                    size="sm"
                    className="pixel-button text-green-100 pixelated-text hover:scale-105 transition-all duration-300"
                  >
                    {"<"}
                  </Button>
                  <div className="flex-1 text-center">
                    <h2 className="text-3xl font-bold text-green-100 pixelated-text pixel-text-shadow">
                      {getMonthName(currentMonth)} {currentYear}
                    </h2>
                  </div>
                  <Button
                    onClick={goToNextMonth}
                    variant="outline"
                    size="sm"
                    className="pixel-button text-green-100 pixelated-text hover:scale-105 transition-all duration-300"
                  >
                    {">"}
                  </Button>
                  <Button
                    onClick={goToNextYear}
                    variant="outline"
                    size="sm"
                    className="pixel-button text-green-100 pixelated-text hover:scale-105 transition-all duration-300"
                  >
                    {">>"}
                  </Button>
                </div>
                <Button
                  onClick={goToToday}
                  variant="outline"
                  className="pixel-button text-green-100 pixelated-text hover:scale-105 transition-all duration-300"
                >
                  Today
                </Button>
              </CardHeader>
              <CardContent>
                <div className="pixel-grid grid grid-cols-7 gap-1 p-2">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center">
                      <div className="text-sm font-semibold text-green-100 pixelated-text pixel-text-shadow">
                        {day}
                      </div>
                    </div>
                  ))}

                  {generateCalendarDays().map((day, index) => (
                    <div
                      key={index}
                      className={`p-2 text-center cursor-pointer transition-all duration-200 ${
                        day ? "hover:scale-105" : ""
                      }`}
                      onClick={() => handleDateClick(day || 0)}
                    >
                      {day ? (
                        <div
                          className={`relative w-10 h-10 mx-auto rounded-lg flex items-center justify-center text-sm pixelated-text transition-all duration-300 hover:scale-110 ${
                            isToday(day)
                              ? "pixel-button text-green-100 font-bold pixel-text-glow"
                              : isSelected(day)
                              ? "pixel-border text-green-100 pixel-text-shadow"
                              : hasEntriesForDate(day)
                              ? "pixel-card text-green-100 pixel-text-shadow pixel-animation"
                              : "text-green-100 hover:pixel-border hover:pixel-text-shadow"
                          }`}
                        >
                          {day}
                          {hasEntriesForDate(day) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full pixel-text-glow animate-pulse"></div>
                          )}
                        </div>
                      ) : (
                        <div className="w-8 h-8"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-transparent border-2 border-green-500/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-100 pixelated-text pixel-text-shadow">
                  {selectedDate.toDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasEntriesForDate(selectedDate.getDate()) ? (
                  <div className="space-y-3">
                    {entries
                      .filter(
                        (entry) =>
                          entry.date ===
                          `${currentYear}-${String(currentMonth + 1).padStart(
                            2,
                            "0"
                          )}-${String(selectedDate.getDate()).padStart(2, "0")}`
                      )
                      .map((entry, index) => (
                        <div
                          key={index}
                          className="bg-transparent border-2 border-green-500/50 rounded-lg p-3 backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-100 pixelated-text font-semibold pixel-text-shadow">
                              {entry.content}
                            </span>
                            <span className="text-green-300 pixelated-text text-sm pixel-text-shadow">
                              {new Date(entry.timestamp).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                          </div>
                          
                          {entry.photos && entry.photos.length > 0 && (
                            <div className="mb-3">
                              <div className={`grid gap-1 rounded-lg overflow-hidden ${
                                entry.photos.length === 1 ? 'grid-cols-1' :
                                entry.photos.length === 2 ? 'grid-cols-2' :
                                entry.photos.length === 3 ? 'grid-cols-2' :
                                'grid-cols-2'
                              }`}>
                                {entry.photos.slice(0, 4).map((photo, photoIndex) => (
                                  <div key={photoIndex} className={`relative group cursor-pointer ${
                                    entry.photos!.length === 3 && photoIndex === 2 ? 'col-span-2' : ''
                                  }`}>
                                    <div className="w-full h-full bg-slate-600 overflow-hidden">
                                      <img
                                        src={photo}
                                        alt={`Post image ${photoIndex + 1}`}
                                        className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${
                                          entry.photos!.length === 1 ? 'h-32' :
                                          entry.photos!.length === 2 ? 'h-24' :
                                          entry.photos!.length === 3 && photoIndex === 2 ? 'h-24' : 'h-24'
                                        }`}
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.parentElement!.innerHTML = `
                                            <div class="w-full h-full bg-slate-600 flex items-center justify-center rounded-xl">
                                              <div class="text-center text-slate-400">
                                                <span class="text-xs">Image failed to load</span>
                                              </div>
                                            </div>
                                          `;
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                                {entry.photos.length > 4 && (
                                  <div className="h-24 bg-slate-600 rounded flex items-center justify-center text-xs text-slate-400">
                                    +{entry.photos.length - 4} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {entry.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-blue-300 pixelated-text">
                                Tags:
                              </span>
                              <div className="flex gap-1">
                                {entry.tags.map((tag, tagIndex) => (
                                  <Badge
                                    key={tagIndex}
                                    className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text text-xs"
                                  >
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-blue-400 mb-4 mx-auto opacity-50" />
                    <h3 className="text-xl font-semibold text-white pixelated-text mb-2">
                      No Entries
                    </h3>
                    <p className="text-blue-300 text-center mb-4">
                      No entries for this date. Start your day by adding a new
                      entry!
                    </p>
                    <Button
                      onClick={() => setActiveSidebarItem("home")}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white pixelated-text"
                    >
                      Add Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
              <CardHeader>
                <CardTitle className="text-blue-300 pixelated-text">
                  This Month's Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                    <div className="text-2xl font-bold text-green-400 pixelated-text mb-1">
                      {
                        entries.filter((entry) => {
                          const entryDate = new Date(entry.date);
                          return (
                            entryDate.getMonth() === currentMonth &&
                            entryDate.getFullYear() === currentYear
                          );
                        }).length
                      }
                    </div>
                    <div className="text-sm text-blue-300 pixelated-text">
                      Total Entries
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                    <div className="text-2xl font-bold text-blue-400 pixelated-text mb-1">
                      {
                        new Set(
                          entries
                            .filter((entry) => {
                              const entryDate = new Date(entry.date);
                              return (
                                entryDate.getMonth() === currentMonth &&
                                entryDate.getFullYear() === currentYear
                              );
                            })
                            .map((entry) => entry.date)
                        ).size
                      }
                    </div>
                    <div className="text-sm text-blue-300 pixelated-text">
                      Active Days
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                    <div className="text-2xl font-bold text-purple-400 pixelated-text mb-1">
                      {getDaysInMonth(currentYear, currentMonth)}
                    </div>
                    <div className="text-sm text-blue-300 pixelated-text">
                      Days in Month
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "calculator":
       return (
         <div className="space-y-8">

           
           <div className="text-center mb-12">
             <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">
               Basio Calculator
             </h1>
             <p className="text-blue-100 text-xl font-medium drop-shadow-sm">
               Advanced crypto calculation suite
             </p>
           </div>

           <div className="flex flex-wrap gap-3 justify-center mb-8">
             {[
               {
                 id: "gas",
                 label: "GAS CALCULATOR",
                 icon: Calculator,
                 color: "from-red-500 to-orange-500",
               },
               {
                 id: "currency",
                 label: "CURRENCY SWAP",
                 icon: Target,
                 color: "from-green-500 to-emerald-500",
               },
               {
                 id: "expense",
                 label: "EXPENSE JOURNAL",
                 icon: BookOpen,
                 color: "from-purple-500 to-pink-500",
               },
               {
                 id: "analytics",
                 label: "ANALYTICS",
                 icon: BarChart3,
                 color: "from-blue-500 to-indigo-500",
               },
             ].map((tab) => {
               const Icon = tab.icon;
               return (
                 <Button
                   key={tab.id}
                   variant="outline"
                   className={`pixelated-text relative overflow-hidden ${
                     activeCalculatorTab === tab.id
                       ? `bg-gradient-to-r ${tab.color} text-white border-0 shadow-lg shadow-blue-400/50 transform scale-105`
                       : "bg-white/10 border-white/20 text-blue-100 hover:bg-white/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                   }`}
                   onClick={() => setActiveCalculatorTab(tab.id)}
                 >
                   <Icon className="w-4 h-4 mr-2" />
                   {tab.label}
                   {activeCalculatorTab === tab.id && (
                     <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                   )}
                 </Button>
               );
             })}
           </div>

           {activeCalculatorTab === "gas" && (
             <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-8 border-2 border-purple-500 rounded-xl shadow-2xl shadow-purple-500/30 backdrop-blur-sm">

               
               <div className="text-center mb-8">
                 <div className="inline-block bg-gradient-to-r from-purple-500 to-cyan-500 p-1 rounded-full mb-4">
                   <div className="bg-slate-900 px-6 py-2 rounded-full">
                     <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 pixelated-text drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                       ⚡ Gas Fee Calculator ⚡
                 </h2>
                   </div>
                 </div>
                 <p className="text-purple-300/80 text-lg font-medium pixelated-text">
                   Calculate transaction costs with precision
                 </p>
               </div>
               <div className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
                     <div className="space-y-2 group">
                       <label className="text-sm font-bold text-purple-300 pixelated-text group-hover:text-purple-200 transition-colors">
                         ⚡ Gas Price (Gwei)
                     </label>
                       <div className="relative">
                     <input
                       type="number"
                       value={gasPrice}
                       onChange={(e) => setGasPrice(e.target.value)}
                           className="w-full bg-slate-800/80 border-2 border-purple-500/50 text-purple-100 px-4 py-3 rounded-lg transition-all duration-300 pixelated-text placeholder-purple-300/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-800"
                       placeholder="20"
                     />
                         <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg pointer-events-none"></div>
                   </div>
                     </div>
                     <div className="space-y-2 group">
                       <label className="text-sm font-bold text-cyan-300 pixelated-text group-hover:text-cyan-200 transition-colors">
                         🔥 Gas Limit
                     </label>
                       <div className="relative">
                     <input
                       type="number"
                       value={gasLimit}
                       onChange={(e) => setGasLimit(e.target.value)}
                           className="w-full bg-slate-800/80 border-2 border-cyan-500/50 text-cyan-100 px-4 py-3 rounded-lg transition-all duration-300 pixelated-text placeholder-cyan-300/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:bg-slate-800"
                       placeholder="21000"
                     />
                         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-lg pointer-events-none"></div>
                   </div>
                     </div>
                     <div className="space-y-2 group">
                       <label className="text-sm font-bold text-green-300 pixelated-text group-hover:text-green-200 transition-colors">
                         💰 ETH Price (USD)
                     </label>
                       <div className="relative">
                     <input
                       type="number"
                       value={ethPrice}
                       onChange={(e) => setEthPrice(e.target.value)}
                           className="w-full bg-slate-800/80 border-2 border-green-500/50 text-green-100 px-4 py-3 rounded-lg transition-all duration-300 pixelated-text placeholder-green-300/50 focus:border-green-400 focus:ring-2 focus:ring-green-500/20 focus:bg-slate-800"
                       placeholder="2000"
                     />
                         <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg pointer-events-none"></div>
                       </div>
                   </div>
                 </div>

                                   <div className="bg-gradient-to-br from-slate-800/80 to-purple-900/30 rounded-xl p-8 border-2 border-purple-500/50 shadow-xl shadow-purple-500/20">
                    <h4 className="text-purple-200 font-bold mb-6 text-center text-xl pixelated-text drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                      🎯 Calculation Results
                   </h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
                      <div className="text-center p-6 bg-gradient-to-br from-purple-800/40 to-slate-700/60 rounded-lg border-2 border-purple-400/50 hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/20 group">
                        <div className="text-3xl font-bold text-purple-300 mb-2 pixelated-text drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] group-hover:text-purple-200">
                         {gasFeeResult.gwei}
                       </div>
                        <div className="text-sm text-purple-200 font-bold pixelated-text">⚡ Gwei</div>
                     </div>
                      <div className="text-center p-6 bg-gradient-to-br from-cyan-800/40 to-slate-700/60 rounded-lg border-2 border-cyan-400/50 hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20 group">
                        <div className="text-3xl font-bold text-cyan-300 mb-2 pixelated-text drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] group-hover:text-cyan-200">
                         {gasFeeResult.eth}
                       </div>
                        <div className="text-sm text-cyan-200 font-bold pixelated-text">🔥 ETH</div>
                     </div>
                      <div className="text-center p-6 bg-gradient-to-br from-green-800/40 to-slate-700/60 rounded-lg border-2 border-green-400/50 hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/20 group">
                        <div className="text-3xl font-bold text-green-300 mb-2 pixelated-text drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] group-hover:text-green-200">
                         ${gasFeeResult.usd}
                       </div>
                        <div className="text-sm text-green-200 font-bold pixelated-text">💰 USD</div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {activeCalculatorTab === "currency" && (
             <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8 border-2 border-blue-500 rounded-xl shadow-2xl shadow-blue-500/30 backdrop-blur-sm">
               <div className="text-center mb-8">
                 <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 p-1 rounded-full mb-4">
                   <div className="bg-slate-900 px-6 py-2 rounded-full">
                     <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 pixelated-text drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                       🌍 Currency Converter 🌍
                 </h2>
                   </div>
                 </div>
                 <p className="text-blue-300/80 text-lg font-medium pixelated-text">
                   Convert currencies with real-time exchange rates
                 </p>
                 <div className="text-sm text-cyan-200 pixelated-text mt-3 font-medium bg-slate-800/50 px-3 py-1 rounded-full border border-cyan-500/30">
                   {Object.keys(liveExchangeRates).length > 0
                     ? "✅ Live rates active"
                     : "⚠️ Using backup rates"}
                 </div>
               </div>

               <div className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
                   <div className="space-y-2 group">
                     <label className="text-sm font-bold text-blue-300 pixelated-text group-hover:text-blue-200 transition-colors">
                       🌍 From Currency
                     </label>
                     <div className="relative">
                     <select
                       value={currencySwap.fromCurrency}
                       onChange={(e) => updateCurrencySwap("fromCurrency", e.target.value)}
                         className="w-full bg-slate-800/80 border-2 border-blue-500/50 text-blue-100 px-4 py-3 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-800 transition-all duration-300 pixelated-text"
                     >
                       {currencies.map((currency) => (
                         <option key={currency.code} value={currency.code}>
                           {currency.symbol} {currency.name} ({currency.code})
                         </option>
                       ))}
                     </select>
                       <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg pointer-events-none"></div>
                   </div>
                   </div>
                   <div className="space-y-2 group">
                     <label className="text-sm font-bold text-cyan-300 pixelated-text group-hover:text-cyan-200 transition-colors">
                       🎯 To Currency
                     </label>
                     <div className="relative">
                     <select
                       value={currencySwap.toCurrency}
                       onChange={(e) => updateCurrencySwap("toCurrency", e.target.value)}
                         className="w-full bg-slate-800/80 border-2 border-cyan-500/50 text-cyan-100 px-4 py-3 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:bg-slate-800 transition-all duration-300 pixelated-text"
                     >
                       {currencies.map((currency) => (
                         <option key={currency.code} value={currency.code}>
                           {currency.symbol} {currency.name} ({currency.code})
                         </option>
                       ))}
                     </select>
                       <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-lg pointer-events-none"></div>
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2 group">
                     <label className="text-sm font-bold text-green-300 pixelated-text group-hover:text-green-200 transition-colors">
                       💰 Amount
                     </label>
                     <div className="relative">
                     <input
                       type="number"
                       value={currencySwap.fromAmount}
                       onChange={(e) => updateCurrencySwap("fromAmount", e.target.value)}
                         className="w-full bg-slate-800/80 border-2 border-green-500/50 text-green-100 px-4 py-3 rounded-lg focus:border-green-400 focus:ring-2 focus:ring-green-500/20 focus:bg-slate-800 transition-all duration-300 pixelated-text"
                       placeholder="1.00"
                       step="0.01"
                     />
                       <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg pointer-events-none"></div>
                     </div>
                   </div>
                   <div className="flex items-end gap-3">
                     <Button
                       onClick={swapCurrencies}
                       className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 pixelated-text font-bold"
                     >
                       🔄 Swap Currencies
                     </Button>
                   </div>
                 </div>

                                   <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/30 rounded-xl p-8 border-2 border-blue-500/50 shadow-xl shadow-blue-500/20">
                    <h4 className="text-blue-200 font-bold mb-6 text-center text-lg pixelated-text drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                      🎯 Conversion Results
                   </h4>
                   <div className="text-center">
                      <div className="text-4xl font-bold text-blue-400 mb-3 pixelated-text drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                       {getCurrencySymbol(currencySwap.fromCurrency)}
                       {parseFloat(currencySwap.fromAmount || "0").toFixed(2)}
                     </div>
                      <div className="text-blue-300 mb-4 text-lg pixelated-text">⚡ equals ⚡</div>
                      <div className="text-4xl font-bold text-cyan-400 mb-4 pixelated-text drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                       {getCurrencySymbol(currencySwap.toCurrency)}
                       {convertedAmount.toFixed(2)}
                     </div>
                      <div className="text-sm text-cyan-300 bg-slate-700/50 rounded-lg p-3 inline-block border border-cyan-500/30 pixelated-text">
                        💱 Exchange Rate: 1 {currencySwap.fromCurrency} ={" "}
                       {currencySwap.exchangeRate.toFixed(4)}{" "}
                       {currencySwap.toCurrency}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {activeCalculatorTab === "expense" && (
             <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 p-8 border-2 border-green-500 rounded-xl shadow-2xl shadow-green-500/30 backdrop-blur-sm">
               <div className="text-center mb-8">
                 <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 p-1 rounded-full mb-4">
                   <div className="bg-slate-900 px-6 py-2 rounded-full">
                     <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 pixelated-text drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                       📊 Expense Journal 📊
                 </h2>
                   </div>
                 </div>
                 <p className="text-green-300/80 text-lg font-medium pixelated-text">
                   Track and manage your crypto expenses with calendar integration
                 </p>
               </div>
               <div className="space-y-6">
                 <div className="bg-gradient-to-br from-slate-800/80 to-green-900/30 rounded-xl p-6 border-2 border-green-500/50 shadow-xl shadow-green-500/20">
                   <h3 className="text-green-200 font-bold text-lg mb-6 text-center pixelated-text drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                     ➕ Add New Expense
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div className="space-y-2 group">
                       <label className="text-sm font-bold text-green-300 pixelated-text group-hover:text-green-200 transition-colors">
                         📅 Date
                       </label>
                       <div className="relative">
                       <input
                         type="date"
                         value={newExpense.date}
                         onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                           className="w-full bg-slate-800/80 border-2 border-green-500/50 text-green-100 px-4 py-3 rounded-lg focus:border-green-400 focus:ring-2 focus:ring-green-500/20 focus:bg-slate-800 transition-all duration-300 pixelated-text"
                       />
                         <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg pointer-events-none"></div>
                     </div>
                     </div>
                     <div className="space-y-2 group">
                       <label className="text-sm font-bold text-emerald-300 pixelated-text group-hover:text-emerald-200 transition-colors">
                         🏷️ Category
                       </label>
                       <div className="relative">
                       <select
                         value={newExpense.category}
                         onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                           className="w-full bg-slate-800/80 border-2 border-emerald-500/50 text-emerald-100 px-4 py-3 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-800 transition-all duration-300 pixelated-text"
                       >
                         {expenseCategories.map((category) => (
                           <option key={category} value={category}>
                             {category}
                           </option>
                         ))}
                       </select>
                         <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg pointer-events-none"></div>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-2 mb-6">
                     <label className="text-sm font-bold text-blue-300 pixelated-text group-hover:text-blue-200 transition-colors">
                       📝 Description
                     </label>
                     <div className="relative">
                     <input
                       type="text"
                       value={newExpense.description}
                       onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                         className="w-full bg-slate-800/80 border-2 border-blue-500/50 text-blue-100 px-4 py-3 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-800 transition-all duration-300 pixelated-text"
                       placeholder="What was this expense for?"
                     />
                       <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg pointer-events-none"></div>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                     <div className="space-y-2 group">
                       <label className="text-sm font-bold text-yellow-300 pixelated-text group-hover:text-yellow-200 transition-colors">
                         💰 Amount (USD)
                       </label>
                       <div className="relative">
                       <input
                         type="number"
                         value={newExpense.amount}
                         onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                           className="w-full bg-slate-800/80 border-2 border-yellow-500/50 text-yellow-100 px-4 py-3 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/20 focus:bg-slate-800 transition-all duration-300 pixelated-text"
                         placeholder="0.00"
                         step="0.01"
                       />
                         <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg pointer-events-none"></div>
                     </div>
                     </div>
                     <div className="space-y-2 group">
                       <label className="text-sm font-bold text-orange-300 pixelated-text group-hover:text-orange-200 transition-colors">
                         ⚡ Gas Fee (USD)
                       </label>
                       <div className="relative">
                       <input
                         type="number"
                         value={newExpense.gasFee}
                         onChange={(e) => setNewExpense({...newExpense, gasFee: e.target.value})}
                           className="w-full bg-slate-800/80 border-2 border-orange-500/50 text-orange-100 px-4 py-3 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:bg-slate-800 transition-all duration-300 pixelated-text"
                         placeholder="0.00"
                         step="0.01"
                       />
                         <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-lg pointer-events-none"></div>
                     </div>
                     </div>
                     <div className="space-y-2 group">
                       <label className="text-sm font-bold text-purple-300 pixelated-text group-hover:text-purple-200 transition-colors">
                         🔗 Transaction Hash
                       </label>
                       <div className="relative">
                       <input
                         type="text"
                         value={newExpense.transactionHash}
                         onChange={(e) => setNewExpense({...newExpense, transactionHash: e.target.value})}
                           className="w-full bg-slate-800/80 border-2 border-purple-500/50 text-purple-100 px-4 py-3 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:bg-slate-800 transition-all duration-300 pixelated-text"
                         placeholder="0x..."
                       />
                         <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg pointer-events-none"></div>
                       </div>
                     </div>
                   </div>

                   <div className="space-y-2 mb-6">
                     <label className="text-sm font-bold text-cyan-300 pixelated-text group-hover:text-cyan-200 transition-colors">
                       📝 Notes
                     </label>
                     <div className="relative">
                     <textarea
                       value={newExpense.notes}
                       onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                         className="w-full bg-slate-800/80 border-2 border-cyan-500/50 text-cyan-100 px-4 py-3 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 focus:bg-slate-800 transition-all duration-300 pixelated-text"
                       placeholder="Additional notes about this expense..."
                       rows={3}
                     />
                       <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-lg pointer-events-none"></div>
                     </div>
                   </div>

                   <Button
                     onClick={addExpenseEntry}
                     className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 pixelated-text font-bold"
                     disabled={!newExpense.description || !newExpense.amount}
                   >
                     <Plus className="w-5 h-5 mr-2" />
                     Add Expense
                   </Button>
                 </div>

                 {/* Calendar View */}
                 <div className="bg-gradient-to-br from-slate-800/80 to-green-900/30 rounded-xl p-6 border-2 border-green-500/50 shadow-xl shadow-green-500/20">
                   <h3 className="text-green-200 font-bold text-lg mb-6 text-center pixelated-text drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                     📅 Monthly Expense Calendar
                   </h3>
                   <div className="grid grid-cols-7 gap-2 mb-4">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                       <div key={day} className="text-center text-sm font-bold text-green-300 pixelated-text p-2">
                         {day}
                       </div>
                     ))}
                   </div>
                   <div className="grid grid-cols-7 gap-2">
                     {(() => {
                       const today = new Date();
                       const currentMonth = today.getMonth();
                       const currentYear = today.getFullYear();
                       const firstDay = new Date(currentYear, currentMonth, 1);
                       const lastDay = new Date(currentYear, currentMonth + 1, 0);
                       const startDate = new Date(firstDay);
                       startDate.setDate(startDate.getDate() - firstDay.getDay());
                       
                       const days = [];
                       for (let i = 0; i < 42; i++) {
                         const date = new Date(startDate);
                         date.setDate(startDate.getDate() + i);
                         const dateString = date.toISOString().split('T')[0];
                         const dayExpenses = expenseEntries.filter(expense => expense.date === dateString);
                         const totalAmount = dayExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
                         const isCurrentMonth = date.getMonth() === currentMonth;
                         const isToday = dateString === today.toISOString().split('T')[0];
                         
                         days.push(
                           <div
                             key={i}
                             className={`relative p-2 text-center text-sm rounded-lg transition-all duration-300 ${
                               isCurrentMonth 
                                 ? 'text-white' 
                                 : 'text-slate-500'
                             } ${
                               isToday 
                                 ? 'bg-green-500/30 border-2 border-green-400' 
                                 : 'hover:bg-slate-700/50'
                             }`}
                           >
                             <div className="font-bold">{date.getDate()}</div>
                             {totalAmount > 0 && (
                               <div className="text-xs text-green-400 font-bold">
                                 ${totalAmount.toFixed(2)}
                               </div>
                             )}
                             {dayExpenses.length > 0 && (
                               <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                             )}
                           </div>
                         );
                       }
                       return days;
                     })()}
                   </div>
                 </div>

                 <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                   <CardHeader className="text-center">
                     <CardTitle className="text-blue-300 pixelated-text text-2xl">
                       Expense Journal
                     </CardTitle>
                     <p className="text-blue-300/70 pixelated-text">
                       Your complete expense history and tracking
                     </p>
                   </CardHeader>
                   <CardContent>
                     {expenseEntries.length === 0 ? (
                       <div className="text-center py-12">
                         <BookOpen className="w-20 h-20 text-blue-400 mb-4 mx-auto opacity-50" />
                         <h3 className="text-xl font-semibold text-white pixelated-text mb-2">
                           No Expenses Yet
                         </h3>
                         <p className="text-blue-300 text-center mb-6 max-w-md mx-auto">
                           Start tracking your crypto expenses by adding your
                           first expense entry above.
                         </p>
                       </div>
                     ) : (
                       <div className="space-y-4">
                         {expenseEntries.map((expense) => (
                           <div
                             key={expense.id}
                             className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-6 border border-slate-500/30"
                           >
                             <div className="flex items-start justify-between mb-4">
                               <div className="flex items-center gap-4">
                                 <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text px-3 py-1">
                                   {expense.category}
                                 </Badge>
                                 <span className="text-sm text-blue-300 pixelated-text">
                                   {expense.date}
                                 </span>
                               </div>
                               <div className="flex items-center gap-3">
                                 <span className="text-xl font-bold text-green-400 pixelated-text">
                                   ${parseFloat(expense.amount).toFixed(2)}
                                 </span>
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => deleteExpenseEntry(expense.id)}
                                   className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                 >
                                   <X className="w-4 h-4" />
                                 </Button>
                               </div>
                             </div>
                             <div className="mb-4">
                               <h4 className="text-white pixelated-text font-semibold text-lg">
                                 {expense.description}
                               </h4>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                               {expense.gasFee && (
                                 <div className="text-blue-300 pixelated-text bg-slate-600/30 rounded-lg p-3">
                                   <span className="font-semibold">Gas Fee:</span>{" "}
                                   ${parseFloat(expense.gasFee).toFixed(2)}
                                 </div>
                               )}
                               {expense.transactionHash && (
                                 <div className="text-blue-300 pixelated-text font-mono text-xs bg-slate-600/30 rounded-lg p-3">
                                   <span className="font-semibold">TX:</span>{" "}
                                   {expense.transactionHash.slice(0, 10)}...
                                 </div>
                               )}
                               {expense.notes && (
                                 <div className="text-blue-300 pixelated-text italic bg-slate-600/30 rounded-lg p-3">
                                   {expense.notes}
                                 </div>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </div>
             </div>
           )}

           {activeCalculatorTab === "analytics" && (
             <div className="max-w-4xl mx-auto">
               <div className="text-center mb-8">
                 <h2 className="text-2xl font-semibold text-white mb-2">
                   Expense Analytics
                 </h2>
                 <p className="text-slate-400">
                   Comprehensive insights into your spending patterns
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-gradient-to-br from-slate-800/80 to-orange-900/30 rounded-xl p-6 border-2 border-orange-500/50 shadow-xl shadow-orange-500/20">
                   <h4 className="text-orange-200 font-bold mb-4 text-lg pixelated-text drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]">
                     💰 Total Expenses
                   </h4>
                   <div className="text-4xl font-bold text-orange-400 mb-6 pixelated-text drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">
                     ${getTotalExpenses().toFixed(2)}
                   </div>
                   <div className="space-y-3">
                     {expenseCategories.map((category) => {
                       const total = getTotalExpensesByCategory(category);
                       if (total > 0) {
                         return (
                           <div
                             key={category}
                             className="flex justify-between items-center p-3 bg-gradient-to-r from-slate-700/50 to-orange-800/20 rounded-lg border border-orange-500/30 hover:scale-105 transition-all duration-300"
                           >
                             <span className="text-orange-200 font-semibold pixelated-text">{category}</span>
                             <span className="text-white font-bold pixelated-text">
                               ${total.toFixed(2)}
                             </span>
                           </div>
                         );
                       }
                       return null;
                     })}
                   </div>
                 </div>
                 <div className="bg-gradient-to-br from-slate-800/80 to-orange-900/30 rounded-xl p-6 border-2 border-orange-500/50 shadow-xl shadow-orange-500/20">
                   <h4 className="text-orange-200 font-bold mb-4 text-lg pixelated-text drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]">
                     📊 Recent Expenses
                   </h4>
                   <div className="space-y-3">
                     {expenseEntries.slice(0, 5).map((expense) => (
                       <div
                         key={expense.id}
                         className="flex justify-between items-center p-3 bg-gradient-to-r from-slate-700/50 to-orange-800/20 rounded-lg border border-orange-500/30 hover:scale-105 transition-all duration-300"
                       >
                         <div>
                           <span className="text-white font-semibold pixelated-text">
                             {expense.description}
                           </span>
                           <span className="text-orange-300 ml-2 text-sm pixelated-text">
                             ({expense.date})
                           </span>
                         </div>
                         <span className="text-green-400 font-bold pixelated-text">
                           ${parseFloat(expense.amount).toFixed(2)}
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>

               {/* Additional Analytics */}
               <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-gradient-to-br from-slate-800/80 to-red-900/30 rounded-xl p-6 border-2 border-red-500/50 shadow-xl shadow-red-500/20">
                   <h4 className="text-red-200 font-bold mb-4 text-lg pixelated-text drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                     🔥 Monthly Trend
                   </h4>
                   <div className="text-2xl font-bold text-red-400 mb-2 pixelated-text">
                     {(() => {
                       const currentMonth = new Date().getMonth();
                       const currentYear = new Date().getFullYear();
                       const monthExpenses = expenseEntries.filter(expense => {
                         const expenseDate = new Date(expense.date);
                         return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
                       });
                       const total = monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
                       return `$${total.toFixed(2)}`;
                     })()}
                   </div>
                   <div className="text-sm text-red-300 pixelated-text">This Month</div>
                 </div>

                 <div className="bg-gradient-to-br from-slate-800/80 to-purple-900/30 rounded-xl p-6 border-2 border-purple-500/50 shadow-xl shadow-purple-500/20">
                   <h4 className="text-purple-200 font-bold mb-4 text-lg pixelated-text drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                     🎯 Average Daily
                   </h4>
                   <div className="text-2xl font-bold text-purple-400 mb-2 pixelated-text">
                     {(() => {
                       const total = getTotalExpenses();
                       const days = expenseEntries.length > 0 ? Math.max(1, expenseEntries.length) : 1;
                       return `$${(total / days).toFixed(2)}`;
                     })()}
                   </div>
                   <div className="text-sm text-purple-300 pixelated-text">Per Entry</div>
                 </div>

                 <div className="bg-gradient-to-br from-slate-800/80 to-cyan-900/30 rounded-xl p-6 border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20">
                   <h4 className="text-cyan-200 font-bold mb-4 text-lg pixelated-text drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                     ⚡ Gas Fees
                   </h4>
                   <div className="text-2xl font-bold text-cyan-400 mb-2 pixelated-text">
                     {(() => {
                       const totalGas = expenseEntries.reduce((sum, expense) => sum + parseFloat(expense.gasFee || "0"), 0);
                       return `$${totalGas.toFixed(2)}`;
                     })()}
                   </div>
                   <div className="text-sm text-cyan-300 pixelated-text">Total Spent</div>
                 </div>
               </div>
             </div>
           )}
         </div>
       );
     case "stats":
       return (
         <div className="space-y-8">
           {/* Gaming Theme Stats Header */}
           <div className="text-center mb-8">
             <div className="inline-block bg-gradient-to-r from-green-500 to-cyan-500 p-1 rounded-full mb-4">
               <div className="bg-slate-900 px-8 py-3 rounded-full">
                 <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 pixelated-text drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                   📊 STATS DASHBOARD 📊
                 </h1>
               </div>
             </div>
             <p className="text-cyan-300 text-xl font-medium pixelated-text drop-shadow-sm">
               Track your DailyBase journey and progress with gaming precision
             </p>
             <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
               <Button variant="outline" size="sm" className="pixel-button pixel-rounded rgb-fringe">INSERT COIN</Button>
               <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white pixel-rounded flicker">START</Button>
               <Button variant="outline" size="sm" className="pixel-button pixel-rounded">SELECT</Button>
             </div>
           </div>

           {/* Key Metrics */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="text-center p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
               <div className="text-4xl font-bold text-white pixelated-text mb-1">
                 {allPosts.filter(post => post.baseUserId === (baseUserId || address)).length}
               </div>
               <div className="text-sm text-blue-300 pixelated-text">
                 Total Posts
               </div>
             </div>
             <div className="text-center p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
               <div className="text-4xl font-bold text-white pixelated-text mb-1">
                 {Object.values(likeCounts).reduce((sum, count) => sum + count, 0)}
               </div>
               <div className="text-sm text-blue-300 pixelated-text">
                 Total Likes
               </div>
             </div>
             <div className="text-center p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
               <div className="text-4xl font-bold text-white pixelated-text mb-1">
                 {Object.values(commentCounts).reduce((sum, count) => sum + count, 0)}
               </div>
               <div className="text-sm text-blue-300 pixelated-text">
                 Total Comments
               </div>
             </div>
             <div className="text-center p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
               <div className="text-4xl font-bold text-white pixelated-text mb-1">
                 {Object.values(repostCounts).reduce((sum, count) => sum + count, 0)}
               </div>
               <div className="text-sm text-blue-300 pixelated-text">
                 Total Reposts
               </div>
             </div>
           </div>

           {/* Engagement Stats */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-800/30 rounded-lg border border-slate-600/30 p-6">
               <h3 className="text-xl font-semibold text-white pixelated-text mb-4">
                 Engagement Rate
               </h3>
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-blue-300 pixelated-text">Average Likes per Post</span>
                   <span className="text-white pixelated-text font-bold">
                     {(() => {
                       const myPosts = allPosts.filter(post => post.baseUserId === (baseUserId || address));
                       const totalLikes = myPosts.reduce((sum, post) => sum + (likeCounts[post.id] || 0), 0);
                       return myPosts.length > 0 ? (totalLikes / myPosts.length).toFixed(1) : '0';
                     })()}
                   </span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-blue-300 pixelated-text">Average Comments per Post</span>
                   <span className="text-white pixelated-text font-bold">
                     {(() => {
                       const myPosts = allPosts.filter(post => post.baseUserId === (baseUserId || address));
                       const totalComments = myPosts.reduce((sum, post) => sum + (commentCounts[post.id] || 0), 0);
                       return myPosts.length > 0 ? (totalComments / myPosts.length).toFixed(1) : '0';
                     })()}
                   </span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-blue-300 pixelated-text">Most Popular Post</span>
                   <span className="text-white pixelated-text font-bold">
                     {(() => {
                       const myPosts = allPosts.filter(post => post.baseUserId === (baseUserId || address));
                       if (myPosts.length === 0) return 'None';
                       const mostLiked = myPosts.reduce((max, post) => 
                         (likeCounts[post.id] || 0) > (likeCounts[max.id] || 0) ? post : max
                       );
                       return `${likeCounts[mostLiked.id] || 0} likes`;
                     })()}
                   </span>
                 </div>
               </div>
             </div>

             <div className="bg-slate-800/30 rounded-lg border border-slate-600/30 p-6">
               <h3 className="text-xl font-semibold text-white pixelated-text mb-4">
                 Post Activity
               </h3>
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-blue-300 pixelated-text">Active Posts</span>
                   <span className="text-white pixelated-text font-bold">
                     {allPosts.filter(post => post.baseUserId === (baseUserId || address) && !post.archived).length}
                   </span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-blue-300 pixelated-text">Archived Posts</span>
                   <span className="text-white pixelated-text font-bold">
                     {allPosts.filter(post => post.baseUserId === (baseUserId || address) && post.archived).length}
                   </span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-blue-300 pixelated-text">Posts with Tags</span>
                   <span className="text-white pixelated-text font-bold">
                     {allPosts.filter(post => post.baseUserId === (baseUserId || address) && post.tags && post.tags.length > 0).length}
                   </span>
                 </div>
               </div>
             </div>
           </div>

           {/* Recent Posts */}
           <div className="bg-slate-800/30 rounded-lg border border-slate-600/30 p-6">
             <h3 className="text-xl font-semibold text-white pixelated-text mb-4">
               Recent Posts
             </h3>
             {(() => {
               const myPosts = allPosts.filter(post => post.baseUserId === (baseUserId || address)).slice(0, 5);
               if (myPosts.length === 0) {
                 return (
                   <div className="text-center py-8">
                     <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                       <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                       </svg>
                     </div>
                     <p className="text-blue-300 pixelated-text">No posts yet. Start sharing your crypto journey!</p>
                   </div>
                 );
               }
               
               return (
                 <div className="space-y-3">
                   {myPosts.map((post, index) => (
                     <div
                       key={post.id}
                       className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg hover:bg-slate-700/30 transition-all duration-300"
                     >
                       <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                         <span className="text-blue-300 font-bold text-sm">
                           {index + 1}
                         </span>
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="text-white pixelated-text text-sm truncate">
                           {post.journal || "No content"}
                         </div>
                         <div className="flex items-center gap-4 text-xs text-blue-300 pixelated-text mt-1">
                           <span>{new Date(post.dateCreated).toLocaleDateString("en-US", {
                             month: "short",
                             day: "numeric",
                           })}</span>
                           <span>❤️ {likeCounts[post.id] || 0}</span>
                           <span>💬 {commentCounts[post.id] || 0}</span>
                           <span>🔄 {repostCounts[post.id] || 0}</span>
                           {post.archived && (
                             <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 pixelated-text text-xs">
                               ARCHIVED
                             </Badge>
                           )}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               );
             })()}
           </div>

           {/* Monthly Breakdown */}
           <div className="bg-slate-800/30 rounded-lg border border-slate-600/30 p-6">
             <h3 className="text-xl font-semibold text-white pixelated-text mb-4">
               Monthly Activity
             </h3>
             <div className="space-y-3">
               {Array.from({ length: 6 }, (_, i) => {
                 const month = new Date();
                 month.setMonth(month.getMonth() - i);
                 const monthName = month.toLocaleDateString("en-US", {
                   month: "short",
                   year: "numeric"
                 });
                 const monthPosts = allPosts.filter((post) => {
                   const postDate = new Date(post.dateCreated);
                   return (
                     postDate.getMonth() === month.getMonth() &&
                     postDate.getFullYear() === month.getFullYear() &&
                     post.baseUserId === (baseUserId || address)
                   );
                 });

                 return (
                   <div
                     key={i}
                     className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg"
                   >
                     <span className="text-blue-300 pixelated-text">
                       {monthName}
                     </span>
                     <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-blue-300/70">Posts:</span>
                         <span className="text-white pixelated-text text-sm font-bold">
                           {monthPosts.length}
                         </span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="text-xs text-blue-300/70">Likes:</span>
                         <span className="text-white pixelated-text text-sm font-bold">
                           {monthPosts.reduce((sum, post) => sum + (likeCounts[post.id] || 0), 0)}
                         </span>
                       </div>
                       <div className="w-16 bg-slate-600/50 rounded-full h-1">
                         <div
                           className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                           style={{
                             width: `${Math.min(
                               (monthPosts.length / 30) * 100,
                               100
                             )}%`,
                           }}
                         ></div>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         </div>
       );
     case "profile":
       return (
         <div className="max-w-4xl mx-auto space-y-6">
           {/* User Search Section */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <UserSearch 
               onUserSelect={(user) => {
                 setSelectedUser(user);
                 setActiveSidebarItem('home');
               }}
               placeholder="Search for users..."
             />
           </div>
           {/* Game Theme Header */}
           <div className="text-center">
             <h1 className="text-4xl font-bold text-cyan-400 pixelated-text mb-2 animate-pulse">
               PLAYER PROFILE
             </h1>
             <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto rounded-full"></div>
           </div>

           {/* Profile Card - Gaming Style */}
           <Card className="bg-slate-900/80 border-2 border-cyan-500/50 text-white backdrop-blur-sm card-glass relative overflow-hidden">
             {/* Animated Background */}
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 animate-pulse"></div>
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
             
             <CardHeader className="text-center relative z-10">
               {/* Profile Picture - Gaming Style */}
               <div className="relative mx-auto mb-6">
                 <div className="relative">
                   <Avatar className="w-32 h-32 ring-4 ring-cyan-500/50 bg-slate-800 shadow-lg shadow-cyan-500/25">
                     {profileImage ? (
                       <img 
                         src={profileImage} 
                         alt="Profile" 
                         className="w-full h-full object-cover rounded-full"
                       />
                     ) : (
                       <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-4xl font-bold pixelated-text">
                         {user?.address?.slice(2, 4).toUpperCase() || 'DB'}
                       </AvatarFallback>
                     )}
                   </Avatar>
                   
                   {/* Upload Button Overlay - Gaming Style */}
                   <div className="absolute -bottom-2 -right-2">
                     <label htmlFor="profile-image-upload" className="cursor-pointer">
                       <div className="bg-cyan-500 hover:bg-cyan-400 p-2 rounded-full shadow-lg shadow-cyan-500/50 transition-all duration-300 hover:scale-110">
                         {isUploadingImage ? (
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                         ) : (
                           <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                           </svg>
                         )}
                       </div>
                     </label>
                     <input
                       id="profile-image-upload"
                       type="file"
                       accept="image/*"
                       onChange={handleImageUpload}
                       className="hidden"
                     />
                   </div>
                   
                   {/* Remove Image Button - Gaming Style */}
                   {profileImage && isEditingProfile && (
                     <button
                       onClick={removeProfileImage}
                       className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 p-1 rounded-full shadow-lg shadow-red-500/50 transition-all duration-300 hover:scale-110"
                       title="Remove profile image"
                     >
                       <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   )}
                 </div>
               </div>
               
               {/* Player Info - Gaming Style */}
               <CardTitle className="text-cyan-400 pixelated-text text-3xl mb-2 text-shadow-glow">
                 DAILY BASE EXPLORER
               </CardTitle>
               <div className="flex items-center justify-center gap-3 mb-4">
                 <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/50 pixelated-text">
                   <Wallet className="w-3 h-3 mr-1" />
                   {getAddressDisplay(address)}
                 </Badge>
                 {user?.account && (
                   <Badge className="bg-green-500/20 text-green-300 border-green-400/50 pixelated-text">
                     <Shield className="w-3 h-3 mr-1" />
                     BASE ACCOUNT
                   </Badge>
                 )}
               </div>
             </CardHeader>
             
             <CardContent className="space-y-6 relative z-10">
               {/* Stats Grid - Gaming Style */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="text-center p-4 bg-slate-800/50 border border-cyan-500/30 rounded-lg hover:bg-slate-800/70 transition-colors">
                   <div className="text-3xl font-bold text-cyan-400 pixelated-text mb-1">{entries.length}</div>
                   <div className="text-sm text-cyan-300 pixelated-text">TOTAL ENTRIES</div>
                 </div>
                 <div className="text-center p-4 bg-slate-800/50 border border-purple-500/30 rounded-lg hover:bg-slate-800/70 transition-colors">
                   <div className="text-3xl font-bold text-purple-400 pixelated-text mb-1">
                     {entries.length > 0 ? Math.max(...entries.map((_, i) => i + 1)) : 0}
                   </div>
                   <div className="text-sm text-purple-300 pixelated-text">STREAK</div>
                 </div>
               </div>

               {/* Account Details - Gaming Style */}
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-cyan-500/30 rounded-lg hover:bg-slate-800/70 transition-colors">
                   <div className="flex items-center gap-3">
                     <Wallet className="w-5 h-5 text-cyan-400" />
                     <div>
                       <p className="text-cyan-300 pixelated-text font-semibold">WALLET ADDRESS</p>
                       <p className="text-slate-300 pixelated-text text-sm">{getAddressDisplay(address)}</p>
                     </div>
                   </div>
                   <Button
                     onClick={copyAddress}
                     variant="ghost"
                     size="sm"
                     className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                   >
                     {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </Button>
                 </div>
                 
                 {baseUserId && (
                   <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-green-500/30 rounded-lg hover:bg-slate-800/70 transition-colors">
                     <div className="flex items-center gap-3">
                       <Shield className="w-5 h-5 text-green-400" />
                       <div>
                         <p className="text-green-300 pixelated-text font-semibold">BASE ACCOUNT</p>
                         <p className="text-slate-300 pixelated-text text-sm">{baseUserId.slice(0, 8)}...</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <Badge className="bg-green-500/20 text-green-300 border-green-400/50 pixelated-text">
                         ACTIVE
                       </Badge>
                       <Button
                         onClick={() => setIsUserSwitcherOpen(true)}
                         size="sm"
                         variant="outline"
                         className="bg-blue-500/20 border-blue-500 text-blue-300 hover:bg-blue-500/30 pixelated-text text-xs"
                       >
                         Switch User
                       </Button>
                     </div>
                   </div>
                 )}
               </div>

               {/* Action Buttons - Gaming Style */}
               <div className="flex gap-4 pt-4">
                 <Button
                   onClick={() => setIsEditingProfile(!isEditingProfile)}
                   variant="outline"
                   className={`flex-1 pixelated-text font-semibold transition-all duration-300 hover:scale-105 ${
                     isEditingProfile 
                       ? 'bg-green-500/20 border-green-500 text-green-300 hover:bg-green-500/30' 
                       : 'bg-cyan-500/20 border-cyan-500 text-cyan-300 hover:bg-cyan-500/30'
                   }`}
                 >
                   {isEditingProfile ? (
                     <>
                       <Check className="w-4 h-4 mr-2" />
                       SAVE PROFILE
                     </>
                   ) : (
                     <>
                       <User className="w-4 h-4 mr-2" />
                       EDIT PROFILE
                     </>
                   )}
                 </Button>
                 <Button
                   onClick={() => {
                     if (confirm('Are you sure you want to disconnect your wallet?')) {
                       localStorage.removeItem(`dailybase-entries-${address}`)
                       if (baseUserId) {
                         localStorage.removeItem(`dailybase-entries-${baseUserId}`)
                       }
                       if (typeof window !== 'undefined' && (window as any).enhancedLogout) {
                         (window as any).enhancedLogout()
                       } else {
                         window.location.reload()
                       }
                     }
                   }}
                   variant="outline"
                   className="flex-1 bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30 pixelated-text font-semibold transition-all duration-300 hover:scale-105"
                 >
                   <LogOut className="w-4 h-4 mr-2" />
                   DISCONNECT
                 </Button>
               </div>
             </CardContent>
           </Card>
         </div>
       );

     case "streak":
       return (
         <div className="space-y-6">
           <div className="text-center mb-6">
             <h1 className="text-3xl font-bold text-white pixelated-text mb-2">
               Streak & Achievements
             </h1>
             <p className="text-blue-300 pixelated-text">
               Track your progress and unlock achievements
             </p>
             <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
               <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white pixel-rounded flicker">START</Button>
               <Button variant="outline" size="sm" className="pixel-button pixel-rounded">SELECT</Button>
               <Button variant="outline" size="sm" className="pixel-button pixel-rounded">Ⓐ Ⓑ</Button>
             </div>
           </div>
           
           <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
             <CardHeader>
               <CardTitle className="text-blue-300 flex items-center gap-2 pixelated-text">
                 <Flame className="w-5 h-5" />
                 Current Streak
               </CardTitle>
             </CardHeader>
             <CardContent>
               <StreakTracker entries={entries} />
             </CardContent>
           </Card>
           

         </div>
       );

     case "notifications":
       return (
         <div className="space-y-6">
           {/* Notifications Header */}
           <div className="text-center mb-6">
             <h1 className="text-3xl font-bold text-green-100 pixelated-text mb-2">
               Notifications
             </h1>
             <p className="text-green-300/80 pixelated-text">
               Stay updated with your crypto activities
             </p>
           </div>

           {/* Notifications List */}
           <div className="space-y-4">
             {notificationsLoading ? (
               <div className="text-center py-16">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-3"></div>
                 <p className="font-mono text-sm text-green-300 pixelated-text">
                   Loading notifications...
                 </p>
               </div>
             ) : notifications.length === 0 ? (
               <Card className="bg-gradient-to-br from-gray-800/90 via-gray-700/80 to-gray-800/90 border-2 border-green-500/50 text-white backdrop-blur-xl shadow-lg gaming-glow">
               <CardContent className="flex flex-col items-center justify-center py-16">
                   <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 gaming-glow">
                   <Bell className="w-12 h-12 text-white" />
                 </div>
                   <h3 className="text-2xl font-bold text-green-100 pixelated-text mb-3">
                   No notifications yet
                 </h3>
                   <p className="text-green-300/80 text-center mb-8 max-w-md leading-relaxed pixelated-text">
                   When you get likes, comments, reposts, or other interactions, they'll appear here.
                 </p>
                   <Button 
                     onClick={() => setActiveSidebarItem("home")}
                     className="bg-gradient-to-r from-green-500 to-green-600 text-white pixelated-text px-6 py-3 text-lg hover:shadow-lg hover:shadow-green-500/25 gaming-glow"
                   >
                     <Home className="w-5 h-5 mr-2" />
                     Go to Feed
                   </Button>
               </CardContent>
             </Card>
             ) : (
               <>
                 <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-2">
                     <h2 className="text-xl font-bold text-green-100 pixelated-text">
                       Recent Activity ({notifications.length})
                     </h2>
                     <div className={`w-2 h-2 rounded-full ${notificationsLoading ? 'bg-yellow-400' : 'bg-green-400'} gaming-glow`}></div>
                     <span className="text-xs text-green-300 pixelated-text">
                       {notificationsLoading ? 'Loading' : 'Live'}
                     </span>
                   </div>
                   <div className="flex gap-2">
                     <Button 
                       onClick={markAllAsRead}
                       variant="outline"
                       size="sm"
                       className="text-green-400 hover:text-green-300 hover:bg-green-900/30 border-green-500/50 pixelated-text"
                     >
                       Mark All Read
                     </Button>
                   </div>
           </div>

                 <div className="space-y-3">
                 {notifications.map((notification) => (
                     <Card key={notification.id} className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30 hover:border-green-500/50 transition-all duration-300">
                       <CardContent className="p-4">
                         <div className="flex items-start space-x-3">
                           <div className={`text-2xl ${getNotificationColor(notification.type)}`}>
                             {getNotificationIcon(notification.type)}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center space-x-2 mb-1">
                               <h4 className="font-mono font-bold text-sm text-green-100 pixelated-text truncate">
                                 {notification.title}
                               </h4>
                               {!notification.isRead && (
                                 <div className="w-2 h-2 bg-green-400 rounded-full" />
                               )}
                             </div>
                             <div className="font-mono text-sm text-green-300 leading-relaxed mb-2">
                               {notification.message}
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="font-mono text-xs text-green-400">
                                 {notification.senderId ? 
                                   `${notification.senderId.slice(0, 6)}...` : 
                                   'System'
                                 }
                               </span>
                               <span className="font-mono text-xs text-green-400/70">
                                 {formatTimeAgo(notification.dateCreated)}
                               </span>
                             </div>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </>
             )}
           </div>
         </div>
       );

     case "profile":
       return (
         <div className="space-y-6">
           <UserProfile
             user={{
               id: address,
               address: address,
               displayName: user?.address ? `CryptoUser_${user.address.slice(0, 6)}` : `CryptoUser_${address.slice(0, 6)}`,
               bio: "Crypto enthusiast and blockchain explorer",
               avatar: profileImage || undefined,
               location: "",
               website: "",
               joinedDate: new Date(),
               isVerified: false
             }}
             stats={{
               posts: userStats.posts,
               followers: userStats.followers,
               following: userStats.following,
               likes: userStats.totalLikes,
               comments: userStats.totalComments,
               reposts: userStats.totalReposts,
               streak: userStats.streak,
               level: userStats.level,
               xp: userStats.experience,
               nextLevelXp: 100
             }}
             achievements={userAchievements}
             isOwnProfile={true}
             onEdit={() => {
               toast({
          title: "Info",
          description: "Edit profile functionality coming soon!"
        });
             }}
             onFollow={() => {
               toast({
          title: "Info",
          description: "Follow functionality coming soon!"
        });
             }}
           />
           
           {/* My Posts Section */}
           <Card className="bg-white/8 border-white/20 text-white backdrop-blur-3xl card-glass shadow-2xl shadow-blue-400/30 border-opacity-30 hover:bg-white/12 hover:border-white/30 transition-all duration-500">
             <CardHeader>
               <CardTitle className="text-blue-100 pixelated-text">
                 My Posts
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {(() => {
                 const myPosts = allPosts.filter(post => 
                   post.baseUserId === (baseUserId || address)
                 );
                 
                 if (myPosts.length === 0) {
                   return (
                     <div className="text-center py-8">
                       <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                         <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                         </svg>
                       </div>
                       <h3 className="text-lg font-semibold text-white pixelated-text mb-2">
                         No Posts Yet
                       </h3>
                       <p className="text-blue-300/70 pixelated-text text-sm mb-4">
                         Start sharing your crypto journey by creating your first post!
                       </p>
                       <Button
                         onClick={() => setActiveSidebarItem('home')}
                         className="bg-blue-500 hover:bg-blue-600 text-white pixelated-text"
                       >
                         Create Post
                       </Button>
                     </div>
                   );
                 }
                 
                 const activePosts = myPosts.filter(post => !post.archived);
                 const archivedPosts = myPosts.filter(post => post.archived);
                 
                 return (
                   <div className="space-y-6">
                     {/* Active Posts */}
                     <div>
                       <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-semibold text-white pixelated-text">
                           Active Posts ({activePosts.length})
                         </h3>
                       </div>
                       <div className="space-y-3">
                         {activePosts.map((post) => (
                           <div key={post.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-green-500/50 transition-all duration-300">
                             <div className="flex items-start justify-between">
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-2">
                                   <Badge className="bg-green-500/20 text-green-300 border-green-400/30 pixelated-text text-xs">
                                     ACTIVE
                                   </Badge>
                                   <span className="text-xs text-blue-300/70 pixelated-text">
                                     {new Date(post.dateCreated).toLocaleDateString()}
                                   </span>
                                 </div>
                                 <p className="text-white pixelated-text text-sm mb-2 line-clamp-2">
                                   {post.journal || "No content"}
                                 </p>
                                 {post.tags && post.tags.length > 0 && (
                                   <div className="flex flex-wrap gap-1 mb-2">
                                     {post.tags.slice(0, 3).map((tag, index) => (
                                       <span key={index} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded pixelated-text">
                                         #{tag}
                                       </span>
                                     ))}
                                     {post.tags.length > 3 && (
                                       <span className="text-xs text-green-300/50 pixelated-text">
                                         +{post.tags.length - 3} more
                                       </span>
                                     )}
                                   </div>
                                 )}
                               </div>
                               <div className="flex gap-2 ml-4">
                                 <Button
                                   onClick={() => handleArchivePost(post.id)}
                                   size="sm"
                                   variant="outline"
                                   className="bg-yellow-500/20 border-yellow-400 text-yellow-300 pixelated-text hover:bg-yellow-500/30"
                                   title="Archive post"
                                 >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                   </svg>
                                 </Button>
                                 <Button
                                   onClick={() => handleDeletePost(post.id)}
                                   size="sm"
                                   variant="outline"
                                   className="bg-red-500/20 border-red-400 text-red-300 pixelated-text hover:bg-red-500/30"
                                   title="Delete post"
                                 >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                   </svg>
                                 </Button>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                     
                     {/* Archived Posts */}
                     {archivedPosts.length > 0 && (
                       <div>
                         <div className="flex items-center justify-between mb-4">
                           <h3 className="text-lg font-semibold text-white pixelated-text">
                             Archived Posts ({archivedPosts.length})
                           </h3>
                           <Button
                             onClick={() => setActiveSidebarItem('settings')}
                             size="sm"
                             variant="outline"
                             className="bg-blue-500/20 border-blue-400 text-blue-300 pixelated-text hover:bg-blue-500/30"
                           >
                             Manage All
                           </Button>
                         </div>
                         <div className="space-y-3">
                           {archivedPosts.slice(0, 3).map((post) => (
                             <div key={post.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-yellow-500/50 transition-all duration-300 opacity-60">
                               <div className="flex items-start justify-between">
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-2 mb-2">
                                     <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 pixelated-text text-xs">
                                       ARCHIVED
                                     </Badge>
                                     <span className="text-xs text-blue-300/70 pixelated-text">
                                       {new Date(post.dateCreated).toLocaleDateString()}
                                     </span>
                                   </div>
                                   <p className="text-white pixelated-text text-sm mb-2 line-clamp-2">
                                     {post.journal || "No content"}
                                   </p>
                                 </div>
                                 <div className="flex gap-2 ml-4">
                                   <Button
                                     onClick={() => handleArchivePost(post.id)}
                                     size="sm"
                                     variant="outline"
                                     className="bg-green-500/20 border-green-400 text-green-300 pixelated-text hover:bg-green-500/30"
                                     title="Restore post"
                                   >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                     </svg>
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           ))}
                           {archivedPosts.length > 3 && (
                             <div className="text-center py-4">
                               <p className="text-blue-300/70 pixelated-text text-sm">
                                 +{archivedPosts.length - 3} more archived posts
                               </p>
                               <Button
                                 onClick={() => setActiveSidebarItem('settings')}
                                 size="sm"
                                 variant="outline"
                                 className="mt-2 bg-blue-500/20 border-blue-400 text-blue-300 pixelated-text hover:bg-blue-500/30"
                               >
                                 View All Archived
                               </Button>
                             </div>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                 );
               })()}
             </CardContent>
           </Card>
         </div>
       );



     case "settings":
       return (
         <div className="space-y-6">
           {/* Post Modal */}
           <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
             <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-purple-500/30 text-green-100">
               <DialogHeader>
                 <DialogTitle className="pixelated-text text-green-100">Post Preview</DialogTitle>
               </DialogHeader>
               {selectedPost ? (
                 <div className="mt-2">
                   <TVPostContainer>
                     <PostHeader
                       user={{
                         address: selectedPost.baseUserId,
                         name: `User_${selectedPost.baseUserId.slice(0,6)}`
                       }}
                       date={new Date(selectedPost.dateCreated)}
                       privacy={selectedPost.privacy}
                     />
                     <PostContent
                       content={selectedPost.journal}
                       photos={selectedPost.photos}
                     />
                     <PostTags tags={selectedPost.tags || []} />
                     <PostActions
                       likes={likeCounts[selectedPost.id] || selectedPost.likes || 0}
                       comments={commentCounts[selectedPost.id] || 0}
                       reposts={repostCounts[selectedPost.id] || 0}
                       isLiked={!!userLikes[selectedPost.id]}
                       loadingLikes={!!loadingLikes[selectedPost.id]}
                       isOwner={selectedPost.baseUserId === address}
                       onLike={() => handleLike(selectedPost.id)}
                       onComment={() => {}}
                       onRepost={() => {}}
                     />
                   </TVPostContainer>
                 </div>
               ) : (
                 <div className="text-green-200">Post not found.</div>
               )}
             </DialogContent>
           </Dialog>
           {/* Settings Header */}
           <div className="text-center mb-6">
             <h1 className="text-3xl font-bold text-white pixelated-text mb-2">
               Settings
             </h1>
             <p className="text-blue-300 pixelated-text">
               Manage your account and preferences
             </p>
           </div>

           {/* Notification Preferences */}
           <Card className="bg-white/8 border-white/20 text-white backdrop-blur-3xl card-glass shadow-2xl shadow-blue-400/30 border-opacity-30 hover:bg-white/12 hover:border-white/30 transition-all duration-500">
             <CardHeader>
               <CardTitle className="text-blue-100 pixelated-text">
                 Notification Preferences
               </CardTitle>
             </CardHeader>
             <CardContent>
                 <p className="text-blue-300 pixelated-text">
                 Notification preferences will be available soon.
                 </p>
             </CardContent>
           </Card>

           {/* Account Settings */}
           <Card className="bg-white/8 border-white/20 text-white backdrop-blur-3xl card-glass shadow-2xl shadow-blue-400/30 border-opacity-30 hover:bg-white/12 hover:border-white/30 transition-all duration-500">
             <CardHeader>
               <CardTitle className="text-blue-100 pixelated-text">
                 Account Settings
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                                                                                                                                   <div className="flex items-center justify-between p-4 bg-white/8 rounded-lg border border-white/20 backdrop-blur-xl shadow-md shadow-blue-400/15">
                 <div>
                   <h3 className="text-white pixelated-text font-semibold">
                     Wallet Address
                   </h3>
                   <p className="text-blue-100 pixelated-text text-sm">
                     {getAddressDisplay(address)}
                   </p>
                 </div>
                 <Button
                   onClick={copyAddress}
                   variant="outline"
                   size="sm"
                   className="bg-blue-500/40 border-blue-300 text-blue-50 pixelated-text hover:bg-blue-500/60"
                 >
                   {copied ? (
                     <Check className="w-4 h-4" />
                   ) : (
                     <Copy className="w-4 h-4" />
                   )}
                 </Button>
               </div>

               <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                 <div>
                   <h3 className="text-white pixelated-text font-semibold">
                     Base Account
                   </h3>
                   <p className="text-blue-300 pixelated-text text-sm">
                     Connected
                   </p>
                 </div>
                 <Badge className="bg-green-500/20 text-green-300 border-green-400/30 pixelated-text">
                   Active
                 </Badge>
               </div>
             </CardContent>
           </Card>

           {/* Data Management */}
           <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
             <CardHeader>
               <CardTitle className="text-blue-300 pixelated-text">
                 Data Management
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                 <div>
                   <h3 className="text-white pixelated-text font-semibold">
                     Export Data
                   </h3>
                   <p className="text-blue-300 pixelated-text text-sm">
                     Download your entries as JSON
                   </p>
                 </div>
                 <Button
                   onClick={exportData}
                   variant="outline"
                   size="sm"
                   className="bg-slate-700 border-slate-600 text-white pixelated-text"
                 >
                   Export
                 </Button>
               </div>

               <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                 <div>
                   <h3 className="text-white pixelated-text font-semibold">
                     Clear All Data
                   </h3>
                   <p className="text-blue-300 pixelated-text text-sm">
                     Remove all entries (irreversible)
                   </p>
                 </div>
                 <Button
                   onClick={clearData}
                   variant="outline"
                   size="sm"
                   className="bg-red-600/20 border-red-500 text-red-300 pixelated-text hover:bg-red-600/30"
                 >
                   Clear
                 </Button>
               </div>
             </CardContent>
           </Card>



           {/* Preferences */}
           <Card className="bg-white/8 border-white/20 text-white backdrop-blur-3xl card-glass shadow-2xl shadow-blue-400/30 border-opacity-30 hover:bg-white/12 hover:border-white/30 transition-all duration-500">
             <CardHeader>
               <CardTitle className="text-blue-100 pixelated-text">
                 Preferences
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                 <div>
                   <h3 className="text-white pixelated-text font-semibold">
                     Notifications
                   </h3>
                   <p className="text-blue-300 pixelated-text text-sm">
                     Daily reminders
                   </p>
                 </div>
                 <Button
                   variant="outline"
                   size="sm"
                   className="bg-blue-500/40 border-blue-300 text-blue-50 pixelated-text"
                 >
                   Enabled
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* About */}
           <Card className="bg-white/8 border-white/20 text-white backdrop-blur-3xl card-glass shadow-2xl shadow-blue-400/30 border-opacity-30 hover:bg-white/12 hover:border-white/30 transition-all duration-500">
             <CardHeader>
               <CardTitle className="text-blue-100 pixelated-text">
                 About DailyBase
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-center py-4">
                 <img
                   src="/db-removebg.png"
                   alt="DailyBase Logo"
                   className="w-16 h-16 object-contain mx-auto mb-4"
                 />
                 <h3 className="text-xl font-semibold text-white pixelated-text mb-2">
                   DailyBase
                 </h3>
                 <p className="text-blue-100 pixelated-text mb-4">
                   Your personal crypto journal
                 </p>
                 <p className="text-sm text-blue-100/80 pixelated-text">
                   Version 1.0.0
                 </p>
               </div>
             </CardContent>
           </Card>

           {/* My Posts Section */}
           <Card className="bg-white/8 border-white/20 text-white backdrop-blur-3xl card-glass shadow-2xl shadow-blue-400/30 border-opacity-30 hover:bg-white/12 hover:border-white/30 transition-all duration-500">
             <CardHeader>
               <CardTitle className="text-blue-100 pixelated-text">
                 My Posts
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               {(() => {
                 const myPosts = allPosts.filter(post => 
                   post.baseUserId === (baseUserId || address)
                 );
                 
                 if (myPosts.length === 0) {
                   return (
                     <div className="text-center py-8">
                       <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                         <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                         </svg>
                       </div>
                       <h3 className="text-lg font-semibold text-white pixelated-text mb-2">
                         No Posts Yet
                       </h3>
                       <p className="text-blue-300/70 pixelated-text text-sm mb-4">
                         Start sharing your crypto journey by creating your first post!
                       </p>
                       <Button
                         onClick={() => setActiveSidebarItem('home')}
                         className="bg-blue-500 hover:bg-blue-600 text-white pixelated-text"
                       >
                         Create Post
                       </Button>
                     </div>
                   );
                 }
                 
                 const activePosts = myPosts.filter(post => !post.archived);
                 const archivedPosts = myPosts.filter(post => post.archived);
                 
                 return (
                   <div className="space-y-6">
                     {/* Active Posts */}
                     <div>
                       <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-semibold text-white pixelated-text">
                           Active Posts ({activePosts.length})
                         </h3>
                       </div>
                       <div className="space-y-3">
                         {activePosts.map((post) => (
                           <div key={post.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-green-500/50 transition-all duration-300">
                             <div className="flex items-start justify-between">
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 mb-2">
                                   <Badge className="bg-green-500/20 text-green-300 border-green-400/30 pixelated-text text-xs">
                                     ACTIVE
                                   </Badge>
                                   <span className="text-xs text-blue-300/70 pixelated-text">
                                     {new Date(post.dateCreated).toLocaleDateString()}
                                   </span>
                                 </div>
                                 <p className="text-white pixelated-text text-sm mb-2 line-clamp-2">
                                   {post.journal || "No content"}
                                 </p>
                                 {post.tags && post.tags.length > 0 && (
                                   <div className="flex flex-wrap gap-1 mb-2">
                                     {post.tags.slice(0, 3).map((tag, index) => (
                                       <span key={index} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded pixelated-text">
                                         #{tag}
                                       </span>
                                     ))}
                                     {post.tags.length > 3 && (
                                       <span className="text-xs text-green-300/50 pixelated-text">
                                         +{post.tags.length - 3} more
                                       </span>
                                     )}
                                   </div>
                                 )}
                               </div>
                               <div className="flex gap-2 ml-4">
                                 <Button
                                   onClick={() => handleArchivePost(post.id)}
                                   size="sm"
                                   variant="outline"
                                   className="bg-yellow-500/20 border-yellow-400 text-yellow-300 pixelated-text hover:bg-yellow-500/30"
                                   title="Archive post"
                                 >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                   </svg>
                                 </Button>
                                 <Button
                                   onClick={() => handleDeletePost(post.id)}
                                   size="sm"
                                   variant="outline"
                                   className="bg-red-500/20 border-red-400 text-red-300 pixelated-text hover:bg-red-500/30"
                                   title="Delete post"
                                 >
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                   </svg>
                                 </Button>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                     
                     {/* Archived Posts */}
                     {archivedPosts.length > 0 && (
                       <div>
                         <div className="flex items-center justify-between mb-4">
                           <h3 className="text-lg font-semibold text-white pixelated-text">
                             Archived Posts ({archivedPosts.length})
                           </h3>
                           <Button
                             onClick={() => setActiveSidebarItem('settings')}
                             size="sm"
                             variant="outline"
                             className="bg-blue-500/20 border-blue-400 text-blue-300 pixelated-text hover:bg-blue-500/30"
                           >
                             Manage All
                           </Button>
                         </div>
                         <div className="space-y-3">
                           {archivedPosts.slice(0, 3).map((post) => (
                             <div key={post.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-yellow-500/50 transition-all duration-300 opacity-60">
                               <div className="flex items-start justify-between">
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-2 mb-2">
                                     <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 pixelated-text text-xs">
                                       ARCHIVED
                                     </Badge>
                                     <span className="text-xs text-blue-300/70 pixelated-text">
                                       {new Date(post.dateCreated).toLocaleDateString()}
                                     </span>
                                   </div>
                                   <p className="text-white pixelated-text text-sm mb-2 line-clamp-2">
                                     {post.journal || "No content"}
                                   </p>
                                 </div>
                                 <div className="flex gap-2 ml-4">
                                   <Button
                                     onClick={() => handleArchivePost(post.id)}
                                     size="sm"
                                     variant="outline"
                                     className="bg-green-500/20 border-green-400 text-green-300 pixelated-text hover:bg-green-500/30"
                                     title="Restore post"
                                   >
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                     </svg>
                                   </Button>
                                 </div>
                               </div>
                             </div>
                           ))}
                           {archivedPosts.length > 3 && (
                             <div className="text-center py-4">
                               <p className="text-blue-300/70 pixelated-text text-sm">
                                 +{archivedPosts.length - 3} more archived posts
                               </p>
                               <Button
                                 onClick={() => setActiveSidebarItem('settings')}
                                 size="sm"
                                 variant="outline"
                                 className="mt-2 bg-blue-500/20 border-blue-400 text-blue-300 pixelated-text hover:bg-blue-500/30"
                               >
                                 View All Archived
                               </Button>
                             </div>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                 );
               })()}
             </CardContent>
           </Card>
         </div>
       );

     default:
       return (
         <div className="text-center py-12">
           <h2 className="text-2xl font-bold text-white pixelated-text mb-4">
             Coming Soon
           </h2>
           <p className="text-blue-300 pixelated-text">
             This feature is under development.
           </p>
         </div>
       );
   }
 };

 return (
   <div className="min-h-screen bg-blue-400 relative overflow-hidden">
     <style jsx>{`
       @keyframes driveWithShake {
         0% { transform: translateX(-100px) translateY(0px); }
         10% { transform: translateX(10%) translateY(1px); }
         20% { transform: translateX(20%) translateY(-1px); }
         30% { transform: translateX(30%) translateY(1px); }
         40% { transform: translateX(40%) translateY(-1px); }
         50% { transform: translateX(50%) translateY(1px); }
         60% { transform: translateX(60%) translateY(-1px); }
         70% { transform: translateX(70%) translateY(1px); }
         80% { transform: translateX(80%) translateY(-1px); }
         90% { transform: translateX(90%) translateY(1px); }
         100% { transform: translateX(calc(100vw + 100px)) translateY(0px); }
       }
     `}</style>

     {/* Gaming Theme Background */}
     <div data-gaming-bg>
       {renderThemeBackground()}
     </div>

     {/* Enhanced Toast Notifications with responsive positioning */}
     {toasts.map((toast) => (
       <div
         key={toast.id}
         className={`fixed z-50 p-responsive-sm rounded-lg shadow-responsive-lg transition-all duration-300 ${
           toast.title === "Error" 
             ? "bg-red-500 text-white" 
             : toast.title === "Success"
             ? "bg-green-500 text-white"
             : "bg-blue-500 text-white"
         } ${
           // Responsive positioning
           'top-4 right-4 left-4 sm:left-auto sm:right-4 sm:max-w-sm lg:max-w-md'
         }`}
       >
         <div className="flex items-center justify-between">
           <div className="flex-1 min-w-0">
             <div className="font-semibold text-responsive-sm">{toast.title}</div>
             <div className="text-responsive-xs opacity-90 mt-1">{toast.description}</div>
           </div>
           <button
             onClick={() => dismiss(toast.id)}
             className="ml-3 text-white hover:text-gray-200 touch-friendly flex-shrink-0"
           >
             <X className="w-4 h-4 sm:w-5 sm:h-5" />
           </button>
         </div>
       </div>
     ))}



     {/* Enhanced Responsive Sidebar with Gaming Theme */}
     <ResponsiveSidebar
       items={sidebarItems}
       activeItem={activeSidebarItem}
       onItemClick={(id: string) => setActiveSidebarItem(id as SidebarItem)}
       userAddress={address}
       isOpen={sidebarOpen}
       onOpenChange={setSidebarOpen}
       className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-green-500/40 shadow-lg shadow-green-500/20"
     />

     {/* Enhanced Main Content Area with responsive padding */}
     <div className="lg:pl-72 xl:pl-80 2xl:pl-80">
       {/* Header hidden on main feed */}

       {/* Gaming-style Content Container */}
       <div className="max-w-2xl mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8">
         {/* User ID Display and Notifications */}
         {baseUserId && (
           <div className="mb-4 p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg backdrop-blur-sm">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <User className="w-4 h-4 text-green-400" />
                 <span className="text-green-300 text-sm font-semibold">Current User ID:</span>
                 <span className="text-green-100 font-mono text-sm">
                   {baseUserId.slice(0, 12)}...{baseUserId.slice(-8)}
                 </span>
               </div>
               <div className="flex items-center gap-2">
                 <SimpleNotificationDropdown
                   notifications={notifications}
                   unreadCount={unreadCount}
                   isLoading={notificationsLoading}
                   onMarkAsRead={markAsRead}
                   onMarkAllAsRead={markAllAsRead}
                   onNotificationClick={(notification) => {
                     console.log('Notification clicked:', notification);
                     // Handle notification click - could navigate to post, profile, etc.
                   }}
                 />

                 <Button
                   onClick={() => setIsUserSwitcherOpen(true)}
                   size="sm"
                   variant="outline"
                   className="bg-blue-500/20 border-blue-500 text-blue-300 hover:bg-blue-500/30 text-xs"
                 >
                   Switch
                 </Button>
                 <Button
                   onClick={() => {
                     const currentBg = document.querySelector('[data-gaming-bg]');
                     if (currentBg) {
                       currentBg.classList.toggle('hidden');
                     }
                   }}
                   size="sm"
                   variant="outline"
                   className="bg-green-500/20 border-green-500 text-green-300 hover:bg-green-500/30 text-xs"
                   title="Toggle Gaming Background"
                 >
                   🎮
                 </Button>
               </div>
             </div>
           </div>
         )}
         
         <div className="space-y-3 sm:space-y-4">
           {recentlyDeletedPost && (
             <div className="mb-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between">
               <span className="text-red-200 text-sm">Post deleted. Undo?</span>
               <Button size="sm" variant="outline" className="text-red-200 border-red-400/50" onClick={undoDelete}>Undo</Button>
             </div>
           )}
           {renderContent()}
         </div>
       </div>
     </div>
     
     {/* Enhanced User Registration Modal */}
     <UserRegistrationModal
       isOpen={showRegistrationModal}
       onClose={() => setShowRegistrationModal(false)}
       walletAddress={address}
     />

     {/* User Switcher Modal */}
     <Dialog open={isUserSwitcherOpen} onOpenChange={setIsUserSwitcherOpen}>
       <DialogContent className="max-w-md bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-purple-500/30 text-green-100">
         <DialogHeader>
           <DialogTitle className="pixelated-text text-green-100">Switch User</DialogTitle>
         </DialogHeader>
         <div className="space-y-4">
           {/* Current User Display */}
           <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
             <p className="text-sm text-green-300 mb-1">Current User:</p>
             <p className="text-green-100 font-mono text-sm break-all">
               {baseUserId || address}
             </p>
           </div>
           
           {/* Available Users */}
           <div>
             <p className="text-sm text-green-300 mb-2">Available Users:</p>
             <div className="space-y-2 max-h-40 overflow-y-auto">
               {availableUsers.map((userId, index) => (
                 <div
                   key={index}
                   className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-600/30 hover:bg-gray-700/50 cursor-pointer"
                   onClick={() => switchToUser(userId)}
                 >
                   <span className="text-green-100 font-mono text-sm">
                     {userId.slice(0, 8)}...{userId.slice(-6)}
                   </span>
                   <Button
                     size="sm"
                     variant="ghost"
                     className="text-green-400 hover:text-green-300"
                   >
                     Switch
                   </Button>
                 </div>
               ))}
             </div>
           </div>
           
           {/* Add New User */}
           <div className="space-y-2">
             <p className="text-sm text-green-300">Add New User:</p>
             <div className="flex gap-2">
               <input
                 type="text"
                 value={customBaseUserId}
                 onChange={(e) => setCustomBaseUserId(e.target.value)}
                 placeholder="Enter user ID..."
                 className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded text-green-100 placeholder-green-300/50 focus:outline-none focus:border-green-500/50"
               />
               <Button
                 onClick={addNewUser}
                 disabled={!customBaseUserId.trim()}
                 className="bg-green-600 hover:bg-green-700 text-white"
               >
                 Add
               </Button>
             </div>
           </div>
         </div>
       </DialogContent>
     </Dialog>

     {/* Reply Modal */}
     <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
       <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-purple-500/30 text-green-100">
         <DialogHeader>
           <DialogTitle className="pixelated-text text-green-100">
             Reply to Comment
           </DialogTitle>
         </DialogHeader>
         {replyToComment && (
           <div className="space-y-4">
             {/* Original Comment */}
             <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600/30">
               <p className="text-sm text-green-300 mb-1">Replying to:</p>
               <p className="text-green-100 text-sm">
                 <span className="font-mono">@{replyToComment.baseUserId.slice(0, 6)}</span>
                 {replyToComment.commentText && (
                   <span className="ml-2 text-gray-300">"{replyToComment.commentText}"</span>
                 )}
               </p>
             </div>
             
             {/* Reply Input */}
             <div className="space-y-2">
               <label className="text-sm text-green-300">Your Reply:</label>
               <textarea
                 value={replyContent}
                 onChange={(e) => setReplyContent(e.target.value)}
                 placeholder="Write your reply..."
                 rows={4}
                 className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded text-green-100 placeholder-green-300/50 focus:outline-none focus:border-green-500/50 resize-none"
                 maxLength={500}
               />
               <div className="flex justify-between items-center">
                 <span className="text-xs text-gray-400">
                   {replyContent.length}/500
                 </span>
                 <div className="flex gap-2">
                   <Button
                     variant="outline"
                     onClick={() => setIsReplyModalOpen(false)}
                     className="border-gray-600/30 text-gray-300 hover:text-green-300"
                   >
                     Cancel
                   </Button>
                   <Button
                     onClick={submitReply}
                     disabled={!replyContent.trim() || isSubmittingReply}
                     className="bg-green-600 hover:bg-green-700 text-white"
                   >
                     {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                   </Button>
                 </div>
               </div>
             </div>
           </div>
         )}
       </DialogContent>
     </Dialog>

   </div>
 )
}
