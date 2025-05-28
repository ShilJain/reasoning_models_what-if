import axios from 'axios';

const AZURE_OPENAI_ENDPOINT = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT || '';
const AZURE_OPENAI_KEY = process.env.REACT_APP_AZURE_OPENAI_KEY || '';
const AZURE_OPENAI_DEPLOYMENT = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT || '';

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface RequestData {
  input: string;
}

export const fetchOpenAICompletion = async (data: RequestData): Promise<OpenAIResponse> => {
  try {
    const response = await axios.post(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2025-01-01-preview`,
      {
        messages: [
          { role: 'system', content: 'You are an AI assistant specialized in preventive maintenance and resource optimization.' },
          { role: 'user', content: data.input }
        ],
        
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching from Azure OpenAI:', error);
    throw error;
  }
};
