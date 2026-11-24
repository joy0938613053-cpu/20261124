let bgImage; // 儲存背景圖片 bg/3.png
let bgOffsetX = 0; // 記錄背景水平捲動偏移量（負值代表背景往左移動）
let characterSprite; // 儲存角色一的精靈圖
let walkSprite; // 儲存角色一的走路精靈圖
let magicSprite; // 儲存角色一的施法精靈圖
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖

let char2StopSprite; // 儲存角色二的待機精靈圖（2/stop/all.png）
let char2ActionSprite; // 儲存角色二的動作精靈圖（2/action/all.png）

let characterX; // 儲存角色一目前的水平中心位置
let isWalking = false; // 記錄角色是否已切換為走路動畫
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數
let magicDirection = 1; // 記錄施法時鎖定的方向
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效

// 英文單字選擇題與角色二對話框狀態
let wasNearChar2 = false; // 記錄上一幀角色一是否接近角色二
let showQuiz = false; // 控制是否顯示題目方框
let quizCompletedThisEncounter = false; // 記錄本次接近是否已作答完畢
let currentQuiz = null; // 儲存目前的隨機英文單字題目與選項
let char2DialogueText = ""; // 角色二旁邊對話框目前顯示的文字
let showChar2Dialogue = false; // 是否顯示角色二旁邊的對話框

// 簡單易懂的英文單字題庫
const englishVocabBank = [
  { word: "apple", meaning: "蘋果", distractors: ["香蕉", "橘子", "葡萄"] },
  { word: "cat", meaning: "貓", distractors: ["狗", "鳥", "魚"] },
  { word: "water", meaning: "水", distractors: ["火", "土", "風"] },
  { word: "book", meaning: "書", distractors: ["筆", "桌子", "椅子"] },
  { word: "sun", meaning: "太陽", distractors: ["月亮", "星星", "雲"] },
  { word: "tree", meaning: "樹", distractors: ["花", "草", "石頭"] },
  { word: "milk", meaning: "牛奶", distractors: ["果汁", "茶", "咖啡"] },
  { word: "bird", meaning: "鳥", distractors: ["魚", "馬", "兔子"] },
  { word: "house", meaning: "房子", distractors: ["學校", "公園", "商店"] },
  { word: "friend", meaning: "朋友", distractors: ["老師", "醫生", "家人"] },
  { word: "happy", meaning: "開心的", distractors: ["生氣的", "難過的", "害怕的"] },
  { word: "run", meaning: "跑", distractors: ["跳", "睡", "吃"] }
];

const frameCountInSprite = 10; // 設定精靈圖包含的影格數
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）
const frameHeight = 196; // 設定每個影格的高度
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度
const walkFrameHeight = 198; // 設定走路動畫每格的高度
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度
const magicFrameHeight = 146; // 設定施法動畫每格的高度
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度
const effectFrameHeight = 19; // 設定魔法特效每格的高度
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格

// 角色二精靈圖參數設定
const char2StopFrameCount = 8; // 2/stop/all.png 共 8 張
const char2StopTotalWidth = 699; // 2/stop/all.png 全寬 699
const char2StopFrameWidth = char2StopTotalWidth / char2StopFrameCount; // 單格寬度
const char2StopFrameHeight = 190; // 2/stop/all.png 高度 190

const char2ActionFrameCount = 12; // 2/action/all.png 共 12 張
const char2ActionTotalWidth = 1627; // 2/action/all.png 全寬 1627
const char2ActionFrameWidth = char2ActionTotalWidth / char2ActionFrameCount; // 單格寬度
const char2ActionFrameHeight = 171; // 2/action/all.png 高度 171

function preload() { // 在畫布建立前載入圖片資源
  bgImage = loadImage("bg/3.png"); // 載入背景圖片 bg/3.png
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖

  char2StopSprite = loadImage("2/stop/all.png"); // 載入角色二待機精靈圖
  char2ActionSprite = loadImage("2/action/all.png"); // 載入角色二動作精靈圖
} // 結束圖片載入函式

function setup() { // 初始化畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布
  imageMode(CENTER); // 讓座標代表影格的中心點
  characterX = (width * 2) / 3; // 將角色初始位置設在畫布寬度的三分之二處
  frameRate(60); // 將動畫更新速率設定為每秒六十格
  generateRandomEnglishQuiz(); // 初始化第一道英文單字題目
} // 結束初始化函式

