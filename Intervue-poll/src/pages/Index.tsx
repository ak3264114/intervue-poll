import React, { useEffect, useState } from 'react';
import LandingPage from '@/components/LandingPage';
import StudentNameInput from '@/components/StudentNameInput';
import StudentPollView from '@/components/StudentPollView';
import StudentResultsView from '@/components/StudentResultsView';
import TeacherCreatePoll from '@/components/TeacherCreatePoll';
import TeacherPollResults from '@/components/TeacherPollResults';
import { socket } from '@/lib/socket';
import API from '@/lib/api';

type AppState =
  | 'landing'
  | 'student-name'
  | 'student-poll'
  | 'student-results'
  | 'teacher-create'
  | 'teacher-results'
  | 'student-waiting';

interface PollOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  percentage?: number;
  count?: number;
}



interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  duration: number;
  responses?: Record<string, number>;
}

interface Participant {
  id: string;
  name: string;
  answer?: string;
}

interface PollResult {
  question: string;
  options: PollOption[];
  totalResponses?: number;
  timeLeft?: number;
}


const PollApp = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const [studentName, setStudentName] = useState('');
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pollResults, setPollResults] = useState<PollResult | null>(null);

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setUserRole(role);
    if (role === 'student') {
      setAppState('student-name');
    } else {
      // Check for active poll
      API.get('/polls/active')
        .then((res) => {
          if (res.data) {
            setCurrentPoll(res.data);
            setPollResults(res.data);
            setAppState('teacher-results');
          } else {
            setAppState('teacher-create');
          }
        })
        .catch(() => setAppState('teacher-create'));
    }

  };

  const fetchActivePoll = async () => {
    try {
      const res = await API.get('/polls/active');
      if (res.data) {
        setCurrentPoll(res.data);
        setAppState('student-poll');
      } else {
        setAppState('student-waiting');
      }
    } catch (error) {
      console.error('Error fetching active poll:', error);
      setAppState('student-waiting');
    }
  };

  const handleStudentNameSubmit = (name: string) => {
    setStudentName(name);
    socket.emit('register-student', { name });
    fetchActivePoll();
  };

  const handleStudentPollSubmit = (selectedOption: string) => {
    setStudentAnswer(selectedOption);
    const optionIndex = currentPoll?.options.findIndex((o) => o.id === selectedOption);
    if (currentPoll && optionIndex !== -1 && optionIndex !== undefined) {
      socket.emit('vote', {
        pollId: currentPoll.id,
        studentName,
        optionIndex,
      });
    }
    setAppState('student-results');
  };

  const handlePollTimeUp = () => {
    setAppState('student-results');
  };

  const handleTeacherCreatePoll = async (
    question: string,
    options: PollOption[],
    duration: number
  ) => {
    try {
      const res = await API.post('/polls/create', {
        question,
        options: options.map((o) => o.text),
        duration,
      });

      setCurrentPoll(res.data);
      setPollResults(res.data);
      socket.emit('poll-created', res.data);
      setAppState('teacher-results');
    } catch (err) {
      console.error('Poll creation failed:', err);
    }
  };

  const handleNewQuestion = () => {
    setAppState('teacher-create');
    setCurrentPoll(null);
    setStudentAnswer('');
    setPollResults(null);
  };

  const handleKickParticipant = (participantId: string) => {
    const student = participants.find((p) => p.id === participantId);
    if (student) {
      socket.emit('kick-student', { name: student.name });
      setParticipants(participants.filter((p) => p.id !== participantId));
    }
  };

  const handleBackToLanding = () => {
    setAppState('landing');
    setUserRole(null);
    setStudentName('');
    setCurrentPoll(null);
    setStudentAnswer('');
    setParticipants([]);
    setPollResults(null);
  };

  useEffect(() => {
    socket.on('kicked', () => {
      alert('You have been removed from the session.');
      handleBackToLanding();
    });

    socket.on('poll-updated', (updatedPoll: Poll) => {
      setCurrentPoll(updatedPoll);
      setPollResults(updatedPoll);
    });

    socket.on('student-list', (list: { name: string }[]) => {
      const formatted = list.map((s, i) => ({
        id: (i + 1).toString(),
        name: s.name,
      }));
      setParticipants(formatted);
    });

    return () => {
      socket.off('kicked');
      socket.off('poll-updated');
      socket.off('student-list');
    };
  }, []);

  const renderCurrentView = () => {
    switch (appState) {
      case 'landing':
        return <LandingPage onRoleSelect={handleRoleSelect} />;

      case 'student-name':
        return (
          <StudentNameInput onSubmit={handleStudentNameSubmit} onBack={handleBackToLanding} />
        );

      case 'student-poll':
        return currentPoll ? (
          <StudentPollView
            poll={currentPoll}
            studentName={studentName}
            onSubmit={handleStudentPollSubmit}
            onTimeUp={handlePollTimeUp}
          />
        ) : null;

      case 'student-results':
        return pollResults ? (
          <StudentResultsView result={pollResults} userAnswer={studentAnswer} />
        ) : null;

      case 'student-waiting':
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
                <span className="text-primary-foreground text-2xl font-bold">IP</span>
              </div>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Wait for the teacher to ask questions..
              </h2>
            </div>
          </div>
        );

      case 'teacher-create':
        return (
          <TeacherCreatePoll onSubmit={handleTeacherCreatePoll} onBack={handleBackToLanding} />
        );

      case 'teacher-results':
        return pollResults ? (
          <TeacherPollResults
            result={pollResults}
            participants={participants}
            onNewQuestion={handleNewQuestion}
            onKickParticipant={handleKickParticipant}
          />
        ) : null;

      default:
        return <LandingPage onRoleSelect={handleRoleSelect} />;
    }
  };

  return renderCurrentView();
};

export default PollApp;
