const MAX_HEALTH = 5;
const MAX_KIAI = 3;

// ───────────────────────────────────────────
// 必殺技・得意技（無敵攻撃・気合3消費）データベース
// ───────────────────────────────────────────
const SPECIAL_TECHNIQUES = {
    // 面系統
    hien_men: {
        id: 'hien_men',
        name: '飛燕二段面',
        type: '面',
        reqStat: 'men',
        reqVal: 38,
        desc: '電光石火の二段面。相手のあらゆる守りを頭上から粉砕する。',
        power: 2,
    },
    gouriki_men: {
        id: 'gouriki_men',
        name: '剛烈・兜割り',
        type: '面',
        reqStat: 'men',
        reqVal: 52,
        desc: '豪腕を叩き込む重烈な面。相手の太刀筋を力で押し潰す。',
        power: 2,
    },
    tenkou_men: {
        id: 'tenkou_men',
        name: '天光一刀面',
        type: '面',
        reqStat: 'men',
        reqVal: 65,
        desc: '天頂より振り下ろす極光の一閃。相討ちを許さぬ究極の面。',
        power: 3,
    },

    // 小手系統
    dengeki_kote: {
        id: 'dengeki_kote',
        name: '出ばな電撃小手',
        type: '小手',
        reqStat: 'kote',
        reqVal: 40,
        desc: '技の起こりを捉える神速の小手。手元を閃光のように射抜く。',
        power: 2,
    },
    kasumi_kote: {
        id: 'kasumi_kote',
        name: '霞打ち連撃小手',
        type: '小手',
        reqStat: 'kote',
        reqVal: 55,
        desc: '残像を残す幻惑の小手。相手の防御の隙間に吸い込まれる。',
        power: 2,
    },

    // 胴系統
    hayate_do: {
        id: 'hayate_do',
        name: '疾風抜き胴',
        type: '胴',
        reqStat: 'do',
        reqVal: 40,
        desc: '相手の打突を紙一重でかわし、瞬時に脇腹を斬り抜く。',
        power: 2,
    },
    gen_do: {
        id: 'gen_do',
        name: '幻影逆胴一閃',
        type: '胴',
        reqStat: 'do',
        reqVal: 55,
        desc: '死角から切り返す幻の逆胴。相手の反撃の機先を完全に制す。',
        power: 2,
    },

    // 突き系統
    shiden_tsuki: {
        id: 'shiden_tsuki',
        name: '紫電一閃突き',
        type: '突き',
        reqStat: 'tsuki',
        reqVal: 38,
        desc: '喉元へ直線一筋に放たれる神速の突き。相手の構えを貫通する。',
        power: 2,
    },
    tensho_tsuki: {
        id: 'tensho_tsuki',
        name: '天翔諸手突き',
        type: '突き',
        reqStat: 'tsuki',
        reqVal: 60,
        desc: '全身の体重と気迫を竹刀の先一点に乗せて穿つ奥義。',
        power: 3,
    },
};
window.SPECIAL_TECHNIQUES = SPECIAL_TECHNIQUES;

// 勝ち抜き五人掛け：個性・剣風・胴カラーが異なる5人の剣士データ
const ENEMY_ROSTER = [
    {
        id: 'kenta',
        role: '先鋒',
        shortName: '健太',
        name: '門下生・健太',
        rank: '初段',
        trialTitle: '第一の試練：無垢なる熱意',
        illustration: 'img/story/trial1_kenta.png',
        avatarEmoji: '👦',
        styleTag: '素直な面打ち',
        maxHealth: 4,
        initialKiai: 0,
        str: 12,
        agi: 12,
        spi: 12,
        skills: { men: 42, kote: 28, do: 25, tsuki: 20 },
        specialTechnique: 'hien_men',
        kiaiShoutText: 'やぁぁぁ！',
        introQuote: '「お願いします！まずは真っ直ぐ面で勝負です！」',
        preMatchDialog: [
            { speaker: 'enemy', name: '門下生・健太', text: '先輩！いよいよ五人掛けの試練ですね！手加減は無用です、僕の真っ直ぐな面を受けてみてください！' },
            { speaker: 'player', name: 'あなた', text: '受けて立とう。迷わず全力で飛び込んできなさい！' },
        ],
        postMatchDialog: {
            victory: '参りました……！やっぱり先輩の踏み込みは一味違います。僕の気合も乗せて、次へ進んでください！',
            defeat: 'やりました！……でも先輩、少し焦りが見えましたよ。もう一度気合を入れ直してください！',
        },
        tributeQuote: '先輩、免許皆伝おめでとうございます！僕、一生ついていきます！',
        armorTheme: {
            doStops: ['#14161b', '#252932', '#475569', '#22262e', '#111318'],
            muneFill: '#1e293b',
            muneStitch: 'rgba(226, 232, 240, 0.72)',
            tareLine: 'rgba(148, 163, 184, 0.5)',
        },
        face: {
            seed: 'boss_kenta',
            skinId: 'healthy',
            skin: { id: 'healthy', name: '健康的', base: '#f1c39e', shadow: '#d69e77', blush: '#de8a81' },
            hairColorId: 'black',
            hairColor: { id: 'black', main: '#121417', highlight: '#2a3138' },
            eyeColor: '#1a1918',
            hairStyle: 'short_sporty',
            faceShape: 0,
            eyeType: 0,
            eyebrowType: 1,
            mouthType: 1,
            noseType: 0,
            uniformType: 'gakuran',
            accessory: 'bandage_nose',
            bgStyleId: 'blue_grad',
            bgStyle: { id: 'blue_grad', top: '#6ba5e7', bottom: '#3768b5' }
        },
        patterns: [
            {
                stance: 'jodan',
                hint: '🔥【上段の構え】健太は竹刀を頭上に振りかぶり、渾身の「上段面」を狙っている！（「胴」で躱すか、「防御」で防いで応じ技を狙え！）',
                isDanger: true,
                weights: { 面: 68, 小手: 16, 胴: 10, 突き: 6, 防御: 0, 崩し: 0 },
            },
            {
                stance: 'chudan',
                hint: '⚖️【中段の構え】健太は元気よく「面」か「小手」に飛び込もうとしている！（「防御」や「胴」が有効）',
                isDanger: false,
                weights: { 面: 40, 小手: 26, 胴: 10, 突き: 6, 防御: 18, 崩し: 0 },
            },
            {
                stance: 'chudan',
                hint: '🛡️【中段の構え】健太は少し緊張して守りを意識しつつ「面」を狙っている…（「崩し」や「胴」の好機！）',
                isDanger: false,
                weights: { 防御: 40, 面: 36, 小手: 14, 胴: 5, 突き: 5, 崩し: 0 },
            },
        ],
    },
    {
        id: 'sasaki',
        role: '次鋒',
        shortName: '佐々木',
        name: '小手名人・佐々木',
        rank: '三段',
        trialTitle: '第二の試練：静寂の見切り',
        illustration: 'img/story/trial2_sasaki.png',
        avatarEmoji: '👓',
        styleTag: '出ばな小手と下段の構えの受け',
        maxHealth: 5,
        initialKiai: 0,
        str: 14,
        agi: 18,
        spi: 15,
        skills: { men: 32, kote: 52, do: 32, tsuki: 30 },
        specialTechnique: 'dengeki_kote',
        kiaiShoutText: 'やぁぁぁ！',
        introQuote: '「手元の隙は見逃さん。出ばな小手と下段の構えの妙技、受けてみよ！」',
        preMatchDialog: [
            { speaker: 'enemy', name: '小手名人・佐々木', text: '健太を抜いたか。だが勢いだけで越えられるほど甘くはないよ。君の手元の隙、出ばな小手で見極めさせてもらう。' },
            { speaker: 'player', name: 'あなた', text: '佐々木先輩……。間合いの駆け引きと後の先、勉強させていただきます！' },
        ],
        postMatchDialog: {
            victory: '見事だ……。私の見切りを上回る鋭い打突だった。次は鬼塚先輩だ、力負けするなよ。',
            defeat: '手元が浮いたね。焦りは禁物だ。息を整えて出直しておいで。',
        },
        tributeQuote: '私の見切りすら超えてみせた。君の剣は本物だ、胸を張りたまえ。',
        armorTheme: {
            doStops: ['#082f49', '#0369a1', '#38bdf8', '#075985', '#0c4a6e'],
            muneFill: '#0f172a',
            muneStitch: 'rgba(56, 189, 248, 0.88)',
            tareLine: 'rgba(56, 189, 248, 0.65)',
        },
        face: {
            seed: 'boss_sasaki',
            skinId: 'fair',
            skin: { id: 'fair', name: '色白', base: '#fde7d8', shadow: '#eec2a8', blush: '#f5b5aa' },
            hairColorId: 'dark_brown',
            hairColor: { id: 'dark_brown', main: '#2d1e18', highlight: '#483329' },
            eyeColor: '#2b211a',
            hairStyle: 'center_part',
            faceShape: 1,
            eyeType: 3,
            eyebrowType: 4,
            mouthType: 2,
            noseType: 2,
            uniformType: 'blazer_tie',
            accessory: 'glasses_square',
            bgStyleId: 'cyan_grad',
            bgStyle: { id: 'cyan_grad', top: '#5bc0de', bottom: '#2f7b9c' }
        },
        patterns: [
            {
                stance: 'chudan',
                hint: '⚡【中段の構え】佐々木は鋭い視線であなたの手元（「小手」）を狙っている！（「面」で上から乗り切る好機！）',
                isDanger: false,
                weights: { 小手: 50, 防御: 26, 面: 10, 胴: 8, 突き: 6, 崩し: 0 },
            },
            {
                stance: 'waki',
                hint: '🌊【下段の構え】佐々木は竹刀を低く構え、「後の先防御(HP+1)」か「抜き胴」を狙っている！（「崩し」で防御を割るか、「小手」が有効！）',
                isDanger: false,
                weights: { 防御: 52, 小手: 24, 胴: 14, 面: 5, 突き: 5, 崩し: 0 },
            },
            {
                stance: 'waki',
                hint: '🌊【下段の構え】佐々木は下段の構えから「小手」と「抜き胴」の二択を迫っている…',
                isDanger: false,
                weights: { 小手: 42, 胴: 26, 防御: 20, 面: 8, 突き: 4, 崩し: 0 },
            },
        ],
    },
    {
        id: 'onizuka',
        role: '中堅',
        shortName: '鬼塚',
        name: '剛剣・鬼塚',
        rank: '四段',
        trialTitle: '第三の試練：剛毅なる気魄',
        illustration: 'img/story/trial3_onizuka.png',
        avatarEmoji: '🦁',
        styleTag: '剛剣上段と豪快な崩し',
        maxHealth: 6,
        initialKiai: 1,
        str: 22,
        agi: 14,
        spi: 18,
        skills: { men: 58, kote: 30, do: 40, tsuki: 25 },
        specialTechnique: 'gouriki_men',
        kiaiShoutText: 'やぁぁぁ！',
        introQuote: '「小細工は無用！火の上段と体当たりの『崩し』で叩き割ってくれるわ！」',
        preMatchDialog: [
            { speaker: 'enemy', name: '剛剣・鬼塚', text: 'ガハハ！よくぞ佐々木を破った！だが小細工はここまでだ！火の上段と体当たり、骨ごと叩き割ってやるぜ！' },
            { speaker: 'player', name: 'あなた', text: '気迫なら引けを取りません！真っ向から打ち破ってみせます！' },
        ],
        postMatchDialog: {
            victory: 'ぐっ……見事な一撃だ！俺の気合に一歩も引かなかったな。お前の腹、完全に据わってやがる！',
            defeat: 'どうした、腰が引けてたぞ！覚悟を決めなきゃ俺の上段は破れねえぞ！',
        },
        tributeQuote: 'ガハハ！あの師範代を倒すとはな！最高の立ち合い、胸が熱くなったぜ！',
        armorTheme: {
            doStops: ['#450a0a', '#991b1b', '#ef4444', '#7f1d1d', '#3b0707'],
            muneFill: '#291010',
            muneStitch: 'rgba(250, 204, 21, 0.9)',
            tareLine: 'rgba(248, 113, 113, 0.65)',
        },
        face: {
            seed: 'boss_onizuka',
            skinId: 'deep_tanned',
            skin: { id: 'deep_tanned', name: '剣道焼け', base: '#c68f64', shadow: '#a16d44', blush: '#ae5f53' },
            hairColorId: 'soft_black',
            hairColor: { id: 'soft_black', main: '#23252a', highlight: '#3a3e47' },
            eyeColor: '#1a1918',
            hairStyle: 'buzz_cut',
            faceShape: 3,
            eyeType: 4,
            eyebrowType: 0,
            mouthType: 5,
            noseType: 1,
            uniformType: 'dougi_navy',
            accessory: 'bandage_cheek',
            bgStyleId: 'gray_grad',
            bgStyle: { id: 'gray_grad', top: '#9aa0a6', bottom: '#5f6368' }
        },
        patterns: [
            {
                stance: 'chudan',
                hint: '💥【中段の構え】鬼塚は強引に間合いを詰め、「崩し」の体当たりか豪快な「胴」を狙っている！（基本打突で迎撃せよ）',
                isDanger: true,
                weights: { 崩し: 48, 胴: 26, 面: 12, 小手: 10, 突き: 4, 防御: 0 },
            },
            {
                stance: 'jodan',
                hint: '🔥【上段の構え】鬼塚が竹刀を頭上に掲げた！強烈な「上段面」か「胴」が来るぞ！（「胴」で面を抜くか、「小手」で胴を断て！）',
                isDanger: true,
                weights: { 面: 46, 胴: 30, 崩し: 14, 小手: 6, 突き: 4, 防御: 0 },
            },
            {
                stance: 'jodan',
                hint: '🔥【上段の構え】鬼塚は上段から「上段面」と「崩し」で粉砕する気配！（「胴」で面を抜くか、「小手」で崩しを迎撃せよ！）',
                isDanger: true,
                weights: { 面: 42, 崩し: 34, 胴: 14, 小手: 6, 突き: 4, 防御: 0 },
            },
        ],
    },
    {
        id: 'kasumi',
        role: '副将',
        shortName: '霞',
        name: '幻影・霞',
        rank: '五段',
        trialTitle: '第四の試練：鏡花水月の惑い',
        illustration: 'img/story/trial4_kasumi.png',
        avatarEmoji: '🦊',
        styleTag: '三構え変化と応じ技',
        maxHealth: 5,
        initialKiai: 0,
        str: 16,
        agi: 22,
        spi: 20,
        skills: { men: 40, kote: 45, do: 60, tsuki: 35 },
        specialTechnique: 'gen_do',
        kiaiShoutText: 'やぁぁぁ！',
        introQuote: '「中段・上段・下段の構え…見えている太刀筋だけが真実とは限りませんよ…」',
        preMatchDialog: [
            { speaker: 'enemy', name: '幻影・霞', text: '剛を越えた次は、柔の深淵です。三つの構え、虚と実……あなたの瞳には、真実の太刀筋が視えていますか？' },
            { speaker: 'player', name: 'あなた', text: '惑わされません。心を静かに澄ませて立ち合います。' },
        ],
        postMatchDialog: {
            victory: '……ふふ、見事に幻を払われましたね。迷いのない太刀筋でした。さあ……いよいよ龍禅先生のお出ましです。',
            defeat: '目に見える太刀筋に心を奪われていては、師範代には届きませんよ。',
        },
        tributeQuote: '静かなる明鏡止水の剣……心より敬服いたします。おめでとうございます。',
        armorTheme: {
            doStops: ['#2e1065', '#581c87', '#a855f7', '#4c1d95', '#1e1b4b'],
            muneFill: '#1e1b4b',
            muneStitch: 'rgba(216, 180, 254, 0.88)',
            tareLine: 'rgba(192, 132, 252, 0.65)',
        },
        face: {
            seed: 'boss_kasumi',
            skinId: 'fair',
            skin: { id: 'fair', name: '色白', base: '#fde7d8', shadow: '#eec2a8', blush: '#f5b5aa' },
            hairColorId: 'blue_black',
            hairColor: { id: 'blue_black', main: '#141d28', highlight: '#253448' },
            eyeColor: '#1e242e',
            hairStyle: 'ponytail',
            faceShape: 1,
            eyeType: 1,
            eyebrowType: 4,
            mouthType: 1,
            noseType: 1,
            uniformType: 'blazer_ribbon',
            accessory: 'mole_eye',
            bgStyleId: 'navy_grad',
            bgStyle: { id: 'navy_grad', top: '#2c3e50', bottom: '#1a252f' }
        },
        patterns: [
            {
                stance: 'waki',
                hint: '🌊【下段の構え】霞は静かに竹刀を低く構え、「後の先防御(HP+1)」か意表を突く「抜き胴」を狙っている…',
                isDanger: false,
                weights: { 防御: 48, 胴: 24, 小手: 14, 面: 8, 突き: 6, 崩し: 0 },
            },
            {
                stance: 'chudan',
                hint: '👁️【中段の構え】霞は「面」と見せかけて手元の「小手」や「崩し」も織り交ぜる変幻自在の構え！',
                isDanger: false,
                weights: { 小手: 30, 面: 22, 崩し: 18, 防御: 20, 胴: 5, 突き: 5 },
            },
            {
                stance: 'jodan',
                hint: '🔥【上段の構え】霞がすっと諸手上段に構えた！「上段面」と「胴」の二段変化を狙っているぞ！（「胴」で面を抜くか、「小手」で胴を断て！）',
                isDanger: true,
                weights: { 面: 42, 胴: 36, 小手: 14, 突き: 8, 防御: 0, 崩し: 0 },
            },
        ],
    },
    {
        id: 'ryuzen',
        role: '大将',
        shortName: '龍禅',
        name: '師範代・龍禅',
        rank: '範士八段',
        trialTitle: '最終試練：不動心の極致',
        illustration: 'img/story/trial5_ryuzen.png',
        avatarEmoji: '🐉',
        styleTag: '三位一体の構え・諸手突き',
        maxHealth: 7,
        initialKiai: 1,
        str: 24,
        agi: 24,
        spi: 25,
        skills: { men: 72, kote: 70, do: 68, tsuki: 75 },
        specialTechnique: 'tensho_tsuki',
        kiaiShoutText: 'やぁぁぁ！',
        introQuote: '「よくぞここまで勝ち上がった。天地水の三つの構え、全力で超えてみせよ！」',
        preMatchDialog: [
            { speaker: 'enemy', name: '師範代・龍禅', text: 'よくぞ四人を乗り越え、ここまで辿り着いた。もはや言葉は不要。お前の磨き上げた剣の全て――この龍禅が全身全霊で受け止めよう。……構えよッ！' },
            { speaker: 'player', name: 'あなた', text: '道場の教え、そして己の剣の集大成……全力で打ち込ませていただきます！' },
        ],
        postMatchDialog: {
            victory: '……見事！我が太刀筋を越え、理合を貫いたな。晴れやかなる一本であった！',
            defeat: '迷いがあれば剣も曇る。己の信じた道をもう一度研ぎ澄ませてまいれ。',
        },
        tributeQuote: '免許皆伝を授く。『交剣知愛』の心を胸に、新時代の道を切り拓くがよい！',
        armorTheme: {
            doStops: ['#422006', '#a16207', '#facc15', '#854d0e', '#271202'],
            muneFill: '#1c1917',
            muneStitch: 'rgba(253, 224, 71, 0.95)',
            tareLine: 'rgba(250, 204, 21, 0.78)',
        },
        face: {
            seed: 'boss_ryuzen',
            skinId: 'tanned',
            skin: { id: 'tanned', name: '日焼け', base: '#dda980', shadow: '#ba855d', blush: '#c8766a' },
            hairColorId: 'ash_dark',
            hairColor: { id: 'ash_dark', main: '#222830', highlight: '#38424f' },
            eyeColor: '#1a1918',
            hairStyle: 'all_back',
            faceShape: 3,
            eyeType: 6,
            eyebrowType: 2,
            mouthType: 4,
            noseType: 2,
            uniformType: 'dougi_navy',
            accessory: 'none',
            bgStyleId: 'cream_grad',
            bgStyle: { id: 'cream_grad', top: '#ebdccb', bottom: '#bfa993' }
        },
        patterns: [
            {
                stance: 'jodan',
                hint: '🔥【上段の構え】龍禅が火の構え（諸手上段）をとった！圧倒的な「上段面」か「小手」が来るぞ！（「胴」か「小手」で応戦せよ）',
                isDanger: true,
                weights: { 面: 46, 小手: 30, 突き: 14, 胴: 10, 防御: 0, 崩し: 0 },
            },
            {
                stance: 'waki',
                hint: '🌊【下段の構え】龍禅は泰然自若の下段の構え。「後の先防御(HP+1)」で受け流すか、守りを読む「崩し」を狙っている！',
                isDanger: true,
                weights: { 防御: 42, 崩し: 24, 突き: 14, 小手: 10, 面: 10, 胴: 0 },
            },
            {
                stance: 'chudan',
                hint: '⚡【中段の構え】龍禅の剣先が鋭く沈んだ！「突き」か電光石火の「面」「胴」が来るぞ！',
                isDanger: true,
                weights: { 突き: 34, 胴: 30, 面: 26, 小手: 5, 防御: 5, 崩し: 0 },
            },
        ],
    },
];

const MOVE_TO_KANA = {
    '面': 'メ',
    '小手': 'コ',
    '胴': 'ド',
    '突き': 'ツ',
    '必殺': '秘',
};

function convertToKana(action, moveName) {
    const text = (action || '') + ' ' + (moveName || '');
    if (text.includes('必殺') || text.includes('気合一閃') || text.includes('飛燕') || text.includes('兜割り') || text.includes('天光') || text.includes('電撃') || text.includes('霞打ち') || text.includes('疾風') || text.includes('幻影') || text.includes('紫電') || text.includes('天翔')) {
        if (text.includes('小手')) return 'コ';
        if (text.includes('胴')) return 'ド';
        if (text.includes('突き') || text.includes('突')) return 'ツ';
        return 'メ';
    }
    if (text.includes('小手')) return 'コ';
    if (text.includes('胴')) return 'ド';
    if (text.includes('突き') || text.includes('突')) return 'ツ';
    if (text.includes('面')) return 'メ';
    return 'メ';
}

function getBaseMoveName(action, moveName) {
    const text = (action || '') + ' ' + (moveName || '');
    if (text.includes('小手')) return '小手';
    if (text.includes('胴')) return '胴';
    if (text.includes('突き') || text.includes('突')) return '突き';
    if (text.includes('面')) return '面';
    return '面';
}

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
    playerCounterStacks: 0,
    enemyCounterStacks: 0,
    playerGuardBroken: false,
    enemyGuardBroken: false,
    playerStunned: false,
    enemyStunned: false,
    tsubazeriai: false,
    playerStanceStyle: 'chudan',
    enemyStanceStyle: 'chudan',
    matchPhase: 'pre_match',
    round: 0,
    gameOver: false,
    preMatchStorySeen: false,
    playerAnimState: 'sageto',
    enemyAnimState: 'sageto',
    enemyIntent: null,
    playerActionHistory: [],
    enemyLearnedPattern: null,
    animResetTimer: null,
    ceremonyTimers: [],
    customMatch: null,
    scoringMoves: { player: [], enemy: [] },
    lastWinningMove: null,
    finalWinningMove: null,
    finalWinningKana: null,
    boutStats: {
        playerHits: 0,
        playerBlocks: 0,
        enemyHits: 0,
        enemyBlocks: 0,
        rounds: 0,
        pushWins: 0,
    },
};

function resetBoutStats() {
    state.boutStats = {
        playerHits: 0,
        playerBlocks: 0,
        enemyHits: 0,
        enemyBlocks: 0,
        rounds: 0,
        pushWins: 0,
    };
}

function getPlayerMaxHealth() {
    if (state.customMatch && state.customMatch.active && state.customMatch.player && state.customMatch.player.maxHealth) {
        return state.customMatch.player.maxHealth;
    }
    return MAX_HEALTH;
}

function getCurrentEnemy() {
    if (state.customMatch && state.customMatch.active && state.customMatch.enemy) {
        return state.customMatch.enemy;
    }
    return ENEMY_ROSTER[state.stageIndex] || ENEMY_ROSTER[0];
}

let audioCtx = null;

// スプライトシート (2304x2400: 288x300 のコマが 8列×8行 = 全64コマ)
const sprite = new Image();
sprite.src = "img/kendo.png";

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
    idle:           makeCellDef(0, 0),
    sageto:         makeCellDef(0, 0),
    rei:            makeCellDef(0, 0),
    sonkyo_kamae:   makeCellDef(0, 0),
    sonkyo_osameto: makeCellDef(0, 0),
    counterReady:   makeCellDef(1, 0),
    guardBroken:    makeCellDef(1, 4),
    defend:         makeCellDef(6, 1),
    breakAttack:    makeCellDef(6, 6),
    tsubazeriai:    makeCellDef(6, 6),
    jodan:          makeCellDef(2, 2),
    waki:           makeCellDef(6, 4),
    attack1:        makeCellDef(2, 6), // 面打ちインパクト
    attack2:        makeCellDef(3, 4), // 小手打ちインパクト
    attack3:        makeCellDef(4, 5), // 胴打ち・突きインパクト
    hit:            makeCellDef(7, 1), // 被ダメージ仰け反り
    victory:        makeCellDef(7, 7), // 勝利・残心
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
    'gripX', 'gripY', 'shinaiAngle', 'shinaiFlex', 'swingBlur', 'hitDebris',
    'oneHanded'
];

// 礼法・所作ポーズ定義（提げ刀・立礼・蹲踞構え・蹲踞納刀・中段立ち）
const CEREMONY_POSES = {
    // 提げ刀（左手で竹刀の鍔付近を左腰脇に自然に下げて持つ試合前・試合後の基本姿勢）
    sageto: {
        hipX: 126, hipY: 256,
        backFootX: 118, backFootY: 374, backHeel: 0,
        frontFootX: 136, frontFootY: 374, frontHeel: 0,
        torsoLean: 0.01, torsoTwist: 0,
        breath: 0.4, tareSway: 0, hakamaSway: 0,
        headPitch: 0.01, mendareSway: 0,
        gripX: 142, gripY: 244,
        shinaiAngle: -148, shinaiFlex: 0,
        swingBlur: 0, hitDebris: 0,
        oneHanded: 1,
    },
    // 立礼（相互の礼：竹刀を左手に提げたまま上体を約15〜20度前傾させて礼をする）
    rei: {
        hipX: 120, hipY: 258,
        backFootX: 118, backFootY: 374, backHeel: 0,
        frontFootX: 136, frontFootY: 374, frontHeel: 0,
        torsoLean: 0.34, torsoTwist: 0,
        breath: 0.3, tareSway: 2, hakamaSway: 1,
        headPitch: 0.14, mendareSway: 4,
        gripX: 138, gripY: 248,
        shinaiAngle: -154, shinaiFlex: 0,
        swingBlur: 0, hitDebris: 0,
        oneHanded: 1,
    },
    // 蹲踞・構え（帯刀から竹刀を抜いて中段に構えつつ深く腰を落とした蹲踞姿勢）
    sonkyo_kamae: {
        hipX: 130, hipY: 314,
        backFootX: 108, backFootY: 374, backHeel: 18,
        frontFootX: 150, frontFootY: 374, frontHeel: 14,
        torsoLean: 0.04, torsoTwist: 0,
        breath: 0.5, tareSway: 1, hakamaSway: 5,
        headPitch: 0.02, mendareSway: 0,
        gripX: 162, gripY: 274,
        shinaiAngle: 28, shinaiFlex: 0,
        swingBlur: 0, hitDebris: 0,
        oneHanded: 0,
    },
    // 蹲踞・納刀（蹲踞したまま竹刀を左腰に納めた姿勢）
    sonkyo_osameto: {
        hipX: 130, hipY: 314,
        backFootX: 108, backFootY: 374, backHeel: 18,
        frontFootX: 150, frontFootY: 374, frontHeel: 14,
        torsoLean: 0.03, torsoTwist: 0,
        breath: 0.4, tareSway: 1, hakamaSway: 5,
        headPitch: 0.02, mendareSway: 0,
        gripX: 144, gripY: 292,
        shinaiAngle: -146, shinaiFlex: 0,
        swingBlur: 0, hitDebris: 0,
        oneHanded: 1,
    },
    // 中段の構え（礼の後・蹲踞の前後の立ち構え基準ポーズ）
    chudan_stand: {
        hipX: 132, hipY: 258,
        backFootX: 96, backFootY: 374, backHeel: 6,
        frontFootX: 168, frontFootY: 374, frontHeel: 0,
        torsoLean: 0.06, torsoTwist: 0,
        breath: 0.5, tareSway: 0, hakamaSway: 0,
        headPitch: 0.02, mendareSway: 0,
        gripX: 165, gripY: 230,
        shinaiAngle: 26, shinaiFlex: 0,
        swingBlur: 0, hitDebris: 0,
        oneHanded: 0,
    },
};

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
        oneHanded: 0,
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

