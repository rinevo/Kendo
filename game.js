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

// スプライトシート (2304x2400: 288x300 のコマが 8列×8行 = 全64コマ)
const sprite = new Image();
sprite.src = "kendo.png";

const FRAME_W = 288;
const FRAME_H = 300;
const VIRTUAL_W = 384;
const VIRTUAL_H = 400;
const ANCHOR_FOOT_X = 138;
const ANCHOR_FOOT_Y = 374;

function makeCellDef(row, col, footX = ANCHOR_FOOT_X, footY = ANCHOR_FOOT_Y) {
    return {
        x: col * FRAME_W,
        y: row * FRAME_H,
        w: FRAME_W,
        h: FRAME_H,
        footX: Math.round(footX * (FRAME_W / VIRTUAL_W)),
        footY: Math.round(footY * (FRAME_H / VIRTUAL_H)),
    };
}

// 8列×8行（全64コマ）のスプライト定義＋従来のキー名互換マップ
const spriteDefinition = {
    idle:         makeCellDef(0, 0),
    counterReady: makeCellDef(1, 0),
    guardBroken:  makeCellDef(1, 4),
    defend:       makeCellDef(6, 1),
    breakAttack:  makeCellDef(6, 6),
    attack1:      makeCellDef(2, 6), // 面打ちインパクト
    attack2:      makeCellDef(3, 4), // 小手打ちインパクト
    attack3:      makeCellDef(4, 5), // 胴打ち・突きインパクト
    hit:          makeCellDef(7, 1), // 被ダメージ仰け反り
    victory:      makeCellDef(7, 7), // 勝利・残心
};

for (let c = 0; c < 8; c++) {
    spriteDefinition[`idle_${c}`] = makeCellDef(0, c);
    spriteDefinition[`men_${c}`]  = makeCellDef(2, c);
    spriteDefinition[`kote_${c}`] = makeCellDef(3, c);
    spriteDefinition[`do_${c}`]   = makeCellDef(4, c);
    spriteDefinition[`tsuki_${c}`] = makeCellDef(5, c);
}
for (let c = 0; c < 4; c++) {
    spriteDefinition[`counter_${c}`] = makeCellDef(1, c);
    spriteDefinition[`broken_${c}`]  = makeCellDef(1, c + 4);
    spriteDefinition[`def_${c}`]     = makeCellDef(6, c);
    spriteDefinition[`brk_${c}`]     = makeCellDef(6, c + 4);
}
for (let c = 0; c < 6; c++) {
    spriteDefinition[`hit_${c}`] = makeCellDef(7, c);
}
spriteDefinition.victory_0 = makeCellDef(7, 6);
spriteDefinition.victory_1 = makeCellDef(7, 7);

