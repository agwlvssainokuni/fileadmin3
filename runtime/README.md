FileAdmin3 - ファイル管理
========================

# ランタイム構成
ランタイム構成の依存ライブラリとして以下を設定。
* unix-dgram
  * winston-syslog の推移的依存ライブラリ。
  * ネイティブモジュール (unix_dgram.node) を含むためバンドルできない。
* date-fns
  * 設定ファイル(DSL)で require できる日時文字列操作ライブラリ。