// 待機状態（中段・応じ技・体勢崩れ・決着後・提げ刀・礼・蹲踞）の連続呼吸＆すり足ポーズ計算
function getContinuousStancePose(stanceType, phase) {
    const s = Math.sin(phase);
    const c = Math.cos(phase);
    const s2 = Math.sin(phase * 2 + 0.4);

    if (stanceType === 'sageto') {
        const base = CEREMONY_POSES.sageto;
        return {
            ...base,
            hipY: base.hipY + s * 1.2,
            breath: 0.35 + 0.25 * s,
            tareSway: c * 0.4,
            hakamaSway: c * 0.8,
            gripY: base.gripY + s * 1.0,
            shinaiAngle: base.shinaiAngle + c * 0.8,
            oneHanded: 1,
        };
    }

    if (stanceType === 'rei') {
        return { ...CEREMONY_POSES.rei };
    }

    if (stanceType === 'sonkyo_kamae') {
        const base = CEREMONY_POSES.sonkyo_kamae;
        return {
            ...base,
            hipY: base.hipY + s * 1.0,
            breath: 0.45 + 0.25 * s,
            gripY: base.gripY + s * 1.0,
            shinaiAngle: base.shinaiAngle + c * 1.0,
            oneHanded: 0,
        };
    }

    if (stanceType === 'sonkyo_osameto') {
        const base = CEREMONY_POSES.sonkyo_osameto;
        return {
            ...base,
            hipY: base.hipY + s * 0.8,
            breath: 0.4 + 0.2 * s,
            oneHanded: 1,
        };
    }

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
        // 🌊 下段の構え（身体を半身に開き、竹刀を低く構える後の先の構え）
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

// ───────────────────────────────────────────
// 稽古メニュー別アニメーションポーズ生成
// ───────────────────────────────────────────
function samplePoseFrames(frames, progress) {
    if (!frames || frames.length === 0) return createDefaultPose();
    if (frames.length === 1) return { ...frames[0] };
    const p = ((progress % 1) + 1) % 1;
    const scaled = p * (frames.length - 1);
    const idx0 = Math.floor(scaled);
    const idx1 = Math.min(frames.length - 1, idx0 + 1);
    const t = scaled - idx0;
    return interpolatePose(frames[idx0], frames[idx1], t);
}

// 得意技に応じた攻撃アニメーションポーズ（面・小手・胴・突き）
function getAttackPose(attackType, phase, baseStance = 'chudan') {
    const atk = attackType || 'men';
    const cycleDuration = 1.35; // 約1.35秒周期
    const t = ((phase / (Math.PI * 2) / cycleDuration) % 1 + 1) % 1;
    const base = getContinuousStancePose(baseStance, 0);

    let frames;
    if (atk === 'kote') {
        frames = [
            base,
            POSE_ROWS.kote[1],
            POSE_ROWS.kote[2],
            POSE_ROWS.kote[4],
            POSE_ROWS.kote[5],
            POSE_ROWS.kote[6],
            POSE_ROWS.kote[7],
            base
        ];
    } else if (atk === 'do') {
        frames = [
            base,
            POSE_ROWS.do[1],
            POSE_ROWS.do[2],
            POSE_ROWS.do[3],
            POSE_ROWS.do[4],
            base
        ];
    } else if (atk === 'tsuki') {
        frames = [
            base,
            POSE_ROWS.tsuki[1],
            POSE_ROWS.tsuki[2],
            POSE_ROWS.tsuki[3],
            POSE_ROWS.tsuki[4],
            base
        ];
    } else {
        // デフォルト: 面 (men)
        frames = [
            base,
            POSE_ROWS.men[1],
            POSE_ROWS.men[3],
            POSE_ROWS.men[4],
            POSE_ROWS.men[5],
            POSE_ROWS.men[6],
            POSE_ROWS.men[7],
            base
        ];
    }
    return samplePoseFrames(frames, t);
}

function getPracticePose(practiceType, phase, baseStance = 'chudan') {
    if (!practiceType) {
        return getContinuousStancePose(baseStance, phase);
    }

    // 休養後の納刀待機状態
    if (practiceType === 'idle_rest' || practiceType === 'sageto_idle') {
        return getContinuousStancePose('sageto', phase);
    }

    // 攻撃アニメーション（マンツーマン特別指導時：面・小手・胴・突き）
    if (practiceType.startsWith('attack_')) {
        const atk = practiceType.replace('attack_', '');
        return getAttackPose(atk, phase, baseStance);
    }
    if (practiceType === 'men' || practiceType === 'kote' || practiceType === 'do' || practiceType === 'tsuki') {
        return getAttackPose(practiceType, phase, baseStance);
    }

    // 1. 素振り・基本打ち込み (suburi)
    if (practiceType === 'suburi') {
        const cycleDuration = 1.35; // 約1.35秒周期
        const t = ((phase / (Math.PI * 2) / cycleDuration) % 1 + 1) % 1;
        const base = getContinuousStancePose(baseStance, 0);
        // 構え(0.0) -> 振りかぶり(0.35) -> 振り下ろし面打突(0.6) -> 残心(0.8) -> 構え復帰(1.0)
        const frames = [
            base,
            POSE_ROWS.men[1],
            POSE_ROWS.men[3],
            POSE_ROWS.men[4],
            POSE_ROWS.men[5],
            POSE_ROWS.men[6],
            POSE_ROWS.men[7],
            base
        ];
        return samplePoseFrames(frames, t);
    }

    // 2. 追い込み・掛かり稽古 (kakari)
    if (practiceType === 'kakari') {
        const cycleDuration = 1.0; // 高速連続打ちコンボ
        const t = ((phase / (Math.PI * 2) / cycleDuration) % 1 + 1) % 1;
        const base = getContinuousStancePose(baseStance, 0);
        const frames = [
            base,
            POSE_ROWS.men[2],
            POSE_ROWS.men[4],
            POSE_ROWS.men[6],
            POSE_ROWS.kote[2],
            POSE_ROWS.kote[4],
            POSE_ROWS.kote[6],
            POSE_ROWS.do[2],
            POSE_ROWS.do[4],
            getContinuousStancePose('tsubazeriai', phase),
            base
        ];
        return samplePoseFrames(frames, t);
    }

    // 3. すり足・基礎体力 (basics)
    if (practiceType === 'basics') {
        const s = Math.sin(phase * 2.2);
        const c = Math.cos(phase * 2.2);
        const bounce = Math.abs(Math.sin(phase * 2.2)) * 3;
        const base = getContinuousStancePose(baseStance, phase);
        const stepX = s * 9;
        return {
            ...base,
            hipX: base.hipX + stepX,
            hipY: base.hipY - bounce,
            frontFootX: base.frontFootX + stepX + (s > 0 ? 3 : 0),
            backFootX: base.backFootX + stepX - (s < 0 ? 3 : 0),
            gripX: base.gripX + stepX,
            gripY: base.gripY - bounce * 0.7,
            breath: 0.6 + 0.4 * s,
            hakamaSway: base.hakamaSway + c * 5,
            tareSway: base.tareSway + c * 2,
        };
    }

    // 4. 座禅・見取り稽古 (zazen) ➔ 1回だけ蹲踞（そんきょ）アニメーションし、その後は得意な構えを表示
    if (practiceType === 'zazen' || practiceType === 'sonkyo') {
        const animDuration = 2.0; // 1回のアニメーション時間（約2.0秒）
        const elapsedSec = Math.max(0, phase / (Math.PI * 2));
        // 1回のアニメーションが完了した後は、得意な構え（呼吸アニメーション）を表示
        if (elapsedSec >= animDuration) {
            return getContinuousStancePose(baseStance, phase);
        }
        const t = Math.min(1.0, Math.max(0, elapsedSec / animDuration));
        const base = getContinuousStancePose(baseStance, 0);
        const sonkyoDeep = {
            ...CEREMONY_POSES.sonkyo_kamae,
            hipY: CEREMONY_POSES.sonkyo_kamae.hipY + 2.0,
            breath: 0.7,
            headPitch: 0.0,
        };
        const sonkyoStable = {
            ...CEREMONY_POSES.sonkyo_kamae,
            breath: 0.35,
            headPitch: 0.0,
        };
        // 構え(0.0) -> 蹲踞腰落とし -> 深呼吸 -> 立ち上がり -> 得意な構え復帰(1.0)
        const frames = [
            base,
            CEREMONY_POSES.sonkyo_kamae,
            sonkyoDeep,
            sonkyoStable,
            CEREMONY_POSES.sonkyo_kamae,
            base
        ];
        return samplePoseFrames(frames, t);
    }

    // 5. 休養・道具手入れ (rest) ➔ 1回だけ蹲踞して納刀するアニメーションし、その後は得意な構えを表示
    if (practiceType === 'rest' || practiceType === 'osameto') {
        const animDuration = 2.4; // 1回のアニメーション時間（約2.4秒）
        const elapsedSec = Math.max(0, phase / (Math.PI * 2));
        // 1回のアニメーションが完了した後は、得意な構え（呼吸アニメーション）を表示
        if (elapsedSec >= animDuration) {
            return getContinuousStancePose(baseStance, phase);
        }
        const t = Math.min(1.0, Math.max(0, elapsedSec / animDuration));
        const base = getContinuousStancePose(baseStance, 0);

        // 蹲踞して中段に構えた姿勢
        const sonkyoKamae = {
            ...CEREMONY_POSES.sonkyo_kamae,
            hipX: base.hipX,
            breath: 0.45,
        };
        // 蹲踞したまま竹刀を左腰へと引き寄せる納刀移行ポーズ
        const sonkyoDrawing = {
            ...CEREMONY_POSES.sonkyo_kamae,
            hipX: base.hipX,
            gripX: base.hipX + 20,
            gripY: 286,
            shinaiAngle: -35,
            torsoLean: 0.03,
            oneHanded: 0,
        };
        // 蹲踞したまま左腰に竹刀を収めた納刀ポーズ
        const sonkyoOsameto = {
            ...CEREMONY_POSES.sonkyo_osameto,
            hipX: base.hipX,
            gripX: base.hipX + 14,
            gripY: 292,
            shinaiAngle: -146,
            oneHanded: 1,
            breath: 0.4,
        };
        // 蹲踞納刀したまま静かに深く息を整える休養ポーズ
        const sonkyoRest = {
            ...CEREMONY_POSES.sonkyo_osameto,
            hipX: base.hipX,
            hipY: CEREMONY_POSES.sonkyo_osameto.hipY + 1.5,
            gripX: base.hipX + 14,
            gripY: 293,
            shinaiAngle: -145,
            oneHanded: 1,
            breath: 0.15,
            torsoLean: 0.02,
        };

        // 立ち構え(0.0) -> 蹲踞構え -> 納刀引き寄せ -> 蹲踞納刀 -> 静かに呼吸・休養 -> 蹲踞納刀 -> 抜刀引き寄せ -> 蹲踞構え -> 立ち構え復帰(1.0)
        const frames = [
            base,
            sonkyoKamae,
            sonkyoDrawing,
            sonkyoOsameto,
            sonkyoRest,
            sonkyoOsameto,
            sonkyoDrawing,
            sonkyoKamae,
            base
        ];
        return samplePoseFrames(frames, t);
    }

    // 6. 特別指導 (special - フォールバック)
    if (practiceType === 'special') {
        return getAttackPose('men', phase, baseStance);
    }

    // 通常時（得意構えでの待機）
    return getContinuousStancePose(baseStance, phase);
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

    // 蹲踞（hipY が大きく下がった姿勢）でも袴の裾が床下へ突き抜けず膝が自然に張るよう比率計算
    const bLegH = Math.max(32, bAnkleY - hipY);
    const fLegH = Math.max(32, fAnkleY - hipY);
    const squatSpread = Math.max(0, (hipY - 264) * 0.42);

    const midX = (bAnkleX + fAnkleX) * 0.5;
    const crotchLowY = Math.min(bAnkleY, fAnkleY) - Math.min(18, bLegH * 0.22);
    ctx.fillStyle = '#09111f';
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(hipX - 24, hipY + Math.min(14, bLegH * 0.25));
    ctx.lineTo(bAnkleX + 12, bAnkleY - 2);
    ctx.quadraticCurveTo(midX, crotchLowY, fAnkleX - 14, fAnkleY - 2);
    ctx.lineTo(hipX + 24, hipY + Math.min(14, fLegH * 0.25));
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
    ctx.moveTo(hipX - 30, hipY + Math.min(10, bLegH * 0.2));
    ctx.bezierCurveTo(
        hipX - 44 - squatSpread * 0.45 + sway * 0.4, hipY + bLegH * 0.46,
        bAnkleX - 34 - squatSpread * 0.25 + sway * 0.7, bAnkleY - bLegH * 0.33,
        bAnkleX - 33, bAnkleY + 2
    );
    ctx.bezierCurveTo(
        bAnkleX - 10, bAnkleY + 6,
        bAnkleX + 18, bAnkleY + 5,
        bAnkleX + 32, bAnkleY
    );
    ctx.bezierCurveTo(
        bAnkleX + 28, bAnkleY - bLegH * 0.35,
        hipX + 10, hipY + bLegH * 0.65,
        hipX + 12, hipY + Math.min(14, bLegH * 0.25)
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(6, 10, 19, 0.75)';
    ctx.lineWidth = 2.2;
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(hipX - 12 + i * 8, hipY + Math.min(22, bLegH * 0.32));
        ctx.quadraticCurveTo(
            (hipX + bAnkleX) * 0.5 - 6 + i * 13 + sway * 0.4,
            (hipY + bAnkleY) * 0.5 + Math.min(10, bLegH * 0.12),
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

    const kneePush = Math.max(0, (frontFootX - hipX - 28) * 0.22) + squatSpread;
    ctx.beginPath();
    ctx.moveTo(hipX - 16, hipY + Math.min(12, fLegH * 0.22));
    ctx.bezierCurveTo(
        hipX - 20 + sway * 0.3, hipY + fLegH * 0.52,
        fAnkleX - 34 + sway * 0.5, fAnkleY - fLegH * 0.35,
        fAnkleX - 34, fAnkleY + 1
    );
    ctx.bezierCurveTo(
        fAnkleX - 10, fAnkleY + 6,
        fAnkleX + 16, fAnkleY + 5,
        fAnkleX + 35, fAnkleY - 1
    );
    ctx.bezierCurveTo(
        fAnkleX + 34 + kneePush, fAnkleY - fLegH * 0.38,
        hipX + 34 + kneePush * 0.6, (hipY + fAnkleY) * 0.5,
        hipX + 30, hipY + Math.min(10, fLegH * 0.2)
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(78, 120, 186, 0.38)';
    ctx.lineWidth = 2.8;
    for (let i = -1; i <= 2; i++) {
        const topX = hipX + 2 + i * 7;
        const botX = fAnkleX - 6 + i * 12;
        const mX = (topX + botX) * 0.5 + 5 + squatSpread * 0.35 + sway * 0.3;
        const mY = (hipY + fAnkleY) * 0.54;
        ctx.beginPath();
        ctx.moveTo(topX, hipY + Math.min(24, fLegH * 0.34));
        ctx.quadraticCurveTo(mX, mY, botX, fAnkleY - 2);
        ctx.stroke();
    }

    ctx.strokeStyle = '#080d1a';
    ctx.lineWidth = 2.2;
    for (let i = -2; i <= 2; i++) {
        const topX = hipX + i * 7;
        const botX = fAnkleX - 4 + i * 12;
        const mX = (topX + botX) * 0.5 + 3 + squatSpread * 0.35 + sway * 0.3;
        const mY = (hipY + fAnkleY) * 0.54;
        ctx.beginPath();
        ctx.moveTo(topX, hipY + Math.min(22, fLegH * 0.32));
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

function getHandTargets(gripX, gripY, angleDeg, oneHanded = 0, hipX = 132, hipY = 258) {
    const rad = -angleDeg * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const leftTwoX = gripX + 2 * cos;
    const leftTwoY = gripY + 2 * sin;
    const rightTwoX = gripX + 27 * cos;
    const rightTwoY = gripY + 27 * sin;
    if (!oneHanded || oneHanded <= 0.001) {
        return {
            left: { x: leftTwoX, y: leftTwoY },
            right: { x: rightTwoX, y: rightTwoY },
            rightAngle: angleDeg,
        };
    }
    const t = Math.max(0, Math.min(1, oneHanded));
    // 提げ刀・納刀（oneHanded = 1）時は左手で鍔元付近（+34px）を保持し、右手は右腰脇へ自然に下ろす
    const leftOneX = gripX + 34 * cos;
    const leftOneY = gripY + 34 * sin;
    const rightOneX = hipX + 12;
    const rightOneY = hipY + 4;
    return {
        left: {
            x: leftTwoX + (leftOneX - leftTwoX) * t,
            y: leftTwoY + (leftOneY - leftTwoY) * t,
        },
        right: {
            x: rightTwoX + (rightOneX - rightTwoX) * t,
            y: rightTwoY + (rightOneY - rightTwoY) * t,
        },
        rightAngle: angleDeg + (-78 - angleDeg) * t,
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
    const oneHanded = pose.oneHanded ?? 0;

    const anchors = getTorsoAnchors(hipX, hipY, torsoLean, torsoTwist);
    const hands = getHandTargets(gripX, gripY, shinaiAngle, oneHanded, hipX, hipY);

    drawBareFoot(ctx, backFootX, backFootY, backHeel, 1.0, true);
    drawBareFoot(ctx, frontFootX, frontFootY, frontHeel, 1.04, false);
    drawArmAndKote(ctx, anchors.backShoulder.x, anchors.backShoulder.y, hands.left.x, hands.left.y, shinaiAngle, true, 'upper');
    drawHakama(ctx, hipX, hipY, backFootX, backFootY, frontFootX, frontFootY, hakamaSway);
    drawTorsoAndDo(ctx, hipX, hipY, torsoLean, torsoTwist, breath, tareSway, armorTheme);
    drawHeadMen(ctx, anchors.neck.x, anchors.neck.y, torsoLean * 0.65 + headPitch, mendareSway, hitDebris);
    drawArmAndKote(ctx, anchors.backShoulder.x, anchors.backShoulder.y, hands.left.x, hands.left.y, shinaiAngle, true, 'forearm');
    drawShinai(ctx, gripX, gripY, shinaiAngle, shinaiFlex, swingBlur);
    drawArmAndKote(ctx, anchors.backShoulder.x, anchors.backShoulder.y, hands.left.x, hands.left.y, shinaiAngle, true, 'fist');
    drawArmAndKote(ctx, anchors.frontShoulder.x, anchors.frontShoulder.y, hands.right.x, hands.right.y, hands.rightAngle, false, 'all');
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
const playerSpeechBubble = document.getElementById('playerSpeechBubble');
const playerSpeechText = document.getElementById('playerSpeechText');
const enemySpeechBubble = document.getElementById('enemySpeechBubble');
const enemySpeechText = document.getElementById('enemySpeechText');

function showPreMatchSpeech(enemyQuote, playerQuote) {
    if (enemySpeechBubble && enemySpeechText && enemyQuote) {
        enemySpeechText.textContent = enemyQuote;
        enemySpeechBubble.style.display = 'block';
    }
    if (playerSpeechBubble && playerSpeechText && playerQuote) {
        playerSpeechText.textContent = playerQuote;
        playerSpeechBubble.style.display = 'block';
    }
}

function hideSpeechBubbles() {
    if (enemySpeechBubble) enemySpeechBubble.style.display = 'none';
    if (playerSpeechBubble) playerSpeechBubble.style.display = 'none';
}

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
const playerHealthPips = document.getElementById('playerHealthPips');
const enemyHealthPips = document.getElementById('enemyHealthPips');

const playerRadarBox = document.getElementById('playerRadarBox');
const enemyRadarBox = document.getElementById('enemyRadarBox');

const playerKiaiText = document.getElementById('playerKiaiText');
const enemyKiaiText = document.getElementById('enemyKiaiText');
const playerKiaiPips = document.getElementById('playerKiaiPips');
const enemyKiaiPips = document.getElementById('enemyKiaiPips');

const playerCounterText = document.getElementById('playerCounterText');
const enemyCounterText = document.getElementById('enemyCounterText');
const playerCounterPips = document.getElementById('playerCounterPips');
const enemyCounterPips = document.getElementById('enemyCounterPips');

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
const refereeReasonBadge = document.getElementById('refereeReasonBadge');

const clashMeterWrap = document.getElementById('clashMeterWrap');
const clashPlayerLabel = document.getElementById('clashPlayerLabel');
const clashEnemyLabel = document.getElementById('clashEnemyLabel');
const clashVsTag = document.getElementById('clashVsTag');
const clashFillPlayer = document.getElementById('clashFillPlayer');
const clashFillEnemy = document.getElementById('clashFillEnemy');
const clashMarker = document.getElementById('clashMarker');
const clashReasons = document.getElementById('clashReasons');
let lastClashData = null;
let enemyActionOverride = null;

// ⚡ 必殺技演出オーバーレイ要素
const specialFxOverlay = document.getElementById('specialFxOverlay');
const specialDarken = document.getElementById('specialDarken');
const specialSpeedLines = document.getElementById('specialSpeedLines');
const specialCutinBanner = document.getElementById('specialCutinBanner');
const specialCutinRibbon = document.getElementById('specialCutinRibbon');
const specialCutinSub = document.getElementById('specialCutinSub');
const specialCutinTitle = document.getElementById('specialCutinTitle');
const specialScreenSlash = document.getElementById('specialScreenSlash');
let specialCutinTimer = null;
let specialSlashTimer = null;

const statusText = document.getElementById('statusText');
const intentBox = document.getElementById('intentBox');
const intentText = document.getElementById('intentText');

const btnMen = document.getElementById('btnMen');
const btnKote = document.getElementById('btnKote');
const btnDo = document.getElementById('btnDo');
const btnDefend = document.getElementById('btnDefend');
const btnBreak = document.getElementById('btnBreak');
const btnTsuki = document.getElementById('btnTsuki');
const btnSpecial = document.getElementById('btnSpecial');
const btnStartMatch = document.getElementById('btnStartMatch');
const btnNextStage = document.getElementById('btnNextStage');
const btnReset = document.getElementById('btnReset');
const matchStageBanner = document.getElementById('matchStageBanner');
const matchStageBadge = document.getElementById('matchStageBadge');
const matchIntraBadge = document.getElementById('matchIntraBadge');
const playerSchoolText = document.getElementById('playerSchoolText');
const playerGradeBadge = document.getElementById('playerGradeBadge');
const enemySchoolText = document.getElementById('enemySchoolText');
const enemyGradeBadge = document.getElementById('enemyGradeBadge');
const enemyNameText = document.getElementById('enemyNameText');
const enemyTitleBadge = document.getElementById('enemyTitleBadge');
const playerTitleBadge = document.getElementById('playerTitleBadge');
const playerNameText = document.getElementById('playerNameText');
const stageBar = document.getElementById('stageBar');
const stageProgressText = document.getElementById('stageProgressText');
const vsDivider = document.getElementById('vsDivider');
const stanceSelectorWrap = document.getElementById('stanceSelectorWrap');
const stanceSelectorBar = document.getElementById('stanceSelectorBar');
const stanceDescText = document.getElementById('stanceDescText');
const actionButtons = [btnMen, btnKote, btnDo, btnTsuki, btnDefend, btnBreak, btnSpecial];

// 💬 勝ち抜きストーリー会話ダイアログ & 📜 免許皆伝モーダル DOM
const storyDialogueModal = document.getElementById('storyDialogueModal');
const dialogueTrialBadge = document.getElementById('dialogueTrialBadge');
const dialogueAvatar = document.getElementById('dialogueAvatar');
const dialogueSpeaker = document.getElementById('dialogueSpeaker');
const dialogueText = document.getElementById('dialogueText');
const dialogueIllustWrap = document.getElementById('dialogueIllustWrap');
const dialogueIllustImg = document.getElementById('dialogueIllustImg');
const menkyoKaidenModal = document.getElementById('menkyoKaidenModal');
const menkyoIllustWrap = document.getElementById('menkyoIllustWrap');
const menkyoIllustImg = document.getElementById('menkyoIllustImg');
const menkyoFellowsTributes = document.getElementById('menkyoFellowsTributes');
const menkyoStats = document.getElementById('menkyoStats');

let storyDialogueQueue = [];
let currentStoryDialogueIndex = 0;
let storyDialogueOnComplete = null;
let currentStoryTrialTitle = '';
let currentStoryAvatar = '🥋';
let currentStoryIllustration = '';

// ストーリー会話ダイアログの表示
function showStoryDialogue(dialogItems, trialTitle, avatarEmoji, onComplete, illustrationUrl) {
    if (!storyDialogueModal || !dialogItems || dialogItems.length === 0) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }
    storyDialogueQueue = Array.isArray(dialogItems) ? dialogItems : [dialogItems];
    currentStoryDialogueIndex = 0;
    currentStoryTrialTitle = trialTitle || '五人掛けの試練';
    currentStoryAvatar = avatarEmoji || '🥋';
    currentStoryIllustration = illustrationUrl || '';
    storyDialogueOnComplete = onComplete;

    if (dialogueIllustWrap && dialogueIllustImg) {
        if (currentStoryIllustration) {
            dialogueIllustImg.src = currentStoryIllustration;
            dialogueIllustWrap.style.display = 'block';
        } else {
            dialogueIllustWrap.style.display = 'none';
        }
    }

    storyDialogueModal.style.display = 'flex';
    renderCurrentStoryDialogue();
}

// 🥋 プレイヤーの顔写真オブジェクトを取得（部活主将またはクラシック挑戦者）
function getStoryDialoguePlayerFace() {
    if (state.customMatch && state.customMatch.player && state.customMatch.player.face) {
        return state.customMatch.player.face;
    }
    if (window.ClubState && Array.isArray(window.ClubState.members)) {
        const clubPlayer = window.ClubState.members.find(m => m.isPlayer);
        if (clubPlayer && clubPlayer.face) return clubPlayer.face;
    }
    return {
        seed: 'classic_challenger',
        skinId: 'healthy',
        skin: { id: 'healthy', name: '健康的', base: '#f1c39e', shadow: '#d69e77', blush: '#de8a81' },
        hairColorId: 'black',
        hairColor: { id: 'black', main: '#121417', highlight: '#2a3138' },
        eyeColor: '#1a1918',
        hairStyle: 'short_sporty',
        faceShape: 0,
        eyeType: 0,
        eyebrowType: 1,
        mouthType: 2,
        noseType: 0,
        uniformType: 'dougi_white',
        accessory: 'none',
        bgStyleId: 'blue_grad',
        bgStyle: { id: 'blue_grad', top: '#6ba5e7', bottom: '#3768b5' }
    };
}

// 🥋 対戦相手の顔写真オブジェクトを取得
function getStoryDialogueEnemyFace() {
    const curEnemy = typeof getCurrentEnemy === 'function' ? getCurrentEnemy() : null;
    if (!curEnemy) return null;
    if (curEnemy.face) return curEnemy.face;
    // 部内戦・特訓時の部員同期
    if (window.ClubState && Array.isArray(window.ClubState.members)) {
        const cleanId = (curEnemy.id || '').replace(/^practice_/, '');
        const cleanName = curEnemy.shortName || (curEnemy.name && curEnemy.name.includes('・') ? curEnemy.name.split('・')[1] : curEnemy.name);
        const m = window.ClubState.members.find(x => (cleanId && x.id === cleanId) || x.name === cleanName || x.id === curEnemy.id);
        if (m && m.face) return m.face;
    }
    return null;
}

// 現在のセリフをレンダリング
function renderCurrentStoryDialogue() {
    if (!storyDialogueQueue || currentStoryDialogueIndex >= storyDialogueQueue.length) {
        closeStoryDialogue();
        return;
    }
    const item = storyDialogueQueue[currentStoryDialogueIndex];
    const isPlayer = (item.speaker === 'player');

    if (dialogueTrialBadge) dialogueTrialBadge.textContent = currentStoryTrialTitle;
    if (dialogueAvatar) {
        const faceData = isPlayer ? getStoryDialoguePlayerFace() : getStoryDialogueEnemyFace();
        if (window.FaceGenerator && faceData) {
            const schoolOrTag = isPlayer ? '挑戦者' : (getCurrentEnemy()?.shortName || '');
            const stamp = isPlayer ? '選手証' : '手帳';
            const title = isPlayer ? 'あなた（挑戦者）の選手証写真' : `${item.name || '相手'}の生徒手帳写真`;
            const svgHtml = window.FaceGenerator.renderSvg(faceData, 44, 58, {
                withFrame: true,
                schoolName: schoolOrTag,
                stampText: stamp
            });
            dialogueAvatar.className = `dialogue-avatar has-photo ${isPlayer ? 'speaker-is-player' : 'speaker-is-enemy'}`;
            dialogueAvatar.innerHTML = `<span class="student-photo-frame" title="${title}">${svgHtml}</span>`;
        } else {
            dialogueAvatar.className = `dialogue-avatar ${isPlayer ? 'speaker-is-player' : 'speaker-is-enemy'}`;
            dialogueAvatar.textContent = isPlayer ? '🥋' : currentStoryAvatar;
        }
    }
    if (dialogueSpeaker) {
        dialogueSpeaker.textContent = item.name || (isPlayer ? 'あなた' : '相手');
        dialogueSpeaker.className = `dialogue-speaker ${isPlayer ? 'speaker-player' : 'speaker-enemy'}`;
    }
    if (dialogueText) {
        dialogueText.textContent = item.text || '……';
    }
}

// 次のセリフへ進む
function advanceStoryDialogue() {
    if (!storyDialogueModal || storyDialogueModal.style.display === 'none') return;
    currentStoryDialogueIndex++;
    if (currentStoryDialogueIndex < storyDialogueQueue.length) {
        renderCurrentStoryDialogue();
    } else {
        closeStoryDialogue();
    }
}

// 会話をスキップ
function skipStoryDialogue() {
    closeStoryDialogue();
}

// ダイアログを閉じる
function closeStoryDialogue() {
    if (storyDialogueModal) {
        storyDialogueModal.style.display = 'none';
    }
    if (dialogueIllustWrap) {
        dialogueIllustWrap.style.display = 'none';
    }
    currentStoryIllustration = '';
    const cb = storyDialogueOnComplete;
    storyDialogueOnComplete = null;
    storyDialogueQueue = [];
    if (typeof cb === 'function') {
        cb();
    }
}

// 📜 免許皆伝エピローグモーダルの表示
function showMenkyoKaidenModal() {
    if (!menkyoKaidenModal) return;
    if (window.KendoBGM && window.KendoBGM.play) {
        window.KendoBGM.play('victory');
    }
    if (menkyoFellowsTributes) {
        menkyoFellowsTributes.innerHTML = '';
        ENEMY_ROSTER.forEach((enemy) => {
            const card = document.createElement('div');
            card.className = 'tribute-card';
            const faceSvg = (window.FaceGenerator && enemy.face)
                ? `<span class="student-photo-frame" style="margin-right: 8px; flex: 0 0 auto;">${window.FaceGenerator.renderSvg(enemy.face, 34, 45, { withFrame: true, stampText: '皆伝' })}</span>`
                : `<span style="font-size: 1.4rem; margin-right: 6px;">${enemy.avatarEmoji || '🥋'}</span>`;
            card.innerHTML = `
                <div class="tribute-author" style="display: flex; align-items: center;">
                    ${faceSvg}
                    <span>${enemy.role}・${enemy.shortName}</span>
                </div>
                <p class="tribute-text">「${enemy.tributeQuote || 'お見事！'}」</p>
            `;
            menkyoFellowsTributes.appendChild(card);
        });
    }

    if (menkyoStats) {
        const totalRounds = (state.boutStats && state.boutStats.rounds) ? state.boutStats.rounds : state.round;
        menkyoStats.innerHTML = `
            <div class="menkyo-stats-title">🏆 試練達成戦績</div>
            <div>撃破人数: 5人（先鋒・健太 / 次鋒・佐々木 / 中堅・鬼塚 / 副将・霞 / 大将・龍禅）</div>
            <div>最終決まり手: ${state.finalWinningMove || state.lastWinningMove || '面'}あり</div>
            <div>免許皆伝位: 龍神館道場 師範代之皆伝</div>
        `;
    }

    menkyoKaidenModal.style.display = 'flex';
}

function closeMenkyoModal() {
    if (menkyoKaidenModal) {
        menkyoKaidenModal.style.display = 'none';
    }
    // 先鋒からリセット
    state.stageIndex = 0;
    state.clearedStages.clear();
    resetGame();
}

// キーボードによる軽快なダイアログ送り（Space / Enter / Escape）
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        if (storyDialogueModal && storyDialogueModal.style.display !== 'none') {
            e.preventDefault();
            advanceStoryDialogue();
        }
    } else if (e.key === 'Escape') {
        const hbModal = document.getElementById('studentHandbookModal');
        if (hbModal && hbModal.style.display !== 'none' && window.FaceGenerator && typeof window.FaceGenerator.closeHandbookModal === 'function') {
            e.preventDefault();
            window.FaceGenerator.closeHandbookModal();
        } else if (storyDialogueModal && storyDialogueModal.style.display !== 'none') {
            e.preventDefault();
            skipStoryDialogue();
        } else if (menkyoKaidenModal && menkyoKaidenModal.style.display !== 'none') {
            e.preventDefault();
            closeMenkyoModal();
        }
    }
});

// グローバル公開
window.advanceStoryDialogue = advanceStoryDialogue;
window.skipStoryDialogue = skipStoryDialogue;
window.closeMenkyoModal = closeMenkyoModal;
window.showMenkyoKaidenModal = showMenkyoKaidenModal;

let refereeHideTimer = null;
let pendingImpactTimer = null;
let pendingImpactCallback = null;
let pendingRoundTimer = null;
let pendingRoundCallback = null;
let pendingClosingTimer = null;
let pendingClosingCallback = null;
let playerStunAutoTimer = null;

function setActionButtonsLocked(locked) {
    actionButtons.forEach((btn) => {
        if (btn) btn.disabled = locked;
    });
}

function clearCeremonyTimers() {
    if (state.ceremonyTimers && state.ceremonyTimers.length > 0) {
        state.ceremonyTimers.forEach((id) => clearTimeout(id));
        state.ceremonyTimers = [];
    }
    if (pendingClosingTimer) {
        clearTimeout(pendingClosingTimer);
        pendingClosingTimer = null;
    }
    pendingClosingCallback = null;
}

function clearPendingRoundTimers() {
    clearCeremonyTimers();
    if (state.customMatch && state.customMatch.spectateTurnTimer) {
        clearTimeout(state.customMatch.spectateTurnTimer);
        state.customMatch.spectateTurnTimer = null;
    }
    if (playerStunAutoTimer) {
        clearTimeout(playerStunAutoTimer);
        playerStunAutoTimer = null;
    }
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

function firePendingRoundResult() {
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

function flushPendingRound() {
    timeState.hitStopUntil = 0;
    timeState.slowMoUntil = 0;
    timeState.slowMoFactor = 0.28;
    if (typeof hideSpecialCutin === 'function') {
        hideSpecialCutin();
    }
    if (typeof animators !== 'undefined') {
        if (animators.player) {
            animators.player.isSpecial = false;
            animators.player.afterimages = [];
        }
        if (animators.enemy) {
            animators.enemy.isSpecial = false;
            animators.enemy.afterimages = [];
        }
    }
    firePendingRoundResult();
    if (pendingClosingTimer) {
        clearTimeout(pendingClosingTimer);
        pendingClosingTimer = null;
    }
    if (pendingClosingCallback) {
        const closeFn = pendingClosingCallback;
        pendingClosingCallback = null;
        closeFn();
    }
}

// ヒットストップ＆スローモーション管理
const timeState = {
    hitStopUntil: 0,
    slowMoUntil: 0,
    slowMoFactor: 0.28,
};

function triggerHitStop(stopMs, slowMs = 0, slowFactor = 0.28, currentNow = null) {
    const now = (currentNow !== null && currentNow !== undefined)
        ? currentNow
        : ((typeof performance !== 'undefined') ? performance.now() : Date.now());
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
        alpha: 1,
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
const OPENING_TOTAL_T = 2560;
const CLOSING_TOTAL_T = 4850;

// 試合開始時の礼法キーフレーム列（提げ刀 → お互いに礼 → 帯刀・竹刀を構えて蹲踞 → 「始め！」で立ち上がる）
function buildOpeningCeremonyKeyframes(startPose, endCombatPose, endSprite) {
    const sageto = CEREMONY_POSES.sageto;
    const rei = CEREMONY_POSES.rei;
    const chudan = CEREMONY_POSES.chudan_stand;
    const sonkyo = CEREMONY_POSES.sonkyo_kamae;
    return [
        { t: 0,               sprite: 'sageto',       pose: startPose,     x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutSine },
        { t: 320,             sprite: 'rei',          pose: rei,           x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutSine },
        { t: 620,             sprite: 'rei',          pose: rei,           x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutSine },
        { t: 940,             sprite: 'sageto',       pose: sageto,        x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutSine },
        { t: 1280,            sprite: 'idle_0',       pose: chudan,        x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutQuad, fx: 'dust' },
        { t: 1700,            sprite: 'sonkyo_kamae', pose: sonkyo,        x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutQuad },
        { t: 2120,            sprite: 'sonkyo_kamae', pose: sonkyo,        x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutSine },
        { t: OPENING_TOTAL_T, sprite: endSprite,      pose: endCombatPose, x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeOutCubic,  fx: 'dust' },
    ];
}

// 勝敗決定後の礼法キーフレーム列（中段の構え → 蹲踞 → 竹刀を左腰に収める → 立ち上がり → お互いに礼 → 提げ刀 → 五人掛けモード敗者のみ後ろに下がって退場）
function buildClosingCeremonyKeyframes(startPose, shouldRetreat = false) {
    const chudan = CEREMONY_POSES.chudan_stand;
    const sonkyoKamae = CEREMONY_POSES.sonkyo_kamae;
    const sonkyoOsameto = CEREMONY_POSES.sonkyo_osameto;
    const sageto = CEREMONY_POSES.sageto;
    const rei = CEREMONY_POSES.rei;

    const baseKfs = [
        { t: 0,    sprite: 'idle_0',         pose: startPose,     x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutSine },
        { t: 500,  sprite: 'idle_0',         pose: chudan,        x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutQuad },
        { t: 1050, sprite: 'sonkyo_kamae',   pose: sonkyoKamae,   x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutQuad, fx: 'dust' },
        { t: 1650, sprite: 'sonkyo_osameto', pose: sonkyoOsameto, x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutSine },
        { t: 2150, sprite: 'sageto',         pose: sageto,        x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutQuad },
        { t: 2600, sprite: 'rei',            pose: rei,           x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutSine },
        { t: 2900, sprite: 'rei',            pose: rei,           x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutSine },
        { t: 3200, sprite: 'sageto',         pose: sageto,        x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 1.0, ease: easeInOutSine },
    ];

    if (!shouldRetreat) {
        // 退場しない場合（五人掛け勝者、および五人掛け以外の全モード）：礼が終わった後もその場で提げ刀の姿勢を保つ
        baseKfs.push({
            t: CLOSING_TOTAL_T,
            sprite: 'sageto',
            pose: sageto,
            x: 0,
            y: 0,
            scaleX: 1.0,
            scaleY: 1.0,
            rot: 0,
            alpha: 1.0,
            ease: easeInOutSine,
        });
        return baseKfs;
    }

    // 五人掛けモード敗者：礼の後、提げ刀の姿勢ですり足で後ろへ下がり、画面外へ退場して消える
    const step1 = { ...sageto, backFootX: 112, frontFootX: 130, hakamaSway: -4 };
    const step2 = { ...sageto, backFootX: 122, frontFootX: 140, hakamaSway: 4 };

    baseKfs.push(
        { t: 3450, sprite: 'sageto', pose: step1,  x: -20,  y: 0, scaleX: 1.0, scaleY: 1.0, rot: -0.01, alpha: 1.0,  ease: easeInOutQuad, fx: 'dust' },
        { t: 3800, sprite: 'sageto', pose: step2,  x: -60,  y: 0, scaleX: 1.0, scaleY: 1.0, rot: -0.01, alpha: 0.95, ease: easeInOutQuad, fx: 'dust' },
        { t: 4150, sprite: 'sageto', pose: step1,  x: -115, y: 0, scaleX: 1.0, scaleY: 1.0, rot: -0.01, alpha: 0.70, ease: easeInOutQuad, fx: 'dust' },
        { t: 4500, sprite: 'sageto', pose: step2,  x: -175, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0,     alpha: 0.25, ease: easeInOutQuad },
        { t: CLOSING_TOTAL_T, sprite: 'sageto', pose: sageto, x: -240, y: 0, scaleX: 1.0, scaleY: 1.0, rot: 0, alpha: 0.0,  ease: easeOutCubic }
    );
    return baseKfs;
}

// アクションごとの64コマ連続ポーズ・キーフレーム定義（全関節が60fpsでヌルっと補間される）
function buildActionKeyframes(action, outcome, neutralSprite, startPose, endPose, wasTsubazeriai = false, techType = null) {
    const m = POSE_ROWS.men;
    const k = POSE_ROWS.kote;
    const d = POSE_ROWS.do;
    const ts = POSE_ROWS.tsuki;
    const df = POSE_ROWS.defend;
    const bk = POSE_ROWS.breakAttack;
    const h = POSE_ROWS.hit;
    const startX = wasTsubazeriai ? 8 : 0;
    const endTargetX = neutralSprite === 'tsubazeriai' ? 8 : 0;

    // 必殺技（または気合一閃）の場合は、技の系統（面/小手/胴/突き）のアニメーションをベースにする
    let effectiveAction = action;
    const isSpecialAction = (action === '必殺');
    if (isSpecialAction) {
        effectiveAction = techType || '面';
    }

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

    if (effectiveAction === '面') {
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
    } else if (effectiveAction === '小手') {
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
    } else if (effectiveAction === '胴') {
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
    } else if (effectiveAction === '突き') {
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
    } else if (effectiveAction === '崩し') {
        actionKeyframes = [
            { t: 0,               sprite: 'idle_0',      pose: startPose, x: startX,     y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
            { t: 135,             sprite: 'brk_0',       pose: bk[0],     x: startX - 2, y: 0, scaleX: 1.02, scaleY: 0.98, rot: -0.01, ease: easeOutCubic },
            { t: 260,             sprite: 'brk_1',       pose: bk[1],     x: 5,          y: 0, scaleX: 1.02, scaleY: 0.98, rot: 0.02,  ease: easeInOutSine, fx: 'dust' },
            { t: STRIKE_IMPACT_T, sprite: 'brk_2',       pose: bk[2],     x: 9,          y: 0, scaleX: 1.04, scaleY: 0.97, rot: 0.03,  ease: easeOutQuart, fx: 'lunge_break' },
            { t: 640,             sprite: 'brk_2',       pose: bk[2],     x: 6,          y: 0, scaleX: 1.02, scaleY: 0.99, rot: 0.02,  ease: easeInOutSine },
            { t: 840,             sprite: 'brk_3',       pose: bk[3],     x: 2,          y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0.01,  ease: easeInOutSine },
            { t: ANIM_TOTAL_T,    sprite: neutralSprite, pose: endPose,   x: endTargetX, y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: 0,     ease: easeInOutSine },
        ];
    } else if (effectiveAction === 'スキップ') {
        // 体勢崩壊中（無防備・行動不能）
        actionKeyframes = [
            { t: 0,               sprite: 'guardBroken', pose: startPose, x: startX,     y: 0, scaleX: 1.0,  scaleY: 1.0,  rot: -0.02, ease: easeInOutSine },
            { t: 150,             sprite: 'guardBroken', pose: startPose, x: startX - 2, y: 0, scaleX: 0.98, scaleY: 1.02, rot: -0.04, ease: easeInOutSine },
            { t: STRIKE_IMPACT_T, sprite: 'guardBroken', pose: startPose, x: startX - 3, y: 0, scaleX: 0.98, scaleY: 1.02, rot: -0.03, ease: easeInOutSine },
            { t: 700,             sprite: 'guardBroken', pose: startPose, x: startX - 2, y: 0, scaleX: 0.99, scaleY: 1.01, rot: -0.02, ease: easeInOutSine },
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

    // 必殺技発動時は、奥義ならではの深い踏み込みの迫力を加える（光条は通常技の洗練された軌跡を使用）
    if (isSpecialAction) {
        let baseLungeFx = 'lunge_men';
        if (techType === '小手') baseLungeFx = 'lunge_kote';
        else if (techType === '胴') baseLungeFx = 'lunge_do';
        else if (techType === '突き') baseLungeFx = 'lunge_tsuki';

        actionKeyframes = actionKeyframes.map((kf) => {
            if (kf.t === STRIKE_IMPACT_T) {
                return {
                    ...kf,
                    x: kf.x + (kf.x >= 0 ? 5 : -5),
                    scaleX: kf.scaleX * 1.06,
                    scaleY: kf.scaleY * 0.94,
                    flash: 0.98,
                    fx: baseLungeFx,
                };
            }
            if (kf.t > STRIKE_IMPACT_T && kf.t < ANIM_TOTAL_T) {
                return {
                    ...kf,
                    x: kf.x + (kf.x >= 0 ? 3 : -3),
                };
            }
            return kf;
        });
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

function triggerFighterAnimation(who, action, outcome, impactWeight = 'normal', wasTsubazeriai = false, techType = null) {
    const anim = animators[who];
    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const strikeEndStance = state.gameOver
        ? (outcome === 'hit' || outcome === 'mutual_hit' ? 'hit' : 'victory')
        : getCombatStanceAnim(who);
    const startSnapshot = { ...anim.currentPose };
    const endTargetPose = getContinuousStancePose(strikeEndStance, (now + ANIM_TOTAL_T) * 0.0042 + anim.phaseOffset);
    let resolvedTechType = techType;
    if (!resolvedTechType && action === '必殺') {
        const fighterTech = getFighterSpecialTech(who);
        resolvedTechType = fighterTech.tech ? fighterTech.tech.type : '面';
    }
    anim.keyframes = buildActionKeyframes(action, outcome, strikeEndStance, startSnapshot, endTargetPose, wasTsubazeriai, resolvedTechType);
    anim.seqStartTime = now;
    anim.virtualElapsed = 0;
    anim.lastUpdateNow = now;
    anim.lastKeyIndex = -1;
    anim.impactWeight = impactWeight;
    anim.isSpecial = action === '必殺';
}

// 審判の掛け声音声合成（Web Speech API）
let cachedRefereeVoice = null;
let cachedKiaiVoice = null;
const MALE_VOICE_KEYWORDS = ['ichiro', 'keita', 'daichi', 'naoki', 'otoya', 'hattori', 'male', '男', 'kenji', 'taro'];
const FEMALE_VOICE_KEYWORDS = ['ayumi', 'haruka', 'nanami', 'sayaka', 'aoi', 'shiori', 'kyoko', 'female', '女', 'google'];

function refreshVoiceAssignments() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;
        const jaVoices = voices.filter((v) => v.lang && (v.lang === 'ja-JP' || v.lang.startsWith('ja')));
        if (jaVoices.length === 0) return;

        // 審判用：男性ボイスを優先探索
        const maleVoice = jaVoices.find((v) => {
            const name = (v.name || '').toLowerCase();
            return MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
        });
        cachedRefereeVoice = maleVoice || jaVoices[0];

        // 技名発声用：女性ボイスを優先探索
        let femaleVoice = jaVoices.find((v) => {
            const name = (v.name || '').toLowerCase();
            return FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
        });
        if (!femaleVoice) {
            femaleVoice = jaVoices.find((v) => {
                const name = (v.name || '').toLowerCase();
                return !MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw));
            });
        }
        cachedKiaiVoice = femaleVoice || jaVoices.find((v) => v !== cachedRefereeVoice) || jaVoices[0];
    } catch (e) {}
}

function warmupVoices() {
    refreshVoiceAssignments();
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    warmupVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = warmupVoices;
    }
}

// 効果音生成・オーディオ初期化（BGM設定と同期するマスター音量GainNode & コンプレッサー経由）
let soundMasterGain = null;
let soundCompressor = null;

function ensureAudio() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return false;
    if (!audioCtx) {
        audioCtx = new AudioCtor();
        soundMasterGain = audioCtx.createGain();

        // 迫力ある音圧と音割れ防止のためのダイナミクスコンプレッサー
        soundCompressor = audioCtx.createDynamicsCompressor();
        soundCompressor.threshold.setValueAtTime(-12, audioCtx.currentTime);
        soundCompressor.knee.setValueAtTime(8, audioCtx.currentTime);
        soundCompressor.ratio.setValueAtTime(3.5, audioCtx.currentTime);
        soundCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
        soundCompressor.release.setValueAtTime(0.12, audioCtx.currentTime);

        soundMasterGain.connect(soundCompressor);
        soundCompressor.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }
    updateSoundMasterGain();
    return true;
}

// BGM設定（ボリューム・ミュート）とゲーム内音声（効果音・気合・審判）の音量を同期
// ※ BGMの音圧と同等に調和させるため、音声マスター倍率を 2.2倍に設定
function updateSoundMasterGain() {
    if (!audioCtx) {
        const ok = ensureAudio();
        if (!ok || !soundMasterGain) return;
    }
    if (!soundMasterGain && audioCtx) {
        soundMasterGain = audioCtx.createGain();
        if (soundCompressor) {
            soundMasterGain.connect(soundCompressor);
        } else {
            soundMasterGain.connect(audioCtx.destination);
        }
    }
    let vol = 0.65;
    if (window.KendoBGM) {
        if (typeof window.KendoBGM.isMuted === 'function' && window.KendoBGM.isMuted()) {
            vol = 0.0;
        } else if (typeof window.KendoBGM.getVolume === 'function') {
            vol = window.KendoBGM.getVolume();
        }
    }
    try {
        const now = audioCtx.currentTime;
        soundMasterGain.gain.cancelScheduledValues(now);
        // BGM(mp3)のノーマライズ音圧に合わせた適正ゲイン（最大約2.2倍）
        soundMasterGain.gain.setValueAtTime(vol * 2.2, now);
    } catch (e) {
        soundMasterGain.gain.value = vol * 2.2;
    }
}

function getSoundDestination(ctx) {
    if (!ctx) return null;
    ensureAudio();
    return soundMasterGain || ctx.destination;
}

// ============================================================================
// 👨‍⚖️ 審判の号令（「ハジメェーーーッ！」）プロシージャル音声合成エンジン
// 剣士（中高音シャウト）とは明確に異なる、威厳ある男性主審の低く太い胸声と呼気
// ============================================================================

let refereeVoiceCurve = null;
function getRefereeVoiceCurve() {
    if (!refereeVoiceCurve) {
        const samples = 1024;
        const curve = new Float32Array(samples);
        const k = 8; // 太い偶数倍音の胸鳴りサチュレーション
        const deg = Math.PI / 180;
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            // 非対称ソフトクリッピング（男性の太い胸声を再現）
            const xBiased = x + 0.08 * (1 - x * x);
            curve[i] = ((3 + k) * xBiased * 18 * deg) / (Math.PI + k * Math.abs(xBiased));
        }
        refereeVoiceCurve = curve;
    }
    return refereeVoiceCurve;
}

// 審判の号令：「ハジメッ！」を短くはっきりとプロシージャル合成
// 剣士（中高音シャウト）とは明確に異なる、威厳ある男性主審の引き締まった号令
function playRefereeHajimeShout(ctx, now, intensity = 1.0) {
    const dur = 0.38; // 短く切れ味のある号令（約0.38秒）
    const refPitch = 158; // 通りの良い男性主審の引き締まったピッチ

    // 1. 声帯オシレータ（主Sawtooth + 補助Triangleでクリアな声帯振動）
    const oscMain = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    oscMain.type = 'sawtooth';
    oscSub.type = 'triangle';

    // ピッチ推移: ハ(150Hz) -> ジ(160Hz) -> メッ！(182Hzへキュッと跳ね上がりスタッカート)
    oscMain.frequency.setValueAtTime(refPitch * 0.95, now);
    oscMain.frequency.linearRampToValueAtTime(refPitch * 1.02, now + 0.10); // ハ
    oscMain.frequency.setValueAtTime(refPitch * 1.05, now + 0.11); // ジ
    oscMain.frequency.linearRampToValueAtTime(refPitch * 1.10, now + 0.20);
    oscMain.frequency.setValueAtTime(refPitch * 1.15, now + 0.21); // メッ！
    oscMain.frequency.exponentialRampToValueAtTime(refPitch * 1.25, now + 0.34);

    oscSub.frequency.setValueAtTime(refPitch * 0.47, now);
    oscSub.frequency.linearRampToValueAtTime(refPitch * 0.51, now + 0.10);
    oscSub.frequency.setValueAtTime(refPitch * 0.53, now + 0.11);
    oscSub.frequency.linearRampToValueAtTime(refPitch * 0.55, now + 0.20);
    oscSub.frequency.setValueAtTime(refPitch * 0.58, now + 0.21);
    oscSub.frequency.exponentialRampToValueAtTime(refPitch * 0.62, now + 0.34);

    // 2. 子音ノイズ発生器（ハの息音、ジの破擦クリック、メの抜け）
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = getBreathNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.setValueAtTime(2.2, now);

    const noiseGain = ctx.createGain();
    // 「ハ」の呼気アタック（1800Hz）
    noiseFilter.frequency.setValueAtTime(1800, now);
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.18 * intensity, now + 0.015);
    noiseGain.gain.exponentialRampToValueAtTime(0.02 * intensity, now + 0.09);

    // 「ジ」の鋭い破擦クリック（3800Hz、子音の立ち上がりを明確化）
    noiseFilter.frequency.setValueAtTime(3800, now + 0.11);
    noiseGain.gain.setValueAtTime(0.24 * intensity, now + 0.11);
    noiseGain.gain.exponentialRampToValueAtTime(0.02 * intensity, now + 0.15);

    // 「メッ！」の抜けノイズ（2400Hz）
    noiseFilter.frequency.setValueAtTime(2400, now + 0.21);
    noiseGain.gain.setValueAtTime(0.14 * intensity, now + 0.23);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // 3. 声道フォルマント（各音節ごとのステップ遷移で輪郭をシャープに）
    // 「ハ (/a/)」: F1=820Hz, F2=1300Hz, F3=2500Hz
    // 「ジ (/i/)」: F1=290Hz, F2=2280Hz, F3=2900Hz
    // 「メ (/e/)」: F1=530Hz, F2=1950Hz, F3=2650Hz
    const formants = createFormantFilters(ctx, 820, 1300, 2500);
    formants.filter1.Q.value = 5.2;
    formants.filter2.Q.value = 6.2;
    formants.filter3.Q.value = 5.5;

    // F1推移: ハ(820) -> ジ(290) -> メ(530)
    formants.filter1.frequency.setValueAtTime(820, now);
    formants.filter1.frequency.setValueAtTime(820, now + 0.09);
    formants.filter1.frequency.linearRampToValueAtTime(290, now + 0.12);
    formants.filter1.frequency.setValueAtTime(290, now + 0.19);
    formants.filter1.frequency.linearRampToValueAtTime(530, now + 0.22);
    formants.filter1.frequency.setValueAtTime(530, now + 0.35);

    // F2推移: ハ(1300) -> ジ(2280) -> メ(1950)
    formants.filter2.frequency.setValueAtTime(1300, now);
    formants.filter2.frequency.setValueAtTime(1300, now + 0.09);
    formants.filter2.frequency.linearRampToValueAtTime(2280, now + 0.12);
    formants.filter2.frequency.setValueAtTime(2280, now + 0.19);
    formants.filter2.frequency.linearRampToValueAtTime(1950, now + 0.22);
    formants.filter2.frequency.setValueAtTime(1950, now + 0.35);

    // F3推移
    formants.filter3.frequency.setValueAtTime(2500, now);
    formants.filter3.frequency.setValueAtTime(2500, now + 0.09);
    formants.filter3.frequency.linearRampToValueAtTime(2900, now + 0.12);
    formants.filter3.frequency.setValueAtTime(2900, now + 0.19);
    formants.filter3.frequency.linearRampToValueAtTime(2650, now + 0.22);
    formants.filter3.frequency.setValueAtTime(2650, now + 0.35);

    // 音源ミックス
    const voiceMix = ctx.createGain();
    voiceMix.gain.value = 0.62;
    oscMain.connect(voiceMix);
    oscSub.connect(voiceMix);
    voiceMix.connect(formants.busIn);
    noiseGain.connect(formants.busIn);

    // 4. サチュレーション（温かく引き締まった倍音）
    const shaper = ctx.createWaveShaper();
    shaper.curve = getRefereeVoiceCurve();
    formants.busOut.connect(shaper);

    // 5. マスター音量エンベロープ（音節ごとの明確なメリハリ「ハ・ジ・メッ！」）
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    // 「ハ」 (0.00s 〜 0.10s)
    masterGain.gain.linearRampToValueAtTime(0.62 * intensity, now + 0.025);
    masterGain.gain.exponentialRampToValueAtTime(0.28 * intensity, now + 0.095); // 音節の切れ目
    // 「ジ」 (0.10s 〜 0.20s)
    masterGain.gain.linearRampToValueAtTime(0.58 * intensity, now + 0.13);
    masterGain.gain.exponentialRampToValueAtTime(0.25 * intensity, now + 0.195); // 音節の切れ目
    // 「メッ！」 (0.20s 〜 0.35s)
    masterGain.gain.linearRampToValueAtTime(0.75 * intensity, now + 0.23); // メ！と鋭く張る
    masterGain.gain.setValueAtTime(0.68 * intensity, now + 0.32);
    // 「ッ！」のスタッカート急停止
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    shaper.connect(masterGain);
    masterGain.connect(getSoundDestination(ctx));

    // タイトなアンビエンス（言葉が濁らないよう控えめのショートディレイ）
    const refDelay = ctx.createDelay(0.1);
    refDelay.delayTime.setValueAtTime(0.032, now);
    const refFilter = ctx.createBiquadFilter();
    refFilter.type = 'lowpass';
    refFilter.frequency.setValueAtTime(3000, now);
    const refRevGain = ctx.createGain();
    refRevGain.gain.setValueAtTime(0.10, now);

    masterGain.connect(refDelay);
    refDelay.connect(refFilter);
    refFilter.connect(refRevGain);
    refRevGain.connect(getSoundDestination(ctx));

    oscMain.start(now);
    oscSub.start(now);
    noiseSource.start(now);
    oscMain.stop(now + dur);
    oscSub.stop(now + dur);
    noiseSource.stop(now + dur);
}

// 審判の号令：「勝負あり！」（ショーブ・アリと語尾を延ばさず歯切れよくプロシージャル合成）
function playRefereeShobuAriShout(ctx, now, intensity = 1.0) {
    const dur = 0.60; // 「ショー」はゆったり、語尾の「アリ」は延ばさず切る（約0.60秒）
    const refPitch = 152; // 男性主審の低く太いピッチ

    // 1. 声帯オシレータ（主Sawtooth + 補助Triangle）
    const oscMain = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    oscMain.type = 'sawtooth';
    oscSub.type = 'triangle';

    // ピッチ推移: ショーー(0.00〜0.22s) -> ブ(0.24〜0.34s) -> ア！(0.36〜0.48s) -> リ(0.49〜0.60s: 語尾を延ばさない)
    oscMain.frequency.setValueAtTime(refPitch * 0.94, now);
    oscMain.frequency.linearRampToValueAtTime(refPitch * 1.02, now + 0.22); // ショーー（ゆっくり伸ばす）
    oscMain.frequency.setValueAtTime(refPitch * 0.98, now + 0.24); // ブ
    oscMain.frequency.linearRampToValueAtTime(refPitch * 1.05, now + 0.34);
    oscMain.frequency.setValueAtTime(refPitch * 1.12, now + 0.36); // ア！
    oscMain.frequency.linearRampToValueAtTime(refPitch * 1.20, now + 0.48);
    oscMain.frequency.setValueAtTime(refPitch * 1.18, now + 0.49); // リ（語尾を延ばさない）
    oscMain.frequency.exponentialRampToValueAtTime(refPitch * 1.22, now + 0.59);

    oscSub.frequency.setValueAtTime(refPitch * 0.47, now);
    oscSub.frequency.linearRampToValueAtTime(refPitch * 0.51, now + 0.22);
    oscSub.frequency.setValueAtTime(refPitch * 0.49, now + 0.24);
    oscSub.frequency.linearRampToValueAtTime(refPitch * 0.53, now + 0.34);
    oscSub.frequency.setValueAtTime(refPitch * 0.56, now + 0.36);
    oscSub.frequency.linearRampToValueAtTime(refPitch * 0.60, now + 0.48);
    oscSub.frequency.setValueAtTime(refPitch * 0.59, now + 0.49);
    oscSub.frequency.exponentialRampToValueAtTime(refPitch * 0.61, now + 0.59);

    // 2. 子音ノイズ発生器（シの摩擦ノイズ、ブの破裂クリック、リの抜け）
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = getBreathNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.setValueAtTime(2.2, now);

    const noiseGain = ctx.createGain();
    // 「ショ」の呼気・摩擦アタック (3600Hz)
    noiseFilter.frequency.setValueAtTime(3600, now);
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.18 * intensity, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.02 * intensity, now + 0.16);

    // 「ブ」の破裂ノイズ (800Hz)
    noiseFilter.frequency.setValueAtTime(800, now + 0.24);
    noiseGain.gain.setValueAtTime(0.16 * intensity, now + 0.25);
    noiseGain.gain.exponentialRampToValueAtTime(0.015 * intensity, now + 0.32);

    // 「リ」の抜けノイズ (2800Hz)
    noiseFilter.frequency.setValueAtTime(2800, now + 0.49);
    noiseGain.gain.setValueAtTime(0.14 * intensity, now + 0.50);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // 3. 声道フォルマント（ショ /o/ -> ブ /u/ -> ア /a/ -> リ /i/）
    const formants = createFormantFilters(ctx, 500, 950, 2400);
    formants.filter1.Q.value = 5.2;
    formants.filter2.Q.value = 6.2;
    formants.filter3.Q.value = 5.5;

    // F1推移: ショーー(500) -> ブ(380) -> ア(820) -> リ(290)
    formants.filter1.frequency.setValueAtTime(500, now);
    formants.filter1.frequency.setValueAtTime(500, now + 0.22); // 「ショー」をゆったり伸ばす
    formants.filter1.frequency.linearRampToValueAtTime(380, now + 0.25);
    formants.filter1.frequency.setValueAtTime(380, now + 0.34);
    formants.filter1.frequency.linearRampToValueAtTime(820, now + 0.37);
    formants.filter1.frequency.setValueAtTime(820, now + 0.48);
    formants.filter1.frequency.linearRampToValueAtTime(290, now + 0.51);
    formants.filter1.frequency.setValueAtTime(290, now + 0.59);

    // F2推移: ショーー(950) -> ブ(1200) -> ア(1300) -> リ(2300)
    formants.filter2.frequency.setValueAtTime(950, now);
    formants.filter2.frequency.setValueAtTime(950, now + 0.22);
    formants.filter2.frequency.linearRampToValueAtTime(1200, now + 0.25);
    formants.filter2.frequency.setValueAtTime(1200, now + 0.34);
    formants.filter2.frequency.linearRampToValueAtTime(1300, now + 0.37);
    formants.filter2.frequency.setValueAtTime(1300, now + 0.48);
    formants.filter2.frequency.linearRampToValueAtTime(2300, now + 0.51);
    formants.filter2.frequency.setValueAtTime(2300, now + 0.59);

    // F3推移
    formants.filter3.frequency.setValueAtTime(2400, now);
    formants.filter3.frequency.setValueAtTime(2400, now + 0.22);
    formants.filter3.frequency.linearRampToValueAtTime(2350, now + 0.25);
    formants.filter3.frequency.setValueAtTime(2350, now + 0.34);
    formants.filter3.frequency.linearRampToValueAtTime(2500, now + 0.37);
    formants.filter3.frequency.setValueAtTime(2500, now + 0.48);
    formants.filter3.frequency.linearRampToValueAtTime(2900, now + 0.51);
    formants.filter3.frequency.setValueAtTime(2900, now + 0.59);

    // 音源ミックス
    const voiceMix = ctx.createGain();
    voiceMix.gain.value = 0.62;
    oscMain.connect(voiceMix);
    oscSub.connect(voiceMix);
    voiceMix.connect(formants.busIn);
    noiseGain.connect(formants.busIn);

    // 4. サチュレーション（温かく引き締まった倍音）
    const shaper = ctx.createWaveShaper();
    shaper.curve = getRefereeVoiceCurve();
    formants.busOut.connect(shaper);

    // 5. マスター音量エンベロープ（「ショーー」はゆったり、「アリ」は語尾を延ばさず切る）
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    // 「ショーー」 (0.00s 〜 0.22s: ゆったり響かせる)
    masterGain.gain.linearRampToValueAtTime(0.65 * intensity, now + 0.035);
    masterGain.gain.setValueAtTime(0.60 * intensity, now + 0.16);
    masterGain.gain.exponentialRampToValueAtTime(0.32 * intensity, now + 0.22);
    // 「ブ」 (0.22s 〜 0.34s)
    masterGain.gain.linearRampToValueAtTime(0.56 * intensity, now + 0.27);
    masterGain.gain.exponentialRampToValueAtTime(0.30 * intensity, now + 0.34);
    // 「ア！」 (0.34s 〜 0.48s: はぎれよく)
    masterGain.gain.linearRampToValueAtTime(0.80 * intensity, now + 0.40);
    masterGain.gain.exponentialRampToValueAtTime(0.50 * intensity, now + 0.48);
    // 「リ」 (0.48s 〜 0.60s: 語尾を延ばさず短くスパッと切る)
    masterGain.gain.linearRampToValueAtTime(0.68 * intensity, now + 0.52);
    masterGain.gain.setValueAtTime(0.58 * intensity, now + 0.56);
    // 0.60s で急停止（語尾を延ばさない）
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.60);

    shaper.connect(masterGain);
    masterGain.connect(getSoundDestination(ctx));

    // タイトなアンビエンス（道場空間のショートディレイ残響）
    const refDelay = ctx.createDelay(0.1);
    refDelay.delayTime.setValueAtTime(0.035, now);
    const refFilter = ctx.createBiquadFilter();
    refFilter.type = 'lowpass';
    refFilter.frequency.setValueAtTime(3000, now);
    const refRevGain = ctx.createGain();
    refRevGain.gain.setValueAtTime(0.10, now);

    masterGain.connect(refDelay);
    refDelay.connect(refFilter);
    refFilter.connect(refRevGain);
    refRevGain.connect(getSoundDestination(ctx));

    oscMain.start(now);
    oscSub.start(now);
    noiseSource.start(now);
    oscMain.stop(now + dur);
    oscSub.stop(now + dur);
    noiseSource.stop(now + dur);
}

// 審判の号令（始め！/ 勝負あり！）：Web Audio API によるプロシージャル合成（低く引き締まった男性主審の声）
function playRefereeVoice(text = 'ハジメッ！', volume = 1.0) {
    const isShobuAri = text && (text.includes('勝負あり') || text.includes('ショウブアリ') || text.includes('勝負'));
    if (ensureAudio()) {
        try {
            const ctx = audioCtx;
            const now = ctx.currentTime;
            if (isShobuAri) {
                playRefereeShobuAriShout(ctx, now, volume);
            } else {
                playRefereeHajimeShout(ctx, now, volume);
            }
            return;
        } catch (e) {
            // Web Audio エラー時はフォールバックへ
        }
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const spokenText = isShobuAri ? '勝負あり！' : text;
        const utter = new SpeechSynthesisUtterance(spokenText);
        utter.lang = 'ja-JP';
        utter.rate = isShobuAri ? 1.4 : 1.35; // 短く切れ味のある素早い号令
        utter.pitch = 0.82; // 男性審判の低く引き締まった太い声
        utter.volume = Math.max(0, Math.min(1, volume));

        if (!cachedRefereeVoice) {
            refreshVoiceAssignments();
        }
        if (cachedRefereeVoice) {
            utter.voice = cachedRefereeVoice;
        }
        window.speechSynthesis.speak(utter);
    } catch (e) {
        // 音声合成が利用できない環境でも安全にフォールスルー
    }
}

// ============================================================================
// 🥋 Web Audio API によるプロシージャル気合声（呼気・シャウト）合成エンジン
// 「メェーーーン！」「コテェーーッ！」「ドォーーッ！」「ツキィーーッ！」
// ============================================================================

let breathNoiseBuffer = null;
let kiaiShoutCurve = null;

function getBreathNoiseBuffer(ctx) {
    if (!breathNoiseBuffer || breathNoiseBuffer.sampleRate !== ctx.sampleRate) {
        const length = Math.floor(ctx.sampleRate * 0.9);
        breathNoiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = breathNoiseBuffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }
    return breathNoiseBuffer;
}

function getKiaiShoutCurve() {
    if (!kiaiShoutCurve) {
        const samples = 1024;
        const curve = new Float32Array(samples);
        const k = 14; // 気迫ある叫び声の適度なソフトサチュレーション
        const deg = Math.PI / 180;
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        kiaiShoutCurve = curve;
    }
    return kiaiShoutCurve;
}

// 声道フォルマントフィルタバンク作成ヘルパー (F1: 口の開き, F2: 舌位置, F3: 抜け・共鳴)
function createFormantFilters(ctx, f1, f2, f3) {
    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.value = f1;
    filter1.Q.value = 4.8;

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'bandpass';
    filter2.frequency.value = f2;
    filter2.Q.value = 5.8;

    const filter3 = ctx.createBiquadFilter();
    filter3.type = 'bandpass';
    filter3.frequency.value = f3;
    filter3.Q.value = 5.2;

    const g1 = ctx.createGain();
    const g2 = ctx.createGain();
    const g3 = ctx.createGain();
    g1.gain.value = 1.0;
    g2.gain.value = 0.72;
    g3.gain.value = 0.40;

    filter1.connect(g1);
    filter2.connect(g2);
    filter3.connect(g3);

    const busIn = ctx.createGain();
    busIn.connect(filter1);
    busIn.connect(filter2);
    busIn.connect(filter3);

    const busOut = ctx.createGain();
    g1.connect(busOut);
    g2.connect(busOut);
    g3.connect(busOut);

    return { busIn, busOut, filter1, filter2, filter3, g1, g2, g3 };
}

// 武道場特有のショート残響（ディレイ＆リバーブ）を付加
function attachDojoReverb(ctx, now, source, duration) {
    const delay = ctx.createDelay(0.1);
    delay.delayTime.setValueAtTime(0.035, now);

    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.18, now);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, now);

    const revGain = ctx.createGain();
    revGain.gain.setValueAtTime(0.14, now);

    source.connect(delay);
    delay.connect(filter);
    filter.connect(feedback);
    feedback.connect(delay);
    filter.connect(revGain);
    revGain.connect(getSoundDestination(ctx));
}

