# 社則AI (Company Rules AI) - Product Requirements Document

社員が会社の規則や方針について質問でき、AIが適切な回答を提供する知識管理システム

**Experience Qualities**:
1. **Accessible** - 誰でも簡単に会社の規則を検索・理解できる
2. **Reliable** - 正確で一貫性のある情報を提供する
3. **Efficient** - 迅速に必要な情報にアクセスできる

**Complexity Level**: Light Application (multiple features with basic state)
- 複数の機能（規則検索、AI質問応答、管理機能）を持ちながら、シンプルなデータ管理で運用可能

## Essential Features

### 規則検索機能
- **Functionality**: 会社の規則をカテゴリ別に閲覧・検索
- **Purpose**: 社員が必要な規則を素早く見つけられる
- **Trigger**: 検索バーでキーワード入力またはカテゴリ選択
- **Progression**: 検索入力 → 結果表示 → 詳細確認 → 関連規則提案
- **Success criteria**: 3秒以内に関連する規則が表示される

### AI質問応答
- **Functionality**: 自然言語で規則について質問し、AIが回答
- **Purpose**: 複雑な規則の解釈や具体的なケースへの適用を支援
- **Trigger**: チャット画面で質問入力
- **Progression**: 質問入力 → AI処理 → 回答表示 → 関連規則リンク → フィードバック収集
- **Success criteria**: 90%以上の質問に有用な回答を提供

### 規則管理機能（管理者向け）
- **Functionality**: 規則の追加・編集・削除
- **Purpose**: 最新の会社方針を反映し続ける
- **Trigger**: 管理者ログインから管理画面アクセス
- **Progression**: ログイン確認 → 規則選択 → 編集 → プレビュー → 保存
- **Success criteria**: 変更が即座に全ユーザーに反映される

### よくある質問
- **Functionality**: 頻繁に質問される項目をFAQ形式で表示
- **Purpose**: 共通の疑問を効率的に解決
- **Trigger**: FAQセクションへのアクセス
- **Progression**: FAQ閲覧 → 質問選択 → 回答確認 → 関連質問提案
- **Success criteria**: 70%のユーザーがFAQで疑問を解決

## Edge Case Handling
- **規則の矛盾**: 複数の規則が競合する場合、最新版と参照元を明示
- **曖昧な質問**: AIが理解できない質問には、より具体的な質問例を提案
- **アクセス権限**: 機密情報への不正アクセスを防ぐため、適切な権限管理
- **システム障害**: オフライン時も基本的な規則は閲覧可能

## Design Direction
プロフェッショナルで信頼性を感じさせる、落ち着いた企業向けデザイン。ミニマルなインターフェースで情報の可読性を最優先に。

## Color Selection
Complementary (opposite colors) - 信頼性（青系）と重要性（オレンジ系）のバランスで、企業の安定感と活動性を表現

- **Primary Color**: Deep Blue (oklch(0.4 0.15 250)) - 信頼性と専門性を表現
- **Secondary Colors**: Light Gray (oklch(0.95 0.01 250)) - 読みやすさとクリーンさ
- **Accent Color**: Warm Orange (oklch(0.7 0.15 50)) - 重要な情報やCTAのハイライト
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark Gray text (oklch(0.2 0.01 250)) - Ratio 10.4:1 ✓
  - Card (Light Gray oklch(0.98 0.005 250)): Dark Gray text (oklch(0.2 0.01 250)) - Ratio 9.8:1 ✓
  - Primary (Deep Blue oklch(0.4 0.15 250)): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Accent (Warm Orange oklch(0.7 0.15 50)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓

## Font Selection
清潔で読みやすい、日本語と英語の混在に適したフォントファミリーを使用し、情報の階層を明確に表現

- **Typographic Hierarchy**: 
  - H1 (アプリタイトル): Noto Sans JP Bold/32px/tight letter spacing
  - H2 (セクションタイトル): Noto Sans JP Semibold/24px/normal letter spacing  
  - H3 (規則タイトル): Noto Sans JP Medium/20px/normal letter spacing
  - Body (規則本文): Noto Sans JP Regular/16px/relaxed line height
  - Caption (補足情報): Noto Sans JP Regular/14px/muted color

## Animations
控えめで機能的なアニメーション - ユーザーの注意を適切に誘導し、プロフェッショナルな印象を維持

- **Purposeful Meaning**: 検索結果の表示やAI回答の展開など、情報の流れを視覚的にサポート
- **Hierarchy of Movement**: 重要な更新（新しい規則追加）は目立つアニメーション、日常的な操作は控えめな遷移

## Component Selection
- **Components**: 
  - `Card` (規則表示), `Input` (検索), `Button` (アクション), `Tabs` (カテゴリ), `Dialog` (詳細表示)
  - `Textarea` (AI質問入力), `Badge` (カテゴリタグ), `Separator` (セクション区切り)
- **Customizations**: AI チャット用のメッセージバブル、規則階層表示用のツリーコンポーネント
- **States**: 検索中のローディング、AI応答待ちのタイピングインジケーター、保存成功の確認表示
- **Icon Selection**: `Search`, `MessageCircle`, `Book`, `Settings`, `User` アイコンで機能を直感的に表現
- **Spacing**: 8px基本単位でコンパクトながら読みやすいレイアウト
- **Mobile**: タブを下部ナビゲーションに変更、検索を最上部に固定、AI チャットをフルスクリーン表示