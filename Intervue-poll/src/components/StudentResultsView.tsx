import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';
import { PollResult } from '@/types/poll';

interface StudentResultsViewProps {
  result: PollResult;
  userAnswer?: string;
}

const StudentResultsView: React.FC<StudentResultsViewProps> = ({ result, userAnswer }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
            <span className="text-primary-foreground text-lg font-bold">IP</span>
          </div>
        </div>

        {/* Question */}
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader className="bg-gray-800 text-white rounded-t-lg">
            <h2 className="text-xl font-medium">Question</h2>
            <p className="text-lg">{result.question}</p>
          </CardHeader>
        </Card>

        {/* Results */}
        <Card className="shadow-xl border-0 mb-6">
          <CardContent className="p-6">
            <div className="space-y-6">
              {result.options.map((option, index) => {
                const isYourAnswer = option.text === userAnswer;
                const isCorrect = option.isCorrect;
                const isWrongAnswer = isYourAnswer && !isCorrect;

                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isYourAnswer ? 'bg-primary text-white' : 'bg-gray-100'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>

                        <span className="text-lg font-medium">{option.text}</span>

                        {isCorrect && (
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            ✅ Correct answer
                          </span>
                        )}

                        {isYourAnswer && (
                          <span
                            className={`text-sm ${
                              isCorrect
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            } px-2 py-1 rounded-full ml-2`}
                          >
                            {isCorrect ? '🟣 Your answer' : '❌ Your answer'}
                          </span>
                        )}

                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 ml-1" />
                        ) : isWrongAnswer ? (
                          <XCircle className="w-5 h-5 text-red-500 ml-1" />
                        ) : null}
                      </div>

                      <span className="text-lg font-bold">{option.percentage}%</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Progress
                          value={option.percentage}
                          className="h-3"
                          style={{
                            background:
                              isYourAnswer && !isCorrect
                                ? 'linear-gradient(to right, #f87171, #f43f5e)'
                                : isYourAnswer
                                ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                : undefined,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Waiting Note */}
        <div className="text-center">
          <p className="text-gray-600 mt-6 text-center">
            Wait for the teacher to ask a new question..
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentResultsView;
