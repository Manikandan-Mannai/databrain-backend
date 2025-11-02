# Data Query & Visualization Platform — Backend Implementation

This is my **Backend** implementation for the Data Query and Visualization Platform. I built a clean and efficient API for data source querying and dashboard management.

---

## Understanding the Task

The backend was expected to:

1. Handle **user authentication and roles**
2. Allow **data uploads** (CSV or other structured formats)
3. Enable **query execution** and result transformation
4. Manage **charts and dashboards** with sharing controls
5. Provide **secure and scalable APIs** for the frontend

I built it as a RESTful service using Express and MongoDB with full separation of concerns (models, controllers, routes, middleware).

---

## My Approach & Design Choices

### 1. **Authentication & Authorization**

Implemented **JWT-based authentication** with login, registration, and token verification middleware.
Each route is protected using `protect` and `authorize` middleware to ensure only valid users access restricted APIs.

**PS:** Used role-based access (Admin, Editor, Viewer) to dynamically control CRUD permissions on dashboards, charts, and queries.

---

### 2. **Data Upload & Management**

Used **Multer** for handling CSV uploads and storing them temporarily in the `uploads` folder.
After upload, data is parsed and inserted into MongoDB using a dedicated `dataController` that links datasets to their uploader.

**PS:** Optimized for large file handling uploads are streamed and processed asynchronously to prevent blocking the event loop.

---

### 3. **Query Engine**

Built a simple yet flexible **aggregation layer** that lets users filter, group, and aggregate uploaded datasets using MongoDB’s aggregation pipeline.
The `queryController` receives parameters like `groupBy`, `filter`, and `aggregations` to compute dynamic results.

**PS:** The design mirrors SQL like operations (SUM, AVG, COUNT, MIN, MAX) but with MongoDB’s native performance benefits.

---

### 4. **Chart Management**

Each chart is stored as a document linking to its **query result**, **chart type**, and **visual config** (eg: axes, colors).
The `chartController` ensures data integrity and enforces ownership-based access control.

**PS:** Designed for reuse charts can be referenced across multiple dashboards without duplication.

---

### 5. **Dashboard System**

Dashboards act as logical collections of charts. The `dashboardController` handles saving, fetching, sharing, and editing dashboards, letting users update names, access levels, or remove charts through a clean modal interface.

**PS:** Access levels (`private`, `shared`, `public`) are enforced in query filters, and all edit/delete actions are moved inside the modal with confirmations to prevent unauthorized or accidental changes.

---

### 6. **Error Handling & Response Structure**

All controllers use a **consistent response format** with `{ success, message, data }` structure.
Handled 404s globally and implemented async error wrapping to avoid repetitive try/catch blocks.

**PS:** Any unregistered route returns a JSON 404 with `"Route not found"`, keeping API responses predictable for the frontend.

---

### 7. **Database & Schema Design**

Used **Mongoose** to define strongly typed models for:

- User
- DataSource
- Query
- Chart
- Dashboard

Each schema includes timestamps, ownership fields (`createdBy`), and references for relational mapping.

**PS:** Followed minimal, extendable schemas to allow easy integration with additional chart types or data formats in the future.

---

### 8. **Performance & Security**

- Enabled **CORS** with domain restrictions for frontend integration
- Indexed frequent lookup fields like `userId` and `dashboardId`

**PS:** Configured environment variables for secrets and database URLs using dotenv to keep sensitive info outside code.

---

### 9. **Modular Folder Structure**

Followed a scalable service layout that separates responsibilities:

```
src/
├── config/        # Database connection setup
├── controllers/   # Core business logic for each module
├── middleware/    # Auth and error handling
├── models/        # Mongoose schemas
├── routes/        # API route definitions
├── uploads/       # Temporary file storage
└── server.js      # Express app entry point
```

---

### 10. **Integration with Frontend**

The backend was designed to seamlessly support the frontend without extra configuration.
Endpoints follow a consistent naming convention (`/api/data`, `/api/queries`, `/api/charts`, `/api/dashboard`) and return clean, JSON responses.

**PS:** Integrated pagination, status codes, and error messages aligned with the frontend Redux slices for smoother developer experience.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

## Application Screenshots

| Login                                       | Register                                    |
| ------------------------------------------- | ------------------------------------------- |
| <img src="./src/assets/1.png" width="400"/> | <img src="./src/assets/2.png" width="400"/> |

| Dashboard                                   | Data Source                                 |
| ------------------------------------------- | ------------------------------------------- |
| <img src="./src/assets/3.png" width="400"/> | <img src="./src/assets/4.png" width="400"/> |

| CSV Preview                                 | Query Builder & Result                      |
| ------------------------------------------- | ------------------------------------------- |
| <img src="./src/assets/5.png" width="400"/> | <img src="./src/assets/6.png" width="400"/> |

| Chart Builder with preview                  | Line Chart                                  |
| ------------------------------------------- | ------------------------------------------- |
| <img src="./src/assets/7.png" width="400"/> | <img src="./src/assets/8.png" width="400"/> |

| Pie Chart View                              | Set Access Level & Publish Dashboard         |
| ------------------------------------------- | -------------------------------------------- |
| <img src="./src/assets/9.png" width="400"/> | <img src="./src/assets/10.png" width="400"/> |

| Set Shared People                            | Role Management                              |
| -------------------------------------------- | -------------------------------------------- |
| <img src="./src/assets/11.png" width="400"/> | <img src="./src/assets/12.png" width="400"/> |