// 64コマと完全一致する骨格・布物理ポーズテーブル（8行×8列）
const POSE_ROWS = {
    men: [
        { hipX: 130, hipY: 262, backFootX: 94, backFootY: 374, backHeel: 8,  frontFootX: 168, frontFootY: 374, frontHeel: 0,  torsoLean: 0.04,  torsoTwist: 0,     headPitch: 0.02,  gripX: 162, gripY: 206, shinaiAngle: 52,  shinaiFlex: 0,   swingBlur: 0,    hakamaSway: -2,  tareSway: 0, mendareSway: 0 },
        { hipX: 128, hipY: 258, backFootX: 92, backFootY: 374, backHeel: 10, frontFootX: 170, frontFootY: 372, frontHeel: -2, torsoLean: -0.02, torsoTwist: 0,     headPitch: 0.06,  gripX: 156, gripY: 164, shinaiAngle: 92,  shinaiFlex: 0,   swingBlur: 0,    hakamaSway: -4,  tareSway: 0, mendareSway: 1 },
        { hipX: 126, hipY: 254, backFootX: 90, backFootY: 374, backHeel: 12, frontFootX: 174, frontFootY: 368, frontHeel: -5, torsoLean: -0.06, torsoTwist: 0,     headPitch: 0.10,  gripX: 148, gripY: 132, shinaiAngle: 126, shinaiFlex: -2,  swingBlur: 0,    hakamaSway: -6,  tareSway: -1, mendareSway: 3 },
        { hipX: 130, hipY: 256, backFootX: 88, backFootY: 374, backHeel: 15, frontFootX: 180, frontFootY: 365, frontHeel: -8, torsoLean: -0.05, torsoTwist: 0,     headPitch: 0.12,  gripX: 144, gripY: 124, shinaiAngle: 138, shinaiFlex: -5,  swingBlur: 0,    hakamaSway: -7,  tareSway: -1, mendareSway: 4 },
        { hipX: 144, hipY: 262, backFootX: 86, backFootY: 374, backHeel: 18, frontFootX: 192, frontFootY: 368, frontHeel: -3, torsoLean: 0.14,  torsoTwist: 0.05,  headPitch: 0.02,  gripX: 176, gripY: 148, shinaiAngle: 68,  shinaiFlex: -15, swingBlur: -1.0, hakamaSway: -10, tareSway: 2, mendareSway: 6 },
        { hipX: 154, hipY: 266, backFootX: 84, backFootY: 374, backHeel: 20, frontFootX: 200, frontFootY: 372, frontHeel: 0,  torsoLean: 0.20,  torsoTwist: 0.08,  headPitch: -0.02, gripX: 194, gripY: 176, shinaiAngle: 32,  shinaiFlex: -8,  swingBlur: -0.7, hakamaSway: -12, tareSway: 3, mendareSway: 5 },
        { hipX: 158, hipY: 268, backFootX: 82, backFootY: 374, backHeel: 22, frontFootX: 204, frontFootY: 374, frontHeel: 0,  torsoLean: 0.22,  torsoTwist: 0.10,  headPitch: -0.04, gripX: 202, gripY: 186, shinaiAngle: 17,  shinaiFlex: 6,   swingBlur: 0,    hakamaSway: -8,  tareSway: 4, mendareSway: 3 },
        { hipX: 146, hipY: 262, backFootX: 88, backFootY: 374, backHeel: 14, frontFootX: 188, frontFootY: 374, frontHeel: 0,  torsoLean: 0.14,  torsoTwist: 0.04,  headPitch: 0.0,   gripX: 184, gripY: 206, shinaiAngle: 23,  shinaiFlex: 0,   swingBlur: 0,    hakamaSway: -3,  tareSway: 2, mendareSway: 1 },
    ],
    kote: [
        { hipX: 132, hipY: 262, backFootX: 94, backFootY: 374, backHeel: 8,  frontFootX: 168, frontFootY: 374, frontHeel: 0,  torsoLean: 0.07, torsoTwist: 0,    headPitch: 0.02, gripX: 160, gripY: 214, shinaiAngle: 40, shinaiFlex: 0,   swingBlur: 0,    hakamaSway: -2, tareSway: 0, mendareSway: 0 },
        { hipX: 132, hipY: 260, backFootX: 92, backFootY: 374, backHeel: 11, frontFootX: 172, frontFootY: 371, frontHeel: -3, torsoLean: 0.05, torsoTwist: 0,    headPitch: 0.03, gripX: 158, gripY: 184, shinaiAngle: 66, shinaiFlex: 0,   swingBlur: 0,    hakamaSway: -4, tareSway: 0, mendareSway: 1 },
        { hipX: 136, hipY: 262, backFootX: 90, backFootY: 374, backHeel: 14, frontFootX: 180, frontFootY: 367, frontHeel: -6, torsoLean: 0.09, torsoTwist: 0,    headPitch: 0.04, gripX: 162, gripY: 174, shinaiAngle: 76, shinaiFlex: -4,  swingBlur: 0,    hakamaSway: -6, tareSway: 1, mendareSway: 2 },
        { hipX: 148, hipY: 266, backFootX: 88, backFootY: 374, backHeel: 18, frontFootX: 192, frontFootY: 371, frontHeel: -2, torsoLean: 0.16, torsoTwist: 0.05, headPitch: 0.0,  gripX: 186, gripY: 196, shinaiAngle: 28, shinaiFlex: -12, swingBlur: -0.9, hakamaSway: -9, tareSway: 2, mendareSway: 4 },
        { hipX: 154, hipY: 269, backFootX: 86, backFootY: 374, backHeel: 20, frontFootX: 200, frontFootY: 374, frontHeel: 0,  torsoLean: 0.19, torsoTwist: 0.08, headPitch: -0.02, gripX: 198, gripY: 212, shinaiAngle: 5,  shinaiFlex: 5,   swingBlur: 0,    hakamaSway: -7, tareSway: 3, mendareSway: 3 },
        { hipX: 152, hipY: 267, backFootX: 86, backFootY: 374, backHeel: 18, frontFootX: 198, frontFootY: 374, frontHeel: 0,  torsoLean: 0.17, torsoTwist: 0.05, headPitch: 0.0,  gripX: 194, gripY: 206, shinaiAngle: 12, shinaiFlex: -2,  swingBlur: 0,    hakamaSway: -4, tareSway: 2, mendareSway: 1 },
        { hipX: 142, hipY: 263, backFootX: 90, backFootY: 374, backHeel: 12, frontFootX: 184, frontFootY: 374, frontHeel: 0,  torsoLean: 0.12, torsoTwist: 0.02, headPitch: 0.01, gripX: 178, gripY: 218, shinaiAngle: 20, shinaiFlex: 0,   swingBlur: 0,    hakamaSway: -2, tareSway: 1, mendareSway: 0 },
        { hipX: 135, hipY: 259, backFootX: 94, backFootY: 374, backHeel: 8,  frontFootX: 172, frontFootY: 374, frontHeel: 0,  torsoLean: 0.08, torsoTwist: 0,    headPitch: 0.02, gripX: 168, gripY: 226, shinaiAngle: 24, shinaiFlex: 0,   swingBlur: 0,    hakamaSway: 0,  tareSway: 0, mendareSway: 0 },
    ],
    do: [
        { hipX: 130, hipY: 262, backFootX: 94, backFootY: 374, backHeel: 8,  frontFootX: 168, frontFootY: 374, frontHeel: 0,  torsoLean: 0.04, torsoTwist: -0.35, headPitch: 0.02, gripX: 154, gripY: 198, shinaiAngle: 56,  shinaiFlex: 0,   swingBlur: 0,     hakamaSway: -2,  tareSway: 0, mendareSway: 0 },
        { hipX: 128, hipY: 260, backFootX: 92, backFootY: 374, backHeel: 12, frontFootX: 172, frontFootY: 370, frontHeel: -4, torsoLean: 0.0,  torsoTwist: -0.65, headPitch: 0.05, gripX: 146, gripY: 154, shinaiAngle: 104, shinaiFlex: 0,   swingBlur: 0,     hakamaSway: -5,  tareSway: -1, mendareSway: 2 },
        { hipX: 132, hipY: 262, backFootX: 88, backFootY: 374, backHeel: 15, frontFootX: 180, frontFootY: 366, frontHeel: -6, torsoLean: 0.04, torsoTwist: -0.75, headPitch: 0.06, gripX: 142, gripY: 140, shinaiAngle: 122, shinaiFlex: -4,  swingBlur: 0,     hakamaSway: -7,  tareSway: -1, mendareSway: 3 },
        { hipX: 146, hipY: 268, backFootX: 84, backFootY: 374, backHeel: 18, frontFootX: 194, frontFootY: 370, frontHeel: -2, torsoLean: 0.18, torsoTwist: 0.15,  headPitch: 0.0,  gripX: 176, gripY: 204, shinaiAngle: 36,  shinaiFlex: -12, swingBlur: -0.85, hakamaSway: -10, tareSway: 2, mendareSway: 5 },
        { hipX: 156, hipY: 271, backFootX: 82, backFootY: 374, backHeel: 22, frontFootX: 202, frontFootY: 374, frontHeel: 0,  torsoLean: 0.24, torsoTwist: 0.55,  headPitch: -0.02, gripX: 196, gripY: 222, shinaiAngle: 2,   shinaiFlex: -10, swingBlur: -0.95, hakamaSway: -11, tareSway: 4, mendareSway: 5 },
        { hipX: 160, hipY: 272, backFootX: 80, backFootY: 374, backHeel: 24, frontFootX: 205, frontFootY: 374, frontHeel: 0,  torsoLean: 0.26, torsoTwist: 0.80,  headPitch: -0.03, gripX: 204, gripY: 226, shinaiAngle: -7,  shinaiFlex: 6,   swingBlur: 0,     hakamaSway: -8,  tareSway: 5, mendareSway: 3 },
        { hipX: 152, hipY: 268, backFootX: 84, backFootY: 374, backHeel: 18, frontFootX: 196, frontFootY: 374, frontHeel: 0,  torsoLean: 0.19, torsoTwist: 0.50,  headPitch: 0.0,  gripX: 192, gripY: 224, shinaiAngle: -2,  shinaiFlex: 0,   swingBlur: 0,     hakamaSway: -4,  tareSway: 3, mendareSway: 1 },
        { hipX: 138, hipY: 261, backFootX: 92, backFootY: 374, backHeel: 10, frontFootX: 178, frontFootY: 374, frontHeel: 0,  torsoLean: 0.10, torsoTwist: 0.15,  headPitch: 0.02, gripX: 172, gripY: 228, shinaiAngle: 18,  shinaiFlex: 0,   swingBlur: 0,     hakamaSway: -1,  tareSway: 1, mendareSway: 0 },
    ],
    tsuki: [
        { hipX: 122, hipY: 264, backFootX: 92, backFootY: 374, backHeel: 6,  frontFootX: 162, frontFootY: 374, frontHeel: 0,  torsoLean: 0.08, torsoTwist: -0.1, headPitch: 0.02, gripX: 150, gripY: 224, shinaiAngle: 18, shinaiFlex: 0,  swingBlur: 0, hakamaSway: 3,   tareSway: -1, mendareSway: 0 },
        { hipX: 114, hipY: 271, backFootX: 90, backFootY: 374, backHeel: 5,  frontFootX: 158, frontFootY: 374, frontHeel: 0,  torsoLean: 0.13, torsoTwist: -0.3, headPitch: 0.03, gripX: 140, gripY: 220, shinaiAngle: 11, shinaiFlex: 0,  swingBlur: 0, hakamaSway: 5,   tareSway: -2, mendareSway: -1 },
        { hipX: 110, hipY: 274, backFootX: 88, backFootY: 374, backHeel: 8,  frontFootX: 160, frontFootY: 370, frontHeel: -4, torsoLean: 0.17, torsoTwist: -0.4, headPitch: 0.04, gripX: 136, gripY: 216, shinaiAngle: 8,  shinaiFlex: 0,  swingBlur: 0, hakamaSway: 6,   tareSway: -2, mendareSway: -1 },
        { hipX: 146, hipY: 268, backFootX: 82, backFootY: 374, backHeel: 18, frontFootX: 194, frontFootY: 371, frontHeel: -2, torsoLean: 0.25, torsoTwist: 0.2,  headPitch: 0.0,  gripX: 184, gripY: 204, shinaiAngle: 9,  shinaiFlex: -4, swingBlur: -0.5, hakamaSway: -12, tareSway: 4, mendareSway: 5 },
        { hipX: 164, hipY: 270, backFootX: 78, backFootY: 374, backHeel: 24, frontFootX: 208, frontFootY: 374, frontHeel: 0,  torsoLean: 0.28, torsoTwist: 0.4,  headPitch: -0.02, gripX: 208, gripY: 198, shinaiAngle: 8,  shinaiFlex: -6, swingBlur: 0, hakamaSway: -14, tareSway: 5, mendareSway: 6 },
        { hipX: 160, hipY: 269, backFootX: 80, backFootY: 374, backHeel: 22, frontFootX: 205, frontFootY: 374, frontHeel: 0,  torsoLean: 0.26, torsoTwist: 0.3,  headPitch: -0.01, gripX: 204, gripY: 200, shinaiAngle: 9,  shinaiFlex: -3, swingBlur: 0, hakamaSway: -9,  tareSway: 3, mendareSway: 3 },
        { hipX: 144, hipY: 264, backFootX: 88, backFootY: 374, backHeel: 14, frontFootX: 188, frontFootY: 374, frontHeel: 0,  torsoLean: 0.15, torsoTwist: 0.1,  headPitch: 0.01, gripX: 184, gripY: 214, shinaiAngle: 16, shinaiFlex: 0,  swingBlur: 0, hakamaSway: -4,  tareSway: 1, mendareSway: 1 },
        { hipX: 136, hipY: 260, backFootX: 94, backFootY: 374, backHeel: 9,  frontFootX: 174, frontFootY: 374, frontHeel: 0,  torsoLean: 0.09, torsoTwist: 0,    headPitch: 0.02, gripX: 170, gripY: 226, shinaiAngle: 23, shinaiFlex: 0,  swingBlur: 0, hakamaSway: -1,  tareSway: 0, mendareSway: 0 },
    ],
    defend: [
        { hipX: 126, hipY: 260, backFootX: 94, backFootY: 374, backHeel: 6, frontFootX: 164, frontFootY: 374, frontHeel: 0, torsoLean: 0.02,  torsoTwist: 0, headPitch: 0.03, gripX: 162, gripY: 190, shinaiAngle: 58, shinaiFlex: 0, swingBlur: 0, hakamaSway: 3, tareSway: 0,  mendareSway: 0 },
        { hipX: 122, hipY: 263, backFootX: 92, backFootY: 374, backHeel: 5, frontFootX: 160, frontFootY: 374, frontHeel: 0, torsoLean: -0.02, torsoTwist: 0, headPitch: 0.04, gripX: 158, gripY: 168, shinaiAngle: 76, shinaiFlex: 0, swingBlur: 0, hakamaSway: 5, tareSway: -1, mendareSway: -1 },
        { hipX: 118, hipY: 267, backFootX: 90, backFootY: 374, backHeel: 4, frontFootX: 158, frontFootY: 374, frontHeel: 0, torsoLean: -0.05, torsoTwist: 0, headPitch: 0.02, gripX: 154, gripY: 172, shinaiAngle: 82, shinaiFlex: 7, swingBlur: 0, hakamaSway: 6, tareSway: -2, mendareSway: -2 },
        { hipX: 128, hipY: 262, backFootX: 92, backFootY: 374, backHeel: 8, frontFootX: 166, frontFootY: 374, frontHeel: 0, torsoLean: 0.05,  torsoTwist: 0, headPitch: 0.04, gripX: 164, gripY: 184, shinaiAngle: 62, shinaiFlex: 0, swingBlur: 0, hakamaSway: 1, tareSway: 0,  mendareSway: 0 },
    ],
    breakAttack: [
        { hipX: 124, hipY: 268, backFootX: 92, backFootY: 374, backHeel: 8,  frontFootX: 164, frontFootY: 374, frontHeel: 0,  torsoLean: 0.12, torsoTwist: 0,     headPitch: 0.02, gripX: 156, gripY: 238, shinaiAngle: -14, shinaiFlex: 0, swingBlur: 0, hakamaSway: 2,   tareSway: 0, mendareSway: 0 },
        { hipX: 146, hipY: 268, backFootX: 88, backFootY: 374, backHeel: 16, frontFootX: 190, frontFootY: 371, frontHeel: -2, torsoLean: 0.22, torsoTwist: -0.20, headPitch: 0.0,  gripX: 178, gripY: 218, shinaiAngle: 44,  shinaiFlex: 0, swingBlur: 0, hakamaSway: -9,  tareSway: 3, mendareSway: 3 },
        { hipX: 162, hipY: 266, backFootX: 84, backFootY: 374, backHeel: 22, frontFootX: 204, frontFootY: 374, frontHeel: 0,  torsoLean: 0.28, torsoTwist: -0.35, headPitch: -0.02, gripX: 196, gripY: 200, shinaiAngle: 68,  shinaiFlex: 4, swingBlur: 0, hakamaSway: -12, tareSway: 5, mendareSway: 5 },
        { hipX: 146, hipY: 263, backFootX: 90, backFootY: 374, backHeel: 12, frontFootX: 186, frontFootY: 374, frontHeel: 0,  torsoLean: 0.15, torsoTwist: -0.10, headPitch: 0.01, gripX: 178, gripY: 218, shinaiAngle: 36,  shinaiFlex: 0, swingBlur: 0, hakamaSway: -4,  tareSway: 2, mendareSway: 1 },
    ],
    hit: [
        { hipX: 124, hipY: 261, backFootX: 94, backFootY: 374, backHeel: 4, frontFootX: 170, frontFootY: 368, frontHeel: -14, torsoLean: -0.16, torsoTwist: 0, headPitch: -0.24, gripX: 154, gripY: 200, shinaiAngle: 52, shinaiFlex: 0, swingBlur: 0, hakamaSway: 6,  tareSway: -2, mendareSway: -5, hitDebris: 0.75 },
        { hipX: 112, hipY: 264, backFootX: 90, backFootY: 374, backHeel: 2, frontFootX: 176, frontFootY: 354, frontHeel: -22, torsoLean: -0.28, torsoTwist: 0, headPitch: -0.34, gripX: 146, gripY: 206, shinaiAngle: 62, shinaiFlex: 0, swingBlur: 0, hakamaSway: 10, tareSway: -4, mendareSway: -7, hitDebris: 1.05 },
        { hipX: 106, hipY: 268, backFootX: 86, backFootY: 374, backHeel: 0, frontFootX: 168, frontFootY: 360, frontHeel: -16, torsoLean: -0.22, torsoTwist: 0, headPitch: -0.26, gripX: 144, gripY: 218, shinaiAngle: 48, shinaiFlex: 0, swingBlur: 0, hakamaSway: 8,  tareSway: -3, mendareSway: -5, hitDebris: 1.30 },
        { hipX: 112, hipY: 272, backFootX: 88, backFootY: 374, backHeel: 4, frontFootX: 160, frontFootY: 374, frontHeel: -6,  torsoLean: -0.10, torsoTwist: 0, headPitch: -0.12, gripX: 152, gripY: 234, shinaiAngle: 18, shinaiFlex: 0, swingBlur: 0, hakamaSway: 5,  tareSway: -1, mendareSway: -2, hitDebris: 0 },
        { hipX: 120, hipY: 266, backFootX: 92, backFootY: 374, backHeel: 6, frontFootX: 164, frontFootY: 374, frontHeel: 0,   torsoLean: 0.02,  torsoTwist: 0, headPitch: 0.02,  gripX: 160, gripY: 234, shinaiAngle: 21, shinaiFlex: 0, swingBlur: 0, hakamaSway: 2,  tareSway: 0,  mendareSway: 0,  hitDebris: 0 },
        { hipX: 128, hipY: 260, backFootX: 95, backFootY: 374, backHeel: 6, frontFootX: 167, frontFootY: 374, frontHeel: 0,   torsoLean: 0.05,  torsoTwist: 0, headPitch: 0.02,  gripX: 164, gripY: 231, shinaiAngle: 25, shinaiFlex: 0, swingBlur: 0, hakamaSway: 0,  tareSway: 0,  mendareSway: 0,  hitDebris: 0 },
    ],
    victory: [
        { hipX: 132, hipY: 253, backFootX: 98,  backFootY: 374, backHeel: 4, frontFootX: 164, frontFootY: 374, frontHeel: 0, torsoLean: -0.02, torsoTwist: 0, headPitch: 0.02, breath: 0.6, gripX: 156, gripY: 180, shinaiAngle: 72, shinaiFlex: 0, swingBlur: 0, hakamaSway: 0, tareSway: 0, mendareSway: 0, hitDebris: 0 },
        { hipX: 132, hipY: 250, backFootX: 102, backFootY: 374, backHeel: 2, frontFootX: 160, frontFootY: 374, frontHeel: 0, torsoLean: -0.03, torsoTwist: 0, headPitch: 0.0,  breath: 0.8, gripX: 152, gripY: 214, shinaiAngle: 46, shinaiFlex: 0, swingBlur: 0, hakamaSway: 0, tareSway: 0, mendareSway: 0, hitDebris: 0 },
    ],
};

