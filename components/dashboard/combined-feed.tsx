"use client";

import { UserProfile } from "@/components/auth/user-profile";
import { DailyEntry } from "@/components/dashboard/daily-entry";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity,
  BarChart3,
  BookOpen,
  Calculator,
  Calendar,
  Check,
  Coins,
  Copy,
  Flame,
  Heart, 
  Home,
  LogOut,
  Menu,
  MessageSquare, 
  Network,
  Plus,
  Settings,
  Share2, 
  Shield,
  Target,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ContributionGrid } from "@/components/dashboard/contribution-grid";
import { StreakTracker } from "@/components/dashboard/streak-tracker";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { baseNetworkAPI } from "@/lib/baseNetworkAPI";
import { exchangeRateService } from "@/lib/config";

interface DailyEntry {
  id: string;
  date: string;
  content: string;
  tags: string[];
  timestamp: number;
}

interface DashboardProps {
  address: string;
}

//ito gagamitin pag galing db yung JOURNAL NA GUSTO MO KUNIN
interface Journal {
  id: string;
  baseUserId: string;
  photo?: string; // Optional because it has ? in the model
  journal: string;
  likes: number;
  tags: string[];
  privacy: string;
  dateCreated: Date;
}

//ito gagamtin pag sa commnets(blueprint)
interface Comment {
  id: String;
  baseUserId: String;
  journalId: String;
  comment: String;
  dateCreated: Date;
}

type SidebarItem =
  | "home"
  | "calendar" 
  | "calculator"
  | "stats"
  | "streak"
  | "profile"
  | "settings"
  | "base";

export default function Dashboard({ address }: DashboardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] =
    useState<SidebarItem>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fetchIntervalRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const [dbEntries, setDbEntries] = useState<Journal[]>([]);
const [commentsCount, setCommentsCount] = useState<{[key: string]: number}>({});
  const [dbComments, setDbComments] = useState<Comment[]>([]);
   const [currentJournalId, setCurrentJournalId] = useState<string | null>(
     null
   );

  console.log("ito yung db comments",dbComments)
  // Post comment
  const postComment = async (journalId: string, comment: string) => {
    if (!user?.address) {
      throw new Error("User not authenticated");
    }

    if (!journalId || !comment) {
      throw new Error("Missing required fields: journalId or comment");
    }

    try {
      const response = await fetch("/api/comment/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          journalId,
          baseUserId: user.address, // Automatically use the authenticated user's address
          comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post comment");
      }

      return await response.json();
    } catch (error) {
      console.error("Post comment error:", error);
      throw error;
    }
  };

  

  // Example usage:
  // try {
  //   const newComment = await postComment('journal123', 'user456', 'Great post!');
  //   console.log('Comment created:', newComment);
  // } catch (error) {
  //   console.error('Error posting comment:', error);
  // }


  //fetching comments
  const fetchJournalComments = async (journalId: string) => {
    if (!journalId) {
      throw new Error("Journal ID is required");
    }

    try {
      const response = await fetch("/api/comments/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ journalId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data: Comment[] = await response.json();
      setDbComments(data);
      return data;
    } catch (error) {
      console.error("Fetch comments error:", error);
      throw error;
    }
  };

  // Set up interval for auto-refresh
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (currentJournalId) {
      // Fetch immediately
      fetchJournalComments(currentJournalId);

      // Then set up interval for every 5 seconds
      intervalId = setInterval(() => {
        fetchJournalComments(currentJournalId);
      }, 5000);
    }

    // Clean up interval on component unmount or when journalId changes
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentJournalId]);

  


  //fetching ng mga journal sa database
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

                          <button
                            onClick={async () => {
                              const comment = prompt("Enter your comment:");
                              if (comment) {
                                try {
                                  await postComment(entry.id, comment);
                                  alert("Comment posted!");
                                  // Optionally refresh comments after posting
                                  const updatedComments =
                                    await fetchJournalComments(entry.id);
                                  // Update your state here if needed
                                } catch (err: any) {
                                  alert(`Error: ${err.message}`);
                                }
                              }
                            }}
                            className="flex items-center gap-1 hover:text-blue-200 cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                           {dbComments.length} comments
                          </button>

                          <span className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            Share
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
              </div>
            )}
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
        