# Claude XML Agent

<p align="center">
  <img alt="Claude XML Agent - Convert plain text to optimized Claude XML prompts" src="app/(chat)/opengraph-image.png">
</p>

<p align="center">
  <strong>An intelligent AI agent that converts plain text prompts into Claude-optimized XML structures using Google Gemini and the Vercel AI SDK.</strong>
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="#deployment"><strong>Deploy</strong></a> ·
  <a href="#xml-optimization"><strong>XML Guide</strong></a>
</p>

## Overview

Claude XML Agent is a specialized AI application designed to transform unstructured prompt text into Claude-optimized XML structures. Built with Next.js 15, the Vercel AI SDK, and powered by Google Gemini models, it leverages Claude's preference for XML-structured prompts to improve AI interaction reliability and performance.

### Why XML for Claude?

Claude interprets XML tags as strong semantic boundaries, making prompts more deterministic and reliable. This agent automatically structures your prompts using Claude's recommended XML schema:

```xml
<prompt>
  <role>Expert assistant for the specified domain</role>
  <context><!-- domain background, audience, constraints --></context>
  <data><!-- raw inputs or references --></data>
  <instructions>
    <!-- numbered, action-oriented steps -->
  </instructions>
  <examples>
    <example>
      <input/>
      <output/>
    </example>
  </examples>
  <format/>
  <answer/>
</prompt>
```

## Features

### 🤖 **AI-Powered XML Conversion**
- **Intelligent Structuring**: Automatically converts plain text prompts into Claude-optimized XML
- **Google Gemini Integration**: Uses Gemini 2.5 Pro/Flash for reliable conversion
- **Semantic Analysis**: Identifies and properly structures context, instructions, examples, and format requirements

### 🏗️ **Modern Full-Stack Architecture**
- **Next.js 15**: Built with App Router, Server Components, and React 19
- **Vercel AI SDK**: Streaming responses, tool calling, and agent workflows
- **TypeScript**: Full type safety throughout the application
- **shadcn/ui**: Beautiful, accessible UI components

### 💾 **Data Persistence & Management**
- **Neon PostgreSQL**: Serverless database with Drizzle ORM
- **Chat History**: Persistent conversation storage
- **File Uploads**: Support for document processing via Vercel Blob
- **User Authentication**: Secure auth with Auth.js (NextAuth.js)

### 🛠️ **Developer Experience**
- **Hot Reload**: Turbo-powered development with `pnpm dev`
- **Code Quality**: Ultracite linting and formatting
- **Testing**: Playwright end-to-end tests
- **Database Tools**: Drizzle Studio and migration management

## Architecture

### Core Components

```
claude-xml-agent/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (chat)/            # Main chat interface
│   └── api/               # API endpoints
├── lib/
│   ├── ai/                # AI models, prompts, tools
│   ├── db/                # Database schema & queries
│   └── auth/              # Authentication config
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
└── ai-sdk/               # AI SDK documentation
```

### AI Integration Stack

- **Primary Model**: Google Gemini 2.5 Pro/Flash via Vercel AI Gateway
- **Agent Framework**: Vercel AI SDK Experimental Agent class
- **Tool System**: Extensible tool calling for validation and enhancement
- **Streaming**: Real-time response streaming with React hooks

### Database Schema

```typescript
// Core entities
users: { id, email, name, createdAt }
chats: { id, userId, title, createdAt, path }
messages: { id, chatId, role, content, createdAt }
documents: { id, userId, name, content, createdAt }
```

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Neon recommended)
- Google AI Studio API key
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Berkay2002/claude-xml-agent.git
   cd claude-xml-agent
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure required variables:
   ```env
   # Database
   POSTGRES_URL="postgresql://..."
   
   # AI Gateway (for non-Vercel deployments)
   AI_GATEWAY_API_KEY="your-gateway-key"
   
   # Authentication
   AUTH_SECRET="your-auth-secret"
   
   # File Storage
   BLOB_READ_WRITE_TOKEN="your-blob-token"
   ```

4. **Database setup**
   ```bash
   pnpm db:push
   pnpm db:migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

   Access at [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
# Development
pnpm dev          # Start dev server with Turbo
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Check with Ultracite
pnpm format       # Auto-format code

# Database
pnpm db:studio    # Open Drizzle Studio
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations

# Testing
pnpm test         # Run Playwright tests
```

