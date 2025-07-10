const predictions = [
    "明日、太陽は東から昇るでしょう。",
    "ボタンを押した指は、あなたの指でしょう。",
    "1分は60秒であり続けるでしょう。",
    "夜空には、星々が輝いていることでしょう。",
    "呼吸を止めない限り、あなたは生き続けるでしょう。",
    "地球は、あなたの足元にあり続けるでしょう。",
    "水は、液体であることでしょう。",
    "あなたは、今この文章を読んでいる最中でしょう。",
    "眠りにつけば、夢を見ることがあるでしょう。",
    "空腹になれば、何かを食べたくなるでしょう。",
    "時間は過去から未来へと流れていくでしょう。",
    "この予言は、いずれ当たる時が来るでしょう。",
    "あなたは、いずれ歳をとるでしょう。",
    "空は、あなたの頭上にあるでしょう。",
    "今日という日は、二度と訪れないでしょう。",
    "まばたきをすると、一瞬視界が暗くなるでしょう。",
    "このボタンは、クリックされるために存在するでしょう。",
    "スマートフォンは、充電しないと使えなくなるでしょう。",
    "今、あなたの心臓は動いていることでしょう。",
    "何かを考えると、脳が活動するでしょう。"
];

const predictionElement = document.getElementById('prediction');
const predictButton = document.getElementById('predict-button');
const dateElement = document.getElementById('date');

// 日付を表示する関数
function setDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    dateElement.textContent = `${year}年${month}月${day}日の予言`;
}

predictButton.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * predictions.length);
    predictionElement.textContent = predictions[randomIndex];
});

// ページ読み込み時に日付を設定
setDate();
