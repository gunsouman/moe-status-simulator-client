import React from "react"

export default (
    <React.Fragment>
        <ul>
            <li>本機能は<a href="http://moeread.usamimi.info/" target="_blank" rel="noreferrer">wiki</a>と<a href="https://scrapbox.io/medianmoe/" target="_blank" rel="noreferrer">medi</a>に記載されている情報を参考にしております。</li>
            <li>効果量が不明なものは「?」と記載しており、計算結果には反映しておりません。</li>
            <li>本来ステータスの値が乗算される箇所はバフの順番によって結果が変わりますが、本機能では最大値を出力しております。</li>
            <li>「追加BUFF」の項目で選択出来るデフォルトのスキル（キーンエッジなど）は、大体は魔力が100の場合の値が入っております。
            他の値を使用する場合は手動で修正をお願いします。</li>
            <li>攻撃力依存ダメージと物理与ダメージは同じものとして扱っております（同じもとのして扱われているかは不明です。）</li>
            <li>エンチャント関係は未実装です。</li>
            <li>二刀流などの追撃によるディレイは未実装です。</li>
            <li>まだまだバグが多いと思われますのでご了承下さい。</li>
        </ul>
    </React.Fragment>
)