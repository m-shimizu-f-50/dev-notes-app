# コンポーネント設計

コンポーネント設計の基本的な考え方とベストプラクティスをまとめます。

## コンポーネント設計とは

コンポーネント設計とは、UIを小さな再利用可能な部品（コンポーネント）に分割し、それらを組み合わせてアプリケーションを構築する設計手法です。

### コンポーネントの特徴

- **独立性**: 他のコンポーネントに依存せず、単独で動作できる
- **再利用性**: 異なる場所で同じコンポーネントを使い回せる
- **保守性**: 小さな単位で管理できるため、変更や修正が容易
- **テスタビリティ**: 個別にテストしやすい

## なぜコンポーネント設計が重要か

### 1. コードの可読性向上

小さなコンポーネントに分割することで、各部分の役割が明確になり、コードが理解しやすくなります。

### 2. 保守性の向上

特定の機能を修正する際、関連するコンポーネントだけを修正すれば良く、影響範囲が限定的になります。

### 3. 開発効率の向上

一度作成したコンポーネントを再利用できるため、同じコードを何度も書く必要がありません。

### 4. チーム開発の効率化

コンポーネント単位で作業を分担できるため、複数人で並行して開発しやすくなります。

## コンポーネント設計の原則

### 1. 単一責任の原則（Single Responsibility Principle）

1つのコンポーネントは1つの責任だけを持つべきです。

```tsx
// ❌ 悪い例：複数の責任を持つ
function UserProfile() {
  // ユーザー情報の表示
  // フォームのバリデーション
  // API通信
  // エラーハンドリング
  // すべてが1つのコンポーネントに集約されている
}

// ✅ 良い例：責任を分離
function UserProfile({ user }: { user: User }) {
  return (
    <div>
      <UserAvatar user={user} />
      <UserInfo user={user} />
    </div>
  );
}

function UserAvatar({ user }: { user: User }) {
  return <img src={user.avatar} alt={user.name} />;
}

function UserInfo({ user }: { user: User }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### 2. 再利用性（Reusability）

異なる場所で使えるように、汎用的なコンポーネントを設計します。

```tsx
// ❌ 悪い例：特定の用途に特化しすぎている
function UserCard() {
  return (
    <div>
      <h2>山田太郎</h2>
      <p>yamada@example.com</p>
    </div>
  );
}

// ✅ 良い例：汎用的に使える
interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

