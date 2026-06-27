# Hugging Face Integration Setup Guide

This guide explains how to set up Hugging Face LLM integration for SYNTHAI 🪷.

## Overview

SYNTHAI uses Hugging Face Inference API to power the AI chat feature. This provides access to state-of-the-art open-source language models without the need for expensive proprietary APIs.

## Prerequisites

1. **Hugging Face Account**: Create a free account at https://huggingface.co
2. **API Key**: Generate an API key from your Hugging Face account settings
3. **Node.js Environment**: The project already includes all necessary dependencies

## Setup Steps

### 1. Get Your Hugging Face API Key

1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Choose "Read" access (sufficient for inference)
4. Copy the generated token

### 2. Set Environment Variable

Add your Hugging Face API key to your environment:

```bash
export HUGGINGFACE_API_KEY="your-api-key-here"
```

Or add it to your `.env` file:

```
HUGGINGFACE_API_KEY=your-api-key-here
```

### 3. Choose a Model

SYNTHAI supports several open-source models. The default is `mistralai/Mistral-7B-Instruct-v0.1`.

**Recommended Models:**

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| `mistralai/Mistral-7B-Instruct-v0.1` | 7B | Fast | Excellent | **Default - Recommended** |
| `meta-llama/Llama-2-7b-chat-hf` | 7B | Fast | Good | Good alternative |
| `tiiuae/falcon-7b-instruct` | 7B | Very Fast | Good | Speed-optimized |
| `google/flan-t5-xl` | 3B | Very Fast | Fair | Lightweight option |

### 4. Configure Model (Optional)

To use a different model, modify the initialization in `server/huggingface-llm.ts`:

```typescript
export const huggingFaceLLM = new HuggingFaceLLM(
  process.env.HUGGINGFACE_API_KEY,
  'meta-llama/Llama-2-7b-chat-hf'  // Change model here
);
```

Or change it at runtime via the API:

```typescript
huggingFaceLLM.setModel('meta-llama/Llama-2-7b-chat-hf');
```

## How It Works

### Chat Flow

1. **User sends message** → Stored in database
2. **Context gathering** → Retrieves user's personalization data and projects
3. **System prompt building** → Combines neural network rules, personalization, and project context
4. **LLM inference** → Sends to Hugging Face API
5. **Response processing** → Extracts and formats response
6. **Storage** → Saves AI response to database

### Personalization Integration

The AI automatically considers:

- **Zodiac Sign**: Adapts communication style to astrological profile
- **Life Path Number**: Incorporates numerological insights
- **Active Projects**: Provides context about user's goals
- **Recent Commitments**: Helps with follow-ups and suggestions
- **Neural Network Rules**: Applies learned behavior patterns

### Features

**Chat Capabilities:**

- Real-time conversation with personalized AI agent
- Message history and context awareness
- Streaming responses for better UX
- Sentiment analysis of user messages
- Action item extraction from conversations

**Project Integration:**

- Generate next steps for projects
- Create commitment reminders
- Suggest improvements based on context
- Track project-related discussions

**Personalization:**

- Astrology-aware responses
- Numerology-based insights
- Birthday-based customization
- Personalized greetings

## API Endpoints

### Send Message

```typescript
// Send a message and get AI response
trpc.chat.sendMessage.useMutation({
  conversationId: 123,
  message: "What should I work on next?"
});
```

### Stream Message

```typescript
// Stream AI response for better UX
trpc.chat.streamMessage.useMutation({
  conversationId: 123,
  message: "Help me plan my week"
});
```

### Generate Suggestions

```typescript
// Get project-specific suggestions
trpc.chat.generateProjectSuggestions.useQuery({
  projectTitle: "Build SYNTHAI"
});
```

### Generate Reminder

```typescript
// Create a personalized reminder
trpc.chat.generateReminder.useQuery({
  commitmentTitle: "Complete project documentation"
});
```

### Analyze Sentiment

```typescript
// Analyze user's emotional tone
trpc.chat.analyzeSentiment.useQuery({
  message: "I'm feeling overwhelmed with this project"
});
```

### Extract Action Items

```typescript
// Extract tasks from user message
trpc.chat.extractActionItems.useQuery({
  message: "I need to finish the UI, test it, and deploy by Friday"
});
```

## Rate Limiting & Quotas

Hugging Face Inference API has rate limits:

- **Free tier**: Limited requests per day
- **Pro tier**: Higher rate limits
- **Enterprise**: Custom limits

Check your usage at: https://huggingface.co/settings/billing/overview

## Troubleshooting

### "API Key not configured" Error

**Solution**: Ensure `HUGGINGFACE_API_KEY` environment variable is set:

```bash
echo $HUGGINGFACE_API_KEY  # Should print your key
```

### "Model not found" Error

**Solution**: Verify the model ID is correct. Check available models at https://huggingface.co/models

### Slow Responses

**Solution**: 
- Use a smaller model (e.g., `google/flan-t5-xl`)
- Reduce `max_new_tokens` in the request
- Upgrade to Hugging Face Pro for faster inference

### Empty Responses

**Solution**:
- Check model compatibility
- Verify API key has "Read" access
- Check Hugging Face status page for outages

## Performance Optimization

### Temperature Settings

Lower temperature = more deterministic responses
Higher temperature = more creative responses

```typescript
// More focused responses
temperature: 0.3

// More creative responses
temperature: 0.9
```

### Token Limits

Adjust `max_new_tokens` for response length:

```typescript
// Short responses
maxTokens: 256

// Longer responses
maxTokens: 1024
```

### Caching

Consider caching common responses:

```typescript
// Cache greeting for 1 hour
const greeting = await cache.get('greeting_' + userId);
if (!greeting) {
  greeting = await aiChatService.generateGreeting(...);
  await cache.set('greeting_' + userId, greeting, 3600);
}
```

## Cost Estimation

Hugging Face Inference API pricing:

- **Free tier**: Limited free requests
- **Pro**: $9/month for increased limits
- **Enterprise**: Custom pricing

**Typical usage:**
- 100 messages/day ≈ 50K tokens ≈ $0.50/month on Pro

## Advanced Configuration

### Custom System Prompt

Modify `buildSystemPrompt()` in `server/huggingface-llm.ts`:

```typescript
private buildSystemPrompt(...): string {
  let prompt = 'Your custom system prompt here';
  // Add personalization
  // Add project context
  return prompt;
}
```

### Model Switching

Implement dynamic model selection based on context:

```typescript
if (projectContext.activeProjects > 10) {
  huggingFaceLLM.setModel('mistralai/Mistral-7B-Instruct-v0.1');
} else {
  huggingFaceLLM.setModel('google/flan-t5-xl');
}
```

### Response Filtering

Add content filtering for safety:

```typescript
private filterResponse(response: string): string {
  // Add content filtering logic
  return response;
}
```

## Resources

- **Hugging Face Docs**: https://huggingface.co/docs/inference-api
- **Model Hub**: https://huggingface.co/models
- **Community**: https://huggingface.co/community
- **Pricing**: https://huggingface.co/pricing

## Support

For issues or questions:

1. Check Hugging Face documentation
2. Review error logs in console
3. Test with a simple prompt first
4. Verify API key and model availability

---

**SYNTHAI 🪷** - Powered by Hugging Face
