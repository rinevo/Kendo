const MAX_HEALTH = 5;
const MAX_KIAI = 3;

// 勝ち抜き五人掛け：個性・剣風・胴カラーが異なる5人の剣士データ
const ENEMY_ROSTER = [
    {
        id: 'kenta',
        role: '先鋒',
        shortName: '健太',
        name: '門下生・健太',
        rank: '初段',
        styleTag: '素直な面打ち',
        maxHealth: 4,
        initialKiai: 0,
        introQuote: '「お願いします！まずは真っ直ぐ面で勝負です！」',
        armorTheme: {
            doStops: ['#14161b', '#252932', '#475569', '#22262e', '#111318'],
            muneFill: '#1e293b',
            muneStitch: 'rgba(226, 232, 240, 0.72)',
            tareLine: 'rgba(148, 163, 184, 0.5)',
        },
        patterns: [
            {
                stance: 'jodan',
                hint: '🔥【上段の構え】健太は竹刀を頭上に振りかぶり、渾身の「上段面(2ダメ)」を狙っている！（弱点の「小手」なら2ダメ、または「胴」が有効！）',
                isDanger: true,
                weights: { 面: 68, 小手: 20, 胴: 12, 防御: 0, 崩し: 0, 突き: 0 },
            },
            {
                stance: 'chudan',
                hint: '⚖️【中段の構え】健太は元気よく「面」か「小手」に飛び込もうとしている！（「防御」や「胴」が有効）',
                isDanger: false,
                weights: { 面: 50, 小手: 35, 胴: 10, 防御: 5, 崩し: 0, 突き: 0 },
            },
            {
                stance: 'chudan',
                hint: '🛡️【中段の構え】健太は少し緊張して守りを意識しつつ「面」を狙っている…（「崩し」や「胴」の好機！）',
                isDanger: false,
                weights: { 防御: 40, 面: 40, 小手: 15, 胴: 5, 崩し: 0, 突き: 0 },
            },
        ],
    },
    {
        id: 'sasaki',
        role: '次鋒',
        shortName: '佐々木',
        name: '小手名人・佐々木',
        rank: '三段',
        styleTag: '出ばな小手と脇構えの受け',
        maxHealth: 5,
        initialKiai: 0,
        introQuote: '「手元の隙は見逃さん。出ばな小手と脇構えの妙技、受けてみよ！」',
        armorTheme: {
            doStops: ['#082f49', '#0369a1', '#38bdf8', '#075985', '#0c4a6e'],
            muneFill: '#0f172a',
            muneStitch: 'rgba(56, 189, 248, 0.88)',
            tareLine: 'rgba(56, 189, 248, 0.65)',
        },
        patterns: [
            {
                stance: 'chudan',
                hint: '⚡【中段の構え】佐々木は鋭い視線であなたの手元（「小手」）を狙っている！（「面」で上から乗り切る好機！）',
                isDanger: false,
                weights: { 小手: 60, 防御: 20, 面: 10, 胴: 10, 崩し: 0, 突き: 0 },
            },
            {
                stance: 'waki',
                hint: '🌊【脇構え】佐々木は竹刀を脇へ低く隠し、「後の先防御(気+2/HP+1)」か「抜き胴」を狙っている！（「崩し」で防御を割るか、「小手」が有効！）',
                isDanger: false,
                weights: { 防御: 55, 小手: 25, 胴: 15, 面: 5, 崩し: 0, 突き: 0 },
            },
            {
                stance: 'waki',
                hint: '🌊【脇構え】佐々木は半身の構えから「小手」と「抜き胴(対崩2ダメ)」の二択を迫っている…',
                isDanger: false,
                weights: { 小手: 48, 胴: 32, 防御: 12, 面: 8, 崩し: 0, 突き: 0 },
            },
        ],
    },
    {
        id: 'onizuka',
        role: '中堅',
        shortName: '鬼塚',
        name: '剛剣・鬼塚',
        rank: '四段',
        styleTag: '剛剣上段と豪快な崩し',
        maxHealth: 6,
        initialKiai: 1,
        introQuote: '「小細工は無用！火の上段と体当たりの『崩し』で叩き割ってくれるわ！」',
        armorTheme: {
            doStops: ['#450a0a', '#991b1b', '#ef4444', '#7f1d1d', '#3b0707'],
            muneFill: '#291010',
            muneStitch: 'rgba(250, 204, 21, 0.9)',
            tareLine: 'rgba(248, 113, 113, 0.65)',
        },
        patterns: [
            {
                stance: 'chudan',
                hint: '💥【中段の構え】鬼塚は強引に間合いを詰め、「崩し」の体当たりか豪快な「胴」を狙っている！（基本打突で迎撃せよ）',
                isDanger: true,
                weights: { 崩し: 52, 胴: 30, 面: 12, 小手: 6, 防御: 0, 突き: 0 },
            },
            {
                stance: 'jodan',
                hint: '🔥【上段の構え】鬼塚が竹刀を頭上に掲げた！強烈な「上段面(2ダメ)」か「胴」が来るぞ！（弱点の「小手」で手元を射抜け！）',
                isDanger: true,
                weights: { 面: 48, 胴: 36, 崩し: 10, 小手: 6, 防御: 0, 突き: 0 },
            },
            {
                stance: 'jodan',
                hint: '🔥【上段の構え】鬼塚は上段から「上段面(2ダメ)」と「崩し」で粉砕する気配！（「小手」なら+1ボーナスダメージ！）',
                isDanger: true,
                weights: { 面: 45, 崩し: 35, 胴: 15, 小手: 5, 防御: 0, 突き: 0 },
            },
        ],
    },
    {
        id: 'kasumi',
        role: '副将',
        shortName: '霞',
        name: '幻影・霞',
        rank: '五段',
        styleTag: '三構え変化と応じ技',
        maxHealth: 5,
        initialKiai: 0,
        introQuote: '「中段・上段・脇構え…見えている太刀筋だけが真実とは限りませんよ…」',
        armorTheme: {
            doStops: ['#2e1065', '#581c87', '#a855f7', '#4c1d95', '#1e1b4b'],
            muneFill: '#1e1b4b',
            muneStitch: 'rgba(216, 180, 254, 0.88)',
            tareLine: 'rgba(192, 132, 252, 0.65)',
        },
        patterns: [
            {
                stance: 'waki',
                hint: '🌊【脇構え】霞は静かに竹刀を脇へ隠し、「後の先防御(気+2/HP+1)」か意表を突く「抜き胴」を狙っている…',
                isDanger: false,
                weights: { 防御: 48, 胴: 28, 小手: 14, 面: 10, 崩し: 0, 突き: 0 },
            },
            {
                stance: 'chudan',
                hint: '👁️【中段の構え】霞は「面」と見せかけて手元の「小手」や「崩し」も織り交ぜる変幻自在の構え！',
                isDanger: false,
                weights: { 小手: 38, 面: 28, 崩し: 22, 防御: 12, 胴: 0, 突き: 0 },
            },
            {
                stance: 'jodan',
                hint: '🔥【上段の構え】霞がすっと諸手上段に構えた！「上段面(2ダメ)」と「胴」の二段変化を狙っているぞ！（手元の「小手」が好機！）',
                isDanger: true,
                weights: { 面: 45, 胴: 42, 小手: 13, 防御: 0, 崩し: 0, 突き: 0 },
            },
        ],
    },
    {
        id: 'ryuzen',
        role: '大将',
        shortName: '龍禅',
        name: '師範代・龍禅',
        rank: '範士八段',
        styleTag: '三位一体の構え・諸手突き',
        maxHealth: 7,
        initialKiai: 1,
        introQuote: '「よくぞここまで勝ち上がった。天地水の三つの構え、全力で超えてみせよ！」',
        armorTheme: {
            doStops: ['#422006', '#a16207', '#facc15', '#854d0e', '#271202'],
            muneFill: '#1c1917',
            muneStitch: 'rgba(253, 224, 71, 0.95)',
            tareLine: 'rgba(250, 204, 21, 0.78)',
        },
        patterns: [
            {
                stance: 'jodan',
                hint: '🔥【上段の構え】龍禅が火の構え（諸手上段）をとった！圧倒的な「上段面(2ダメ)」か「小手」が来るぞ！（「胴」か「小手」で応戦せよ）',
                isDanger: true,
                weights: { 面: 52, 小手: 34, 胴: 14, 防御: 0, 崩し: 0, 突き: 0 },
            },
            {
                stance: 'waki',
                hint: '🌊【脇構え】龍禅は泰然自若の脇構え。「後の先防御(気+2/HP+1)」で受け流すか、守りを読む「崩し」を狙っている！',
                isDanger: true,
                weights: { 防御: 42, 崩し: 28, 小手: 18, 面: 12, 胴: 0, 突き: 0 },
            },
            {
                stance: 'chudan',
                hint: '⚡【中段の構え】龍禅の剣先が鋭く沈んだ！「胴」か電光石火の「面」が来るぞ！',
                isDanger: true,
                weights: { 胴: 45, 面: 35, 小手: 10, 防御: 10, 崩し: 0, 突き: 0 },
            },
        ],
    },
];

const state = {
    stageIndex: 0,
    enemyMaxHealth: ENEMY_ROSTER[0].maxHealth,
    clearedStages: new Set(),
    lastOutcome: null,
    playerHealth: MAX_HEALTH,
    enemyHealth: ENEMY_ROSTER[0].maxHealth,
    playerKiai: 0,
    enemyKiai: ENEMY_ROSTER[0].initialKiai,
    playerCounterReady: false,
    enemyCounterReady: false,
    playerGuardBroken: false,
    enemyGuardBroken: false,
    tsubazeriai: false,
    playerStanceStyle: 'chudan',
    enemyStanceStyle: 'chudan',
    round: 0,
    gameOver: false,
    playerAnimState: 'idle',
    enemyAnimState: 'idle',
    enemyIntent: null,
    animResetTimer: null,
};

function getCurrentEnemy() {
    return ENEMY_ROSTER[state.stageIndex] || ENEMY_ROSTER[0];
}

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
    tsubazeriai:  makeCellDef(6, 6),
    jodan:        makeCellDef(2, 2),
    waki:         makeCellDef(6, 4),
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

    if (stanceType === 'tsubazeriai') {
        const pushVib = Math.sin(phase * 3.4);
        return {
            hipX: 158 + pushVib * 3.2,
            hipY: 266 + c * 2.0,
            backFootX: 86 + s * 2.5,
            backFootY: 374,
            backHeel: 20 + pushVib * 2.5,
            frontFootX: 202 + pushVib * 2.8,
            frontFootY: 374,
            frontHeel: 0,
            torsoLean: 0.25 + pushVib * 0.025,
            torsoTwist: -0.22 + c * 0.06,
            breath: 0.8 + 0.2 * s,
            tareSway: 4 + pushVib * 1.5,
            hakamaSway: -10 + pushVib * 2.5,
            headPitch: -0.02 + c * 0.015,
            mendareSway: 4 + pushVib * 1.8,
            gripX: 192 + pushVib * 3.5,
            gripY: 198 + c * 2.5,
            shinaiAngle: 66 + pushVib * 3.2,
            shinaiFlex: 4 + pushVib * 1.5,
            swingBlur: 0,
            hitDebris: 0,
        };
    }

    if (stanceType === 'jodan') {
        // 🔥 上段の構え（火の構え：竹刀を頭上に大きく振りかぶる超攻撃姿勢）
        return {
            hipX: 136 + s * 4.0,
            hipY: 254 + c * 2.5,
            backFootX: 92 + s * 3.0,
            backFootY: 374,
            backHeel: 12 + s * 2.5,
            frontFootX: 176 + s * 4.5,
            frontFootY: 374,
            frontHeel: 0,
            torsoLean: -0.04 + s * 0.018,
            torsoTwist: 0.08 + c * 0.05,
            breath: 0.75 + 0.25 * s,
            tareSway: -1 + c * 1.5,
            hakamaSway: -5 + c * 3.5,
            headPitch: 0.08 - s * 0.012,
            mendareSway: 3 + c * 2.0,
            gripX: 146 + s * 3.5,
            gripY: 128 + c * 3.2,
            shinaiAngle: 128 + Math.sin(phase + 0.4) * 3.5,
            shinaiFlex: -2,
            swingBlur: 0,
            hitDebris: 0,
        };
    }

    if (stanceType === 'waki') {
        // 🌊 脇構え（水の構え：身体を半身に開き、竹刀を右脇後方へ低く隠す後の先の構え）
        return {
            hipX: 126 + s * 3.8,
            hipY: 263 + c * 2.4,
            backFootX: 92 + s * 2.8,
            backFootY: 374,
            backHeel: 5 + s * 1.8,
            frontFootX: 164 + s * 4.0,
            frontFootY: 374,
            frontHeel: 0,
            torsoLean: 0.04 + s * 0.015,
            torsoTwist: -0.52 + c * 0.06,
            breath: 0.45 + 0.35 * s,
            tareSway: c * 1.2,
            hakamaSway: 2 + c * 3.0,
            headPitch: 0.03 - s * 0.01,
            mendareSway: c * 1.4,
            gripX: 142 + s * 3.2,
            gripY: 244 + c * 2.5,
            shinaiAngle: -28 + Math.sin(phase + 0.5) * 3.0,
            shinaiFlex: 0,
            swingBlur: 0,
            hitDebris: 0,
        };
    }

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

