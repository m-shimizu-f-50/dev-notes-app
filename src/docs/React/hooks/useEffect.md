# useEffect まとめ

このドキュメントは React の `useEffect` フックの使い方を TypeScript 例を交えてまとめたものです。

## 概要

- `useEffect` は関数コンポーネントで副作用（side effects）を実行するためのフック
- 初回レンダリング時や特定の値が変更された際に処理を実行したい場合に使用
- API通信、DOM操作、タイマーの設定など、レンダリングとは別の処理を行う際に活用

## 基本的な使い方

```tsx
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    // ここに実行したい処理を記述
    console.log('コンポーネントがマウントされました');
  }, []); // 依存配列が空 = 初回レンダリング時のみ実行

  return <div>コンポーネント</div>;
}
```

## 使用する主なケース

### 1. 初回読み込み時のAPI通信

コンポーネントがマウントされた時にデータを取得する場合に使用します。

```tsx
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初回レンダリング時にAPIからデータを取得
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // 空の依存配列 = 初回のみ実行

  if (loading) return <div>読み込み中...</div>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 2. 特定の値が更新された際に処理を実行

依存配列に値を指定すると、その値が変更された時だけ処理が実行されます。

```tsx
import { useEffect, useState } from 'react';

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // userId が変更されるたびに実行
    const fetchUser = async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    };

    fetchUser();
  }, [userId]); // userId が変更された時だけ実行

  if (!user) return <div>読み込み中...</div>;

  return <div>{user.name}</div>;
}
```

### 3. 複数の値に依存する場合

依存配列に複数の値を指定できます。

```tsx
function SearchResults({ query, filters }: Props) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    // query または filters が変更された時に実行
    const search = async () => {
      const response = await fetch(`/api/search?q=${query}&filters=${filters}`);
      const data = await response.json();
      setResults(data);
    };

    search();
  }, [query, filters]); // どちらかが変更されたら実行

  return <div>{/* 検索結果を表示 */}</div>;
}
```

## クリーンアップ関数

`useEffect` 内でリソースを確保した場合（タイマー、イベントリスナー、購読など）、クリーンアップ関数を返すことで、コンポーネントのアンマウント時や依存配列の値が変更された時にリソースを解放できます。

### クリーンアップしないと起きる不具合

#### 1. メモリリーク

タイマーやイベントリスナーをクリーンアップしないと、コンポーネントがアンマウントされた後も処理が実行され続け、メモリリークの原因になります。

```tsx
// ❌ 悪い例：クリーンアップなし
function Timer() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('タイマー実行中');
    }, 1000);
    // クリーンアップがない = コンポーネントがアンマウントされてもタイマーが動き続ける
  }, []);

  return <div>タイマー</div>;
}

// ✅ 良い例：クリーンアップあり
function Timer() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('タイマー実行中');
    }, 1000);

    // クリーンアップ関数を返す
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div>タイマー</div>;
}
```

#### 2. 古い状態を参照する問題

非同期処理中にコンポーネントがアンマウントされた場合、古い状態を更新しようとしてエラーが発生する可能性があります。

```tsx
// ❌ 悪い例：アンマウント後の状態更新
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      // コンポーネントがアンマウントされた後も実行される可能性がある
      setUser(data); // エラー: アンマウント済みコンポーネントの状態を更新しようとしている
    };

    fetchUser();
  }, [userId]);

  return <div>{user?.name}</div>;
}

// ✅ 良い例：クリーンアップでフラグを管理
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true; // マウント状態を追跡

    const fetchUser = async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      
      // マウントされている場合のみ状態を更新
      if (isMounted) {
        setUser(data);
      }
    };

    fetchUser();

    // クリーンアップ：アンマウント時または userId 変更時にフラグを false に
    return () => {
      isMounted = false;
    };
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

#### 3. イベントリスナーの重複登録

イベントリスナーをクリーンアップしないと、同じイベントリスナーが複数回登録される可能性があります。

```tsx
// ❌ 悪い例：イベントリスナーのクリーンアップなし
function WindowResize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    // クリーンアップがない = コンポーネントが再レンダリングされるたびにリスナーが追加される
  }, []); // 依存配列が空でも、コンポーネントが再マウントされると重複登録される

  return <div>幅: {width}px</div>;
}

// ✅ 良い例：イベントリスナーのクリーンアップあり
function WindowResize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // クリーンアップ：イベントリスナーを削除
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div>幅: {width}px</div>;
}
```

