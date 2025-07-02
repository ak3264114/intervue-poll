import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, MessageCircle } from 'lucide-react';
import { Poll } from '@/types/poll';

interface StudentPollViewProps {
  poll: Poll;
  studentName: string;
  onSubmit: (selectedOption: string) => void;
  onTimeUp: () => void;
}

const StudentPollView: React.FC<StudentPollViewProps> = ({
  poll,
  studentName,
  onSubmit,
  onTimeUp,
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const remaining = Math.floor((poll.endTime - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.floor((poll.endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        onTimeUp();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [poll.endTime, onTimeUp]);

  const handleSubmit = () => {
    if (selectedOption && !isSubmitted) {
      setIsSubmitted(true);
      onSubmit(selectedOption);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 10) return 'text-red-500';
    if (timeLeft <= 30) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
            <span className="text-primary-foreground text-lg font-bold">IP</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${getTimerColor()}`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-medium">{formatTime(timeLeft)}</span>
            </div>
            <MessageCircle className="w-6 h-6 text-primary cursor-pointer hover:text-primary/80" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader className="bg-gray-800 text-white rounded-t-lg">
            <h2 className="text-xl font-medium">Question</h2>
            <p className="text-lg">{poll.question}</p>
          </CardHeader>
        </Card>

        {/* Options */}
        <Card className="shadow-xl border-0 mb-6">
          <CardContent className="p-6">
            <RadioGroup
              value={selectedOption}
              onValueChange={(value) => {
                if (!isSubmitted) {
                  setSelectedOption(value);
                }
              }}
            >
              <div className="space-y-4">
                {poll.options.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={option.text}
                      id={option.text}
                      disabled={isSubmitted}
                      className="w-5 h-5"
                    />
                    <Label
                      htmlFor={option.text}
                      className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedOption === option.text
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      } ${isSubmitted ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            selectedOption === option.text
                              ? 'bg-primary text-white'
                              : 'bg-gray-100'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{option.text}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitted || timeLeft === 0}
            className="px-12 py-3 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200"
          >
            {isSubmitted ? 'Submitted' : 'Submit'}
          </Button>

          {isSubmitted && (
            <p className="text-green-600 mt-3 font-medium">
              Your answer has been submitted successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPollView;
