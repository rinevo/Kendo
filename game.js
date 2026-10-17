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
    idle:         { x: 0,           y: 0,       w: FRAME_W, h: FRAME_H, footX: 125, footY: 373 }, // 待機（中段の構え）
    counterReady: { x: FRAME_W,     y: 0,       w: FRAME_W, h: FRAME_H, footX: 142, footY: 372 }, // 応じ技構え・気合充実
    defend:       { x: FRAME_W * 2, y: 0,       w: FRAME_W, h: FRAME_H, footX: 134, footY: 374 }, // 防御・上段受け
    breakAttack:  { x: FRAME_W * 3, y: 0,       w: FRAME_W, h: FRAME_H, footX: 130, footY: 373 }, // 崩し・下段／体勢崩れ
    attack2:      { x: 0,           y: FRAME_H, w: FRAME_W, h: FRAME_H, footX: 143, footY: 374 }, // 小手打ち
    attack1:      { x: FRAME_W,     y: FRAME_H, w: FRAME_W, h: FRAME_H, footX: 146, footY: 374 }, // 面打ち
    attack3:      { x: FRAME_W * 2, y: FRAME_H, w: FRAME_W, h: FRAME_H, footX: 142, footY: 373 }, // 胴打ち・諸手突き
    hit:          { x: FRAME_W * 3, y: FRAME_H, w: FRAME_W, h: FRAME_H, footX: 177, footY: 374 }, // 被ダメージ
    victory:      { x: FRAME_W * 2, y: 0,       w: FRAME_W, h: FRAME_H, footX: 134, footY: 374 }, // 勝利
};

const playerCanvas = document.getElementById('playerCanvas');
const enemyCanvas = document.getElementById('enemyCanvas');
const CANVAS_W = 182;
const CANVAS_H = 200;
const GROUND_Y = 178; // 足裏が接地する道場の床ライン

function setupSmoothCanvas(canvas) {
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx.scale) ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    return ctx;
}

const playerCtx = setupSmoothCanvas(playerCanvas);
const enemyCtx = setupSmoothCanvas(enemyCanvas);

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

// イージング関数
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function lerp(a, b, t) { return a + (b - a) * t; }

// 各ファイター用の滑らかアニメーター状態（posYは常に0で足裏を床に固定）
function createAnimator(phaseOffset = 0) {
    return {
        phaseOffset,
        keyframes: null,
        seqStartTime: 0,
        lastKeyIndex: -1,
        currentSprite: 'idle',
        prevSprite: 'idle',
        spriteBlendStart: 0,
        posX: 0,
        posY: 0,
        scaleX: 1,
        scaleY: 1,
        rot: 0,
        particles: [],
        afterimages: [],
        slashEffect: null,
        hitFlash: 0,
    };
}

const animators = {
    player: createAnimator(0),
    enemy: createAnimator(1.8),
};

function setSpriteWithFade(anim, nextSprite, now) {
    if (anim.currentSprite !== nextSprite) {
        anim.prevSprite = anim.currentSprite;
        anim.currentSprite = nextSprite;
        anim.spriteBlendStart = now;
    }
}

function spawnDust(anim, x, y, dir) {
    for (let i = 0; i < 6; i++) {
        anim.particles.push({
            kind: 'dust',
            x: x + (Math.random() - 0.5) * 18,
            y: y - Math.random() * 3,
            vx: -dir * (0.7 + Math.random() * 1.6),
            vy: -(0.15 + Math.random() * 0.6),
            r: 3.5 + Math.random() * 5,
            alpha: 0.5,
            decay: 0.024 + Math.random() * 0.015,
            color: '203, 213, 225',
        });
    }
}

function spawnSparks(anim, x, y, color = '251, 191, 36') {
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.2;
        anim.particles.push({
            kind: 'spark',
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.8,
            r: 2 + Math.random() * 2.5,
            alpha: 1,
            decay: 0.035 + Math.random() * 0.02,
            color,
        });
    }
}