## クリーンアップが必要なケース

以下のような場合、必ずクリーンアップ関数を返す必要があります：

1. **タイマー（setInterval, setTimeout）**
2. **イベントリスナー（addEventListener）**
3. **購読（subscriptions）**
4. **非同期処理のキャンセル（AbortController）**

### AbortController を使ったAPI通信のキャンセル

```tsx
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // AbortController を作成
    const abortController = new AbortController();

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: abortController.signal, // キャンセル可能にする
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        // AbortError の場合は無視（意図的なキャンセル）
        if (error.name !== 'AbortError') {
          console.error('エラー:', error);
        }
      }
    };

    fetchUser();

    // クリーンアップ：リクエストをキャンセル
    return () => {
      abortController.abort();
    };
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

## 依存配列の注意点

### 依存配列を正しく指定する

依存配列に含めるべき値を省略すると、古い値を参照する可能性があります。

```tsx
// ❌ 悪い例：依存配列が不完全
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => prev + step); // step を使っているが依存配列に含まれていない
    }, 1000);

    return () => clearInterval(timer);
  }, []); // step が変更されてもタイマーは古い step を使い続ける

  return <div>{count}</div>;
}

// ✅ 良い例：依存配列にすべての依存値を含める
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => prev + step);
    }, 1000);

    return () => clearInterval(timer);
  }, [step]); // step を依存配列に含める

  return <div>{count}</div>;
}
```

### 関数を依存配列に含める場合

関数を依存配列に含める場合は、`useCallback` でメモ化することを検討します。

```tsx
import { useEffect, useState, useCallback } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // useCallback で関数をメモ化
  const fetchResults = useCallback(async () => {
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    setResults(data);
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]); // fetchResults が変更された時だけ実行

  return <div>{/* 検索結果 */}</div>;
}
```

## よくある間違いと対処法

### 1. 無限ループ

状態を更新する処理を依存配列なしで実行すると、無限ループが発生します。

```tsx
// ❌ 悪い例：無限ループ
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1); // 毎回実行される → 状態更新 → 再レンダリング → また実行...
  }); // 依存配列がない = 毎回実行される

  return <div>{count}</div>;
}

// ✅ 良い例：依存配列を指定するか、関数型更新を使う
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => prev + 1); // 関数型更新（依存配列不要）
    }, 1000);

    return () => clearInterval(timer);
  }, []); // 初回のみ実行

  return <div>{count}</div>;
}
```

### 2. 不要な再実行

依存配列に不要な値を含めると、意図しないタイミングで処理が実行されます。

```tsx
// ❌ 悪い例：不要な依存値
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light'); // この値は fetchUser に不要

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    };

    fetchUser();
  }, [userId, theme]); // theme は不要なのに依存配列に含まれている

  return <div>{user?.name}</div>;
}

// ✅ 良い例：必要な依存値のみ
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    };

    fetchUser();
  }, [userId]); // userId のみを依存配列に含める

  return <div>{user?.name}</div>;
}
```

## 実践的な使用パターン

### パターン1: データ取得とローディング状態

```tsx
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/users');
        const data = await response.json();
        
        if (isMounted) {
          setUsers(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('データの取得に失敗しました');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
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
```

### パターン2: フォームのバリデーション

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (email && !email.includes('@')) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (password && password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    setErrors(newErrors);
  }, [email, password]); // email または password が変更された時にバリデーション

  return (
    <form>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <span>{errors.email}</span>}
      {/* ... */}
    </form>
  );
}
```

## まとめ

- **初回読み込み時**: 依存配列を空 `[]` にして、マウント時のみ実行
- **特定の値が更新された時**: 依存配列に値を指定して、変更を検知
- **クリーンアップ**: タイマー、イベントリスナー、購読などは必ずクリーンアップする
- **依存配列**: 使用している値は必ず依存配列に含める（ESLint の `exhaustive-deps` ルールを有効にする）
- **非同期処理**: アンマウント後の状態更新を防ぐため、フラグや AbortController を使用

参考: React ドキュメントの [useEffect](https://react.dev/reference/react/useEffect) を参照することを推奨。

