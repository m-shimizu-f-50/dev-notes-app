# Zustand + IndexedDB による状態管理

Zustand と IndexedDB を組み合わせて、クライアント側で状態を永続化する実装方法です。

## 概要

- **Zustand**: 軽量でシンプルな状態管理ライブラリ
- **IndexedDB**: ブラウザのクライアント側データベース
- **組み合わせ**: Zustand の状態を IndexedDB に自動で永続化し、ページリロード後も状態を保持

## インストール

```bash
npm install zustand
npm install idb-keyval  # IndexedDB を簡単に扱うためのライブラリ（オプション）
# または
npm install dexie  # IndexedDB のラッパーライブラリ（オプション）
```

## Zustand の基本

### 基本的な使い方

```tsx
import { create } from 'zustand';

interface BearState {
  bears: number;
  increase: () => void;
  decrease: () => void;
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  decrease: () => set((state) => ({ bears: state.bears - 1 })),
}));

// 使用例
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return (
    <div>
      <h1>{bears} bears around here...</h1>
      <button onClick={increase}>Add bear</button>
    </div>
  );
}
```

## IndexedDB との統合

### 方法1: idb-keyval を使用した実装

`idb-keyval` は IndexedDB を簡単に扱うための軽量ライブラリです。

```tsx
import { create } from 'zustand';
import { get, set, del } from 'idb-keyval';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  
  setUser: async (user: User) => {
    set({ user });
    // IndexedDB に保存
    await set('user', user);
  },
  
  clearUser: async () => {
    set({ user: null });
    // IndexedDB から削除
    await del('user');
  },
}));

// 初期化時に IndexedDB からデータを読み込む
const initializeStore = async () => {
  const savedUser = await get<User>('user');
  if (savedUser) {
    useUserStore.setState({ user: savedUser });
  }
};

// アプリ起動時に実行
initializeStore();
```

### 方法2: カスタムミドルウェアを使用した実装

Zustand のミドルウェア機能を使って、自動的に IndexedDB に保存する実装です。

```tsx
import { create } from 'zustand';
import { StateCreator } from 'zustand';
import { get, set, del } from 'idb-keyval';

// IndexedDB に永続化するミドルウェア
const persist = <T>(
  config: StateCreator<T>,
  name: string
): StateCreator<T> => {
  return (set, get, api) => {
    const configResult = config(
      (...args) => {
        set(...args);
        // 状態が変更されたら IndexedDB に保存
        const state = get();
        set(name, state).catch(console.error);
      },
      get,
      api
    );

    // 初期化時に IndexedDB から読み込む
    get(name)
      .then((savedState) => {
        if (savedState) {
          set(savedState);
        }
      })
      .catch(console.error);

    return configResult;
  };
};

// 使用例
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useCounterStore = create<CounterState>(
  persist<CounterState>(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    'counter-store' // IndexedDB のキー名
  )
);
```

### 方法3: より実用的な実装パターン

実際のプロジェクトで使いやすい実装パターンです。