const POSE_KEYS = [
    'hipX', 'hipY', 'backFootX', 'backFootY', 'backHeel',
    'frontFootX', 'frontFootY', 'frontHeel', 'torsoLean', 'torsoTwist',
    'breath', 'tareSway', 'hakamaSway', 'headPitch', 'mendareSway',
    'gripX', 'gripY', 'shinaiAngle', 'shinaiFlex', 'swingBlur', 'hitDebris'
];

function createDefaultPose() {
    return {
        hipX: 132, hipY: 258,
        backFootX: 96, backFootY: 374, backHeel: 6,
        frontFootX: 168, frontFootY: 374, frontHeel: 0,
        torsoLean: 0.06, torsoTwist: 0,
        breath: 0.5, tareSway: 0, hakamaSway: 0,
        headPitch: 0.02, mendareSway: 0,
        gripX: 165, gripY: 230,
        shinaiAngle: 26, shinaiFlex: 0,
        swingBlur: 0, hitDebris: 0,
    };
}

function interpolatePose(p0, p1, t) {
    const out = {};
    for (let i = 0; i < POSE_KEYS.length; i++) {
        const k = POSE_KEYS[i];
        const a = p0[k] !== undefined ? p0[k] : 0;
        const b = p1[k] !== undefined ? p1[k] : 0;
        out[k] = a + (b - a) * t;
    }
    return out;
}

// 待機状態（中段・応じ技・体勢崩れ・決着後）の連続呼吸＆すり足ポーズ計算
function getContinuousStancePose(stanceType, phase) {
    const s = Math.sin(phase);
    const c = Math.cos(phase);
    const s2 = Math.sin(phase * 2 + 0.4);

    if (stanceType === 'counterReady') {
        return {
            hipX: 136 + s * 4.2,
            hipY: 264 + c * 2.8,
            backFootX: 90 + s * 3.2,
            backFootY: 374,
            backHeel: 10 + s * 2.8,
            frontFootX: 174 + s * 4.5,
            frontFootY: 374,
            frontHeel: 0,
            torsoLean: 0.11 + s * 0.02,
            torsoTwist: -0.15 + c * 0.07,
            breath: 0.7 + 0.3 * s,
            tareSway: c * 1.8,
            hakamaSway: -3 + c * 3.8,
            headPitch: 0.04 - s * 0.012,
            mendareSway: 2 + c * 2.0,
            gripX: 168 + s * 4.2,
            gripY: 208 + c * 3.5,
            shinaiAngle: 44 + Math.sin(phase + 0.5) * 4.5,
            shinaiFlex: 0,
            swingBlur: 0,
            hitDebris: 0,
        };
    }

    if (stanceType === 'guardBroken' || stanceType === 'breakAttack') {
        return {
            hipX: 124 + s * 4.5,
            hipY: 266 + c * 3.0,
            backFootX: 92 + s * 2.0,
            backFootY: 374,
            backHeel: 3 + Math.max(0, s * 2),
            frontFootX: 162 + s * 4.0,
            frontFootY: 374,
            frontHeel: -4 + s * 3.0,
            torsoLean: -0.08 + s * 0.035,
            torsoTwist: 0.2 + c * 0.06,
            breath: 0.3 + 0.3 * s,
            tareSway: -1.5 + c * 1.6,
            hakamaSway: 3 + s * 4.0,
            headPitch: -0.08 + c * 0.04,
            mendareSway: -2 + s * 2.2,
            gripX: 156 + s * 3.5,
            gripY: 244 + c * 3.2,
            shinaiAngle: -16 + Math.sin(phase + 0.4) * 4.5,
            shinaiFlex: 0,
            swingBlur: 0,
            hitDebris: 0,
        };
    }

    if (stanceType === 'hit') {
        return {
            hipX: 112 + s * 2.0,
            hipY: 269 + c * 1.8,
            backFootX: 88,
            backFootY: 374,
            backHeel: 2,
            frontFootX: 162,
            frontFootY: 370,
            frontHeel: -10 + s * 2,
            torsoLean: -0.18 + s * 0.02,
            torsoTwist: 0,
            breath: 0.3 + 0.2 * s,
            tareSway: -2 + c * 1.0,
            hakamaSway: 6 + s * 2.0,
            headPitch: -0.22 + c * 0.02,
            mendareSway: -4 + s * 1.5,
            gripX: 148 + s * 2.0,
            gripY: 224 + c * 2.0,
            shinaiAngle: 32 + s * 3.0,
            shinaiFlex: 0,
            swingBlur: 0,
            hitDebris: 0,
        };
    }

    if (stanceType === 'victory') {
        return {
            hipX: 132,
            hipY: 250 + s * 1.5,
            backFootX: 102,
            backFootY: 374,
            backHeel: 2,
            frontFootX: 160,
            frontFootY: 374,
            frontHeel: 0,
            torsoLean: -0.03 + s * 0.008,
            torsoTwist: 0,
            breath: 0.7 + 0.3 * s,
            tareSway: c * 0.6,
            hakamaSway: c * 1.2,
            headPitch: 0.0,
            mendareSway: c * 0.8,
            gripX: 152 + s * 1.5,
            gripY: 214 + c * 1.5,
            shinaiAngle: 46 + s * 1.5,
            shinaiFlex: 0,
            swingBlur: 0,
            hitDebris: 0,
        };
    }

    // 通常の中段の構え（呼吸＋すり足＋剣先の微細な攻め）
    return {
        hipX: 132 + s * 4.5,
        hipY: 258 + Math.sin(phase - 0.5) * 3.2,
        backFootX: 96 + s * 3.5,
        backFootY: 374,
        backHeel: 6 + s * 2.5,
        frontFootX: 168 + s * 5.5,
        frontFootY: 374,
        frontHeel: 0,
        torsoLean: 0.06 + s * 0.018,
        torsoTwist: c * 0.08,
        breath: 0.5 + 0.5 * s,
        tareSway: c * 1.2,
        hakamaSway: c * 4.0,
        headPitch: 0.02 - s * 0.015,
        mendareSway: c * 1.5,
        gripX: 165 + s * 5.0,
        gripY: 230 + c * 3.0 + s2 * 1.2,
        shinaiAngle: 26 + Math.sin(phase + 0.6) * 4.0 + s2 * 1.2,
        shinaiFlex: 0,
        swingBlur: 0,
        hitDebris: 0,
    };
}

