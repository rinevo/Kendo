const MAX_HEALTH = 5;
const MAX_KIAI = 3;

const state = {
    playerHealth: MAX_HEALTH,
    enemyHealth: MAX_HEALTH,
    playerKiai: 0,
    enemyKiai: 0,
    playerCounterReady: false,
    enemyCounterReady: false,
    playerGuardBroken: false,
    enemyGuardBroken: false,
    round: 0,
    gameOver: false,
    playerAnimState: 'idle',
    enemyAnimState: 'idle',
    enemyIntent: null,
    animResetTimer: null,
};

let audioCtx = null;

// スプライトシート (1536x800: 384x400 のコマが 4列×2行)
const sprite = new Image();
sprite.src = "kendo.png";

const FRAME_W = 384;
const FRAME_H = 400;

const spriteDefinition = {
    idle:         { x: 0,           y: 0,       w: FRAME_W, h: FRAME_H }, // 待機（中段の構え）
    counterReady: { x: FRAME_W,     y: 0,       w: FRAME_W, h: FRAME_H }, // 応じ技構え・気合充実
    defend:       { x: FRAME_W * 2, y: 0,       w: FRAME_W, h: FRAME_H }, // 防御・上段受け
    breakAttack:  { x: FRAME_W * 3, y: 0,       w: FRAME_W, h: FRAME_H }, // 崩し・下段／体勢崩れ
    attack2:      { x: 0,           y: FRAME_H, w: FRAME_W, h: FRAME_H }, // 小手打ち
    attack1:      { x: FRAME_W,     y: FRAME_H, w: FRAME_W, h: FRAME_H }, // 面打ち
    attack3:      { x: FRAME_W * 2, y: FRAME_H, w: FRAME_W, h: FRAME_H }, // 胴打ち・諸手突き
    hit:          { x: FRAME_W * 3, y: FRAME_H, w: FRAME_W, h: FRAME_H }, // 被ダメージ
    victory:      { x: FRAME_W * 2, y: 0,       w: FRAME_W, h: FRAME_H }, // 勝利
};

const playerCanvas = document.getElementById('playerCanvas');
const enemyCanvas = document.getElementById('enemyCanvas');
const playerCtx = playerCanvas.getContext('2d', { imageSmoothingEnabled: false });
const enemyCtx = enemyCanvas.getContext('2d', { imageSmoothingEnabled: false });

const playerHealthBar = document.getElementById('playerHealthBar');
const enemyHealthBar = document.getElementById('enemyHealthBar');
const playerHealthText = document.getElementById('playerHealthText');
const enemyHealthText = document.getElementById('enemyHealthText');

const playerKiaiText = document.getElementById('playerKiaiText');
const enemyKiaiText = document.getElementById('enemyKiaiText');
const playerKiaiPips = document.getElementById('playerKiaiPips');
const enemyKiaiPips = document.getElementById('enemyKiaiPips');

const playerBadge = document.getElementById('playerBadge');
const enemyBadge = document.getElementById('enemyBadge');
const playerSpriteBox = document.getElementById('playerSpriteBox');
const enemySpriteBox = document.getElementById('enemySpriteBox');

const statusText = document.getElementById('statusText');
const intentBox = document.getElementById('intentBox');
const intentText = document.getElementById('intentText');

