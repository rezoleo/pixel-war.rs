# 🦀 Pixel War Backend

High-performance backend for the Pixel War collaborative canvas, built with **Rust** and **Axum** for maximum speed and reliability.

## 🏗️ Architecture

- **Axum** - Modern async web framework
- **Tokio** - Asynchronous runtime
- **File-based storage** - Simple and efficient pixel data persistence
- **Rate limiting** - IP-based cooldown system
- **Admin authentication** - Cookie-based session management

## 🚀 Getting Started

### Prerequisites

- **Rust** (latest stable version)
- **Cargo** (comes with Rust)

### 📋 Initial Setup

1. **Create configuration file**
   ```bash
   cp config/config.toml.example config/config.toml
   ```

2. **Setup pixel data file**
   ```bash
   cp state/pixels.bin.example state/pixels.bin
   ```

3. **Generate admin password hash**
   ```bash
   # Use the provided utility to hash your admin password
   cargo run --bin generatePassword
   ```

4. **Generate cookie encryption key**
   ```bash
   # Generate a base64 key (at least 64 bytes)
   openssl rand -base64 64
   ```

5. **Configure your settings**
   Edit `config/config.toml` with your generated values, take a look at `config/config.toml.example` for all the necessary variables
   
### 🔧 Development

Start the development server:
```bash
cargo run
```

To initialize a blank canvas (optional):
```bash
# Uncomment the initialization lines in main.rs, then run:
cargo run
```

### 🏭 Production Build

```bash
# Build optimized release binary
cargo build --release

# The binary will be available at target/release/pixel-war-backend
```

For containerized deployment, use the `build.sh` script at the project root.

## 🔒 Security Features

- **Rate limiting** - IP-based cooldown system prevents spam
- **Admin authentication** - Secure cookie-based sessions
- **CORS support** - Configurable cross-origin resource sharing
- **Input validation** - All endpoints validate input data

## 📈 Performance

- **Memory efficient** - Minimal RAM usage with file-based storage
- **High throughput** - Async architecture handles many concurrent requests
- **Fast startup** - Loads canvas data on demand
- **Low latency** - Direct file I/O without database overhead
