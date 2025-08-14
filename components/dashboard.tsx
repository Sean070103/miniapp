"use client"

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Wallet, Settings, User, Shield, Copy, Check, Calendar, Flame, Target, BookOpen, Plus, MessageSquare, Heart, Share2, Menu, Home, Calculator, BarChart3, X, Download, Trash2, Lock as LockIcon, LogOut, TrendingUp, Activity, Network, Coins, Users, Zap, Globe } from 'lucide-react'
import { UserProfile } from "@/components/auth/user-profile"
import { DailyEntry } from "@/components/dashboard/daily-entry"

import Link from "next/link"

import { StreakTracker } from "@/components/dashboard/streak-tracker"
import { ContributionGrid } from "@/components/dashboard/contribution-grid"
import { useAuth } from "@/contexts/auth-context"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import { exchangeRateService } from "@/lib/config"
import { baseNetworkAPI } from "@/lib/baseNetworkAPI"

interface DailyEntry {
  id: string
  date: string
  content: string
  tags: string[]
  timestamp: number
}

interface DashboardProps {
  address: string
}

//ito gagamitin pag galing db yung JOURNAL NA GUSTO MO KUNIN
interface Journal {
  id: string;
  baseUserId: string;
  photo?: string;  // Optional because it has ? in the model
  journal: string;
  likes: number;
  tags: string[];
  privacy: string;
  dateCreated: Date;
}

type SidebarItem = 'home' | 'calendar' | 'calculator' | 'stats' | 'streak' | 'profile' | 'settings' | 'base'

export default function Dashboard({ address }: DashboardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] =
    useState<SidebarItem>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

const { user } = useAuth();
const [dbEntries, setDbEntries] = useState<Journal[]>([]);

const fetchIntervalRef = useRef<NodeJS.Timeout>();

