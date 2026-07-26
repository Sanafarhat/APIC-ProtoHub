# APIC ProtoHub Architecture

## Overview
APIC ProtoHub is a comprehensive, cloud-based end-to-end digital operating system built for the Advanced Prototyping & Innovation Centres (APICs). It follows a **Prototyping as a Service (PaaS)** model, providing friction-free access to advanced prototyping infrastructure for startups, MSMEs, students, and research organizations statewide in Andhra Pradesh.

## System Architecture

The platform operates on a robust MERN (MongoDB, Express, React, Node.js) stack, heavily utilizing modern frontend tooling and a modular backend architecture to ensure high availability, multi-tenant scalability, and real-time operations.

### 1. Frontend Architecture (Client)
- **Framework:** React.js powered by Vite for rapid development and optimized production builds.
- **Styling:** Vanilla CSS coupled with Tailwind-like utility classes and a fully responsive, modern design system focusing on rich aesthetics, smooth micro-animations, and glassmorphism.
- **Routing:** React Router DOM for single-page application (SPA) client-side routing.
- **State Management:** React hooks (`useState`, `useEffect`, `useContext`) combined with localized state for modular components.
- **Key Modules:**
  - **Innovator (User) Dashboard:** Handles CAD uploads, AI-driven quote generation, facility booking, payment simulated gateways, tracking pipelines, and telemetry analysis.
  - **Operator Dashboard:** A tailored ERP interface for individual APIC facility managers to approve/reject bookings, manage facility-specific inventory, review user CAD designs, and update machine statuses. Operators are constrained to modify only their own organization's data.
  - **Admin Dashboard:** A god-eye view of all platform analytics, bookings, users, and overall infrastructure utilization across the entire state.
  - **Dynamic Authentication:** Role-based sign-up allowing Students, Professionals, Startups/MSMEs, and Operators to register with specific metadata (e.g., College ID, Gov ID, organization mapping).

### 2. Backend Architecture (Server)
- **Runtime:** Node.js with Express.js.
- **Database:** MongoDB (via Mongoose), representing a scalable NoSQL schema perfectly suited for diverse telemetry logs, dynamic facility configurations, and nested JSON properties.
- **Authentication:** Firebase Auth combined with JWT. Provides robust identity verification, while user role authorization is enforced securely at the API layer.
- **Key Modules & Controllers:**
  - **Auth & Users:** Manages role-based access control (RBAC), user profile data, and organization matching.
  - **Facilities API:** Multi-tenant facility management allowing dynamic scaling of centers across different universities and tech parks.
  - **Bookings API:** The core transaction engine linking innovators with facilities. Manages state transitions (`pending` -> `approved` -> `in-progress` -> `completed` -> `dispatched`).
  - **AI Quote & Telemetry Engine (Mocked AI):** Processes geometry files (e.g., STL, OBJ, STEP) to estimate machining time, material cost, and optimal equipment matching with high confidence scores. 

### 3. Multi-Tenant Scalability Strategy
The architecture natively isolates data through organizational boundaries. When an operator registers, they are linked to a specific `collegeName` or `organization`. Backend middleware enforces that:
- Innovators can view and book any facility statewide.
- Operators can *only* view, approve, and manage bookings and facilities belonging to their specific center.
- Admins have overarching CRUD capabilities.

### 4. Third-Party Integrations
- **Cloud Database:** MongoDB Atlas for high-availability database hosting.
- **Storage/Auth:** Firebase Authentication.
- **Generative AI Analysis:** Integrated AI endpoints to synthesize uploaded CAD details and auto-fill quotation details (reducing manual quoting time drastically).

## Security & Access Control
- **Data Privacy:** Role-Based Access Control (RBAC) securely scopes data fetching to the authenticated user's permissions.
- **API Protection:** Protected routes ensure unauthenticated requests are dropped at the middleware layer.
- **Deployment Safety:** Secrets and API keys are strictly managed via environment variables (e.g., `.env` configurations).

## Future Roadmap
- Implementation of WebSockets for live streaming of machine telemetry and job progress.
- Integration with an actual Razorpay/Stripe payment gateway.
- Integration with physical IoT sensors at APIC centers to feed live machine data to the backend.
