# 🎨 Pixel War Frontend

Modern and responsive frontend for the Pixel War collaborative canvas, built with **React Router 7** and **Tailwind CSS** for a smooth user experience.

## 🛠️ Tech Stack

- **React Router 7** - Modern React framework with file-based routing
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Axios** - HTTP client for API communication
- **Vite** - Fast build tool and development server

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm/yarn
- **Backend server** 

### 📋 Installation

Install the dependencies:

```bash
pnpm install
```

### 🔧 Development

Start the development server with HMR:

```bash
pnpm run dev
```

**Note**: Your backend server must be running before launching the frontend.

### 🏭 Building for Production

The application is statically exported to be served directly by the backend. 

**Option 1: Use the build script (recommended)**
```bash
# From the project root
chmod +x build.sh
./build.sh
```

**Option 2: Manual build**
```bash
pnpm run build
```

## 🎮 Features

- **Interactive Canvas** - Click to place pixels with real-time updates
- **Color Palette** - Choose from a variety of colors
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Real-time Updates** - See other users' pixels appear instantly
- **Rate Limiting Display** - Visual feedback for cooldown periods
- **Admin Panel** - Administrative controls for canvas management
