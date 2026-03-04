# Job Application Kit — development commands

set windows-shell := ["powershell.exe", "-Command"]

default:
    just --list

# Install dependencies
install:
    npm install

# Start the app in development mode with HMR
dev:
    npm run dev

# Build for production
build:
    npm run build

# Preview the production build
preview:
    npm run preview

# Run unit tests
test:
    npx vitest

# Run tests in watch mode
test-watch:
    npx vitest --watch

# Type-check all TypeScript project references
typecheck:
    npx tsc --build --noEmit

# Lint the source
lint:
    npx eslint src

# Auto-format source files with Prettier
format:
    npx prettier --write src

# Generate Drizzle migrations from schema changes
db-generate:
    npx drizzle-kit generate

# Apply pending migrations
db-migrate:
    npx drizzle-kit migrate

# Open Drizzle Studio (DB browser)
db-studio:
    npx drizzle-kit studio

# Delete all app data (DB, master CV, sessions). App recreates structure on next launch.
[windows]
reset-data:
    -Remove-Item -Recurse -Force "$env:APPDATA\Job Application Kit" -ErrorAction SilentlyContinue
    Write-Host "App data cleared."

[macos]
reset-data:
    rm -rf "$HOME/Library/Application Support/Job Application Kit"
    echo "App data cleared."

[linux]
reset-data:
    rm -rf "$HOME/.config/Job Application Kit"
    echo "App data cleared."

# Package for Windows
build-win:
    npm run build:win

# Package for macOS
build-mac:
    npm run build:mac

# Package for Linux
build-linux:
    npm run build:linux
