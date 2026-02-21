export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Mock authentication - in a real app, this would connect to your backend
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@inventory.com',
    password: 'admin123',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    username: 'user',
    email: 'user@inventory.com',
    password: 'user123',
    role: 'user' as const,
    createdAt: new Date().toISOString(),
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(1000); // Simulate network delay
    
    const user = mockUsers.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: `mock-jwt-token-${user.id}-${Date.now()}`,
    };
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    await delay(1000); // Simulate network delay
    
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (mockUsers.some(u => u.email === credentials.email)) {
      throw new Error('Email already exists');
    }
    
    if (mockUsers.some(u => u.username === credentials.username)) {
      throw new Error('Username already exists');
    }
    
    const newUser = {
      id: mockUsers.length + 1,
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    
    const { password, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword,
      token: `mock-jwt-token-${newUser.id}-${Date.now()}`,
    };
  },

  logout: async (): Promise<void> => {
    await delay(500);
    // In a real app, you'd invalidate the token on the server
  },

  getCurrentUser: async (): Promise<User | null> => {
    await delay(500);
    // In a real app, you'd validate the token and return user info
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    // Mock token validation
    const userId = parseInt(token.split('-')[2]);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};














