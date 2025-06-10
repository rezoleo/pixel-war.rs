#!/bin/bash

# Build the frontend
(
    cd frontend
    pnpm install
    pnpm run build
)

# Build the backend
(
    cd backend
    cargo build --release
)

# Copy the frontend build to the backend static directory
(
    mkdir -p backend/static
    cp -r frontend/build/client/* backend/static/
)