// 2ボーン逆運動学（IK）ソルバー（肩→肘→手首・小手を連続計算）
function solveIK(sx, sy, hx, hy, L1, L2, bendDir) {
    let dx = hx - sx;
    let dy = hy - sy;
    let dist = Math.hypot(dx, dy);
    const maxReach = (L1 + L2) * 0.96;
    const minReach = Math.abs(L1 - L2) * 1.15;
    if (dist > maxReach) {
        dx *= maxReach / dist;
        dy *= maxReach / dist;
        hx = sx + dx;
        hy = sy + dy;
        dist = maxReach;
    } else if (dist < minReach) {
        dist = minReach;
    }
    const cosA = (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist);
    const clampedCos = Math.max(-1, Math.min(1, cosA));
    const angleToHand = Math.atan2(dy, dx);
    const elbowOffsetAngle = Math.acos(clampedCos) * bendDir;
    const shoulderAngle = angleToHand + elbowOffsetAngle;
    const ex = sx + Math.cos(shoulderAngle) * L1;
    const ey = sy + Math.sin(shoulderAngle) * L1;
    return { ex, ey, hx, hy, shoulderAngle, forearmAngle: Math.atan2(hy - ey, hx - ex) };
}

function drawBareFoot(ctx, x, y, heelLiftDeg, footScaleX, isBack) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(footScaleX || 1, 1);

    const skinHi = isBack ? '#d8a270' : '#eec395';
    const skinMid = isBack ? '#c08a58' : '#daa675';
    const skinShadow = isBack ? '#966338' : '#b37d4d';
    const ink = '#080a0f';

    const rad = (heelLiftDeg || 0) * Math.PI / 180;
    ctx.translate(12, -2);
    ctx.rotate(-rad);
    ctx.translate(-12, 2);

    const grad = ctx.createLinearGradient(-28, -26, 24, 2);
    grad.addColorStop(0, skinHi);
    grad.addColorStop(0.65, skinMid);
    grad.addColorStop(1, skinShadow);

    ctx.fillStyle = grad;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-22, -30);
    ctx.bezierCurveTo(-26, -19, -29, -9, -25, -3);
    ctx.bezierCurveTo(-22, 1, -11, 1, -4, -0.4);
    ctx.bezierCurveTo(4, -1, 14, 1, 22, 0.5);
    ctx.bezierCurveTo(28, 0, 29, -6.5, 22, -9.5);
    ctx.bezierCurveTo(14, -13, 5, -18, -1, -30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = skinShadow;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-22, -2.2);
    ctx.quadraticCurveTo(0, -1.5, 23, -1.8);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(-12, -14, 3.8, 0.2, 2.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(16, -2);
    ctx.lineTo(13, -6);
    ctx.stroke();

    ctx.restore();
}

