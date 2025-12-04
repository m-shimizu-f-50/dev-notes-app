# tanstack/react-query（旧 React Query）まとめ

サーバー状態の管理とAPI通信を効率的に行うためのライブラリです。

## 概要

`@tanstack/react-query`（旧 React Query）は、サーバー状態の取得、キャッシュ、同期、更新を簡単に行うためのライブラリです。API通信のローディング状態やエラーハンドリングを一元管理し、データの同期問題を解決します。

## インストール

```bash
npm install @tanstack/react-query
```

## 従来のAPI通信の問題点

### 問題1: コードの分散と複雑化

従来の方法では、`useEffect` と `axios` を使って各コンポーネントごとにAPI通信を実装していました。

#### 問題のある例：各コンポーネントで個別に実装

```tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

// 一覧画面
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (err) {
        setError('ユーザーの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// 詳細画面
function UserDetail({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        setError('ユーザーの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return <div>{user?.name}</div>;
}

// 更新画面
function UserEdit({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        setError('ユーザーの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleUpdate = async (data: User) => {
    try {
      await axios.put(`/api/users/${userId}`, data);
      // 更新成功後の処理...
    } catch (err) {
      setError('更新に失敗しました');
    }
  };

  // ...
}
```

**問題点**:
- ローディング状態の管理が各コンポーネントで重複
- エラーハンドリングが各コンポーネントで重複
- 同じようなコードが複数箇所に散在
- 保守性が低い（変更時に複数箇所を修正する必要がある）

### 問題2: データ同期のズレ

一覧画面・詳細画面・更新画面など複数画面で同じデータを扱う場合、更新後に画面をまたいだ際に状態が**古いまま残ってしまい "データ同期のズレ"** がよく問題になっていました。

#### 問題のある例：データ同期のズレ

```tsx
// 一覧画面
function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// 更新画面
function UserEdit({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  const handleUpdate = async (data: User) => {
    await updateUser(userId, data);
    // 更新成功
    // ❌ 問題：一覧画面の状態が更新されない
    // 一覧画面に戻っても古いデータが表示される
  };

  // ...
}
```

**問題点**:
- 更新画面でデータを変更しても、一覧画面の状態は更新されない
- 一覧画面に戻っても古いデータが表示される
- 手動で状態を更新したり、再取得ロジックを書く必要がある
- 複数画面間でデータの整合性が保てない

## React Query による解決

### セットアップ

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間は新鮮とみなす
      cacheTime: 1000 * 60 * 10, // 10分間キャッシュを保持
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

### 基本的な使い方

```tsx
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data;
    },
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

**メリット**:
- ローディング状態とエラーハンドリングが自動で管理される
- コードがシンプルになる
- キャッシュ機能により、同じデータを複数回取得しない

### Query Key を使った自動再フェッチ

React Query の特に便利な点として、**Query Key を使った自動再フェッチ**があります。

#### 従来の方法：手動で状態を更新

```tsx
// ❌ 従来の方法
function UserEdit({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  const handleUpdate = async (data: User) => {
    await updateUser(userId, data);
    // 手動で一覧の状態を更新する必要がある
    // または、一覧画面で再取得ロジックを書く必要がある
    navigate('/users');
  };
}
```

#### React Query の方法：自動再フェッチ

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function UserEdit({ userId }: { userId: number }) {
  const queryClient = useQueryClient();

  // ユーザー詳細の取得
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data;
    },
  });

  // 更新処理
  const updateMutation = useMutation({
    mutationFn: async (data: User) => {
      const response = await axios.put(`/api/users/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      // 更新成功時に、一覧の Query Key を無効化
      // これにより、一覧画面に戻った時に自動で再フェッチされる
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // 詳細画面のデータも更新
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  const handleUpdate = (data: User) => {
    updateMutation.mutate(data);
  };

  // ...
}
```

**動作の流れ**:
1. 更新画面でデータを更新
2. `invalidateQueries(['users'])` を呼ぶ
3. 一覧画面に戻ると、React Query が自動で再フェッチを実行
4. 一覧画面には常に最新データが表示される

### invalidateQueries の詳細

`invalidateQueries` は、指定した Query Key のデータを「古い」とマークし、次にそのデータが必要になった時に自動で再フェッチします。

```tsx
const queryClient = useQueryClient();

// 特定の Query Key を無効化
queryClient.invalidateQueries({ queryKey: ['users'] });

// 複数の Query Key を無効化
queryClient.invalidateQueries({ queryKey: ['users', 'posts'] });

// パターンマッチで無効化
queryClient.invalidateQueries({ queryKey: ['user'] }); // 'user' で始まるすべての Query Key

