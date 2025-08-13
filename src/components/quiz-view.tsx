
"use client";

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from './ui/progress';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const allQuestions = [
  { question: "Which word means 'a state of perfect happiness'?", options: ["Euphoria", "Dystopia", "Melancholy", "Nostalgia"], answer: "Euphoria" },
  { question: "What is the definition of 'ephemeral'?", options: ["Lasting forever", "Lasting for a very short time", "Growing stronger over time", "Related to the stars"], answer: "Lasting for a very short time" },
  { question: "Which of the following is a synonym for 'ubiquitous'?", options: ["Rare", "Scarce", "Omnipresent", "Localized"], answer: "Omnipresent" },
  { question: "What does 'pulchritudinous' mean?", options: ["Ugly", "Average-looking", "Beautiful", "Intelligent"], answer: "Beautiful" },
  { question: "A person who is 'loquacious' is very...?", options: ["Quiet", "Shy", "Talkative", "Angry"], answer: "Talkative" },
  { question: "What does 'laconic' mean?", options: ["Using very few words", "Overly emotional", "Wealthy and extravagant", "Friendly and sociable"], answer: "Using very few words" },
  { question: "Which word means 'to make something worse'?", options: ["Ameliorate", "Exacerbate", "Alleviate", "Mitigate"], answer: "Exacerbate" },
  { question: "What is a 'panacea'?", options: ["A type of disease", "A complex problem", "A solution or remedy for all difficulties", "A philosophical paradox"], answer: "A solution or remedy for all difficulties" },
  { question: "'Mellifluous' describes a sound that is...", options: ["Harsh and grating", "Loud and abrupt", "Sweet and pleasant to hear", "Silent and still"], answer: "Sweet and pleasant to hear" },
  { question: "What does 'pragmatic' mean?", options: ["Idealistic and impractical", "Dealing with things sensibly and realistically", "Artistic and creative", "Strict and authoritarian"], answer: "Dealing with things sensibly and realistically" }
];

// Function to shuffle array and pick n items
const getShuffledQuiz = (count: number) => {
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};


interface QuizViewProps {
  onBackToHome: () => void;
}

export function QuizView({ onBackToHome }: QuizViewProps) {
  const [quizQuestions, setQuizQuestions] = useState(getShuffledQuiz(5));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(5).fill(null));
  const [showResults, setShowResults] = useState(false);

  const handleSelectAnswer = (value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = value;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };
  
  const handleRestart = () => {
      setQuizQuestions(getShuffledQuiz(5));
      setCurrentQuestionIndex(0);
      setSelectedAnswers(Array(5).fill(null));
      setShowResults(false);
  }

  const score = selectedAnswers.reduce((total, answer, index) => {
    return total + (answer === quizQuestions[index].answer ? 1 : 0);
  }, 0);

  if (showResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <CardDescription>You scored {score} out of {quizQuestions.length}!</CardDescription>
        </CardHeader>
        <CardContent>
            <div className='text-center'>
                <p className="text-6xl font-bold">
                    {Math.round((score / quizQuestions.length) * 100)}%
                </p>
                <p className='text-muted-foreground'>
                    {score === 5 ? "Excellent!" : score >= 3 ? "Good job!" : "Keep practicing!"}
                </p>
            </div>
            <div className='mt-6 space-y-4'>
                {quizQuestions.map((q, i) => (
                    <div key={uuidv4()} className={`p-3 rounded-lg ${selectedAnswers[i] === q.answer ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                        <p className='font-semibold'>{q.question}</p>
                        <p className='text-sm'>Your answer: {selectedAnswers[i] || "Not answered"}</p>
                        <p className='text-sm text-primary'>Correct answer: {q.answer}</p>
                    </div>
                ))}
            </div>
        </CardContent>
        <CardFooter className='flex-col sm:flex-row gap-2'>
            <Button onClick={onBackToHome} variant="outline" className='w-full sm:w-auto'>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Button>
            <Button onClick={handleRestart} className='w-full sm:w-auto'>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
            </Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;


  return (
    <Card>
      <CardHeader>
        <Button variant="ghost" size="sm" onClick={onBackToHome} className='justify-start p-0 h-auto mb-2 w-fit'>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <CardTitle>Vocabulary Quiz</CardTitle>
        <CardDescription>Question {currentQuestionIndex + 1} of {quizQuestions.length}</CardDescription>
        <Progress value={progress} className="mt-2"/>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-semibold text-lg">{currentQuestion.question}</p>
        <RadioGroup
          value={selectedAnswers[currentQuestionIndex] ?? ""}
          onValueChange={handleSelectAnswer}
          className="space-y-2"
        >
          {currentQuestion.options.map((option) => (
            <div key={uuidv4()} className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option} className="flex-1 cursor-pointer">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button 
            onClick={handleNext} 
            disabled={!selectedAnswers[currentQuestionIndex]}
            className="w-full"
        >
          {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </CardFooter>
    </Card>
  );
}
