
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';


interface PollOptionInput {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface TeacherCreatePollProps {
  onSubmit: (question: string, options: PollOptionInput[], duration: number) => void;
  onBack: () => void;
}

const TeacherCreatePoll: React.FC<TeacherCreatePollProps> = ({ onSubmit, onBack }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOptionInput[]>([
    { id: '1', text: '', isCorrect: true },
    { id: '2', text: '', isCorrect: false },
  ]);
  const [duration, setDuration] = useState(60);

  const addOption = () => {
    const newOption: PollOptionInput = {
      id: Date.now().toString(),
      text: '',
      isCorrect: false,
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(option =>
      option.id === id ? { ...option, text } : option
    ));
  };

  const toggleCorrect = (id: string) => {
    setOptions(options.map(option => ({
      ...option,
      isCorrect: option.id === id
    })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter(option => option.text.trim());
    const correctOptionExists = validOptions.some(opt => opt.isCorrect);

    if (question.trim() && validOptions.length >= 2 && correctOptionExists) {
      onSubmit(question.trim(), validOptions, duration);
    }
  };

  const isValid = question.trim() && options.filter(option => option.text.trim()).length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-3xl mx-auto py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="hover:bg-white/50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
            <span className="text-primary-foreground text-lg font-bold">IP</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Let's Get Started
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </p>
        </div>

        {/* Create Poll Form */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Create New Poll</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Question Input */}
              <div className="space-y-3">
                <Label htmlFor="question" className="text-lg font-medium">
                  Enter your question
                </Label>
                <Input
                  id="question"
                  placeholder="Which planet is known as the Red Planet?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="h-12 text-lg bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <div className="text-right text-sm text-gray-500">
                  {question.length}/100
                </div>
              </div>

              {/* Duration Selector */}
              <div className="flex items-center space-x-4">
                <Label className="text-lg font-medium">Duration:</Label>
                <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="90">90 seconds</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Edit Options</Label>
                  <Label className="text-lg font-medium">Is it Correct?</Label>
                </div>

                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        className="flex-1 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant={option.isCorrect ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCorrect(option.id)}
                        className="rounded-xl"
                      >
                        {option.isCorrect ? "Yes" : "No"}
                      </Button>

                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(option.id)}
                          className="text-red-500 hover:text-red-700 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full h-12 border-dashed border-2 rounded-xl hover:bg-primary/5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More option
                </Button>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={!isValid}
                  className="w-full h-12 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200"
                >
                  Ask Question
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherCreatePoll;
