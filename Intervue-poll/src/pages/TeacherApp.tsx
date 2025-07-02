import React, { useEffect, useState } from 'react';
import TeacherCreatePoll from '@/components/TeacherCreatePoll';
import TeacherPollResults from '@/components/TeacherPollResults';
import { getSocket } from '@/lib/socket';
import API from '@/lib/api';
import { Poll, PollOption, PollResult } from '@/types/poll';




interface Participant {
  id: string;
  name: string;
  answer?: string;
}


interface PollOptionInput {
  id: string;
  text: string;
  isCorrect: boolean;
}

const TeacherApp = () => {
  const [appState, setAppState] = useState<'teacher-create' | 'teacher-results'>('teacher-create');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<{ name: string; message: string; timestamp: string }[]>([]);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [pollResults, setPollResults] = useState<PollResult | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    if (!socketConnected) {
      socket.connect();
      setSocketConnected(true);
    }

    // Check if there's an active poll
    API.get('/polls/active')
      .then((res) => {
        if (res.data) {
          setCurrentPoll(res.data);
          setPollResults(res.data);
          setAppState('teacher-results');
          socket.emit('get-student-list');

        } else {
          setAppState('teacher-create');
        }
      })
      .catch(() => setAppState('teacher-create'));

    // Socket listeners
    socket.on('student-list', (list: { name: string }[]) => {
      const formatted = list.map((s, i) => ({ id: (i + 1).toString(), name: s.name }));
      setParticipants(formatted);
    });

    socket.on('poll-updated', (updatedPoll: PollResult) => {
      setPollResults(updatedPoll);
    });

    socket.on('chat-broadcast', (msg: { name: string; message: string; timestamp: string }) => {
      setMessages((prev) => [...prev, msg]);
    });


    return () => {
      socket.off('student-list');
      socket.off('poll-updated');
      socket.off('chat-broadcast');
    };
  }, [socketConnected]);

  const handleCreatePoll = async (question: string, options: PollOptionInput[], duration: number) => {
    const socket = getSocket();

    try {
      const res = await API.post('/polls/create', {
        question,
        options,
        duration,
      });
      setCurrentPoll(res.data.data);
      setPollResults(res.data.data);
      socket.emit('poll-created', res.data);
      setAppState('teacher-results');
      socket.emit('get-student-list');
    } catch (err) {
      console.error('Failed to create poll:', err);
    }
  };


  const handleNewQuestion = () => {
    setAppState('teacher-create');
    setCurrentPoll(null);
    setPollResults(null);
  };

  const handleKickParticipant = (id: string) => {
    const socket = getSocket();
    const student = participants.find((p) => p.id === id);
    if (student) {
      socket.emit('kick-student', { name: student.name });
      setParticipants(participants.filter((p) => p.id !== id));
    }
  };

  if (appState === 'teacher-create') {
    return <TeacherCreatePoll onSubmit={handleCreatePoll} onBack={() => { }} />;
  }

  if (appState === 'teacher-results' && pollResults) {
    return (
      <TeacherPollResults
        result={pollResults}
        participants={participants}
        messages={messages}
        onNewQuestion={handleNewQuestion}
        onKickParticipant={handleKickParticipant}
      />
    );
  }

  return null;
};

export default TeacherApp;