const btnDefend = document.getElementById('btnDefend');
const btnTsuki = document.getElementById('btnTsuki');

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
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.01);

    if (type === 'attack') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.18);
    } else if (type === 'special') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(320, now + 0.28);
        osc2.frequency.setValueAtTime(600, now);
        osc2.frequency.exponentialRampToValueAtTime(160, now + 0.28);
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);
    } else if (type === 'break') {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.24);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'block') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(420, now);
        osc1.frequency.exponentialRampToValueAtTime(660, now + 0.18);
        osc2.frequency.setValueAtTime(840, now);
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.2);
        osc2.stop(now + 0.2);
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
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            osc.connect(gain);
            osc.start(now + idx * 0.06);
            osc.stop(now + 0.25 + idx * 0.06);
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

    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
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

    if (!sprite.complete || sprite.naturalWidth === 0) {
        drawPlaceholder(ctx, '読込中...');
        return;
    }

    const def = spriteDefinition[animState];
    if (!def) {
        drawPlaceholder(ctx, '?');
        return;
    }

    const srcX = def.x;
    const srcY = def.y;
    const srcWidth = def.w;
    const srcHeight = def.h;

    const spriteAspect = srcWidth / srcHeight;
    const canvasAspect = ctx.canvas.width / ctx.canvas.height;

    let drawWidth, drawHeight;
    if (spriteAspect > canvasAspect) {
        drawWidth = ctx.canvas.width;
        drawHeight = ctx.canvas.width / spriteAspect;
    } else {
        drawHeight = ctx.canvas.height;
        drawWidth = ctx.canvas.height * spriteAspect;
    }

    const drawX = (ctx.canvas.width - drawWidth) / 2;
    const drawY = (ctx.canvas.height - drawHeight) / 2;

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

function triggerShake(element) {
    element.classList.remove('hit-shake');
    void element.offsetWidth;
    element.classList.add('hit-shake');
}

function gainKiai(who, amount) {
    if (who === 'player') {
        state.playerKiai = Math.min(MAX_KIAI, state.playerKiai + amount);
    } else {
        state.enemyKiai = Math.min(MAX_KIAI, state.enemyKiai + amount);
    }
}

function getNeutralAnim(who) {
    if (who === 'player') {
        if (state.playerGuardBroken) return 'breakAttack';
        if (state.playerCounterReady || state.playerKiai >= MAX_KIAI) return 'counterReady';
        return 'idle';
    } else {
        if (state.enemyGuardBroken) return 'breakAttack';
        if (state.enemyCounterReady || state.enemyKiai >= MAX_KIAI) return 'counterReady';
        return 'idle';
    }
}

function renderPips(container, count) {
    const pips = container.querySelectorAll('.kiai-pip');
    pips.forEach((pip, idx) => {
        pip.classList.toggle('filled', idx < count);
        pip.classList.toggle('max-glow', count >= MAX_KIAI);
    });
}

function updateBadge(badgeEl, spriteBoxEl, counterReady, guardBroken, kiai) {
    badgeEl.className = 'stance-badge';
    spriteBoxEl.classList.remove('counter-aura', 'broken-aura');

    if (guardBroken) {
        badgeEl.textContent = '💫 体勢崩れ (防御不可)';
        badgeEl.classList.add('broken');
        spriteBoxEl.classList.add('broken-aura');
    } else if (counterReady) {
        badgeEl.textContent = '🔥 応じ技構え (次打2倍)';
        badgeEl.classList.add('counter');
        spriteBoxEl.classList.add('counter-aura');
    } else if (kiai >= MAX_KIAI) {
        badgeEl.textContent = '⚡ 気合最高潮 (突き可)';
        badgeEl.classList.add('max-kiai');
    } else {
        badgeEl.textContent = '中段の構え';
    }
}

function updateUI() {
    const pHp = Math.max(0, state.playerHealth);
    const eHp = Math.max(0, state.enemyHealth);
    const playerPct = (pHp / MAX_HEALTH) * 100;
    const enemyPct = (eHp / MAX_HEALTH) * 100;

    playerHealthBar.style.width = `${playerPct}%`;
    enemyHealthBar.style.width = `${enemyPct}%`;
    playerHealthBar.classList.toggle('low', pHp <= 2);
    enemyHealthBar.classList.toggle('low', eHp <= 2);

    playerHealthText.textContent = `体力: ${pHp} / ${MAX_HEALTH}`;
    enemyHealthText.textContent = `体力: ${eHp} / ${MAX_HEALTH}`;

    playerKiaiText.textContent = `気合: ${state.playerKiai} / ${MAX_KIAI}`;
    enemyKiaiText.textContent = `気合: ${state.enemyKiai} / ${MAX_KIAI}`;
    renderPips(playerKiaiPips, state.playerKiai);
    renderPips(enemyKiaiPips, state.enemyKiai);

    updateBadge(playerBadge, playerSpriteBox, state.playerCounterReady, state.playerGuardBroken, state.playerKiai);
    updateBadge(enemyBadge, enemySpriteBox, state.enemyCounterReady, state.enemyGuardBroken, state.enemyKiai);

    // ボタンの有効・無効制御
    btnDefend.disabled = state.playerGuardBroken && !state.gameOver;
    btnDefend.textContent = state.playerGuardBroken ? '🛡️ 防御 (崩れ中)' : '🛡️ 防御';

    btnTsuki.disabled = state.playerKiai < MAX_KIAI || state.gameOver;
    btnTsuki.textContent = state.playerKiai >= MAX_KIAI ? '⚡ 突き (発動可！)' : `⚡ 突き (${state.playerKiai}/${MAX_KIAI})`;
}

