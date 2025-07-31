# 📡 社則AI API仕様書

**社則AIシステムの内部API仕様および将来の公開API設計**

## 📋 概要

この文書では、社則AIシステムで使用されている内部API仕様と、将来公開予定の外部API設計について説明します。現在のシステムはGitHub Spark KV StoreとOpenAI APIを使用しており、将来的にはRESTful APIとして外部システムとの統合を予定しています。

## 🏗️ 現在のアーキテクチャ

### 内部データアクセス

#### Spark KV Store API
```typescript
// 現在の実装で使用されているKVストア操作
interface SparkKVAPI {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<string[]>
}

// 使用例
const rules = await spark.kv.get<Rule[]>('company-rules')
await spark.kv.set('company-rules', updatedRules)
```

#### OpenAI Integration
```typescript
// OpenAI API統合（Spark LLM経由）
interface SparkLLMAPI {
  llm(prompt: string, model?: string, json?: boolean): Promise<string>
  llmPrompt(template: TemplateStringsArray, ...values: any[]): string
}

// 使用例
const prompt = spark.llmPrompt`質問: ${question}\n規則: ${rules}`
const response = await spark.llm(prompt, 'gpt-4o')
```

## 🚀 将来の公開API設計

### 認証・認可

#### API キー認証
```http
GET /api/v1/rules
Authorization: Bearer your-api-key-here
Content-Type: application/json
```

#### OAuth 2.0（将来実装）
```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&
client_id=your-client-id&
client_secret=your-client-secret
```

### エンドポイント仕様

#### 1. 規則管理API

##### 規則一覧取得
```http
GET /api/v1/rules
```

**クエリパラメータ**:
- `category` (string): カテゴリフィルター
- `status` (string): published | pending | all
- `limit` (number): 取得件数制限（デフォルト: 50）
- `offset` (number): オフセット（デフォルト: 0）
- `search` (string): 検索キーワード

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "rule-001",
        "title": "有給休暇の取得について",
        "content": "有給休暇は入社日から6ヶ月経過後に付与されます...",
        "category": "休暇",
        "status": "published",
        "lastUpdated": "2024-01-15T00:00:00Z",
        "submittedBy": "人事部",
        "tags": ["有給", "休暇", "申請"]
      }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "version": "1.0.0"
  }
}
```

##### 特定規則取得
```http
GET /api/v1/rules/{id}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": "rule-001",
    "title": "有給休暇の取得について",
    "content": "有給休暇は入社日から6ヶ月経過後に付与されます...",
    "category": "休暇",
    "status": "published",
    "lastUpdated": "2024-01-15T00:00:00Z",
    "submittedBy": "人事部",
    "reviewedBy": "管理者",
    "tags": ["有給", "休暇", "申請"],
    "relatedRules": ["rule-002", "rule-015"],
    "changeHistory": [
      {
        "version": "1.1.0",
        "changedAt": "2024-01-15T00:00:00Z",
        "changedBy": "人事部",
        "changeDescription": "申請期限の変更"
      }
    ]
  }
}
```

##### 規則作成
```http
POST /api/v1/rules
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "title": "新しい規則",
  "content": "規則の詳細内容",
  "category": "勤務",
  "tags": ["新規", "重要"]
}
```

##### 規則更新
```http
PUT /api/v1/rules/{id}
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "title": "更新された規則タイトル",
  "content": "更新された規則内容",
  "changeDescription": "変更理由の説明"
}
```

##### 規則削除
```http
DELETE /api/v1/rules/{id}
Authorization: Bearer your-api-key
```

#### 2. 検索API

##### 全文検索
```http
GET /api/v1/search
```

**クエリパラメータ**:
- `q` (string, required): 検索クエリ
- `category` (string): カテゴリフィルター
- `limit` (number): 結果件数制限
- `highlight` (boolean): ハイライト表示

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "rule-001",
        "title": "有給休暇の取得について",
        "snippet": "...有給休暇は入社日から6ヶ月経過後に...",
        "category": "休暇",
        "score": 0.95,
        "highlights": [
          "有給<mark>休暇</mark>は入社日から6ヶ月経過後に付与"
        ]
      }
    ],
    "total": 15,
    "took": 45,
    "maxScore": 0.95
  }
}
```

