import React, { useState } from 'react';
import Welcome from './components/Welcome';
import Quiz from './components/Quiz';
import Results from './components/Results';
import Registration from './components/Registration';
import AdminDashboard from './components/AdminDashboard';
import { QuizState, QuizResult, StudentInfo, StoredResult } from './types';
import { part1Questions, part2Questions, part3Questions } from './questions';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<QuizState>(QuizState.REGISTRATION);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [quizSet, setQuizSet] = useState<1 | 2 | 3>(1);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  const getQuestionsForSet = (set: number) => {
    switch (set) {
      case 1: return part1Questions;
      case 2: return part2Questions;
      case 3: return part3Questions;
      default: return part1Questions;
    }
  };

  const currentQuestions = getQuestionsForSet(quizSet);

  const handleRegistration = (info: StudentInfo) => {
    setStudentInfo(info);
    setGameState(QuizState.WELCOME);
  };

  const handleAdminLogin = () => {
    const password = prompt("Enter Admin Password:");
    if (password === "admin123") {
      setGameState(QuizState.ADMIN);
    } else if (password) {
      alert("Incorrect password");
    }
  };

  const startQuiz = () => {
    setGameState(QuizState.ACTIVE);
  };

  const completeQuiz = (userAnswers: Record<number, number>, timeTaken: number) => {
    let score = 0;
    currentQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    const newResult: QuizResult = {
      score,
      total: currentQuestions.length,
      userAnswers,
      timeTaken,
    };

    setResult(newResult);
    setGameState(QuizState.COMPLETED);

    if (studentInfo) {
      const submission: StoredResult = {
        studentInfo,
        examPart: quizSet,
        score,
        total: currentQuestions.length,
        timestamp: new Date().toISOString(),
      };

      const existingData = localStorage.getItem('fluid_mechanics_exam_submissions');
      const submissions: StoredResult[] = existingData ? JSON.parse(existingData) : [];
      submissions.push(submission);
      localStorage.setItem('fluid_mechanics_exam_submissions', JSON.stringify(submissions));
    }
  };

  const retakeQuiz = () => {
    setResult(null);
    setGameState(QuizState.WELCOME);
  };

  const nextExam = () => {
    setQuizSet((prev) => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev));
    setResult(null);
    setGameState(QuizState.WELCOME);
  };

  const handleAdminBack = () => {
    setGameState(QuizState.REGISTRATION);
    setStudentInfo(null);
    setQuizSet(1);
  };

  return (
    <>
      {gameState === QuizState.REGISTRATION && (
        <Registration onRegister={handleRegistration} onAdminLogin={handleAdminLogin} />
      )}
      {gameState === QuizState.ADMIN && (
        <AdminDashboard onBack={handleAdminBack} />
      )}
      {gameState === QuizState.WELCOME && (
        <Welcome 
          onStart={startQuiz} 
          examPart={quizSet} 
          studentName={studentInfo?.name} 
        />
      )}
      {gameState === QuizState.ACTIVE && (
        <Quiz questions={currentQuestions} onComplete={completeQuiz} />
      )}
      {gameState === QuizState.COMPLETED && result && (
        <Results 
          result={result} 
          questions={currentQuestions} 
          onRetake={retakeQuiz}
          onNextExam={nextExam}
          hasNextExam={quizSet < 3}
          currentPart={quizSet}
        />
      )}
    </>
  );
};

export default App;