# 社則AI - Company Rules AI Assistant - Product Requirements Document

## Core Purpose & Success

**Mission Statement**: Provide employees with instant, intelligent access to company rules and policies through an AI-powered interface with role-based security and management capabilities.

**Success Indicators**: 
- Employees can quickly find relevant company policies
- HR teams can efficiently manage rule updates
- AI provides accurate, contextual responses to policy questions
- Secure access control protects sensitive administrative functions

**Experience Qualities**: Professional, Secure, Intuitive

## Project Classification & Approach

**Complexity Level**: Light Application (multiple features with user authentication and role-based access)

**Primary User Activity**: Consuming company information with administrative creation capabilities

## Essential Features

### Authentication & User Management
- **Secure Login System**: Multi-role authentication with demo accounts
- **Role-Based Access Control**: Three distinct user roles (Admin, HR, Employee)
- **User Profile Management**: Display user information and permissions
- **Session Management**: Persistent login state with secure logout

### Company Rules Management
- **Rule Search & Discovery**: Full-text search with category filtering
- **Rule Display**: Clean, organized presentation of company policies
- **Administrative Management**: Add, edit, delete rules (Admin/HR only)
- **Approval Workflow**: HR submissions require admin approval before publication
- **Status Management**: Published, pending, and rejected rule states
- **Categorization**: Organized by department/topic for easy navigation

### Rule Approval System
- **Submission Queue**: Pending rules await admin approval
- **Review Interface**: Admin can approve/reject with comments
- **Status Tracking**: Clear visibility of submission status
- **Notification System**: Visual indicators for pending approvals
- **Audit Trail**: Track who submitted and reviewed each rule

### AI-Powered Question Answering
- **Intelligent Responses**: Context-aware AI assistant for policy questions
- **Conversation History**: Persistent chat history per user session
- **Japanese Language Support**: Native Japanese interface and AI responses
- **Rule Context Integration**: AI trained on current company rulebook

### FAQ Management
- **Common Questions**: Curated frequently asked questions
- **Category Organization**: Organized by topic for quick reference
- **Administrative Updates**: HR/Admin can manage FAQ content

## User Roles & Permissions

### Admin (管理者)
- Full system access
- Manage all rules and FAQ content
- Approve/reject HR rule submissions
- Delete published rules
- User management capabilities
- System configuration access

### HR (人事部)
- Create and edit company rules (requires admin approval)
- Update FAQ content
- Access to AI question system
- View published rules and own submissions
- Cannot delete rules or approve submissions

### Employee (一般社員)
- View published company rules and policies
- Search and filter capabilities
- Access AI question system
- View FAQ content

## Design Direction

### Visual Tone & Identity
**Emotional Response**: Professional confidence with approachable accessibility
**Design Personality**: Clean, corporate, trustworthy yet modern
**Visual Metaphors**: Book/documentation imagery reflecting knowledge repository
**Simplicity Spectrum**: Minimal interface emphasizing content clarity

### Color Strategy
**Color Scheme Type**: Professional monochromatic with blue accent
**Primary Color**: Professional blue (oklch(0.4 0.15 250)) - conveying trust and authority
**Secondary Colors**: Neutral grays for content hierarchy
**Accent Color**: Warm amber (oklch(0.7 0.15 50)) for highlights and important actions
**Color Psychology**: Blue establishes corporate trust, gray provides professional neutrality

### Typography System
**Font Selection**: Noto Sans JP for native Japanese character support
**Typographic Hierarchy**: Clear distinction between headings, body text, and metadata
**Reading Optimization**: Generous line spacing and appropriate text sizing for long-form policy content

### Component Selection & Behavior
**Authentication Components**: Modal login dialog with tabbed interface
**Content Display**: Card-based layout for rule organization
**Administrative Tools**: Form-based interfaces with inline editing
**Navigation**: Tab-based primary navigation with role-based access control
**Feedback Systems**: Toast notifications for user actions and system responses

### Role-Based UI Adaptation
**Dynamic Navigation**: Tabs disabled/hidden based on user permissions
**Contextual Controls**: Edit/delete buttons only visible to authorized users
**Permission Indicators**: Clear visual feedback about access levels
**Graceful Degradation**: Meaningful fallback messages for unauthorized access

## Security Considerations

### Access Control
- Authentication required for AI features
- Role-based function restrictions
- Protected administrative routes
- Session management with proper logout

### Data Protection
- User data stored securely in key-value store
- No sensitive data logged or exposed
- Proper error handling without information leakage

## Technical Implementation

### State Management
- Persistent user authentication state
- Role-based permission hooks
- Secure session management
- Chat history per user session

### Component Architecture
- Modular authentication system
- Reusable permission checking
- Protected route components
- Clean separation of concerns

### User Experience Flow
1. **Guest Access**: View rules and FAQ without login
2. **Login Process**: Simple modal-based authentication
3. **Role Recognition**: Automatic UI adaptation based on permissions
4. **Secure Operations**: Administrative functions properly protected
5. **Session Management**: Persistent state with clean logout

## Edge Cases & Security

### Authentication Edge Cases
- Invalid credentials with clear error messaging
- Role-based access denial with helpful guidance
- Session timeout handling
- Demo account management

### Permission Boundaries
- Clear visual indicators for restricted functions
- Graceful degradation for unauthorized access
- Helpful messaging about required permissions
- Secure administrative operations

## Success Metrics

- Users can authenticate successfully within 30 seconds
- Role-based restrictions properly enforced
- AI responses relevant to authenticated user context
- Administrative functions accessible only to authorized users
- Clean, intuitive interface regardless of user role