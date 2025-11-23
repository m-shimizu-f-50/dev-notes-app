# パフォーマンス改善（memo, useCallback）

不要な再レンダリングを抑制するために活用されます。

## React.memo

`React.memo` は親コンポーネントが再レンダリングされても、`props` が変更されていない場合に、子コンポーネントの再レンダリングを防ぎます。

### 基本的な使い方

```tsx
import { memo } from 'react';

interface Props {
	name: string;
	age: number;
}

const ChildComponent = memo(({ name, age }: Props) => {
	console.log('ChildComponent がレンダリングされました');
	return (
		<div>
			<p>名前: {name}</p>
			<p>年齢: {age}</p>
		</div>
	);
});

export default ChildComponent;
```

### 注意点

`memo` でラップしたコンポーネントでも、**props にオブジェクトや関数を渡していると、**それが新しいインスタンスとして評価されるため再レンダリングが発生する可能性があります。

```tsx
// ❌ 悪い例：毎回新しいオブジェクト/関数が作成される
const ParentComponent = () => {
	const [count, setCount] = useState(0);

	return (
		<ChildComponent
			data={{ name: '太郎', age: 30 }} // 毎回新しいオブジェクト
			onClick={() => console.log('click')} // 毎回新しい関数
		/>
	);
};
```

→ `useCallback` や `useMemo` を使うことで、この問題を解決できます。

## useCallback

`useCallback` は関数が再生成されることを防ぎ、不要な再レンダリングを抑えます。子コンポーネントに関数を渡している場合に使用することで再レンダリングを防げます。

### 基本的な使い方

```tsx
import { useCallback, useState } from 'react';

const ParentComponent = () => {
	const [count, setCount] = useState(0);
	const [name, setName] = useState('太郎');

	// useCallback で関数をメモ化
	const handleClick = useCallback(() => {
		console.log('ボタンがクリックされました');
		// 何らかの処理
	}, []); // 依存配列が空 = 関数は一度だけ作成される

	// 依存配列に値を指定すると、その値が変更された時だけ再作成
	const handleChange = useCallback((newName: string) => {
		setName(newName);
	}, []); // setName は useState の setter なので安定している

	return (
		<div>
			<button onClick={() => setCount(count + 1)}>カウント: {count}</button>
			<ChildComponent onClick={handleClick} onChange={handleChange} />
		</div>
	);
};
```

### なぜ useCallback が必要か

React では、関数はコンポーネントのレンダリングごとに新しく作成されるため、props に関数を渡していると `React.memo` が正しく機能しないことがあります。

関数を `useCallback` でメモ化することで、前回と同じ関数を再利用できるため、不要な再レンダリングを防ぐことができます。

## 組み合わせて使う例

```tsx
import { memo, useCallback, useState } from 'react';

// 子コンポーネントを memo でラップ
const ChildComponent = memo(({ onClick, name }: Props) => {
	console.log('ChildComponent がレンダリングされました');
	return (
		<div>
			<p>名前: {name}</p>
			<button onClick={onClick}>クリック</button>
		</div>
	);
});

const ParentComponent = () => {
	const [count, setCount] = useState(0);
	const [name, setName] = useState('太郎');

	// useCallback で関数をメモ化
	const handleClick = useCallback(() => {
		console.log('クリックされました');
	}, []);

	return (
		<div>
			<button onClick={() => setCount(count + 1)}>カウント: {count}</button>
			{/* count が変更されても、ChildComponent は再レンダリングされない */}
			<ChildComponent onClick={handleClick} name={name} />
		</div>
	);
};
```

## useMemo との違い

- **useCallback**: 関数をメモ化
- **useMemo**: 計算結果をメモ化

```tsx
import { useMemo, useCallback } from 'react';

// useMemo: 計算結果をメモ化
const expensiveValue = useMemo(() => {
	return heavyCalculation(data);
}, [data]);

// useCallback: 関数自体をメモ化
const handleClick = useCallback(() => {
	doSomething();
}, []);
```

## 使い分けのガイドライン

### React.memo を使うべき場合

- 子コンポーネントのレンダリングコストが高い
- 親コンポーネントが頻繁に再レンダリングされる
- props が頻繁に変更されない

### useCallback を使うべき場合

- 子コンポーネントに `React.memo` が適用されている
- 関数を props として渡している
- 依存配列が安定している（空配列または安定した値）

### 注意点

- **過度な最適化は避ける**: すべてのコンポーネントや関数をメモ化する必要はない
- **依存配列を正しく指定**: 依存配列を間違えるとバグの原因になる
- **パフォーマンス測定**: 実際にパフォーマンス問題があるか確認してから最適化する

## 実践的な例

```tsx
import { memo, useCallback, useState, useMemo } from 'react';

interface User {
	id: number;
	name: string;
	age: number;
}

interface UserListProps {
	users: User[];
	onUserClick: (user: User) => void;
}

// 子コンポーネントを memo でラップ
const UserList = memo(({ users, onUserClick }: UserListProps) => {
	console.log('UserList がレンダリングされました');

	return (
		<ul>
			{users.map((user) => (
				<li key={user.id} onClick={() => onUserClick(user)}>
					{user.name} ({user.age})
				</li>
			))}
		</ul>
	);
});

const App = () => {
	const [count, setCount] = useState(0);
	const [users] = useState<User[]>([
		{ id: 1, name: '太郎', age: 30 },
		{ id: 2, name: '花子', age: 25 },
	]);

	// useCallback で関数をメモ化
	const handleUserClick = useCallback((user: User) => {
		console.log('ユーザーがクリックされました:', user);
		// 何らかの処理
	}, []);

	// useMemo で配列をメモ化（users が変更されない限り再計算しない）
	const sortedUsers = useMemo(() => {
		return [...users].sort((a, b) => a.age - b.age);
	}, [users]);

	return (
		<div>
			<button onClick={() => setCount(count + 1)}>カウント: {count}</button>
			{/* count が変更されても、UserList は再レンダリングされない */}
			<UserList users={sortedUsers} onUserClick={handleUserClick} />
		</div>
	);
};
```

## まとめ

- **React.memo**: props が変更されていない場合に子コンポーネントの再レンダリングを防ぐ
- **useCallback**: 関数をメモ化して、不要な再レンダリングを防ぐ
- **組み合わせ**: `React.memo` と `useCallback` を組み合わせることで、より効果的にパフォーマンスを改善できる
- **適切な使用**: 過度な最適化は避け、実際にパフォーマンス問題がある場合に使用する
