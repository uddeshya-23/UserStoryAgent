import { useState, useEffect } from 'react';
import { api, type Story } from '@/lib/api';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<Story | null>(null);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load API key on component mount
    storage.getApiKey().then(key => {
      setApiKey(key);
      if (!key) {
        setError('API key not configured. Please set it in the extension options.');
      }
    });
  }, []);

  const handleGenerateStory = async () => {
    if (!apiKey) {
      setError('Please configure your API key in the extension options');
      return;
    }

    if (!input.trim()) {
      setError('Please enter a story description');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const story = await api.generateStory(input, apiKey);
      setOutput(story);
      toast({
        title: "Success",
        description: "Story generated successfully!",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="input-section mb-4">
        <label className="block mb-2 font-medium text-gray-700">
          Story Description
        </label>
        <textarea
          className="w-full h-32 p-2 border rounded-md resize-vertical"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter the raw story description here..."
        />
      </div>

      <button
        onClick={handleGenerateStory}
        disabled={isLoading || !apiKey}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed mb-4"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating...
          </span>
        ) : (
          'Generate Story'
        )}
      </button>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {output && (
        <div className="output-section bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Generated Story</h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(output, null, 2));
                toast({
                  title: "Copied",
                  description: "Story copied to clipboard",
                });
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Copy to Clipboard
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(output).map(([key, value]) => (
              <div key={key} className="section">
                <h4 className="font-medium mb-2">{key}</h4>
                {Array.isArray(value) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {value.map((item, i) => (
                      <li key={i} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                ) : typeof value === 'object' ? (
                  <pre className="bg-white p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <p className="text-gray-700">{value || 'N/A'}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}