// 1. 面のシャウト：「メェーーーーン！」
function playMenShout(ctx, now, basePitch, intensity = 1.0) {
    const dur = 0.50;

    // 声帯音源
    const oscMain = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    oscMain.type = 'sawtooth';
    oscSub.type = 'triangle';

    // ピッチ推移: 鼻音(低め) -> 一気に跳ね上がり -> 力強く伸びる -> 語尾の鼻音で収束
    oscMain.frequency.setValueAtTime(basePitch * 0.94, now);
    oscMain.frequency.linearRampToValueAtTime(basePitch * 1.18, now + 0.05);
    oscMain.frequency.exponentialRampToValueAtTime(basePitch * 1.06, now + 0.28);
    oscMain.frequency.linearRampToValueAtTime(basePitch * 0.90, now + dur);

    oscSub.frequency.setValueAtTime(basePitch * 0.47, now);
    oscSub.frequency.linearRampToValueAtTime(basePitch * 0.59, now + 0.05);
    oscSub.frequency.exponentialRampToValueAtTime(basePitch * 0.53, now + 0.28);
    oscSub.frequency.linearRampToValueAtTime(basePitch * 0.45, now + dur);

    // 呼気ノイズ（息を強く吐き出す気迫）
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = getBreathNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2100, now);
    noiseFilter.Q.setValueAtTime(1.8, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.13 * intensity, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.07 * intensity, now + 0.32);
    noiseGain.gain.linearRampToValueAtTime(0.0001, now + dur);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // 声道フォルマント遷移（/m/ -> /e/ -> /n/）
    // /m/: 280, 1100, 2200
    // /e/: 540, 1920, 2650
    // /n/: 320, 1350, 2300
    const formants = createFormantFilters(ctx, 280, 1100, 2200);
    formants.filter1.frequency.setValueAtTime(280, now);
    formants.filter1.frequency.exponentialRampToValueAtTime(540, now + 0.05);
    formants.filter1.frequency.setValueAtTime(540, now + 0.34);
    formants.filter1.frequency.linearRampToValueAtTime(320, now + dur);

    formants.filter2.frequency.setValueAtTime(1100, now);
    formants.filter2.frequency.exponentialRampToValueAtTime(1920, now + 0.055);
    formants.filter2.frequency.setValueAtTime(1920, now + 0.34);
    formants.filter2.frequency.linearRampToValueAtTime(1350, now + dur);

    formants.filter3.frequency.setValueAtTime(2200, now);
    formants.filter3.frequency.exponentialRampToValueAtTime(2650, now + 0.06);
    formants.filter3.frequency.setValueAtTime(2650, now + 0.34);
    formants.filter3.frequency.linearRampToValueAtTime(2300, now + dur);

    const voiceSourceMix = ctx.createGain();
    voiceSourceMix.gain.value = 0.58;
    oscMain.connect(voiceSourceMix);
    oscSub.connect(voiceSourceMix);
    voiceSourceMix.connect(formants.busIn);
    noiseGain.connect(formants.busIn);

    // サチュレーション（シャウトの歪み）
    const shaper = ctx.createWaveShaper();
    shaper.curve = getKiaiShoutCurve();
    formants.busOut.connect(shaper);

    // マスター音量エンベロープ
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.28 * intensity, now + 0.04);
    masterGain.gain.linearRampToValueAtTime(0.65 * intensity, now + 0.08); // 「メェッ」のアタック
    masterGain.gain.exponentialRampToValueAtTime(0.48 * intensity, now + 0.34); // 「ーーー」の張り
    masterGain.gain.linearRampToValueAtTime(0.0001, now + dur); // 「ン！」の収束

    shaper.connect(masterGain);
    masterGain.connect(getSoundDestination(ctx));
    attachDojoReverb(ctx, now, masterGain, dur);

    oscMain.start(now);
    oscSub.start(now);
    noiseSource.start(now);
    oscMain.stop(now + dur + 0.05);
    oscSub.stop(now + dur + 0.05);
    noiseSource.stop(now + dur + 0.05);
}

// 2. 小手のシャウト：「コテェーーッ！」
function playKoteShout(ctx, now, basePitch, intensity = 1.0) {
    const dur = 0.32;

    // 破裂音 /k/（鋭い子音ノイズバースト）
    const kNoise = ctx.createBufferSource();
    kNoise.buffer = getBreathNoiseBuffer(ctx);
    const kFilter = ctx.createBiquadFilter();
    kFilter.type = 'bandpass';
    kFilter.frequency.setValueAtTime(2600, now);
    kFilter.Q.setValueAtTime(3.2, now);
    const kGain = ctx.createGain();
    kGain.gain.setValueAtTime(0.32 * intensity, now);
    kGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
    kNoise.connect(kFilter);
    kFilter.connect(kGain);
    kGain.connect(getSoundDestination(ctx));
    kNoise.start(now);
    kNoise.stop(now + 0.03);

    // 声帯オシレータ
    const oscMain = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    oscMain.type = 'sawtooth';
    oscSub.type = 'triangle';

    // ピッチ推移: /ko/(中低) -> /te/(鋭く高音へ急跳躍！) -> スタッカートで切れる
    oscMain.frequency.setValueAtTime(basePitch * 0.90, now);
    oscMain.frequency.setValueAtTime(basePitch * 0.95, now + 0.05);
    oscMain.frequency.exponentialRampToValueAtTime(basePitch * 1.35, now + 0.11);
    oscMain.frequency.linearRampToValueAtTime(basePitch * 1.42, now + 0.25);

    oscSub.frequency.setValueAtTime(basePitch * 0.45, now);
    oscSub.frequency.exponentialRampToValueAtTime(basePitch * 0.67, now + 0.11);

    // 呼気ノイズ（テェーの時の鋭い息）
    const breathSource = ctx.createBufferSource();
    breathSource.buffer = getBreathNoiseBuffer(ctx);
    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.setValueAtTime(2400, now);
    breathFilter.Q.setValueAtTime(2.2, now);
    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.0001, now);
    breathGain.gain.setValueAtTime(0.0001, now + 0.05);
    breathGain.gain.linearRampToValueAtTime(0.14 * intensity, now + 0.10);
    breathGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.27);
    breathSource.connect(breathFilter);
    breathFilter.connect(breathGain);

    // フォルマント遷移 (/o/ -> /e/)
    const formants = createFormantFilters(ctx, 460, 880, 2400);
    formants.filter1.frequency.setValueAtTime(460, now);
    formants.filter1.frequency.exponentialRampToValueAtTime(530, now + 0.10);

    formants.filter2.frequency.setValueAtTime(880, now);
    formants.filter2.frequency.exponentialRampToValueAtTime(1960, now + 0.10);

    formants.filter3.frequency.setValueAtTime(2400, now);
    formants.filter3.frequency.exponentialRampToValueAtTime(2750, now + 0.10);

    const voiceSourceMix = ctx.createGain();
    voiceSourceMix.gain.value = 0.58;
    oscMain.connect(voiceSourceMix);
    oscSub.connect(voiceSourceMix);
    voiceSourceMix.connect(formants.busIn);
    breathGain.connect(formants.busIn);

    // サチュレーション & マスターゲイン
    const shaper = ctx.createWaveShaper();
    shaper.curve = getKiaiShoutCurve();
    formants.busOut.connect(shaper);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.32 * intensity, now + 0.03); // コ
    masterGain.gain.linearRampToValueAtTime(0.66 * intensity, now + 0.11); // テェーーッ
    masterGain.gain.setValueAtTime(0.55 * intensity, now + 0.24);
    // スタッカート（ッ！でスパッと切る）
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.275);

    shaper.connect(masterGain);
    masterGain.connect(getSoundDestination(ctx));
    attachDojoReverb(ctx, now, masterGain, 0.27);

    oscMain.start(now);
    oscSub.start(now);
    breathSource.start(now);
    oscMain.stop(now + dur);
    oscSub.stop(now + dur);
    breathSource.stop(now + dur);
}

// 3. 胴のシャウト：「ドォーーーッ！」
function playDoShout(ctx, now, basePitch, intensity = 1.0) {
    const dur = 0.46;
    const doPitch = basePitch * 0.82; // 胴は低く腹から唸る

    // 有声破裂音 /d/（低域アタック音）
    const dOsc = ctx.createOscillator();
    dOsc.type = 'triangle';
    dOsc.frequency.setValueAtTime(140, now);
    dOsc.frequency.exponentialRampToValueAtTime(65, now + 0.04);
    const dGain = ctx.createGain();
    dGain.gain.setValueAtTime(0.32 * intensity, now);
    dGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    dOsc.connect(dGain);
    dGain.connect(getSoundDestination(ctx));
    dOsc.start(now);
    dOsc.stop(now + 0.05);

    // 声帯オシレータ
    const oscMain = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    oscMain.type = 'sawtooth';
    oscSub.type = 'triangle';

    oscMain.frequency.setValueAtTime(doPitch * 0.86, now);
    oscMain.frequency.linearRampToValueAtTime(doPitch * 1.08, now + 0.06);
    oscMain.frequency.exponentialRampToValueAtTime(doPitch * 0.96, now + 0.26);
    oscMain.frequency.linearRampToValueAtTime(doPitch * 0.82, now + dur);

    oscSub.frequency.setValueAtTime(doPitch * 0.43, now);
    oscSub.frequency.linearRampToValueAtTime(doPitch * 0.54, now + 0.06);
    oscSub.frequency.linearRampToValueAtTime(doPitch * 0.41, now + dur);

    // 呼気ノイズ（野太い息）
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = getBreathNoiseBuffer(ctx);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1100, now);
    noiseFilter.Q.setValueAtTime(1.5, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.12 * intensity, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.05 * intensity, now + 0.30);
    noiseGain.gain.linearRampToValueAtTime(0.0001, now + dur);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // フォルマント (/o/: 太く響く共鳴)
    const formants = createFormantFilters(ctx, 430, 800, 2250);
    formants.filter1.Q.value = 4.0;
    formants.filter2.Q.value = 4.8;

    const voiceSourceMix = ctx.createGain();
    voiceSourceMix.gain.value = 0.65;
    oscMain.connect(voiceSourceMix);
    oscSub.connect(voiceSourceMix);
    voiceSourceMix.connect(formants.busIn);
    noiseGain.connect(formants.busIn);

    // サチュレーション & マスターゲイン
    const shaper = ctx.createWaveShaper();
    shaper.curve = getKiaiShoutCurve();
    formants.busOut.connect(shaper);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.68 * intensity, now + 0.05); // 「ドォッ」の力強いアタック
    masterGain.gain.exponentialRampToValueAtTime(0.50 * intensity, now + 0.30); // 腹の底からの張り
    masterGain.gain.linearRampToValueAtTime(0.0001, now + dur); // 鋭く引く

    shaper.connect(masterGain);
    masterGain.connect(getSoundDestination(ctx));
    attachDojoReverb(ctx, now, masterGain, dur);

    oscMain.start(now);
    oscSub.start(now);
    noiseSource.start(now);
    oscMain.stop(now + dur + 0.05);
    oscSub.stop(now + dur + 0.05);
    noiseSource.stop(now + dur + 0.05);
}

// 4. 突きのシャウト：「ツキィーーッ！」
function playTsukiShout(ctx, now, basePitch, intensity = 1.0) {
    const dur = 0.38;

    // 破擦音 /ts/（高周波摩擦ノイズ）
    const tsNoise = ctx.createBufferSource();
    tsNoise.buffer = getBreathNoiseBuffer(ctx);
    const tsFilter = ctx.createBiquadFilter();
    tsFilter.type = 'highpass';
    tsFilter.frequency.setValueAtTime(5200, now);
    const tsGain = ctx.createGain();
    tsGain.gain.setValueAtTime(0.30 * intensity, now);
    tsGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    tsNoise.connect(tsFilter);
    tsFilter.connect(tsGain);
    tsGain.connect(getSoundDestination(ctx));
    tsNoise.start(now);
    tsNoise.stop(now + 0.05);

    // 声帯オシレータ
    const oscMain = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    oscMain.type = 'sawtooth';
    oscSub.type = 'triangle';

    // ピッチ推移: 高音からさらに超高域へ一直線に突き抜ける
    oscMain.frequency.setValueAtTime(basePitch * 1.08, now);
    oscMain.frequency.setValueAtTime(basePitch * 1.15, now + 0.04);
    oscMain.frequency.exponentialRampToValueAtTime(basePitch * 1.58, now + 0.12);
    oscMain.frequency.linearRampToValueAtTime(basePitch * 1.68, now + 0.32);

    oscSub.frequency.setValueAtTime(basePitch * 0.54, now);
    oscSub.frequency.exponentialRampToValueAtTime(basePitch * 0.79, now + 0.12);

    // 呼気ノイズ（高音の息漏れ）
    const breathSource = ctx.createBufferSource();
    breathSource.buffer = getBreathNoiseBuffer(ctx);
    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.setValueAtTime(3200, now);
    breathFilter.Q.setValueAtTime(2.5, now);
    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.0001, now);
    breathGain.gain.linearRampToValueAtTime(0.16 * intensity, now + 0.08);
    breathGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    breathSource.connect(breathFilter);
    breathFilter.connect(breathGain);

    // フォルマント (/u/ -> /i/ 鋭い貫通音)
    const formants = createFormantFilters(ctx, 320, 1200, 2400);
    formants.filter1.frequency.setValueAtTime(320, now);
    formants.filter1.frequency.exponentialRampToValueAtTime(280, now + 0.10);

    formants.filter2.frequency.setValueAtTime(1200, now);
    formants.filter2.frequency.exponentialRampToValueAtTime(2450, now + 0.10);

    formants.filter3.frequency.setValueAtTime(2400, now);
    formants.filter3.frequency.exponentialRampToValueAtTime(3350, now + 0.10);

    const voiceSourceMix = ctx.createGain();
    voiceSourceMix.gain.value = 0.55;
    oscMain.connect(voiceSourceMix);
    oscSub.connect(voiceSourceMix);
    voiceSourceMix.connect(formants.busIn);
    breathGain.connect(formants.busIn);

    // サチュレーション & マスターゲイン
    const shaper = ctx.createWaveShaper();
    shaper.curve = getKiaiShoutCurve();
    formants.busOut.connect(shaper);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.35 * intensity, now + 0.03);
    masterGain.gain.linearRampToValueAtTime(0.68 * intensity, now + 0.10); // 「キィーーッ！」
    masterGain.gain.setValueAtTime(0.58 * intensity, now + 0.30);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35); // 鋭く貫通して切れる

    shaper.connect(masterGain);
    masterGain.connect(getSoundDestination(ctx));
    attachDojoReverb(ctx, now, masterGain, 0.35);

    oscMain.start(now);
    oscSub.start(now);
    breathSource.start(now);
    oscMain.stop(now + dur);
    oscSub.stop(now + dur);
    breathSource.stop(now + dur);
}

// 「ヤァァァ！」「ドォォッ！」などの気合・崩しの掛け声シャウトをWeb Audioで合成
function playKakegoeShout(ctx, now, basePitch = 240, intensity = 1.0) {
    const dur = 0.38;
    const oscMain = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    oscMain.type = 'sawtooth';
    oscSub.type = 'triangle';

    oscMain.frequency.setValueAtTime(basePitch * 0.95, now);
    oscMain.frequency.linearRampToValueAtTime(basePitch * 1.25, now + 0.05);
    oscMain.frequency.exponentialRampToValueAtTime(basePitch * 1.05, now + 0.25);
    oscMain.frequency.linearRampToValueAtTime(basePitch * 0.85, now + dur);

    oscSub.frequency.setValueAtTime(basePitch * 0.48, now);
    oscSub.frequency.linearRampToValueAtTime(basePitch * 0.62, now + 0.05);
    oscSub.frequency.exponentialRampToValueAtTime(basePitch * 0.52, now + 0.25);

    const breathSource = ctx.createBufferSource();
    breathSource.buffer = getBreathNoiseBuffer(ctx);
    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.setValueAtTime(1800, now);
    breathFilter.Q.setValueAtTime(1.8, now);
    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.0001, now);
    breathGain.gain.linearRampToValueAtTime(0.24 * intensity, now + 0.03);
    breathGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    breathSource.connect(breathFilter);
    breathFilter.connect(breathGain);

    const formants = createFormantFilters(ctx, 750, 1250, 2600);
    const voiceSourceMix = ctx.createGain();
    voiceSourceMix.gain.value = 0.55;
    oscMain.connect(voiceSourceMix);
    oscSub.connect(voiceSourceMix);
    voiceSourceMix.connect(formants.busIn);
    breathGain.connect(formants.busIn);

    const shaper = ctx.createWaveShaper();
    shaper.curve = getKiaiShoutCurve();
    formants.busOut.connect(shaper);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.65 * intensity, now + 0.04);
    masterGain.gain.setValueAtTime(0.55 * intensity, now + 0.26);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    shaper.connect(masterGain);
    masterGain.connect(getSoundDestination(ctx));
    attachDojoReverb(ctx, now, masterGain, 0.4);

    oscMain.start(now);
    oscSub.start(now);
    breathSource.start(now);
    oscMain.stop(now + dur);
    oscSub.stop(now + dur);
    breathSource.stop(now + dur);
}

// 剣士共通の掛け声テキスト（ひらがな）を取得（「やぁぁぁ！」に統一）
function getFighterKiaiShout(who) {
    return 'やぁぁぁ！';
}

