
"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WordDefinition } from '@/types/dictionary';
import { Badge } from './ui/badge';
import { Volume2 } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

const words = [
  "ephemeral", "serendipity", "petrichor", "aurora", "solitude",
  "ineffable", "mellifluous", "eloquence", "ethereal", "luminescence",
  "oblivion", "epiphany", "cynosure", "plethora", "ebullient", "halcyon",
  "laconic", "pragmatic", "quintessential", "rhetoric", "sycophant",
  "taciturn", "veracity", "zephyr", "bucolic", "denouement", "evanescent",
  "garrulous", "idiosyncratic", "magnanimous"
];

interface HomeViewProps {
  onStartQuiz: () => void;
  fetchWordDefinition: (word: string) => Promise<WordDefinition>;
}

export function HomeView({ onStartQuiz, fetchWordDefinition }: HomeViewProps) {
  const [wordOfTheDay, setWordOfTheDay] = useState<WordDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const getWord = async () => {
      setIsLoading(true);
      try {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const definition = await fetchWordDefinition(randomWord);
        setWordOfTheDay(definition);
      } catch (error) {
        console.error("Failed to fetch word of the day", error);
        // Fallback to the first word if API fails
        try {
            const definition = await fetchWordDefinition(words[0]);
            setWordOfTheDay(definition);
        } catch (e) {
             console.error("Fallback failed", e);
        }
      } finally {
        setIsLoading(false);
      }
    };
    getWord();
  }, [fetchWordDefinition]);

  const handlePronunciation = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio playback failed.", e));
    }
  };

  const audioUrl = wordOfTheDay?.phonetics.find(p => p.audio)?.audio;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Word of the Day</CardTitle>
          <CardDescription>Expand your vocabulary with a new word daily.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <WordOfTheDaySkeleton />}
          {wordOfTheDay && !isLoading && (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold capitalize">{wordOfTheDay.word}</h3>
                {audioUrl && (
                  <>
                    <Button variant="ghost" size="icon" onClick={handlePronunciation} aria-label="Listen to pronunciation">
                        <Volume2 className="h-6 w-6" />
                    </Button>
                    <audio ref={audioRef} src={audioUrl} preload="none" />
                  </>
                )}
              </div>
              <p className="text-primary">{wordOfTheDay.phonetic}</p>
              <div className='mt-4'>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold mb-2 dark:bg-secondary dark:text-secondary-foreground">{wordOfTheDay.meanings[0].partOfSpeech}</Badge>
                <p>{wordOfTheDay.meanings[0].definitions[0].definition}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Vocabulary Quiz</CardTitle>
            <CardDescription>Test your knowledge and see how high you can score.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Take a quick 5-question quiz to challenge your vocabulary.</p>
        </CardContent>
        <CardFooter>
            <Button onClick={onStartQuiz}>
                Start Quiz
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

const WordOfTheDaySkeleton = () => (
    <div className="space-y-4">
        <div className='flex items-center justify-between'>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/3" />
        <div className='space-y-2 pt-4'>
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    </div>
)
