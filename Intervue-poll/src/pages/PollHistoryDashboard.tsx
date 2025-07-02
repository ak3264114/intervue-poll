import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Clock, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

interface PollOption {
  text: string;
  isCorrect: boolean;
  count: number;
}

interface PollHistoryItem {
  id: number;
  question: string;
  options: PollOption[];
  responses: { [studentName: string]: number };
  startTime: number;
  endTime: number;
}

const PollHistoryDashboard = () => {
    const [expandedPoll, setExpandedPoll] = useState<number | null>(null);
    const [pollData, setPollData] = useState<PollHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const getDuration = (start, end) => {
        const duration = Math.floor((end - start) / 1000);
        return `${duration}s`;
    };

    const getTotalResponses = (responses) => {
        return Object.keys(responses).length;
    };

    const getCorrectResponsesCount = (poll) => {
        const correctOptionIndex = poll.options.findIndex(opt => opt.isCorrect);
        return Object.values(poll.responses).filter(response => response === correctOptionIndex).length;
    };

    const getAccuracyPercentage = (poll) => {
        const total = getTotalResponses(poll.responses);
        const correct = getCorrectResponsesCount(poll);
        return total > 0 ? Math.round((correct / total) * 100) : 0;
    };

    const togglePollExpansion = (pollId) => {
        setExpandedPoll(expandedPoll === pollId ? null : pollId);
    };

    useEffect(() => {
        const fetchPollHistory = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/polls/history`);
                setPollData(res.data.data || []);
            } catch (err) {
                setError('Failed to fetch poll history.');
            } finally {
                setLoading(false);
            }
        };

        fetchPollHistory();
    }, []);

    if (loading) {
        return <div className="p-6 text-center text-lg">Loading poll history...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">{error}</div>;
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-800">Poll History Dashboard</h1>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                        <div className="flex items-center justify-between">
                            
                            <div className="text-sm text-gray-500">
                                Total Polls: <span className="font-semibold text-indigo-600">{pollData.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Polls Grid */}
                <div className="grid gap-6">
                    {pollData?.map((poll, index) => {
                        const isExpanded = expandedPoll === poll.id;
                        const accuracy = getAccuracyPercentage(poll);
                        const totalResponses = getTotalResponses(poll.responses);

                        return (
                            <div key={poll.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                                {/* Poll Header */}
                                <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold mb-2">Poll #{index + 1}</h2>
                                            <p className="text-lg bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                                                {poll.question}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => togglePollExpansion(poll.id)}
                                            className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                                            <Users className="w-5 h-5 mx-auto mb-1" />
                                            <p className="text-sm opacity-90">Responses</p>
                                            <p className="font-bold text-lg">{totalResponses}</p>
                                        </div>
                                        <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                                            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-300" />
                                            <p className="text-sm opacity-90">Accuracy</p>
                                            <p className="font-bold text-lg">{accuracy}%</p>
                                        </div>
                                        <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                                            <Clock className="w-5 h-5 mx-auto mb-1" />
                                            <p className="text-sm opacity-90">Duration</p>
                                            <p className="font-bold text-lg">{getDuration(poll.startTime, poll.endTime)}</p>
                                        </div>
                                        <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                                            <BarChart3 className="w-5 h-5 mx-auto mb-1" />
                                            <p className="text-sm opacity-90">Options</p>
                                            <p className="font-bold text-lg">{poll.options.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Options Overview */}
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Poll Options</h3>
                                    <div className="grid gap-3">
                                        {poll.options.map((option, optionIndex) => {
                                            const percentage = totalResponses > 0 ? Math.round((option.count / totalResponses) * 100) : 0;

                                            return (
                                                <div key={optionIndex} className="relative">
                                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                                                        <div className="flex items-center gap-3">
                                                            {option.isCorrect ? (
                                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-red-400" />
                                                            )}
                                                            <span className="font-medium text-gray-800">{option.text}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-sm text-gray-600">{option.count} votes</span>
                                                            <span className="font-bold text-indigo-600">{percentage}%</span>
                                                        </div>
                                                    </div>
                                                    {/* Progress Bar */}
                                                    <div className="absolute bottom-0 left-0 h-1 bg-indigo-200 rounded-b-xl overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Detailed View */}
                                {isExpanded && (
                                    <div className="border-t bg-gray-50/50 p-6 animate-in slide-in-from-top duration-300">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Individual Responses */}
                                            <div>
                                                <h4 className="text-lg font-semibold mb-4 text-gray-800">Individual Responses</h4>
                                                <div className="space-y-2">
                                                    {Object.entries(poll.responses).map(([student, responseIndex]) => {
                                                        const selectedOption = poll.options[responseIndex];
                                                        const isCorrect = selectedOption?.isCorrect;

                                                        return (
                                                            <div key={student} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                                                <span className="font-medium text-gray-700">{student}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-gray-600">"{selectedOption?.text}"</span>
                                                                    {isCorrect ? (
                                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                                    ) : (
                                                                        <XCircle className="w-4 h-4 text-red-400" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Poll Metadata */}
                                            <div>
                                                <h4 className="text-lg font-semibold mb-4 text-gray-800">Poll Details</h4>
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-white rounded-lg border">
                                                        <p className="text-sm text-gray-600">Poll ID</p>
                                                        <p className="font-mono text-sm">{poll.id}</p>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border">
                                                        <p className="text-sm text-gray-600">Start Time</p>
                                                        <p className="text-sm">{formatDate(poll.startTime)}</p>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border">
                                                        <p className="text-sm text-gray-600">End Time</p>
                                                        <p className="text-sm">{formatDate(poll.endTime)}</p>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border">
                                                        <p className="text-sm text-gray-600">Total Duration</p>
                                                        <p className="text-sm font-semibold">{getDuration(poll.startTime, poll.endTime)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PollHistoryDashboard;