const fetchBaseUserJournal = async () => {
  if (!user?.address) {
    throw new Error("User not authenticated or address missing");
  }

  try {
    const response = await fetch("/api/journal/getby/id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ baseUserId: user.address }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch entries");
    }

    const data: Journal[] = await response.json();
    setDbEntries(data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Set up the interval for fetchiung post journal of the user
useEffect(() => {
  // Initial fetch
  fetchBaseUserJournal().catch(console.error);
  
  // Set up periodic fetching
  fetchIntervalRef.current = setInterval(() => {
    fetchBaseUserJournal().catch(console.error);
  }, 7000); // 7 seconds

  // Cleanup function to clear interval
  return () => {
    if (fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current);
    }
  };
}, [user?.address]); // Re-run when user address changes

  // Calculator states
  const [calculatorDisplay, setCalculatorDisplay] = useState("0");
  const [calculatorMemory, setCalculatorMemory] = useState("0");
  const [calculatorOperator, setCalculatorOperator] = useState("");
  const [calculatorWaitingForOperand, setCalculatorWaitingForOperand] =
    useState(false);
  const [gasPrice, setGasPrice] = useState("20");
  const [gasLimit, setGasLimit] = useState("21000");
  const [ethPrice, setEthPrice] = useState("2000");

  // Expense Journal states
  const [expenseEntries, setExpenseEntries] = useState<
    {
      id: string;
      date: string;
      category: string;
      description: string;
      amount: string;
      gasFee?: string;
      transactionHash?: string;
      notes?: string;
    }[]
  >([]);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Gas Fees",
    description: "",
    amount: "",
    gasFee: "",
    transactionHash: "",
    notes: "",
  });
  const [selectedExpenseDate, setSelectedExpenseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const expenseCategories = [
    "Gas Fees",
    "Trading",
    "NFTs",
    "DeFi",
    "Staking",
    "Bridging",
    "Liquidity",
    "Gaming",
    "Education",
    "Food",
    "Fare",
    "Other",
  ];

  // Currency swap states
  const [currencySwap, setCurrencySwap] = useState({
    fromAmount: "1",
    fromCurrency: "USD",
    toCurrency: "PHP",
    exchangeRate: 56.5,
  });

  // Real-time exchange rates state
  const [liveExchangeRates, setLiveExchangeRates] = useState<{
    [key: string]: number;
  }>({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Base network data state
  const [baseNetworkData, setBaseNetworkData] = useState({
    totalTransactions: 0,
    dailyTransactions: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalVolume: 0,
    gasPrice: 0,
    blockHeight: 0,
    tvl: 0,
    price: 0,
    marketCap: 0,
  });
  const [baseUserActivity, setBaseUserActivity] = useState({
    totalEntries: 0,
    weeklyEntries: 0,
    monthlyEntries: 0,
    averageEntriesPerDay: 0,
    mostActiveDay: "",
    totalGasSpent: 0,
    favoriteTags: [] as string[],
  });
  const [isLoadingBaseData, setIsLoadingBaseData] = useState(false);

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

  // Sample exchange rates (fallback when API is unavailable)
  const fallbackExchangeRates: { [key: string]: number } = {
    USD_PHP: 56.5,
    USD_EUR: 0.92,
    USD_GBP: 0.79,
    USD_JPY: 150.25,
    USD_CAD: 1.35,
    USD_AUD: 1.52,
    USD_CHF: 0.88,
    USD_CNY: 7.23,
    USD_INR: 83.15,
    USD_KRW: 1330.5,
    USD_SGD: 1.34,
    USD_THB: 35.8,
    USD_MYR: 4.75,
    USD_IDR: 15750.0,
    USD_VND: 24500.0,
    PHP_USD: 0.0177,
    PHP_EUR: 0.0163,
    PHP_GBP: 0.014,
    PHP_JPY: 2.66,
    PHP_CAD: 0.0239,
    PHP_AUD: 0.0269,
    PHP_CHF: 0.0156,
    PHP_CNY: 0.128,
    PHP_INR: 1.47,
    PHP_KRW: 23.55,
    PHP_SGD: 0.0237,
    PHP_THB: 0.634,
    PHP_MYR: 0.0841,
    PHP_IDR: 278.76,
    PHP_VND: 433.63,
  };

  // Fetch real-time exchange rates using API service
  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
      // Use the exchange rate service with API key support
      const data = await exchangeRateService.getExchangeRates("USD");

      if (data.rates) {
        const newRates: { [key: string]: number } = {};

        // Convert API rates to our format
        currencies.forEach((fromCurrency) => {
          currencies.forEach((toCurrency) => {
            if (fromCurrency.code !== toCurrency.code) {
              const key = `${fromCurrency.code}_${toCurrency.code}`;
              if (fromCurrency.code === "USD") {
                newRates[key] = data.rates[toCurrency.code] || 1;
              } else if (toCurrency.code === "USD") {
                newRates[key] = 1 / (data.rates[fromCurrency.code] || 1);
              } else {
                // Cross-rate calculation
                const fromToUSD = 1 / (data.rates[fromCurrency.code] || 1);
                const usdToTo = data.rates[toCurrency.code] || 1;
                newRates[key] = fromToUSD * usdToTo;
              }
            }
          });
        });

        setLiveExchangeRates(newRates);

        // Update current exchange rate
        const currentKey = `${currencySwap.fromCurrency}_${currencySwap.toCurrency}`;
        if (newRates[currentKey]) {
          setCurrencySwap((prev) => ({
            ...prev,
            exchangeRate: newRates[currentKey],
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      // Use fallback rates if API fails
      setLiveExchangeRates(fallbackExchangeRates);
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Load exchange rates on component mount and refresh every 5 minutes
  useEffect(() => {
    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Fetch Base network data
  const fetchBaseNetworkData = async () => {
    setIsLoadingBaseData(true);
    try {
      // Fetch real Base network data from APIs
      const networkData = await baseNetworkAPI.getBaseNetworkData();
      setBaseNetworkData(networkData);
    } catch (error) {
      console.error("Error fetching Base network data:", error);
      // Fallback to mock data if API fails
      const fallbackData = {
        totalTransactions: 50000000 + Math.floor(Math.random() * 10000000),
        dailyTransactions: 500000 + Math.floor(Math.random() * 100000),
        totalUsers: 2000000 + Math.floor(Math.random() * 1000000),
        activeUsers: 50000 + Math.floor(Math.random() * 100000),
        totalVolume: 500000 + Math.random() * 1000000,
        gasPrice: 5 + Math.random() * 50,
        blockHeight: 50000000 + Math.floor(Math.random() * 1000000),
        tvl: 500000000 + Math.random() * 1000000000,
        price: 2000 + Math.random() * 3000,
        marketCap: 500000000000 + Math.random() * 1000000000000,
      };
      setBaseNetworkData(fallbackData);
    } finally {
      setIsLoadingBaseData(false);
    }
  };

  // Calculate user activity on Base
  const calculateUserActivity = () => {
    const userActivity = baseNetworkAPI.calculateUserActivity(entries);
    setBaseUserActivity(userActivity);
  };

  // Load Base data on component mount and when entries change
  useEffect(() => {
    fetchBaseNetworkData();
    calculateUserActivity();
  }, [entries]);

  // Get baseuser ID from user account
  const baseUserId = user?.account?.id;

  // Load entries from localStorage (prioritizing baseuser ID, fallback to address)
  useEffect(() => {
    let savedEntries = null;

    // First try to load from baseuser ID storage
    if (baseUserId) {
      const baseUserEntries = localStorage.getItem(
        `dailybase-entries-${baseUserId}`
      );
      if (baseUserEntries) {
        try {
          savedEntries = JSON.parse(baseUserEntries);
        } catch (error) {
          console.error("Error loading entries from baseuser storage:", error);
        }
      }
    }

    // If no baseuser entries found, try address-based storage
    if (!savedEntries) {
      const addressEntries = localStorage.getItem(
        `dailybase-entries-${address}`
      );
      if (addressEntries) {
        try {
          savedEntries = JSON.parse(addressEntries);
          // If we found address-based entries and have a baseuser ID, migrate them
          if (baseUserId && savedEntries) {
            localStorage.setItem(
              `dailybase-entries-${baseUserId}`,
              JSON.stringify(savedEntries)
            );
            console.log("Migrated entries from address to baseuser ID storage");
          }
        } catch (error) {
          console.error("Error loading entries from address storage:", error);
        }
      }
    }

    if (savedEntries) {
      setEntries(savedEntries);
    }
    setIsLoading(false);
  }, [address, baseUserId]);

  // Save entries to localStorage (using baseuser ID when available, fallback to address)
  const saveEntry = (entry: DailyEntry) => {
    const updatedEntries = entries.filter((e) => e.date !== entry.date);
    const newEntries = [...updatedEntries, entry].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setEntries(newEntries);

    // Save to baseuser ID storage if available
    if (baseUserId) {
      localStorage.setItem(
        `dailybase-entries-${baseUserId}`,
        JSON.stringify(newEntries)
      );
    }

    // Also save to address-based storage for backward compatibility
    localStorage.setItem(
      `dailybase-entries-${address}`,
      JSON.stringify(newEntries)
    );
  };

  // Convert Journal to DailyEntry for the DailyEntry component
  const handleJournalSave = (journal: any) => {
    const dailyEntry: DailyEntry = {
      id: journal.id || Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      content: journal.journal,
      tags: journal.tags || [],
      timestamp: Date.now(),
    };
    saveEntry(dailyEntry);
  };

  // Convert DailyEntry to Journal for the DailyEntry component
  const convertToJournal = (entry: DailyEntry | undefined) => {
    if (!entry) return undefined;
    return {
      id: entry.id,
      baseUserId: baseUserId || address,
      journal: entry.content,
      tags: entry.tags,
      photo: null,
      likes: 0,
      privacy: "public",
      createdAt: new Date(entry.timestamp),
    };
  };

  // Clear all data function
  const clearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all your entries? This action cannot be undone."
      )
    ) {
      setEntries([]);
      // Clear both storage locations
      localStorage.removeItem(`dailybase-entries-${address}`);
      if (baseUserId) {
        localStorage.removeItem(`dailybase-entries-${baseUserId}`);
      }
    }
  };

  // Export data function
  const exportData = () => {
    const data = {
      entries,
      user: {
        address,
        baseUserId,
        exportDate: new Date().toISOString(),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dailybase-entries-${baseUserId || address}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  // Calculator functions
  const inputDigit = (digit: string) => {
    if (calculatorWaitingForOperand) {
      setCalculatorDisplay(digit);
      setCalculatorWaitingForOperand(false);
    } else {
      setCalculatorDisplay(
        calculatorDisplay === "0" ? digit : calculatorDisplay + digit
      );
    }
  };

  const inputDecimal = () => {
    if (calculatorWaitingForOperand) {
      setCalculatorDisplay("0.");
      setCalculatorWaitingForOperand(false);
    } else if (calculatorDisplay.indexOf(".") === -1) {
      setCalculatorDisplay(calculatorDisplay + ".");
    }
  };

  const clearDisplay = () => {
    setCalculatorDisplay("0");
    setCalculatorMemory("0");
    setCalculatorOperator("");
    setCalculatorWaitingForOperand(false);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(calculatorDisplay);

    if (calculatorMemory === "0") {
      setCalculatorMemory(calculatorDisplay);
    } else {
      const memoryValue = parseFloat(calculatorMemory);
      let newValue = 0;

      switch (calculatorOperator) {
        case "+":
          newValue = memoryValue + inputValue;
          break;
        case "-":
          newValue = memoryValue - inputValue;
          break;
        case "×":
          newValue = memoryValue * inputValue;
          break;
        case "÷":
          newValue = memoryValue / inputValue;
          break;
        default:
          newValue = inputValue;
      }

      setCalculatorMemory(String(newValue));
      setCalculatorDisplay(String(newValue));
    }

    setCalculatorWaitingForOperand(true);
    setCalculatorOperator(nextOperator);
  };

  // Gas fee calculation
  const calculateGasFee = () => {
    const gasPriceNum = parseFloat(gasPrice);
    const gasLimitNum = parseFloat(gasLimit);
    const ethPriceNum = parseFloat(ethPrice);

    const gasFeeGwei = gasPriceNum * gasLimitNum;
    const gasFeeEth = gasFeeGwei / 1000000000; // Convert from Gwei to ETH
    const gasFeeUsd = gasFeeEth * ethPriceNum;

    return {
      gwei: gasFeeGwei.toFixed(0),
      eth: gasFeeEth.toFixed(6),
      usd: gasFeeUsd.toFixed(2),
    };
  };

  // Daily expense calculation
  const calculateTotalDailyExpense = () => {
    return expenseEntries.reduce((total: number, expense: any) => {
      return total + parseFloat(expense.amount || "0");
    }, 0);
  };

  const updateDailyExpense = (index: number, amount: string) => {
    const newExpenses = [...expenseEntries];
    newExpenses[index].amount = amount;
    setExpenseEntries(newExpenses);
  };

  const gasFeeResult = calculateGasFee();
  const totalDailyExpense = calculateTotalDailyExpense();

  // Expense Journal functions
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

  const getExpensesByDate = (date: string) => {
    return expenseEntries.filter((expense) => expense.date === date);
  };

  const getTotalExpensesByDate = (date: string) => {
    const expenses = getExpensesByDate(date);
    return expenses.reduce(
      (total, expense) => total + parseFloat(expense.amount || "0"),
      0
    );
  };

  const getTotalExpensesByCategory = (category: string) => {
    return expenseEntries
      .filter((expense) => expense.category === category)
      .reduce((total, expense) => total + parseFloat(expense.amount || "0"), 0);
  };

  const getTotalExpenses = () => {
    return expenseEntries.reduce(
      (total, expense) => total + parseFloat(expense.amount || "0"),
      0
    );
  };

  const getExpensesByCategory = (category: string) => {
    return expenseEntries.filter((expense) => expense.category === category);
  };

  // Currency conversion functions
  const getExchangeRate = (fromCurrency: string, toCurrency: string) => {
    const key = `${fromCurrency}_${toCurrency}`;
    return liveExchangeRates[key] || fallbackExchangeRates[key] || 1;
  };

  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => {
    if (fromCurrency === toCurrency) return amount;
    const rate = getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  };

  const swapCurrencies = () => {
    setCurrencySwap({
      ...currencySwap,
      fromCurrency: currencySwap.toCurrency,
      toCurrency: currencySwap.fromCurrency,
      exchangeRate: getExchangeRate(
        currencySwap.toCurrency,
        currencySwap.fromCurrency
      ),
    });
  };

  const updateCurrencySwap = (field: string, value: string) => {
    if (field === "fromAmount") {
      setCurrencySwap({
        ...currencySwap,
        fromAmount: value,
        exchangeRate: getExchangeRate(
          currencySwap.fromCurrency,
          currencySwap.toCurrency
        ),
      });
    } else if (field === "fromCurrency") {
      const newFromCurrency = value;
      const newExchangeRate = getExchangeRate(
        newFromCurrency,
        currencySwap.toCurrency
      );
      setCurrencySwap({
        ...currencySwap,
        fromCurrency: newFromCurrency,
        exchangeRate: newExchangeRate,
      });
    } else if (field === "toCurrency") {
      const newToCurrency = value;
      const newExchangeRate = getExchangeRate(
        currencySwap.fromCurrency,
        newToCurrency
      );
      setCurrencySwap({
        ...currencySwap,
        toCurrency: newToCurrency,
        exchangeRate: newExchangeRate,
      });
    }
  };

  const convertedAmount = convertCurrency(
    parseFloat(currencySwap.fromAmount) || 0,
    currencySwap.fromCurrency,
    currencySwap.toCurrency
  );

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };

  const sidebarItems = [
    { id: "home" as SidebarItem, label: "Home", icon: Home },
    { id: "calendar" as SidebarItem, label: "Calendar", icon: Calendar },
    { id: "streak" as SidebarItem, label: "Streak", icon: Flame },
    { id: "calculator" as SidebarItem, label: "Basio", icon: Calculator },
    { id: "stats" as SidebarItem, label: "Stats", icon: BarChart3 },
    { id: "profile" as SidebarItem, label: "Profile", icon: User },
    { id: "settings" as SidebarItem, label: "Settings", icon: Settings },
    { id: "base" as SidebarItem, label: "Base", icon: Network },
  ];

  const [activeCalculatorTab, setActiveCalculatorTab] = useState("gas");

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "year">("month");

  // Get current month/year for navigation
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToPreviousYear = () => {
    setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
  };

  const goToNextYear = () => {
    setCurrentDate(new Date(currentYear + 1, currentMonth, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Generate calendar days
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

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Check if date has entries
  const hasEntriesForDate = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    return entries.some((entry) => entry.date === dateString);
  };

  // Check if date is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  // Handle date selection
  const handleDateClick = (day: number) => {
    if (day) {
      setSelectedDate(new Date(currentYear, currentMonth, day));
    }
  };

  // Get month name
  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month];
  };

  // Get day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderContent = () => {
    switch (activeSidebarItem) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Feed Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white pixelated-text mb-2">
                DailyBase Feed
              </h1>
              <p className="text-blue-300 pixelated-text">
                Your personal crypto journey timeline
              </p>
            </div>

            {/* Create New Post */}
            <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-blue-400/20">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg">
                      DB
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-blue-300 flex items-center gap-2 pixelated-text">
                      <Plus className="w-5 h-5" />
                      What's happening in your crypto world today?
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <DailyEntry
                  userId={baseUserId}
                  onSave={handleJournalSave}
                  todayEntry={convertToJournal(getTodayEntry())}
                />
              </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                      <Skeleton className="h-[120px] w-full rounded-xl" />
                      <div className="flex gap-4 mt-4">
                        <Skeleton className="h-8 w-16 rounded" />
                        <Skeleton className="h-8 w-16 rounded" />
                        <Skeleton className="h-8 w-16 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : /* Feed Posts */
            entries.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white pixelated-text mb-3">
                    Your Feed is Empty
                  </h3>
                  <p className="text-blue-300 text-center mb-8 max-w-md leading-relaxed">
                    Start your DailyBase journey by creating your first entry.
                    Share your crypto activities, track your progress, and build
                    meaningful streaks.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white pixelated-text px-8 py-3 text-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {dbEntries.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass hover-lift transition-all duration-300"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12 ring-2 ring-blue-400/20 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold">
                              {entry.dateCreated
                                ? new Date(entry.dateCreated)
                                    .getDate()
                                    .toString()
                                    .padStart(2, "0")
                                : "DB"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-semibold text-white pixelated-text text-lg">
                                {entry.baseUserId.slice(0, 6)}...
                                {entry.baseUserId.slice(-4)}
                              </div>
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text text-xs">
                                Entry #{index + 1}
                              </Badge>
                            </div>
                            <div className="text-sm text-blue-300 pixelated-text flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {entry.dateCreated
                                ? new Date(
                                    entry.dateCreated
                                  ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "No date"}
                              <span className="text-blue-300/60">•</span>
                              <span>
                                {entry.dateCreated
                                  ? new Date(
                                      entry.dateCreated
                                    ).toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                  : "No time"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-full p-2"
                          >
                            <Heart className="w-4 h-4" />
                            <span className="sr-only">Like</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-full p-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span className="sr-only">Comment</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-full p-2"
                          >
                            <Share2 className="w-4 h-4" />
                            <span className="sr-only">Share</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {entry.photo && (
                        <div className="mb-4 rounded-xl overflow-hidden">
                          <img
                            src={entry.photo}
                            alt="Journal entry"
                            className="w-full h-auto max-h-64 object-cover"
                          />
                        </div>
                      )}
                      <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
                        <p className="text-white leading-relaxed pixelated-text text-lg">
                          {entry.journal}
                        </p>
                      </div>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {entry.tags.map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text hover:bg-blue-500/30 transition-colors"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
                        <div className="flex items-center gap-4 text-sm text-blue-300/70">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {entry.likes} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />0 comments
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            Share
                          </span>
                        </div>
                        {/* <div className="text-xs text-blue-300/50">
                          {entry.privacy === "public" ? (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Public
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Private
                            </span>
                          )}
                        </div> */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      case "calendar":
        return (
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white pixelated-text mb-2">
                Calendar View
              </h1>
              <p className="text-blue-300 pixelated-text">
                Track your daily entries and activities
              </p>
            </div>

            {/* Calendar Navigation */}
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
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center">
                      <div className="text-sm font-semibold text-blue-300 pixelated-text">
                        {day}
                      </div>
                    </div>
                  ))}

                  {/* Calendar Days */}
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

            {/* Selected Date Details */}
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
                          `${selectedYear}-${String(selectedMonth + 1).padStart(
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

            {/* Calendar Stats */}
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
      case "streak":
        return (
          <div className="space-y-6">
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
      case "calculator":
        return (
          <div className="space-y-8">
            {/* Calculator Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-3">
                Basio Calculator
              </h1>
              <p className="text-slate-400 text-lg">
                Advanced crypto calculation suite
              </p>
            </div>

            {/* Calculator Tabs */}
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

            {/* Gas Fee Calculator */}
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
                  {/* Gas Parameters */}
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

                  {/* Calculation Results */}
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

            {/* Currency Swap Calculator */}
            {activeCalculatorTab === "currency" && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Currency Converter
                  </h2>
                  <p className="text-slate-400">
                    Convert currencies with real-time exchange rates
                  </p>
                  {isLoadingRates && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-blue-300 pixelated-text">
                        Updating rates...
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-green-300 pixelated-text mt-2">
                    {Object.keys(liveExchangeRates).length > 0
                      ? "✅ Live rates active"
                      : "⚠️ Using backup rates"}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Currency Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        From Currency
                      </label>
                      <select
                        value={currencySwap.fromCurrency}
                        onChange={(e) =>
                          updateCurrencySwap("fromCurrency", e.target.value)
                        }
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
                        onChange={(e) =>
                          updateCurrencySwap("toCurrency", e.target.value)
                        }
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
                        onChange={(e) =>
                          updateCurrencySwap("fromAmount", e.target.value)
                        }
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
                      <Button
                        onClick={fetchExchangeRates}
                        variant="outline"
                        size="sm"
                        disabled={isLoadingRates}
                        className="px-4 py-3 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        {isLoadingRates ? (
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "↻"
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Conversion Results */}
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

                  {/* Exchange Rates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-blue-400 mb-1">
                        {getCurrencySymbol(currencySwap.fromCurrency)}1
                      </div>
                      <div className="text-xs text-slate-400">
                        = {getCurrencySymbol(currencySwap.toCurrency)}
                        {currencySwap.exchangeRate.toFixed(4)}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-green-400 mb-1">
                        {getCurrencySymbol(currencySwap.toCurrency)}1
                      </div>
                      <div className="text-xs text-slate-400">
                        = {getCurrencySymbol(currencySwap.fromCurrency)}
                        {(1 / currencySwap.exchangeRate).toFixed(4)}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-purple-400 mb-1">
                        {getCurrencySymbol(currencySwap.fromCurrency)}100
                      </div>
                      <div className="text-xs text-slate-400">
                        = {getCurrencySymbol(currencySwap.toCurrency)}
                        {(100 * currencySwap.exchangeRate).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Expense Journal */}
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
                  {/* Expense Entry Form */}
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
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              date: e.target.value,
                            })
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          Category
                        </label>
                        <select
                          value={newExpense.category}
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              category: e.target.value,
                            })
                          }
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
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            description: e.target.value,
                          })
                        }
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
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              amount: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              gasFee: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setNewExpense({
                              ...newExpense,
                              transactionHash: e.target.value,
                            })
                          }
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
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            notes: e.target.value,
                          })
                        }
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

                  {/* Expense Journal Entries */}
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
                                    onClick={() =>
                                      deleteExpenseEntry(expense.id)
                                    }
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
                                    <span className="font-semibold">
                                      Gas Fee:
                                    </span>{" "}
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
                )
              </div>
            )}

            {/* Analytics */}
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
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white pixelated-text mb-2">
                Profile
              </h1>
              <p className="text-blue-300 pixelated-text">
                Your DailyBase account
              </p>
            </div>

            {/* Simple Profile Card */}
            <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-blue-400/20">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                    {user?.address?.slice(2, 4).toUpperCase() || "DB"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-blue-300 pixelated-text text-xl mb-2">
                  DailyBase User
                </CardTitle>
                <div className="flex items-center justify-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text">
                    <Wallet className="w-3 h-3 mr-1" />
                    {getAddressDisplay(address)}
                  </Badge>
                  {user?.account && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30 pixelated-text">
                      <Shield className="w-3 h-3 mr-1" />
                      Base Account
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
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

                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="text-white pixelated-text font-semibold">
                      Network
                    </h3>
                    <p className="text-blue-300 pixelated-text text-sm">
                      Base Network
                    </p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text">
                    Connected
                  </Badge>
                </div>

                {baseUserId && (
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <h3 className="text-white pixelated-text font-semibold">
                        Base User ID
                      </h3>
                      <p className="text-blue-300 pixelated-text text-sm">
                        {baseUserId.slice(0, 8)}...
                      </p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30 pixelated-text">
                      Active
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Simple Statistics */}
            <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-blue-300 pixelated-text flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Your Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400 pixelated-text mb-1">
                      {entries.length}
                    </div>
                    <div className="text-sm text-blue-300 pixelated-text">
                      Total Entries
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400 pixelated-text mb-1">
                      {entries.length > 0
                        ? Math.max(...entries.map((_, i) => i + 1))
                        : 0}
                    </div>
                    <div className="text-sm text-blue-300 pixelated-text">
                      Current Streak
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disconnect Button */}
            <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <Button
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to disconnect your wallet?"
                      )
                    ) {
                      // Clear local storage for both address and baseuser ID
                      localStorage.removeItem(`dailybase-entries-${address}`);
                      if (baseUserId) {
                        localStorage.removeItem(
                          `dailybase-entries-${baseUserId}`
                        );
                      }
                      // Use the enhanced logout function if available
                      if (
                        typeof window !== "undefined" &&
                        (window as any).enhancedLogout
                      ) {
                        (window as any).enhancedLogout();
                      } else {
                        // Fallback to regular logout
                        window.location.reload();
                      }
                    }
                  }}
                  variant="outline"
                  className="w-full bg-orange-600/20 border-orange-500 text-orange-300 pixelated-text hover:bg-orange-600/30"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case "base":
        return (
          <div className="flex h-full">
            {/* Left Sidebar - Twitter-like */}
            <div className="w-80 bg-slate-900/50 border-r border-slate-700 p-4 space-y-6">
              {/* Profile Section */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {address ? address.slice(2, 4).toUpperCase() : "DB"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-semibold pixelated-text">
                      {getAddressDisplay(address)}
                    </h3>
                    <p className="text-blue-300 text-sm pixelated-text">
                      Base Network User
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-700/50 rounded-lg p-2">
                    <p className="text-white font-bold text-lg">
                      {baseUserActivity.totalEntries}
                    </p>
                    <p className="text-blue-300 text-xs">Entries</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-2">
                    <p className="text-white font-bold text-lg">
                      {baseUserActivity.weeklyEntries}
                    </p>
                    <p className="text-blue-300 text-xs">This Week</p>
                  </div>
                </div>
              </div>

              {/* Network Stats */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600">
                <h3 className="text-white font-semibold mb-3 pixelated-text flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Network Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300 text-sm">Gas Price</span>
                    <span className="text-white font-semibold">
                      {isLoadingBaseData ? (
                        <Skeleton className="h-4 w-12" />
                      ) : (
                        `${baseNetworkData.gasPrice.toFixed(1)} Gwei`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300 text-sm">Block Height</span>
                    <span className="text-white font-semibold">
                      {isLoadingBaseData ? (
                        <Skeleton className="h-4 w-16" />
                      ) : (
                        baseNetworkData.blockHeight.toLocaleString()
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300 text-sm">Daily TX</span>
                    <span className="text-white font-semibold">
                      {isLoadingBaseData ? (
                        <Skeleton className="h-4 w-16" />
                      ) : (
                        `${(baseNetworkData.dailyTransactions / 1000).toFixed(
                          0
                        )}K`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300 text-sm">TVL</span>
                    <span className="text-white font-semibold">
                      {isLoadingBaseData ? (
                        <Skeleton className="h-4 w-12" />
                      ) : (
                        `$${(baseNetworkData.tvl / 1000000000).toFixed(1)}B`
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trending Tags */}
              {baseUserActivity.favoriteTags.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600">
                  <h3 className="text-white font-semibold mb-3 pixelated-text flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending Tags
                  </h3>
                  <div className="space-y-2">
                    {baseUserActivity.favoriteTags
                      .slice(0, 5)
                      .map((tag, index) => (
                        <div
                          key={tag}
                          className="flex items-center justify-between"
                        >
                          <span className="text-blue-300 text-sm">#{tag}</span>
                          <span className="text-white text-xs bg-blue-500/20 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area - Right Side */}
            <div className="flex-1 p-6 space-y-6">
              {/* Header */}
              <div className="border-b border-slate-700 pb-4">
                <h1 className="text-2xl font-bold text-white pixelated-text">
                  Base Network
                </h1>
                <p className="text-blue-300 pixelated-text">
                  Real-time network metrics and your activity
                </p>
              </div>

              {/* Network Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-300 pixelated-text text-sm">
                          Total Transactions
                        </p>
                        <p className="text-2xl font-bold text-white pixelated-text">
                          {isLoadingBaseData ? (
                            <Skeleton className="h-8 w-20" />
                          ) : (
                            baseNetworkData.totalTransactions.toLocaleString()
                          )}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-300 pixelated-text text-sm">
                          Daily Transactions
                        </p>
                        <p className="text-2xl font-bold text-white pixelated-text">
                          {isLoadingBaseData ? (
                            <Skeleton className="h-8 w-20" />
                          ) : (
                            baseNetworkData.dailyTransactions.toLocaleString()
                          )}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-300 pixelated-text text-sm">
                          Active Users
                        </p>
                        <p className="text-2xl font-bold text-white pixelated-text">
                          {isLoadingBaseData ? (
                            <Skeleton className="h-8 w-20" />
                          ) : (
                            baseNetworkData.activeUsers.toLocaleString()
                          )}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-300 pixelated-text text-sm">
                          Market Cap
                        </p>
                        <p className="text-2xl font-bold text-white pixelated-text">
                          {isLoadingBaseData ? (
                            <Skeleton className="h-8 w-20" />
                          ) : (
                            `$${(
                              baseNetworkData.marketCap / 1000000000000
                            ).toFixed(1)}T`
                          )}
                        </p>
                      </div>
                      <Coins className="w-8 h-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                  <CardHeader>
                    <CardTitle className="text-blue-300 pixelated-text flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Your Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-blue-300 pixelated-text text-sm">
                          This Month
                        </p>
                        <p className="text-lg font-semibold text-white pixelated-text">
                          {baseUserActivity.monthlyEntries}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-blue-300 pixelated-text text-sm">
                          Avg/Day
                        </p>
                        <p className="text-lg font-semibold text-white pixelated-text">
                          {baseUserActivity.averageEntriesPerDay.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-blue-300 pixelated-text text-sm">
                        Most Active Day
                      </p>
                      <p className="text-lg font-semibold text-white pixelated-text">
                        {baseUserActivity.mostActiveDay}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-blue-300 pixelated-text text-sm">
                        Gas Spent
                      </p>
                      <p className="text-lg font-semibold text-white pixelated-text">
                        {baseUserActivity.totalGasSpent.toFixed(4)} ETH
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                  <CardHeader>
                    <CardTitle className="text-blue-300 pixelated-text flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Network Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-end justify-between gap-2 p-4">
                      {Array.from({ length: 7 }, (_, i) => {
                        const day = new Date();
                        day.setDate(day.getDate() - (6 - i));
                        const dayName = day.toLocaleDateString("en-US", {
                          weekday: "short",
                        });
                        const height = Math.random() * 100 + 20;
                        const isToday = i === 6;

                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center flex-1"
                          >
                            <div
                              className={`w-full rounded-t transition-all duration-300 ${
                                isToday ? "bg-blue-500" : "bg-blue-400/60"
                              }`}
                              style={{ height: `${height}%` }}
                            />
                            <p className="text-xs text-blue-300 pixelated-text mt-2">
                              {dayName}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
        return null;
    }
  };

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={() => setShowProfile(false)}
              variant="outline"
              className="mb-6 bg-slate-800 border-slate-600 text-white pixelated-text"
            >
              ← Back to Feed
            </Button>
            <UserProfile />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* System-themed Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Circuit board pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.2) 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.2) 2px, transparent 2px)
            `,
              backgroundSize: "40px 40px, 40px 40px, 80px 80px, 80px 80px",
            }}
          ></div>
        </div>

        {/* Digital grid lines */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px)
            `,
              backgroundSize: "100px 100px",
            }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/5 backdrop-blur-2xl border-r border-white/30 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center gap-3">
                <img
                  src="/db-removebg.png"
                  alt="DailyBase Logo"
                  className="w-10 h-10 object-contain"
                />
                <h2 className="text-lg font-bold text-white pixelated-text">
                  DailyBase
                </h2>
              </div>
              <div className="mt-4 space-y-2">
                <Badge
                  variant="outline"
                  className="bg-slate-800 border-blue-400 text-blue-300 shadow-sm pixelated-text text-xs"
                >
                  <Wallet className="w-3 h-3 mr-2" />
                  {getAddressDisplay(address)}
                </Badge>
                {user?.account && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 pixelated-text text-xs">
                    <Shield className="w-3 h-3 mr-2" />
                    Base Account
                  </Badge>
                )}
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    onClick={() => setActiveSidebarItem(item.id)}
                    variant={
                      activeSidebarItem === item.id ? "default" : "ghost"
                    }
                    className={`w-full justify-start text-left pixelated-text ${
                      activeSidebarItem === item.id
                        ? "bg-blue-600 text-white"
                        : "text-blue-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:ml-64">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setSidebarOpen(true)}
                  variant="outline"
                  size="sm"
                  className="lg:hidden bg-slate-800 border-slate-600 text-white"
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <img
                  src="/db-removebg.png"
                  alt="DailyBase Logo"
                  className="w-12 h-12 object-contain shadow-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold text-white pixelated-text">
                    DailyBase
                  </h1>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="max-w-4xl">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

