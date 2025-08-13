
"use client";
import type { WordDefinition } from "@/types/dictionary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Star, Volume2 } from "lucide-react";
import { Badge } from "./ui/badge";
import React from "react";


interface DefinitionCardProps {
  data: WordDefinition;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function DefinitionCard({ data, isFavorite, onToggleFavorite }: DefinitionCardProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const phoneticText = data.phonetic || data.phonetics.find(p => p.text)?.text;
  const audioUrl = data.phonetics.find(p => p.audio)?.audio;

  const handlePronunciation = () => {
    if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio playback failed.", e));
    }
  };

  return (
    <Card className="w-full rounded-t-3xl mt-6 flex-grow">
      <div className="flex justify-end pr-6 -mt-6">
        <Button size="icon" className="rounded-full w-14 h-14 shadow-lg" onClick={onToggleFavorite} aria-label="Save to favorites">
            <Bookmark className={`h-6 w-6 transition-colors ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-primary-foreground'}`} />
        </Button>
      </div>
      <CardHeader className="flex-row items-center justify-between pt-0">
        <div>
          <CardTitle className="text-4xl font-headline capitalize">{data.word}</CardTitle>
          <div className="flex items-center gap-2">
            {phoneticText && (
                <CardDescription className="text-primary text-lg">{phoneticText}</CardDescription>
            )}
            {audioUrl && (
                <>
                    <Button variant="ghost" size="icon" onClick={handlePronunciation} aria-label="Listen to pronunciation">
                        <Volume2 className="h-5 w-5" />
                    </Button>
                    <audio ref={audioRef} src={audioUrl} preload="none" />
                </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.meanings.map((meaning, index) => (
          <div key={index} className="mb-6 last:mb-0">
            {meaning.definitions.map((def, defIndex) => (
                <div key={defIndex} className="flex gap-4 mb-4">
                    <div className="flex-shrink-0 text-muted-foreground">{defIndex + 1}.</div>
                    <div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold mb-2 dark:bg-secondary dark:text-secondary-foreground">{meaning.partOfSpeech}</Badge>
                        <p>{def.definition}</p>
                        {def.example && (
                        <p className="text-muted-foreground italic mt-1">
                            &quot;{def.example}&quot;
                        </p>
                        )}
                    </div>
                </div>
            ))}
            {meaning.synonyms && meaning.synonyms.length > 0 && (
                <div className="mt-4 pl-8">
                    <h4 className="text-lg font-semibold text-muted-foreground">Synonyms</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {meaning.synonyms.map((s, i) => <Badge key={`${s}-${i}`} variant="outline" className="font-normal">{s}</Badge>)}
                    </div>
                </div>
            )}
          </div>
        ))}
        {data.sourceUrls && data.sourceUrls.length > 0 && (
            <div className="mt-6 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                    <span>Source: </span>
                    <a href={data.sourceUrls[0]} target="_blank" rel="noopener noreferrer" className="underline">
                        {data.sourceUrls[0]}
                    </a>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
