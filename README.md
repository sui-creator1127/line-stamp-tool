# LINEスタンプ切り分け室

一覧画像を、元のピクセルを使って個別PNGに分割する日本語Webツールです。Androidスマートフォン／WindowsパソコンのChromeで利用できます。

**公開設定後のURL： https://sui-creator1127.github.io/line-stamp-tool/**

このURLは、下記の設定とGitHub Pagesのデプロイが完了してから利用できます。PRの作成だけでは公開されません。

## 初回の公開設定（GitHub Pages・無料）

1. この変更のプルリクエストを開き、内容を確認して **Merge pull request → Confirm merge** を押します。
2. リポジトリ https://github.com/sui-creator1127/line-stamp-tool を開きます。
3. 現在このリポジトリはPrivateです。**GitHub Freeで無料公開する場合はPublicリポジトリが必要です。** Settings → General → 一番下のDanger Zone → Change repository visibility → Change to public と進み、GitHubの確認手順に従います。公開にするとソースコード・コミット履歴も誰でも閲覧できます。Privateを維持する場合は、PrivateリポジトリのPagesに対応する有料プランが必要です。
4. **Settings → Pages** を開きます。設定URL： https://github.com/sui-creator1127/line-stamp-tool/settings/pages
5. Build and deployment の Source で **Deploy from a branch** を選びます。
6. Branchを **main**、フォルダを **/docs** にして **Save** を押します。
7. 数分待ち、Actionsで **pages build and deployment** が成功したことを確認します。Settings → Pagesに表示される **Visit site** を押してください。
8. https://sui-creator1127.github.io/line-stamp-tool/ が開けば完了です。以後、mainのdocs内を更新すると自動反映されます。

管理権限がない場合はSettingsや公開設定が表示されません。404の場合は、PRをマージしたか、main・/docsを選んだか、Actionsが成功したかを順に確認してください。更新が見えない場合は少し待って再読み込みします。

## Androidで使う

1. Chromeで上記URLを開きます。
2. 「画像をアップロード」を押して一覧画像を選びます。
3. 分割形式を選びます。**4×2は横4列・縦2行**、2×4は横2列・縦4行です。
4. 線をドラッグして調整します。小さくて動かしにくい場合は「分割線を数値で調整」でピクセル位置を入力します。
5. 結果一覧で文字・キャラクターの端を確認します。必要に応じて各画像の「範囲を調整」で切り出す位置・幅・高さを変更します。
6. 余白と背景色を選び、「PNG保存」または「ZIPで一括保存」を押します。Chromeの「ダウンロード」やFilesアプリのDownloadフォルダに保存されます。ZIPはFilesアプリで展開できます。
7. よく使う場合はChromeのメニューから「ホーム画面に追加」またはブックマークを選びます（表示名は端末により異なります）。

WindowsもChromeで同じURLを開き、同じ手順で利用できます。アプリやNode.jsのインストールは不要です。

## 画像の扱い・画質

- 選択した画像はブラウザ内のメモリだけで処理し、外部サーバーへ送信しません。画像を送るAPIやフォームはありません。
- ZIPライブラリもリポジトリ内に同梱し、CDN、外部フォント、解析タグを使っていません。Content Security Policyの `connect-src 'none'` でfetch／XHR等の通信も禁止しています。
- WebページとJavaScriptの読み込みにはGitHub Pagesへの通信が発生します。GitHub側の通常のアクセスログとは別に、アプリが選択画像を送信・保存することはありません。
- AI再生成、色補正、リサイズ、背景透過はしません。整数座標で切り出し、元の大きさを維持してPNGへ保存します。ブラウザでデコードした画素を使用するため、入力ファイルのメタデータや元の圧縮データは引き継ぎません。
- 余白は外側に追加します。透明な入力画像は指定背景色へ合成されます。JPEGの既存の圧縮ノイズは修復できません。PNG入力をおすすめします。
- 均等分割はキャラクターや文字を自動認識しません。必ず一覧で切れを確認してください。余白を増やしても、すでに切れた内容は戻りません。個別範囲を広げると隣の絵が入る場合があります。
- 分割形式や分割線を変えると個別範囲の調整はリセットされます。ページを閉じると画像・設定は失われます。
- PNG・JPEG・WebPの静止画に対応。2400万画素以下、一辺12000px以下。メモリの少ない端末では小さい画像を使用してください。

## 開発・テスト

Node.js 22以降を推奨。公開にはビルド不要で、`docs/` がそのまま静的サイトになります。

```sh
npm ci
npm test
npm start
```

ローカル確認URL： http://localhost:8000/line-stamp-tool/

ブラウザテスト：

```sh
npx playwright install chromium
npm run test:browser
```

既存Chromiumを使う場合は環境変数 `CHROMIUM_PATH` に実行ファイルを指定できます。テストはPC幅とAndroid相当のスマホ幅で実行します。Android／Windows実機の確認とは異なります。

`npm test` は均等分割の全面積・枚数・端、切り出しサイズ、元の画素の一致、余白色、ZIP内PNGの一致を検証します。ブラウザテストは画像選択、分割形式、手動調整、PNG／ZIP保存、表示幅、画像操作後のネットワーク送信がないことを確認します。

JSZipを更新した場合は `npm run vendor` を実行し、`docs/jszip.min.js` とライセンスを合わせてコミットしてください。JSZipの著作権・ライセンスは [docs/JSZip-LICENSE.markdown](docs/JSZip-LICENSE.markdown) にあります。

## ファイル構成

- `docs/`：GitHub Pagesで公開するHTML・CSS・JavaScript
- `scripts/`：ローカルサーバーと依存ライブラリの同梱処理
- `tests/`：画像処理・ブラウザの自動テスト
- `package.json` / `package-lock.json`：開発・検証用の依存関係

LINEの公式ツールではありません。
