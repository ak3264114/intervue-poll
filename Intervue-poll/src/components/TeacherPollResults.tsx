import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, Clock, MoreVertical } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PollOption } from '@/types/poll';
import { getSocket } from '@/lib/socket';
import { useNavigate } from 'react-router-dom';


interface Participant {
  id: string;
  name: string;
  answer?: string;
}

interface Message {
  name: string;
  message: string;
  timestamp: string;
}

interface PollResult {
  question: string;
  options: (PollOption & { count?: number; percentage: number })[];
  totalResponses?: number;
  startTime: number;
  endTime: number;
}

interface TeacherPollResultsProps {
  result: PollResult;
  participants: Participant[];
  messages: Message[];
  onNewQuestion: () => void;
  onKickParticipant: (participantId: string) => void;
}

const TeacherPollResults: React.FC<TeacherPollResultsProps> = ({
  result,
  participants,
  messages,
  onNewQuestion,
  onKickParticipant,
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [teacherMessage, setTeacherMessage] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();


  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPollProgress = () => {
    const total = result.endTime - result.startTime;
    const elapsed = now - result.startTime;
    const remaining = result.endTime - now;
    const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const timeLeftInSeconds = Math.max(0, Math.floor(remaining / 1000));
    const pollEnded = remaining <= 0;
    return { percentage, timeLeftInSeconds, pollEnded };
  };

  const { percentage, timeLeftInSeconds, pollEnded } = getPollProgress();

  const answeredParticipants = participants.filter((p) => p.answer);
  const responseRate = participants.length > 0 ? (answeredParticipants.length / participants.length) * 100 : 0;

  const sendMessage = () => {
    const socket = getSocket();
    if (!teacherMessage) return;

    socket.emit('chat-message', {
      name: 'Teacher',
      message: teacherMessage,
    });
    setTeacherMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-6xl mx-auto py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
            <span className="text-primary-foreground text-lg font-bold">IP</span>
          </div>

          <div className="space-y-1 text-right flex flex-col items-end gap-2">
            <div className="flex items-center space-x-2 text-gray-600 justify-end">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-medium">
                {pollEnded ? 'Poll Ended' : formatTime(timeLeftInSeconds)}
              </span>
            </div>
            <Progress value={percentage} className="h-2 w-40 bg-gray-200" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/poll-history')}
              className="text-sm mt-2"
            >
              View Poll History
            </Button>
          </div>

        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gray-800 text-white rounded-t-lg">
                <h2 className="text-xl font-medium">Question</h2>
                <p className="text-lg">{result.question}</p>
              </CardHeader>
            </Card>

            <Card className="shadow-xl border-0">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {result.options.map((option, index) => (
                    <div key={option.text} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-lg font-medium">{option.text}</span>
                          {option.isCorrect && (
                            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Correct
                            </span>
                          )}
                        </div>
                        <span className="text-lg font-bold">{option.percentage}%</span>
                      </div>
                      <Progress value={option.percentage} className="h-4" />
                      <div className="text-sm text-gray-600">
                        {option.count} out of {result.totalResponses} students
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={onNewQuestion}
                className="px-8 py-3 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 transition-all duration-200"
              >
                + Ask a new question
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-lg font-medium">
                      {answeredParticipants.length} of {participants.length}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">students responded</div>
                  <Progress value={responseRate} className="h-2" />
                  <div className="text-lg font-bold text-primary">{Math.round(responseRate)}%</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 h-96">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
                <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="participants">Participants</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="p-4 h-full overflow-hidden">
                  <div className="space-y-4 h-full flex flex-col">
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg p-3 ${idx % 2 === 0 ? 'bg-gray-100' : 'bg-primary/10 ml-6'}`}
                        >
                          <div className={`text-sm font-medium ${idx % 2 === 0 ? 'text-blue-600' : 'text-purple-600'}`}>
                            {msg.name}
                          </div>
                          <div className="text-sm">{msg.message}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex border-t mt-4">
                      <input
                        value={teacherMessage}
                        onChange={(e) => setTeacherMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border-0 outline-none"
                      />
                      <Button onClick={sendMessage} className="rounded-none rounded-r-xl">
                        Send
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="participants" className="p-4 h-full overflow-hidden">
                  <div className="space-y-2 h-full overflow-y-auto">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium">{participant.name}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onKickParticipant(participant.id)}
                              className="text-red-600"
                            >
                              Kick out
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPollResults;
