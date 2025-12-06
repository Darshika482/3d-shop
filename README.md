# 3D Fabric Shop

A full-stack web application with a 3D virtual shop view and an admin panel.

## Prerequisites

- Node.js (v14+)
- MongoDB (running locally or cloud URI)

## Setup

1.  **Clone the repository** (if not already done).

2.  **Backend Setup**:
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in `server/` (optional, defaults provided):
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/3d-shop
    ADMIN_TOKEN=admin-secret
    ```

3.  **Frontend Setup**:
    ```bash
    cd client
    npm install
    ```

## Running the App

1.  **Start the Backend**:
    ```bash
    cd server
    npm run dev
    ```
    Server runs on `http://localhost:5000`.

2.  **Start the Frontend**:
    ```bash
    cd client
    npm run dev
    ```
    Frontend runs on `http://localhost:5173`.

## Usage

- **Public View**: Open `http://localhost:5173/` to see the 3D shop.
- **Admin Panel**: Open `http://localhost:5173/admin` to configure the shop and upload images.

## Features

- **3D Shop**: Interactive 3D view using Three.js.
- **Admin Panel**: Manage shop details, upload wall images, and configure the left wall grid.
- **Dynamic Grid**: The left wall is composed of a grid of tiles (default 5x2), configurable in the admin panel.