function drawTorsoAndDo(ctx, hipX, hipY, torsoLean, torsoTwist, breath, tareSway, armorTheme = null) {
    const ink = '#080a0f';
    const bScale = 1 + (breath || 0) * 0.025;
    const tareLineColor = (armorTheme && armorTheme.tareLine) || 'rgba(88, 132, 198, 0.45)';
    const muneFillColor = (armorTheme && armorTheme.muneFill) || '#1b1e26';
    const muneStitchColor = (armorTheme && armorTheme.muneStitch) || 'rgba(185, 28, 28, 0.7)';
    const doStops = (armorTheme && armorTheme.doStops) || ['#14161b', '#252932', '#424957', '#22262e', '#111318'];

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

        ctx.strokeStyle = tareLineColor;
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
    doGrad.addColorStop(0, doStops[0]);
    doGrad.addColorStop(0.4, doStops[1]);
    doGrad.addColorStop(0.65, doStops[2]);
    doGrad.addColorStop(0.82, doStops[3]);
    doGrad.addColorStop(1, doStops[4]);

    ctx.fillStyle = muneFillColor;
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

    ctx.strokeStyle = muneStitchColor;
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

function renderFighterPose(ctx, pose, armorTheme = null) {
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
    drawTorsoAndDo(ctx, hipX, hipY, torsoLean, torsoTwist, breath, tareSway, armorTheme);
    drawHeadMen(ctx, anchors.neck.x, anchors.neck.y, torsoLean * 0.65 + headPitch, mendareSway, hitDebris);
    drawArmAndKote(ctx, anchors.backShoulder.x, anchors.backShoulder.y, hands.left.x, hands.left.y, shinaiAngle, true, 'forearm');
    drawShinai(ctx, gripX, gripY, shinaiAngle, shinaiFlex, swingBlur);
    drawArmAndKote(ctx, anchors.backShoulder.x, anchors.backShoulder.y, hands.left.x, hands.left.y, shinaiAngle, true, 'fist');
    drawArmAndKote(ctx, anchors.frontShoulder.x, anchors.frontShoulder.y, hands.right.x, hands.right.y, shinaiAngle, false, 'all');
}

// 連続補間された骨格ポーズを足裏基準原点 (0, 0) でキャンバスに描画
function drawArticulatedPoseOnCanvas(ctx, pose, alpha = 1, armorTheme = null) {
    const scale = CANVAS_W / VIRTUAL_W;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.scale(scale, scale);
    ctx.translate(-ANCHOR_FOOT_X, -ANCHOR_FOOT_Y);
    renderFighterPose(ctx, pose, armorTheme);
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

const battleArena = document.getElementById('battleArena');
const playerHealthTrail = document.getElementById('playerHealthTrail');
const enemyHealthTrail = document.getElementById('enemyHealthTrail');
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
const playerPopupLayer = document.getElementById('playerPopupLayer');
const enemyPopupLayer = document.getElementById('enemyPopupLayer');

const refereeCallout = document.getElementById('refereeCallout');
const refFlagRed = document.getElementById('refFlagRed');
const refFlagWhite = document.getElementById('refFlagWhite');
const refereeMainText = document.getElementById('refereeMainText');
const refereeSubText = document.getElementById('refereeSubText');

const statusText = document.getElementById('statusText');
const intentBox = document.getElementById('intentBox');
const intentText = document.getElementById('intentText');

const btnMen = document.getElementById('btnMen');
const btnKote = document.getElementById('btnKote');
const btnDo = document.getElementById('btnDo');
const btnDefend = document.getElementById('btnDefend');
const btnBreak = document.getElementById('btnBreak');
const btnTsuki = document.getElementById('btnTsuki');
const btnNextStage = document.getElementById('btnNextStage');
const enemyNameText = document.getElementById('enemyNameText');
const enemyTitleBadge = document.getElementById('enemyTitleBadge');
const playerTitleBadge = document.getElementById('playerTitleBadge');
const stageBar = document.getElementById('stageBar');
const stageProgressText = document.getElementById('stageProgressText');
const vsDivider = document.getElementById('vsDivider');
const stanceSelectorBar = document.getElementById('stanceSelectorBar');
const stanceDescText = document.getElementById('stanceDescText');
const actionButtons = [btnMen, btnKote, btnDo, btnDefend, btnBreak, btnTsuki];

let refereeHideTimer = null;
let pendingImpactTimer = null;
let pendingImpactCallback = null;
let pendingRoundTimer = null;
let pendingRoundCallback = null;

function setActionButtonsLocked(locked) {
    actionButtons.forEach((btn) => {
        if (btn) btn.disabled = locked;
    });
}

function clearPendingRoundTimers() {
    if (pendingImpactTimer) {
        clearTimeout(pendingImpactTimer);
        pendingImpactTimer = null;
    }
    pendingImpactCallback = null;
    if (pendingRoundTimer) {
        clearTimeout(pendingRoundTimer);
        pendingRoundTimer = null;
    }
    pendingRoundCallback = null;
}

function firePendingImpact() {
    if (pendingImpactTimer) {
        clearTimeout(pendingImpactTimer);
        pendingImpactTimer = null;
    }
    if (pendingImpactCallback) {
        const impactFn = pendingImpactCallback;
        pendingImpactCallback = null;
        impactFn();
    }
}

function flushPendingRound() {
    firePendingImpact();
    if (pendingRoundTimer) {
        clearTimeout(pendingRoundTimer);
        pendingRoundTimer = null;
    }
    if (pendingRoundCallback) {
        const roundFn = pendingRoundCallback;
        pendingRoundCallback = null;
        roundFn();
    }
}

// ヒットストップ＆スローモーション管理
const timeState = {
    hitStopUntil: 0,
    slowMoUntil: 0,
    slowMoFactor: 0.28,
};

function triggerHitStop(stopMs, slowMs = 0, slowFactor = 0.28) {
    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    timeState.hitStopUntil = Math.max(timeState.hitStopUntil, now + stopMs);
    if (slowMs > 0) {
        timeState.slowMoUntil = Math.max(timeState.slowMoUntil, now + stopMs + slowMs);
        timeState.slowMoFactor = slowFactor;
    }
}

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
        virtualElapsed: 0,
        lastUpdateNow: 0,
        lastKeyIndex: -1,
        impactWeight: 'normal',
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
        shockwaves: [],
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

function spawnSparks(anim, x, y, color = '251, 191, 36', count = 14, speedMult = 1) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (1.5 + Math.random() * 4.4) * speedMult;
        anim.particles.push({
            kind: 'spark',
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.8,
            r: (2 + Math.random() * 2.6) * (speedMult > 1 ? 1.2 : 1),
            alpha: 1,
            decay: 0.032 + Math.random() * 0.02,
            color,
        });
    }
}

function spawnShockwave(anim, x, y, color = '250, 204, 21', isHeavy = false) {
    anim.shockwaves.push({
        x,
        y,
        r: isHeavy ? 10 : 7,
        maxR: isHeavy ? 64 : 44,
        alpha: isHeavy ? 1.0 : 0.85,
        color,
        isHeavy,
        rays: Array.from({ length: isHeavy ? 10 : 6 }, (_, i) => ({
            angle: (i / (isHeavy ? 10 : 6)) * Math.PI * 2 + (Math.random() - 0.5) * 0.25,
            len: (isHeavy ? 26 : 16) + Math.random() * 14,
        })),
    });
}

const STRIKE_IMPACT_T = 380;
const ANIM_TOTAL_T = 1040;

