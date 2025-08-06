# Family Finance Management Application

A comprehensive family-centric financial management application with separate implementations for web and mobile platforms.

## Project Structure

This project contains two distinct applications:

### 🌐 Web Application (React/TypeScript)
- **Location**: Root directory
- **Technology Stack**: React, TypeScript, Tailwind CSS v4, shadcn/ui
- **Target Platform**: Desktop browsers, responsive design
- **Entry Point**: `App.tsx`

### 📱 Mobile Application (Flutter)
- **Location**: `/flutter_app` directory  
- **Technology Stack**: Flutter, Dart, Material Design 3
- **Target Platform**: iOS and Android mobile devices
- **Entry Point**: `/flutter_app/lib/main.dart`

## Web Application Features

### Core Pages
- **Dashboard**: Financial overview with Personal/Family toggle, recent transactions
- **Transactions**: Comprehensive transaction management with search and filtering
- **My Family**: Family collaboration hub with member management
- **Analytics**: Advanced spending analytics and insights
- **Settings**: Account management with tabbed interface (Profile, Family, Categories, Security)
- **Add Transaction**: Enhanced transaction entry with dynamic categories and cash alerts

### Key Web-Specific Features
- **Responsive Design**: Optimized for desktop with mobile breakpoints
- **Sidebar Navigation**: Collapsible sidebar for desktop, bottom navigation for mobile
- **Global Search**: Transaction search in the navigation bar
- **Desktop Modals**: Dialog-based interactions suitable for larger screens
- **Keyboard Navigation**: Full keyboard accessibility support

## Mobile Application Features

### Core Screens
- **Dashboard**: Mobile-optimized with smooth animations and touch interactions
- **Transactions**: Pull-to-refresh, bottom sheets for filters
- **Family**: Touch-friendly member management
- **Analytics**: Mobile charts and insights (coming soon)
- **Settings**: Mobile-optimized settings with native patterns
- **Add Transaction**: Mobile form with location awareness and touch-optimized inputs

### Key Mobile-Specific Features
- **Native Navigation**: Bottom navigation with floating action button
- **Touch Gestures**: Swipe, pull-to-refresh, and touch-optimized interactions
- **Bottom Sheets**: Mobile-native modal patterns
- **Location Awareness**: Smart cash payment alerts when away from home
- **Smooth Animations**: Native-feeling transitions and micro-interactions

## Development Guidelines

### Web Application (`/`)
- Uses 14px base font size as defined in `globals.css`
- Follows desktop-first responsive design patterns
- Utilizes shadcn/ui components with Tailwind CSS v4
- Implements proper TypeScript interfaces
- Maintains consistent spacing and typography from design system

### Mobile Application (`/flutter_app`)
- Follows Material Design 3 principles
- Implements smooth animations with Flutter's animation system
- Uses responsive design for different screen sizes
- Maintains platform-specific UI patterns

## Getting Started

### Web Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Mobile Application
```bash
# Navigate to Flutter app directory
cd flutter_app

# Get Flutter dependencies
flutter pub get

# Run on iOS simulator
flutter run

# Run on Android emulator
flutter run
```

## Design System

### Web Colors & Typography
- Base font size: 14px
- Primary color: #030213
- Uses Tailwind v4 custom properties for theming
- Supports light and dark modes

### Mobile Design
- Material Design 3 color schemes
- Dynamic theming support
- Custom gradient cards and animations
- Inter font family for consistency

## Contributing

When contributing to this project:

1. **Web changes** should be made in the root directory
2. **Mobile changes** should be made in the `/flutter_app` directory
3. Keep the two applications completely separate
4. Follow the respective platform's design guidelines
5. Maintain consistency in business logic across platforms

## Architecture

Both applications share the same core business logic and data models but implement platform-specific UI patterns:

- **Web**: Desktop-optimized with traditional navigation patterns
- **Mobile**: Touch-optimized with native mobile interactions

This separation ensures each platform provides the best possible user experience while maintaining feature parity.