# 🤖 社則AI - Company Rules AI Assistant

企業の規則や方針についてAIが適切な回答を提供する次世代人事システム

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange.svg)

## 📖 概要

**社則AI（Company Rules AI Assistant）** は、社員が会社の規則や方針について簡単に質問でき、AIが正確で実用的な回答を提供する知識管理システムです。OpenAI GPT-4oを活用し、自然言語での対話を通じて、複雑な企業規則を分かりやすく解説します。

### 🎯 主な目的

- **社員の規則理解向上**: 複雑な規則を分かりやすく解説
- **人事部問い合わせ削減**: よくある質問をAIが自動回答
- **規則遵守率向上**: 適切な情報提供による意識向上
- **業務効率化**: 迅速な規則検索と回答取得

## ✨ 主要機能

### 🔍 規則検索機能
- **カテゴリ別検索**: 勤務、休暇、服装、給与などのカテゴリで整理
- **全文検索**: キーワードによる高速検索
- **詳細表示**: 規則の内容、更新日、カテゴリを明確に表示

### 🤖 AI質問応答システム
- **自然言語対話**: 日常的な言葉で質問可能
- **文脈理解**: 過去の会話を考慮した適切な回答
- **複数の応答スタイル**: 業務的・親しみやすい・詳細の3種類
- **リアルタイム提案**: 入力中の質問候補を自動表示
- **会話要約**: 長い対話の内容を自動要約

### ❓ よくある質問（FAQ）
- **カテゴリ別整理**: 頻繁な質問を効率的に管理
- **即座の回答**: よく聞かれる内容への迅速な対応

### ⚙️ 管理機能
- **役割ベースアクセス**: 管理者・人事部・一般社員の権限管理
- **規則管理**: 追加・編集・削除・承認ワークフロー
- **承認システム**: 人事部提案の管理者承認機能
- **データ分析**: AI応答品質の監視と改善

### 📊 AIインサイト・分析機能
- **質問パターン分析**: どのような質問が多いかを把握
- **規則ギャップ分析**: 不足している規則領域の特定
- **利用統計**: ユーザー行動とエンゲージメントの分析
- **改善提案**: データドリブンな組織改善の提案

## 🏗️ システム構成

### フロントエンド
- **React 19.0**: 最新のReactフレームワーク
- **TypeScript**: 型安全な開発環境
- **Tailwind CSS**: モダンなUIデザイン
- **shadcn/ui**: 統一されたコンポーネントライブラリ
- **Framer Motion**: 滑らかなアニメーション

### バックエンド・統合
- **GitHub Spark**: 開発・デプロイプラットフォーム
- **Spark KV Store**: 軽量データストレージ
- **OpenAI GPT-4o**: 高度なAI応答生成
- **Spark LLM API**: LLM統合サービス

### セキュリティ・認証
- **役割ベースアクセス制御**: 3層権限管理
- **セッション管理**: 安全なユーザー認証
- **データ暗号化**: 機密情報の保護

## 🚀 セットアップ・インストール

### 前提条件
- Node.js 18.0.0以上
- npm 9.0.0以上
- GitHub Spark アカウント
- OpenAI API キー（管理者設定用）

### インストール手順

1. **リポジトリのクローン**
```bash
git clone https://github.com/nigoh/company-rules-ai-ass.git
cd company-rules-ai-ass
```

2. **依存関係のインストール**
```bash
npm install
```

3. **開発サーバーの起動**
```bash
npm run dev
```

4. **ブラウザでアクセス**
```
http://localhost:5000
```

### 本番環境デプロイ

```bash
# ビルド
npm run build

# プレビュー
npm run preview
```

## 👥 ユーザー権限

### 🔴 管理者（Admin）
- 全機能へのフルアクセス
- 規則の即座公開
- ユーザー管理
- AI設定・調整
- 詳細分析・インサイト
- データベース管理

### 🟡 人事部（HR）
- 規則の作成・編集（承認必要）
- 公開済み規則の管理
- 基本的な利用統計
- AI質問機能

### 🟢 一般社員（Employee）
- 規則検索・閲覧
- AI質問機能
- FAQ閲覧

## 💻 使用方法

