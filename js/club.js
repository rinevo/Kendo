/**
 * ⚔️ 剣道 (Kendo) - 全国制覇モード (高校剣道部 世代交代シミュレーション)
 *
 * プレイヤーは2年生主将として剣道部を率い、
 * 12月3週の地区大会（都道府県予選）で優勝し、
 * 毎年3月4週の全国選抜大会（47都道府県代表）での優勝を目指す。
 * 4月1週に進級と新入部員、9月1週に3年生引退と新主将指名。
 * 試合状況も含めた巻き戻し不可のリアルタイムオートセーブ完備。
 */

(function () {
    'use strict';

    const SAVE_KEY = 'kendo_nationwide_cycle_save_v2';

    // ───────────────────────────────────────────
    // マスターデータ（47都道府県・ランダム生成用）
    // ───────────────────────────────────────────
    const PREFECTURES = [
        '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
        '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
        '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
        '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
        '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県',
        '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
    ];

    const SCHOOL_PREFIXES = [
        '青雲', '白鷺', '鳳凰', '玄武', '龍泉', '紫苑', '明鏡', '蒼天', '黒鉄', '桜ヶ丘',
        '鳴神', '水鏡', '覇道', '北嶺', '南風', '常盤', '橘', '修道', '武蔵野', '開誠',
        '帝京', '錦城', '翔陽', '栄光', '星陵', '清風', '大成', '敬愛', '洛南', '育英',
        '神明', '東雲', '晃華', '光星', '武陽', '聖道', '城北', '城南', '山陽', '北辰'
    ];

    const SURNAMES = [
        '佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤',
        '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水',
        '阿部', '森', '池田', '橋本', '山崎', '石川', '中島', '前田', '藤田', '小川',
        '後藤', '岡田', '長谷川', '村上', '近藤', '石井', '坂本', '遠藤', '青木', '藤井',
        '西村', '福田', '太田', '三浦', '藤原', '岡本', '松田', '中川', '中野', '原田'
    ];

    const FIRSTNAMES = [
        '健太', '蓮', '慎之介', '剛太', '伊織', '大和', '翔太', '悠斗', '陸', '蒼空',
        '陽翔', '颯真', '晴樹', '大輝', '隼人', '拓海', '駿', '悠真', '健一', '龍之介',
        '武蔵', '虎太郎', '直樹', '航平', '誠', '匠', '涼平', '光', '湊', '樹',
        '颯太', '朝陽', '仁', '亮太', '修平', '一真', '達也', '圭佑', '啓太', '拓哉'
    ];

    const CONDITION_DATA = {
        best: { label: '絶好調', icon: '😆', statMod: 1.15, textClass: 'cond-best' },
        good: { label: '好調', icon: '🙂', statMod: 1.08, textClass: 'cond-good' },
        normal: { label: '普通', icon: '😐', statMod: 1.0, textClass: 'cond-normal' },
        poor: { label: '不調', icon: '😕', statMod: 0.92, textClass: 'cond-poor' },
        worst: { label: '絶不調', icon: '😫', statMod: 0.85, textClass: 'cond-worst' },
    };
    const CONDITION_KEYS = ['worst', 'poor', 'normal', 'good', 'best'];

    const POS_NAMES = ['先鋒', '次鋒', '中堅', '副将', '大将'];

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function generateRandomName() {
        return `${getRandomItem(SURNAMES)} ${getRandomItem(FIRSTNAMES)}`;
    }

    function generateRandomSchool(pref = null) {
        const p = pref || getRandomItem(PREFECTURES);
        const name = `${getRandomItem(SCHOOL_PREFIXES)}高校`;
        return { fullName: `${name} (${p})`, shortName: name, pref: p };
    }

    // ───────────────────────────────────────────
    // パラメータ上限 ＆ 成長ヘルパー
    // ───────────────────────────────────────────
    const STAT_HARD_MAX = 99;   // 腕力・敏捷・気魄・面・小手・胴・突きの最大値
    const HEALTH_HARD_MAX = 8;  // 体力の最大値

    // パラメータ成長ヘルパー（才能限界値以上は成長率1/2、上限99でカンスト）
    function growStat(m, category, key, baseGain) {
        if (!baseGain || baseGain <= 0) return 0;

        let curVal = 0;
        let capVal = 70; // デフォルト限界値

        if (category === 'base') {
            curVal = m[key] || 0;
            if (m.talentCaps && m.talentCaps[key]) {
                capVal = m.talentCaps[key];
            }
        } else if (category === 'skill') {
            if (!m.skills) m.skills = { men: 8, kote: 8, do: 8, tsuki: 6 };
            curVal = m.skills[key] || 0;
            if (m.talentCaps && m.talentCaps.skills && m.talentCaps.skills[key]) {
                capVal = m.talentCaps.skills[key];
            }
        }

        // 才能限界値に達しているか
        const isOverCap = curVal >= capVal;

        // 才能限界値以上の場合は成長率1/2
        let effectiveGain = baseGain;
        if (isOverCap) {
            if (baseGain === 1) {
                effectiveGain = Math.random() < 0.5 ? 1 : 0;
            } else {
                effectiveGain = Math.max(1, Math.floor(baseGain / 2));
            }
        }

        const maxLimit = (category === 'base' && key === 'maxHealth') ? HEALTH_HARD_MAX : STAT_HARD_MAX;
        const finalVal = Math.min(maxLimit, curVal + effectiveGain);
        const actualGain = finalVal - curVal;

        if (category === 'base') {
            m[key] = finalVal;
        } else if (category === 'skill') {
            m.skills[key] = finalVal;
        }

        return actualGain;
    }

    // ───────────────────────────────────────────
    // 練習メニュー
    // ───────────────────────────────────────────
    const PRACTICE_MENUS = [
        {
            id: 'basics',
            name: 'すり足・基礎体力',
            icon: '🏃',
            desc: '足さばきと持久力を強化。敏捷・体力が向上。疲労【小】',
            fatigueCost: 10,
            apply: (m) => {
                growStat(m, 'base', 'agi', 1 + (Math.random() < 0.4 ? 1 : 0));
                if (Math.random() < 0.25 && m.maxHealth < HEALTH_HARD_MAX) m.maxHealth += 1;
                growStat(m, 'skill', 'kote', 1);
            },
        },
        {
            id: 'suburi',
            name: '素振り・基本打ち込み',
            icon: '⚔️',
            desc: '竹刀を振り込み、打突の重さと面のキレを鍛える。腕力・面が向上。疲労【中】',
            fatigueCost: 15,
            apply: (m) => {
                growStat(m, 'base', 'str', 1 + (Math.random() < 0.4 ? 1 : 0));
                growStat(m, 'skill', 'men', 1 + (Math.random() < 0.5 ? 1 : 0));
                if (Math.random() < 0.3) growStat(m, 'skill', 'kote', 1);
            },
        },
        {
            id: 'kakari',
            name: '追い込み・掛かり稽古',
            icon: '🔥',
            desc: '息を極限まで切らして打ち込む猛稽古。気魄・技全般が大幅向上。疲労【大】',
            fatigueCost: 24,
            apply: (m) => {
                growStat(m, 'base', 'spi', 2 + (Math.random() < 0.3 ? 1 : 0));
                growStat(m, 'base', 'str', 1);
                growStat(m, 'skill', 'men', 1);
                growStat(m, 'skill', 'do', 1);
                if (Math.random() < 0.35 && m.maxHealth < HEALTH_HARD_MAX) m.maxHealth += 1;
            },
        },
        {
            id: 'zazen',
            name: '座禅・見取り稽古',
            icon: '🧘',
            desc: '精神を研ぎ澄まし集中力を高める。気魄向上・調子アップ・疲労【微回復】',
            fatigueCost: -8,
            apply: (m) => {
                growStat(m, 'base', 'spi', 1 + (Math.random() < 0.4 ? 1 : 0));
                improveCondition(m);
            },
        },
        {
            id: 'rest',
            name: '休養・道具手入れ',
            icon: '🍵',
            desc: '疲労を完全に抜き、竹刀と防具を手入れして英気を養う。疲労【大幅回復】',
            fatigueCost: -45,
            apply: (m) => {
                improveCondition(m);
                if (Math.random() < 0.5) improveCondition(m);
            },
        },
    ];

    function improveCondition(member) {
        const curIdx = CONDITION_KEYS.indexOf(member.condition);
        if (curIdx < CONDITION_KEYS.length - 1) member.condition = CONDITION_KEYS[curIdx + 1];
    }

    function dropCondition(member) {
        const curIdx = CONDITION_KEYS.indexOf(member.condition);
        if (curIdx > 0) member.condition = CONDITION_KEYS[curIdx - 1];
    }

    // ───────────────────────────────────────────
    // 部員ジェネレータ ＆ 個性アーキタイプ
    // ───────────────────────────────────────────
    let memberIdCounter = 1;

    // 部員の個性アーキタイプ（パラメータの強弱付け）
    const MEMBER_ARCHETYPES = [
        {
            id: 'power',
            typeName: '剛腕パワー型',
            stance: 'jodan',
            statMod: { hp: 1, str: 6, agi: -2, spi: 1 },
            skillMod: { men: 5, kote: 0, do: 1, tsuki: -1 },
            desc: '恵まれた体格と豪腕から繰り出す重烈な上段面が武器。力で相手を圧倒する。'
        },
        {
            id: 'speed',
            typeName: '韋駄天スピード型',
            stance: 'chudan',
            statMod: { hp: 0, str: -2, agi: 7, spi: 1 },
            skillMod: { men: 1, kote: 6, do: 0, tsuki: 2 },
            desc: '驚異的な足さばきと瞬発力を誇り、電光石火の出ばな小手を的確に狙い撃つ。'
        },
        {
            id: 'spirit',
            typeName: '不動心気魄型',
            stance: 'chudan',
            statMod: { hp: 1, str: 1, agi: -1, spi: 7 },
            skillMod: { men: 1, kote: 1, do: 5, tsuki: 0 },
            desc: '強靭な精神力と粘り強さを持ち、激しい競り合いから鋭い胴を抜く不動の剣士。'
        },
        {
            id: 'tsuki',
            typeName: '電光石火・突き技巧型',
            stance: 'chudan',
            statMod: { hp: 0, str: 1, agi: 4, spi: 2 },
            skillMod: { men: 0, kote: 1, do: -1, tsuki: 8 },
            desc: '針の穴を通すような高精度の突きを放ち、一瞬の隙から喉元を射抜く精密技術派。'
        },
        {
            id: 'counter',
            typeName: '後の先カウンター型',
            stance: 'waki',
            statMod: { hp: 0, str: 0, agi: 2, spi: 5 },
            skillMod: { men: -1, kote: 2, do: 7, tsuki: 1 },
            desc: '刀を低く隠す脇構えから相手の打ち気を誘い、電撃の返し胴を炸裂させる職人肌。'
        },
        {
            id: 'allround',
            typeName: '万能バランス型',
            stance: 'chudan',
            statMod: { hp: 1, str: 3, agi: 3, spi: 3 },
            skillMod: { men: 3, kote: 3, do: 3, tsuki: 2 },
            desc: '心技体の基本が極めて高水準で穴がなく、どんな相手とも互角以上に戦える優等生。'
        },
        {
            id: 'talent',
            typeName: '大器晩成・原石型',
            stance: 'chudan',
            statMod: { hp: 0, str: -1, agi: -1, spi: 2 },
            skillMod: { men: 1, kote: 1, do: 1, tsuki: 1 },
            desc: '経験はまだ浅いものの底知れぬ素質を秘めており、今後の稽古での急成長が期待される。'
        }
    ];

    // 他部からの掛け持ち（助っ人）テンプレート
    const DUAL_CLUB_TEMPLATES = [
        {
            club: '陸上部',
            badge: '陸上部',
            desc: '陸上部と掛け持ちの助っ人部員。圧倒的なスプリント力で瞬時に間合いを詰めるが、掛け持ちのため剣道の成長は緩やか。',
            stance: 'chudan',
            statMod: { hp: 0, str: -1, agi: 6, spi: 1 },
            skillMod: { men: 1, kote: 4, do: 0, tsuki: 1 }
        },
        {
            club: '柔道部',
            badge: '柔道部',
            desc: '柔道部と掛け持ちの助っ人部員。強靭な体幹と膂力を誇るが、竹刀の扱いにまだ慣れておらず成長は控えめ。',
            stance: 'chudan',
            statMod: { hp: 2, str: 6, agi: -2, spi: 2 },
            skillMod: { men: 3, kote: 0, do: 2, tsuki: -1 }
        },
        {
            club: '野球部',
            badge: '野球部',
            desc: '野球部と掛け持ちの助っ人部員。鋭いバットスイングを活かした面打ちは強烈だが、掛け持ちのため技術の習得に時間を要する。',
            stance: 'jodan',
            statMod: { hp: 1, str: 5, agi: 1, spi: 2 },
            skillMod: { men: 5, kote: -1, do: 1, tsuki: -1 }
        },
        {
            club: '吹奏楽部',
            badge: '吹奏楽部',
            desc: '吹奏楽部と掛け持ちの助っ人部員。金管楽器で鍛えた肺活量と響き渡る気合が武器だが、剣道の練習量は限られる。',
            stance: 'chudan',
            statMod: { hp: -1, str: -2, agi: 0, spi: 7 },
            skillMod: { men: 2, kote: 0, do: 1, tsuki: 3 }
        },
        {
            club: '卓球部',
            badge: '卓球部',
            desc: '卓球部と掛け持ちの助っ人部員。卓越した動体視力と瞬時の反射速度で小手を狙うが、竹刀を振る筋力の成長は緩やか。',
            stance: 'chudan',
            statMod: { hp: 0, str: -2, agi: 5, spi: 1 },
            skillMod: { men: 0, kote: 5, do: 0, tsuki: 1 }
        },
        {
            club: '将棋部',
            badge: '将棋部',
            desc: '将棋部と掛け持ちの助っ人部員。相手の打ち気を先読みする洞察力を持つが、体力・筋力の成長速度は通常より控えめ。',
            stance: 'waki',
            statMod: { hp: -1, str: -2, agi: 1, spi: 6 },
            skillMod: { men: -1, kote: 1, do: 5, tsuki: 2 }
        }
    ];

    // 部員の才能限界値の自動算出
    function generateTalentCaps(archetype, isPlayer = false, isClubDual = false) {
        let baseStr = 58 + Math.floor(Math.random() * 8);
        let baseAgi = 58 + Math.floor(Math.random() * 8);
        let baseSpi = 58 + Math.floor(Math.random() * 8);
        let baseMen = 58 + Math.floor(Math.random() * 8);
        let baseKote = 58 + Math.floor(Math.random() * 8);
        let baseDo = 58 + Math.floor(Math.random() * 8);
        let baseTsuki = 52 + Math.floor(Math.random() * 8);

        if (archetype) {
            const id = archetype.id;
            if (id === 'power') {
                baseStr += 16;
                baseMen += 14;
                baseAgi -= 8;
                baseTsuki -= 8;
            } else if (id === 'speed') {
                baseAgi += 16;
                baseKote += 14;
                baseStr -= 8;
                baseDo -= 6;
            } else if (id === 'spirit') {
                baseSpi += 16;
                baseDo += 14;
                baseAgi -= 6;
            } else if (id === 'tsuki') {
                baseTsuki += 20;
                baseAgi += 8;
                baseDo -= 8;
            } else if (id === 'counter') {
                baseDo += 16;
                baseSpi += 10;
                baseMen -= 8;
            } else if (id === 'allround') {
                baseStr += 8;
                baseAgi += 8;
                baseSpi += 8;
                baseMen += 8;
                baseKote += 8;
                baseDo += 8;
            } else if (id === 'talent') {
                baseStr += 18;
                baseAgi += 18;
                baseSpi += 18;
                baseMen += 18;
                baseKote += 18;
                baseDo += 18;
                baseTsuki += 18;
            }
        }

        if (isPlayer) {
            baseStr = Math.max(baseStr, 74 + Math.floor(Math.random() * 6));
            baseAgi = Math.max(baseAgi, 74 + Math.floor(Math.random() * 6));
            baseSpi = Math.max(baseSpi, 74 + Math.floor(Math.random() * 6));
            baseMen = Math.max(baseMen, 72 + Math.floor(Math.random() * 6));
            baseKote = Math.max(baseKote, 72 + Math.floor(Math.random() * 6));
            baseDo = Math.max(baseDo, 72 + Math.floor(Math.random() * 6));
            baseTsuki = Math.max(baseTsuki, 68 + Math.floor(Math.random() * 6));
        }

        if (isClubDual) {
            baseStr = Math.min(baseStr, 48 + Math.floor(Math.random() * 6));
            baseAgi = Math.min(baseAgi, 48 + Math.floor(Math.random() * 6));
            baseSpi = Math.min(baseSpi, 48 + Math.floor(Math.random() * 6));
            baseMen = Math.min(baseMen, 48 + Math.floor(Math.random() * 6));
            baseKote = Math.min(baseKote, 48 + Math.floor(Math.random() * 6));
            baseDo = Math.min(baseDo, 48 + Math.floor(Math.random() * 6));
            baseTsuki = Math.min(baseTsuki, 45 + Math.floor(Math.random() * 6));
        }

        return {
            str: Math.min(90, Math.max(40, baseStr)),
            agi: Math.min(90, Math.max(40, baseAgi)),
            spi: Math.min(90, Math.max(40, baseSpi)),
            skills: {
                men: Math.min(90, Math.max(40, baseMen)),
                kote: Math.min(90, Math.max(40, baseKote)),
                do: Math.min(90, Math.max(40, baseDo)),
                tsuki: Math.min(90, Math.max(38, baseTsuki)),
            }
        };
    }

    function createMember(name, grade, isPlayer = false, chosenArchetype = null) {
        const archetype = chosenArchetype || (isPlayer
            ? MEMBER_ARCHETYPES.find(a => a.id === 'allround')
            : getRandomItem(MEMBER_ARCHETYPES));

        const stance = archetype.stance || 'chudan';
        const sMod = archetype.statMod || {};
        const skMod = archetype.skillMod || {};

        const baseHp = Math.min(8, Math.max(3, 4 + (grade >= 2 ? 1 : 0) + (sMod.hp || 0) + (Math.random() < 0.3 ? 1 : 0)));
        const baseStr = Math.max(4, 8 + grade * 2 + (sMod.str || 0) + Math.floor(Math.random() * 3));
        const baseAgi = Math.max(4, 8 + grade * 2 + (sMod.agi || 0) + Math.floor(Math.random() * 3));
        const baseSpi = Math.max(4, 8 + grade * 2 + (sMod.spi || 0) + Math.floor(Math.random() * 3));

        const skills = {
            men: Math.max(3, 7 + grade * 2 + (skMod.men || 0) + Math.floor(Math.random() * 2)),
            kote: Math.max(3, 7 + grade * 2 + (skMod.kote || 0) + Math.floor(Math.random() * 2)),
            do: Math.max(3, 7 + grade * 2 + (skMod.do || 0) + Math.floor(Math.random() * 2)),
            tsuki: Math.max(2, 6 + grade * 2 + (skMod.tsuki || 0) + Math.floor(Math.random() * 2)),
        };

        const desc = isPlayer
            ? `${grade}年生の頼れる主将（あなた）。部員を率いて日本一を目指す。`
            : `${grade}年生剣士【${archetype.typeName}】。${archetype.desc}`;

        const talentCaps = generateTalentCaps(archetype, isPlayer, false);

        return {
            id: `mem_${Date.now()}_${memberIdCounter++}`,
            name: name,
            grade: grade, // 1, 2, 3年
            isPlayer: isPlayer,
            archetypeId: archetype.id,
            archetypeName: archetype.typeName,
            talentCaps: talentCaps,
            isClubDual: false,
            originalClub: null,
            growthRate: 1.0,
            maxHealth: Math.min(8, baseHp),
            str: baseStr,
            agi: baseAgi,
            spi: baseSpi,
            skills: skills,
            favStance: stance,
            condition: getRandomItem(['good', 'normal', 'normal', 'best']),
            fatigue: 0,
            desc: desc,
            armorTheme: {
                doStops: ['#0f172a', '#1e293b', '#334155', '#1e293b', '#0a0f1d'],
                muneFill: '#0f172a',
                muneStitch: 'rgba(255, 255, 255, 0.75)',
                tareLine: 'rgba(255, 255, 255, 0.6)',
            },
        };
    }

    // 他部からの掛け持ち助っ人部員生成
    function createDualClubMember(template = null) {
        const tpl = template || getRandomItem(DUAL_CLUB_TEMPLATES);
        const name = generateRandomName();
        const grade = Math.random() < 0.6 ? 1 : 2; // 1年または2年
        const sMod = tpl.statMod || {};
        const skMod = tpl.skillMod || {};

        const baseHp = Math.min(8, Math.max(3, 4 + (grade >= 2 ? 1 : 0) + (sMod.hp || 0)));
        const baseStr = Math.max(4, 7 + grade * 2 + (sMod.str || 0) + Math.floor(Math.random() * 2));
        const baseAgi = Math.max(4, 7 + grade * 2 + (sMod.agi || 0) + Math.floor(Math.random() * 2));
        const baseSpi = Math.max(4, 7 + grade * 2 + (sMod.spi || 0) + Math.floor(Math.random() * 2));

        const skills = {
            men: Math.max(3, 6 + grade * 2 + (skMod.men || 0)),
            kote: Math.max(3, 6 + grade * 2 + (skMod.kote || 0)),
            do: Math.max(3, 6 + grade * 2 + (skMod.do || 0)),
            tsuki: Math.max(2, 5 + grade * 2 + (skMod.tsuki || 0)),
        };

        const talentCaps = generateTalentCaps(null, false, true);

        return {
            id: `mem_dual_${Date.now()}_${memberIdCounter++}`,
            name: name,
            grade: grade,
            isPlayer: false,
            archetypeId: `dual_${tpl.club}`,
            archetypeName: `${tpl.club}助っ人`,
            talentCaps: talentCaps,
            isClubDual: true,
            originalClub: tpl.club,
            growthRate: 0.5, // 成長率は通常より控えめ（50%）
            maxHealth: Math.min(8, baseHp),
            str: baseStr,
            agi: baseAgi,
            spi: baseSpi,
            skills: skills,
            favStance: tpl.stance || 'chudan',
            condition: getRandomItem(['good', 'normal', 'normal']),
            fatigue: 0,
            desc: tpl.desc,
            armorTheme: {
                doStops: ['#1e1b4b', '#312e81', '#4338ca', '#312e81', '#0f172a'],
                muneFill: '#1e1b4b',
                muneStitch: 'rgba(192, 132, 252, 0.75)',
                tareLine: 'rgba(192, 132, 252, 0.6)',
            },
        };
    }

    // 初期チーム生成（主将＝2年生、他に3年・2年・1年が在籍し個性多彩）
    function createInitialTeam(schoolName, pref, captainName) {
        const members = [];
        // 主将（2年生プレイヤー）
        const captain = createMember(captainName, 2, true, MEMBER_ARCHETYPES.find(a => a.id === 'allround'));
        captain.str += 2;
        captain.agi += 2;
        captain.spi += 2;
        members.push(captain);

        // 3年生 2名（剛腕、不動心）
        members.push(createMember(generateRandomName(), 3, false, MEMBER_ARCHETYPES.find(a => a.id === 'power')));
        members.push(createMember(generateRandomName(), 3, false, MEMBER_ARCHETYPES.find(a => a.id === 'spirit')));

        // 2年生 2名（韋駄天、カウンター）
        members.push(createMember(generateRandomName(), 2, false, MEMBER_ARCHETYPES.find(a => a.id === 'speed')));
        members.push(createMember(generateRandomName(), 2, false, MEMBER_ARCHETYPES.find(a => a.id === 'counter')));

        // 1年生 2名（突き特化、大器晩成原石）
        members.push(createMember(generateRandomName(), 1, false, MEMBER_ARCHETYPES.find(a => a.id === 'tsuki')));
        members.push(createMember(generateRandomName(), 1, false, MEMBER_ARCHETYPES.find(a => a.id === 'talent')));

        // 先鋒〜大将の初期オーダー（主将は大将または副将）
        const order = [
            members[5].id, // 1年（先鋒）
            members[3].id, // 2年（次鋒）
            members[1].id, // 3年（中堅）
            members[2].id, // 3年（副将）
            captain.id,    // 主将（大将）
        ];

        return { members, order };
    }

    // ───────────────────────────────────────────
    // クラブ状態管理 (ClubState)
    // ───────────────────────────────────────────
    const ClubState = {
        isConfigured: false, // 初回初期設定済みか
        schoolName: '青雲高校',
        prefecture: '東京都',
        year: 1,      // 1年目〜
        month: 4,     // 4月〜
        week: 1,      // 1週〜4週
        members: [],
        order: [],    // 5人のメンバーID
        qualifiedForNational: false, // 12月3週地区優勝でtrueに
        lastDistrictRank: null,      // 直近の成績 ('win', 'runnerUp', 'best4', etc.)
        lastNationalRank: null,
        activityLog: [],
        viewPhase: 'dashboard',      // 'setup' | 'dashboard' | 'order_edit' | 'match_sim' | 'match_result' | 'history' | 'captain_select'
        currentMatchData: null,      // 進行中の大会試合
        selectedSpecialTargetId: null, // 前回選択した特別指導対象部員ID
        isAutoSpectating: false,     // 主将の出番まで連続リアルタイム観戦中フラグ
        history: [],                 // 歴代年表 [{ year, districtResult, nationalResult, captainName }]
        stats: {
            district: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            national: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
        },
    };

    // ───────────────────────────────────────────
    // 厳格オートセーブ＆ロード
    // ───────────────────────────────────────────
    function saveClubData() {
        try {
            const data = {
                isConfigured: ClubState.isConfigured,
                schoolName: ClubState.schoolName,
                prefecture: ClubState.prefecture,
                year: ClubState.year,
                month: ClubState.month,
                week: ClubState.week,
                members: ClubState.members,
                order: ClubState.order,
                qualifiedForNational: ClubState.qualifiedForNational,
                lastDistrictRank: ClubState.lastDistrictRank,
                lastNationalRank: ClubState.lastNationalRank,
                activityLog: ClubState.activityLog.slice(0, 30),
                viewPhase: ClubState.viewPhase,
                currentMatchData: ClubState.currentMatchData,
                selectedSpecialTargetId: ClubState.selectedSpecialTargetId,
                history: ClubState.history,
                stats: ClubState.stats,
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save club data', e);
        }
    }

    function loadClubData() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            ClubState.isConfigured = !!data.isConfigured;
            ClubState.schoolName = data.schoolName || '青雲高校';
            ClubState.prefecture = data.prefecture || '東京都';
            ClubState.year = data.year || 1;
            ClubState.month = data.month || 4;
            ClubState.week = data.week || 1;
            if (Array.isArray(data.members)) {
                ClubState.members = data.members;
                ClubState.members.forEach((m) => {
                    if (!m.talentCaps) {
                        const arch = MEMBER_ARCHETYPES.find((a) => a.id === m.archetypeId);
                        m.talentCaps = generateTalentCaps(arch, m.isPlayer, m.isClubDual);
                    }
                });
            }
            if (Array.isArray(data.order)) ClubState.order = data.order;
            ClubState.qualifiedForNational = !!data.qualifiedForNational;
            ClubState.lastDistrictRank = data.lastDistrictRank || null;
            ClubState.lastNationalRank = data.lastNationalRank || null;
            if (Array.isArray(data.activityLog)) ClubState.activityLog = data.activityLog;
            ClubState.viewPhase = data.viewPhase || 'dashboard';
            ClubState.currentMatchData = data.currentMatchData || null;
            ClubState.selectedSpecialTargetId = data.selectedSpecialTargetId || null;
            if (Array.isArray(data.history)) ClubState.history = data.history;
            if (data.stats) ClubState.stats = data.stats;
            return true;
        } catch (e) {
            console.error('Failed to load club data', e);
            return false;
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ───────────────────────────────────────────
    // 部員能力レーダーチャート (SVG) 生成関数
    // 最大目盛り＝50、50を超える値も外側に突破して表現
    // ───────────────────────────────────────────
    function generateRadarChartSvg(m, width = 220, height = 200) {
        if (!m) return '';
        const isPlayer = !!m.isPlayer;
        const cx = width / 2;
        const cy = height / 2;
        // 基準最大目盛り（50）の半径
        const r = 52;

        const skills = m.skills || { men: 8, kote: 8, do: 8, tsuki: 6 };

        // 8軸パラメーター定義（体力は最大目盛り=8、他は最大目盛り=50）
        const axes = [
            { key: 'hp', label: '体', fullLabel: '体力', val: m.maxHealth, maxScale: HEALTH_HARD_MAX },
            { key: 'str', label: '腕', fullLabel: '腕力', val: m.str, maxScale: 50 },
            { key: 'agi', label: '敏', fullLabel: '敏捷', val: m.agi, maxScale: 50 },
            { key: 'spi', label: '気', fullLabel: '気魄', val: m.spi, maxScale: 50 },
            { key: 'tsuki', label: '突', fullLabel: '突き', val: skills.tsuki, maxScale: 50 },
            { key: 'do', label: '胴', fullLabel: '胴', val: skills.do, maxScale: 50 },
            { key: 'kote', label: '小', fullLabel: '小手', val: skills.kote, maxScale: 50 },
            { key: 'men', label: '面', fullLabel: '面', val: skills.men, maxScale: 50 },
        ];
        const count = axes.length;

        // グリッド線（目盛り: 15, 30, 50[最大基準目盛り]）
        const gridTicks = [
            { val: 15, ratio: 15 / 50, stroke: 'rgba(148, 163, 184, 0.16)', strokeWidth: 1 },
            { val: 30, ratio: 30 / 50, stroke: 'rgba(148, 163, 184, 0.22)', strokeWidth: 1 },
            { val: 50, ratio: 1.0, stroke: isPlayer ? 'rgba(245, 158, 11, 0.65)' : 'rgba(56, 189, 248, 0.65)', strokeWidth: 1.6 },
        ];

        let gridSvg = '';
        gridTicks.forEach((tick) => {
            const points = [];
            for (let i = 0; i < count; i++) {
                const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
                const x = cx + Math.cos(angle) * r * tick.ratio;
                const y = cy + Math.sin(angle) * r * tick.ratio;
                points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
            }
            gridSvg += `<polygon points="${points.join(' ')}" fill="none" stroke="${tick.stroke}" stroke-width="${tick.strokeWidth}" />\n`;
        });

        // 基準最大目盛り「50」のガイド数値表示（右上軸付近）
        const guideAngle = -Math.PI / 2 + (1 * 2 * Math.PI) / count;
        const guideX = cx + Math.cos(guideAngle) * (r * 1.0) + 4;
        const guideY = cy + Math.sin(guideAngle) * (r * 1.0) - 3;
        gridSvg += `<text x="${guideX.toFixed(1)}" y="${guideY.toFixed(1)}" font-size="9.5" font-weight="900" fill="rgba(148, 163, 184, 0.65)" text-anchor="start">50</text>\n`;

        // 軸線（50超えのデータがある場合、軸線も少し外側まで伸ばす）
        const otherAxes = axes.filter((a) => a.key !== 'hp');
        const maxVal = Math.max(...otherAxes.map((a) => a.val));
        const maxRatio = Math.max(1.0, maxVal / 50);
        const axisExtent = r * Math.max(1.12, maxRatio + 0.08);

        let axesSvg = '';
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
            const x = cx + Math.cos(angle) * axisExtent;
            const y = cy + Math.sin(angle) * axisExtent;
            axesSvg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(148, 163, 184, 0.22)" stroke-width="1.2" />\n`;
        }

        // データポリゴン
        const dataPoints = [];
        let hasOverLimit = false;

        axes.forEach((axis, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
            // 体力は8基準、他は50基準
            const maxScale = axis.maxScale || 50;
            const ratio = Math.max(0.08, axis.val / maxScale);
            const isOver = axis.key !== 'hp' && axis.val > 50;
            if (isOver) hasOverLimit = true;

            const x = cx + Math.cos(angle) * r * ratio;
            const y = cy + Math.sin(angle) * r * ratio;
            dataPoints.push({ x, y, label: axis.label, val: axis.val, isOver: isOver, ratio: ratio });
        });

        const polyPointsStr = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        let fillColor = isPlayer ? 'rgba(245, 158, 11, 0.38)' : 'rgba(56, 189, 248, 0.35)';
        let strokeColor = isPlayer ? '#f59e0b' : '#38bdf8';
        if (hasOverLimit) {
            fillColor = isPlayer ? 'rgba(245, 158, 11, 0.48)' : 'rgba(56, 189, 248, 0.45)';
            strokeColor = isPlayer ? '#fbbf24' : '#00f0ff';
        }

        let dotsSvg = '';
        dataPoints.forEach((p) => {
            if (p.isOver) {
                // 50超えの限界突破ドット（外輪オーラ付き）
                dotsSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="none" stroke="${isPlayer ? '#fde047' : '#38bdf8'}" stroke-width="1.5" stroke-dasharray="2 2" />\n`;
                dotsSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${isPlayer ? '#fde047' : '#ffffff'}" />\n`;
            } else {
                dotsSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.8" fill="${isPlayer ? '#fde047' : '#7dd3fc'}" />\n`;
            }
        });

        // ラベル（項目名＋数値）- 50超え時は頂点位置に合わせて外側へ動的逃げ
        let labelsSvg = '';
        axes.forEach((axis, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
            const pt = dataPoints[i];
            const currentDist = Math.max(r + 25, (r * pt.ratio) + 18);

            let lx = cx + Math.cos(angle) * currentDist;
            let ly = cy + Math.sin(angle) * currentDist;

            let anchor = 'middle';
            let baseline = 'central';

            if (i === 0) { // 上 (体力)
                anchor = 'middle';
                baseline = 'auto';
                ly += 4;
            } else if (i === 1) { // 右上 (腕力)
                anchor = 'start';
                baseline = 'auto';
                lx += 2;
                ly += 2;
            } else if (i === 2) { // 右 (敏捷)
                anchor = 'start';
                baseline = 'central';
                lx += 4;
            } else if (i === 3) { // 右下 (気魄)
                anchor = 'start';
                baseline = 'hanging';
                lx += 2;
                ly -= 2;
            } else if (i === 4) { // 下 (突き)
                anchor = 'middle';
                baseline = 'hanging';
                ly -= 2;
            } else if (i === 5) { // 左下 (胴)
                anchor = 'end';
                baseline = 'hanging';
                lx -= 2;
                ly -= 2;
            } else if (i === 6) { // 左 (小手)
                anchor = 'end';
                baseline = 'central';
                lx -= 4;
            } else if (i === 7) { // 左上 (面)
                anchor = 'end';
                baseline = 'auto';
                lx -= 2;
                ly += 2;
            }

            const labelColor = isPlayer ? '#fef08a' : '#cbd5e1';
            let valColor = isPlayer ? '#fde047' : '#38bdf8';
            let valSuffix = '';
            if (axis.key === 'hp') {
                if (axis.val >= HEALTH_HARD_MAX) {
                    valColor = '#4ade80';
                }
            } else if (axis.val >= STAT_HARD_MAX) {
                valColor = '#ff2222';
                valSuffix = ' MAX🔥';
            } else if (pt.isOver) {
                valColor = '#ff4d4f'; // 50超えはクリムゾン炎カラーで強調
                valSuffix = '🔥';
            }

            labelsSvg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="${baseline}" font-size="16.5" font-weight="800" fill="${labelColor}">${axis.label}<tspan font-size="15" font-weight="900" fill="${valColor}">${axis.val}${valSuffix}</tspan></text>\n`;
        });

        return `
            <svg class="member-radar-chart ${isPlayer ? 'is-player-chart' : ''} ${hasOverLimit ? 'has-over-limit' : ''}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeHtml(m.name)}のパラメーターレーダーチャート">
                <g class="radar-grid">${gridSvg}</g>
                <g class="radar-axes">${axesSvg}</g>
                <polygon class="radar-polygon" points="${polyPointsStr}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${hasOverLimit ? 2.6 : 2.2}" stroke-linejoin="round" />
                <g class="radar-dots">${dotsSvg}</g>
                <g class="radar-labels">${labelsSvg}</g>
            </svg>
        `;
    }

    function getSaveSummary() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || !data.isConfigured) return null;
            const captain = Array.isArray(data.members) ? data.members.find((m) => m.isPlayer) : null;
            return {
                schoolName: data.schoolName || '青雲高校',
                prefecture: data.prefecture || '東京都',
                year: data.year || 1,
                month: data.month || 4,
                week: data.week || 1,
                captainName: captain ? captain.name : '主将',
                memberCount: Array.isArray(data.members) ? data.members.length : 0,
            };
        } catch (e) {
            return null;
        }
    }

    function updateModeCardUI() {
        const container = document.getElementById('clubCardActions');
        if (!container) return;

        const summary = getSaveSummary();
        if (summary) {
            container.innerHTML = `
                <div class="save-data-pill" title="主将: ${escapeHtml(summary.captainName)} / 部員数: ${summary.memberCount}名">
                    <span class="save-icon">💾</span>
                    <span class="save-info">【セーブ有】${escapeHtml(summary.schoolName)} (${escapeHtml(summary.prefecture)}) ${summary.year}年目 ${summary.month}月${summary.week}週</span>
                </div>
                <div class="mode-btn-group">
                    <button type="button" class="btn-mode-start btn-club-continue" onclick="event.stopPropagation(); window.KendoClub.continueGame();">
                        ▶️ 続きから始める
                    </button>
                    <button type="button" class="btn-mode-sub btn-club-restart" onclick="event.stopPropagation(); window.KendoClub.startNewGame();">
                        🔄 最初から始める
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="mode-btn-group">
                    <button type="button" class="btn-mode-start btn-club-start" onclick="event.stopPropagation(); window.KendoClub.startNewGame(true);">
                        ⚔️ 最初から始める
                    </button>
                </div>
            `;
        }
    }

    function resetClubData() {
        localStorage.removeItem(SAVE_KEY);
        ClubState.isConfigured = false;
        ClubState.schoolName = `${getRandomItem(SCHOOL_PREFIXES)}高校`;
        ClubState.prefecture = getRandomItem(PREFECTURES);
        ClubState.year = 1;
        ClubState.month = 4;
        ClubState.week = 1;
        ClubState.members = [];
        ClubState.order = [];
        ClubState.qualifiedForNational = false;
        ClubState.lastDistrictRank = null;
        ClubState.lastNationalRank = null;
        ClubState.activityLog = [];
        ClubState.viewPhase = 'setup';
        ClubState.currentMatchData = null;
        ClubState.selectedSpecialTargetId = null;
        ClubState.history = [];
        ClubState.stats = {
            district: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            national: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
        };
        saveClubData();
    }

    // ───────────────────────────────────────────
    // カレンダー進行と強制大会トリガー
    // ───────────────────────────────────────────
    function getNextWeekInfo() {
        let nYear = ClubState.year;
        let nMonth = ClubState.month;
        let nWeek = ClubState.week + 1;

        if (nWeek > 4) {
            nWeek = 1;
            nMonth += 1;
            if (nMonth > 12) {
                nMonth = 1;
            }
            if (nMonth === 4) {
                nYear += 1; // 3月4週の次は4月1週（新年度進級）
            }
        }
        return { year: nYear, month: nMonth, week: nWeek };
    }

    function advanceCalendarWeek() {
        const next = getNextWeekInfo();
        ClubState.year = next.year;
        ClubState.month = next.month;
        ClubState.week = next.week;

        // 1. 4月1週：進級 ＆ 新入生入部
        if (ClubState.month === 4 && ClubState.week === 1) {
            executeNewSchoolYear();
            return;
        }

        // 2. 9月1週：3年生引退 ＆ 新主将指名
        if (ClubState.month === 9 && ClubState.week === 1) {
            triggerRetireAndCaptainSelection();
            return;
        }

        // 3. 12月3週：地区大会（都道府県予選）強制開催！
        if (ClubState.month === 12 && ClubState.week === 3) {
            if (ClubState.members.length < 5) {
                const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
                const capName = captain ? captain.name : '主将';
                ClubState.qualifiedForNational = false;
                ClubState.lastDistrictRank = '部員不足不出場';
                ClubState.activityLog.unshift(`⚠️【${ClubState.year}年目 12月3週】部員不足（現在${ClubState.members.length}名/必要5名）のため、${ClubState.prefecture}大会（地区予選）への出場を辞退しました。新入生の勧誘と稽古に励みます。`);
                ClubState.history.unshift({
                    year: ClubState.year,
                    captainName: capName,
                    districtResult: '部員不足不出場',
                    nationalResult: '不出場',
                });
            } else {
                triggerDistrictTournament();
                return;
            }
        }

        // 4. 3月4週：全国選抜大会（地区優勝時のみ強制開催）
        if (ClubState.month === 3 && ClubState.week === 4) {
            if (ClubState.qualifiedForNational) {
                if (ClubState.members.length < 5) {
                    const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
                    const capName = captain ? captain.name : '主将';
                    ClubState.lastNationalRank = '部員不足不出場';
                    ClubState.activityLog.unshift(`⚠️【${ClubState.year}年目 3月4週】全国大会出場権を獲得していましたが、部員不足（現在${ClubState.members.length}名/必要5名）のため出場を辞退しました。`);

                    const existingHist = ClubState.history.find((h) => h.year === ClubState.year);
                    if (existingHist) {
                        existingHist.nationalResult = '部員不足不出場';
                    } else {
                        ClubState.history.unshift({
                            year: ClubState.year,
                            captainName: capName,
                            districtResult: ClubState.lastDistrictRank || '優勝',
                            nationalResult: '部員不足不出場',
                        });
                    }
                } else {
                    triggerNationalTournament();
                    return;
                }
            } else {
                ClubState.activityLog.unshift(`【${ClubState.year}年目 3月4週】全国大会が開催されていますが、本校は地区予選敗退のため不出場。新年度へ向け稽古に励みます。`);
            }
        }

        saveClubData();
        renderClubUI();
    }

    // 4月1週：新年度進級 ＆ 新1年生入部
    function executeNewSchoolYear() {
        // 進級
        ClubState.members.forEach((m) => {
            m.grade += 1;
        });

        // 成績に応じた新入生人数の決定（直近の成績が良いほど入部数増加）
        let recruitCount = 2; // デフォルト
        if (ClubState.lastNationalRank === 'win') recruitCount = 5;
        else if (ClubState.lastNationalRank === 'runnerUp' || ClubState.lastNationalRank === 'best4') recruitCount = 4;
        else if (ClubState.lastDistrictRank === 'win') recruitCount = 3 + (Math.random() < 0.5 ? 1 : 0);
        else if (ClubState.lastDistrictRank === 'runnerUp') recruitCount = 2 + (Math.random() < 0.4 ? 1 : 0);
        else recruitCount = 1 + (Math.random() < 0.5 ? 1 : 0);

        // 廃部防止セーフティ（最低2名は部員を確保）
        const curCount = ClubState.members.length;
        if (curCount + recruitCount < 2) {
            recruitCount = Math.max(recruitCount, 2 - curCount);
        }

        const newRecruits = [];
        for (let i = 0; i < recruitCount; i++) {
            const recruit = createMember(generateRandomName(), 1, false);
            ClubState.members.push(recruit);
            newRecruits.push(`${recruit.name}（${recruit.archetypeName || '一般'}）`);
        }

        // 権利リセット
        ClubState.qualifiedForNational = false;

        const logMsg = `🌸【${ClubState.year}年目 4月1週】新年度が始まりました！部員が進級し、新1年生が${recruitCount}名（${newRecruits.join('・')}）入部しました！`;
        ClubState.activityLog.unshift(logMsg);

        // オーダーの欠員・不正IDを補正
        sanitizeOrder();

        saveClubData();
        renderClubUI();
    }

    // 9月1週：3年生引退 ＆ 新主将指名
    function triggerRetireAndCaptainSelection() {
        const retiredNames = ClubState.members.filter((m) => m.grade >= 3).map((m) => m.name);
        // 3年生を名簿から削除
        ClubState.members = ClubState.members.filter((m) => m.grade < 3);

        const logMsg = `🍂【${ClubState.year}年目 9月1週】3年生（${retiredNames.join('・')}）が夏の大会を終えて引退しました。新チーム始動のため、新主将を指名してください。`;
        ClubState.activityLog.unshift(logMsg);

        sanitizeOrder();

        // 新主将指名画面へ
        ClubState.viewPhase = 'captain_select';
        saveClubData();
        renderClubUI();
    }

    // オーダー整合性チェック
    function sanitizeOrder() {
        const validIds = new Set(ClubState.members.map((m) => m.id));
        const newOrder = ClubState.order.filter((id) => validIds.has(id));

        // 足りない枠は未配置のメンバーで埋める
        const usedIds = new Set(newOrder);
        ClubState.members.forEach((m) => {
            if (newOrder.length < 5 && !usedIds.has(m.id)) {
                newOrder.push(m.id);
                usedIds.add(m.id);
            }
        });

        ClubState.order = newOrder;
    }

    // ───────────────────────────────────────────
    // 練習実行
    // ───────────────────────────────────────────
    function executePractice(menuId, targetMemberId = null) {
        const menu = menuId === 'special' ? null : PRACTICE_MENUS.find((m) => m.id === menuId);
        if (!menu && menuId !== 'special') return;

        let logEntry = '';
        if (menuId === 'special') {
            const target = ClubState.members.find((m) => m.id === targetMemberId);
            const player = ClubState.members.find((m) => m.isPlayer);
            if (target && player) {
                ClubState.selectedSpecialTargetId = targetMemberId;
                // 掛け持ち部員は成長が緩やか（各能力+1、通常は+2）。才能限界値以上はgrowStatで1/2に
                const baseGain = target.isClubDual ? 1 : 2;
                growStat(target, 'base', 'str', baseGain);
                growStat(target, 'base', 'agi', baseGain);
                growStat(target, 'base', 'spi', baseGain);
                growStat(target, 'skill', 'men', baseGain);
                growStat(target, 'skill', 'kote', baseGain);
                growStat(target, 'skill', 'do', baseGain);
                growStat(target, 'skill', 'tsuki', baseGain);
                target.fatigue = Math.min(100, Math.max(0, target.fatigue + 18));
                improveCondition(target);

                growStat(player, 'base', 'str', 1);
                growStat(player, 'base', 'spi', 2);
                player.fatigue = Math.min(100, Math.max(0, player.fatigue + 16));

                const dualText = target.isClubDual ? `（${target.originalClub}と掛け持ちのため成長は緩やか）` : '';
                logEntry = `【${ClubState.year}年目 ${ClubState.month}月${ClubState.week}週】主将が${target.name}へマンツーマン特別指導を実施！${target.name}の全能力が${baseGain === 1 ? '着実に' : '急伸'}向上！${dualText}`;
            }
        } else {
            ClubState.members.forEach((m) => {
                // 他部との掛け持ち部員は練習頻度が限られるため成長確率50%
                if (m.isClubDual) {
                    if (Math.random() < 0.5) menu.apply(m);
                } else {
                    menu.apply(m);
                }
                m.fatigue = Math.min(100, Math.max(0, m.fatigue + menu.fatigueCost));
                if (m.fatigue >= 80 && Math.random() < 0.6) dropCondition(m);
                else if (m.fatigue === 0 && Math.random() < 0.3) improveCondition(m);
            });
            logEntry = `【${ClubState.year}年目 ${ClubState.month}月${ClubState.week}週】全体稽古【${menu.name}】を実施！心技体を鍛えました。`;
        }

        ClubState.activityLog.unshift(logEntry);
        advanceCalendarWeek();
    }

    // ───────────────────────────────────────────
    // トーナメント生成エンジン
    // ───────────────────────────────────────────
    function generateOpponentTeam(schoolName, pref, powerGrade = 2) {
        const members = [];
        for (let i = 0; i < 5; i++) {
            const stances = ['chudan', 'chudan', 'jodan', 'waki'];
            const stance = getRandomItem(stances);
            const baseHp = 4 + (powerGrade >= 3 ? 1 : 0) + (Math.random() < 0.4 ? 1 : 0);
            const str = 9 + powerGrade * 2 + Math.floor(Math.random() * 4);
            const agi = 9 + powerGrade * 2 + Math.floor(Math.random() * 4);
            const spi = 9 + powerGrade * 2 + Math.floor(Math.random() * 4);

            members.push({
                name: getRandomItem(SURNAMES),
                role: POS_NAMES[i],
                hp: Math.min(8, baseHp),
                str: str,
                agi: agi,
                spi: spi,
                skills: {
                    men: 9 + powerGrade * 2,
                    kote: 9 + powerGrade * 2,
                    do: 8 + powerGrade * 2,
                    tsuki: 7 + powerGrade * 2,
                },
                stance: stance,
            });
        }
        return {
            schoolName: schoolName,
            pref: pref,
            shortDesc: `${pref}の強豪。隙のない布陣で一本を狙う。`,
            members: members,
        };
    }

    // 12月3週：地区大会（都道府県予選・8校トーナメント：準々決勝、準決勝、決勝）
    function triggerDistrictTournament() {
        const pref = ClubState.prefecture;
        const roundNames = ['地区予選 準々決勝', '地区予選 準決勝', '地区予選 決勝戦'];
        const rounds = roundNames.map((rName, idx) => {
            const oppSchool = `${getRandomItem(SCHOOL_PREFIXES)}高校`;
            return {
                roundIndex: idx,
                roundName: rName,
                oppTeam: generateOpponentTeam(oppSchool, pref, idx + 1),
            };
        });

        ClubState.currentMatchData = {
            type: 'district',
            title: `第${ClubState.year}期 ${pref}大会（地区予選）`,
            rounds: rounds,
            currentRoundIdx: 0,
            activeBouts: null,
            isTournamentOver: false,
            rankAchieved: null,
        };

        ClubState.viewPhase = 'match_sim';
        setupCurrentBouts();
        saveClubData();
        renderClubUI();
    }

    // 3月4週：全国選抜大会（47都道府県代表・5回戦制トーナメント）
    function triggerNationalTournament() {
        const roundNames = ['全国選抜 1回戦', '全国選抜 2回戦', '全国選抜 準々決勝', '全国選抜 準決勝', '全国選抜 決勝戦'];
        const otherPrefs = PREFECTURES.filter((p) => p !== ClubState.prefecture);

        const rounds = roundNames.map((rName, idx) => {
            const p = getRandomItem(otherPrefs);
            const oppSchool = `${getRandomItem(SCHOOL_PREFIXES)}高校`;
            return {
                roundIndex: idx,
                roundName: rName,
                oppTeam: generateOpponentTeam(oppSchool, p, idx + 2),
            };
        });

        ClubState.currentMatchData = {
            type: 'national',
            title: `第${ClubState.year}回 全国高等学校剣道選抜大会`,
            rounds: rounds,
            currentRoundIdx: 0,
            activeBouts: null,
            isTournamentOver: false,
            rankAchieved: null,
        };

        ClubState.viewPhase = 'match_sim';
        setupCurrentBouts();
        saveClubData();
        renderClubUI();
    }

    function setupCurrentBouts() {
        const match = ClubState.currentMatchData;
        if (!match) return;

        const round = match.rounds[match.currentRoundIdx];
        const bouts = [];
        for (let i = 0; i < 5; i++) {
            const memberId = ClubState.order[i];
            const myMember = ClubState.members.find((m) => m.id === memberId) || ClubState.members[0];
            const enemyMember = round.oppTeam.members[i];

            bouts.push({
                posIndex: i,
                posName: POS_NAMES[i],
                myMember: myMember,
                enemyMember: enemyMember,
                isPlayerBout: myMember.isPlayer,
                played: false,
                winner: null, // 'my' | 'enemy' | 'draw'
                myScore: [],
                enemyScore: [],
                log: [],
            });
        }

        match.activeBouts = {
            roundName: round.roundName,
            schoolName: round.oppTeam.schoolName,
            pref: round.oppTeam.pref,
            shortDesc: round.oppTeam.shortDesc,
            bouts: bouts,
            currentBoutIndex: 0,
            isFinished: false,
            myWins: 0,
            enemyWins: 0,
            draws: 0,
            finalResult: null,
        };
        saveClubData();
    }

    // ───────────────────────────────────────────
    // 仲間AI勝敗シミュレーション
    // ───────────────────────────────────────────
    function simulateAIBout(bout) {
        const my = bout.myMember;
        const opp = bout.enemyMember;

        const myCondMod = CONDITION_DATA[my.condition]?.statMod || 1.0;
        const myPower = (my.str * 1.2 + my.agi * 1.3 + my.spi * 1.1 + (my.skills.men + my.skills.kote + my.skills.do) * 0.4) * myCondMod;
        const oppPower = opp.str * 1.2 + opp.agi * 1.3 + opp.spi * 1.1 + (opp.skills.men + opp.skills.kote + opp.skills.do) * 0.4;

        const fatiguePenalty = Math.max(0.6, 1.0 - (my.fatigue / 100) * 0.35);
        const myFinal = myPower * fatiguePenalty;
        const total = myFinal + oppPower;
        const myWinRate = myFinal / total;

        bout.played = true;
        bout.log = [];

        const myTechs = ['メ', 'コ', 'ド'];
        if (my.skills.tsuki >= 12) myTechs.push('ツ');
        const oppTechs = ['メ', 'コ', 'ド'];
        if (opp.skills.tsuki >= 12) oppTechs.push('ツ');

        const pickTech = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const techFullNames = { 'メ': '面', 'コ': '小手', 'ド': '胴', 'ツ': '突き' };

        const roll = Math.random();
        if (roll < myWinRate * 0.55) {
            const t1 = pickTech(myTechs);
            const t2 = pickTech(myTechs);
            bout.myScore = [t1, t2];
            bout.winner = 'my';
            bout.log.push(`${my.name}が鋭い踏み込みから鮮やかな【${techFullNames[t1]}】を決めて先取！`);
            bout.log.push(`相手の反撃をいなし、電光石火の【${techFullNames[t2]}】！二本勝ち！`);
        } else if (roll < myWinRate) {
            const t1 = pickTech(myTechs);
            bout.myScore = [t1];
            bout.winner = 'my';
            bout.log.push(`白熱の鍔迫り合いから、${my.name}が渾身の【${techFullNames[t1]}】！一本勝ち！`);
        } else if (roll < myWinRate + (1 - myWinRate) * 0.25) {
            bout.winner = 'draw';
            bout.log.push(`互いに譲らぬ攻防の末、決定打なく【引き分け】！`);
        } else if (roll < myWinRate + (1 - myWinRate) * 0.65) {
            const t1 = pickTech(oppTechs);
            bout.enemyScore = [t1];
            bout.winner = 'enemy';
            bout.log.push(`相手の鋭い出ばな【${techFullNames[t1]}】を奪われ惜敗…`);
        } else {
            const t1 = pickTech(oppTechs);
            const t2 = pickTech(oppTechs);
            bout.enemyScore = [t1, t2];
            bout.winner = 'enemy';
            bout.log.push(`相手の猛攻を受け、【${techFullNames[t1]}】【${techFullNames[t2]}】を奪われ敗北…`);
        }
        saveClubData();
    }

    function evaluateTeamMatch(boutsData) {
        let myW = 0, oppW = 0, d = 0, myPts = 0, oppPts = 0;
        boutsData.bouts.forEach((b) => {
            if (b.winner === 'my') myW++;
            else if (b.winner === 'enemy') oppW++;
            else d++;
            myPts += b.myScore.length;
            oppPts += b.enemyScore.length;
        });

        boutsData.myWins = myW;
        boutsData.enemyWins = oppW;
        boutsData.draws = d;

        if (myW > oppW) boutsData.finalResult = 'win';
        else if (oppW > myW) boutsData.finalResult = 'lose';
        else {
            if (myPts > oppPts) boutsData.finalResult = 'win';
            else if (oppPts > myPts) boutsData.finalResult = 'lose';
            else boutsData.finalResult = myW >= oppW ? 'win' : 'lose';
        }
        saveClubData();
    }

    // ───────────────────────────────────────────
    // UI レンダリング
    // ───────────────────────────────────────────
    function updateGlobalTournamentBackground(tourneyType) {
        if (!document.body) return;
        document.body.classList.remove('bg-national', 'bg-district');
        if (tourneyType === 'national' || tourneyType === 'district') {
            document.body.classList.add(`bg-${tourneyType}`);
        }
    }

    function renderClubUI() {
        const container = document.getElementById('clubModeView');
        if (!container) return;

        // 大会中（スコアボードまたは結果画面）は全体の背景（body）にも大会画像を反映
        const isTourney = (ClubState.viewPhase === 'match_sim' || ClubState.viewPhase === 'match_result') && ClubState.currentMatchData;
        updateGlobalTournamentBackground(isTourney ? ClubState.currentMatchData.type : null);

        if (!ClubState.isConfigured || ClubState.viewPhase === 'setup') {
            renderSetupScreen(container);
        } else if (ClubState.viewPhase === 'captain_select') {
            renderCaptainSelectScreen(container);
        } else if (ClubState.viewPhase === 'order_edit') {
            renderOrderEditor(container);
        } else if (ClubState.viewPhase === 'history') {
            renderHistoryScreen(container);
        } else if (ClubState.viewPhase === 'match_sim') {
            renderMatchSimulator(container);
        } else if (ClubState.viewPhase === 'match_result') {
            renderMatchResult(container);
        } else {
            renderDashboard(container);
        }
    }

    // 初期設定画面
    function renderSetupScreen(container) {
        const defaultSchool = `${getRandomItem(SCHOOL_PREFIXES)}高校`;
        const defaultPref = getRandomItem(PREFECTURES);
        const defaultCaptain = generateRandomName();

        const prefOptions = PREFECTURES.map((p) => `<option value="${p}" ${p === defaultPref ? 'selected' : ''}>${p}</option>`).join('');

        container.innerHTML = `
            <div class="setup-modal-view">
                <div class="setup-card">
                    <div class="setup-header">
                        <span class="setup-icon">⚔️</span>
                        <h2>高校剣道部 創設</h2>
                        <p class="setup-sub">あなたは2年生主将として部を率い、全国選抜大会での日本一を目指します。</p>
                    </div>

                    <form class="setup-form" onsubmit="event.preventDefault(); window.KendoClub.submitSetup();">
                        <div class="form-group">
                            <label for="inpSchoolName">🏫 学校名</label>
                            <input type="text" id="inpSchoolName" value="${defaultSchool}" required maxlength="12" />
                        </div>

                        <div class="form-group">
                            <label for="selPrefecture">🗾 所在地（都道府県）</label>
                            <select id="selPrefecture">
                                ${prefOptions}
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="inpCaptainName">🧑‍🎓 2年生 主将の名前（あなたの名前）</label>
                            <input type="text" id="inpCaptainName" value="${defaultCaptain}" required maxlength="10" />
                        </div>

                        <div class="setup-rules-info">
                            <h4>📜 大会ルールと部活の歩み</h4>
                            <ul>
                                <li><strong>12月3週</strong>：地区予選（都道府県トーナメント）。優勝校のみ全国選抜へ！</li>
                                <li><strong>3月4週</strong>：全国高校剣道選抜大会（47都道府県代表トーナメント）！</li>
                                <li><strong>4月1週</strong>：進級＆成績に応じた新入部員が入部。</li>
                                <li><strong>9月1週</strong>：3年生引退。2年生から次期主将を指名して歴史を紡ぐ！</li>
                                <li><strong>オートセーブ完備</strong>：試合の勝敗状況も保存されやり直し不可。</li>
                            </ul>
                        </div>

                        <button type="submit" class="btn-setup-start">
                            🥋 剣道部を創設して開始する
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    // 新主将指名画面（9月1週）
    function renderCaptainSelectScreen(container) {
        const candidates = ClubState.members.filter((m) => m.grade === 2);
        const candidateCards = candidates.map((m) => {
            return `
                <div class="captain-candidate-card" onclick="window.KendoClub.selectNewCaptain('${m.id}')">
                    <div class="candidate-header">
                        <strong>${escapeHtml(m.name)}</strong>
                        <span class="cand-grade">新2年生</span>
                    </div>
                    <div class="member-radar-wrap">
                        ${generateRadarChartSvg(m, 220, 200)}
                    </div>
                    <div class="member-stats-summary-row">
                        <span class="stat-summary-tag">構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '脇' : '中段'}</span>
                        <span class="stat-summary-tag">戦力: ${Math.round(m.str + m.agi + m.spi + (m.skills.men + m.skills.kote + m.skills.do + m.skills.tsuki) * 0.4)}</span>
                    </div>
                    <button type="button" class="btn-choose-captain">
                        👑 新主将に指名する
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="captain-select-view">
                <div class="captain-select-header">
                    <span class="cs-icon">👑</span>
                    <h2>新主将の指名（世代交代）</h2>
                    <p>3年生の引退に伴い、2年生の中から次の主将を指名してください。<br>指名された部員が新たなあなたの分身（プレイヤー）となります。</p>
                </div>
                <div class="candidate-grid">
                    ${candidateCards}
                </div>
            </div>
        `;
    }

    // ダッシュボード画面
    function renderDashboard(container) {
        const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];

        // 大会ステータスバナー
        let bannerHtml = '';
        const memberCount = ClubState.members.length;
        const isShortage = memberCount < 5;

        if (ClubState.month === 12 && ClubState.week === 3) {
            if (isShortage) {
                bannerHtml = `
                    <div class="tourney-alert shortage">
                        <span class="shortage-icon">⚠️</span>
                        <div class="alert-body">
                            <strong class="text-danger">【12月3週 地区大会（都道府県予選）】部員不足のため不出場</strong>
                            <p>団体戦大会には最低5名の選手が必要です（現在部員数: <strong class="highlight-count">${memberCount} / 5名</strong>）。今回は出場を辞退し、稽古を進めます。</p>
                        </div>
                    </div>
                `;
            } else {
                bannerHtml = `
                    <div class="tourney-alert ready">
                        <span class="pulse-icon">🔥</span>
                        <div class="alert-body">
                            <strong>【12月3週 地区大会（都道府県予選）】決戦！</strong>
                            <p>優勝校のみが3月の全国選抜大会への切符を掴めます！</p>
                        </div>
                        <button type="button" class="btn-battle-launch" onclick="window.KendoClub.startTournamentMatch()">
                            ⚔️ 地区予選に出陣する！
                        </button>
                    </div>
                `;
            }
        } else if (ClubState.month === 3 && ClubState.week === 4 && ClubState.qualifiedForNational) {
            if (isShortage) {
                bannerHtml = `
                    <div class="tourney-alert shortage gold">
                        <span class="shortage-icon">⚠️</span>
                        <div class="alert-body">
                            <strong class="text-danger">【3月4週 全国高校剣道選抜大会】部員不足のため不出場</strong>
                            <p>全国大会の出場資格を獲得していましたが、部員不足（現在: <strong class="highlight-count">${memberCount} / 5名</strong>）のため出場を辞退しました。</p>
                        </div>
                    </div>
                `;
            } else {
                bannerHtml = `
                    <div class="tourney-alert ready gold">
                        <span class="pulse-icon">👑</span>
                        <div class="alert-body">
                            <strong>【3月4週 全国高校剣道選抜大会】開幕！</strong>
                            <p>47都道府県代表の頂点へ！日本一をかけた決戦の舞台！</p>
                        </div>
                        <button type="button" class="btn-battle-launch gold-btn" onclick="window.KendoClub.startTournamentMatch()">
                            🏆 全国大会に出陣する！
                        </button>
                    </div>
                `;
            }
        } else {
            let nextEventText = '';
            if (ClubState.month < 9) nextEventText = '9月1週：3年生引退 ＆ 新主将指名';
            else if (ClubState.month < 12 || (ClubState.month === 12 && ClubState.week < 3)) nextEventText = '12月3週：地区予選（都道府県トーナメント）';
            else if (ClubState.qualifiedForNational) nextEventText = '3月4週：全国高校選抜大会（47都道府県代表）';
            else nextEventText = '4月1週：新年度進級 ＆ 新入部員入部';

            bannerHtml = `
                <div class="tourney-alert pending">
                    <span class="calendar-icon">📅</span>
                    <div class="alert-body">
                        <strong>次の重要日程：${nextEventText}</strong>
                        <p>${ClubState.qualifiedForNational ? '🎖️ 全国選抜大会出場権 獲得中！' : '日々の稽古で心技体を練磨せよ！'}</p>
                    </div>
                </div>
            `;
        }

        // 部員カード一覧（5つのポジション枠に合わせて表示）
        const memberCardsHtml = POS_NAMES.map((pos, idx) => {
            const memberId = ClubState.order[idx];
            const m = memberId ? ClubState.members.find((item) => item.id === memberId) : null;
            if (!m) {
                return `
                    <div class="club-member-card empty-slot">
                        <div class="member-header">
                            <span class="member-pos-badge empty">${pos}</span>
                            <span class="member-name text-muted">【欠員】</span>
                        </div>
                        <div class="empty-slot-body">
                            <span class="empty-icon">⚠️</span>
                            <p>選手が不足しています<br><span class="empty-sub">（大会出場には5名必要）</span></p>
                            <button type="button" class="btn-slot-recruit" onclick="window.KendoClub.recruitDualClubMember()">
                                🏃 他部から助っ人を勧誘
                            </button>
                        </div>
                    </div>
                `;
            }
            const cond = CONDITION_DATA[m.condition] || CONDITION_DATA.normal;

            return `
                <div class="club-member-card ${m.isPlayer ? 'is-player' : ''} ${m.isClubDual ? 'is-dual-club' : ''}">
                    <div class="member-header">
                        <span class="member-pos-badge">${pos}</span>
                        <span class="member-name">${escapeHtml(m.name)}</span>
                        <span class="member-grade-badge">${m.grade}年</span>
                        <span class="member-cond ${cond.textClass}" title="調子: ${cond.label}">${cond.icon}</span>
                    </div>
                    ${m.isClubDual ? `
                        <div class="member-dual-row">
                            <span class="member-dual-badge" title="${escapeHtml(m.originalClub)}と掛け持ち（成長率50%）">${escapeHtml(m.originalClub)}（助っ人）</span>
                        </div>
                    ` : ''}
                    <div class="member-desc">${escapeHtml(m.desc)}</div>
                    <div class="member-radar-wrap">
                        ${generateRadarChartSvg(m, 220, 200)}
                    </div>
                    <div class="member-stats-summary-row">
                        <span class="stat-summary-tag">構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '脇' : '中段'}</span>
                        <span class="stat-summary-tag">戦力: ${Math.round(m.str + m.agi + m.spi + (m.skills.men + m.skills.kote + m.skills.do + m.skills.tsuki) * 0.4)}</span>
                        ${m.isClubDual ? '<span class="stat-summary-tag tag-dual">成長率: 50%</span>' : ''}
                    </div>
                    <div class="member-fatigue-row">
                        <span class="fatigue-label">疲労度: ${m.fatigue}%</span>
                        <div class="fatigue-bar-wrap">
                            <div class="fatigue-bar-fill ${m.fatigue > 60 ? 'high' : ''}" style="width: ${m.fatigue}%;"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // 控え部員一覧
        const benchMembers = ClubState.members.filter((m) => !ClubState.order.includes(m.id));
        const benchHtml = benchMembers.length ? `
            <div class="bench-members-box">
                <h4>👥 控え部員 (${benchMembers.length}名)</h4>
                <div class="bench-list">
                    ${benchMembers.map((m) => `<span class="bench-pill ${m.isClubDual ? 'dual-pill' : ''}">${m.name} (${m.grade}年${m.isClubDual ? '・' + m.originalClub : ''}・体${m.maxHealth}/腕${m.str}/敏${m.agi}/気${m.spi})</span>`).join('')}
                </div>
            </div>
        ` : '';

        // 練習メニュー
        const practiceButtonsHtml = PRACTICE_MENUS.map((menu) => {
            return `
                <button type="button" class="btn-practice" onclick="window.KendoClub.onSelectPractice('${menu.id}')">
                    <span class="p-icon">${menu.icon}</span>
                    <div class="p-info">
                        <strong class="p-name">${menu.name}</strong>
                        <span class="p-desc">${menu.desc}</span>
                    </div>
                </button>
            `;
        }).join('');

        // 特別指導対象セレクター（自分以外・前回選択者を保持）
        const teammates = ClubState.members.filter((m) => !m.isPlayer);
        let targetId = ClubState.selectedSpecialTargetId;
        if (!targetId || !teammates.some((m) => m.id === targetId)) {
            targetId = teammates.length ? teammates[0].id : null;
            ClubState.selectedSpecialTargetId = targetId;
        }
        const teammateOptions = teammates.map((m) => {
            const dualLabel = m.isClubDual ? ` [${m.originalClub}掛け持ち]` : '';
            return `<option value="${m.id}" ${m.id === targetId ? 'selected' : ''}>${escapeHtml(m.name)} (${m.grade}年${dualLabel})</option>`;
        }).join('');

        // 活動日誌
        const logHtml = ClubState.activityLog.slice(0, 5).map((log) => `<li>${log}</li>`).join('');

        container.innerHTML = `
            <div class="club-dashboard">
                <div class="club-top-bar">
                    <div class="club-title-group">
                        <h2>🥋 ${ClubState.schoolName} 剣道部</h2>
                        <span class="club-subtitle">${ClubState.prefecture}代表 / 主将：${captain ? captain.name : 'あなた'} (${captain ? captain.grade : 2}年)</span>
                    </div>
                    <div class="club-header-right">
                        <div class="club-week-badge">
                            <span class="week-num">${ClubState.year}年目 ${ClubState.month}月 ${ClubState.week}週</span>
                        </div>
                        <button type="button" class="btn-view-history" onclick="window.KendoClub.openHistoryScreen()">
                            🏆 歴代戦績
                        </button>
                    </div>
                </div>

                ${bannerHtml}

                ${isShortage ? `
                    <div class="shortage-notice-banner">
                        <span class="snb-icon">⚠️</span>
                        <div class="snb-body">
                            <strong>【部員不足警告】 現在の部員数は ${memberCount}名 です</strong>
                            <p>大会（団体戦）に出場するには最低5名の部員が必要です（あと <strong>${5 - memberCount}名</strong> 不足）。他部から掛け持ちの助っ人を勧誘してメンバーを揃えられます。</p>
                        </div>
                        <button type="button" class="btn-recruit-dual" onclick="window.KendoClub.recruitDualClubMember()">
                            🏃 他部から助っ人を勧誘する（現在${memberCount}/5名）
                        </button>
                    </div>
                ` : ''}

                <div class="section-title-wrap">
                    <h3>👥 出場オーダー（先鋒・次鋒・中堅・副将・大将）</h3>
                    <button type="button" class="btn-edit-order" onclick="window.KendoClub.openOrderEditor()">
                        🔄 オーダー編成を変更する
                    </button>
                </div>

                <div class="club-members-grid">
                    ${memberCardsHtml}
                </div>

                ${benchHtml}

                <div class="training-section-wrap">
                    <h3>🎋 今週の練習メニューを選択（1週進行）</h3>
                    <div class="practice-grid">
                        ${practiceButtonsHtml}
                    </div>

                    <div class="special-training-box">
                        <div class="special-header">
                            <span class="special-icon">🤝</span>
                            <strong>主将によるマンツーマン特別指導</strong>
                        </div>
                        <p class="special-desc">あなたが直接仲間を指名して重点指導。対象部員の全能力と技が大幅に伸びます（掛け持ち部員は成長率が控えめになります）。</p>
                        <div class="special-actions">
                            <select id="selSpecialTarget" class="sel-target-member" onchange="window.KendoClub.onChangeSpecialTarget(this.value)">
                                ${teammateOptions || '<option value="">指導対象の部員がいません</option>'}
                            </select>
                            <button type="button" class="btn-special-practice" onclick="window.KendoClub.onSpecialPractice()">
                                🥋 指名して特訓開始！
                            </button>
                        </div>
                    </div>
                </div>

                <div class="club-log-box">
                    <h4>📜 部活動日誌</h4>
                    <ul class="club-log-list">
                        ${logHtml}
                    </ul>
                    <div class="reset-data-wrap">
                        <button type="button" class="btn-club-reset" onclick="window.KendoClub.confirmReset()">
                            🗑️ データをリセットして最初から
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // オーダー編成画面
    function renderOrderEditor(container) {
        const orderHtml = POS_NAMES.map((pos, idx) => {
            const memberId = ClubState.order[idx];
            const m = memberId ? ClubState.members.find((item) => item.id === memberId) : null;
            if (!m) {
                return `
                    <div class="order-slot-card empty-order-slot">
                        <span class="order-pos-name empty">${pos}</span>
                        <div class="order-member-info">
                            <strong class="text-muted">【欠員】選手不足</strong>
                            <span class="order-role-sub text-danger">※大会出場には選手が必要です</span>
                        </div>
                        <div class="order-empty-action">
                            <button type="button" class="btn-slot-recruit" onclick="window.KendoClub.recruitDualClubMember()">
                                🏃 他部から勧誘
                            </button>
                        </div>
                    </div>
                `;
            }

            const typeLabel = m.isClubDual ? `${m.originalClub}助っ人` : (m.archetypeName || '一般剣士');

            return `
                <div class="order-slot-card ${m.isClubDual ? 'is-dual-slot' : ''}">
                    <span class="order-pos-name">${pos}</span>
                    <div class="order-member-info">
                        <strong>${escapeHtml(m.name)} ${m.isPlayer ? '(主将・あなた)' : ''}</strong>
                        <div class="order-role-sub">
                            <span>${m.grade}年生</span>
                            ${m.isClubDual ? `<span class="member-dual-badge">${escapeHtml(m.originalClub)}（助っ人）</span>` : `<span>【${m.archetypeName || '一般剣士'}】</span>`}
                            <span>構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '脇' : '中段'}</span>
                        </div>
                    </div>
                    <div class="order-radar-wrap">
                        ${generateRadarChartSvg(m, 180, 164)}
                    </div>
                    <div class="order-swap-btns">
                        <button type="button" class="btn-swap" ${idx === 0 ? 'disabled' : ''} onclick="window.KendoClub.swapOrder(${idx}, ${idx - 1})">⬆️</button>
                        <button type="button" class="btn-swap" ${idx === 4 ? 'disabled' : ''} onclick="window.KendoClub.swapOrder(${idx}, ${idx + 1})">⬇️</button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="order-editor-view">
                <div class="order-editor-header">
                    <h3>🔄 オーダー編成（打順の変更）</h3>
                    <p>矢印ボタンで先鋒〜大将の配置を入れ替えることができます。</p>
                </div>
                <div class="order-list-wrap">
                    ${orderHtml}
                </div>
                <div class="order-actions">
                    <button type="button" class="btn-order-done" onclick="window.KendoClub.closeOrderEditor()">
                        ✅ オーダー決定（ダッシュボードへ戻る）
                    </button>
                </div>
            </div>
        `;
    }

    // 歴代戦績画面（トロフィールーム）
    function renderHistoryScreen(container) {
        const dStats = ClubState.stats.district;
        const nStats = ClubState.stats.national;

        const historyRows = ClubState.history.map((h) => {
            return `
                <tr>
                    <td>${h.year}年目</td>
                    <td>${h.captainName}</td>
                    <td class="${h.districtResult === '優勝' ? 'text-gold' : ''}">${h.districtResult}</td>
                    <td class="${h.nationalResult === '優勝' ? 'text-crown' : ''}">${h.nationalResult}</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <div class="history-view">
                <div class="history-header">
                    <h2>🏆 ${ClubState.schoolName} 歴代戦績表</h2>
                    <p>${ClubState.prefecture}代表 高校剣道部の栄光の軌跡</p>
                </div>

                <div class="stats-summary-grid">
                    <div class="stat-card">
                        <h3>🗾 地区予選（都道府県）通算</h3>
                        <div class="stat-values">
                            <div><span>優勝:</span> <strong>${dStats.win}回</strong></div>
                            <div><span>準優勝:</span> <strong>${dStats.runnerUp}回</strong></div>
                            <div><span>ベスト4:</span> <strong>${dStats.best4}回</strong></div>
                            <div><span>ベスト8:</span> <strong>${dStats.best8}回</strong></div>
                            <div><span>出場回数:</span> <strong>${dStats.total}回</strong></div>
                        </div>
                    </div>
                    <div class="stat-card gold-border">
                        <h3>👑 全国選抜大会 通算</h3>
                        <div class="stat-values">
                            <div><span>全国制覇:</span> <strong class="text-crown">${nStats.win}回</strong></div>
                            <div><span>準優勝:</span> <strong>${nStats.runnerUp}回</strong></div>
                            <div><span>ベスト4:</span> <strong>${nStats.best4}回</strong></div>
                            <div><span>ベスト8:</span> <strong>${nStats.best8}回</strong></div>
                            <div><span>全国出場:</span> <strong>${nStats.total}回</strong></div>
                        </div>
                    </div>
                </div>

                <div class="history-table-wrap">
                    <h3>📜 年度別 成績年表</h3>
                    <table class="history-table">
                        <thead>
                            <tr>
                                <th>年度</th>
                                <th>主将</th>
                                <th>地区大会</th>
                                <th>全国選抜大会</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historyRows.length ? historyRows : '<tr><td colspan="4">まだ公式大会の記録はありません。12月の地区予選を目指しましょう！</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <div class="history-actions">
                    <button type="button" class="btn-res-back" onclick="window.KendoClub.closeHistoryScreen()">
                        🏠 ダッシュボードへ戻る
                    </button>
                </div>
            </div>
        `;
    }

    let autoSpectateTimer = null;
    let autoSpectateInterval = null;

    function clearAutoSpectateTimers() {
        if (autoSpectateTimer) {
            clearTimeout(autoSpectateTimer);
            autoSpectateTimer = null;
        }
        if (autoSpectateInterval) {
            clearInterval(autoSpectateInterval);
            autoSpectateInterval = null;
        }
    }

    function startAutoSpectateCountdown() {
        clearAutoSpectateTimers();
        const match = ClubState.currentMatchData;
        if (!match || !match.activeBouts) return;
        const boutsData = match.activeBouts;
        const curBout = boutsData.bouts[boutsData.currentBoutIndex];

        if (!ClubState.isAutoSpectating || !curBout || curBout.played || curBout.isPlayerBout) {
            ClubState.isAutoSpectating = false;
            return;
        }

        let remainingSec = 3;
        const updateCountdownText = () => {
            const el = document.getElementById('autoSpectateCountdown');
            if (el) el.textContent = `${Math.max(1, remainingSec)}秒後`;
        };

        autoSpectateInterval = setInterval(() => {
            remainingSec--;
            updateCountdownText();
            if (remainingSec <= 0) {
                if (autoSpectateInterval) {
                    clearInterval(autoSpectateInterval);
                    autoSpectateInterval = null;
                }
            }
        }, 1000);

        autoSpectateTimer = setTimeout(() => {
            clearAutoSpectateTimers();
            if (ClubState.isAutoSpectating) {
                window.KendoClub.launchMatchBout(true);
            }
        }, 3000);
    }

    // 試合シミュレーター画面
    function renderMatchSimulator(container) {
        const match = ClubState.currentMatchData;
        if (!match || !match.activeBouts) return;

        const boutsData = match.activeBouts;

        const rowsHtml = boutsData.bouts.map((bout, idx) => {
            const isCurrent = idx === boutsData.currentBoutIndex && !boutsData.isFinished;
            const isMyWin = bout.winner === 'my';
            const isEnemyWin = bout.winner === 'enemy';

            let statusBadge = '<span class="status-pending">対戦前</span>';
            if (bout.played) {
                if (isMyWin) statusBadge = '<span class="badge-win">○ 勝</span>';
                else if (isEnemyWin) statusBadge = '<span class="badge-lose">× 敗</span>';
                else statusBadge = '<span class="badge-draw">▲ 引分</span>';
            } else if (isCurrent) {
                statusBadge = '<span class="status-fighting pulse">⚔️ 試合中</span>';
            }

            const myPts = bout.myScore.length ? bout.myScore.join('・') : '-';
            const oppPts = bout.enemyScore.length ? bout.enemyScore.join('・') : '-';

            return `
                <div class="match-row ${isCurrent ? 'current-bout' : ''} ${bout.played ? 'played' : ''}">
                    <span class="col-pos">${bout.posName}</span>
                    <div class="col-fighter red">
                        <span class="fighter-tag red-tag">赤</span>
                        <strong>${bout.myMember.name}</strong>
                        ${bout.isPlayerBout ? '<span class="tag-you">主将・あなた</span>' : ''}
                    </div>
                    <div class="col-pts red-pts">${myPts}</div>
                    <div class="col-vs">${statusBadge}</div>
                    <div class="col-pts white-pts">${oppPts}</div>
                    <div class="col-fighter white">
                        <strong>${bout.enemyMember.name}</strong>
                        <span class="fighter-tag white-tag">白</span>
                    </div>
                </div>
            `;
        }).join('');

        const curBout = boutsData.bouts[boutsData.currentBoutIndex];

        let actionControlHtml = '';
        if (!boutsData.isFinished && curBout) {
            if (curBout.isPlayerBout && !curBout.played) {
                actionControlHtml = `
                    <div class="bout-control-box highlight">
                        <span class="bout-prompt">【${curBout.posName}戦】あなたの出番です！主将の気迫で勝利を掴み取れ！</span>
                        <button type="button" class="btn-enter-player-bout" onclick="window.KendoClub.launchPlayerBout()">
                            ⚔️ 立ち合い開始
                        </button>
                    </div>
                `;
            } else if (!curBout.played) {
                if (ClubState.isAutoSpectating) {
                    actionControlHtml = `
                        <div class="bout-control-box auto-spectate-box">
                            <span class="bout-prompt">👀【${curBout.posName}戦】${curBout.myMember.name} vs ${curBout.enemyMember.name} — <strong id="autoSpectateCountdown">3秒後</strong>に自動で立ち合いを開始します…</span>
                            <div class="sim-btn-group">
                                <button type="button" class="btn-sim-spectate pulse-btn" onclick="window.KendoClub.launchSpectateBoutImmediate()">
                                    ▶️ 今すぐ観戦開始
                                </button>
                                <button type="button" class="btn-sim-pause" onclick="window.KendoClub.pauseAutoSpectating()">
                                    ⏸️ 観戦を一時停止
                                </button>
                                <button type="button" class="btn-sim-skip" onclick="window.KendoClub.stopAutoSpectateAndSkipToPlayer()">
                                    ⏩ 主将の出番までスキップ
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    actionControlHtml = `
                        <div class="bout-control-box">
                            <span class="bout-prompt">【${curBout.posName}戦】${curBout.myMember.name} vs ${curBout.enemyMember.name}</span>
                            <div class="sim-btn-group">
                                <button type="button" class="btn-sim-spectate" onclick="window.KendoClub.launchSpectateBout()">
                                    👀 リアルタイム観戦
                                </button>
                                <button type="button" class="btn-sim-next" onclick="window.KendoClub.stepSimBout()">
                                    ⚡ 結果を即時判定
                                </button>
                                <button type="button" class="btn-sim-skip" onclick="window.KendoClub.skipToPlayerOrEnd()">
                                    ⏩ 主将の出番までスキップ
                                </button>
                            </div>
                        </div>
                    `;
                }
            }
        } else {
            actionControlHtml = `
                <div class="bout-control-box finish">
                    <span class="bout-prompt">全5試合終了！試合結果を確認します。</span>
                    <button type="button" class="btn-finish-match" onclick="window.KendoClub.showRoundResult()">
                        🏆 勝敗結果を見る
                    </button>
                </div>
            `;
        }

        const boutLogs = boutsData.bouts
            .filter((b) => b.played && b.log.length)
            .map((b) => `<div class="bout-log-item"><strong>【${b.posName}戦: ${b.myMember.name} vs ${b.enemyMember.name}】</strong><br>${b.log.join('<br>')}</div>`)
            .join('');

        const tourneyType = match.type || 'district';
        container.innerHTML = `
            <div class="match-simulator-view bg-${tourneyType}">
                <div class="match-sim-header">
                    <div class="match-round-title">${match.title} — ${boutsData.roundName}</div>
                    <div class="match-teams-title">
                        <span class="team-red">${ClubState.schoolName} (${ClubState.prefecture})</span>
                        <span class="vs-label">VS</span>
                        <span class="team-white">${boutsData.schoolName} (${boutsData.pref})</span>
                    </div>
                </div>

                <div class="scoreboard-table">
                    ${rowsHtml}
                </div>

                ${actionControlHtml}

                <div class="live-commentary-box">
                    <h4>🎙️ 試合実況ログ</h4>
                    <div class="commentary-scroll">
                        ${boutLogs || '<p class="commentary-empty">立ち合いの開始を待っています…</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    // 試合結果発表画面
    function renderMatchResult(container) {
        const match = ClubState.currentMatchData;
        if (!match || !match.activeBouts) return;

        const boutsData = match.activeBouts;
        const isWin = boutsData.finalResult === 'win';
        const isLastRound = match.currentRoundIdx >= match.rounds.length - 1;

        let titleText = '';
        let descText = '';
        let nextBtnHtml = '';

        if (isWin) {
            if (isLastRound) {
                // 大会優勝！
                if (match.type === 'district') {
                    titleText = `🏆 ${ClubState.prefecture}大会 優勝！！`;
                    descText = `見事に地区予選を制覇！3月4週の【全国高校剣道選抜大会】への出場権を獲得しました！！`;
                    nextBtnHtml = `
                        <button type="button" class="btn-res-next" onclick="window.KendoClub.finishTournament('win')">
                            🎖️ 優勝を刻んで次へ進む
                        </button>
                    `;
                } else {
                    titleText = `👑 全国制覇達成！！ 日本一の栄冠！`;
                    descText = `全国47都道府県の頂点に君臨！高校剣道界の頂点「全国選抜大会」完全制覇を成し遂げました！`;
                    nextBtnHtml = `
                        <button type="button" class="btn-res-ending" onclick="window.KendoClub.finishTournament('win')">
                            👑 栄光を刻んで歴史を紡ぐ
                        </button>
                    `;
                }
            } else {
                titleText = `${boutsData.roundName} 勝利！`;
                descText = `部員全員の団結で見事に勝利！次の試合へ進出します！`;
                nextBtnHtml = `
                    <button type="button" class="btn-res-next" onclick="window.KendoClub.advanceTournamentRound()">
                        ⏭️ 次の対戦へ進む（${match.rounds[match.currentRoundIdx + 1].roundName}）
                    </button>
                `;
            }
        } else {
            // 敗退
            let rankName = '初戦敗退';
            if (match.type === 'district') {
                if (match.currentRoundIdx === 1) rankName = 'ベスト4';
                else if (match.currentRoundIdx === 2) rankName = '準優勝';
            } else {
                if (match.currentRoundIdx === 1) rankName = '2回戦敗退';
                else if (match.currentRoundIdx === 2) rankName = 'ベスト8';
                else if (match.currentRoundIdx === 3) rankName = 'ベスト4';
                else if (match.currentRoundIdx === 4) rankName = '準優勝';
            }

            titleText = `惜敗…（${boutsData.roundName}）`;
            descText = `健闘むなしく敗退となりました（成績：${rankName}）。悔しさを胸に、次の目標へ向けて稽古を続けましょう！`;
            nextBtnHtml = `
                <button type="button" class="btn-res-back" onclick="window.KendoClub.finishTournament('${rankName}')">
                    🏠 結果を受け止めて道場へ戻る
                </button>
            `;
        }

        const tourneyType = match.type || 'district';
        container.innerHTML = `
            <div class="match-result-view bg-${tourneyType} ${isWin ? 'victory-view' : 'defeat-view'}">
                <div class="result-banner">
                    <span class="result-trophy">${isWin ? (isLastRound ? '👑' : '🏆') : '🍂'}</span>
                    <h2>${titleText}</h2>
                    <div class="result-score">
                        ${boutsData.myWins} 勝 ${boutsData.enemyWins} 敗 (${boutsData.draws}分)
                    </div>
                    <p class="result-submsg">${descText}</p>
                </div>
                <div class="result-actions">
                    ${nextBtnHtml}
                </div>
            </div>
        `;
    }

    // ───────────────────────────────────────────
    // グローバル公開インターフェース (window.KendoClub)
    // ───────────────────────────────────────────
    window.KendoClub = {
        init: function () {
            const hasData = loadClubData();
            if (!hasData || !ClubState.isConfigured) {
                ClubState.viewPhase = 'setup';
            }
            renderClubUI();
            updateModeCardUI();
        },

        hasSaveData: function () {
            return !!getSaveSummary();
        },

        getSaveSummary: function () {
            return getSaveSummary();
        },

        updateModeCardUI: function () {
            updateModeCardUI();
        },

        onCardClick: function () {
            if (getSaveSummary()) {
                window.KendoClub.continueGame();
            } else {
                window.KendoClub.startNewGame(true);
            }
        },

        continueGame: function () {
            window.KendoGameEngine.switchMode('club');
        },

        startNewGame: function (skipConfirm = false) {
            const summary = getSaveSummary();
            if (summary && !skipConfirm) {
                const ok = confirm(`【確認】保存されているデータ（${summary.schoolName} ${summary.year}年目 ${summary.month}月${summary.week}週）を消去して、最初から始めますか？\n※現在のセーブデータは失われます。`);
                if (!ok) return false;
            }
            resetClubData();
            window.KendoGameEngine.switchMode('club');
            updateModeCardUI();
            return true;
        },

        submitSetup: function () {
            const inpSchool = document.getElementById('inpSchoolName');
            const selPref = document.getElementById('selPrefecture');
            const inpCaptain = document.getElementById('inpCaptainName');

            const sName = (inpSchool && inpSchool.value.trim()) || '青雲高校';
            const pref = (selPref && selPref.value) || '東京都';
            const cName = (inpCaptain && inpCaptain.value.trim()) || 'あなた';

            ClubState.schoolName = sName;
            ClubState.prefecture = pref;
            ClubState.isConfigured = true;
            ClubState.year = 1;
            ClubState.month = 4;
            ClubState.week = 1;

            const initTeam = createInitialTeam(sName, pref, cName);
            ClubState.members = initTeam.members;
            ClubState.order = initTeam.order;
            ClubState.activityLog = [`${ClubState.schoolName}剣道部（${ClubState.prefecture}）創立！2年生主将【${cName}】を中心に全国制覇へ始動！`];
            ClubState.viewPhase = 'dashboard';

            saveClubData();
            renderClubUI();
        },

        selectNewCaptain: function (memberId) {
            ClubState.members.forEach((m) => {
                m.isPlayer = (m.id === memberId);
            });
            const newCap = ClubState.members.find((m) => m.id === memberId);
            if (newCap) {
                ClubState.activityLog.unshift(`👑 新主将に【${newCap.name}】が就任！新チームの主将として部を牽引します！`);
            }
            ClubState.viewPhase = 'dashboard';
            saveClubData();
            renderClubUI();
        },

        onSelectPractice: function (menuId) {
            executePractice(menuId);
        },

        onChangeSpecialTarget: function (targetId) {
            ClubState.selectedSpecialTargetId = targetId;
            const sel = document.getElementById('selSpecialTarget');
            if (sel && sel.value !== targetId) {
                sel.value = targetId;
            }
            saveClubData();
        },

        onSpecialPractice: function () {
            const sel = document.getElementById('selSpecialTarget');
            const targetId = (sel && sel.value) ? sel.value : ClubState.selectedSpecialTargetId;
            if (targetId) {
                ClubState.selectedSpecialTargetId = targetId;
                executePractice('special', targetId);
            }
        },

        recruitDualClubMember: function () {
            if (ClubState.members.length >= 5) {
                alert('すでに5名以上の部員が在籍しているため、助っ人の勧誘はできません。');
                return;
            }
            const recruit = createDualClubMember();
            ClubState.members.push(recruit);
            sanitizeOrder();
            ClubState.activityLog.unshift(`🤝【${ClubState.year}年目 ${ClubState.month}月${ClubState.week}週】部員不足を補うため、${recruit.originalClub}から【${recruit.name}】を掛け持ちの助っ人として勧誘・入部させました！（成長率は通常より控えめ）`);
            saveClubData();
            renderClubUI();
        },

        openOrderEditor: function () {
            ClubState.viewPhase = 'order_edit';
            renderClubUI();
        },

        closeOrderEditor: function () {
            ClubState.viewPhase = 'dashboard';
            saveClubData();
            renderClubUI();
        },

        swapOrder: function (idxA, idxB) {
            if (idxA < 0 || idxA >= 5 || idxB < 0 || idxB >= 5) return;
            const tmp = ClubState.order[idxA];
            ClubState.order[idxA] = ClubState.order[idxB];
            ClubState.order[idxB] = tmp;
            saveClubData();
            renderClubUI();
        },

        openHistoryScreen: function () {
            ClubState.viewPhase = 'history';
            renderClubUI();
        },

        closeHistoryScreen: function () {
            ClubState.viewPhase = 'dashboard';
            renderClubUI();
        },

        startTournamentMatch: function () {
            if (ClubState.members.length < 5) {
                alert(`団体戦大会には最低5名の部員が必要です（現在: ${ClubState.members.length}名）。部員が不足しているため出陣できません。`);
                return;
            }
            // 地区大会か全国大会かを判定
            if (ClubState.month === 12 && ClubState.week === 3) {
                triggerDistrictTournament();
            } else if (ClubState.month === 3 && ClubState.week === 4 && ClubState.qualifiedForNational) {
                triggerNationalTournament();
            }
        },

        debugTriggerDistrictTournament: function () {
            if (ClubState.members.length < 5) {
                alert(`団体戦大会には最低5名の部員が必要です（現在: ${ClubState.members.length}名）。部員が不足しているため大会を開始できません。`);
                return;
            }
            triggerDistrictTournament();
        },

        getState: function () {
            return ClubState;
        },

        stepSimBout: function () {
            clearAutoSpectateTimers();
            const match = ClubState.currentMatchData;
            if (!match || !match.activeBouts || match.activeBouts.isFinished) return;

            const boutsData = match.activeBouts;
            const curBout = boutsData.bouts[boutsData.currentBoutIndex];
            if (curBout && !curBout.played) {
                if (curBout.isPlayerBout) {
                    window.KendoClub.launchPlayerBout();
                } else {
                    simulateAIBout(curBout);
                    boutsData.currentBoutIndex++;
                    if (boutsData.currentBoutIndex >= 5) {
                        boutsData.isFinished = true;
                        evaluateTeamMatch(boutsData);
                    }
                    saveClubData();
                    renderClubUI();
                }
            }
        },

        skipToPlayerOrEnd: function () {
            clearAutoSpectateTimers();
            const match = ClubState.currentMatchData;
            if (!match || !match.activeBouts || match.activeBouts.isFinished) return;

            const boutsData = match.activeBouts;
            while (boutsData.currentBoutIndex < 5) {
                const curBout = boutsData.bouts[boutsData.currentBoutIndex];
                if (curBout.isPlayerBout && !curBout.played) {
                    saveClubData();
                    renderClubUI();
                    return;
                }
                if (!curBout.played) simulateAIBout(curBout);
                boutsData.currentBoutIndex++;
            }

            boutsData.isFinished = true;
            evaluateTeamMatch(boutsData);
            saveClubData();
            renderClubUI();
        },

        launchSpectateBout: function () {
            clearAutoSpectateTimers();
            ClubState.isAutoSpectating = true;
            window.KendoClub.launchMatchBout(true);
        },

        launchSpectateBoutImmediate: function () {
            clearAutoSpectateTimers();
            ClubState.isAutoSpectating = true;
            window.KendoClub.launchMatchBout(true);
        },

        pauseAutoSpectating: function () {
            clearAutoSpectateTimers();
            ClubState.isAutoSpectating = false;
            renderClubUI();
        },

        launchPlayerBout: function () {
            clearAutoSpectateTimers();
            ClubState.isAutoSpectating = false;
            window.KendoClub.launchMatchBout(false);
        },

        stopAutoSpectateAndSkipToPlayer: function () {
            clearAutoSpectateTimers();
            ClubState.isAutoSpectating = false;
            const match = ClubState.currentMatchData;
            if (match && match.activeBouts) {
                const boutsData = match.activeBouts;
                while (boutsData.currentBoutIndex < 5) {
                    const curBout = boutsData.bouts[boutsData.currentBoutIndex];
                    if (curBout.isPlayerBout && !curBout.played) break;
                    if (!curBout.played) {
                        simulateAIBout(curBout);
                        boutsData.currentBoutIndex++;
                        if (boutsData.currentBoutIndex >= 5) {
                            boutsData.isFinished = true;
                            evaluateTeamMatch(boutsData);
                        }
                    } else {
                        break;
                    }
                }
                saveClubData();
            }
            if (window.KendoGameEngine && window.KendoGameEngine.showClubScreen) {
                window.KendoGameEngine.showClubScreen();
            }
            renderClubUI();
        },

        launchMatchBout: function (isSpectating = false) {
            const match = ClubState.currentMatchData;
            if (!match || !match.activeBouts) return;
            const boutsData = match.activeBouts;
            const curBout = boutsData.bouts[boutsData.currentBoutIndex];
            if (!curBout) return;

            const playerMember = curBout.myMember;
            const enemyMember = curBout.enemyMember;

            let enemyPatterns = [];
            if (enemyMember.stance === 'jodan') {
                enemyPatterns = [
                    { stance: 'jodan', hint: `🔥【上段の構え】${enemyMember.name}は頭上に構え「上段面(2ダメ)」を狙う！（小手で迎撃せよ）`, isDanger: true, weights: { 面: 60, 小手: 25, 胴: 15, 防御: 0, 崩し: 0, 突き: 0 } },
                    { stance: 'chudan', hint: `⚖️【中段の構え】${enemyMember.name}は中段に戻りつつ「面」か「小手」を狙っている…`, isDanger: false, weights: { 面: 45, 小手: 35, 胴: 15, 防御: 5, 崩し: 0, 突き: 0 } },
                ];
            } else if (enemyMember.stance === 'waki') {
                enemyPatterns = [
                    { stance: 'waki', hint: `🌊【脇構え】${enemyMember.name}は竹刀を低く隠し「後の先防御」か「抜き胴」を狙う！（崩しが有効！）`, isDanger: false, weights: { 防御: 50, 胴: 30, 小手: 15, 面: 5, 崩し: 0, 突き: 0 } },
                    { stance: 'chudan', hint: `⚖️【中段の構え】${enemyMember.name}は間合いを測りながら鋭い「小手」を狙う！`, isDanger: false, weights: { 小手: 50, 防御: 25, 面: 15, 胴: 10, 崩し: 0, 突き: 0 } },
                ];
            } else {
                enemyPatterns = [
                    { stance: 'chudan', hint: `⚖️【中段の構え】${enemyMember.name}は真っ直ぐ「面」か「小手」を狙っている！`, isDanger: false, weights: { 面: 45, 小手: 30, 胴: 15, 防御: 10, 崩し: 0, 突き: 0 } },
                    { stance: 'chudan', hint: `🛡️【中段の構え】${enemyMember.name}は守りを固めつつ隙を伺っている…（崩しの好機！）`, isDanger: false, weights: { 防御: 40, 面: 30, 小手: 20, 胴: 10, 崩し: 0, 突き: 0 } },
                ];
            }

            if (window.KendoGameEngine && window.KendoGameEngine.startCustomMatch) {
                window.KendoGameEngine.startCustomMatch({
                    isSpectating: isSpectating,
                    tournamentType: match.type || 'district',
                    playerData: {
                        name: playerMember.name,
                        schoolName: ClubState.schoolName,
                        roleTitle: `${curBout.posName}・${ClubState.schoolName}`,
                        maxHealth: playerMember.maxHealth,
                        initialKiai: 0,
                        favStance: playerMember.favStance || 'chudan',
                        skills: playerMember.skills,
                        str: playerMember.str,
                        agi: playerMember.agi,
                        spi: playerMember.spi,
                        armorTheme: playerMember.armorTheme,
                    },
                    enemyData: {
                        id: `opp_${enemyMember.name}`,
                        name: `${boutsData.schoolName}・${enemyMember.name}`,
                        role: curBout.posName,
                        shortName: enemyMember.name,
                        rank: '高校剣士',
                        styleTag: `${enemyMember.stance === 'jodan' ? '上段' : enemyMember.stance === 'waki' ? '脇構え' : '中段'}の気迫`,
                        maxHealth: enemyMember.hp,
                        initialKiai: 0,
                        str: enemyMember.str,
                        agi: enemyMember.agi,
                        spi: enemyMember.spi,
                        introQuote: `「${boutsData.schoolName}の誇りにかけて、一本も譲らん！」`,
                        armorTheme: {
                            doStops: ['#3b0764', '#581c87', '#7e22ce', '#3b0764', '#1e1b4b'],
                            muneFill: '#1e1b4b',
                            muneStitch: 'rgba(232, 121, 249, 0.85)',
                            tareLine: 'rgba(232, 121, 249, 0.65)',
                        },
                        patterns: enemyPatterns,
                    },
                    onMatchEnd: function (result) {
                        curBout.played = true;
                        if (result.winner === 'player') {
                            curBout.winner = 'my';
                            curBout.myScore = ['メ', 'コ'];
                            curBout.log.push(isSpectating
                                ? `【観戦】${playerMember.name}が鮮やかな二本勝ちを収めました！`
                                : `【主将実戦】あなたが鮮やかな二本勝ちを収め、チームを鼓舞しました！`);
                        } else {
                            curBout.winner = 'enemy';
                            curBout.enemyScore = ['メ'];
                            curBout.log.push(isSpectating
                                ? `【観戦】${playerMember.name}は相手の鋭い打突に屈し惜敗…`
                                : `【主将実戦】相手の鋭い打突に惜敗…！`);
                        }

                        boutsData.currentBoutIndex++;
                        if (boutsData.currentBoutIndex >= 5) {
                            boutsData.isFinished = true;
                            evaluateTeamMatch(boutsData);
                        }

                        saveClubData();

                        // 1試合終了後は必ずスコアボード画面を表示
                        if (window.KendoGameEngine && window.KendoGameEngine.showClubScreen) {
                            window.KendoGameEngine.showClubScreen();
                        }

                        // リアルタイム観戦が有効で、次の試合が存在し、かつ次の試合が主将の出番でない場合
                        const nextBout = boutsData.bouts[boutsData.currentBoutIndex];
                        const shouldContinueSpectating = ClubState.isAutoSpectating && nextBout && !nextBout.played && !nextBout.isPlayerBout;

                        if (shouldContinueSpectating) {
                            // スコアボードを描画し、3秒表示後に自動で次の観戦を開始
                            renderClubUI();
                            startAutoSpectateCountdown();
                        } else {
                            // 主将の出番（大将戦など）に到達、または全試合終了
                            ClubState.isAutoSpectating = false;
                            clearAutoSpectateTimers();
                            renderClubUI();
                        }
                    },
                });
            }
        },

        showRoundResult: function () {
            ClubState.viewPhase = 'match_result';
            renderClubUI();
        },

        advanceTournamentRound: function () {
            const match = ClubState.currentMatchData;
            if (!match) return;
            match.currentRoundIdx++;
            setupCurrentBouts();
            ClubState.viewPhase = 'match_sim';
            saveClubData();
            renderClubUI();
        },

        finishTournament: function (rank) {
            const match = ClubState.currentMatchData;
            if (!match) return;

            const isDistrict = match.type === 'district';
            const isWin = rank === 'win';
            const rankLabel = isWin ? '優勝' : rank;

            const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
            const capName = captain ? captain.name : '主将';

            if (isDistrict) {
                ClubState.lastDistrictRank = rankLabel;
                ClubState.stats.district.total++;
                if (isWin) {
                    ClubState.stats.district.win++;
                    ClubState.qualifiedForNational = true;
                } else if (rankLabel === '準優勝') ClubState.stats.district.runnerUp++;
                else if (rankLabel === 'ベスト4') ClubState.stats.district.best4++;
                else ClubState.stats.district.best8++;

                ClubState.activityLog.unshift(`🏆【${ClubState.year}年目 12月3週】${ClubState.prefecture}大会 終了。成績：${rankLabel}！${isWin ? '全国選抜大会への出場が決定！' : ''}`);
            } else {
                ClubState.lastNationalRank = rankLabel;
                ClubState.stats.national.total++;
                if (isWin) ClubState.stats.national.win++;
                else if (rankLabel === '準優勝') ClubState.stats.national.runnerUp++;
                else if (rankLabel === 'ベスト4') ClubState.stats.national.best4++;
                else ClubState.stats.national.best8++;

                ClubState.activityLog.unshift(`👑【${ClubState.year}年目 3月4週】全国高校選抜大会 終了。成績：${rankLabel}！`);

                // 年度レコードの保存（3月末）
                ClubState.history.unshift({
                    year: ClubState.year,
                    captainName: capName,
                    districtResult: ClubState.lastDistrictRank || '不出場',
                    nationalResult: rankLabel,
                });
            }

            // 敗退して地区大会が終わった場合も年度レコード保存
            if (isDistrict && !isWin) {
                ClubState.history.unshift({
                    year: ClubState.year,
                    captainName: capName,
                    districtResult: rankLabel,
                    nationalResult: '不出場',
                });
            }

            ClubState.currentMatchData = null;
            ClubState.viewPhase = 'dashboard';

            // 次の週へ進める
            advanceCalendarWeek();
        },

        confirmReset: function () {
            if (confirm('剣道部のデータを初期化し、高校名・主将の入力からやり直しますか？')) {
                resetClubData();
                renderClubUI();
                updateModeCardUI();
            }
        },
    };

    // DOMロード時にモードカードUIを最新セーブデータ状態に合わせて描画
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateModeCardUI);
    } else {
        updateModeCardUI();
    }
})();
