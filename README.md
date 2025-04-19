# QURL - URL Shortener with QR Codes

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern URL shortener with QR code generation built with Bun. Features real-time analytics, management dashboard, and persistent storage.

## Features

- 🔗 URL shortening with random code generation
- 📷 Automatic QR code generation for shortened URLs
- 📊 Visit tracking and analytics
- 🗑️ One-click deletion of entries
- 📱 Responsive web interface
- 💾 SQLite database persistence
- ⚡ Lightning-fast Bun runtime

## Installation
### Docker

Use this docker-compose
```yaml
services:
  qurl:
    container_name: QURL
    ports:
      - 3000:3000 # Host Port : Container Port
    image: ghcr.io/its4nik/qurl
```

```bash
docker compose up -d
```

Or if you prefer docker run commands:

```bash
docker run -d -p 3000:3000 --name qurl ghcr.io/its4nik/qurl
```

### Source

1. **Install Bun**
```bash
curl -fsSL https://bun.sh/install | bash
```

2. **Clone the repository**:
```bash
git clone https://github.com/its4nik/qurl.git
cd qurl
```

3. **Install dependencies**:
```bash
bun install
```

4. **Create public directory for QR codes**:
```bash
mkdir -p public/qr
```

## Usage

**Start the server**:
```bash
bun start
```

The web interface will be available at [http://localhost:3000](http://localhost:3000)

**API Example**:
```bash
curl -X POST -d "url=https://example.com" http://localhost:3000/shorten
```

## API Endpoints

| Endpoint           | Method   | Description                          |
|--------------------|----------|--------------------------------------|
| `/`                | `GET`    | Web interface dashboard              |
| `/shorten`         | `POST`   | Create new short URL                 |
| `/qr/{code}.png`   | `GET`    | Get QR code image                    |
| `/delete/{code}`   | `DELETE` | Delete short URL and QR code         |
| `/{code}`          | `GET`    | Redirect to original URL             |

## Web Interface Features

- Real-time list of all shortened URLs
- QR code previews with download links
- Visit counter tracking
- Responsive design that works on mobile devices
- One-click deletion with confirmation
- Form validation for URL input

## Development

ToDo:
- [ ] Add custom alias support
- [ ] Add expiration dates for links

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

## License

MIT © [Its4Nik]
