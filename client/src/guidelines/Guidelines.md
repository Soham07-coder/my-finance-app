# Family Finance App - Development Guidelines

## General Guidelines

* Keep web and mobile applications completely separate
* Web app should prioritize desktop experience with responsive mobile support
* Mobile app should prioritize native mobile patterns and touch interactions
* Maintain consistency in business logic and data models across platforms
* Use proper TypeScript interfaces for web, proper Dart models for mobile

## Web Application Guidelines (`/`)

### Design System
* Use a base font-size of 14px (defined in globals.css)
* Follow the existing color scheme with proper light/dark mode support
* Use shadcn/ui components as the foundation
* Maintain consistent spacing using Tailwind's spacing scale
* Date formats should be in "MMM dd, yyyy" format for full dates, "MMM dd" for shorter formats

### Layout & Navigation
* Desktop-first approach with mobile breakpoints
* Sidebar navigation for desktop (collapsible)
* Bottom navigation for mobile screens
* Global search bar in the navigation
* Use modals/dialogs for desktop interactions
* Implement proper keyboard navigation support

### Components & Interactions
* Use Card components for grouping related content
* Implement proper loading states and error handling
* Use toast notifications for feedback (sonner)
* Personal/Family toggle should be consistent across pages
* Transaction lists should support search, filtering, and sorting
* Forms should have proper validation and error states

### Data & Currency
* Use Indian Rupee (₹) symbol and formatting
* Format numbers using Intl.NumberFormat with 'en-IN' locale
* Support both family and personal financial views
* Implement proper transaction categorization

## Mobile Application Guidelines (`/flutter_app`)

### Design System
* Follow Material Design 3 principles
* Use dynamic color schemes with proper theming
* Implement smooth animations and transitions
* Use Inter font family for consistency with web
* Maintain consistent color semantics across light/dark themes

### Navigation & Interaction
* Bottom navigation with floating action button
* Use bottom sheets instead of modals
* Implement pull-to-refresh patterns
* Support swipe gestures where appropriate
* Use native platform patterns (iOS/Android specific when needed)

### Mobile-Specific Features
* Location-aware cash payment alerts
* Touch-optimized form inputs
* Native date/time pickers
* Proper keyboard handling
* Biometric authentication support (future)

### Performance & Animation
* Use Flutter's animation system for smooth transitions
* Implement proper list performance (ListView.builder)
* Use hero animations for navigation transitions
* Optimize image loading and caching
* Implement proper state management

## Shared Business Logic

### Transaction Management
* Support both income and expense transactions
* Dynamic category selection based on transaction type
* Payment method tracking (UPI, Cash, Cards, etc.)
* Location tracking for cash payments
* Recurring transaction support

### Family Features
* Family creation and joining via Family ID
* Member invitation system
* Role-based permissions (Admin vs Member)
* Shared family expenses vs personal expenses
* Family financial overview and analytics

### Data Models
* Consistent transaction structure across platforms
* Proper date handling and timezone support
* Currency amount handling with proper precision
* Category and payment method standardization

## Platform-Specific Considerations

### Web (`/`)
* Optimize for keyboard and mouse interactions
* Support multiple browser environments
* Implement proper SEO considerations
* Use responsive design for various screen sizes
* Support browser back/forward navigation

### Mobile (`/flutter_app`)
* Optimize for touch interactions
* Handle different screen densities and sizes
* Support platform-specific features (iOS/Android)
* Implement proper lifecycle management
* Handle device rotation and multitasking

## Code Quality

### Web
* Use TypeScript strictly with proper interfaces
* Implement proper error boundaries
* Use React hooks appropriately (avoid unnecessary re-renders)
* Keep components focused and reusable
* Follow React best practices for state management

### Mobile
* Use Dart's type system effectively
* Implement proper widget lifecycle management
* Use StatefulWidget vs StatelessWidget appropriately
* Follow Flutter's composition over inheritance principle
* Implement proper async/await patterns

## Testing

### Web
* Unit tests for utility functions
* Component tests for UI components
* Integration tests for user flows
* Accessibility testing

### Mobile
* Widget tests for UI components
* Unit tests for business logic
* Integration tests for user flows
* Platform-specific testing (iOS/Android)

## Deployment

### Web
* Optimize bundle size
* Implement proper caching strategies
* Support progressive web app features
* Ensure cross-browser compatibility

### Mobile
* Follow platform store guidelines
* Implement proper app signing
* Support different device configurations
* Handle app updates gracefully