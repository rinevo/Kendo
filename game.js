const MAX_HEALTH = 5;
const state = {
    playerHealth: MAX_HEALTH,
    enemyHealth: MAX_HEALTH,
    round: 0,
    gameOver: false,
    playerAnimState: 'idle',
    enemyAnimState: 'idle',
};

const actions = ['面', '小手', '胴', '防御'];
let audioCtx = null;
let spriteSheet = null;

// スプライトシート
const sprite = new Image();
sprite.src = "kendo.png";   // 作成した画像

// 元画像の1コマサイズ
const FRAME_W = 384;
const FRAME_H = 400;

// 表示画像の1コマサイズ
const DISP_W = 192;
const DISP_H = 200;

// スプライトシートのフレーム定義：正確なピクセル座標
// スプライトシート全体: 1536×1024 (3行分、各行の高さ=341px)
const spriteDefinition = {
    idle: { x: 0, y: 0, w: FRAME_W, h: FRAME_H },                               // 待機
    attack1: { x: FRAME_W + 1, y: FRAME_H + 1, w: FRAME_W, h: FRAME_H },        // 面打ち
    attack2: { x: 0, y: FRAME_H + 1, w: FRAME_W, h: FRAME_H },                  // 小手打ち
    attack3: { x: FRAME_W * 2 + 1, y: FRAME_H + 1, w: FRAME_W, h: FRAME_H },    // 胴打ち
    defend: { x: FRAME_W * 2 + 1, y: 0, w: FRAME_W, h: FRAME_H },               // 防御
    hit: { x: FRAME_W * 3 + 1, y: FRAME_H + 1, w: FRAME_W, h: FRAME_H },        // 被ダメージ
    victory: { x: FRAME_W * 2 + 1, y: 0, w: FRAME_W, h: FRAME_H },              // 勝利
};

const playerCanvas = document.getElementById('playerCanvas');
const enemyCanvas = document.getElementById('enemyCanvas');
const playerCtx = playerCanvas.getContext('2d', { imageSmoothingEnabled: false });
const enemyCtx = enemyCanvas.getContext('2d', { imageSmoothingEnabled: false });
const playerHealthBar = document.getElementById('playerHealthBar');
const enemyHealthBar = document.getElementById('enemyHealthBar');
const playerHealthText = document.getElementById('playerHealthText');
const enemyHealthText = document.getElementById('enemyHealthText');
const statusText = document.getElementById('statusText');

// 効果音生成
function ensureAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    ensureAudio();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.03, now + 0.01);

    if (type === 'attack') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.18);
    } else if (type === 'block') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.2);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.22);
    } else if (type === 'hurt') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'clash') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'square';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(620, now);
        osc2.frequency.setValueAtTime(760, now);
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.16);
        osc2.stop(now + 0.16);
    } else if (type === 'win') {
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        osc.connect(gain);
        osc.start(now + idx * 0.05);
        osc.stop(now + 0.25 + idx * 0.05);
        });
    } else if (type === 'lose') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.4);
    }

    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
}

function drawPlaceholder(ctx, label = 'スプライト') {
    ctx.fillStyle = 'rgba(70, 130, 180, 0.2)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, ctx.canvas.width / 2, ctx.canvas.height / 2);
}

function drawSprite(ctx, animState, flip = false) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const def = spriteDefinition[animState];
    if (!def) {
        drawPlaceholder(ctx, '?');
        return;
    }

    // 実際のピクセル座標から切り出し
    const srcX = def.x;
    const srcY = def.y;
    const srcWidth = def.w;
    const srcHeight = def.h;

    // スプライトのアスペクト比を保ったまま中央揃え
    const spriteAspect = srcWidth / srcHeight;
    const canvasAspect = ctx.canvas.width / ctx.canvas.height;

    let drawWidth, drawHeight, drawX, drawY;

    if (spriteAspect > canvasAspect) {
        // スプライトが横長
        drawWidth = ctx.canvas.width;
        drawHeight = ctx.canvas.width / spriteAspect;
    } else {
        // スプライトが縦長
        drawHeight = ctx.canvas.height;
        drawWidth = ctx.canvas.height * spriteAspect;
    }

    drawX = (ctx.canvas.width - drawWidth) / 2;
    drawY = (ctx.canvas.height - drawHeight) / 2;

    if (flip) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
            sprite,
            srcX, srcY, srcWidth, srcHeight,
            -drawX - drawWidth, drawY,
            drawWidth, drawHeight
        );
        ctx.restore();
    } else {
        ctx.drawImage(
            sprite,
            srcX, srcY, srcWidth, srcHeight,
            drawX, drawY,
            drawWidth, drawHeight
        );
    }
}