// 打突ヒット時・気合・崩し・防御時の技名気合（メェーーーン！、コテェーーッ！、ドォーーッ！、ツキィーーッ！、ヤァァァ！）
const KIAI_CALLS = {
    '面': 'メェーーーン！',
    '小手': 'コテェーーッ！',
    '胴': 'ドォーーッ！',
    '突き': 'ツキィーーッ！',
    '気合': 'ヤァァァ！',
    '崩し': 'ヤァァァ！',
    '防御': 'ヤァァァ！',
};

function playKiaiVoice(action, options = {}) {
    if (!KIAI_CALLS[action]) return;

    // オプション正規化
    let isPlayer = true;
    let intensity = 1.0;
    let fighterId = 'player';
    if (typeof options === 'number') {
        intensity = options;
    } else if (typeof options === 'object' && options !== null) {
        if (options.isPlayer !== undefined) isPlayer = options.isPlayer;
        if (options.intensity !== undefined) intensity = options.intensity;
        if (options.fighterId !== undefined) fighterId = options.fighterId;
    }

    // 1. Web Audio API によるプロシージャル合成（ゼロ遅延・高音質）
    if (ensureAudio()) {
        try {
            const ctx = audioCtx;
            const now = ctx.currentTime;

            // 剣士ごとの基本周波数（ピッチ倍率）
            let basePitch = 240; // プレイヤーの基本気合ピッチ（凛々しい中高音）
            if (!isPlayer) {
                const curEnemy = typeof getCurrentEnemy === 'function' ? getCurrentEnemy() : null;
                const enemyId = curEnemy ? curEnemy.id : fighterId;
                if (enemyId === 'onizuka') {
                    basePitch = 155; // 鬼塚：野太くドスの利いた剛剣の叫び
                } else if (enemyId === 'kasumi') {
                    basePitch = 300; // 霞：鋭く高い突き抜ける気合
                } else if (enemyId === 'ryuzen') {
                    basePitch = 145; // 龍禅：重厚な師範の唸り
                } else if (enemyId === 'sasaki') {
                    basePitch = 215; // 佐々木：研ぎ澄まされた鋭い声
                } else {
                    basePitch = 265; // 健太：若々しい掛け声
                }
            }

            if (action === '面') {
                playMenShout(ctx, now, basePitch, intensity);
            } else if (action === '小手') {
                playKoteShout(ctx, now, basePitch, intensity);
            } else if (action === '胴') {
                playDoShout(ctx, now, basePitch, intensity);
            } else if (action === '突き') {
                playTsukiShout(ctx, now, basePitch, intensity);
            } else if (action === '気合' || action === '崩し' || action === '防御') {
                playKakegoeShout(ctx, now, basePitch, intensity);
            }
            return; // Web Audio再生成功時は終了（SpeechSynthesisとの二重発声を防止）
        } catch (e) {
            // Web Audio エラー時はフォールバックへ
        }
    }

    // 2. 音声合成（Web Speech API）で共通掛け声・技名を発声
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
            let text = '';
            if (action === '気合' || action === '崩し' || action === '防御') {
                text = 'やぁぁぁ！';
            } else if (action === '面') {
                text = 'めーん！';
            } else if (action === '小手') {
                text = 'こてー！';
            } else if (action === '胴') {
                text = 'どうー！';
            } else if (action === '突き') {
                text = 'つきー！';
            }
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'ja-JP';
            utter.rate = 1.35;
            utter.pitch = isPlayer ? 1.35 : 0.92;
            utter.volume = Math.max(0, Math.min(1, 0.65 * intensity));
            if (!cachedKiaiVoice) refreshVoiceAssignments();
            if (cachedKiaiVoice) utter.voice = cachedKiaiVoice;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }
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
    snapGain.gain.setValueAtTime(0.26 * intensity, now);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

    noise.connect(filter);
    filter.connect(snapGain);
    snapGain.connect(getSoundDestination(ctx));
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
    taikoGain.gain.linearRampToValueAtTime(0.30 * intensity, now + 0.012);
    taikoGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    osc.connect(taikoGain);
    subOsc.connect(taikoGain);
    taikoGain.connect(getSoundDestination(ctx));

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
    gain.connect(getSoundDestination(ctx));
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.24, now + 0.01);

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
    } else if (type === 'stat_up') {
        // 🌟 パラメータUPの爽やかで心地よい和風上昇アルペジオ音（ポロロロロン♪）
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            noteGain.gain.setValueAtTime(0.0001, now + idx * 0.05);
            noteGain.gain.exponentialRampToValueAtTime(0.20, now + idx * 0.05 + 0.015);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.28);

            osc.connect(noteGain);
            noteGain.connect(getSoundDestination(ctx));

            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.3);
        });
        return;
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
        if (!Array.isArray(anim.keyframes) || anim.keyframes.length === 0) {
            anim.keyframes = null;
            return;
        }
        anim.virtualElapsed += effectiveDt;
        const elapsed = anim.virtualElapsed;
        const kfs = anim.keyframes;
        const lastKf = kfs[kfs.length - 1];

        if (elapsed >= lastKf.t) {
            anim.keyframes = null;
            anim.isSpecial = false;
            anim.afterimages = [];
            if (!animators.player.keyframes && !animators.enemy.keyframes) {
                timeState.hitStopUntil = 0;
                timeState.slowMoUntil = 0;
                flushPendingRound();
            }
            if ((anim.alpha !== undefined && anim.alpha <= 0.02) || anim.posX <= -180) {
                anim.alpha = 0;
                anim.posX = -250;
            } else {
                setSpriteWithFade(anim, defaultSprite, now);
                const speedMult = (isCounter || kiai >= 3) ? 1.35 : 1.0;
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
            }
        } else {
            let idx = 0;
            for (let i = 0; i < kfs.length - 1; i++) {
                if (elapsed >= kfs[i].t && elapsed < kfs[i + 1].t) {
                    idx = i;
                    break;
                }
            }
            const k0 = kfs[idx];
            const k1 = kfs[idx + 1] || k0;
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
                    if (kf.t === ANIM_TOTAL_T && pendingRoundCallback) {
                        firePendingRoundResult();
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
                            triggerHitStop(95, 160, 0.28, now);
                        } else {
                            triggerHitStop(55, 65, 0.45, now);
                        }
                    } else if (fx && (fx.startsWith('lunge_') || fx.startsWith('special_lunge_'))) {
                        const baseType = fx.startsWith('special_lunge_') ? fx.replace('special_lunge_', '') : fx.replace('lunge_', '');
                        const slashType = baseType;
                        const impactY = baseType === 'men' ? 76 : (baseType === 'tsuki' ? 96 : 114);
                        spawnDust(anim, currentFootX + dir * 18, GROUND_Y, dir);
                        anim.slashEffect = {
                            type: slashType,
                            start: now,
                            elapsed: 0,
                            duration: isHeavy ? 300 : 240,
                            isHeavy: isHeavy,
                        };
                        if (anim.isSpecial || slashType === 'tsuki' || isCounter || isHeavy) {
                            spawnSparks(anim, currentFootX + dir * 48, impactY, '250, 204, 21', isHeavy ? 18 : 14, 1.25);
                            spawnShockwave(anim, currentFootX + dir * 46, impactY, '250, 204, 21', true);
                            triggerHitStop(isHeavy ? 90 : 70, isHeavy ? 100 : 60, 0.38, now);
                        } else {
                            spawnShockwave(anim, currentFootX + dir * 44, impactY, '56, 189, 248', false);
                        }
                    } else if (fx === 'clash_tsuba') {
                        spawnDust(anim, currentFootX + dir * 12, GROUND_Y, dir);
                        spawnSparks(anim, currentFootX + dir * 40, 96, '250, 204, 21', 20, 1.25);
                        spawnShockwave(anim, currentFootX + dir * 38, 96, '250, 204, 21', false);
                        triggerHitStop(50, 0, 1.0, now);
                    } else if (fx === 'shield' || fx === 'shield_success') {
                        anim.slashEffect = { type: fx, start: now, elapsed: 0, duration: 320, isHeavy: false };
                        if (fx === 'shield_success') {
                            spawnSparks(anim, currentFootX + dir * 34, 98, '56, 189, 248', 18, 1.15);
                            spawnShockwave(anim, currentFootX + dir * 34, 98, '56, 189, 248', false);
                            triggerHitStop(55, 0, 1.0, now);
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
            const a0 = k0.alpha !== undefined ? k0.alpha : 1;
            const a1 = k1.alpha !== undefined ? k1.alpha : 1;
            anim.alpha = lerp(a0, a1, easedT);

            // 高速踏み込み・打突スイング中は連続ポーズ残像を追加（最大4件に制限）
            const poseLungeDist = Math.abs((anim.currentPose.hipX - 132) * 0.47 + anim.posX);
            const isSpec = !!anim.isSpecial;
            const afterimageChance = isSpec ? 0.75 : (anim.impactWeight === 'heavy' ? 0.65 : 0.42);
            if (!inHitStop && (poseLungeDist > 8 || isSpec) && Math.random() < afterimageChance) {
                if (anim.afterimages.length >= 4) {
                    anim.afterimages.shift();
                }
                anim.afterimages.push({
                    pose: { ...anim.currentPose, swingBlur: 0, hitDebris: 0 },
                    posX: anim.posX,
                    scaleX: anim.scaleX,
                    scaleY: anim.scaleY,
                    rot: anim.rot,
                    isGold: isSpec,
                    alpha: isSpec ? 0.42 : (anim.impactWeight === 'heavy' ? 0.28 : 0.22),
                });
            }
        }
    } else {
        // 待機中（または決着後）の滑らかな60fps呼吸・すり足・剣先の揺らぎ
        const speedMult = (isCounter || kiai >= 3) ? 1.38 : 1.0;
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
            if (anim.alpha !== undefined && anim.alpha <= 0.02) {
                anim.posX = -250;
                anim.alpha = 0;
            } else {
                const isCeremonyIdle = defaultSprite === 'sageto' || defaultSprite === 'rei' || defaultSprite === 'sonkyo_kamae' || defaultSprite === 'sonkyo_osameto';
                const suriashiX = isCeremonyIdle ? 0 : Math.sin(phase * 0.55) * 2.2;
                anim.posX = lerp(anim.posX, suriashiX, 0.16);
                anim.scaleX = lerp(anim.scaleX, 1.0, 0.16);
                anim.scaleY = lerp(anim.scaleY, 1.0, 0.16);
                anim.rot = lerp(anim.rot, 0, 0.16);
            }
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
    const renderAlpha = anim.alpha !== undefined ? Math.max(0, Math.min(1, anim.alpha)) : 1;

    // 完全に画面外へ退場して消えている場合は描画スキップ
    if (renderAlpha <= 0.001) {
        return;
    }

    // 応じ技構え・気合高揚時のオーラ粒子生成（待機中のみ足元から立ち昇る）
    if (!state.gameOver && !anim.keyframes && (isCounter || kiai >= 3) && Math.random() < 0.25) {
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
    ctx.globalAlpha *= renderAlpha;
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
    const fighterArmorTheme = who === 'enemy'
        ? getCurrentEnemy().armorTheme
        : (state.customMatch && state.customMatch.active && state.customMatch.player ? state.customMatch.player.armorTheme : null);
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
        if (img.isGold) {
            ctx.globalCompositeOperation = 'lighter';
        }
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
    drawArticulatedPoseOnCanvas(ctx, renderPose, renderAlpha, fighterArmorTheme);
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

// ⚡ 必殺技・奥義カットイン演出
function triggerSpecialCutin(side, techName, isUnlocked = true, isClash = false) {
    if (!specialFxOverlay) return;
    if (specialCutinTimer) {
        clearTimeout(specialCutinTimer);
        specialCutinTimer = null;
    }

    if (specialCutinTitle) specialCutinTitle.textContent = techName || '気合一閃';
    if (specialCutinSub) {
        if (isClash) specialCutinSub.textContent = '⚡ 奥義激突 ⚡';
        else if (isUnlocked) specialCutinSub.textContent = side === 'player' ? '⚡ 秘技覚醒 ⚡' : '⚠️ 相手奥義 ⚠️';
        else specialCutinSub.textContent = '🔥 気合一閃 🔥';
    }

    if (specialCutinBanner) {
        specialCutinBanner.classList.remove('show-player', 'show-enemy', 'show-clash');
        void specialCutinBanner.offsetWidth; // リフロー強制
        if (isClash) specialCutinBanner.classList.add('show-clash');
        else if (side === 'player') specialCutinBanner.classList.add('show-player');
        else specialCutinBanner.classList.add('show-enemy');
    }

    specialFxOverlay.style.display = 'block';

    specialCutinTimer = setTimeout(() => {
        if (specialCutinBanner) specialCutinBanner.classList.remove('show-player', 'show-enemy', 'show-clash');
        specialSlashTimer = setTimeout(() => {
            if (specialFxOverlay) {
                specialFxOverlay.style.display = 'none';
            }
            specialSlashTimer = null;
        }, 150);
        specialCutinTimer = null;
    }, 850);
}

// ⚡ 画面を斜めに一閃する斬痕閃光（スクリーン・スラッシュ：画面全体効果抑制のため無効化）
function triggerScreenSlash() {
    // 画面全体効果の削除に伴い無効化
}

// ⚡ 必殺技演出の即時リセット・非表示
function hideSpecialCutin() {
    if (specialCutinTimer) {
        clearTimeout(specialCutinTimer);
        specialCutinTimer = null;
    }
    if (specialSlashTimer) {
        clearTimeout(specialSlashTimer);
        specialSlashTimer = null;
    }
    if (specialDarken) specialDarken.classList.remove('active');
    if (specialSpeedLines) specialSpeedLines.classList.remove('active');
    if (specialCutinBanner) specialCutinBanner.classList.remove('show-player', 'show-enemy', 'show-clash');
    if (specialScreenSlash) specialScreenSlash.classList.remove('flash-slash');
    if (specialFxOverlay) specialFxOverlay.style.display = 'none';
}

// ダメージやバフのフローティングポップアップを表示
function spawnFloatingPopup(who, text, styleClass = 'popup-dmg', offsetY = 0) {
    const layer = who === 'player' ? playerPopupLayer : enemyPopupLayer;
    if (!layer || !text) return;
    const el = document.createElement('div');
    const isLongText = (typeof text === 'string' && text.length >= 8);
    el.className = `floating-popup ${styleClass}${isLongText ? ' popup-text-compact' : ''}`;
    el.textContent = text;
    if (offsetY !== 0) {
        el.style.marginTop = `${offsetY}px`;
    }
    layer.appendChild(el);
    setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 1100);
}

// 競り合いクラッシュメーターの表示・非表示制御
let clashMeterHideTimer = null;
let clashMeterShowTimestamp = 0;

function showClashMeter(data) {
    if (!clashMeterWrap) return;
    if (clashMeterHideTimer) {
        clearTimeout(clashMeterHideTimer);
        clashMeterHideTimer = null;
    }

    const {
        pMoveName = '面',
        eMoveName = '小手',
        pScore = 50,
        eScore = 50,
        pSkillVal = 30,
        eSkillVal = 30,
        pAdv = 0,
        eAdv = 0,
        pKiaiLabel = '',
        eKiaiLabel = '',
        pKiaiBonus = 0,
        eKiaiBonus = 0,
        winner = null,
    } = data;

    if (clashPlayerLabel) {
        clashPlayerLabel.innerHTML = `${pMoveName} ${pSkillVal} <span class="clash-total-pill player" title="判定総合パワー">計 ${pScore}</span>`;
    }
    if (clashEnemyLabel) {
        clashEnemyLabel.innerHTML = `<span class="clash-total-pill enemy" title="判定総合パワー">計 ${eScore}</span> ${eMoveName} ${eSkillVal}`;
    }
    if (clashVsTag) {
        if (winner === 'player') clashVsTag.textContent = '優勢！';
        else if (winner === 'enemy') clashVsTag.textContent = '劣勢！';
        else clashVsTag.textContent = '激突！';
    }

    // パワーバーの割合計算（最小18%〜最大82%で押し合い感を演出）
    const total = Math.max(1, pScore + eScore);
    const pRatio = Math.max(0.18, Math.min(0.82, pScore / total));
    const pPct = (pRatio * 100).toFixed(1);
    const ePct = ((1 - pRatio) * 100).toFixed(1);

    if (clashFillPlayer) clashFillPlayer.style.width = `${pPct}%`;
    if (clashFillEnemy) clashFillEnemy.style.width = `${ePct}%`;
    if (clashMarker) clashMarker.style.left = `${pPct}%`;

    // 理由バッジ生成（左側：自身、右側：敵側）
    if (clashReasons) {
        const pBadges = [];
        const eBadges = [];

        // 1. 三すくみ相性
        if (pAdv > 0) pBadges.push(`<span class="clash-badge adv-player">相性有利 +${pAdv}</span>`);
        if (eAdv > 0) eBadges.push(`<span class="clash-badge adv-enemy">相性有利 +${eAdv}</span>`);

        // 2. 技量差（5以上離れている側に技術優位バッジ）
        const skillDiff = pSkillVal - eSkillVal;
        if (skillDiff >= 5) {
            pBadges.push(`<span class="clash-badge skill-player">技術優位 +${skillDiff}</span>`);
        } else if (skillDiff <= -5) {
            eBadges.push(`<span class="clash-badge skill-enemy">技術優位 +${-skillDiff}</span>`);
        }

        // 3. 気合バフ
        if (pKiaiBonus > 0 && pKiaiLabel) {
            pBadges.push(`<span class="clash-badge kiai-buff">${pKiaiLabel} +${pKiaiBonus}</span>`);
        }
        if (eKiaiBonus > 0 && eKiaiLabel) {
            eBadges.push(`<span class="clash-badge kiai-buff">${eKiaiLabel} +${eKiaiBonus}</span>`);
        }

        // 4. 基礎能力ボーナス（剛腕・見切り・気力）
        const {
            pStrBonus = 0, eStrBonus = 0,
            pAgiBonus = 0, eAgiBonus = 0,
            pSpiBonus = 0, eSpiBonus = 0,
            pCounterBonus = 0, eCounterBonus = 0,
            pCounterStacks = 0, eCounterStacks = 0,
        } = data;

        // 見切り応じ技（スタック数に応じた明示表示）
        if (pCounterStacks > 0) {
            const totalCounter = pCounterBonus + pAgiBonus;
            pBadges.push(`<span class="clash-badge skill-player">⚡ 見切りLv${pCounterStacks} +${totalCounter}</span>`);
        } else if (pAgiBonus > 0) {
            pBadges.push(`<span class="clash-badge skill-player">⚡ 見切り +${pAgiBonus}</span>`);
        }
        if (eCounterStacks > 0) {
            const totalCounter = eCounterBonus + eAgiBonus;
            eBadges.push(`<span class="clash-badge skill-enemy">⚡ 見切りLv${eCounterStacks} +${totalCounter}</span>`);
        } else if (eAgiBonus > 0) {
            eBadges.push(`<span class="clash-badge skill-enemy">⚡ 見切り +${eAgiBonus}</span>`);
        }

        // 剛腕押し切り（差が2以上ある優位側に表示）
        if (pStrBonus - eStrBonus >= 2) {
            pBadges.push(`<span class="clash-badge skill-player">💪 剛腕 +${pStrBonus}</span>`);
        } else if (eStrBonus - pStrBonus >= 2) {
            eBadges.push(`<span class="clash-badge skill-enemy">💪 剛腕 +${eStrBonus}</span>`);
        }

        // 気力ボーナス
        if (pSpiBonus > 0) pBadges.push(`<span class="clash-badge kiai-buff">🔥 気力 +${pSpiBonus}</span>`);
        if (eSpiBonus > 0) eBadges.push(`<span class="clash-badge kiai-buff">🔥 気力 +${eSpiBonus}</span>`);

        clashReasons.innerHTML = `
            <div class="clash-columns">
                <div class="clash-col player">${pBadges.length > 0 ? pBadges.join('') : '<span class="clash-empty">-</span>'}</div>
                <div class="clash-col enemy">${eBadges.length > 0 ? eBadges.join('') : '<span class="clash-empty">-</span>'}</div>
            </div>
            <div class="clash-summary-row">
                <span class="clash-summary-val player">判定計 ${pScore}</span>
                <span class="clash-summary-vs">VS</span>
                <span class="clash-summary-val enemy">判定計 ${eScore}</span>
            </div>
            <div class="clash-close-hint">クリックで閉じる</div>
        `;
    }

    clashMeterWrap.style.display = 'block';
    void clashMeterWrap.offsetWidth; // リフロー強制
    clashMeterWrap.classList.add('show');
    clashMeterShowTimestamp = Date.now();
    // 次の合の技選択中や表示中も並行して表示を維持（画面クリックまたは次のアクションで閉じる）
}

function hideClashMeter() {
    if (clashMeterHideTimer) {
        clearTimeout(clashMeterHideTimer);
        clashMeterHideTimer = null;
    }
    if (clashMeterWrap) {
        clashMeterWrap.classList.remove('show');
        setTimeout(() => {
            if (clashMeterWrap && !clashMeterWrap.classList.contains('show')) {
                clashMeterWrap.style.display = 'none';
            }
        }, 180);
    }
}

// 画面クリックでクラッシュメーターを閉じる（表示直後200ms以内の即時反応を抑止）
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('pointerdown', () => {
        if (!clashMeterWrap || !clashMeterWrap.classList.contains('show')) return;
        if (Date.now() - clashMeterShowTimestamp < 200) return;
        hideClashMeter();
    });
}

// 審判の紅白旗・技コールカットインを表示
function showRefereeCallout({ winner = null, mainText = '', subText = '', reasonBadge = null, isCritical = false, isGuard = false }, onHidden = null) {
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

    const flagsEl = refereeCallout.querySelector('.referee-flags');
    if (flagsEl) {
        flagsEl.style.display = (winner === 'player' || winner === 'enemy' || winner === 'both') ? 'flex' : 'none';
    }

    refFlagRed.classList.toggle('flag-up', winner === 'player' || winner === 'both');
    refFlagWhite.classList.toggle('flag-up', winner === 'enemy' || winner === 'both');

    refereeMainText.textContent = mainText;
    refereeSubText.textContent = subText;

    if (refereeReasonBadge) {
        if (reasonBadge) {
            refereeReasonBadge.textContent = reasonBadge;
            refereeReasonBadge.style.display = 'inline-block';
            refereeReasonBadge.className = 'referee-reason-tag ' + (winner === 'player' ? 'red-tag' : (winner === 'enemy' ? 'white-tag' : ''));
        } else {
            refereeReasonBadge.style.display = 'none';
        }
    }

    const duration = state.gameOver ? 2500 : 1300;
    refereeHideTimer = setTimeout(() => {
        refereeCallout.classList.remove('show');
        if (onHidden) {
            // CSSフェードアウト（約200ms）完了を待ってからコールバックを呼ぶ
            const hideFadeTimer = setTimeout(() => {
                onHidden();
            }, 250);
            if (state.ceremonyTimers) {
                state.ceremonyTimers.push(hideFadeTimer);
            }
        }
    }, duration);
}

function hideRefereeCallout() {
    if (refereeHideTimer) {
        clearTimeout(refereeHideTimer);
        refereeHideTimer = null;
    }
    if (refereeCallout) {
        refereeCallout.className = 'referee-callout';
        const flagsEl = refereeCallout.querySelector('.referee-flags');
        if (flagsEl) {
            flagsEl.style.display = 'flex';
        }
    }
    if (refereeReasonBadge) {
        refereeReasonBadge.style.display = 'none';
    }
}

function getFighterStats(who) {
    if (who === 'player') {
        if (state.customMatch && state.customMatch.player) {
            const p = state.customMatch.player;
            return {
                str: p.str || 10,
                agi: p.agi || 10,
                spi: p.spi || 10,
                skills: p.skills || { men: 8, kote: 8, do: 8, tsuki: 6 },
            };
        }
        return { str: 14, agi: 14, spi: 14, skills: { men: 42, kote: 38, do: 36, tsuki: 32 } };
    } else {
        if (state.customMatch && state.customMatch.enemy) {
            const e = state.customMatch.enemy;
            return {
                str: e.str || 10,
                agi: e.agi || 10,
                spi: e.spi || 10,
                skills: e.skills || { men: 8, kote: 8, do: 8, tsuki: 6 },
            };
        }
        const enemyData = getCurrentEnemy();
        return {
            str: enemyData.str || 10,
            agi: enemyData.agi || 10,
            spi: enemyData.spi || 10,
            skills: enemyData.skills || { men: 8, kote: 8, do: 8, tsuki: 6 },
        };
    }
}

// 部員または敵の必殺技（得意技）情報および解放状態の取得
function getFighterSpecialTech(who) {
    let techId = null;
    let skills = { men: 10, kote: 10, do: 10, tsuki: 8 };
    if (who === 'player') {
        if (state.customMatch && state.customMatch.player) {
            techId = state.customMatch.player.specialTechnique || 'hien_men';
            skills = state.customMatch.player.skills || skills;
        } else {
            techId = 'hien_men';
            skills = { men: 42, kote: 38, do: 36, tsuki: 32 };
        }
    } else {
        if (state.customMatch && state.customMatch.enemy) {
            techId = state.customMatch.enemy.specialTechnique;
            skills = state.customMatch.enemy.skills || skills;
        } else {
            const enemyData = getCurrentEnemy();
            techId = enemyData.specialTechnique || 'hien_men';
            skills = enemyData.skills || skills;
        }
    }
    const tech = SPECIAL_TECHNIQUES[techId] || SPECIAL_TECHNIQUES.hien_men;
    const isUnlocked = isSpecialTechUnlocked(tech, skills);
    return { tech, isUnlocked, skills };
}

function isSpecialTechUnlocked(tech, skills) {
    if (!tech || !skills) return false;
    const currentVal = skills[tech.reqStat] || 0;
    return currentVal >= tech.reqVal;
}