function updateStatus(message, type = 'neutral') {
    statusText.textContent = message;
    statusText.className = `status-text ${type}`;
}

// 敵AIの次ターンの気配（思考傾向）を決定
function decideEnemyIntent() {
    if (state.gameOver) {
        intentBox.className = 'intent-box';
        intentText.textContent = '「🔄 もう一度」または任意の技ボタンで再戦できます。';
        return;
    }

    let intent;
    if (state.enemyKiai >= MAX_KIAI) {
        intent = {
            hint: '⚠️ 相手の気合が最高潮だ！必殺の「突き」か、守りを割る「崩し」が来るぞ！',
            isDanger: true,
            weights: { 突き: 55, 崩し: 15, 面: 15, 小手: 15, 胴: 0, 防御: 0 },
        };
    } else if (state.enemyCounterReady) {
        intent = {
            hint: '🔥 相手は「応じ技」の構え！強烈な「面」か「胴」で一気に打ち込んでくる気配！',
            isDanger: true,
            weights: { 面: 45, 胴: 35, 小手: 15, 崩し: 5, 防御: 0, 突き: 0 },
        };
    } else if ((state.playerCounterReady || state.playerKiai >= MAX_KIAI) && !state.enemyGuardBroken) {
        if (Math.random() < 0.65) {
            intent = {
                hint: '🛡️ 相手はあなたの攻めを警戒し、守りを固めつつ「小手」を狙っている…（「崩し」や「面」の好機！）',
                isDanger: false,
                weights: { 防御: 50, 小手: 30, 面: 10, 胴: 10, 崩し: 0, 突き: 0 },
            };
        } else {
            intent = {
                hint: '👁️ 相手は先手を取ろうと、出端の「小手」や「崩し」を狙っている…',
                isDanger: false,
                weights: { 小手: 45, 崩し: 30, 胴: 15, 面: 10, 防御: 0, 突き: 0 },
            };
        }
    } else {
        const patterns = [
            {
                hint: '🔥 相手は前のめりに「面」や「小手」を狙っている！（「胴」の抜き技や「防御」から応じ技の好機）',
                isDanger: false,
                weights: { 面: 50, 小手: 25, 胴: 15, 防御: 10, 崩し: 0, 突き: 0 },
            },
            {
                hint: '🛡️ 相手は慎重に間合いを測り、守りからの「小手」を狙っている…（「崩し」や「面」の好機！）',
                isDanger: false,
                weights: { 防御: 48, 小手: 27, 胴: 15, 面: 10, 崩し: 0, 突き: 0 },
            },
            {
                hint: '💥 相手は間合いを詰め、あなたの守りを「崩し」か「胴」で割ろうとしている！（打突で迎撃せよ）',
                isDanger: false,
                weights: { 崩し: 45, 胴: 30, 面: 15, 小手: 10, 防御: 0, 突き: 0 },
            },
            {
                hint: '⚔️ 相手は竹刀を低く構え、「胴」や「面」を狙っている…（「小手」や「防御」が有効）',
                isDanger: false,
                weights: { 胴: 45, 面: 30, 防御: 15, 小手: 10, 崩し: 0, 突き: 0 },
            },
        ];
        intent = patterns[Math.floor(Math.random() * patterns.length)];
    }

    // 相手が体勢崩れ中の場合は「防御」を選ばない
    if (state.enemyGuardBroken && intent.weights['防御'] > 0) {
        intent.weights = { ...intent.weights, 小手: intent.weights['小手'] + intent.weights['防御'], 防御: 0 };
        intent.hint = '💫 相手は体勢が崩れて防御できない！一気に攻め込む好機だ！';
    }

    state.enemyIntent = intent;
    intentBox.className = intent.isDanger ? 'intent-box danger' : 'intent-box';
    intentText.textContent = intent.hint;
}

