import { Coffee, Martini, Share2, Sparkles, Wine } from 'lucide-react';
import { useState } from 'react';
import { trackEvent } from '../../lib/error-monitoring';

const questions = [
  {
    id: 1,
    question: 'Jaki jest Twój ulubiony rodzaj imprezy?',
    options: [
      { text: 'Kameralne spotkanie z przyjaciółmi', value: 'intimate' },
      { text: 'Duże wesele z tańcami', value: 'wedding' },
      { text: 'Event firmowy / networking', value: 'corporate' },
      { text: 'Urodziny / rocznica', value: 'birthday' },
    ],
  },
  {
    id: 2,
    question: 'Jaki smak preferujesz w drinkach?',
    options: [
      { text: 'Słodki i owocowy', value: 'sweet' },
      { text: 'Kwaśny i orzeźwiający', value: 'sour' },
      { text: 'Gorzki i wytrawny', value: 'bitter' },
      { text: 'Ostry i intensywny', value: 'spicy' },
    ],
  },
  {
    id: 3,
    question: 'Jaki jest Twój styl bycia na imprezie?',
    options: [
      { text: 'Dusza towarzystwa - organizuję zabawy', value: 'leader' },
      { text: 'Obserwator - lubię patrzeć z boku', value: 'observer' },
      { text: 'Smakosz - skupiam się na jedzeniu i drinkach', value: 'foodie' },
      { text: 'Tancerz - nie schodzę z parkietu', value: 'dancer' },
    ],
  },
  {
    id: 4,
    question: 'Jaki alkohol preferujesz?',
    options: [
      { text: 'Wódka / białe trunki', value: 'vodka' },
      { text: 'Whisky / bourbon', value: 'whisky' },
      { text: 'Rum / tequila', value: 'rum' },
      { text: 'Wino / prosecco', value: 'wine' },
      { text: 'Tylko bezalkoholowe', value: 'non-alc' },
    ],
  },
  {
    id: 5,
    question: 'Jaka jest Twoja supermoc na imprezie?',
    options: [
      { text: 'Zawsze znam najlepsze żarty', value: 'humor' },
      { text: 'Umiem rozruszać każde towarzystwo', value: 'energy' },
      {
        text: 'Zawsze wiem gdzie jest najlepszy drink',
        value: 'drink-knowledge',
      },
      { text: 'Mam nieskończone pokłady cierpliwości', value: 'patience' },
    ],
  },
];

const results = {
  'intimate-sweet-leader-vodka-humor': {
    title: 'Mistrz Kameralnych Spotkań 🥂',
    description:
      'Twój idealny drink to klasyczne Mojito z miętą prosto z ogródka! Organizujesz najlepsze wieczory w gronie przyjaciół.',
    cocktail: 'Mojito Premium',
    emoji: '🥂',
    hashtag: '#MistrzMojito',
  },
  'wedding-sour-observer-whisky-energy': {
    title: 'Król Weselnych Parkietów 💃',
    description:
      'Twój styl to Whisky Sour z cytrynowym pazurem! Na parkiecie jesteś nie do zatrzymania.',
    cocktail: 'Whisky Sour',
    emoji: '💃',
    hashtag: '#KrólWhiskySour',
  },
  'corporate-bitter-foodie-rum-drink-knowledge': {
    title: 'CEO Dobrych Smaków 🎩',
    description:
      'Twój drink to wyrafinowana Cuba Libre! Znasz każdy składnik i potrafisz ocenić drinka po zapachu.',
    cocktail: 'Cuba Libre Premium',
    emoji: '🎩',
    hashtag: '#CEOCocktails',
  },
  'birthday-spicy-dancer-wine-patience': {
    title: 'Imprezowa Dywizja S 🕺',
    description:
      'Twój wybór to ostry Bloody Mary! Masz energię do tańca do białego rana i cierpliwość świętego.',
    cocktail: 'Spicy Bloody Mary',
    emoji: '🕺',
    hashtag: '#ImprezowaDywizja',
  },
  default: {
    title: 'Eliksirowy Eksplorator 🔮',
    description:
      'Jesteś prawdziwym koneserem! Twój idealny drink to nasza specjalność dnia - zaskoczymy Cię za każdym razem!',
    cocktail: 'Surprise Cocktail',
    emoji: '🔮',
    hashtag: '#EliksirEksplorator',
  },
};

