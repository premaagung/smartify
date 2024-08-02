"use client";
import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Chapter, Question } from "@prisma/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, CheckCircle, XCircle } from "lucide-react";

type Props = {
  chapter: Chapter & {
    questions: Question[];
  };
};

const QuizCards = ({ chapter }: Props) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionState, setQuestionState] = useState<Record<string, boolean | null>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const checkAnswer = useCallback(() => {
    const newQuestionState = { ...questionState };
    chapter.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return;
      newQuestionState[question.id] = userAnswer === question.answer;
    });
    setQuestionState(newQuestionState);
    setIsSubmitted(true);
  }, [answers, questionState, chapter.questions]);

  return (
    <Card className="mt-8 bg-dark-background text-dark">
      <CardHeader className="border-b border-dark-border">
        <CardTitle className="text-2xl font-bold text-dark">Concept Check</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {chapter.questions.map((question) => {
          const options = JSON.parse(question.options) as string[];
          const isAnswered = questionState[question.id] !== undefined;
          const isCorrect = questionState[question.id] === true;

          return (
            <Card
              key={question.id}
              className={cn("transition-colors border rounded-lg", {
                "border-green-500 bg-green-900": isAnswered && isCorrect,
                "border-red-500 bg-red-900": isAnswered && !isCorrect,
                "bg-dark-card": !isAnswered
              })}
            >
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <CardTitle className="text-lg text-dark">{question.question}</CardTitle>
                {isAnswered && (
                  isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )
                )}
              </CardHeader>
              <CardContent className="text-dark">
                <RadioGroup
                  onValueChange={(value) => {
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: value,
                    }));
                    // Allow re-answering without submission
                    if (isAnswered) {
                      setQuestionState((prev) => ({
                        ...prev,
                        [question.id]: null,
                      }));
                      setIsSubmitted(false);
                    }
                  }}
                  value={answers[question.id]}
                  className="space-y-2"
                >
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option}
                        id={`${question.id}-${index}`}
                        // Remove disable attribute to allow re-selection
                        // disabled={isAnswered}
                      />
                      <Label htmlFor={`${question.id}-${index}`} className="text-sm text-dark">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg" 
          onClick={checkAnswer}
          disabled={Object.keys(answers).length !== chapter.questions.length}
        >
          Check Answers
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizCards;