// 隨機產生一道簡單易懂的英文單字選擇題（含 4 個選項）
function generateRandomEnglishQuiz() {
  const picked = random(englishVocabBank);
  const rawOptions = [picked.meaning, ...picked.distractors];
  const options = shuffle(rawOptions);
  const labels = ["A", "B", "C", "D"];
  const correctIndex = options.indexOf(picked.meaning);

  currentQuiz = {
    word: picked.word,
    question: `英文單字「${picked.word}」的意思是？`,
    options: options.map((val, idx) => ({
      label: labels[idx],
      value: val
    })),
    correctIndex: correctIndex
  };
}

// 取得題目方框的幾何尺寸與位置
function getQuizBoxBounds() {
  const boxWidth = width / 3; // 方框寬為整個畫布寬的 1/3
  const boxHeight = height / 2; // 方框高為整個畫布高的 1/2
  const boxX = width / 2 - boxWidth / 2; // 方框中間對準畫布中間
  const boxY = 12; // 方框上方靠近畫布上方
  return { x: boxX, y: boxY, w: boxWidth, h: boxHeight };
}

// 計算四個選項按鈕的座標範圍
function getOptionButtonRects(box) {
  const rects = [];
  const paddingX = box.w * 0.1;
  const startY = box.y + box.h * 0.36;
  const availableH = box.h * 0.56;
  const gap = availableH * 0.06;
  const btnH = (availableH - gap * 3) / 4;
  const btnW = box.w - paddingX * 2;

  for (let i = 0; i < 4; i++) {
    rects.push({
      index: i,
      x: box.x + paddingX,
      y: startY + i * (btnH + gap),
      w: btnW,
      h: btnH
    });
  }
  return rects;
}

