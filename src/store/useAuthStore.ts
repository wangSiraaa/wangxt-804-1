import { create } from 'zustand';
import type { User, UserRole } from '@/types';
import { storage, generateId } from '@/utils/storage';
import { mockUsers } from '@/data/mockData';

interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: () => boolean;
  getCurrentUserRole: () => UserRole | null;
  initUsers: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: storage.get<User | null>('current_user', null),
  users: storage.get<User[]>('users', []),

  initUsers: () => {
    const existingUsers = storage.get<User[]>('users', []);
    if (existingUsers.length === 0) {
      storage.set('users', mockUsers);
      set({ users: mockUsers });
    } else {
      set({ users: existingUsers });
    }
  },

  login: (username: string, password: string): boolean => {
    const { users } = get();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      storage.set('current_user', user);
      set({ currentUser: user });
      return true;
    }
    return false;
  },

  logout: (): void => {
    storage.remove('current_user');
    set({ currentUser: null });
  },

  isAuthenticated: (): boolean => {
    return get().currentUser !== null;
  },

  getCurrentUserRole: (): UserRole | null => {
    return get().currentUser?.role || null;
  }
}));