```tsx
import { create } from 'zustand';
import { get, set, del, clear } from 'idb-keyval';

interface AppState {
  // 状態
  user: User | null;
  settings: Settings;
  favorites: string[];
  
  // アクション
  setUser: (user: User) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  addFavorite: (id: string) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const STORAGE_KEYS = {
  USER: 'app-user',
  SETTINGS: 'app-settings',
  FAVORITES: 'app-favorites',
} as const;

const useAppStore = create<AppState>((set, get) => ({
  // 初期状態
  user: null,
  settings: {
    theme: 'light',
    language: 'ja',
  },
  favorites: [],

  // ユーザーを設定（IndexedDB に保存）
  setUser: async (user: User) => {
    set({ user });
    await set(STORAGE_KEYS.USER, user);
  },

  // 設定を更新（IndexedDB に保存）
  updateSettings: async (newSettings: Partial<Settings>) => {
    const currentSettings = get().settings;
    const updatedSettings = { ...currentSettings, ...newSettings };
    set({ settings: updatedSettings });
    await set(STORAGE_KEYS.SETTINGS, updatedSettings);
  },

  // お気に入りを追加（IndexedDB に保存）
  addFavorite: async (id: string) => {
    const currentFavorites = get().favorites;
    if (!currentFavorites.includes(id)) {
      const updatedFavorites = [...currentFavorites, id];
      set({ favorites: updatedFavorites });
      await set(STORAGE_KEYS.FAVORITES, updatedFavorites);
    }
  },

  // お気に入りを削除（IndexedDB に保存）
  removeFavorite: async (id: string) => {
    const currentFavorites = get().favorites;
    const updatedFavorites = currentFavorites.filter((fav) => fav !== id);
    set({ favorites: updatedFavorites });
    await set(STORAGE_KEYS.FAVORITES, updatedFavorites);
  },

  // すべてのデータをクリア
  clearAll: async () => {
    set({ user: null, settings: { theme: 'light', language: 'ja' }, favorites: [] });
    await clear();
  },
}));

// 初期化関数：IndexedDB からデータを読み込む
export const initializeStore = async () => {
  try {
    const [savedUser, savedSettings, savedFavorites] = await Promise.all([
      get<User>(STORAGE_KEYS.USER),
      get<Settings>(STORAGE_KEYS.SETTINGS),
      get<string[]>(STORAGE_KEYS.FAVORITES),
    ]);

    useAppStore.setState({
      user: savedUser || null,
      settings: savedSettings || { theme: 'light', language: 'ja' },
      favorites: savedFavorites || [],
    });
  } catch (error) {
    console.error('Failed to initialize store from IndexedDB:', error);
  }
};

// アプリ起動時に実行
// initializeStore();
```

## 実践的な使用例

### 例1: ユーザー認証状態の管理

```tsx
import { create } from 'zustand';
import { get, set, del } from 'idb-keyval';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (user: User, token: string) => {
    set({ user, token, isAuthenticated: true });
    // IndexedDB に保存
    await Promise.all([
      set('auth-user', user),
      set('auth-token', token),
    ]);
  },

  logout: async () => {
    set({ user: null, token: null, isAuthenticated: false });
    // IndexedDB から削除
    await Promise.all([
      del('auth-user'),
      del('auth-token'),
    ]);
  },
}));

// 初期化
const initializeAuth = async () => {
  const [user, token] = await Promise.all([
    get<User>('auth-user'),
    get<string>('auth-token'),
  ]);

  if (user && token) {
    useAuthStore.setState({
      user,
      token,
      isAuthenticated: true,
    });
  }
};
```

### 例2: 設定の永続化

```tsx
import { create } from 'zustand';
import { get, set } from 'idb-keyval';

interface Settings {
  theme: 'light' | 'dark';
  language: 'ja' | 'en';
  notifications: boolean;
}

interface SettingsState {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  theme: 'light',
  language: 'ja',
  notifications: true,
};

const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,

  updateSettings: async (newSettings: Partial<Settings>) => {
    const currentSettings = get().settings;
    const updatedSettings = { ...currentSettings, ...newSettings };
    set({ settings: updatedSettings });
    await set('app-settings', updatedSettings);
  },

  resetSettings: async () => {
    set({ settings: defaultSettings });
    await set('app-settings', defaultSettings);
  },
}));

// 初期化
const initializeSettings = async () => {
  const savedSettings = await get<Settings>('app-settings');
  if (savedSettings) {
    useSettingsStore.setState({ settings: savedSettings });
  }
};
```

### 例3: 複数のストアを管理

```tsx
// stores/index.ts
import { create } from 'zustand';
import { get, set, del } from 'idb-keyval';

// ユーザーストア
interface UserState {
  user: User | null;
  setUser: (user: User) => Promise<void>;
  clearUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: async (user: User) => {
    set({ user });
    await set('user', user);
  },
  clearUser: async () => {
    set({ user: null });
    await del('user');
  },
}));

// 設定ストア
interface SettingsState {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { theme: 'light', language: 'ja' },
  updateSettings: async (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });
    await set('settings', updated);
  },
}));

// 初期化関数
export const initializeStores = async () => {
  const [user, settings] = await Promise.all([
    get<User>('user'),
    get<Settings>('settings'),
  ]);

  if (user) {
    useUserStore.setState({ user });
  }

  if (settings) {
    useSettingsStore.setState({ settings });
  }
};
```

