
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';

interface StudentNameInputProps {
  onSubmit: (name: string) => void;
  onBack: () => void;
}

const StudentNameInput: React.FC<StudentNameInputProps> = ({ onSubmit, onBack }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 -ml-2 hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
            <span className="text-primary-foreground text-xl font-bold">IV</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Let's Get Started
          </h1>
          <p className="text-gray-600">
            If you're a student, you'll be able to <span className="font-medium text-primary">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
          </p>
        </div>

        {/* Name Input Form */}
        <Card className="shadow-lg border-0 gradient-card bg-white">
          <CardHeader className="text-center pb-4">
            <h2 className="text-xl font-semibold">Enter your Name</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Rahul Bajaj"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 text-lg bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200"
                disabled={!name.trim()}
              >
                Continue
              </Button>
            </form>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              This identity is saved only for this tab
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentNameInput;
