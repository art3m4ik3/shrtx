# Shrtx - Modern URL Shortener

### 🚀 Key Features

- **URL Shortening** with customizable length
- **Custom Aliases** for creating memorable short links
- **Link Expiration** by date or number of clicks
- **Analytics** to track the effectiveness of your links
- **Dashboard** for monitoring all your shortened URLs
- **Dark and Light Themes** for comfortable use

## 🛠️ Technologies

- [Next.js 15](https://nextjs.org/) - React framework with SSR support
- [React 19](https://react.dev/) - Library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Primitives for building accessible components
- [Chart.js](https://www.chartjs.org/) - Library for creating interactive charts

## 🚦 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- Bun or npm
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/art3m4ik3/shrtx.git
   cd shrtx
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Create a `.env.local` file and configure the necessary environment variables:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017
   ```

4. Run the project in development mode:
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.