## パフォーマンスの考慮

### デバウンス処理

頻繁に更新される状態に対して、デバウンス処理を追加します。

```tsx
import { create } from 'zustand';
import { get, set } from 'idb-keyval';

interface EditorState {
  content: string;
  setContent: (content: string) => void;
}

let saveTimeout: NodeJS.Timeout | null = null;

const useEditorStore = create<EditorState>((set, get) => ({
  content: '',

  setContent: (content: string) => {
    set({ content });
    
    // デバウンス処理：500ms 後に保存
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    saveTimeout = setTimeout(async () => {
      await set('editor-content', get().content);
    }, 500);
  },
}));
```

### バッチ処理

複数の更新をまとめて保存します。

```tsx
import { create } from 'zustand';
import { get, set } from 'idb-keyval';

interface BatchState {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  // バッチ保存
  saveBatch: () => Promise<void>;
}

const useBatchStore = create<BatchState>((set, get) => ({
  items: [],
  
  addItem: (item: Item) => {
    set((state) => ({ items: [...state.items, item] }));
  },
  
  removeItem: (id: string) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },
  
  saveBatch: async () => {
    const items = get().items;
    await set('batch-items', items);
  },
}));
```

## エラーハンドリング

```tsx
import { create } from 'zustand';
import { get, set } from 'idb-keyval';

interface SafeState {
  data: Data | null;
  error: Error | null;
  setData: (data: Data) => Promise<void>;
}

const useSafeStore = create<SafeState>((set) => ({
  data: null,
  error: null,

  setData: async (data: Data) => {
    try {
      set({ data, error: null });
      await set('safe-data', data);
    } catch (error) {
      console.error('Failed to save to IndexedDB:', error);
      set({ error: error as Error });
      // エラーが発生しても状態は更新される（IndexedDB への保存のみ失敗）
    }
  },
}));

// 初期化時のエラーハンドリング
const initializeSafeStore = async () => {
  try {
    const savedData = await get<Data>('safe-data');
    if (savedData) {
      useSafeStore.setState({ data: savedData });
    }
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error);
    // エラーが発生してもアプリは動作を続ける
  }
};
```

## TypeScript との統合

```tsx
import { create } from 'zustand';
import { get, set } from 'idb-keyval';

// 型定義
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => Promise<void>;
}

// ストアの作成
const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: async (user: User) => {
    set({ user });
    await set('user', user);
  },
}));

// 使用例（型安全）
function UserProfile() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // TypeScript が型を推論してくれる
  if (user) {
    console.log(user.name); // OK
    console.log(user.invalid); // エラー
  }

  return (
    <div>
      {user ? (
        <div>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </div>
      ) : (
        <p>ユーザー情報がありません</p>
      )}
    </div>
  );
}
```

## まとめ

### Zustand + IndexedDB のメリット

1. **永続化**: ページリロード後も状態が保持される
2. **シンプル**: Zustand は軽量で使いやすい
3. **柔軟性**: 必要な部分だけを永続化できる
4. **パフォーマンス**: IndexedDB は非同期で高速

### 使用するべき場面

- ユーザー設定の保存
- 認証情報の保持
- フォームデータの一時保存
- オフライン対応が必要なアプリ
- 大量のデータをクライアント側で管理する場合

### 注意点

- IndexedDB は非同期処理のため、エラーハンドリングが重要
- ブラウザによって IndexedDB の実装が異なる可能性がある
- ストレージ容量の制限に注意（通常は数GBまで）

Zustand と IndexedDB を組み合わせることで、シンプルで強力な状態管理と永続化を実現できます。

