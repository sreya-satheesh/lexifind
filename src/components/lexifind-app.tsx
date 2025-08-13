
"use client";

import type { WordDefinition } from "@/types/dictionary";
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookMarked, Search, Star, History } from "lucide-react";
import { DefinitionCard } from "@/components/definition-card";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { HomeView } from "./home-view";
import { QuizView } from "./quiz-view";


const fetchWordDefinition = async (word: string): Promise<WordDefinition> => {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Definition not found for "${word}"`);
    }
    throw new Error("Failed to fetch definition.");
  }
  const data = await response.json();
  // The API returns an array, we'll use the first result.
  return data[0];
};

const FormSchema = z.object({
  searchTerm: z.string()
    .min(1, { message: "Please enter a word." })
    .regex(/^[a-zA-Z-]+$/, { message: "Please enter only letters or hyphens." }),
});

export function LexiFindApp() {
  const [activeView, setActiveView] = useState("home");
  const [currentResult, setCurrentResult] = useState<WordDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const { theme } = useTheme();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      searchTerm: "",
    },
  });


  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("lexifind-favorites");
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      const storedHistory = localStorage.getItem("lexifind-history");
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.error("Failed to parse from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lexifind-favorites", JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [favorites]);

  useEffect(() => {
     try {
      localStorage.setItem("lexifind-history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [history]);
  
  useEffect(() => {
    document.body.classList.remove('light-mode-gradient', 'dark-mode-gradient');
    if (theme === 'light') {
      document.body.classList.add('light-mode-gradient');
    } else if (theme === 'dark') {
      document.body.classList.add('dark-mode-gradient');
    }
  }, [theme]);


  const handleSearch = useCallback(async (wordToSearch: string) => {
    const trimmedWord = wordToSearch.toLowerCase().trim();
    if (!trimmedWord) return;

    setActiveView("search");
    setIsLoading(true);
    setError(null);
    setCurrentResult(null);
    document.querySelector('input[name="searchTerm"]')?.blur();


    try {
      const data = await fetchWordDefinition(trimmedWord);
      setCurrentResult(data);
      setHistory((prevHistory) => {
        const newHistory = [trimmedWord, ...prevHistory.filter((item) => item.toLowerCase() !== trimmedWord)];
        return newHistory.slice(0, 10);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
          variant: "destructive",
          title: "Search Error",
          description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    handleSearch(data.searchTerm);
  };

  const toggleFavorite = (word: string) => {
    const normalizedWord = word.toLowerCase();
    setFavorites((prev) =>
      prev.includes(normalizedWord) ? prev.filter((fav) => fav !== normalizedWord) : [...prev, normalizedWord]
    );
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const onHistoryOrFavoriteClick = (item: string) => {
    form.setValue("searchTerm", item);
    handleSearch(item);
  }

  const renderContent = () => {
    switch (activeView) {
      case "favorites":
        return (
          <ListView
            title="Favorites"
            items={favorites}
            onItemClick={onHistoryOrFavoriteClick}
            emptyMessage="Your favorite words will appear here."
            icon={<Star className="h-4 w-4 mr-2" />}
          />
        );
      case "history":
        return (
          <ListView
            title="Search History"
            items={history}
            onItemClick={onHistoryOrFavoriteClick}
            emptyMessage="Your recent searches will be recorded here."
            icon={<History className="h-4 w-4 mr-2" />}
            onClear={clearHistory}
          />
        );
      case "quiz":
        return <QuizView onBackToHome={() => setActiveView("home")} />;
      case "home":
        return <HomeView onStartQuiz={() => setActiveView("quiz")} fetchWordDefinition={fetchWordDefinition}/>;
      case "search":
      default:
        return (
          <>
            <div className="relative">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                  <FormField
                    control={form.control}
                    name="searchTerm"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="search"
                            placeholder="Enter a word..."
                            className="text-base rounded-full px-6 py-6"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="pl-6" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-9 h-9">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </div>
            <div className="flex-grow flex flex-col">
              {isLoading && <DefinitionSkeleton />}
              {error && !isLoading && (
                <Card className="flex flex-col items-center justify-center p-8 text-center bg-card/80 mt-6">
                    <CardHeader>
                        <CardTitle className="text-destructive">Search Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button variant="link" onClick={() => {
                            setError(null);
                            form.setValue("searchTerm", "");
                            setActiveView("search");
                        }}>Try another search</Button>
                    </CardContent>
                </Card>
              )}
              {currentResult && (
                <DefinitionCard
                  data={currentResult}
                  isFavorite={favorites.includes(currentResult.word.toLowerCase())}
                  onToggleFavorite={() => toggleFavorite(currentResult.word)}
                />
              )}
              {!isLoading && !error && !currentResult && (
                 <Card className="flex flex-col items-center justify-center p-8 text-center bg-transparent border-none shadow-none mt-6 flex-grow">
                    <CardHeader>
                        <div className="p-3 rounded-full bg-primary/10">
                            <BookMarked className="w-8 h-8 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle>Welcome to LexiFind</CardTitle>
                        <CardDescription className="mt-2">Your classic digital dictionary. <br/> Search for a word to begin.</CardDescription>
                    </CardContent>
                </Card>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto w-full">
       <header className="flex items-center justify-between p-4">
         <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-current hover:text-current" onClick={() => setActiveView('home')}>
           <div className="flex items-center gap-2 font-headline text-xl font-semibold">
             <BookMarked className="w-6 h-6 text-primary" />
             LexiFind
           </div>
         </Button>
         <ThemeToggle />
       </header>
       <main className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col">
         {renderContent()}
       </main>
       <footer className="sticky bottom-0 bg-background/80 backdrop-blur-sm p-2 border-t rounded-t-2xl">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
            <div className="flex justify-around items-center w-full">
                <Button variant={activeView === 'history' ? 'secondary' : 'ghost'} size="icon" className="w-16 h-16 rounded-2xl flex-col gap-1" onClick={() => setActiveView('history')}>
                    <History className="h-5 w-5"/>
                    <span className="text-xs">History</span>
                </Button>
                <Button variant={activeView === 'search' && currentResult === null ? 'secondary' : 'ghost'} size="icon" className="w-20 h-20 rounded-full flex-col gap-1 -translate-y-8 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90" onClick={() => { setCurrentResult(null); setError(null); form.reset(); setActiveView('search'); }}>
                    <Search className="h-7 w-7"/>
                </Button>
                <Button variant={activeView === 'favorites' ? 'secondary' : 'ghost'} size="icon" className="w-16 h-16 rounded-2xl flex-col gap-1" onClick={() => setActiveView('favorites')}>
                    <Star className="h-5 w-5"/>
                    <span className="text-xs">Favorites</span>
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">Created with ❤️, from India.</p>
        </div>
       </footer>
    </div>
  );
}

const ListView = ({ title, items, onItemClick, onClear, emptyMessage, icon }: { title: string, items: string[], onItemClick: (item: string) => void, onClear?: () => void, emptyMessage: string, icon: React.ReactNode }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center text-xl">{icon}{title}</CardTitle>
        {onClear && items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>Clear</Button>
        )}
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ScrollArea className="h-[60vh]">
            <div className="space-y-2">
              {items.map((item) => (
                <Button key={item} variant="outline" className="w-full justify-start font-normal capitalize" onClick={() => onItemClick(item)}>
                  {item}
                </Button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}

const DefinitionSkeleton = () => (
    <Card className="mt-6">
      <CardHeader className="flex-row items-center justify-between">
        <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <div className="pl-6 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
            </div>
        </div>
        <div className="space-y-4">
            <div className="pl-6 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
            </div>
        </div>
      </CardContent>
    </Card>
  )




    