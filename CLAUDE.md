# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **WeChat Mini-Program User Management Platform** (用户中台管理系统) - a comprehensive business management system with three main components:

1. **Backend API Server** (`packages/server/`) - Koa.js + TypeScript + MongoDB
2. **Admin Dashboard** (`packages/client/`) - React + Ant Design + UmiJS  
3. **WeChat Mini-Program** (`wechat/miniProgram/card/`) - Native WeChat framework

The system provides user management, role-based access control, WeChat payment integration, and order management specifically designed for WeChat ecosystem commerce.

## Development Commands

### Root Level (Monorepo)
```bash
pnpm install           # Install all dependencies
pnpm dev              # Start all services in development mode
pnpm build            # Build all packages 
pnpm start            # Start production server
pnpm deploy           # Build and start production
```

### Server Commands (packages/server/)
```bash
pnpm dev              # Development with hot reload (ts-node-dev)
pnpm build            # TypeScript compilation with path mapping via tsc-alias
pnpm serve            # Start production server (node dist/app.js)
pnpm init-data        # Initialize database with default users and roles
pnpm reset-admin [username] [password]  # Reset admin password utility
```

### Client Commands (packages/client/)
```bash
pnpm dev              # UmiJS development server (localhost:8000)
pnpm build            # Production build for deployment
```

## Architecture & Structure

### Backend Architecture (packages/server/)
- **Framework**: Koa.js with TypeScript, following MVC + Service Layer pattern
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with role-based middleware
- **Key Directories**:
  - `src/models/` - Mongoose schemas (AdminUser, Role, Menu, WechatUser, Order, WechatPayment, WechatAccount)
  - `src/service/` - Business logic layer with encryption for sensitive data
  - `src/controller/` - API controllers handling request/response
  - `src/routers/` - Route definitions with authentication middleware
  - `src/middleware/` - JWT auth, permissions, CORS configuration
  - `src/scripts/` - Database initialization and admin management utilities

### Frontend Architecture (packages/client/)
- **Framework**: React 18 + UmiJS 4 (Umi Max) + Ant Design 5
- **State Management**: Zustand for global state
- **Key Directories**:
  - `src/pages/` - Route-based page components (dashboard, users, roles, wechat management)
  - `src/hooks/` - Custom hooks (usePermission, useUser for RBAC)
  - `src/services/` - API service layer with Axios
  - `src/layouts/` - Application layout components
  - `src/stores/` - Zustand state stores

### WeChat Integration (wechat/miniProgram/card/)
- **Platform**: Native WeChat Mini-Program framework
- **Features**: User authentication, payment processing, order management
- **API Integration**: Connects to backend via platform-specific endpoints (`/api/wechat/{platformId}/`)

## Data Models & Key Concepts

### Core Entities
- **AdminUser**: System administrators with platform associations
- **Role**: Role definitions with permission arrays
- **Menu**: Hierarchical menu structure with permission mapping
- **WechatUser**: WeChat mini-program users with encrypted session data
- **WechatAccount**: WeChat app configurations with encrypted secrets (appSecret, mchKey)
- **Order**: E-commerce orders with WeChat payment integration
- **WechatPayment**: Payment records with transaction lifecycle management

### RBAC Permission System
- **Pattern**: Role-Based Access Control with granular permissions
- **Format**: `resource:action` (e.g., `user:create`, `role:delete`, `menu:read`)
- **Special**: `*` represents super admin permissions
- **Implementation**: 
  - Backend: `requirePermission()` middleware
  - Frontend: `usePermission()` hook for component-level control

### Platform-Based Multi-tenancy
- **Concept**: Data isolation using `platformId` field across all entities
- **Usage**: Enables multi-platform WeChat mini-program management
- **API Pattern**: `/api/wechat/{platformId}/` for platform-specific endpoints

## WeChat Integration Patterns

### Authentication Flow
1. Mini-program calls `wx.login()` to get `code`
2. Backend exchanges `code` for `session_key` via WeChat API  
3. User info decryption using AES with `session_key`
4. JWT token generation for subsequent API calls

### Payment Processing
1. Order creation with product details and pricing
2. WeChat unified order API call to generate `prepay_id`
3. Return payment parameters to mini-program
4. Payment completion callback handling and order status updates

### Security Measures
- **Encryption**: Sensitive data (WeChat session keys, payment credentials) encrypted with AES
- **Signature Verification**: WeChat API signature validation
- **Token-based Auth**: JWT tokens with expiration for API access

## Database Setup & Default Data

### Initial Setup
```bash
cd packages/server
pnpm run init-data    # Creates default users, roles, and menus
```

### Default Accounts (from README.md)
- **super** / super123 - Super administrator (all permissions)
- **admin** / admin123 - System administrator 
- **test** / test123 - Regular user

### Database Configuration
- **Connection**: MongoDB via Mongoose with connection string in environment variables
- **Models**: Centralized in `src/models/` with proper indexing and relationships
- **Validation**: Mongoose schema validation with custom methods

## Environment Configuration

### Server Environment Variables
```bash
NODE_ENV=development|production
PORT=3000
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/center
ENCRYPTION_KEY=32-character-encryption-key
```

### WeChat Configuration
- **App Credentials**: Stored encrypted in WechatAccount model
- **Payment Config**: Merchant ID, API keys, and certificate content (text-based storage)
- **Callback URLs**: Configurable payment and refund notification endpoints

## Common Development Patterns

### Adding New API Endpoints
1. Define Mongoose model in `src/models/`
2. Implement business logic in `src/service/`
3. Create controller in `src/controller/`
4. Configure routes in `src/routers/` with appropriate middleware
5. Add frontend service function in `src/services/`

### Permission-Controlled Features
1. Define permission string in role management
2. Use `requirePermission()` middleware on backend routes
3. Use `usePermission()` hook in React components for conditional rendering
4. Update menu permissions in database for navigation control

### WeChat API Integration
1. Implement service methods with signature verification
2. Handle encrypted data decryption with stored session keys
3. Use platform-specific routing for multi-tenant support
4. Implement proper error handling for WeChat API responses

## Key Technical Constraints

### File Upload Handling
- **Certificate Storage**: Text-based content storage (not file uploads)
- **WeChat Certificates**: PEM content stored directly in database fields
- **General Uploads**: Uses @koa/multer for file handling

### Build Configuration
- **TypeScript**: Uses `tsc-alias` for path mapping resolution
- **Monorepo**: Turbo for orchestrated building with dependency management
- **Package Manager**: pnpm workspaces with consistent versioning

### Security Considerations
- **Sensitive Data**: Always encrypted before database storage
- **API Authentication**: JWT middleware applied to protected routes with skip paths for static assets
- **WeChat Integration**: Signature verification and encrypted parameter handling