function setHealth() {
    const playerPct = (state.playerHealth / MAX_HEALTH) * 100;
    const enemyPct = (state.enemyHealth / MAX_HEALTH) * 100;
    playerHealthBar.style.width = `${playerPct}%`;
    enemyHealthBar.style.width = `${enemyPct}%`;
    playerHealthText.textContent = `体力: ${Math.max(0, state.playerHealth)} / ${MAX_HEALTH}`;
    enemyHealthText.textContent = `体力: ${Math.max(0, state.enemyHealth)} / ${MAX_HEALTH}`;
}

function updateStatus(message, type = 'neutral') {
    statusText.textContent = message;
    statusText.className = `status-text ${type}`;
}

function playRound(playerAction) {
    if (state.gameOver) {
        resetGame();
        return;
    }

    const enemyAction = actions[Math.floor(Math.random() * actions.length)];
    state.round += 1;

    let message = `第${state.round}打目: あなたは${playerAction}、相手は${enemyAction}を選びました。`;
    let statusType = '';
    let playerAnim = 'idle';
    let enemyAnim = 'idle';

    const attackMap = {
        面: ['小手'],
        小手: ['胴'],
        胴: ['面'],
    };

    if (playerAction == '面') {
        playerAnim = 'attack1';
    } else if (playerAction == '小手') {
        playerAnim = 'attack2';
    } else if (playerAction == '胴') {
        playerAnim = 'attack3';
    }

    if (enemyAction == '面') {
        enemyAnim = 'attack1';
    } else if (enemyAction == '小手') {
        enemyAnim = 'attack2';
    } else if (enemyAction == '胴') {
        enemyAnim = 'attack3';
    }

    if (playerAction === '防御') {
        playerAnim = 'defend';
        if (enemyAction === '防御') {
            message += ' 互いに守り合い、互角の構えです。';
            enemyAnim = 'defend';
        } else {
            message += ' 相手の攻撃を受け止めました！';
            statusType = 'victory';
            playSound('block');
        }
    } else if (enemyAction === '防御') {
        message += ' 相手は防御していて、技が決まりませんでした。';
        statusType = 'neutral';
        enemyAnim = 'defend';
        playSound('block');
    } else if (playerAction === enemyAction) {
        state.playerHealth -= 1;
        state.enemyHealth -= 1;
        message += ' 互いに打ち合い、双方にダメージが入ります！';
        statusType = 'defeat';
        playSound('clash');
    } else {
        const isValid = attackMap[playerAction].includes(enemyAction);
        if (isValid) {
            state.enemyHealth -= 1;
            message += ` ${playerAction}が決まりました！ 1点！`;
            statusType = 'victory';
            enemyAnim = 'hit';
            playSound('attack');
        } else {
            state.playerHealth -= 1;
            message += ` 相手の${enemyAction}があなたに決まりました！`;
            statusType = 'defeat';
            playerAnim = 'hit';
            playSound('hurt');
        }
    }

    state.playerAnimState = playerAnim;
    state.enemyAnimState = enemyAnim;
    setHealth();

    if (state.playerHealth <= 0) {
        state.playerAnimState = 'hit';
        playSound('lose');
        updateStatus(`敗北...${state.round}打目で倒されました。`, 'defeat');
        state.gameOver = true;
    } else if (state.enemyHealth <= 0) {
        state.enemyAnimState = 'hit';
        playSound('win');
        updateStatus(`勝利！！${state.round}打目で敵を倒しました！`, 'victory');
        state.gameOver = true;
    } else {
        updateStatus(message, statusType);
        // アニメーション状態をリセット（ゲームオーバーでない場合のみ）
        setTimeout(() => {
            state.playerAnimState = 'idle';
            state.enemyAnimState = 'idle';
        }, 1000);
    }
}

function resetGame() {
    state.playerHealth = MAX_HEALTH;
    state.enemyHealth = MAX_HEALTH;
    state.round = 0;
    state.gameOver = false;
    state.playerAnimState = 'idle';
    state.enemyAnimState = 'idle';
    setHealth();
    updateStatus('試合開始！技を選んでください。', 'neutral');
}

function animationLoop() {
    drawSprite(playerCtx, state.playerAnimState, false);
    drawSprite(enemyCtx, state.enemyAnimState, true);
    requestAnimationFrame(animationLoop);
}

// 初期化
setHealth();
animationLoop();