function draw() { // 每個畫面更新一次背景與角色
  background("#87CEEB"); // 預設底色避免圖片載入前空白

  // 計算單張背景圖片依畫布高度等比例縮放後的寬度（確保至少與畫布同寬以完整覆蓋畫面）
  const bgAspect = bgImage && bgImage.height > 0 ? bgImage.width / bgImage.height : 1;
  const singleBgWidth = max(width, height * bgAspect);
  const singleBgHeight = height;

  // 計算三張背景串接後的可捲動範圍
  const minBgOffset = width - singleBgWidth * 2;
  const maxBgOffset = singleBgWidth;
  const anchorX = (width * 2) / 3; // 角色在捲動模式下的基準水平位置

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算適合不同裝置的移動速度

  // 維持角色高度為畫布高度的 1/3，寬度依原圖寬高比等比例縮放
  const characterScale = (height / 3) / frameHeight;
  const characterWidth = frameWidth * characterScale; // 計算角色基本顯示寬度
  const characterHeight = height / 3;

  if (movingRight) { // 按住右方向鍵
    isWalking = true; // 切換至走路動畫
    facingDirection = 1; // 設定角色朝向右方
    if (characterX < anchorX) {
      // 若角色先前因碰到最左邊界而往左移動，先讓角色走回基準點再捲動背景
      characterX = min(anchorX, characterX + movementStep);
    } else if (bgOffsetX > minBgOffset) {
      // 背景尚未到達最右邊，背景往左移動
      bgOffsetX = max(minBgOffset, bgOffsetX - movementStep);
    } else {
      // 背景已到達最右邊，暫停背景捲動並改為角色向右移動
      characterX += movementStep; // 讓角色向右移動
    }
  } else if (movingLeft) { // 按住左方向鍵
    isWalking = true; // 切換至走路動畫
    facingDirection = -1; // 設定角色朝向左方
    if (characterX > anchorX) {
      // 若角色先前因碰到最右邊界而往右移動，先讓角色走回基準點再捲動背景
      characterX = max(anchorX, characterX - movementStep);
    } else if (bgOffsetX < maxBgOffset) {
      // 背景尚未到達最左邊，背景往右移動
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep);
    } else {
      // 背景已到達最左邊，暫停背景捲動並改為角色向左移動
      characterX -= movementStep; // 讓角色向左移動
    }
  }

  // 限制角色中心避免超出畫布左右邊界
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2); // 限制角色中心避免超出畫布左右邊界

  // 繪製三張左右串接的背景圖片（左：i = -1，中：i = 0，右：i = 1）
  if (bgImage) {
    push();
    imageMode(CORNER); // 背景使用左上角座標對齊無縫串接
    for (let i = -1; i <= 1; i++) {
      const drawX = bgOffsetX + i * singleBgWidth;
      image(bgImage, drawX, 0, singleBgWidth, singleBgHeight);
    }
    pop();
  }

  // 計算角色二位置：位於最左邊背景圖（i = -1，起點為 bgOffsetX - singleBgWidth）的正中央
  const leftmostBgStartX = bgOffsetX - singleBgWidth;
  const char2X = leftmostBgStartX + singleBgWidth * 0.5;

  // 判斷角色一是否接近角色二
  const proximityThreshold = max(characterWidth * 1.25, singleBgWidth * 0.14);
  const isChar1NearChar2 = abs(characterX - char2X) <= proximityThreshold;

  // 根據接近狀態選擇角色二的精靈圖與影格設定
  const char2Sprite = isChar1NearChar2 ? char2ActionSprite : char2StopSprite;
  const char2FrameCount = isChar1NearChar2 ? char2ActionFrameCount : char2StopFrameCount;
  const char2FrameWidth = isChar1NearChar2 ? char2ActionFrameWidth : char2StopFrameWidth;
  const char2FrameHeight = isChar1NearChar2 ? char2ActionFrameHeight : char2StopFrameHeight;

  // 等比例縮放角色二，使高度與角色一一致（畫布高度的 1/3）並貼齊底部
  const char2Scale = (height / 3) / char2FrameHeight;
  const char2DrawWidth = char2FrameWidth * char2Scale;
  const char2DrawHeight = char2FrameHeight * char2Scale;
  const char2Y = height - char2DrawHeight / 2;
  const char2FrameIndex = floor(frameCount / framesPerStep) % char2FrameCount;
  const char2SourceX = char2FrameIndex * char2FrameWidth;

  // 處理接近與離開角色二時的對話框與題目狀態切換
  if (isChar1NearChar2 && !wasNearChar2) {
    // 剛接近角色二：先在角色二旁邊顯示挑戰對話框，並隨機產生新題目
    generateRandomEnglishQuiz();
    quizCompletedThisEncounter = false;
    char2DialogueText = "勇者，想通過這裡必須過我這關";
    showChar2Dialogue = true;
    showQuiz = true;
  } else if (!isChar1NearChar2 && wasNearChar2) {
    // 離開角色二：隱藏題目方框與對話框
    showQuiz = false;
    showChar2Dialogue = false;
    quizCompletedThisEncounter = false;
    char2DialogueText = "";
  }
  wasNearChar2 = isChar1NearChar2;

  // 繪製角色二
  if (char2Sprite) {
    const char2Facing = characterX < char2X ? -1 : 1;
    push();
    translate(char2X, char2Y);
    scale(char2Facing, 1);
    image(
      char2Sprite,
      0,
      0,
      char2DrawWidth,
      char2DrawHeight,
      char2SourceX,
      0,
      char2FrameWidth,
      char2FrameHeight
    );
    pop();
  }

  // 在角色二旁邊繪製對話框（角色1在右 -> 對話框在左；角色1在左 -> 對話框在右）
  if (showChar2Dialogue && char2DialogueText) {
    drawChar2DialogueBox(char2X, char2Y, char2DrawWidth, char2DrawHeight, characterX);
  }

  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 檢查施法動畫是否已完整播放一次
    isCasting = false; // 結束施法動畫並恢復一般角色動作
    activeEffects.push({ x: characterX + magicDirection * characterWidth / 2, y: height - characterHeight * 0.58, direction: magicDirection }); // 在角色前方建立朝施法方向飛行的特效
  } // 結束施法動畫完成判斷

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; // 根據角色狀態選擇施法、走路或站立精靈圖
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; // 取得目前精靈圖的影格總數
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; // 取得目前精靈圖每格的寬度
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; // 取得目前精靈圖每格的高度
  const elapsedMagicFrames = frameCount - magicStartFrame; // 計算施法動畫已播放的畫面數
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount; // 計算目前要顯示的精靈影格
  const sourceX = frameIndex * activeFrameWidth; // 計算目前影格在精靈圖中的水平起點
  const activeWidth = activeFrameWidth * characterScale; // 計算目前角色影格的顯示寬度
  const activeHeight = activeFrameHeight * characterScale; // 計算目前角色影格的顯示高度
  const characterY = height - activeHeight / 2; // 將目前角色影格底部對齊畫布底部

  push(); // 暫存目前的繪圖座標轉換狀態
  translate(characterX, characterY); // 將繪圖原點移至角色中心
  scale(isCasting ? magicDirection : facingDirection, 1); // 依施法或角色朝向決定是否水平翻轉
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight); // 裁切並繪製目前角色影格
  pop(); // 還原繪圖座標轉換狀態

  const effectScale = characterScale; // 使用角色縮放倍率讓特效適應不同畫布
  const effectWidth = effectFrameWidth * effectScale; // 計算特效影格的顯示寬度
  const effectHeight = effectFrameHeight * effectScale; // 計算特效影格的顯示高度
  const effectSpeed = max(6, width * 0.008); // 依畫布寬度計算特效飛行速度
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { // 由後往前更新所有飛行中的特效
    const effect = activeEffects[effectIndex]; // 取得目前更新的特效資料
    effect.x += effect.direction * effectSpeed; // 依特效方向更新水平位置
    if (effect.x > width || effect.x < 0) { // 判斷特效是否已抵達畫布左右邊緣
      activeEffects.splice(effectIndex, 1); // 移除已飛出畫布的特效
      continue; // 略過已移除特效的繪製
    } // 結束特效邊界判斷
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; // 計算特效目前播放的影格
    push(); // 暫存目前的繪圖座標轉換狀態
    translate(effect.x, effect.y); // 將繪圖原點移至特效中心
    scale(effect.direction, 1); // 依飛行方向翻轉特效影格
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); // 裁切並繪製目前特效影格
    pop(); // 還原繪圖座標轉換狀態
  } // 結束飛行中特效更新迴圈

  // 繪製英文單字選擇題方框（顯示於整個畫布最上方）
  if (showQuiz && !quizCompletedThisEncounter && currentQuiz) {
    drawQuizOverlay();
  }
} // 結束繪圖函式

