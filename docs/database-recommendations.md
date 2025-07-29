# 社則AI システム - データベース設計と推奨事項

## 概要

社則AIシステムのデータベース設計方針と、将来の拡張性を考慮した推奨データベース選択肢を説明します。

## 現在の実装: Spark KV Store

### 特徴
- **シンプルなキー・バリューストア**
- **開発・プロトタイプ段階に最適**
- **設定不要で即座に利用可能**
- **Sparkプラットフォーム統合**

### 利点
- 開発スピードが速い
- 運用コストが低い
- 学習コストが少ない
- プラットフォーム依存性なし

### 制限事項
- 複雑なクエリが困難
- トランザクション機能なし
- リレーションの表現が制限的
- スケーラビリティに限界

## 推奨データベース選択肢

### 1. 小〜中規模企業（従業員数 50-500名）

#### **PostgreSQL + Prisma**

**推奨理由:**
- 成熟したリレーショナルデータベース
- 優れたJSONサポート（NoSQLとRDBMSの利点）
- 強力な全文検索機能
- TypeScript完全対応のPrismaORM

**データ構造例:**
```sql
-- 規則テーブル
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status rule_status NOT NULL DEFAULT 'draft',
    version INTEGER NOT NULL DEFAULT 1,
    metadata JSONB, -- tags, related_rules, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- 全文検索用インデックス
    CONSTRAINT rules_search_idx 
        GIN (to_tsvector('japanese', title || ' ' || content))
);

-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department VARCHAR(100),
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 会話テーブル
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255),
    summary TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- メッセージテーブル
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    type message_type NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB, -- confidence, rules_referenced, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**実装コスト:** 中程度
**運用コスト:** 低〜中程度
**拡張性:** 高

### 2. 中〜大規模企業（従業員数 500-5000名）

#### **MongoDB Atlas + Mongoose**

**推奨理由:**
- 柔軟なスキーマ設計
- 優れた水平スケーリング
- 豊富な分析機能
- クラウドネイティブ

**データ構造例:**
```javascript
// 規則コレクション
const ruleSchema = {
  _id: ObjectId,
  title: String,
  content: String,
  category: String,
  status: String,
  version: Number,
  tags: [String],
  relatedRules: [ObjectId],
  metadata: {
    importance: String,
    applicableRoles: [String],
    compliance: {
      legal: Boolean,
      regulatory: [String]
    }
  },
  audit: {
    createdBy: ObjectId,
    createdAt: Date,
    updatedBy: ObjectId,
    updatedAt: Date,
    approvedBy: ObjectId,
    approvedAt: Date
  },
  // 全文検索用インデックス
  textIndex: "text"
}

// ユーザーコレクション
const userSchema = {
  _id: ObjectId,
  email: String,
  profile: {
    name: String,
    role: String,
    department: String,
    position: String
  },
  permissions: [String],
  preferences: {
    aiPersonality: String,
    notifications: Object,
    dashboard: Object
  },
  activity: {
    lastLogin: Date,
    sessionCount: Number,
    questionsAsked: Number
  }
}
```

**実装コスト:** 中程度
**運用コスト:** 中程度
**拡張性:** 非常に高

### 3. 大規模企業（従業員数 5000名以上）

#### **Multi-Database アーキテクチャ**

**構成:**
- **PostgreSQL**: トランザクショナルデータ（規則、ユーザー、承認ワークフロー）
- **Elasticsearch**: 全文検索・分析
- **Redis**: キャッシュ・セッション管理
- **ClickHouse**: 分析・ログデータ

**推奨理由:**
- 各データベースの強みを活用
- 高可用性・高性能
- 企業グレードの信頼性
- 詳細な分析・監査機能

**アーキテクチャ図:**
```
┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   Admin Panel   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
            ┌────────▼─────────┐
            │   API Gateway    │
            │  (Rate Limiting, │
            │   Authentication)│
            └────────┬─────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼─────┐ ┌───▼────┐ ┌───▼─────┐
    │PostgreSQL│ │  Redis │ │Elasticsearch│
    │(Main DB) │ │(Cache) │ │ (Search)    │
    └──────────┘ └────────┘ └─────────────┘
                     │
               ┌─────▼──────┐
               │ ClickHouse │
               │(Analytics) │
               └────────────┘
