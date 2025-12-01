# react-hook-form まとめ

React でフォームを扱う際の状態管理とバリデーションを簡単にするライブラリです。

## 概要

`react-hook-form` は、フォームの状態管理とバリデーションを効率的に行うためのライブラリです。パフォーマンスに優れ、再レンダリングを最小限に抑えながら、フォームの状態を一元管理できます。

## インストール

```bash
npm install react-hook-form
```

## 従来のフォーム管理の問題点

### 2重管理の問題

従来の方法では、コンポーネント内部の状態（`useState`）とフォーム全体の状態で2重管理になってしまい、複雑になることがあります。

#### 問題のある例：2重管理

```tsx
import { useState } from 'react';

function LoginForm() {
  // コンポーネント内部の状態
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // バリデーション
  const validateEmail = (value: string) => {
    if (!value) {
      setErrors(prev => ({ ...prev, email: 'メールアドレスを入力してください' }));
      return false;
    }
    if (!value.includes('@')) {
      setErrors(prev => ({ ...prev, email: '有効なメールアドレスを入力してください' }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.email;
      return newErrors;
    });
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // 状態更新と同時にバリデーションも実行
    validateEmail(value);
  };

  const handleEmailBlur = () => {
    validateEmail(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email) && password.length >= 8) {
      // 送信処理
      console.log({ email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
        />
        {errors.email && <span>{errors.email}</span>}
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <span>{errors.password}</span>}
      </div>
      <button type="submit">送信</button>
    </form>
  );
}
```

### 2重管理になってしまう理由

1. **入力値の状態管理**: `useState` で各入力フィールドの値を管理
2. **エラー状態の管理**: 別の `useState` でエラーメッセージを管理
3. **バリデーションロジック**: 状態更新とバリデーションが別々に存在
4. **同期の問題**: 入力値とエラー状態を手動で同期させる必要がある

この結果、以下の問題が発生します：

- **コードが複雑になる**: 状態管理とバリデーションロジックが散在
- **再レンダリングが多い**: 各入力ごとに複数の状態更新が発生
- **保守性が低い**: フォームフィールドを追加するたびに、複数の状態とハンドラーを追加する必要がある

## react-hook-form による一元管理

### 一元管理とは

一元管理とは、フォームの状態（入力値、エラー、バリデーション結果など）を1つのシステムで統一的に管理することです。

`react-hook-form` では、`useForm` フックがフォーム全体の状態を一元管理します：

- 入力値の管理
- エラー状態の管理
- バリデーションの実行
- フォームの送信状態

### 基本的な使い方

```tsx
import { useForm } from 'react-hook-form';

interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data); // { email: '...', password: '...' }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          type="email"
          {...register('email', {
            required: 'メールアドレスを入力してください',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: '有効なメールアドレスを入力してください',
            },
          })}
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <div>
        <input
          type="password"
          {...register('password', {
            required: 'パスワードを入力してください',
            minLength: {
              value: 8,
              message: 'パスワードは8文字以上で入力してください',
            },
          })}
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      <button type="submit">送信</button>
    </form>
  );
}
```

### 一元管理できる理由

1. **register 関数**: 入力フィールドを登録し、値の取得と更新を自動で管理
2. **内部状態管理**: `useForm` が内部で状態を管理し、再レンダリングを最小限に
3. **統合されたバリデーション**: バリデーションルールを `register` に直接指定
4. **エラー状態の自動管理**: バリデーション結果が自動で `errors` に反映

## 非制御コンポーネント（Uncontrolled Components）

### 非制御コンポーネントとは

非制御コンポーネントとは、React の状態（`useState`）で値を管理せず、DOM 要素が自身の状態を保持するコンポーネントです。

#### 制御コンポーネント（Controlled Components）

```tsx
// 制御コンポーネント：React の状態で値を管理
function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

**特徴**:
- React の状態で値を管理
- 毎回の入力で再レンダリングが発生
- 値の制御が容易

#### 非制御コンポーネント（Uncontrolled Components）

```tsx
// 非制御コンポーネント：DOM が自身の状態を保持
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = () => {
    const value = inputRef.current?.value;
    console.log(value);
  };
  
  return (
    <input
      ref={inputRef}
      defaultValue="初期値"
    />
  );
}
```

**特徴**:
- DOM 要素が自身の状態を保持
- 再レンダリングが少ない
- 値の取得は ref を使用

### react-hook-form と非制御コンポーネント

`react-hook-form` は非制御コンポーネントのアプローチを採用しています。

```tsx
const { register } = useForm();