// 繪製角色二旁邊的對話框（依角色一在角色二的左或右側決定對話框在右或左側）
function drawChar2DialogueBox(char2X, char2Y, char2W, char2H, char1X) {
  const isChar1OnRight = char1X >= char2X;
  const boxW = constrain(width * 0.22, 190, 320);
  const boxH = constrain(height * 0.11, 64, 105);
  const offsetGap = max(16, char2W * 0.25);

  // 角色1在角色2右手邊 -> 對話框在角色2左手邊；角色1在角色2左手邊 -> 對話框在角色2右手邊
  let boxX = isChar1OnRight
    ? char2X - char2W * 0.5 - offsetGap - boxW
    : char2X + char2W * 0.5 + offsetGap;

  // 確保對話框不會超出畫布左右邊界
  boxX = constrain(boxX, 10, width - boxW - 10);
  const boxY = constrain(char2Y - char2H * 0.45, 10, height - boxH - 10);

  push();
  fill(255, 253, 240, 235);
  stroke(90, 65, 20);
  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 12);

  noStroke();
  fill(35, 25, 10);
  textAlign(CENTER, CENTER);
  const fontSize = constrain(min(boxW * 0.068, boxH * 0.24), 13, 20);
  textSize(fontSize);
  text(char2DialogueText, boxX + 12, boxY + 8, boxW - 24, boxH - 16);
  pop();
}

// 繪製透明度 90 的黃色方框與英文單字選擇題
function drawQuizOverlay() {
  const box = getQuizBoxBounds();
  const btnRects = getOptionButtonRects(box);

  push();
  // 黃色方框，透明度為 90（p5.js alpha 範圍 0~255）
  fill(255, 235, 59, 90);
  stroke(210, 175, 0, 180);
  strokeWeight(2);
  rect(box.x, box.y, box.w, box.h, 14);

  // 題目標題與英文單字
  noStroke();
  fill(40, 30, 0);
  textAlign(CENTER, CENTER);

  const titleSize = constrain(min(box.w * 0.052, box.h * 0.08), 13, 22);
  textSize(titleSize);
  text("英文單字挑戰（點擊或按 1~4 作答）", box.x + box.w / 2, box.y + box.h * 0.11);

  const questionSize = constrain(min(box.w * 0.068, box.h * 0.115), 16, 28);
  textStyle(BOLD);
  textSize(questionSize);
  text(currentQuiz.question, box.x + box.w / 2, box.y + box.h * 0.24);
  textStyle(NORMAL);

  // 繪製四個選項按鈕
  const optionTextSize = constrain(min(box.w * 0.062, box.h * 0.09), 15, 25);
  textSize(optionTextSize);

  for (let i = 0; i < btnRects.length; i++) {
    const r = btnRects[i];
    const opt = currentQuiz.options[i];
    const isHover =
      mouseX >= r.x && mouseX <= r.x + r.w &&
      mouseY >= r.y && mouseY <= r.y + r.h;

    fill(isHover ? color(255, 255, 255, 210) : color(255, 255, 255, 150));
    stroke(160, 130, 0, 180);
    strokeWeight(1.5);
    rect(r.x, r.y, r.w, r.h, 8);

    noStroke();
    fill(30, 30, 30);
    text(`(${opt.label})  ${opt.value}`, r.x + r.w / 2, r.y + r.h / 2);
  }
  pop();
}

