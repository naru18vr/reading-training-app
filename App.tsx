
import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import { HashRouter, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import { works } from './data';
import { Work, Excerpt, UserAnswers, AnswerData } from './types';
import { BookOpenIcon, CheckCircleIcon, ArrowRightIcon, AlertTriangleIcon, TrophyIcon } from './components/icons';

// --- Context for Managing Answers ---
interface AnswersContextType {
  answers: UserAnswers;
  saveAnswers: (workId: string, excerptId: number, userAnswers: string[], studyTime: number) => void;
  getAttemptCount: (workId:string, excerptId: number) => number;
}

const AnswersContext = createContext<AnswersContextType | null>(null);

const useAnswers = () => {
  const context = useContext(AnswersContext);
  if (!context) {
    throw new Error('useAnswers must be used within an AnswersProvider');
  }
  return context;
};

// --- Helper Components ---

const Annotation = ({ text, note }: { text: string; note: string }) => (
    <span className="relative group">
      <span className="text-blue-600 font-bold cursor-pointer underline decoration-dotted decoration-blue-600/50">{text}</span>
      <span className="absolute bottom-full mb-2 w-64 bg-slate-800 text-white text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 left-1/2 -translate-x-1/2">
        {note}
        <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </span>
    </span>
);

const renderTextWithAnnotations = (text: string, notes: Record<string, string>) => {
    const parts = text.split(/(※\d+)/g);
    return parts.map((part, index) => {
        if (part.match(/※\d+/) && notes[part.replace('※', '')]) {
            const noteKey = part.replace('※', '');
            return <Annotation key={index} text={part} note={notes[noteKey]} />;
        }
        return part;
    });
};

// --- Page Components ---

const HomePage = () => {
    const { getAttemptCount } = useAnswers();
    const navigate = useNavigate();

    const getCompletionPercentage = (work: Work) => {
        if (work.excerpts.length === 0) return 0;
        const completedCount = work.excerpts.filter(e => getAttemptCount(work.id, e.id) > 0).length;
        return (completedCount / work.excerpts.length) * 100;
    };
    
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold text-slate-800">読解トレーニング</h1>
                <p className="text-slate-600 mt-2">青空文庫の名作で、国語の力を伸ばそう。</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {works.map((work) => {
                    const percentage = getCompletionPercentage(work);
                    return (
                        <div key={work.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                           <div className="p-6">
                               <div className="flex items-center mb-4">
                                   <BookOpenIcon className="h-8 w-8 text-sky-500 mr-3"/>
                                   <div>
                                       <p className="text-sm font-semibold text-slate-500">{work.author}</p>
                                       <h2 className="text-xl font-bold text-slate-900">{work.title}</h2>
                                   </div>
                               </div>
                               <p className="text-slate-600 text-sm mb-4 h-20">{work.description}</p>
                               <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                                  <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                               </div>
                               <button onClick={() => navigate(`/work/${work.id}`)} disabled={work.excerpts.length === 0} className="w-full flex items-center justify-center bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                   {work.excerpts.length > 0 ? '挑戦する' : '準備中'}
                                   {work.excerpts.length > 0 && <ArrowRightIcon className="h-5 w-5 ml-2" />}
                               </button>
                           </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ExcerptListPage = () => {
    const { workId } = useParams<{ workId: string }>();
    const { getAttemptCount } = useAnswers();
    const work = works.find(w => w.id === workId);

    if (!work) {
        return <div className="text-center p-8">作品が見つかりません。</div>;
    }
    
    if (work.excerpts.length === 0) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
            <header className="mb-8">
                <Link to="/" className="text-sky-600 hover:underline mb-2 inline-block">&larr; 作品選択に戻る</Link>
                <p className="text-slate-500">{work.author}</p>
                <h1 className="text-3xl font-bold text-slate-800">{work.title}</h1>
            </header>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-slate-700 mb-4">コンテンツ準備中</h2>
              <p className="text-slate-600">この作品の抜粋と問題は現在準備中です。他の作品をお試しください。</p>
            </div>
        </div>
      );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <header className="mb-8">
                <Link to="/" className="text-sky-600 hover:underline mb-2 inline-block">&larr; 作品選択に戻る</Link>
                <p className="text-slate-500">{work.author}</p>
                <h1 className="text-3xl font-bold text-slate-800">{work.title}</h1>
            </header>
            <div className="space-y-3">
                {work.excerpts.map((excerpt, index) => {
                    const attempts = getAttemptCount(work.id, excerpt.id);
                    return (
                        <Link to={`/work/${work.id}/excerpt/${excerpt.id}`} key={excerpt.id} className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                            <div>
                                <span className="font-semibold text-slate-700">抜粋 {index + 1} / {work.excerpts.length}</span>
                                <p className="text-slate-600 text-md mt-1">{excerpt.subtitle}</p>
                            </div>
                            {attempts > 0 ? (
                                <div className="flex items-center text-green-600 flex-shrink-0 ml-4">
                                    <CheckCircleIcon className="h-6 w-6 mr-1" />
                                    <span className="font-bold">{attempts}回 挑戦済</span>
                                </div>
                            ) : (
                               <div className="flex items-center text-slate-400 flex-shrink-0 ml-4">
                                    <span className="mr-2">未挑戦</span>
                                    <ArrowRightIcon className="h-5 w-5" />
                               </div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    );
};

const QuizPage = () => {
    const { workId, excerptId } = useParams<{ workId: string, excerptId: string }>();
    const navigate = useNavigate();
    const { saveAnswers } = useAnswers();
    
    const work = useMemo(() => works.find(w => w.id === workId), [workId]);
    const excerpt = useMemo(() => work?.excerpts.find(e => e.id.toString() === excerptId), [work, excerptId]);
    const excerptIndex = useMemo(() => work?.excerpts.findIndex(e => e.id.toString() === excerptId) ?? -1, [work, excerptId]);

    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [startTime, setStartTime] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        if (excerpt) {
            setUserAnswers(Array(excerpt.questions.length).fill(''));
        }
    }, [excerpt]);

    useEffect(() => {
        setStartTime(Date.now());
    }, []);

    if (!work || !excerpt) {
        return <div className="text-center p-8">問題が見つかりません。</div>;
    }
    
    const handleAnswerChange = (index: number, value: string) => {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[index] = value;
            return newAnswers;
        });
        if(error) setError('');
    };

    const handleSubmit = () => {
        if (userAnswers.some(answer => answer.trim() === '')) {
            setError('すべての設問に回答してください。');
            return;
        }
        const studyTimeInSeconds = Math.round((Date.now() - startTime) / 1000);
        saveAnswers(work.id, excerpt.id, userAnswers, studyTimeInSeconds > 0 ? studyTimeInSeconds : 1);
        navigate(`/work/${work.id}/excerpt/${excerpt.id}/result`);
    };
    
    const allFilled = userAnswers.every(a => a.trim() !== '');

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <header className="mb-6 border-b pb-4">
                 <Link to={`/work/${work.id}`} className="text-sky-600 hover:underline mb-2 inline-block">&larr; 抜粋選択に戻る</Link>
                 <h1 className="text-2xl font-bold text-slate-800">{work.title}</h1>
                {excerpt && <p className="text-lg text-slate-600 mt-1">抜粋 {excerptIndex !== -1 ? excerptIndex + 1 : ''} / {work.excerpts.length}：{excerpt.subtitle}</p>}
            </header>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4 text-slate-700">本文</h2>
                <p className="text-slate-800 leading-loose whitespace-pre-wrap">
                    {renderTextWithAnnotations(excerpt.text, excerpt.notes)}
                </p>
                {Object.keys(excerpt.notes).length > 0 &&
                    <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold text-slate-600 mb-2">注釈</h3>
                        <ul className="list-disc list-inside text-sm text-slate-600">
                            {Object.entries(excerpt.notes).map(([key, value]) => (
                                <li key={key}><span className="font-bold">※{key}:</span> {value}</li>
                            ))}
                        </ul>
                    </div>
                }
            </div>

            <div className="space-y-6">
                {excerpt.questions.map((q, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                        <label htmlFor={`q-${index}`} className="block text-lg font-semibold text-slate-800 mb-3">
                            問 {index + 1}: {q.q}
                        </label>
                        <textarea
                            id={`q-${index}`}
                            rows={4}
                            value={userAnswers[index] || ''}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            placeholder="ここに回答を入力してください"
                        />
                    </div>
                ))}
            </div>

            {error && (
                <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertTriangleIcon className="h-5 w-5 mr-2"/>
                    <span>{error}</span>
                </div>
            )}
            
            <div className="mt-8 text-center">
                <button
                    onClick={handleSubmit}
                    disabled={!allFilled}
                    className="w-full md:w-1/2 bg-sky-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-sky-700 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    回答を確認する
                </button>
            </div>
        </div>
    );
};

const ResultPage = () => {
    const { workId, excerptId } = useParams<{ workId: string, excerptId: string }>();
    const { answers } = useAnswers();
    const navigate = useNavigate();
    
    const work = useMemo(() => works.find(w => w.id === workId), [workId]);
    const excerpt = useMemo(() => work?.excerpts.find(e => e.id.toString() === excerptId), [work, excerptId]);
    const excerptIndex = useMemo(() => work?.excerpts.findIndex(e => e.id.toString() === excerptId) ?? -1, [work, excerptId]);
    
    const answerAttempts = (workId && excerptId) ? answers[workId]?.[excerptId] : [];
    const answerData = answerAttempts && answerAttempts.length > 0 ? answerAttempts[answerAttempts.length - 1] : undefined;
    const userAnswers = answerData?.answers;

    if (!work || !excerpt || !answerData || !userAnswers || userAnswers.length === 0) {
        return (
          <div className="text-center p-8">
            <p className="mb-4">解答データが見つかりません。クイズを先に完了してください。</p>
            <Link to="/" className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600">トップに戻る</Link>
          </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">{work.title} - 解答の確認</h1>
                {excerpt && <p className="text-lg text-slate-600 mt-1">抜粋 {excerptIndex !== -1 ? excerptIndex + 1 : ''} / {work.excerpts.length}：{excerpt.subtitle}</p>}
                <p className="text-slate-600 mt-2">自分の回答と模範解答を見比べて、内容がよければ提出してください。</p>
            </header>
            
            <div className="space-y-6">
                {excerpt.questions.map((q, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b">
                            <p className="font-bold text-slate-800">問 {index + 1}: {q.q}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="p-4 border-b md:border-b-0 md:border-r">
                                <h3 className="font-semibold text-blue-700 mb-2">あなたの回答</h3>
                                <p className="text-slate-700 whitespace-pre-wrap">{userAnswers[index] || "（未回答）"}</p>
                            </div>
                            <div className="p-4 bg-green-50">
                                <h3 className="font-semibold text-green-800 mb-2">模範解答</h3>
                                <p className="text-slate-800 whitespace-pre-wrap">{q.a}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-10 text-center">
                <button
                    onClick={() => navigate(`/work/${workId}/excerpt/${excerptId}/submission`)}
                    className="w-full md:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors text-lg"
                >
                    この内容で提出する
                </button>
            </div>
        </div>
    );
};

const SubmissionPage = () => {
    const { workId, excerptId } = useParams<{ workId: string; excerptId: string }>();
    const { answers } = useAnswers();
    const navigate = useNavigate();

    const work = useMemo(() => works.find(w => w.id === workId), [workId]);
    const excerpt = useMemo(() => work?.excerpts.find(e => e.id.toString() === excerptId), [work, excerptId]);
    
    const answerAttempts = (workId && excerptId) ? answers[workId]?.[excerptId] : [];
    const answerData = answerAttempts && answerAttempts.length > 0 ? answerAttempts[answerAttempts.length - 1] : undefined;
    
    if (!work || !excerpt || !answerData) {
        return (
          <div className="text-center p-8">
            <p className="mb-4">提出データが見つかりません。クイズを先に完了してください。</p>
            <Link to="/" className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600">トップに戻る</Link>
          </div>
        );
    }
    
    const { answers: userAnswers, studyTime } = answerData;
    
    const formatTime = (totalSeconds: number) => {
        if (totalSeconds < 0) totalSeconds = 0;
        if (totalSeconds < 60) return `${totalSeconds}秒`;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}分${seconds}秒`;
    };

    return (
        <div className="bg-slate-50 min-h-screen py-8">
            <div className="max-w-md mx-auto px-4">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <header className="text-center border-b pb-4 mb-4">
                        <TrophyIcon className="h-12 w-12 mx-auto text-amber-500 mb-2"/>
                        <h1 className="text-2xl font-bold text-slate-800">提出完了</h1>
                        <p className="text-sm text-slate-500">学習お疲れ様でした！</p>
                    </header>

                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-slate-700">{work.title}</h2>
                        <p className="text-md text-slate-600">{excerpt.subtitle}</p>
                    </div>
                    
                    <div className="bg-sky-50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-sky-800 font-semibold">勉強時間</p>
                        <p className="text-3xl font-bold text-sky-700">{formatTime(studyTime)}</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-700 mb-3">あなたの回答</h3>
                        <div className="space-y-3 text-sm">
                            {userAnswers.map((answer, index) => (
                                <div key={index} className="bg-slate-100 p-3 rounded-md">
                                    <p className="font-semibold text-slate-600">問 {index + 1}</p>
                                    <p className="text-slate-800 whitespace-pre-wrap mt-1">{answer || "（未回答）"}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-8 text-center text-xs text-slate-500">
                        <p>この画面をスクリーンショットして報告しましょう！</p>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <button onClick={() => navigate(`/work/${workId}`)} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors">
                        抜粋選択に戻る
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---

const App = () => {
    const [answers, setAnswers] = useState<UserAnswers>(() => {
        try {
            const saved = localStorage.getItem('userAnswers');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error("Failed to parse answers from localStorage", error);
            return {};
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('userAnswers', JSON.stringify(answers));
        } catch (error) {
            console.error("Failed to save answers to localStorage", error);
        }
    }, [answers]);

    const saveAnswers = (workId: string, excerptId: number, userAnswers: string[], studyTime: number) => {
        const answerData: AnswerData = { answers: userAnswers, studyTime };
        setAnswers(prev => {
            const currentWorkAnswers = prev[workId] || {};
            const existingAttempts = currentWorkAnswers[excerptId.toString()] || [];
            return {
                ...prev,
                [workId]: {
                    ...currentWorkAnswers,
                    [excerptId.toString()]: [...existingAttempts, answerData],
                },
            };
        });
    };

    const getAttemptCount = (workId: string, excerptId: number) => {
        return answers[workId]?.[excerptId.toString()]?.length || 0;
    };
    
    return (
        <AnswersContext.Provider value={{ answers, saveAnswers, getAttemptCount }}>
            <HashRouter>
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/work/:workId" element={<ExcerptListPage />} />
                        <Route path="/work/:workId/excerpt/:excerptId" element={<QuizPage />} />
                        <Route path="/work/:workId/excerpt/:excerptId/result" element={<ResultPage />} />
                        <Route path="/work/:workId/excerpt/:excerptId/submission" element={<SubmissionPage />} />
                    </Routes>
                </main>
            </HashRouter>
        </AnswersContext.Provider>
    );
};

export default App;