### 規則の検索
1. 「規則検索」タブを選択
2. 検索バーにキーワードを入力
3. カテゴリでフィルタリング
4. 該当する規則を確認

### AIに質問
1. 「AI質問」タブを選択（ログイン必要）
2. 応答スタイルを選択
3. 自然言語で質問を入力
4. AIからの詳細な回答を確認
5. 関連質問の提案を活用

### 規則の管理（管理者・人事部）
1. 「管理」タブを選択
2. 「新規作成」で規則を追加
3. 「公開中の規則」で既存規則を編集
4. 「承認待ち」で提案を審査（管理者のみ）

### AI分析の活用（管理者のみ）
1. 「AIインサイト」で利用統計を確認
2. 「分析実行」で詳細な洞察を生成
3. 改善提案に基づく組織改善

## 📚 技術仕様

### データモデル
```typescript
interface Rule {
  id: string
  title: string
  content: string
  category: string
  lastUpdated: string
  status: 'published' | 'pending' | 'rejected'
  submittedBy?: string
  reviewedBy?: string
  reviewComment?: string
}

interface UserInfo {
  email: string
  role: 'admin' | 'hr' | 'employee'
  name: string
}
```

### API設計
- **RESTful API**: 標準的なHTTP API
- **GraphQL**: 効率的なデータ取得（将来実装）
- **WebSocket**: リアルタイム通信（将来実装）

## 🔧 開発・カスタマイズ

### 開発コマンド
```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run build

# リンター実行
npm run lint

# 依存関係最適化
npm run optimize
```

### カスタマイズ可能項目
- UIテーマ・カラー設定
- AI応答スタイルの調整
- 権限ロールの追加
- 規則カテゴリの追加
- 通知設定

## 📈 今後の機能拡張

### Phase 1: 基本機能強化（1-2ヶ月）
- [ ] 高度な検索フィルター
- [ ] 規則バージョン管理
- [ ] 通知システム
- [ ] モバイル最適化

### Phase 2: 分析・インサイト強化（3-4ヶ月）
- [ ] 高度な分析ダッシュボード
- [ ] 機械学習ベースの推奨機能
- [ ] カスタムレポート生成
- [ ] API開放

### Phase 3: エンタープライズ機能（6ヶ月以上）
- [ ] 多言語対応
- [ ] LDAP/AD統合
- [ ] SSO（シングルサインオン）
- [ ] 監査ログ強化
- [ ] データエクスポート機能

## 🔒 セキュリティ

- **データ暗号化**: 保存時・転送時の暗号化
- **アクセス制御**: 役割ベースの細かな権限管理
- **監査ログ**: 全操作の追跡可能性
- **API セキュリティ**: レート制限・認証
- **プライバシー保護**: GDPR準拠

詳細は [SECURITY.md](SECURITY.md) をご確認ください。

## 📖 関連ドキュメント

- [プロダクト要求仕様書（PRD）](PRD.md)
- [データベース推奨事項](docs/database-recommendations.md)
- [セキュリティガイドライン](SECURITY.md)
- [ユーザーガイド](docs/user-guide.md)（作成予定）
- [管理者マニュアル](docs/admin-manual.md)（作成予定）
- [API仕様書](docs/api-reference.md)（作成予定）

## 🤝 貢献・サポート

### 問題報告
バグやセキュリティの問題を発見した場合は、[Issues](https://github.com/nigoh/company-rules-ai-ass/issues)にて報告してください。

### 機能リクエスト
新機能の提案は、[Discussions](https://github.com/nigoh/company-rules-ai-ass/discussions)にて議論を開始してください。

### 開発への参加
プルリクエストを歓迎します。大きな変更の場合は、事前にIssueで議論することをお勧めします。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご確認ください。

## 🙏 謝辞

- **GitHub Spark** - 開発・デプロイプラットフォーム
- **OpenAI** - GPT-4o AI エンジン
- **shadcn/ui** - UIコンポーネントライブラリ
- **React・TypeScript コミュニティ** - 素晴らしい開発体験

---

**Made with ❤️ for better workplace communication**

このシステムに関する質問やサポートが必要な場合は、プロジェクトメンテナーまでお気軽にお問い合わせください。