#### 3. AI質問応答API

##### AI質問
```http
POST /api/v1/ai/ask
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "question": "有給休暇の取得方法を教えてください",
  "context": {
    "userId": "user-123",
    "sessionId": "session-456",
    "style": "professional"
  },
  "options": {
    "includeReferences": true,
    "maxTokens": 500
  }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "answer": "有給休暇の取得方法について説明いたします...",
    "confidence": 0.92,
    "references": [
      {
        "ruleId": "rule-001",
        "title": "有給休暇の取得について",
        "relevance": 0.95
      }
    ],
    "suggestions": [
      "有給休暇の日数について知りたい",
      "特別休暇との違いは？"
    ],
    "sessionId": "session-456",
    "responseTime": 1250
  }
}
```

##### 質問履歴取得
```http
GET /api/v1/ai/conversations
Authorization: Bearer your-api-key
```

**クエリパラメータ**:
- `userId` (string): ユーザーID
- `sessionId` (string): セッションID
- `limit` (number): 取得件数

#### 4. FAQ API

##### FAQ一覧取得
```http
GET /api/v1/faq
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "faqs": [
      {
        "id": "faq-001",
        "question": "残業代はどのように計算されますか？",
        "answer": "法定時間外労働に対して25%の割増賃金を支給します...",
        "category": "給与",
        "popularity": 95,
        "lastUpdated": "2024-01-10T00:00:00Z"
      }
    ]
  }
}
```

#### 5. 分析・統計API

##### 利用統計取得
```http
GET /api/v1/analytics/usage
Authorization: Bearer your-api-key
```

**クエリパラメータ**:
- `period` (string): day | week | month | year
- `startDate` (string): 開始日（ISO 8601）
- `endDate` (string): 終了日（ISO 8601）

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "period": "month",
    "metrics": {
      "totalQuestions": 1250,
      "uniqueUsers": 85,
      "averageResponseTime": 1200,
      "satisfactionScore": 4.2,
      "topCategories": [
        {
          "category": "休暇",
          "count": 450,
          "percentage": 36
        }
      ],
      "dailyBreakdown": [
        {
          "date": "2024-01-01",
          "questions": 45,
          "users": 12
        }
      ]
    }
  }
}
```

##### AI分析実行
```http
POST /api/v1/analytics/ai-insights
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "analysisType": "comprehensive",
  "period": "month",
  "includeRecommendations": true
}
```

#### 6. ユーザー管理API

##### ユーザー一覧取得
```http
GET /api/v1/users
Authorization: Bearer your-api-key
```

##### ユーザー作成
```http
POST /api/v1/users
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "email": "user@company.com",
  "name": "田中太郎",
  "role": "employee",
  "department": "営業部"
}
```

## 🔒 セキュリティ仕様

### レート制限
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

**制限内容**:
- **基本プラン**: 1000リクエスト/時間
- **プレミアムプラン**: 5000リクエスト/時間
- **エンタープライズプラン**: 制限なし

### エラーハンドリング

#### 標準エラーレスポンス
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "リクエストパラメータが無効です",
    "details": {
      "field": "category",
      "reason": "無効なカテゴリが指定されています"
    },
    "timestamp": "2024-01-20T10:30:00Z",
    "requestId": "req-123456"
  }
}
```

#### HTTPステータスコード
- `200 OK`: 成功
- `201 Created`: 作成成功
- `400 Bad Request`: 不正なリクエスト
- `401 Unauthorized`: 認証失敗
- `403 Forbidden`: 権限不足
- `404 Not Found`: リソースが見つからない
- `429 Too Many Requests`: レート制限超過
- `500 Internal Server Error`: サーバーエラー

### データ暗号化
- **転送時**: TLS 1.3
- **保存時**: AES-256
- **API トークン**: JWT with RS256

## 📚 SDK・ライブラリ

