# 検索条件詳細：ブラッシュアップ対応

## 内容

検索条件が前回のリクエストと同じ条件の場合に、リクエストを止める

## 修正方針

「最後に検索ボタンを押した時の条件」と「現在の条件」を比較し、変更がなければ処理をスキップするように修正

※`initialOptionsRef`という`useRef`が「画面表示時(または前回検索時)のパラメータ」を保持する役割で使われている

## 実装方針

lodash の `isEqual` を使用して、2 つのオブジェクトが深い比較で等しいかを判定します。

## インストール

```bash
npm install lodash
npm install --save-dev @types/lodash
```

## 基本的な使い方

```jsx
import { isEqual } from 'lodash';

const obj1 = { name: '太郎', age: 30, address: { city: '東京' } };
const obj2 = { name: '太郎', age: 30, address: { city: '東京' } };

console.log(isEqual(obj1, obj2)); // true
```

## 本機能での用途

- 「最後に検索した条件（`initialOptionsRef`）」と「現在の検索条件」を深い比較
- ネストされたオブジェクトや配列も含めて完全に一致するかを判定
- 一致する場合は検索処理をスキップし、不要な API リクエストを防ぐ

## 実装例

```tsx
import { useRef } from 'react';
import { isEqual } from 'lodash';

const SearchComponent = () => {
  // 前回の検索条件を保持する ref
  const initialOptionsRef = useRef<SearchOptions | null>(null);

  const handleSearch = () => {
    const currentOptions = getCurrentSearchOptions();

    // 前回の検索条件と現在の条件を比較
    if (isEqual(initialOptionsRef.current, currentOptions)) {
      console.log('検索条件が変更されていないため、処理をスキップ');
      return;
    }

    // 検索処理を実行
    performSearch(currentOptions);

    // 検索後、現在の条件を保存
    initialOptionsRef.current = currentOptions;
  };

  return (
    // ... JSX
  );
};
```

## ポイント

### useRef を使う理由

- `useState` を使うと値の変更で再レンダーが発生するが、検索条件の保存は UI に反映する必要がない
- `useRef` は再レンダーを発生させずに値を保持できるため、この用途に最適

### isEqual を使う理由

- 通常の `===` や `==` では、オブジェクトの参照が異なると `false` になる
- `isEqual` は深い比較（deep comparison）を行うため、オブジェクトの内容が同じであれば `true` を返す
- ネストされたオブジェクトや配列も正しく比較できる

### 注意点

- `initialOptionsRef.current` が `null` の場合は、初回検索時なので必ず検索を実行する
- 検索条件が変更された場合のみ、`initialOptionsRef.current` を更新する

## メリット

- 不要な API リクエストを防ぎ、パフォーマンスが向上
- サーバーへの負荷を軽減
- ユーザーが誤って同じ条件で検索ボタンを連打しても、無駄なリクエストが発生しない
