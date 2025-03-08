import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

const InFact = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFactCheck = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    // Simulate API call for fact checking
    try {
      // Replace this with your actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated result - replace with actual fact checking logic
      const factScore = Math.random() * 100;
      setResult({
        score: factScore.toFixed(2),
        assessment: factScore > 70 ? 'Mostly Factual' : factScore > 40 ? 'Mixed' : 'Mostly False',
        sources: [
          'Example Source 1',
          'Example Source 2',
          'Example Source 3'
        ],
        explanation: 'This is a simulated explanation of the fact check result. In a real application, this would be replaced with detailed analysis of the claims and evidence.'
      });
    } catch (error) {
      console.error('Fact checking failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="c-space my-10">
      <div className="grid-container max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-blue-500 hover:underline flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>

        <h1 className="grid-headtext text-center mb-6">inFact - Fact Checking Tool</h1>
        <p className="grid-subtext text-center mb-8">
          Verify the factual accuracy of statements and claims in your text.
        </p>

        <div className="mb-6">
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg h-64 bg-gray-50 text-gray-800"
            placeholder="Paste the text with claims you want to fact-check..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <Button 
          name={isLoading ? "Checking Facts..." : "Verify Facts"} 
          isBeam={!isLoading}
          containerClass="w-full mb-8" 
          onClick={handleFactCheck}
          disabled={isLoading || !inputText.trim()}
        />
        
        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {result && !isLoading && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-center">Fact Check Results</h2>
            
            <div className="mb-6">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-gray-800">{inputText}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <p className="text-gray-500 mb-1">Factual Score</p>
                <p className="text-2xl font-bold">{result.score}%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 mb-1">Assessment</p>
                <p className="text-2xl font-bold">{result.assessment}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Explanation</h3>
              <p className="text-gray-700">{result.explanation}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Sources</h3>
              <ul className="list-disc pl-5">
                {result.sources.map((source, index) => (
                  <li key={index} className="text-blue-500 hover:underline">{source}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default InFact;