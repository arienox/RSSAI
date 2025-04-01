# RSS AI News Aggregator

A modern RSS feed aggregator focused on AI and tech news, built with Node.js, Express, MySQL, and Next.js.

## Prerequisites

- Node.js 18+ installed
- MySQL 8+ installed (or Docker)
- Docker (optional, for running MySQL)

## Project Structure

```
.
├── frontend/           # Next.js frontend application
├── feeds.opml         # RSS feed sources configuration
├── index.js           # Express API server
├── init-mcp.js        # MCP RSS initialization script
└── .env              # Environment configuration
```

## Setup Instructions

1. Clone the repository:
```bash
git clone <your-repo-url>
cd rssai
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following content:
```
OPML_FILE_PATH="./feeds.opml"
DB_HOST="localhost"
DB_PORT="3307"
DB_USERNAME="root"
DB_PASSWORD="aryan1521"
DB_DATABASE="mcp_rss"
RSS_UPDATE_INTERVAL="5"
```

4. Start MySQL (if using Docker):
```bash
docker run -itd --name mysql-test -p 3307:3306 -e MYSQL_ROOT_PASSWORD=aryan1521 mysql
```

5. Start the backend services:
```bash
# Start both the API server and MCP RSS fetcher
npm run dev
```

6. Start the frontend:
```bash
cd frontend
npm run dev
```

7. Open your browser and visit `http://localhost:3000`

## Features

- Real-time RSS feed aggregation
- Modern, responsive UI
- Category-based news filtering
- Automatic updates every 5 minutes

## Deployment

### Backend Deployment (Railway)

1. Push your code to GitHub
2. Connect your GitHub repository to Railway
3. Set up the environment variables in Railway's dashboard
4. Deploy!

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure the build settings (Next.js should be auto-detected)
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 