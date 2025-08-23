# Authentication System Documentation

## Overview

The Wish Bank authentication system provides secure user registration, login, and profile management with automatic wallet creation. The system is built using Supabase Auth with custom user profiles and validation.

## Features

### ✅ Implemented Features

1. **User Registration**
   - Email and password registration
   - Username validation and uniqueness checking
   - Automatic user profile creation
   - Automatic wallet creation with 5 green wishes starting balance
   - Email confirmation support

2. **User Authentication**
   - Email/password login
   - Secure session management
   - Automatic session restoration
   - Sign out functionality

3. **User Profile Management**
   - View user profile information
   - Edit username with validation
   - Profile update with optimistic UI
   - Real-time profile synchronization

4. **Input Validation**
   - Comprehensive username validation (3-20 chars, alphanumeric + hyphens/underscores)
   - Email format validation
   - Password strength validation (minimum 6 characters)
   - Client-side and server-side validation

5. **Error Handling**
   - User-friendly error messages in Russian
   - Network error detection
   - Validation error handling
   - Toast notifications for user feedback

6. **UI/UX Enhancements**
   - Loading states and spinners
   - Toast notifications for success/error feedback
   - Responsive design
   - Smooth animations and transitions
   - Protected routes with loading states

## Architecture

### Components

```
frontend/
├── contexts/
│   └── AuthContext.tsx          # Main authentication context
├── components/
│   ├── auth/
│   │   ├── AuthPage.tsx         # Combined auth page (sign in/up)
│   │   ├── SignInForm.tsx       # Sign in form component
│   │   ├── SignUpForm.tsx       # Sign up form component
│   │   ├── UserProfile.tsx      # User profile management
│   │   └── ProtectedRoute.tsx   # Route protection wrapper
│   └── ui/
│       ├── Toast.tsx            # Toast notification system
│       └── LoadingSpinner.tsx   # Loading components
├── lib/
│   ├── supabase.ts             # Supabase client configuration
│   ├── validation.ts           # Input validation utilities
│   └── auth-errors.ts          # Error handling utilities
└── app/
    └── layout.tsx              # App layout with providers
```

### Database Schema

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallets table (automatically created for new users)
CREATE TABLE public.wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    green_balance INTEGER DEFAULT 0 CHECK (green_balance >= 0),
    blue_balance INTEGER DEFAULT 0 CHECK (blue_balance >= 0),
    red_balance INTEGER DEFAULT 0 CHECK (red_balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### Database Functions

```sql
-- Automatic user profile and wallet creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    
    INSERT INTO public.wallets (user_id, green_balance, blue_balance, red_balance)
    VALUES (NEW.id, 5, 0, 0); -- Starting balance: 5 green wishes
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Usage

### AuthContext

The `AuthContext` provides the main authentication interface:

```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}
```

### Using Authentication in Components

```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return <div>Welcome, {user.username}!</div>
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function MyPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  )
}
```

### Toast Notifications

```typescript
import { useToast } from '@/components/ui/Toast'

function MyComponent() {
  const { showToast } = useToast()
  
  const handleSuccess = () => {
    showToast({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully'
    })
  }
}
```

## Validation Rules

### Username Validation
- Length: 3-20 characters
- Characters: letters, numbers, hyphens, underscores
- Cannot start or end with special characters
- Cannot contain consecutive special characters
- Must be unique across all users

### Email Validation
- Standard email format validation
- Must be unique across all users

### Password Validation
- Minimum 6 characters
- Maximum 128 characters
- No specific complexity requirements (handled by Supabase)

## Error Handling

The system provides comprehensive error handling with user-friendly messages:

### Common Error Messages
- `"Неверный email или пароль"` - Invalid credentials
- `"Это имя пользователя уже занято"` - Username already taken
- `"Пользователь с таким email уже зарегистрирован"` - Email already registered
- `"Подтвердите свой email перед входом"` - Email not confirmed
- `"Ошибка сети. Проверьте подключение к интернету"` - Network error

### Error Types
- **Validation Errors**: Client-side input validation
- **Authentication Errors**: Supabase auth errors
- **Network Errors**: Connection issues
- **Database Errors**: Constraint violations

## Security Features

### Row Level Security (RLS)
- Users can only access their own profile data
- Automatic data isolation by user ID
- Secure database functions with SECURITY DEFINER

### Input Sanitization
- All user inputs are validated and sanitized
- SQL injection protection through Supabase
- XSS protection through React

### Session Management
- Secure JWT tokens
- Automatic session refresh
- Secure logout with token invalidation

## Testing

### Manual Testing Checklist

1. **Registration Flow**
   - [ ] Register with valid email/password/username
   - [ ] Verify user profile is created
   - [ ] Verify wallet is created with 5 green wishes
   - [ ] Test username uniqueness validation
   - [ ] Test email uniqueness validation
   - [ ] Test input validation errors

2. **Login Flow**
   - [ ] Login with valid credentials
   - [ ] Test invalid email/password combinations
   - [ ] Test email format validation
   - [ ] Verify session persistence

3. **Profile Management**
   - [ ] View profile information
   - [ ] Edit username successfully
   - [ ] Test username validation on update
   - [ ] Test username uniqueness on update

4. **Error Handling**
   - [ ] Network error scenarios
   - [ ] Invalid input scenarios
   - [ ] Database constraint violations

5. **UI/UX**
   - [ ] Loading states work correctly
   - [ ] Toast notifications appear
   - [ ] Forms are responsive
   - [ ] Protected routes work

## Requirements Verification

### Requirement 1.1 ✅
- [x] User registration with unique username
- [x] Profile creation with email and username

### Requirement 1.2 ✅
- [x] Automatic wallet creation with 5 green wishes starting balance
- [x] Database trigger handles wallet creation

### Requirement 1.3 ✅
- [x] Current balance display (implemented in WalletCard)
- [x] Real-time balance updates

### Requirement 1.4 ✅
- [x] Email uniqueness validation
- [x] Proper error handling for duplicate emails

## Future Enhancements

1. **Password Reset**: Email-based password reset functionality
2. **Social Login**: Google/GitHub OAuth integration
3. **Two-Factor Authentication**: SMS or TOTP-based 2FA
4. **Profile Pictures**: Avatar upload and management
5. **Account Deletion**: GDPR-compliant account deletion
6. **Email Verification**: Mandatory email verification flow
7. **Rate Limiting**: Protection against brute force attacks
8. **Audit Logging**: Track authentication events

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure Supabase is running locally
   - Check environment variables
   - Verify database migrations are applied

2. **Username Already Taken**
   - Check database for existing usernames
   - Ensure case-insensitive uniqueness

3. **Email Not Confirmed**
   - Check Supabase email settings
   - Verify email confirmation flow

4. **Session Not Persisting**
   - Check browser storage
   - Verify Supabase client configuration

### Debug Commands

```bash
# Check Supabase status
cd backend && npx supabase status

# View database logs
cd backend && npx supabase logs db

# Reset local database
cd backend && npx supabase db reset
```