// 處理玩家選擇選項後的邏輯（作答完畢關閉題目方框，並在角色二對話框顯示答對/答錯訊息）
function submitQuizAnswer(optionIndex) {
  if (!showQuiz || !currentQuiz || optionIndex < 0 || optionIndex >= currentQuiz.options.length) {
    return;
  }
  const isCorrect = optionIndex === currentQuiz.correctIndex;
  char2DialogueText = isCorrect
    ? "恭喜你，智商還不算低嘛"
    : "就你這樣還想通關?回去在練練吧";
  showChar2Dialogue = true;
  showQuiz = false;
  quizCompletedThisEncounter = true;
}

function mousePressed() {
  if (showQuiz && !quizCompletedThisEncounter && currentQuiz) {
    const box = getQuizBoxBounds();
    const btnRects = getOptionButtonRects(box);
    for (let i = 0; i < btnRects.length; i++) {
      const r = btnRects[i];
      if (
        mouseX >= r.x && mouseX <= r.x + r.w &&
        mouseY >= r.y && mouseY <= r.y + r.h
      ) {
        submitQuizAnswer(i);
        return false;
      }
    }
  }
}

function keyPressed() { // 按下方向鍵時切換角色狀態與朝向
  // 題目顯示時支援按鍵 1~4 或 A~D 快速作答
  if (showQuiz && !quizCompletedThisEncounter && currentQuiz) {
    if (key === "1" || key === "a" || key === "A") {
      submitQuizAnswer(0);
      return false;
    }
    if (key === "2" || key === "b" || key === "B") {
      submitQuizAnswer(1);
      return false;
    }
    if (key === "3" || key === "c" || key === "C") {
      submitQuizAnswer(2);
      return false;
    }
    if (key === "4" || key === "d" || key === "D") {
      submitQuizAnswer(3);
      return false;
    }
  }

  if (keyCode === RIGHT_ARROW) { // 判斷是否按下右方向鍵
    isWalking = true; // 啟用走路動畫
    facingDirection = 1; // 讓角色面向右方
    return false; // 防止方向鍵捲動網頁
  } // 結束右方向鍵判斷
  if (keyCode === LEFT_ARROW) { // 判斷是否按下左方向鍵
    isWalking = true; // 啟用走路動畫
    facingDirection = -1; // 讓角色面向左方
    return false; // 防止方向鍵捲動網頁
  } // 結束左方向鍵判斷
  if (keyCode === 32) { // 判斷是否按下空白鍵
    if (!spaceIsDown && !isCasting) { // 僅在空白鍵新按下且角色未施法時觸發
      isCasting = true; // 開始播放施法動畫
      magicStartFrame = frameCount; // 記錄施法動畫的起始畫面
      magicDirection = facingDirection; // 鎖定施法當下角色面向
    } // 結束施法啟動判斷
    spaceIsDown = true; // 記錄空白鍵已按住以避免連續觸發
    return false; // 防止空白鍵捲動網頁
  } // 結束空白鍵判斷
} // 結束按鍵事件處理函式

function keyReleased() { // 鍵盤按鍵放開時更新按鍵狀態
  if (keyCode === 32) { // 判斷放開的是否為空白鍵
    spaceIsDown = false; // 允許下次按空白鍵重新施法
  } // 結束空白鍵放開判斷
} // 結束按鍵放開事件處理函式

function windowResized() { // 視窗尺寸改變時重新調整畫布
  resizeCanvas(windowWidth, windowHeight); // 將畫布同步為新的視窗尺寸
  characterX = constrain(characterX, 1, width - 1); // 將角色位置限制在縮放後畫布內
} // 結束視窗縮放處理函式