// アクションごとのマルチフレーム・キーフレーム定義（yはすべて0で足裏を常時床に接地）
function buildActionKeyframes(action, outcome, neutralSprite) {
    const windupSprite = action === '胴' ? 'defend' : (action === '突き' ? 'breakAttack' : 'counterReady');

    // 被ダメージ時は予備動作の直後に相手の一撃を受けて後退（すり足ノックバック）
    if (outcome === 'hit') {
        return [
            { t: 0,   sprite: 'idle',         x: 0,   y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
            { t: 130, sprite: windupSprite,   x: 5,   y: 0, scaleX: 1.03, scaleY: 0.97, rot: 0.03,  ease: easeOutCubic },
            { t: 190, sprite: 'hit',          x: -18, y: 0, scaleX: 0.95, scaleY: 1.04, rot: -0.10, ease: easeOutCubic, fx: 'sparks', flash: 0.65 },
            { t: 380, sprite: 'hit',          x: -22, y: 0, scaleX: 1.05, scaleY: 0.95, rot: -0.07, ease: easeInOutQuad, fx: 'dust' },
            { t: 660, sprite: 'breakAttack',  x: -8,  y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.02, ease: easeInOutQuad },
            { t: 940, sprite: neutralSprite,  x: 0,   y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
        ];
    }

    if (action === '面') {
        return [
            { t: 0,   sprite: 'idle',         x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
            { t: 85,  sprite: 'counterReady', x: -5, y: 0, scaleX: 1.04, scaleY: 0.96, rot: -0.04, ease: easeInOutQuad },
            { t: 175, sprite: 'defend',       x: -8, y: 0, scaleX: 0.96, scaleY: 1.04, rot: -0.06, ease: easeOutCubic },
            { t: 265, sprite: 'attack1',      x: 20, y: 0, scaleX: 1.08, scaleY: 0.95, rot: 0.07,  ease: easeOutCubic, fx: 'lunge_men' },
            { t: 480, sprite: 'attack1',      x: 16, y: 0, scaleX: 1.03, scaleY: 0.98, rot: 0.04,  ease: easeInOutQuad },
            { t: 700, sprite: 'breakAttack',  x: 7,  y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutQuad },
            { t: 940, sprite: neutralSprite,  x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
        ];
    }

    if (action === '小手') {
        return [
            { t: 0,   sprite: 'idle',         x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
            { t: 100, sprite: 'counterReady', x: -5, y: 0, scaleX: 1.03, scaleY: 0.96, rot: -0.04, ease: easeOutCubic },
            { t: 205, sprite: 'attack2',      x: 19, y: 0, scaleX: 1.07, scaleY: 0.95, rot: 0.06,  ease: easeOutCubic, fx: 'lunge_kote' },
            { t: 450, sprite: 'attack2',      x: 14, y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.03,  ease: easeInOutQuad },
            { t: 710, sprite: 'counterReady', x: 5,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0.01,  ease: easeInOutQuad },
            { t: 940, sprite: neutralSprite,  x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
        ];
    }

    if (action === '胴') {
        return [
            { t: 0,   sprite: 'idle',         x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
            { t: 100, sprite: 'defend',       x: -7, y: 0, scaleX: 0.96, scaleY: 1.04, rot: -0.05, ease: easeInOutQuad },
            { t: 195, sprite: 'breakAttack',  x: 6,  y: 0, scaleX: 1.06, scaleY: 0.93, rot: 0.03,  ease: easeOutCubic, fx: 'dust' },
            { t: 280, sprite: 'attack3',      x: 22, y: 0, scaleX: 1.09, scaleY: 0.94, rot: 0.08,  ease: easeOutCubic, fx: 'lunge_do' },
            { t: 520, sprite: 'attack3',      x: 17, y: 0, scaleX: 1.03, scaleY: 0.98, rot: 0.04,  ease: easeInOutQuad },
            { t: 940, sprite: neutralSprite,  x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
        ];
    }

    if (action === '突き') {
        return [
            { t: 0,   sprite: 'counterReady', x: 0,   y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
            { t: 115, sprite: 'breakAttack',  x: -12, y: 0, scaleX: 1.08, scaleY: 0.91, rot: -0.05, ease: easeOutCubic, fx: 'dust' },
            { t: 210, sprite: 'attack3',      x: 26,  y: 0, scaleX: 1.14, scaleY: 0.92, rot: 0.09,  ease: easeOutCubic, fx: 'lunge_tsuki' },
            { t: 520, sprite: 'attack3',      x: 20,  y: 0, scaleX: 1.05, scaleY: 0.97, rot: 0.04,  ease: easeInOutQuad },
            { t: 750, sprite: 'counterReady', x: 8,   y: 0, scaleX: 1.01, scaleY: 1.0,  rot: 0.01,  ease: easeInOutQuad },
            { t: 940, sprite: neutralSprite,  x: 0,   y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
        ];
    }

    if (action === '崩し') {
        return [
            { t: 0,   sprite: 'idle',         x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
            { t: 100, sprite: 'counterReady', x: -6, y: 0, scaleX: 1.05, scaleY: 0.94, rot: -0.03, ease: easeOutCubic },
            { t: 215, sprite: 'breakAttack',  x: 20, y: 0, scaleX: 1.11, scaleY: 0.92, rot: 0.08,  ease: easeOutCubic, fx: 'lunge_break' },
            { t: 490, sprite: 'breakAttack',  x: 14, y: 0, scaleX: 1.04, scaleY: 0.97, rot: 0.04,  ease: easeInOutQuad },
            { t: 940, sprite: neutralSprite,  x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
        ];
    }

    // 防御
    return [
        { t: 0,   sprite: 'idle',         x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
        { t: 95,  sprite: 'counterReady', x: -3, y: 0, scaleX: 1.03, scaleY: 0.97, rot: -0.02, ease: easeOutCubic },
        { t: 195, sprite: 'defend',       x: -6, y: 0, scaleX: 1.05, scaleY: 0.95, rot: -0.04, ease: easeOutCubic, fx: outcome === 'block_success' ? 'shield_success' : 'shield' },
        { t: 540, sprite: 'defend',       x: -4, y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.02, ease: easeInOutQuad },
        { t: 940, sprite: neutralSprite,  x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutQuad },
    ];
}

function triggerFighterAnimation(who, action, outcome) {
    const anim = animators[who];
    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const neutral = getNeutralAnim(who);
    anim.keyframes = buildActionKeyframes(action, outcome, neutral);
    anim.seqStartTime = now;
    anim.lastKeyIndex = -1;
}

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
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, CANVAS_W / 2, CANVAS_H / 2);
}

// キャラクターの実際の足裏座標 (footX, footY) をローカル原点 (0, 0) として描画
function drawSingleSpriteFrame(ctx, spriteKey, alpha = 1) {
    const def = spriteDefinition[spriteKey] || spriteDefinition.idle;
    if (!def) return;

    const spriteAspect = def.w / def.h;
    const canvasAspect = CANVAS_W / CANVAS_H;

    let drawWidth, drawHeight;
    if (spriteAspect > canvasAspect) {
        drawWidth = CANVAS_W;
        drawHeight = CANVAS_W / spriteAspect;
    } else {
        drawHeight = CANVAS_H;
        drawWidth = CANVAS_H * spriteAspect;
    }

    const footX = def.footX !== undefined ? def.footX : 138;
    const footY = def.footY !== undefined ? def.footY : 373;

    // (0, 0) がちょうど足裏の中心・接地ラインになるようにオフセット
    const drawX = -(footX / def.w) * drawWidth;
    const drawY = -(footY / def.h) * drawHeight;

    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.drawImage(
        sprite,
        def.x, def.y, def.w, def.h,
        drawX, drawY,
        drawWidth, drawHeight
    );
    ctx.restore();
}

function drawDojoFloor(ctx) {
    ctx.save();
    const floorGrad = ctx.createLinearGradient(0, GROUND_Y - 2, 0, CANVAS_H);
    floorGrad.addColorStop(0, 'rgba(30, 41, 59, 0.85)');
    floorGrad.addColorStop(0.25, 'rgba(51, 65, 85, 0.92)');
    floorGrad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, GROUND_Y - 1, CANVAS_W, CANVAS_H - GROUND_Y + 1);

    // 床の境界ライン（巾木・床板の目地）
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y - 1);
    ctx.lineTo(CANVAS_W, GROUND_Y - 1);
    ctx.stroke();
    ctx.restore();
}

function drawSlashEffect(ctx, effect, now, flip) {
    if (!effect) return;
    const elapsed = now - effect.start;
    const progress = elapsed / effect.duration;
    if (progress >= 1) return;

    const alpha = Math.sin(progress * Math.PI);
    ctx.save();
    if (flip) {
        ctx.translate(CANVAS_W, 0);
        ctx.scale(-1, 1);
    }

    if (effect.type === 'men' || effect.type === 'kote') {
        const radius = effect.type === 'men' ? 68 : 48;
        const cy = effect.type === 'men' ? 92 : 116;
        const startAng = -1.2 + progress * 0.4;
        const endAng = startAng + 1.35;
        ctx.strokeStyle = `rgba(253, 224, 71, ${alpha * 0.9})`;
        ctx.lineWidth = (1 - progress * 0.5) * 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(96, cy, radius, startAng, endAng);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(96, cy, radius - 3, startAng + 0.1, endAng);
        ctx.stroke();
    } else if (effect.type === 'do') {
        const y = 118;
        const x1 = 45 + progress * 25;
        const x2 = 165;
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.9})`;
        ctx.lineWidth = (1 - progress * 0.4) * 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y + 8);
        ctx.quadraticCurveTo(110, y - 10, x2, y - 2);
        ctx.stroke();
    } else if (effect.type === 'tsuki') {
        const y = 100;
        const grad = ctx.createLinearGradient(40, y, 178, y);
        grad.addColorStop(0, `rgba(249, 115, 22, 0)`);
        grad.addColorStop(0.5, `rgba(250, 204, 21, ${alpha * 0.95})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(45, y - 8 * (1 - progress * 0.5));
        ctx.lineTo(178, y);
        ctx.lineTo(45, y + 8 * (1 - progress * 0.5));
        ctx.closePath();
        ctx.fill();
    } else if (effect.type === 'break') {
        const r = 18 + progress * 42;
        ctx.strokeStyle = `rgba(192, 132, 252, ${(1 - progress) * 0.85})`;
        ctx.lineWidth = 5 * (1 - progress);
        ctx.beginPath();
        ctx.arc(130, 114, r, -0.9, 0.9);
        ctx.stroke();
    } else if (effect.type === 'shield' || effect.type === 'shield_success') {
        const color = effect.type === 'shield_success' ? '251, 191, 36' : '56, 189, 248';
        const r = 34 + progress * 18;
        ctx.strokeStyle = `rgba(${color}, ${(1 - progress) * 0.85})`;
        ctx.lineWidth = 4 * (1 - progress * 0.4);
        ctx.beginPath();
        ctx.arc(110, 102, r, -1.1, 1.1);
        ctx.stroke();
    }

    ctx.restore();
}

function updateAndDrawFighter(ctx, who, flip, now) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawDojoFloor(ctx);

    if (!sprite.complete || sprite.naturalWidth === 0) {
        drawPlaceholder(ctx, '読込中...');
        return;
    }

    const anim = animators[who];
    const dir = flip ? -1 : 1;
    // 竹刀が前方に伸びる分を考慮し、足元の基準位置をやや後方に置くことで全体を中央に収める
    const baseFootX = CANVAS_W / 2 - dir * 18;
    const isCounter = who === 'player' ? state.playerCounterReady : state.enemyCounterReady;
    const kiai = who === 'player' ? state.playerKiai : state.enemyKiai;
    const defaultSprite = state.gameOver
        ? (who === 'player' ? state.playerAnimState : state.enemyAnimState)
        : getNeutralAnim(who);

    // 1. キーフレーム再生中か、待機モーション（呼吸・すり足）かを計算
    if (anim.keyframes && !state.gameOver) {
        const elapsed = Math.max(0, now - anim.seqStartTime);
        const kfs = anim.keyframes;
        const lastKf = kfs[kfs.length - 1];

        if (elapsed >= lastKf.t) {
            anim.keyframes = null;
            setSpriteWithFade(anim, defaultSprite, now);
            anim.posX = 0;
            anim.posY = 0;
            anim.scaleX = 1;
            anim.scaleY = 1;
            anim.rot = 0;
        } else {
            let idx = 0;
            for (let i = 0; i < kfs.length - 1; i++) {
                if (elapsed >= kfs[i].t && elapsed < kfs[i + 1].t) {
                    idx = i;
                    break;
                }
            }
            const k0 = kfs[idx];
            const k1 = kfs[idx + 1];
            const span = Math.max(1, k1.t - k0.t);
            const rawT = Math.min(1, Math.max(0, (elapsed - k0.t) / span));
            const easedT = k1.ease ? k1.ease(rawT) : rawT;

            // キーフレーム到達時のトリガー（エフェクト・残像・スプライト切替）
            if (idx !== anim.lastKeyIndex) {
                anim.lastKeyIndex = idx;
                setSpriteWithFade(anim, k1.sprite, now);

                if (k1.flash) anim.hitFlash = k1.flash;
                const fx = k1.fx;
                const currentFootX = baseFootX + dir * k1.x;
                if (fx === 'dust') {
                    spawnDust(anim, currentFootX, GROUND_Y, dir);
                } else if (fx === 'sparks') {
                    spawnSparks(anim, currentFootX + dir * 24, 96, '248, 113, 113');
                } else if (fx && fx.startsWith('lunge_')) {
                    const slashType = fx.replace('lunge_', '');
                    spawnDust(anim, currentFootX, GROUND_Y, dir);
                    anim.slashEffect = { type: slashType, start: now, duration: 260 };
                    if (slashType === 'tsuki' || isCounter) {
                        spawnSparks(anim, currentFootX + dir * 48, 100, '250, 204, 21');
                    }
                } else if (fx === 'shield' || fx === 'shield_success') {
                    anim.slashEffect = { type: fx, start: now, duration: 320 };
                    if (fx === 'shield_success') {
                        spawnSparks(anim, currentFootX + dir * 34, 98, '56, 189, 248');
                    }
                }
            }

            anim.posX = lerp(k0.x, k1.x, easedT);
            anim.posY = 0; // 足裏は常に地面（GROUND_Y）に固定
            anim.scaleX = lerp(k0.scaleX, k1.scaleX, easedT);
            anim.scaleY = lerp(k0.scaleY, k1.scaleY, easedT);
            anim.rot = lerp(k0.rot, k1.rot, easedT);

            // 高速踏み込み中は残像を追加
            if (Math.abs(anim.posX) > 12 && Math.random() < 0.45) {
                anim.afterimages.push({
                    sprite: anim.currentSprite,
                    posX: anim.posX,
                    scaleX: anim.scaleX,
                    scaleY: anim.scaleY,
                    rot: anim.rot,
                    alpha: 0.26,
                });
            }
        }
    } else {
        // 待機中（または決着後）の滑らかな呼吸・すり足アニメーション（足裏は常にGROUND_Yに接地）
        setSpriteWithFade(anim, defaultSprite, now);
        const t = now * 0.0042 + anim.phaseOffset;
        anim.posY = 0;

        if (state.gameOver && defaultSprite === 'hit') {
            anim.posX = lerp(anim.posX, -14, 0.1);
            anim.scaleX = lerp(anim.scaleX, 1.03, 0.1);
            anim.scaleY = lerp(anim.scaleY, 0.96, 0.1);
            anim.rot = lerp(anim.rot, -0.06, 0.1);
        } else {
            const speedMult = (isCounter || kiai >= MAX_KIAI) ? 1.45 : 1.0;
            const suriashiX = Math.sin(t * 0.55 * speedMult) * 3.0;
            const breathScaleY = 1 + Math.sin(t * speedMult) * 0.015;
            const breathScaleX = 1 - Math.sin(t * speedMult) * 0.009;
            const gentleLean = Math.sin(t * 0.55 * speedMult) * 0.014;

            anim.posX = lerp(anim.posX, suriashiX, 0.15);
            anim.scaleX = lerp(anim.scaleX, breathScaleX, 0.15);
            anim.scaleY = lerp(anim.scaleY, breathScaleY, 0.15);
            anim.rot = lerp(anim.rot, gentleLean, 0.15);
        }
    }

    const pivotX = baseFootX + dir * anim.posX;
    const pivotY = GROUND_Y;

    // 応じ技構え・気合MAX時のオーラ粒子生成（足元から立ち昇る）
    if (!state.gameOver && (isCounter || kiai >= MAX_KIAI) && Math.random() < 0.25) {
        anim.particles.push({
            kind: 'aura',
            x: pivotX + (Math.random() - 0.5) * 56,
            y: GROUND_Y - Math.random() * 24,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(0.8 + Math.random() * 1.2),
            r: 2.5 + Math.random() * 3.5,
            alpha: 0.65,
            decay: 0.018,
            color: isCounter ? '249, 115, 22' : '250, 204, 21',
        });
    }

    // 2. 足裏直下の接地シャドウ（コンタクトシャドウ）描画
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.beginPath();
    ctx.ellipse(pivotX, pivotY + 1, 38 * anim.scaleX, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
    ctx.beginPath();
    ctx.ellipse(pivotX, pivotY, 26 * anim.scaleX, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. 残像（アフターイメージ）の描画
    for (let i = anim.afterimages.length - 1; i >= 0; i--) {
        const img = anim.afterimages[i];
        img.alpha -= 0.045;
        if (img.alpha <= 0) {
            anim.afterimages.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.translate(baseFootX + dir * img.posX, pivotY);
        if (flip) ctx.scale(-1, 1);
        ctx.rotate(img.rot);
        ctx.scale(img.scaleX, img.scaleY);
        drawSingleSpriteFrame(ctx, img.sprite, img.alpha);
        ctx.restore();
    }

    // 4. キャラクター本体の描画（足裏ピボット原点＆コマ間のクロスフェード補間）
    const blendDuration = 70;
    const blendElapsed = now - anim.spriteBlendStart;
    const blendT = Math.min(1, Math.max(0, blendElapsed / blendDuration));

    ctx.save();
    ctx.translate(pivotX, pivotY);
    if (flip) ctx.scale(-1, 1);
    ctx.rotate(anim.rot);
    ctx.scale(anim.scaleX, anim.scaleY);

    if (blendT < 1 && anim.prevSprite && anim.prevSprite !== anim.currentSprite) {
        drawSingleSpriteFrame(ctx, anim.prevSprite, 1 - blendT);
        drawSingleSpriteFrame(ctx, anim.currentSprite, blendT);
    } else {
        drawSingleSpriteFrame(ctx, anim.currentSprite, 1);
    }
    ctx.restore();

    // 5. 斬撃軌跡・防御シールドの描画
    if (anim.slashEffect) {
        drawSlashEffect(ctx, anim.slashEffect, now, flip);
        if (now - anim.slashEffect.start >= anim.slashEffect.duration) {
            anim.slashEffect = null;
        }
    }

    // 6. パーティクル（砂煙・火花・気合オーラ）の描画
    for (let i = anim.particles.length - 1; i >= 0; i--) {
        const p = anim.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.kind === 'dust') p.r += 0.15;
        if (p.alpha <= 0) {
            anim.particles.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 7. 被弾時のフラッシュ演出
    if (anim.hitFlash > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(239, 68, 68, ${anim.hitFlash * 0.35})`;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.restore();
        anim.hitFlash *= 0.85;
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
    let playerOutcome = 'normal';
    let enemyOutcome = 'normal';

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
        playerOutcome = 'hit';
        enemyOutcome = 'hit';
        message += '⚡ 互いに渾身の「突き」が交錯！双方に1ダメージ！';
        statusType = 'defeat';
        playSound('special');
        triggerShake(playerSpriteBox);
        triggerShake(enemySpriteBox);
    } else if (playerAction === '突き') {
        state.enemyHealth -= 2;
        enemyAnim = 'hit';
        enemyOutcome = 'hit';
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
        playerOutcome = 'hit';
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
        enemyOutcome = 'hit';
        message += '💥 崩し成功！相手の防御を体当たりで突き崩し1ダメージ＆相手は次ターン防御不可！';
        statusType = 'victory';
        playSound('break');
        triggerShake(enemySpriteBox);
    } else if (playerAction === '防御' && enemyAction === '崩し') {
        state.playerHealth -= 1;
        gainKiai('enemy', 1);
        state.playerGuardBroken = true;
        playerAnim = 'hit';
        playerOutcome = 'hit';
        message += '💥 相手の「崩し」で防御を割られた！1ダメージ＆次ターン防御不可！';
        statusType = 'defeat';
        playSound('break');
        triggerShake(playerSpriteBox);
    }
    // 4. 防御 vs 基本打突（応じ技準備！）
    else if (playerAction === '防御' && isBasic(enemyAction)) {
        gainKiai('player', 1);
        state.playerCounterReady = true;
        playerOutcome = 'block_success';
        message += `🛡️ 相手の「${enemyAction}」を見事に受け止めた！気合+1＆次ターン「🔥応じ技（威力2倍）」チャンス！`;
        statusType = 'victory';
        playSound('block');
    } else if (isBasic(playerAction) && enemyAction === '防御') {
        gainKiai('enemy', 1);
        state.enemyCounterReady = true;
        enemyOutcome = 'block_success';
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
        enemyOutcome = 'hit';
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
        playerOutcome = 'hit';
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
            enemyOutcome = 'hit';
            message += `🔥 応じ技の冴え！同じ「${playerAction}」の打ち合いを制し、2ダメージ奪った！`;
            statusType = 'victory';
            playSound('special');
            triggerShake(enemySpriteBox);
        } else if (eCounter && !pCounter) {
            state.playerHealth -= 2;
            gainKiai('enemy', 1);
            playerAnim = 'hit';
            playerOutcome = 'hit';
            message += `相手の応じ技「${enemyAction}」に打ち負けた！ 2ダメージ！`;
            statusType = 'defeat';
            playSound('hurt');
            triggerShake(playerSpriteBox);
        } else {
            state.playerHealth -= 1;
            state.enemyHealth -= 1;
            gainKiai('player', 1);
            gainKiai('enemy', 1);
            playerOutcome = 'hit';
            enemyOutcome = 'hit';
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
            enemyOutcome = 'hit';
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
            playerOutcome = 'hit';
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

    // 連続キーフレームアニメーションを開始
    triggerFighterAnimation('player', playerAction, playerOutcome);
    triggerFighterAnimation('enemy', enemyAction, enemyOutcome);

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

    animators.player = createAnimator(0);
    animators.enemy = createAnimator(1.8);

    updateUI();
    updateStatus('試合開始！相手の気配を読み、技を選んでください。', 'neutral');
    decideEnemyIntent();
}

function animationLoop(timestamp) {
    const now = timestamp || ((typeof performance !== 'undefined') ? performance.now() : Date.now());
    updateAndDrawFighter(playerCtx, 'player', false, now);
    updateAndDrawFighter(enemyCtx, 'enemy', true, now);
    requestAnimationFrame(animationLoop);
}

// 初期化
resetGame();
animationLoop();