// register は ref と onChange, onBlur を返す
<input
  {...register('email')}
  // 内部的には以下のようになる：
  // ref={ref}
  // onChange={onChange}
  // onBlur={onBlur}
  // name="email"
/>
```

**メリット**:
- **パフォーマンス**: 再レンダリングが少ない
- **シンプル**: 状態管理のコードが不要
- **ネイティブ**: HTML フォームの動作に近い

## バリデーション

### 自動バリデーション

`react-hook-form` は、入力とフォーカスアウト（`onBlur`）で自動的にバリデーションを実行します。

#### バリデーションのタイミング

```tsx
const { register } = useForm({
  mode: 'onBlur', // フォーカスアウト時にバリデーション（デフォルト）
  // mode: 'onChange', // 入力のたびにバリデーション
  // mode: 'onSubmit', // 送信時のみバリデーション
  // mode: 'onTouched', // 最初のフォーカスアウト後、入力のたびにバリデーション
  // mode: 'all', // 入力とフォーカスアウトの両方でバリデーション
});

<input
  {...register('email', {
    required: 'メールアドレスを入力してください',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: '有効なメールアドレスを入力してください',
    },
  })}
/>
```

**デフォルトの動作**:
- フォーカスアウト（`onBlur`）時にバリデーションを実行
- エラーがある場合はエラーメッセージを表示
- 送信時にもバリデーションを実行

### バリデーションルール

```tsx
<input
  {...register('email', {
    // 必須チェック
    required: 'メールアドレスを入力してください',
    // または
    required: true, // デフォルトメッセージを使用

    // パターンマッチ
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: '有効なメールアドレスを入力してください',
    },

    // 最小/最大長
    minLength: {
      value: 5,
      message: '5文字以上で入力してください',
    },
    maxLength: {
      value: 50,
      message: '50文字以内で入力してください',
    },

    // 最小/最大値（数値）
    min: {
      value: 0,
      message: '0以上で入力してください',
    },
    max: {
      value: 100,
      message: '100以下で入力してください',
    },

    // カスタムバリデーション
    validate: {
      notAdmin: (value) =>
        value !== 'admin' || 'admin は使用できません',
      isAvailable: async (value) => {
        const available = await checkEmailAvailability(value);
        return available || 'このメールアドレスは既に使用されています';
      },
    },
  })}
/>
```

### カスタムバリデーション

```tsx
const { register } = useForm();

<input
  {...register('password', {
    required: 'パスワードを入力してください',
    validate: {
      // 単一のバリデーション関数
      hasNumber: (value) =>
        /\d/.test(value) || '数字を含めてください',
      hasUpperCase: (value) =>
        /[A-Z]/.test(value) || '大文字を含めてください',
      hasLowerCase: (value) =>
        /[a-z]/.test(value) || '小文字を含めてください',
    },
  })}
/>
```

## 主なAPI

### useForm

```tsx
const {
  register,        // 入力フィールドを登録
  handleSubmit,    // フォーム送信を処理
  watch,           // フィールドの値を監視
  setValue,        // フィールドの値を設定
  getValues,       // フィールドの値を取得
  reset,           // フォームをリセット
  formState,       // フォームの状態（errors, isDirty, isValid など）
  control,         // 制御コンポーネント用
} = useForm<FormData>({
  defaultValues: {
    email: '',
    password: '',
  },
  mode: 'onBlur',
});
```

### register

入力フィールドを登録し、ref、onChange、onBlur を返します。

```tsx
const { register } = useForm();

<input {...register('fieldName', validationRules)} />
```

### handleSubmit

フォーム送信を処理します。バリデーションが成功した場合のみ、コールバック関数を実行します。

```tsx
const { handleSubmit } = useForm();

const onSubmit = (data: FormData) => {
  // バリデーション成功時の処理
};

const onError = (errors: FieldErrors) => {
  // バリデーション失敗時の処理
};

<form onSubmit={handleSubmit(onSubmit, onError)}>
  {/* ... */}
</form>
```

### watch

フィールドの値を監視し、変更時に再レンダリングを発生させます。

```tsx
const { watch } = useForm();

const email = watch('email'); // 単一フィールドを監視
const { email, password } = watch(['email', 'password']); // 複数フィールドを監視
const allValues = watch(); // すべてのフィールドを監視

// リアルタイムで値を表示
<div>入力中のメール: {email}</div>
```

### setValue

フィールドの値をプログラムで設定します。

```tsx
const { setValue } = useForm();

// 値を設定
setValue('email', 'new@example.com');