export default function ViralQuiz() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    trackEvent('quiz_answer', {
      questionId: questions[currentQuestion].id,
      answer: value,
      step: currentQuestion + 1,
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
      trackEvent('quiz_completed', {
        answers: newAnswers,
        result: getResultKey(newAnswers),
      });
    }
  };

  const getResultKey = (ans: string[]): string => {
    if (ans.length === 5) {
      const key = ans.join('-');
      return results[key as keyof typeof results] ? key : 'default';
    }
    return 'default';
  };

  const result =
    results[getResultKey(answers) as keyof typeof results] || results.default;

  const shareText = `🎉 Moja koktajlowa osobowość to: ${result.title} ${result.emoji}

${result.description}

Sprawdź swoją na: eliksir-bar.pl/quiz
${result.hashtag} #EliksirBar #KoktajlowyQuiz`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Moja koktajlowa osobowość',
          text: shareText,
          url: window.location.href,
        });
        trackEvent('quiz_shared_native');
      } catch (err) {
        // ARCHITECT_APPROVED: User cancellation is not an error, logging helps track share abandonment rate - 2026-01-02 - Stefan
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent('quiz_copied');
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    trackEvent('quiz_started');
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    trackEvent('quiz_reset');
  };

  // Ekran startowy
  if (!quizStarted) {
    return (
      <div className="bg-gradient-to-br from-black via-amber-950/30 to-black border border-amber-500/20 rounded-2xl p-8 text-center">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            Jaka jest Twoja koktajlowa osobowość? 🍸
          </h3>
          <p className="text-gray-400 mb-6">
            Odpowiedz na 5 pytań i odkryj swój idealny drink!
          </p>

          <div className="bg-black/50 rounded-xl p-6 mb-8 border border-amber-500/20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-amber-300 text-xl">1</span>
                </div>
                <div className="text-sm text-gray-400">5 pytań</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-amber-300 text-xl">2</span>
                </div>
                <div className="text-sm text-gray-400">Odkryj drink</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-amber-300 text-xl">3</span>
                </div>
                <div className="text-sm text-gray-400">Udostępnij</div>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4">
              Quiz jest szybki, zabawny i pomoże nam dopasować idealny koktajl
              na Twoją imprezę!
            </p>
          </div>

          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 px-10 rounded-full text-lg flex items-center justify-center gap-3 mx-auto transition-all transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Rozpocznij quiz
          </button>

          <p className="text-gray-500 text-xs mt-6">
            Twój wynik będzie gotowy do udostępnienia na social media! 📱
          </p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="bg-gradient-to-br from-amber-900/20 via-black to-purple-900/20 border border-amber-500/30 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        <h3 className="text-3xl font-bold text-white mb-2">
          {result.emoji} {result.title}
        </h3>

        <div className="text-amber-300 text-lg font-semibold mb-4">
          Twój idealny drink: {result.cocktail}
        </div>

        <p className="text-gray-300 mb-8 text-lg">{result.description}</p>

        <div className="bg-black/50 rounded-xl p-6 mb-8 border border-amber-500/20">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <Martini className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400">Drink</div>
              <div className="font-bold text-white">{result.cocktail}</div>
            </div>
            <div className="text-center">
              <Wine className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400">Hashtag</div>
              <div className="font-bold text-white">{result.hashtag}</div>
            </div>
            <div className="text-center">
              <Coffee className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-sm text-gray-400">Typ imprezy</div>
              <div className="font-bold text-white">Wybrany przez Ciebie</div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-amber-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-amber-500/30">
              <span className="text-amber-300 font-bold">{result.hashtag}</span>
              <span className="text-gray-400 ml-2">
                #EliksirBar #KoktajlowyQuiz
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleShare}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Share2 className="w-5 h-5" />
            {copied ? 'Skopiowano!' : 'Udostępnij wynik'}
          </button>

          <button
            onClick={resetQuiz}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg border border-gray-600 transition-all"
          >
            Spróbuj jeszcze raz
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-4">
            Podoba Ci się quiz? Zamów swój idealny koktajl na imprezę!
          </p>
          <a
            href="#kalkulator"
            className="inline-block bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-bold py-3 px-8 rounded-full transition-all"
            onClick={() => trackEvent('quiz_cta_click')}
          >
            Sprawdź ofertę barową
          </a>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="bg-gradient-to-br from-black via-amber-950/30 to-black border border-amber-500/20 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          Jaka jest Twoja koktajlowa osobowość? 🍸
        </h3>
        <p className="text-gray-400">
          Odpowiedz na 5 pytań i odkryj swój idealny drink!
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>
            Pytanie {currentQuestion + 1} z {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-amber-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-xl font-bold text-white mb-6 text-center">
          {question.question}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.value)}
              className="bg-gray-900/50 hover:bg-gradient-to-r hover:from-amber-900/30 hover:to-purple-900/30 border border-gray-700 hover:border-amber-500/50 p-4 rounded-xl text-left transition-all duration-300 group"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-lg mr-3 group-hover:bg-amber-500/20 transition-colors">
                  <span className="text-gray-400 group-hover:text-amber-300 font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium">
                  {option.text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>Twój wynik będzie gotowy do udostępnienia na social media! 📱</p>
        <p className="mt-1">#EliksirBar #KoktajlowyQuiz</p>
      </div>
    </div>
  );
}
