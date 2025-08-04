# Patient Note Backend - Interview Assignment

A scalable healthcare document management system built with Node.js. Demonstrates asynchronous processing, cloud storage integration, and OCR capabilities for extracting text from medical documents.

## 🏗️ Technical Implementation

**Architecture**: RESTful API with async processing pipeline  
**Stack**: Express.js + TypeScript + PostgreSQL/Prisma + AWS S3 + Tesseract.js + JWT

**Processing Flow**:
1. Document upload → Immediate S3 storage + API response
2. Background worker → OCR text extraction via Tesseract.js  
3. Extracted text → Database storage for search/analysis

This design ensures responsive user experience while handling computationally expensive OCR operations asynchronously.

## 🚀 Running the Application

**Prerequisites**: Node.js 18+, PostgreSQL instance, AWS S3 bucket

```bash
# Installation
git clone <repository-url>
cd patient-note-backend
npm install

# Environment Configuration
cp .env.example .env  # Configure with your credentials
DATABASE_URL="postgresql://username:password@localhost:5432/patient_notes"
JWT_SECRET="your-secure-jwt-secret"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="your-s3-bucket"
PORT=3000

# Database Setup & Seeding
npx prisma migrate dev
npm run seed

# Start Development Server
npm run dev
```

## 🔗 Demo & Testing

**Live Application**: [Frontend Demo URL]  
**API Documentation**: [Complete API Specification & System Design]

**Test Credentials** (Auto-seeded):
- 1 Doctor account + 5 Patient records  
- Login credentials displayed on frontend

**Core Endpoints**:
- `POST /auth/login` - Doctor authentication
- `GET /patients` - Patient listing with pagination  
- `POST /notes/upload|manual` - Document upload with OCR processing or manual text entry
- `GET /notes` - Retrieve notes with extracted text and manual entries

## 🔧 Technical Decisions & Trade-offs

**Async Processing**: Implemented background OCR processing to prevent API timeouts on large documents. This pattern supports future scaling to message queues (Redis/Bull) for distributed processing.

**Security (MVP Scope)**: 
- JWT authentication with secure token handling
- File validation and CORS protection  
- **PII Encryption**: Intentionally omitted for MVP; production ready with `crypto` (AES-256-GCM) or PostgreSQL `pgcrypto`

**Database Design**: Prisma ORM with relational schema (Doctor → Patient → Notes → Files) enabling efficient queries and type safety.

**Cloud Integration**: AWS S3 for scalable file storage with proper error handling and retry logic.

## 📋 Implementation Scope & Future Enhancements

**Current MVP Features**:
- ✅ RESTful API with TypeScript & Express.js
- ✅ JWT-based authentication system  
- ✅ Asynchronous OCR processing pipeline
- ✅ AWS S3 integration for file storage
- ✅ PostgreSQL with Prisma ORM
- ✅ Comprehensive error handling & logging
- ✅ Unit/Integration testing with Jest

**Production Considerations** (Outside current scope):
- **Scalability**: Connection pooling, persistent queues, rate limiting, APM monitoring
- **Security**: Input sanitization, RBAC, session management, PII encryption  
- **Operations**: Automated S3 cleanup, audit logging, backup strategies


## 🧪 Testing & Development

```bash
npm test              # Run Jest test suite
npm run test:watch    # Development testing mode  
npm run dev           # Development server with hot reload
```

**Project Structure**: Modular architecture with controllers, services, middleware, and utilities. Clean separation of concerns with dedicated layers for authentication, validation, and business logic.

---

*This project demonstrates practical implementation of healthcare document management with modern Node.js stack, showcasing async processing, cloud integration, and scalable architecture patterns.*