import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ReactMarkdown from 'react-markdown';


function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Replace this with your n8n webhook URL
  const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/8f737c09-7579-4a6b-ac6a-bfcd1a71784b';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    setResponse('');

    try {
      const result = await axios.post(N8N_WEBHOOK_URL, {
        prompt: prompt,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      });

      // Adjust this based on your n8n workflow response structure
      setResponse(result.data.message || JSON.stringify(result.data, null, 2));
      toast.success('Response received successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response. Please check your connection and try again.');
      setResponse('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response)
      .then(() => {
        toast.success('Response copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleClear = () => {
    setPrompt('');
    setResponse('');
  };

  const formatResponse = (text) => {
  // Rozdeliť text na odseky podľa \n\n
  const paragraphs = text.split('\n\n');
  
  return paragraphs.map((paragraph, index) => {
    // Ak odsek obsahuje len jeden riadok s pozdravom alebo podpisom
    if (paragraph.startsWith('Vážený') || paragraph.startsWith('S úctou') || paragraph.startsWith('Váš tím')) {
      return (
        <p key={index} className="greeting-signature">
          {paragraph}
        </p>
      );
    }
    
    // Normálne odseky
    return (
      <p key={index} className="response-paragraph">
        {paragraph.split('\n').map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line}
            {lineIndex < paragraph.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });
};

const convertToMarkdown = (text) => {
  let markdown = text;
  
  // Nahradiť pozdrav bold textom
  markdown = markdown.replace(/^(Vážený zákazník,)$/m, '**$1**');
  
  // Nahradiť podpis italic textom
  markdown = markdown.replace(/(S úctou a vďačnosťou,)\n\n(Váš tím)$/m, '*$1*\n\n*$2*');
  
  return markdown;
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Copywriter Assistant</h1>
        
        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="form-group">
            <label htmlFor="prompt">Enter your prompt:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your message here..."
              rows="6"
              disabled={loading}
            />
          </div>
          
          <div className="button-group">
            <button type="submit" disabled={loading} className="send-button">
              {loading ? 'Sending...' : 'Send'}
            </button>
            <button type="button" onClick={handleClear} className="clear-button">
              Clear
            </button>
          </div>
        </form>

        {(loading || response) && (
          <div className="response-section">
            <div className="response-header">
              <h2>Response:</h2>
              {response && !loading && (
                <button onClick={handleCopy} className="copy-button">
                  Copy Response
                </button>
              )}
            </div>
            
            <div className="response-container">
              {loading ? (
                <div className="loader">
                  <div className="spinner"></div>
                  <p>Waiting for response...</p>
                </div>
              ) : (
                 <div className="formatted-response">
                    <ReactMarkdown>{convertToMarkdown(response)}</ReactMarkdown>
    </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;