### JavaScript SDK（計画中）
```javascript
import { CompanyRulesAI } from '@company/rules-ai-sdk'

const client = new CompanyRulesAI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.company-rules.ai'
})

// 規則検索
const rules = await client.rules.search({
  query: '有給休暇',
  category: '休暇'
})

// AI質問
const answer = await client.ai.ask({
  question: '有給の取得方法は？'
})
```

### Python SDK（計画中）
```python
from company_rules_ai import CompanyRulesAI

client = CompanyRulesAI(api_key='your-api-key')

# 規則検索
rules = client.rules.search(
    query='有給休暇',
    category='休暇'
)

# AI質問
answer = client.ai.ask(question='有給の取得方法は？')
```

## 🔄 Webhook（将来実装）

### 規則更新通知
```http
POST https://your-server.com/webhooks/rule-updated
Content-Type: application/json
X-Webhook-Signature: sha256=abc123...

{
  "event": "rule.updated",
  "timestamp": "2024-01-20T10:30:00Z",
  "data": {
    "ruleId": "rule-001",
    "title": "有給休暇の取得について",
    "changes": ["content", "lastUpdated"],
    "updatedBy": "人事部"
  }
}
```

### イベントタイプ
- `rule.created`: 規則作成
- `rule.updated`: 規則更新
- `rule.deleted`: 規則削除
- `rule.approved`: 規則承認
- `rule.rejected`: 規則却下
- `user.created`: ユーザー作成
- `ai.question`: AI質問（オプション）

## 📈 API 使用例・統合パターン

### 1. 社内ポータル統合
```javascript
// 社内ポータルサイトでの規則検索ウィジェット
async function searchRules(query) {
  const response = await fetch('/api/v1/search', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    params: new URLSearchParams({
      q: query,
      limit: 10
    })
  })
  
  const data = await response.json()
  return data.results
}
```

### 2. Slack Bot統合
```javascript
// Slack botでのAI質問機能
app.message('規則について', async ({ message, say }) => {
  const answer = await companyRulesAPI.ai.ask({
    question: message.text,
    context: {
      userId: message.user,
      channel: 'slack'
    }
  })
  
  await say({
    text: answer.answer,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: answer.answer
        }
      }
    ]
  })
})
```

### 3. Microsoft Teams アプリ
```javascript
// Teams アプリでの規則検索
const handleRuleSearch = async (query) => {
  const results = await api.rules.search({
    query,
    limit: 5
  })
  
  return results.map(rule => ({
    title: rule.title,
    subtitle: rule.category,
    text: rule.snippet,
    tap: {
      type: 'invoke',
      value: { action: 'viewRule', ruleId: rule.id }
    }
  }))
}
```

## 🧪 テスト・開発環境

### サンドボックス環境
```
Base URL: https://sandbox-api.company-rules.ai
API Key: sandbox_your-test-key-here
```

### テストデータ
- サンプル規則データ提供
- テスト用ユーザーアカウント
- AI応答のモックデータ

### API テストツール
- Postman コレクション提供
- Swagger UI for API Explorer
- curl コマンド例集

## 🚀 移行・バージョニング

### API バージョニング
- **URL バージョニング**: `/api/v1/`, `/api/v2/`
- **後方互換性**: 最低2バージョンまで保証
- **廃止予定通知**: 6ヶ月前の事前通知
- **移行支援**: 詳細な移行ガイド提供

### 現在のシステムからの移行
1. **Phase 1**: 内部API化（現在のKV Store維持）
2. **Phase 2**: REST API公開（並行運用）
3. **Phase 3**: データベース移行（PostgreSQL等）
4. **Phase 4**: 完全API化（KV Store廃止）

## 📞 サポート・お問い合わせ

### 技術サポート
- **メール**: api-support@company-rules.ai
- **ドキュメント**: https://docs.company-rules.ai
- **ステータスページ**: https://status.company-rules.ai
- **GitHub Issues**: https://github.com/company/rules-ai/issues

### 利用申請
- **API キー申請**: 管理者による承認制
- **利用量制限**: 用途に応じた制限設定
- **SLA**: エンタープライズプランでSLA提供

---

**🔌 堅牢で使いやすいAPIで システム連携を促進**

このAPI仕様は継続的に改善され、利用者のフィードバックを反映して進化します。