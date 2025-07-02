import React, { useEffect, useState } from 'react';
import StudentNameInput from '@/components/StudentNameInput';
import StudentPollView from '@/components/StudentPollView';
import StudentResultsView from '@/components/StudentResultsView';
import ChatPopup from '@/components/ChatPopup';
import ParticipantListPopup from '@/components/ParticipantListPopup';
import { getSocket } from '@/lib/socket';
import API from '@/lib/api';
import { Poll, PollResult } from '@/types/poll';
import KickedOutView from '@/components/KickedOutView';

const StudentApp = () => {
    const [appState, setAppState] = useState<'student-name' | 'student-poll' | 'student-results' | 'student-waiting' | 'student-kicked'>('student-name');
    const [studentName, setStudentName] = useState('');
    const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
    const [studentAnswer, setStudentAnswer] = useState('');
    const [pollResults, setPollResults] = useState<PollResult | null>(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [messages, setMessages] = useState<{ name: string; message: string; timestamp: string }[]>([]);
    const [showParticipants, setShowParticipants] = useState(false);

    useEffect(() => {
        const savedName = sessionStorage.getItem('studentName');
        if (savedName) {
            setStudentName(savedName);
            handleStudentNameSubmit(savedName);
        }

        return () => {
            const socket = getSocket();
            socket.removeAllListeners(); 
        };
    }, []);

    const fetchActivePoll = async () => {
        try {
            const res = await API.get('/polls/active');
            if (res.data) {
                setCurrentPoll(res.data);
                setAppState('student-poll');
            } else {
                setAppState('student-waiting');
            }
        } catch {
            setAppState('student-waiting');
        }
    };

    const handleStudentNameSubmit = (name: string) => {
        const socket = getSocket();
        if (!socketConnected) {
            socket.connect();
            setSocketConnected(true);
        }

        setStudentName(name);
        sessionStorage.setItem('studentName', name);
        socket.emit('register-student', { name });
        fetchActivePoll();

        socket.on('kicked', () => {
            sessionStorage.removeItem('studentName');
            setStudentName('');
            setCurrentPoll(null);
            setStudentAnswer('');
            setPollResults(null);
            setAppState('student-kicked');
        });

        socket.on('poll-updated', (updatedPoll: PollResult) => {
            setPollResults(updatedPoll);
        });

        socket.on('poll-started', (payload) => {
            const pollData = payload?.data;
            if (pollData) {
                setCurrentPoll(pollData);
                setPollResults(pollData);
                setAppState('student-poll');
            }
        });


        socket.on('chat-broadcast', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });
    };

    const handleStudentPollSubmit = (selectedOption: string) => {
        const socket = getSocket();
        setStudentAnswer(selectedOption);
        socket.emit('vote', { studentName, selectedOption });
        setAppState('student-results');
    };

    const handlePollTimeUp = () => {
        setAppState('student-results');
    };

    return (
        <div>
            <ChatPopup messages={messages} studentName={studentName} participants={pollResults?.responses ? Object.keys(pollResults.responses) : []} />
            {appState === 'student-name' && (
                <StudentNameInput
                    onSubmit={handleStudentNameSubmit}
                    onBack={() => {
                        sessionStorage.removeItem('studentName');
                        setStudentName('');
                        setCurrentPoll(null);
                        setStudentAnswer('');
                        setPollResults(null);
                        setAppState('student-name');
                    }}
                />
            )}

            {appState === 'student-poll' && currentPoll && (
                <StudentPollView
                    poll={{ ...currentPoll, id: currentPoll.id.toString() }}
                    studentName={studentName}
                    onSubmit={handleStudentPollSubmit}
                    onTimeUp={handlePollTimeUp}
                />
            )}

            {appState === 'student-results' && pollResults && (
                <StudentResultsView result={pollResults} userAnswer={studentAnswer} />
            )}

            {appState === 'student-waiting' && (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center animate-fade-in">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6">
                            <span className="text-primary-foreground text-2xl font-bold">IP</span>
                        </div>
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Wait for the teacher to ask questions...
                        </h2>
                    </div>
                </div>
            )}
            {appState === 'student-kicked' && <KickedOutView />}
        </div>
    );
};

export default StudentApp;