function Card({ title, description, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

// 様々な用途で再利用可能
<Card title="ユーザー情報" description="山田太郎" />
<Card title="商品情報">
  <ProductDetails />
</Card>
```

### 3. 疎結合（Loose Coupling）

コンポーネント間の依存関係を最小限にし、互いに独立して動作できるようにします。

```tsx
// ❌ 悪い例：密結合
function UserList() {
  const users = fetchUsers(); // 特定のAPIに依存
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// ✅ 良い例：疎結合
interface User {
  id: number;
  name: string;
}

interface UserListProps {
  users: User[];
}

function UserList({ users }: UserListProps) {
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// データの取得は親コンポーネントで行う
function App() {
  const users = fetchUsers();
  return <UserList users={users} />;
}
```

### 4. 高凝集（High Cohesion）

関連する機能やデータを1つのコンポーネントにまとめます。

```tsx
// ❌ 悪い例：関連性の低い要素が混在
function Dashboard() {
  return (
    <div>
      <UserProfile />
      <WeatherWidget />
      <ShoppingCart />
      <NewsFeed />
    </div>
  );
}

// ✅ 良い例：関連する要素をグループ化
function Dashboard() {
  return (
    <div>
      <UserSection>
        <UserProfile />
        <UserSettings />
      </UserSection>
      <ContentSection>
        <NewsFeed />
        <WeatherWidget />
      </ContentSection>
    </div>
  );
}
```

## コンポーネントの粒度

コンポーネントの大きさ（粒度）は、用途に応じて適切に設計します。

### アトミックデザインの考え方

#### 1. Atoms（原子）

最小単位のコンポーネント。それ以上分割できない要素。

```tsx
// Button, Input, Label など
function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

#### 2. Molecules（分子）

複数のAtomsを組み合わせた、少し複雑なコンポーネント。

```tsx
// SearchForm, UserCard など
function SearchForm() {
  return (
    <form>
      <Input type="text" placeholder="検索..." />
      <Button>検索</Button>
    </form>
  );
}
```

#### 3. Organisms（生物）

複数のMoleculesやAtomsを組み合わせた、より複雑なコンポーネント。

```tsx
// Header, ProductList など
function Header() {
  return (
    <header>
      <Logo />
      <SearchForm />
      <UserMenu />
    </header>
  );
}
```

#### 4. Templates（テンプレート）

ページレベルのレイアウト構造。

```tsx
function PageTemplate() {
  return (
    <div>
      <Header />
      <main>
        <Sidebar />
        <ContentArea />
      </main>
      <Footer />
    </div>
  );
}
```

#### 5. Pages（ページ）

実際のコンテンツが入った完成形。

```tsx
function HomePage() {
  return (
    <PageTemplate>
      <ProductList products={products} />
    </PageTemplate>
  );
}
```

## コンポーネントの分割方法

### いつ分割すべきか

以下のような場合、コンポーネントを分割することを検討します：

1. **コンポーネントが大きくなりすぎた時**（200行を超えるなど）
2. **再利用したい部分がある時**
3. **責任が複数ある時**
4. **テストしやすくしたい時**

### 分割の判断基準

```tsx
// ❌ 分割前：大きすぎるコンポーネント
function UserProfile() {
  // 100行以上のコード
  // 複数の責任を持つ
  // テストが困難
}

// ✅ 分割後：適切なサイズのコンポーネント
function UserProfile({ user }: { user: User }) {
  return (
    <div>
      <UserHeader user={user} />
      <UserDetails user={user} />
      <UserActions userId={user.id} />
    </div>
  );
}

function UserHeader({ user }: { user: User }) {
  return (
    <div>
      <Avatar src={user.avatar} />
      <h1>{user.name}</h1>
    </div>
  );
}

function UserDetails({ user }: { user: User }) {
  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Location: {user.location}</p>
    </div>
  );
}
```

## 命名規則

### コンポーネント名

- **PascalCase** を使用
- **名詞** を使用（動詞は避ける）
- **明確で説明的** な名前を付ける

```tsx
// ✅ 良い例
function UserCard() {}
function SearchForm() {}
function ProductList() {}

// ❌ 悪い例
function card() {} // 小文字
function renderUser() {} // 動詞
function comp1() {} // 意味が不明確
```

### Props名

- **camelCase** を使用
- **明確で説明的** な名前を付ける
- **省略形は避ける**（可能な限り）

```tsx
// ✅ 良い例
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

// ❌ 悪い例
interface ButtonProps {
  click: () => void; // 動詞形
  dis?: boolean; // 省略形
  kids: React.ReactNode; // 不明確
}
```

## Props設計

### Propsの設計原則

#### 1. 必要最小限のProps

コンポーネントに必要な情報だけを渡します。

```tsx
// ❌ 悪い例：不要なPropsが多い
interface UserCardProps {
  user: User;
  theme: string;
  layout: string;
  animation: boolean;
  // コンポーネント内で使われないProps
}

// ✅ 良い例：必要なPropsのみ
interface UserCardProps {
  user: User;
  onClick?: () => void;
}
```

#### 2. Propsの型安全性

TypeScriptを使用する場合、適切な型定義を行います。

```tsx
// ✅ 良い例：明確な型定義
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  showEmail?: boolean;
}

function UserCard({ user, onEdit, showEmail = false }: UserCardProps) {
  return (
    <div>
      <h2>{user.name}</h2>
      {showEmail && <p>{user.email}</p>}
      {onEdit && <button onClick={() => onEdit(user)}>編集</button>}
    </div>
  );
}
```

#### 3. デフォルト値の設定

オプショナルなPropsにはデフォルト値を設定します。

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

function Button({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
}: ButtonProps) {
  // ...
}
```

#### 4. childrenの活用

コンポーネントの内容を柔軟に指定できるようにします。

```tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-content">{children}</div>
    </div>
  );
}

// 様々な内容を柔軟に指定できる
<Card title="ユーザー情報">
  <UserDetails />
</Card>

<Card title="商品情報">
  <ProductList />
</Card>
```

## 状態管理の考え方

### 状態の配置原則

状態は、それを必要とする最も近い共通の親コンポーネントに配置します。

```tsx
// ❌ 悪い例：状態が不適切な場所にある
function App() {
  const [count, setCount] = useState(0);
  return <Counter count={count} setCount={setCount} />;
}

function Counter({ count, setCount }: Props) {
  return (
    <div>
      <Display count={count} />
      <Button onClick={() => setCount(count + 1)} />
    </div>
  );
}

// ✅ 良い例：状態を適切な場所に配置
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Display count={count} />
      <Button onClick={() => setCount(count + 1)} />
    </div>
  );
}
```

### 状態のリフトアップ

複数のコンポーネントで共有する状態は、共通の親にリフトアップします。

```tsx
// 状態を親コンポーネントにリフトアップ
function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  return (
    <div>
      <UserList
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
      />
      <UserDetails user={selectedUser} />
    </div>
  );
}
```

## コンポーネントの種類

### プレゼンテーショナルコンポーネント（Presentational）

見た目に責任を持つコンポーネント。データの取得や状態管理を行わない。

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
```

