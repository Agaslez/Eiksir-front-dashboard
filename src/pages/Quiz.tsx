import React from 'react';
import ViralQuiz from '../components/marketing/ViralQuiz';
import FooterEliksir from '../components/FooterEliksir';

const Quiz: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="pt-20">
        <ViralQuiz />
      </div>
      <FooterEliksir />
    </div>
  );
};

export default Quiz;