// 選手カード用ミニレーダーチャート（4打突技術: 面・小手・胴・突き + 基礎能力: 腕・敏・気）
function generateFighterRadarSvg(who, activeAction = null, isAdv = false) {
    const isPlayer = who === 'player';
    const stats = getFighterStats(who);
    const skills = (stats && stats.skills) || { men: 10, kote: 10, do: 10, tsuki: 8 };
    const width = 160;
    const height = 112;
    const cx = 80;
    const cy = 54;
    const r = 32; // 基準最大目盛り（50）の半径

    // 4打突理合サイクル軸: 面(上), 小手(右), 胴(下), 突き(左)
    // 時計回りに: 面 ＞ 小手 ＞ 胴 ＞ 突き ＞ 面
    const axes = [
        { key: 'men', label: '面', fullLabel: '面', val: skills.men || 10, angle: -Math.PI / 2 },
        { key: 'kote', label: '小', fullLabel: '小手', val: skills.kote || 10, angle: 0 },
        { key: 'do', label: '胴', fullLabel: '胴', val: skills.do || 10, angle: Math.PI / 2 },
        { key: 'tsuki', label: '突', fullLabel: '突き', val: skills.tsuki || 8, angle: Math.PI },
    ];

    // 目盛りグリッド (15, 30, 50)
    const gridTicks = [
        { val: 15, ratio: 15 / 50, stroke: 'rgba(148, 163, 184, 0.2)', strokeWidth: 1 },
        { val: 30, ratio: 30 / 50, stroke: 'rgba(148, 163, 184, 0.28)', strokeWidth: 1 },
        { val: 50, ratio: 1.0, stroke: isPlayer ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.6)', strokeWidth: 1.4 },
    ];

    let gridSvg = '';
    gridTicks.forEach((tick) => {
        const pts = axes.map((a) => {
            const x = cx + Math.cos(a.angle) * r * tick.ratio;
            const y = cy + Math.sin(a.angle) * r * tick.ratio;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });
        gridSvg += `<polygon points="${pts.join(' ')}" fill="none" stroke="${tick.stroke}" stroke-width="${tick.strokeWidth}" />\n`;
    });

    // 軸線
    let axesSvg = '';
    axes.forEach((a) => {
        const x = cx + Math.cos(a.angle) * (r * 1.08);
        const y = cy + Math.sin(a.angle) * (r * 1.08);
        axesSvg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(148, 163, 184, 0.25)" stroke-width="1" />\n`;
    });

    // データポリゴン
    const dataPts = axes.map((a) => {
        const ratio = Math.max(0.12, a.val / 50);
        const x = cx + Math.cos(a.angle) * r * ratio;
        const y = cy + Math.sin(a.angle) * r * ratio;
        return { ...a, x, y, ratio };
    });
    const polyStr = dataPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    const fillColor = isPlayer ? 'rgba(245, 158, 11, 0.38)' : 'rgba(56, 189, 248, 0.35)';
    const strokeColor = isPlayer ? '#f59e0b' : '#38bdf8';

    // ドット
    let dotsSvg = '';
    dataPts.forEach((p) => {
        const isActive = activeAction && (p.fullLabel === activeAction || p.label === activeAction);
        if (isActive) {
            const glowColor = isAdv ? '#4ade80' : (isPlayer ? '#fde047' : '#38bdf8');
            dotsSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="none" stroke="${glowColor}" stroke-width="2.2" class="radar-active-point" />\n`;
            dotsSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.6" fill="${glowColor}" />\n`;
        } else {
            const dotColor = isPlayer ? '#fde047' : '#7dd3fc';
            dotsSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.8" fill="${dotColor}" />\n`;
        }
    });

    // ラベルと数値
    let labelsSvg = '';
    dataPts.forEach((p, i) => {
        const isActive = activeAction && (p.fullLabel === activeAction || p.label === activeAction);
        let lx = p.x;
        let ly = p.y;
        let anchor = 'middle';
        let baseline = 'central';

        if (i === 0) { // 上 (面)
            ly = cy - Math.max(r + 14, r * p.ratio + 9);
            baseline = 'auto';
        } else if (i === 1) { // 右 (小手)
            lx = cx + Math.max(r + 15, r * p.ratio + 9);
            anchor = 'start';
        } else if (i === 2) { // 下 (胴)
            ly = cy + Math.max(r + 14, r * p.ratio + 11);
            baseline = 'hanging';
        } else if (i === 3) { // 左 (突き)
            lx = cx - Math.max(r + 15, r * p.ratio + 9);
            anchor = 'end';
        }

        let labelColor = isPlayer ? '#fef08a' : '#cbd5e1';
        let valColor = isPlayer ? '#fde047' : '#38bdf8';
        let advText = '';
        if (isActive) {
            labelColor = isAdv ? '#86efac' : '#ffffff';
            valColor = isAdv ? '#4ade80' : '#facc15';
            if (isAdv) advText = '<tspan font-size="9" font-weight="900" fill="#4ade80">有利</tspan>';
        }

        labelsSvg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="${baseline}" font-size="10.5" font-weight="800" fill="${labelColor}">${p.label}${advText}<tspan font-size="10" font-weight="900" fill="${valColor}"> ${p.val}</tspan></text>\n`;
    });

    const svg = `
        <svg class="fighter-radar-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${who}の打突パラメータ">
            <g class="radar-grid">${gridSvg}</g>
            <g class="radar-axes">${axesSvg}</g>
            <polygon points="${polyStr}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.8" stroke-linejoin="round" />
            <g class="radar-dots">${dotsSvg}</g>
            <g class="radar-labels">${labelsSvg}</g>
        </svg>
        <div class="fighter-mini-stats">
            <span>腕 <span class="stat-val">${stats.str || 10}</span></span>
            <span>敏 <span class="stat-val">${stats.agi || 10}</span></span>
            <span>気 <span class="stat-val">${stats.spi || 10}</span></span>
        </div>
    `;
    return svg;
}

// 気力（SPI）に応じた最大気合ゲージ値（気力50未満:3、50代:4、60代:5、70代:6、80代:7、90以上:8）
function getFighterMaxKiai(who) {
    const stats = getFighterStats(who);
    const spi = (stats && stats.spi) ? stats.spi : 10;
    if (spi < 50) return 3;
    return Math.min(8, 3 + Math.floor((spi - 40) / 10));
}

// 気合ゲージ（0〜8）連動パッシブバフ（技量連動スケーリング対応）
function getKiaiBuff(who, kiaiLevel, skillVal = 0) {
    const k = Math.max(0, Math.min(8, Number(kiaiLevel) || 0));
    const sv = Math.max(0, Number(skillVal) || 0);

    if (k === 0) {
        return {
            level: 0,
            scoreBonus: 0,
            ratio: 0,
            minBonus: 0,
            dmgBonus: 0,
            dmgReduction: 0,
            unshakable: false,
            critRate: 0,
            label: '平常心',
        };
    }
    if (k === 1) {
        // 気迫充実: 技パラメータの 10%（最低保証 +5）
        const bonus = sv > 0 ? Math.max(5, Math.round(sv * 0.10)) : 5;
        return {
            level: 1,
            scoreBonus: bonus,
            ratio: 0.10,
            minBonus: 5,
            dmgBonus: 0,
            dmgReduction: 0,
            unshakable: false,
            critRate: 0.18,
            label: '⚡ 気迫充実',
        };
    }
    if (k === 2) {
        // 気位高揚: 技パラメータの 20%（最低保証 +10）
        const bonus = sv > 0 ? Math.max(10, Math.round(sv * 0.20)) : 10;
        return {
            level: 2,
            scoreBonus: bonus,
            ratio: 0.20,
            minBonus: 10,
            dmgBonus: 1,
            dmgReduction: 1,
            unshakable: false,
            critRate: 0.35,
            label: '🔥 気位高揚',
        };
    }
    if (k === 3) {
        // 気合最高潮: 技パラメータの 35%（最低保証 +18）
        const bonus = sv > 0 ? Math.max(18, Math.round(sv * 0.35)) : 18;
        return {
            level: 3,
            scoreBonus: bonus,
            ratio: 0.35,
            minBonus: 18,
            dmgBonus: 1,
            dmgReduction: 1,
            unshakable: true,
            critRate: 0.60,
            label: '🌟 気合最高潮',
        };
    }
    if (k === 4) {
        // 明鏡止水: 技パラメータの 42%（最低保証 +22）
        const bonus = sv > 0 ? Math.max(22, Math.round(sv * 0.42)) : 22;
        return {
            level: 4,
            scoreBonus: bonus,
            ratio: 0.42,
            minBonus: 22,
            dmgBonus: 1,
            dmgReduction: 1,
            unshakable: true,
            critRate: 0.75,
            label: '🌌 明鏡止水',
        };
    }
    if (k === 5) {
        // 天下無双: 技パラメータの 50%（最低保証 +26）
        const bonus = sv > 0 ? Math.max(26, Math.round(sv * 0.50)) : 26;
        return {
            level: 5,
            scoreBonus: bonus,
            ratio: 0.50,
            minBonus: 26,
            dmgBonus: 2,
            dmgReduction: 2,
            unshakable: true,
            critRate: 0.85,
            label: '👑 天下無双',
        };
    }
    if (k === 6) {
        // 剣禅一如: 技パラメータの 58%（最低保証 +30）
        const bonus = sv > 0 ? Math.max(30, Math.round(sv * 0.58)) : 30;
        return {
            level: 6,
            scoreBonus: bonus,
            ratio: 0.58,
            minBonus: 30,
            dmgBonus: 2,
            dmgReduction: 2,
            unshakable: true,
            critRate: 0.92,
            label: '⚡ 剣禅一如',
        };
    }
    if (k === 7) {
        // 神気覚醒: 技パラメータの 66%（最低保証 +35）
        const bonus = sv > 0 ? Math.max(35, Math.round(sv * 0.66)) : 35;
        return {
            level: 7,
            scoreBonus: bonus,
            ratio: 0.66,
            minBonus: 35,
            dmgBonus: 2,
            dmgReduction: 2,
            unshakable: true,
            critRate: 0.96,
            label: '🐉 神気覚醒',
        };
    }
    // k >= 8: 極致・剣神不動: 技パラメータの 75%（最低保証 +40）
    const bonus = sv > 0 ? Math.max(40, Math.round(sv * 0.75)) : 40;
    return {
        level: 8,
        scoreBonus: bonus,
        ratio: 0.75,
        minBonus: 40,
        dmgBonus: 3,
        dmgReduction: 3,
        unshakable: true,
        critRate: 0.99,
        label: '🌌✨ 極致・剣神不動',
    };
}

function gainKiai(who, amount) {
    let finalAmount = amount;
    const maxKiai = getFighterMaxKiai(who);
    if (who === 'player') {
        const pStats = getFighterStats('player');
        // 気魄(spi)が高いと追加気合ボーナス（spi >= 14で確率）
        if (amount > 0 && pStats.spi >= 14 && Math.random() < (pStats.spi - 10) * 0.05) {
            finalAmount += 1;
        }
        state.playerKiai = Math.min(maxKiai, state.playerKiai + finalAmount);
    } else {
        const eStats = getFighterStats('enemy');
        if (amount > 0 && eStats.spi >= 14 && Math.random() < (eStats.spi - 10) * 0.05) {
            finalAmount += 1;
        }
        state.enemyKiai = Math.min(maxKiai, state.enemyKiai + finalAmount);
    }
}

function getCombatStanceAnim(who) {
    if (state.tsubazeriai) return 'tsubazeriai';
    if (who === 'player') {
        if (state.playerGuardBroken) return 'guardBroken';
        if (state.playerStanceStyle === 'jodan') return 'jodan';
        if (state.playerStanceStyle === 'waki') return 'waki';
        if (state.playerCounterReady || state.playerKiai >= 3) return 'counterReady';
        return 'idle';
    } else {
        if (state.enemyGuardBroken) return 'guardBroken';
        if (state.enemyStanceStyle === 'jodan') return 'jodan';
        if (state.enemyStanceStyle === 'waki') return 'waki';
        if (state.enemyCounterReady || state.enemyKiai >= 3) return 'counterReady';
        return 'idle';
    }
}

function getNeutralAnim(who) {
    if (state.matchPhase === 'pre_match' || state.matchPhase === 'post_match' || state.matchPhase === 'closing_ceremony') {
        return 'sageto';
    }
    return getCombatStanceAnim(who);
}

function renderPips(container, count, maxKiai = 3) {
    if (!container) return;
    const safeMax = Math.max(1, maxKiai || 3);
    let pips = container.querySelectorAll('.kiai-pip');
    if (pips.length !== safeMax) {
        container.innerHTML = '';
        for (let i = 0; i < safeMax; i++) {
            const pip = document.createElement('span');
            pip.className = 'kiai-pip';
            container.appendChild(pip);
        }
        pips = container.querySelectorAll('.kiai-pip');
    }
    pips.forEach((pip, idx) => {
        pip.classList.toggle('filled', idx < count);
        pip.classList.toggle('max-glow', count >= safeMax);
        pip.classList.toggle('special-ready', count >= 3 && idx === 2);
    });
}

function renderCounterPips(container, count, maxStacks = 3) {
    if (!container) return;
    const safeMax = Math.max(1, maxStacks || 3);
    let pips = container.querySelectorAll('.counter-pip');
    if (pips.length !== safeMax) {
        container.innerHTML = '';
        for (let i = 0; i < safeMax; i++) {
            const pip = document.createElement('span');
            pip.className = 'counter-pip';
            container.appendChild(pip);
        }
        pips = container.querySelectorAll('.counter-pip');
    }
    pips.forEach((pip, idx) => {
        pip.classList.toggle('filled', idx < count);
        pip.classList.toggle('max-glow', count >= safeMax);
    });
}

function renderHealthPips(container, hp, maxHp) {
    if (!container) return;
    const safeMax = Math.max(1, maxHp || 5);
    const count = Math.max(0, Math.min(hp, safeMax));
    let pips = container.querySelectorAll('.health-pip');
    if (pips.length !== safeMax) {
        container.innerHTML = '';
        for (let i = 0; i < safeMax; i++) {
            const pip = document.createElement('span');
            pip.className = 'health-pip';
            container.appendChild(pip);
        }
        pips = container.querySelectorAll('.health-pip');
    }
    const isLow = count <= 2 && count > 0;
    const isCritical = count === 1;
    pips.forEach((pip, idx) => {
        const isFilled = idx < count;
        pip.classList.toggle('filled', isFilled);
        pip.classList.toggle('low', isFilled && isLow);
        pip.classList.toggle('critical', isFilled && isCritical);
    });
}

function updateBadge(badgeEl, spriteBoxEl, counterReady, guardBroken, kiai, isTsubazeriai, stanceStyle = 'chudan', who = 'player') {
    if (badgeEl) badgeEl.className = 'stance-badge';
    if (spriteBoxEl) {
        spriteBoxEl.classList.remove('counter-aura', 'broken-aura', 'tsubazeriai-aura', 'jodan-aura', 'waki-aura', 'kiai-1-aura', 'kiai-2-aura', 'kiai-3-aura', 'kiai-god-aura');
    }

    if (state.matchPhase === 'pre_match') {
        if (badgeEl) badgeEl.textContent = '🎋 提げ刀';
        return;
    }
    if (state.matchPhase === 'opening_ceremony') {
        if (badgeEl) badgeEl.textContent = '🙇 礼・蹲踞';
        return;
    }
    if (state.matchPhase === 'closing_ceremony') {
        if (badgeEl) badgeEl.textContent = '🙇 蹲踞・納刀・礼';
        return;
    }
    if (state.matchPhase === 'post_match') {
        if (badgeEl) badgeEl.textContent = '🙇 礼';
        return;
    }
    if (state.gameOver) {
        if (badgeEl) badgeEl.textContent = '勝負あり！';
        return;
    }

    // 気合闘気オーラの付与（1: 白光、2: 蒼炎、3〜4: 黄金怒涛、5以上: 神気虹彩）
    if (spriteBoxEl) {
        if (kiai === 1) {
            spriteBoxEl.classList.add('kiai-1-aura');
        } else if (kiai === 2) {
            spriteBoxEl.classList.add('kiai-2-aura');
        } else if (kiai >= 5) {
            spriteBoxEl.classList.add('kiai-god-aura');
        } else if (kiai >= 3) {
            spriteBoxEl.classList.add('kiai-3-aura');
        }
    }

    const kiaiBuff = getKiaiBuff(who, kiai);
    const kiaiSuffix = kiai > 0 ? ` (${kiaiBuff.label})` : '';

    if (isTsubazeriai && !state.gameOver) {
        if (badgeEl) {
            badgeEl.textContent = '💥 鍔迫り合い' + (kiai >= 2 ? `・${kiaiBuff.label}` : '');
            badgeEl.classList.add('tsubazeriai');
        }
        if (spriteBoxEl) spriteBoxEl.classList.add('tsubazeriai-aura');
    } else if (guardBroken) {
        if (badgeEl) {
            badgeEl.textContent = '💫 体勢崩壊（行動不能）';
            badgeEl.classList.add('broken');
        }
        if (spriteBoxEl) spriteBoxEl.classList.add('broken-aura');
    } else if (counterReady) {
        const stacks = who === 'player' ? (state.playerCounterStacks || 1) : (state.enemyCounterStacks || 1);
        const stackLabel = stacks >= 3 ? '⚡ 見切り極致' : `⚡ 見切りLv${stacks}`;
        if (badgeEl) {
            if (stanceStyle === 'jodan') {
                badgeEl.textContent = '🔥 上段・' + stackLabel;
            } else if (stanceStyle === 'waki') {
                badgeEl.textContent = '🌊 下段・' + stackLabel;
            } else {
                badgeEl.textContent = stackLabel;
            }
            badgeEl.classList.add('counter');
        }
        if (spriteBoxEl) {
            if (stanceStyle === 'jodan') {
                spriteBoxEl.classList.add('jodan-aura');
            } else if (stanceStyle === 'waki') {
                spriteBoxEl.classList.add('waki-aura');
            } else {
                spriteBoxEl.classList.add('counter-aura');
            }
        }
    } else if (kiai >= 3) {
        if (badgeEl) {
            if (stanceStyle === 'jodan') {
                badgeEl.textContent = `🔥 上段・${kiaiBuff.label}`;
            } else if (stanceStyle === 'waki') {
                badgeEl.textContent = `🌊 下段・${kiaiBuff.label}`;
            } else {
                badgeEl.textContent = kiaiBuff.label;
            }
            badgeEl.classList.add('max-kiai');
        }
        if (spriteBoxEl && stanceStyle === 'jodan') {
            spriteBoxEl.classList.add('jodan-aura');
        } else if (spriteBoxEl && stanceStyle === 'waki') {
            spriteBoxEl.classList.add('waki-aura');
        }
    } else if (stanceStyle === 'jodan') {
        if (badgeEl) {
            badgeEl.textContent = '🔥 上段の構え' + kiaiSuffix;
            badgeEl.classList.add('jodan');
        }
        if (spriteBoxEl) spriteBoxEl.classList.add('jodan-aura');
    } else if (stanceStyle === 'waki') {
        if (badgeEl) {
            badgeEl.textContent = '🌊 下段の構え' + kiaiSuffix;
            badgeEl.classList.add('waki');
        }
        if (spriteBoxEl) spriteBoxEl.classList.add('waki-aura');
    } else {
        if (badgeEl) badgeEl.textContent = (kiai > 0 ? kiaiBuff.label : '中段の構え');
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
            stanceDescText.textContent = '🌊 下段の構え：「防御」成功で体力+1回復！相手の「崩し」を「胴（抜き胴）」で迎撃時2ダメ！※通常の面は気合+0';
        } else {
            stanceDescText.textContent = '⚖️ 中段の構え：攻守バランスの取れた王道の構え（全コマンド使用可・「防御」成功で体力+1回復）';
        }
    }
}

function selectStanceStyle(style) {
    if (style !== 'chudan' && style !== 'jodan' && style !== 'waki') return;
    if (state.customMatch && state.customMatch.isSpectating) return;
    if (state.gameOver) return;
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
            spawnFloatingPopup('player', '🌊 下段の構え！', 'popup-heal');
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

// 選手カード内から学校名および両選手共通の文言（決勝戦・準決勝・同門対決等）、
// さらに「代表剣士」「代表選手」「高校剣士」を除去するヘルパー
function cleanFighterSubtitle(text, schoolName) {
    if (!text) return '';
    let res = text.replace(/[（\(][^）\)]*の試合[）\)]/g, '').trim();
    if (schoolName) {
        res = res.split(schoolName).join('');
    }
    // 両選手共通の文言（枠外に表示するため選手カード内からは除去）
    res = res
        .replace(/[（\(]\s*同門対決\s*[）\)]/g, '')
        .replace(/同門対決/g, '')
        .replace(/(?:1回戦|2回戦|3回戦|4回戦|準々決勝|準決勝|決勝戦|個人戦)/g, '')
        // 代表剣士・代表選手・高校剣士の除去
        .replace(/(?:代表剣士|代表選手|高校剣士)/g, '')
        .replace(/^[・\s]+|[・\s]+$/g, '')
        .trim();
    return res;
}

// 選手カードの肩書き・構え表示（文字数が多い場合にフォントサイズを自動縮小して全体を表示）
function setFighterSubtitleText(elem, text) {
    if (!elem) return;
    const str = (text || '').trim();
    elem.textContent = str;
    elem.title = str;
    if (!str) {
        elem.style.display = 'none';
        return;
    }
    elem.style.display = 'block';

    const len = str.length;
    if (len >= 22) {
        elem.style.fontSize = '0.50rem';
        elem.style.letterSpacing = '-0.03em';
    } else if (len >= 18) {
        elem.style.fontSize = '0.53rem';
        elem.style.letterSpacing = '-0.025em';
    } else if (len >= 14) {
        elem.style.fontSize = '0.60rem';
        elem.style.letterSpacing = '-0.01em';
    } else if (len >= 11) {
        elem.style.fontSize = '0.66rem';
        elem.style.letterSpacing = 'normal';
    } else {
        elem.style.fontSize = '0.72rem';
        elem.style.letterSpacing = 'normal';
    }
}

let lastRenderedPlayerPhotoKey = null;
let lastRenderedEnemyPhotoKey = null;

function updateFighterCardPhotos(isCustomMatch, enemyData) {
    const playerPhotoWrap = document.getElementById('playerCardPhotoWrap');
    const enemyPhotoWrap = document.getElementById('enemyCardPhotoWrap');
    if (!window.FaceGenerator) return;

    // ── プレイヤー（自校・挑戦者）側 ──
    if (playerPhotoWrap) {
        if (isCustomMatch && state.customMatch && state.customMatch.player) {
            const pData = state.customMatch.player;
            // 本物部員オブジェクトの逆引き・同期
            let realPlayer = null;
            if (window.ClubState && Array.isArray(window.ClubState.members)) {
                realPlayer = window.ClubState.members.find(m => (pData.id && m.id === pData.id) || m.name === pData.name || (m.isPlayer && pData.name === 'あなた'));
            }
            if (realPlayer && realPlayer.face && !pData.face) {
                pData.face = realPlayer.face;
            }
            const faceToRender = pData.face || (realPlayer && realPlayer.face) || null;
            const targetMemberObj = realPlayer || pData;

            const pKey = `custom_${targetMemberObj.id || targetMemberObj.name}_${faceToRender?.seed || ''}`;
            if (pKey !== lastRenderedPlayerPhotoKey || !playerPhotoWrap.hasChildNodes()) {
                lastRenderedPlayerPhotoKey = pKey;
                const pClickAttr = `onclick="window.FaceGenerator && window.FaceGenerator.showHandbookModal(window.ClubState && window.ClubState.members ? window.ClubState.members.find(m => m.id === '${targetMemberObj.id}') || state.customMatch.player : state.customMatch.player)" style="cursor: pointer;"`;
                const pTitle = `${targetMemberObj.name || '選手'}の生徒手帳写真（クリックで詳細）`;
                const pSvg = faceToRender
                    ? window.FaceGenerator.renderSvg(faceToRender, 48, 64, { withFrame: true, schoolName: targetMemberObj.schoolName || '' })
                    : window.FaceGenerator.getMemberFaceSvg(targetMemberObj, 48, 64, { withFrame: true, schoolName: targetMemberObj.schoolName || '' });
                playerPhotoWrap.innerHTML = `
                    <div class="student-photo-frame" ${pClickAttr} title="${pTitle}">
                        ${pSvg}
                    </div>
                `;
            }
        } else {
            const pKey = 'classic_challenger';
            if (pKey !== lastRenderedPlayerPhotoKey || !playerPhotoWrap.hasChildNodes()) {
                lastRenderedPlayerPhotoKey = pKey;
                const classicPlayerFace = {
                    seed: 'classic_challenger',
                    skinId: 'healthy',
                    skin: { id: 'healthy', name: '健康的', base: '#f1c39e', shadow: '#d69e77', blush: '#de8a81' },
                    hairColorId: 'black',
                    hairColor: { id: 'black', main: '#121417', highlight: '#2a3138' },
                    eyeColor: '#1a1918',
                    hairStyle: 'short_sporty',
                    faceShape: 0,
                    eyeType: 0,
                    eyebrowType: 1,
                    mouthType: 2,
                    noseType: 0,
                    uniformType: 'dougi_white',
                    accessory: 'none',
                    bgStyleId: 'blue_grad',
                    bgStyle: { id: 'blue_grad', top: '#6ba5e7', bottom: '#3768b5' }
                };
                playerPhotoWrap.innerHTML = `
                    <div class="student-photo-frame" title="挑戦者（あなた）の選手証写真">
                        ${window.FaceGenerator.renderSvg(classicPlayerFace, 48, 64, { withFrame: true, stampText: '挑戦証' })}
                    </div>
                `;
            }
        }
    }

    // ── 対戦相手（相手校・五人掛け）側 ──
    if (enemyPhotoWrap) {
        if (isCustomMatch && state.customMatch && state.customMatch.enemy) {
            const eData = state.customMatch.enemy;
            const isIntraOrSpecial = state.customMatch.isIntraClub || state.customMatch.isSpecialPractice;

            // 部内戦・特訓時の本物部員オブジェクトの逆引き・同期
            let realEnemyMember = null;
            if (isIntraOrSpecial && window.ClubState && Array.isArray(window.ClubState.members)) {
                const cleanId = (eData.id || '').replace(/^practice_/, '');
                const cleanName = eData.shortName || (eData.name && eData.name.includes('・') ? eData.name.split('・')[1] : eData.name);
                realEnemyMember = window.ClubState.members.find(m => (cleanId && m.id === cleanId) || m.name === cleanName || m.id === eData.id);
            }
            if (realEnemyMember && realEnemyMember.face && !eData.face) {
                eData.face = realEnemyMember.face;
            }
            const faceToRender = eData.face || (realEnemyMember && realEnemyMember.face) || null;
            const targetEnemyObj = realEnemyMember || eData;

            const eKey = `custom_${targetEnemyObj.id || targetEnemyObj.name}_${faceToRender?.seed || ''}`;
            if (eKey !== lastRenderedEnemyPhotoKey || !enemyPhotoWrap.hasChildNodes()) {
                lastRenderedEnemyPhotoKey = eKey;
                const eClickAttr = (isIntraOrSpecial && targetEnemyObj.id)
                    ? `onclick="window.FaceGenerator && window.FaceGenerator.showHandbookModal(window.ClubState && window.ClubState.members ? window.ClubState.members.find(m => m.id === '${targetEnemyObj.id}') || state.customMatch.enemy : state.customMatch.enemy)" style="cursor: pointer;"`
                    : '';
                const eTitle = `${targetEnemyObj.name || eData.shortName || '相手選手'}の生徒手帳写真`;
                const eSvg = faceToRender
                    ? window.FaceGenerator.renderSvg(faceToRender, 48, 64, { withFrame: true, schoolName: targetEnemyObj.schoolName || eData.schoolName || '' })
                    : window.FaceGenerator.getMemberFaceSvg(targetEnemyObj, 48, 64, { withFrame: true, schoolName: targetEnemyObj.schoolName || eData.schoolName || '' });
                enemyPhotoWrap.innerHTML = `
                    <div class="student-photo-frame" ${eClickAttr} title="${eTitle}">
                        ${eSvg}
                    </div>
                `;
            }
        } else if (enemyData && enemyData.face) {
            const eKey = `boss_${enemyData.id}_${state.stageIndex}`;
            if (eKey !== lastRenderedEnemyPhotoKey || !enemyPhotoWrap.hasChildNodes()) {
                lastRenderedEnemyPhotoKey = eKey;
                enemyPhotoWrap.innerHTML = `
                    <div class="student-photo-frame" title="${enemyData.name}の生徒手帳写真">
                        ${window.FaceGenerator.renderSvg(enemyData.face, 48, 64, { withFrame: true, stampText: '龍神証' })}
                    </div>
                `;
            }
        }
    }
}

function updateUI() {
    const enemyData = getCurrentEnemy();
    const pMax = getPlayerMaxHealth();
    const pHp = Math.max(0, state.playerHealth);
    const eHp = Math.max(0, state.enemyHealth);
    const eMax = state.enemyMaxHealth || enemyData.maxHealth;
    const playerPct = (pHp / pMax) * 100;
    const enemyPct = (eHp / eMax) * 100;

    const isCustomMatch = !!(state.customMatch && state.customMatch.active);

    // ── ⚔️ 選手カード枠外：両選手共通の試合情報バナー表示 ──
    if (matchStageBanner && matchStageBadge) {
        if (isCustomMatch) {
            matchStageBanner.style.display = 'inline-flex';
            const isSpecial = !!state.customMatch.isSpecialPractice;
            const isIndiv = !!state.customMatch.isIndividual;
            const isIntra = !!state.customMatch.isIntraClub;
            const roundName = (state.customMatch.roundName || '').replace(/[（\(]\s*同門対決\s*[）\)]/g, '').trim();
            const posName = (state.customMatch.boutPosName || '').replace(/[（\(]\s*同門対決\s*[）\)]/g, '').trim();

            let stageText = '';
            if (isSpecial) {
                stageText = '🥋 マンツーマン指名特訓';
            } else if (isIndiv) {
                // 個人戦: 「🏆 決勝戦」「⚔️ 準決勝」など
                const roundClean = roundName || posName || '個人戦';
                const icon = roundClean.includes('決勝') ? '🏆' : '⚔️';
                stageText = `${icon} ${roundClean}`;
            } else {
                // 団体戦: 「🏆 地区予選 決勝戦・大将戦」など
                const icon = (roundName.includes('決勝') || posName.includes('大将')) ? '🏆' : '⚔️';
                if (roundName && posName) {
                    stageText = `${icon} ${roundName}・${posName}戦`;
                } else if (posName) {
                    stageText = `${icon} ${posName}戦`;
                } else {
                    stageText = `${icon} 団体戦`;
                }
            }
            matchStageBadge.textContent = stageText;

            if (matchIntraBadge) {
                if (isSpecial) {
                    matchIntraBadge.style.display = 'inline-block';
                    matchIntraBadge.textContent = '🤝 部内実戦稽古';
                } else {
                    matchIntraBadge.style.display = isIntra ? 'inline-block' : 'none';
                    matchIntraBadge.textContent = '🔥 同門対決';
                }
            }
        } else {
            // 五人掛け（クラシック）モード
            matchStageBanner.style.display = 'inline-flex';
            const curEnemy = getCurrentEnemy();
            const isBoss = state.stageIndex === 4;
            const icon = isBoss ? '🏆' : '⚔️';
            matchStageBadge.textContent = `${icon} 五人掛け・${curEnemy.role}戦`;
            if (matchIntraBadge) {
                matchIntraBadge.style.display = 'none';
            }
        }
    }

    // ── プレイヤー側 ──
    if (isCustomMatch && state.customMatch.player) {
        const pData = state.customMatch.player;
        const pSchool = pData.schoolName
            || (window.KendoClub && window.KendoClub.getState && window.KendoClub.getState().schoolName)
            || '';
        const pPref = pData.prefecture
            || (window.KendoClub && window.KendoClub.getState && window.KendoClub.getState().prefecture)
            || '';
        let pSchoolLabel = pSchool;
        if (pSchool && pPref && !pSchool.includes(pPref)) {
            pSchoolLabel = `${pSchool}（${pPref}）`;
        }
        if (playerSchoolText) {
            playerSchoolText.textContent = pSchoolLabel;
            playerSchoolText.title = pSchoolLabel;
            playerSchoolText.style.display = pSchoolLabel ? 'block' : 'none';
        }
        if (playerNameText) {
            playerNameText.textContent = pData.name || 'あなた';
        }
        const pGrade = pData.grade || (pData.roleTitle && pData.roleTitle.match(/([1-3])年/)?.[1]);
        if (playerGradeBadge) {
            if (pGrade) {
                playerGradeBadge.textContent = `${pGrade}年`;
                playerGradeBadge.style.display = 'inline-block';
            } else {
                playerGradeBadge.textContent = '';
                playerGradeBadge.style.display = 'none';
            }
        }
        if (playerTitleBadge) {
            let cleanTitle = cleanFighterSubtitle(pData.roleTitle || '', pSchool);
            if (pGrade && cleanTitle.startsWith(`${pGrade}年・`)) {
                cleanTitle = cleanTitle.substring(`${pGrade}年・`.length);
            }
            setFighterSubtitleText(playerTitleBadge, cleanTitle);
        }
    } else {
        if (playerSchoolText) {
            playerSchoolText.textContent = '';
            playerSchoolText.style.display = 'none';
        }
        if (playerNameText) playerNameText.textContent = 'あなた';
        if (playerGradeBadge) {
            playerGradeBadge.textContent = '';
            playerGradeBadge.style.display = 'none';
        }
        if (playerTitleBadge) {
            const pTitle = state.clearedStages.size === ENEMY_ROSTER.length
                ? '🏆 天下無双・五人掛け覇者'
                : `挑戦者（${state.clearedStages.size}/${ENEMY_ROSTER.length}人撃破）`;
            setFighterSubtitleText(playerTitleBadge, pTitle);
        }
    }

    // ── 敵側 ──
    if (isCustomMatch && state.customMatch.enemy) {
        const eData = state.customMatch.enemy;
        let eSchool = eData.schoolName || '';
        let ePref = eData.prefecture || eData.pref || '';
        let eName = eData.shortName || eData.name || '';
        // eSchool が空で eData.name に「学校名・名前」形式がある場合は分離
        if (!eSchool && eData.name && eData.name.includes('・')) {
            const parts = eData.name.split('・');
            eSchool = parts[0];
            eName = parts.slice(1).join('・');
        }
        // ePref の取得補完
        if (!ePref && window.KendoClub && window.KendoClub.getState) {
            const cs = window.KendoClub.getState();
            if (state.customMatch.isIntraClub || state.customMatch.isSpecialPractice) {
                ePref = cs.prefecture || '';
            } else if (cs.currentMatchData && cs.currentMatchData.activeBouts && cs.currentMatchData.activeBouts.pref) {
                ePref = cs.currentMatchData.activeBouts.pref;
            } else if (cs.currentMatchData && (cs.currentMatchData.type === 'district' || cs.currentMatchData.type === 'interhigh_district')) {
                ePref = cs.prefecture || '';
            }
        }
        let eSchoolLabel = eSchool;
        if (eSchool && ePref && !eSchool.includes(ePref)) {
            eSchoolLabel = `${eSchool}（${ePref}）`;
        }
        if (enemySchoolText) {
            enemySchoolText.textContent = eSchoolLabel;
            enemySchoolText.title = eSchoolLabel;
            enemySchoolText.style.display = eSchoolLabel ? 'block' : 'none';
        }
        if (enemyNameText) {
            enemyNameText.textContent = eName;
        }
        const eGrade = eData.grade || (eData.role && eData.role.match(/([1-3])年/)?.[1]);
        if (enemyGradeBadge) {
            if (eGrade) {
                enemyGradeBadge.textContent = `${eGrade}年`;
                enemyGradeBadge.style.display = 'inline-block';
            } else {
                enemyGradeBadge.textContent = '';
                enemyGradeBadge.style.display = 'none';
            }
        }
        if (enemyTitleBadge) {
            let cleanEnemyRole = cleanFighterSubtitle(eData.role || '', eSchool);
            if (eGrade && cleanEnemyRole.startsWith(`${eGrade}年・`)) {
                cleanEnemyRole = cleanEnemyRole.substring(`${eGrade}年・`.length);
            }
            const cleanRank = cleanFighterSubtitle(eData.rank || '', eSchool);
            const styleTag = eData.styleTag ? eData.styleTag.replace(/[（\(）\)]/g, '').trim() : '';

            const roleParts = [cleanEnemyRole, cleanRank].filter(Boolean);
            const roleText = roleParts.join('・');

            let subtitle = '';
            if (roleText && styleTag) {
                subtitle = `${roleText}（${styleTag}）`;
            } else if (roleText) {
                subtitle = roleText;
            } else if (styleTag) {
                subtitle = styleTag;
            }

            setFighterSubtitleText(enemyTitleBadge, subtitle);
        }
    } else {
        if (enemySchoolText) {
            enemySchoolText.textContent = '';
            enemySchoolText.style.display = 'none';
        }
        if (enemyNameText) enemyNameText.textContent = enemyData.name;
        if (enemyGradeBadge) {
            enemyGradeBadge.textContent = '';
            enemyGradeBadge.style.display = 'none';
        }
        if (enemyTitleBadge) {
            const cleanEnemyRole = (enemyData.role || '').replace(/[（\(][^）\)]*の試合[）\)]/g, '').trim();
            const cleanRank = (enemyData.rank && String(enemyData.rank).trim()) || '';
            const styleTag = enemyData.styleTag ? enemyData.styleTag.replace(/[（\(）\)]/g, '').trim() : '';
            const roleParts = [cleanEnemyRole, cleanRank].filter(Boolean);
            const roleText = roleParts.join('・');
            let subtitle = '';
            if (roleText && styleTag) {
                subtitle = `${roleText}（${styleTag}）`;
            } else if (roleText) {
                subtitle = roleText;
            } else if (styleTag) {
                subtitle = styleTag;
            }
            setFighterSubtitleText(enemyTitleBadge, subtitle);
        }
    }
    updateFighterCardPhotos(isCustomMatch, enemyData);
    updateStageBarUI();
    updateStanceBarUI();

    renderHealthPips(playerHealthPips, pHp, pMax);
    renderHealthPips(enemyHealthPips, eHp, eMax);

    // 選手カード内ミニレーダーチャートの描画
    if (playerRadarBox) playerRadarBox.innerHTML = generateFighterRadarSvg('player');
    if (enemyRadarBox) enemyRadarBox.innerHTML = generateFighterRadarSvg('enemy');

    const pMaxKiai = getFighterMaxKiai('player');
    const eMaxKiai = getFighterMaxKiai('enemy');

    playerKiaiText.textContent = `気合: ${state.playerKiai} / ${pMaxKiai}`;
    enemyKiaiText.textContent = `気合: ${state.enemyKiai} / ${eMaxKiai}`;
    renderPips(playerKiaiPips, state.playerKiai, pMaxKiai);
    renderPips(enemyKiaiPips, state.enemyKiai, eMaxKiai);

    // 見切りゲージの描画
    const pCounterStacks = state.playerCounterStacks || (state.playerCounterReady ? 1 : 0);
    const eCounterStacks = state.enemyCounterStacks || (state.enemyCounterReady ? 1 : 0);
    if (playerCounterText) playerCounterText.textContent = `見切り: ${pCounterStacks} / 3`;
    if (enemyCounterText) enemyCounterText.textContent = `見切り: ${eCounterStacks} / 3`;
    renderCounterPips(playerCounterPips, pCounterStacks, 3);
    renderCounterPips(enemyCounterPips, eCounterStacks, 3);

    updateBadge(playerBadge, playerSpriteBox, state.playerCounterReady, state.playerGuardBroken || state.playerStunned, state.playerKiai, state.tsubazeriai, state.playerStanceStyle, 'player');
    updateBadge(enemyBadge, enemySpriteBox, state.enemyCounterReady, state.enemyGuardBroken || state.enemyStunned, state.enemyKiai, state.tsubazeriai, state.enemyStanceStyle, 'enemy');

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
        btnDefend.textContent = '🛡️ 防御・気合 (崩れ中)';
    } else if (isJodan) {
        btnDefend.textContent = '🛡️ 防御・気合 (上段不可)';
    } else if (inTsuba) {
        btnDefend.textContent = isWaki ? '🌊 密着受け (HP+1)' : '🛡️ 密着受け (HP+1)';
    } else {
        btnDefend.textContent = isWaki ? '🌊 後の先防御 (HP+1)' : '🛡️ 防御・気合 (HP+1)';
    }

    if (btnTsuki) {
        btnTsuki.disabled = state.gameOver;
        btnTsuki.textContent = inTsuba ? '⚡ 引き突き' : '⚡ 突き';
        btnTsuki.classList.toggle('hiki-mode', inTsuba);
    }

    if (btnSpecial) {
        const pTechInfo = getFighterSpecialTech('player');
        const pTech = pTechInfo.tech;
        const pUnlocked = pTechInfo.isUnlocked;
        const isReadyKiai = state.playerKiai >= 3;

        btnSpecial.classList.remove('ready-unlocked', 'ready-kiai-strike', 'locked');

        if (state.gameOver) {
            btnSpecial.disabled = true;
            btnSpecial.textContent = '🔥 必殺技';
        } else if (isReadyKiai) {
            btnSpecial.disabled = false;
            if (pUnlocked) {
                btnSpecial.classList.add('ready-unlocked');
                btnSpecial.textContent = inTsuba
                    ? `🔥 必殺：${pTech.name} (奥義)`
                    : `🔥 必殺：${pTech.name} (${state.playerKiai}/${pMaxKiai})`;
            } else {
                btnSpecial.classList.add('ready-kiai-strike');
                btnSpecial.textContent = inTsuba
                    ? `💥 気合一閃 (渾身引き技) (${state.playerKiai}/${pMaxKiai})`
                    : `💥 気合一閃 (${state.playerKiai}/${pMaxKiai})`;
            }
        } else {
            btnSpecial.disabled = true;
            btnSpecial.classList.add('locked');
            if (pUnlocked) {
                btnSpecial.textContent = `🔥 ${pTech.name} (${state.playerKiai}/3)`;
            } else {
                btnSpecial.textContent = `🔒 ${pTech.name} (要: ${pTech.type}${pTech.reqVal})`;
            }
        }
    }

    // 体勢崩壊（操作スキップ）中：攻撃も防御もできなくなる
    const isPlayerStunned = (state.playerStunned || state.playerGuardBroken) && !state.gameOver;
    if (isPlayerStunned) {
        if (btnMen) { btnMen.disabled = true; btnMen.textContent = '💫 面 (崩れ中)'; }
        if (btnKote) { btnKote.disabled = true; btnKote.textContent = '💫 小手 (崩れ中)'; }
        if (btnDo) { btnDo.disabled = true; btnDo.textContent = '💫 胴 (崩れ中)'; }
        if (btnTsuki) { btnTsuki.disabled = true; btnTsuki.textContent = '💫 突き (崩れ中)'; }
        if (btnBreak) { btnBreak.disabled = true; btnBreak.textContent = '💫 崩し (崩れ中)'; }
        if (btnDefend) { btnDefend.disabled = true; btnDefend.textContent = '💫 防御・気合 (崩れ中)'; }
        if (btnSpecial) { btnSpecial.disabled = true; btnSpecial.textContent = '💫 必殺 (崩れ中)'; }
    }

    // 試合フェーズ（開始前・開始礼法中・試合中・終了礼法中・試合後）に応じたボタン表示制御
    const isPreMatch = state.matchPhase === 'pre_match';
    const isFighting = state.matchPhase === 'fighting' && !state.gameOver;
    const isPostMatch = state.matchPhase === 'post_match';

    const isCustom = state.customMatch && state.customMatch.active;
    const isSpectating = isCustom && state.customMatch.isSpectating;
    const btnReturnToClub = document.getElementById('btnReturnToClub');
    const spectatorControls = document.getElementById('spectatorControls');
    const spectatorLabel = document.getElementById('spectatorLabel');

    if (spectatorControls) {
        spectatorControls.style.display = (isSpectating && !isPostMatch) ? 'flex' : 'none';
        if (spectatorLabel && state.customMatch && state.customMatch.player && state.customMatch.enemy) {
            spectatorLabel.textContent = `👀 リアルタイム観戦中：${state.customMatch.player.name} vs ${state.customMatch.enemy.shortName || state.customMatch.enemy.name}`;
        }
    }

    if (btnStartMatch) {
        btnStartMatch.style.display = (isPreMatch && !isSpectating) ? 'inline-block' : 'none';
    }
    if (stanceSelectorWrap) {
        stanceSelectorWrap.style.display = (isFighting && !isSpectating) ? '' : 'none';
    }
    actionButtons.forEach((btn) => {
        if (btn) {
            btn.style.display = (isFighting && !isSpectating) ? '' : 'none';
        }
    });

    if (btnReturnToClub) {
        btnReturnToClub.style.display = (isPostMatch && isCustom) ? 'inline-block' : 'none';
        if (state.customMatch && state.customMatch.isSpecialPractice) {
            btnReturnToClub.textContent = '🥋 部活画面へ戻る';
        } else {
            btnReturnToClub.textContent = '🥋 大会画面へ戻る';
        }
    }

    if (btnReset) {
        btnReset.style.display = (isPostMatch && !isCustom) ? 'inline-block' : 'none';
    }

    if (btnNextStage) {
        if (isPostMatch && !isCustom && state.lastOutcome === 'victory') {
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

    // 試合中は勝敗決定後もBGMを再生継続（別画面へ画面遷移するときに停止）
}

function updateStatus(message, type = 'neutral') {
    statusText.textContent = message;
    statusText.className = `status-text ${type}`;
}

// プレイヤーが見切り状態（CounterReady / 見切りスタック保有）の時に敵が取る賢い対抗策
function getCounterAlertWeights(enemyData) {
    const id = enemyData ? enemyData.id : '';
    if (id === 'sasaki') {
        // 佐々木（三段）：下段の構え「後の先防御」で受け流して見切りを奪い返すか、鋭い「小手」で先制
        return { 防御: 52, 小手: 32, 面: 12, 胴: 4, 突き: 0, 崩し: 0 };
    } else if (id === 'onizuka') {
        // 鬼塚（四段）：相手の見切りに臆さず、上段の構え「剛腕面」で力押し競り合い勝負
        return { 面: 58, 胴: 28, 小手: 14, 防御: 0, 突き: 0, 崩し: 0 };
    } else if (id === 'kasumi') {
        // 霞（五段）：相手の面を読んで「抜き胴」を合わせるか、冷静に「防御」で無力化
        return { 防御: 46, 胴: 38, 小手: 12, 面: 4, 突き: 0, 崩し: 0 };
    } else if (id === 'ryuzen') {
        // 龍禅（八段）：絶対無謀崩しなし。完璧な防御で見切りを枯らすか、鋭い突き・胴で相性勝ち
        return { 防御: 48, 突き: 28, 胴: 16, 面: 8, 小手: 0, 崩し: 0 };
    } else {
        // 健太（初段）：基本は防御や面で対抗するが、初心者らしくたまに焦って崩しを暴発（隙あり）
        return { 面: 42, 防御: 36, 小手: 12, 崩し: 10, 胴: 0, 突き: 0 };
    }
}

// プレイヤーの行動履歴からワンパターンな戦術を解析し、見切り対策を算出
function analyzePlayerPattern(history, enemyData) {
    if (!history || history.length < 2) return null;

    const enemyStats = getFighterStats('enemy') || {};
    const spi = (enemyData && enemyData.spi) || enemyStats.spi || 10;
    const agi = (enemyData && enemyData.agi) || enemyStats.agi || 10;

    // 相手の洞察力（精神力 spi・敏捷 agi）およびランクに応じた見切り発動率
    let learnChance = 0.85;
    const spiBonus = Math.max(0, (spi - 10) * 0.025);
    const agiBonus = Math.max(0, (agi - 10) * 0.02);
    learnChance = Math.min(0.98, 0.85 + spiBonus + agiBonus);

    // クラシック5人掛けの1人目（初段・健太）でも連続ワンパターンなら75%で見切る
    if (state.stageIndex === 0 && !(state.customMatch && state.customMatch.active)) {
        learnChance = 0.75;
    }

    const n = history.length;
    const last1 = history[n - 1];
    const last2 = history[n - 2];

    // 0. プレイヤーが見切り状態（CounterReady / 見切りスタック保有）の時の警戒
    // ※ 相手が強烈な打突（威力2倍）を構えている時に無防備な崩しを振るのは自殺行為！
    // 崩しを完全封印し、「防御で受け止めて見切りスタックを浪費させる（敵が見切り獲得）」か「相性打突」を狙う
    if (state.playerCounterReady || (state.playerCounterStacks && state.playerCounterStacks > 0)) {
        if (Math.random() < learnChance) {
            const useWaki = enemyData && (enemyData.id === 'sasaki' || enemyData.id === 'kasumi');
            const useJodan = enemyData && enemyData.id === 'onizuka';
            const targetStance = useWaki ? 'waki' : (useJodan ? 'jodan' : 'chudan');
            const enemyShort = enemyData ? enemyData.shortName : '相手';
            return {
                type: 'counter_alert',
                counterMove: '防御',
                stance: targetStance,
                hint: useWaki
                    ? `🌊【下段・見切り警戒】${enemyShort}はあなたの見切り強打を警戒し、下段「後の先防御」で受け流しを狙っている！`
                    : (useJodan
                        ? `🔥【上段・剛腕勝負】${enemyShort}はあなたの見切りに臆さず、「上段面」で力押し勝負を挑んできた！`
                        : `🛡️【中段・防御警戒】${enemyShort}はあなたの見切り強打を察知し、油断なく「防御」で受け流しを狙っている！`),
                isDanger: useJodan,
                weights: getCounterAlertWeights(enemyData),
            };
        }
    }

    // 1. 下段・連続防御パターン（「防御」の乱用・下段待ち）
    // 崩しを出すのは「見切りがあるのに攻撃せず、2手連続で防御を重ねてきた守り癖」のみ！
    if (last1.action === '防御' && last2.action === '防御') {
        if (Math.random() < learnChance) {
            const enemyShort = enemyData ? enemyData.shortName : '相手';
            return {
                type: 'defend_spam',
                counterMove: '崩し',
                stance: 'chudan',
                hint: `💥【崩し警戒】${enemyShort}はあなたの守り癖を見抜き、体当たり（崩し）でこじ開けようとしている！（打突で迎撃せよ！）`,
                isDanger: true,
                weights: { 崩し: 65, 小手: 20, 面: 15, 防御: 0, 突き: 0, 胴: 0 },
            };
        }
    }

    // 2. 「面」の連打（面のワンパターン攻撃）
    const recentMen = history.slice(-3).filter((h) => h.action === '面').length;
    if (recentMen >= 2 && last1.action === '面') {
        if (Math.random() < learnChance) {
            const enemyShort = enemyData ? enemyData.shortName : '相手';
            return {
                type: 'men_spam',
                counterMove: '胴',
                stance: 'waki',
                hint: `🌊【抜き胴警戒】${enemyShort}はあなたの面の連打を見切り、下段から「抜き胴」を狙っている！（「小手」で胴を断て！）`,
                isDanger: true,
                weights: { 胴: 65, 防御: 25, 小手: 10, 面: 0, 崩し: 0, 突き: 0 },
            };
        }
    }

    // 3. 「小手」の連打（小手のワンパターン攻撃）
    const recentKote = history.slice(-3).filter((h) => h.action === '小手').length;
    if (recentKote >= 2 && last1.action === '小手') {
        if (Math.random() < learnChance) {
            const enemyShort = enemyData ? enemyData.shortName : '相手';
            return {
                type: 'kote_spam',
                counterMove: '面',
                stance: 'chudan',
                hint: `🔥【相面警戒】${enemyShort}はあなたの小手狙いを見切り、上から乗り切る鋭い「面」を狙っている！（「胴」で面を抜け！）`,
                isDanger: true,
                weights: { 面: 72, 胴: 15, 防御: 13, 小手: 0, 崩し: 0, 突き: 0 },
            };
        }
    }

    // 4. 「胴」の連打（胴のワンパターン攻撃）
    const recentDo = history.slice(-3).filter((h) => h.action === '胴').length;
    if (recentDo >= 2 && last1.action === '胴') {
        if (Math.random() < learnChance) {
            const enemyShort = enemyData ? enemyData.shortName : '相手';
            return {
                type: 'do_spam',
                counterMove: '小手',
                stance: 'chudan',
                hint: `⚡【出ばな小手警戒】${enemyShort}はあなたの胴の連打を察知し、電光石火の「小手」で手元を断つ気配！（「面」で上から叩け！）`,
                isDanger: true,
                weights: { 小手: 70, 面: 20, 防御: 10, 胴: 0, 崩し: 0, 突き: 0 },
            };
        }
    }

    // 5. 気合高揚時の必殺突き一点読み
    if (state.playerKiai >= 3) {
        const pastTsuki = history.some((h) => h.action === '突き');
        if (pastTsuki && Math.random() < learnChance) {
            const enemyShort = enemyData ? enemyData.shortName : '相手';
            return {
                type: 'tsuki_spam',
                counterMove: '突き',
                stance: 'chudan',
                hint: `⚡【先手警戒】${enemyShort}は必殺の突きを警戒し、出端の「突き」や「小手」で先手を狙っている！`,
                isDanger: true,
                weights: { 突き: 50, 小手: 30, 崩し: 20, 面: 0, 胴: 0, 防御: 0 },
            };
        }
    }

    return null;
}

// 敵AIの次ターンの気配（剣士ごとの思考傾向）を決定
function decideEnemyIntent() {
    const enemyData = getCurrentEnemy();
    const eShort = (enemyData && (enemyData.shortName || enemyData.name)) || '相手';
    if (state.matchPhase === 'pre_match') {
        intentBox.className = 'intent-box';
        intentText.textContent = '静かに間合いを測り、立ち合いの合図を待っています…';
        return;
    }
    if (state.matchPhase === 'opening_ceremony') {
        intentBox.className = 'intent-box';
        intentText.textContent = 'お互いに礼をし、竹刀を構えて蹲踞しています…';
        return;
    }
    if (state.matchPhase === 'closing_ceremony' || state.gameOver) {
        intentBox.className = 'intent-box';
        intentText.textContent = '試合終了';
        return;
    }

    let intent;
    if (state.tsubazeriai) {
        if (state.enemyKiai >= 3) {
            intent = {
                stance: 'chudan',
                hint: `💥【鍔迫り合い】⚠️ ${enemyData.shortName}の気合が充実！離れ際の「離れ突き(3ダメ)」か「引き面」が来るぞ！`,
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
    } else if (state.enemyKiai >= 3) {
        const eTechInfo = getFighterSpecialTech('enemy');
        const eTech = eTechInfo.tech;
        const eUnlocked = eTechInfo.isUnlocked;
        intent = {
            stance: 'chudan',
            hint: `⚠️ ${enemyData.shortName}の気合が最高潮！${eUnlocked ? `奥義「${eTech.name}」` : '「気合一閃」'}か強烈な「崩し」が来るぞ！（打突で先手を取るか、見極めよ！）`,
            isDanger: true,
            weights: { 必殺: 65, 崩し: 15, 面: 8, 小手: 6, 胴: 4, 突き: 2, 防御: 0 },
        };
    } else if (state.enemyCounterReady) {
        const keepStance = state.enemyStanceStyle || 'chudan';
        const isRyuzen = enemyData && enemyData.id === 'ryuzen';
        intent = {
            stance: keepStance,
            hint: keepStance === 'jodan'
                ? `🔥【上段・応じ構え】${enemyData.shortName}は上段から威力3倍の「応じ上段面」を狙っているぞ！（「胴」で面を抜け！）`
                : `🔥 ${enemyData.shortName}は「応じ技」の構え！強烈な打突（威力2倍）で一気に打ち込んでくる気配！`,
            isDanger: true,
            weights: isRyuzen
                ? { 面: 45, 胴: 35, 小手: 20, 崩し: 0, 防御: 0, 突き: 0 }
                : { 面: 42, 胴: 35, 小手: 18, 崩し: 5, 防御: 0, 突き: 0 },
        };
    } else {
        // プレイヤーの直近の行動パターンを学習・見切り
        const learnedPattern = (!state.enemyGuardBroken && !state.enemyStunned)
            ? analyzePlayerPattern(state.playerActionHistory, enemyData)
            : null;

        if (learnedPattern) {
            const targetStance = learnedPattern.stance || 'chudan';
            const matchingPattern = (enemyData.patterns && enemyData.patterns.find((p) => (p.stance || 'chudan') === targetStance))
                || (enemyData.patterns && enemyData.patterns[0]);

            intent = {
                stance: targetStance,
                hint: learnedPattern.hint || (matchingPattern ? matchingPattern.hint : `⚖️【中段の構え】${enemyData.shortName}は油断なく竹刀を構え、間合いを測っている…`),
                isDanger: (learnedPattern.isDanger !== undefined) ? learnedPattern.isDanger : (matchingPattern ? matchingPattern.isDanger : false),
                weights: { ...learnedPattern.weights },
            };
            state.enemyLearnedPattern = learnedPattern;
        } else {
            state.enemyLearnedPattern = null;
            if (state.playerCounterReady && !state.enemyGuardBroken) {
                // プレイヤーが見切り状態（CounterReady）の時は崩しを出さず、キャラクターに応じた対抗策を取る
                const useWaki = enemyData.id === 'sasaki' || enemyData.id === 'kasumi';
                const useJodan = enemyData.id === 'onizuka';
                const alertStance = useWaki ? 'waki' : (useJodan ? 'jodan' : 'chudan');
                intent = {
                    stance: alertStance,
                    hint: useWaki
                        ? `🌊【下段の構え】${enemyData.shortName}はあなたの見切り強打を警戒し、下段の構え「後の先防御」で受け流しを狙っている…`
                        : (useJodan
                            ? `🔥【上段の構え】${enemyData.shortName}はあなたの見切りに臆さず、「上段面」で力押し勝負を挑んできた！`
                            : `🛡️【中段の構え】${enemyData.shortName}はあなたの見切りを警戒し、油断なく竹刀を構え直している…`),
                    isDanger: useJodan,
                    weights: getCounterAlertWeights(enemyData),
                };
            } else if (state.playerKiai >= 3 && !state.enemyGuardBroken) {
                // プレイヤーが気合MAX（必殺技警戒）の時
                if (Math.random() < 0.65) {
                    const useWaki = enemyData.id === 'sasaki' || enemyData.id === 'kasumi' || enemyData.id === 'ryuzen';
                    intent = {
                        stance: useWaki ? 'waki' : 'chudan',
                        hint: useWaki
                            ? `🌊【下段の構え】${enemyData.shortName}は必殺技を警戒し、間合いを測っている…`
                            : `🛡️【中段の構え】${enemyData.shortName}はあなたの気迫を警戒し、出端の「小手」を狙っている…`,
                        isDanger: false,
                        weights: { 小手: 40, 面: 30, 胴: 20, 突き: 10, 防御: 0, 崩し: 0 },
                    };
                } else {
                    intent = {
                        stance: 'chudan',
                        hint: `👁️【中段の構え】${enemyData.shortName}は先手を取ろうと、出端の「小手」や「面」を狙っている…`,
                        isDanger: false,
                        weights: { 小手: 45, 面: 30, 胴: 15, 突き: 10, 防御: 0, 崩し: 0 },
                    };
                }
            } else {
                const patterns = (enemyData && Array.isArray(enemyData.patterns) && enemyData.patterns.length > 0)
                    ? enemyData.patterns
                    : [
                        {
                            stance: 'chudan',
                            hint: `⚔️【中段の構え】${eShort}は静かに構え、機を窺っている…`,
                            isDanger: false,
                            weights: { 面: 35, 小手: 30, 胴: 25, 突き: 10, 防御: 0, 崩し: 0 },
                        }
                    ];
                const picked = patterns[Math.floor(Math.random() * patterns.length)];
                intent = {
                    stance: (picked && picked.stance) || 'chudan',
                    hint: (picked && picked.hint) || `⚔️【中段の構え】${eShort}は静かに構えている…`,
                    isDanger: !!(picked && picked.isDanger),
                    weights: (picked && picked.weights) ? { ...picked.weights } : { 面: 35, 小手: 30, 胴: 25, 突き: 10, 防御: 0, 崩し: 0 },
                };
            }
        }
    }

    // 相手が体勢崩れ（操作スキップ）中の場合は一切行動できず「スキップ」のみ
    if (state.enemyStunned || state.enemyGuardBroken) {
        intent.stance = 'chudan';
        intent.weights = { スキップ: 100 };
        intent.hint = `💫 【体勢崩壊中】${eShort}は体勢を崩しており無防備！好機、一気に打ち込め！`;
        intent.isDanger = false;
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
    updateBadge(enemyBadge, enemySpriteBox, state.enemyCounterReady, state.enemyGuardBroken || state.enemyStunned, state.enemyKiai, state.tsubazeriai, state.enemyStanceStyle, 'enemy');

    if (state.round > 0 && prevEnemyStance !== state.enemyStanceStyle && !state.tsubazeriai && !state.enemyGuardBroken && !state.enemyStunned) {
        if (animators.enemy) {
            spawnDust(animators.enemy, 18, 5);
        }
        if (state.enemyStanceStyle === 'jodan') {
            spawnFloatingPopup('enemy', '🔥 上段の構え！', 'popup-counter');
        } else if (state.enemyStanceStyle === 'waki') {
            spawnFloatingPopup('enemy', '🌊 下段の構え！', 'popup-heal');
        } else {
            spawnFloatingPopup('enemy', '⚖️ 中段の構え', 'popup-block');
        }
    }

    state.enemyIntent = intent;
    intentBox.className = intent.isDanger ? 'intent-box danger' : 'intent-box';
    intentText.textContent = intent.hint;
}

function chooseEnemyAction() {
    if (enemyActionOverride !== null) {
        return typeof enemyActionOverride === 'function' ? enemyActionOverride() : enemyActionOverride;
    }
    if (!state.enemyIntent || !state.enemyIntent.weights) {
        decideEnemyIntent();
    }
    const weights = (state.enemyIntent && state.enemyIntent.weights) || { 面: 50, 小手: 30, 胴: 20 };
    const entries = Object.entries(weights).filter(([, w]) => w > 0);
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let r = Math.random() * total;
    for (const [act, w] of entries) {
        if (r < w) return act;
        r -= w;
    }
    return (entries.length > 0 && entries[0]) ? entries[0][0] : '面';
}

function chooseFriendlyAIAction() {
    if (state.playerStunned || state.playerGuardBroken) {
        return 'スキップ';
    }
    const pData = (state.customMatch && state.customMatch.player) || {};
    const skills = pData.skills || { men: 10, kote: 10, do: 10, tsuki: 8 };
    const pStats = getFighterStats('player');
    const inTsuba = state.tsubazeriai;
    const isJodan = state.playerStanceStyle === 'jodan';
    const isBroken = state.playerGuardBroken;
    const kiai = state.playerKiai;

    // 気合3以上時は必殺技（または気合一閃）を発動
    const specialChance = 0.75 + (pStats.spi >= 14 ? 0.15 : 0);
    if (kiai >= 3 && Math.random() < specialChance) {
        return '必殺';
    }

    let wMen = skills.men || 10;
    let wKote = skills.kote || 10;
    let wDo = skills.do || 10;
    let wTsuki = skills.tsuki || 8;
    let wDefend = isBroken || isJodan ? 0 : 8;
    let wBreak = 6;

    // 敏捷(agi)が高いほど相手の意図・狙いを見切って有利な技を選択しやすい
    const agiBonus = Math.max(0, (pStats.agi - 10) * 0.8);
    if (state.enemyIntent && state.enemyIntent.weights) {
        const eWeights = state.enemyIntent.weights;
        if (eWeights['防御'] > 30) {
            wBreak += 14 + agiBonus * 1.2;
        }
        if (eWeights['面'] > 30) {
            wDo += 8 + agiBonus; // 面に対して抜き胴
            if (!isBroken && !isJodan) wDefend += 6 + agiBonus;
        }
        if (eWeights['小手'] > 30) {
            wMen += 8 + agiBonus; // 小手に対して面
        }
        if (eWeights['突き'] > 30) {
            wDo += 8 + agiBonus; // 突きに対して抜き胴
        }
    }
    if (state.enemyStanceStyle === 'jodan') {
        wKote += 14 + agiBonus;
        wTsuki += 10 + agiBonus; // 上段への突き
        wDo += 6;
    }
    if (isJodan) {
        wMen += 16;
    }
    if (state.playerStanceStyle === 'waki') {
        if (!isBroken) wDefend += 12;
        wDo += 10;
    }
    if (inTsuba) {
        wDefend = 0;
        wBreak = Math.max(0, wBreak - 4);
        wMen += 14;
        wKote += 10;
        wDo += 10;
        wTsuki += 8;
    }

    const pool = [
        { act: '面', w: wMen },
        { act: '小手', w: wKote },
        { act: '胴', w: wDo },
        { act: '突き', w: wTsuki },
        { act: '防御', w: wDefend },
        { act: '崩し', w: wBreak },
    ].filter((item) => item.w > 0);

    const total = pool.reduce((s, item) => s + item.w, 0);
    let r = Math.random() * total;
    for (const item of pool) {
        if (r < item.w) return item.act;
        r -= item.w;
    }
    return (pool.length > 0 && pool[0]) ? pool[0].act : '面';
}

function scheduleNextSpectateTurn(delayMs = 1200) {
    if (!state.customMatch || !state.customMatch.isSpectating || state.gameOver) return;
    clearTimeout(state.customMatch.spectateTurnTimer);
    state.customMatch.spectateTurnTimer = setTimeout(() => {
        if (!state.customMatch || !state.customMatch.isSpectating || state.gameOver) return;
        if (state.matchPhase === 'pre_match') {
            startMatchCeremony();
        } else if (state.matchPhase === 'fighting') {
            const act = chooseFriendlyAIAction();
            playRound(act);
        }
    }, delayMs);
}

function schedulePlayerStunAutoSkip(delayMs = 1200) {
    if (state.gameOver) return;
    if (state.customMatch && state.customMatch.isSpectating) return;
    if (!(state.playerStunned || state.playerGuardBroken)) return;

    if (playerStunAutoTimer) {
        clearTimeout(playerStunAutoTimer);
    }
    playerStunAutoTimer = setTimeout(() => {
        playerStunAutoTimer = null;
        if (!state.gameOver && (state.playerStunned || state.playerGuardBroken)) {
            playRound('スキップ');
        }
    }, delayMs);
}

function getActionAnim(action, techType = null) {
    if (action === '面') return 'attack1';
    if (action === '小手') return 'attack2';
    if (action === '胴' || action === '突き') return 'attack3';
    if (action === '必殺') {
        if (techType === '面') return 'attack1';
        if (techType === '小手') return 'attack2';
        return 'attack3';
    }
    if (action === '防御') return 'defend';
    if (action === '崩し') return 'breakAttack';
    if (action === '気合') return 'counterReady';
    if (action === 'スキップ') return 'guardBroken';
    return 'idle';
}

// 試合開始の礼法シーケンス（提げ刀 → お互いに礼 → 竹刀を構えて蹲踞 → 「始め！」で立ち上がり戦闘開始）
function startMatchCeremony() {
    if (state.matchPhase !== 'pre_match') return;

    const isFiveManMode = !(state.customMatch && state.customMatch.active);
    const enemyData = getCurrentEnemy();

    // 勝ち抜き五人掛けモードで、まだこの試合の事前ストーリーを見ていない場合
    if (isFiveManMode && !state.preMatchStorySeen && enemyData.preMatchDialog) {
        state.preMatchStorySeen = true;
        showStoryDialogue(
            enemyData.preMatchDialog,
            enemyData.trialTitle,
            enemyData.avatarEmoji,
            () => {
                proceedOpeningCeremony();
            },
            enemyData.illustration
        );
        return;
    }

    proceedOpeningCeremony();
}

function proceedOpeningCeremony() {
    if (state.matchPhase !== 'pre_match') return;
    hideSpeechBubbles();
    ensureAudio();
    warmupVoices();
    clearPendingRoundTimers();
    hideRefereeCallout();
    hideSpecialCutin();

    animators.player.alpha = 1;
    animators.enemy.alpha = 1;
    animators.player.posX = 0;
    animators.enemy.posX = 0;

    const enemyData = getCurrentEnemy();
    state.matchPhase = 'opening_ceremony';

    // 敵の初手パターン・構えをあらかじめ決定しておく
    const patterns = (enemyData.patterns && enemyData.patterns.length > 0)
        ? enemyData.patterns
        : [{ stance: 'chudan', hint: '油断なき構え', isDanger: false, weights: { 面: 25, 小手: 25, 胴: 25, 突き: 15, 防御: 10 } }];
    const picked = patterns[Math.floor(Math.random() * patterns.length)];
    state.enemyStanceStyle = picked.stance || 'chudan';
    if (state.enemyStanceStyle === 'jodan' && picked.weights['防御'] > 0) {
        state.enemyIntent = {
            stance: state.enemyStanceStyle,
            hint: picked.hint,
            isDanger: picked.isDanger,
            weights: { ...picked.weights, 面: picked.weights['面'] + picked.weights['防御'], 防御: 0 },
        };
    } else {
        state.enemyIntent = {
            stance: state.enemyStanceStyle,
            hint: picked.hint,
            isDanger: picked.isDanger,
            weights: { ...picked.weights },
        };
    }

    updateUI();
    decideEnemyIntent();
    const isSpecial = !!(state.customMatch && state.customMatch.isSpecialPractice);
    if (isSpecial) {
        updateStatus(`【指名特訓】${enemyData.shortName}戦（礼・蹲踞）`, 'neutral');
    } else {
        updateStatus(`【${enemyData.role}戦】${enemyData.name}（礼・蹲踞）`, 'neutral');
    }

    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const playerEndSprite = getCombatStanceAnim('player');
    const enemyEndSprite = getCombatStanceAnim('enemy');
    const playerEndPose = getContinuousStancePose(playerEndSprite, (now + OPENING_TOTAL_T) * 0.0042 + animators.player.phaseOffset);
    const enemyEndPose = getContinuousStancePose(enemyEndSprite, (now + OPENING_TOTAL_T) * 0.0042 + animators.enemy.phaseOffset);

    animators.player.keyframes = buildOpeningCeremonyKeyframes({ ...animators.player.currentPose }, playerEndPose, playerEndSprite);
    animators.player.seqStartTime = now;
    animators.player.virtualElapsed = 0;
    animators.player.lastUpdateNow = now;
    animators.player.lastKeyIndex = -1;
    animators.player.impactWeight = 'normal';

    animators.enemy.keyframes = buildOpeningCeremonyKeyframes({ ...animators.enemy.currentPose }, enemyEndPose, enemyEndSprite);
    animators.enemy.seqStartTime = now;
    animators.enemy.virtualElapsed = 0;
    animators.enemy.lastUpdateNow = now;
    animators.enemy.lastKeyIndex = -1;
    animators.enemy.impactWeight = 'normal';

    state.ceremonyTimers.push(
        setTimeout(() => {
            updateStatus(`【${enemyData.role}戦】蹲踞`, 'neutral');
        }, 1280),
        setTimeout(() => {
            playSound('clash');
            playRefereeVoice('ハジメッ！');
            const isSpecial = !!(state.customMatch && state.customMatch.isSpecialPractice);
            showRefereeCallout({
                winner: null,
                mainText: '始め！',
                subText: isSpecial ? `⚔️ ${enemyData.shortName}との特訓実戦稽古 開始！` : `⚔️ ${enemyData.role}・${enemyData.shortName}戦 立ち合い開始！`,
                isCritical: false,
            });
            updateStatus('審判「始め！」 — お互いに立ち上がって立ち合い開始！', 'neutral');

            // 審判の「始め！」の号令と同時にBGM再生開始
            if (window.KendoBGM && window.KendoBGM.play) {
                window.KendoBGM.play('match');
            }
        }, 1950)
    );

    pendingRoundCallback = () => {
        clearCeremonyTimers();
        state.matchPhase = 'fighting';
        state.playerAnimState = getNeutralAnim('player');
        state.enemyAnimState = getNeutralAnim('enemy');
        setActionButtonsLocked(false);
        if (state.enemyIntent) {
            intentBox.className = state.enemyIntent.isDanger ? 'intent-box danger' : 'intent-box';
            intentText.textContent = state.enemyIntent.hint;
        } else {
            decideEnemyIntent();
        }
        updateUI();
        if (state.customMatch && state.customMatch.isSpectating) {
            updateStatus(`始め！【観戦中】${state.customMatch.player.name} vs ${enemyData.name} — 立ち合いを見届けます。`, 'neutral');
            scheduleNextSpectateTurn(1100);
        } else if (isSpecial) {
            updateStatus(`始め！【指名特訓】${enemyData.shortName}との実戦稽古開始！技を選んで打ち込め！`, 'neutral');
        } else {
            const cleanRole = (enemyData.role || '').replace(/[（\(][^）\)]*の試合[）\)]/g, '').trim();
            const cleanRank = (enemyData.rank && String(enemyData.rank).trim()) ? `（${String(enemyData.rank).trim()}）` : '';
            updateStatus(`始め！【${cleanRole}】${enemyData.name}${cleanRank}との立ち合い開始！構えと技を選んで打ち込め！`, 'neutral');
        }
    };
    pendingRoundTimer = setTimeout(() => {
        flushPendingRound();
    }, OPENING_TOTAL_T + 80);
}

// 勝敗決定後の礼法シーケンス（「勝負あり」などのメッセージが消えてから実行）
// 中段の構えに整える → 蹲踞 → 竹刀を左腰に納める（納刀） → 立ち上がる → 相互の立礼 → 提げ刀 → 負けたほうは後退して退場（五人掛けモードのみ）
function startClosingCeremony() {
    if (!state.gameOver) return;
    if (window.KendoBGM && window.KendoBGM.stop) {
        window.KendoBGM.stop();
    }
    clearCeremonyTimers();
    state.matchPhase = 'closing_ceremony';
    updateUI();
    decideEnemyIntent();

    // 負けた側が後ろに下がるアニメーションは「五人掛けモード（クラシック）」のみ実行する
    const isFiveManMode = !(state.customMatch && state.customMatch.active);
    const shouldRetreatOnLose = isFiveManMode;

    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const isPlayerLoser = state.playerHealth <= 0;
    const isEnemyLoser = state.enemyHealth <= 0;
    const playerRetreat = isPlayerLoser && shouldRetreatOnLose;
    const enemyRetreat = isEnemyLoser && shouldRetreatOnLose;

    animators.player.keyframes = buildClosingCeremonyKeyframes({ ...animators.player.currentPose }, playerRetreat);
    animators.player.seqStartTime = now;
    animators.player.virtualElapsed = 0;
    animators.player.lastUpdateNow = now;
    animators.player.lastKeyIndex = -1;
    animators.player.impactWeight = 'normal';

    animators.enemy.keyframes = buildClosingCeremonyKeyframes({ ...animators.enemy.currentPose }, enemyRetreat);
    animators.enemy.seqStartTime = now;
    animators.enemy.virtualElapsed = 0;
    animators.enemy.lastUpdateNow = now;
    animators.enemy.lastKeyIndex = -1;
    animators.enemy.impactWeight = 'normal';

    pendingClosingCallback = () => {
        clearCeremonyTimers();
        state.matchPhase = 'post_match';
        state.playerAnimState = playerRetreat ? 'exited' : 'sageto';
        state.enemyAnimState = enemyRetreat ? 'exited' : 'sageto';
        decideEnemyIntent();
        updateUI();

        if (state.customMatch && state.customMatch.active) {
            const isDraw = state.lastOutcome === 'draw' || (isPlayerLoser && isEnemyLoser);
            const winner = isDraw ? 'draw' : (isPlayerLoser ? 'enemy' : 'player');
            const winningKana = (winner === 'draw')
                ? '-'
                : (state.finalWinningKana
                    || (winner === 'player'
                        ? ((state.scoringMoves && state.scoringMoves.player && state.scoringMoves.player.length)
                            ? state.scoringMoves.player[state.scoringMoves.player.length - 1]
                            : 'メ')
                        : ((state.scoringMoves && state.scoringMoves.enemy && state.scoringMoves.enemy.length)
                            ? state.scoringMoves.enemy[state.scoringMoves.enemy.length - 1]
                            : 'メ')));
            const rawWinningMove = (winner === 'draw')
                ? '相打ち'
                : (state.finalWinningMove || state.lastWinningMove || (winningKana === 'コ' ? '小手' : (winningKana === 'ド' ? '胴' : (winningKana === 'ツ' ? '突き' : '面'))));
            const winningMove = (winner === 'draw') ? '相打ち' : getBaseMoveName(rawWinningMove, winningKana);

            const resultData = {
                winner: winner,
                playerHp: state.playerHealth,
                enemyHp: state.enemyHealth,
                rounds: state.round,
                myScore: winner === 'player' ? [winningKana] : [],
                enemyScore: winner === 'enemy' ? [winningKana] : [],
                winningMove: winningMove,
                winningKana: winningKana,
                boutStats: state.boutStats ? { ...state.boutStats, winningMove: (winner === 'draw' ? null : winningMove) } : {
                    playerHits: winner === 'player' ? 1 : 0,
                    playerBlocks: 0,
                    enemyHits: winner === 'enemy' ? 1 : 0,
                    enemyBlocks: 0,
                    rounds: state.round,
                    pushWins: 0,
                    winningMove: (winner === 'draw' ? null : winningMove),
                },
            };
            if (typeof state.customMatch.onComplete === 'function') {
                const cb = state.customMatch.onComplete;
                setTimeout(() => {
                    if (state.customMatch && state.customMatch.active) {
                        state.customMatch.active = false;
                        cb(resultData);
                    }
                }, 1500);
            }
        } else {
            // 勝ち抜き五人掛けモード（クラシック）の勝敗決着時
            const enemyData = getCurrentEnemy();
            const isVictory = state.lastOutcome === 'victory';
            const postQuote = isVictory
                ? (enemyData.postMatchDialog ? enemyData.postMatchDialog.victory : null)
                : (enemyData.postMatchDialog ? enemyData.postMatchDialog.defeat : null);

            if (postQuote) {
                const dialogItem = [{
                    speaker: 'enemy',
                    name: enemyData.name,
                    text: postQuote,
                }];
                setTimeout(() => {
                    showStoryDialogue(
                        dialogItem,
                        isVictory ? `勝負あり（${enemyData.shortName}戦）` : `一本取られ（${enemyData.shortName}戦）`,
                        enemyData.avatarEmoji,
                        () => {
                            // 龍禅（大将）を撃破して完全制覇した場合
                            const allCleared = state.clearedStages.size === ENEMY_ROSTER.length;
                            if (isVictory && allCleared && state.stageIndex === ENEMY_ROSTER.length - 1) {
                                setTimeout(() => {
                                    showMenkyoKaidenModal();
                                }, 350);
                            }
                        },
                        enemyData.illustration
                    );
                }, 400);
            }
        }
    };
    pendingClosingTimer = setTimeout(() => {
        flushPendingRound();
    }, CLOSING_TOTAL_T + 80);
}

function playRound(playerAction) {
    if (playerAction === '防御・気合') playerAction = '防御';
    if (state.matchPhase === 'pre_match') {
        startMatchCeremony();
        return;
    }
    if (state.matchPhase === 'opening_ceremony' || state.matchPhase === 'closing_ceremony') {
        return;
    }
    hideSpeechBubbles();
    // 進行中のアニメーション結果が未反映の場合は即座に反映してから処理
    if (pendingRoundCallback || pendingClosingCallback) {
        flushPendingRound();
    }

    if (state.gameOver) {
        if (state.customMatch && state.customMatch.active) {
            window.KendoGameEngine.returnFromCombatToClub();
            return;
        }
        if (state.lastOutcome === 'victory' && state.stageIndex < ENEMY_ROSTER.length - 1) {
            advanceStage();
        } else {
            resetGame();
        }
        return;
    }

    if (playerStunAutoTimer) {
        clearTimeout(playerStunAutoTimer);
        playerStunAutoTimer = null;
    }

    const isPlayerStunnedNow = state.playerStunned || state.playerGuardBroken;
    const isEnemyStunnedNow = state.enemyStunned || state.enemyGuardBroken;

    // 体勢崩壊中は強制的にアクションがスキップされる
    if (isPlayerStunnedNow) {
        playerAction = 'スキップ';
    }

    const isJodan = state.playerStanceStyle === 'jodan';
    const isWaki = state.playerStanceStyle === 'waki';
    const eJodan = state.enemyStanceStyle === 'jodan';
    const eWaki = state.enemyStanceStyle === 'waki';

    if (playerAction === '防御' && isJodan) {
        return;
    }
    if (playerAction === '必殺' && state.playerKiai < 3) {
        return;
    }

    if (state.animResetTimer) {
        clearTimeout(state.animResetTimer);
        state.animResetTimer = null;
    }

    let enemyAction = chooseEnemyAction();
    if (isEnemyStunnedNow) {
        enemyAction = 'スキップ';
    }
    state.round += 1;

    // プレイヤーの行動履歴を記録（直近5件まで保持）
    if (!state.playerActionHistory) state.playerActionHistory = [];
    state.playerActionHistory.push({
        round: state.round,
        stance: state.playerStanceStyle,
        action: playerAction,
    });
    if (state.playerActionHistory.length > 5) {
        state.playerActionHistory.shift();
    }

    // このターン開始時点の鍔迫り合い・応じ技バフ・スタン状態を保持し、消費する
    const inTsuba = state.tsubazeriai;
    state.tsubazeriai = false;
    const pCounter = state.playerCounterReady;
    const eCounter = state.enemyCounterReady;
    const pCounterStacks = state.playerCounterStacks || (pCounter ? 1 : 0);
    const eCounterStacks = state.enemyCounterStacks || (eCounter ? 1 : 0);
    state.playerCounterReady = false;
    state.enemyCounterReady = false;
    state.playerCounterStacks = 0;
    state.enemyCounterStacks = 0;
    state.playerGuardBroken = false;
    state.enemyGuardBroken = false;
    state.playerStunned = false;
    state.enemyStunned = false;

    const prevPlayerKiai = state.playerKiai;
    const prevEnemyKiai = state.enemyKiai;

    // 気合闘気パッシブバフの取得
    const pBuff = getKiaiBuff('player', prevPlayerKiai);
    const eBuff = getKiaiBuff('enemy', prevEnemyKiai);

    // 必殺技情報の取得
    const pTechInfo = getFighterSpecialTech('player');
    const eTechInfo = getFighterSpecialTech('enemy');

    // 必殺技発動時は気合を消費（通常突きは消費しない）
    if (playerAction === '必殺') state.playerKiai = 0;
    if (enemyAction === '必殺') state.enemyKiai = 0;

    const formatMove = (act, isPlayerSide = false) => {
        if (act === 'スキップ') return '体勢崩壊（スキップ）';
        const techInfo = isPlayerSide ? pTechInfo : eTechInfo;
        if (act === '必殺') {
            return techInfo.isUnlocked ? techInfo.tech.name : '気合一閃';
        }
        const sideJodan = isPlayerSide ? isJodan : eJodan;
        const sideWaki = isPlayerSide ? isWaki : eWaki;
        const otherAct = isPlayerSide ? enemyAction : playerAction;
        if (inTsuba) {
            if (act === '面') return sideJodan ? '諸手引き面' : '引き面';
            if (act === '小手') return '引き小手';
            if (act === '胴') return '引き胴';
            if (act === '突き') return '離れ突き';
            if (act === '防御') return sideWaki ? '密着受け' : '密着ガード';
            if (act === '崩し') return '突き放し';
            return act;
        }
        if (sideJodan && act === '面') return '上段面';
        if (sideWaki && act === '胴' && otherAct === '崩し') return '抜き胴';
        if (sideWaki && act === '防御') return '後の先防御';
        if (act === '防御') return '防御・気合';
        return act;
    };
    const pMoveName = formatMove(playerAction, true);
    const eMoveName = formatMove(enemyAction, false);
    const pDisplayMove = playerAction === 'スキップ' ? '体勢崩壊' : pMoveName;
    const eDisplayMove = enemyAction === 'スキップ' ? '体勢崩壊' : eMoveName;

    const roundPrefix = `第${state.round}合${inTsuba ? '【鍔迫り合い】' : ''}`;
    let message = roundPrefix;
    let statusType = 'neutral';
    let playerAnim = getActionAnim(playerAction, pTechInfo.tech ? pTechInfo.tech.type : '面');
    let enemyAnim = getActionAnim(enemyAction, eTechInfo.tech ? eTechInfo.tech.type : '面');
    let playerOutcome = 'normal';
    let enemyOutcome = 'normal';
    let impactWeight = 'normal';
    let calloutData = null;
    let currentClashData = null;
    let impactSound = null;
    let endGameSound = null;
    const zoomTargets = [];
    const shakeTargets = [];
    let doArenaFlash = false;
    const popups = [];
    let roundPlayerBlocked = false;
    let roundEnemyBlocked = false;
    let roundPushWin = false;

    // 4打突理合サイクル: 面 ＞ 小手 ＞ 胴 ＞ 突き ＞ 面
    const attackMap = {
        面: ['小手'],
        小手: ['胴'],
        胴: ['突き'],
        突き: ['面'],
    };
    const isBasic = (act) => act === '面' || act === '小手' || act === '胴' || act === '突き';
    const pStats = getFighterStats('player');
    const eStats = getFighterStats('enemy');

    const getSkillVal = (fighterStats, act) => {
        if (!fighterStats || !fighterStats.skills) return 10;
        if (act === '面') return fighterStats.skills.men || 10;
        if (act === '小手') return fighterStats.skills.kote || 10;
        if (act === '胴') return fighterStats.skills.do || 10;
        if (act === '突き') return fighterStats.skills.tsuki || 8;
        return 10;
    };

    // 0. 体勢崩壊（操作スキップ）状態の解決判定
    if (playerAction === 'スキップ' && enemyAction === 'スキップ') {
        statusType = 'neutral';
    } else if (enemyAction === 'スキップ') {
        // 敵が体勢崩壊中で操作スキップ（プレイヤーの攻撃が無防備直撃）
        if (isBasic(playerAction) || playerAction === '必殺') {
            const isSpecial = playerAction === '必殺';
            if (isSpecial) {
                triggerSpecialCutin('player', pMoveName, pTechInfo.isUnlocked, false);
            }
            const jodanBonus = (isJodan && playerAction === '面') ? 1 : 0;
            const eJodanKoteBonus = (eJodan && (playerAction === '小手' || playerAction === '突き')) ? 1 : 0;
            const baseDmg = isSpecial
                ? (inTsuba ? 3 : (pTechInfo.isUnlocked ? (pTechInfo.tech.power || 2) : 2))
                : ((pCounter || inTsuba) ? 2 : 1) + pBuff.dmgBonus;
            const rawDmg = baseDmg + jodanBonus + eJodanKoteBonus;
            const dmg = Math.max(1, rawDmg - eBuff.dmgReduction);
            const isBoosted = dmg >= 2;
            const kiaiGain = isSpecial ? 0 : 1;

            state.enemyHealth -= dmg;
            if (kiaiGain > 0) gainKiai('player', kiaiGain);
            enemyAnim = 'hit';
            enemyOutcome = 'hit';
            impactWeight = isBoosted ? 'heavy' : 'normal';

            statusType = 'victory';
            impactSound = isBoosted ? 'special' : 'attack';
            zoomTargets.push(playerSpriteBox);
            shakeTargets.push({ el: enemySpriteBox, isHeavy: isBoosted });
            if (isBoosted) doArenaFlash = true;
            popups.push(
                { who: 'enemy', text: isBoosted ? `-${dmg} 無防備直撃！` : `-${dmg}`, styleClass: isBoosted ? 'popup-crit' : 'popup-dmg' },
                ...(kiaiGain > 0 ? [{ who: 'player', text: `+${kiaiGain} 気合`, styleClass: 'popup-kiai' }] : [])
            );
            calloutData = {
                winner: 'player',
                mainText: `${pMoveName}あり！`,
                subText: `💫 体勢崩壊への直撃 (${dmg}点)`,
                reasonBadge: '💫 崩壊直撃',
                isCritical: isBoosted,
            };
        } else if (playerAction === '崩し') {
            const canDealDmg = state.enemyHealth > 1;
            if (canDealDmg) state.enemyHealth -= 1;
            gainKiai('player', 1);
            enemyAnim = 'hit';
            enemyOutcome = 'hit';
            statusType = 'victory';
            impactSound = 'break';
            zoomTargets.push(playerSpriteBox);
            shakeTargets.push({ el: enemySpriteBox, isHeavy: false });
            popups.push(
                ...(canDealDmg ? [{ who: 'enemy', text: '-1', styleClass: 'popup-dmg' }] : [{ who: 'enemy', text: 'HP1 耐え！', styleClass: 'popup-kiai' }]),
                { who: 'player', text: '+1 気合', styleClass: 'popup-kiai' }
            );
            calloutData = {
                winner: 'player',
                mainText: `${pMoveName}成功！`,
                subText: '💥 体勢崩壊への追撃',
                reasonBadge: '💥 崩し追撃',
            };
        } else {
            statusType = 'neutral';
        }
    } else if (playerAction === 'スキップ') {
        // プレイヤーが体勢崩壊中で操作スキップ（敵の攻撃が無防備直撃）
        if (isBasic(enemyAction) || enemyAction === '必殺') {
            const isSpecial = enemyAction === '必殺';
            if (isSpecial) {
                triggerSpecialCutin('enemy', eMoveName, eTechInfo.isUnlocked, false);
            }
            const eJodanBonus = (eJodan && enemyAction === '面') ? 1 : 0;
            const jodanKotePenalty = (isJodan && (enemyAction === '小手' || enemyAction === '突き')) ? 1 : 0;
            const baseDmg = isSpecial
                ? (inTsuba ? 3 : (eTechInfo.isUnlocked ? (eTechInfo.tech.power || 2) : 2))
                : ((eCounter || inTsuba) ? 2 : 1) + eBuff.dmgBonus;
            const rawDmg = baseDmg + eJodanBonus + jodanKotePenalty;
            const dmg = Math.max(1, rawDmg - pBuff.dmgReduction);
            const isBoosted = dmg >= 2;
            const eKiaiGain = isSpecial ? 0 : 1;

            state.playerHealth -= dmg;
            if (eKiaiGain > 0) gainKiai('enemy', eKiaiGain);
            playerAnim = 'hit';
            playerOutcome = 'hit';
            impactWeight = isBoosted ? 'heavy' : 'normal';

            statusType = 'defeat';
            impactSound = 'hurt';
            zoomTargets.push(enemySpriteBox);
            shakeTargets.push({ el: playerSpriteBox, isHeavy: isBoosted });
            if (isBoosted) doArenaFlash = true;
            popups.push(
                { who: 'player', text: isBoosted ? `-${dmg} 痛恨被弾！` : `-${dmg}`, styleClass: isBoosted ? 'popup-crit' : 'popup-dmg' },
                ...(eKiaiGain > 0 ? [{ who: 'enemy', text: `+${eKiaiGain} 気合`, styleClass: 'popup-kiai' }] : [])
            );
            calloutData = {
                winner: 'enemy',
                mainText: `${eMoveName}あり！`,
                subText: `💫 体勢崩壊への被弾 (${dmg}点)`,
                reasonBadge: '💫 崩壊被弾',
                isCritical: isBoosted,
            };
        } else if (enemyAction === '崩し') {
            const canDealDmg = state.playerHealth > 1;
            if (canDealDmg) state.playerHealth -= 1;
            gainKiai('enemy', 1);
            playerAnim = 'hit';
            playerOutcome = 'hit';
            statusType = 'defeat';
            impactSound = 'break';
            zoomTargets.push(enemySpriteBox);
            shakeTargets.push({ el: playerSpriteBox, isHeavy: false });
            popups.push(
                ...(canDealDmg ? [{ who: 'player', text: '-1', styleClass: 'popup-dmg' }] : [{ who: 'player', text: 'HP1 耐え！', styleClass: 'popup-kiai' }]),
                { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
            );
            calloutData = {
                winner: 'enemy',
                mainText: `${eMoveName}被弾！`,
                subText: '💥 体勢崩壊への追撃',
                reasonBadge: '💥 崩し追撃',
            };
        } else {
            statusType = 'neutral';
        }
    }
    // 1. 必殺技（固有必殺技 / 気合一閃）の判定
    else if (playerAction === '必殺' && enemyAction === '必殺') {
        triggerSpecialCutin('both', `${pMoveName} vs ${eMoveName}`, true, true);
        const pTechPower = pTechInfo.isUnlocked ? (pTechInfo.tech.power || 2) : 2;
        const eTechPower = eTechInfo.isUnlocked ? (eTechInfo.tech.power || 2) : 2;
        state.playerHealth -= eTechPower;
        state.enemyHealth -= pTechPower;
        playerAnim = 'hit';
        enemyAnim = 'hit';
        playerOutcome = 'mutual_hit';
        enemyOutcome = 'mutual_hit';
        impactWeight = 'heavy';
        statusType = 'defeat';
        impactSound = 'special';
        shakeTargets.push({ el: playerSpriteBox, isHeavy: true }, { el: enemySpriteBox, isHeavy: true });
        doArenaFlash = true;
        popups.push(
            { who: 'player', text: `-${eTechPower} 奥義激突！`, styleClass: 'popup-crit' },
            { who: 'enemy', text: `-${pTechPower} 奥義激突！`, styleClass: 'popup-crit' }
        );
        calloutData = {
            winner: 'both',
            mainText: '奥義激突・相討ち！',
            subText: `双方 ${pMoveName} vs ${eMoveName}`,
            reasonBadge: '⚡ 奥義激突',
            isCritical: true,
        };
    } else if (playerAction === '必殺') {
        triggerSpecialCutin('player', pMoveName, pTechInfo.isUnlocked, false);
        // プレイヤーの必殺技（解放済みなら無敵貫通、未解放なら気合一閃）
        const isUnlocked = pTechInfo.isUnlocked;
        let didHit = true;
        let dmg = (inTsuba ? 3 : (isUnlocked ? (pTechInfo.tech.power || 2) : 2)) + (eJodan ? 1 : 0);

        if (!isUnlocked && enemyAction === '防御') {
            // 未解放の気合一閃 vs 防御：50%で貫通、50%で受け止められるが相手を体勢崩壊
            if (Math.random() < 0.5) {
                dmg = 1;
            } else {
                didHit = false;
                roundEnemyBlocked = true;
                state.enemyGuardBroken = true;
                state.enemyStunned = true;
            }
        }

        if (didHit) {
            state.enemyHealth -= dmg;
            enemyAnim = 'hit';
            enemyOutcome = 'hit';
            impactWeight = 'heavy';
            statusType = 'victory';
            impactSound = 'special';
            zoomTargets.push(playerSpriteBox);
            shakeTargets.push({ el: enemySpriteBox, isHeavy: true });
            doArenaFlash = true;
            popups.push({ who: 'enemy', text: `-${dmg} ${isUnlocked ? '必殺一閃！' : '気合一閃！'}`, styleClass: 'popup-crit' });
            calloutData = {
                winner: 'player',
                mainText: `${pMoveName}あり！`,
                subText: `⚡ 会心の奥義 (${dmg}点)`,
                reasonBadge: isUnlocked ? '⚡ 秘技覚醒' : '🔥 気合一閃',
                isCritical: true,
            };
        } else {
            statusType = 'neutral';
            impactSound = 'special';
            enemyOutcome = 'hit';
            zoomTargets.push(enemySpriteBox);
            popups.push(
                { who: 'enemy', text: '🛡️ ガード！', styleClass: 'popup-block' },
                { who: 'enemy', text: '💫 体勢崩壊！', styleClass: 'popup-break' }
            );
            calloutData = {
                winner: null,
                mainText: '受け止められた！',
                subText: '💥 相手は次ターン体勢崩壊！',
                reasonBadge: '🛡️ 相手防御',
            };
        }
    } else if (enemyAction === '必殺') {
        triggerSpecialCutin('enemy', eMoveName, eTechInfo.isUnlocked, false);
        const isUnlocked = eTechInfo.isUnlocked;
        let didHit = true;
        let rawDmg = (inTsuba ? 3 : (isUnlocked ? (eTechInfo.tech.power || 2) : 2)) + (isJodan ? 1 : 0);
        let dmg = Math.max(1, rawDmg - pBuff.dmgReduction);

        if (!isUnlocked && playerAction === '防御') {
            if (Math.random() < 0.5) {
                dmg = 1;
            } else {
                didHit = false;
                roundPlayerBlocked = true;
                state.playerGuardBroken = true;
                state.playerStunned = true;
            }
        }

        if (didHit) {
            state.playerHealth -= dmg;
            playerAnim = 'hit';
            playerOutcome = 'hit';
            impactWeight = 'heavy';
            statusType = 'defeat';
            impactSound = 'hurt';
            zoomTargets.push(enemySpriteBox);
            shakeTargets.push({ el: playerSpriteBox, isHeavy: true });
            doArenaFlash = true;
            popups.push({ who: 'player', text: `-${dmg} 痛恨被弾！`, styleClass: 'popup-crit' });
            calloutData = {
                winner: 'enemy',
                mainText: `${eMoveName}あり！`,
                subText: `⚡ 必殺の${eMoveName} (${dmg}点)`,
                reasonBadge: isUnlocked ? '⚠️ 相手奥義' : '⚠️ 相手気合一閃',
                isCritical: true,
            };
        } else {
            statusType = 'neutral';
            impactSound = 'hurt';
            playerOutcome = 'hit';
            zoomTargets.push(playerSpriteBox);
            popups.push(
                { who: 'player', text: '🛡️ ガード成功！', styleClass: 'popup-block' },
                { who: 'player', text: '💫 体勢崩壊！', styleClass: 'popup-break' }
            );
            calloutData = {
                winner: null,
                mainText: '受け止めた！',
                subText: '💥 衝撃で体勢崩壊！',
                reasonBadge: '🛡️ 鉄壁防御',
            };
        }
    }
    // 2. 防御・気合 vs 防御・気合（互いに間合いを測り気勢激突・双方が気合+1！）
    else if (playerAction === '防御' && enemyAction === '防御') {
        gainKiai('player', 1);
        gainKiai('enemy', 1);
        if (pCounterStacks > 0) {
            state.playerCounterStacks = pCounterStacks;
            state.playerCounterReady = true;
        }
        if (eCounterStacks > 0) {
            state.enemyCounterStacks = eCounterStacks;
            state.enemyCounterReady = true;
        }
        playerAnim = 'counterReady';
        enemyAnim = 'counterReady';
        statusType = 'neutral';
        impactSound = 'kiai';
        zoomTargets.push(playerSpriteBox, enemySpriteBox);
        popups.push(
            { who: 'player', text: '+1 気合', styleClass: 'popup-kiai' },
            { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
        );
        calloutData = {
            winner: 'both',
            mainText: '気勢激突！',
            subText: '🔥 互いに間合いを測り気迫を高め合う (+1気合)',
            reasonBadge: '🔥 気勢充実',
        };
    }
    // 3. 防御 vs 崩し（ガードブレイク / 突き放し ※気合3の不動心でスタン無効）
    else if (playerAction === '崩し' && enemyAction === '防御') {
        const pStr = pStats.str || 10;
        const eStr = eStats.str || 10;
        const breakBaseDmg = (pStr - eStr >= 4) ? 2 : 1;
        const canDealDmg = state.enemyHealth > 1;
        const actualBreakDmg = canDealDmg ? Math.min(breakBaseDmg, state.enemyHealth - 1) : 0;
        if (actualBreakDmg > 0) state.enemyHealth -= actualBreakDmg;
        gainKiai('player', 1);

        const eDidResist = eBuff.unshakable || (eStats.spi >= 14 && Math.random() < (eStats.spi - 10) * 0.06);
        if (!eDidResist) {
            state.enemyGuardBroken = true;
            state.enemyStunned = true;
            impactSound = 'attack';
        } else {
            roundEnemyBlocked = true;
            impactSound = 'block';
        }
        enemyAnim = 'hit';
        enemyOutcome = 'hit';
        statusType = 'victory';
        zoomTargets.push(playerSpriteBox);
        shakeTargets.push({ el: enemySpriteBox, isHeavy: actualBreakDmg >= 2 });
        popups.push(
            ...(actualBreakDmg > 0 ? [{ who: 'enemy', text: actualBreakDmg >= 2 ? '-2 剛腕崩し！' : '-1', styleClass: actualBreakDmg >= 2 ? 'popup-crit' : 'popup-dmg' }] : [{ who: 'enemy', text: 'HP1 耐え！', styleClass: 'popup-kiai' }]),
            ...(eDidResist ? [{ who: 'enemy', text: '⚡ 不動心耐え！', styleClass: 'popup-counter' }] : [{ who: 'enemy', text: '💫 体勢崩壊！', styleClass: 'popup-break' }]),
            { who: 'player', text: '+1 気合', styleClass: 'popup-kiai' }
        );
        calloutData = {
            winner: 'player',
            mainText: `${pMoveName}成功！`,
            subText: eDidResist ? '⚡ 相手は不動心で体勢維持' : (actualBreakDmg >= 2 ? '💥 剛腕体当たり！相手は次ターン操作スキップ！' : '💥 相手は次ターン操作スキップ！')
        };
    } else if (playerAction === '防御' && enemyAction === '崩し') {
        const pStr = pStats.str || 10;
        const eStr = eStats.str || 10;
        const breakBaseDmg = (eStr - pStr >= 4) ? 2 : 1;
        const didResist = pBuff.unshakable || (pStats.spi >= 14 && Math.random() < (pStats.spi - 10) * 0.06);
        if (didResist) {
            roundPlayerBlocked = true;
        }
        const canDealDmg = state.playerHealth > 1;
        const actualBreakDmg = canDealDmg ? Math.min(breakBaseDmg, state.playerHealth - 1) : 0;
        if (actualBreakDmg > 0) state.playerHealth -= actualBreakDmg;
        gainKiai('enemy', 1);
        if (!didResist) {
            state.playerGuardBroken = true;
            state.playerStunned = true;
            impactSound = 'hurt';
        } else {
            impactSound = 'block';
        }
        playerAnim = 'hit';
        playerOutcome = 'hit';
        statusType = 'defeat';
        zoomTargets.push(enemySpriteBox);
        shakeTargets.push({ el: playerSpriteBox, isHeavy: actualBreakDmg >= 2 });
        popups.push(
            ...(actualBreakDmg > 0 ? [{ who: 'player', text: actualBreakDmg >= 2 ? '-2 剛腕崩し！' : '-1', styleClass: actualBreakDmg >= 2 ? 'popup-crit' : 'popup-dmg' }] : [{ who: 'player', text: 'HP1 耐え！', styleClass: 'popup-kiai' }]),
            ...(didResist ? [{ who: 'player', text: '⚡ 不動心耐え！', styleClass: 'popup-counter' }] : [{ who: 'player', text: '💫 体勢崩壊！', styleClass: 'popup-break' }]),
            { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
        );
        calloutData = {
            winner: 'enemy',
            mainText: `${eMoveName}被弾！`,
            subText: didResist ? '⚡ 不動心で体勢を維持した' : (actualBreakDmg >= 2 ? '💥 相手の剛腕体当たり！次ターン操作不能！' : '💥 体勢を崩された！次ターン操作スキップ！')
        };
    }
    // 4. 防御 vs 基本打突（応じ技準備！ 防御側は気合不変、見切りスタック蓄積で次打成功率UP！ 攻撃側は気合+1！ 中段・下段ともに防御成功でHP+1回復）
    else if (playerAction === '防御' && isBasic(enemyAction)) {
        roundPlayerBlocked = true;
        let healed = 0;
        const pMaxHealth = getPlayerMaxHealth();
        if (state.playerHealth < pMaxHealth) {
            state.playerHealth = Math.min(pMaxHealth, state.playerHealth + 1);
            healed = 1;
        }
        const newStacks = Math.min(3, pCounterStacks + 1);
        state.playerCounterStacks = newStacks;
        state.playerCounterReady = true;

        // 攻撃側（敵）に気合+1を付与
        gainKiai('enemy', 1);

        playerOutcome = 'block_success';
        statusType = 'victory';
        impactSound = 'block';
        zoomTargets.push(playerSpriteBox);
        popups.push(
            { who: 'player', text: '🛡️ ガード成功！', styleClass: 'popup-block' },
            ...(healed ? [{ who: 'player', text: '💚 HP+1回復！', styleClass: 'popup-heal' }] : []),
            { who: 'player', text: newStacks >= 3 ? '⚡ 見切り極致！' : `⚡ 見切りLv${newStacks}！`, styleClass: 'popup-counter' },
            { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
        );
        const stackLabel = newStacks >= 3 ? '⚡ 見切り極致 (2倍)' : `⚡ 見切りLv${newStacks} (2倍)`;
        calloutData = {
            winner: null,
            mainText: isWaki ? '🌊 後の先！' : '見事な受け！',
            subText: healed ? `💚 HP+1 ＆ ${stackLabel}` : stackLabel,
            isGuard: true,
        };
    } else if (isBasic(playerAction) && enemyAction === '防御') {
        roundEnemyBlocked = true;
        let eHealed = 0;
        const eMax = state.enemyMaxHealth || getCurrentEnemy().maxHealth;
        if (state.enemyHealth < eMax) {
            state.enemyHealth = Math.min(eMax, state.enemyHealth + 1);
            eHealed = 1;
        }
        const newEStacks = Math.min(3, eCounterStacks + 1);
        state.enemyCounterStacks = newEStacks;
        state.enemyCounterReady = true;

        // 攻撃側（プレイヤー）に気合+1を付与
        gainKiai('player', 1);

        enemyOutcome = 'block_success';
        statusType = 'neutral';
        impactSound = 'block';
        zoomTargets.push(enemySpriteBox);
        popups.push(
            { who: 'enemy', text: '🛡️ ガード成功！', styleClass: 'popup-block' },
            ...(eHealed ? [{ who: 'enemy', text: '💚 HP+1回復！', styleClass: 'popup-heal' }] : []),
            { who: 'enemy', text: newEStacks >= 3 ? '⚡ 見切り極致！' : `⚡ 見切りLv${newEStacks}！`, styleClass: 'popup-counter' },
            { who: 'player', text: '+1 気合', styleClass: 'popup-kiai' }
        );
        const eStackLabel = newEStacks >= 3 ? '⚠️ 相手が見切り極致' : `⚠️ 相手見切りLv${newEStacks}`;
        calloutData = {
            winner: null,
            mainText: eWaki ? '🌊 受け流された！' : '受け止められた！',
            subText: eHealed ? `⚠️ 相手 HP+1＆${eStackLabel}` : eStackLabel,
            isGuard: true,
        };
    }
    // 6. 崩し vs 崩し（鍔迫り合い突入・継続）
    else if (playerAction === '崩し' && enemyAction === '崩し') {
        gainKiai('player', 1);
        gainKiai('enemy', 1);
        state.tsubazeriai = true;
        playerOutcome = 'tsubazeriai_clash';
        enemyOutcome = 'tsubazeriai_clash';
        statusType = 'neutral';
        impactSound = 'clash';
        popups.push(
            { who: 'player', text: '💥 鍔迫り合い！', styleClass: 'popup-counter' },
            { who: 'enemy', text: '💥 鍔迫り合い！', styleClass: 'popup-counter' },
            { who: 'player', text: '+1 気合', styleClass: 'popup-kiai' },
            { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
        );
        calloutData = { winner: 'both', mainText: '鍔迫り合い突入！', subText: '💥 次ターン 引き技(2ダメ)チャンス' };
    }
    // 7. 崩し vs 基本打突（打突側が迎撃 ※崩し側は気合+1されるが、相手の攻撃成功時は気合0！）
    else if (isBasic(playerAction) && enemyAction === '崩し') {
        gainKiai('enemy', 1); // 崩し使用でまず気合+1
        const isNukiDo = isWaki && playerAction === '胴' && !inTsuba;
        const jodanBonus = (isJodan && playerAction === '面') ? 1 : 0;
        const eJodanKoteBonus = (eJodan && (playerAction === '小手' || playerAction === '突き')) ? 1 : 0;
        const baseDmg = ((pCounter || inTsuba || isNukiDo) ? 2 : 1) + pBuff.dmgBonus;
        const rawDmg = baseDmg + jodanBonus + eJodanKoteBonus;
        let dmg = Math.max(1, rawDmg - eBuff.dmgReduction);

        // 相手が崩し使用時の無防備迎撃: 相手の腕力または敏捷がプレイヤーを上回っていれば確率で被ダメ-1軽減
        const pStr = pStats.str || 10;
        const pAgi = pStats.agi || 10;
        const eStr = eStats.str || 10;
        const eAgi = eStats.agi || 10;
        const strDiff = eStr - pStr;
        const agiDiff = eAgi - pAgi;
        const maxDiff = Math.max(strDiff, agiDiff);
        const dodgeChance = maxDiff > 0 ? Math.min(0.40, maxDiff * 0.01) : 0;
        const didMitigate = dodgeChance > 0 && Math.random() < dodgeChance;

        if (didMitigate) {
            dmg = Math.max(0, dmg - 1);
        }

        const isBoosted = dmg >= 2;
        const kiaiGain = (isWaki && playerAction === '面' && !inTsuba) ? 0 : 1;

        if (dmg > 0) {
            state.enemyHealth -= dmg;
            state.enemyKiai = 0; // 相手の攻撃成功により気合0にリセット！
            enemyAnim = 'hit';
            enemyOutcome = 'hit';
        } else {
            enemyAnim = 'block';
            enemyOutcome = 'block';
        }
        if (kiaiGain > 0) gainKiai('player', kiaiGain);
        impactWeight = isBoosted ? 'heavy' : 'normal';

        statusType = (dmg > 0) ? 'victory' : 'neutral';
        impactSound = (dmg > 0) ? (isBoosted ? 'special' : 'attack') : 'block';
        zoomTargets.push(playerSpriteBox);
        if (dmg > 0) shakeTargets.push({ el: enemySpriteBox, isHeavy: isBoosted });
        if (isBoosted) doArenaFlash = true;

        if (didMitigate) {
            const mitigateText = (strDiff >= agiDiff) ? '💪 剛腕受け！(-1)' : '⚡ 身のこなし！(-1)';
            popups.push({ who: 'enemy', text: mitigateText, styleClass: 'popup-counter' });
        }
        if (dmg > 0) {
            popups.push(
                { who: 'enemy', text: isBoosted ? `-${dmg} ${pMoveName}！` : `-${dmg}`, styleClass: isBoosted ? 'popup-crit' : 'popup-dmg' },
                { who: 'enemy', text: '気合 0！', styleClass: 'popup-break' }
            );
        }
        if (kiaiGain > 0) {
            popups.push({ who: 'player', text: `+${kiaiGain} 気合`, styleClass: 'popup-kiai' });
        }

        calloutData = (dmg > 0) ? {
            winner: 'player',
            mainText: `${pMoveName}あり！`,
            subText: isNukiDo
                ? `🌊 下段の構え・抜き胴 (${dmg}点)`
                : (inTsuba ? `⚡ 会心の${pMoveName} (${dmg}点)` : (isBoosted ? `🔥 豪快な${pMoveName} (${dmg}点)` : `⚔️ 出ばな${playerAction}一本`)),
            isCritical: isBoosted,
        } : {
            winner: null,
            mainText: '芯外れ！',
            subText: (strDiff >= agiDiff) ? '💪 相手は剛腕で衝撃を相殺 (0点)' : '⚡ 相手は身のこなしで芯を外した (0点)',
            reasonBadge: (strDiff >= agiDiff) ? '💪 剛腕受け' : '⚡ 身のこなし',
        };
    } else if (playerAction === '崩し' && isBasic(enemyAction)) {
        gainKiai('player', 1); // 崩し使用でまず気合+1
        const eNukiDo = eWaki && enemyAction === '胴' && !inTsuba;
        const eJodanBonus = (eJodan && enemyAction === '面') ? 1 : 0;
        const jodanKotePenalty = (isJodan && (enemyAction === '小手' || enemyAction === '突き')) ? 1 : 0;
        const baseDmg = ((eCounter || inTsuba || eNukiDo) ? 2 : 1) + eBuff.dmgBonus;
        const rawDmg = baseDmg + eJodanBonus + jodanKotePenalty;
        let dmg = Math.max(1, rawDmg - pBuff.dmgReduction);

        // プレイヤーが崩し使用時の無防備迎撃: 自身の腕力または敏捷が相手を上回っていれば確率で被ダメ-1軽減
        const pStr = pStats.str || 10;
        const pAgi = pStats.agi || 10;
        const eStr = eStats.str || 10;
        const eAgi = eStats.agi || 10;
        const strDiff = pStr - eStr;
        const agiDiff = pAgi - eAgi;
        const maxDiff = Math.max(strDiff, agiDiff);
        const dodgeChance = maxDiff > 0 ? Math.min(0.40, maxDiff * 0.01) : 0;
        const didMitigate = dodgeChance > 0 && Math.random() < dodgeChance;

        if (didMitigate) {
            dmg = Math.max(0, dmg - 1);
        }

        const isBoosted = dmg >= 2;
        const eKiaiGain = (eWaki && enemyAction === '面' && !inTsuba) ? 0 : 1;

        if (dmg > 0) {
            state.playerHealth -= dmg;
            state.playerKiai = 0; // 相手の攻撃成功により気合0にリセット！
            playerAnim = 'hit';
            playerOutcome = 'hit';
        } else {
            playerAnim = 'block';
            playerOutcome = 'block';
        }
        if (eKiaiGain > 0) gainKiai('enemy', eKiaiGain);
        impactWeight = isBoosted ? 'heavy' : 'normal';

        statusType = (dmg > 0) ? 'defeat' : 'neutral';
        impactSound = (dmg > 0) ? 'hurt' : 'block';
        zoomTargets.push(enemySpriteBox);
        if (dmg > 0) shakeTargets.push({ el: playerSpriteBox, isHeavy: isBoosted });
        if (isBoosted) doArenaFlash = true;

        if (didMitigate) {
            const mitigateText = (strDiff >= agiDiff) ? '💪 剛腕受け！(-1)' : '⚡ 身のこなし！(-1)';
            popups.push({ who: 'player', text: mitigateText, styleClass: 'popup-counter' });
        }
        if (dmg > 0) {
            popups.push(
                { who: 'player', text: isBoosted ? `-${dmg} ${eMoveName}！` : `-${dmg}`, styleClass: isBoosted ? 'popup-crit' : 'popup-dmg' },
                { who: 'player', text: '気合 0！', styleClass: 'popup-break' }
            );
        }
        if (eKiaiGain > 0) {
            popups.push({ who: 'enemy', text: `+${eKiaiGain} 気合`, styleClass: 'popup-kiai' });
        }

        calloutData = (dmg > 0) ? {
            winner: 'enemy',
            mainText: `${eMoveName}あり！`,
            subText: eNukiDo
                ? `🌊 相手の下段の構え・抜き胴 (${dmg}点)`
                : (inTsuba ? `⚡ 相手の${eMoveName} (${dmg}点)` : (isBoosted ? `🔥 相手の${eMoveName} (${dmg}点)` : `⚔️ 出ばな${enemyAction}一本`)),
            isCritical: isBoosted,
        } : {
            winner: null,
            mainText: '芯外れ！',
            subText: (strDiff >= agiDiff) ? '💪 剛腕で威力を殺した (有効打突なし)' : '⚡ 身のこなしで芯を外した (有効打突なし)',
            reasonBadge: (strDiff >= agiDiff) ? '💪 剛腕受け' : '⚡ 身のこなし',
        };
    }
    // 8. 基本打突 vs 基本打突（4打突パラメータ対抗 ＆ 相性ボーナス ＆ 気合バフ判定 ＆ 基礎能力ボーナス！）
    else if (isBasic(playerAction) && isBasic(enemyAction)) {
        const pSkillVal = getSkillVal(pStats, playerAction);
        const eSkillVal = getSkillVal(eStats, enemyAction);

        // 4打突理合相性ボーナス（技量連動スケーリング: 技の30%、最低保証 12）
        const pHasAdv = attackMap[playerAction] && attackMap[playerAction].includes(enemyAction);
        const eHasAdv = attackMap[enemyAction] && attackMap[enemyAction].includes(playerAction);
        const pAdv = pHasAdv ? Math.max(12, Math.round(pSkillVal * 0.30)) : 0;
        const eAdv = eHasAdv ? Math.max(12, Math.round(eSkillVal * 0.30)) : 0;

        // 気合闘気パッシブバフ（技量連動スケーリング: 気合1=10%/最低5, 気合2=20%/最低10, 気合3=35%/最低18）
        const pScaledBuff = getKiaiBuff('player', prevPlayerKiai, pSkillVal);
        const eScaledBuff = getKiaiBuff('enemy', prevEnemyKiai, eSkillVal);
        const pKiaiScoreBonus = pScaledBuff.scoreBonus;
        const eKiaiScoreBonus = eScaledBuff.scoreBonus;

        // 基礎能力値
        const pStr = pStats.str || 10;
        const eStr = eStats.str || 10;
        const pAgi = pStats.agi || 10;
        const eAgi = eStats.agi || 10;
        const pSpi = pStats.spi || 10;
        const eSpi = eStats.spi || 10;

        // 腕力: 打突の重み (Math.round(str * 0.22))
        const pStrBonus = Math.round(pStr * 0.22);
        const eStrBonus = Math.round(eStr * 0.22);

        // 敏捷: 防御成功後の見切り応じ技強化 (見切りスタック数に応じて倍率スケール: Lv1=0.35, Lv2=0.55, Lv3=0.80)
        const pAgiMult = pCounterStacks >= 3 ? 0.80 : (pCounterStacks === 2 ? 0.55 : 0.35);
        const eAgiMult = eCounterStacks >= 3 ? 0.80 : (eCounterStacks === 2 ? 0.55 : 0.35);
        const pAgiBonus = pCounter ? Math.round(pAgi * pAgiMult) : 0;
        const eAgiBonus = eCounter ? Math.round(eAgi * eAgiMult) : 0;

        // 気力: 気力14以上で気迫の底上げ
        const pSpiBonus = (pSpi >= 14) ? Math.round((pSpi - 10) * 0.25) : 0;
        const eSpiBonus = (eSpi >= 14) ? Math.round((eSpi - 10) * 0.25) : 0;

        // 構えボーナス
        const pStanceMod = (isJodan && playerAction === '面') ? 6 : 0;
        const eStanceMod = (eJodan && enemyAction === '面') ? 6 : 0;

        // 応じ技基礎バフ（前ターン防御成功時、見切りスタック数に応じてスケール: Lv1=18, Lv2=32, Lv3=48）
        const pBaseBonus = pCounterStacks >= 3 ? 48 : (pCounterStacks === 2 ? 32 : 18);
        const eBaseBonus = eCounterStacks >= 3 ? 48 : (eCounterStacks === 2 ? 32 : 18);
        const pCounterBonus = pCounter ? pBaseBonus : 0;
        const eCounterBonus = eCounter ? eBaseBonus : 0;

        const pExtraBonus = pCounterBonus + pAgiBonus + pStrBonus + pSpiBonus + pStanceMod;
        const eExtraBonus = eCounterBonus + eAgiBonus + eStrBonus + eSpiBonus + eStanceMod;

        const pTotal = pSkillVal + pAdv + pKiaiScoreBonus + pExtraBonus;
        const eTotal = eSkillVal + eAdv + eKiaiScoreBonus + eExtraBonus;

        const scoreDiff = pTotal - eTotal;
        const isMutualTsuba = (playerAction === enemyAction && Math.abs(scoreDiff) <= 5);
        const winnerSide = isMutualTsuba ? 'both' : (scoreDiff > 0 ? 'player' : 'enemy');

        currentClashData = {
            pMoveName,
            eMoveName,
            pScore: pTotal,
            eScore: eTotal,
            pSkillVal,
            eSkillVal,
            pAdv,
            eAdv,
            pKiaiLabel: pBuff.label,
            eKiaiLabel: eBuff.label,
            pKiaiBonus: pKiaiScoreBonus,
            eKiaiBonus: eKiaiScoreBonus,
            pStrBonus,
            eStrBonus,
            pAgiBonus,
            eAgiBonus,
            pSpiBonus,
            eSpiBonus,
            pCounterBonus,
            eCounterBonus,
            pCounterStacks,
            eCounterStacks,
            winner: winnerSide,
        };
        lastClashData = currentClashData;

        if (playerAction === enemyAction && Math.abs(scoreDiff) <= 5) {
            // 同技相打ち / 鍔迫り合い突入
            if (!inTsuba) {
                gainKiai('player', 1);
                gainKiai('enemy', 1);
                state.tsubazeriai = true;
                playerOutcome = 'tsubazeriai_clash';
                enemyOutcome = 'tsubazeriai_clash';
                statusType = 'neutral';
                impactSound = 'clash';
                shakeTargets.push({ el: playerSpriteBox, isHeavy: false }, { el: enemySpriteBox, isHeavy: false });
                popups.push(
                    { who: 'player', text: '💥 鍔迫り合い！', styleClass: 'popup-counter' },
                    { who: 'enemy', text: '💥 鍔迫り合い！', styleClass: 'popup-counter' },
                    { who: 'player', text: '+1 気合', styleClass: 'popup-kiai' },
                    { who: 'enemy', text: '+1 気合', styleClass: 'popup-kiai' }
                );
                calloutData = {
                    winner: 'both',
                    mainText: '鍔迫り合い突入！',
                    subText: `💥 相${playerAction}から接近戦へ（次打・引き技2倍）`,
                    reasonBadge: '💥 互角激突',
                };
            } else {
                // 鍔迫り合い中の互角交錯 → 相打ち
                state.playerHealth -= 1;
                state.enemyHealth -= 1;
                state.playerKiai = 0;
                state.enemyKiai = 0;
                playerOutcome = 'mutual_hit';
                enemyOutcome = 'mutual_hit';
                statusType = 'defeat';
                impactSound = 'clash';
                shakeTargets.push({ el: playerSpriteBox, isHeavy: false }, { el: enemySpriteBox, isHeavy: false });
                popups.push(
                    { who: 'player', text: '-1 相打ち', styleClass: 'popup-dmg' },
                    { who: 'enemy', text: '-1 相打ち', styleClass: 'popup-dmg' }
                );
                calloutData = {
                    winner: 'both',
                    mainText: '相打ち！',
                    subText: `互いに${pMoveName} (双方-1)`,
                    reasonBadge: '💥 相打ち',
                };
            }
        } else if (scoreDiff > 0) {
            // プレイヤーが競り勝った！
            // 技術未熟判定: 技パラメータが20未満の場合、低確率で打突が浅く不発（敏捷が高いと足捌きにより不発率低減）
            const pShallowChance = Math.max(0, ((22 - pSkillVal) * 0.04) - Math.max(0, (pAgi - 10) * 0.015));
            const isTooShallow = pSkillVal < 20 && Math.random() < pShallowChance;

            if (isTooShallow) {
                statusType = 'neutral';
                impactSound = 'block';
                popups.push({ who: 'player', text: '打突が浅い！', styleClass: 'popup-counter' });
                calloutData = {
                    winner: null,
                    mainText: '打突浅し！',
                    subText: `技量不足 (${playerAction}技術${pSkillVal})`,
                    reasonBadge: '⚠️ 技術未熟（不発）',
                };
            } else {
                const jodanBonus = (isJodan && playerAction === '面') ? 1 : 0;
                const eJodanKoteBonus = (eJodan && (playerAction === '小手' || playerAction === '突き')) ? 1 : 0;
                const isCrit = Math.random() < pBuff.critRate;

                // 剛腕会心判定（攻撃側腕力 > 防御側腕力）: 差 × 1%、最大40%で追加ダメージ +1
                const strDiff = pStr - eStr;
                const isStrCrit = strDiff > 0 && Math.random() < Math.min(0.40, strDiff * 0.01);

                // 紙一重の体捌き判定（防御側敏捷 > 攻撃側敏捷）: 差 × 1%、最大40%で被ダメ -1 軽減
                const agiDiff = eAgi - pAgi;
                const isAgiDodge = agiDiff > 0 && Math.random() < Math.min(0.40, agiDiff * 0.01);

                const baseDmg = ((pCounter || inTsuba) ? 2 : 1) + pBuff.dmgBonus + (isCrit ? 1 : 0);
                const rawDmg = baseDmg + jodanBonus + eJodanKoteBonus + (isStrCrit ? 1 : 0);
                let dmg = Math.max(1, rawDmg - eBuff.dmgReduction);
                if (isAgiDodge) {
                    dmg = Math.max(0, dmg - 1);
                }

                const isBoosted = dmg >= 2;
                const kiaiGain = (isWaki && playerAction === '面' && !inTsuba) ? 0 : 1;

                if (dmg > 0) {
                    state.enemyHealth -= dmg;
                    enemyAnim = 'hit';
                    enemyOutcome = 'hit';
                } else {
                    enemyAnim = 'block';
                    enemyOutcome = 'block';
                }
                if (kiaiGain > 0) gainKiai('player', kiaiGain);
                impactWeight = isBoosted ? 'heavy' : 'normal';

                let pReasonBadge = '⚔️ 技量突破';
                if (isStrCrit) pReasonBadge = `💥 剛腕会心 (${pStr} vs ${eStr})`;
                else if (pCounter) {
                    const lvText = pCounterStacks >= 2 ? `Lv${pCounterStacks}` : '応じ技';
                    pReasonBadge = `⚡ 見切り${lvText} (+${pCounterBonus + pAgiBonus})`;
                }
                else if (pAdv > 0) pReasonBadge = `🚩 相性制覇 (+${pAdv})`;
                else if (pSkillVal - eSkillVal >= 10) pReasonBadge = `⚡ 技量圧倒 (${pSkillVal} vs ${eSkillVal})`;
                else if (pStrBonus - eStrBonus >= 3) pReasonBadge = `💪 剛腕押し切り (+${pStrBonus})`;
                else if (pBuff.scoreBonus >= 10) pReasonBadge = `🔥 気迫制覇 (${pBuff.label})`;

                statusType = (dmg > 0) ? 'victory' : 'neutral';
                impactSound = (dmg > 0) ? (isBoosted ? 'special' : 'attack') : 'block';
                zoomTargets.push(playerSpriteBox);
                if (dmg > 0) shakeTargets.push({ el: enemySpriteBox, isHeavy: isBoosted });
                if (isBoosted) doArenaFlash = true;

                if (isStrCrit) {
                    popups.push({ who: 'player', text: '💥 剛腕会心！', styleClass: 'popup-crit' });
                }
                if (isAgiDodge) {
                    popups.push({ who: 'enemy', text: '⚡ 紙一重！(-1)', styleClass: 'popup-counter' });
                }
                if (dmg > 0) {
                    popups.push({ who: 'enemy', text: isBoosted ? `-${dmg} ${pMoveName}！` : `-${dmg}`, styleClass: isBoosted ? 'popup-crit' : 'popup-dmg' });
                }
                if (kiaiGain > 0) {
                    popups.push({ who: 'player', text: `+${kiaiGain} 気合`, styleClass: 'popup-kiai' });
                }

                calloutData = (dmg > 0) ? {
                    winner: 'player',
                    mainText: `${pMoveName}あり！`,
                    subText: isStrCrit
                        ? `💥 剛腕の一閃 (${dmg}点)`
                        : (isCrit
                            ? `⚡ 会心の一閃 (${dmg}点)`
                            : (pAdv > 0 ? `⚔️ 相性制覇 (${dmg}点)` : `🚩 技術制覇 (${dmg}点)`)),
                    reasonBadge: pReasonBadge,
                    isCritical: isBoosted,
                } : {
                    winner: null,
                    mainText: '有効打突なし',
                    subText: '⚡ 相手が身のこなしで芯を外した (0点)',
                    reasonBadge: '⚡ 紙一重の体捌き',
                };
            }
        } else {
            // 敵が競り勝った！
            const eShallowChance = Math.max(0, ((22 - eSkillVal) * 0.04) - Math.max(0, (eAgi - 10) * 0.015));
            const isTooShallow = eSkillVal < 20 && Math.random() < eShallowChance;

            if (isTooShallow) {
                statusType = 'neutral';
                impactSound = 'block';
                popups.push({ who: 'enemy', text: '打突浅し！', styleClass: 'popup-counter' });
                calloutData = {
                    winner: null,
                    mainText: '有効打突なし',
                    subText: '相手の打突浅し',
                    reasonBadge: '⚠️ 相手の技術未熟（不発）',
                };
            } else {
                const eJodanBonus = (eJodan && enemyAction === '面') ? 1 : 0;
                const jodanKotePenalty = (isJodan && (enemyAction === '小手' || enemyAction === '突き')) ? 1 : 0;
                const isCrit = Math.random() < eBuff.critRate;

                // 剛腕会心判定（敵腕力 > プレイヤー腕力）: 差 × 1%、最大40%で追加ダメージ +1
                const strDiff = eStr - pStr;
                const isStrCrit = strDiff > 0 && Math.random() < Math.min(0.40, strDiff * 0.01);

                // 紙一重の体捌き判定（プレイヤー敏捷 > 敵敏捷）: 差 × 1%、最大40%で被ダメ -1 軽減
                const agiDiff = pAgi - eAgi;
                const isAgiDodge = agiDiff > 0 && Math.random() < Math.min(0.40, agiDiff * 0.01);

                const baseDmg = ((eCounter || inTsuba) ? 2 : 1) + eBuff.dmgBonus + (isCrit ? 1 : 0);
                const rawDmg = baseDmg + eJodanBonus + jodanKotePenalty + (isStrCrit ? 1 : 0);
                let dmg = Math.max(1, rawDmg - pBuff.dmgReduction);
                if (isAgiDodge) {
                    dmg = Math.max(0, dmg - 1);
                }

                const isBoosted = dmg >= 2;
                const eKiaiGain = (eWaki && enemyAction === '面' && !inTsuba) ? 0 : 1;

                if (dmg > 0) {
                    state.playerHealth -= dmg;
                    playerAnim = 'hit';
                    playerOutcome = 'hit';
                } else {
                    playerAnim = 'block';
                    playerOutcome = 'block';
                }
                if (eKiaiGain > 0) gainKiai('enemy', eKiaiGain);
                impactWeight = isBoosted ? 'heavy' : 'normal';

                let eReasonBadge = '⚠️ 競り負け';
                if (isStrCrit) eReasonBadge = `💥 相手の剛腕会心 (${eStr} vs ${pStr})`;
                else if (eCounter) {
                    const lvText = eCounterStacks >= 2 ? `Lv${eCounterStacks}` : '応じ技';
                    eReasonBadge = `⚡ 相手見切り${lvText} (+${eCounterBonus + eAgiBonus})`;
                }
                else if (eAdv > 0) eReasonBadge = `⚠️ 相性被制 (+${eAdv})`;
                else if (eSkillVal - pSkillVal >= 10) eReasonBadge = `⚠️ 技量及ばず (${eSkillVal} vs ${pSkillVal})`;
                else if (eStrBonus - pStrBonus >= 3) eReasonBadge = `⚠️ 相手の剛腕押し切り (+${eStrBonus})`;
                else if (eBuff.scoreBonus >= 10) eReasonBadge = `⚠️ 相手の気迫 (${eBuff.label})`;

                statusType = (dmg > 0) ? 'defeat' : 'neutral';
                impactSound = (dmg > 0) ? 'hurt' : 'block';
                zoomTargets.push(enemySpriteBox);
                if (dmg > 0) shakeTargets.push({ el: playerSpriteBox, isHeavy: isBoosted });
                if (isBoosted) doArenaFlash = true;

                if (isStrCrit) {
                    popups.push({ who: 'enemy', text: '💥 剛腕会心！', styleClass: 'popup-crit' });
                }
                if (isAgiDodge) {
                    popups.push({ who: 'player', text: '⚡ 紙一重！(-1)', styleClass: 'popup-counter' });
                }
                if (dmg > 0) {
                    popups.push({ who: 'player', text: isBoosted ? `-${dmg} ${eMoveName}！` : `-${dmg}`, styleClass: isBoosted ? 'popup-crit' : 'popup-dmg' });
                }
                if (eKiaiGain > 0) {
                    popups.push({ who: 'enemy', text: `+${eKiaiGain} 気合`, styleClass: 'popup-kiai' });
                }

                calloutData = (dmg > 0) ? {
                    winner: 'enemy',
                    mainText: `${eMoveName}あり！`,
                    subText: isStrCrit
                        ? `💥 相手の剛腕の一閃 (${dmg}点)`
                        : (isCrit
                            ? `⚠️ 相手の会心の一閃 (${dmg}点)`
                            : (eAdv > 0 ? `⚠️ 相手の相性制覇 (${dmg}点)` : `🏳️ 相手の技術制覇 (${dmg}点)`)),
                    reasonBadge: eReasonBadge,
                    isCritical: isBoosted,
                } : {
                    winner: null,
                    mainText: '紙一重！',
                    subText: '⚡ 身のこなしで芯を外した (有効打突なし)',
                    reasonBadge: '⚡ 紙一重の体捌き',
                };
            }
        }
    }

    // 相手の攻撃や崩しが成功したら、やられたほうの気合は0にする
    const playerGotHit = playerOutcome === 'hit' || playerOutcome === 'mutual_hit' || state.playerGuardBroken;
    const enemyGotHit = enemyOutcome === 'hit' || enemyOutcome === 'mutual_hit' || state.enemyGuardBroken;

    if (playerGotHit) {
        if (state.playerKiai > 0 || (prevPlayerKiai > 0 && playerAction !== '突き')) {
            popups.push({ who: 'player', text: '気合 0！', styleClass: 'popup-break' });
        }
        state.playerKiai = 0;
    }
    if (enemyGotHit) {
        if (state.enemyKiai > 0 || (prevEnemyKiai > 0 && enemyAction !== '突き')) {
            popups.push({ who: 'enemy', text: '気合 0！', styleClass: 'popup-break' });
        }
        state.enemyKiai = 0;
    }

    state.playerAnimState = playerAnim;
    state.enemyAnimState = enemyAnim;

    // 赤・白ごとの有効打突を一元記録（突き、応じ技、面、三すくみ打突すべてに対応）
    if (calloutData && !calloutData.isGuard) {
        if (!state.scoringMoves) state.scoringMoves = { player: [], enemy: [] };
        if (calloutData.winner === 'player') {
            const pKana = convertToKana(playerAction, pMoveName);
            state.scoringMoves.player.push(pKana);
            state.lastWinningMove = pMoveName;
        } else if (calloutData.winner === 'enemy') {
            const eKana = convertToKana(enemyAction, eMoveName);
            state.scoringMoves.enemy.push(eKana);
            state.lastWinningMove = eMoveName;
        }
    }

    const enemyData = getCurrentEnemy();
    let finalStatusMessage = message;
    let finalStatusType = statusType;

    // 勝敗判定（HPが0になっても「勝負あり」文字が出るまではBGM再生を継続）
    if (state.playerHealth <= 0 && state.enemyHealth <= 0) {
        state.playerAnimState = 'hit';
        state.enemyAnimState = 'hit';
        state.gameOver = true;
        state.lastOutcome = 'draw';
        state.finalWinningMove = null;
        state.finalWinningKana = null;
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
        state.finalWinningMove = eMoveName;
        state.finalWinningKana = convertToKana(enemyAction, eMoveName);
        impactWeight = 'heavy';
        endGameSound = 'lose';
        const isSpectating = state.customMatch && state.customMatch.isSpectating;
        const pData = state.customMatch && state.customMatch.player;
        const pDisplayName = pData
            ? (isSpectating ? pData.name : (pData.name === 'あなた' ? 'あなた' : `${pData.name}（あなた）`))
            : 'あなた';
        const eShort = enemyData.shortName || enemyData.name || '相手';

        finalStatusMessage = isSpectating
            ? `【観戦終了】${pDisplayName}が${enemyData.role}【${enemyData.name}】に第${state.round}合で敗れました。`
            : `敗北… ${enemyData.role}【${enemyData.name}】に第${state.round}合で敗れました。`;
        finalStatusType = 'defeat';
        calloutData = {
            winner: 'enemy',
            mainText: '勝負あり！',
            subText: `🏳️ 白（${eShort}）の勝利（${eMoveName}）`,
            isCritical: false,
        };
    } else if (state.enemyHealth <= 0) {
        state.playerAnimState = 'victory';
        state.enemyAnimState = 'hit';
        state.gameOver = true;
        state.lastOutcome = 'victory';
        state.clearedStages.add(state.stageIndex);
        state.finalWinningMove = pMoveName;
        state.finalWinningKana = convertToKana(playerAction, pMoveName);
        impactWeight = 'heavy';
        endGameSound = 'win';

        const isCustom = state.customMatch && state.customMatch.active;
        if (isCustom) {
            const pData = state.customMatch.player || {};
            const pSchool = pData.schoolName
                || (pData.roleTitle && pData.roleTitle.includes('・') ? pData.roleTitle.split('・')[1] : null)
                || (window.KendoClub && window.KendoClub.getState && window.KendoClub.getState().schoolName)
                || '本校';
            const pName = pData.name || 'あなた';

            finalStatusMessage = `🏆 勝負あり！【${enemyData.name}】に勝利しました！（第${state.round}合）`;
            finalStatusType = 'victory';
            calloutData = {
                winner: 'player',
                mainText: '🏆 勝負あり！',
                subText: `🚩 赤（${pSchool}・${pName}）の勝利！`,
                isCritical: true,
            };
        } else {
            const allCleared = state.clearedStages.size === ENEMY_ROSTER.length;
            if (allCleared && state.stageIndex === ENEMY_ROSTER.length - 1) {
                finalStatusMessage = `🎉 天下無双！！大将【${enemyData.name}】を破り、勝ち抜き五人掛けを完全制覇しました！！（第${state.round}合）`;
                finalStatusType = 'victory';
                calloutData = {
                    winner: 'player',
                    mainText: '🏆 五人掛け完全制覇！',
                    subText: `🚩 天下無双・${enemyData.shortName}を撃破！`,
                    isCritical: true,
                };
            } else if (state.stageIndex < ENEMY_ROSTER.length - 1) {
                const nextEnemy = ENEMY_ROSTER[state.stageIndex + 1];
                finalStatusMessage = `🏆 勝負あり！${enemyData.role}【${enemyData.name}】を撃破！次は${nextEnemy.role}【${nextEnemy.name}】が待ち受ける！（第${state.round}合）`;
                finalStatusType = 'victory';
                calloutData = {
                    winner: 'player',
                    mainText: `🏆 ${enemyData.role}撃破！`,
                    subText: `🚩 赤（あなた）の勝利！（次戦：${nextEnemy.role}・${nextEnemy.shortName}）`,
                    isCritical: true,
                };
            } else {
                finalStatusMessage = `🏆 勝負あり！${enemyData.role}【${enemyData.name}】に勝利しました！（第${state.round}合）`;
                finalStatusType = 'victory';
                calloutData = {
                    winner: 'player',
                    mainText: '🏆 勝負あり！',
                    subText: `🚩 赤（あなた）の勝利！（${pMoveName}）`,
                    isCritical: true,
                };
            }
        }
    }

    if (state.boutStats) {
        state.boutStats.rounds = state.round;
        if (enemyOutcome === 'hit') state.boutStats.playerHits++;
        if (playerOutcome === 'hit') state.boutStats.enemyHits++;
        if (roundPlayerBlocked || playerOutcome === 'block_success') state.boutStats.playerBlocks++;
        if (roundEnemyBlocked || enemyOutcome === 'block_success') state.boutStats.enemyBlocks++;
        if (roundPushWin) state.boutStats.pushWins++;
    }

    if (state.gameOver) {
        state.tsubazeriai = false;
        updateUI();
    }

    // 1. アニメーション開始時：前回の旗表示を消し、立ち合い中テキストを表示してボタンを一時ロック
    hideRefereeCallout();
    setActionButtonsLocked(true);
    const isSpectating = state.customMatch && state.customMatch.isSpectating;
    const pData = state.customMatch && state.customMatch.player;
    const pDisplayName = pData
        ? (isSpectating ? pData.name : (pData.name === 'あなた' ? 'あなた' : `${pData.name}（あなた）`))
        : 'あなた';
    const eShort = enemyData.shortName || enemyData.name || '相手';
    updateStatus(`第${state.round}合${inTsuba ? '【鍔迫り合い】' : ''}: ${pDisplayName}【${pMoveName}】 vs ${eShort}【${eMoveName}】 — 立ち合い…！`, 'neutral');
    if (intentText) intentText.textContent = inTsuba ? '💥 鍔迫り合いから技が交錯しています…' : '⚔️ 技が交錯しています…';

    // ⚔️ 競り合いクラッシュメーターの展開（基本打突の激突判定時）
    if (currentClashData) {
        showClashMeter(currentClashData);
    } else {
        hideClashMeter();
    }

    // 選手カード・レーダーチャートの激突ハイライト
    const pIsAdv = attackMap[playerAction] && attackMap[playerAction].includes(enemyAction);
    const eIsAdv = attackMap[enemyAction] && attackMap[enemyAction].includes(playerAction);
    if (playerRadarBox) playerRadarBox.innerHTML = generateFighterRadarSvg('player', playerAction, !!pIsAdv);
    if (enemyRadarBox) enemyRadarBox.innerHTML = generateFighterRadarSvg('enemy', enemyAction, !!eIsAdv);

    // 攻撃がヒットした側の技名（面、小手、胴、突き）および発声剣士を判定
    const pTechType = pTechInfo.tech ? pTechInfo.tech.type : '面';
    const eTechType = eTechInfo.tech ? eTechInfo.tech.type : '面';
    let hittingAction = null;
    let hittingFighter = 'player';
    const isBothDefend = (playerAction === '防御' && enemyAction === '防御');

    if (playerOutcome === 'mutual_hit' || enemyOutcome === 'mutual_hit') {
        // 💥 相討ち時は双方が被弾（攻撃された側）となるため両者完全無言
        hittingAction = null;
    } else if (enemyOutcome === 'hit') {
        hittingAction = (playerAction === '必殺') ? pTechType : playerAction;
        hittingFighter = 'player';
    } else if (playerOutcome === 'hit') {
        hittingAction = (enemyAction === '必殺') ? eTechType : enemyAction;
        hittingFighter = 'enemy';
    }

    // 2. 打突・被弾の連続キーフレームアニメーションを再生
    triggerFighterAnimation('player', playerAction, playerOutcome, impactWeight, inTsuba, pTechType);
    triggerFighterAnimation('enemy', enemyAction, enemyOutcome, impactWeight, inTsuba, eTechType);

    // 3. 打突の最後のコマ（STRIKE_IMPACT_T = 380ms）到達時に打突音・画面シェイク・ズームを発火
    pendingImpactCallback = () => {
        if (hittingAction) {
            playKiaiVoice(hittingAction, {
                isPlayer: hittingFighter === 'player',
                fighterId: hittingFighter === 'player' ? 'player' : enemyData.id,
                intensity: impactWeight > 1.2 ? 1.25 : 1.0,
            });
        } else if (isBothDefend) {
            playKiaiVoice('防御', { isPlayer: true, fighterId: 'player', intensity: 1.0 });
            playKiaiVoice('防御', { isPlayer: false, fighterId: enemyData.id, intensity: 1.0 });
        }
        // ※ 防御成功時（相手の打突ブロック時）は発声せず、受け止めSEのみ鳴らす

        if (impactSound) playSound(impactSound);
        zoomTargets.forEach((el) => triggerImpactZoom(el));
        shakeTargets.forEach((t) => triggerShake(t.el, t.isHeavy));
        if (doArenaFlash) triggerArenaFlash();
    };
    pendingImpactTimer = setTimeout(() => {
        firePendingImpact();
    }, STRIKE_IMPACT_T);

    // 4. 打突アニメーション完了時点（ANIM_TOTAL_T = 1040ms）でHPゲージ・気合ゲージ・ポップアップ・審判旗・勝敗コールを反映
    pendingRoundCallback = () => {
        if (!state.gameOver) {
            decideEnemyIntent();
            state.playerAnimState = getNeutralAnim('player');
            state.enemyAnimState = getNeutralAnim('enemy');
        } else {
            decideEnemyIntent();
        }
        updateUI();
        popups.forEach((p) => spawnFloatingPopup(p.who, p.text, p.styleClass));
        updateStatus(finalStatusMessage, finalStatusType);

        if (!state.gameOver && state.customMatch && state.customMatch.isSpectating) {
            scheduleNextSpectateTurn(1350);
        } else if (!state.gameOver && (state.playerStunned || state.playerGuardBroken)) {
            schedulePlayerStunAutoSkip(1250);
        }

        if (state.gameOver) {
            // 勝敗決定時は、キャラクタ上のダメージ数値表示（約1.05s）が完全に消えてから「勝負あり」へ移行
            const dmgDuration = 1150;
            const gameOverCalloutTimer = setTimeout(() => {
                // 1. 🏆 まずBGMを停止
                if (window.KendoBGM && window.KendoBGM.stop) {
                    window.KendoBGM.stop();
                }

                // 2. BGM停止後、静寂の間（約220ms）を置いてから審判が「勝負あり！」と短く鋭く宣告
                const refereeShoutTimer = setTimeout(() => {
                    playRefereeVoice('勝負あり！', 1.0);

                    if (calloutData) {
                        showRefereeCallout(calloutData, () => {
                            startClosingCeremony();
                        });
                    } else {
                        startClosingCeremony();
                    }

                    // 3. 審判の号令（約0.60秒）が終わった後に勝敗ジングルを再生（声と被らないように）
                    if (endGameSound) {
                        const jingleTimer = setTimeout(() => {
                            playSound(endGameSound);
                        }, 650);
                        if (state.ceremonyTimers) {
                            state.ceremonyTimers.push(jingleTimer);
                        }
                    }
                }, 220);

                if (state.ceremonyTimers) {
                    state.ceremonyTimers.push(refereeShoutTimer);
                }
            }, dmgDuration);
            if (state.ceremonyTimers) {
                state.ceremonyTimers.push(gameOverCalloutTimer);
            }
        } else {
            if (calloutData) {
                showRefereeCallout(calloutData);
            } else {
                hideRefereeCallout();
            }
            if (endGameSound) {
                playSound(endGameSound);
            }
        }
    };

    const maxRoundDuration = (playerAction === '必殺' || enemyAction === '必殺') ? 1750 : 1350;
    pendingRoundTimer = setTimeout(() => {
        flushPendingRound();
    }, maxRoundDuration);
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
    lastRenderedPlayerPhotoKey = null;
    lastRenderedEnemyPhotoKey = null;
    if (state.animResetTimer) {
        clearTimeout(state.animResetTimer);
        state.animResetTimer = null;
    }
    hideRefereeCallout();
    hideClashMeter();
    hideSpecialCutin();
    closeStoryDialogue();
    if (playerPopupLayer) playerPopupLayer.innerHTML = '';
    if (enemyPopupLayer) enemyPopupLayer.innerHTML = '';
    timeState.hitStopUntil = 0;
    timeState.slowMoUntil = 0;

    const enemyData = getCurrentEnemy();
    const pMax = getPlayerMaxHealth();
    state.enemyMaxHealth = enemyData.maxHealth;
    state.playerHealth = pMax;
    state.enemyHealth = enemyData.maxHealth;
    state.playerKiai = 0;
    state.enemyKiai = enemyData.initialKiai || 0;
    state.playerCounterReady = false;
    state.enemyCounterReady = false;
    state.playerCounterStacks = 0;
    state.enemyCounterStacks = 0;
    state.playerGuardBroken = false;
    state.enemyGuardBroken = false;
    state.playerStunned = false;
    state.enemyStunned = false;
    state.tsubazeriai = false;
    state.playerStanceStyle = 'chudan';
    state.enemyStanceStyle = 'chudan';
    state.matchPhase = 'pre_match';
    state.round = 0;
    state.gameOver = false;
    state.preMatchStorySeen = false;
    state.lastOutcome = null;
    state.playerActionHistory = [];
    state.enemyLearnedPattern = null;

    // 試合開始前（待機状態）はBGMを停止（審判の「始め！」で再生開始）
    if (window.KendoBGM && window.KendoBGM.stop) {
        window.KendoBGM.stop();
    }

    decideEnemyIntent();
    state.playerAnimState = getNeutralAnim('player');
    state.enemyAnimState = getNeutralAnim('enemy');

    animators.player = createAnimator(0);
    animators.player.currentSprite = 'sageto';
    animators.player.prevSprite = 'sageto';
    animators.player.currentPose = { ...getContinuousStancePose(state.playerAnimState, 0) };
    animators.enemy = createAnimator(1.8);
    animators.enemy.currentSprite = 'sageto';
    animators.enemy.prevSprite = 'sageto';
    animators.enemy.currentPose = { ...getContinuousStancePose(state.enemyAnimState, 1.8) };

    if (state.customMatch && state.customMatch.player && state.customMatch.player.favStance) {
        state.playerStanceStyle = state.customMatch.player.favStance;
    }

    updateUI();

    // 💬 試合前キャラクタ頭上吹き出しの表示
    const pQuote = (state.customMatch && state.customMatch.player && state.customMatch.player.introQuote)
        || '「お願いします！」';
    showPreMatchSpeech(enemyData.introQuote, pQuote);

    if (state.customMatch && state.customMatch.active) {
        if (state.customMatch.isSpectating) {
            updateStatus(`【観戦中・${enemyData.role}戦】${state.customMatch.player.name} vs ${enemyData.name}`, 'neutral');
            clearTimeout(state.customMatch.spectateTurnTimer);
            state.customMatch.spectateTurnTimer = setTimeout(() => {
                if (state.customMatch && state.customMatch.isSpectating && state.matchPhase === 'pre_match') {
                    startMatchCeremony();
                }
            }, 850);
        } else {
            const isIndiv = (state.customMatch && state.customMatch.isIndividual) || (enemyData.role && (enemyData.role.includes('回戦') || enemyData.role.includes('決勝')));
            const prefix = isIndiv ? `【${enemyData.role}】` : `【団体戦・${enemyData.role}戦】`;
            const cleanRank = (enemyData.rank && String(enemyData.rank).trim()) ? `（${String(enemyData.rank).trim()}）` : '';
            updateStatus(`${prefix}${enemyData.name}${cleanRank}`, 'neutral');
        }
    } else {
        const cleanRank = (enemyData.rank && String(enemyData.rank).trim()) ? `（${String(enemyData.rank).trim()}）` : '';
        updateStatus(`【${enemyData.role}戦】${enemyData.name}${cleanRank}`, 'neutral');
    }
}

function animationLoop(timestamp) {
    const now = (typeof performance !== 'undefined') ? performance.now() : (timestamp || Date.now());
    updateAndDrawFighter(playerCtx, 'player', false, now);
    updateAndDrawFighter(enemyCtx, 'enemy', true, now);
    if ((pendingRoundCallback || pendingClosingCallback) && !animators.player.keyframes && !animators.enemy.keyframes) {
        flushPendingRound();
    }
    requestAnimationFrame(animationLoop);
}

// ───────────────────────────────────────────
// 外部公開インターフェース (window.KendoGameEngine)
// ───────────────────────────────────────────
window.KendoGameEngine = {
    getState: function () {
        return state;
    },

    playRound: function (action) {
        return playRound(action);
    },

    getLastClashData: function () {
        return lastClashData;
    },

    setEnemyActionOverride: function (override) {
        enemyActionOverride = override;
    },

    analyzePlayerPattern: function (history, enemyData) {
        return analyzePlayerPattern(history, enemyData);
    },

    // 団体戦モード等からプレイヤー戦または観戦を呼び出す
    startCustomMatch: function (options) {
        if (options && options.playerData && options.playerData.roleTitle) {
            options.playerData.roleTitle = options.playerData.roleTitle.replace(/[（\(][^）\)]*の試合[）\)]/g, '').trim();
        }
        if (options && options.enemyData && options.enemyData.role) {
            options.enemyData.role = options.enemyData.role.replace(/[（\(][^）\)]*の試合[）\)]/g, '').trim();
        }
        state.customMatch = {
            active: true,
            isIndividual: !!options.isIndividual,
            isIntraClub: !!options.isIntraClub,
            isSpecialPractice: !!options.isSpecialPractice,
            roundName: options.roundName || '',
            boutPosName: options.boutPosName || '',
            isSpectating: !!options.isSpectating,
            player: options.playerData,
            enemy: options.enemyData,
            onComplete: options.onMatchEnd,
            tournamentType: options.tournamentType || null,
            spectateTurnTimer: null,
        };

        const isSpecialPractice = !!options.isSpecialPractice || options.tournamentType === 'dojo';
        const arenaElem = document.getElementById('battleArena');
        if (arenaElem) {
            arenaElem.classList.remove('bg-national', 'bg-district', 'bg-dojo');
            if (isSpecialPractice) {
                arenaElem.classList.add('bg-dojo');
            } else if (options.tournamentType) {
                arenaElem.classList.add(`bg-${options.tournamentType}`);
            }
        }

        if (document.body) {
            document.body.classList.remove('bg-national', 'bg-district', 'bg-dojo');
            if (isSpecialPractice) {
                document.body.classList.add('bg-dojo');
            } else if (options.tournamentType) {
                document.body.classList.add(`bg-${options.tournamentType}`);
            }
        }

        window.KendoGameEngine.showCombatScreen();
        resetGame();
    },

    // 観戦をスキップして即時決着
    skipCurrentSpectate: function () {
        if (!state.customMatch || !state.customMatch.isSpectating) return;
        clearTimeout(state.customMatch.spectateTurnTimer);
        clearPendingRoundTimers();
        clearCeremonyTimers();

        const pStr = (state.customMatch.player && state.customMatch.player.str) || 10;
        const eStr = (state.customMatch.enemy && state.customMatch.enemy.str) || 10;
        const isPlayerWin = (state.playerHealth > state.enemyHealth) || (pStr >= eStr ? Math.random() < 0.6 : Math.random() < 0.35);

        const cb = state.customMatch.onComplete;
        const randomTech = () => {
            const r = Math.random();
            return r < 0.45 ? 'メ' : (r < 0.75 ? 'コ' : (r < 0.95 ? 'ド' : 'ツ'));
        };
        const targetScores = isPlayerWin
            ? (state.scoringMoves && state.scoringMoves.player)
            : (state.scoringMoves && state.scoringMoves.enemy);
        const winningKana = state.finalWinningKana || ((targetScores && targetScores.length)
            ? targetScores[targetScores.length - 1]
            : randomTech());
        const rawWinningMove = state.finalWinningMove || state.lastWinningMove || (winningKana === 'コ' ? '小手' : (winningKana === 'ド' ? '胴' : (winningKana === 'ツ' ? '突き' : '面')));
        const winningMove = getBaseMoveName(rawWinningMove, winningKana);

        const res = {
            winner: isPlayerWin ? 'player' : 'enemy',
            playerHp: isPlayerWin ? 1 : 0,
            enemyHp: isPlayerWin ? 0 : 1,
            rounds: state.round + 1,
            skipped: true,
            myScore: isPlayerWin ? [winningKana] : [],
            enemyScore: isPlayerWin ? [] : [winningKana],
            winningMove: winningMove,
            winningKana: winningKana,
            boutStats: state.boutStats ? { ...state.boutStats, winningMove } : {
                playerHits: isPlayerWin ? 1 : 0,
                playerBlocks: 0,
                enemyHits: isPlayerWin ? 0 : 1,
                enemyBlocks: 0,
                rounds: state.round + 1,
                pushWins: 0,
                winningMove: winningMove,
            },
        };
        state.customMatch.active = false;
        state.customMatch.isSpectating = false;
        if (typeof cb === 'function') {
            cb(res);
        }
    },

    // 観戦を中断して主将の出番まで一括スキップ
    skipSpectateToPlayer: function () {
        if (!state.customMatch || !state.customMatch.isSpectating) return;
        clearTimeout(state.customMatch.spectateTurnTimer);
        clearPendingRoundTimers();
        clearCeremonyTimers();

        state.customMatch.active = false;
        state.customMatch.isSpectating = false;

        if (window.KendoClub && window.KendoClub.stopAutoSpectateAndSkipToPlayer) {
            window.KendoClub.stopAutoSpectateAndSkipToPlayer();
        } else {
            window.KendoGameEngine.showClubScreen();
        }
    },

    // 試合終了後に団体戦スコアボードへ戻る
    returnFromCombatToClub: function () {
        clearPendingRoundTimers();
        clearCeremonyTimers();
        hideRefereeCallout();
        hideClashMeter();
        hideSpecialCutin();
        hideSpeechBubbles();
        if (state.customMatch && typeof state.customMatch.onComplete === 'function') {
            const cb = state.customMatch.onComplete;
            const isDraw = state.lastOutcome === 'draw' || (state.playerHealth <= 0 && state.enemyHealth <= 0);
            const winner = isDraw ? 'draw' : (state.lastOutcome === 'victory' ? 'player' : 'enemy');
            const winningKana = (winner === 'draw')
                ? '-'
                : (state.finalWinningKana
                    || (winner === 'player'
                        ? ((state.scoringMoves && state.scoringMoves.player && state.scoringMoves.player.length)
                            ? state.scoringMoves.player[state.scoringMoves.player.length - 1]
                            : 'メ')
                        : ((state.scoringMoves && state.scoringMoves.enemy && state.scoringMoves.enemy.length)
                            ? state.scoringMoves.enemy[state.scoringMoves.enemy.length - 1]
                            : 'メ')));
            const rawWinningMove = (winner === 'draw')
                ? '相打ち'
                : (state.finalWinningMove || state.lastWinningMove || (winningKana === 'コ' ? '小手' : (winningKana === 'ド' ? '胴' : (winningKana === 'ツ' ? '突き' : '面'))));
            const winningMove = (winner === 'draw') ? '相打ち' : getBaseMoveName(rawWinningMove, winningKana);

            const res = {
                winner: winner,
                playerHp: state.playerHealth,
                enemyHp: state.enemyHealth,
                rounds: state.round,
                myScore: winner === 'player' ? [winningKana] : [],
                enemyScore: winner === 'enemy' ? [winningKana] : [],
                winningMove: winningMove,
                winningKana: winningKana,
                boutStats: state.boutStats ? { ...state.boutStats, winningMove: (winner === 'draw' ? null : winningMove) } : {
                    playerHits: winner === 'player' ? 1 : 0,
                    playerBlocks: 0,
                    enemyHits: winner === 'enemy' ? 1 : 0,
                    enemyBlocks: 0,
                    rounds: state.round,
                    pushWins: 0,
                    winningMove: (winner === 'draw' ? null : winningMove),
                },
            };
            state.customMatch.active = false;
            cb(res);
        } else {
            window.KendoGameEngine.showClubScreen();
        }
    },

    // モード選択メニュー（タイトル画面）を表示
    showModeSelect: function () {
        clearPendingRoundTimers();
        hideRefereeCallout();
        hideClashMeter();
        hideSpecialCutin();
        hideSpeechBubbles();
        const modeSelectScreen = document.getElementById('modeSelectScreen');
        const headerModeBar = document.getElementById('headerModeBar');
        const classicStageWrap = document.getElementById('classicStageBarWrap');
        const clubView = document.getElementById('clubModeView');
        const combatArea = document.getElementById('combatAreaWrap');
        const arenaElem = document.getElementById('battleArena');

        if (arenaElem) {
            arenaElem.classList.remove('bg-national', 'bg-district', 'bg-dojo');
        }
        if (document.body) {
            document.body.classList.remove('bg-national', 'bg-district', 'bg-dojo');
        }

        if (modeSelectScreen) modeSelectScreen.style.display = 'block';
        if (headerModeBar) headerModeBar.style.display = 'none';
        if (classicStageWrap) classicStageWrap.style.display = 'none';
        if (clubView) clubView.style.display = 'none';
        if (combatArea) combatArea.style.display = 'none';

        if (window.KendoBGM && window.KendoBGM.play) {
            window.KendoBGM.play('title');
        }

        if (window.KendoClub && window.KendoClub.stopClubMiniCharaLoop) {
            window.KendoClub.stopClubMiniCharaLoop();
        }

        if (window.KendoClub && window.KendoClub.clearMobilePortal) {
            window.KendoClub.clearMobilePortal();
        }

        if (window.KendoClub && window.KendoClub.updateModeCardUI) {
            window.KendoClub.updateModeCardUI();
        }
    },

    // モード切り替え（五人掛け ⇄ 団体戦 ⇄ メニュー）
    switchMode: function (mode) {
        const modeSelectScreen = document.getElementById('modeSelectScreen');
        const headerModeBar = document.getElementById('headerModeBar');
        const currentModeBadge = document.getElementById('currentModeBadge');
        const classicStageWrap = document.getElementById('classicStageBarWrap');
        const clubView = document.getElementById('clubModeView');
        const combatArea = document.getElementById('combatAreaWrap');

        if (mode === 'menu') {
            window.KendoGameEngine.showModeSelect();
            return;
        }

        if (modeSelectScreen) modeSelectScreen.style.display = 'none';
        if (headerModeBar) headerModeBar.style.display = 'flex';

        if (mode === 'classic') {
            if (currentModeBadge) currentModeBadge.textContent = '🏆 勝ち抜き五人掛け';
            if (classicStageWrap) classicStageWrap.style.display = '';
            if (clubView) clubView.style.display = 'none';
            if (combatArea) combatArea.style.display = '';

            if (window.KendoClub && window.KendoClub.stopClubMiniCharaLoop) {
                window.KendoClub.stopClubMiniCharaLoop();
            }

            if (window.KendoClub && window.KendoClub.clearMobilePortal) {
                window.KendoClub.clearMobilePortal();
            }

            state.customMatch = null;
            resetGame();

            // 試合開始前（待機状態）はBGMを停止（審判の「始め！」で再生開始）
            if (window.KendoBGM && window.KendoBGM.stop) {
                window.KendoBGM.stop();
            }
        } else if (mode === 'club') {
            if (currentModeBadge) currentModeBadge.textContent = '🥋 全国制覇モード';
            if (classicStageWrap) classicStageWrap.style.display = 'none';
            if (clubView) clubView.style.display = '';
            if (combatArea) combatArea.style.display = 'none';

            if (window.KendoBGM && window.KendoBGM.play) {
                window.KendoBGM.play('club');
            }

            if (window.KendoClub && window.KendoClub.init) {
                window.KendoClub.init();
            }
        }
    },

    showClubScreen: function () {
        clearPendingRoundTimers();
        hideRefereeCallout();
        hideClashMeter();
        hideSpecialCutin();
        hideSpeechBubbles();
        const modeSelectScreen = document.getElementById('modeSelectScreen');
        const headerModeBar = document.getElementById('headerModeBar');
        const classicStageWrap = document.getElementById('classicStageBarWrap');
        const clubView = document.getElementById('clubModeView');
        const combatArea = document.getElementById('combatAreaWrap');
        const arenaElem = document.getElementById('battleArena');

        if (arenaElem) {
            arenaElem.classList.remove('bg-national', 'bg-district', 'bg-dojo');
        }
        if (document.body) {
            document.body.classList.remove('bg-national', 'bg-district', 'bg-dojo');
        }

        if (modeSelectScreen) modeSelectScreen.style.display = 'none';
        if (headerModeBar) headerModeBar.style.display = 'flex';
        if (classicStageWrap) classicStageWrap.style.display = 'none';
        if (clubView) clubView.style.display = '';
        if (combatArea) combatArea.style.display = 'none';

        if (window.KendoBGM) {
            if (window.KendoClub && window.KendoClub.getState) {
                const cs = window.KendoClub.getState();
                if (cs && cs.viewPhase === 'tournament_ceremony') {
                    const isWinner = cs.ceremonyResultData && (cs.ceremonyResultData.rankKey === 'win' || cs.ceremonyResultData.rankLabel === '優勝');
                    const ceremonyScene = isWinner ? 'victory' : 'ceremony';
                    if (window.KendoBGM.play) window.KendoBGM.play(ceremonyScene);
                } else if (cs && ['tournament_opening', 'match_sim', 'match_result'].includes(cs.viewPhase)) {
                    if (window.KendoBGM.stop) window.KendoBGM.stop();
                } else if (cs && cs.viewPhase === 'event_scene') {
                    // イベント画面：再生中のBGMは停止させずそのまま継続
                    if (!window.KendoBGM.isPlaying || !window.KendoBGM.isPlaying()) {
                        if (window.KendoBGM.play) window.KendoBGM.play('club');
                    }
                } else {
                    if (window.KendoBGM.play) window.KendoBGM.play('club');
                }
            } else {
                if (window.KendoBGM.play) window.KendoBGM.play('club');
            }
        }

        if (window.KendoClub && window.KendoClub.startClubMiniCharaLoop) {
            window.KendoClub.startClubMiniCharaLoop();
        }
    },

    showCombatScreen: function () {
        const modeSelectScreen = document.getElementById('modeSelectScreen');
        const headerModeBar = document.getElementById('headerModeBar');
        const classicStageWrap = document.getElementById('classicStageBarWrap');
        const clubView = document.getElementById('clubModeView');
        const combatArea = document.getElementById('combatAreaWrap');

        if (window.KendoClub && window.KendoClub.stopClubMiniCharaLoop) {
            window.KendoClub.stopClubMiniCharaLoop();
        }

        if (window.KendoClub && window.KendoClub.clearMobilePortal) {
            window.KendoClub.clearMobilePortal();
        }

        if (modeSelectScreen) modeSelectScreen.style.display = 'none';
        if (headerModeBar) headerModeBar.style.display = 'none'; // 戦闘中は余計なUIを隠して集中
        if (classicStageWrap) classicStageWrap.style.display = 'none';
        if (clubView) clubView.style.display = 'none';
        if (combatArea) combatArea.style.display = '';

        // 試合開始前（待機状態）はBGMを停止（審判の「始め！」で再生開始）
        if (window.KendoBGM && window.KendoBGM.stop) {
            window.KendoBGM.stop();
        }
    },

    // 部員カード等のミニキャラ描画（試合中 Canvas 182x200 の半分のサイズ 91x100）
    renderMiniFighter: function (canvas, options = {}) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
        const miniW = options.width || 91;
        const miniH = options.height || 100;
        if (canvas.width !== Math.round(miniW * dpr) || canvas.height !== Math.round(miniH * dpr)) {
            canvas.width = Math.round(miniW * dpr);
            canvas.height = Math.round(miniH * dpr);
        }

        ctx.save();
        if (ctx.scale) ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.clearRect(0, 0, miniW, miniH);

        // 試合中キャンバス（CANVAS_W=182, CANVAS_H=200）の半分のサイズへ縮小
        const scale = miniW / CANVAS_W;
        ctx.scale(scale, scale);

        // ミニ道場床描画
        drawDojoFloor(ctx);

        // 構え/稽古ポーズ取得（部員の得意構え favStance: 'jodan', 'waki', 'chudan' 等 ＆ 練習モーション）
        const stance = options.stance || 'chudan';
        const motion = options.motion || options.practiceType || null;
        const phase = options.phase || 0;
        const pose = (motion && motion !== 'idle') ? getPracticePose(motion, phase, stance) : getContinuousStancePose(stance, phase);

        // 基準位置（足裏接地ライン）
        const baseFootX = CANVAS_W / 2 - 18;
        const pivotX = baseFootX;
        const pivotY = GROUND_Y;

        // 接地シャドウ
        const vScale = CANVAS_W / VIRTUAL_W;
        const backFootScreenX = pivotX + (pose.backFootX - ANCHOR_FOOT_X) * vScale;
        const frontFootScreenX = pivotX + (pose.frontFootX - ANCHOR_FOOT_X) * vScale;
        const midFootScreenX = (backFootScreenX + frontFootScreenX) * 0.5;
        const strideHalfSpan = Math.max(22, Math.abs(frontFootScreenX - backFootScreenX) * 0.62);

        ctx.save();
        ctx.translate(midFootScreenX, GROUND_Y);
        ctx.scale(strideHalfSpan, 7);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 関節補間剣士の描画（部員固有の防具テーマ）
        ctx.save();
        ctx.translate(pivotX, pivotY);
        drawArticulatedPoseOnCanvas(ctx, pose, 1.0, options.armorTheme || null);
        ctx.restore();

        ctx.restore();
    },

    // BGM・システム音量と連動して効果音・ボイスのマスター音量を更新
    updateAudioVolume: function () {
        updateSoundMasterGain();
    },

    getFighterMaxKiai: function (who) {
        return getFighterMaxKiai(who);
    },

    getKiaiBuff: function (who, kiaiLevel, skillVal) {
        return getKiaiBuff(who, kiaiLevel, skillVal);
    },
};

window.playSound = playSound;

// 初期化（システム・描画エンジンの初期化後に、モード選択メニューを表示）
resetGame();
animationLoop();
window.KendoGameEngine.showModeSelect();
