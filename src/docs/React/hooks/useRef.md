# useRef まとめ

このドキュメントは React の `useRef` フックの使い方を TypeScript 例を交えて簡潔にまとめたものです。

## 概要

- `useRef` は再レンダーを発生させずに値を保持するためのコンテナ（.current プロパティ）を返す。
- DOM 要素への参照（ref）やタイマー ID、直近の値のキャッシュ、インスタンス相当のデータ保存に使う。

## 基本

```tsx
import { useRef } from 'react';

function Counter() {
	const countRef = useRef(0); // 初期値を保持
	const handleClick = () => {
		countRef.current += 1;
		alert(`現在の値: ${countRef.current}`);
	};
	return <button onClick={handleClick}>カウント</button>;
}
```

- `useRef` で保持した値は、値が変わっても再レンダーされません。

## useRef と useState の違い

- `useState` は値の変更で再レンダーする。
- `useRef` は再レンダーしない。UI の変化をトリガーしない一時的データや参照に適する。

### 使い分けの具体例

#### 例 1: 前回値の保持

```tsx
import { useRef, useEffect, useState } from 'react';

function PreviousValueSample() {
	const [value, setValue] = useState(0);
	const prevValue = useRef<number | null>(null);

	useEffect(() => {
		prevValue.current = value;
	}, [value]);

	return (
		<div>
			<button onClick={() => setValue((v) => v + 1)}>+1</button>
			<div>現在: {value}</div>
			<div>前回: {prevValue.current}</div>
		</div>
	);
}
```

- 前回値のような「UI には直接表示しないが、最新値を保持したい」用途は useRef が適しています。

#### 例 2: setTimeout/setInterval の ID 保持

```tsx
import { useRef, useEffect } from 'react';

function TimerSample() {
	const timerId = useRef<number | null>(null);

	useEffect(() => {
		timerId.current = window.setInterval(() => {
			console.log('tick');
		}, 1000);
		return () => {
			if (timerId.current !== null) {
				clearInterval(timerId.current);
			}
		};
	}, []);

	return <div>タイマー動作中（tickはconsole出力）</div>;
}
```

- タイマー ID のように「再レンダー不要な外部値の保存」は useRef が最適です。

### useRef を使う理由まとめ

- **再レンダー不要な値**（例: タイマー ID, 前回値, 外部 API のインスタンス, DOM 参照）を保持したい場合は useRef。
- **UI に反映したい値**（例: 入力値, カウンターなど）は useState。
- useRef で値を保持すると、値の変更で再レンダーが発生しないため、パフォーマンスや意図しない再描画を防げます。

## DOM 要素の参照

```tsx
import { useRef, useEffect } from 'react';

function FocusInput() {
	const inputRef = useRef<HTMLInputElement | null>(null);
	useEffect(() => {
		inputRef.current?.focus();
	}, []);
	return <input ref={inputRef} placeholder='自動でフォーカス' />;
}
```

- DOM にアクセスする場合はマウント後（useEffect 内）に操作する。

## TypeScript の型付け

- 推奨: null 許容型
  - `const elRef = useRef<HTMLDivElement | null>(null);`
- 非推奨（非 null アサーションで初期化）
  - `const elRef = useRef<HTMLInputElement>(null!);` // 安全性に注意

## フォワーディングと useRef

- `forwardRef` と組み合わせて子コンポーネントの DOM を親から操作できる。

```tsx
const MyInput = React.forwardRef<HTMLInputElement, Props>((props, ref) => (
	<input ref={ref} {...props} />
));
```

## useImperativeHandle（公開 API を制限）

- 子コンポーネントが親に公開するメソッドを制御する。

```tsx
useImperativeHandle(ref, () => ({
	focus: () => inputRef.current?.focus(),
}));
```

## コールバック ref（関数型 ref）

- DOM を受け取ったときに副作用を実行したい場合に利用する。

```tsx
import { useCallback } from 'react';

function CallbackRefSample() {
	const setRef = useCallback((node: HTMLDivElement | null) => {
		if (node) {
			node.style.background = 'yellow';
		}
	}, []);
	return <div ref={setRef}>コールバックrefで背景色変更</div>;
}
```

## よくある落とし穴

- ref の変更は再レンダーを引き起こさないので UI の同期を自分で管理する必要がある。
- マウント前に `.current` を参照すると null になる。
- ストレイなクロージャ（古い state を参照）対策として最新値を ref に格納しておくと便利。

## まとめ（実践的な Tips）

- フォーカス制御、外部ライブラリの DOM 操作、setInterval/timeout の ID 保存、最後の値キャッシュに使う。
- UI を更新したい場合は useState を優先する。
- TypeScript では null 許容の型で初期化するのが安全。

参考: React ドキュメントの Hooks セクションを参照することを推奨。