**特徴**:
- Propsからデータを受け取る
- 状態を持たない（またはUIの状態のみ）
- 再利用性が高い
- テストが容易

### コンテナコンポーネント（Container）

データの取得や状態管理に責任を持つコンポーネント。

```tsx
function UserListContainer() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return <UserList users={users} />;
}
```

**特徴**:
- データの取得・管理を行う
- ビジネスロジックを含む
- プレゼンテーショナルコンポーネントにデータを渡す

### カスタムフックによる分離

コンテナコンポーネントのロジックをカスタムフックに分離することもできます。

```tsx
// カスタムフックでロジックを分離
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  return { users, loading };
}

// コンポーネントはシンプルに
function UserListContainer() {
  const { users, loading } = useUsers();

  if (loading) return <LoadingSpinner />;

  return <UserList users={users} />;
}
```

## 実践的な設計例

### 例1: フォームコンポーネント

```tsx
// 小さな再利用可能なコンポーネントに分割
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
      {error && <span className="error">{error}</span>}
    </div>
  );
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function TextInput({ value, onChange, placeholder }: TextInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

// 組み合わせて使用
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form>
      <FormField label="Email" error={errors.email}>
        <TextInput
          value={email}
          onChange={setEmail}
          placeholder="email@example.com"
        />
      </FormField>
      <FormField label="Password" error={errors.password}>
        <TextInput
          value={password}
          onChange={setPassword}
          type="password"
        />
      </FormField>
    </form>
  );
}
```

### 例2: リストコンポーネント

```tsx
// 汎用的なリストコンポーネント
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'アイテムがありません',
}: ListProps<T>) {
  if (items.length === 0) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 使用例
function UserList({ users }: { users: User[] }) {
  return (
    <List
      items={users}
      keyExtractor={(user) => user.id}
      renderItem={(user) => (
        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      )}
      emptyMessage="ユーザーが見つかりません"
    />
  );
}
```

## 設計のチェックリスト

コンポーネントを設計する際、以下の点を確認します：

- [ ] 単一責任の原則に従っているか
- [ ] 再利用可能か
- [ ] 適切な粒度か（大きすぎない、小さすぎない）
- [ ] 明確な命名がされているか
- [ ] Propsの型が適切に定義されているか
- [ ] 状態は適切な場所に配置されているか
- [ ] テストしやすい構造か
- [ ] 他のコンポーネントとの依存関係が最小限か

## まとめ

- **単一責任**: 1つのコンポーネントは1つの責任を持つ
- **再利用性**: 汎用的に使えるコンポーネントを設計
- **適切な粒度**: 用途に応じて適切なサイズに分割
- **明確な命名**: コンポーネントとPropsに説明的な名前を付ける
- **型安全性**: TypeScriptを使用する場合、適切な型定義を行う
- **状態管理**: 状態は必要最小限の範囲で管理
- **分離**: プレゼンテーショナルとコンテナを分離する

良いコンポーネント設計は、コードの可読性、保守性、再利用性を大幅に向上させます。

