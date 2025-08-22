# 🎨 Pixel War

A lightweight, fast, and easily deployable pixel art collaborative canvas inspired by Reddit's r/Place. Create pixel art together in real-time!

## ✨ Features

- **Real-time Collaboration**: Multiple users can place pixels simultaneously
- **Lightweight Architecture**: Built for performance and easy deployment
- **Rate Limiting**: Prevents spam and ensures fair participation
- **Admin Controls**: Manage canvas size, reset areas, and moderate content
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React Router 7** - Modern React framework with file-based routing
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **TypeScript** - Type-safe JavaScript development

### Backend
- **Rust** - Systems programming language for maximum performance
- **Axum** - Modern async web framework for Rust
- **Tokio** - Asynchronous runtime for Rust

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Rust** (latest stable version)
- **Docker** and **Docker Compose** (for containerized deployment)

### Production Deployment

#### Using Docker Compose
```bash
# Build and deploy with Docker
docker-compose up -d
```

#### Manual Build
```bash
# Use the provided build script
chmod +x build.sh
./build.sh
```

## 🔧 Configuration

### Backend Configuration
Create a configuration file in `backend/config/` to customize:
- Canvas dimensions
- Rate limiting settings
- Authentication settings
- File storage paths

## 🎮 How to Play

1. **Visit the canvas** - Navigate to the application URL
2. **Choose a color** - Select from the color palette
3. **Place pixels** - Click on the canvas to place your pixel
4. **Wait for cooldown** - Each placement has a cooldown period
5. **Collaborate** - Work with others to create amazing pixel art!

## 🐳 Docker Deployment

The project includes a `docker-compose.yml` file for easy deployment. You may need to modify it according to your specific requirements:

```yaml
# Example modifications you might need:
# - Change port mappings
# - Add environment variables
# - Configure volumes for data persistence
# - Set up reverse proxy settings
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy pixel painting! 🎨**
