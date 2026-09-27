---
name: gas-add-ui-component
description: 新規 UI コンポーネントの追加、ローディング・エラー状態の設計、GAS サーバー連携手順
---

# UI コンポーネント追加スキル (gas-add-ui-component)

本スキルは、`react`, `vue`, `react-ciderjs`, `vue-ciderjs`, `html-js` テンプレートにおいて、新しい画面・UI コンポーネントを追加し、GAS バックエンド通信と接続する手順書です。

---

## ワークフロー

### Step 1: コンポーネントの設計方針

GAS との通信は非同期（ネットワーク往復）であるため、コンポーネントは以下の3つの状態を必ず設計してください。

1. **Loading 状態**: データ取得中のインジケーター（スピナー、スケルトン）
2. **Error 状態**: ネットワーク障害やサーバーエラー発生時のユーザー向けメッセージ
3. **Success 状態**: 取得・送信成功時の表示

### Step 2: 実装例 (React)

```tsx
import React, { useState, useEffect } from 'react';
import { callGasServer } from '../lib/gas'; // または gasnuki の gas

interface ProfileData {
  name: string;
  email: string;
}

export function UserProfile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        const result = await callGasServer<ProfileData>('getUserProfile');
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : '取得に失敗しました');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false; // クリーンアップ必須
    };
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
    </div>
  );
}
```

### Step 3: ローカルでのプレビュー確認

```bash
pnpm dev
```

ブラウザでローカルサーバーを開き、コンポーネントの表示・モックの動作を確認します。

### Step 4: リントとビルド確認

```bash
pnpm run check && pnpm run build
```

単一 HTML へのバンドルが正常に完了することを確認します。