// 条件付きで無効化
queryClient.invalidateQueries({
  queryKey: ['user'],
  predicate: (query) => {
    // 条件に合致する Query のみ無効化
    return query.queryKey[1] === userId;
  },
});
```

## 実践的な使用例

### 例1: 一覧・詳細・更新画面の連携

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// 一覧画面
function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/users');
      return response.data;
    },
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>
          <Link to={`/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}

// 詳細画面
function UserDetail({ userId }: { userId: number }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data;
    },
  });

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <Link to={`/users/${userId}/edit`}>編集</Link>
    </div>
  );
}

// 更新画面
function UserEdit({ userId }: { userId: number }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}`);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: User) => {
      const response = await axios.put(`/api/users/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      // 一覧と詳細のデータを無効化
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      
      // 詳細画面に戻る
      navigate(`/users/${userId}`);
    },
  });

  const handleSubmit = (data: User) => {
    updateMutation.mutate(data);
  };

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <form onSubmit={handleSubmit}>
      {/* フォーム内容 */}
    </form>
  );
}
```

### 例2: 作成・更新・削除の処理

```tsx
function UserManagement() {
  const queryClient = useQueryClient();

  // 作成
  const createMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await axios.post('/api/users', data);
      return response.data;
    },
    onSuccess: () => {
      // 一覧を再フェッチ
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // 更新
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserData }) => {
      const response = await axios.put(`/api/users/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // 一覧と詳細を再フェッチ
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });

  // 削除
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      // 一覧を再フェッチ
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

### 例3: 楽観的更新（Optimistic Updates）

更新処理を即座に反映し、失敗した場合にロールバックします。

```tsx
function UserEdit({ userId }: { userId: number }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: User) => {
      const response = await axios.put(`/api/users/${userId}`, data);
      return response.data;
    },
    // 楽観的更新
    onMutate: async (newData) => {
      // 進行中のリクエストをキャンセル
      await queryClient.cancelQueries({ queryKey: ['user', userId] });

      // 現在の値を保存
      const previousUser = queryClient.getQueryData(['user', userId]);

      // 楽観的に値を更新
      queryClient.setQueryData(['user', userId], newData);

      // ロールバック用に前の値を返す
      return { previousUser };
    },
    onError: (err, newData, context) => {
      // エラー時は前の値にロールバック
      queryClient.setQueryData(['user', userId], context?.previousUser);
    },
    onSettled: () => {
      // 成功・失敗に関わらず、サーバーから最新データを取得
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  // ...
}
```

## 主なAPI

### useQuery

データの取得に使用します。

```tsx
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 1000 * 60 * 5, // 5分間は新鮮とみなす
  cacheTime: 1000 * 60 * 10, // 10分間キャッシュを保持
  retry: 3, // エラー時に3回まで再試行
  refetchOnWindowFocus: true, // ウィンドウにフォーカスした時に再フェッチ
});
```

### useMutation

データの作成・更新・削除に使用します。

```tsx
const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: (data) => {
    // 成功時の処理
  },
  onError: (error) => {
    // エラー時の処理
  },
  onSettled: () => {
    // 成功・失敗に関わらず実行
  },
});

// 実行
mutation.mutate(data);
```

### useQueryClient

Query Client にアクセスし、キャッシュの操作を行います。

```tsx
const queryClient = useQueryClient();

// データを無効化（再フェッチをトリガー）
queryClient.invalidateQueries({ queryKey: ['users'] });

// データを直接更新
queryClient.setQueryData(['user', userId], newUser);

// データを削除
queryClient.removeQueries({ queryKey: ['users'] });

// データを再フェッチ
queryClient.refetchQueries({ queryKey: ['users'] });
```

## メリットのまとめ

### 1. コードの簡潔化

- ローディング状態とエラーハンドリングが自動で管理される
- 同じようなコードを複数箇所に書く必要がない

### 2. データ同期の自動化

- `invalidateQueries` を使うだけで、複数画面間でデータを同期できる
- 手動で状態を更新する必要がない

### 3. パフォーマンスの向上

- キャッシュ機能により、同じデータを複数回取得しない
- バックグラウンドでの再フェッチにより、常に最新データを保持

### 4. 開発体験の向上

- TypeScript との統合が優れている
- DevTools でキャッシュの状態を確認できる

## まとめ

- **問題解決**: API通信のコード分散とデータ同期のズレを解決
- **Query Key**: データを識別し、自動再フェッチを可能にする
- **invalidateQueries**: データを無効化し、最新データを自動で取得
- **一元管理**: ローディング状態、エラーハンドリング、キャッシュを一元管理

React Query を導入することで、API通信のコードが簡潔になり、複数画面間でのデータ同期問題が完全に解消されます。

