"use client"

import { useState, useEffect } from "react";
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
import { useToast, Toast } from "@/components/ui/toast"
import { Search as SearchComponent, SearchFilters } from "@/components/ui/search"
import { ImageUpload, useImageUpload } from "@/components/ui/image-upload"
import { UserProfile } from "@/components/ui/user-profile"
import { AchievementBadge, ACHIEVEMENTS } from "@/components/ui/achievement-badge"
import { ResponsiveSidebar, ResponsiveHeader, ResponsiveContainer, ResponsiveGrid, ResponsiveCard, ResponsiveText, useResponsive } from "@/components/ui/responsive-layout"

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
  const { toasts, showToast, removeToast } = useToast();

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
    likes: 0,
    comments: 0,
    reposts: 0,
    streak: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 100
  });
  
  // Home feed states
  const [allPosts, setAllPosts] = useState<Journal[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [feedFilter, setFeedFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

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
      return await response.json();
    } catch (error) {
      console.error("Error posting comment:", error);
      throw error;
    }
  };

  // Enhanced Like, Comment, and Repost functions
  const handleLike = async (journalId: string) => {
    if (loadingLikes[journalId]) return; // Prevent double clicks
    
    setLoadingLikes(prev => ({ ...prev, [journalId]: true }));
    
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
        showToast(data.message, 'success');
        
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
        showToast('Failed to like post', 'error');
      }
    } catch (error) {
      console.error('Error handling like:', error);
    } finally {
      setLoadingLikes(prev => ({ ...prev, [journalId]: false }));
    }
  };

  const handleComment = async (journalId: string, commentText: string) => {
    try {
      const response = await fetch('/api/comment/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journalId,
          baseUserId: address,
          comment: commentText,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        console.log('Comment posted successfully:', newComment);
        
        // Show success toast
        showToast('Comment posted successfully!', 'success');
        
        // Update local state
        setDbComments(prev => [newComment, ...prev]);
        
        // Update comment count
        setCommentCounts(prev => ({
          ...prev,
          [journalId]: (prev[journalId] || 0) + 1
        }));
        
        // Close comment section
        setCurrentJournalId(null);
      } else {
        console.error('Comment posting failed');
        showToast('Failed to post comment', 'error');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleRepost = async (journalId: string) => {
    try {
      const response = await fetch('/api/repost/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journalId,
          baseUserId: address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Repost action successful:', data);
        
        // Show success toast
        showToast(data.message, 'success');
        
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
        console.error('Repost action failed');
        showToast('Failed to repost', 'error');
      }
    } catch (error) {
      console.error('Error handling repost:', error);
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
          privacy: 'public',
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        console.log('Post created successfully:', newPost);
        
        // Show success toast
        showToast('Post created successfully!', 'success');
        
        // Update posts list
        setAllPosts(prev => [newPost, ...prev]);
        
        // Clear form
        setNewPostContent('');
        setNewPostTags([]);
        clearImages(); // Clear uploaded images
      } else {
        console.error('Failed to create post');
        showToast('Failed to create post', 'error');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('Error creating post', 'error');
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
      const commentResponse = await fetch(`/api/comment/post?journalId=${journalId}`);
      if (commentResponse.ok) {
        const comments = await commentResponse.json();
        setCommentCounts(prev => ({
          ...prev,
          [journalId]: comments.length
        }));
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
        const comments = await response.json();
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
      const response = await fetch("/api/journal/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalId }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.comments || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  // Home feed functions
  const fetchAllPosts = async () => {
    setIsLoadingFeed(true);
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
      setIsLoadingFeed(false);
    }
  };

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
    { id: 'notifications' as SidebarItem, label: 'Notifications', icon: Bell },
    { id: 'profile' as SidebarItem, label: 'Profile', icon: User },
    { id: 'settings' as SidebarItem, label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSidebarItem) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-6">
              <ResponsiveText variant="h1" className="text-white mb-2">
                DailyBase Feed
              </ResponsiveText>
              <ResponsiveText variant="body" className="text-blue-300">
                Your personal crypto journey timeline
              </ResponsiveText>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <SearchComponent 
                onResultSelect={(result) => {
                  showToast(`Selected: ${result.title}`, 'info');
                }}
                placeholder="Search posts, users, tags..."
                className="w-full"
              />
              <div className="mt-4">
                <SearchFilters 
                  activeFilter={searchFilter} 
                  onFilterChange={setSearchFilter} 
                />
              </div>
            </div>

            {/* Create Post */}
            <ResponsiveCard className="mb-8">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-blue-400/20 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
                    {address.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div>
                    <ResponsiveText variant="h4" className="text-blue-300 mb-2">
                      What's happening in your crypto world today?
                    </ResponsiveText>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share your thoughts, trades, or insights..."
                      className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 pixelated-text"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-slate-400">
                        {newPostContent.length}/500
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-lg px-3 py-2 transition-all duration-300"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {images.length > 0 ? `${images.length} Image${images.length > 1 ? 's' : ''}` : 'Add Photo'}
                        </Button>
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
                    
                    {/* Drag and Drop Area */}
                    <div
                      className={`mt-4 p-6 border-2 border-dashed rounded-xl text-center transition-all duration-300 ${
                        images.length > 0 
                          ? 'border-blue-400/50 bg-blue-500/5' 
                          : 'border-slate-600 hover:border-blue-400/50 hover:bg-blue-500/5'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-blue-400', 'bg-blue-500/10');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-500/10');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-500/10');
                        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                        if (files.length > 0) {
                          handleImagesSelected(files);
                        }
                      }}
                    >
                      {images.length === 0 ? (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Plus className="w-6 h-6 text-blue-400" />
                          </div>
                          <p className="text-blue-300 pixelated-text font-medium">
                            Drag and drop images here
                          </p>
                          <p className="text-slate-400 text-sm">
                            or click the "Add Photo" button above
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-6 h-6 text-green-400" />
                          </div>
                          <p className="text-green-300 pixelated-text font-medium">
                            {images.length} image{images.length > 1 ? 's' : ''} ready to upload
                          </p>
                          <p className="text-slate-400 text-sm">
                            Drag more images here to add them
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="space-y-2">
                      <ResponsiveText variant="body" className="text-blue-300">
                        Selected Images ({images.length}):
                      </ResponsiveText>
                      <div className="flex flex-wrap gap-2">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border-2 border-blue-400/30 hover:border-blue-400/60 transition-all duration-300"
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
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearImages}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 border-red-400/30"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear All Images
                      </Button>
                    </div>
                  )}

                  {/* Tags Display */}
                  {newPostTags.length > 0 && (
                    <div className="space-y-2">
                      <ResponsiveText variant="body" className="text-blue-300">
                        Tags:
                      </ResponsiveText>
                      <div className="flex flex-wrap gap-2">
                        {newPostTags.map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text"
                          >
                            #{tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTagFromPost(tag)}
                              className="ml-1 p-0 h-auto text-blue-300 hover:text-blue-200"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Tags */}
                  <div className="flex items-center gap-2">
                    <input
                      id="tag-input"
                      type="text"
                      placeholder="Add tags..."
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 pixelated-text"
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
                      className="bg-blue-600/20 border-blue-500 text-blue-300 hover:bg-blue-600/30"
                    >
                      Add Tag
                    </Button>
                  </div>

                  {/* Post Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || isCreatingPost}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white pixelated-text px-6 py-2 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
                    >
                      {isCreatingPost ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isProcessingImages ? 'Processing Images...' : 'Posting...'}
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </ResponsiveCard>

            {/* Feed Content */}
            {isLoadingFeed ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
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
                  <h3 className="text-2xl font-bold text-white pixelated-text mb-3">
                    No posts yet
                  </h3>
                  <p className="text-blue-300 text-center mb-8 max-w-md leading-relaxed">
                    Be the first to share your crypto journey! Create a post to get started.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white pixelated-text px-8 py-3 text-lg hover:shadow-lg hover:shadow-blue-500/25">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {getFilteredPosts().map((entry, index) => {
                  const userRepost = userReposts.find(repost => repost.journalId === entry.id);
                  const commentCount = commentCounts[entry.id] || 0;
                  
                  return (
                    <Card
                      key={entry.id}
                      className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/60 text-white backdrop-blur-sm card-glass hover-lift transition-all duration-300 shadow-xl hover:shadow-2xl"
                    >
                      <CardHeader className="pb-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-6">
                            <Avatar className="w-16 h-16 ring-3 ring-blue-400/40 flex-shrink-0 hover:ring-blue-400/70 transition-all duration-300">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl">
                                {entry.baseUserId.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div className="font-bold text-white pixelated-text text-2xl">
                                  {entry.baseUserId.slice(0, 6)}...{entry.baseUserId.slice(-4)}
                                </div>
                                <Badge className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-300 border-blue-400/50 pixelated-text text-sm font-bold px-3 py-1">
                                  #{index + 1}
                                </Badge>
                                {entry.likes > 10 && (
                                  <Badge className="bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-300 border-orange-400/50 pixelated-text text-sm font-bold px-3 py-1">
                                    🔥 Hot
                                  </Badge>
                                )}
                              </div>
                              <div className="text-base text-blue-300 pixelated-text flex items-center gap-3">
                                <Calendar className="w-5 h-5" />
                                {entry.dateCreated
                                  ? new Date(entry.dateCreated).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "No date"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-full p-3 transition-all duration-300 hover:scale-110">
                              <Share2 className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-full p-3 transition-all duration-300 hover:scale-110">
                              <BookOpen className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {/* Enhanced Image Display */}
                        {entry.photos && entry.photos.length > 0 && (
                          <div className="mb-8 rounded-3xl overflow-hidden group relative">
                            <div className="relative">
                              {entry.photos.length === 1 ? (
                                <img 
                                  src={entry.photos[0]} 
                                  alt="Journal entry" 
                                  className="w-full h-auto max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                              ) : (
                                <div className={`grid gap-2 ${
                                  entry.photos.length === 2 ? 'grid-cols-2' :
                                  entry.photos.length === 3 ? 'grid-cols-2' :
                                  'grid-cols-2'
                                }`}>
                                  {entry.photos.slice(0, 4).map((photo, photoIndex) => (
                                    <div key={photoIndex} className={`relative group cursor-pointer ${
                                      entry.photos!.length === 3 && photoIndex === 2 ? 'col-span-2' : ''
                                    }`}>
                                      <div className="w-full h-full bg-slate-600 overflow-hidden rounded-xl">
                                        <img
                                          src={photo}
                                          alt={`Post image ${photoIndex + 1}`}
                                          className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${
                                            entry.photos!.length === 1 ? 'h-64' :
                                            entry.photos!.length === 2 ? 'h-48' :
                                            entry.photos!.length === 3 && photoIndex === 2 ? 'h-48' : 'h-48'
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
                                    <div className="h-48 bg-slate-600 rounded-xl flex items-center justify-center text-xs text-slate-400">
                                      +{entry.photos.length - 4} more
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button size="sm" className="bg-black/60 text-white hover:bg-black/80 rounded-full p-3">
                                  <BookOpen className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Enhanced Content Display */}
                        <div className="bg-gradient-to-r from-slate-700/40 to-slate-800/40 rounded-3xl p-8 mb-8 border border-slate-600/40">
                          <p className="text-white leading-relaxed pixelated-text text-xl break-words">
                            {entry.journal || "This user shared their crypto journey..."}
                          </p>
                        </div>
                        {/* Enhanced Tags Display */}
                        {entry.tags.length > 0 && (
                          <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                              <span className="text-blue-300 pixelated-text font-bold text-lg">Topics</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {entry.tags.map((tag, tagIndex) => (
                                <Badge 
                                  key={tagIndex} 
                                  className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-300 border-blue-400/50 pixelated-text hover:bg-blue-500/40 transition-all duration-300 cursor-pointer font-bold px-4 py-2 text-sm"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Enhanced Action Buttons */}
                        <div className="flex items-center justify-between pt-8 border-t border-slate-600/40">
                          <div className="flex items-center gap-6">
                            {/* Like Button */}
                            <div className="group relative">
                              <button 
                                onClick={() => handleLike(entry.id)}
                                disabled={loadingLikes[entry.id]}
                                className={`flex items-center gap-4 px-8 py-4 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                                  loadingLikes[entry.id] ? "opacity-50 cursor-not-allowed" : ""
                                } ${
                                  userLikes[entry.id]
                                    ? "bg-gradient-to-r from-pink-500/20 to-red-500/20 border-pink-500/60 hover:shadow-pink-500/30"
                                    : "bg-gradient-to-r from-pink-500/15 to-red-500/15 border-pink-500/40 hover:border-pink-500/70 hover:shadow-pink-500/25"
                                }`}
                              >
                                <div className="relative">
                                  {loadingLikes[entry.id] ? (
                                    <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Heart className={`w-6 h-6 transition-colors ${
                                      userLikes[entry.id] ? "text-pink-300 fill-pink-300" : "text-pink-400 group-hover:text-pink-300"
                                    }`} />
                                  )}
                                  <div className="absolute inset-0 w-6 h-6 bg-pink-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <span className="text-pink-300 pixelated-text font-bold text-xl">{likeCounts[entry.id] || entry.likes || 0}</span>
                              </button>
                            </div>

                            {/* Comment Button */}
                            <div className="group relative">
                              <button
                                onClick={() => {
                                  setCurrentJournalId(entry.id);
                                  setCommentCounts(prev => ({ ...prev, [entry.id]: commentCount }));
                                }}
                                className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-500/40 hover:border-blue-500/70 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
                              >
                                <div className="relative">
                                  <MessageSquare className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                                  <div className="absolute inset-0 w-6 h-6 bg-blue-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <span className="text-blue-300 pixelated-text font-bold text-xl">{commentCounts[entry.id] || commentCount || 0}</span>
                              </button>
                            </div>

                            {/* Repost Button */}
                            <div className="group relative">
                              <button
                                onClick={() => handleRepost(entry.id)}
                                className={`flex items-center gap-4 px-8 py-4 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                                  userRepost
                                    ? "bg-gradient-to-r from-green-500/15 to-emerald-500/15 border-green-500/60 hover:shadow-green-500/25"
                                    : "bg-gradient-to-r from-purple-500/15 to-violet-500/15 border-purple-500/40 hover:border-purple-500/70 hover:shadow-purple-500/25"
                                }`}
                              >
                                <div className="relative">
                                  <Share2 className={`w-6 h-6 transition-colors ${
                                    userRepost ? "text-green-400 group-hover:text-green-300" : "text-purple-400 group-hover:text-purple-300"
                                  }`} />
                                  <div className={`absolute inset-0 w-6 h-6 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity ${
                                    userRepost ? "bg-green-400/20" : "bg-purple-400/20"
                                  }`}></div>
                                </div>
                                <span className={`pixelated-text font-bold text-xl ${
                                  userRepost ? "text-green-300" : "text-purple-300"
                                }`}>
                                  {userRepost ? "Reposted" : "Repost"}
                                </span>
                                <span className={`pixelated-text font-bold text-lg ${
                                  userRepost ? "text-green-300" : "text-purple-300"
                                }`}>
                                  ({repostCounts[entry.id] || 0})
                                </span>
                              </button>
                            </div>
                          </div>
                          
                          {/* Enhanced Post Stats */}
                          <div className="flex items-center gap-6 text-base text-slate-400">
                            <div className="flex items-center gap-2 bg-slate-800/40 px-4 py-2 rounded-xl">
                              <Eye className="w-5 h-5" />
                              <span className="font-semibold">{Math.floor(Math.random() * 1000) + 100}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/40 px-4 py-2 rounded-xl">
                              <Share2 className="w-5 h-5" />
                              <span className="font-semibold">{Math.floor(Math.random() * 50) + 5}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Comments Section */}
                        {currentJournalId === entry.id && (
                          <div className="mt-6 p-6 bg-gradient-to-r from-slate-700/20 to-slate-800/20 rounded-2xl border border-slate-600/30">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                  <MessageSquare className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-blue-300 pixelated-text font-bold text-lg">Comments</span>
                                <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30 pixelated-text text-sm font-medium">
                                  {commentCount}
                                </Badge>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setCurrentJournalId(null)}
                                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full p-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {/* Enhanced Comment Input */}
                            <div className="flex gap-4 mb-6">
                              <Avatar className="w-10 h-10 ring-2 ring-blue-400/30 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">
                                  {user?.address?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Share your thoughts on this post..."
                                    className="w-full bg-slate-700/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 pixelated-text text-sm placeholder-slate-400"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        const target = e.target as HTMLInputElement;
                                        if (target.value.trim()) {
                                          handleComment(entry.id, target.value);
                                          target.value = '';
                                        }
                                      }
                                    }}
                                  />
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1">
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Enhanced Comments List */}
                            <div className="space-y-4 max-h-60 overflow-y-auto">
                              {dbComments
                                .filter(comment => comment.journalId === entry.id)
                                .map((comment, commentIndex) => (
                                  <div key={commentIndex} className="flex gap-4 p-4 bg-gradient-to-r from-slate-600/20 to-slate-700/20 rounded-xl border border-slate-500/20 hover:border-slate-500/40 transition-all duration-300 hover:scale-[1.02]">
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
                                      </div>
                                      <p className="text-sm text-white pixelated-text break-words">
                                        {comment.comment}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
              <h1 className="text-3xl font-bold text-white pixelated-text mb-2">
                Calendar View
              </h1>
              <p className="text-blue-300 pixelated-text">
                Track your daily entries and activities
              </p>
            </div>

            <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
              <CardHeader className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    onClick={goToPreviousYear}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700/80 border-slate-600 text-white pixelated-text"
                  >
                    {"<<"}
                  </Button>
                  <Button
                    onClick={goToPreviousMonth}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700/80 border-slate-600 text-white pixelated-text"
                  >
                    {"<"}
                  </Button>
                  <div className="flex-1 text-center">
                    <h2 className="text-2xl font-bold text-white pixelated-text">
                      {getMonthName(currentMonth)} {currentYear}
                    </h2>
                  </div>
                  <Button
                    onClick={goToNextMonth}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700/80 border-slate-600 text-white pixelated-text"
                  >
                    {">"}
                  </Button>
                  <Button
                    onClick={goToNextYear}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700/80 border-slate-600 text-white pixelated-text"
                  >
                    {">>"}
                  </Button>
                </div>
                <Button
                  onClick={goToToday}
                  variant="outline"
                  className="bg-blue-600/20 border-blue-500 text-blue-300 pixelated-text"
                >
                  Today
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center">
                      <div className="text-sm font-semibold text-blue-300 pixelated-text">
                        {day}
                      </div>
                    </div>
                  ))}

                  {generateCalendarDays().map((day, index) => (
                    <div
                      key={index}
                      className={`p-2 text-center cursor-pointer transition-all duration-200 ${
                        day ? "hover:bg-slate-600/30" : ""
                      }`}
                      onClick={() => handleDateClick(day || 0)}
                    >
                      {day ? (
                        <div
                          className={`relative w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-sm pixelated-text ${
                            isToday(day)
                              ? "bg-blue-600 text-white font-bold"
                              : isSelected(day)
                              ? "bg-blue-500/30 text-blue-300 border border-blue-400"
                              : hasEntriesForDate(day)
                              ? "bg-green-500/20 text-green-300 border border-green-400/30"
                              : "text-white hover:bg-slate-600/50"
                          }`}
                        >
                          {day}
                          {hasEntriesForDate(day) && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
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

            <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
              <CardHeader>
                <CardTitle className="text-blue-300 pixelated-text">
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
                          className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white pixelated-text font-semibold">
                              {entry.content}
                            </span>
                            <span className="text-blue-300 pixelated-text text-sm">
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
             <h1 className="text-4xl font-bold text-white mb-3">
               Basio Calculator
             </h1>
             <p className="text-slate-400 text-lg">
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
                       ? `bg-gradient-to-r ${tab.color} text-white border-0 shadow-lg transform scale-105`
                       : "bg-slate-800 border-slate-600 text-blue-300 hover:bg-slate-700 hover:scale-105 transition-all duration-200"
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
             <div className="max-w-4xl mx-auto">
               <div className="text-center mb-8">
                 <h2 className="text-2xl font-semibold text-white mb-2">
                   Gas Fee Calculator
                 </h2>
                 <p className="text-slate-400">
                   Calculate transaction costs with precision
                 </p>
               </div>
               <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-300">
                       Gas Price (Gwei)
                     </label>
                     <input
                       type="number"
                       value={gasPrice}
                       onChange={(e) => setGasPrice(e.target.value)}
                       className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                       placeholder="20"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-300">
                       Gas Limit
                     </label>
                     <input
                       type="number"
                       value={gasLimit}
                       onChange={(e) => setGasLimit(e.target.value)}
                       className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                       placeholder="21000"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-300">
                       ETH Price (USD)
                     </label>
                     <input
                       type="number"
                       value={ethPrice}
                       onChange={(e) => setEthPrice(e.target.value)}
                       className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                       placeholder="2000"
                     />
                   </div>
                 </div>

                 <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
                   <h4 className="text-white font-semibold mb-6 text-center text-lg">
                     Calculation Results
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="text-center p-6 bg-slate-700/50 rounded-lg">
                       <div className="text-3xl font-bold text-blue-400 mb-2">
                         {gasFeeResult.gwei}
                       </div>
                       <div className="text-sm text-slate-400">Gwei</div>
                     </div>
                     <div className="text-center p-6 bg-slate-700/50 rounded-lg">
                       <div className="text-3xl font-bold text-green-400 mb-2">
                         {gasFeeResult.eth}
                       </div>
                       <div className="text-sm text-slate-400">ETH</div>
                     </div>
                     <div className="text-center p-6 bg-slate-700/50 rounded-lg">
                       <div className="text-3xl font-bold text-purple-400 mb-2">
                         ${gasFeeResult.usd}
                       </div>
                       <div className="text-sm text-slate-400">USD</div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {activeCalculatorTab === "currency" && (
             <div className="max-w-4xl mx-auto">
               <div className="text-center mb-8">
                 <h2 className="text-2xl font-semibold text-white mb-2">
                   Currency Converter
                 </h2>
                 <p className="text-slate-400">
                   Convert currencies with real-time exchange rates
                 </p>
                 <div className="text-xs text-green-300 pixelated-text mt-2">
                   {Object.keys(liveExchangeRates).length > 0
                     ? "✅ Live rates active"
                     : "⚠️ Using backup rates"}
                 </div>
               </div>

               <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-300">
                       From Currency
                     </label>
                     <select
                       value={currencySwap.fromCurrency}
                       onChange={(e) => updateCurrencySwap("fromCurrency", e.target.value)}
                       className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                     >
                       {currencies.map((currency) => (
                         <option key={currency.code} value={currency.code}>
                           {currency.symbol} {currency.name} ({currency.code})
                         </option>
                       ))}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-300">
                       To Currency
                     </label>
                     <select
                       value={currencySwap.toCurrency}
                       onChange={(e) => updateCurrencySwap("toCurrency", e.target.value)}
                       className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                     >
                       {currencies.map((currency) => (
                         <option key={currency.code} value={currency.code}>
                           {currency.symbol} {currency.name} ({currency.code})
                         </option>
                       ))}
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-300">
                       Amount
                     </label>
                     <input
                       type="number"
                       value={currencySwap.fromAmount}
                       onChange={(e) => updateCurrencySwap("fromAmount", e.target.value)}
                       className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                       placeholder="1.00"
                       step="0.01"
                     />
                   </div>
                   <div className="flex items-end gap-3">
                     <Button
                       onClick={swapCurrencies}
                       className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 transition-colors"
                     >
                       Swap Currencies
                     </Button>
                   </div>
                 </div>

                 <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700">
                   <h4 className="text-white font-semibold mb-6 text-center text-lg">
                     Conversion Results
                   </h4>
                   <div className="text-center">
                     <div className="text-4xl font-bold text-blue-400 mb-3">
                       {getCurrencySymbol(currencySwap.fromCurrency)}
                       {parseFloat(currencySwap.fromAmount || "0").toFixed(2)}
                     </div>
                     <div className="text-slate-400 mb-4 text-lg">equals</div>
                     <div className="text-4xl font-bold text-green-400 mb-4">
                       {getCurrencySymbol(currencySwap.toCurrency)}
                       {convertedAmount.toFixed(2)}
                     </div>
                     <div className="text-sm text-slate-400 bg-slate-700/50 rounded-lg p-3 inline-block">
                       Exchange Rate: 1 {currencySwap.fromCurrency} ={" "}
                       {currencySwap.exchangeRate.toFixed(4)}{" "}
                       {currencySwap.toCurrency}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {activeCalculatorTab === "expense" && (
             <div className="max-w-4xl mx-auto">
               <div className="text-center mb-8">
                 <h2 className="text-2xl font-semibold text-white mb-2">
                   Expense Journal
                 </h2>
                 <p className="text-slate-400">
                   Track and manage your crypto expenses
                 </p>
               </div>
               <div className="space-y-6">
                 <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                   <h3 className="text-white font-semibold text-lg mb-6 text-center">
                     Add New Expense
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-300">
                         Date
                       </label>
                       <input
                         type="date"
                         value={newExpense.date}
                         onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                         className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-300">
                         Category
                       </label>
                       <select
                         value={newExpense.category}
                         onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                         className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                       >
                         {expenseCategories.map((category) => (
                           <option key={category} value={category}>
                             {category}
                           </option>
                         ))}
                       </select>
                     </div>
                   </div>

                   <div className="space-y-2 mb-6">
                     <label className="text-sm font-medium text-slate-300">
                       Description
                     </label>
                     <input
                       type="text"
                       value={newExpense.description}
                       onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                       className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                       placeholder="What was this expense for?"
                     />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-300">
                         Amount (USD)
                       </label>
                       <input
                         type="number"
                         value={newExpense.amount}
                         onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                         className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                         placeholder="0.00"
                         step="0.01"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-300">
                         Gas Fee (USD)
                       </label>
                       <input
                         type="number"
                         value={newExpense.gasFee}
                         onChange={(e) => setNewExpense({...newExpense, gasFee: e.target.value})}
                         className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                         placeholder="0.00"
                         step="0.01"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-300">
                         Transaction Hash
                       </label>
                       <input
                         type="text"
                         value={newExpense.transactionHash}
                         onChange={(e) => setNewExpense({...newExpense, transactionHash: e.target.value})}
                         className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                         placeholder="0x..."
                       />
                     </div>
                   </div>

                   <div className="space-y-2 mb-6">
                     <label className="text-sm font-medium text-slate-300">
                       Notes
                     </label>
                     <textarea
                       value={newExpense.notes}
                       onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                       className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                       placeholder="Additional notes about this expense..."
                       rows={3}
                     />
                   </div>

                   <Button
                     onClick={addExpenseEntry}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg transition-colors"
                     disabled={!newExpense.description || !newExpense.amount}
                   >
                     <Plus className="w-5 h-5 mr-2" />
                     Add Expense
                   </Button>
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
                 <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                   <h4 className="text-white font-semibold mb-4 text-lg">
                     Total Expenses
                   </h4>
                   <div className="text-4xl font-bold text-blue-400 mb-6">
                     ${getTotalExpenses().toFixed(2)}
                   </div>
                   <div className="space-y-3">
                     {expenseCategories.map((category) => {
                       const total = getTotalExpensesByCategory(category);
                       if (total > 0) {
                         return (
                           <div
                             key={category}
                             className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg"
                           >
                             <span className="text-slate-300">{category}</span>
                             <span className="text-white font-semibold">
                               ${total.toFixed(2)}
                             </span>
                           </div>
                         );
                       }
                       return null;
                     })}
                   </div>
                 </div>
                 <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                   <h4 className="text-white font-semibold mb-4 text-lg">
                     Recent Expenses
                   </h4>
                   <div className="space-y-3">
                     {expenseEntries.slice(0, 5).map((expense) => (
                       <div
                         key={expense.id}
                         className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg"
                       >
                         <div>
                           <span className="text-white font-semibold">
                             {expense.description}
                           </span>
                           <span className="text-slate-400 ml-2 text-sm">
                             ({expense.date})
                           </span>
                         </div>
                         <span className="text-green-400 font-semibold">
                           ${parseFloat(expense.amount).toFixed(2)}
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           )}
         </div>
       );
     case "stats":
       return (
         <div className="space-y-8">
           {/* Stats Header */}
           <div className="text-center mb-8">
             <h1 className="text-3xl font-bold text-white pixelated-text mb-2">
               Activity Statistics
             </h1>
             <p className="text-blue-300 pixelated-text">
               Track your DailyBase journey and progress
             </p>
           </div>

           {/* Key Metrics */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="text-center p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
               <div className="text-4xl font-bold text-white pixelated-text mb-1">
                 {entries.length}
               </div>
               <div className="text-sm text-blue-300 pixelated-text">
                 Entries
               </div>
             </div>
             <div className="text-center p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
               <div className="text-4xl font-bold text-white pixelated-text mb-1">
                 {entries.length > 0 ? Math.ceil(entries.length / 7) : 0}
               </div>
               <div className="text-sm text-blue-300 pixelated-text">
                 Weeks
               </div>
             </div>
             <div className="text-center p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
               <div className="text-4xl font-bold text-white pixelated-text mb-1">
                 {entries.length > 0
                   ? Math.round((entries.length / 30) * 100)
                   : 0}
                 %
               </div>
               <div className="text-sm text-blue-300 pixelated-text">
                 Consistency
               </div>
             </div>
             <div className="text-center p-6 bg-slate-800/30 rounded-lg border border-slate-600/30">
               <div className="text-4xl font-bold text-white pixelated-text mb-1">
                 {entries.length > 0
                   ? Math.max(...entries.map((_, i) => i + 1))
                   : 0}
               </div>
               <div className="text-sm text-blue-300 pixelated-text">
                 Streak
               </div>
             </div>
           </div>

           {/* Activity Overview */}
           <div className="bg-slate-800/30 rounded-lg border border-slate-600/30 p-6">
             <div className="text-center mb-6">
               <h3 className="text-xl font-semibold text-white pixelated-text mb-2">
                 Activity
               </h3>
               <p className="text-sm text-blue-300 pixelated-text">
                 Daily contribution pattern
               </p>
             </div>
             <div className="flex justify-center mb-4">
               <ContributionGrid entries={entries} />
             </div>
             <div className="flex items-center justify-center gap-4 text-xs text-blue-300 pixelated-text">
               <div className="flex items-center gap-1">
                 <div className="w-2 h-2 bg-slate-600 rounded-sm"></div>
                 <span>Empty</span>
               </div>
               <div className="flex items-center gap-1">
                 <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                 <span>Entry</span>
               </div>
             </div>
           </div>

           {/* Recent Activity */}
           <div className="bg-slate-800/30 rounded-lg border border-slate-600/30 p-6">
             <h3 className="text-xl font-semibold text-white pixelated-text mb-4">
               Recent
             </h3>
             {entries.length === 0 ? (
               <div className="text-center py-8">
                 <p className="text-blue-300 pixelated-text">No entries yet</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {entries.slice(0, 3).map((entry, index) => (
                   <div
                     key={entry.id}
                     className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg"
                   >
                     <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                       <span className="text-blue-300 font-bold text-sm">
                         {index + 1}
                       </span>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="text-white pixelated-text text-sm truncate">
                         {entry.content}
                       </div>
                       <div className="text-xs text-blue-300 pixelated-text">
                         {new Date(entry.date).toLocaleDateString("en-US", {
                           month: "short",
                           day: "numeric",
                         })}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Monthly Breakdown */}
           <div className="bg-slate-800/30 rounded-lg border border-slate-600/30 p-6">
             <h3 className="text-xl font-semibold text-white pixelated-text mb-4">
               Monthly
             </h3>
             <div className="space-y-3">
               {Array.from({ length: 3 }, (_, i) => {
                 const month = new Date();
                 month.setMonth(month.getMonth() - i);
                 const monthName = month.toLocaleDateString("en-US", {
                   month: "short",
                 });
                 const monthEntries = entries.filter((entry) => {
                   const entryDate = new Date(entry.date);
                   return (
                     entryDate.getMonth() === month.getMonth() &&
                     entryDate.getFullYear() === month.getFullYear()
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
                     <div className="flex items-center gap-2">
                       <div className="w-16 bg-slate-600/50 rounded-full h-1">
                         <div
                           className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                           style={{
                             width: `${Math.min(
                               (monthEntries.length / 30) * 100,
                               100
                             )}%`,
                           }}
                         ></div>
                       </div>
                       <span className="text-white pixelated-text text-sm">
                         {monthEntries.length}
                       </span>
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
         <div className="max-w-2xl mx-auto space-y-6">
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
                     <Badge className="bg-green-500/20 text-green-300 border-green-400/50 pixelated-text">
                       ACTIVE
                     </Badge>
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
           
           <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
             <CardHeader>
               <CardTitle className="text-blue-300 flex items-center gap-2 pixelated-text">
                 <Trophy className="w-5 h-5" />
                 Recent Achievements
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {userAchievements.slice(0, 8).map((achievement) => (
                   <AchievementBadge 
                     key={achievement.id} 
                     achievement={achievement} 
                     showProgress={true}
                     size="sm"
                   />
                 ))}
               </div>
             </CardContent>
           </Card>

           <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
             <CardHeader>
               <CardTitle className="text-blue-300 pixelated-text">
                 Streak History
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-center py-8">
                 <Flame className="w-16 h-16 text-orange-400 mb-4 mx-auto opacity-50" />
                 <h3 className="text-xl font-semibold text-white pixelated-text mb-2">
                   Streak History Coming Soon
                 </h3>
                 <p className="text-blue-300 text-center mb-6 max-w-md mx-auto">
                   Track your longest streaks, milestones, and streak
                   achievements over time.
                 </p>
                 <div className="flex justify-center gap-4">
                   <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30 pixelated-text">
                     Longest: 7 days
                   </Badge>
                   <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text">
                     Current: 3 days
                   </Badge>
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
             <CardHeader>
               <CardTitle className="text-blue-300 pixelated-text">
                 Streak Goals
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                   <div className="flex items-center gap-3">
                     <Target className="w-5 h-5 text-blue-400" />
                     <div>
                       <div className="text-white pixelated-text">
                         7 Day Streak
                       </div>
                       <div className="text-sm text-blue-300">
                         Complete 7 consecutive days
                       </div>
                     </div>
                   </div>
                   <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 pixelated-text">
                     In Progress
                   </Badge>
                 </div>

                 <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                   <div className="flex items-center gap-3">
                     <Target className="w-5 h-5 text-blue-400" />
                     <div>
                       <div className="text-white pixelated-text">
                         30 Day Streak
                       </div>
                       <div className="text-sm text-blue-300">
                         Complete 30 consecutive days
                       </div>
                     </div>
                   </div>
                   <Badge className="bg-slate-500/20 text-slate-300 border-slate-400/30 pixelated-text">
                     Locked
                   </Badge>
                 </div>

                 <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                   <div className="flex items-center gap-3">
                     <Target className="w-5 h-5 text-blue-400" />
                     <div>
                       <div className="text-white pixelated-text">
                         100 Day Streak
                       </div>
                       <div className="text-sm text-blue-300">
                         Complete 100 consecutive days
                       </div>
                     </div>
                   </div>
                   <Badge className="bg-slate-500/20 text-slate-300 border-slate-400/30 pixelated-text">
                     Locked
                   </Badge>
                 </div>
               </div>
             </CardContent>
           </Card>
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
             stats={userStats}
             achievements={userAchievements}
             isOwnProfile={true}
             onEdit={() => {
               showToast('Edit profile functionality coming soon!', 'info');
             }}
             onFollow={() => {
               showToast('Follow functionality coming soon!', 'info');
             }}
           />
         </div>
       );

     case "notifications":
       return (
         <div className="space-y-6">
           {/* Notifications Header */}
           <div className="text-center mb-6">
             <h1 className="text-3xl font-bold text-white pixelated-text mb-2">
               Notifications
             </h1>
             <p className="text-blue-300 pixelated-text">
               Stay updated with your crypto activities
             </p>
           </div>

           {/* Notifications List */}
           <div className="space-y-4">
             {/* Empty State */}
             <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/50 text-white backdrop-blur-sm card-glass shadow-lg">
               <CardContent className="flex flex-col items-center justify-center py-16">
                 <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                   <Bell className="w-12 h-12 text-white" />
                 </div>
                 <h3 className="text-2xl font-bold text-white pixelated-text mb-3">
                   No notifications yet
                 </h3>
                 <p className="text-blue-300 text-center mb-8 max-w-md leading-relaxed">
                   When you get likes, comments, reposts, or other interactions, they'll appear here.
                 </p>
                 <Button 
                   onClick={() => setActiveSidebarItem("home")}
                   className="bg-gradient-to-r from-blue-500 to-purple-600 text-white pixelated-text px-8 py-3 text-lg hover:shadow-lg hover:shadow-blue-500/25"
                 >
                   <Home className="w-5 h-5 mr-2" />
                   Go to Feed
                 </Button>
               </CardContent>
             </Card>
           </div>

           {/* Empty State */}
           <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
             <CardContent className="flex flex-col items-center justify-center py-12">
               <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6">
                 <Bell className="w-10 h-10 text-white" />
               </div>
               <h3 className="text-xl font-semibold text-white pixelated-text mb-3">
                 All caught up!
               </h3>
               <p className="text-blue-300 text-center mb-6 max-w-md">
                 You're up to date with all your notifications. New activities will appear here.
               </p>
               <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white pixelated-text">
                 <RotateCcw className="w-4 h-4 mr-2" />
                 Refresh
               </Button>
             </CardContent>
           </Card>
         </div>
       );

     case "settings":
       return (
         <div className="space-y-6">
           {/* Settings Header */}
           <div className="text-center mb-6">
             <h1 className="text-3xl font-bold text-white pixelated-text mb-2">
               Settings
             </h1>
             <p className="text-blue-300 pixelated-text">
               Manage your account and preferences
             </p>
           </div>

           {/* Account Settings */}
           <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
             <CardHeader>
               <CardTitle className="text-blue-300 pixelated-text">
                 Account Settings
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                 <div>
                   <h3 className="text-white pixelated-text font-semibold">
                     Wallet Address
                   </h3>
                   <p className="text-blue-300 pixelated-text text-sm">
                     {getAddressDisplay(address)}
                   </p>
                 </div>
                 <Button
                   onClick={copyAddress}
                   variant="outline"
                   size="sm"
                   className="bg-slate-700 border-slate-600 text-white pixelated-text"
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
           <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
             <CardHeader>
               <CardTitle className="text-blue-300 pixelated-text">
                 Preferences
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                 <div>
                   <h3 className="text-white pixelated-text font-semibold">
                     Theme
                   </h3>
                   <p className="text-blue-300 pixelated-text text-sm">
                     Dark mode (default)
                   </p>
                 </div>
                 <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text">
                   Dark
                 </Badge>
               </div>

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
                   className="bg-green-600/20 border-green-500 text-green-300 pixelated-text"
                 >
                   Enabled
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* About */}
           <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
             <CardHeader>
               <CardTitle className="text-blue-300 pixelated-text">
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
                 <p className="text-blue-300 pixelated-text mb-4">
                   Your personal crypto journal
                 </p>
                 <p className="text-sm text-blue-300/70 pixelated-text">
                   Version 1.0.0
                 </p>
               </div>
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
   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
     {/* Toast Notifications */}
     {toasts.map((toast) => (
       <Toast
         key={toast.id}
         type={toast.type}
         message={toast.message}
         onClose={() => removeToast(toast.id)}
       />
     ))}

     {/* Responsive Sidebar */}
     <ResponsiveSidebar
       items={sidebarItems}
       activeItem={activeSidebarItem}
       onItemClick={(id: string) => setActiveSidebarItem(id as SidebarItem)}
       userAddress={address}
       isOpen={sidebarOpen}
       onOpenChange={setSidebarOpen}
     />

     {/* Main Content Area */}
     <div className="lg:pl-64">
       {/* Responsive Header */}
       <ResponsiveHeader
         title="DailyBase"
         subtitle="Your crypto journey"
         onMenuClick={() => setSidebarOpen(true)}
         userAddress={address}
       />

       {/* Content Container */}
       <ResponsiveContainer maxWidth="xl" className="py-4 sm:py-6 lg:py-8">
         {/* Page Content */}
         <div className="space-y-6">
           {renderContent()}
         </div>
       </ResponsiveContainer>
     </div>
   </div>
 );
}