```

**実装コスト:** 高
**運用コスト:** 高
**拡張性:** 無制限

## データ移行戦略

### 段階的移行アプローチ

#### フェーズ 1: 基盤整備
1. **データモデルの標準化**
   - 型定義の統一
   - バリデーション関数の整備
   - マイグレーション関数の作成

2. **抽象化レイヤーの構築**
   - DatabaseServiceの拡張
   - 複数データソース対応
   - 設定ベースのDB切り替え

#### フェーズ 2: 新データベース導入
1. **パラレル実行環境の構築**
   - 既存KVとの同時運用
   - データ同期機能
   - A/Bテスト環境

2. **段階的データ移行**
   - 静的データから順次移行
   - リアルタイムデータの同期
   - 整合性チェック

#### フェーズ 3: 完全移行
1. **パフォーマンス最適化**
   - インデックス調整
   - クエリ最適化
   - キャッシュ戦略

2. **監視・アラート設定**
   - ヘルスチェック
   - パフォーマンス監視
   - 自動復旧機能

## セキュリティ・コンプライアンス要件

### データ保護
- **暗号化**: 保存時・転送時の暗号化
- **アクセス制御**: 役割ベースのアクセス制御
- **監査ログ**: 全操作の追跡可能性
- **バックアップ**: 自動バックアップ・復旧

### コンプライアンス
- **GDPR対応**: 個人データの適切な管理
- **SOX法対応**: 監査証跡の確保
- **情報セキュリティ**: ISO27001準拠

### 実装例（PostgreSQL）:
```sql
-- 監査ログテーブル
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 行レベルセキュリティ
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY rules_access_policy ON rules
    USING (
        CASE 
            WHEN current_setting('app.user_role') = 'admin' THEN true
            WHEN current_setting('app.user_role') = 'hr' THEN status != 'draft'
            ELSE status = 'published'
        END
    );
```

## パフォーマンス最適化

### インデックス戦略
```sql
-- 複合インデックス
CREATE INDEX idx_rules_category_status ON rules(category, status);
CREATE INDEX idx_rules_created_at ON rules(created_at DESC);

-- 部分インデックス
CREATE INDEX idx_rules_pending ON rules(created_at) 
    WHERE status = 'pending';

-- 全文検索インデックス
CREATE INDEX idx_rules_fulltext ON rules 
    USING GIN(to_tsvector('japanese', title || ' ' || content));
```

### キャッシュ戦略
```typescript
// Redis キャッシュ実装例
class CacheService {
  async getPopularRules(): Promise<Rule[]> {
    const cached = await redis.get('popular_rules')
    if (cached) return JSON.parse(cached)
    
    const rules = await db.query(`
      SELECT r.*, COUNT(il.id) as access_count
      FROM rules r
      LEFT JOIN interaction_logs il ON il.details->>'ruleId' = r.id
      WHERE r.status = 'published'
      GROUP BY r.id
      ORDER BY access_count DESC
      LIMIT 10
    `)
    
    await redis.setex('popular_rules', 300, JSON.stringify(rules))
    return rules
  }
}
```

## 推奨実装タイムライン

### 即座に実装すべき（1-2週間）
- [ ] DatabaseServiceクラスの型安全性向上
- [ ] データバリデーション機能の強化
- [ ] エラーハンドリングの改善
- [ ] 基本的な監査ログ機能

### 短期実装（1-2ヶ月）
- [ ] PostgreSQL + Prismaへの移行準備
- [ ] データ移行ツールの開発
- [ ] パフォーマンステスト環境の構築
- [ ] セキュリティ監査の実施

### 中期実装（3-6ヶ月）
- [ ] Elasticsearchによる高度な検索機能
- [ ] リアルタイム分析ダッシュボード
- [ ] 機械学習ベースの推奨機能
- [ ] APIレート制限・認証の強化

### 長期実装（6ヶ月以上）
- [ ] マルチデータベースアーキテクチャ
- [ ] グローバル展開対応（多言語・多地域）
- [ ] 高度なAI分析機能
- [ ] エンタープライズ統合（LDAP、SSO等）

## 結論

社則AIシステムの成長段階に応じて、適切なデータベース選択が重要です：

1. **プロトタイプ・MVP段階**: Spark KV（現在）
2. **成長段階**: PostgreSQL + Prisma
3. **スケール段階**: MongoDB Atlas
4. **エンタープライズ段階**: Multi-Database アーキテクチャ

現在のSpark KVベースの実装から、段階的に移行することで、リスクを最小化しながら拡張性を確保できます。