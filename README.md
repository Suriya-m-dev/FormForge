# FormForge – Dynamic Form Builder & Submission Management System

FormForge is a full-stack web application that allows administrators to create and manage dynamic forms, publish them for public access, and manage submitted responses through an administrative dashboard.

## Features

### Authentication & Authorization
- Admin login and logout.
- JWT-based authentication using HTTP-only cookies.
- Protected administrative routes.
- Password hashing using bcrypt.

### Form Management
- Create, view, edit and archive forms.
- Publish forms and manage Draft, Published and Archived statuses.
- Configure form name and description.
- Add, edit, delete and reorder dynamic fields.

### Dynamic Form Builder

Supports nine field types:
- Text
- Email
- Number
- Phone
- Textarea
- Date
- Select
- Radio
- Checkbox

Field configuration:
- Labels and unique keys.
- Placeholders and default values.
- Required field settings.
- Select, radio and checkbox options.
- Field validation rules.

### Public Form Submission
- Publicly accessible published forms.
- Dynamic rendering based on backend form definitions.
- Server-side validation against published form definitions.
- Submission success and error handling.

### Submission Management
- Paginated submission listing.
- Individual submission details.
- Submission deletion.

### Dashboard
- Total form statistics.
- Published, draft and archived form counts.
- Recently created forms.

## Technology Stack

| Frontend | Backend |
|---|---|
| React | Node.js |
| TypeScript | Express.js |
| Vite | TypeScript |
| Tailwind CSS v4 | MongoDB |
| Redux Toolkit | Mongoose |
| RTK Query | Zod |
| React Router | JWT |
| React Hook Form | bcrypt |
| Zod | Helmet |
| dnd-kit | Pino Logger |
| Sonner | Vitest |
| Lucide React | |

## Architecture

### Frontend

Feature-based architecture:

```text
client/
└── src/
    ├── app/
    ├── components/
    │   ├── common/
    │   ├── layout/
    │   └── ui/
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── forms/
    │   └── submissions/
    ├── lib/
    ├── routes/
    ├── index.css
    └── main.tsx
```

### Backend

Layered architecture:

```text
server/
└── src/
    ├── config/
    ├── middlewares/
    ├── modules/
    │   ├── auth/
    │   ├── forms/
    │   └── submissions/
    ├── routes/
    ├── utils/
    ├── app.ts
    └── server.ts
```

Request flow:

`Routes → Middleware → Controller → Service → Repository → Model`

## Application Design

- Form fields are stored within their corresponding form documents.
- Published forms use immutable snapshots of their published definitions.
- Public forms are rendered using the published backend definition.
- Submissions are stored separately from form documents.
- Each submission retains its relevant form version and snapshot information.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd formforge
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` as a reference.

```env
NODE_ENV=development
PORT=5000
LOG_LEVEL=debug

CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/formforge

JWT_SECRET=your_secure_random_jwt_secret
JWT_EXPIRES_IN=1d

COOKIE_SECRET=your_secure_random_cookie_secret
```

Generate strong random values for `JWT_SECRET` and `COOKIE_SECRET`. Never use example placeholders as production secrets.

Start the backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### Create the Initial Admin Account

Before creating the admin account, add these variables to `server/.env`:

```env
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_secure_password_at_least_12_characters
```

Run the following command from the `server` directory:

```bash
npm run seed:admin
```

The seed script hashes the password before storing it. If an admin account with the configured email already exists, no changes are made.

Use your configured admin email and password to log in. Never commit actual credentials to Git.

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file using `.env.example` as a reference.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## API Overview

Base URL: `/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Admin login |
| GET | `/auth/me` | Get authenticated admin |
| POST | `/auth/logout` | Admin logout |
| POST | `/forms` | Create form |
| GET | `/forms` | List forms |
| GET | `/forms/:id` | Get form details |
| PUT | `/forms/:id` | Update form |
| PATCH | `/forms/:id/publish` | Publish form |
| DELETE | `/forms/:id` | Archive form |
| GET | `/public/forms/:formId` | Get published public form |
| POST | `/submissions/:formId` | Submit public form |
| GET | `/submissions/:formId` | List submissions |
| GET | `/submissions/:formId/:submissionId` | Get submission details |
| DELETE | `/submissions/:formId/:submissionId` | Delete submission |

Administrative endpoints require authentication. Public form retrieval and submission endpoints do not require admin authentication.

## Security

- Password hashing using bcrypt.
- JWT authentication with HTTP-only cookies.
- Protected administrative routes and role-based authorization.
- Zod request validation.
- Backend-side dynamic submission validation.
- Rejection of unexpected submission fields.
- API rate limiting.
- Helmet security headers.
- Configurable CORS.
- Environment-based configuration.
- Sensitive information redaction in logs.

## Testing

Backend tests use Vitest.

Run backend tests:

```bash
npm test
```

Run backend TypeScript checks:

```bash
npm run typecheck
```

Create backend production build:

```bash
npm run build
```

For the frontend:

```bash
npm run typecheck
npm run build
```

Run these commands from their respective `server` and `client` directories.

## Environment Configuration

Environment files are excluded from Git.

Configuration templates:
- `client/.env.example`
- `server/.env.example`

Never commit actual credentials, JWT secrets or database connection strings.

## Future Improvements

- Redis-based caching.
- Background processing for notifications.
- Cursor-based pagination for larger datasets.
- Advanced monitoring and application metrics.

---

**FormForge – Dynamic Form Builder & Submission Management System**