// アクションごとの64コマ連続ポーズ・キーフレーム定義（全関節が60fpsでヌルっと補間される）
function buildActionKeyframes(action, outcome, neutralSprite, startPose, endPose, wasTsubazeriai = false) {
    const m = POSE_ROWS.men;
    const k = POSE_ROWS.kote;
    const d = POSE_ROWS.do;
    const ts = POSE_ROWS.tsuki;
    const df = POSE_ROWS.defend;
    const bk = POSE_ROWS.breakAttack;
    const h = POSE_ROWS.hit;
    const startX = wasTsubazeriai ? 8 : 0;
    const endTargetX = neutralSprite === 'tsubazeriai' ? 8 : 0;

    // 被ダメージ後の仰け反り・復帰キーフレーム列（t = STRIKE_IMPACT_T から開始）
    const buildHitTail = () => {
        if (neutralSprite === 'hit') {
            return [
                { t: 430,          sprite: 'hit_0', pose: h[0],    x: -6,  y: 0, scaleX: 0.98, scaleY: 1.02, rot: -0.03, ease: easeOutQuart, fx: 'hitstop' },
                { t: 545,          sprite: 'hit_1', pose: h[1],    x: -11, y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.05, ease: easeOutCubic, fx: 'dust' },
                { t: 710,          sprite: 'hit_2', pose: h[2],    x: -13, y: 0, scaleX: 1.01, scaleY: 0.99, rot: -0.04, ease: easeInOutSine, fx: 'dust' },
                { t: ANIM_TOTAL_T, sprite: 'hit',   pose: endPose, x: -10, y: 0, scaleX: 1.01, scaleY: 0.99, rot: -0.03, ease: easeInOutSine },
            ];
        }
        return [
            { t: 430,          sprite: 'hit_0',       pose: h[0],    x: -6,         y: 0, scaleX: 0.98, scaleY: 1.02, rot: -0.03, ease: easeOutQuart, fx: 'hitstop' },
            { t: 535,          sprite: 'hit_1',       pose: h[1],    x: -11,        y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.05, ease: easeOutCubic, fx: 'dust' },
            { t: 675,          sprite: 'hit_2',       pose: h[2],    x: -13,        y: 0, scaleX: 1.01, scaleY: 0.99, rot: -0.03, ease: easeInOutSine },
            { t: 805,          sprite: 'hit_3',       pose: h[3],    x: -8,         y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.01, ease: easeInOutQuad, fx: 'dust' },
            { t: 925,          sprite: 'hit_4',       pose: h[4],    x: -3,         y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            { t: ANIM_TOTAL_T, sprite: neutralSprite, pose: endPose, x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
        ];
    };

    let actionKeyframes;

    if (action === '面') {
        if (wasTsubazeriai) {
            // 引き面：鍔迫り合いの至近距離から相手を突き放し、後方へ跳び退きながら面を振り抜く
            actionKeyframes = [
                { t: 0,               sprite: 'brk_2',       pose: startPose, x: startX,     y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02,  ease: easeInOutSine },
                { t: 75,              sprite: 'brk_2',       pose: bk[2],     x: 10,         y: 0, scaleX: 1.03, scaleY: 0.97, rot: 0.03,  ease: easeOutCubic, fx: 'dust' },
                { t: 155,             sprite: 'men_2',       pose: m[2],      x: 4,          y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.02, ease: easeInOutSine },
                { t: 230,             sprite: 'men_3',       pose: m[3],      x: -2,         y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.02, ease: easeOutCubic, fx: 'dust' },
                { t: 310,             sprite: 'men_5',       pose: m[5],      x: -5,         y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.01,  ease: easeOutQuart },
                { t: STRIKE_IMPACT_T, sprite: 'men_6',       pose: m[6],      x: -6,         y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.01,  ease: easeOutQuart, fx: 'lunge_men' },
                { t: 660,             sprite: 'men_6',       pose: m[6],      x: -5,         y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
                { t: 850,             sprite: 'men_7',       pose: m[7],      x: -2,         y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: ANIM_TOTAL_T,    sprite: neutralSprite, pose: endPose,   x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            ];
        } else {
            actionKeyframes = [
                { t: 0,               sprite: 'idle_0',      pose: startPose, x: startX,     y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: 65,              sprite: 'men_0',       pose: m[0],      x: -1,         y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: 130,             sprite: 'men_1',       pose: m[1],      x: -2,         y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.01, ease: easeInOutSine },
                { t: 195,             sprite: 'men_2',       pose: m[2],      x: -3,         y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.02, ease: easeOutCubic },
                { t: 255,             sprite: 'men_3',       pose: m[3],      x: -2,         y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.01, ease: easeInOutSine },
                { t: 300,             sprite: 'men_4',       pose: m[4],      x: 2,          y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
                { t: 340,             sprite: 'men_5',       pose: m[5],      x: 5,          y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.02,  ease: easeOutQuart },
                { t: STRIKE_IMPACT_T, sprite: 'men_6',       pose: m[6],      x: 7,          y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02,  ease: easeOutQuart, fx: 'lunge_men' },
                { t: 660,             sprite: 'men_6',       pose: m[6],      x: 6,          y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
                { t: 850,             sprite: 'men_7',       pose: m[7],      x: 3,          y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: ANIM_TOTAL_T,    sprite: neutralSprite, pose: endPose,   x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            ];
        }
    } else if (action === '小手') {
        if (wasTsubazeriai) {
            // 引き小手：鍔迫り合いから後方へ下がりつつ小手を鋭く打ち抜く
            actionKeyframes = [
                { t: 0,               sprite: 'brk_2',       pose: startPose, x: startX,     y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02,  ease: easeInOutSine },
                { t: 80,              sprite: 'brk_2',       pose: bk[2],     x: 9,          y: 0, scaleX: 1.03, scaleY: 0.97, rot: 0.02,  ease: easeOutCubic, fx: 'dust' },
                { t: 170,             sprite: 'kote_2',      pose: k[2],      x: 3,          y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: -0.01, ease: easeInOutSine },
                { t: 260,             sprite: 'kote_3',      pose: k[3],      x: -3,         y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeOutCubic, fx: 'dust' },
                { t: STRIKE_IMPACT_T, sprite: 'kote_4',      pose: k[4],      x: -6,         y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.01,  ease: easeOutQuart, fx: 'lunge_kote' },
                { t: 640,             sprite: 'kote_4',      pose: k[4],      x: -5,         y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
                { t: 820,             sprite: 'kote_6',      pose: k[6],      x: -2,         y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: ANIM_TOTAL_T,    sprite: neutralSprite, pose: endPose,   x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            ];
        } else {
            actionKeyframes = [
                { t: 0,               sprite: 'idle_0',      pose: startPose, x: startX,     y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: 85,              sprite: 'kote_0',      pose: k[0],      x: -1,         y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: 165,             sprite: 'kote_1',      pose: k[1],      x: -2,         y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: -0.01, ease: easeInOutSine },
                { t: 240,             sprite: 'kote_2',      pose: k[2],      x: -1,         y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeOutCubic },
                { t: 310,             sprite: 'kote_3',      pose: k[3],      x: 3,          y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
                { t: STRIKE_IMPACT_T, sprite: 'kote_4',      pose: k[4],      x: 6,          y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.02,  ease: easeOutQuart, fx: 'lunge_kote' },
                { t: 640,             sprite: 'kote_4',      pose: k[4],      x: 6,          y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
                { t: 760,             sprite: 'kote_5',      pose: k[5],      x: 4,          y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
                { t: 865,             sprite: 'kote_6',      pose: k[6],      x: 2,          y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: 955,             sprite: 'kote_7',      pose: k[7],      x: 1,          y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: ANIM_TOTAL_T,    sprite: neutralSprite, pose: endPose,   x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            ];
        }
    } else if (action === '胴') {
        if (wasTsubazeriai) {
            // 引き胴：鍔迫り合いから身体を開きつつ後方へ退きながら胴を薙ぎ払う
            actionKeyframes = [
                { t: 0,               sprite: 'brk_2',       pose: startPose, x: startX,     y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02,  ease: easeInOutSine },
                { t: 80,              sprite: 'brk_2',       pose: bk[2],     x: 9,          y: 0, scaleX: 1.03, scaleY: 0.97, rot: 0.02,  ease: easeOutCubic, fx: 'dust' },
                { t: 165,             sprite: 'do_2',        pose: d[2],      x: 3,          y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.02, ease: easeInOutSine },
                { t: 255,             sprite: 'do_4',        pose: d[4],      x: -3,         y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.01,  ease: easeOutCubic, fx: 'dust' },
                { t: STRIKE_IMPACT_T, sprite: 'do_5',        pose: d[5],      x: -6,         y: 0, scaleX: 1.03, scaleY: 0.98, rot: 0.02,  ease: easeOutQuart, fx: 'lunge_do' },
                { t: 640,             sprite: 'do_5',        pose: d[5],      x: -5,         y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
                { t: 830,             sprite: 'do_7',        pose: d[7],      x: -2,         y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: ANIM_TOTAL_T,    sprite: neutralSprite, pose: endPose,   x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            ];
        } else {
            actionKeyframes = [
                { t: 0,               sprite: 'idle_0',      pose: startPose, x: startX,     y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: 75,              sprite: 'do_0',        pose: d[0],      x: -2,         y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: -0.01, ease: easeInOutSine },
                { t: 150,             sprite: 'do_1',        pose: d[1],      x: -3,         y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.02, ease: easeInOutSine },
                { t: 220,             sprite: 'do_2',        pose: d[2],      x: -2,         y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.01, ease: easeOutCubic, fx: 'dust' },
                { t: 280,             sprite: 'do_3',        pose: d[3],      x: 3,          y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
                { t: 330,             sprite: 'do_4',        pose: d[4],      x: 6,          y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02,  ease: easeOutQuart },
                { t: STRIKE_IMPACT_T, sprite: 'do_5',        pose: d[5],      x: 8,          y: 0, scaleX: 1.03, scaleY: 0.98, rot: 0.03,  ease: easeOutQuart, fx: 'lunge_do' },
                { t: 640,             sprite: 'do_5',        pose: d[5],      x: 7,          y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.02,  ease: easeInOutSine },
                { t: 790,             sprite: 'do_6',        pose: d[6],      x: 5,          y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
                { t: 920,             sprite: 'do_7',        pose: d[7],      x: 2,          y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
                { t: ANIM_TOTAL_T,    sprite: neutralSprite, pose: endPose,   x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            ];
        }
    } else if (action === '突き') {
        actionKeyframes = [
            { t: 0,               sprite: 'counter_0',   pose: startPose, x: startX,     y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            { t: 85,              sprite: 'tsuki_0',     pose: ts[0],     x: -3,         y: 0, scaleX: 1.01, scaleY: 0.99, rot: -0.01, ease: easeInOutSine },
            { t: 165,             sprite: 'tsuki_1',     pose: ts[1],     x: -5,         y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.02, ease: easeInOutSine },
            { t: 240,             sprite: 'tsuki_2',     pose: ts[2],     x: -6,         y: 0, scaleX: 1.03, scaleY: 0.97, rot: -0.02, ease: easeOutCubic, fx: 'dust' },
            { t: 310,             sprite: 'tsuki_3',     pose: ts[3],     x: 3,          y: 0, scaleX: 1.03, scaleY: 0.98, rot: 0.02,  ease: easeInOutSine },
            { t: STRIKE_IMPACT_T, sprite: 'tsuki_4',     pose: ts[4],     x: 7,          y: 0, scaleX: 1.04, scaleY: 0.97, rot: 0.03,  ease: easeOutQuart, fx: 'lunge_tsuki' },
            { t: 640,             sprite: 'tsuki_4',     pose: ts[4],     x: 6,          y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.02,  ease: easeInOutSine },
            { t: 760,             sprite: 'tsuki_5',     pose: ts[5],     x: 5,          y: 0, scaleX: 1.01, scaleY: 0.99, rot: 0.01,  ease: easeInOutSine },
            { t: 860,             sprite: 'tsuki_6',     pose: ts[6],     x: 3,          y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0.01,  ease: easeInOutSine },
            { t: 950,             sprite: 'tsuki_7',     pose: ts[7],     x: 1,          y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            { t: ANIM_TOTAL_T,    sprite: neutralSprite, pose: endPose,   x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
        ];
    } else if (action === '崩し') {
        actionKeyframes = [
            { t: 0,               sprite: 'idle_0',      pose: startPose, x: startX,     y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            { t: 135,             sprite: 'brk_0',       pose: bk[0],     x: startX - 2, y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.01, ease: easeOutCubic },
            { t: 260,             sprite: 'brk_1',       pose: bk[1],     x: 5,          y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02,  ease: easeInOutSine, fx: 'dust' },
            { t: STRIKE_IMPACT_T, sprite: 'brk_2',       pose: bk[2],     x: 9,          y: 0, scaleX: 1.04, scaleY: 0.97, rot: 0.03,  ease: easeOutQuart, fx: 'lunge_break' },
            { t: 640,             sprite: 'brk_2',       pose: bk[2],     x: 6,          y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.02,  ease: easeInOutSine },
            { t: 840,             sprite: 'brk_3',       pose: bk[3],     x: 2,          y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0.01,  ease: easeInOutSine },
            { t: ANIM_TOTAL_T,    sprite: neutralSprite, pose: endPose,   x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
        ];
    } else {
        // 防御 / 密着ガード
        actionKeyframes = [
            { t: 0,               sprite: 'idle_0',      pose: startPose, x: startX,     y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            { t: 165,             sprite: 'def_0',       pose: df[0],     x: startX - 2, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: -0.01, ease: easeOutCubic },
            { t: STRIKE_IMPACT_T, sprite: 'def_1',       pose: df[1],     x: -4,         y: 0, scaleX: 1.01, scaleY: 0.99, rot: -0.02, ease: easeOutCubic, fx: outcome === 'block_success' ? 'shield_success' : 'shield' },
            { t: 600,             sprite: 'def_2',       pose: df[2],     x: -6,         y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.02, ease: easeOutCubic },
            { t: 820,             sprite: 'def_3',       pose: df[3],     x: -2,         y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: -0.01, ease: easeInOutSine },
            { t: ANIM_TOTAL_T,    sprite: neutralSprite, pose: endPose,   x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
        ];
    }

    // 鍔迫り合い突入時（同技交錯・崩し交錯）：打突インパクト後にそのまま至近距離で鍔元を押し合う構えに移行する
    if (outcome === 'tsubazeriai_clash') {
        const windup = actionKeyframes
            .filter((kf) => kf.t <= STRIKE_IMPACT_T)
            .map((kf) => ({ ...kf }));
        const impactKf = windup[windup.length - 1];
        impactKf.fx = 'clash_tsuba';
        return [
            ...windup,
            { t: 520,          sprite: 'brk_2',       pose: bk[2],   x: 9, y: 0, scaleX: 1.03, scaleY: 0.97, rot: 0.03, ease: easeOutQuart, fx: 'dust' },
            { t: 740,          sprite: 'brk_1',       pose: bk[1],   x: 7, y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02, ease: easeInOutSine, fx: 'clash_tsuba' },
            { t: ANIM_TOTAL_T, sprite: 'tsubazeriai', pose: endPose, x: 8, y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02, ease: easeInOutSine },
        ];
    }

    // ダメージを受ける側も、t = 0 〜 STRIKE_IMPACT_T までは自身の攻撃（または防御）アニメーションを同時に行い、
    // 攻撃が成功する側の打突の最後のコマ（t = STRIKE_IMPACT_T）と同時にダメージアニメーション（buildHitTail）へ移行する
    if (outcome === 'hit' || outcome === 'mutual_hit') {
        const windup = actionKeyframes
            .filter((kf) => kf.t <= STRIKE_IMPACT_T)
            .map((kf) => ({ ...kf }));
        const lastStrikeKf = windup[windup.length - 1];
        if (outcome === 'hit') {
            lastStrikeKf.fx = 'sparks';
        }
        lastStrikeKf.flash = 0.65;
        return [...windup, ...buildHitTail()];
    }

    return actionKeyframes;
}

function triggerFighterAnimation(who, action, outcome, impactWeight = 'normal', wasTsubazeriai = false) {
    const anim = animators[who];
    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const finalStance = state.gameOver
        ? (who === 'player' ? state.playerAnimState : state.enemyAnimState)
        : getNeutralAnim(who);
    const startSnapshot = { ...anim.currentPose };
    const endTargetPose = getContinuousStancePose(finalStance, (now + ANIM_TOTAL_T) * 0.0042 + anim.phaseOffset);
    anim.keyframes = buildActionKeyframes(action, outcome, finalStance, startSnapshot, endTargetPose, wasTsubazeriai);
    anim.seqStartTime = now;
    anim.virtualElapsed = 0;
    anim.lastUpdateNow = now;
    anim.lastKeyIndex = -1;
    anim.impactWeight = impactWeight;
}

// 効果音生成
function ensureAudio() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return false;
    if (!audioCtx) {
        audioCtx = new AudioCtor();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return true;
}

// 竹刀の乾いた打突スナップ音（パァン！）を合成
function playShinaiSnap(ctx, now, intensity = 1.0) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.065);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        const env = Math.pow(1 - i / bufferSize, 2.2);
        data[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1650, now);
    filter.Q.setValueAtTime(2.4, now);

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.09 * intensity, now);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

    noise.connect(filter);
    filter.connect(snapGain);
    snapGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.065);
}

// 一本・強打時の重厚な和太鼓音（ドン！）を合成
function playTaikoDon(ctx, now, intensity = 1.0) {
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const taikoGain = ctx.createGain();

    osc.type = 'sine';
    subOsc.type = 'triangle';
    osc.frequency.setValueAtTime(155, now);
    osc.frequency.exponentialRampToValueAtTime(46, now + 0.36);
    subOsc.frequency.setValueAtTime(92, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.36);

    taikoGain.gain.setValueAtTime(0.0001, now);
    taikoGain.gain.linearRampToValueAtTime(0.11 * intensity, now + 0.012);
    taikoGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    osc.connect(taikoGain);
    subOsc.connect(taikoGain);
    taikoGain.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.43);
    subOsc.stop(now + 0.43);
}

function playSound(type) {
    if (!ensureAudio()) return;
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.01);

    if (type === 'attack') {
        playShinaiSnap(ctx, now, 1.0);
        playTaikoDon(ctx, now, 0.55);
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.18);
    } else if (type === 'special') {
        playShinaiSnap(ctx, now, 1.45);
        playTaikoDon(ctx, now, 1.25);
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
        playTaikoDon(ctx, now, 0.85);
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.24);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'block') {
        playShinaiSnap(ctx, now, 0.75);
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
        playShinaiSnap(ctx, now, 1.1);
        playTaikoDon(ctx, now, 0.75);
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'clash') {
        playShinaiSnap(ctx, now, 0.9);
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
        playTaikoDon(ctx, now, 1.4);
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
        playTaikoDon(ctx, now, 0.9);
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
    // キャラクター背景画像（fighter-bg.svg）の白い漆喰壁・琥珀色の板張り床・白線と色調を完全統一
    ctx.save();
    const floorGrad = ctx.createLinearGradient(0, GROUND_Y - 2, 0, CANVAS_H);
    floorGrad.addColorStop(0, 'rgba(222, 152, 78, 0.92)');
    floorGrad.addColorStop(0.45, 'rgba(196, 121, 50, 0.95)');
    floorGrad.addColorStop(1, 'rgba(156, 88, 30, 0.98)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, GROUND_Y - 2, CANVAS_W, CANVAS_H - GROUND_Y + 2);

    // 板目の水平ライン
    ctx.strokeStyle = 'rgba(124, 67, 20, 0.5)';
    ctx.lineWidth = 1;
    [GROUND_Y + 6, GROUND_Y + 14].forEach((py) => {
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(CANVAS_W, py);
        ctx.stroke();
    });

    // 板の継ぎ目（パースライン）
    ctx.strokeStyle = 'rgba(124, 67, 20, 0.4)';
    [
        [36, GROUND_Y - 2, 20, CANVAS_H],
        [91, GROUND_Y - 2, 91, CANVAS_H],
        [146, GROUND_Y - 2, 162, CANVAS_H]
    ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    });

    // 試合場の白線（水平ライン＋開始線マーク）
    ctx.strokeStyle = 'rgba(248, 241, 229, 0.92)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y - 1);
    ctx.lineTo(CANVAS_W, GROUND_Y - 1);
    ctx.stroke();

    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(112, GROUND_Y - 1);
    ctx.lineTo(118, GROUND_Y + 16);
    ctx.stroke();
    ctx.restore();
}

function drawSlashEffect(ctx, effect, now, flip) {
    if (!effect) return;
    const elapsed = effect.elapsed !== undefined ? effect.elapsed : (now - effect.start);
    const progress = elapsed / effect.duration;
    if (progress >= 1) return;

    const alpha = Math.sin(progress * Math.PI);
    const heavyMult = effect.isHeavy ? 1.35 : 1.0;
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
        ctx.strokeStyle = effect.isHeavy
            ? `rgba(251, 146, 60, ${alpha * 0.95})`
            : `rgba(253, 224, 71, ${alpha * 0.9})`;
        ctx.lineWidth = (1 - progress * 0.5) * 7 * heavyMult;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(96, cy, radius, startAng, endAng);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2.6 * heavyMult;
        ctx.beginPath();
        ctx.arc(96, cy, radius - 3, startAng + 0.1, endAng);
        ctx.stroke();
    } else if (effect.type === 'do') {
        const y = 118;
        const x1 = 45 + progress * 25;
        const x2 = 165;
        ctx.strokeStyle = effect.isHeavy
            ? `rgba(250, 204, 21, ${alpha * 0.95})`
            : `rgba(56, 189, 248, ${alpha * 0.9})`;
        ctx.lineWidth = (1 - progress * 0.4) * 8 * heavyMult;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y + 8);
        ctx.quadraticCurveTo(110, y - 10, x2, y - 2);
        ctx.stroke();
    } else if (effect.type === 'tsuki') {
        const y = 100;
        const grad = ctx.createLinearGradient(35, y, 180, y);
        grad.addColorStop(0, `rgba(249, 115, 22, 0)`);
        grad.addColorStop(0.45, `rgba(250, 204, 21, ${alpha * 0.98})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(40, y - 10 * (1 - progress * 0.5));
        ctx.lineTo(180, y);
        ctx.lineTo(40, y + 10 * (1 - progress * 0.5));
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

    // ヒットストップ＆スローモーション対応のデルタ時間計算
    const rawDt = anim.lastUpdateNow ? Math.min(50, Math.max(0, now - anim.lastUpdateNow)) : 16.6;
    anim.lastUpdateNow = now;
    const inHitStop = now < timeState.hitStopUntil;
    const inSlowMo = !inHitStop && now < timeState.slowMoUntil;
    const timeScale = inHitStop ? 0 : (inSlowMo ? timeState.slowMoFactor : 1.0);
    const effectiveDt = rawDt * timeScale;

    let targetPose;

    // 1. キーフレーム連続再生中か、待機モーション（60fps呼吸・すり足）かを計算
    if (anim.keyframes) {
        anim.virtualElapsed += effectiveDt;
        const elapsed = anim.virtualElapsed;
        const kfs = anim.keyframes;
        const lastKf = kfs[kfs.length - 1];

        if (elapsed >= lastKf.t) {
            anim.keyframes = null;
            if (!animators.player.keyframes && !animators.enemy.keyframes) {
                flushPendingRound();
            }
            setSpriteWithFade(anim, defaultSprite, now);
            const speedMult = (isCounter || kiai >= MAX_KIAI) ? 1.35 : 1.0;
            const phase = now * 0.0042 * speedMult + anim.phaseOffset;
            targetPose = getContinuousStancePose(defaultSprite, phase);
            anim.currentPose = interpolatePose(anim.currentPose, targetPose, 0.25);
            const endX = (state.gameOver && defaultSprite === 'hit') ? -10 : (defaultSprite === 'tsubazeriai' ? 8 : 0);
            const endRot = (state.gameOver && defaultSprite === 'hit') ? -0.03 : (defaultSprite === 'tsubazeriai' ? 0.02 : 0);
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

            // キーフレーム到達時のエフェクト・残像・ヒットストップトリガー
            if (idx > anim.lastKeyIndex) {
                const isHeavy = anim.impactWeight === 'heavy';
                for (let stepIdx = anim.lastKeyIndex + 1; stepIdx <= idx; stepIdx++) {
                    const kf = kfs[stepIdx];
                    if (kf.t === STRIKE_IMPACT_T) {
                        firePendingImpact();
                    }
                    if (kf.flash) {
                        anim.hitFlash = isHeavy ? Math.min(1.0, kf.flash * 1.45) : kf.flash;
                    }
                    const fx = kf.fx;
                    const currentFootX = baseFootX + dir * kf.x;
                    if (fx === 'dust') {
                        spawnDust(anim, currentFootX, GROUND_Y, dir);
                    } else if (fx === 'sparks') {
                        spawnSparks(anim, currentFootX + dir * 24, 92, isHeavy ? '250, 204, 21' : '248, 113, 113', isHeavy ? 24 : 14, isHeavy ? 1.35 : 1);
                        spawnShockwave(anim, currentFootX + dir * 22, 92, isHeavy ? '250, 204, 21' : '248, 113, 113', isHeavy);
                    } else if (fx === 'hitstop') {
                        if (isHeavy) {
                            triggerHitStop(95, 160, 0.28);
                        } else {
                            triggerHitStop(55, 65, 0.45);
                        }
                    } else if (fx && fx.startsWith('lunge_')) {
                        const slashType = fx.replace('lunge_', '');
                        const impactY = slashType === 'men' ? 76 : (slashType === 'tsuki' ? 96 : 114);
                        spawnDust(anim, currentFootX + dir * 18, GROUND_Y, dir);
                        anim.slashEffect = { type: slashType, start: now, elapsed: 0, duration: isHeavy ? 320 : 260, isHeavy };
                        if (slashType === 'tsuki' || isCounter || isHeavy) {
                            spawnSparks(anim, currentFootX + dir * 48, impactY, '250, 204, 21', 20, 1.3);
                            spawnShockwave(anim, currentFootX + dir * 46, impactY, '250, 204, 21', true);
                        } else {
                            spawnShockwave(anim, currentFootX + dir * 44, impactY, '56, 189, 248', false);
                        }
                    } else if (fx === 'clash_tsuba') {
                        spawnDust(anim, currentFootX + dir * 12, GROUND_Y, dir);
                        spawnSparks(anim, currentFootX + dir * 40, 96, '250, 204, 21', 20, 1.25);
                        spawnShockwave(anim, currentFootX + dir * 38, 96, '250, 204, 21', false);
                        triggerHitStop(50, 0, 1.0);
                    } else if (fx === 'shield' || fx === 'shield_success') {
                        anim.slashEffect = { type: fx, start: now, elapsed: 0, duration: 320, isHeavy: false };
                        if (fx === 'shield_success') {
                            spawnSparks(anim, currentFootX + dir * 34, 98, '56, 189, 248', 18, 1.15);
                            spawnShockwave(anim, currentFootX + dir * 34, 98, '56, 189, 248', false);
                            triggerHitStop(55, 0, 1.0);
                        }
                    }
                }
                anim.lastKeyIndex = idx;
                setSpriteWithFade(anim, k1.sprite, now);
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
            if (!inHitStop && poseLungeDist > 10 && Math.random() < (anim.impactWeight === 'heavy' ? 0.65 : 0.42)) {
                anim.afterimages.push({
                    pose: { ...anim.currentPose, swingBlur: 0, hitDebris: 0 },
                    posX: anim.posX,
                    scaleX: anim.scaleX,
                    scaleY: anim.scaleY,
                    rot: anim.rot,
                    alpha: anim.impactWeight === 'heavy' ? 0.28 : 0.22,
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
        } else if (defaultSprite === 'tsubazeriai') {
            const pushX = 8 + Math.sin(phase * 3.4) * 1.4;
            anim.posX = lerp(anim.posX, pushX, 0.22);
            anim.scaleX = lerp(anim.scaleX, 1.02, 0.2);
            anim.scaleY = lerp(anim.scaleY, 0.98, 0.2);
            anim.rot = lerp(anim.rot, 0.02, 0.2);
            if (!inHitStop && Math.random() < 0.07) {
                spawnSparks(anim, baseFootX + dir * 46, 98, '250, 204, 21', 2, 0.55);
            }
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

    // ヒットストップ中の微細な打撃振動（インパクトの手応え強調）
    const hitStopJitterX = (inHitStop && anim.hitFlash > 0.15) ? Math.sin(now * 1.8) * 2.4 : 0;
    const pivotX = baseFootX + dir * anim.posX + hitStopJitterX;
    const pivotY = GROUND_Y;
    const vScale = CANVAS_W / VIRTUAL_W;

    // 応じ技構え・気合MAX時のオーラ粒子生成（待機中のみ足元から立ち昇る）
    if (!state.gameOver && !anim.keyframes && (isCounter || kiai >= MAX_KIAI) && Math.random() < 0.25) {
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
    const fighterArmorTheme = who === 'enemy' ? getCurrentEnemy().armorTheme : null;
    for (let i = anim.afterimages.length - 1; i >= 0; i--) {
        const img = anim.afterimages[i];
        img.alpha -= 0.045 * (inHitStop ? 0.2 : 1);
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
            drawArticulatedPoseOnCanvas(ctx, img.pose, img.alpha, fighterArmorTheme);
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
    drawArticulatedPoseOnCanvas(ctx, renderPose, 1, fighterArmorTheme);
    ctx.restore();

    // 5. 斬撃軌跡・防御シールドの描画
    if (anim.slashEffect) {
        anim.slashEffect.elapsed = (anim.slashEffect.elapsed || 0) + (inHitStop ? rawDt * 0.25 : effectiveDt);
        drawSlashEffect(ctx, anim.slashEffect, now, flip);
        if (anim.slashEffect.elapsed >= anim.slashEffect.duration) {
            anim.slashEffect = null;
        }
    }

    // 5.5 衝撃波リング＆放射閃光（ショックウェーブ）の描画
    for (let i = anim.shockwaves.length - 1; i >= 0; i--) {
        const sw = anim.shockwaves[i];
        const step = inHitStop ? 0.35 : (inSlowMo ? 0.55 : 1.0);
        sw.r += (sw.maxR - sw.r) * 0.22 * step;
        sw.alpha -= (sw.isHeavy ? 0.038 : 0.052) * step;
        if (sw.alpha <= 0) {
            anim.shockwaves.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.strokeStyle = `rgba(${sw.color}, ${Math.max(0, sw.alpha)})`;
        ctx.lineWidth = (sw.isHeavy ? 4.2 : 2.8) * sw.alpha;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();

        // 放射状の集中閃光ライン
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, sw.alpha * 0.9)})`;
        ctx.lineWidth = sw.isHeavy ? 2.2 : 1.5;
        sw.rays.forEach((ray) => {
            const r0 = sw.r * 0.65;
            const r1 = sw.r * 0.65 + ray.len * sw.alpha;
            ctx.beginPath();
            ctx.moveTo(sw.x + Math.cos(ray.angle) * r0, sw.y + Math.sin(ray.angle) * r0);
            ctx.lineTo(sw.x + Math.cos(ray.angle) * r1, sw.y + Math.sin(ray.angle) * r1);
            ctx.stroke();
        });
        ctx.restore();
    }

    // 6. パーティクル（砂煙・火花・気合オーラ）の描画
    for (let i = anim.particles.length - 1; i >= 0; i--) {
        const p = anim.particles[i];
        const pStep = inHitStop ? 0.15 : (inSlowMo ? 0.45 : 1.0);
        p.x += p.vx * pStep;
        p.y += p.vy * pStep;
        p.alpha -= p.decay * pStep;
        if (p.kind === 'dust') p.r += 0.15 * pStep;
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
        const flashColor = anim.impactWeight === 'heavy' ? '250, 204, 21' : '239, 68, 68';
        ctx.fillStyle = `rgba(${flashColor}, ${anim.hitFlash * 0.38})`;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.restore();
        if (!inHitStop) {
            anim.hitFlash *= 0.84;
        }
    }
}

function triggerShake(element, isHeavy = false) {
    element.classList.remove('hit-shake', 'heavy-hit-shake', 'impact-zoom');
    void element.offsetWidth;
    element.classList.add(isHeavy ? 'heavy-hit-shake' : 'hit-shake');
}

function triggerImpactZoom(element) {
    element.classList.remove('impact-zoom');
    void element.offsetWidth;
    element.classList.add('impact-zoom');
}

function triggerArenaFlash() {
    if (!battleArena) return;
    battleArena.classList.remove('arena-critical-flash');
    void battleArena.offsetWidth;
    battleArena.classList.add('arena-critical-flash');
}

// ダメージやバフのフローティングポップアップを表示
function spawnFloatingPopup(who, text, styleClass = 'popup-dmg', offsetY = 0) {
    const layer = who === 'player' ? playerPopupLayer : enemyPopupLayer;
    if (!layer) return;
    const el = document.createElement('div');
    el.className = `floating-popup ${styleClass}`;
    el.textContent = text;
    if (offsetY !== 0) {
        el.style.marginTop = `${offsetY}px`;
    }
    layer.appendChild(el);
    setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 1100);
}

// 審判の紅白旗・技コールカットインを表示
function showRefereeCallout({ winner = null, mainText = '', subText = '', isCritical = false, isGuard = false }) {
    if (!refereeCallout) return;
    if (refereeHideTimer) {
        clearTimeout(refereeHideTimer);
        refereeHideTimer = null;
    }

    refereeCallout.className = 'referee-callout show';
    if (winner === 'player') refereeCallout.classList.add('red-win');
    if (winner === 'enemy') refereeCallout.classList.add('white-win');
    if (isCritical) refereeCallout.classList.add('critical-ippon');
    if (isGuard) refereeCallout.classList.add('guard-call');

    refFlagRed.classList.toggle('flag-up', winner === 'player' || winner === 'both');
    refFlagWhite.classList.toggle('flag-up', winner === 'enemy' || winner === 'both');

    refereeMainText.textContent = mainText;
    refereeSubText.textContent = subText;

    const duration = state.gameOver ? 2600 : 1250;
    refereeHideTimer = setTimeout(() => {
        refereeCallout.classList.remove('show');
    }, duration);
}

function hideRefereeCallout() {
    if (refereeHideTimer) {
        clearTimeout(refereeHideTimer);
        refereeHideTimer = null;
    }
    if (refereeCallout) {
        refereeCallout.className = 'referee-callout';
    }
}

function gainKiai(who, amount) {
    if (who === 'player') {
        state.playerKiai = Math.min(MAX_KIAI, state.playerKiai + amount);
    } else {
        state.enemyKiai = Math.min(MAX_KIAI, state.enemyKiai + amount);
    }
}

function getNeutralAnim(who) {
    if (state.tsubazeriai) return 'tsubazeriai';
    if (who === 'player') {
        if (state.playerGuardBroken) return 'guardBroken';
        if (state.playerStanceStyle === 'jodan') return 'jodan';
        if (state.playerStanceStyle === 'waki') return 'waki';
        if (state.playerCounterReady || state.playerKiai >= MAX_KIAI) return 'counterReady';
        return 'idle';
    } else {
        if (state.enemyGuardBroken) return 'guardBroken';
        if (state.enemyStanceStyle === 'jodan') return 'jodan';
        if (state.enemyStanceStyle === 'waki') return 'waki';
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

function updateBadge(badgeEl, spriteBoxEl, counterReady, guardBroken, kiai, isTsubazeriai, stanceStyle = 'chudan') {
    badgeEl.className = 'stance-badge';
    spriteBoxEl.classList.remove('counter-aura', 'broken-aura', 'tsubazeriai-aura', 'jodan-aura', 'waki-aura');

    if (isTsubazeriai && !state.gameOver) {
        badgeEl.textContent = '💥 鍔迫り合い (引き技2ダメ)';
        badgeEl.classList.add('tsubazeriai');
        spriteBoxEl.classList.add('tsubazeriai-aura');
    } else if (guardBroken) {
        badgeEl.textContent = '💫 体勢崩れ (防御不可)';
        badgeEl.classList.add('broken');
        spriteBoxEl.classList.add('broken-aura');
    } else if (counterReady) {
        if (stanceStyle === 'jodan') {
            badgeEl.textContent = '🔥 上段・応じ構え (面3ダメ!)';
            spriteBoxEl.classList.add('jodan-aura');
        } else if (stanceStyle === 'waki') {
            badgeEl.textContent = '🌊 脇構え・応じ準備 (次打2倍)';
            spriteBoxEl.classList.add('waki-aura');
        } else {
            badgeEl.textContent = '🔥 応じ技構え (次打2倍)';
        }
        badgeEl.classList.add('counter');
        spriteBoxEl.classList.add('counter-aura');
    } else if (kiai >= MAX_KIAI) {
        if (stanceStyle === 'jodan') {
            badgeEl.textContent = '🔥 上段・気合最高潮 (突き可)';
            spriteBoxEl.classList.add('jodan-aura');
        } else if (stanceStyle === 'waki') {
            badgeEl.textContent = '🌊 脇構え・気合最高潮 (突き可)';
            spriteBoxEl.classList.add('waki-aura');
        } else {
            badgeEl.textContent = '⚡ 気合最高潮 (突き可)';
        }
        badgeEl.classList.add('max-kiai');
    } else if (stanceStyle === 'jodan') {
        badgeEl.textContent = '🔥 上段の構え (面2ダメ/防不可)';
        badgeEl.classList.add('jodan');
        spriteBoxEl.classList.add('jodan-aura');
    } else if (stanceStyle === 'waki') {
        badgeEl.textContent = '🌊 脇構え (防で気合+2/HP+1)';
        badgeEl.classList.add('waki');
        spriteBoxEl.classList.add('waki-aura');
    } else {
        badgeEl.textContent = '中段の構え';
    }
}

function updateStanceBarUI() {
    const style = state.playerStanceStyle || 'chudan';
    if (stanceSelectorBar) {
        const tabs = stanceSelectorBar.querySelectorAll('.stance-tab');
        tabs.forEach((tab) => {
            tab.classList.toggle('active', tab.dataset.stance === style);
        });
    }
    if (stanceDescText) {
        if (style === 'jodan') {
            stanceDescText.textContent = '🔥 上段の構え：「面」の威力+1（通常2ダメ・相面も一方的に制覇）！※「防御」不可＆相手の小手・突き被弾時+1ダメ';
        } else if (style === 'waki') {
            stanceDescText.textContent = '🌊 脇構え：「防御」成功で気合+2＆体力+1回復！相手の「崩し」を「胴（抜き胴）」で迎撃時2ダメ！※通常の面は気合+0';
        } else {
            stanceDescText.textContent = '⚖️ 中段の構え：攻守バランスの取れた王道の構え（全コマンド使用可）';
        }
    }
}

function selectStanceStyle(style) {
    if (style !== 'chudan' && style !== 'jodan' && style !== 'waki') return;
    if (pendingRoundCallback) {
        flushPendingRound();
    }
    const changed = state.playerStanceStyle !== style;
    state.playerStanceStyle = style;
    if (!state.gameOver) {
        state.playerAnimState = getNeutralAnim('player');
    }
    if (changed && animators.player) {
        spawnDust(animators.player, 18, 5);
        if (style === 'jodan') {
            spawnFloatingPopup('player', '🔥 上段の構え！', 'popup-counter');
        } else if (style === 'waki') {
            spawnFloatingPopup('player', '🌊 脇構え！', 'popup-heal');
        } else {
            spawnFloatingPopup('player', '⚖️ 中段の構え', 'popup-block');
        }
    }
    updateUI();
}

function updateStageBarUI() {
    if (stageBar) {
        const steps = stageBar.querySelectorAll('.stage-step');
        steps.forEach((step, idx) => {
            const rosterItem = ENEMY_ROSTER[idx];
            if (!rosterItem) return;
            const isCleared = state.clearedStages.has(idx);
            step.classList.toggle('active', idx === state.stageIndex);
            step.classList.toggle('cleared', isCleared);
            const roleEl = step.querySelector('.stage-role');
            if (roleEl) {
                roleEl.textContent = isCleared ? `✅ ${rosterItem.role}` : rosterItem.role;
            }
        });
    }
    if (stageProgressText) {
        const clearedCount = state.clearedStages.size;
        stageProgressText.textContent = clearedCount === ENEMY_ROSTER.length
            ? `🏆 五人掛け完全制覇！（${clearedCount} / ${ENEMY_ROSTER.length}人撃破）`
            : `制覇: ${clearedCount} / ${ENEMY_ROSTER.length}人（クリックで相手を指名可）`;
    }
}

function updateUI() {
    const enemyData = getCurrentEnemy();
    const pHp = Math.max(0, state.playerHealth);
    const eHp = Math.max(0, state.enemyHealth);
    const eMax = state.enemyMaxHealth || enemyData.maxHealth;
    const playerPct = (pHp / MAX_HEALTH) * 100;
    const enemyPct = (eHp / eMax) * 100;

    if (enemyNameText) enemyNameText.textContent = enemyData.name;
    if (enemyTitleBadge) enemyTitleBadge.textContent = `${enemyData.role}・${enemyData.rank}（${enemyData.styleTag}）`;
    if (playerTitleBadge) {
        playerTitleBadge.textContent = state.clearedStages.size === ENEMY_ROSTER.length
            ? '🏆 天下無双・五人掛け覇者'
            : `挑戦者（${state.clearedStages.size}/${ENEMY_ROSTER.length}人撃破）`;
    }
    updateStageBarUI();
    updateStanceBarUI();

    playerHealthBar.style.width = `${playerPct}%`;
    enemyHealthBar.style.width = `${enemyPct}%`;
    if (playerHealthTrail) playerHealthTrail.style.width = `${playerPct}%`;
    if (enemyHealthTrail) enemyHealthTrail.style.width = `${enemyPct}%`;
    playerHealthBar.classList.toggle('low', pHp <= 2);
    enemyHealthBar.classList.toggle('low', eHp <= 2);

    playerHealthText.textContent = `体力: ${pHp} / ${MAX_HEALTH}`;
    enemyHealthText.textContent = `体力: ${eHp} / ${eMax}`;

    playerKiaiText.textContent = `気合: ${state.playerKiai} / ${MAX_KIAI}`;
    enemyKiaiText.textContent = `気合: ${state.enemyKiai} / ${MAX_KIAI}`;
    renderPips(playerKiaiPips, state.playerKiai);
    renderPips(enemyKiaiPips, state.enemyKiai);

    updateBadge(playerBadge, playerSpriteBox, state.playerCounterReady, state.playerGuardBroken, state.playerKiai, state.tsubazeriai, state.playerStanceStyle);
    updateBadge(enemyBadge, enemySpriteBox, state.enemyCounterReady, state.enemyGuardBroken, state.enemyKiai, state.tsubazeriai, state.enemyStanceStyle);

    const inTsuba = state.tsubazeriai && !state.gameOver;
    const isJodan = state.playerStanceStyle === 'jodan';
    const isWaki = state.playerStanceStyle === 'waki';

    if (vsDivider) {
        vsDivider.textContent = inTsuba ? '💥 鍔迫り合い' : 'VS';
        vsDivider.classList.toggle('tsubazeriai', inTsuba);
    }

    // ボタンの有効・無効＆構え・鍔迫り合い時のラベル切り替え
    if (btnMen) {
        btnMen.disabled = false;
        btnMen.textContent = inTsuba
            ? (isJodan ? '🔥 諸手引き面 (3ダメ!)' : '⚡ 引き面 (2ダメ)')
            : (isJodan ? '🔥 上段面 (2ダメ)' : '⚔️ 面');
        btnMen.classList.toggle('hiki-mode', inTsuba || isJodan);
    }
    if (btnKote) {
        btnKote.disabled = false;
        btnKote.textContent = inTsuba ? '⚡ 引き小手 (2ダメ)' : '⚔️ 小手';
        btnKote.classList.toggle('hiki-mode', inTsuba);
    }
    if (btnDo) {
        btnDo.disabled = false;
        btnDo.textContent = inTsuba
            ? '⚡ 引き胴 (2ダメ)'
            : (isWaki ? '🌊 抜き胴 (対崩2ダメ)' : '⚔️ 胴');
        btnDo.classList.toggle('hiki-mode', inTsuba);
    }
    if (btnBreak) {
        btnBreak.disabled = false;
        btnBreak.textContent = inTsuba ? '💥 突き放し' : '💥 崩し';
    }
    btnDefend.disabled = (state.playerGuardBroken || isJodan) && !state.gameOver;
    if (state.playerGuardBroken) {
        btnDefend.textContent = '🛡️ 防御 (崩れ中)';
    } else if (isJodan) {
        btnDefend.textContent = '🛡️ 防御 (上段中は不可)';
    } else if (inTsuba) {
        btnDefend.textContent = isWaki ? '🌊 密着受け (気+2/HP+1)' : '🛡️ 密着ガード';
    } else {
        btnDefend.textContent = isWaki ? '🌊 後の先防御 (気+2/HP+1)' : '🛡️ 防御';
    }

    btnTsuki.disabled = state.playerKiai < MAX_KIAI || state.gameOver;
    btnTsuki.textContent = state.playerKiai >= MAX_KIAI
        ? (inTsuba ? '⚡ 離れ突き (3ダメ!)' : '⚡ 突き (発動可！)')
        : `⚡ 突き (${state.playerKiai}/${MAX_KIAI})`;

    if (btnNextStage) {
        if (state.gameOver && state.lastOutcome === 'victory') {
            btnNextStage.style.display = 'inline-block';
            if (state.stageIndex < ENEMY_ROSTER.length - 1) {
                const nextEnemy = ENEMY_ROSTER[state.stageIndex + 1];
                btnNextStage.textContent = `⏭️ 次の相手（${nextEnemy.role}・${nextEnemy.shortName}）へ進む`;
            } else {
                btnNextStage.textContent = '🏆 先鋒から再び五人掛けに挑戦';
            }
        } else {
            btnNextStage.style.display = 'none';
        }
    }
}

function updateStatus(message, type = 'neutral') {
    statusText.textContent = message;
    statusText.className = `status-text ${type}`;
}

// 敵AIの次ターンの気配（剣士ごとの思考傾向）を決定
function decideEnemyIntent() {
    const enemyData = getCurrentEnemy();
    if (state.gameOver) {
        intentBox.className = 'intent-box';
        if (state.lastOutcome === 'victory' && state.stageIndex < ENEMY_ROSTER.length - 1) {
            const nextEnemy = ENEMY_ROSTER[state.stageIndex + 1];
            intentText.textContent = `「⏭️ 次の相手（${nextEnemy.role}・${nextEnemy.shortName}）へ進む」または任意の技ボタンで次戦へ進めます。`;
        } else {
            intentText.textContent = '「🔄 もう一度」または上部の剣士バッジから対戦相手を選べます。';
        }
        return;
    }

    let intent;
    if (state.tsubazeriai) {
        if (state.enemyKiai >= MAX_KIAI) {
            intent = {
                stance: 'chudan',
                hint: `💥【鍔迫り合い】⚠️ ${enemyData.shortName}の気合が最高潮！離れ際の「離れ突き(3ダメ)」か「引き面」が来るぞ！`,
                isDanger: true,
                weights: { 突き: 52, 面: 22, 小手: 14, 崩し: 12, 胴: 0, 防御: 0 },
            };
        } else {
            const r = Math.random();
            if (r < 0.38) {
                intent = {
                    stance: 'chudan',
                    hint: `💥【鍔迫り合い】${enemyData.shortName}は鍔元を押し込み、離れ際の「引き面」か「引き胴」を狙っている！（引き技は2ダメージ！）`,
                    isDanger: true,
                    weights: { 面: 45, 胴: 35, 小手: 10, 崩し: 10, 防御: 0, 突き: 0 },
                };
            } else if (r < 0.72) {
                intent = {
                    stance: 'chudan',
                    hint: `💥【鍔迫り合い】${enemyData.shortName}は手元を詰め、鋭い「引き小手」か「突き放し」を狙っているぞ！`,
                    isDanger: true,
                    weights: { 小手: 46, 崩し: 26, 面: 18, 胴: 10, 防御: 0, 突き: 0 },
                };
            } else {
                intent = {
                    stance: 'chudan',
                    hint: `💥【鍔迫り合い】${enemyData.shortName}は「密着ガード」で引き技を封じようとしている…（「💥突き放し」か「引き胴」の好機！）`,
                    isDanger: false,
                    weights: { 防御: 48, 胴: 26, 小手: 16, 面: 10, 崩し: 0, 突き: 0 },
                };
            }
        }
    } else if (state.enemyKiai >= MAX_KIAI) {
        intent = {
            stance: 'chudan',
            hint: `⚠️ ${enemyData.shortName}の気合が最高潮だ！必殺の「突き」か、守りを割る「崩し」が来るぞ！`,
            isDanger: true,
            weights: { 突き: 58, 崩し: 16, 面: 14, 小手: 12, 胴: 0, 防御: 0 },
        };
    } else if (state.enemyCounterReady) {
        const keepStance = state.enemyStanceStyle || 'chudan';
        intent = {
            stance: keepStance,
            hint: keepStance === 'jodan'
                ? `🔥【上段・応じ構え】${enemyData.shortName}は上段から威力3倍の「応じ上段面」を狙っているぞ！`
                : `🔥 ${enemyData.shortName}は「応じ技」の構え！強烈な打突（威力2倍）で一気に打ち込んでくる気配！`,
            isDanger: true,
            weights: { 面: 42, 胴: 35, 小手: 18, 崩し: 5, 防御: 0, 突き: 0 },
        };
    } else if ((state.playerCounterReady || state.playerKiai >= MAX_KIAI) && !state.enemyGuardBroken) {
        if (Math.random() < 0.65) {
            const useWaki = enemyData.id === 'sasaki' || enemyData.id === 'kasumi' || enemyData.id === 'ryuzen';
            intent = {
                stance: useWaki ? 'waki' : 'chudan',
                hint: useWaki
                    ? `🌊【脇構え】${enemyData.shortName}はあなたの強打を警戒し、脇構えの「後の先防御」か「小手」を狙っている！（「崩し」の好機！）`
                    : `🛡️【中段の構え】${enemyData.shortName}はあなたの攻めを警戒し、守りを固めつつ「小手」を狙っている…（「崩し」や「面」の好機！）`,
                isDanger: false,
                weights: { 防御: 50, 小手: 30, 面: 10, 胴: 10, 崩し: 0, 突き: 0 },
            };
        } else {
            intent = {
                stance: 'chudan',
                hint: `👁️【中段の構え】${enemyData.shortName}は先手を取ろうと、出端の「小手」や「崩し」を狙っている…`,
                isDanger: false,
                weights: { 小手: 45, 崩し: 30, 胴: 15, 面: 10, 防御: 0, 突き: 0 },
            };
        }
    } else {
        const patterns = enemyData.patterns;
        const picked = patterns[Math.floor(Math.random() * patterns.length)];
        intent = {
            stance: picked.stance || 'chudan',
            hint: picked.hint,
            isDanger: picked.isDanger,
            weights: { ...picked.weights },
        };
    }

    // 相手が体勢崩れ中の場合は中段に戻り、「防御」を選ばない
    if (state.enemyGuardBroken) {
        intent.stance = 'chudan';
        if (intent.weights['防御'] > 0) {
            intent.weights = { ...intent.weights, 小手: intent.weights['小手'] + intent.weights['防御'], 防御: 0 };
            intent.hint = `💫 ${enemyData.shortName}は体勢が崩れて防御できない！一気に攻め込む好機だ！`;
        }
    }

    // 上段の構え中は「防御」不可ルールを敵にも適用
    if (intent.stance === 'jodan' && intent.weights['防御'] > 0) {
        intent.weights = { ...intent.weights, 面: intent.weights['面'] + intent.weights['防御'], 防御: 0 };
    }

    const prevEnemyStance = state.enemyStanceStyle;
    state.enemyStanceStyle = intent.stance || 'chudan';
    if (!state.gameOver) {
        state.enemyAnimState = getNeutralAnim('enemy');
    }
    updateBadge(enemyBadge, enemySpriteBox, state.enemyCounterReady, state.enemyGuardBroken, state.enemyKiai, state.tsubazeriai, state.enemyStanceStyle);

    if (state.round > 0 && prevEnemyStance !== state.enemyStanceStyle && !state.tsubazeriai && !state.enemyGuardBroken) {
        if (animators.enemy) {
            spawnDust(animators.enemy, 18, 5);
        }
        if (state.enemyStanceStyle === 'jodan') {
            spawnFloatingPopup('enemy', '🔥 上段の構え！', 'popup-counter');
        } else if (state.enemyStanceStyle === 'waki') {
            spawnFloatingPopup('enemy', '🌊 脇構え！', 'popup-heal');
        } else {
            spawnFloatingPopup('enemy', '⚖️ 中段の構え', 'popup-block');
        }
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
    // 進行中のアニメーション結果が未反映の場合は即座に反映してから処理
    if (pendingRoundCallback) {
        flushPendingRound();
    }

    if (state.gameOver) {
        if (state.lastOutcome === 'victory' && state.stageIndex < ENEMY_ROSTER.length - 1) {
            advanceStage();
        } else {
            resetGame();
        }
        return;
    }

    const isJodan = state.playerStanceStyle === 'jodan';
    const isWaki = state.playerStanceStyle === 'waki';
    const eJodan = state.enemyStanceStyle === 'jodan';
    const eWaki = state.enemyStanceStyle === 'waki';

    if (playerAction === '防御' && (state.playerGuardBroken || isJodan)) {
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

    // このターン開始時点の鍔迫り合い・応じ技バフを保持し、消費する
    const inTsuba = state.tsubazeriai;
    state.tsubazeriai = false;
    const pCounter = state.playerCounterReady;
    const eCounter = state.enemyCounterReady;
    state.playerCounterReady = false;
    state.enemyCounterReady = false;
    state.playerGuardBroken = false;
    state.enemyGuardBroken = false;

    if (playerAction === '突き') state.playerKiai = 0;
    if (enemyAction === '突き') state.enemyKiai = 0;

    const formatMove = (act, isPlayerSide = false) => {
        const sideJodan = isPlayerSide ? isJodan : eJodan;
        const sideWaki = isPlayerSide ? isWaki : eWaki;
        const otherAct = isPlayerSide ? enemyAction : playerAction;
        if (inTsuba) {
            if (act === '面') return sideJodan ? '諸手引き面' : '引き面';
            if (act === '小手') return '引き小手';
            if (act === '胴') return '引き胴';
            if (act === '防御') return sideWaki ? '密着受け' : '密着ガード';
            if (act === '崩し') return '突き放し';
            if (act === '突き') return '離れ突き';
            return act;
        }
        if (sideJodan && act === '面') return '上段面';
        if (sideWaki && act === '胴' && otherAct === '崩し') return '抜き胴';
        if (sideWaki && act === '防御') return '後の先防御';
        return act;
    };
    const pMoveName = formatMove(playerAction, true);
    const eMoveName = formatMove(enemyAction, false);

    let message = `第${state.round}合${inTsuba ? '【鍔迫り合い】' : ''}: あなた【${pMoveName}】 vs 相手【${eMoveName}】 — `;
    let statusType = 'neutral';
    let playerAnim = getActionAnim(playerAction);
    let enemyAnim = getActionAnim(enemyAction);
    let playerOutcome = 'normal';
    let enemyOutcome = 'normal';
    let impactWeight = 'normal';
    let calloutData = null;
    let impactSound = null;
    let endGameSound = null;
    const zoomTargets = [];
    const shakeTargets = [];
    let doArenaFlash = false;
    const popups = [];

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
        playerOutcome = 'mutual_hit';
        enemyOutcome = 'mutual_hit';
        impactWeight = 'heavy';
        message += `⚡ 互いに渾身の「${pMoveName}」が交錯！双方に1ダメージ！`;
        statusType = 'defeat';
        impactSound = 'special';
        shakeTargets.push({ el: playerSpriteBox, isHeavy: true }, { el: enemySpriteBox, isHeavy: true });
        doArenaFlash = true;
        popups.push(
            { who: 'player', text: '-1 相打ち！', styleClass: 'popup-dmg' },
            { who: 'enemy', text: '-1 相打ち！', styleClass: 'popup-dmg' }
        );
        calloutData = { winner: 'both', mainText: '相打ち！', subText: `双方 ${pMoveName}`, isCritical: true };
    } else if (playerAction === '突き') {
        const eJodanPenalty = eJodan ? 1 : 0;
        const tsukiDmg = (inTsuba ? 3 : 2) + eJodanPenalty;
        state.enemyHealth -= tsukiDmg;
        enemyAnim = 'hit';
        enemyOutcome = 'hit';
        impactWeight = 'heavy';
        if (eJodan) {
            message += `⚡ 相手の上段のガラ空きの喉元へ会心の「${pMoveName}」が突き刺さった！！大ダメージ（${tsukiDmg}点・上段弱点+1）！`;
        } else if (enemyAction === '防御') {
            message += `⚡ 会心の${pMoveName}！！相手の${eMoveName}を貫通し、大ダメージ（${tsukiDmg}点）！`;
        } else {
            message += `⚡ 電光石火の${pMoveName}！！相手の「${eMoveName}」を圧倒し、大ダメージ（${tsukiDmg}点）！`;
        }
        statusType = 'victory';
        impactSound = 'special';
        zoomTargets.push(playerSpriteBox);
        shakeTargets.push({ el: enemySpriteBox, isHeavy: true });
        doArenaFlash = true;
        popups.push({ who: 'enemy', text: `-${tsukiDmg} 会心！`, styleClass: 'popup-crit' });
        calloutData = { winner: 'player', mainText: `${pMoveName}あり！`, subText: `⚡ 会心の一閃 (${tsukiDmg}点)`, isCritical: true };
    } else if (enemyAction === '突き') {
        const jodanPenalty = isJodan ? 1 : 0;
        const tsukiDmg = (inTsuba ? 3 : 2) + jodanPenalty;
        state.playerHealth -= tsukiDmg;
        playerAnim = 'hit';
        playerOutcome = 'hit';
        impactWeight = 'heavy';
        message += isJodan
            ? `⚡ 上段のガラ空きの喉元へ相手の必殺「${eMoveName}」が突き刺さった！！痛恨の${tsukiDmg}ダメージ（上段被弾+1）！`
            : `⚡ 相手の必殺「${eMoveName}」が防具を貫いた！！痛恨の${tsukiDmg}ダメージ！`;
        statusType = 'defeat';
        impactSound = 'hurt';
        zoomTargets.push(enemySpriteBox);
        shakeTargets.push({ el: playerSpriteBox, isHeavy: true });
        doArenaFlash = true;
        popups.push({ who: 'player', text: `-${tsukiDmg} 痛恨！`, styleClass: 'popup-crit' });
        calloutData = { winner: 'enemy', mainText: `${eMoveName}あり！`, subText: `⚡ 必殺の${eMoveName} (${tsukiDmg}点)`, isCritical: true };
    }
    // 2. 防御 vs 防御
    else if (playerAction === '防御' && enemyAction === '防御') {
        message += inTsuba
            ? '互いに慎重に間合いを切り、鍔迫り合いを解いて構えを整えました。'
            : '互いに守りを固め、静かに間合いを測り合っています。';
        statusType = 'neutral';
    }
    // 3. 防御 vs 崩し（ガードブレイク / 突き放し）
    else if (playerAction === '崩し' && enemyAction === '防御') {
        state.enemyHealth -= 1;
        gainKiai('player', 1);
        state.enemyGuardBroken = true;
        enemyAnim = 'hit';
        enemyOutcome = 'hit';
        message += `💥 ${pMoveName}成功！相手の${eMoveName}を体当たりで突き崩し1ダメージ＆相手は次ターン防御不可！`;
        statusType = 'victory';
        impactSound = 'break';
        zoomTargets.push(playerSpriteBox);
        shakeTargets.push({ el: enemySpriteBox, isHeavy: false });
        popups.push(
            { who: 'enemy', text: '-1', styleClass: 'popup-dmg' },
            { who: 'enemy', text: '💫 防御崩壊！', styleClass: 'popup-break' },
            { who: 'player', text: '+1 気合', styleClass: 'popup-kiai' }
        );
        calloutData = { winner: 'player', mainText: `${pMoveName}成功！`, subText: '💥 相手は次ターン防御不可' };
    } else if (playerAction === '防御' && enemyAction === '崩し') {
        state.playerHealth -= 1;
        gainKiai('enemy', 1);
        state.playerGuardBroken = true;
        playerAnim = 'hit';
        playerOutcome = 'hit';
        message += `💥 相手の「${eMoveName}」で${pMoveName}を割られた！1ダメージ＆次ターン防御不可！`;
        statusType = 'defeat';
        impactSound = 'break';
        zoomTargets.push(enemySpriteBox);
        shakeTargets.push({ el: playerSpriteBox, isHeavy: false });
        popups.push(
            { who: 'player', text: '-1', styleClass: 'popup-dmg' },
            { who: 'player', text: '💫 防御崩壊！', styleClass: 'popup-break' },
            { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
        );
        calloutData = { winner: 'enemy', mainText: '防御崩壊！', subText: '💥 次ターン防御不可' };
    }
    // 4. 防御 vs 基本打突（応じ技準備！）
    else if (playerAction === '防御' && isBasic(enemyAction)) {
        const kiaiBonus = isWaki ? 2 : 1;
        gainKiai('player', kiaiBonus);
        let healed = 0;
        if (isWaki && state.playerHealth < MAX_HEALTH) {
            state.playerHealth = Math.min(MAX_HEALTH, state.playerHealth + 1);
            healed = 1;
        }
        state.playerCounterReady = true;
        playerOutcome = 'block_success';
        message += isWaki
            ? `🌊 脇構えの「${pMoveName}」で相手の「${eMoveName}」を鮮やかに受け流した！気合+2${healed ? '＆体力+1回復' : ''}＆次ターン「🔥応じ技（2倍）」！`
            : `🛡️ 相手の「${eMoveName}」を${pMoveName}で封じた！気合+1＆次ターン「🔥応じ技（威力2倍）」チャンス！`;
        statusType = 'victory';
        impactSound = 'block';
        zoomTargets.push(playerSpriteBox);
        popups.push(
            { who: 'player', text: `🛡️ ${pMoveName}成功！`, styleClass: 'popup-block' },
            ...(isWaki ? [{ who: 'player', text: healed ? '💚 HP+1 & 気合+2' : '🌊 気合+2', styleClass: 'popup-heal' }] : []),
            { who: 'player', text: '🔥 次打2倍！', styleClass: 'popup-counter' }
        );
        calloutData = {
            winner: null,
            mainText: isWaki ? '🌊 後の先の受け！' : '見事な受け！',
            subText: isWaki ? `💚 気合+2${healed ? '・HP+1' : ''}＆次打2倍` : '🔥 次ターン 応じ技(2倍)',
            isGuard: true,
        };
    } else if (isBasic(playerAction) && enemyAction === '防御') {
        const eKiaiBonus = eWaki ? 2 : 1;
        gainKiai('enemy', eKiaiBonus);
        let eHealed = 0;
        const eMax = state.enemyMaxHealth || getCurrentEnemy().maxHealth;
        if (eWaki && state.enemyHealth < eMax) {
            state.enemyHealth = Math.min(eMax, state.enemyHealth + 1);
            eHealed = 1;
        }
        state.enemyCounterReady = true;
        enemyOutcome = 'block_success';
        message += eWaki
            ? `🌊 相手の脇構え「${eMoveName}」に「${pMoveName}」を受け流された！相手は気合+2${eHealed ? '＆体力+1回復' : ''}＆次ターン「🔥応じ技」の構え！`
            : `🛡️ 相手に「${pMoveName}」を受け止められた！相手が「🔥応じ技」の構えに入った！`;
        statusType = 'neutral';
        impactSound = 'block';
        zoomTargets.push(enemySpriteBox);
        popups.push(
            { who: 'enemy', text: `🛡️ ${eMoveName}成功！`, styleClass: 'popup-block' },
            ...(eWaki ? [{ who: 'enemy', text: eHealed ? '💚 HP+1 & 気合+2' : '🌊 気合+2', styleClass: 'popup-heal' }] : []),
            { who: 'enemy', text: '🔥 次打2倍！', styleClass: 'popup-counter' }
        );
        calloutData = {
            winner: null,
            mainText: eWaki ? '🌊 脇構えで受け流された！' : '受け止められた！',
            subText: eWaki ? `⚠️ 相手 気合+2${eHealed ? '・HP+1' : ''}＆応じ構え` : '⚠️ 相手が応じ技の構え',
            isGuard: true,
        };
    }
    // 5. 崩し vs 崩し（鍔迫り合い突入・継続）
    else if (playerAction === '崩し' && enemyAction === '崩し') {
        gainKiai('player', 1);
        gainKiai('enemy', 1);
        state.tsubazeriai = true;
        playerOutcome = 'tsubazeriai_clash';
        enemyOutcome = 'tsubazeriai_clash';
        message += '💥 激しい体当たりの交錯！「鍔迫り合い」に突入！（双方 気合+1・次ターン引き技威力2倍！）';
        statusType = 'neutral';
        impactSound = 'clash';
        popups.push(
            { who: 'player', text: '💥 鍔迫り合い！', styleClass: 'popup-counter' },
            { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
        );
        calloutData = { winner: 'both', mainText: '鍔迫り合い突入！', subText: '💥 次ターン 引き技(2ダメ)チャンス' };
    }
    // 6. 崩し vs 基本打突（打突側が迎撃）
    else if (isBasic(playerAction) && enemyAction === '崩し') {
        const isNukiDo = isWaki && playerAction === '胴' && !inTsuba;
        const jodanBonus = (isJodan && playerAction === '面') ? 1 : 0;
        const eJodanKoteBonus = (eJodan && playerAction === '小手') ? 1 : 0;
        const baseDmg = (pCounter || inTsuba || isNukiDo) ? 2 : 1;
        const dmg = baseDmg + jodanBonus + eJodanKoteBonus;
        const isBoosted = dmg >= 2;
        const kiaiGain = (isWaki && playerAction === '面' && !inTsuba) ? 0 : 1;
        state.enemyHealth -= dmg;
        if (kiaiGain > 0) gainKiai('player', kiaiGain);
        enemyAnim = 'hit';
        enemyOutcome = 'hit';
        impactWeight = isBoosted ? 'heavy' : 'normal';
        if (isNukiDo) {
            message += `🌊 脇構えの秘技「抜き胴」炸裂！！相手の「崩し」の突進を躱しざまに胴を抜き、${dmg}ダメージ！`;
        } else if (eJodanKoteBonus > 0) {
            message += `⚡ 相手の上段の手元（弱点）を突く出ばな「${pMoveName}」が直撃！！${dmg}ダメージ（上段弱点+1）！`;
        } else if (inTsuba) {
            message += `⚡ 鮮やかな「${pMoveName}」炸裂！相手の「${eMoveName}」を躱して斬り抜き、${dmg}ダメージ！`;
        } else if (pCounter) {
            message += `🔥 応じ技炸裂！相手の「崩し」の出端に強烈な「${pMoveName}」が決まり ${dmg}ダメージ！`;
        } else if (jodanBonus > 0) {
            message += `🔥 上段からの豪快な「${pMoveName}」で相手の「崩し」を迎撃！${dmg}ダメージ＆気合+1！`;
        } else {
            message += `⚔️ 相手の「崩し」の出端を「${pMoveName}」で迎撃！ 1ダメージ${kiaiGain ? '＆気合+1' : ''}！`;
        }
        statusType = 'victory';
        impactSound = isBoosted ? 'special' : 'attack';
        zoomTargets.push(playerSpriteBox);
        shakeTargets.push({ el: enemySpriteBox, isHeavy: isBoosted });
        if (isBoosted) doArenaFlash = true;
        popups.push(
            { who: 'enemy', text: isBoosted ? `-${dmg} ${pMoveName}！` : '-1', styleClass: isBoosted ? 'popup-crit' : 'popup-dmg' },
            ...(kiaiGain > 0 ? [{ who: 'player', text: `+${kiaiGain} 気合`, styleClass: 'popup-kiai' }] : [])
        );
        calloutData = {
            winner: 'player',
            mainText: `${pMoveName}あり！`,
            subText: isNukiDo
                ? `🌊 脇構え・抜き胴 (${dmg}点)`
                : (inTsuba ? `⚡ 会心の${pMoveName} (${dmg}点)` : (isBoosted ? `🔥 豪快な${pMoveName} (${dmg}点)` : `⚔️ 出ばな${playerAction}一本`)),
            isCritical: isBoosted,
        };
    } else if (playerAction === '崩し' && isBasic(enemyAction)) {
        const eNukiDo = eWaki && enemyAction === '胴' && !inTsuba;
        const eJodanBonus = (eJodan && enemyAction === '面') ? 1 : 0;
        const jodanKotePenalty = (isJodan && enemyAction === '小手') ? 1 : 0;
        const baseDmg = (eCounter || inTsuba || eNukiDo) ? 2 : 1;
        const dmg = baseDmg + eJodanBonus + jodanKotePenalty;
        const isBoosted = dmg >= 2;
        const eKiaiGain = (eWaki && enemyAction === '面' && !inTsuba) ? 0 : 1;
        state.playerHealth -= dmg;
        if (eKiaiGain > 0) gainKiai('enemy', eKiaiGain);
        playerAnim = 'hit';
        playerOutcome = 'hit';
        impactWeight = isBoosted ? 'heavy' : 'normal';
        if (eNukiDo) {
            message += `🌊 相手の脇構えの秘技「抜き胴」に突進を斬られた！！痛恨の${dmg}ダメージ！`;
        } else if (jodanKotePenalty > 0) {
            message += `上段の手元が浮いた隙に相手の「${eMoveName}」を浴びた！痛恨の${dmg}ダメージ（上段小手被弾+1）！`;
        } else if (eJodanBonus > 0) {
            message += `🔥 相手の上段からの豪快な「${eMoveName}」に出端を叩き割られた！痛恨の${dmg}ダメージ！`;
        } else if (inTsuba) {
            message += `相手の鋭い「${eMoveName}」に突き放しの出端を斬られた！痛恨の2ダメージ！`;
        } else if (eCounter) {
            message += `相手の応じ技「${enemyAction}」に出端を挫かれた！痛恨の ${dmg}ダメージ！`;
        } else {
            message += `「崩し」に踏み込んだところへ相手の「${enemyAction}」を合わせられた！ 1ダメージ！`;
        }
        statusType = 'defeat';
        impactSound = 'hurt';
        zoomTargets.push(enemySpriteBox);
        shakeTargets.push({ el: playerSpriteBox, isHeavy: isBoosted });
        if (isBoosted) doArenaFlash = true;
        popups.push(
            { who: 'player', text: isBoosted ? `-${dmg} ${eMoveName}！` : '-1', styleClass: isBoosted ? 'popup-crit' : 'popup-dmg' },
            ...(eKiaiGain > 0 ? [{ who: 'enemy', text: `+${eKiaiGain} 気合`, styleClass: 'popup-kiai' }] : [])
        );
        calloutData = {
            winner: 'enemy',
            mainText: `${eMoveName}あり！`,
            subText: eNukiDo
                ? `🌊 相手の脇構え・抜き胴 (${dmg}点)`
                : (inTsuba ? `⚡ 相手の${eMoveName} (${dmg}点)` : (isBoosted ? `🔥 相手の${eMoveName} (${dmg}点)` : `⚔️ 出ばな${enemyAction}一本`)),
            isCritical: isBoosted,
        };
    }
    // 7. 基本打突 vs 基本打突（三すくみ＆応じ技＆鍔迫り合い＆上段相面判定）
    else if (playerAction === enemyAction) {
        if (isJodan && !eJodan && playerAction === '面' && !eCounter) {
            // プレイヤー上段の構え特権：相手の通常の「面」を上から一方的に打ち破る（相面制覇）！
            const dmg = (pCounter || inTsuba) ? 3 : 2;
            state.enemyHealth -= dmg;
            gainKiai('player', 1);
            enemyAnim = 'hit';
            enemyOutcome = 'hit';
            impactWeight = 'heavy';
            message += `🔥 上段からの渾身の「${pMoveName}」が相手の面を頭上から粉砕！相面を一方的に制し、${dmg}ダメージ！`;
            statusType = 'victory';
            impactSound = 'special';
            zoomTargets.push(playerSpriteBox);
            shakeTargets.push({ el: enemySpriteBox, isHeavy: true });
            doArenaFlash = true;
            popups.push(
                { who: 'enemy', text: `-${dmg} 相面粉砕！`, styleClass: 'popup-crit' },
                { who: 'player', text: '+1 気合', styleClass: 'popup-kiai' }
            );
            calloutData = {
                winner: 'player',
                mainText: `${pMoveName}あり！`,
                subText: `🔥 上段・相面制覇 (${dmg}点)`,
                isCritical: true,
            };
        } else if (eJodan && !isJodan && enemyAction === '面' && !pCounter) {
            // 敵の上段の構え特権：プレイヤーの通常の「面」を上から一方的に打ち破る！
            const dmg = (eCounter || inTsuba) ? 3 : 2;
            state.playerHealth -= dmg;
            gainKiai('enemy', 1);
            playerAnim = 'hit';
            playerOutcome = 'hit';
            impactWeight = 'heavy';
            message += `🔥 相手の上段からの渾身の「${eMoveName}」に上から面を打ち砕かれた！相面に敗れ痛恨の${dmg}ダメージ！`;
            statusType = 'defeat';
            impactSound = 'hurt';
            zoomTargets.push(enemySpriteBox);
            shakeTargets.push({ el: playerSpriteBox, isHeavy: true });
            doArenaFlash = true;
            popups.push(
                { who: 'player', text: `-${dmg} 相面敗北！`, styleClass: 'popup-crit' },
                { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
            );
            calloutData = {
                winner: 'enemy',
                mainText: `${eMoveName}あり！`,
                subText: `🔥 相手の上段・相面制覇 (${dmg}点)`,
                isCritical: true,
            };
        } else if (pCounter && !eCounter) {
            const pBonus = ((isJodan && playerAction === '面') ? 1 : 0) + ((eJodan && playerAction === '小手') ? 1 : 0);
            const dmg = 2 + pBonus;
            state.enemyHealth -= dmg;
            gainKiai('player', 1);
            enemyAnim = 'hit';
            enemyOutcome = 'hit';
            impactWeight = 'heavy';
            message += `🔥 応じ技の冴え！同じ「${pMoveName}」の打ち合いを制し、${dmg}ダメージ奪った！`;
            statusType = 'victory';
            impactSound = 'special';
            zoomTargets.push(playerSpriteBox);
            shakeTargets.push({ el: enemySpriteBox, isHeavy: true });
            doArenaFlash = true;
            popups.push(
                { who: 'enemy', text: `-${dmg} 応じ${playerAction}！`, styleClass: 'popup-crit' },
                { who: 'player', text: '+1 気合', styleClass: 'popup-kiai' }
            );
            calloutData = {
                winner: 'player',
                mainText: `${pMoveName}あり！`,
                subText: `🔥 応じ${playerAction}・相打ち制覇(${dmg}点)`,
                isCritical: true,
            };
        } else if (eCounter && !pCounter) {
            const eBonus = ((eJodan && enemyAction === '面') ? 1 : 0) + ((isJodan && enemyAction === '小手') ? 1 : 0);
            const dmg = 2 + eBonus;
            state.playerHealth -= dmg;
            gainKiai('enemy', 1);
            playerAnim = 'hit';
            playerOutcome = 'hit';
            impactWeight = 'heavy';
            message += `相手の応じ技「${eMoveName}」に打ち負けた！ ${dmg}ダメージ！`;
            statusType = 'defeat';
            impactSound = 'hurt';
            zoomTargets.push(enemySpriteBox);
            shakeTargets.push({ el: playerSpriteBox, isHeavy: true });
            doArenaFlash = true;
            popups.push(
                { who: 'player', text: `-${dmg} 応じ${enemyAction}！`, styleClass: 'popup-crit' },
                { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
            );
            calloutData = {
                winner: 'enemy',
                mainText: `${eMoveName}あり！`,
                subText: `🔥 相手の応じ${enemyAction} (${dmg}点)`,
                isCritical: true,
            };
        } else if (!inTsuba) {
            // 通常間合いでの同技交錯 → 鍔迫り合いへ突入！
            gainKiai('player', 1);
            gainKiai('enemy', 1);
            state.tsubazeriai = true;
            playerOutcome = 'tsubazeriai_clash';
            enemyOutcome = 'tsubazeriai_clash';
            message += `💥 互いの「${pMoveName}」が激しく火花を散らし、そのまま「鍔迫り合い」に突入！（双方 気合+1・次ターン引き技2ダメージ！）`;
            statusType = 'neutral';
            impactSound = 'clash';
            shakeTargets.push({ el: playerSpriteBox, isHeavy: false }, { el: enemySpriteBox, isHeavy: false });
            popups.push(
                { who: 'player', text: '💥 鍔迫り合い！', styleClass: 'popup-counter' },
                { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
            );
            calloutData = {
                winner: 'both',
                mainText: '鍔迫り合い突入！',
                subText: `💥 相${playerAction}から接近戦へ（次打・引き技2倍）`,
            };
        } else {
            // 鍔迫り合い中の同技交錯 → 相打ち1ダメージ＆間合いが離れる
            state.playerHealth -= 1;
            state.enemyHealth -= 1;
            gainKiai('player', 1);
            gainKiai('enemy', 1);
            playerOutcome = 'mutual_hit';
            enemyOutcome = 'mutual_hit';
            message += `⚔️ 引き技の相打ち！互いに「${pMoveName}」を打ち合い、双方に1ダメージ＆間合いが離れた！`;
            statusType = 'defeat';
            impactSound = 'clash';
            shakeTargets.push({ el: playerSpriteBox, isHeavy: false }, { el: enemySpriteBox, isHeavy: false });
            popups.push(
                { who: 'player', text: '-1 相打ち', styleClass: 'popup-dmg' },
                { who: 'enemy', text: '-1 相打ち', styleClass: 'popup-dmg' }
            );
            calloutData = { winner: 'both', mainText: '相打ち！', subText: `互いに${pMoveName} (双方-1)` };
        }
    } else {
        const isValid = attackMap[playerAction].includes(enemyAction);
        if (isValid) {
            const jodanBonus = (isJodan && playerAction === '面') ? 1 : 0;
            const eJodanKoteBonus = (eJodan && playerAction === '小手') ? 1 : 0;
            const dmg = ((pCounter || inTsuba) ? 2 : 1) + jodanBonus + eJodanKoteBonus;
            const isBoosted = dmg >= 2;
            const kiaiGain = (isWaki && playerAction === '面' && !inTsuba) ? 0 : 1;
            state.enemyHealth -= dmg;
            if (kiaiGain > 0) gainKiai('player', kiaiGain);
            enemyAnim = 'hit';
            enemyOutcome = 'hit';
            impactWeight = isBoosted ? 'heavy' : 'normal';
            if (eJodanKoteBonus > 0) {
                message += `⚡ 相手の上段の構えの弱点である手元へ鋭い「${pMoveName}」が直撃！！${dmg}ダメージ（上段弱点+1）！`;
            } else if (jodanBonus > 0) {
                message += `🔥 上段から振り下ろす豪快な「${pMoveName}」が一閃！！相手の「${eMoveName}」を粉砕し、${dmg}ダメージ！`;
            } else if (inTsuba) {
                message += `⚡ 会心の「${pMoveName}」が一閃！！鍔迫り合いを制し、2ダメージの有効打突！`;
            } else if (pCounter) {
                message += `🔥 応じ技「${playerAction}」が一閃！！ 2ダメージの有効打突！`;
            } else {
                message += `⚔️ 鮮やかな「${playerAction}」が決まりました！ 1ダメージ${kiaiGain ? '＆気合+1' : '（脇構えのため気合+0）'}！`;
            }
            statusType = 'victory';
            impactSound = isBoosted ? 'special' : 'attack';
            zoomTargets.push(playerSpriteBox);
            shakeTargets.push({ el: enemySpriteBox, isHeavy: isBoosted });
            if (isBoosted) doArenaFlash = true;
            popups.push(
                { who: 'enemy', text: isBoosted ? `-${dmg} ${pMoveName}！` : '-1', styleClass: isBoosted ? 'popup-crit' : 'popup-dmg' },
                ...(kiaiGain > 0 ? [{ who: 'player', text: `+${kiaiGain} 気合`, styleClass: 'popup-kiai' }] : [])
            );
            calloutData = {
                winner: 'player',
                mainText: `${pMoveName}あり！`,
                subText: eJodanKoteBonus > 0
                    ? `⚡ 上段の隙を射抜く小手 (${dmg}点)`
                    : (jodanBonus > 0
                        ? `🔥 上段の一閃・${pMoveName} (${dmg}点)`
                        : (inTsuba ? `⚡ 鍔迫り合い制覇・${pMoveName} (2点)` : (pCounter ? `🔥 会心の応じ${playerAction} (2点)` : `🚩 有効打突・一本！`))),
                isCritical: isBoosted,
            };
        } else {
            const eJodanBonus = (eJodan && enemyAction === '面') ? 1 : 0;
            const jodanKotePenalty = (isJodan && enemyAction === '小手') ? 1 : 0;
            const dmg = ((eCounter || inTsuba) ? 2 : 1) + eJodanBonus + jodanKotePenalty;
            const isBoosted = dmg >= 2;
            const eKiaiGain = (eWaki && enemyAction === '面' && !inTsuba) ? 0 : 1;
            state.playerHealth -= dmg;
            if (eKiaiGain > 0) gainKiai('enemy', eKiaiGain);
            playerAnim = 'hit';
            playerOutcome = 'hit';
            impactWeight = isBoosted ? 'heavy' : 'normal';
            if (jodanKotePenalty > 0) {
                message += `⚠️ 上段の構えの弱点である手元へ相手の「${eMoveName}」が直撃！！痛恨の${dmg}ダメージ（上段小手被弾+1）！`;
            } else if (eJodanBonus > 0) {
                message += `🔥 相手の上段から振り下ろす豪快な「${eMoveName}」を浴びた！！痛恨の${dmg}ダメージ！`;
            } else if (inTsuba) {
                message += `相手の鋭い「${eMoveName}」に鍔迫り合いを制された！痛恨の2ダメージ！`;
            } else if (eCounter) {
                message += `相手の強烈な応じ技「${enemyAction}」を浴びた！ 2ダメージ！`;
            } else {
                message += `相手の「${enemyAction}」があなたに決まりました！ 1ダメージ！`;
            }
            statusType = 'defeat';
            impactSound = 'hurt';
            zoomTargets.push(enemySpriteBox);
            shakeTargets.push({ el: playerSpriteBox, isHeavy: isBoosted });
            if (isBoosted) doArenaFlash = true;
            popups.push(
                { who: 'player', text: isBoosted ? `-${dmg} ${eMoveName}！` : '-1', styleClass: isBoosted ? 'popup-crit' : 'popup-dmg' },
                ...(eKiaiGain > 0 ? [{ who: 'enemy', text: `+${eKiaiGain} 気合`, styleClass: 'popup-kiai' }] : [])
            );
            calloutData = {
                winner: 'enemy',
                mainText: `${eMoveName}あり！`,
                subText: jodanKotePenalty > 0
                    ? `⚠️ 上段への小手直撃 (${dmg}点)`
                    : (eJodanBonus > 0
                        ? `🔥 相手の上段一閃・${eMoveName} (${dmg}点)`
                        : (inTsuba ? `⚡ 相手の${eMoveName} (2点)` : (eCounter ? `🔥 相手の応じ${enemyAction} (2点)` : `🏳️ 相手の一本`))),
                isCritical: isBoosted,
            };
        }
    }

    state.playerAnimState = playerAnim;
    state.enemyAnimState = enemyAnim;

    const enemyData = getCurrentEnemy();
    let finalStatusMessage = message;
    let finalStatusType = statusType;

    // 勝敗判定
    if (state.playerHealth <= 0 && state.enemyHealth <= 0) {
        state.playerAnimState = 'hit';
        state.enemyAnimState = 'hit';
        state.gameOver = true;
        state.lastOutcome = 'draw';
        impactWeight = 'heavy';
        endGameSound = 'lose';
        finalStatusMessage = `引き分け（相打ち決着）！第${state.round}合で双方が倒れました。`;
        finalStatusType = 'neutral';
        calloutData = { winner: 'both', mainText: '相打ち決着！', subText: '双方同時に倒れた', isCritical: true };
    } else if (state.playerHealth <= 0) {
        state.playerAnimState = 'hit';
        state.enemyAnimState = 'victory';
        state.gameOver = true;
        state.lastOutcome = 'defeat';
        impactWeight = 'heavy';
        endGameSound = 'lose';
        finalStatusMessage = `敗北… ${enemyData.role}【${enemyData.name}】に第${state.round}合で敗れました。（${message}）`;
        finalStatusType = 'defeat';
        calloutData = {
            winner: 'enemy',
            mainText: '勝負あり！',
            subText: `🏳️ 白（${enemyData.shortName}）の勝利（${eMoveName}）`,
            isCritical: false,
        };
    } else if (state.enemyHealth <= 0) {
        state.playerAnimState = 'victory';
        state.enemyAnimState = 'hit';
        state.gameOver = true;
        state.lastOutcome = 'victory';
        state.clearedStages.add(state.stageIndex);
        impactWeight = 'heavy';
        endGameSound = 'win';

        const allCleared = state.clearedStages.size === ENEMY_ROSTER.length;
        if (allCleared && state.stageIndex === ENEMY_ROSTER.length - 1) {
            finalStatusMessage = `🎉 天下無双！！大将【${enemyData.name}】を破り、勝ち抜き五人掛けを完全制覇しました！！（${message}）`;
            finalStatusType = 'victory';
            calloutData = {
                winner: 'player',
                mainText: '🏆 五人掛け完全制覇！',
                subText: `🚩 天下無双・${enemyData.shortName}を撃破！`,
                isCritical: true,
            };
        } else if (state.stageIndex < ENEMY_ROSTER.length - 1) {
            const nextEnemy = ENEMY_ROSTER[state.stageIndex + 1];
            finalStatusMessage = `🏆 勝負あり！${enemyData.role}【${enemyData.name}】を撃破！次は${nextEnemy.role}【${nextEnemy.name}】が待ち受ける！（${message}）`;
            finalStatusType = 'victory';
            calloutData = {
                winner: 'player',
                mainText: `🏆 ${enemyData.role}撃破！`,
                subText: `🚩 赤（あなた）の勝利！（次戦：${nextEnemy.role}・${nextEnemy.shortName}）`,
                isCritical: true,
            };
        } else {
            finalStatusMessage = `🏆 勝負あり！${enemyData.role}【${enemyData.name}】に勝利しました！（${message}）`;
            finalStatusType = 'victory';
            calloutData = {
                winner: 'player',
                mainText: '🏆 勝負あり！',
                subText: `🚩 赤（あなた）の勝利！（${pMoveName}）`,
                isCritical: true,
            };
        }
    }

    if (state.gameOver) {
        state.tsubazeriai = false;
    }

    // 1. アニメーション開始時：前回の旗表示を消し、立ち合い中テキストを表示してボタンを一時ロック
    hideRefereeCallout();
    setActionButtonsLocked(true);
    updateStatus(`第${state.round}合${inTsuba ? '【鍔迫り合い】' : ''}: あなた【${pMoveName}】 vs ${enemyData.shortName}【${eMoveName}】 — 立ち合い…！`, 'neutral');
    if (intentText) intentText.textContent = inTsuba ? '💥 鍔迫り合いから技が交錯しています…' : '⚔️ 技が交錯しています…';

    // 2. 打突・被弾の連続キーフレームアニメーションを再生
    triggerFighterAnimation('player', playerAction, playerOutcome, impactWeight, inTsuba);
    triggerFighterAnimation('enemy', enemyAction, enemyOutcome, impactWeight, inTsuba);

    // 3. 打突の最後のコマ（STRIKE_IMPACT_T = 320ms）到達時に打突音・画面シェイク・ズームを発火
    pendingImpactCallback = () => {
        if (impactSound) playSound(impactSound);
        zoomTargets.forEach((el) => triggerImpactZoom(el));
        shakeTargets.forEach((t) => triggerShake(t.el, t.isHeavy));
        if (doArenaFlash) triggerArenaFlash();
    };
    pendingImpactTimer = setTimeout(() => {
        firePendingImpact();
    }, STRIKE_IMPACT_T);

    // 4. アニメーション完了後にHPゲージ・気合ゲージ・構えバッジ・ポップアップ・審判旗・結果を反映
    pendingRoundCallback = () => {
        decideEnemyIntent();
        if (!state.gameOver) {
            state.playerAnimState = getNeutralAnim('player');
            state.enemyAnimState = getNeutralAnim('enemy');
        }
        updateUI();
        popups.forEach((p) => spawnFloatingPopup(p.who, p.text, p.styleClass));
        if (calloutData) {
            showRefereeCallout(calloutData);
        } else {
            hideRefereeCallout();
        }
        if (endGameSound) {
            playSound(endGameSound);
        }
        updateStatus(finalStatusMessage, finalStatusType);
    };
    pendingRoundTimer = setTimeout(() => {
        flushPendingRound();
    }, 1250);
}

function selectStage(stageIndex) {
    const clamped = Math.max(0, Math.min(ENEMY_ROSTER.length - 1, Number(stageIndex) || 0));
    state.stageIndex = clamped;
    resetGame();
}

function advanceStage() {
    if (state.stageIndex < ENEMY_ROSTER.length - 1) {
        state.stageIndex += 1;
    } else {
        state.stageIndex = 0;
        state.clearedStages.clear();
    }
    resetGame();
}

function resetGame() {
    clearPendingRoundTimers();
    if (state.animResetTimer) {
        clearTimeout(state.animResetTimer);
        state.animResetTimer = null;
    }
    hideRefereeCallout();
    if (playerPopupLayer) playerPopupLayer.innerHTML = '';
    if (enemyPopupLayer) enemyPopupLayer.innerHTML = '';
    timeState.hitStopUntil = 0;
    timeState.slowMoUntil = 0;

    const enemyData = getCurrentEnemy();
    state.enemyMaxHealth = enemyData.maxHealth;
    state.playerHealth = MAX_HEALTH;
    state.enemyHealth = enemyData.maxHealth;
    state.playerKiai = 0;
    state.enemyKiai = enemyData.initialKiai || 0;
    state.playerCounterReady = false;
    state.enemyCounterReady = false;
    state.playerGuardBroken = false;
    state.enemyGuardBroken = false;
    state.tsubazeriai = false;
    state.enemyStanceStyle = 'chudan';
    state.round = 0;
    state.gameOver = false;
    state.lastOutcome = null;

    decideEnemyIntent();
    state.playerAnimState = getNeutralAnim('player');
    state.enemyAnimState = getNeutralAnim('enemy');

    animators.player = createAnimator(0);
    animators.player.currentPose = { ...getContinuousStancePose(state.playerAnimState, 0) };
    animators.enemy = createAnimator(1.8);
    animators.enemy.currentPose = { ...getContinuousStancePose(state.enemyAnimState, 1.8) };

    updateUI();
    updateStatus(`【${enemyData.role}戦】${enemyData.name}（${enemyData.rank}）が登場！ ${enemyData.introQuote}`, 'neutral');
}

function animationLoop(timestamp) {
    const now = timestamp || ((typeof performance !== 'undefined') ? performance.now() : Date.now());
    updateAndDrawFighter(playerCtx, 'player', false, now);
    updateAndDrawFighter(enemyCtx, 'enemy', true, now);
    if (pendingRoundCallback && !animators.player.keyframes && !animators.enemy.keyframes) {
        flushPendingRound();
    }
    requestAnimationFrame(animationLoop);
}

// 初期化
resetGame();
animationLoop();
