import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useAssessment } from '@/contexts/AssessmentContext';
import { QUESTIONS, GOLDEN_QUESTIONS, DIMENSIONS } from '@/lib/constants';
import { calculateDimensionScore } from '@/lib/algorithm';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function Assessment() {
  const { answers, setAnswer, calculateResult } = useAssessment();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState(QUESTIONS);
  const [, setLocation] = useLocation();

  // Logic to insert Golden Questions dynamically
  useEffect(() => {
    // Check if we just finished a dimension block
    // Dimensions are ordered in QUESTIONS: Y/A (0-6), X/S (7-13), Z/W (14-20), K/M (21-27)
    // Each dimension has 7 questions.
    
    const currentQ = activeQuestions[currentQuestionIndex];
    if (!currentQ) return; // End of assessment

    // Check previous question to see if we need to trigger golden questions
    // This logic is a bit complex because we need to know when a dimension ends.
    // Let's simplify: Check after every answer if we completed a dimension and need to insert GQs.
    
  }, [currentQuestionIndex, answers]);

  const handleOptionSelect = (value: string) => {
    const currentQ = activeQuestions[currentQuestionIndex];
    setAnswer(currentQ.id, value);

    // Check if we need to insert Golden Questions
    // We need to check if this was the last question of a dimension
    const currentDimension = currentQ.dimension;
    const nextQ = activeQuestions[currentQuestionIndex + 1];
    
    // If next question is different dimension or undefined (end), we check score
    if (!nextQ || nextQ.dimension !== currentDimension) {
       // Calculate temp score for this dimension
       // We need a way to get all answers for this dimension, including the one just set
       const tempAnswers = { ...answers, [currentQ.id]: value };
       const result = calculateDimensionScore(tempAnswers, currentDimension);
       
       if (result.diff >= 1 && result.diff <= 2) {
         // Trigger Golden Questions
         const gqs = GOLDEN_QUESTIONS.filter(gq => gq.dimension === currentDimension);
         
         // Check if already inserted to avoid duplicates
         const alreadyInserted = activeQuestions.some(q => q.id === gqs[0].id);
         
         if (!alreadyInserted) {
           const newQuestions = [...activeQuestions];
           newQuestions.splice(currentQuestionIndex + 1, 0, ...gqs);
           setActiveQuestions(newQuestions);
         }
       }
    }

    if (currentQuestionIndex < activeQuestions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300); // Small delay for visual feedback
    } else {
      calculateResult();
      setLocation('/result');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const currentQuestion = activeQuestions[currentQuestionIndex];
  
  // Guard clause to prevent rendering if currentQuestion is undefined (e.g. during transition to result)
  if (!currentQuestion) {
    return null; 
  }

  const progress = ((currentQuestionIndex + 1) / activeQuestions.length) * 100;
  const dimensionInfo = DIMENSIONS[currentQuestion.dimension];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full py-8">
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>进度 {currentQuestionIndex + 1} / {activeQuestions.length}</span>
            <span className="font-medium" style={{ color: dimensionInfo.color }}>
              当前维度: {dimensionInfo.name}
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md overflow-hidden">
              <CardContent className="p-6 md:p-10 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary leading-snug">
                    {currentQuestion.text}
                  </h2>
                  {currentQuestion.isGolden && (
                    <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-accent rounded-full animate-pulse">
                      决胜题触发
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between group
                        ${answers[currentQuestion.id] === option.value 
                          ? 'border-primary bg-primary/5 text-primary shadow-inner' 
                          : 'border-transparent bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30'
                        }
                      `}
                    >
                      <span className="text-lg font-medium">{option.label}</span>
                      {answers[currentQuestion.id] === option.value && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          <Button 
            variant="ghost" 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0}
            className="text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> 上一题
          </Button>
          {/* Next button is implicit via option selection, but could be added if multi-select */}
        </div>
      </div>
    </Layout>
  );
}