function drawHakama(ctx, hipX, hipY, backFootX, backFootY, frontFootX, frontFootY, sway) {
    ctx.save();
    const ink = '#080a0f';

    const bAnkleX = backFootX - 6;
    const bAnkleY = Math.min(360, backFootY - 13);
    const fAnkleX = frontFootX - 4;
    const fAnkleY = Math.min(361, frontFootY - 12);

    const midX = (bAnkleX + fAnkleX) * 0.5;
    const crotchLowY = Math.min(bAnkleY, fAnkleY) - 18;
    ctx.fillStyle = '#09111f';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(hipX - 24, hipY + 14);
    ctx.lineTo(bAnkleX + 12, bAnkleY - 2);
    ctx.quadraticCurveTo(midX, crotchLowY, fAnkleX - 14, fAnkleY - 2);
    ctx.lineTo(hipX + 24, hipY + 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const bGrad = ctx.createLinearGradient(hipX - 36, hipY, bAnkleX, bAnkleY);
    bGrad.addColorStop(0, '#101d33');
    bGrad.addColorStop(0.55, '#162744');
    bGrad.addColorStop(1, '#0c1628');

    ctx.fillStyle = bGrad;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.6;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(hipX - 30, hipY + 10);
    ctx.bezierCurveTo(
        hipX - 44 + sway * 0.4, hipY + 48,
        bAnkleX - 34 + sway * 0.7, bAnkleY - 34,
        bAnkleX - 33, bAnkleY + 2
    );
    ctx.bezierCurveTo(
        bAnkleX - 10, bAnkleY + 6,
        bAnkleX + 18, bAnkleY + 5,
        bAnkleX + 32, bAnkleY
    );
    ctx.bezierCurveTo(
        bAnkleX + 28, bAnkleY - 36,
        hipX + 10, hipY + 68,
        hipX + 12, hipY + 14
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(6, 10, 19, 0.75)';
    ctx.lineWidth = 2.2;
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(hipX - 12 + i * 8, hipY + 22);
        ctx.quadraticCurveTo(
            (hipX + bAnkleX) * 0.5 - 6 + i * 13 + sway * 0.4,
            (hipY + bAnkleY) * 0.5 + 10,
            bAnkleX - 2 + i * 14,
            bAnkleY + 2
        );
        ctx.stroke();
    }

    const fGrad = ctx.createLinearGradient(hipX - 14, hipY, fAnkleX + 26, fAnkleY);
    fGrad.addColorStop(0, '#182b49');
    fGrad.addColorStop(0.48, '#21385e');
    fGrad.addColorStop(0.82, '#182a48');
    fGrad.addColorStop(1, '#101d34');

    ctx.fillStyle = fGrad;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.6;

    const kneePush = Math.max(0, (frontFootX - hipX - 28) * 0.22);
    ctx.beginPath();
    ctx.moveTo(hipX - 16, hipY + 12);
    ctx.bezierCurveTo(
        hipX - 20 + sway * 0.3, hipY + 54,
        fAnkleX - 34 + sway * 0.5, fAnkleY - 36,
        fAnkleX - 34, fAnkleY + 1
    );
    ctx.bezierCurveTo(
        fAnkleX - 10, fAnkleY + 6,
        fAnkleX + 16, fAnkleY + 5,
        fAnkleX + 35, fAnkleY - 1
    );
    ctx.bezierCurveTo(
        fAnkleX + 34 + kneePush, fAnkleY - 40,
        hipX + 34 + kneePush * 0.6, (hipY + fAnkleY) * 0.5,
        hipX + 30, hipY + 10
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(78, 120, 186, 0.38)';
    ctx.lineWidth = 2.8;
    for (let i = -1; i <= 2; i++) {
        const topX = hipX + 2 + i * 7;
        const botX = fAnkleX - 6 + i * 12;
        const mX = (topX + botX) * 0.5 + 5 + sway * 0.3;
        const mY = (hipY + fAnkleY) * 0.54;
        ctx.beginPath();
        ctx.moveTo(topX, hipY + 24);
        ctx.quadraticCurveTo(mX, mY, botX, fAnkleY - 2);
        ctx.stroke();
    }

    ctx.strokeStyle = '#080d1a';
    ctx.lineWidth = 2.2;
    for (let i = -2; i <= 2; i++) {
        const topX = hipX + i * 7;
        const botX = fAnkleX - 4 + i * 12;
        const mX = (topX + botX) * 0.5 + 3 + sway * 0.3;
        const mY = (hipY + fAnkleY) * 0.54;
        ctx.beginPath();
        ctx.moveTo(topX, hipY + 22);
        ctx.quadraticCurveTo(mX, mY, botX, fAnkleY + 2);
        ctx.stroke();
    }

    ctx.restore();
}

function drawTorsoAndDo(ctx, hipX, hipY, torsoLean, torsoTwist, breath, tareSway) {
    const ink = '#080a0f';
    const bScale = 1 + (breath || 0) * 0.025;

    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(torsoLean * 0.32 + (tareSway || 0) * 0.035);
    ctx.scale(bScale, 1);

    const skirtGrad = ctx.createLinearGradient(-44, -6, 44, 36);
    skirtGrad.addColorStop(0, '#14233c');
    skirtGrad.addColorStop(0.5, '#1f3558');
    skirtGrad.addColorStop(1, '#0e1a2e');

    ctx.fillStyle = skirtGrad;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.6;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-34, -8);
    ctx.bezierCurveTo(-42, 8, -48, 22, -50, 33);
    ctx.quadraticCurveTo(0, 38, 44, 31);
    ctx.bezierCurveTo(42, 16, 37, 4, 32, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const flapPositions = [-30, -4, 20];
    flapPositions.forEach((fx, idx) => {
        const fw = idx === 1 ? 22 : 20;
        const fh = 31;
        ctx.fillStyle = idx === 1 ? '#1b3050' : '#152642';
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.7;
        ctx.beginPath();
        ctx.roundRect(fx, -2, fw, fh, [2, 2, 6, 6]);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(88, 132, 198, 0.45)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(fx + 3.5, 2.5, fw - 7, fh - 8, 2);
        ctx.stroke();
    });
    ctx.restore();

    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(torsoLean);
    ctx.scale(bScale, 1);

    const giGrad = ctx.createLinearGradient(-36, -90, 34, -8);
    giGrad.addColorStop(0, '#223a60');
    giGrad.addColorStop(0.5, '#182b49');
    giGrad.addColorStop(1, '#101d33');

    ctx.fillStyle = giGrad;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.6;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-31, -6);
    ctx.bezierCurveTo(-38, -32, -39, -66, -28, -86);
    ctx.lineTo(24, -86);
    ctx.bezierCurveTo(35, -66, 35, -32, 30, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(8, 13, 24, 0.65)';
    ctx.lineWidth = 2.1;
    for (let y = -70; y <= -38; y += 14) {
        ctx.beginPath();
        ctx.moveTo(-33, y);
        ctx.quadraticCurveTo(-10, y + 3.5, 14, y - 1);
        ctx.stroke();
    }

    const twistShift = (torsoTwist || 0) * 9;
    const doGrad = ctx.createLinearGradient(-32 + twistShift, -50, 36 + twistShift, -4);
    doGrad.addColorStop(0, '#14161b');
    doGrad.addColorStop(0.4, '#252932');
    doGrad.addColorStop(0.65, '#424957');
    doGrad.addColorStop(0.82, '#22262e');
    doGrad.addColorStop(1, '#111318');

    ctx.fillStyle = '#1b1e26';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-12 + twistShift * 0.5, -58);
    ctx.quadraticCurveTo(12 + twistShift * 0.5, -64, 30, -52);
    ctx.lineTo(31, -26);
    ctx.lineTo(-16, -26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(185, 28, 28, 0.7)';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(-6 + twistShift * 0.5, -50);
    ctx.quadraticCurveTo(12 + twistShift * 0.5, -54, 25, -45);
    ctx.stroke();

    ctx.fillStyle = doGrad;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.roundRect(-33, -31, 66, 29, [6, 9, 7, 6]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(148, 163, 184, 0.17)';
    ctx.beginPath();
    ctx.roundRect(3 + twistShift * 0.4, -28, 16, 23, 3.5);
    ctx.fill();

    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(-32, -15);
    ctx.lineTo(32, -15);
    ctx.stroke();

    ctx.restore();
}

function getTorsoAnchors(hipX, hipY, torsoLean, torsoTwist) {
    const cos = Math.cos(torsoLean);
    const sin = Math.sin(torsoLean);
    function toWorld(lx, ly) {
        return {
            x: hipX + lx * cos - ly * sin,
            y: hipY + lx * sin + ly * cos,
        };
    }
    const twist = torsoTwist || 0;
    return {
        neck: toWorld(0, -86),
        backShoulder: toWorld(4 - twist * 4, -68),
        frontShoulder: toWorld(6 + twist * 6, -66),
    };
}

function drawHeadMen(ctx, neckX, neckY, headPitch, mendareSway, showHitDebris) {
    ctx.save();
    ctx.translate(neckX, neckY);
    ctx.rotate(headPitch);
    ctx.scale(1.08, 1.08);

    const ink = '#080a0f';

    ctx.save();
    ctx.translate(-27, -34);
    ctx.rotate((mendareSway || 0) * 0.08 - headPitch * 0.4);
    ctx.strokeStyle = '#1e3252';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-14, -4, -22, 4);
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(-12, 6, -18, 14);
    ctx.stroke();
    ctx.restore();

    const domeGrad = ctx.createLinearGradient(-32, -78, 28, -4);
    domeGrad.addColorStop(0, '#26406b');
    domeGrad.addColorStop(0.45, '#192b49');
    domeGrad.addColorStop(1, '#0e192c');

    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-25, -6);
    ctx.bezierCurveTo(-32, -24, -33, -55, -23, -69);
    ctx.bezierCurveTo(-13, -78, 15, -78, 25, -67);
    ctx.bezierCurveTo(33, -53, 33, -22, 23, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(8, 13, 25, 0.68)';
    ctx.lineWidth = 1.8;
    for (let y = -64; y <= -22; y += 8) {
        ctx.beginPath();
        ctx.moveTo(-27, y);
        ctx.quadraticCurveTo(-4, y - 2, 14, y);
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(110, 152, 216, 0.36)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-18, -69);
    ctx.quadraticCurveTo(2, -75, 19, -67);
    ctx.stroke();

    ctx.save();
    ctx.fillStyle = '#07090e';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(8, -65);
    ctx.bezierCurveTo(27, -65, 34, -51, 34, -36);
    ctx.bezierCurveTo(34, -20, 26, -10, 8, -10);
    ctx.quadraticCurveTo(4, -37, 8, -65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.clip();

    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(4, -67, 8, 59);

    for (let y = -61; y <= -14; y += 5) {
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3.3;
        ctx.beginPath();
        ctx.moveTo(6, y + 0.8);
        ctx.quadraticCurveTo(21, y - 0.5, 35, y + 1.2);
        ctx.stroke();

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(6, y);
        ctx.quadraticCurveTo(21, y - 1.2, 35, y + 0.5);
        ctx.stroke();

        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(11, y - 0.4);
        ctx.lineTo(23, y - 0.6);
        ctx.stroke();
    }

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4.4;
    ctx.beginPath();
    ctx.moveTo(25, -65);
    ctx.bezierCurveTo(31, -51, 31, -24, 25, -10);
    ctx.stroke();

    ctx.restore();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.9;
    ctx.beginPath();
    ctx.moveTo(8, -65);
    ctx.bezierCurveTo(27, -65, 34, -51, 34, -36);
    ctx.bezierCurveTo(34, -20, 26, -10, 8, -10);
    ctx.quadraticCurveTo(4, -37, 8, -65);
    ctx.stroke();

    ctx.fillStyle = '#182844';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(6, -11);
    ctx.lineTo(24, -10);
    ctx.lineTo(28, 5);
    ctx.quadraticCurveTo(16, 8, 5, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.rotate((mendareSway || 0) * 0.05);
    const mdGrad = ctx.createLinearGradient(-30, -28, 14, 16);
    mdGrad.addColorStop(0, '#223960');
    mdGrad.addColorStop(0.6, '#172846');
    mdGrad.addColorStop(1, '#0f1b31');

    ctx.fillStyle = mdGrad;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-25, -22);
    ctx.bezierCurveTo(-32, -9, -36, 2, -37, 9);
    ctx.quadraticCurveTo(-12, 15, 16, 11);
    ctx.bezierCurveTo(17, -2, 12, -18, 7, -28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(8, 13, 24, 0.65)';
    ctx.lineWidth = 1.7;
    for (let y = -14; y <= 4; y += 5.5) {
        ctx.beginPath();
        ctx.moveTo(-31, y);
        ctx.quadraticCurveTo(-8, y + 3, 13, y + 1);
        ctx.stroke();
    }

    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.arc(9, 6, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (showHitDebris && showHitDebris > 0.05) {
        const s = showHitDebris;
        const specks = [
            { x: -34 * s, y: -74 * s, r: 2.8, c: '#d6a868' },
            { x: -18 * s, y: -88 * s, r: 2.3, c: '#cbd5e1' },
            { x: 4 * s,   y: -92 * s, r: 3.5, c: '#c29258' },
            { x: 24 * s,  y: -82 * s, r: 3.8, c: '#d6a868' },
            { x: 38 * s,  y: -70 * s, r: 2.7, c: '#94a3b8' },
        ];
        specks.forEach((sp) => {
            ctx.fillStyle = sp.c;
            ctx.strokeStyle = ink;
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    ctx.restore();
}

function drawShinai(ctx, gripX, gripY, angleDeg, flex, swingBlur) {
    ctx.save();
    ctx.translate(gripX, gripY);
    const rad = angleDeg * Math.PI / 180;
    ctx.rotate(-rad);

    const ink = '#080a0f';
    const totalLen = 148;
    const tsubaX = 42;
    const bend = flex || 0;

    if (swingBlur && Math.abs(swingBlur) > 0.05) {
        ctx.save();
        const blurDir = swingBlur > 0 ? 1 : -1;
        const blurMag = Math.abs(swingBlur);
        const smearGrad = ctx.createLinearGradient(tsubaX, 0, totalLen, blurDir * 44 * blurMag);
        smearGrad.addColorStop(0, 'rgba(250, 204, 21, 0.0)');
        smearGrad.addColorStop(0.4, `rgba(250, 204, 21, ${0.22 * blurMag})`);
        smearGrad.addColorStop(1, `rgba(254, 240, 138, ${0.38 * blurMag})`);
        ctx.fillStyle = smearGrad;
        ctx.beginPath();
        ctx.moveTo(tsubaX + 4, 0);
        ctx.quadraticCurveTo(95, bend, totalLen - 2, bend * 1.4);
        ctx.quadraticCurveTo(95, bend + blurDir * 35 * blurMag, tsubaX + 4, blurDir * 8 * blurMag);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    const tsukaGrad = ctx.createLinearGradient(0, -5, 0, 5);
    tsukaGrad.addColorStop(0, '#f1f5f9');
    tsukaGrad.addColorStop(0.55, '#cbd5e1');
    tsukaGrad.addColorStop(1, '#64748b');

    ctx.fillStyle = tsukaGrad;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.roundRect(-8, -4.8, tsubaX + 8, 9.6, 3.8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9a5b25';
    ctx.fillRect(tsubaX - 10, -4.4, 9, 8.8);
    ctx.fillRect(-7, -4.4, 7, 8.8);

    const tipY = bend * 1.35;
    const midY = bend * 0.55;

    ctx.fillStyle = '#dfa855';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.4;

    ctx.beginPath();
    ctx.moveTo(tsubaX, -4.9);
    ctx.quadraticCurveTo(95, midY - 4.3, totalLen, tipY - 3.6);
    ctx.lineTo(totalLen + 2, tipY);
    ctx.lineTo(totalLen, tipY + 3.6);
    ctx.quadraticCurveTo(95, midY + 4.3, tsubaX, 4.9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(tsubaX + 2, -1.9);
    ctx.quadraticCurveTo(95, midY - 1.6, totalLen - 8, tipY - 1.3);
    ctx.stroke();

    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(tsubaX + 2, 1.5);
    ctx.quadraticCurveTo(95, midY + 1.5, totalLen - 8, tipY + 1.1);
    ctx.stroke();

    [68, 94, 114].forEach((nx, idx) => {
        const t = (nx - tsubaX) / (totalLen - tsubaX);
        const ny = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * midY + t * t * tipY;
        ctx.strokeStyle = idx === 2 ? '#451a03' : '#713f12';
        ctx.lineWidth = idx === 2 ? 3.4 : 1.9;
        ctx.beginPath();
        ctx.moveTo(nx, ny - 4.5);
        ctx.lineTo(nx, ny + 4.5);
        ctx.stroke();
    });

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(totalLen - 2, tipY, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#b4692c';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(tsubaX, 0, 4.5, 14.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function getHandTargets(gripX, gripY, angleDeg) {
    const rad = -angleDeg * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
        left: { x: gripX + 2 * cos, y: gripY + 2 * sin },
        right: { x: gripX + 27 * cos, y: gripY + 27 * sin },
    };
}

function drawArmAndKote(ctx, sx, sy, hx, hy, shinaiAngleDeg, isBack, part = 'all') {
    const ink = '#080a0f';
    const L1 = 44;
    const L2 = 46;
    const ik = solveIK(sx, sy, hx, hy, L1, L2, 1);

    const sleeveColor1 = isBack ? '#101d33' : '#21385e';
    const sleeveColor2 = isBack ? '#0b1424' : '#152540';
    const koteColor1 = isBack ? '#14233c' : '#243c64';
    const koteColor2 = isBack ? '#0c1526' : '#122038';

    if (part === 'all' || part === 'upper') {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(ik.shoulderAngle);
        const uLen = Math.hypot(ik.ex - sx, ik.ey - sy);

        const uGrad = ctx.createLinearGradient(0, -16, 0, 20);
        uGrad.addColorStop(0, sleeveColor1);
        uGrad.addColorStop(1, sleeveColor2);

        ctx.fillStyle = uGrad;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(-8, -14);
        ctx.quadraticCurveTo(uLen * 0.5, -17, uLen + 8, -12);
        ctx.lineTo(uLen + 6, 19);
        ctx.quadraticCurveTo(uLen * 0.45, 22, -8, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(7, 11, 20, 0.65)';
        ctx.lineWidth = 1.9;
        ctx.beginPath();
        ctx.moveTo(6, -2);
        ctx.quadraticCurveTo(uLen * 0.55, 4, uLen + 2, -2);
        ctx.moveTo(8, 7);
        ctx.quadraticCurveTo(uLen * 0.5, 12, uLen, 9);
        ctx.stroke();

        if (!isBack) {
            ctx.strokeStyle = 'rgba(100, 145, 212, 0.35)';
            ctx.lineWidth = 2.3;
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.quadraticCurveTo(uLen * 0.5, -15, uLen + 4, -10);
            ctx.stroke();
        }
        ctx.restore();
    }

    if (part === 'upper') return;

    if (part === 'all' || part === 'lower' || part === 'forearm') {
        ctx.save();
        ctx.translate(ik.ex, ik.ey);
        ctx.rotate(ik.forearmAngle);
        const fLen = Math.hypot(ik.hx - ik.ex, ik.hy - ik.ey);

        const kGrad = ctx.createLinearGradient(0, -12, 0, 12);
        kGrad.addColorStop(0, koteColor1);
        kGrad.addColorStop(1, koteColor2);

        ctx.fillStyle = kGrad;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(-6, -11);
        ctx.quadraticCurveTo(fLen * 0.45, -12, fLen - 5, -8.5);
        ctx.lineTo(fLen - 5, 9.5);
        ctx.quadraticCurveTo(fLen * 0.45, 12, -6, 11);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isBack ? '#b8834c' : '#d9a468';
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.ellipse(fLen - 6, 2.5, 6.0, 6.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(8, 12, 22, 0.7)';
        ctx.lineWidth = 1.7;
        for (let x = 6; x < fLen - 12; x += 6) {
            ctx.beginPath();
            ctx.moveTo(x, -9.5);
            ctx.lineTo(x, 9.5);
            ctx.stroke();
        }
        ctx.restore();
    }

    if (part === 'forearm') return;

    ctx.save();
    ctx.translate(ik.hx, ik.hy);
    const sRad = -shinaiAngleDeg * Math.PI / 180;
    ctx.rotate(sRad);

    ctx.fillStyle = koteColor1;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.4;

    ctx.beginPath();
    ctx.roundRect(-10, -11.5, 20, 22, [8, 9, 8, 7]);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(110, 152, 216, 0.42)';
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.arc(0, -2, 6.5, -2.2, -0.4);
    ctx.stroke();

    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-3.5, 9);
    ctx.lineTo(-3.5, 3.5);
    ctx.moveTo(3.5, 9);
    ctx.lineTo(3.5, 3.5);
    ctx.stroke();

    ctx.restore();
}

function renderFighterPose(ctx, pose) {
    const hipX = pose.hipX ?? 132;
    const hipY = pose.hipY ?? 258;
    const backFootX = pose.backFootX ?? 98;
    const backFootY = pose.backFootY ?? 374;
    const backHeel = pose.backHeel ?? 6;
    const frontFootX = pose.frontFootX ?? 168;
    const frontFootY = pose.frontFootY ?? 374;
    const frontHeel = pose.frontHeel ?? 0;
    const torsoLean = pose.torsoLean ?? 0.06;
    const torsoTwist = pose.torsoTwist ?? 0;
    const breath = pose.breath ?? 0;
    const tareSway = pose.tareSway ?? 0;
    const hakamaSway = pose.hakamaSway ?? 0;
    const headPitch = pose.headPitch ?? 0.02;
    const mendareSway = pose.mendareSway ?? 0;
    const gripX = pose.gripX ?? 166;
    const gripY = pose.gripY ?? 232;
    const shinaiAngle = pose.shinaiAngle ?? 26;
    const shinaiFlex = pose.shinaiFlex ?? 0;
    const swingBlur = pose.swingBlur ?? 0;
    const hitDebris = pose.hitDebris ?? 0;

    const anchors = getTorsoAnchors(hipX, hipY, torsoLean, torsoTwist);
    const hands = getHandTargets(gripX, gripY, shinaiAngle);

    drawBareFoot(ctx, backFootX, backFootY, backHeel, 1.0, true);
    drawBareFoot(ctx, frontFootX, frontFootY, frontHeel, 1.04, false);
    drawArmAndKote(ctx, anchors.backShoulder.x, anchors.backShoulder.y, hands.left.x, hands.left.y, shinaiAngle, true, 'upper');
    drawHakama(ctx, hipX, hipY, backFootX, backFootY, frontFootX, frontFootY, hakamaSway);
    drawTorsoAndDo(ctx, hipX, hipY, torsoLean, torsoTwist, breath, tareSway);
    drawHeadMen(ctx, anchors.neck.x, anchors.neck.y, torsoLean * 0.65 + headPitch, mendareSway, hitDebris);
    drawArmAndKote(ctx, anchors.backShoulder.x, anchors.backShoulder.y, hands.left.x, hands.left.y, shinaiAngle, true, 'forearm');
    drawShinai(ctx, gripX, gripY, shinaiAngle, shinaiFlex, swingBlur);
    drawArmAndKote(ctx, anchors.backShoulder.x, anchors.backShoulder.y, hands.left.x, hands.left.y, shinaiAngle, true, 'fist');
    drawArmAndKote(ctx, anchors.frontShoulder.x, anchors.frontShoulder.y, hands.right.x, hands.right.y, shinaiAngle, false, 'all');
}

// 連続補間された骨格ポーズを足裏基準原点 (0, 0) でキャンバスに描画
function drawArticulatedPoseOnCanvas(ctx, pose, alpha = 1) {
    const scale = CANVAS_W / VIRTUAL_W;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.scale(scale, scale);
    ctx.translate(-ANCHOR_FOOT_X, -ANCHOR_FOOT_Y);
    renderFighterPose(ctx, pose);
    ctx.restore();
}

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
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
function lerp(a, b, t) { return a + (b - a) * t; }

// 各ファイター用の滑らか60fpsアニメーター状態
function createAnimator(phaseOffset = 0) {
    return {
        phaseOffset,
        keyframes: null,
        seqStartTime: 0,
        lastKeyIndex: -1,
        currentSprite: 'idle',
        prevSprite: 'idle',
        spriteBlendStart: 0,
        currentPose: createDefaultPose(),
        startPoseSnapshot: null,
        posX: 0,
        prevPosX: 0,
        posY: 0,
        scaleX: 1,
        scaleY: 1,
        rot: 0,
        clothVel: 0,
        clothOffset: 0,
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

// アクションごとの64コマ連続ポーズ・キーフレーム定義（全関節が60fpsでヌルっと補間される）
function buildActionKeyframes(action, outcome, neutralSprite, startPose, endPose) {
    const m = POSE_ROWS.men;
    const k = POSE_ROWS.kote;
    const d = POSE_ROWS.do;
    const ts = POSE_ROWS.tsuki;
    const df = POSE_ROWS.defend;
    const bk = POSE_ROWS.breakAttack;
    const h = POSE_ROWS.hit;

    const windupPose = action === '胴' ? d[1] : (action === '突き' ? ts[1] : (action === '小手' ? k[1] : m[1]));

    // 被ダメージ時は予備動作の直後に相手の一撃を受けて後退（6コマ連続ノックバック＆リカバリー）
    if (outcome === 'hit') {
        if (neutralSprite === 'hit') {
            return [
                { t: 0,   sprite: 'idle_0', pose: startPose,  x: 0,   y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: 120, sprite: 'men_0',  pose: windupPose, x: 3,   y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeOutCubic },
                { t: 175, sprite: 'hit_0',  pose: h[0],       x: -6,  y: 0, scaleX: 0.98, scaleY: 1.02, rot: -0.03, ease: easeOutQuart, fx: 'sparks', flash: 0.65 },
                { t: 290, sprite: 'hit_1',  pose: h[1],       x: -11, y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.05, ease: easeOutCubic, fx: 'dust' },
                { t: 460, sprite: 'hit_2',  pose: h[2],       x: -13, y: 0, scaleX: 1.01, scaleY: 0.99, rot: -0.04, ease: easeInOutSine, fx: 'dust' },
                { t: 940, sprite: 'hit',    pose: endPose,    x: -10, y: 0, scaleX: 1.01, scaleY: 0.99, rot: -0.03, ease: easeInOutSine },
            ];
        }
        return [
            { t: 0,   sprite: 'idle_0', pose: startPose,  x: 0,   y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            { t: 120, sprite: 'men_0',  pose: windupPose, x: 3,   y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeOutCubic },
            { t: 175, sprite: 'hit_0',  pose: h[0],       x: -6,  y: 0, scaleX: 0.98, scaleY: 1.02, rot: -0.03, ease: easeOutQuart, fx: 'sparks', flash: 0.65 },
            { t: 280, sprite: 'hit_1',  pose: h[1],       x: -11, y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.05, ease: easeOutCubic, fx: 'dust' },
            { t: 430, sprite: 'hit_2',  pose: h[2],       x: -13, y: 0, scaleX: 1.01, scaleY: 0.99, rot: -0.03, ease: easeInOutSine },
            { t: 600, sprite: 'hit_3',  pose: h[3],       x: -8,  y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.01, ease: easeInOutQuad, fx: 'dust' },
            { t: 770, sprite: 'hit_4',  pose: h[4],       x: -3,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            { t: 940, sprite: neutralSprite, pose: endPose, x: 0, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
        ];
    }

    if (action === '面') {
        return [
            { t: 0,   sprite: 'idle_0', pose: startPose, x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeInOutSine },
            { t: 65,  sprite: 'men_0',  pose: m[0],      x: -1, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeInOutSine },
            { t: 125, sprite: 'men_1',  pose: m[1],      x: -2, y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.01, ease: easeInOutSine },
            { t: 185, sprite: 'men_2',  pose: m[2],      x: -3, y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.02, ease: easeOutCubic },
            { t: 235, sprite: 'men_3',  pose: m[3],      x: -2, y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.01, ease: easeInOutSine },
            { t: 275, sprite: 'men_4',  pose: m[4],      x: 2,  y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01, ease: easeInOutSine },
            { t: 310, sprite: 'men_5',  pose: m[5],      x: 5,  y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.02, ease: easeOutQuart },
            { t: 350, sprite: 'men_6',  pose: m[6],      x: 7,  y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02, ease: easeOutQuart, fx: 'lunge_men' },
            { t: 540, sprite: 'men_6',  pose: m[6],      x: 6,  y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01, ease: easeInOutSine },
            { t: 740, sprite: 'men_7',  pose: m[7],      x: 3,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeInOutSine },
            { t: 940, sprite: neutralSprite, pose: endPose, x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0,   ease: easeInOutSine },
        ];
    }

    if (action === '小手') {
        return [
            { t: 0,   sprite: 'idle_0', pose: startPose, x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeInOutSine },
            { t: 65,  sprite: 'kote_0', pose: k[0],      x: -1, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeInOutSine },
            { t: 130, sprite: 'kote_1', pose: k[1],      x: -2, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: -0.01, ease: easeInOutSine },
            { t: 190, sprite: 'kote_2', pose: k[2],      x: -1, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeOutCubic },
            { t: 235, sprite: 'kote_3', pose: k[3],      x: 3,  y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01, ease: easeInOutSine },
            { t: 280, sprite: 'kote_4', pose: k[4],      x: 6,  y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.02, ease: easeOutQuart, fx: 'lunge_kote' },
            { t: 430, sprite: 'kote_5', pose: k[5],      x: 5,  y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01, ease: easeInOutSine },
            { t: 650, sprite: 'kote_6', pose: k[6],      x: 2,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeInOutSine },
            { t: 800, sprite: 'kote_7', pose: k[7],      x: 1,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeInOutSine },
            { t: 940, sprite: neutralSprite, pose: endPose, x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0,   ease: easeInOutSine },
        ];
    }

    if (action === '胴') {
        return [
            { t: 0,   sprite: 'idle_0', pose: startPose, x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeInOutSine },
            { t: 70,  sprite: 'do_0',   pose: d[0],      x: -2, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: -0.01, ease: easeInOutSine },
            { t: 140, sprite: 'do_1',   pose: d[1],      x: -3, y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.02, ease: easeInOutSine },
            { t: 205, sprite: 'do_2',   pose: d[2],      x: -2, y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.01, ease: easeOutCubic, fx: 'dust' },
            { t: 255, sprite: 'do_3',   pose: d[3],      x: 3,  y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01, ease: easeInOutSine },
            { t: 300, sprite: 'do_4',   pose: d[4],      x: 6,  y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02, ease: easeOutQuart },
            { t: 345, sprite: 'do_5',   pose: d[5],      x: 8,  y: 0, scaleX: 1.03, scaleY: 0.98, rot: 0.03, ease: easeOutQuart, fx: 'lunge_do' },
            { t: 540, sprite: 'do_6',   pose: d[6],      x: 6,  y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01, ease: easeInOutSine },
            { t: 750, sprite: 'do_7',   pose: d[7],      x: 2,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeInOutSine },
            { t: 940, sprite: neutralSprite, pose: endPose, x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0,   ease: easeInOutSine },
        ];
    }

    if (action === '突き') {
        return [
            { t: 0,   sprite: 'counter_0', pose: startPose, x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            { t: 65,  sprite: 'tsuki_0',   pose: ts[0],     x: -3, y: 0, scaleX: 1.01, scaleY: 0.99, rot: -0.01, ease: easeInOutSine },
            { t: 130, sprite: 'tsuki_1',   pose: ts[1],     x: -5, y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.02, ease: easeInOutSine },
            { t: 190, sprite: 'tsuki_2',   pose: ts[2],     x: -6, y: 0, scaleX: 1.03, scaleY: 0.97, rot: -0.02, ease: easeOutCubic, fx: 'dust' },
            { t: 235, sprite: 'tsuki_3',   pose: ts[3],     x: 3,  y: 0, scaleX: 1.03, scaleY: 0.98, rot: 0.02,  ease: easeInOutSine },
            { t: 275, sprite: 'tsuki_4',   pose: ts[4],     x: 7,  y: 0, scaleX: 1.04, scaleY: 0.97, rot: 0.03,  ease: easeOutQuart, fx: 'lunge_tsuki' },
            { t: 500, sprite: 'tsuki_5',   pose: ts[5],     x: 6,  y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.02,  ease: easeInOutSine },
            { t: 720, sprite: 'tsuki_6',   pose: ts[6],     x: 3,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0.01,  ease: easeInOutSine },
            { t: 840, sprite: 'tsuki_7',   pose: ts[7],     x: 1,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            { t: 940, sprite: neutralSprite, pose: endPose, x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
        ];
    }

    if (action === '崩し') {
        return [
            { t: 0,   sprite: 'idle_0', pose: startPose, x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,    ease: easeInOutSine },
            { t: 105, sprite: 'brk_0',  pose: bk[0],     x: -3, y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.01, ease: easeOutCubic },
            { t: 190, sprite: 'brk_1',  pose: bk[1],     x: 4,  y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02, ease: easeInOutSine, fx: 'dust' },
            { t: 255, sprite: 'brk_2',  pose: bk[2],     x: 8,  y: 0, scaleX: 1.04, scaleY: 0.97, rot: 0.03, ease: easeOutQuart, fx: 'lunge_break' },
            { t: 510, sprite: 'brk_2',  pose: bk[2],     x: 6,  y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.02, ease: easeInOutSine },
            { t: 730, sprite: 'brk_3',  pose: bk[3],     x: 2,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0.01, ease: easeInOutSine },
            { t: 940, sprite: neutralSprite, pose: endPose, x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0,   ease: easeInOutSine },
        ];
    }

    // 防御
    return [
        { t: 0,   sprite: 'idle_0', pose: startPose, x: 0,  y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
        { t: 95,  sprite: 'def_0',  pose: df[0],     x: -2, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: -0.01, ease: easeOutCubic },
        { t: 195, sprite: 'def_1',  pose: df[1],     x: -4, y: 0, scaleX: 1.01, scaleY: 0.99, rot: -0.02, ease: easeOutCubic, fx: outcome === 'block_success' ? 'shield_success' : 'shield' },
        { t: 340, sprite: 'def_2',  pose: df[2],     x: -6, y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.02, ease: easeOutCubic },
        { t: 620, sprite: 'def_3',  pose: df[3],     x: -2, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: -0.01, ease: easeInOutSine },
        { t: 940, sprite: neutralSprite, pose: endPose, x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0,    ease: easeInOutSine },
    ];
}

function triggerFighterAnimation(who, action, outcome) {
    const anim = animators[who];
    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const finalStance = state.gameOver
        ? (who === 'player' ? state.playerAnimState : state.enemyAnimState)
        : getNeutralAnim(who);
    const startSnapshot = { ...anim.currentPose };
    const endTargetPose = getContinuousStancePose(finalStance, (now + 940) * 0.0042 + anim.phaseOffset);
    anim.keyframes = buildActionKeyframes(action, outcome, finalStance, startSnapshot, endTargetPose);
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

// スプライトシートの指定コマを足裏基準原点 (0, 0) で描画
function drawSingleSpriteFrame(ctx, spriteKey, alpha = 1) {
    const def = spriteDefinition[spriteKey] || spriteDefinition.idle;
    if (!def || !sprite.complete || sprite.naturalWidth === 0) return;

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

    const footX = def.footX !== undefined ? def.footX : Math.round(ANCHOR_FOOT_X * (FRAME_W / VIRTUAL_W));
    const footY = def.footY !== undefined ? def.footY : Math.round(ANCHOR_FOOT_Y * (FRAME_H / VIRTUAL_H));

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

    const anim = animators[who];
    const dir = flip ? -1 : 1;
    const baseFootX = CANVAS_W / 2 - dir * 18;
    const isCounter = who === 'player' ? state.playerCounterReady : state.enemyCounterReady;
    const kiai = who === 'player' ? state.playerKiai : state.enemyKiai;
    const defaultSprite = state.gameOver
        ? (who === 'player' ? state.playerAnimState : state.enemyAnimState)
        : getNeutralAnim(who);

    let targetPose;

    // 1. キーフレーム連続再生中か、待機モーション（60fps呼吸・すり足）かを計算
    if (anim.keyframes) {
        const elapsed = Math.max(0, now - anim.seqStartTime);
        const kfs = anim.keyframes;
        const lastKf = kfs[kfs.length - 1];

        if (elapsed >= lastKf.t) {
            anim.keyframes = null;
            setSpriteWithFade(anim, defaultSprite, now);
            const speedMult = (isCounter || kiai >= MAX_KIAI) ? 1.35 : 1.0;
            const phase = now * 0.0042 * speedMult + anim.phaseOffset;
            targetPose = getContinuousStancePose(defaultSprite, phase);
            anim.currentPose = interpolatePose(anim.currentPose, targetPose, 0.25);
            const endX = (state.gameOver && defaultSprite === 'hit') ? -10 : 0;
            const endRot = (state.gameOver && defaultSprite === 'hit') ? -0.03 : 0;
            anim.posX = lerp(anim.posX, endX, 0.25);
            anim.posY = 0;
            anim.scaleX = lerp(anim.scaleX, 1, 0.25);
            anim.scaleY = lerp(anim.scaleY, 1, 0.25);
            anim.rot = lerp(anim.rot, endRot, 0.25);
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

            // キーフレーム到達時のエフェクト・残像トリガー
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
                    spawnDust(anim, currentFootX + dir * 18, GROUND_Y, dir);
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

            // 60fps 連続関節ポーズ補間（すべての骨格・竹刀角度・足運びを滑らかに補間）
            anim.currentPose = interpolatePose(k0.pose, k1.pose, easedT);
            anim.posX = lerp(k0.x, k1.x, easedT);
            anim.posY = 0;
            anim.scaleX = lerp(k0.scaleX, k1.scaleX, easedT);
            anim.scaleY = lerp(k0.scaleY, k1.scaleY, easedT);
            anim.rot = lerp(k0.rot, k1.rot, easedT);

            // 高速踏み込み・打突スイング中は連続ポーズ残像を追加
            const poseLungeDist = Math.abs((anim.currentPose.hipX - 132) * 0.47 + anim.posX);
            if (poseLungeDist > 10 && Math.random() < 0.42) {
                anim.afterimages.push({
                    pose: { ...anim.currentPose, swingBlur: 0, hitDebris: 0 },
                    posX: anim.posX,
                    scaleX: anim.scaleX,
                    scaleY: anim.scaleY,
                    rot: anim.rot,
                    alpha: 0.22,
                });
            }
        }
    } else {
        // 待機中（または決着後）の滑らかな60fps呼吸・すり足・剣先の揺らぎ
        const speedMult = (isCounter || kiai >= MAX_KIAI) ? 1.38 : 1.0;
        const phase = now * 0.0042 * speedMult + anim.phaseOffset;
        const normalizedPhase = ((phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const frameIdx = Math.floor((normalizedPhase / (Math.PI * 2)) * 8) % 8;
        setSpriteWithFade(anim, defaultSprite === 'idle' ? `idle_${frameIdx}` : defaultSprite, now);

        targetPose = getContinuousStancePose(defaultSprite, phase);
        anim.currentPose = interpolatePose(anim.currentPose, targetPose, 0.18);
        anim.posY = 0;

        if (state.gameOver && defaultSprite === 'hit') {
            anim.posX = lerp(anim.posX, -10, 0.12);
            anim.scaleX = lerp(anim.scaleX, 1.01, 0.12);
            anim.scaleY = lerp(anim.scaleY, 0.99, 0.12);
            anim.rot = lerp(anim.rot, -0.03, 0.12);
        } else {
            const suriashiX = Math.sin(phase * 0.55) * 2.2;
            anim.posX = lerp(anim.posX, suriashiX, 0.16);
            anim.scaleX = lerp(anim.scaleX, 1.0, 0.16);
            anim.scaleY = lerp(anim.scaleY, 1.0, 0.16);
            anim.rot = lerp(anim.rot, 0, 0.16);
        }
    }

    // 二次物理（袴・垂・面紐の慣性揺れ）を更新してポーズに反映
    const currentHipWorldX = anim.posX + (anim.currentPose.hipX - 132) * (CANVAS_W / VIRTUAL_W);
    const velX = currentHipWorldX - anim.prevPosX;
    anim.prevPosX = currentHipWorldX;
    const springForce = -velX * 1.45 - anim.clothOffset * 0.22;
    anim.clothVel = (anim.clothVel + springForce) * 0.78;
    anim.clothOffset = Math.max(-10, Math.min(10, anim.clothOffset + anim.clothVel));

    const renderPose = {
        ...anim.currentPose,
        hakamaSway: (anim.currentPose.hakamaSway || 0) + anim.clothOffset * 0.85,
        tareSway: (anim.currentPose.tareSway || 0) - anim.clothOffset * 0.35,
        mendareSway: (anim.currentPose.mendareSway || 0) - anim.clothOffset * 0.45,
    };

    const pivotX = baseFootX + dir * anim.posX;
    const pivotY = GROUND_Y;
    const vScale = CANVAS_W / VIRTUAL_W;

    // 応じ技構え・気合MAX時のオーラ粒子生成（足元から立ち昇る）
    if (!state.gameOver && (isCounter || kiai >= MAX_KIAI) && Math.random() < 0.25) {
        const hipScreenX = pivotX + dir * (renderPose.hipX - ANCHOR_FOOT_X) * vScale;
        anim.particles.push({
            kind: 'aura',
            x: hipScreenX + (Math.random() - 0.5) * 56,
            y: GROUND_Y - Math.random() * 24,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(0.8 + Math.random() * 1.2),
            r: 2.5 + Math.random() * 3.5,
            alpha: 0.65,
            decay: 0.018,
            color: isCounter ? '249, 115, 22' : '250, 204, 21',
        });
    }

    // 2. 前足・後足・重心に連動する接地シャドウ（コンタクトシャドウ）描画
    const backFootScreenX = pivotX + dir * (renderPose.backFootX - ANCHOR_FOOT_X) * vScale;
    const frontFootScreenX = pivotX + dir * (renderPose.frontFootX - ANCHOR_FOOT_X) * vScale;
    const midFootScreenX = (backFootScreenX + frontFootScreenX) * 0.5;
    const strideHalfSpan = Math.max(22, Math.abs(frontFootScreenX - backFootScreenX) * 0.62);
    const frontLiftRatio = Math.max(0.35, 1 - Math.max(0, ANCHOR_FOOT_Y - renderPose.frontFootY) * 0.035);

    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.48)';
    ctx.beginPath();
    ctx.ellipse(midFootScreenX, pivotY + 1, strideHalfSpan, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 後足直下の接地影
    ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
    ctx.beginPath();
    ctx.ellipse(backFootScreenX, pivotY, 13, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 前足直下の接地影（踏み込みや被弾で足が浮くと影が自然に小さくなる）
    ctx.fillStyle = `rgba(2, 6, 23, ${0.72 * frontLiftRatio})`;
    ctx.beginPath();
    ctx.ellipse(frontFootScreenX, pivotY, 14 * frontLiftRatio, 2.9 * frontLiftRatio, 0, 0, Math.PI * 2);
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
        if (img.pose) {
            drawArticulatedPoseOnCanvas(ctx, img.pose, img.alpha);
        } else if (img.sprite) {
            drawSingleSpriteFrame(ctx, img.sprite, img.alpha);
        }
        ctx.restore();
    }

    // 4. キャラクター本体の60fps連続関節描画
    ctx.save();
    ctx.translate(pivotX, pivotY);
    if (flip) ctx.scale(-1, 1);
    ctx.rotate(anim.rot);
    ctx.scale(anim.scaleX, anim.scaleY);
    drawArticulatedPoseOnCanvas(ctx, renderPose, 1);
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
        if (state.playerGuardBroken) return 'guardBroken';
        if (state.playerCounterReady || state.playerKiai >= MAX_KIAI) return 'counterReady';
        return 'idle';
    } else {
        if (state.enemyGuardBroken) return 'guardBroken';
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

    // 決着時も含め、打突・被弾の連続キーフレームアニメーションを再生
    triggerFighterAnimation('player', playerAction, playerOutcome);
    triggerFighterAnimation('enemy', enemyAction, enemyOutcome);

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