// バリデーションを実行
setValue('email', 'new@example.com', { shouldValidate: true });

// エラーをクリア
setValue('email', 'new@example.com', { shouldDirty: true });
```

### reset

フォームをリセットします。

```tsx
const { reset } = useForm();

// すべてリセット
reset();

// 特定の値にリセット
reset({
  email: '',
  password: '',
});

// デフォルト値にリセット
reset(undefined, { keepDefaultValues: true });
```

### formState

フォームの状態を取得します。

```tsx
const { formState } = useForm();

const {
  errors,        // エラー情報
  isDirty,       // フォームが変更されているか
  isValid,       // フォームが有効か
  isSubmitting,  // 送信中か
  touchedFields, // 触れたフィールド
  dirtyFields,   // 変更されたフィールド
} = formState;
```

## 実践的な例

### ログインフォーム

```tsx
import { useForm } from 'react-hook-form';

interface LoginFormData {
  email: string;
  password: string;
}

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      // ログイン成功処理
    } catch (error) {
      console.error('ログインに失敗しました:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>メールアドレス</label>
        <input
          type="email"
          {...register('email', {
            required: 'メールアドレスを入力してください',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: '有効なメールアドレスを入力してください',
            },
          })}
        />
        {errors.email && (
          <span style={{ color: 'red' }}>{errors.email.message}</span>
        )}
      </div>

      <div>
        <label>パスワード</label>
        <input
          type="password"
          {...register('password', {
            required: 'パスワードを入力してください',
            minLength: {
              value: 8,
              message: 'パスワードは8文字以上で入力してください',
            },
          })}
        />
        {errors.password && (
          <span style={{ color: 'red' }}>{errors.password.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : 'ログイン'}
      </button>
    </form>
  );
}
```

### 条件付きバリデーション

```tsx
function RegistrationForm() {
  const { register, watch } = useForm();

  const password = watch('password');

  return (
    <form>
      <input
        type="password"
        {...register('password', {
          required: 'パスワードを入力してください',
          minLength: {
            value: 8,
            message: 'パスワードは8文字以上で入力してください',
          },
        })}
      />

      <input
        type="password"
        {...register('confirmPassword', {
          required: 'パスワード（確認）を入力してください',
          validate: (value) =>
            value === password || 'パスワードが一致しません',
        })}
      />
    </form>
  );
}
```

### 動的なフィールド

```tsx
function DynamicForm() {
  const { register, watch } = useForm();

  const showOptionalField = watch('showOptional');

  return (
    <form>
      <input {...register('name', { required: true })} />

      <label>
        <input
          type="checkbox"
          {...register('showOptional')}
        />
        オプションフィールドを表示
      </label>

      {showOptionalField && (
        <input {...register('optionalField')} />
      )}
    </form>
  );
}
```

## パフォーマンスのメリット

### 再レンダリングの最小化

`react-hook-form` は非制御コンポーネントを使用するため、入力のたびに再レンダリングが発生しません。

```tsx
// 従来の方法：入力のたびに再レンダリング
function ControlledForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 入力のたびにコンポーネント全体が再レンダリングされる

  return (
    <form>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
    </form>
  );
}

// react-hook-form：再レンダリングが最小限
function UncontrolledForm() {
  const { register } = useForm();
  // 入力のたびに再レンダリングされない

  return (
    <form>
      <input {...register('email')} />
      <input {...register('password')} />
    </form>
  );
}
```

## まとめ

### react-hook-form のメリット

1. **一元管理**: フォームの状態を1つのシステムで管理
2. **パフォーマンス**: 再レンダリングを最小限に抑制
3. **シンプル**: 状態管理のコードが不要
4. **自動バリデーション**: フォーカスアウト時に自動でバリデーション
5. **型安全性**: TypeScript と組み合わせて使用可能

### 従来の方法との比較

| 項目 | 従来の方法 | react-hook-form |
|------|-----------|----------------|
| 状態管理 | 複数の `useState` | `useForm` で一元管理 |
| 再レンダリング | 入力のたびに発生 | 最小限 |
| バリデーション | 手動で実装 | 自動で実行 |
| コード量 | 多い | 少ない |
| 保守性 | 低い | 高い |

### 使用するべき場面

- 複数の入力フィールドがあるフォーム
- バリデーションが必要なフォーム
- パフォーマンスを重視するフォーム
- 複雑なフォームロジック

`react-hook-form` を使用することで、フォームの状態管理とバリデーションを効率的に行い、コードの複雑さを大幅に削減できます。