## Deployment

### One-Click Vercel Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Berkay2002/claude-xml-agent)

### Manual Deployment

1. **Database Setup**
   - Create a Neon PostgreSQL database
   - Configure connection string in environment variables

2. **Environment Variables**
   - Set all required environment variables in your deployment platform
   - For Vercel: AI Gateway authentication is automatic via OIDC
   - For other platforms: provide `AI_GATEWAY_API_KEY`

3. **Deploy**
   ```bash
   vercel --prod
   ```

## XML Optimization Guide

### Claude XML Best Practices

This agent implements Claude's recommended XML structuring principles:

1. **Shallow Nesting**: Avoid deep XML hierarchies
2. **Semantic Boundaries**: Use tags to separate different types of content
3. **Consistent Schema**: Follow the canonical prompt structure
4. **Explicit References**: Instructions should reference other sections by tag name

### Conversion Process

The agent follows this workflow:

1. **Analysis**: Parse input text to identify components (context, instructions, examples)
2. **Classification**: Categorize content into appropriate XML sections
3. **Structuring**: Apply Claude's canonical XML schema
4. **Validation**: Ensure proper XML formatting and tag closure
5. **Optimization**: Reference sections explicitly in instructions

### Example Transformation

**Input (Plain Text):**
```
Create a marketing email for our new product launch. 
The product is a smart fitness tracker. 
Target audience is health-conscious millennials. 
Include a compelling subject line and call-to-action.
```

**Output (Claude XML):**
```xml
<prompt>
  <role>Expert email marketing copywriter</role>
  <context>
    Product: Smart fitness tracker
    Target audience: Health-conscious millennials
    Goal: Product launch announcement
  </context>
  <instructions>
    1. Create a compelling subject line that appeals to the target audience
    2. Write engaging email copy highlighting key product benefits
    3. Include a strong call-to-action that drives conversions
    4. Use the context about the target audience to inform tone and messaging
  </instructions>
  <format>
    - Subject line (max 50 characters)
    - Email body (300-500 words)
    - Call-to-action button text
  </format>
  <answer/>
</prompt>
```

## API Reference

### Core Endpoints

- **POST** `/api/chat` - Main chat completion endpoint
- **POST** `/api/files/upload` - File upload for document processing
- **GET** `/api/history` - Fetch chat history
- **DELETE** `/api/chat/[id]` - Delete chat

### Agent Configuration

```typescript
const xmlAgent = new Agent({
  model: google('gemini-2.5-pro'),
  temperature: 0, // Deterministic conversion
  maxOutputTokens: 2048,
  system: XML_CONVERSION_PROMPT,
  tools: { xmlValidator }, // Optional validation
});
```

## Contributing

### Code Quality Standards

This project uses **Ultracite** for comprehensive linting and formatting:

- Strict TypeScript type safety
- React and Next.js best practices
- Accessibility compliance (a11y)
- Performance optimizations

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and ensure tests pass: `pnpm test`
4. Run linting: `pnpm lint`
5. Format code: `pnpm format`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Documentation

- **[XML Agent Guide](xml-agent.md)** - Detailed implementation guide
- **[Claude Integration](CLAUDE.md)** - Claude-specific development notes
- **[Email Setup](EMAIL_SETUP.md)** - Email notification configuration
- **[User Access Guide](USER_ACCESS_GUIDE.md)** - User management documentation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **AI**: Vercel AI SDK, Google Gemini via AI Gateway
- **Database**: Neon PostgreSQL, Drizzle ORM
- **Auth**: Auth.js (NextAuth.js)
- **Storage**: Vercel Blob
- **Deployment**: Vercel
- **Testing**: Playwright
- **Code Quality**: Ultracite (Biome-based)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📧 **Email**: [berkayorhan@hotmail.se](mailto:berkayorhan@hotmail.se)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Berkay2002/claude-xml-agent/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Berkay2002/claude-xml-agent/discussions)

---

<p align="center">
  <em>Built with ❤️ by <a href="https://berkay.se">Berkay Orhan</a></em>
</p>