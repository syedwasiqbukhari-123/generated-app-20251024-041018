# DentaFlow OS

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/syedwasiqbukhari-123/generated-app-20251024-041018)

DentaFlow OS is a minimalist, high-usability web application designed for small-to-medium dental clinics. It focuses on streamlining core operations through a clean, intuitive, and visually stunning interface. The system features role-based access control, ensuring that staff members only see information relevant to their roles (Admin, Manager, Doctor, etc.). Key modules include a comprehensive patient portal, service management, inventory tracking, streamlined invoicing with PKR as the default currency, and an interactive appointment scheduler. The entire experience is built on a modern, serverless architecture using Cloudflare Workers, ensuring speed, reliability, and scalability.

## Key Features

-   **Role-Based Access Control:** Pre-configured roles (Admin, Manager, Doctor, etc.) with a permission matrix to control module visibility.
-   **Patient Management:** Comprehensive patient records, visit history, and a dedicated patient portal.
-   **Appointment Scheduling:** An interactive calendar for managing patient appointments.
-   **Service Management:** Define and manage all dental services offered, including pricing and duration.
-   **Invoicing & Payments:** Create and manage invoices, track payment statuses, with PKR as the default currency.
-   **Inventory Tracking:** Manage dental supplies, get low-stock alerts, and track stock consumption.
-   **Dashboard & Reports:** At-a-glance KPIs on the dashboard and detailed operational reports.
-   **Secure Authentication:** Secure login accepting username or email, with JWT-based session management.
-   **Built on Cloudflare:** Leverages Cloudflare Workers and Durable Objects for a fast, scalable, and reliable serverless backend.

## Technology Stack

-   **Frontend:** React, TypeScript, Vite, React Router
-   **Backend:** Hono on Cloudflare Workers
-   **State Management:** Zustand
-   **Styling:** Tailwind CSS, shadcn/ui, Framer Motion
-   **Data Persistence:** Cloudflare Durable Objects
-   **Forms:** React Hook Form with Zod for validation
-   **Icons:** Lucide React

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed and authenticated with your Cloudflare account.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/dentaflow_os.git
    cd dentaflow_os
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Local Development with Wrangler:**
    This template uses Cloudflare Durable Objects, which require Wrangler for local simulation. The `bun dev` command handles this for you.

### Running the Application

To start the development server for both the frontend and the worker backend, run:

```bash
bun dev
```

This will start the Vite development server for the React frontend and a local Wrangler process to serve the Hono API and simulate the Durable Object environment. The application will be available at `http://localhost:3000`.

## Project Structure

-   `src/`: Contains the React frontend application code.
    -   `pages/`: Top-level page components.
    -   `components/`: Reusable React components, including shadcn/ui elements.
    -   `lib/`: Utility functions and API client.
    -   `hooks/`: Custom React hooks.
-   `worker/`: Contains the Cloudflare Worker backend code (Hono API).
    -   `index.ts`: The entry point for the worker.
    -   `user-routes.ts`: Where you should add your API routes.
    -   `entities.ts`: Defines the data models and their interaction with Durable Objects.
    -   `core-utils.ts`: Core logic for the Durable Object entity system (do not modify).
-   `shared/`: TypeScript types and mock data shared between the frontend and backend.

## Development

### Backend (API)

-   API routes are defined in `worker/user-routes.ts` using the Hono framework.
-   Data models (Entities) are defined in `worker/entities.ts`. Extend the `IndexedEntity` class to create new data types that are automatically stored and indexed in the global Durable Object.
-   Always use the shared types from `shared/types.ts` to ensure type safety between the client and server.

### Frontend (UI)

-   The frontend is a standard Vite + React application.
-   Pages are located in `src/pages`.
-   Reusable components are in `src/components`. This project heavily utilizes `shadcn/ui`, so prefer using components from `src/components/ui` whenever possible.
-   The API client in `src/lib/api-client.ts` provides a typed function for making requests to the backend.

## Deployment

This project is designed for seamless deployment to Cloudflare Pages.

1.  **Build the project:**
    ```bash
    bun build
    ```

2.  **Deploy to Cloudflare:**
    The `wrangler deploy` command will build your application and deploy it to your Cloudflare account.

    ```bash
    bun deploy
    ```

Alternatively, you can connect your GitHub repository to Cloudflare Pages for automatic deployments on every push.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/syedwasiqbukhari-123/generated-app-20251024-041018)