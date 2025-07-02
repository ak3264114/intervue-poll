import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BookOpen } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
            <span className="text-primary-foreground text-xl font-bold">IV</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-primary">Intervue Poll</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Please select the role that best describes you to begin using the live polling system
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Student Card */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-primary/50 bg-white"
            onClick={() => navigate('/student')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors">
                <Users className="w-8 h-8 text-blue-600 group-hover:text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">I'm a Student</h3>
              <p className="text-gray-600 text-sm">
                Join live polls and view live poll results in real time
              </p>
            </CardContent>
          </Card>

          {/* Teacher Card */}
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 hover:border-primary/50 bg-white"
            onClick={() => navigate('/teacher')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors">
                <BookOpen className="w-8 h-8 text-purple-600 group-hover:text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">I'm a Teacher</h3>
              <p className="text-gray-600 text-sm">
                Create live polls and view live poll results in real time
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