function chooseEnemyAction() {
    if (!state.enemyIntent) {
        decideEnemyIntent();
    }
    const weights = state.enemyIntent.weights;
    const entries = Object.entries(weights).filter(([, w]) => w > 0);
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let r = Math.random() * total;
    for (const [act, w] of entries) {
        if (r < w) return act;
        r -= w;
    }
    return entries[0][0];
}

function getActionAnim(action) {
    if (action === '面') return 'attack1';
    if (action === '小手') return 'attack2';
    if (action === '胴' || action === '突き') return 'attack3';
    if (action === '防御') return 'defend';
    if (action === '崩し') return 'breakAttack';
    return 'idle';
}

function playRound(playerAction) {
    if (state.gameOver) {
        resetGame();
        return;
    }

    if (playerAction === '防御' && state.playerGuardBroken) {
        return;
    }
    if (playerAction === '突き' && state.playerKiai < MAX_KIAI) {
        return;
    }

    if (state.animResetTimer) {
        clearTimeout(state.animResetTimer);
        state.animResetTimer = null;
    }

    const enemyAction = chooseEnemyAction();
    state.round += 1;

    // このターン開始時点の応じ技バフを保持し、消費する
    const pCounter = state.playerCounterReady;
    const eCounter = state.enemyCounterReady;
    state.playerCounterReady = false;
    state.enemyCounterReady = false;
    state.playerGuardBroken = false;
    state.enemyGuardBroken = false;

    if (playerAction === '突き') state.playerKiai = 0;
    if (enemyAction === '突き') state.enemyKiai = 0;

    let message = `第${state.round}合: あなた【${playerAction}】 vs 相手【${enemyAction}】 — `;
    let statusType = 'neutral';
    let playerAnim = getActionAnim(playerAction);
    let enemyAnim = getActionAnim(enemyAction);

    const attackMap = {
        面: ['小手'],
        小手: ['胴'],
        胴: ['面'],
    };
    const isBasic = (act) => act === '面' || act === '小手' || act === '胴';

    // 1. 必殺技「突き」の判定
    if (playerAction === '突き' && enemyAction === '突き') {
        state.playerHealth -= 1;
        state.enemyHealth -= 1;
        playerAnim = 'hit';
        enemyAnim = 'hit';
        message += '⚡ 互いに渾身の「突き」が交錯！双方に1ダメージ！';
        statusType = 'defeat';
        playSound('special');
        triggerShake(playerSpriteBox);
        triggerShake(enemySpriteBox);
    } else if (playerAction === '突き') {
        state.enemyHealth -= 2;
        enemyAnim = 'hit';
        if (enemyAction === '防御') {
            message += '⚡ 会心の諸手突き！！相手の防御を貫通し、大ダメージ（2点）！';
        } else {
            message += `⚡ 電光石火の諸手突き！！相手の「${enemyAction}」を圧倒し、大ダメージ（2点）！`;
        }
        statusType = 'victory';
        playSound('special');
        triggerShake(enemySpriteBox);
    } else if (enemyAction === '突き') {
        state.playerHealth -= 2;
        playerAnim = 'hit';
        message += '⚡ 相手の必殺「突き」が防具を貫いた！！痛恨の2ダメージ！';
        statusType = 'defeat';
        playSound('hurt');
        triggerShake(playerSpriteBox);
    }
    // 2. 防御 vs 防御
    else if (playerAction === '防御' && enemyAction === '防御') {
        message += '互いに守りを固め、静かに間合いを測り合っています。';
        statusType = 'neutral';
    }
    // 3. 防御 vs 崩し（ガードブレイク）
    else if (playerAction === '崩し' && enemyAction === '防御') {
        state.enemyHealth -= 1;
        gainKiai('player', 1);
        state.enemyGuardBroken = true;
        enemyAnim = 'hit';
        message += '💥 崩し成功！相手の防御を体当たりで突き崩し1ダメージ＆相手は次ターン防御不可！';
        statusType = 'victory';
        playSound('break');
        triggerShake(enemySpriteBox);
    } else if (playerAction === '防御' && enemyAction === '崩し') {
        state.playerHealth -= 1;
        gainKiai('enemy', 1);
        state.playerGuardBroken = true;
        playerAnim = 'hit';
        message += '💥 相手の「崩し」で防御を割られた！1ダメージ＆次ターン防御不可！';
        statusType = 'defeat';
        playSound('break');
        triggerShake(playerSpriteBox);
    }
    // 4. 防御 vs 基本打突（応じ技準備！）
    else if (playerAction === '防御' && isBasic(enemyAction)) {
        gainKiai('player', 1);
        state.playerCounterReady = true;
        message += `🛡️ 相手の「${enemyAction}」を見事に受け止めた！気合+1＆次ターン「🔥応じ技（威力2倍）」チャンス！`;
        statusType = 'victory';
        playSound('block');
    } else if (isBasic(playerAction) && enemyAction === '防御') {
        gainKiai('enemy', 1);
        state.enemyCounterReady = true;
        message += `🛡️ 相手に「${playerAction}」を受け止められた！相手が「🔥応じ技」の構えに入った！`;
        statusType = 'neutral';
        playSound('block');
    }
    // 5. 崩し vs 崩し（鍔迫り合い）
    else if (playerAction === '崩し' && enemyAction === '崩し') {
        gainKiai('player', 1);
        gainKiai('enemy', 1);
        message += '💥 激しい鍔迫り合い！互いに一歩も引かず気合が高まる！（双方 気合+1）';
        statusType = 'neutral';
        playSound('clash');
    }
    // 6. 崩し vs 基本打突（打突側が迎撃）
    else if (isBasic(playerAction) && enemyAction === '崩し') {
        const dmg = pCounter ? 2 : 1;
        state.enemyHealth -= dmg;
        gainKiai('player', 1);
        enemyAnim = 'hit';
        message += pCounter
            ? `🔥 応じ技炸裂！相手の「崩し」の出端に強烈な「${playerAction}」が決まり ${dmg}ダメージ！`
            : `⚔️ 相手の「崩し」の出端を「${playerAction}」で迎撃！ 1ダメージ＆気合+1！`;
        statusType = 'victory';
        playSound(pCounter ? 'special' : 'attack');
        triggerShake(enemySpriteBox);
    } else if (playerAction === '崩し' && isBasic(enemyAction)) {
        const dmg = eCounter ? 2 : 1;
        state.playerHealth -= dmg;
        gainKiai('enemy', 1);
        playerAnim = 'hit';
        message += eCounter
            ? `相手の応じ技「${enemyAction}」に出端を挫かれた！痛恨の ${dmg}ダメージ！`
            : `「崩し」に踏み込んだところへ相手の「${enemyAction}」を合わせられた！ 1ダメージ！`;
        statusType = 'defeat';
        playSound('hurt');
        triggerShake(playerSpriteBox);
    }
    // 7. 基本打突 vs 基本打突（三すくみ＆応じ技判定）
    else if (playerAction === enemyAction) {
        if (pCounter && !eCounter) {
            state.enemyHealth -= 2;
            gainKiai('player', 1);
            enemyAnim = 'hit';
            message += `🔥 応じ技の冴え！同じ「${playerAction}」の打ち合いを制し、2ダメージ奪った！`;
            statusType = 'victory';
            playSound('special');
            triggerShake(enemySpriteBox);
        } else if (eCounter && !pCounter) {
            state.playerHealth -= 2;
            gainKiai('enemy', 1);
            playerAnim = 'hit';
            message += `相手の応じ技「${enemyAction}」に打ち負けた！ 2ダメージ！`;
            statusType = 'defeat';
            playSound('hurt');
            triggerShake(playerSpriteBox);
        } else {
            state.playerHealth -= 1;
            state.enemyHealth -= 1;
            gainKiai('player', 1);
            gainKiai('enemy', 1);
            message += `⚔️ 相打ち！互いに「${playerAction}」を打ち合い、双方に1ダメージ＆気合+1！`;
            statusType = 'defeat';
            playSound('clash');
            triggerShake(playerSpriteBox);
            triggerShake(enemySpriteBox);
        }
    } else {
        const isValid = attackMap[playerAction].includes(enemyAction);
        if (isValid) {
            const dmg = pCounter ? 2 : 1;
            state.enemyHealth -= dmg;
            gainKiai('player', 1);
            enemyAnim = 'hit';
            message += pCounter
                ? `🔥 応じ技「${playerAction}」が一閃！！ 2ダメージの有効打突！`
                : `⚔️ 鮮やかな「${playerAction}」が決まりました！ 1ダメージ＆気合+1！`;
            statusType = 'victory';
            playSound(pCounter ? 'special' : 'attack');
            triggerShake(enemySpriteBox);
        } else {
            const dmg = eCounter ? 2 : 1;
            state.playerHealth -= dmg;
            gainKiai('enemy', 1);
            playerAnim = 'hit';
            message += eCounter
                ? `相手の強烈な応じ技「${enemyAction}」を浴びた！ 2ダメージ！`
                : `相手の「${enemyAction}」があなたに決まりました！ 1ダメージ！`;
            statusType = 'defeat';
            playSound('hurt');
            triggerShake(playerSpriteBox);
        }
    }

    state.playerAnimState = playerAnim;
    state.enemyAnimState = enemyAnim;

    // 勝敗判定
    if (state.playerHealth <= 0 && state.enemyHealth <= 0) {
        state.playerAnimState = 'hit';
        state.enemyAnimState = 'hit';
        state.gameOver = true;
        playSound('lose');
        updateStatus(`引き分け（相打ち決着）！第${state.round}合で双方が倒れました。`, 'neutral');
    } else if (state.playerHealth <= 0) {
        state.playerAnimState = 'hit';
        state.enemyAnimState = 'victory';
        state.gameOver = true;
        playSound('lose');
        updateStatus(`敗北… 第${state.round}合で倒されました。（${message}）`, 'defeat');
    } else if (state.enemyHealth <= 0) {
        state.playerAnimState = 'victory';
        state.enemyAnimState = 'hit';
        state.gameOver = true;
        playSound('win');
        updateStatus(`🏆 勝負あり！勝利！！第${state.round}合で相手を倒しました！（${message}）`, 'victory');
    } else {
        updateStatus(message, statusType);
        state.animResetTimer = setTimeout(() => {
            state.playerAnimState = getNeutralAnim('player');
            state.enemyAnimState = getNeutralAnim('enemy');
        }, 950);
    }

    updateUI();
    decideEnemyIntent();
}

function resetGame() {
    if (state.animResetTimer) {
        clearTimeout(state.animResetTimer);
        state.animResetTimer = null;
    }
    state.playerHealth = MAX_HEALTH;
    state.enemyHealth = MAX_HEALTH;
    state.playerKiai = 0;
    state.enemyKiai = 0;
    state.playerCounterReady = false;
    state.enemyCounterReady = false;
    state.playerGuardBroken = false;
    state.enemyGuardBroken = false;
    state.round = 0;
    state.gameOver = false;
    state.playerAnimState = 'idle';
    state.enemyAnimState = 'idle';

    updateUI();
    updateStatus('試合開始！相手の気配を読み、技を選んでください。', 'neutral');
    decideEnemyIntent();
}

function animationLoop() {
    drawSprite(playerCtx, state.playerAnimState, false);
    drawSprite(enemyCtx, state.enemyAnimState, true);
    requestAnimationFrame(animationLoop);
}

// 初期化
resetGame();
animationLoop();
