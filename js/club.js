/**
 * ⚔️ 剣道 (Kendo) - 全国制覇モード (高校剣道部 世代交代シミュレーション)
 *
 * プレイヤーは3年生主将として剣道部を率い、
 * 12月3週の地区大会（都道府県予選）で優勝し、
 * 毎年3月4週の全国選抜大会（47都道府県代表）での優勝を目指す。
 * 4月1週に進級と新入部員、9月1週に3年生引退と新主将指名。
 * 試合状況も含めた巻き戻し不可のリアルタイムオートセーブ完備。
 */

(function () {
    'use strict';

    const SAVE_KEY = 'kendo_nationwide_cycle_save_v2';
    const PERMANENT_PERKS_KEY = 'kendo_club_permanent_perks_v1';

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

    // 疲労度による成長係数ヘルパー
    // 疲労度0%で 1.0 (100%)、疲労度90%で 0.0 (0%)、疲労度100%で -0.10 (-10%)
    function getFatigueGrowthMultiplier(fatigue) {
        const f = Math.max(0, Math.min(100, typeof fatigue === 'number' ? fatigue : 0));
        if (f <= 90) {
            return 1.0 - (f / 90);
        } else {
            return -0.10 * ((f - 90) / 10);
        }
    }

    // パラメータ成長ヘルパー（部員固有の隠し成長率および疲労度を適用、才能限界値以上は成長率1/2、上限99でカンスト、疲労度100%時は能力低下ペナルティ）
    function growStat(m, category, key, baseGain) {
        if (!baseGain || baseGain <= 0) return 0;

        // 各部員のパラメータ毎の隠し成長率（通常部員: 50%〜150%、助っ人部員: 特化80〜120%・他50〜75%）
        let gRate = 1.0;
        if (m && m.growthRates && typeof m.growthRates[key] === 'number') {
            gRate = m.growthRates[key];
        } else if (m && typeof m.growthRate === 'number') {
            gRate = m.growthRate;
        }
        // 疲労度による成長率補正（0%で100%、90%で0%、100%で-10%）
        const fMultiplier = getFatigueGrowthMultiplier(m ? m.fatigue : 0);
        const effectiveRate = gRate * fMultiplier;
        const rawGain = baseGain * effectiveRate;

        let effectiveGain = 0;
        if (rawGain > 0) {
            const intGain = Math.floor(rawGain);
            const fracGain = rawGain - intGain;
            effectiveGain = intGain + (Math.random() < fracGain ? 1 : 0);
        } else if (rawGain < 0) {
            const absGain = Math.abs(rawGain);
            const intLoss = Math.floor(absGain);
            const fracLoss = absGain - intLoss;
            const loss = intLoss + (Math.random() < fracLoss ? 1 : 0);
            effectiveGain = -loss;
        }

        if (effectiveGain === 0) return 0;

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

        // 才能限界値に達しているか（能力上昇の場合のみ1/2半減）
        const isOverCap = curVal >= capVal;
        if (effectiveGain > 0 && isOverCap) {
            if (effectiveGain === 1) {
                effectiveGain = Math.random() < 0.5 ? 1 : 0;
            } else {
                effectiveGain = Math.max(1, Math.floor(effectiveGain / 2));
            }
        }

        if (effectiveGain === 0) return 0;

        const maxLimit = (category === 'base' && key === 'maxHealth') ? HEALTH_HARD_MAX : STAT_HARD_MAX;
        const minLimit = 1; // パラメータ下限値
        const finalVal = Math.min(maxLimit, Math.max(minLimit, curVal + effectiveGain));
        const actualGain = finalVal - curVal;

        if (actualGain === 0) return 0;

        if (category === 'base') {
            m[key] = finalVal;
        } else if (category === 'skill') {
            m.skills[key] = finalVal;
        }

        return actualGain;
    }

    // 大会試合後のパラメータ成長＆疲労度蓄積ヘルパー
    const MOVE_KEY_MAP = {
        '面': 'men',
        '上段面': 'men',
        '引き面': 'men',
        '諸手引き面': 'men',
        '小手': 'kote',
        '引き小手': 'kote',
        '胴': 'do',
        '抜き胴': 'do',
        '引き胴': 'do',
        '突き': 'tsuki',
        '離れ突き': 'tsuki',
    };

    function getMoveKey(moveName) {
        if (!moveName) return 'men';
        if (moveName.includes('小手')) return 'kote';
        if (moveName.includes('胴')) return 'do';
        if (moveName.includes('突き') || moveName.includes('突')) return 'tsuki';
        return 'men';
    }

    function getMoveDisplayName(key) {
        if (key === 'kote') return '小手';
        if (key === 'do') return '胴';
        if (key === 'tsuki') return '突き';
        return '面';
    }

    function applyBoutGrowth(member, stats) {
        if (!member || !stats) return null;
        const gains = [];

        // 1. 決まった技のパラメータをUP
        const winningMoves = Array.isArray(stats.winningMoves) && stats.winningMoves.length > 0
            ? stats.winningMoves
            : (stats.winningMove ? [stats.winningMove] : []);

        const skillGainCounts = {};
        winningMoves.forEach((move) => {
            const key = getMoveKey(move);
            skillGainCounts[key] = (skillGainCounts[key] || 0) + 1;
        });

        Object.keys(skillGainCounts).forEach((key) => {
            const baseGain = skillGainCounts[key];
            const actual = growStat(member, 'skill', key, baseGain);
            if (actual > 0) {
                gains.push(`${getMoveDisplayName(key)}+${actual}`);
            } else if (actual < 0) {
                gains.push(`${getMoveDisplayName(key)}${actual}`);
            }
        });

        // 2. 技がヒットした回数に応じて敏捷性をUP
        const hits = stats.hits || stats.playerHits || 0;
        if (hits >= 2) {
            const agiGain = hits >= 4 ? 2 : 1;
            const actual = growStat(member, 'base', 'agi', agiGain);
            if (actual > 0) gains.push(`敏捷+${actual}`);
            else if (actual < 0) gains.push(`敏捷${actual}`);
        } else if (hits >= 1 && Math.random() < 0.7) {
            const actual = growStat(member, 'base', 'agi', 1);
            if (actual > 0) gains.push(`敏捷+${actual}`);
            else if (actual < 0) gains.push(`敏捷${actual}`);
        }

        // 3. 攻撃の防御に成功した回数に応じて気魄（気力）UP
        const blocks = stats.blocks || stats.playerBlocks || 0;
        if (blocks >= 2) {
            const spiGain = blocks >= 4 ? 2 : 1;
            const actual = growStat(member, 'base', 'spi', spiGain);
            if (actual > 0) gains.push(`気魄+${actual}`);
            else if (actual < 0) gains.push(`気魄${actual}`);
        } else if (blocks >= 1 && Math.random() < 0.75) {
            const actual = growStat(member, 'base', 'spi', 1);
            if (actual > 0) gains.push(`気魄+${actual}`);
            else if (actual < 0) gains.push(`気魄${actual}`);
        }

        // 4. 鍔迫り合い押し込み制覇ボーナス（腕力）
        const pushWins = stats.pushWins || 0;
        if (pushWins > 0 && Math.random() < 0.6) {
            const actual = growStat(member, 'base', 'str', 1);
            if (actual > 0) gains.push(`腕力+${actual}`);
            else if (actual < 0) gains.push(`腕力${actual}`);
        }

        // 5. 勝負の決着までにかかったターン数に応じて疲労度UP
        const rounds = Math.max(1, stats.rounds || 3);
        const baseFatigue = 8;
        const turnFatigue = Math.min(15, Math.floor(rounds * 1.5));
        const totalFatigue = baseFatigue + turnFatigue;
        member.fatigue = Math.min(100, Math.max(0, (member.fatigue || 0) + totalFatigue));

        return {
            gainsText: gains.length > 0 ? gains.join(', ') : '成長なし',
            fatigueAdded: totalFatigue,
            summary: `【成長】${gains.length > 0 ? gains.join(', ') : '維持'} (疲労+${totalFatigue}%)`
        };
    }

    // 部員オブジェクトの安全取得（セーブデータ復元後のディープコピーや参照切れを解消し、常にClubState.membersの本物を取得）
    function getRealClubMember(target) {
        if (!target) return null;
        const id = target.memberId || target.id || (target.memberRef && target.memberRef.id);
        if (id) {
            const found = ClubState.members.find((m) => m.id === id);
            if (found) return found;
        }
        if (target.name) {
            const foundByName = ClubState.members.find((m) => m.name === target.name);
            if (foundByName) return foundByName;
        }
        return null;
    }

    // 大会戦績ボーナス（個人戦・団体戦終了時に戦績に応じた心技体の成長を付与）
    function applyTournamentRankBonus(member, rankLabel, isNational = false, isIndividual = false) {
        if (!member) return null;
        const gains = [];
        const nationalMultiplier = isNational ? 1.5 : 1.0;

        // 戦績ランクごとの基礎成長値
        let spiGain = 1;
        let physGain = 0;
        let skillGain = 0;
        let hpGain = 0;
        let fatigueRelief = 0;

        if (rankLabel === '優勝') {
            spiGain = Math.round(3 * nationalMultiplier);
            physGain = Math.round(2 * nationalMultiplier);
            skillGain = Math.round(2 * nationalMultiplier);
            hpGain = 1;
            fatigueRelief = 30;
        } else if (rankLabel === '準優勝') {
            spiGain = Math.round(2 * nationalMultiplier);
            physGain = Math.round(1 * nationalMultiplier);
            skillGain = Math.round(2 * nationalMultiplier);
            fatigueRelief = 20;
        } else if (rankLabel === 'ベスト4') {
            spiGain = Math.round(2 * nationalMultiplier);
            physGain = Math.round(1 * nationalMultiplier);
            skillGain = Math.round(1 * nationalMultiplier);
            fatigueRelief = 15;
        } else if (rankLabel === 'ベスト8') {
            spiGain = Math.round(1 * nationalMultiplier);
            physGain = Math.round(1 * nationalMultiplier);
            skillGain = Math.round(1 * nationalMultiplier);
            fatigueRelief = 10;
        } else if (rankLabel === '2回戦敗退') {
            spiGain = 1;
            skillGain = 1;
            fatigueRelief = 5;
        } else {
            // 初戦敗退等（悔しさをバネにする精神鍛錬）
            spiGain = 1;
        }

        // 1. 気魄（spi）の成長
        if (spiGain > 0) {
            const actual = growStat(member, 'base', 'spi', spiGain);
            if (actual > 0) gains.push(`気魄+${actual}`);
        }

        // 2. 身体能力（腕力 str / 敏捷 agi）の成長
        if (physGain > 0) {
            const actualStr = growStat(member, 'base', 'str', physGain);
            if (actualStr > 0) gains.push(`腕力+${actualStr}`);
            const actualAgi = growStat(member, 'base', 'agi', physGain);
            if (actualAgi > 0) gains.push(`敏捷+${actualAgi}`);
        }

        // 3. 得意技および全技パラメータの成長
        if (skillGain > 0) {
            const favTech = getMemberFavoriteAttack(member);
            const actualFav = growStat(member, 'skill', favTech, skillGain);
            if (actualFav > 0) gains.push(`${getMoveDisplayName(favTech)}+${actualFav}`);

            if (rankLabel === '優勝' || rankLabel === '準優勝') {
                ['men', 'kote', 'do', 'tsuki'].filter((t) => t !== favTech).forEach((t) => {
                    const subGain = growStat(member, 'skill', t, 1);
                    if (subGain > 0) gains.push(`${getMoveDisplayName(t)}+${subGain}`);
                });
            }
        }

        // 4. 体力上限UP（優勝時のみ・最大8まで）
        if (hpGain > 0 && member.maxHealth < HEALTH_HARD_MAX) {
            member.maxHealth = Math.min(HEALTH_HARD_MAX, member.maxHealth + hpGain);
            gains.push(`体力+${hpGain}`);
        }

        // 5. 達成感による疲労回復
        if (fatigueRelief > 0) {
            member.fatigue = Math.max(0, (member.fatigue || 0) - fatigueRelief);
        }

        if (gains.length > 0) {
            playStatUpSound();
        }

        return {
            member: member,
            memberId: member.id,
            name: member.name,
            rankLabel: rankLabel,
            gains: gains,
            summary: `${member.name}（${rankLabel}）: ${gains.length > 0 ? gains.join(', ') : '現状維持'}`
        };
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
            desc: '竹刀を振り込み、打突の重さと面のキレを鍛える。腕力・面が向上（小手・突きも稀に上昇）。疲労【中】',
            fatigueCost: 15,
            apply: (m) => {
                growStat(m, 'base', 'str', 1 + (Math.random() < 0.4 ? 1 : 0));
                growStat(m, 'skill', 'men', 1 + (Math.random() < 0.5 ? 1 : 0));
                if (Math.random() < 0.30) growStat(m, 'skill', 'kote', 1);
                if (Math.random() < 0.35) growStat(m, 'skill', 'tsuki', 1);
            },
        },
        {
            id: 'kakari',
            name: '追い込み・掛かり稽古',
            icon: '🔥',
            desc: '息を極限まで切らして打ち込む猛稽古。腕力・面・胴・突きなど技全般と体力が大幅向上。疲労【大】',
            fatigueCost: 24,
            apply: (m) => {
                growStat(m, 'base', 'spi', 1);
                growStat(m, 'base', 'str', 1);
                growStat(m, 'skill', 'men', 1);
                growStat(m, 'skill', 'do', 1);
                growStat(m, 'skill', 'tsuki', 1);
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
    // 高校生らしい部活ライフイベント マスターデータ
    // ───────────────────────────────────────────
    const CLUB_EVENTS = [
        // ── 1. 季節・年間行事イベント（カレンダー月・週連動） ──
        {
            id: 'freshman_demo',
            category: 'seasonal',
            month: 4,
            week: 3,
            title: '🌸 新歓演武会！新入生への気迫の模範稽古',
            seasonTag: '🌸 春の息吹 ｜ 4月3週',
            image: 'img/event/freshman_demo.png',
            fallbackIcon: '🌸',
            fallbackTitle: '新歓演武会と道場見学',
            tagline: '〜春光射す道場、新入生の熱い視線に鋭い竹刀が閃く〜',
            narration: '放課後の道場には、たくさんの新入生が見学に詰めかけていた。<br>静寂を切り裂く鋭い踏み込みと気迫のこもった打突音に、ギャラリーから大きなどよめきと感嘆の声が上がる！',
            dialogues: [
                { speaker: '主将', text: '全員、いつも通りの気迫を見せてやれ！これが我が校の剣道だ！' },
                { speaker: '部員', text: '「めぇぇぇん！」鋭い打突が決まり、新入生たちの目が輝いている！' },
            ],
            effectsDesc: '🔥 部員全員の気魄 +2 ｜ 🌟 全員の調子が上昇！',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 2);
                    improveCondition(m);
                });
                return '新入生たちの前で堂々の演武を披露！部員全員の気魄が向上し、調子が上がりました！';
            },
        },
        {
            id: 'midterm_study',
            category: 'seasonal',
            month: 5,
            week: 2,
            title: '📚 中間考査前の放課後勉強会！目指せ全員赤点回避',
            seasonTag: '📚 新緑の初夏 ｜ 5月2週',
            image: 'img/event/study_session.png',
            fallbackIcon: '📖',
            fallbackTitle: '放課後勉強会・赤点回避',
            tagline: '〜竹刀をシャープペンに持ち替え、文武両道の団結へ〜',
            narration: '中間テスト直前、稽古時間を短縮して道場の隅で勉強会を開催！<br>「大会に出るには赤点回避が絶対条件だぞ！」主将のゲキを受け、部員同士で教え合う温かい時間が流れる。',
            dialogues: [
                { speaker: '主将', text: '文武両道こそ真の剣士！誰一人赤点を取らせるわけにはいかないぞ！' },
                { speaker: '部員', text: '先輩、この数学の公式がどうしても…！あ、なるほど！解けました！' },
            ],
            effectsDesc: '🧠 全員の気魄 +1 ｜ 🍵 疲労度 -15 ｜ 🌟 士気高揚！',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 1);
                    m.fatigue = Math.max(0, (m.fatigue || 0) - 15);
                    improveCondition(m);
                });
                return '勉強会でチームの絆が深まりました！部員全員の気魄+1、疲労度-15、調子が向上！';
            },
        },
        {
            id: 'rainy_maintenance',
            category: 'seasonal',
            month: 6,
            week: 3,
            title: '☔ 梅雨の静かな道場と竹刀メンテナンス',
            seasonTag: '☔ 水無月の雨 ｜ 6月3週',
            image: 'img/event/rainy_maintenance.png',
            fallbackIcon: '☔',
            fallbackTitle: '静かな道場と道具手入れ',
            tagline: '〜外はしとしと降る雨、静かに座して道具を慈しむ〜',
            narration: '外は激しい雨。湿気で傷みやすい竹刀を皆で点検し、丁寧にささくれを削って弦を締め直す。<br>道具を大切にする心が、打突の鋭さと冴えを生み出していく。',
            dialogues: [
                { speaker: '主将', text: '道具を粗末にする者に、一本の冴えは宿らない。丁寧に仕上げよう。' },
                { speaker: '部員', text: '握り直すと吸い付くように構えやすいです！次の稽古が楽しみです！' },
            ],
            effectsDesc: '⚔️ 全員の面・小手・胴技術 +1 ｜ 🍵 疲労度 -10',
            apply: (state) => {
                state.members.forEach((m) => {
                    if (!m.skills) m.skills = { men: 10, kote: 10, do: 10, tsuki: 8 };
                    m.skills.men = Math.min(STAT_HARD_MAX, m.skills.men + 1);
                    m.skills.kote = Math.min(STAT_HARD_MAX, m.skills.kote + 1);
                    m.skills.do = Math.min(STAT_HARD_MAX, m.skills.do + 1);
                    m.fatigue = Math.max(0, (m.fatigue || 0) - 10);
                });
                return '竹刀の手入れで道具への愛着と技の冴えが向上！面・小手・胴技術+1、疲労度-10！';
            },
        },
        {
            id: 'final_exam_clear',
            category: 'seasonal',
            month: 7,
            week: 2,
            title: '📝 期末考査突破！全員無事クリアで夏本番へ',
            seasonTag: '📝 夏の訪れ ｜ 7月2週',
            image: 'img/event/final_exam_clear.png',
            fallbackIcon: '📝',
            fallbackTitle: '期末考査突破・夏へ突入',
            tagline: '〜テストを乗り越えた達成感！心置きなく剣道に没頭できる〜',
            narration: '期末考査の最終日、結果発表！全員無事に合格点をクリアし補習を回避！<br>晴れやかな笑顔で道場に集まった部員たち。いよいよ夏休みの本格的な鍛錬が始まる！',
            dialogues: [
                { speaker: '部員', text: '主将！全員赤点なしで乗り切りました！補習免除です！' },
                { speaker: '主将', text: 'よくやった！これで心置きなく稽古に打ち込めるぞ。夏合宿、気合入れていくぞ！' },
            ],
            effectsDesc: '🌟 全員の調子が上昇 ｜ 🍵 疲労度 -20 ｜ 🔥 気魄 +1',
            apply: (state) => {
                state.members.forEach((m) => {
                    improveCondition(m);
                    m.fatigue = Math.max(0, (m.fatigue || 0) - 20);
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 1);
                });
                return '期末考査を全員クリア！安堵と高揚感で全員の調子が向上、疲労度-20、気魄+1！';
            },
        },
        {
            id: 'summer_camp',
            category: 'seasonal',
            month: 7,
            week: 4,
            title: '🔥 炎天下の夏期強化合宿！限界突破の千本素振り',
            seasonTag: '🔥 盛夏合宿 ｜ 7月4週',
            image: 'img/event/summer_camp.png',
            fallbackIcon: '🔥',
            fallbackTitle: '夏期強化合宿・千本素振り',
            tagline: '〜砂浜を蹴り、太陽に向かって振り下ろす！限界を超えた絆〜',
            narration: '照りつける太陽とセミの声。朝の砂浜ダッシュから始まった地獄の強化合宿。<br>全員が声を枯らして竹刀を振り抜き、己の限界を打ち破った！',
            dialogues: [
                { speaker: '主将', text: 'あと百本！腕が上がらなくなってからが本当の稽古だ！声を上げろ！' },
                { speaker: '部員', text: '「ウオオオッ！」道場と砂浜に魂の叫びがこだまする！' },
            ],
            effectsDesc: '💪 腕力 +2 ｜ 🏃 敏捷 +1 ｜ 🔥 気魄 +3 ｜ ❤️ 体力 +1（※疲労度+20）',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.str = Math.min(STAT_HARD_MAX, (m.str || 10) + 2);
                    m.agi = Math.min(STAT_HARD_MAX, (m.agi || 10) + 1);
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 3);
                    m.maxHealth = Math.min(HEALTH_HARD_MAX, (m.maxHealth || 5) + 1);
                    m.health = Math.min(m.maxHealth, (m.health || 5) + 1);
                    m.fatigue = Math.min(100, (m.fatigue || 0) + 20);
                });
                return '過酷な夏合宿を乗り越え肉体と精神が劇的進化！体力+1、腕力+2、敏捷+1、気魄+3！（疲労+20）';
            },
        },
        {
            id: 'summer_watermelon',
            category: 'seasonal',
            month: 8,
            week: 3,
            title: '🍉 猛暑の稽古後！キンキンに冷えたスイカとアイス',
            seasonTag: '🍉 盛夏のオアシス ｜ 8月3週',
            image: 'img/event/summer_watermelon.png',
            fallbackIcon: '🍉',
            fallbackTitle: 'スイカとアイスの差し入れ',
            tagline: '〜汗だくの縁側、冷たい甘みが乾いた喉を潤す青春の味〜',
            narration: '気温35度を超える猛暑の稽古が終わった瞬間、氷水で冷やした特大スイカとアイスが登場！<br>「うまい！」「生き返る〜！」道場の縁側に部員たちの最高の笑顔が弾ける。',
            dialogues: [
                { speaker: '部員', text: '冷たくて甘くて最高です…！生き返りました！' },
                { speaker: '主将', text: 'しっかり水分と塩分を取れよ！後半も気合で乗り切るぞ！' },
            ],
            effectsDesc: '🍵 チーム全員の疲労度 -50 ｜ 😆 全員の調子が【絶好調】へ！',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.fatigue = Math.max(0, (m.fatigue || 0) - 50);
                    m.condition = 'best';
                });
                return '冷えたスイカとアイスで身も心も全快！全員の疲労度-50、調子が【絶好調】になりました！';
            },
        },
        {
            id: 'sports_festival',
            category: 'seasonal',
            month: 10,
            week: 2,
            title: '🍁 体育祭激走！部活動対抗リレーで袴姿の快走',
            seasonTag: '🍁 秋晴れの祭典 ｜ 10月2週',
            image: 'img/event/sports_festival.png',
            fallbackIcon: '🏃',
            fallbackTitle: '体育祭・部活対抗リレー',
            tagline: '〜万国旗たなびく秋空、タスキを繋ぐ剣士の韋駄天ダッシュ〜',
            narration: '全校生徒が熱狂する体育祭の華・部活動対抗リレー！<br>剣道着と袴姿に赤タスキ、竹刀をバトン代わりに全速力でトラックを駆け抜ける姿に、観客席から大歓声！',
            dialogues: [
                { speaker: '部員', text: '主将、バトン頼みます！すり足ダッシュで差をつけました！' },
                { speaker: '主将', text: 'よし受け取った！剣道部の意地を見せてやる！ゴールまで突っ走るぞ！' },
            ],
            effectsDesc: '🏃 部員全員の敏捷 +2 ｜ 🌟 全員の調子が上昇！',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.agi = Math.min(STAT_HARD_MAX, (m.agi || 10) + 2);
                    improveCondition(m);
                });
                return '部活動対抗リレーで快走し学校中の注目の的に！全員の敏捷+2、調子が向上しました！';
            },
        },
        {
            id: 'autumn_practice_match',
            category: 'seasonal',
            month: 10,
            week: 4,
            title: '⚔️ 隣県の強豪校と激突！熱気に満ちた合同練習試合',
            seasonTag: '⚔️ 実りの秋・遠征 ｜ 10月4週',
            image: 'img/event/practice_match.png',
            fallbackIcon: '⚔️',
            fallbackTitle: '他校との合同練習試合',
            tagline: '〜鍔迫り合いの火花、見知らぬ強豪の剣風が闘志に火を点ける〜',
            narration: '隣県の強豪高校へ遠征しての合同練習試合！<br>全国レベルの鋭い出ばな技や重厚な攻防を肌で体感し、実戦の勘と技のバリエーションが飛躍的に磨かれた！',
            dialogues: [
                { speaker: '部員', text: '相手校の先鋒、踏み込みがものすごく速い…！でもタイミングは見切りました！' },
                { speaker: '主将', text: '恐れず間合いを制しろ！ここでの経験が冬の選抜予選で必ず生きる！' },
            ],
            effectsDesc: '⚔️ 全員の面・小手・胴・突き +1 ｜ 🔥 気魄 +2',
            apply: (state) => {
                state.members.forEach((m) => {
                    if (!m.skills) m.skills = { men: 10, kote: 10, do: 10, tsuki: 8 };
                    m.skills.men = Math.min(STAT_HARD_MAX, m.skills.men + 1);
                    m.skills.kote = Math.min(STAT_HARD_MAX, m.skills.kote + 1);
                    m.skills.do = Math.min(STAT_HARD_MAX, m.skills.do + 1);
                    m.skills.tsuki = Math.min(STAT_HARD_MAX, m.skills.tsuki + 1);
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 2);
                });
                return '強豪校との激戦を通じて実戦力が飛躍！全員の全技パラメータ+1、気魄+2！';
            },
        },
        {
            id: 'cleaning_race',
            category: 'seasonal',
            month: 11,
            week: 2,
            title: '🧹 年末前の道場大掃除！白熱の雑巾がけレース',
            seasonTag: '🧹 晩秋の道場 ｜ 11月2週',
            image: 'img/event/cleaning_race.png',
            fallbackIcon: '🧹',
            fallbackTitle: '道場大掃除・雑巾がけ',
            tagline: '〜床の木目を磨き上げ、いつしか全力ダッシュ勝負へ〜',
            narration: '日頃の稽古への感謝を込めた大掃除。<br>誰が一番早く端まで拭き終えるか、いつの間にか全員参加のガチンコ雑巾がけレースが勃発！下半身が知らず知らず鍛え上げられた！',
            dialogues: [
                { speaker: '部員', text: '誰にも負けませんよ！雑巾がけなら私のすり足が最速です！' },
                { speaker: '主将', text: '足腰の鍛錬にもってこいだな！ピカピカの道場で次の稽古に挑もう！' },
            ],
            effectsDesc: '🏃 敏捷 +1 ｜ 💪 腕力 +1 ｜ 🍵 疲労度 -10',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.agi = Math.min(STAT_HARD_MAX, (m.agi || 10) + 1);
                    m.str = Math.min(STAT_HARD_MAX, (m.str || 10) + 1);
                    m.fatigue = Math.max(0, (m.fatigue || 0) - 10);
                });
                return '道場が鏡のようにピカピカに！雑巾がけダッシュで敏捷+1、腕力+1、疲労度-10！';
            },
        },
        {
            id: 'year_end_soba',
            category: 'seasonal',
            month: 12,
            week: 4,
            title: '🍲 一年の締めくくり！稽古納めと温かい年越しそば',
            seasonTag: '🍲 師走の温もり ｜ 12月4週',
            image: 'img/event/year_end_soba.png',
            fallbackIcon: '🍲',
            fallbackTitle: '稽古納めと年越しそば',
            tagline: '〜竹刀を納め、湯気立つそばを啜る。仲間と共に駆け抜けた1年〜',
            narration: '今年最後の稽古を終え、道場の畳に車座になって熱々の年越しそばを囲む。<br>嬉しい勝利も悔しい敗戦も、すべてこの仲間と分かち合ってきた。絆を胸に新年へ！',
            dialogues: [
                { speaker: '部員', text: 'あぁ…出汁が身体に染み渡ります…！今年一年、本当にありがとうございました！' },
                { speaker: '主将', text: 'みんな本当によく頑張った。来年は必ず、全国の頂点へ全員で行くぞ！' },
            ],
            effectsDesc: '🍵 全員の疲労度 -35 ｜ 😆 全員の調子が【絶好調】へ！',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.fatigue = Math.max(0, (m.fatigue || 0) - 35);
                    m.condition = 'best';
                });
                return '年越しそばで心身ともに温まりました！全員の疲労度-35、調子が【絶好調】へ上昇！';
            },
        },
        {
            id: 'cold_training',
            category: 'seasonal',
            month: 1,
            week: 1,
            title: '🌅 息白き極寒の寒稽古！神社への必勝祈願初詣',
            seasonTag: '🌅 新春の誓い ｜ 1月1週',
            image: 'img/event/cold_training.png',
            fallbackIcon: '🌅',
            fallbackTitle: '極寒の寒稽古と初詣',
            tagline: '〜凍てつく道場の床、白く吐く息。新春の朝日に捧げる必勝の祈り〜',
            narration: '新春早朝の極寒の道場。裸足で踏みしめる板張りの冷たさに気合いが引き締まる！<br>稽古後は全員で近所の神社へ駆け足で初詣。二礼二拍手一礼、誓うは全国制覇！',
            dialogues: [
                { speaker: '主将', text: '寒さに負けるな！この寒さを耐え抜いた者だけが、春の舞台で輝ける！' },
                { speaker: '部員', text: '「めぇぇぇん！」神社の絵馬に全員で「全国制覇」と書き込みました！' },
            ],
            effectsDesc: '🔥 全員の気魄 +4 ｜ 🛡️ 不動心の覚醒！',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 4);
                    improveCondition(m);
                });
                return '新春の寒稽古と必勝祈願で精神が研ぎ澄まされました！全員の気魄+4、調子向上！';
            },
        },
        {
            id: 'valentine_beans',
            category: 'seasonal',
            month: 2,
            week: 2,
            title: '🍫 節分豆まき＆バレンタインチョコの差し入れ',
            seasonTag: '🍫 如月の笑顔 ｜ 2月2週',
            image: 'img/event/valentine_beans.png',
            fallbackIcon: '🍫',
            fallbackTitle: '節分とバレンタイン',
            tagline: '〜道場に響く笑い声！鬼退治の豆まきと甘いチョコで士気最高潮〜',
            narration: '節分の鬼役をめぐってじゃんけん勝負！道場に笑い声が響く。<br>さらに放課後、クラスメイトや後輩からバレンタインチョコの差し入れが届き、部員たちのテンションは最高潮に！',
            dialogues: [
                { speaker: '部員', text: '「鬼は〜外！福は〜内！」主将、チョコの差し入れ貰っちゃいました！' },
                { speaker: '主将', text: 'ははは、浮かれるなよ！だがその笑顔の勢いのまま、春の大会まで駆け抜けよう！' },
            ],
            effectsDesc: '🌟 全員の調子が向上 ｜ 🍵 疲労度 -15 ｜ 🔥 気魄 +1',
            apply: (state) => {
                state.members.forEach((m) => {
                    improveCondition(m);
                    m.fatigue = Math.max(0, (m.fatigue || 0) - 15);
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 1);
                });
                return '豆まきとチョコで道場が大いに盛り上がりました！全員の調子向上、疲労度-15、気魄+1！';
            },
        },
        {
            id: 'graduation_farewell',
            category: 'seasonal',
            month: 3,
            week: 2,
            condition: (state) => {
                // 部員に3年生が在籍したことがあり、前年9月（当年度9月）に引退した3年生が存在する場合のみ発生
                return !!(
                    state.lastRetiredSeniors &&
                    state.lastRetiredSeniors.year === state.year &&
                    Array.isArray(state.lastRetiredSeniors.members) &&
                    state.lastRetiredSeniors.members.length > 0
                );
            },
            title: '🎓 先輩たちへの感謝！道場での胴上げと旅立ちの誓い',
            seasonTag: '🎓 旅立ちの春 ｜ 3月2週',
            image: 'img/event/graduation_farewell.png',
            fallbackIcon: '🎓',
            fallbackTitle: '卒業生への送辞と胴上げ',
            tagline: '〜制服姿の先輩たちへ花束を。受け継がれる伝統、新たな覚悟〜',
            narration: '高校の卒業式を終えた先輩たちが道場へ最後の挨拶に訪れる。<br>後輩たちから花束の贈呈と、道場が揺れるほどの感謝の胴上げ！「あとは任せたぞ」託された想いが胸に熱く灯る。',
            dialogues: [
                { speaker: '主将', text: '先輩方、今まで本当にありがとうございました！先輩方の教えを胸に必ず全国を制覇します！' },
                { speaker: '部員', text: '「せーの、そーれ！」宙を舞う先輩たちの晴れやかな笑顔！' },
            ],
            effectsDesc: '🔥 全員の気魄 +3 ｜ 💪 腕力 +1 ｜ 🌟 主将の統率力覚醒！',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 3);
                    m.str = Math.min(STAT_HARD_MAX, (m.str || 10) + 1);
                    improveCondition(m);
                });
                return '卒業生を胴上げで送り出し、伝統のバトンを受け継ぎました！全員の気魄+3、腕力+1、調子向上！';
            },
        },

        // ── 2. 状況・条件連動イベント ──
        {
            id: 'slump_night_talk',
            category: 'conditional',
            triggerRate: 0.10, // 稽古後 約10%
            condition: (state) => state.members.some((m) => m.condition === 'worst' || m.condition === 'poor'),
            title: '🌙 月明かりの居残り稽古！スランプを打ち破る一本',
            seasonTag: '🌙 静夜の絆',
            image: 'img/event/slump_night_talk.png',
            fallbackIcon: '🌙',
            fallbackTitle: 'スランプ脱出の深夜稽古',
            tagline: '〜消灯前の道場、静かに向き合う二人。迷いを断ち切る鋭い打突〜',
            narration: '最近スランプに悩んでいた部員が、一人道場に残って素振りを繰り返していた。<br>そこへ主将がそっと歩み寄り竹刀を交える。「焦るな、お前の打突は素晴らしいものを持ってる」迷いがスーッと晴れていく。',
            dialogues: [
                { speaker: '主将', text: '力を抜け。結果を気にしすぎて構えが小さくなってるぞ。思い切り打ち込んでこい！' },
                { speaker: '部員', text: '「めぇぇぇん！」…あ、今の感触…！主将、私、掴めました！' },
            ],
            effectsDesc: '✨ 不調部員の調子が【絶好調】へ！ ｜ ⚔️ 得意技 +3！',
            apply: (state) => {
                const target = state.members.find((m) => m.condition === 'worst' || m.condition === 'poor') || state.members[0];
                if (target) {
                    target.condition = 'best';
                    if (!target.skills) target.skills = { men: 10, kote: 10, do: 10, tsuki: 8 };
                    const fav = target.favStance === 'jodan' ? 'men' : target.favStance === 'waki' ? 'do' : 'kote';
                    target.skills[fav] = Math.min(STAT_HARD_MAX, target.skills[fav] + 3);
                    return `主将の温かい指導で【${target.name}】がスランプを完全に脱出！調子が【絶好調】になり、得意技が+3強化されました！`;
                }
                return '居残り稽古で部員の迷いが晴れました！';
            },
        },
        {
            id: 'manager_onigiri',
            category: 'conditional',
            triggerRate: 0.10, // 稽古後 約10%
            condition: (state) => {
                const totalFatigue = state.members.reduce((acc, m) => acc + (m.fatigue || 0), 0);
                return (totalFatigue / Math.max(1, state.members.length)) >= 45;
            },
            title: '🍙 愛情満点！特大スタミナおにぎりとレモン蜂蜜漬け',
            seasonTag: '🍙 心温まる差し入れ',
            image: 'img/event/manager_onigiri.png',
            fallbackIcon: '🍙',
            fallbackTitle: '特大スタミナおにぎり',
            tagline: '〜過酷な稽古の合間、心尽くしの差し入れが疲れた体を芯から癒す〜',
            narration: '連日の猛稽古で全員が疲労困憊の中、マネージャーから特大スタミナおにぎりと冷えたレモン蜂蜜漬けの差し入れ！<br>「皆さんお疲れ様です！いっぱい食べてくださいね！」道場に笑顔と活力が戻る！',
            dialogues: [
                { speaker: '部員', text: '鮭に昆布に梅干し！大きくて具だくさんでめちゃくちゃ美味しいです！' },
                { speaker: '主将', text: 'ありがたいな…！みんなの支えがあってこそ稽古に打ち込める。感謝して完食しよう！' },
            ],
            effectsDesc: '🍵 チーム全員の疲労度 -45 ｜ 🌟 全員の調子が上昇！',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.fatigue = Math.max(0, (m.fatigue || 0) - 45);
                    improveCondition(m);
                });
                return '特大おにぎりとレモンの差し入れで疲労が一気に回復！全員の疲労度-45、調子向上！';
            },
        },
        {
            id: 'cross_club_training',
            category: 'conditional',
            triggerRate: 0.10, // 稽古後 約10%
            condition: (state) => state.members.some((m) => m.isClubDual),
            title: '🤝 助っ人部員が伝授！他部直伝のフィジカルトレーニング',
            seasonTag: '🤝 異種目コラボ特訓',
            image: 'img/event/cross_club_training.png',
            fallbackIcon: '🤝',
            fallbackTitle: '他部直伝フィジカルトレーニング',
            tagline: '〜異なる部活の知恵が融合！新たな体の使い方に目覚める〜',
            narration: '助っ人部員が元いた部活（陸上や柔道など）の秘伝フィジカルトレーニングを剣道部に紹介！<br>「剣道のすり足や体当たりにもめちゃくちゃ応用できますよ！」部員全員で挑戦し、新境地を開拓！',
            dialogues: [
                { speaker: '部員', text: '体幹と股関節の使い方が全然違います！下半身がブレなくなりました！' },
                { speaker: '主将', text: '掛け持ち助っ人の視点が部を強くする。素晴らしいメニューだ、取り入れよう！' },
            ],
            effectsDesc: '🏃 全員の敏捷 +2 ｜ 💪 腕力 +2',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.agi = Math.min(STAT_HARD_MAX, (m.agi || 10) + 2);
                    m.str = Math.min(STAT_HARD_MAX, (m.str || 10) + 2);
                });
                return '助っ人部員考案のトレーニングで下半身と体幹が強化！全員の敏捷+2、腕力+2！';
            },
        },
        {
            id: 'legendary_ob_visit',
            category: 'conditional',
            triggerRate: 0.08, // 今まで通り 約8%
            condition: (state) => state.members && state.members.length > 0,
            title: '🥋 かつて全国を制した伝説のOB先輩が電撃来訪！',
            seasonTag: '🥋 伝説の襲来',
            image: 'img/event/legendary_ob_visit.png',
            fallbackIcon: '🥋',
            fallbackTitle: '伝説のOB先輩・電撃来訪',
            tagline: '〜防具を担いでふらりと登場！鬼のような掛かり稽古で限界突破〜',
            narration: '「おいおい、声が小さいんじゃないか？」道場の引き戸が開き、全国優勝経験を持つ伝説のOB先輩が登場！<br>容赦のない怒涛の掛かり稽古を全員につけられ、道場には熱気と闘志が渦巻いた！',
            dialogues: [
                { speaker: 'OB先輩', text: '気迫で負けてどうする！構えを崩さず前へ出ろ！まだいけるぞ！' },
                { speaker: '主将', text: '「ありがとうございましたッ！」これが全国を獲った人の気迫…！負けていられない！' },
            ],
            effectsDesc: '💪 腕力 +2 ｜ 🔥 気魄 +3 ｜ ⚔️ 面技術 +2',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.str = Math.min(STAT_HARD_MAX, (m.str || 10) + 2);
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 3);
                    if (!m.skills) m.skills = { men: 10, kote: 10, do: 10, tsuki: 8 };
                    m.skills.men = Math.min(STAT_HARD_MAX, m.skills.men + 2);
                });
                return '伝説のOB先輩から魂の猛稽古を受けました！全員の腕力+2、気魄+3、面技術+2！';
            },
        },

        // ── 3. 日常ランダムイベント ──
        {
            id: 'after_school_snack',
            category: 'daily',
            title: '🍗 部活帰りの寄り道！商店街での熱々買い食い',
            seasonTag: '🍗 放課後の幸福',
            image: 'img/event/after_school_snack.png',
            fallbackIcon: '🍗',
            fallbackTitle: '放課後の寄り道買い食い',
            tagline: '〜夕焼け空の下、竹刀袋を背負ってかじる揚げたてコロッケ〜',
            narration: 'ハードな稽古を終えた帰り道、駅前の商店街で揚げたての熱々コロッケとファミチキを皆で買い食い！<br>サクサクの衣とジューシーな肉汁に、今日一日の疲れがスーッと溶けていく何気ない幸福。',
            dialogues: [
                { speaker: '部員', text: '稽古の後の買い食い、なんでこんなに美味しいんでしょうね！' },
                { speaker: '主将', text: 'しっかり食って筋肉に変えろよ！明日も厳しい稽古が待ってるからな！' },
            ],
            effectsDesc: '🍵 チーム全員の疲労度 -15 ｜ 🌟 全員の調子が上昇！',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.fatigue = Math.max(0, (m.fatigue || 0) - 15);
                    improveCondition(m);
                });
                return '放課後の買い食いで笑顔がこぼれました！全員の疲労度-15、調子が向上！';
            },
        },
        {
            id: 'rainy_meditation',
            category: 'daily',
            title: '🌧️ 激しい通り雨と道場の静けさ・不動の座禅瞑想',
            seasonTag: '🌧️ 雨宿りと静寂',
            image: 'img/event/rainy_meditation.png',
            fallbackIcon: '🧘',
            fallbackTitle: '雨宿りの座禅瞑想',
            tagline: '〜屋根を叩く雨音、心を無にして正座する道場での静かな時間〜',
            narration: '稽古終了と同時に外は猛烈な夕立。雨宿りを兼ねて、道場の照明を落とし全員で静かに座禅を組む。<br>雨音に包まれながら呼吸を整えると、心が研ぎ澄まされ不動心が宿っていく。',
            dialogues: [
                { speaker: '主将', text: '雨音に耳を澄ませろ。雑念を捨て、心を鏡のように澄み切らせるんだ。' },
                { speaker: '部員', text: '深く息を吐くと、頭の中のモヤモヤが消えて驚くほど集中できました。' },
            ],
            effectsDesc: '🔥 全員の気魄 +2 ｜ 🍵 疲労度 -10',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 2);
                    m.fatigue = Math.max(0, (m.fatigue || 0) - 10);
                });
                return '静かな雨の座禅で不動心が研ぎ澄まされました！全員の気魄+2、疲労度-10！';
            },
        },
        {
            id: 'clubroom_treasure',
            category: 'daily',
            title: '📷 部室の奥から発掘！歴代先輩の記念アルバムと寄せ書き',
            seasonTag: '📷 伝統の息吹',
            image: 'img/event/clubroom_treasure.png',
            fallbackIcon: '📜',
            fallbackTitle: '歴代の寄せ書きとアルバム',
            tagline: '〜埃をかぶったアルバムを開くと、そこには黄金期の熱き誓い〜',
            narration: '部室のロッカーの整理中、歴代の先輩たちが残した古いアルバムと布製の部旗を発見！<br>「目指せ全国制覇！」と力強く書かれた寄せ書きに、時代を超えた熱い情熱が込み上げてくる。',
            dialogues: [
                { speaker: '部員', text: '見てください主将！10年前の先輩たちの写真です！みんな今の私たちと同じ顔してます！' },
                { speaker: '主将', text: 'この人たちも同じ道場で汗を流したんだな。先輩たちに恥じない結果を残そう！' },
            ],
            effectsDesc: '🔥 部員全員の気魄 +2 ｜ 🌟 全員の調子が上昇！',
            apply: (state) => {
                state.members.forEach((m) => {
                    m.spi = Math.min(STAT_HARD_MAX, (m.spi || 10) + 2);
                    improveCondition(m);
                });
                return '歴代先輩の熱い想いに触れ闘志が再燃！全員の気魄+2、調子が向上！';
            },
        },
    ];

    // イベント表示用データ構築
    function buildEventData(eventDef) {
        if (!eventDef) return null;
        const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0] || { name: '主将' };
        const otherMembers = ClubState.members.filter((m) => !m.isPlayer);
        const randomMember = otherMembers.length > 0 ? getRandomItem(otherMembers) : captain;

        let dialogues = [];
        let retiredSeniors = [];

        // 3月2週「旅立ちの春（卒業式）」特有の処理：前年9月に引退した3年生元部員と掛け合い
        if (eventDef.id === 'graduation_farewell') {
            retiredSeniors = (ClubState.lastRetiredSeniors && Array.isArray(ClubState.lastRetiredSeniors.members))
                ? ClubState.lastRetiredSeniors.members
                : [];

            if (retiredSeniors.length > 0) {
                // 先輩代表（元主将がいれば元主将、いなければ1人目）
                const mainSenior = retiredSeniors.find((s) => s.wasPlayer || s.isPlayer) || retiredSeniors[0];
                const subSenior = retiredSeniors.find((s) => s.id !== mainSenior.id);

                // 1. 先輩代表からの激励の言葉
                dialogues.push({
                    speaker: mainSenior.name,
                    speakerRole: '卒業生',
                    isSenior: true,
                    retiredMember: mainSenior,
                    text: `${captain.name}、新チームを立派に引っ張ってくれたな。お前たちなら絶対に全国の頂点に立てる！俺たちの想いも連れて行ってくれ！`,
                });

                // 2. 2人目の先輩がいればその言葉
                if (subSenior) {
                    dialogues.push({
                        speaker: subSenior.name,
                        speakerRole: '卒業生',
                        isSenior: true,
                        retiredMember: subSenior,
                        text: `道場もお前たちに託したぞ！たまにはOBとして稽古をつけてやるから覚悟しておけよ！`,
                    });
                }

                // 3. 現主将からの送辞と誓い
                dialogues.push({
                    speaker: captain.name,
                    speakerRole: '主将',
                    memberId: captain.id,
                    text: `${mainSenior.name}先輩方、今まで本当にありがとうございました！先輩方の教えを胸に、必ず全国制覇を果たします！`,
                });

                // 4. 後輩部員たちの胴上げ掛け声
                dialogues.push({
                    speaker: randomMember.name,
                    speakerRole: '部員',
                    memberId: randomMember.id,
                    text: `「せーの、そーれ！」宙を舞う先輩たちの晴れやかな笑顔！道場に感謝の胴上げと歓声が響き渡る！`,
                });
            }
        }

        // デフォルトの会話構築
        if (dialogues.length === 0) {
            dialogues = (eventDef.dialogues || []).map((d) => {
                const targetMember = d.speaker === '主将' ? captain : d.speaker === '部員' ? randomMember : null;
                const speakerName = targetMember ? targetMember.name : d.speaker;
                return {
                    speaker: speakerName,
                    speakerRole: d.speaker,
                    memberId: targetMember ? targetMember.id : null,
                    text: d.text.replace(/\{captain\}/g, captain.name).replace(/\{member\}/g, randomMember.name),
                };
            });
        }

        return {
            id: eventDef.id,
            title: eventDef.title,
            seasonTag: eventDef.seasonTag,
            image: eventDef.image,
            fallbackIcon: eventDef.fallbackIcon,
            fallbackTitle: eventDef.fallbackTitle,
            tagline: eventDef.tagline,
            narration: eventDef.narration,
            dialogues: dialogues,
            retiredSeniors: retiredSeniors,
            effectsDesc: eventDef.effectsDesc,
        };
    }

    // 各イベントの年間発生管理（1年に同じイベントは最大1回のみ発生）
    function hasEventTriggeredThisYear(eventId) {
        if (!ClubState.eventHistoryByYear) return false;
        const list = ClubState.eventHistoryByYear[ClubState.year];
        return Array.isArray(list) && list.includes(eventId);
    }

    function markEventTriggeredThisYear(eventId) {
        if (!ClubState.eventHistoryByYear) {
            ClubState.eventHistoryByYear = {};
        }
        if (!Array.isArray(ClubState.eventHistoryByYear[ClubState.year])) {
            ClubState.eventHistoryByYear[ClubState.year] = [];
        }
        if (!ClubState.eventHistoryByYear[ClubState.year].includes(eventId)) {
            ClubState.eventHistoryByYear[ClubState.year].push(eventId);
        }
    }

    // イベント発生判定エンジン
    function checkAndTriggerClubEvent(deferImmediateLaunch = false) {
        if (!ClubState.members || ClubState.members.length === 0) return false;

        let pickedEvent = null;
        // 1. 季節固定イベントのチェック (カレンダーの月・週が完全一致 ＆ 今年度未発生 ＆ 条件関数がある場合は合致)
        const seasonalEvent = CLUB_EVENTS.find((e) => {
            if (e.category !== 'seasonal') return false;
            if (e.month !== ClubState.month || e.week !== ClubState.week) return false;
            if (hasEventTriggeredThisYear(e.id)) return false;
            if (typeof e.condition === 'function') {
                try {
                    if (!e.condition(ClubState)) return false;
                } catch (err) {
                    return false;
                }
            }
            return true;
        });
        if (seasonalEvent) {
            pickedEvent = seasonalEvent;
        } else {
            // 2. 条件付きイベントのチェック（発生条件を満たした上で、個別確率10% [OBは8%] で抽選・年1回制限なし）
            const matchedConditionals = CLUB_EVENTS.filter((e) => {
                if (e.category !== 'conditional') return false;
                if (typeof e.condition === 'function') {
                    try {
                        if (!e.condition(ClubState)) return false;
                    } catch (err) {
                        return false;
                    }
                }
                const rate = typeof e.triggerRate === 'number' ? e.triggerRate : 0.10;
                return Math.random() < rate;
            });

            if (matchedConditionals.length > 0) {
                pickedEvent = getRandomItem(matchedConditionals);
            } else if (Math.random() < 0.10) {
                // 3. 日常ランダムイベントのチェック (通常週の約10%で発生・年1回制限なし)
                const dailyEvents = CLUB_EVENTS.filter((e) => e.category === 'daily');
                if (dailyEvents.length > 0) {
                    pickedEvent = getRandomItem(dailyEvents);
                }
            }
        }

        if (pickedEvent) {
            // 年1回制限の記録は季節固定イベントのみ
            if (pickedEvent.category === 'seasonal') {
                markEventTriggeredThisYear(pickedEvent.id);
            }
            if (deferImmediateLaunch) {
                // 大会終了直後など：即時遷移させず保留し、まず練習メニュー画面を表示
                ClubState.pendingEventData = buildEventData(pickedEvent);
                return false;
            } else {
                triggerClubEvent(pickedEvent);
                return true;
            }
        }

        return false;
    }

    // イベント発動・データ構築
    function triggerClubEvent(eventDef) {
        if (!eventDef) return;
        ClubState.currentEventData = buildEventData(eventDef);
        ClubState.viewPhase = 'event_scene';
    }

    // イベント完了・効果適用
    function completeClubEvent() {
        if (!ClubState.currentEventData) {
            ClubState.viewPhase = 'dashboard';
            renderClubUI();
            return;
        }

        const eventDef = CLUB_EVENTS.find((e) => e.id === ClubState.currentEventData.id);
        let logSummary = '';
        if (eventDef && typeof eventDef.apply === 'function') {
            try {
                logSummary = eventDef.apply(ClubState);
            } catch (err) {
                console.error('[KendoClub] Error applying event effects:', err);
            }
        }

        const logMsg = `✨【${ClubState.year}年目 ${ClubState.month}月${ClubState.week}週】${ClubState.currentEventData.title}！${logSummary ? ' ' + logSummary : ''}`;
        ClubState.activityLog.unshift(logMsg);
        playStatUpSound();

        ClubState.currentEventData = null;
        ClubState.viewPhase = 'dashboard';

        if (ClubState.advanceWeekOnEventComplete) {
            ClubState.advanceWeekOnEventComplete = false;
            advanceCalendarWeek();
        } else {
            saveClubData();
            renderClubUI();
        }
    }

    // ───────────────────────────────────────────
    // 部員ジェネレータ ＆ 個性アーキタイプ
    // ───────────────────────────────────────────
    let memberIdCounter = 1;

    // 部員の個性アーキタイプ（パラメータの強弱付け ＆ 得意技アサイン）
    const MEMBER_ARCHETYPES = [
        {
            id: 'power',
            typeName: '剛腕パワー型',
            stance: 'jodan',
            specialTechnique: 'gouriki_men',
            statMod: { hp: 1, str: 6, agi: -2, spi: 1 },
            skillMod: { men: 5, kote: 0, do: 1, tsuki: -1 },
            desc: '恵まれた体格と豪腕から繰り出す重烈な上段面が武器。力で相手を圧倒する。'
        },
        {
            id: 'speed',
            typeName: '韋駄天スピード型',
            stance: 'chudan',
            specialTechnique: 'dengeki_kote',
            statMod: { hp: 0, str: -2, agi: 7, spi: 1 },
            skillMod: { men: 1, kote: 6, do: 0, tsuki: 2 },
            desc: '驚異的な足さばきと瞬発力を誇り、電光石火の出ばな小手を的確に狙い撃つ。'
        },
        {
            id: 'spirit',
            typeName: '不動心気魄型',
            stance: 'chudan',
            specialTechnique: 'shiden_tsuki',
            statMod: { hp: 1, str: 1, agi: -1, spi: 7 },
            skillMod: { men: 1, kote: 1, do: 5, tsuki: 0 },
            desc: '強靭な精神力と粘り強さを持ち、激しい競り合いから鋭い胴を抜く不動の剣士。'
        },
        {
            id: 'tsuki',
            typeName: '電光石火・突き技巧型',
            stance: 'chudan',
            specialTechnique: 'tensho_tsuki',
            statMod: { hp: 0, str: 1, agi: 4, spi: 2 },
            skillMod: { men: 0, kote: 1, do: -1, tsuki: 8 },
            desc: '針の穴を通すような高精度の突きを放ち、一瞬の隙から喉元を射抜く精密技術派。'
        },
        {
            id: 'counter',
            typeName: '後の先カウンター型',
            stance: 'waki',
            specialTechnique: 'hayate_do',
            statMod: { hp: 0, str: 0, agi: 2, spi: 5 },
            skillMod: { men: -1, kote: 2, do: 7, tsuki: 1 },
            desc: '刀を低く構える下段の構えから相手の打ち気を誘い、電撃の返し胴を炸裂させる職人肌。'
        },
        {
            id: 'allround',
            typeName: '万能バランス型',
            stance: 'chudan',
            specialTechnique: 'hien_men',
            statMod: { hp: 1, str: 3, agi: 3, spi: 3 },
            skillMod: { men: 3, kote: 3, do: 3, tsuki: 2 },
            desc: '心技体の基本が極めて高水準で穴がなく、どんな相手とも互角以上に戦える優等生。'
        },
        {
            id: 'talent',
            typeName: '大器晩成・原石型',
            stance: 'chudan',
            specialTechnique: 'tenkou_men',
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
            specialTechnique: 'dengeki_kote',
            desc: '陸上部と掛け持ちの助っ人部員。圧倒的なスプリント力で瞬時に間合いを詰めるが、掛け持ちのため剣道の成長は緩やか。',
            stance: 'chudan',
            statMod: { hp: 0, str: -1, agi: 6, spi: 1 },
            skillMod: { men: 1, kote: 4, do: 0, tsuki: 1 }
        },
        {
            club: '柔道部',
            badge: '柔道部',
            specialTechnique: 'gouriki_men',
            desc: '柔道部と掛け持ちの助っ人部員。強靭な体幹と膂力を誇るが、竹刀の扱いにまだ慣れておらず成長は控えめ。',
            stance: 'chudan',
            statMod: { hp: 2, str: 6, agi: -2, spi: 2 },
            skillMod: { men: 3, kote: 0, do: 2, tsuki: -1 }
        },
        {
            club: '野球部',
            badge: '野球部',
            specialTechnique: 'hien_men',
            desc: '野球部と掛け持ちの助っ人部員。鋭いバットスイングを活かした面打ちは強烈だが、掛け持ちのため技術の習得に時間を要する。',
            stance: 'jodan',
            statMod: { hp: 1, str: 5, agi: 1, spi: 2 },
            skillMod: { men: 5, kote: -1, do: 1, tsuki: -1 }
        },
        {
            club: '吹奏楽部',
            badge: '吹奏楽部',
            specialTechnique: 'shiden_tsuki',
            desc: '吹奏楽部と掛け持ちの助っ人部員。金管楽器で鍛えた肺活量と響き渡る気合が武器だが、剣道の練習量は限られる。',
            stance: 'chudan',
            statMod: { hp: -1, str: -2, agi: 0, spi: 7 },
            skillMod: { men: 2, kote: 0, do: 1, tsuki: 3 }
        },
        {
            club: '卓球部',
            badge: '卓球部',
            specialTechnique: 'dengeki_kote',
            desc: '卓球部と掛け持ちの助っ人部員。卓越した動体視力と瞬時の反射速度で小手を狙うが、竹刀を振る筋力の成長は緩やか。',
            stance: 'chudan',
            statMod: { hp: 0, str: -2, agi: 5, spi: 1 },
            skillMod: { men: 0, kote: 5, do: 0, tsuki: 1 }
        },
        {
            club: '将棋部',
            badge: '将棋部',
            specialTechnique: 'hayate_do',
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

    // ───────────────────────────────────────────
    // 部員固有の防具カラーテーマパレット
    // ───────────────────────────────────────────
    const ARMOR_THEMES = [
        {
            id: 'kuro',
            name: '黒漆塗',
            badgeBg: 'rgba(15, 23, 42, 0.85)',
            badgeBorder: 'rgba(148, 163, 184, 0.45)',
            dotColor: '#64748b',
            armor: {
                doStops: ['#0f172a', '#1e293b', '#334155', '#1e293b', '#0a0f1d'],
                muneFill: '#0f172a',
                muneStitch: 'rgba(226, 232, 240, 0.8)',
                tareLine: 'rgba(148, 163, 184, 0.6)',
            }
        },
        {
            id: 'tame',
            name: '溜塗',
            badgeBg: 'rgba(59, 7, 7, 0.85)',
            badgeBorder: 'rgba(239, 68, 68, 0.45)',
            dotColor: '#dc2626',
            armor: {
                doStops: ['#3b0707', '#7f1d1d', '#b91c1c', '#601010', '#250505'],
                muneFill: '#1a0606',
                muneStitch: 'rgba(251, 191, 36, 0.85)',
                tareLine: 'rgba(248, 113, 113, 0.65)',
            }
        },
        {
            id: 'konpi',
            name: '紺ピ藍塗',
            badgeBg: 'rgba(8, 47, 73, 0.85)',
            badgeBorder: 'rgba(14, 165, 233, 0.45)',
            dotColor: '#0284c7',
            armor: {
                doStops: ['#082f49', '#0369a1', '#0ea5e9', '#075985', '#0c4a6e'],
                muneFill: '#0f172a',
                muneStitch: 'rgba(56, 189, 248, 0.88)',
                tareLine: 'rgba(56, 189, 248, 0.65)',
            }
        },
        {
            id: 'oribe',
            name: '織部翠漆',
            badgeBg: 'rgba(5, 46, 22, 0.85)',
            badgeBorder: 'rgba(34, 197, 94, 0.45)',
            dotColor: '#16a34a',
            armor: {
                doStops: ['#052e16', '#15803d', '#22c55e', '#166534', '#041e0e'],
                muneFill: '#061a10',
                muneStitch: 'rgba(134, 239, 172, 0.85)',
                tareLine: 'rgba(74, 222, 128, 0.65)',
            }
        },
        {
            id: 'shikon',
            name: '紫紺塗',
            badgeBg: 'rgba(46, 16, 101, 0.85)',
            badgeBorder: 'rgba(168, 85, 247, 0.45)',
            dotColor: '#9333ea',
            armor: {
                doStops: ['#2e1065', '#581c87', '#9333ea', '#4c1d95', '#1e1b4b'],
                muneFill: '#1a0b36',
                muneStitch: 'rgba(216, 180, 254, 0.88)',
                tareLine: 'rgba(192, 132, 252, 0.65)',
            }
        },
        {
            id: 'kohaku',
            name: '琥珀飴色',
            badgeBg: 'rgba(66, 32, 6, 0.85)',
            badgeBorder: 'rgba(234, 179, 8, 0.45)',
            dotColor: '#ca8a04',
            armor: {
                doStops: ['#422006', '#a16207', '#eab308', '#854d0e', '#271202'],
                muneFill: '#1c1917',
                muneStitch: 'rgba(253, 224, 71, 0.92)',
                tareLine: 'rgba(250, 204, 21, 0.75)',
            }
        },
        {
            id: 'akebono',
            name: '曙塗',
            badgeBg: 'rgba(24, 24, 27, 0.85)',
            badgeBorder: 'rgba(249, 115, 22, 0.45)',
            dotColor: '#ea580c',
            armor: {
                doStops: ['#18181b', '#450a0a', '#dc2626', '#991b1b', '#09090b'],
                muneFill: '#18181b',
                muneStitch: 'rgba(251, 146, 60, 0.9)',
                tareLine: 'rgba(249, 115, 22, 0.65)',
            }
        },
        {
            id: 'isushigin',
            name: '燻し銀塗',
            badgeBg: 'rgba(30, 41, 59, 0.85)',
            badgeBorder: 'rgba(203, 213, 225, 0.45)',
            dotColor: '#94a3b8',
            armor: {
                doStops: ['#1e293b', '#475569', '#94a3b8', '#334155', '#0f172a'],
                muneFill: '#111827',
                muneStitch: 'rgba(203, 213, 225, 0.9)',
                tareLine: 'rgba(148, 163, 184, 0.7)',
            }
        },
        {
            id: 'shinshu',
            name: '真朱漆',
            badgeBg: 'rgba(76, 5, 25, 0.85)',
            badgeBorder: 'rgba(244, 63, 94, 0.45)',
            dotColor: '#e11d48',
            armor: {
                doStops: ['#4c0519', '#9f1239', '#e11d48', '#881337', '#2e020d'],
                muneFill: '#1c040a',
                muneStitch: 'rgba(254, 205, 211, 0.9)',
                tareLine: 'rgba(251, 113, 133, 0.7)',
            }
        },
        {
            id: 'asagi',
            name: '浅葱青磁',
            badgeBg: 'rgba(4, 47, 46, 0.85)',
            badgeBorder: 'rgba(20, 184, 166, 0.45)',
            dotColor: '#0d9488',
            armor: {
                doStops: ['#042f2e', '#0f766e', '#14b8a6', '#115e59', '#021e1d'],
                muneFill: '#041f1e',
                muneStitch: 'rgba(153, 246, 228, 0.88)',
                tareLine: 'rgba(45, 212, 191, 0.65)',
            }
        },
        {
            id: 'tetsukon',
            name: '鉄紺塗',
            badgeBg: 'rgba(15, 23, 42, 0.85)',
            badgeBorder: 'rgba(99, 102, 241, 0.45)',
            dotColor: '#4f46e5',
            armor: {
                doStops: ['#1e1b4b', '#312e81', '#4338ca', '#1e1b4b', '#0f172a'],
                muneFill: '#111827',
                muneStitch: 'rgba(199, 210, 254, 0.88)',
                tareLine: 'rgba(129, 140, 248, 0.65)',
            }
        },
        {
            id: 'ogon',
            name: '黄金梨地',
            badgeBg: 'rgba(41, 37, 36, 0.85)',
            badgeBorder: 'rgba(245, 158, 11, 0.45)',
            dotColor: '#f59e0b',
            armor: {
                doStops: ['#292524', '#78350f', '#d97706', '#92400e', '#1c1917'],
                muneFill: '#1c1917',
                muneStitch: 'rgba(254, 240, 138, 0.95)',
                tareLine: 'rgba(251, 191, 36, 0.78)',
            }
        }
    ];

    function assignMemberArmorTheme(member, existingThemes = []) {
        if (member.armorTheme && member.armorTheme.themeName) {
            return;
        }

        let pool = [...ARMOR_THEMES];
        const unused = pool.filter(t => !existingThemes.includes(t.id));
        if (unused.length > 0) pool = unused;

        let selected = null;
        if (member.isPlayer) {
            selected = pool.find(t => ['ogon', 'kuro', 'konpi', 'tame'].includes(t.id)) || pool[0];
        } else if (member.isClubDual) {
            const clubMap = {
                '陸上部': 'asagi',
                '柔道部': 'kuro',
                '野球部': 'shinshu',
                '吹奏楽部': 'shikon',
                '卓球部': 'konpi',
                '将棋部': 'kohaku'
            };
            const prefId = clubMap[member.originalClub];
            selected = pool.find(t => t.id === prefId) || pool[0];
        } else if (member.archetypeId === 'power') {
            selected = pool.find(t => ['tame', 'shinshu', 'akebono', 'kuro'].includes(t.id)) || pool[0];
        } else if (member.archetypeId === 'speed') {
            selected = pool.find(t => ['asagi', 'konpi', 'isushigin'].includes(t.id)) || pool[0];
        } else if (member.archetypeId === 'spirit') {
            selected = pool.find(t => ['shikon', 'tetsukon', 'oribe'].includes(t.id)) || pool[0];
        } else if (member.archetypeId === 'tsuki') {
            selected = pool.find(t => ['isushigin', 'asagi', 'kohaku'].includes(t.id)) || pool[0];
        } else if (member.archetypeId === 'counter') {
            selected = pool.find(t => ['tame', 'kohaku', 'shikon'].includes(t.id)) || pool[0];
        } else {
            const hash = (member.id || member.name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
            selected = pool[hash % pool.length];
        }

        if (!selected) selected = ARMOR_THEMES[0];

        member.armorTheme = {
            ...selected.armor,
            themeId: selected.id,
            themeName: selected.name,
            badgeBg: selected.badgeBg,
            badgeBorder: selected.badgeBorder,
            dotColor: selected.dotColor,
        };
    }

    // 部員のパラメータ別隠し成長率の生成（各パラメータ50%〜150%の範囲で個性を付与）
    function generateGrowthRates(archetype, isPlayer = false, isClubDual = false, dualTemplate = null) {
        const stats = ['str', 'agi', 'spi', 'men', 'kote', 'do', 'tsuki'];
        const rates = {};

        if (isClubDual) {
            // 他部助っ人部員：掛け持ちのため全体としては控えめ（0.50〜0.75）だが、部活特性パラメータは0.85〜1.25まで伸びる
            const club = dualTemplate ? dualTemplate.club : null;
            stats.forEach((st) => {
                let base = 0.52 + Math.random() * 0.18; // 0.52〜0.70
                if (club === '陸上部' && (st === 'agi' || st === 'kote')) base += 0.40;
                else if (club === '柔道部' && (st === 'str' || st === 'men')) base += 0.40;
                else if (club === '野球部' && (st === 'str' || st === 'tsuki')) base += 0.35;
                else if (club === '卓球部' && (st === 'agi' || st === 'kote')) base += 0.35;
                else if (club === '吹奏楽部' && (st === 'spi' || st === 'do')) base += 0.35;
                else if (club === '将棋部' && (st === 'spi' || st === 'do')) base += 0.35;
                rates[st] = Math.round(Math.min(1.50, Math.max(0.50, base)) * 100) / 100;
            });
            return rates;
        }

        // 通常部員：中央値 1.00、アーキタイプによる得意・苦手傾斜（50%〜150%）を付与
        const archId = archetype ? archetype.id : 'allround';
        stats.forEach((st) => {
            let base = 0.90 + Math.random() * 0.20; // 0.90〜1.10

            if (archId === 'power') {
                if (st === 'str' || st === 'men') base += 0.28 + Math.random() * 0.15; // 1.18〜1.50
                else if (st === 'agi' || st === 'tsuki') base -= 0.25 + Math.random() * 0.15; // 0.50〜0.85
            } else if (archId === 'speed') {
                if (st === 'agi' || st === 'kote') base += 0.28 + Math.random() * 0.15; // 1.18〜1.50
                else if (st === 'str' || st === 'do') base -= 0.25 + Math.random() * 0.15; // 0.50〜0.85
            } else if (archId === 'spirit') {
                if (st === 'spi' || st === 'do') base += 0.28 + Math.random() * 0.15; // 1.18〜1.50
                else if (st === 'agi') base -= 0.20 + Math.random() * 0.15; // 0.55〜0.90
            } else if (archId === 'tsuki') {
                if (st === 'tsuki') base += 0.32 + Math.random() * 0.15; // 1.22〜1.50
                else if (st === 'agi') base += 0.15 + Math.random() * 0.10;
                else if (st === 'men' || st === 'do') base -= 0.22 + Math.random() * 0.15;
            } else if (archId === 'counter') {
                if (st === 'do') base += 0.30 + Math.random() * 0.15; // 1.20〜1.50
                else if (st === 'spi') base += 0.18 + Math.random() * 0.12;
                else if (st === 'men') base -= 0.25 + Math.random() * 0.15;
            } else if (archId === 'allround') {
                base += (Math.random() - 0.5) * 0.25; // 0.78〜1.22（バランス型）
            } else if (archId === 'talent') {
                // 大器晩成・原石型：全体的に高め（1.05〜1.45）
                base += 0.18 + Math.random() * 0.18;
            }

            if (isPlayer) {
                // 主将：安定・高水準（0.98〜1.38）
                base = Math.max(0.98, base + 0.08);
            }

            rates[st] = Math.round(Math.min(1.50, Math.max(0.50, base)) * 100) / 100;
        });

        return rates;
    }

    // 旧互換用（単一数値の平均値を取得）
    function generateGrowthRate(archetype, isPlayer = false) {
        const rates = generateGrowthRates(archetype, isPlayer, false);
        const vals = Object.values(rates);
        const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
        return Math.round(avg * 100) / 100;
    }

    function createMember(name, grade, isPlayer = false, chosenArchetype = null) {
        const archetype = chosenArchetype || getRandomItem(MEMBER_ARCHETYPES);

        const stance = archetype.stance || 'chudan';
        const sMod = archetype.statMod || {};
        const skMod = archetype.skillMod || {};

        const baseHp = grade === 1
            ? Math.min(3, Math.max(1, 1 + (sMod.hp || 0) + Math.floor(Math.random() * 2)))
            : Math.min(8, Math.max(3, 4 + (grade >= 2 ? 1 : 0) + (sMod.hp || 0) + (Math.random() < 0.3 ? 1 : 0)));
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

        const growthRates = generateGrowthRates(archetype, isPlayer, false);
        const gRateVals = Object.values(growthRates);
        const avgGrowthRate = Math.round((gRateVals.reduce((s, v) => s + v, 0) / gRateVals.length) * 100) / 100;

        const m = {
            id: `mem_${Date.now()}_${memberIdCounter++}`,
            name: name,
            grade: grade, // 1, 2, 3年
            isPlayer: isPlayer,
            archetypeId: archetype.id,
            archetypeName: archetype.typeName,
            talentCaps: talentCaps,
            isClubDual: false,
            originalClub: null,
            growthRates: growthRates, // パラメータ毎の隠し成長率（50%〜150%）
            growthRate: avgGrowthRate, // 旧互換用
            maxHealth: Math.min(8, baseHp),
            str: baseStr,
            agi: baseAgi,
            spi: baseSpi,
            skills: skills,
            specialTechnique: archetype.specialTechnique || 'hien_men',
            favStance: stance,
            condition: getRandomItem(['good', 'normal', 'normal', 'best']),
            fatigue: 0,
            desc: desc,
            armorTheme: null,
        };

        const existingThemes = (ClubState.members || []).map(item => item.armorTheme && item.armorTheme.themeId).filter(Boolean);
        assignMemberArmorTheme(m, existingThemes);
        if (window.FaceGenerator) {
            m.face = window.FaceGenerator.generateFace({
                seed: m.id || m.name,
                name: m.name,
                isPlayer: isPlayer
            });
        }
        return m;
    }

    // 他部からの掛け持ち助っ人部員生成
    function createDualClubMember(template = null) {
        const tpl = template || getRandomItem(DUAL_CLUB_TEMPLATES);
        const name = generateRandomName();
        const grade = Math.random() < 0.6 ? 1 : 2; // 1年または2年
        const sMod = tpl.statMod || {};
        const skMod = tpl.skillMod || {};

        const baseHp = grade === 1
            ? Math.min(3, Math.max(1, 1 + (sMod.hp || 0) + Math.floor(Math.random() * 2)))
            : Math.min(8, Math.max(3, 4 + (grade >= 2 ? 1 : 0) + (sMod.hp || 0)));
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
        const growthRates = generateGrowthRates(null, false, true, tpl);
        const gRateVals = Object.values(growthRates);
        const avgGrowthRate = Math.round((gRateVals.reduce((s, v) => s + v, 0) / gRateVals.length) * 100) / 100;

        const m = {
            id: `mem_dual_${Date.now()}_${memberIdCounter++}`,
            name: name,
            grade: grade,
            isPlayer: false,
            archetypeId: `dual_${tpl.club}`,
            archetypeName: `${tpl.club}助っ人`,
            talentCaps: talentCaps,
            isClubDual: true,
            originalClub: tpl.club,
            growthRates: growthRates, // パラメータ毎の隠し成長率（特化80〜125%、他50〜75%）
            growthRate: avgGrowthRate, // 旧互換用
            maxHealth: Math.min(8, baseHp),
            str: baseStr,
            agi: baseAgi,
            spi: baseSpi,
            skills: skills,
            specialTechnique: tpl.specialTechnique || 'hien_men',
            favStance: tpl.stance || 'chudan',
            condition: getRandomItem(['good', 'normal', 'normal']),
            fatigue: 0,
            desc: tpl.desc,
            armorTheme: null,
        };

        const existingThemes = (ClubState.members || []).map(item => item.armorTheme && item.armorTheme.themeId).filter(Boolean);
        assignMemberArmorTheme(m, existingThemes);
        if (window.FaceGenerator) {
            m.face = window.FaceGenerator.generateFace({
                seed: m.id || m.name,
                name: m.name,
                isPlayer: false,
                uniformType: 'shirt'
            });
        }
        return m;
    }

    // 必殺技・得意技データの安全な取得ヘルパー
    function getSpecialTechniqueData(techId) {
        const id = techId || 'hien_men';
        if (typeof window !== 'undefined' && window.SPECIAL_TECHNIQUES && window.SPECIAL_TECHNIQUES[id]) {
            return window.SPECIAL_TECHNIQUES[id];
        }
        if (typeof SPECIAL_TECHNIQUES !== 'undefined' && SPECIAL_TECHNIQUES[id]) {
            return SPECIAL_TECHNIQUES[id];
        }
        return null;
    }

    // 部員の得意技バッジHTML生成
    function getMemberSpecialTechBadgeHtml(m) {
        if (!m) return '';
        const techId = m.specialTechnique || 'hien_men';
        const tech = getSpecialTechniqueData(techId)
            || { name: '飛燕二段面', type: '面', reqStat: 'men', reqVal: 38, desc: '電光石火の二段面' };
        const currentVal = (m.skills && m.skills[tech.reqStat]) || 0;
        const isUnlocked = currentVal >= tech.reqVal;
        if (isUnlocked) {
            return `<span class="special-skill-badge unlocked" title="${escapeHtml(tech.desc || '')}（必要: ${tech.type}${tech.reqVal} 達成・覚醒済）">🌟 秘技: ${escapeHtml(tech.name)}</span>`;
        } else {
            return `<span class="special-skill-badge locked" title="${escapeHtml(tech.desc || '')}（${tech.type}${tech.reqVal}以上で覚醒 / 現在:${currentVal}）">🔒 秘技: ${escapeHtml(tech.name)}</span>`;
        }
    }

    // 初期チーム生成（廃部からの再建：主将＝1年生、他に新入1年生が1〜3名ランダム在籍し、2・3年生は0名）
    function createInitialTeam(schoolName, pref, captainName) {
        const members = [];
        // 主将（1年生プレイヤー・廃部を再建した創部主将：全7種からランダム選定）
        const captainArchetype = getRandomItem(MEMBER_ARCHETYPES);
        const captain = createMember(captainName, 1, true, captainArchetype);
        captain.str += 1;
        captain.agi += 1;
        captain.spi += 3; // ゼロから再建する強い信念
        members.push(captain);

        // 主将以外の1年生部員：1〜3名をランダム決定（主将と異なるアーキタイプを優先）
        const extraCount = 1 + Math.floor(Math.random() * 3); // 1, 2, 3 のいずれか
        const poolArchetypes = MEMBER_ARCHETYPES.filter(a => a.id !== captainArchetype.id);
        const shuffledArchs = [...poolArchetypes].sort(() => Math.random() - 0.5);

        for (let i = 0; i < extraCount; i++) {
            const arch = shuffledArchs[i] || poolArchetypes[i % poolArchetypes.length];
            members.push(createMember(generateRandomName(), 1, false, arch));
        }

        // 初期メンバー（2〜4名）全員に重複のない防具テーマを確実に割り当て
        members.forEach((m, idx) => {
            m.armorTheme = null;
            const used = members.slice(0, idx).map(other => other.armorTheme && other.armorTheme.themeId).filter(Boolean);
            assignMemberArmorTheme(m, used);
        });

        // 5人制固定オーダー [先鋒, 次鋒, 中堅, 副将, 大将]
        // 大将(4)に主将を配置し、残りの部員を戦力順に副将(3)→中堅(2)→次鋒(1)→先鋒(0)の順に割り当てる
        const nonCaptains = members.filter(m => !m.isPlayer).sort((a, b) => getMemberCombatPower(b) - getMemberCombatPower(a));
        const order = [null, null, null, null, captain.id];
        const slotPriority = [3, 2, 1, 0]; // 副将, 中堅, 次鋒, 先鋒
        nonCaptains.forEach((m, idx) => {
            if (idx < slotPriority.length) {
                order[slotPriority[idx]] = m.id;
            }
        });

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
        qualifiedForInterhigh: false, // 6月1週地区準優勝以上でtrueに
        interhighQualifiedMemberIds: [], // 全国大会出場権を獲得した部員ID
        lastDistrictRank: null,      // 直近の成績 ('win', 'runnerUp', 'best4', etc.)
        lastNationalRank: null,
        lastInterhighDistrictRank: null,
        lastInterhighNationalRank: null,
        activityLog: [],
        viewPhase: 'dashboard',      // 'setup' | 'dashboard' | 'order_edit' | 'match_sim' | 'match_result' | 'history' | 'captain_select' | 'tournament_opening' | 'tournament_ceremony' | 'freshman_welcome' | 'retire_ceremony' | 'new_team_ceremony' | 'event_scene'
        openingTournamentType: null, // 開会式表示中の大会種別
        ceremonyResultData: null,    // 閉会・表彰式表示用のデータ
        freshmanWelcomeData: null,   // 新1年生入部歓迎画面データ
        retireCeremonyData: null,    // 3年生引退セレモニー画面データ
        newTeamCeremonyData: null,   // 新主将就任・新体制始動画面データ
        lastRetiredSeniors: null,    // 当年度9月に引退した3年生先輩部員リスト { year: number, members: Array }
        currentEventData: null,      // 高校生部活ライフイベント画面データ
        pendingEventData: null,      // 保留中の高校生部活ライフイベント（大会直後等、ダッシュボード確認後に表示）
        pendingNewSchoolYear: false, // 全国大会（3月4週）直後等、ダッシュボード確認後に新年度進級・新入生入部セレモニーを実行する保留フラグ
        advanceWeekOnEventComplete: false, // 練習実行後に保留イベントを開いた場合、イベント完了時に週を進めるフラグ
        currentMatchData: null,      // 進行中の大会試合
        selectedSpecialTargetId: null, // 前回選択した特別指導対象部員ID
        selectedPracticeMenu: null,    // 現在選択中の練習メニュー (クリック後に 'basics' | 'suburi' | 'kakari' | 'zazen' | 'rest' | 'special')
        isPracticeExecuting: false,     // 稽古演出中フラグ
        executingPracticeMotion: null,  // 実行演出中の稽古モーション
        practiceExecutionStartTime: 0,  // 稽古クリック時の開始時刻（得意構えからの始動用）
        practiceCompleted1Cycle: false, // 座禅・休養の1回アニメーション完了フラグ
        memberGridScrollLeft: -1,       // 部員カード一覧の横スクロール位置保持（初期値-1: ゲーム開始時右端の大将を表示）
        dashboardScrollY: 0,            // 練習メニュー画面（道場ダッシュボード）の縦スクロール位置保持
        isRestPosture: false,           // 休養後に納刀状態で待機するフラグ
        specialPracticeAttacks: null,   // マンツーマン特別指導時の主将・指名部員のランダム攻撃情報
        isAutoSpectating: false,     // 主将の出番まで連続リアルタイム観戦中フラグ
        captainAutoUnlocked: false,  // 全国制覇特典：主将の試合自動化解放フラグ（周回引き継ぎ対応）
        captainAutoMode: false,      // 全国制覇特典：主将の試合も自動化（オート観戦・即時判定）フラグ
        quickSpecialMode: 'manual',  // クイック特訓モード（'manual' | 'spectate' | 'instant'）
        eventHistoryByYear: {},      // 年度ごとのイベント発生履歴 { [year]: [eventId, ...] } （1年に同一イベントは最大1回）
        history: [],                 // 歴代年表 [{ year, captainName, districtResult, nationalResult, interhighDistrictResult, interhighNationalResult }]
        stats: {
            district: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            national: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            interhighDistrict: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            interhighNational: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
        },
    };

    // ───────────────────────────────────────────
    // 厳格オートセーブ＆ロード
    // ───────────────────────────────────────────
    function saveClubData() {
        try {
            if (Array.isArray(ClubState.activityLog) && ClubState.activityLog.length > 50) {
                ClubState.activityLog.length = 50;
            }
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
                qualifiedForInterhigh: ClubState.qualifiedForInterhigh,
                interhighQualifiedMemberIds: ClubState.interhighQualifiedMemberIds,
                lastDistrictRank: ClubState.lastDistrictRank,
                lastNationalRank: ClubState.lastNationalRank,
                lastInterhighDistrictRank: ClubState.lastInterhighDistrictRank,
                lastInterhighNationalRank: ClubState.lastInterhighNationalRank,
                activityLog: ClubState.activityLog.slice(0, 30),
                viewPhase: ClubState.viewPhase,
                openingTournamentType: ClubState.openingTournamentType,
                ceremonyResultData: ClubState.ceremonyResultData,
                freshmanWelcomeData: ClubState.freshmanWelcomeData,
                retireCeremonyData: ClubState.retireCeremonyData,
                newTeamCeremonyData: ClubState.newTeamCeremonyData,
                currentEventData: ClubState.currentEventData,
                pendingEventData: ClubState.pendingEventData,
                pendingNewSchoolYear: !!ClubState.pendingNewSchoolYear,
                advanceWeekOnEventComplete: !!ClubState.advanceWeekOnEventComplete,
                currentMatchData: ClubState.currentMatchData,
                selectedSpecialTargetId: ClubState.selectedSpecialTargetId,
                selectedPracticeMenu: ClubState.selectedPracticeMenu,
                memberGridScrollLeft: ClubState.memberGridScrollLeft,
                dashboardScrollY: ClubState.dashboardScrollY || 0,
                isRestPosture: !!ClubState.isRestPosture,
                captainAutoUnlocked: !!ClubState.captainAutoUnlocked,
                captainAutoMode: !!ClubState.captainAutoMode,
                lastRetiredSeniors: ClubState.lastRetiredSeniors,
                eventHistoryByYear: ClubState.eventHistoryByYear || {},
                history: ClubState.history,
                stats: ClubState.stats,
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            if (ClubState.captainAutoUnlocked || hasWonNationalChampionship()) {
                setPermanentPerk('captainAutoUnlocked', true);
            }
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
                    if (!m.armorTheme || !m.armorTheme.themeName) {
                        const existingThemes = ClubState.members.filter(other => other !== m && other.armorTheme && other.armorTheme.themeId).map(other => other.armorTheme.themeId);
                        assignMemberArmorTheme(m, existingThemes);
                    }
                    if (!m.growthRates || typeof m.growthRates !== 'object') {
                        if (m.isClubDual) {
                            const tpl = DUAL_CLUB_TEMPLATES.find(t => t.club === m.originalClub);
                            m.growthRates = generateGrowthRates(null, false, true, tpl);
                            m.growthRate = 0.50;
                        } else {
                            const arch = MEMBER_ARCHETYPES.find((a) => a.id === m.archetypeId);
                            m.growthRates = generateGrowthRates(arch, m.isPlayer, false);
                            m.growthRate = 1.0;
                        }
                    } else if (!m.growthRate) {
                        const vals = Object.values(m.growthRates);
                        m.growthRate = Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100;
                    }
                    if (!m.face || !m.face.skin) {
                        if (window.FaceGenerator) {
                            m.face = window.FaceGenerator.generateFace({
                                seed: m.id || m.name,
                                name: m.name,
                                isPlayer: !!m.isPlayer,
                                uniformType: m.isClubDual ? 'shirt' : null
                            });
                        }
                    }
                });
            }
            if (Array.isArray(data.order)) ClubState.order = data.order;
            sanitizeOrder();
            ClubState.qualifiedForNational = !!data.qualifiedForNational;
            ClubState.qualifiedForInterhigh = !!data.qualifiedForInterhigh;
            ClubState.interhighQualifiedMemberIds = Array.isArray(data.interhighQualifiedMemberIds) ? data.interhighQualifiedMemberIds : [];
            ClubState.lastDistrictRank = data.lastDistrictRank || null;
            ClubState.lastNationalRank = data.lastNationalRank || null;
            ClubState.lastInterhighDistrictRank = data.lastInterhighDistrictRank || null;
            ClubState.lastInterhighNationalRank = data.lastInterhighNationalRank || null;
            if (Array.isArray(data.activityLog)) ClubState.activityLog = data.activityLog;
            ClubState.viewPhase = data.viewPhase || 'dashboard';
            ClubState.openingTournamentType = data.openingTournamentType || null;
            ClubState.ceremonyResultData = data.ceremonyResultData || null;
            ClubState.freshmanWelcomeData = data.freshmanWelcomeData || null;
            ClubState.retireCeremonyData = data.retireCeremonyData || null;
            ClubState.newTeamCeremonyData = data.newTeamCeremonyData || null;
            ClubState.currentEventData = data.currentEventData || null;
            ClubState.pendingEventData = data.pendingEventData || null;
            ClubState.pendingNewSchoolYear = !!data.pendingNewSchoolYear;
            ClubState.advanceWeekOnEventComplete = !!data.advanceWeekOnEventComplete;
            ClubState.currentMatchData = data.currentMatchData || null;
            if (ClubState.currentMatchData && ClubState.currentMatchData.bracket) {
                reconcileBracketData(ClubState.currentMatchData.bracket);
            }
            ClubState.selectedSpecialTargetId = data.selectedSpecialTargetId || null;
            if (data.selectedPracticeMenu) ClubState.selectedPracticeMenu = data.selectedPracticeMenu;
            ClubState.memberGridScrollLeft = typeof data.memberGridScrollLeft === 'number' ? data.memberGridScrollLeft : -1;
            ClubState.dashboardScrollY = typeof data.dashboardScrollY === 'number' ? data.dashboardScrollY : 0;
            ClubState.isRestPosture = !!data.isRestPosture;
            ClubState.captainAutoMode = !!data.captainAutoMode;
            ClubState.lastRetiredSeniors = data.lastRetiredSeniors || null;
            ClubState.eventHistoryByYear = (data && data.eventHistoryByYear && typeof data.eventHistoryByYear === 'object') ? data.eventHistoryByYear : {};
            if (Array.isArray(data.history)) ClubState.history = data.history;
            if (data.stats) {
                ClubState.stats = data.stats;
                if (!ClubState.stats.district) ClubState.stats.district = { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
                if (!ClubState.stats.national) ClubState.stats.national = { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
                if (!ClubState.stats.interhighDistrict) ClubState.stats.interhighDistrict = { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
                if (!ClubState.stats.interhighNational) ClubState.stats.interhighNational = { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
            }
            const permPerks = getPermanentPerks();
            const isUnlocked = !!(data.captainAutoUnlocked || (permPerks && permPerks.captainAutoUnlocked) || hasWonNationalChampionship());
            ClubState.captainAutoUnlocked = isUnlocked;
            ClubState.captainAutoMode = isUnlocked ? !!data.captainAutoMode : false;
            if (isUnlocked) {
                setPermanentPerk('captainAutoUnlocked', true);
            }
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
        const scale = Math.min(width / 220, height / 200);
        // 基準最大目盛り（50）の半径（文字拡大分のクリアランスを確保）
        const r = Math.round(48 * scale);

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
            { val: 15, ratio: 15 / 50, stroke: 'rgba(148, 163, 184, 0.16)', strokeWidth: Math.max(0.8, 1 * scale) },
            { val: 30, ratio: 30 / 50, stroke: 'rgba(148, 163, 184, 0.22)', strokeWidth: Math.max(0.8, 1 * scale) },
            { val: 50, ratio: 1.0, stroke: isPlayer ? 'rgba(245, 158, 11, 0.65)' : 'rgba(56, 189, 248, 0.65)', strokeWidth: Math.max(1.1, 1.6 * scale) },
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
        const guideX = cx + Math.cos(guideAngle) * (r * 1.0) + (4 * scale);
        const guideY = cy + Math.sin(guideAngle) * (r * 1.0) - (3 * scale);
        const guideFontSize = Math.max(8.5, Math.round((8 + 2.5 * scale) * 10) / 10).toFixed(1);
        gridSvg += `<text x="${guideX.toFixed(1)}" y="${guideY.toFixed(1)}" font-size="${guideFontSize}" font-weight="900" fill="rgba(148, 163, 184, 0.65)" text-anchor="start">50</text>\n`;

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
            axesSvg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(148, 163, 184, 0.22)" stroke-width="${Math.max(0.8, 1.2 * scale).toFixed(1)}" />\n`;
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
                dotsSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(6 * scale).toFixed(1)}" fill="none" stroke="${isPlayer ? '#fde047' : '#38bdf8'}" stroke-width="1.5" stroke-dasharray="2 2" />\n`;
                dotsSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(3.5 * scale).toFixed(1)}" fill="${isPlayer ? '#fde047' : '#ffffff'}" />\n`;
            } else {
                dotsSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(2.8 * scale).toFixed(1)}" fill="${isPlayer ? '#fde047' : '#7dd3fc'}" />\n`;
            }
        });

        // ラベル（項目名＋数値）- 50超え時は頂点位置に合わせて外側へ動的逃げ
        let labelsSvg = '';
        const mainFontSize = Math.max(13.5, Math.round((14 + 4 * scale) * 10) / 10).toFixed(1);
        const valFontSize = Math.max(12.5, Math.round((13 + 3 * scale) * 10) / 10).toFixed(1);

        axes.forEach((axis, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
            const pt = dataPoints[i];
            const currentDist = Math.max(r + (22 * scale), (r * pt.ratio) + (16 * scale));

            let lx = cx + Math.cos(angle) * currentDist;
            let ly = cy + Math.sin(angle) * currentDist;

            let anchor = 'middle';
            let baseline = 'central';

            if (i === 0) { // 上 (体力)
                anchor = 'middle';
                baseline = 'auto';
                ly += (4 * scale);
            } else if (i === 1) { // 右上 (腕力)
                anchor = 'start';
                baseline = 'auto';
                lx += (2 * scale);
                ly += (2 * scale);
            } else if (i === 2) { // 右 (敏捷)
                anchor = 'start';
                baseline = 'central';
                lx += (4 * scale);
            } else if (i === 3) { // 右下 (気魄)
                anchor = 'start';
                baseline = 'hanging';
                lx += (2 * scale);
                ly -= (2 * scale);
            } else if (i === 4) { // 下 (突き)
                anchor = 'middle';
                baseline = 'hanging';
                ly -= (2 * scale);
            } else if (i === 5) { // 左下 (胴)
                anchor = 'end';
                baseline = 'hanging';
                lx -= (2 * scale);
                ly -= (2 * scale);
            } else if (i === 6) { // 左 (小手)
                anchor = 'end';
                baseline = 'central';
                lx -= (4 * scale);
            } else if (i === 7) { // 左上 (面)
                anchor = 'end';
                baseline = 'auto';
                lx -= (2 * scale);
                ly += (2 * scale);
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
                valSuffix = '🔥';
            } else if (pt.isOver) {
                valColor = '#ff4d4f'; // 50超えはクリムゾン炎カラーで強調
                valSuffix = '🔥';
            }

            labelsSvg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="${baseline}" font-size="${mainFontSize}" font-weight="800" fill="${labelColor}">${axis.label}<tspan font-size="${valFontSize}" font-weight="900" fill="${valColor}">${axis.val}${valSuffix}</tspan></text>\n`;
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
        const wasUnlocked = isCaptainAutoUnlocked();
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch (e) {
            console.warn('Failed to remove localStorage item', e);
        }
        ClubState.isConfigured = false;
        ClubState.schoolName = `${getRandomItem(SCHOOL_PREFIXES)}高校`;
        ClubState.prefecture = getRandomItem(PREFECTURES);
        ClubState.year = 1;
        ClubState.month = 4;
        ClubState.week = 1;
        ClubState.members = [];
        ClubState.order = [];
        ClubState.qualifiedForNational = false;
        ClubState.qualifiedForInterhigh = false;
        ClubState.interhighQualifiedMemberIds = [];
        ClubState.lastDistrictRank = null;
        ClubState.lastNationalRank = null;
        ClubState.lastInterhighDistrictRank = null;
        ClubState.lastInterhighNationalRank = null;
        ClubState.activityLog = [];
        ClubState.viewPhase = 'setup';
        ClubState.currentEventData = null;
        ClubState.pendingEventData = null;
        ClubState.pendingNewSchoolYear = false;
        ClubState.lastRetiredSeniors = null;
        ClubState.currentMatchData = null;
        ClubState.selectedSpecialTargetId = null;
        ClubState.selectedPracticeMenu = null;
        ClubState.isPracticeExecuting = false;
        ClubState.executingPracticeMotion = null;
        ClubState.practiceExecutionStartTime = 0;
        ClubState.practiceCompleted1Cycle = false;
        ClubState.memberGridScrollLeft = -1;
        ClubState.dashboardScrollY = 0;
        ClubState.isRestPosture = false;
        ClubState.specialPracticeAttacks = null;
        ClubState.eventHistoryByYear = {};
        ClubState.history = [];
        ClubState.stats = {
            district: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            national: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            interhighDistrict: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            interhighNational: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
        };
        ClubState.captainAutoUnlocked = wasUnlocked;
        ClubState.captainAutoMode = wasUnlocked;
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

    function advanceCalendarWeek(deferEvent = false) {
        const next = getNextWeekInfo();
        ClubState.year = next.year;
        ClubState.month = next.month;
        ClubState.week = next.week;

        // 1. 4月1週：進級 ＆ 新入生入部
        if (ClubState.month === 4 && ClubState.week === 1) {
            if (deferEvent) {
                // 大会終了直後など：即時遷移させず保留し、まず道場（練習メニュー画面）を表示
                ClubState.pendingNewSchoolYear = true;
                saveClubData();
                renderClubUI();
                return;
            }
            executeNewSchoolYear();
            return;
        }

        // 2. 6月1週：インターハイ（全国高校総体）都道府県個人予選！
        if (ClubState.month === 6 && ClubState.week === 1) {
            if (ClubState.members.length === 0) {
                ClubState.qualifiedForInterhigh = false;
                ClubState.lastInterhighDistrictRank = '部員不出場';
                ClubState.activityLog.unshift(`⚠️【${ClubState.year}年目 6月1週】部員不在のため、インターハイ都道府県個人予選への出場を見送りました。`);
            } else {
                ClubState.activityLog.unshift(`🔥【${ClubState.year}年目 6月1週】いよいよインターハイ都道府県個人予選の開催週です！上部の【出陣ボタン】より大会へ挑みましょう！`);
            }
            saveClubData();
            renderClubUI();
            return;
        }

        // 3. 8月1週：インターハイ（全国高校総体）個人戦！
        if (ClubState.month === 8 && ClubState.week === 1) {
            if (ClubState.qualifiedForInterhigh && ClubState.interhighQualifiedMemberIds && ClubState.interhighQualifiedMemberIds.length > 0) {
                const activeQualified = ClubState.members.filter((m) => ClubState.interhighQualifiedMemberIds.includes(m.id));
                if (activeQualified.length > 0) {
                    ClubState.activityLog.unshift(`👑【${ClubState.year}年目 8月1週】全国高校総体（インターハイ）個人戦の開催週を迎えました！上部の【出陣ボタン】より全国の頂点へ挑みましょう！`);
                } else {
                    ClubState.activityLog.unshift(`⚠️【${ClubState.year}年目 8月1週】インターハイ出場権保持者の不在により、全国高校総体個人戦を辞退しました。`);
                    ClubState.qualifiedForInterhigh = false;
                    ClubState.interhighQualifiedMemberIds = [];
                }
            } else {
                ClubState.activityLog.unshift(`【${ClubState.year}年目 8月1週】インターハイ（全国高校総体）個人戦が開催されていますが、本校は地区予選敗退のため不出場。秋の稽古に励みます。`);
            }
            saveClubData();
            renderClubUI();
            return;
        }

        // 4. 9月1週：3年生引退 ＆ 新主将指名
        if (ClubState.month === 9 && ClubState.week === 1) {
            triggerRetireAndCaptainSelection();
            return;
        }

        // 5. 12月3週：地区大会（都道府県予選・選抜団体）開催！
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
                ClubState.activityLog.unshift(`🔥【${ClubState.year}年目 12月3週】${ClubState.prefecture}大会（選抜地区予選）の決戦週です！上部の【出陣ボタン】より優勝を目指して出陣しましょう！`);
            }
            saveClubData();
            renderClubUI();
            return;
        }

        // 6. 3月4週：全国選抜大会（地区優勝時のみ開催）
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
                    ClubState.activityLog.unshift(`👑【${ClubState.year}年目 3月4週】全国高校剣道選抜大会の決戦週を迎えました！上部の【出陣ボタン】より全国制覇へ出陣しましょう！`);
                }
            } else {
                ClubState.activityLog.unshift(`【${ClubState.year}年目 3月4週】全国大会が開催されていますが、本校は地区予選敗退のため不出場。新年度へ向け稽古に励みます。`);
            }
            saveClubData();
            renderClubUI();
            return;
        }

        // 7. 大会・セレモニー以外の通常週で、部活イベント判定
        const triggered = checkAndTriggerClubEvent(deferEvent);
        if (triggered) {
            saveClubData();
            renderClubUI();
            return;
        }

        saveClubData();
        renderClubUI();
    }

    // 個人戦または団体戦の全国大会で優勝したことがあるか（全国覇者実績）を判定
    function hasWonNationalChampionship() {
        if (ClubState.stats) {
            if ((ClubState.stats.national && ClubState.stats.national.win > 0) ||
                (ClubState.stats.interhighNational && ClubState.stats.interhighNational.win > 0)) {
                return true;
            }
        }
        if (Array.isArray(ClubState.history)) {
            return ClubState.history.some((h) =>
                h.nationalResult === '優勝' || h.nationalResult === 'win' ||
                h.interhighNationalResult === '優勝' || h.interhighNationalResult === 'win'
            );
        }
        return false;
    }

    // ───────────────────────────────────────────
    // 永続特典（周回・リセット引き継ぎメタ実績）
    // ───────────────────────────────────────────
    function getPermanentPerks() {
        try {
            const raw = localStorage.getItem(PERMANENT_PERKS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.warn('Failed to read permanent perks', e);
            return {};
        }
    }

    function setPermanentPerk(key, value) {
        try {
            const perks = getPermanentPerks();
            perks[key] = value;
            perks.updatedAt = Date.now();
            localStorage.setItem(PERMANENT_PERKS_KEY, JSON.stringify(perks));
        } catch (e) {
            console.warn('Failed to save permanent perk', e);
        }
    }

    // 主将試合自動化モード（オート観戦・即時判定）が解放されているかを判定
    // （今期の全国制覇、セーブ内解放フラグ、または周回メタ永続実績のいずれかで解放）
    function isCaptainAutoUnlocked() {
        if (ClubState.captainAutoUnlocked) return true;
        if (hasWonNationalChampionship()) {
            ClubState.captainAutoUnlocked = true;
            setPermanentPerk('captainAutoUnlocked', true);
            return true;
        }
        const perks = getPermanentPerks();
        if (perks && perks.captainAutoUnlocked) {
            ClubState.captainAutoUnlocked = true;
            return true;
        }
        return false;
    }

    // 直近の大会成績に応じた新1年生の入部数レンジ（下限・上限）を算出
    function getFreshmenRecruitRange(districtRank, nationalRank, ihDistrictRank, ihNationalRank) {
        const isWin = (r) => r === '優勝' || r === 'win';
        const isHigh = (r) => r === '準優勝' || r === 'runnerUp' || r === 'ベスト4' || r === 'best4';

        // 1. 全国大会の成績（選抜またはインターハイの全国制覇・上位）
        if (isWin(nationalRank) || isWin(ihNationalRank)) return { min: 3, max: 4 };
        if (isHigh(nationalRank) || isHigh(ihNationalRank)) return { min: 3, max: 4 };

        // 2. 地区予選の成績（選抜またはインターハイ予選優勝・上位）
        if (isWin(districtRank) || isWin(ihDistrictRank)) return { min: 2, max: 3 }; // 地区優勝：最低2名保証、最大3名
        if (isHigh(districtRank) || isHigh(ihDistrictRank)) return { min: 1, max: 2 }; // 地区準優勝・ベスト4

        // 3. その他（初戦〜2回戦敗退、不出場など）
        return { min: 1, max: 2 };
    }

    // 4月1週：新年度進級 ＆ 新1年生入部
    function executeNewSchoolYear() {
        // 進級
        ClubState.members.forEach((m) => {
            m.grade += 1;
        });

        // 成績に応じた新入生人数の決定（直近の成績が良いほど入部数増加、最低人数〜最大人数のランダム）
        const range = getFreshmenRecruitRange(
            ClubState.lastDistrictRank,
            ClubState.lastNationalRank,
            ClubState.lastInterhighDistrictRank,
            ClubState.lastInterhighNationalRank
        );
        let recruitCount = range.min + Math.floor(Math.random() * (range.max - range.min + 1));

        // 廃部防止セーフティ（団体戦出陣に必要な最低5名を可能な限り確保）
        const curCount = ClubState.members.length;
        if (curCount + recruitCount < 5) {
            recruitCount = Math.max(recruitCount, 5 - curCount);
        }

        const newRecruits = [];
        const recruitMembers = [];
        for (let i = 0; i < recruitCount; i++) {
            const recruit = createMember(generateRandomName(), 1, false);
            ClubState.members.push(recruit);
            recruitMembers.push(recruit);
            newRecruits.push(`${recruit.name}（${recruit.archetypeName || '一般'}）`);
        }

        // 権利リセット
        ClubState.qualifiedForNational = false;
        ClubState.qualifiedForInterhigh = false;
        ClubState.interhighQualifiedMemberIds = [];

        const logMsg = `🌸【${ClubState.year}年目 4月1週】新年度が始まりました！部員が進級し、新1年生が${recruitCount}名（${newRecruits.join('・')}）入部しました！`;
        ClubState.activityLog.unshift(logMsg);

        // 新1年生の初期値は全員控えにする（オーダーは上級生優先で維持・編成）
        sanitizeOrder();

        // 🌸 新1年生入部・歓迎セレモニー画面へ
        ClubState.freshmanWelcomeData = {
            year: ClubState.year,
            recruitCount: recruitCount,
            recruitMembers: recruitMembers,
        };
        ClubState.viewPhase = 'freshman_welcome';

        saveClubData();
        renderClubUI();
    }

    // 9月1週：3年生引退 ＆ 新主将指名
    function triggerRetireAndCaptainSelection() {
        const retiredMembers = ClubState.members.filter((m) => m.grade >= 3);
        if (retiredMembers.length === 0) {
            // 3年生が0名の場合（1年目・2年目など：廃部から立ち上げた創部初期）
            ClubState.lastRetiredSeniors = null;
            const logMsg = `🍁【${ClubState.year}年目 9月1週】先輩のいない新生${ClubState.schoolName}剣道部！引退する部員はおらず、創設メンバー全員で冬の全国選抜地区予選へ挑みます！`;
            ClubState.activityLog.unshift(logMsg);
            saveClubData();
            renderClubUI();
            return;
        }

        const captain = ClubState.members.find((m) => m.isPlayer);
        const isCaptainRetiring = retiredMembers.some((m) => m.isPlayer);
        const retiredNames = retiredMembers.map((m) => m.name);
        // 主将だった部員をマーク
        retiredMembers.forEach((m) => {
            if (m.isPlayer) {
                m.wasPlayer = true;
            }
        });

        // 3年生を名簿から削除
        ClubState.members = ClubState.members.filter((m) => m.grade < 3);

        // 前年9月に引退した3年生データとして永続保存（翌年3月2週の卒業式等で参照）
        ClubState.lastRetiredSeniors = {
            year: ClubState.year,
            members: JSON.parse(JSON.stringify(retiredMembers)),
        };

        const logMsg = isCaptainRetiring
            ? `🍂【${ClubState.year}年目 9月1週】3年生（${retiredNames.join('・')}）が夏の大会を終えて引退しました。新チーム始動のため、新主将を指名してください。`
            : `🍂【${ClubState.year}年目 9月1週】3年生の先輩（${retiredNames.join('・')}）が夏の大会を終えて引退しました。${captain ? `${captain.grade}年生主将【${captain.name}】` : '主将'}が志を引き継ぎ、秋の地区予選へ向けて稽古を牽引します！`;
        ClubState.activityLog.unshift(logMsg);

        // 3年生引退に伴う欠員発生：既存の部員を副将、中堅、次鋒、先鋒の順で戦力順に割り当て
        reassignOrderOnVacancy();

        // 🍂 3年生引退セレモニー画面へ
        ClubState.retireCeremonyData = {
            year: ClubState.year,
            retiredMembers: retiredMembers,
            retiredNames: retiredNames,
            isCaptainRetiring: isCaptainRetiring,
        };
        ClubState.viewPhase = 'retire_ceremony';
        saveClubData();
        renderClubUI();
    }

    // 欠員発生時：大将（主将）を保護し、主将以外の部員を副将(3)→中堅(2)→次鋒(1)→先鋒(0)の順に戦力順で割り当てる
    function reassignOrderOnVacancy() {
        const captain = ClubState.members.find((m) => m.isPlayer);
        const captainId = captain ? captain.id : null;
        const otherMembers = ClubState.members
            .filter((m) => !m.isPlayer)
            .sort((a, b) => {
                const diff = getMemberCombatPower(b) - getMemberCombatPower(a);
                if (Math.abs(diff) > 0.001) return diff;
                if (b.grade !== a.grade) return b.grade - a.grade;
                return (a.id || '').localeCompare(b.id || '');
            });

        const newOrder = [null, null, null, null, captainId];
        const slotPriority = [3, 2, 1, 0]; // 副将, 中堅, 次鋒, 先鋒
        otherMembers.forEach((m, idx) => {
            if (idx < slotPriority.length) {
                newOrder[slotPriority[idx]] = m.id;
            }
        });

        ClubState.order = newOrder;
        sanitizeOrder();
    }

    // オーダー整合性チェック（5スロット固定 [先鋒, 次鋒, 中堅, 副将, 大将] を保護し、大将に主将、不足枠は欠員(null)とする）
    function sanitizeOrder() {
        const validIds = new Set(ClubState.members.map((m) => m.id));
        const captain = ClubState.members.find((m) => m.isPlayer);
        const captainId = captain ? captain.id : null;

        // 固定長5のオーダー枠を確保
        const curOrder = Array.isArray(ClubState.order) ? ClubState.order : [];
        const newOrder = [null, null, null, null, null];

        // 1. 既存のオーダーから有効なメンバーIDをスロットごとに引き継ぐ
        for (let i = 0; i < 5; i++) {
            const id = curOrder[i];
            if (id && validIds.has(id)) {
                newOrder[i] = id;
            }
        }

        // 2. 主将（プレイヤー）を確実に大将(4)に割り当てる
        if (captainId) {
            // 大将以外のスロットに主将がいればクリア
            for (let i = 0; i < 4; i++) {
                if (newOrder[i] === captainId) newOrder[i] = null;
            }
            newOrder[4] = captainId;
        }

        const usedIds = new Set(newOrder.filter(Boolean));

        // 3. 空きスロット（欠員枠）がある場合、未配置の部員を戦力順に副将(3)→中堅(2)→次鋒(1)→先鋒(0)の順で配置
        const slotPriority = [3, 2, 1, 0]; // 副将, 中堅, 次鋒, 先鋒
        const unassignedMembers = ClubState.members
            .filter((m) => !m.isPlayer && !usedIds.has(m.id))
            .sort((a, b) => {
                const diff = getMemberCombatPower(b) - getMemberCombatPower(a);
                if (Math.abs(diff) > 0.001) return diff;
                if (b.grade !== a.grade) return b.grade - a.grade;
                return (a.id || '').localeCompare(b.id || '');
            });

        slotPriority.forEach((slotIdx) => {
            if (newOrder[slotIdx] === null && unassignedMembers.length > 0) {
                const nextMember = unassignedMembers.shift();
                newOrder[slotIdx] = nextMember.id;
                usedIds.add(nextMember.id);
            }
        });

        // ※ 5名に満たない場合でも配列長は5を維持し、欠員枠は null のままとする
        ClubState.order = newOrder;
    }

    // 新1年生が入部したときは、先鋒、次鋒、中堅の順で割り当てる
    function assignFreshmenToOrder(recruitMembers) {
        if (!recruitMembers || !recruitMembers.length) {
            sanitizeOrder();
            return;
        }

        const captain = ClubState.members.find((m) => m.isPlayer);
        const captainId = captain ? captain.id : null;

        // 新1年生以外の既存部員（上級生）
        const seniorMembers = ClubState.members.filter((m) => !recruitMembers.some((r) => r.id === m.id) && m.id !== captainId);

        // 既存オーダー順を可能な限り維持した上級生IDリスト
        const remainingSeniorIds = [];
        ClubState.order.forEach((id) => {
            if (id !== captainId && seniorMembers.some((m) => m.id === id)) {
                remainingSeniorIds.push(id);
            }
        });
        seniorMembers.forEach((m) => {
            if (!remainingSeniorIds.includes(m.id)) {
                remainingSeniorIds.push(m.id);
            }
        });

        // 5人枠のオーダー [先鋒, 次鋒, 中堅, 副将, 大将]
        const newOrder = [null, null, null, null, null];

        // 1. 新1年生を先鋒(0)、次鋒(1)、中堅(2)の順で割り当てる
        const freshmanSlots = [0, 1, 2];
        recruitMembers.forEach((recruit, idx) => {
            if (idx < freshmanSlots.length) {
                newOrder[freshmanSlots[idx]] = recruit.id;
            }
        });

        // 2. 主将を大将(4)に割り当てる
        if (captainId) {
            newOrder[4] = captainId;
        }

        // 3. 空いているスロット（副将枠や新入生が3人未満の枠）を上級生で埋める
        for (let slot = 0; slot < 5; slot++) {
            if (!newOrder[slot] && remainingSeniorIds.length > 0) {
                newOrder[slot] = remainingSeniorIds.shift();
            }
        }

        // 4. それでも枠が空いていれば、4人目以降の新入生や未配置部員で埋める
        ClubState.members.forEach((m) => {
            const emptyIdx = newOrder.indexOf(null);
            if (emptyIdx !== -1 && !newOrder.includes(m.id)) {
                newOrder[emptyIdx] = m.id;
            }
        });

        ClubState.order = newOrder.filter(Boolean);
        sanitizeOrder();
    }

    // 部員の総合戦力を算出（カードの表示戦力と一致）
    function getMemberCombatPower(m) {
        if (!m) return 0;
        const skillSum = ((m.skills && m.skills.men) || 0) +
                         ((m.skills && m.skills.kote) || 0) +
                         ((m.skills && m.skills.do) || 0) +
                         ((m.skills && m.skills.tsuki) || 0);
        return (m.str || 0) + (m.agi || 0) + (m.spi || 0) + skillSum * 0.4;
    }

    // インターハイ個人戦出場権を持つ部員か判定
    function isInterhighQualified(memberId) {
        if (!ClubState.qualifiedForInterhigh) return false;
        if (!Array.isArray(ClubState.interhighQualifiedMemberIds)) return false;
        return ClubState.interhighQualifiedMemberIds.includes(memberId);
    }

    // 控え部員一覧を戦力順（降順）で取得
    function getBenchMembers() {
        const orderIdSet = new Set(ClubState.order.filter(Boolean));
        return ClubState.members
            .filter((m) => !orderIdSet.has(m.id))
            .sort((a, b) => {
                const diff = getMemberCombatPower(b) - getMemberCombatPower(a);
                if (Math.abs(diff) > 0.001) return diff;
                if (b.grade !== a.grade) return b.grade - a.grade;
                return (a.id || '').localeCompare(b.id || '');
            });
    }

    // 主将交代時：大将〜先鋒の割り当てを戦力順で自動設定
    function assignOrderByCombatPower(captainId) {
        if (!ClubState.members || ClubState.members.length === 0) return;

        // 正規部員と助っ人部員
        const regularMembers = ClubState.members.filter((m) => !m.isClubDual);
        const dualMembers = ClubState.members.filter((m) => m.isClubDual);

        // 戦力降順ソート関数（同点時は学年、IDで安定化）
        const sortByPowerDesc = (list) => {
            return [...list].sort((a, b) => {
                const diff = getMemberCombatPower(b) - getMemberCombatPower(a);
                if (Math.abs(diff) > 0.001) return diff;
                if (b.grade !== a.grade) return b.grade - a.grade;
                return (a.id || '').localeCompare(b.id || '');
            });
        };

        const sortedRegulars = sortByPowerDesc(regularMembers);
        const sortedDuals = sortByPowerDesc(dualMembers);

        // 新主将
        const captain = ClubState.members.find((m) => m.id === captainId) || ClubState.members.find((m) => m.isPlayer);

        // オーダー候補（最大5名）の選出：正規部員優先、部員不足時は助っ人から補充
        let selected = [];
        if (sortedRegulars.length >= 5) {
            selected = sortedRegulars.slice(0, 5);
        } else {
            selected = [...sortedRegulars];
            const needed = 5 - selected.length;
            selected.push(...sortedDuals.slice(0, needed));
        }

        // 新主将は必ずオーダーに含める（プレイヤーとして試合出場を保証）
        if (captain && !selected.some((m) => m.id === captain.id)) {
            if (selected.length < 5) {
                selected.push(captain);
            } else {
                selected[selected.length - 1] = captain;
            }
        }

        // 選出メンバーを戦力順（降順：1位〜5位）にソート
        const sortedSelected = sortByPowerDesc(selected);

        // 大将〜先鋒の割り当て（大将に主将、残りを戦力順に副将、中堅、次鋒、先鋒へ配置）
        const newOrder = [null, null, null, null, captain ? captain.id : null];
        const nonCaptains = sortedSelected.filter(m => !captain || m.id !== captain.id);
        const slotPriority = [3, 2, 1, 0]; // 副将, 中堅, 次鋒, 先鋒
        nonCaptains.forEach((m, idx) => {
            if (idx < slotPriority.length) {
                newOrder[slotPriority[idx]] = m.id;
            }
        });

        ClubState.order = newOrder;
        sanitizeOrder();
    }

    // 互換性保持用エイリアス
    const assignCaptainToTaisho = assignOrderByCombatPower;

    // ───────────────────────────────────────────
    // パラメータUP効果音再生ヘルパー
    // ───────────────────────────────────────────
    function playStatUpSound() {
        if (typeof window !== 'undefined' && typeof window.playSound === 'function') {
            window.playSound('stat_up');
            return;
        }
        try {
            const AudioCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtor) return;
            const sfxVol = (typeof window !== 'undefined' && window.KendoBGM && typeof window.KendoBGM.getSoundVolume === 'function')
                ? window.KendoBGM.getSoundVolume()
                : 0.65;
            if (sfxVol <= 0.001) return; // ミュート時は再生スキップ

            const ctx = window._kendoAudioCtx || (window._kendoAudioCtx = new AudioCtor());
            if (ctx.state === 'suspended') ctx.resume();
            const now = ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.05);
                noteGain.gain.setValueAtTime(0.0001, now + idx * 0.05);
                noteGain.gain.exponentialRampToValueAtTime(0.20 * sfxVol, now + idx * 0.05 + 0.015);
                noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.28);
                osc.connect(noteGain);
                noteGain.connect(ctx.destination);
                osc.start(now + idx * 0.05);
                osc.stop(now + idx * 0.05 + 0.3);
            });
        } catch (e) {}
    }

    // ───────────────────────────────────────────
    // 練習実行
    // ───────────────────────────────────────────
    function applyPracticeLogic(menuId, targetMemberId) {
        const menu = menuId === 'special' ? null : PRACTICE_MENUS.find((m) => m.id === menuId);
        if (!menu && menuId !== 'special') return;

        // 実行前の部員全体ステータス合計および得意技解放状況を計測
        const checkUnlocked = (m) => {
            const techId = m.specialTechnique || 'hien_men';
            const tech = getSpecialTechniqueData(techId) || { reqStat: 'men', reqVal: 38 };
            return ((m.skills && m.skills[tech.reqStat]) || 0) >= tech.reqVal;
        };
        const prevUnlockedMap = new Map();
        ClubState.members.forEach((m) => {
            prevUnlockedMap.set(m.id, checkUnlocked(m));
        });

        const getTeamStatSum = () => {
            let sum = 0;
            ClubState.members.forEach((m) => {
                sum += (m.str || 0) + (m.agi || 0) + (m.spi || 0) + (m.maxHealth || 0);
                if (m.skills) {
                    sum += (m.skills.men || 0) + (m.skills.kote || 0) + (m.skills.do || 0) + (m.skills.tsuki || 0);
                }
            });
            return sum;
        };
        const prevStatSum = getTeamStatSum();

        let logEntry = '';
        if (menuId === 'special') {
            const target = ClubState.members.find((m) => m.id === targetMemberId);
            const player = ClubState.members.find((m) => m.isPlayer);
            if (target && player) {
                ClubState.selectedSpecialTargetId = targetMemberId;
                const isTargetExhausted = (target.fatigue || 0) >= 100;
                const isPlayerExhausted = (player.fatigue || 0) >= 100;

                // 各部員の隠し成長率（通常: 80〜120%、助っ人: 50%）および才能限界値・疲労度に応じてgrowStatで計算
                const baseGain = 2;
                growStat(target, 'base', 'str', baseGain);
                growStat(target, 'base', 'agi', baseGain);
                growStat(target, 'base', 'spi', baseGain);
                growStat(target, 'skill', 'men', baseGain);
                growStat(target, 'skill', 'kote', baseGain);
                growStat(target, 'skill', 'do', baseGain);
                growStat(target, 'skill', 'tsuki', baseGain);
                target.fatigue = Math.min(100, Math.max(0, (target.fatigue || 0) + 18));
                improveCondition(target);

                growStat(player, 'base', 'str', 1);
                growStat(player, 'base', 'spi', 2);
                player.fatigue = Math.min(100, Math.max(0, (player.fatigue || 0) + 16));

                const dualText = target.isClubDual ? `（${target.originalClub}掛け持ち）` : '';
                const exhaustWarn = (isTargetExhausted || isPlayerExhausted) ? ' ⚠️過度の疲労により能力が低下する過酷な稽古となりました！' : '';
                logEntry = `【${ClubState.year}年目 ${ClubState.month}月${ClubState.week}週】主将が${target.name}へマンツーマン特別指導を実施！${target.name}の全能力を鍛え上げました！${dualText}${exhaustWarn}`;
            }
        } else {
            let hadExhaustedMember = false;
            ClubState.members.forEach((m) => {
                if ((m.fatigue || 0) >= 100 && menu.fatigueCost > 0) {
                    hadExhaustedMember = true;
                }
                // 部員ごとの隠し成長率（通常: 80〜120%、助っ人: 50%）および疲労度に従って成長
                menu.apply(m);
                m.fatigue = Math.min(100, Math.max(0, (m.fatigue || 0) + menu.fatigueCost));
                if (m.fatigue >= 80 && Math.random() < 0.6) dropCondition(m);
                else if (m.fatigue === 0 && Math.random() < 0.3) improveCondition(m);
            });
            const exhaustWarn = hadExhaustedMember ? ' ⚠️過度の疲労（100%）を抱えた部員の能力が低下しました！' : '';
            logEntry = `【${ClubState.year}年目 ${ClubState.month}月${ClubState.week}週】全体稽古【${menu.name}】を実施！心技体を鍛えました。${exhaustWarn}`;
        }

        // 稽古による得意技の開眼・覚醒判定
        const newlyUnlocked = [];
        ClubState.members.forEach((m) => {
            if (!prevUnlockedMap.get(m.id) && checkUnlocked(m)) {
                const techId = m.specialTechnique || 'hien_men';
                const tech = getSpecialTechniqueData(techId) || { name: '飛燕二段面' };
                newlyUnlocked.push(`✨【${m.name}】が得意技【${tech.name}】を開眼・覚醒！`);
            }
        });
        if (newlyUnlocked.length > 0) {
            logEntry += ' ' + newlyUnlocked.join(' ');
        }

        // パラメータがUPしていれば、爽やかなステータスUP効果音を再生！
        const postStatSum = getTeamStatSum();
        if (postStatSum > prevStatSum) {
            playStatUpSound();
        }

        ClubState.activityLog.unshift(logEntry);

        // 大会直後などで保留されていた新年度進級＆新入部員歓迎セレモニーがあれば表示
        if (ClubState.pendingNewSchoolYear) {
            ClubState.pendingNewSchoolYear = false;
            executeNewSchoolYear();
            return;
        }

        // 大会直後などで保留されていた高校生イベントがあれば、練習メニュー終了後に表示
        if (ClubState.pendingEventData) {
            ClubState.currentEventData = ClubState.pendingEventData;
            ClubState.pendingEventData = null;
            ClubState.advanceWeekOnEventComplete = true; // 練習実行後に保留イベントを開いたため、イベント完了時に週を進める
            ClubState.viewPhase = 'event_scene';
            saveClubData();
            renderClubUI();
            return;
        }

        advanceCalendarWeek();
    }

    function executePractice(menuId, targetMemberId = null, instant = false) {
        if (ClubState.isPracticeExecuting) return;

        if (instant) {
            applyPracticeLogic(menuId, targetMemberId);
            ClubState.isPracticeExecuting = false;
            ClubState.executingPracticeMotion = null;
            ClubState.selectedPracticeMenu = null;
            ClubState.isRestPosture = (menuId === 'rest');
            ClubState.specialPracticeAttacks = null;
            updateAllMemberMotionBadges();
            return;
        }

        ClubState.isPracticeExecuting = true;
        ClubState.executingPracticeMotion = menuId;
        ClubState.practiceExecutionStartTime = (typeof window !== 'undefined' && window.performance && window.performance.now) ? window.performance.now() : Date.now();
        ClubState.practiceCompleted1Cycle = false;

        // 休養以外の練習が実行されたら納刀待機を解除して得意構えからの稽古へ
        if (menuId !== 'rest') {
            ClubState.isRestPosture = false;
        }

        // 主将マンツーマン特別指導時：主将と指名部員のみにランダムで試合中と同等の攻撃アニメーション（面・小手・胴・突き）を選定
        if (menuId === 'special') {
            const sel = document.getElementById('selSpecialTarget');
            const target = targetMemberId || (sel && sel.value) || ClubState.selectedSpecialTargetId;
            ClubState.selectedSpecialTargetId = target;

            const ATTACKS = ['men', 'kote', 'do', 'tsuki'];
            const getRandomAtk = () => ATTACKS[Math.floor(Math.random() * ATTACKS.length)];
            // 3秒間の間にダイナミックに打ち込む2段ランダム攻撃シーケンス（前半・後半）
            ClubState.specialPracticeAttacks = {
                captain: [getRandomAtk(), getRandomAtk()],
                target: [getRandomAtk(), getRandomAtk()],
            };
        } else {
            ClubState.specialPracticeAttacks = null;
        }

        // 部員カードのバッジを即座に更新
        updateAllMemberMotionBadges();

        // 実行中のボタン無効化・パルス演出
        const btnGroup = document.querySelectorAll('.btn-practice, .btn-special-practice, .btn-quick-practice, .btn-quick-tourney');
        btnGroup.forEach((b) => b.classList.add('is-executing'));

        // 3秒間（3000ms）、得意な構えから現在のアニメーションを動かし、その後各自の得意構え待機に戻す
        setTimeout(() => {
            ClubState.isPracticeExecuting = false;
            ClubState.executingPracticeMotion = null;
            ClubState.selectedPracticeMenu = null; // 未選択状態に戻す
            ClubState.specialPracticeAttacks = null;
            ClubState.isRestPosture = false;

            applyPracticeLogic(menuId, targetMemberId);
            updateAllMemberMotionBadges();
        }, 3000);
    }

    // ───────────────────────────────────────────
    // トーナメント生成エンジン
    // ───────────────────────────────────────────
    function getRandomSpecialTechnique(stance = 'chudan') {
        const pool = stance === 'jodan'
            ? ['gouriki_men', 'hien_men', 'tenkou_men']
            : (stance === 'waki'
                ? ['hayate_do', 'gen_do', 'dengeki_kote']
                : ['hien_men', 'dengeki_kote', 'shiden_tsuki', 'hayate_do', 'tensho_tsuki']);
        return getRandomItem(pool);
    }

    // 敵選手の個性アーキタイプ（強み・弱みの凹凸と得意技）
    const OPPONENT_ARCHETYPES = [
        {
            id: 'power',
            typeName: '剛腕パワー型',
            prefStance: ['jodan', 'jodan', 'chudan'],
            hpBonus: 1,
            bias: { str: 14, agi: -10, spi: 2, men: 13, kote: -3, do: 0, tsuki: -8 },
            specialTech: 'gouriki_men',
            title: '剛腕の上段'
        },
        {
            id: 'speed',
            typeName: '韋駄天スピード型',
            prefStance: ['chudan', 'chudan'],
            hpBonus: 0,
            bias: { str: -9, agi: 16, spi: 1, men: 1, kote: 14, do: -3, tsuki: 3 },
            specialTech: 'dengeki_kote',
            title: '疾風の小手使い'
        },
        {
            id: 'spirit',
            typeName: '不動心気魄型',
            prefStance: ['chudan', 'waki'],
            hpBonus: 1,
            bias: { str: 2, agi: -8, spi: 16, men: 0, kote: 1, do: 13, tsuki: 0 },
            specialTech: 'shiden_tsuki',
            title: '不抜の守護神'
        },
        {
            id: 'tsuki',
            typeName: '電光石火・突き技巧型',
            prefStance: ['chudan', 'chudan'],
            hpBonus: 0,
            bias: { str: 1, agi: 8, spi: 3, men: -6, kote: 2, do: -6, tsuki: 16 },
            specialTech: 'tensho_tsuki',
            title: '閃光の連撃手'
        },
        {
            id: 'counter',
            typeName: '後の先カウンター型',
            prefStance: ['waki', 'waki', 'chudan'],
            hpBonus: 0,
            bias: { str: -2, agi: 4, spi: 8, men: -9, kote: 3, do: 15, tsuki: 1 },
            specialTech: 'hayate_do',
            title: '後の先を極めし者'
        },
        {
            id: 'allround',
            typeName: '万能バランス型',
            prefStance: ['chudan', 'chudan'],
            hpBonus: 0,
            bias: { str: 3, agi: 3, spi: 3, men: 3, kote: 3, do: 3, tsuki: 2 },
            specialTech: 'hien_men',
            title: '名門の切り札'
        }
    ];

    // 学校名から安定した実力ランク（Tier S/A: 名門, B: 標準, C: 新興）を判定
    function getSchoolPowerTier(schoolName, isNational = false, roundIdx = 0) {
        let randVal = Math.random();
        if (roundIdx >= 2) randVal += 0.25; // 準決勝・決勝は強豪率UP

        if (isNational) {
            if (randVal > 0.70) return { tier: 'S', label: '全国屈指の名門', statOffset: 6, hpOffset: 1 };
            if (randVal > 0.25) return { tier: 'A', label: '県大会優勝の強豪', statOffset: 0, hpOffset: 0 };
            return { tier: 'B', label: '全国初出場の新星', statOffset: -6, hpOffset: 0 };
        } else {
            if (randVal > 0.78) return { tier: 'A', label: '県下屈指の名門校', statOffset: 7, hpOffset: 1 };
            if (randVal > 0.32) return { tier: 'B', label: '実力ある中堅校', statOffset: 0, hpOffset: 0 };
            return { tier: 'C', label: '勢いのある新興校', statOffset: -8, hpOffset: 0 };
        }
    }

    // 個人戦用 対戦相手剣士の生成（高校3年間鍛え上げた3年生中心・強弱変化と個性凹凸を導入）
    const FIGHTER_TITLES = [
        '疾風の小手使い', '剛腕の上段', '冷静沈着な間合いの鬼', '名門の切り札',
        '電光石火の飛び込み面', '不抜の守護神', '変幻自在の技巧派', '無心の剣客',
        '熱血のポイントゲッター', '重厚なる中段', '後の先を極めし者', '名門校の主将',
        '歴戦の業師', '県下屈指の剛剣', '不動の絶対エース', '閃光の連撃手'
    ];

    function generateOpponentIndividual(schoolName, pref, isNationalOrGrade = false, seedTier = 0, matchIdx = 0) {
        // 後方互換：第3引数が数値の場合は powerGrade >= 3 を全国扱い
        const isNational = typeof isNationalOrGrade === 'boolean'
            ? isNationalOrGrade
            : (Number(isNationalOrGrade) >= 3);

        // 学年：高校3年間鍛え上げた3年生が中心（85%で3年、15%で天才2年）
        const grade = (Math.random() < 0.85) ? 3 : 2;
        const gradeLabel = grade === 3 ? '3年' : '2年';

        // 敵選手のアーキタイプ（個性）を選定
        const arch = getRandomItem(OPPONENT_ARCHETYPES);
        const stance = getRandomItem(arch.prefStance);
        const specialTech = arch.specialTech;
        const reqStatMap = {
            hien_men: 'men', gouriki_men: 'men', tenkou_men: 'men',
            dengeki_kote: 'kote', kasumi_kote: 'kote',
            hayate_do: 'do', gen_do: 'do',
            shiden_tsuki: 'tsuki', tensho_tsuki: 'tsuki'
        };
        const favTechStat = reqStatMap[specialTech] || 'men';

        // 学校の実力ランク（強弱の変化）
        const schoolTier = getSchoolPowerTier(schoolName, isNational, Math.min(2, seedTier));

        let baseHp = 5;
        let baseStatVal = 50;
        let baseSkillVal = 46;

        if (!isNational) {
            // ── 都道府県個人予選（高校3年間鍛え上げた3年生） ──
            const tierBonus = Math.min(2, Math.max(0, Number(seedTier) || 0));
            baseHp = 5 + (tierBonus >= 1 ? 1 : 0) + arch.hpBonus + schoolTier.hpOffset;
            baseStatVal = 48 + tierBonus * 10 + schoolTier.statOffset + Math.floor(Math.random() * 5);
            baseSkillVal = 44 + tierBonus * 10 + schoolTier.statOffset + Math.floor(Math.random() * 5);
        } else {
            // ── インターハイ全国総体（全国各県のトップ3年生） ──
            const tierBonus = Math.min(2, Math.max(0, Number(seedTier) || 0));
            baseHp = 6 + (tierBonus >= 1 ? 1 : 0) + arch.hpBonus + schoolTier.hpOffset;
            baseStatVal = 72 + tierBonus * 8 + schoolTier.statOffset + Math.floor(Math.random() * 5);
            baseSkillVal = 68 + tierBonus * 8 + schoolTier.statOffset + Math.floor(Math.random() * 5);
        }

        // アーキタイプによる明確なパラメータの凹凸（得意+12〜16、苦手-8〜12）
        const b = arch.bias;
        const str = Math.min(99, Math.max(12, baseStatVal + b.str + Math.floor(Math.random() * 4) - 2));
        const agi = Math.min(99, Math.max(12, baseStatVal + b.agi + Math.floor(Math.random() * 4) - 2));
        const spi = Math.min(99, Math.max(12, baseStatVal + b.spi + Math.floor(Math.random() * 4) - 2));

        const skills = {
            men: Math.min(99, Math.max(10, baseSkillVal + b.men + Math.floor(Math.random() * 3))),
            kote: Math.min(99, Math.max(10, baseSkillVal + b.kote + Math.floor(Math.random() * 3))),
            do: Math.min(99, Math.max(10, baseSkillVal + b.do + Math.floor(Math.random() * 3))),
            tsuki: Math.min(99, Math.max(10, baseSkillVal + b.tsuki + Math.floor(Math.random() * 3))),
        };

        // 得意技には奥義解放基準を満たすようボーナスを付与
        const favBonus = 8 + Math.floor(Math.random() * 6);
        skills[favTechStat] = Math.min(99, skills[favTechStat] + favBonus);

        const surname = getRandomItem(SURNAMES);
        const title = arch.title || getRandomItem(FIGHTER_TITLES);
        const roleLabel = `${gradeLabel}・${arch.typeName}`;

        return {
            name: surname,
            fullName: `${surname}`,
            schoolName: schoolName,
            pref: pref,
            grade: grade,
            role: roleLabel,
            title: title,
            shortDesc: isNational
                ? `${pref}・${schoolName}${gradeLabel}代表。「${title}」の異名をとる全国屈指の猛者。`
                : `${pref}・${schoolName}${gradeLabel}。「${title}」の異名をとる、高校3年間鍛え上げた強豪剣士。`,
            hp: Math.min(8, Math.max(3, baseHp)),
            str: str,
            agi: agi,
            spi: spi,
            skills: skills,
            specialTechnique: specialTech,
            stance: stance,
            face: window.FaceGenerator ? window.FaceGenerator.generateFace({
                seed: `${schoolName}_${pref}_${matchIdx}_${surname}`,
                name: surname
            }) : null,
        };
    }

    // ───────────────────────────────────────────
    // 個人戦トーナメント（ブラケット）エンジン
    // ───────────────────────────────────────────
    // 自校から個人戦へエントリーする代表選手を選定（最大2名：主将＋部内実力最上位者）
    function selectIndividualParticipants() {
        const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
        if (!captain) return [];

        const otherMembers = ClubState.members.filter((m) => m.id !== captain.id);
        if (otherMembers.length === 0) {
            return [{
                memberId: captain.id,
                name: captain.name,
                isPlayer: true,
                isAlive: true,
                achievedRank: null,
            }];
        }

        // 実力値スコア順にソート
        const calcPower = (m) => (m.str * 1.2 + m.agi * 1.3 + m.spi * 1.1 + (m.skills.men + m.skills.kote + m.skills.do + m.skills.tsuki) * 0.4);
        const sortedOthers = [...otherMembers].sort((a, b) => calcPower(b) - calcPower(a));
        const secondAce = sortedOthers[0];

        return [
            {
                memberId: captain.id,
                name: captain.name,
                isPlayer: true,
                isAlive: true,
                achievedRank: null,
            },
            {
                memberId: secondAce.id,
                name: secondAce.name,
                isPlayer: false,
                isAlive: true,
                achievedRank: null,
            },
        ];
    }

    // 部員オブジェクトから個人戦用ファイター情報を構築
    function createMyClubFighter(part) {
        const m = ClubState.members.find((item) => item.id === part.memberId);
        if (!m) return null;
        return {
            id: m.id,
            name: m.name,
            schoolName: ClubState.schoolName,
            pref: ClubState.prefecture,
            isMyClub: true,
            isPlayer: !!part.isPlayer,
            title: part.isPlayer ? '主将・あなた' : '自校代表',
            memberRef: m,
            participantRef: part,
            hp: m.maxHealth,
            str: m.str,
            agi: m.agi,
            spi: m.spi,
            skills: m.skills,
            specialTechnique: m.specialTechnique || 'hien_men',
            favStance: m.favStance || 'chudan',
            stance: m.favStance || 'chudan',
            condition: m.condition || 'normal',
            fatigue: m.fatigue || 0,
            armorTheme: m.armorTheme,
        };
    }

    // 16名（予選）または32名（全国）の本格トーナメントブラケットを生成
    function createIndividualTournamentBracket(type, pref, participants) {
        const isNational = type === 'interhigh_national';
        const totalRounds = isNational ? 5 : 4;
        const totalFighters = Math.pow(2, totalRounds); // 32名 または 16名
        const firstRoundMatches = totalFighters / 2; // 16試合 または 8試合

        const roundNames = isNational
            ? ['1回戦', '2回戦', '準々決勝', '準決勝', '決勝戦']
            : ['1回戦', '2回戦', '準決勝', '決勝戦'];

        // 空の全ラウンドマッチ構造を作成
        const rounds = [];
        for (let r = 0; r < totalRounds; r++) {
            const matchesCount = totalFighters / Math.pow(2, r + 1);
            const matches = [];
            for (let m = 0; m < matchesCount; m++) {
                matches.push({
                    matchId: `r${r}_m${m}`,
                    roundIdx: r,
                    roundName: roundNames[r],
                    matchIdx: m,
                    playerA: null,
                    playerB: null,
                    winner: null, // 'playerA' | 'playerB'
                    played: false,
                    scoreA: [],
                    scoreB: [],
                    log: [],
                });
            }
            rounds.push({
                roundIdx: r,
                roundName: roundNames[r],
                matches: matches,
            });
        }

        // 第1回戦（Round 0）への選手初期配置（シード配置）
        const otherPrefs = PREFECTURES.filter((p) => p !== pref);

        // 自校選手のシード配置位置
        // 選手1（主将）：Match 0 の playerA（左上/先頭ブロック）
        // 選手2（仲間部員）：Match (firstRoundMatches / 2) の playerA（右下/別ブロック）
        const myFighters = participants.map((p) => createMyClubFighter(p)).filter(Boolean);
        const p1 = myFighters[0];
        const p2 = myFighters[1];

        if (p1) {
            rounds[0].matches[0].playerA = p1;
        }
        if (p2) {
            const seed2MatchIdx = Math.floor(firstRoundMatches / 2);
            rounds[0].matches[seed2MatchIdx].playerA = p2;
        }

        // 残りの枠にライバル選手を配置（高校3年間鍛え上げた3年生中心）
        for (let m = 0; m < firstRoundMatches; m++) {
            const matchNode = rounds[0].matches[m];

            // トーナメント山に応じたシード階層の算出
            let defaultSeedTier = 0;
            if (isNational) {
                // 32名（16試合）
                if (m === firstRoundMatches - 1 || m === Math.floor(firstRoundMatches / 2) - 1) {
                    defaultSeedTier = 2; // 第1・第2シード枠（全国頂点候補）
                } else if (m % 4 === 3) {
                    defaultSeedTier = 1; // 各ブロックのシード強豪
                }
            } else {
                // 16名（8試合）
                if (m === firstRoundMatches - 1) {
                    defaultSeedTier = 2; // 反対山の大本命（第1シード）
                } else if (m === 3 || m === 2 || m === 6) {
                    defaultSeedTier = 1; // 準決勝・ベスト4候補
                }
            }

            if (!matchNode.playerA) {
                const oppPref = isNational ? getRandomItem(otherPrefs) : pref;
                const oppSchool = `${getRandomItem(SCHOOL_PREFIXES)}高校`;
                const fighter = generateOpponentIndividual(oppSchool, oppPref, isNational, defaultSeedTier, m * 2);
                matchNode.playerA = {
                    id: `opp_${oppSchool}_${fighter.name}_${m}a`,
                    name: fighter.name,
                    schoolName: fighter.schoolName,
                    pref: fighter.pref,
                    grade: fighter.grade,
                    role: fighter.role,
                    isMyClub: false,
                    isPlayer: false,
                    title: fighter.title,
                    shortDesc: fighter.shortDesc,
                    hp: fighter.hp,
                    str: fighter.str,
                    agi: fighter.agi,
                    spi: fighter.spi,
                    skills: fighter.skills,
                    specialTechnique: fighter.specialTechnique,
                    stance: fighter.stance,
                    favStance: fighter.stance,
                    armorTheme: null,
                };
            }

            if (!matchNode.playerB) {
                const oppPref = isNational ? getRandomItem(otherPrefs) : pref;
                const oppSchool = `${getRandomItem(SCHOOL_PREFIXES)}高校`;
                // 自校選手と直接当たる枠（Match 0 の B枠、Match (firstRoundMatches / 2) の B枠）は 1回戦標準代表（seedTier = 0）
                const isDirectOpponentOfMyClub = (m === 0 || m === Math.floor(firstRoundMatches / 2));
                const slotTier = isDirectOpponentOfMyClub ? 0 : defaultSeedTier;
                const fighter = generateOpponentIndividual(oppSchool, oppPref, isNational, slotTier, m * 2 + 1);
                matchNode.playerB = {
                    id: `opp_${oppSchool}_${fighter.name}_${m}b`,
                    name: fighter.name,
                    schoolName: fighter.schoolName,
                    pref: fighter.pref,
                    grade: fighter.grade,
                    role: fighter.role,
                    isMyClub: false,
                    isPlayer: false,
                    title: fighter.title,
                    shortDesc: fighter.shortDesc,
                    hp: fighter.hp,
                    str: fighter.str,
                    agi: fighter.agi,
                    spi: fighter.spi,
                    skills: fighter.skills,
                    specialTechnique: fighter.specialTechnique,
                    stance: fighter.stance,
                    favStance: fighter.stance,
                    armorTheme: null,
                };
            }
        }

        return {
            type: type,
            pref: pref,
            totalRounds: totalRounds,
            roundNames: roundNames,
            rounds: rounds,
            currentRoundIdx: 0,
        };
    }

    // ポジション名や回戦名から「（〇〇の試合）」などの冗長サフィックスを安全に除去
    function sanitizePosName(str) {
        if (!str) return '';
        return String(str).replace(/[（\(][^）\)]*の試合[）\)]/g, '').trim();
    }

    // ブラケットデータの整合性自動修復（過去のセーブデータや未完了マッチの自己修復）
    function reconcileBracketData(bracket) {
        if (!bracket || !bracket.rounds) return;

        if (Array.isArray(bracket.roundNames)) {
            bracket.roundNames = bracket.roundNames.map(sanitizePosName);
        }
        if (Array.isArray(bracket.rounds)) {
            bracket.rounds.forEach((r) => {
                if (r.roundName) r.roundName = sanitizePosName(r.roundName);
            });
        }
        if (ClubState.currentMatchData && ClubState.currentMatchData.activeBouts) {
            const ab = ClubState.currentMatchData.activeBouts;
            if (ab.roundName) ab.roundName = sanitizePosName(ab.roundName);
            if (Array.isArray(ab.bouts)) {
                ab.bouts.forEach((b) => {
                    if (b.posName) b.posName = sanitizePosName(b.posName);
                });
            }
        }

        for (let r = 0; r < bracket.rounds.length - 1; r++) {
            const curRound = bracket.rounds[r];
            const nextRound = bracket.rounds[r + 1];
            if (!curRound || !nextRound || !curRound.matches || !nextRound.matches) continue;

            curRound.matches.forEach((m, mIdx) => {
                const nextMatchIdx = Math.floor(mIdx / 2);
                const isSlotA = (mIdx % 2 === 0);
                const nextMatch = nextRound.matches[nextMatchIdx];
                if (!nextMatch) return;

                const advFighter = isSlotA ? nextMatch.playerA : nextMatch.playerB;
                // 次の回戦の該当枠にすでに進出している選手が存在する場合
                if (advFighter) {
                    const isWinnerA = (m.playerA && (m.playerA === advFighter || m.playerA.id === advFighter.id || m.playerA.name === advFighter.name));

                    if (!m.played || !m.winner) {
                        m.played = true;
                        m.winner = isWinnerA ? 'playerA' : 'playerB';
                    }

                    // スコアが空の場合、勝者に「勝」、敗者に「0」を補完
                    if (!m.scoreA || m.scoreA.length === 0) {
                        m.scoreA = isWinnerA ? ['勝'] : ['0'];
                    }
                    if (!m.scoreB || m.scoreB.length === 0) {
                        m.scoreB = isWinnerA ? ['0'] : ['勝'];
                    }
                }
            });
        }
    }

    // 他校同士のマッチをAI自動シミュレーションして次枠へ勝者を進出させる
    function autoSimulateOtherMatches(bracket, roundIdx) {
        if (!bracket || !bracket.rounds[roundIdx]) return;
        const currentRound = bracket.rounds[roundIdx];
        const nextRound = bracket.rounds[roundIdx + 1];

        currentRound.matches.forEach((m) => {
            if (m.played) return;
            // 自校選手が関わる試合はここではスキップ
            const hasMyClub = (m.playerA && m.playerA.isMyClub) || (m.playerB && m.playerB.isMyClub);
            if (hasMyClub) return;

            // 他校同士の自動シミュレーション
            const pA = m.playerA;
            const pB = m.playerB;
            if (!pA || !pB) return;

            const powerA = (pA.str * 1.2 + pA.agi * 1.3 + pA.spi * 1.1);
            const powerB = (pB.str * 1.2 + pB.agi * 1.3 + pB.spi * 1.1);
            const winRateA = powerA / (powerA + powerB);

            const roll = Math.random();
            const techList = ['メ', 'コ', 'ド'];
            const pick = () => techList[Math.floor(Math.random() * techList.length)];

            if (roll < winRateA) {
                m.winner = 'playerA';
                m.scoreA = [pick()];
                m.scoreB = [];
                m.played = true;
            } else {
                m.winner = 'playerB';
                m.scoreA = [];
                m.scoreB = [pick()];
                m.played = true;
            }

            // 勝者を次のラウンドへ進出
            if (nextRound) {
                const nextMatchIdx = Math.floor(m.matchIdx / 2);
                const isSlotA = (m.matchIdx % 2 === 0);
                const winnerFighter = (m.winner === 'playerA') ? pA : pB;
                if (isSlotA) {
                    nextRound.matches[nextMatchIdx].playerA = winnerFighter;
                } else {
                    nextRound.matches[nextMatchIdx].playerB = winnerFighter;
                }
            }
        });
    }

    // 6月1週：インターハイ（全国高校総体）都道府県個人予選
    function triggerInterhighDistrictTournament() {
        const pref = ClubState.prefecture;
        const participants = selectIndividualParticipants();
        if (participants.length === 0) return;

        const bracket = createIndividualTournamentBracket('interhigh_district', pref, participants);

        ClubState.currentMatchData = {
            type: 'interhigh_district',
            isIndividual: true,
            title: `第${ClubState.year}期 インターハイ ${pref}個人予選`,
            bracket: bracket,
            rounds: bracket.rounds,
            currentRoundIdx: 0,
            participants: participants,
            activeBouts: null,
            isTournamentOver: false,
            rankAchieved: null,
        };

        ClubState.viewPhase = 'match_sim';
        setupCurrentBouts();
        saveClubData();
        renderClubUI();
    }

    // 8月1週：インターハイ（全国高校総体）個人戦
    function triggerInterhighNationalTournament() {
        const pref = ClubState.prefecture;
        const qualifiedMembers = ClubState.members.filter((m) => (ClubState.interhighQualifiedMemberIds || []).includes(m.id));
        if (qualifiedMembers.length === 0) return;

        const participants = qualifiedMembers.map((m) => ({
            memberId: m.id,
            name: m.name,
            isPlayer: !!m.isPlayer,
            isAlive: true,
            achievedRank: null,
        }));

        const bracket = createIndividualTournamentBracket('interhigh_national', pref, participants);

        ClubState.currentMatchData = {
            type: 'interhigh_national',
            isIndividual: true,
            title: `第${ClubState.year}回 全国高等学校総合体育大会（インターハイ） 剣道個人戦`,
            bracket: bracket,
            rounds: bracket.rounds,
            currentRoundIdx: 0,
            participants: participants,
            activeBouts: null,
            isTournamentOver: false,
            rankAchieved: null,
        };

        ClubState.viewPhase = 'match_sim';
        setupCurrentBouts();
        saveClubData();
        renderClubUI();
    }

    // 団体戦用 対戦相手校チームの生成（高校2年間鍛え上げた2年生中心の新チーム・強弱変化とポジション特性を強化）
    function generateOpponentTeam(schoolName, pref, stageIdxOrGrade = 0, isNationalFlag = false) {
        // 後方互換：第4引数がブール値、または第3引数が4以上なら全国扱い
        const isNational = (typeof isNationalFlag === 'boolean')
            ? isNationalFlag
            : (Number(stageIdxOrGrade) >= 4);

        // ラウンド進行度（0: 1回戦/準々決勝, 1: 準決勝, 2: 決勝 など）
        const roundStep = (typeof isNationalFlag === 'boolean')
            ? Math.max(0, Number(stageIdxOrGrade) || 0)
            : Math.max(0, (Number(stageIdxOrGrade) || 1) - 1);

        const members = [];

        // 学校全体の実力ランク（強弱の変化）
        const schoolTier = getSchoolPowerTier(schoolName, isNational, roundStep);

        // ポジションごとの特性とアーキタイプ候補プール
        // 先鋒: 俊敏・スピード型中心、次鋒: 粘り・カウンター型中心、中堅: 技術・主力、副将: 剛腕パワー型、大将: 新主将絶対エース
        const posConfigs = [
            {
                posName: '先鋒',
                gradeChance2: 0.80,
                statOffset: -3,
                hpBase: 4,
                archPool: ['speed', 'speed', 'tsuki', 'allround']
            },
            {
                posName: '次鋒',
                gradeChance2: 0.85,
                statOffset: -2,
                hpBase: 5,
                archPool: ['spirit', 'spirit', 'counter', 'allround']
            },
            {
                posName: '中堅',
                gradeChance2: 1.00,
                statOffset: 2,
                hpBase: 4,
                archPool: ['allround', 'tsuki', 'speed', 'power']
            },
            {
                posName: '副将',
                gradeChance2: 1.00,
                statOffset: 5,
                hpBase: 5,
                archPool: ['power', 'power', 'spirit', 'allround']
            },
            {
                posName: '大将',
                gradeChance2: 1.00,
                statOffset: 9,
                hpBase: 5,
                archPool: ['allround', 'power', 'tsuki', 'spirit']
            },
        ];

        for (let i = 0; i < 5; i++) {
            const pConf = posConfigs[i] || posConfigs[0];
            const chosenArchId = getRandomItem(pConf.archPool);
            const arch = OPPONENT_ARCHETYPES.find(a => a.id === chosenArchId) || OPPONENT_ARCHETYPES[0];
            const stance = getRandomItem(arch.prefStance);

            // 学年：2年生中心（先鋒・次鋒は稀に有望な1年生）
            const isGrade2 = Math.random() < pConf.gradeChance2;
            const grade = isGrade2 ? 2 : 1;
            const gradeLabel = grade === 2 ? '2年' : '1年';

            const specialTech = arch.specialTech;
            const reqStatMap = {
                hien_men: 'men', gouriki_men: 'men', tenkou_men: 'men',
                dengeki_kote: 'kote', kasumi_kote: 'kote',
                hayate_do: 'do', gen_do: 'do',
                shiden_tsuki: 'tsuki', tensho_tsuki: 'tsuki'
            };
            const favTechStat = reqStatMap[specialTech] || 'men';

            let baseHp = pConf.hpBase + arch.hpBonus + schoolTier.hpOffset;
            let baseStat = 38;
            let baseSkill = 35;

            if (!isNational) {
                // ── 地区大会（12月新人戦・選抜地区予選） ──
                const stepBonus = Math.min(2, roundStep);
                baseStat = 38 + stepBonus * 7 + pConf.statOffset + schoolTier.statOffset + Math.floor(Math.random() * 4);
                baseSkill = 35 + stepBonus * 6 + pConf.statOffset + schoolTier.statOffset + Math.floor(Math.random() * 4);
            } else {
                // ── 全国選抜大会（3月・全国の強豪2年生チーム） ──
                const stepBonus = Math.min(4, roundStep);
                baseStat = 52 + stepBonus * 6 + pConf.statOffset + schoolTier.statOffset + Math.floor(Math.random() * 4);
                baseSkill = 48 + stepBonus * 6 + pConf.statOffset + schoolTier.statOffset + Math.floor(Math.random() * 4);
            }

            // 学年補正（1年の場合は少し控えめ）
            const gradeMod = grade === 1 ? -3 : 0;

            // アーキタイプによるパラメータ凹凸（得意+12〜16、苦手-8〜12）
            const b = arch.bias;
            const str = Math.min(99, Math.max(10, baseStat + b.str + gradeMod + Math.floor(Math.random() * 3)));
            const agi = Math.min(99, Math.max(10, baseStat + b.agi + gradeMod + Math.floor(Math.random() * 3)));
            const spi = Math.min(99, Math.max(10, baseStat + b.spi + gradeMod + Math.floor(Math.random() * 3)));

            const skills = {
                men: Math.min(99, Math.max(10, baseSkill + b.men + gradeMod + Math.floor(Math.random() * 3))),
                kote: Math.min(99, Math.max(10, baseSkill + b.kote + gradeMod + Math.floor(Math.random() * 3))),
                do: Math.min(99, Math.max(10, baseSkill + b.do + gradeMod + Math.floor(Math.random() * 3))),
                tsuki: Math.min(99, Math.max(10, baseSkill + b.tsuki + gradeMod + Math.floor(Math.random() * 3))),
            };

            // 中堅・副将・大将、あるいは上位ラウンドでは得意技にボーナスを付与して必殺技を解放
            if (i >= 2 || roundStep >= 1 || isNational) {
                const favBonus = 7 + Math.floor(Math.random() * 5);
                skills[favTechStat] = Math.min(99, skills[favTechStat] + favBonus);
            }

            const memberName = getRandomItem(SURNAMES);
            const memberRole = `${gradeLabel}・${POS_NAMES[i]} (${arch.typeName})`;

            members.push({
                name: memberName,
                grade: grade,
                role: memberRole,
                hp: Math.min(8, Math.max(3, baseHp)),
                str: str,
                agi: agi,
                spi: spi,
                skills: skills,
                specialTechnique: specialTech,
                stance: stance,
                face: window.FaceGenerator ? window.FaceGenerator.generateFace({
                    seed: `${schoolName}_${pref}_${i}_${roundStep}_${memberName}`,
                    name: memberName
                }) : null,
            });
        }

        const tierDesc = schoolTier.label ? `【${schoolTier.label}】` : '';
        return {
            schoolName: schoolName,
            pref: pref,
            tier: schoolTier.tier,
            shortDesc: isNational
                ? `${pref}代表${tierDesc}。高校2年間鍛え抜かれた個性と実力ある新チーム布陣。`
                : `${pref}の強豪校${tierDesc}。2年間鍛え上げた2年生主力の多彩な布陣。`,
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
                oppTeam: generateOpponentTeam(oppSchool, pref, idx, false),
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
                oppTeam: generateOpponentTeam(oppSchool, p, idx, true),
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

        // 個人戦トーナメント（ブラケット方式）のマッチング処理
        if (match.isIndividual && match.bracket) {
            // データの自己修復と他校同士の自動シミュレート
            reconcileBracketData(match.bracket);
            autoSimulateOtherMatches(match.bracket, match.currentRoundIdx);

            const rIdx = match.currentRoundIdx;
            const bracketRound = match.bracket.rounds[rIdx];
            if (!bracketRound) return;

            // 現在のラウンドで自校選手が出場するマッチを抽出
            const clubMatches = bracketRound.matches.filter((m) => {
                return (m.playerA && m.playerA.isMyClub) || (m.playerB && m.playerB.isMyClub);
            });

            clubMatches.forEach((m, idx) => {
                const isIntra = !!(m.playerA && m.playerA.isMyClub && m.playerB && m.playerB.isMyClub);
                let myFighter, enemyFighter;

                if (isIntra) {
                    // 同門対決：主将を myFighter、仲間を enemyFighter
                    if (m.playerA.isPlayer) {
                        myFighter = m.playerA;
                        enemyFighter = m.playerB;
                    } else {
                        myFighter = m.playerB;
                        enemyFighter = m.playerA;
                    }
                } else if (m.playerA && m.playerA.isMyClub) {
                    myFighter = m.playerA;
                    enemyFighter = m.playerB;
                } else {
                    myFighter = m.playerB;
                    enemyFighter = m.playerA;
                }

                const myMemberObj = getRealClubMember(myFighter) || ClubState.members.find((item) => item.id === myFighter.id) || ClubState.members[0];
                const enemyMemberObj = isIntra
                    ? (getRealClubMember(enemyFighter) || ClubState.members.find((item) => item.id === enemyFighter.id) || enemyFighter)
                    : (enemyFighter ? (enemyFighter.memberRef || enemyFighter) : { name: '不戦勝', schoolName: '', hp: 6, str: 10, agi: 10, spi: 10, stance: 'chudan' });

                bouts.push({
                    posIndex: idx,
                    posName: isIntra ? '決勝戦（同門対決）' : round.roundName,
                    matchNodeRef: m,
                    myFighter: myFighter,
                    enemyFighter: enemyFighter,
                    myMember: myMemberObj,
                    enemyMember: enemyMemberObj,
                    isPlayerBout: !!myFighter.isPlayer,
                    isIntraClub: isIntra,
                    played: !!m.played,
                    winner: m.winner ? (m.winner === (m.playerA === myFighter ? 'playerA' : 'playerB') ? 'my' : 'enemy') : null,
                    myScore: m.playerA === myFighter ? (m.scoreA || []) : (m.scoreB || []),
                    enemyScore: m.playerA === myFighter ? (m.scoreB || []) : (m.scoreA || []),
                    log: m.log || [],
                    schoolName: enemyFighter ? enemyFighter.schoolName : '',
                    pref: enemyFighter ? enemyFighter.pref : '',
                    participantRef: myFighter.participantRef,
                    enemyParticipantRef: enemyFighter ? enemyFighter.participantRef : null,
                });
            });

            const firstUnplayedIdx = bouts.findIndex((b) => !b.played);
            const curIdx = firstUnplayedIdx !== -1 ? firstUnplayedIdx : (bouts.length > 0 ? bouts.length - 1 : 0);

            match.activeBouts = {
                isIndividual: true,
                roundName: round.roundName,
                schoolName: bouts.length > 0 ? bouts[0].schoolName : '',
                pref: bouts.length > 0 ? bouts[0].pref : '',
                shortDesc: bouts.length > 0 ? (bouts[0].enemyFighter?.title || '') : '',
                bouts: bouts,
                currentBoutIndex: curIdx,
                isFinished: bouts.length === 0 || bouts.every((b) => b.played),
                finalResult: null,
            };

            // 自校選手の試合が0件（全員以前に敗退）の場合
            if (bouts.length === 0) {
                match.activeBouts.isFinished = true;
                match.activeBouts.finalResult = 'lose';
            }

            saveClubData();
            return;
        }

        // 団体戦（5人制）
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
            isIndividual: false,
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

    // 個人戦マッチの勝敗確定・ブラケット反映処理
    function applyIndividualMatchOutcome(bout, winnerSide, myScoreArr, enemyScoreArr, logArr) {
        const match = ClubState.currentMatchData;
        if (!match) return;

        bout.played = true;
        bout.winner = winnerSide;
        bout.myScore = myScoreArr || [];
        bout.enemyScore = enemyScoreArr || [];
        bout.log = logArr || [];

        const m = bout.matchNodeRef;
        const curRoundMatches = match.bracket ? match.bracket.rounds[match.currentRoundIdx]?.matches : null;
        const actualNode = curRoundMatches ? (curRoundMatches.find((item) => item.matchId === m?.matchId) || curRoundMatches[m?.matchIdx] || m) : m;

        if (actualNode && match.bracket) {
            actualNode.played = true;
            if (m && m !== actualNode) m.played = true;

            const isMyPlayerA = (actualNode.playerA === bout.myFighter || (actualNode.playerA && bout.myFighter && actualNode.playerA.id === bout.myFighter.id));
            const mySlot = isMyPlayerA ? 'playerA' : 'playerB';
            const enemySlot = isMyPlayerA ? 'playerB' : 'playerA';

            actualNode.winner = (winnerSide === 'my') ? mySlot : enemySlot;
            if (m && m !== actualNode) m.winner = actualNode.winner;

            actualNode.scoreA = isMyPlayerA ? (myScoreArr || []) : (enemyScoreArr || []);
            actualNode.scoreB = isMyPlayerA ? (enemyScoreArr || []) : (myScoreArr || []);
            actualNode.log = logArr || [];

            const winnerFighter = (winnerSide === 'my') ? bout.myFighter : bout.enemyFighter;
            const loserFighter = (winnerSide === 'my') ? bout.enemyFighter : bout.myFighter;

            // 勝者を次のラウンド枠へ進出
            const nextRound = match.bracket.rounds[match.currentRoundIdx + 1];
            if (nextRound && winnerFighter) {
                const nextMatchIdx = Math.floor(actualNode.matchIdx / 2);
                const isNextSlotA = (actualNode.matchIdx % 2 === 0);
                if (isNextSlotA) {
                    nextRound.matches[nextMatchIdx].playerA = winnerFighter;
                } else {
                    nextRound.matches[nextMatchIdx].playerB = winnerFighter;
                }
            }

            // 敗者の敗退処理（自校選手の場合）
            if (loserFighter && loserFighter.isMyClub) {
                const loserId = loserFighter.id || (loserFighter.memberRef ? loserFighter.memberRef.id : null);
                const rankLabel = getIndividualRankLabel(match.currentRoundIdx, match.bracket.totalRounds);
                if (loserFighter.participantRef) {
                    loserFighter.participantRef.isAlive = false;
                    loserFighter.participantRef.achievedRank = rankLabel;
                }
                // match.participants内の対象も確実に更新
                if (match.participants) {
                    const target = match.participants.find((p) => p.memberId === loserId || p.name === loserFighter.name);
                    if (target) {
                        target.isAlive = false;
                        target.achievedRank = rankLabel;
                    }
                }
            }

            // 勝者の生存処理（自校選手の場合）
            if (winnerFighter && winnerFighter.isMyClub) {
                const winnerId = winnerFighter.id || (winnerFighter.memberRef ? winnerFighter.memberRef.id : null);
                if (winnerFighter.participantRef) {
                    winnerFighter.participantRef.isAlive = true;
                }
                if (match.participants) {
                    const target = match.participants.find((p) => p.memberId === winnerId || p.name === winnerFighter.name);
                    if (target) {
                        target.isAlive = true;
                    }
                }
            }

            // 自校の試合終了直後、同ラウンドの他校同士の試合も即時シミュレートしてラインと次戦相手を同期
            autoSimulateOtherMatches(match.bracket, match.currentRoundIdx);
        }
    }

    // トーナメント表（ブラケットUI）のHTML生成
    function renderTournamentBracketHtml(bracket, currentRoundIdx, activeMatchId) {
        if (!bracket || !bracket.rounds) return '';

        // 過去セーブデータや未完了ノードの整合性を自動修復
        reconcileBracketData(bracket);

        const elements = [];
        bracket.rounds.forEach((round, rIdx) => {
            const isCurrentRound = (rIdx === currentRoundIdx);
            const matchesHtml = round.matches.map((m) => {
                const isActiveMatch = (m.matchId === activeMatchId);
                const pA = m.playerA;
                const pB = m.playerB;

                const renderSlot = (fighter, isSlotA) => {
                    if (!fighter) {
                        return `<div class="bracket-slot empty-slot"><span class="fighter-name-text text-muted">未定</span></div>`;
                    }
                    const isWinner = m.played && ((isSlotA && m.winner === 'playerA') || (!isSlotA && m.winner === 'playerB'));
                    const isLoser = m.played && !isWinner;
                    const isMy = fighter.isMyClub;
                    const isYou = fighter.isPlayer;

                    let badgeClass = '';
                    let badgeLabel = '';
                    if (isYou) {
                        badgeClass = 'tag-you';
                        badgeLabel = '主将';
                    } else if (isMy) {
                        badgeClass = 'tag-myclub';
                        badgeLabel = '仲間';
                    }

                    const score = isSlotA ? (m.scoreA || []) : (m.scoreB || []);
                    const scoreText = m.played ? (score.length ? score.join('') : '0') : '';

                    return `
                        <div class="bracket-slot ${isMy ? 'is-my-fighter' : ''} ${isWinner ? 'is-winner' : ''} ${isLoser ? 'is-loser' : ''}">
                            <div class="bracket-slot-fighter">
                                ${badgeLabel ? `<span class="bracket-tag ${badgeClass}">${badgeLabel}</span>` : ''}
                                <span class="fighter-name-text" title="${fighter.schoolName} (${fighter.pref})">${escapeHtml(fighter.name)}</span>
                                <span class="fighter-school-text">${escapeHtml(fighter.schoolName)}</span>
                            </div>
                            <div class="bracket-slot-score">${scoreText}</div>
                        </div>
                    `;
                };

                return `
                    <div class="bracket-match-node ${isActiveMatch ? 'active-match-node pulse-border' : ''} ${m.played ? 'played-match' : ''}">
                        ${renderSlot(pA, true)}
                        ${renderSlot(pB, false)}
                    </div>
                `;
            }).join('');

            // ラウンド列HTML
            elements.push(`
                <div class="bracket-round-column ${isCurrentRound ? 'active-round-column' : ''}">
                    <div class="bracket-round-header">
                        <span class="round-header-name">${round.roundName}</span>
                    </div>
                    <div class="bracket-matches-list">
                        ${matchesHtml}
                    </div>
                </div>
            `);

            // 次ラウンドへの接続線（コネクタ列）
            const nextRound = bracket.rounds[rIdx + 1];
            if (nextRound && nextRound.matches) {
                const connectorNodesHtml = nextRound.matches.map((nextM, mIdx) => {
                    const topMatch = round.matches[mIdx * 2];
                    const bottomMatch = round.matches[mIdx * 2 + 1];

                    // 勝者判定（どのような保存形式・タイミングでも確実に判定）
                    const getFighterWinner = (m) => {
                        if (!m || !m.played) return null;
                        if (m.winner === 'playerA') return m.playerA;
                        if (m.winner === 'playerB') return m.playerB;
                        if (m.winner === 'my') return (m.playerA && m.playerA.isMyClub) ? m.playerA : m.playerB;
                        if (m.winner === 'enemy') return (m.playerA && !m.playerA.isMyClub) ? m.playerA : m.playerB;
                        if (Array.isArray(m.scoreA) && m.scoreA.length > 0) return m.playerA;
                        if (Array.isArray(m.scoreB) && m.scoreB.length > 0) return m.playerB;
                        return m.playerA || m.playerB;
                    };

                    const topWinner = getFighterWinner(topMatch);
                    const bottomWinner = getFighterWinner(bottomMatch);

                    const isTopMy = topWinner && !!topWinner.isMyClub;
                    const isBottomMy = bottomWinner && !!bottomWinner.isMyClub;

                    const topWireClass = topMatch && topMatch.played
                        ? (isTopMy ? 'wire-my' : 'wire-win')
                        : 'wire-default';
                    const bottomWireClass = bottomMatch && bottomMatch.played
                        ? (isBottomMy ? 'wire-my' : 'wire-win')
                        : 'wire-default';

                    // 次ラウンドへの合流線判定
                    let exitWireClass = 'wire-default';
                    const nextSlotFighter = (mIdx % 2 === 0) ? nextM?.playerA : nextM?.playerB;
                    const activeAdvancingFighter = nextSlotFighter || topWinner || bottomWinner;
                    if (activeAdvancingFighter) {
                        exitWireClass = activeAdvancingFighter.isMyClub ? 'wire-my' : 'wire-win';
                    }

                    return `
                        <div class="bracket-connector-node">
                            <svg class="bracket-wire-svg" viewBox="0 0 28 100" preserveAspectRatio="none">
                                <path class="wire-path ${topWireClass}" d="M 0,25 L 14,25 L 14,50" vector-effect="non-scaling-stroke" />
                                <path class="wire-path ${bottomWireClass}" d="M 0,75 L 14,75 L 14,50" vector-effect="non-scaling-stroke" />
                                <path class="wire-path ${exitWireClass}" d="M 14,50 L 28,50" vector-effect="non-scaling-stroke" />
                            </svg>
                        </div>
                    `;
                }).join('');

                elements.push(`
                    <div class="bracket-connector-column">
                        <div class="bracket-connector-header-spacer"></div>
                        <div class="bracket-connectors-list">
                            ${connectorNodesHtml}
                        </div>
                    </div>
                `);
            }
        });

        const columnsHtml = elements.join('');

        return `
            <div class="tournament-bracket-card">
                <div class="bracket-card-top">
                    <span class="bracket-icon">📜</span>
                    <h3>トーナメント表（ブラケット）</h3>
                    <span class="bracket-sub">※勝者のみが次の回戦へ進出します</span>
                </div>
                <div class="bracket-scroll-wrap">
                    <div class="tournament-bracket-grid">
                        ${columnsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    // ───────────────────────────────────────────
    // 仲間AI勝敗シミュレーション
    // ───────────────────────────────────────────
    function simulateAIBout(bout) {
        const my = bout.myMember;
        const opp = bout.enemyMember;

        const mySkills = (my && my.skills) || { men: 10, kote: 10, do: 10, tsuki: 8 };
        const oppSkills = (opp && opp.skills) || { men: 10, kote: 10, do: 10, tsuki: 8 };
        const myStr = (my && my.str) || 10;
        const myAgi = (my && my.agi) || 10;
        const mySpi = (my && my.spi) || 10;
        const oppStr = (opp && opp.str) || 10;
        const oppAgi = (opp && opp.agi) || 10;
        const oppSpi = (opp && opp.spi) || 10;

        const myCondMod = (my && my.condition && CONDITION_DATA[my.condition]?.statMod) || 1.0;
        const myPower = (myStr * 1.2 + myAgi * 1.3 + mySpi * 1.1 + ((mySkills.men || 10) + (mySkills.kote || 10) + (mySkills.do || 10)) * 0.4) * myCondMod;
        const oppPower = oppStr * 1.2 + oppAgi * 1.3 + oppSpi * 1.1 + ((oppSkills.men || 10) + (oppSkills.kote || 10) + (oppSkills.do || 10)) * 0.4;

        const fatiguePenalty = Math.max(0.6, 1.0 - (((my && my.fatigue) || 0) / 100) * 0.35);
        const myFinal = myPower * fatiguePenalty;
        const total = Math.max(1, myFinal + oppPower);
        const myWinRate = Math.min(0.95, Math.max(0.05, myFinal / total));

        bout.played = true;
        bout.log = [];
        bout.myScore = [];
        bout.enemyScore = [];

        const myTechs = ['メ', 'コ', 'ド'];
        if ((mySkills.tsuki || 0) >= 12) myTechs.push('ツ');
        const oppTechs = ['メ', 'コ', 'ド'];
        if ((oppSkills.tsuki || 0) >= 12) oppTechs.push('ツ');

        const pickTech = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const techFullNames = { 'メ': '面', 'コ': '小手', 'ド': '胴', 'ツ': '突き' };

        const isIndividual = ClubState.currentMatchData && ClubState.currentMatchData.isIndividual;
        const roll = Math.random();
        let simStats = null;

        if (isIndividual) {
            // 個人戦：引き分けなし（延長一本勝負で必ず決着）
            let winKana = 'メ';
            let winnerSide = 'my';
            if (roll < myWinRate) {
                winKana = pickTech(myTechs);
                bout.myScore = [winKana];
                bout.enemyScore = [];
                bout.winner = 'my';
                winnerSide = 'my';
                bout.log.push(`【延長戦】息詰まる攻防の末、${my.name}が電光石火の【${techFullNames[winKana]}】を決めて勝負あり！`);
                simStats = {
                    winningMoves: [techFullNames[winKana]],
                    hits: 1,
                    blocks: 1,
                    rounds: 4,
                    pushWins: Math.random() < 0.5 ? 1 : 0,
                };
            } else {
                winKana = pickTech(oppTechs);
                bout.myScore = [];
                bout.enemyScore = [winKana];
                bout.winner = 'enemy';
                winnerSide = 'enemy';
                bout.log.push(`【延長戦】相手の起死回生の出ばな【${techFullNames[winKana]}】に屈し惜敗…！`);
                simStats = {
                    winningMoves: [],
                    hits: 0,
                    blocks: 1,
                    rounds: 4,
                    pushWins: 0,
                };
            }
            applyIndividualMatchOutcome(bout, winnerSide, bout.myScore, bout.enemyScore, bout.log);
        } else if (roll < myWinRate * 0.55) {
            const t1 = pickTech(myTechs);
            const t2 = pickTech(myTechs);
            bout.myScore = [t1, t2];
            bout.winner = 'my';
            bout.log.push(`${my.name}が鋭い踏み込みから鮮やかな【${techFullNames[t1]}】を決めて先取！`);
            bout.log.push(`相手の反撃をいなし、電光石火の【${techFullNames[t2]}】で勝負あり！二本勝ち！`);
            simStats = {
                winningMoves: [techFullNames[t1], techFullNames[t2]],
                hits: 2,
                blocks: 1,
                rounds: 3,
                pushWins: Math.random() < 0.4 ? 1 : 0,
            };
        } else if (roll < myWinRate) {
            const t1 = pickTech(myTechs);
            bout.myScore = [t1];
            bout.winner = 'my';
            bout.log.push(`白熱の鍔迫り合いから、${my.name}が渾身の【${techFullNames[t1]}】！一本勝ち！`);
            simStats = {
                winningMoves: [techFullNames[t1]],
                hits: 1,
                blocks: 1,
                rounds: 5,
                pushWins: Math.random() < 0.3 ? 1 : 0,
            };
        } else if (roll < myWinRate + (1 - myWinRate) * 0.25) {
            bout.winner = 'draw';
            bout.log.push(`互いに譲らぬ攻防の末、決定打なく【引き分け】！`);
            simStats = {
                winningMoves: [],
                hits: 0,
                blocks: 2,
                rounds: 8,
                pushWins: 0,
            };
        } else if (roll < myWinRate + (1 - myWinRate) * 0.65) {
            const t1 = pickTech(oppTechs);
            bout.enemyScore = [t1];
            bout.winner = 'enemy';
            bout.log.push(`相手の鋭い出ばな【${techFullNames[t1]}】を奪われ惜敗…`);
            simStats = {
                winningMoves: [],
                hits: 0,
                blocks: 1,
                rounds: 5,
                pushWins: 0,
            };
        } else {
            const t1 = pickTech(oppTechs);
            const t2 = pickTech(oppTechs);
            bout.enemyScore = [t1, t2];
            bout.winner = 'enemy';
            bout.log.push(`相手の猛攻を受け、【${techFullNames[t1]}】【${techFullNames[t2]}】を奪われ敗北…`);
            simStats = {
                winningMoves: [],
                hits: 0,
                blocks: 0,
                rounds: 4,
                pushWins: 0,
            };
        }

        const realMy = getRealClubMember(my) || my;
        if (simStats) {
            const growth = applyBoutGrowth(realMy, simStats);
            if (growth) {
                bout.log.push(growth.summary);
            }
        }

        // 同門対決の場合、相手（自校仲間部員）にもパラメータ成長を適用！
        if (bout.isIntraClub) {
            const realOpp = getRealClubMember(opp);
            if (realOpp) {
                const isOppWin = bout.winner === 'enemy';
                const oppWinMoves = isOppWin
                    ? (bout.enemyScore.length ? [techFullNames[bout.enemyScore[0]] || '面'] : ['面'])
                    : [];
                const oppStats = {
                    winningMoves: oppWinMoves,
                    hits: isOppWin ? 1 : 0,
                    blocks: 1,
                    rounds: simStats ? simStats.rounds : 4,
                    pushWins: 0,
                };
                const oppGrowth = applyBoutGrowth(realOpp, oppStats);
                if (oppGrowth) {
                    bout.log.push(`【${realOpp.name}】${oppGrowth.summary}`);
                }
            }
        }

        saveClubData();
    }

    function getIndividualRankLabel(roundIdx, totalRounds) {
        if (totalRounds <= 4) {
            // 4回戦制（都道県個人予選：16名制。1回戦→2回戦(準々決勝)→準決勝→決勝）
            if (roundIdx === 0) return '初戦敗退';
            if (roundIdx === 1) return 'ベスト8';
            if (roundIdx === 2) return 'ベスト4';
            return '準優勝';
        } else {
            // 5回戦制（全国個人大会：32名制。1回戦→2回戦→3回戦(準々決勝)→準決勝→決勝）
            if (roundIdx === 0) return '初戦敗退';
            if (roundIdx === 1) return '2回戦敗退';
            if (roundIdx === 2) return 'ベスト8';
            if (roundIdx === 3) return 'ベスト4';
            return '準優勝';
        }
    }

    function evaluateIndividualRound(boutsData) {
        const match = ClubState.currentMatchData;
        if (!match) return;

        // ブラケットが存在する場合、他校同士の試合を自動判定して次枠へ勝者を進出させる
        if (match.bracket) {
            autoSimulateOtherMatches(match.bracket, match.currentRoundIdx);
        }

        // boutsData内の試合結果に基づき、自校選手の生存・敗退状態を確実に同期
        if (boutsData && boutsData.bouts) {
            boutsData.bouts.forEach((b) => {
                const fighterName = b.myMember ? b.myMember.name : (b.myFighter ? b.myFighter.name : null);
                const fighterId = b.myMember ? b.myMember.id : (b.myFighter ? b.myFighter.id : null);
                const p = (match.participants || []).find((item) => item.memberId === fighterId || item.name === fighterName);
                if (p) {
                    if (b.winner === 'my') {
                        p.isAlive = true;
                    } else if (b.winner === 'enemy') {
                        p.isAlive = false;
                        if (!p.achievedRank) {
                            p.achievedRank = getIndividualRankLabel(match.currentRoundIdx, match.bracket ? match.bracket.totalRounds : 4);
                        }
                    }
                }
            });
        }

        const alive = (match.participants || []).filter((p) => p.isAlive);
        if (alive.length > 0) {
            boutsData.finalResult = 'win';
        } else {
            boutsData.finalResult = 'lose';
        }
        saveClubData();
    }

    function evaluateTeamMatch(boutsData) {
        let myW = 0, oppW = 0, d = 0, myPts = 0, oppPts = 0;
        boutsData.bouts.forEach((b) => {
            if (b.winner === 'my') myW++;
            else if (b.winner === 'enemy') oppW++;
            else d++;
            myPts += (b.myScore && b.myScore.length) || 0;
            oppPts += (b.enemyScore && b.enemyScore.length) || 0;
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
        document.body.classList.remove('bg-national', 'bg-district', 'bg-dojo');
        if (tourneyType === 'national' || tourneyType === 'interhigh_national') {
            document.body.classList.add('bg-national');
        } else if (tourneyType === 'district' || tourneyType === 'interhigh_district') {
            document.body.classList.add('bg-district');
        } else if (tourneyType === 'dojo') {
            document.body.classList.add('bg-dojo');
        }
    }

    let clubAnimationFrameId = null;
    let clubAnimStartTime = 0;

    // 各部員の得意な攻撃技（面・小手・胴・突き）の判定
    function getMemberFavoriteAttack(member) {
        if (!member) return 'men';
        if (member.favStance === 'jodan') return 'men';
        const s = member.skills || {};
        const men = s.men || 0;
        const kote = s.kote || 0;
        const doSkill = s.do || 0;
        const tsuki = s.tsuki || 0;
        const maxVal = Math.max(men, kote, doSkill, tsuki);
        if (tsuki === maxVal && tsuki > 0) return 'tsuki';
        if (doSkill === maxVal && doSkill > 0) return 'do';
        if (kote === maxVal && kote > 0) return 'kote';
        return 'men';
    }

    function getAttackDisplayName(attackType) {
        switch (attackType) {
            case 'kote': return '小手打ち';
            case 'do': return '胴打ち';
            case 'tsuki': return '諸手突き';
            default: return '面打ち';
        }
    }

    // 各部員が現在実行すべきモーションの判定
    // 主将マンツーマン特訓時は、主将と指名部員のみがランダムで試合中と同等の攻撃を行い、他の選手は得意構えで待機
    // 座禅・休養は1回だけアニメーション（約2.0秒）し、その後は得意な構えを表示
    function getMemberActiveMotion(member, timeNow) {
        if (!member) return null;
        if (!ClubState.isPracticeExecuting || !ClubState.executingPracticeMotion) {
            // 通常待機時は null（各自の得意な構えで呼吸待機）
            return null;
        }

        const menuId = ClubState.executingPracticeMotion;
        if (menuId === 'special') {
            const isCaptain = !!member.isPlayer;
            const isSelectedTarget = member.id === ClubState.selectedSpecialTargetId;
            if (isCaptain || isSelectedTarget) {
                const attacksObj = ClubState.specialPracticeAttacks;
                const atkList = isCaptain ? (attacksObj && attacksObj.captain) : (attacksObj && attacksObj.target);
                if (atkList && atkList.length) {
                    const now = (typeof timeNow === 'number') ? timeNow : ((typeof window !== 'undefined' && window.performance && window.performance.now) ? window.performance.now() : Date.now());
                    const elapsed = Math.max(0, (now - (ClubState.practiceExecutionStartTime || now)) / 1000);
                    // 3秒間の間に前半（< 1.5s）と後半（>= 1.5s）でランダム技を連続して繰り出す
                    const atkIndex = elapsed < 1.5 ? 0 : 1;
                    const atk = atkList[atkIndex] || atkList[0];
                    return `attack_${atk}`;
                }
                const fallbackAtk = ['men', 'kote', 'do', 'tsuki'][Math.floor(Math.random() * 4)];
                return `attack_${fallbackAtk}`;
            }
            return null; // 他の選手は得意な構えで待機
        }

        // 座禅・休養：1回だけアニメーション（座禅約2.0秒、蹲踞納刀休養約2.4秒）し、その後は得意な構えを表示
        if (menuId === 'zazen' || menuId === 'rest') {
            const now = (typeof timeNow === 'number') ? timeNow : ((typeof window !== 'undefined' && window.performance && window.performance.now) ? window.performance.now() : Date.now());
            const elapsed = Math.max(0, (now - (ClubState.practiceExecutionStartTime || now)) / 1000);
            const cycleDuration = (menuId === 'rest') ? 2.4 : 2.0;
            if (elapsed >= cycleDuration) {
                return null; // 1回のアニメーション完了後は得意な構えを表示
            }
        }

        // 全体稽古（basics, suburi, kakari, zazen, rest）
        return menuId;
    }

    // 各部員カードに表示する状態バッジ文字列
    function getMemberMotionBadgeText(member) {
        if (!member) return '⚡ 構え待機';
        const motion = getMemberActiveMotion(member);
        if (motion === 'idle_rest') {
            return '🍵 納刀待機';
        }
        if (!motion) {
            const stanceLabel = member.favStance === 'jodan' ? '上段' : member.favStance === 'waki' ? '下段' : '中段';
            return `⚡ 構え待機 (${stanceLabel})`;
        }
        if (motion.startsWith('attack_')) {
            const atk = motion.replace('attack_', '');
            return `🥋 特訓打突 (${getAttackDisplayName(atk)})`;
        }
        switch (motion) {
            case 'basics': return '🏃 すり足稽古';
            case 'suburi': return '⚔️ 素振り打ち込み';
            case 'kakari': return '🔥 掛かり稽古';
            case 'zazen': return '🧘 蹲踞';
            case 'rest': return '🍵 蹲踞・納刀休養';
            default: return '⚡ 構え待機';
        }
    }

    function getActivePracticeMotion() {
        return ClubState.executingPracticeMotion || null;
    }

    function updateAllMemberMotionBadges() {
        const badges = document.querySelectorAll('.mini-chara-motion-badge');
        badges.forEach((b) => {
            const memId = b.getAttribute('data-member-id');
            const m = ClubState.members.find((item) => item.id === memId);
            if (!m) return;
            const textElem = b.querySelector('.motion-name');
            if (textElem) {
                textElem.textContent = getMemberMotionBadgeText(m);
            }
        });
    }

    function updateMotionBadges(_motionId) {
        updateAllMemberMotionBadges();
    }

    function renderMiniCharaFrame(timeNow) {
        if (!window.KendoGameEngine || !window.KendoGameEngine.renderMiniFighter) return;
        const container = document.getElementById('clubModeView');
        if (!container || container.style.display === 'none' || ClubState.viewPhase === 'match_sim') {
            return;
        }

        const canvases = document.querySelectorAll('.member-mini-canvas');
        if (!canvases || !canvases.length) return;

        if (!clubAnimStartTime) clubAnimStartTime = timeNow || 0;
        const totalElapsedSec = ((timeNow || 0) - clubAnimStartTime) / 1000;

        const isExecuting = ClubState.isPracticeExecuting && ClubState.executingPracticeMotion;
        const practiceElapsedSec = isExecuting
            ? Math.max(0, ((timeNow || 0) - (ClubState.practiceExecutionStartTime || timeNow || 0)) / 1000)
            : 0;

        // 座禅・休養：1回のアニメーション（座禅約2.0秒、休養約2.4秒）が完了した瞬間にバッジも得意構え待機へ更新
        if (isExecuting && (ClubState.executingPracticeMotion === 'zazen' || ClubState.executingPracticeMotion === 'rest')) {
            const cycleDuration = (ClubState.executingPracticeMotion === 'rest') ? 2.4 : 2.0;
            if (practiceElapsedSec >= cycleDuration && !ClubState.practiceCompleted1Cycle) {
                ClubState.practiceCompleted1Cycle = true;
                updateAllMemberMotionBadges();
            }
        }

        canvases.forEach((canvas, index) => {
            const memId = canvas.getAttribute('data-member-id');
            const m = ClubState.members.find((item) => item.id === memId);
            if (!m) return;

            // 各部員のアクティブモーション（特別指導時は主将＆指名部員のみ攻撃、他は待機）
            const memberMotion = getMemberActiveMotion(m, timeNow);

            // 位相計算：
            // 練習メニューをクリックしたときは、得意な構えを表示した状態 (t=0) からアニメーションを開始する
            let memberPhase;
            if (isExecuting && memberMotion) {
                if (memberMotion.startsWith('attack_')) {
                    // 各技1.5秒周期：前半 (0〜1.5s) は 0〜1.5s、後半 (1.5〜3.0s) も 0 から開始してダイナミックに打ち込む
                    const subSec = practiceElapsedSec % 1.5;
                    memberPhase = subSec * Math.PI * 2;
                } else {
                    memberPhase = practiceElapsedSec * Math.PI * 2;
                }
            } else {
                // 待機中（得意構えでの呼吸・すり足待機）
                memberPhase = totalElapsedSec * 3.5 + index * 0.85;
            }

            window.KendoGameEngine.renderMiniFighter(canvas, {
                width: 91,
                height: 100,
                stance: m.favStance || 'chudan',
                armorTheme: m.armorTheme,
                practiceType: memberMotion,
                practiceElapsedSec: practiceElapsedSec,
                phase: memberPhase,
            });
        });
    }

    function startClubMiniCharaLoop() {
        if (clubAnimationFrameId) return;
        const loop = (timestamp) => {
            renderMiniCharaFrame(timestamp);
            clubAnimationFrameId = requestAnimationFrame(loop);
        };
        clubAnimationFrameId = requestAnimationFrame(loop);
    }

    function stopClubMiniCharaLoop() {
        if (clubAnimationFrameId) {
            cancelAnimationFrame(clubAnimationFrameId);
            clubAnimationFrameId = null;
        }
    }

    function drawAllMemberMiniCanvases() {
        renderMiniCharaFrame(typeof window !== 'undefined' && window.performance && window.performance.now ? window.performance.now() : Date.now());
    }

    function clearMobilePortal() {
        const portal = document.getElementById('clubMobilePortal');
        if (portal) portal.innerHTML = '';
    }

    // ───────────────────────────────────────────
    // 練習メニュー画面（道場ダッシュボード）の縦スクロール位置保持・復元
    // ───────────────────────────────────────────
    let isRestoringDashboardScroll = false;
    let lastRenderedClubPhase = null;

    function captureDashboardScroll() {
        if (isRestoringDashboardScroll) return;
        if (ClubState.viewPhase !== 'dashboard') return;
        const container = document.getElementById('clubModeView');
        if (!container || container.style.display === 'none') return;
        const curY = (typeof window !== 'undefined')
            ? (window.scrollY || document.documentElement.scrollTop || (document.body ? document.body.scrollTop : 0) || 0)
            : 0;
        ClubState.dashboardScrollY = curY;
    }

    function restoreDashboardScroll() {
        if (ClubState.viewPhase !== 'dashboard') return;
        const targetY = ClubState.dashboardScrollY || 0;
        if (targetY <= 0) return;

        isRestoringDashboardScroll = true;

        const applyScroll = () => {
            if (typeof window === 'undefined') return;
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            const clampedY = Math.min(targetY, maxScroll > 0 ? maxScroll : targetY);
            window.scrollTo({ top: clampedY, behavior: 'instant' });
        };

        // 1. 同期的に即時適用
        applyScroll();

        // 2. DOMレイアウト・画像サイズ確定後に再適用（2重ガード）
        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(() => {
                applyScroll();
                setTimeout(() => {
                    applyScroll();
                    isRestoringDashboardScroll = false;
                }, 60);
            });
        } else {
            setTimeout(() => {
                applyScroll();
                isRestoringDashboardScroll = false;
            }, 60);
        }
    }

    if (typeof window !== 'undefined' && !window._kendoDashboardScrollListenerAttached) {
        window.addEventListener('scroll', () => {
            captureDashboardScroll();
        }, { passive: true });
        window._kendoDashboardScrollListenerAttached = true;
    }

    function renderClubUI() {
        const container = document.getElementById('clubModeView');
        if (!container) return;

        if (ClubState.viewPhase !== 'dashboard') {
            clearMobilePortal();
        }

        // ダッシュボードから他の全画面シーン（イベント画面、大会、式典等）へ遷移する際、
        // 直前のダッシュボードスクロール位置を確実に保存し、新画面は最上部（Y=0）から閲覧できるようにする
        if (lastRenderedClubPhase === 'dashboard' && ClubState.viewPhase !== 'dashboard') {
            captureDashboardScroll();
            if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
        }

        // 既存の部員一覧の横スクロール位置があれば退避保存
        // ※コンテナが表示状態かつレイアウト済みで、正のスクロール値を持つ場合のみ更新（非表示時やレイアウト未完了による0リセット破壊を防止）
        const existingGrid = container.querySelector('.club-members-grid');
        if (existingGrid && container.style.display !== 'none' && existingGrid.clientWidth > 0) {
            if (existingGrid.scrollLeft > 0) {
                ClubState.memberGridScrollLeft = existingGrid.scrollLeft;
            }
        }

        // 大会中（開会式・スコアボード・結果画面・表彰式）は全体の背景（body）にも大会画像を反映
        let bgType = null;
        if (ClubState.viewPhase === 'tournament_opening') {
            bgType = ClubState.openingTournamentType;
        } else if (ClubState.viewPhase === 'tournament_ceremony') {
            bgType = (ClubState.ceremonyResultData && ClubState.ceremonyResultData.tourneyType) || null;
        } else if ((ClubState.viewPhase === 'match_sim' || ClubState.viewPhase === 'match_result') && ClubState.currentMatchData) {
            bgType = ClubState.currentMatchData.type;
        }
        updateGlobalTournamentBackground(bgType);

        if (!ClubState.isConfigured || ClubState.viewPhase === 'setup') {
            stopClubMiniCharaLoop();
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('club');
            renderSetupScreen(container);
        } else if (ClubState.viewPhase === 'captain_select') {
            // 3年生引退式から新主将交代までは一連のシーンとしてBGM（ceremony）を継続再生
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('ceremony');
            renderCaptainSelectScreen(container);
            startClubMiniCharaLoop();
        } else if (ClubState.viewPhase === 'order_edit') {
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('club');
            renderOrderEditor(container);
            startClubMiniCharaLoop();
        } else if (ClubState.viewPhase === 'history') {
            stopClubMiniCharaLoop();
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('club');
            renderHistoryScreen(container);
        } else if (ClubState.viewPhase === 'tournament_opening') {
            stopClubMiniCharaLoop();
            if (window.KendoBGM && window.KendoBGM.stop) window.KendoBGM.stop();
            renderTournamentOpening(container);
        } else if (ClubState.viewPhase === 'match_sim') {
            stopClubMiniCharaLoop();
            // 勝敗表・試合進行画面ではBGMを停止
            if (window.KendoBGM && window.KendoBGM.stop) window.KendoBGM.stop();
            renderMatchSimulator(container);
        } else if (ClubState.viewPhase === 'match_result') {
            stopClubMiniCharaLoop();
            // 試合結果の表示画面ではBGMを再生しない
            if (window.KendoBGM && window.KendoBGM.stop) window.KendoBGM.stop();
            renderMatchResult(container);
        } else if (ClubState.viewPhase === 'tournament_ceremony') {
            stopClubMiniCharaLoop();
            // 大会終了・表彰状表示画面：優勝時は bgm/Gold_in_the_Dojo.mp3、それ以外は bgm/The_Sunlit_Dojo.mp3 を1回のみ再生（ループなし）
            const isWinner = ClubState.ceremonyResultData && (ClubState.ceremonyResultData.rankKey === 'win' || ClubState.ceremonyResultData.rankLabel === '優勝');
            const ceremonyScene = isWinner ? 'victory' : 'ceremony';
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play(ceremonyScene);
            renderTournamentCeremony(container);
        } else if (ClubState.viewPhase === 'prologue_video') {
            const animeEnabled = (window.KendoGameEngine && typeof window.KendoGameEngine.isOpeningAnimeEnabled === 'function')
                ? window.KendoGameEngine.isOpeningAnimeEnabled()
                : true;
            if (!animeEnabled) {
                proceedFromPrologueVideoToStory();
                return;
            }
            stopClubMiniCharaLoop();
            if (window.KendoBGM && window.KendoBGM.stop) window.KendoBGM.stop();
            renderPrologueVideo(container);
        } else if (ClubState.viewPhase === 'prologue_story') {
            stopClubMiniCharaLoop();
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('ceremony');
            renderPrologueStory(container);
        } else if (ClubState.viewPhase === 'freshman_welcome') {
            stopClubMiniCharaLoop();
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('ceremony');
            renderFreshmanWelcome(container);
        } else if (ClubState.viewPhase === 'retire_ceremony') {
            stopClubMiniCharaLoop();
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('ceremony');
            renderRetireCeremony(container);
        } else if (ClubState.viewPhase === 'club_ending') {
            stopClubMiniCharaLoop();
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('victory');
            renderClubEndingScreen(container);
        } else if (ClubState.viewPhase === 'new_team_ceremony') {
            stopClubMiniCharaLoop();
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('victory');
            renderNewTeamCeremony(container);
        } else if (ClubState.viewPhase === 'event_scene') {
            stopClubMiniCharaLoop();
            // 高校生イベント画面：再生中のBGMは停止させずそのまま継続
            if (window.KendoBGM) {
                if (!window.KendoBGM.isPlaying || !window.KendoBGM.isPlaying()) {
                    if (window.KendoBGM.play) window.KendoBGM.play('club');
                }
            }
            renderEventScene(container);
        } else {
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('club');
            renderDashboard(container);
            startClubMiniCharaLoop();
        }

        // ミニキャラCanvasを直ちに1フレーム描画
        drawAllMemberMiniCanvases();

        lastRenderedClubPhase = ClubState.viewPhase;
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
                        <h2>高校剣道部 復活・再始動</h2>
                        <p class="setup-sub">かつて強豪だったが廃部していた名門剣道部。高校に入学したあなたは1年生主将として部を再建。わずかな仲間と他部からの助っ人と共に、ゼロから全国制覇を目指します。</p>
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
                            <label for="inpCaptainName">🧑‍🎓 1年生 主将の名前（あなたの名前）</label>
                            <input type="text" id="inpCaptainName" value="${defaultCaptain}" required maxlength="10" />
                        </div>

                        <div class="setup-rules-info">
                            <h4>📜 大会ルールと部活の歩み</h4>
                            <ul>
                                <li><strong>6月1週</strong>：インターハイ都道府県個人予選！上位2名が全国大会へ！</li>
                                <li><strong>8月1週</strong>：インターハイ（全国高校総体）個人戦！全国の猛者と勝負！</li>
                                <li><strong>9月1週</strong>：3年生引退期。新主将を指名して次世代へ続けるか、引退してゲームを終了するか選択可能！</li>
                                <li><strong>12月3週</strong>：選抜地区予選（団体戦）。優勝校のみ全国選抜へ！</li>
                                <li><strong>3月4週</strong>：全国高校剣道選抜大会（47都道府県代表団体戦）！</li>
                                <li><strong>4月1週</strong>：進級＆大会実績に応じた新入部員が入部。</li>
                                <li><strong>オートセーブ完備</strong>：試合の勝敗状況も保存されやり直し不可。</li>
                            </ul>
                        </div>

                        <button type="submit" class="btn-setup-start">
                            🥋 廃部を復活させ、全国制覇へ出陣
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    // 新主将指名画面（9月1週）
    function renderCaptainSelectScreen(container) {
        const curCaptain = ClubState.members.find((m) => m.isPlayer);
        if (curCaptain && curCaptain.grade < 3) {
            // 主将が2年生以下の場合は主将選択を行わずダッシュボードへ復帰
            ClubState.viewPhase = 'dashboard';
            saveClubData();
            renderClubUI();
            return;
        }

        let candidates = ClubState.members.filter((m) => m.grade === 2);
        if (candidates.length === 0) {
            candidates = ClubState.members.filter((m) => m.grade === 1);
        }
        if (candidates.length === 0) {
            candidates = [...ClubState.members];
        }

        const candidateCards = candidates.length > 0 ? candidates.map((m) => {
            const gradeLabel = m.grade ? `新${m.grade}年生` : '部員';
            return `
                <div class="captain-candidate-card" onclick="window.KendoClub.selectNewCaptain('${m.id}')">
                    <div class="candidate-header">
                        <strong>${escapeHtml(m.name)}</strong>
                        <span class="cand-grade">${gradeLabel}</span>
                    </div>
                    <div class="member-radar-wrap">
                        ${generateRadarChartSvg(m, 220, 200)}
                    </div>
                    <div class="member-stats-summary-row">
                        <span class="stat-summary-tag">構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '下段' : '中段'}</span>
                        <span class="stat-summary-tag">戦力: ${Math.round(getMemberCombatPower(m))}</span>
                    </div>
                    <div class="member-mini-chara-wrap">
                        <div class="mini-chara-canvas-box">
                            <canvas class="member-mini-canvas" data-member-id="${m.id}" width="91" height="100"></canvas>
                        </div>
                    </div>
                    <button type="button" class="btn-choose-captain">
                        👑 新主将に指名する
                    </button>
                </div>
            `;
        }).join('') : '<p class="empty-candidate-notice" style="color:#94a3b8; text-align:center; padding:2rem; width:100%;">在籍部員が不在のため、新主将を指名できません。</p>';

        container.innerHTML = `
            <div class="captain-select-view">
                <div class="captain-select-header">
                    <span class="cs-icon">👑</span>
                    <h2>新主将の指名（世代交代）</h2>
                    <p>3年生の引退に伴い、次期主将を指名してください。<br>指名された部員が新たなあなたの分身（プレイヤー）となります。</p>
                </div>
                <div class="candidate-grid">
                    ${candidateCards}
                </div>
                <div class="captain-select-footer-actions">
                    <button type="button" class="btn-ending-link" onclick="window.KendoClub.showClubEnding()">
                        🎓 次期主将を指名せず、ここでゲームを終了する（集大成の記録を見る）
                    </button>
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
        const isTournamentWeek = (
            (ClubState.month === 6 && ClubState.week === 1 && memberCount > 0) ||
            (ClubState.month === 8 && ClubState.week === 1 && ClubState.qualifiedForInterhigh && ClubState.interhighQualifiedMemberIds && ClubState.interhighQualifiedMemberIds.length > 0) ||
            (ClubState.month === 12 && ClubState.week === 3 && !isShortage) ||
            (ClubState.month === 3 && ClubState.week === 4 && ClubState.qualifiedForNational && !isShortage)
        );

        if (ClubState.month === 6 && ClubState.week === 1) {
            // 6月1週：インターハイ個人予選（部員1名以上で出場可能）
            if (memberCount === 0) {
                bannerHtml = `
                    <div class="tourney-alert shortage">
                        <span class="shortage-icon">⚠️</span>
                        <div class="alert-body">
                            <strong class="text-danger">【6月1週 インターハイ個人予選】部員不在のため不出場</strong>
                            <p>大会に出場できる部員が不在のため、今回は出場を見送ります。</p>
                        </div>
                    </div>
                `;
            } else {
                bannerHtml = `
                    <div class="tourney-alert ready ih-theme">
                        <span class="pulse-icon">🔥</span>
                        <div class="alert-body">
                            <strong>【6月1週 インターハイ都道府県個人予選】開幕！</strong>
                            <p>上位2名（準優勝以上）が8月のインターハイ（全国高校総体）への切符を掴みます！</p>
                        </div>
                        <button type="button" class="btn-battle-launch ih-btn" onclick="window.KendoClub.startTournamentMatch()">
                            ⚔️ 個人予選に出陣する！
                        </button>
                    </div>
                `;
            }
        } else if (ClubState.month === 8 && ClubState.week === 1) {
            // 8月1週：インターハイ全国個人戦
            if (ClubState.qualifiedForInterhigh && ClubState.interhighQualifiedMemberIds && ClubState.interhighQualifiedMemberIds.length > 0) {
                const ihNames = (ClubState.interhighQualifiedMemberIds || [])
                    .map((id) => ClubState.members.find((m) => m.id === id)?.name)
                    .filter(Boolean)
                    .join('・');
                bannerHtml = `
                    <div class="tourney-alert ready gold">
                        <span class="pulse-icon">👑</span>
                        <div class="alert-body">
                            <strong>【8月1週 全国高校総体（インターハイ）個人戦】開幕！</strong>
                            <p>${ihNames ? `本校代表：<strong class="highlight-count" style="color: #fef08a;">${escapeHtml(ihNames)}</strong><br>` : ''}全国の強豪剣士が集う夢の舞台！個人の頂点・日本一を目指せ！</p>
                        </div>
                        <button type="button" class="btn-battle-launch gold-btn" onclick="window.KendoClub.startTournamentMatch()">
                            🏆 インターハイに出陣する！
                        </button>
                    </div>
                `;
            } else {
                bannerHtml = `
                    <div class="tourney-alert pending">
                        <span class="calendar-icon">🥋</span>
                        <div class="alert-body">
                            <strong>【8月1週 全国高校総体（インターハイ）】開催中</strong>
                            <p>予選敗退のため不出場。秋の稽古に励み、来期の躍進を期します。</p>
                        </div>
                    </div>
                `;
            }
        } else if (ClubState.month === 12 && ClubState.week === 3) {
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
            // 年度内（4月1週〜翌年3月4週）のタイムライン順序値 (4月1週=41 ... 12月4週=124, 1月1週=131 ... 3月4週=154)
            const schoolMonth = ClubState.month >= 4 ? ClubState.month : ClubState.month + 12;
            const currentTimeline = schoolMonth * 10 + ClubState.week;

            if (currentTimeline < 61) {
                nextEventText = '6月1週：インターハイ都道府県個人予選';
            } else if (currentTimeline < 81 && ClubState.qualifiedForInterhigh) {
                nextEventText = '8月1週：インターハイ（全国高校総体）個人戦';
            } else if (currentTimeline < 91) {
                nextEventText = '9月1週：3年生引退 ＆ 新主将指名';
            } else if (currentTimeline < 123) {
                nextEventText = '12月3週：選抜地区予選（団体戦 8校トーナメント）';
            } else if (currentTimeline < 154) {
                nextEventText = ClubState.qualifiedForNational
                    ? '3月4週：全国高校選抜大会（団体戦 47代表）'
                    : '3月4週：全国高校選抜大会（※地区敗退のため不出場）';
            } else {
                nextEventText = '4月1週：新年度進級 ＆ 新入部員入部';
            }

            const ihNoticeNames = (ClubState.interhighQualifiedMemberIds || [])
                .map((id) => ClubState.members.find((m) => m.id === id)?.name)
                .filter(Boolean)
                .join('・');

            bannerHtml = `
                <div class="tourney-alert pending">
                    <span class="calendar-icon">📅</span>
                    <div class="alert-body">
                        <strong>次の重要日程：${nextEventText}</strong>
                        <p>${ClubState.qualifiedForInterhigh ? `🎖️ インターハイ個人戦出場権 獲得中！${ihNoticeNames ? `（代表：${escapeHtml(ihNoticeNames)}）` : ''}` : (ClubState.qualifiedForNational ? '🎖️ 全国選抜大会出場権 獲得中！' : '日々の稽古で心技体を練磨せよ！')}</p>
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
                            <button type="button" class="btn-slot-recruit" onclick="window.KendoClub.recruitDualClubMember(${idx})">
                                🏃 他部から助っ人を勧誘
                            </button>
                        </div>
                    </div>
                `;
            }
            const cond = CONDITION_DATA[m.condition] || CONDITION_DATA.normal;
            const isIHQual = isInterhighQualified(m.id);

            return `
                <div class="club-member-card ${m.isPlayer ? 'is-player' : ''} ${isIHQual ? 'is-ih-qualified' : ''} ${m.isClubDual ? 'is-dual-club' : ''}">
                    <div class="member-card-top">
                        <div class="member-header-top-row">
                            <div class="student-photo-frame" onclick="if (window.KendoClub && window.KendoClub.showMemberHandbook) window.KendoClub.showMemberHandbook('${m.id}');" title="クリックで生徒手帳（身分証明書）を開く">
                                ${window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(m, 52, 69, { withFrame: true }) : ''}
                            </div>
                            <div class="member-header-info">
                                <div class="member-header-title-line">
                                    <span class="member-pos-badge">${pos}</span>
                                    <span class="member-name" title="${escapeHtml(m.name)}">${escapeHtml(m.name)}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
                                    <span class="member-grade-badge">${m.grade}年</span>
                                    <span class="member-cond ${cond.textClass}" title="調子: ${cond.label}">${cond.icon}</span>
                                    ${isIHQual ? '<span class="member-ih-badge" title="全国高校総体（インターハイ）個人戦 出場権獲得！">👑 IH個人出場</span>' : ''}
                                </div>
                            </div>
                        </div>
                        ${m.isClubDual ? `
                            <div class="member-dual-row">
                                <span class="member-dual-badge" title="${escapeHtml(m.originalClub)}と掛け持ちの助っ人部員">${escapeHtml(m.originalClub)}（助っ人）</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="member-card-bottom">
                        <div class="member-radar-wrap">
                            ${generateRadarChartSvg(m, 160, 135)}
                        </div>
                        <div class="member-stats-summary-row">
                            <span class="stat-summary-tag">構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '下段' : '中段'}</span>
                            <span class="stat-summary-tag">戦力: ${Math.round(getMemberCombatPower(m))}</span>
                        </div>
                        <div class="member-special-tech-row" style="margin: 4px 0 6px 0; text-align: center;">
                            ${getMemberSpecialTechBadgeHtml(m)}
                        </div>
                        <div class="member-fatigue-row">
                            <span class="fatigue-label">疲労度: ${m.fatigue}%</span>
                            <div class="fatigue-bar-wrap">
                                <div class="fatigue-bar-fill ${m.fatigue > 60 ? 'high' : ''}" style="width: ${m.fatigue}%;"></div>
                            </div>
                        </div>
                        <div class="member-mini-chara-wrap">
                            <div class="mini-chara-canvas-box">
                                <canvas class="member-mini-canvas" data-member-id="${m.id}" width="91" height="100"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // 控え部員一覧（戦力降順）
        const benchMembers = getBenchMembers();

        // 控え部員カード（右から左へ戦力順になるよう、仕切り・オーダー側（右）に戦力上位を配置）
        const benchCardsHtml = [...benchMembers].reverse().map((m) => {
            const cond = CONDITION_DATA[m.condition] || CONDITION_DATA.normal;
            const isIHQual = isInterhighQualified(m.id);
            return `
                <div class="club-member-card is-bench ${m.isPlayer ? 'is-player' : ''} ${isIHQual ? 'is-ih-qualified' : ''} ${m.isClubDual ? 'is-dual-club' : ''}">
                    <div class="member-card-top">
                        <div class="member-header-top-row">
                            <div class="student-photo-frame" onclick="if (window.KendoClub && window.KendoClub.showMemberHandbook) window.KendoClub.showMemberHandbook('${m.id}');" title="クリックで生徒手帳（身分証明書）を開く">
                                ${window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(m, 52, 69, { withFrame: true }) : ''}
                            </div>
                            <div class="member-header-info">
                                <div class="member-header-title-line">
                                    <span class="member-pos-badge bench">控え</span>
                                    <span class="member-name" title="${escapeHtml(m.name)}">${escapeHtml(m.name)}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
                                    <span class="member-grade-badge">${m.grade}年</span>
                                    <span class="member-cond ${cond.textClass}" title="調子: ${cond.label}">${cond.icon}</span>
                                    ${isIHQual ? '<span class="member-ih-badge" title="全国高校総体（インターハイ）個人戦 出場権獲得！">👑 IH個人出場</span>' : ''}
                                </div>
                            </div>
                        </div>
                        ${m.isClubDual ? `
                            <div class="member-dual-row">
                                <span class="member-dual-badge" title="${escapeHtml(m.originalClub)}と掛け持ちの助っ人部員">${escapeHtml(m.originalClub)}（助っ人）</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="member-card-bottom">
                        <div class="member-radar-wrap">
                            ${generateRadarChartSvg(m, 160, 135)}
                        </div>
                        <div class="member-stats-summary-row">
                            <span class="stat-summary-tag">構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '下段' : '中段'}</span>
                            <span class="stat-summary-tag">戦力: ${Math.round(getMemberCombatPower(m))}</span>
                        </div>
                        <div class="member-special-tech-row" style="margin: 4px 0 6px 0; text-align: center;">
                            ${getMemberSpecialTechBadgeHtml(m)}
                        </div>
                        <div class="member-fatigue-row">
                            <span class="fatigue-label">疲労度: ${m.fatigue}%</span>
                            <div class="fatigue-bar-wrap">
                                <div class="fatigue-bar-fill ${m.fatigue > 60 ? 'high' : ''}" style="width: ${m.fatigue}%;"></div>
                            </div>
                        </div>
                        <div class="member-mini-chara-wrap">
                            <div class="mini-chara-canvas-box">
                                <canvas class="member-mini-canvas" data-member-id="${m.id}" width="91" height="100"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const emptyBenchCardHtml = `
            <div class="club-member-card is-bench empty-slot">
                <div class="member-card-top">
                    <div class="member-header">
                        <span class="member-pos-badge bench">控え</span>
                        <span class="member-name text-muted">控えなし</span>
                    </div>
                    <div class="member-desc text-muted">現在、控え部員はいません（全員がオーダー出場中）。</div>
                </div>
                <div class="empty-slot-body" style="padding: 24px 8px;">
                    <span class="empty-icon">👥</span>
                    <p>控え選手なし<br><span class="empty-sub">（全員がレギュラー）</span></p>
                </div>
            </div>
        `;

        // 練習メニュー（常に未選択表示。クリック時のみ3秒間アニメーションが実行されて未選択状態に戻る）
        const practiceButtonsHtml = PRACTICE_MENUS.map((menu) => {
            return `
                <button type="button" 
                        class="btn-practice" 
                        onclick="window.KendoClub.onSelectPractice('${menu.id}')">
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

        // 保留中の新年度進級＆新入生入部歓迎セレモニーバナー
        const pendingNewSchoolYearHtml = ClubState.pendingNewSchoolYear ? `
            <div class="event-pending-banner spring-welcome-banner">
                <div class="event-pending-info">
                    <span class="event-pending-badge">🌸 新年度始動（第${ClubState.year}期 4月1週）</span>
                    <strong class="event-pending-title">新年度進級 ＆ 新入生歓迎セレモニー</strong>
                    <p class="event-pending-desc">春の陽光が差す道場に、新たな仲間たちがやってきます！</p>
                </div>
                <button type="button" class="btn-event-pending-open pulse-gold" onclick="window.KendoClub.launchNewSchoolYear()">
                    🌸 新入部員を迎える
                </button>
            </div>
        ` : '';

        // 保留中の高校生部活イベントバナー
        const pendingEventHtml = ClubState.pendingEventData ? `
            <div class="event-pending-banner">
                <div class="event-pending-info">
                    <span class="event-pending-badge">✨ 高校生部活イベント発生中！</span>
                    <strong class="event-pending-title">${escapeHtml(ClubState.pendingEventData.title)}</strong>
                    <p class="event-pending-desc">${escapeHtml(ClubState.pendingEventData.tagline || '部員たちの青春ストーリーが発生しています')}</p>
                </div>
                <button type="button" class="btn-event-pending-open" onclick="window.KendoClub.launchPendingEvent()">
                    📖 イベントを見る
                </button>
            </div>
        ` : '';

        container.innerHTML = `
            <div class="club-dashboard">
                <div class="club-sticky-header">
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
                    ${pendingNewSchoolYearHtml}
                    ${pendingEventHtml}
                </div>

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
                    <div class="section-title-left">
                        <h3>👥 出場オーダー ＆ 控え部員</h3>
                        <span class="scroll-hint-pill">👈 横スクロールで全選手を表示 👉</span>
                        <div class="order-scroll-controls">
                            <button type="button" class="btn-scroll-nav" onclick="window.KendoClub.scrollOrderList(-280)" title="左へスクロール">◀</button>
                            <button type="button" class="btn-scroll-nav" onclick="window.KendoClub.scrollOrderList(280)" title="右へスクロール">▶</button>
                        </div>
                    </div>
                    <button type="button" class="btn-edit-order" onclick="window.KendoClub.openOrderEditor()">
                        🔄 オーダー編成を変更する
                    </button>
                </div>

                <div class="club-members-grid">
                    ${benchMembers.length ? benchCardsHtml : emptyBenchCardHtml}
                    <div class="order-scroll-divider" title="ここから出場オーダー（先鋒〜大将）">
                        <span class="divider-line"></span>
                        <span class="divider-text">出場オーダー ➔</span>
                        <span class="divider-line"></span>
                    </div>
                    ${memberCardsHtml}
                </div>

                ${isTournamentWeek ? `
                    <div class="training-section-wrap tourney-week-section">
                        <div class="tourney-week-guide-card">
                            <div class="guide-header">
                                <span class="guide-badge-icon">🔥</span>
                                <h3>今週は公式大会の決戦週です！</h3>
                            </div>
                            <p class="guide-desc">大会週は通常の道場稽古を休止し、持てる力をすべて発揮して公式大会へ挑みます。<br>画面上部の出陣バナー、または下のボタンから開会式・本戦へ出陣しましょう！</p>
                            <button type="button" class="btn-tourney-direct-launch pulse-gold" onclick="window.KendoClub.startTournamentMatch()">
                                ${ClubState.month === 6 ? '⚔️ 個人予選に出陣する！（開会式へ）' : ClubState.month === 8 ? '🏆 全国高校総体に出陣する！（開会式へ）' : ClubState.month === 12 ? '⚔️ 地区予選に出陣する！（開会式へ）' : '🏆 全国高校選抜に出陣する！（開会式へ）'}
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="training-section-wrap">
                        <h3>🎋 今週の練習メニューを選択（1週進行）</h3>
                        <div class="practice-grid">
                            ${practiceButtonsHtml}
                        </div>

                        <div class="special-training-box">
                            <div class="special-header">
                                <span class="special-icon">🤝</span>
                                <strong>主将によるマンツーマン特別指導</strong>
                                ${isCaptainAutoUnlocked() ? '<span class="champion-badge" style="margin-left: auto; font-size: 0.72rem; padding: 2px 8px;">👑 主将自動化対応</span>' : ''}
                            </div>
                            <p class="special-desc">あなたが直接仲間を指名して重点指導。対象部員の全能力と技が大幅に伸びます。</p>
                            <div class="special-actions">
                                <select id="selSpecialTarget" class="sel-target-member" onchange="window.KendoClub.onChangeSpecialTarget(this.value)">
                                    ${teammateOptions || '<option value="">指導対象の部員がいません</option>'}
                                </select>
                                ${isCaptainAutoUnlocked() ? `
                                    <div class="special-btn-group">
                                        <button type="button" 
                                                class="btn-special-practice" 
                                                onclick="window.KendoClub.onSpecialPractice('manual')"
                                                title="手動操作で実戦稽古（立ち合い）を行います">
                                            ⚔️ 立ち合う
                                        </button>
                                        <button type="button" 
                                                class="btn-special-spectate pulse-btn" 
                                                onclick="window.KendoClub.onSpecialPractice('spectate')"
                                                title="主将もAIが操作し、リアルタイム試合画面で立ち合いを観戦します">
                                            👀 自動観戦
                                        </button>
                                        <button type="button" 
                                                class="btn-special-instant" 
                                                onclick="window.KendoClub.onSpecialPractice('instant')"
                                                title="試合画面をスキップし、即座にシミュレート判定して結果を反映します">
                                            ⚡ 即時判定
                                        </button>
                                    </div>
                                ` : `
                                    <button type="button" 
                                            class="btn-special-practice" 
                                            onclick="window.KendoClub.onSpecialPractice('manual')">
                                        🥋 指名して特訓開始！
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                `}

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

                <!-- スマートフォン・小型端末向け 常時固定クイック稽古ボトムバー -->
                <div id="quickSpecialOverlay" class="quick-special-overlay" style="display: none;" onclick="window.KendoClub.toggleQuickSpecialPopup(false)"></div>
                ${isTournamentWeek ? `
                    <div class="quick-practice-bottom-bar is-tournament">
                        <button type="button" class="btn-quick-tourney" onclick="window.KendoClub.startTournamentMatch()">
                            🏆 公式大会に出陣する！（開会式へ）
                        </button>
                    </div>
                ` : `
                    <div class="quick-practice-bottom-bar">
                        <div class="quick-bar-items">
                            <button type="button" class="btn-quick-practice" onclick="window.KendoClub.onSelectPractice('basics')" title="足捌き・基本稽古：敏捷・小手＋">
                                <span class="q-icon">🏃</span>
                                <span class="q-text">すり足</span>
                            </button>
                            <button type="button" class="btn-quick-practice" onclick="window.KendoClub.onSelectPractice('suburi')" title="素振り・打ち込み：腕力・面＋（小手・突き稀に＋）">
                                <span class="q-icon">⚔️</span>
                                <span class="q-text">素振り</span>
                            </button>
                            <button type="button" class="btn-quick-practice" onclick="window.KendoClub.onSelectPractice('kakari')" title="追い込み・掛かり稽古：技全般・体力＋">
                                <span class="q-icon">🔥</span>
                                <span class="q-text">掛かり</span>
                            </button>
                            <button type="button" class="btn-quick-practice" onclick="window.KendoClub.onSelectPractice('zazen')" title="座禅・見取り稽古：気魄＋・疲労微回復">
                                <span class="q-icon">🧘</span>
                                <span class="q-text">座禅</span>
                            </button>
                            <button type="button" class="btn-quick-practice is-rest" onclick="window.KendoClub.onSelectPractice('rest')" title="休養・道具手入れ：疲労大幅回復">
                                <span class="q-icon">🍵</span>
                                <span class="q-text">休養</span>
                            </button>
                            <button type="button" class="btn-quick-practice is-special" onclick="window.KendoClub.toggleQuickSpecialPopup()" title="指名特訓：部員を選んで実戦立ち合い">
                                <span class="q-icon">🤝</span>
                                <span class="q-text">特訓</span>
                            </button>
                        </div>

                        <!-- 特訓部員選択ポップアップ -->
                        <div id="quickSpecialPopup" class="quick-special-popup" style="display: none;">
                            <div class="q-popup-header">
                                <span class="q-popup-title">🤝 指名してマンツーマン特訓</span>
                                <button type="button" class="btn-q-popup-close" onclick="window.KendoClub.toggleQuickSpecialPopup(false)">✕</button>
                            </div>
                            ${isCaptainAutoUnlocked() ? `
                                <div class="q-popup-mode-bar" id="qSpecialModeBar">
                                    <button type="button" class="btn-q-mode-pill ${(!ClubState.quickSpecialMode || ClubState.quickSpecialMode === 'manual') ? 'active' : ''}" onclick="window.KendoClub.setQuickSpecialMode('manual')">⚔️ 立ち合う</button>
                                    <button type="button" class="btn-q-mode-pill ${ClubState.quickSpecialMode === 'spectate' ? 'active' : ''}" onclick="window.KendoClub.setQuickSpecialMode('spectate')">👀 自動観戦</button>
                                    <button type="button" class="btn-q-mode-pill ${ClubState.quickSpecialMode === 'instant' ? 'active' : ''}" onclick="window.KendoClub.setQuickSpecialMode('instant')">⚡ 即時判定</button>
                                </div>
                            ` : ''}
                            <p class="q-popup-desc">指導を行う部員を選択してください：</p>
                            <div class="q-popup-members-list">
                                ${teammates.length > 0 ? teammates.map((m) => {
                                    const dualStr = m.isClubDual ? ` [${m.originalClub}]` : '';
                                    const curMode = ClubState.quickSpecialMode || 'manual';
                                    const btnLabel = curMode === 'spectate' ? '観戦 👀' : curMode === 'instant' ? '即時 ⚡' : '出陣 ⚔️';
                                    return `
                                        <button type="button" class="btn-q-member-select" onclick="window.KendoClub.launchQuickSpecialPractice('${m.id}')">
                                            <div class="q-member-btn-photo">
                                                <span class="student-photo-frame">
                                                    ${window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(m, 32, 42, { withFrame: false }) : ''}
                                                </span>
                                            </div>
                                            <div class="q-mem-info">
                                                <strong class="q-mem-name">${escapeHtml(m.name)}</strong>
                                                <span class="q-mem-meta">${m.grade}年${dualStr} / 構え:${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '下段' : '中段'} / 戦力:${Math.round(getMemberCombatPower(m))}</span>
                                            </div>
                                            <span class="q-mem-btn-label">${btnLabel}</span>
                                        </button>
                                    `;
                                }).join('') : '<div class="q-empty-members">特訓可能な部員がいません</div>'}
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;

        // 部員一覧グリッドのスクロール位置を同期および非同期（レイアウト確定後）で確実に復元し、スクロールリスナーを登録
        const memberGrid = container.querySelector('.club-members-grid');
        if (memberGrid) {
            let isRestoringScroll = true;

            const applyScrollPos = () => {
                if (!memberGrid) return;
                const maxScroll = Math.max(0, memberGrid.scrollWidth - memberGrid.clientWidth);
                if (ClubState.memberGridScrollLeft === null || ClubState.memberGridScrollLeft === undefined || ClubState.memberGridScrollLeft < 0) {
                    // 初期状態（-1）は大将・出場オーダーが見える右端へスクロール
                    memberGrid.scrollLeft = memberGrid.scrollWidth;
                    ClubState.memberGridScrollLeft = memberGrid.scrollLeft;
                } else {
                    // 記憶されたスクロール位置を復元（レイアウト幅に応じた上限クランプ）
                    const targetLeft = Math.min(ClubState.memberGridScrollLeft, maxScroll > 0 ? maxScroll : ClubState.memberGridScrollLeft);
                    memberGrid.scrollLeft = targetLeft;
                }
            };

            // 1. 同期的に復元
            applyScrollPos();

            // 2. ブラウザのレイアウト・画像・カード幅の解決確定後に再適用（2重ガード）
            if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(() => {
                    applyScrollPos();
                    setTimeout(() => {
                        applyScrollPos();
                        isRestoringScroll = false;
                    }, 60);
                });
            } else {
                setTimeout(() => {
                    applyScrollPos();
                    isRestoringScroll = false;
                }, 60);
            }

            memberGrid.addEventListener('scroll', () => {
                // 復元処理中や非表示中の意図しない0リセットイベントを無視
                if (!isRestoringScroll && memberGrid.clientWidth > 0) {
                    ClubState.memberGridScrollLeft = memberGrid.scrollLeft;
                }
            }, { passive: true });
        }

        // モバイル固定ボトムバーを body 直下の #clubMobilePortal にポータル移動
        // （親要素の backdrop-filter や overflow: clip による Containing Block 化を完全に防ぎ、画面最下部に確実に固定）
        let mobilePortal = document.getElementById('clubMobilePortal');
        if (!mobilePortal) {
            mobilePortal = document.createElement('div');
            mobilePortal.id = 'clubMobilePortal';
            document.body.appendChild(mobilePortal);
        }
        mobilePortal.innerHTML = '';

        const bottomBar = container.querySelector('.quick-practice-bottom-bar');
        const overlay = container.querySelector('#quickSpecialOverlay');
        if (overlay) mobilePortal.appendChild(overlay);
        if (bottomBar) mobilePortal.appendChild(bottomBar);

        // 練習メニュー画面のスクロール位置を復元（非同期レイアウト確定と2重ガード）
        restoreDashboardScroll();
    }

    // オーダー編成画面
    function renderOrderEditor(container) {
        // 控え部員一覧（戦力順に降順ソート）
        const benchMembers = getBenchMembers();

        // 大将を一番上にする表示順 (大将: 4 -> 副将: 3 -> 中堅: 2 -> 次鋒: 1 -> 先鋒: 0)
        const orderDisplayIndices = [4, 3, 2, 1, 0];

        const orderHtml = orderDisplayIndices.map((idx) => {
            const pos = POS_NAMES[idx];
            const memberId = ClubState.order[idx];
            const m = memberId ? ClubState.members.find((item) => item.id === memberId) : null;

            // 選手選択メニュー（現在のオーダー選手＋控え部員から選べる）
            let selectOptionsHtml = '';
            if (!m) {
                selectOptionsHtml += `<option value="" selected disabled>-- 選手を選択して配置 --</option>`;
            }
            selectOptionsHtml += `<optgroup label="── 現在のオーダー ──">`;
            orderDisplayIndices.forEach((pIdx) => {
                const pName = POS_NAMES[pIdx];
                const oId = ClubState.order[pIdx];
                const oMem = oId ? ClubState.members.find((item) => item.id === oId) : null;
                if (oMem) {
                    const isSelected = m && m.id === oMem.id;
                    const ihTag = isInterhighQualified(oMem.id) ? '・👑IH出場' : '';
                    selectOptionsHtml += `<option value="${oMem.id}" ${isSelected ? 'selected' : ''}>${pName}: ${escapeHtml(oMem.name)} (${oMem.grade}年${oMem.isPlayer ? '・主将' : ''}${ihTag})</option>`;
                }
            });
            selectOptionsHtml += `</optgroup>`;

            if (benchMembers.length > 0) {
                selectOptionsHtml += `<optgroup label="── 控え部員から交代 ──">`;
                benchMembers.forEach((bMem) => {
                    const isSelected = m && m.id === bMem.id;
                    const dualStr = bMem.isClubDual ? `・${bMem.originalClub}助っ人` : '';
                    const ihTag = isInterhighQualified(bMem.id) ? '・👑IH出場' : '';
                    selectOptionsHtml += `<option value="${bMem.id}" ${isSelected ? 'selected' : ''}>控え: ${escapeHtml(bMem.name)} (${bMem.grade}年${dualStr}${ihTag})</option>`;
                });
                selectOptionsHtml += `</optgroup>`;
            }

            if (!m) {
                return `
                    <div class="order-slot-card empty-order-slot">
                        <span class="order-pos-name empty">${pos}</span>
                        <div class="order-member-info">
                            <strong class="text-muted">【欠員】選手不足</strong>
                            <span class="order-role-sub text-danger">※大会出場には選手が必要です</span>
                            ${benchMembers.length > 0 ? `
                                <div class="slot-select-wrap">
                                    <label class="slot-select-label">控えから選手を配置:</label>
                                    <select class="order-slot-select" onchange="window.KendoClub.setSlotMember(${idx}, this.value)">
                                        ${selectOptionsHtml}
                                    </select>
                                </div>
                            ` : ''}
                        </div>
                        <div class="order-empty-action">
                            <button type="button" class="btn-slot-recruit" onclick="window.KendoClub.recruitDualClubMember(${idx})">
                                🏃 他部から勧誘
                            </button>
                        </div>
                    </div>
                `;
            }

            const isSlotIH = isInterhighQualified(m.id);
            return `
                <div class="order-slot-card ${m.isPlayer ? 'is-player' : ''} ${isSlotIH ? 'is-ih-qualified' : ''} ${m.isClubDual ? 'is-dual-slot' : ''}">
                    <span class="order-pos-name">${pos}</span>
                    <div class="order-slot-photo-box">
                        <div class="student-photo-frame" onclick="if (window.KendoClub && window.KendoClub.showMemberHandbook) window.KendoClub.showMemberHandbook('${m.id}');" title="生徒手帳を見る">
                            ${window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(m, 44, 58, { withFrame: true }) : ''}
                        </div>
                    </div>
                    <div class="order-member-info">
                        <div class="order-name-row">
                            <strong>${escapeHtml(m.name)} ${m.isPlayer ? '(主将・あなた)' : ''}</strong>
                            ${isSlotIH ? '<span class="member-ih-badge" style="margin-left: 6px;">👑 IH個人出場</span>' : ''}
                            <div class="order-role-sub">
                                <span>${m.grade}年生</span>
                                ${m.isClubDual ? `<span class="member-dual-badge">${escapeHtml(m.originalClub)}（助っ人）</span>` : `<span>【${m.archetypeName || '一般剣士'}】</span>`}
                                <span>構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '下段' : '中段'}</span>
                            </div>
                        </div>
                        <div class="slot-select-wrap">
                            <label class="slot-select-label">選手を変更:</label>
                            <select class="order-slot-select" onchange="window.KendoClub.setSlotMember(${idx}, this.value)">
                                ${selectOptionsHtml}
                            </select>
                        </div>
                    </div>
                    <div class="order-radar-wrap">
                        ${generateRadarChartSvg(m, 180, 164)}
                    </div>
                    <div class="order-mini-chara-wrap">
                        <canvas class="member-mini-canvas" data-member-id="${m.id}" width="91" height="100"></canvas>
                    </div>
                    <div class="order-swap-btns">
                        <button type="button" class="btn-swap" ${idx === 4 ? 'disabled' : ''} onclick="window.KendoClub.swapOrder(${idx}, ${idx + 1})" title="上のポジションと入れ替え">⬆️</button>
                        <button type="button" class="btn-swap" ${idx === 0 ? 'disabled' : ''} onclick="window.KendoClub.swapOrder(${idx}, ${idx - 1})" title="下のポジションと入れ替え">⬇️</button>
                    </div>
                </div>
            `;
        }).join('');

        const benchCardsHtml = benchMembers.length ? benchMembers.map((b) => {
            const isBenchIH = isInterhighQualified(b.id);
            return `
                <div class="order-bench-card ${b.isPlayer ? 'is-player' : ''} ${isBenchIH ? 'is-ih-qualified' : ''} ${b.isClubDual ? 'is-dual-slot' : ''}">
                    <div class="bench-card-left">
                        <span class="order-pos-name bench">控え</span>
                        <div class="order-slot-photo-box">
                            <div class="student-photo-frame" onclick="if (window.KendoClub && window.KendoClub.showMemberHandbook) window.KendoClub.showMemberHandbook('${b.id}');" title="生徒手帳を見る">
                                ${window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(b, 44, 58, { withFrame: true }) : ''}
                            </div>
                        </div>
                        <div class="bench-member-info">
                            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                <strong>${escapeHtml(b.name)} ${b.isPlayer ? '(主将・あなた)' : ''}</strong>
                                ${isBenchIH ? '<span class="member-ih-badge">👑 IH個人出場</span>' : ''}
                            </div>
                            <div class="order-role-sub">
                                <span>${b.grade}年生</span>
                                ${b.isClubDual ? `<span class="member-dual-badge">${escapeHtml(b.originalClub)}（助っ人）</span>` : `<span>【${b.archetypeName || '一般剣士'}】</span>`}
                                <span>構え: ${b.favStance === 'jodan' ? '上段' : b.favStance === 'waki' ? '下段' : '中段'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="order-radar-wrap">
                        ${generateRadarChartSvg(b, 160, 146)}
                    </div>
                    <div class="order-mini-chara-wrap">
                        <canvas class="member-mini-canvas" data-member-id="${b.id}" width="91" height="100"></canvas>
                    </div>
                    <div class="bench-assign-actions">
                        <span class="assign-label">オーダー配置:</span>
                        <div class="assign-btn-group">
                            <button type="button" class="btn-assign-slot" onclick="window.KendoClub.setSlotMember(4, '${b.id}')">大将</button>
                            <button type="button" class="btn-assign-slot" onclick="window.KendoClub.setSlotMember(3, '${b.id}')">副将</button>
                            <button type="button" class="btn-assign-slot" onclick="window.KendoClub.setSlotMember(2, '${b.id}')">中堅</button>
                            <button type="button" class="btn-assign-slot" onclick="window.KendoClub.setSlotMember(1, '${b.id}')">次鋒</button>
                            <button type="button" class="btn-assign-slot" onclick="window.KendoClub.setSlotMember(0, '${b.id}')">先鋒</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('') : `
            <div class="no-bench-notice">
                <p>現在、控え部員はいません。部員が増えるとここに表示され、オーダーと交代できます。</p>
            </div>
        `;

        container.innerHTML = `
            <div class="order-editor-view">
                <div class="order-editor-header">
                    <h3>🔄 オーダー編成（打順の変更・控え部員の起用）</h3>
                    <p>矢印ボタンで順序の入れ替え、または選択メニューや控え一覧からポジションへ選手を配置・交代できます。</p>
                </div>

                <div class="order-section-title">
                    <h4>⚔️ 出場オーダー（先鋒〜大将）</h4>
                </div>
                <div class="order-list-wrap">
                    ${orderHtml}
                </div>

                <div class="order-bench-section">
                    <div class="order-bench-header">
                        <h4>👥 控え部員 (${benchMembers.length}名)</h4>
                        <p>ボタンを押すと、そのポジションの選手と入れ替わってオーダーに入ります。</p>
                    </div>
                    <div class="order-bench-grid">
                        ${benchCardsHtml}
                    </div>
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
        const dStats = ClubState.stats.district || { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
        const nStats = ClubState.stats.national || { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
        const ihDStats = ClubState.stats.interhighDistrict || { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
        const ihNStats = ClubState.stats.interhighNational || { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };

        const historyRows = ClubState.history.map((h) => {
            const ihDist = h.interhighDistrictResult || '不出場';
            const ihNat = h.interhighNationalResult || '不出場';
            const dist = h.districtResult || '不出場';
            const nat = h.nationalResult || '不出場';

            return `
                <tr>
                    <td>${h.year}年目</td>
                    <td>${h.captainName}</td>
                    <td class="${ihDist === '優勝' ? 'text-gold' : (ihDist === '準優勝' ? 'text-blue' : '')}">${ihDist}</td>
                    <td class="${ihNat === '優勝' ? 'text-crown' : (ihNat === '準優勝' ? 'text-gold' : '')}">${ihNat}</td>
                    <td class="${dist === '優勝' ? 'text-gold' : ''}">${dist}</td>
                    <td class="${nat === '優勝' ? 'text-crown' : ''}">${nat}</td>
                </tr>
            `;
        }).join('');

        container.innerHTML = `
            <div class="history-view">
                <div class="history-header">
                    <h2>🏆 ${ClubState.schoolName} 歴代戦績表</h2>
                    <p>${ClubState.prefecture}代表 高校剣道部の栄光の軌跡</p>
                    ${hasWonNationalChampionship() ? `
                        <div class="champion-history-badge">
                            👑 全国覇者校（🏆 特典: 主将の試合自動化 解放中）
                        </div>
                    ` : ''}
                </div>

                <div class="stats-summary-grid">
                    <div class="stat-card ih-theme">
                        <h3>🥋 総体予選(個人) 通算</h3>
                        <div class="stat-values">
                            <div><span>優勝:</span> <strong class="text-gold">${ihDStats.win}回</strong></div>
                            <div><span>準優勝:</span> <strong>${ihDStats.runnerUp}回</strong></div>
                            <div><span>ベスト4:</span> <strong>${ihDStats.best4}回</strong></div>
                            <div><span>出場回数:</span> <strong>${ihDStats.total}回</strong></div>
                        </div>
                    </div>
                    <div class="stat-card gold-border">
                        <h3>👑 総体全国(個人) 通算</h3>
                        <div class="stat-values">
                            <div><span>全国制覇:</span> <strong class="text-crown">${ihNStats.win}回</strong></div>
                            <div><span>準優勝:</span> <strong>${ihNStats.runnerUp}回</strong></div>
                            <div><span>ベスト4:</span> <strong>${ihNStats.best4}回</strong></div>
                            <div><span>全国出場:</span> <strong>${ihNStats.total}回</strong></div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <h3>🗾 選抜予選(団体) 通算</h3>
                        <div class="stat-values">
                            <div><span>優勝:</span> <strong>${dStats.win}回</strong></div>
                            <div><span>準優勝:</span> <strong>${dStats.runnerUp}回</strong></div>
                            <div><span>ベスト4:</span> <strong>${dStats.best4}回</strong></div>
                            <div><span>出場回数:</span> <strong>${dStats.total}回</strong></div>
                        </div>
                    </div>
                    <div class="stat-card gold-border">
                        <h3>🏆 全国選抜(団体) 通算</h3>
                        <div class="stat-values">
                            <div><span>全国制覇:</span> <strong class="text-crown">${nStats.win}回</strong></div>
                            <div><span>準優勝:</span> <strong>${nStats.runnerUp}回</strong></div>
                            <div><span>ベスト4:</span> <strong>${nStats.best4}回</strong></div>
                            <div><span>全国出場:</span> <strong>${nStats.total}回</strong></div>
                        </div>
                    </div>
                </div>

                <div class="history-table-wrap">
                    <h3>📜 年度別 大会成績年表</h3>
                    <table class="history-table">
                        <thead>
                            <tr>
                                <th>年度</th>
                                <th>主将</th>
                                <th>総体予選(個)</th>
                                <th>総体全国(個)</th>
                                <th>選抜予選(団)</th>
                                <th>全国選抜(団)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${historyRows.length ? historyRows : '<tr><td colspan="6">まだ公式大会の記録はありません。6月の個人予選、12月の選抜予選を目指しましょう！</td></tr>'}
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

        const canAutoCaptain = isCaptainAutoUnlocked() && ClubState.captainAutoMode;
        if (!ClubState.isAutoSpectating || !curBout || curBout.played || (curBout.isPlayerBout && !canAutoCaptain)) {
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
        const isIndividual = !!match.isIndividual;
        const curBout = boutsData.bouts[boutsData.currentBoutIndex];

        // 個人戦用ブラケットHTML
        let bracketHtml = '';
        if (isIndividual && match.bracket) {
            bracketHtml = renderTournamentBracketHtml(match.bracket, match.currentRoundIdx, curBout?.matchNodeRef?.matchId);
        }

        // コントロールボタン・プロンプト生成
        let actionControlHtml = '';
        const captainPart = isIndividual ? (match.participants || []).find((p) => p.isPlayer) : null;
        const isCaptainEliminated = isIndividual && captainPart && !captainPart.isAlive;

        if (!boutsData.isFinished && curBout) {
            if (curBout.isPlayerBout && !curBout.played) {
                const isChampion = isCaptainAutoUnlocked();
                if (isChampion) {
                    if (ClubState.isAutoSpectating && ClubState.captainAutoMode) {
                        actionControlHtml = `
                            <div class="bout-control-box auto-spectate-box champion-box">
                                <span class="bout-prompt">👑【${curBout.posName}】主将の出番（自動観戦中） — <strong id="autoSpectateCountdown">3秒後</strong>に立ち合い開始…</span>
                                <div class="sim-btn-group">
                                    <button type="button" class="btn-enter-player-bout" onclick="window.KendoClub.launchPlayerBout()">
                                        ⚔️ 自分で立ち合う
                                    </button>
                                    <button type="button" class="btn-sim-spectate pulse-btn" onclick="window.KendoClub.launchSpectateBoutImmediate()">
                                        ▶️ 今すぐ自動観戦
                                    </button>
                                    <button type="button" class="btn-sim-pause" onclick="window.KendoClub.pauseAutoSpectating()">
                                        ⏸️ 観戦を一時停止
                                    </button>
                                    <button type="button" class="btn-sim-skip" onclick="window.KendoClub.simulatePlayerBoutInstant()">
                                        ⚡ 結果を即時判定
                                    </button>
                                </div>
                            </div>
                        `;
                    } else {
                        const badgeLabel = hasWonNationalChampionship() ? '🏆 全国制覇特典' : '🏆 全国制覇特典（引継）';
                        actionControlHtml = `
                            <div class="bout-control-box highlight champion-box">
                                <div class="champion-badge-row">
                                    <span class="champion-badge">${badgeLabel}</span>
                                    <span class="bout-prompt">【${curBout.posName}】主将の出番です！立ち合い方法を選択してください</span>
                                    <button type="button" class="btn-toggle-auto ${ClubState.captainAutoMode ? 'active' : ''}" onclick="window.KendoClub.toggleCaptainAutoMode()">
                                        ${ClubState.captainAutoMode ? '⚙️ 主将自動化: ON' : '⚙️ 主将自動化: OFF'}
                                    </button>
                                </div>
                                <div class="sim-btn-group">
                                    <button type="button" class="btn-enter-player-bout highlight-gold" onclick="window.KendoClub.launchPlayerBout()">
                                        ⚔️ 自分で立ち合う
                                    </button>
                                    <button type="button" class="btn-sim-spectate pulse-btn" onclick="window.KendoClub.launchSpectateBoutImmediate()">
                                        👀 主将を自動観戦
                                    </button>
                                    <button type="button" class="btn-sim-next" onclick="window.KendoClub.simulatePlayerBoutInstant()">
                                        ⚡ 結果を即時判定
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                } else {
                    actionControlHtml = `
                        <div class="bout-control-box highlight">
                            <span class="bout-prompt">【${curBout.posName}】あなたの出番です！気迫を込めて立ち合え！</span>
                            <div class="sim-btn-group">
                                <button type="button" class="btn-enter-player-bout" onclick="window.KendoClub.launchPlayerBout()">
                                    ⚔️ 立ち合い開始
                                </button>
                                <button type="button" class="btn-sim-next" onclick="window.KendoClub.stepSimBout()">
                                    ⚡ 結果を即時判定
                                </button>
                            </div>
                        </div>
                    `;
                }
            } else if (!curBout.played) {
                // 仲間部員の試合：自動操作（観戦有無を選択可能）
                let promptMsg = `【${curBout.posName}】仲間部員【${curBout.myMember.name}】の立ち合い（自動操作）`;
                if (isCaptainEliminated) {
                    promptMsg = `⚠️ あなた（主将）は敗退しましたが、仲間部員【${curBout.myMember.name}】が勝ち残っています！立ち合いを見守りましょう。`;
                }

                if (ClubState.isAutoSpectating) {
                    actionControlHtml = `
                        <div class="bout-control-box auto-spectate-box">
                            <span class="bout-prompt">👀【${curBout.posName}】${curBout.myMember.name} vs ${curBout.enemyMember.name} — <strong id="autoSpectateCountdown">3秒後</strong>に自動で観戦を開始します…</span>
                            <div class="sim-btn-group">
                                <button type="button" class="btn-sim-spectate pulse-btn" onclick="window.KendoClub.launchSpectateBoutImmediate()">
                                    ▶️ 今すぐ観戦開始
                                </button>
                                <button type="button" class="btn-sim-pause" onclick="window.KendoClub.pauseAutoSpectating()">
                                    ⏸️ 観戦を一時停止
                                </button>
                                <button type="button" class="btn-sim-skip" onclick="window.KendoClub.stepSimBout()">
                                    ⚡ 結果を即時判定
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    actionControlHtml = `
                        <div class="bout-control-box ${isCaptainEliminated ? 'cheer-mate-box' : ''}">
                            <span class="bout-prompt">${promptMsg}</span>
                            <div class="sim-btn-group">
                                <button type="button" class="btn-sim-spectate pulse-btn" onclick="window.KendoClub.launchSpectateBout()">
                                    👀 仲間を観戦する
                                </button>
                                <button type="button" class="btn-sim-next" onclick="window.KendoClub.stepSimBout()">
                                    ⚡ 結果を即時判定
                                </button>
                            </div>
                        </div>
                    `;
                }
            }
        } else {
            actionControlHtml = `
                <div class="bout-control-box finish">
                    <span class="bout-prompt">${isIndividual ? '本回戦の全対戦が終了しました！' : '全5試合終了！試合結果を確認します。'}</span>
                    <button type="button" class="btn-finish-match" onclick="window.KendoClub.showRoundResult()">
                        🏆 勝敗結果を見る
                    </button>
                </div>
            `;
        }

        let mainContentHtml = '';
        if (isIndividual) {
            // 個人戦：現在進行中の1試合の迫力あるVS対決カード
            if (curBout) {
                const myPts = curBout.myScore.length ? curBout.myScore.join('・') : '-';
                const oppPts = curBout.enemyScore.length ? curBout.enemyScore.join('・') : '-';
                const isMyWin = curBout.winner === 'my';
                const isEnemyWin = curBout.winner === 'enemy';

                let statusBadge = '<span class="status-fighting pulse">⚔️ 立ち合い前</span>';
                if (curBout.played) {
                    if (isMyWin) statusBadge = '<span class="badge-win">○ 勝者: ' + curBout.myMember.name + '</span>';
                    else if (isEnemyWin) statusBadge = '<span class="badge-lose">× 勝者: ' + curBout.enemyMember.name + '</span>';
                    else statusBadge = '<span class="badge-draw">▲ 延長</span>';
                }

                mainContentHtml = `
                    <div class="individual-current-match-card">
                        <div class="indiv-match-header">
                            <span class="indiv-round-tag">${curBout.posName}</span>
                        </div>
                        <div class="indiv-fighters-vs-row">
                            <div class="indiv-fighter-box red">
                                <span class="corner-ribbon red">赤</span>
                                <div class="fighter-school">${ClubState.schoolName} (${ClubState.prefecture})</div>
                                <div class="fighter-main-name">${escapeHtml(curBout.myMember.name)}</div>
                                <div class="indiv-fighter-photo-wrap">
                                    <div class="student-photo-frame" onclick="if (window.KendoClub && window.KendoClub.showMemberHandbook) window.KendoClub.showMemberHandbook('${curBout.myMember.id}');" title="生徒手帳を見る">
                                        ${window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(curBout.myMember, 68, 90, { withFrame: true }) : ''}
                                    </div>
                                </div>
                                <span class="fighter-role-tag">${curBout.isPlayerBout ? '主将・あなた' : '自校代表'}</span>
                                <div class="fighter-score-display">${myPts}</div>
                            </div>
                            <div class="indiv-vs-center">
                                <span class="indiv-vs-badge">VS</span>
                                <div class="indiv-status-badge">${statusBadge}</div>
                            </div>
                            <div class="indiv-fighter-box white">
                                <span class="corner-ribbon white">白</span>
                                <div class="fighter-school">${escapeHtml(curBout.enemyMember.schoolName || curBout.schoolName || '')} (${escapeHtml(curBout.enemyMember.pref || curBout.pref || '')})</div>
                                <div class="fighter-main-name">${escapeHtml(curBout.enemyMember.name)}</div>
                                <div class="indiv-fighter-photo-wrap">
                                    <div class="student-photo-frame" title="${escapeHtml(curBout.enemyMember.name)}の生徒手帳写真">
                                        ${window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(curBout.enemyMember, 68, 90, { withFrame: true, schoolName: curBout.enemyMember.schoolName || '' }) : ''}
                                    </div>
                                </div>
                                <span class="fighter-role-tag">${escapeHtml(curBout.enemyMember.title || '個人代表')}</span>
                                <div class="fighter-score-display">${oppPts}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            // 団体戦：従来の5枠スコアボード
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

                const myPts = (bout.myScore && bout.myScore.length) ? bout.myScore.join('・') : '-';
                const oppPts = (bout.enemyScore && bout.enemyScore.length) ? bout.enemyScore.join('・') : '-';

                return `
                    <div class="match-row ${isCurrent ? 'current-bout' : ''} ${bout.played ? 'played' : ''}">
                        <span class="col-pos">${bout.posName}</span>
                        <div class="col-fighter red">
                            <span class="fighter-tag red-tag">赤</span>
                            <span class="match-row-photo">
                                <span class="student-photo-frame" onclick="if (window.KendoClub && window.KendoClub.showMemberHandbook) window.KendoClub.showMemberHandbook('${bout.myMember.id}');" title="生徒手帳を見る">
                                    ${window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(bout.myMember, 28, 37, { withFrame: false }) : ''}
                                </span>
                            </span>
                            <strong>${bout.myMember.name}</strong>
                            ${bout.isPlayerBout ? '<span class="tag-you">主将・あなた</span>' : ''}
                        </div>
                        <div class="col-pts red-pts">${myPts}</div>
                        <div class="col-vs">${statusBadge}</div>
                        <div class="col-pts white-pts">${oppPts}</div>
                        <div class="col-fighter white">
                            <strong>${bout.enemyMember.name}</strong>
                            <span class="match-row-photo">
                                <span class="student-photo-frame">
                                    ${window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(bout.enemyMember, 28, 37, { withFrame: false }) : ''}
                                </span>
                            </span>
                            <span class="fighter-tag white-tag">白</span>
                        </div>
                    </div>
                `;
            }).join('');

            mainContentHtml = `
                <div class="scoreboard-table">
                    ${rowsHtml}
                </div>
            `;
        }

        const boutLogs = boutsData.bouts
            .filter((b) => b.played && b.log.length)
            .map((b) => `<div class="bout-log-item"><strong>【${b.posName}: ${b.myMember.name} vs ${b.enemyMember.name}】</strong><br>${b.log.join('<br>')}</div>`)
            .join('');

        let tourneyClass = 'bg-district';
        if (match.type === 'national' || match.type === 'interhigh_national') {
            tourneyClass = 'bg-national';
        }

        container.innerHTML = `
            <div class="match-simulator-view ${tourneyClass} ${isIndividual ? 'individual-mode-sim' : ''}">
                <div class="match-sim-header">
                    <div class="match-round-title">${match.title} — ${boutsData.roundName}</div>
                    ${!isIndividual ? `
                        <div class="match-teams-title">
                            <span class="team-red">${ClubState.schoolName} (${ClubState.prefecture})</span>
                            <span class="vs-label">VS</span>
                            <span class="team-white">${boutsData.schoolName ? `${boutsData.schoolName} (${boutsData.pref})` : 'ライバル選手'}</span>
                        </div>
                    ` : ''}
                </div>

                ${bracketHtml}

                ${mainContentHtml}

                ${actionControlHtml}

                <div class="live-commentary-box">
                    <h4>🎙️ 立ち合い実況ログ</h4>
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
        const isIndividual = !!match.isIndividual;
        const isWin = boutsData.finalResult === 'win';
        const isLastRound = match.currentRoundIdx >= match.rounds.length - 1;

        let titleText = '';
        let descText = '';
        let nextBtnHtml = '';

        if (isIndividual) {
            // 個人戦の結果処理
            const wonInRound = (boutsData.bouts || []).filter((b) => b.winner === 'my').map((b) => b.myMember?.name || b.myFighter?.name).filter(Boolean);
            const lostInRound = (boutsData.bouts || []).filter((b) => b.winner === 'enemy').map((b) => b.myMember?.name || b.myFighter?.name).filter(Boolean);

            const aliveParts = (match.participants || []).filter((p) => p.isAlive);
            const aliveNames = (aliveParts.length > 0 ? aliveParts.map((p) => p.name) : wonInRound).join('・');
            const lostNote = lostInRound.length > 0 ? `<br><span style="font-size:0.85rem; color:#94a3b8;">（※【${lostInRound.join('・')}】は惜しくも敗退となりました）</span>` : '';

            if (isWin) {
                if (isLastRound) {
                    // 個人戦 優勝！
                    if (match.type === 'interhigh_district') {
                        titleText = `🏆 インターハイ都道県予選 完全制覇！`;
                        descText = `自校代表【${aliveNames}】が見事に予選優勝！8月1週の【全国高等学校総合体育大会（インターハイ）】個人戦への切符を掴み取りました！！${lostNote}`;
                        nextBtnHtml = `
                            <button type="button" class="btn-res-next" onclick="window.KendoClub.finishTournament('win')">
                                🎖️ 優勝を刻んで次へ進む
                            </button>
                        `;
                    } else {
                        titleText = `👑 全国制覇！！ インターハイ個人 日本一！`;
                        descText = `全国の頂点に君臨！高校剣道界の最高峰【インターハイ個人戦】において【${aliveNames}】が全国制覇の偉業を達成しました！${lostNote}`;
                        nextBtnHtml = `
                            <button type="button" class="btn-res-ending" onclick="window.KendoClub.finishTournament('win')">
                                👑 栄光を刻んで歴史を紡ぐ
                            </button>
                        `;
                    }
                } else {
                    // ラウンド突破
                    const nextRoundObj = match.rounds ? match.rounds[match.currentRoundIdx + 1] : null;
                    const nextRoundName = nextRoundObj ? nextRoundObj.roundName : '次の回戦';
                    const isSemiWin = match.type === 'interhigh_district' && match.currentRoundIdx === 2; // 準決勝勝利時（上位2名確定）

                    if (isSemiWin) {
                        titleText = `🎉 決勝進出！ 全国インターハイ切符獲得！`;
                        descText = `【${aliveNames}】が準決勝を突破し見事決勝進出！上位2名以上が確定し、8月の【インターハイ全国大会】への出場権を獲得しました！頂点を目指して決勝へ挑みます！${lostNote}`;
                    } else {
                        titleText = `${boutsData.roundName} 突破！`;
                        descText = `【${aliveNames}】が激戦を制して勝ち上がりました！次の対戦へ進出します！${lostNote}`;
                    }

                    nextBtnHtml = `
                        <button type="button" class="btn-res-next" onclick="window.KendoClub.advanceTournamentRound()">
                            ⏭️ 次の対戦へ進む（${nextRoundName}）
                        </button>
                    `;
                }
            } else {
                // 自校選手全員敗退
                const highestRank = (match.participants || []).reduce((best, p) => {
                    const r = p.achievedRank || '初戦敗退';
                    if (r === '準優勝') return '準優勝';
                    if (r === 'ベスト4' && best !== '準優勝') return 'ベスト4';
                    if ((r === 'ベスト8' || (match.type === 'interhigh_district' && r === '2回戦敗退')) && best !== '準優勝' && best !== 'ベスト4') return 'ベスト8';
                    if (r === '2回戦敗退' && best === '初戦敗退') return '2回戦敗退';
                    return best;
                }, '初戦敗退');

                titleText = `惜敗…（${boutsData.roundName}）`;
                descText = `健闘むなしく敗退となりました（最高成績：${highestRank}）。この悔しさを糧に稽古に励みましょう！`;
                nextBtnHtml = `
                    <button type="button" class="btn-res-back" onclick="window.KendoClub.finishTournament('${highestRank}')">
                        🏠 結果を受け止めて道場へ戻る
                    </button>
                `;
            }
        } else {
            // 団体戦の結果処理
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
                    // 8校トーナメント（準々決勝・準決勝・決勝）
                    if (match.currentRoundIdx === 0) rankName = 'ベスト8';
                    else if (match.currentRoundIdx === 1) rankName = 'ベスト4';
                    else if (match.currentRoundIdx === 2) rankName = '準優勝';
                } else {
                    // 全国選抜（47校トーナメント）
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
        }

        let resultClass = 'bg-district';
        if (match.type === 'national' || match.type === 'interhigh_national') {
            resultClass = 'bg-national';
        }

        const scoreSummaryHtml = isIndividual
            ? `<div class="result-score">${isWin ? '勝利・勝ち進み' : '敗退'}</div>`
            : `<div class="result-score">${boutsData.myWins} 勝 ${boutsData.enemyWins} 敗 (${boutsData.draws}分)</div>`;

        container.innerHTML = `
            <div class="match-result-view ${resultClass} ${isWin ? 'victory-view' : 'defeat-view'}">
                <div class="result-banner">
                    <span class="result-trophy">${isWin ? (isLastRound ? '👑' : '🏆') : '🍂'}</span>
                    <h2>${titleText}</h2>
                    ${scoreSummaryHtml}
                    <p class="result-submsg">${descText}</p>
                </div>
                <div class="result-actions">
                    ${nextBtnHtml}
                </div>
            </div>
        `;
    }

    // ───────────────────────────────────────────
    // 大会開会式・表彰式セレモニー設定
    // ───────────────────────────────────────────
    const CEREMONY_OPENING_DATA = {
        interhigh_district: {
            tourneyType: 'interhigh_district',
            categoryName: '個人戦',
            title: '全国高校総体（インターハイ） 都道県個人予選',
            shortTitle: 'インターハイ個人予選',
            venue: '県立武道館 メインアリーナ',
            dateText: '6月1週（夏季予選）',
            image: 'img/ceremony/opening_ih_district.png',
            tagline: '〜全国インターハイへの狭き門、一本にすべてを懸けろ！〜',
            greeting: '県内各地区の激戦を勝ち抜いた精鋭剣士16名が集結。全国高校総体への切符を掴むのは、決勝に駒を進めた僅か2名のみ。日頃の修練と己の剣信を胸に、いざ尋常に勝負！',
            pledge: '【選手宣誓】我々選手一同は、武士道精神に則り、互いの剣技を敬い、最後の一振りに至るまで正々堂々と戦い抜くことを誓います！',
            rulesNote: '16名によるトーナメント戦（1対1勝ち抜き・延長一本勝負）。上位2名が全国大会へ進出。',
        },
        interhigh_national: {
            tourneyType: 'interhigh_national',
            categoryName: '個人戦',
            title: '全国高等学校総合体育大会（インターハイ） 剣道競技',
            shortTitle: 'インターハイ全国個人選手権',
            venue: '全国総合アリーナ 特設武道場',
            dateText: '8月1週（全国本戦）',
            image: 'img/ceremony/opening_ih_national.png',
            tagline: '〜47都道府県の覇者が集う、高校剣道界の頂上決戦！〜',
            greeting: '全国各都道府県の代表剣士32名が栄光のメインアリーナに堂々入場。高校生日本一の称号を手にするのは、この過酷な勝ち抜き戦を制した唯一人のみ。全国の頂点へ、気迫を研ぎ澄ませ！',
            pledge: '【選手宣誓】我々は各都道府県の誇りと仲間の想いを胸に、高校剣道の頂を目指し、真剣勝負を繰り広げることをここに誓います！',
            rulesNote: '全国32名によるトーナメント戦。勝者のみが次の回戦へ進出し、全国制覇（日本一）を競います。',
        },
        district: {
            tourneyType: 'district',
            categoryName: '団体戦',
            title: '全国高校選抜剣道大会 都道県予選（団体戦）',
            shortTitle: '選抜地区予選 団体戦',
            venue: '県民体育館 第一武道場',
            dateText: '12月3週（冬季予選）',
            image: 'img/ceremony/opening_team_district.png',
            tagline: '〜紡いできた絆を力に変え、部員全員で全国の切符を掴み取れ！〜',
            greeting: '新チームとなって挑む初の公式タイトル。先鋒から大将まで5人の心が一つになって初めて勝利の扉が開く。春の全国選抜大会に出場できるのは、本大会を制した優勝校のみ！',
            pledge: '【選手宣誓】我々一同は、日頃支えてくれた指導者・仲間への感謝を胸に、一戦一戦を全力で戦い、母校の名を掲げて正々堂々挑むことを誓います！',
            rulesNote: '5人制団体戦トーナメント（先鋒・次鋒・中堅・副将・大将）。優勝校のみが春の全国選抜大会へ進出。',
        },
        national: {
            tourneyType: 'national',
            categoryName: '団体戦',
            title: '全国高等学校剣道選抜大会（団体戦・春の全国大会）',
            shortTitle: '全国高校選抜大会',
            venue: '日本武道館（特設アリーナ）',
            dateText: '3月4週（春の全国選抜）',
            image: 'img/ceremony/opening_team_national.png',
            tagline: '〜聖地・日本武道館に集いし全国47校、世代の頂点を懸けた総力戦！〜',
            greeting: '全国47都道府県の予選を制した各校の代表チームが武道館の大舞台に集結。前回優勝旗の返還、厳かな君が代斉唱を経て、今、高校日本一を懸けた運命の戦いが幕を開ける！',
            pledge: '【選手宣誓】日本武道館の神聖なる道場に立ち、全国の剣友と競い合える栄誉に感謝し、一意専心の心で全力を尽くすことを誓います！',
            rulesNote: '全国各都道府県代表によるトーナメント戦。5人の総力戦で全国制覇の頂点を目指します。',
        },
    };

    function prepareCeremonyResultData(match, rankLabel, growthResults = []) {
        const type = match.type;
        const isWin = rankLabel === '優勝' || rankLabel === 'win';
        const isRunnerUp = rankLabel === '準優勝';
        const isBest4 = rankLabel === 'ベスト4';
        const isBest8 = rankLabel === 'ベスト8' || (type === 'interhigh_district' && rankLabel === '2回戦敗退');

        let rankKey = 'loss';
        if (isWin) rankKey = 'win';
        else if (isRunnerUp) rankKey = 'runnerup';
        else if (isBest4) rankKey = 'best4';
        else if (isBest8) rankKey = 'best8';

        const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
        const capName = captain ? captain.name : '主将';
        const schoolName = ClubState.schoolName;

        const RANK_ORDER = {
            '優勝': 100,
            'win': 100,
            '準優勝': 80,
            'ベスト4': 60,
            'ベスト8': 40,
            '2回戦敗退': 20,
            '初戦敗退': 10,
        };

        let recipientName = '剣道部 殿';
        let topFighterName = capName;

        if (match.isIndividual) {
            // 個人戦：出場した自校選手の中で最も上位の成績を収めた選手を特定
            const participants = match.participants || [];
            let bestScore = -1;
            let topPart = null;

            participants.forEach((p) => {
                let pRank = p.achievedRank || rankLabel;
                if (isWin && p.isAlive) {
                    pRank = '優勝';
                }
                const score = RANK_ORDER[pRank] || 0;
                // より上位の選手を優先。同順位の場合は主将を優先
                if (score > bestScore || (score === bestScore && p.isPlayer)) {
                    bestScore = score;
                    topPart = p;
                }
            });

            if (topPart) {
                topFighterName = topPart.name;
                recipientName = topPart.isPlayer ? `主将 ${topPart.name} 殿` : `${topPart.name} 殿`;
            } else {
                recipientName = `主将 ${capName} 殿`;
            }
        } else {
            recipientName = '剣道部 殿';
        }

        let tourneyName = '高校剣道選手権';
        let categoryName = match.isIndividual ? '個人戦' : '団体戦';
        let imageName = '';
        let badgeText = '';
        let badgeClass = '';
        let diplomaRank = rankLabel;
        let diplomaText = '';
        let honorTitle = '';
        let qualBannerHtml = '';

        if (type === 'interhigh_district') {
            tourneyName = '全国高校総体（インターハイ） 都道県個人予選';
            if (isWin) {
                imageName = 'img/ceremony/ih_district_win.png';
                badgeText = '🏆 予選優勝（金メダル・全国出場決定）';
                badgeClass = 'badge-gold';
                diplomaRank = '第一位（優勝）';
                honorTitle = `【${ClubState.prefecture} 個人王者】`;
                diplomaText = `貴殿は頭書の大会において、終始気魄に満ちた鋭き打突を重ね、並み居る強豪を悉く制して見事優勝の栄冠を勝ち取りました。よってその至高の剣技と敢闘の精神を讃え、ここに賞します。`;
                qualBannerHtml = `<div class="ceremony-qual-pill gold">✈️ 8月1週【全国高等学校総合体育大会（インターハイ）個人戦】出場権獲得！</div>`;
            } else if (isRunnerUp) {
                imageName = 'img/ceremony/ih_district_runnerup.png';
                badgeText = '🥈 準優勝（銀メダル・全国出場決定）';
                badgeClass = 'badge-silver';
                diplomaRank = '第二位（準優勝）';
                honorTitle = `【${ClubState.prefecture} 準優勝】`;
                diplomaText = `貴殿は頭書の大会において、日頃の精進の成果を遺憾なく発揮し、決勝戦まで堂々と勝ち上がり頭書の優秀な成績を収めました。よってその栄誉を讃え、これを賞します。`;
                qualBannerHtml = `<div class="ceremony-qual-pill silver">✈️ 8月1週【全国高等学校総合体育大会（インターハイ）個人戦】出場権獲得！</div>`;
            } else if (isBest4) {
                imageName = 'img/ceremony/ih_district_best4.png';
                badgeText = '🥉 第三位（銅メダル・県4強）';
                badgeClass = 'badge-bronze';
                diplomaRank = '第三位';
                honorTitle = `【${ClubState.prefecture} ベスト4】`;
                diplomaText = `貴殿は頭書の大会において、正々堂々たる気迫で激闘を制し、県勢屈指の優秀なる成績を収めました。よってその健闘を讃え、これを賞します。`;
            } else if (isBest8) {
                imageName = 'img/ceremony/ih_district_best8.png';
                badgeText = '🎖️ 敢闘賞（県ベスト8入賞）';
                badgeClass = 'badge-emerald';
                diplomaRank = '第五位（ベスト8）';
                honorTitle = `【${ClubState.prefecture} ベスト8】`;
                diplomaText = `貴殿は頭書の大会において、熱戦を繰り広げ頭書の優秀な成績を収めました。よってこれを賞します。`;
            } else {
                imageName = 'img/ceremony/ceremony_loss.png';
                badgeText = '⚔️ 敢闘（予選敗退）';
                badgeClass = 'badge-slate';
                diplomaRank = '敢闘賞';
                honorTitle = `【予選敢闘】`;
                diplomaText = `頭書の大会における真摯な挑戦と、最後まで諦めず戦い抜いた健闘の精神を讃えます。次なる飛躍を期待します。`;
            }

        } else if (type === 'interhigh_national') {
            tourneyName = '全国高等学校総合体育大会（インターハイ） 個人戦';
            if (isWin) {
                imageName = 'img/ceremony/ih_national_win.png';
                badgeText = '👑 高校日本一（金メダル・文部科学大臣杯）';
                badgeClass = 'badge-champion';
                diplomaRank = '全国制覇 第一位（日本一）';
                honorTitle = '【高校総体 個人全国制覇・日本一】';
                diplomaText = `貴殿は全国47都道府県の覇者が集う頂上決戦において、極限の集中と神妙なる太刀筋で全国の強豪を圧倒し、栄えある全国制覇の偉業を達成いたしました。高校剣道界の頂点に立ったその功績を永久に讃え、ここに証します。`;
            } else if (isRunnerUp) {
                imageName = 'img/ceremony/ih_national_runnerup.png';
                badgeText = '🥈 全国準優勝（銀メダル・全国2位）';
                badgeClass = 'badge-silver';
                diplomaRank = '全国 第二位（準優勝）';
                honorTitle = '【全国高校総体 個人準優勝】';
                diplomaText = `貴殿は全国高等学校総合体育大会において、全国屈指の強豪を次々と撃破し、決勝の檜舞台において死力を尽くし堂々たる成績を収めました。その不屈の武徳を讃え、ここに賞します。`;
            } else if (isBest4) {
                imageName = 'img/ceremony/ih_national_best4.png';
                badgeText = '🥉 全国第三位（銅メダル・全国4強）';
                badgeClass = 'badge-bronze';
                diplomaRank = '全国 第三位';
                honorTitle = '【全国インターハイ 個人ベスト4】';
                diplomaText = `貴殿は全国の代表が集う最高峰の舞台において、卓越した剣技と精神力を発揮し頭書の優秀な成績を収めました。よってその栄誉を讃えます。`;
            } else if (isBest8) {
                imageName = 'img/ceremony/ih_national_best8.png';
                badgeText = '🎖️ 全国ベスト8（全国8強入賞盾）';
                badgeClass = 'badge-emerald';
                diplomaRank = '全国 第五位（ベスト8）';
                honorTitle = '【全国インターハイ 個人ベスト8】';
                diplomaText = `貴殿は全国高校総体において、全国の強豪を制し見事全国ベスト8の栄冠に輝きました。よってこれを讃えます。`;
            } else {
                imageName = 'img/ceremony/ceremony_loss.png';
                badgeText = '⚔️ 全国出場記念（全国大会奮戦）';
                badgeClass = 'badge-slate';
                diplomaRank = '全国大会出場';
                honorTitle = '【全国インターハイ 出場】';
                diplomaText = `全国の強豪が集うインターハイの大舞台に挑み、誇り高き戦いを演じたことを讃えます。`;
            }

        } else if (type === 'district') {
            tourneyName = '全国高校選抜剣道大会 都道県予選（団体戦）';
            if (isWin) {
                imageName = 'img/ceremony/team_district_win.png';
                badgeText = '🏆 予選優勝（優勝旗・全国選抜出場決定）';
                badgeClass = 'badge-gold';
                diplomaRank = '団体 第一位（優勝）';
                honorTitle = `【${ClubState.prefecture} 団体王者】`;
                diplomaText = `貴校剣道部は頭書の大会において、部員一同心を一つにして戦い、全勝の快進撃をもって見事地区予選優勝の栄冠を掴み取りました。よってここに表彰し、その栄光を讃えます。`;
                qualBannerHtml = `<div class="ceremony-qual-pill gold">🌸 3月4週【全国高等学校剣道選抜大会（日本武道館）】出場権獲得！</div>`;
            } else if (isRunnerUp) {
                imageName = 'img/ceremony/team_district_runnerup.png';
                badgeText = '🥈 団体準優勝（準優勝盾・県2位）';
                badgeClass = 'badge-silver';
                diplomaRank = '団体 第二位（準優勝）';
                honorTitle = `【${ClubState.prefecture} 団体準優勝】`;
                diplomaText = `貴校剣道部は頭書の大会において、固い結束と磨き抜かれたチームワークを発揮し、決勝戦まで進出する優秀な成績を収めました。よってこれを賞します。`;
            } else if (isBest4) {
                imageName = 'img/ceremony/team_district_best4.png';
                badgeText = '🥉 団体第三位（県ベスト4）';
                badgeClass = 'badge-bronze';
                diplomaRank = '団体 第三位';
                honorTitle = `【${ClubState.prefecture} 団体ベスト4】`;
                diplomaText = `貴校剣道部は頭書の大会において、互いに助け合い熱戦を制して頭書の成績を収めました。よってこれを賞します。`;
            } else if (isBest8) {
                imageName = 'img/ceremony/team_district_best8.png';
                badgeText = '🎖️ 団体ベスト8（県8強入賞）';
                badgeClass = 'badge-emerald';
                diplomaRank = '団体 第五位（ベスト8）';
                honorTitle = `【${ClubState.prefecture} 団体ベスト8】`;
                diplomaText = `貴校剣道部は頭書の大会において、一致団結して健闘し頭書の成績を収めました。よってこれを賞します。`;
            } else {
                imageName = 'img/ceremony/ceremony_loss.png';
                badgeText = '⚔️ 団体敢闘（予選敗退）';
                badgeClass = 'badge-slate';
                diplomaRank = '団体敢闘賞';
                honorTitle = `【団体予選 敢闘】`;
                diplomaText = `仲間と共に戦い抜いた絆と汗は、必ず次の勝利への糧となる。さらなる精進を期待します。`;
            }

        } else {
            tourneyName = '全国高等学校剣道選抜大会（団体戦）';
            if (isWin) {
                imageName = 'img/ceremony/team_national_win.png';
                badgeText = '👑 全国制覇 日本一（大優勝旗・金メダル）';
                badgeClass = 'badge-champion';
                diplomaRank = '全国制覇 第一位（団体日本一）';
                honorTitle = '【全国選抜大会 完全制覇 日本一】';
                diplomaText = `貴校剣道部は日本武道館において開催された全国大会において、強固な団結力と至高の気迫をもって47都道府県の頂点に立ち、全国制覇の金字塔を打ち立てました。高校剣道界の最高峰に輝いたその偉業を永久に讃え、ここに表彰します。`;
            } else if (isRunnerUp) {
                imageName = 'img/ceremony/team_national_runnerup.png';
                badgeText = '🥈 全国準優勝（銀メダル・全国2位）';
                badgeClass = 'badge-silver';
                diplomaRank = '全国 第二位（団体準優勝）';
                honorTitle = '【全国高校選抜 団体準優勝】';
                diplomaText = `貴校剣道部は日本武道館の決勝戦において、全力を出し尽くした激闘を演じ、堂々たる全国準優勝の栄誉を勝ち取りました。その不滅の闘志と団結を称え、これを賞します。`;
            } else if (isBest4) {
                imageName = 'img/ceremony/team_national_best4.png';
                badgeText = '🥉 全国第三位（銅メダル・全国4強）';
                badgeClass = 'badge-bronze';
                diplomaRank = '全国 第三位';
                honorTitle = '【全国選抜 団体ベスト4】';
                diplomaText = `貴校剣道部は全国の精鋭が集う武道館の大舞台において、卓越した技量と絆で勝ち上がり、頭書の輝かしい成績を収めました。よってこれを賞します。`;
            } else if (isBest8) {
                imageName = 'img/ceremony/team_national_best8.png';
                badgeText = '🎖️ 全国ベスト8（全国8強入賞）';
                badgeClass = 'badge-emerald';
                diplomaRank = '全国 第五位（ベスト8）';
                honorTitle = '【全国選抜 団体ベスト8】';
                diplomaText = `貴校剣道部は全国大会において、全国の強豪と渡り合い堂々たる8強入りを果たしました。よってこれを讃えます。`;
            } else {
                imageName = 'img/ceremony/ceremony_loss.png';
                badgeText = '⚔️ 全国大会出場記念（全国奮戦）';
                badgeClass = 'badge-slate';
                diplomaRank = '全国選抜出場';
                honorTitle = '【全国選抜大会 出場】';
                diplomaText = `全国の舞台で戦い抜いた誇りを胸に、次なる世代へと絆を紡げ！`;
            }
        }

        const growthListHtml = (growthResults && growthResults.length > 0) ? `
            <div class="ceremony-growth-box">
                <div class="growth-box-title">🎖️【大会戦績による心技体の成長】</div>
                <div class="growth-list">
                    ${growthResults.map((r) => `
                        <div class="growth-item">
                            <div class="growth-item-header">
                                <span class="growth-member-name">${escapeHtml(r.name)}</span>
                                <span class="growth-rank-pill">${escapeHtml(r.rankLabel)}</span>
                            </div>
                            <div class="growth-gains-text">${escapeHtml(r.gains.length ? r.gains.join(' / ') : '現状維持')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return {
            tourneyType: type,
            tourneyName: tourneyName,
            categoryName: categoryName,
            rankLabel: rankLabel,
            rankKey: rankKey,
            schoolName: schoolName,
            capName: capName,
            year: ClubState.year,
            image: imageName,
            badgeText: badgeText,
            badgeClass: badgeClass,
            diplomaRank: diplomaRank,
            diplomaText: diplomaText,
            honorTitle: honorTitle,
            qualBannerHtml: qualBannerHtml,
            recipientName: recipientName,
            topFighterName: topFighterName,
            growthResults: growthResults,
            growthListHtml: growthListHtml,
        };
    }

    // 開会式セレモニーHTML描画
    function renderTournamentOpening(container) {
        const type = ClubState.openingTournamentType || 'district';
        const data = CEREMONY_OPENING_DATA[type] || CEREMONY_OPENING_DATA.district;

        container.innerHTML = `
            <div class="ceremony-container ceremony-opening-view">
                <div class="ceremony-opening-banner">
                    <span class="ceremony-season-pill">第${ClubState.year}期 ${data.dateText}</span>
                    <h1 class="ceremony-main-title">${escapeHtml(data.title)}</h1>
                    <div class="ceremony-venue-tag">📍 会場：${escapeHtml(data.venue)} ｜ ${data.categoryName}</div>
                </div>

                <div class="ceremony-card">
                    <div class="ceremony-art-wrap">
                        <img class="ceremony-art-img" src="${data.image}" alt="${escapeHtml(data.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ceremony-art-fallback" style="display:none;">
                            <span class="art-fallback-icon">🥋</span>
                            <span class="art-fallback-title">${escapeHtml(data.title)} 開会式</span>
                        </div>
                        <div class="ceremony-tagline-overlay">${escapeHtml(data.tagline)}</div>
                    </div>

                    <div class="ceremony-scroll-body">
                        <div class="ceremony-speech-box">
                            <div class="speech-header">📜 【開会の辞・式典の言葉】</div>
                            <p class="speech-content">${escapeHtml(data.greeting)}</p>
                        </div>

                        <div class="ceremony-pledge-box">
                            <div class="pledge-quote">${escapeHtml(data.pledge)}</div>
                        </div>

                        <div class="ceremony-info-grid">
                            <div class="info-item">
                                <span class="info-label">出場校</span>
                                <span class="info-val">${escapeHtml(ClubState.schoolName)} (${ClubState.prefecture})</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">試合形式</span>
                                <span class="info-val">${escapeHtml(data.rulesNote)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ceremony-actions">
                        <button type="button" class="btn-ceremony-launch pulse-gold" onclick="window.KendoClub.proceedFromOpeningToMatch()">
                            ⚔️ いざ、出陣！（大会へ進む）
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 表彰式・閉会式セレモニーHTML描画
    function renderTournamentCeremony(container) {
        const data = ClubState.ceremonyResultData;
        if (!data) {
            ClubState.viewPhase = 'dashboard';
            renderClubUI();
            return;
        }

        container.innerHTML = `
            <div class="ceremony-container ceremony-closing-view ceremony-${data.rankKey}">
                <div class="ceremony-closing-banner">
                    <span class="ceremony-season-pill">第${data.year}期 大会閉幕・表彰式</span>
                    <h1 class="ceremony-main-title">${escapeHtml(data.tourneyName)}</h1>
                    <div class="ceremony-rank-badge ${data.badgeClass}">${data.badgeText}</div>
                </div>

                ${data.qualBannerHtml ? `<div class="ceremony-qual-wrap">${data.qualBannerHtml}</div>` : ''}

                <div class="ceremony-card">
                    <div class="ceremony-art-wrap">
                        <img class="ceremony-art-img" src="${data.image}" alt="${escapeHtml(data.honorTitle)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ceremony-art-fallback" style="display:none;">
                            <span class="art-fallback-icon">${data.rankKey === 'win' ? '👑' : '🏆'}</span>
                            <span class="art-fallback-title">${escapeHtml(data.honorTitle)}</span>
                        </div>
                        <div class="ceremony-rank-title-overlay">${escapeHtml(data.honorTitle)}</div>
                    </div>

                    <div class="ceremony-diploma-card">
                        <div class="diploma-border">
                            <div class="diploma-header">
                                <span class="diploma-seal">💮</span>
                                <h2 class="diploma-heading">表　彰　状</h2>
                                <div class="diploma-rank">${escapeHtml(data.diplomaRank)}</div>
                            </div>
                            <div class="diploma-recipient">
                                <span class="recipient-school">${escapeHtml(data.schoolName)}</span>
                                <span class="recipient-name">${escapeHtml(data.recipientName || (data.categoryName === '個人戦' ? `主将 ${data.capName} 殿` : '剣道部 殿'))}</span>
                            </div>
                            <div class="diploma-body">
                                <p>${escapeHtml(data.diplomaText)}</p>
                            </div>
                            <div class="diploma-footer">
                                <span class="diploma-date">第${data.year}期 高校剣道連盟</span>
                                <span class="diploma-stamp">大会会長之印</span>
                            </div>
                        </div>
                    </div>

                    ${data.growthListHtml || ''}

                    <div class="ceremony-actions">
                        <button type="button" class="btn-ceremony-return" onclick="window.KendoClub.proceedFromCeremonyToDashboard()">
                            🏠 栄誉を胸に道場へ戻る
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ───────────────────────────────────────────
    // 4月1週：新1年生入部・歓迎セレモニー画面
    // ───────────────────────────────────────────
    function renderFreshmanWelcome(container) {
        const data = ClubState.freshmanWelcomeData;
        const recruitMembers = (data && data.recruitMembers) || [];
        const count = recruitMembers.length;
        const year = (data && data.year) || ClubState.year;

        const cardsHtml = recruitMembers.map((m) => {
            return `
                <div class="freshman-recruit-card">
                    <div class="freshman-card-header">
                        <span class="freshman-name">${escapeHtml(m.name)}</span>
                        <span class="freshman-grade-badge">新1年</span>
                        <span class="freshman-archetype-badge">【${escapeHtml(m.archetypeName || '一般')}】</span>
                    </div>
                    <div class="freshman-card-desc">${escapeHtml(m.desc || '')}</div>
                    <div class="freshman-stats-row">
                        <span class="stat-pill">構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '下段' : '中段'}</span>
                        <span class="stat-pill">戦力: ${Math.round(getMemberCombatPower(m))}</span>
                        <span class="stat-pill">体力: ${m.maxHealth}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="ceremony-container ceremony-welcome-view">
                <div class="ceremony-opening-banner ceremony-spring-banner">
                    <span class="ceremony-season-pill">🌸 第${year}期 4月1週（新年度始動）</span>
                    <h1 class="ceremony-main-title">🌸 新1年生入部・歓迎セレモニー</h1>
                    <div class="ceremony-venue-tag">📍 ${escapeHtml(ClubState.schoolName)} 剣道場 ｜ 新たな仲間 ${count}名 入部</div>
                </div>

                <div class="ceremony-card">
                    <div class="ceremony-art-wrap">
                        <img class="ceremony-art-img" src="img/ceremony/freshman_welcome.png" alt="新1年生入部・初めての稽古" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ceremony-art-fallback" style="display:none;">
                            <span class="art-fallback-icon">🌸</span>
                            <span class="art-fallback-title">新1年生入部・初めての稽古</span>
                        </div>
                        <div class="ceremony-tagline-overlay">〜春の光射す道場、竹刀の音とともに新たな歴史が幕を開ける〜</div>
                    </div>

                    <div class="ceremony-scroll-body">
                        <div class="ceremony-speech-box">
                            <div class="speech-header">📜 【主将・部員一同より歓迎の辞】</div>
                            <p class="speech-content">
                                新入生の皆さん、${escapeHtml(ClubState.schoolName)}剣道部へようこそ！<br>
                                今日から皆さんは苦楽を共にするかけがえのない仲間です。<br>
                                礼節を重んじ、日々の厳しい稽古を共に乗り越え、目指すは悲願の全国制覇！全員で頂点を掴み取りましょう！
                            </p>
                        </div>

                        <div class="freshman-list-section">
                            <div class="freshman-list-title">🥋 【入部した新1年生（計${count}名）】</div>
                            <div class="freshman-cards-grid">
                                ${cardsHtml}
                            </div>
                        </div>

                        <div class="ceremony-actions">
                            <button type="button" class="btn-ceremony-launch pulse-gold" onclick="window.KendoClub.proceedFromFreshmanWelcomeToDashboard()">
                                🥋 稽古を開始する（道場へ進む）
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function proceedFromFreshmanWelcomeToDashboard() {
        ClubState.freshmanWelcomeData = null;
        ClubState.viewPhase = 'dashboard';
        saveClubData();
        renderClubUI();
    }

    // ───────────────────────────────────────────
    // 9月1週：3年生引退式セレモニー画面
    // ───────────────────────────────────────────
    function renderRetireCeremony(container) {
        const data = ClubState.retireCeremonyData;
        const retiredMembers = (data && data.retiredMembers) || [];
        const year = (data && data.year) || ClubState.year;
        const isCaptainRetiring = data && data.isCaptainRetiring !== undefined
            ? data.isCaptainRetiring
            : (retiredMembers.some((m) => m.isPlayer || m.wasPlayer) || !ClubState.members.some((m) => m.isPlayer && m.grade < 3));

        const seasonPillText = isCaptainRetiring
            ? `🍂 第${year}期 9月1週（世代交代）`
            : `🍂 第${year}期 9月1週（3年生勇退・主将続投）`;

        const cardsHtml = retiredMembers.map((m) => {
            return `
                <div class="retired-senior-card">
                    <div class="retired-card-header">
                        <span class="retired-name">${escapeHtml(m.name)}</span>
                        <span class="retired-grade-badge">3年・勇退</span>
                        <span class="retired-pos-badge">${m.isPlayer ? '前主将' : '先輩'}</span>
                    </div>
                    <div class="retired-card-desc">${escapeHtml(m.desc || '')}</div>
                    <div class="retired-stats-row">
                        <span class="stat-pill">戦力: ${Math.round(getMemberCombatPower(m))}</span>
                        <span class="stat-pill">得意: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '下段' : '中段'}</span>
                    </div>
                </div>
            `;
        }).join('');

        let actionsHtml = '';
        if (isCaptainRetiring) {
            actionsHtml = `
                <div class="ceremony-actions retire-actions-split">
                    <button type="button" class="btn-ceremony-launch pulse-gold" onclick="window.KendoClub.proceedFromRetireCeremonyToCaptainSelect()">
                        👑 次期主将を指名してゲームを続ける（次世代へ）
                    </button>
                    <button type="button" class="btn-ceremony-end" onclick="window.KendoClub.showClubEnding()">
                        🎓 主将引退・ゲーム終了（集大成の記録を見る）
                    </button>
                </div>
            `;
        } else {
            const captain = ClubState.members.find((m) => m.isPlayer);
            const capGrade = captain ? `${captain.grade}年` : '2年';
            actionsHtml = `
                <div class="ceremony-actions">
                    <button type="button" class="btn-ceremony-launch pulse-gold" onclick="window.KendoClub.proceedFromRetireCeremonyToDashboard()">
                        🥋 先輩の想いを受け継ぎ、稽古を再開する（主将続投・${capGrade}）
                    </button>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="ceremony-container ceremony-retire-view">
                <div class="ceremony-closing-banner ceremony-autumn-banner">
                    <span class="ceremony-season-pill">${seasonPillText}</span>
                    <h1 class="ceremony-main-title">🍂 3年生引退式・感謝の集い</h1>
                    <div class="ceremony-venue-tag">📍 ${escapeHtml(ClubState.schoolName)} 剣道場 ｜ 3年生 ${retiredMembers.length}名 勇退</div>
                </div>

                <div class="ceremony-card">
                    <div class="ceremony-art-wrap">
                        <img class="ceremony-art-img" src="img/ceremony/senior_retire.png" alt="3年生引退式" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ceremony-art-fallback" style="display:none;">
                            <span class="art-fallback-icon">🍂</span>
                            <span class="art-fallback-title">3年生引退式</span>
                        </div>
                        <div class="ceremony-tagline-overlay">〜激闘を終えし先輩たちの汗と涙、その志を次の世代へ〜</div>
                    </div>

                    <div class="ceremony-scroll-body">
                        <div class="ceremony-speech-box">
                            <div class="speech-header">📜 【3年生 先輩たちより引退の言葉】</div>
                            <p class="speech-content">
                                これまで厳しい稽古を共に耐え抜いてくれて、本当にありがとう。<br>
                                夏の大会を全力で戦い終え、悔いなく竹刀を置くことができます。<br>
                                私たちの悲願であった全国制覇の夢は、頼もしい後輩である君たちに託します。胸を張って前へ進んでください！
                            </p>
                        </div>

                        <div class="retired-list-section">
                            <div class="retired-list-title">🎖️ 【勇退する3年生先輩たち】</div>
                            <div class="retired-cards-grid">
                                ${cardsHtml}
                            </div>
                        </div>

                        ${actionsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    function proceedFromRetireCeremonyToDashboard() {
        ClubState.retireCeremonyData = null;
        ClubState.viewPhase = 'dashboard';
        saveClubData();
        renderClubUI();
    }

    function proceedFromRetireCeremonyToCaptainSelect() {
        const captain = ClubState.members.find((m) => m.isPlayer);
        if (captain && captain.grade < 3) {
            // 主将が2年生以下の場合は主将選択・新体制セレモニーをスキップして直接ダッシュボードへ復帰
            proceedFromRetireCeremonyToDashboard();
            return;
        }
        ClubState.retireCeremonyData = null;
        ClubState.viewPhase = 'captain_select';
        saveClubData();
        renderClubUI();
    }

    // ───────────────────────────────────────────
    // 9月1週：新主将就任・新体制始動セレモニー画面
    // ───────────────────────────────────────────
    function renderNewTeamCeremony(container) {
        const data = ClubState.newTeamCeremonyData;
        const newCap = (data && data.newCaptain) || ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
        const activeMembers = (data && data.activeMembers) || ClubState.members;
        const year = (data && data.year) || ClubState.year;

        const countGrade2 = activeMembers.filter((m) => m.grade === 2).length;
        const countGrade1 = activeMembers.filter((m) => m.grade === 1).length;

        container.innerHTML = `
            <div class="ceremony-container ceremony-newteam-view">
                <div class="ceremony-opening-banner ceremony-gold-banner">
                    <span class="ceremony-season-pill">👑 第${year}期 9月1週（新体制発足）</span>
                    <h1 class="ceremony-main-title">👑 新体制始動！新チーム結団式</h1>
                    <div class="ceremony-venue-tag">📍 ${escapeHtml(ClubState.schoolName)} 剣道場 ｜ 新主将：${escapeHtml(newCap ? newCap.name : 'あなた')}（新2年）</div>
                </div>

                <div class="ceremony-card">
                    <div class="ceremony-art-wrap">
                        <img class="ceremony-art-img" src="img/ceremony/new_team_start.png" alt="新体制始動" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ceremony-art-fallback" style="display:none;">
                            <span class="art-fallback-icon">👑</span>
                            <span class="art-fallback-title">新体制始動</span>
                        </div>
                        <div class="ceremony-tagline-overlay">〜新主将を筆頭に結集せし剣心、悲願の全国制覇へいざ出陣！〜</div>
                    </div>

                    <div class="ceremony-scroll-body">
                        <div class="ceremony-speech-box">
                            <div class="speech-header">📜 【新主将 就任宣言】</div>
                            <p class="speech-content">
                                「この度、${escapeHtml(ClubState.schoolName)}剣道部の新主将を拝命した【${escapeHtml(newCap ? newCap.name : 'あなた')}】です。<br>
                                引退された先輩方の想いを受け継ぎ、全員で支え合い、必ずや秋・冬の地区予選、そして春の全国選抜を勝ち抜いて全国の頂点を掴み取ります！全員、気合を入れていくぞ！」
                            </p>
                        </div>

                        <div class="newteam-meta-box">
                            <div class="newteam-meta-title">⚔️ 【新体制 チーム編成】</div>
                            <div class="newteam-meta-grid">
                                <div class="meta-item">
                                    <span class="meta-label">新主将</span>
                                    <span class="meta-val">👑 ${escapeHtml(newCap ? newCap.name : 'あなた')} (2年)</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">部員数</span>
                                    <span class="meta-val">全${activeMembers.length}名（2年生: ${countGrade2}名 / 1年生: ${countGrade1}名）</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">チーム目標</span>
                                    <span class="meta-val">🏆 地区予選突破・全国選抜制覇！</span>
                                </div>
                            </div>
                        </div>

                        <div class="ceremony-actions">
                            <button type="button" class="btn-ceremony-launch pulse-gold" onclick="window.KendoClub.proceedFromNewTeamCeremonyToDashboard()">
                                🏠 新チームで稽古を始める（道場へ）
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function proceedFromNewTeamCeremonyToDashboard() {
        ClubState.newTeamCeremonyData = null;
        ClubState.viewPhase = 'dashboard';
        saveClubData();
        renderClubUI();
    }

    // ───────────────────────────────────────────
    // 🎓 ゲーム終了・エピローグ画面描画
    // ───────────────────────────────────────────
    function showClubEnding() {
        ClubState.viewPhase = 'club_ending';
        saveClubData();
        renderClubUI();
    }

    function renderClubEndingScreen(container) {
        const dStats = ClubState.stats.district || { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
        const nStats = ClubState.stats.national || { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
        const ihDStats = ClubState.stats.interhighDistrict || { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
        const ihNStats = ClubState.stats.interhighNational || { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };

        const isIhChampion = (ihNStats.win || 0) > 0;
        const isTeamChampion = (nStats.win || 0) > 0;
        const isSupreme = isIhChampion && isTeamChampion;

        // 引退した3年生または現メンバー
        const retiredData = ClubState.retireCeremonyData;
        const finalMembers = (retiredData && retiredData.retiredMembers && retiredData.retiredMembers.length > 0)
            ? retiredData.retiredMembers
            : ClubState.members;
        const captain = finalMembers.find((m) => m.isPlayer) || finalMembers[0];
        const captainName = captain ? captain.name : '主将';

        // 歴代年表行
        const historyRows = (ClubState.history || []).map((h) => {
            const ihDist = h.interhighDistrictResult || '不出場';
            const ihNat = h.interhighNationalResult || '不出場';
            const dist = h.districtResult || '不出場';
            const nat = h.nationalResult || '不出場';
            return `
                <tr>
                    <td class="td-year">第${h.year}期</td>
                    <td class="td-cap">${escapeHtml(h.captainName || '')}</td>
                    <td class="${ihDist === '優勝' ? 'text-gold font-bold' : ''}">${escapeHtml(ihDist)}</td>
                    <td class="${ihNat === '優勝' ? 'text-crown font-bold' : (ihNat === '準優勝' ? 'text-gold' : '')}">${escapeHtml(ihNat)}</td>
                    <td class="${dist === '優勝' ? 'text-gold font-bold' : ''}">${escapeHtml(dist)}</td>
                    <td class="${nat === '優勝' ? 'text-crown font-bold' : ''}">${escapeHtml(nat)}</td>
                </tr>
            `;
        }).join('');

        // メンバーカード
        const memberCardsHtml = finalMembers.map((m) => {
            const stanceLabel = m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '下段' : '中段';
            return `
                <div class="ending-member-card">
                    <div class="ending-member-photo-wrap">
                        <div class="student-photo-frame" onclick="if (window.KendoClub && window.KendoClub.showMemberHandbook) window.KendoClub.showMemberHandbook('${m.id}');" title="生徒手帳を見る">
                            ${window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(m, 56, 74, { withFrame: true }) : ''}
                        </div>
                    </div>
                    <div class="ending-member-header">
                        <span class="em-name">${escapeHtml(m.name)}</span>
                        <span class="em-role">${m.isPlayer ? '👑 主将' : (m.isClubDual ? `助っ人(${m.originalClub})` : '部員')}</span>
                    </div>
                    <div class="ending-member-stats">
                        <span class="em-stat-badge">構え: ${stanceLabel}</span>
                        <span class="em-stat-badge">戦力: ${Math.round(getMemberCombatPower(m))}</span>
                    </div>
                    <div class="ending-member-skills">
                        <span>面:${m.skills.men}</span>
                        <span>小手:${m.skills.kote}</span>
                        <span>胴:${m.skills.do}</span>
                        <span>突:${m.skills.tsuki}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="ceremony-container ceremony-ending-view">
                <div class="ceremony-closing-banner ceremony-ending-banner">
                    <span class="ceremony-season-pill">🎓 第${ClubState.year}期 集大成 ｜ 栄光の軌跡</span>
                    <h1 class="ceremony-main-title">🎓 部活動完結・旅立ちの時</h1>
                    <div class="ceremony-venue-tag">📍 ${escapeHtml(ClubState.schoolName)}（${escapeHtml(ClubState.prefecture)}） ｜ 創設主将：${escapeHtml(captainName)}</div>
                </div>

                <div class="ceremony-card">
                    <div class="ceremony-art-wrap">
                        <img class="ceremony-art-img" src="img/ceremony/club_ending.png" alt="部活動完結" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ceremony-art-fallback" style="display:none;">
                            <span class="art-fallback-icon">🎓</span>
                            <span class="art-fallback-title">部活動完結</span>
                        </div>
                        <div class="ceremony-tagline-overlay">〜竹刀に刻んだ汗と涙、仲間と共に駆け抜けた青春の集大成〜</div>
                    </div>

                    <div class="ceremony-scroll-body">
                        <!-- エピローグメッセージ -->
                        <div class="ceremony-speech-box ending-speech-box">
                            <div class="speech-header">📜 【初代主将・引退の辞】</div>
                            <p class="speech-content">
                                高校に入学した春、南京錠の外された埃だらけの道場から始まった私たちの剣道。<br>
                                部員も足りず、他部の助っ人に助けられながら、一本の竹刀に青春のすべてを注ぎ込んできました。<br>
                                仲間と共に流した涙も、共に笑い合った日々も、すべてが一生の宝物です。<br>
                                ここに私たちの高校剣道部は一つの大きな節目を迎えます。共に駆け抜けてくれた仲間、そして応援してくださった全ての方に――心からの礼を！
                            </p>
                        </div>

                        <!-- 栄光の実績バッジ -->
                        <div class="ending-honors-wrap">
                            <div class="ending-honors-title">🏆 【獲得した栄冠・覇者の証】</div>
                            <div class="ending-honors-grid">
                                ${isSupreme ? `
                                <div class="honor-badge-item badge-supreme">
                                    <span class="h-icon">👑</span>
                                    <span class="h-title">完全全国制覇</span>
                                    <span class="h-desc">個人・団体ともに日本の頂点を極めた伝説の代</span>
                                </div>` : ''}
                                ${isIhChampion ? `
                                <div class="honor-badge-item badge-ih">
                                    <span class="h-icon">🥇</span>
                                    <span class="h-title">インターハイ個人日本一</span>
                                    <span class="h-desc">夏の全国高校総体で個人優勝を達成</span>
                                </div>` : ''}
                                ${isTeamChampion ? `
                                <div class="honor-badge-item badge-team">
                                    <span class="h-icon">🏆</span>
                                    <span class="h-title">全国選抜団体日本一</span>
                                    <span class="h-desc">春日井の舞台で47代表の頂点に君臨</span>
                                </div>` : ''}
                                ${(!isIhChampion && !isTeamChampion) ? `
                                <div class="honor-badge-item badge-pride">
                                    <span class="h-icon">🥋</span>
                                    <span class="h-title">不屈の挑戦者</span>
                                    <span class="h-desc">廃部の道場を蘇らせ、全国へ挑み続けた不滅の闘志</span>
                                </div>` : ''}
                            </div>
                        </div>

                        <!-- 総合成績統計 -->
                        <div class="ending-stats-summary-box">
                            <div class="ending-stats-title">📊 【通算公式大会 成績サマリー】</div>
                            <div class="ending-stats-grid">
                                <div class="e-stat-card">
                                    <span class="es-label">活動期間</span>
                                    <span class="es-val">${ClubState.year} 年間</span>
                                </div>
                                <div class="e-stat-card">
                                    <span class="es-label">IH都道県予選</span>
                                    <span class="es-val">優勝 ${ihDStats.win}回 / 準優 ${ihDStats.runnerUp}回</span>
                                </div>
                                <div class="e-stat-card">
                                    <span class="es-label">全国高校総体(IH)</span>
                                    <span class="es-val">優勝 ${ihNStats.win}回 / 準優 ${ihNStats.runnerUp}回</span>
                                </div>
                                <div class="e-stat-card">
                                    <span class="es-label">選抜地区予選(団体)</span>
                                    <span class="es-val">優勝 ${dStats.win}回 / 準優 ${dStats.runnerUp}回</span>
                                </div>
                                <div class="e-stat-card">
                                    <span class="es-label">全国選抜大会(団体)</span>
                                    <span class="es-val">優勝 ${nStats.win}回 / 準優 ${nStats.runnerUp}回</span>
                                </div>
                            </div>
                        </div>

                        <!-- 歴代年表 -->
                        <div class="ending-history-box">
                            <div class="ending-history-title">📜 【年度別 公式大会戦績年表】</div>
                            <div class="history-table-wrap">
                                <table class="history-table">
                                    <thead>
                                        <tr>
                                            <th>年度</th>
                                            <th>主将</th>
                                            <th>IH個人予選</th>
                                            <th>全国総体個人</th>
                                            <th>選抜団体予選</th>
                                            <th>全国高校選抜</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${historyRows || '<tr><td colspan="6" class="text-muted">戦績データなし</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 最終代のメンバー一覧 -->
                        <div class="ending-members-box">
                            <div class="ending-members-title">👥 【共に戦い抜いた最終メンバー】</div>
                            <div class="ending-members-grid">
                                ${memberCardsHtml}
                            </div>
                        </div>

                        <!-- アクションボタン -->
                        <div class="ceremony-actions ending-actions-wrap">
                            <button type="button" class="btn-ceremony-launch pulse-gold" onclick="window.KendoGameEngine.showModeSelect()">
                                🏠 タイトル（モード選択）へ戻る
                            </button>
                            <button type="button" class="btn-ceremony-restart" onclick="window.KendoClub.startNewGame(false)">
                                🔄 新たな学校で新チームを創部する
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ───────────────────────────────────────────
    // 🎬 創部プロローグ・アニメーション動画画面描画
    // ───────────────────────────────────────────
    function renderPrologueVideo(container) {
        const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];

        container.innerHTML = `
            <div class="ceremony-container ceremony-prologue-video-view">
                <div class="ceremony-opening-banner ceremony-gold-banner">
                    <div class="ceremony-banner-top-row">
                        <span class="ceremony-season-pill">🎬 創部プロローグ・ショートアニメ</span>
                        <button type="button" class="btn-video-skip" onclick="window.KendoClub.skipPrologueVideo()">
                            ⏩ スキップして物語へ
                        </button>
                    </div>
                    <h1 class="ceremony-main-title">🌸 埃を払った道場 — 甦る名門剣道部</h1>
                    <div class="ceremony-venue-tag">📍 ${escapeHtml(ClubState.schoolName)} 武道場 ｜ 創設主将：${escapeHtml(captain ? captain.name : 'あなた')}（1年）</div>
                </div>

                <div class="ceremony-card ceremony-video-card">
                    <div class="ceremony-video-wrap">
                        <video id="prologueVideoPlayer" class="ceremony-video-player" src="img/story/prologue_revival_anime.mp4" playsinline controls preload="auto"></video>
                    </div>
                    <div class="ceremony-video-footer">
                        <div class="video-footer-tip">
                            <span>💡 再生が終了すると自動的に創部イベント画面へ進みます</span>
                        </div>
                        <button type="button" class="btn-video-skip-inline" onclick="window.KendoClub.skipPrologueVideo()">
                            ⏩ スキップして物語を読む
                        </button>
                    </div>
                </div>
            </div>
        `;

        const video = document.getElementById('prologueVideoPlayer');
        if (video) {
            syncPrologueVideoAudio(video);

            // 再生終了時に自動で物語画面へ遷移
            video.addEventListener('ended', () => {
                proceedFromPrologueVideoToStory();
            });

            // 自動再生の試行（ブラウザのautoplayポリシー対応）
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.log('[PrologueVideo] Autoplay blocked, waiting for user play:', err.message);
                });
            }
        }
    }

    function syncPrologueVideoAudio(video) {
        const target = video || document.getElementById('prologueVideoPlayer');
        if (!target) return;
        if (window.KendoBGM) {
            target.volume = typeof window.KendoBGM.getSoundVolume === 'function' ? window.KendoBGM.getSoundVolume() : 0.65;
            target.muted = typeof window.KendoBGM.isMuted === 'function' ? window.KendoBGM.isMuted() : false;
        }
    }

    function proceedFromPrologueVideoToStory() {
        const video = document.getElementById('prologueVideoPlayer');
        if (video) {
            try { video.pause(); } catch (e) {}
        }
        ClubState.viewPhase = 'prologue_story';
        saveClubData();
        renderClubUI();
    }

    function skipPrologueVideo() {
        proceedFromPrologueVideoToStory();
    }

    function replayPrologueVideo() {
        ClubState.viewPhase = 'prologue_video';
        saveClubData();
        renderClubUI();
    }

    // ───────────────────────────────────────────
    // 🌸 創部プロローグ・廃部復活ストーリー画面描画
    // ───────────────────────────────────────────
    function renderPrologueStory(container) {
        const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
        const otherMembers = ClubState.members.filter((m) => !m.isPlayer);
        const firstMate = otherMembers[0];
        const secondMate = otherMembers[1];

        const totalCount = ClubState.members.length;
        const needHelpers = Math.max(0, 5 - totalCount);

        const captainPhoto = (captain && window.FaceGenerator) ? `
            <span class="student-photo-frame" title="${escapeHtml(captain.name)}の生徒手帳を開く" onclick="event.stopPropagation(); if (window.FaceGenerator) window.FaceGenerator.showHandbookModal(window.ClubState.members.find(m => m.id === '${captain.id}'));">
                ${window.FaceGenerator.getMemberFaceSvg(captain, 44, 58, { withFrame: true, schoolName: ClubState.schoolName, stampText: '主将証' })}
            </span>
        ` : '<div class="event-fallback-avatar"><span class="fallback-icon">🥋</span></div>';

        const firstMatePhoto = (firstMate && window.FaceGenerator) ? `
            <span class="student-photo-frame" title="${escapeHtml(firstMate.name)}の生徒手帳を開く" onclick="event.stopPropagation(); if (window.FaceGenerator) window.FaceGenerator.showHandbookModal(window.ClubState.members.find(m => m.id === '${firstMate.id}'));">
                ${window.FaceGenerator.getMemberFaceSvg(firstMate, 44, 58, { withFrame: true, schoolName: ClubState.schoolName, stampText: '手帳' })}
            </span>
        ` : '<div class="event-fallback-avatar"><span class="fallback-icon">⚔️</span></div>';

        const secondMatePhoto = (secondMate && window.FaceGenerator) ? `
            <span class="student-photo-frame" title="${escapeHtml(secondMate.name)}の生徒手帳を開く" onclick="event.stopPropagation(); if (window.FaceGenerator) window.FaceGenerator.showHandbookModal(window.ClubState.members.find(m => m.id === '${secondMate.id}'));">
                ${window.FaceGenerator.getMemberFaceSvg(secondMate, 44, 58, { withFrame: true, schoolName: ClubState.schoolName, stampText: '手帳' })}
            </span>
        ` : '<div class="event-fallback-avatar"><span class="fallback-icon">🌱</span></div>';

        container.innerHTML = `
            <div class="ceremony-container ceremony-prologue-view">
                <div class="ceremony-opening-banner ceremony-gold-banner">
                    <span class="ceremony-season-pill">🌸 創部第1期 4月1週（1年生だけの挑戦）</span>
                    <h1 class="ceremony-main-title">🌸 甦る名門！1年生主将と、埃を払った道場</h1>
                    <div class="ceremony-venue-tag">📍 ${escapeHtml(ClubState.schoolName)} 武道場 ｜ 創設主将：${escapeHtml(captain ? captain.name : 'あなた')}（1年）</div>
                </div>

                <div class="ceremony-card">
                    <div class="ceremony-art-wrap">
                        <img class="ceremony-art-img" src="img/story/prologue_revival.png" alt="廃部道場の復活" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ceremony-art-fallback" style="display:none;">
                            <span class="art-fallback-icon">🥋</span>
                            <span class="art-fallback-title">廃部からの再興</span>
                        </div>
                        <div class="ceremony-tagline-overlay">〜閉ざされていた扉が今、開かれる。先輩なき道場から始まる、俺たちの全国制覇〜</div>
                        <button type="button" class="btn-replay-prologue-anime" onclick="window.KendoClub.replayPrologueVideo()" title="創部オープニングアニメをもう一度再生する">
                            🎬 アニメをもう一度観る
                        </button>
                    </div>

                    <div class="ceremony-scroll-body">
                        <div class="ceremony-speech-box">
                            <div class="speech-header">📜 【情景：錆びた鍵と、舞い上がる埃】</div>
                            <p class="speech-content">
                                高校に入学したばかりの春、校舎の片隅で重い南京錠が掛けられていた武道場。<br>
                                ギィと錆びた音を立てて扉を開けると、そこには舞い上がる埃の粒子と、差し込む春の柔らかな日差し。<br>
                                奥の壁には、かつて全国を制覇した黄金期の歴代木札と、色褪せつつも威厳を放つ優勝旗が静かに眠っていた。<br><br>
                                「先輩たちは一人もいない。部員もまだ俺たち${totalCount}人だけだ。<br>
                                だけど……ここから俺たちの全国制覇を始めよう！<br>
                                まずは他部から助っ人を集めて、5人のチームを作るんだ！」
                            </p>
                        </div>

                        <div class="prologue-dialogues-box event-dialogues-list">
                            <div class="event-dialogue-item is-captain has-member-photo">
                                <div class="event-dialogue-avatar-col">
                                    ${captainPhoto}
                                </div>
                                <div class="event-dialogue-content-col">
                                    <div class="event-speaker-badge">
                                        <span class="speaker-role-tag">👑 主将</span>
                                        <span class="speaker-name">${escapeHtml(captain ? captain.name : 'あなた')}</span>
                                        <span class="speaker-grade">(1年)</span>
                                    </div>
                                    <div class="event-dialogue-bubble">
                                        「今日からここが俺たちの道場だ！先輩がいないなら、俺たち1年だけで新しい歴史を作ればいい！」
                                    </div>
                                </div>
                            </div>
                            <div class="event-dialogue-item has-member-photo">
                                <div class="event-dialogue-avatar-col">
                                    ${firstMatePhoto}
                                </div>
                                <div class="event-dialogue-content-col">
                                    <div class="event-speaker-badge">
                                        <span class="speaker-role-tag">⚔️ 同期</span>
                                        <span class="speaker-name">${escapeHtml(firstMate ? firstMate.name : '仲間')}</span>
                                        <span class="speaker-grade">(1年)</span>
                                    </div>
                                    <div class="event-dialogue-bubble">
                                        「ああ！でも団体戦には5人必要だ。陸上部や柔道部に声をかけて、助っ人を頼んでみよう！」
                                    </div>
                                </div>
                            </div>
                            ${secondMate ? `
                            <div class="event-dialogue-item has-member-photo">
                                <div class="event-dialogue-avatar-col">
                                    ${secondMatePhoto}
                                </div>
                                <div class="event-dialogue-content-col">
                                    <div class="event-speaker-badge">
                                        <span class="speaker-role-tag">🌱 同期</span>
                                        <span class="speaker-name">${escapeHtml(secondMate.name)}</span>
                                        <span class="speaker-grade">(1年)</span>
                                    </div>
                                    <div class="event-dialogue-bubble">
                                        「掛け持ちでも一緒に竹刀を振ってくれる仲間を集めましょう！俺たちの手で全国へ行くんだ！」
                                    </div>
                                </div>
                            </div>` : ''}
                        </div>

                        <div class="newteam-meta-box">
                            <div class="newteam-meta-title">⚔️ 【新生剣道部 創設メンバー】</div>
                            <div class="newteam-meta-grid">
                                <div class="meta-item">
                                    <span class="meta-label">創設主将</span>
                                    <span class="meta-val">👑 ${escapeHtml(captain ? captain.name : 'あなた')} (1年)</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">初期部員</span>
                                    <span class="meta-val">全${totalCount}名（1年生のみ / 上級生: 0名）</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">団体戦枠</span>
                                    <span class="meta-val">${needHelpers > 0 ? `⚠️ あと${needHelpers}名不足（他部から助っ人勧誘可能）` : '✅ 5名揃いました！'}</span>
                                </div>
                            </div>
                        </div>

                        <div class="ceremony-actions">
                            <button type="button" class="btn-ceremony-launch pulse-gold" onclick="window.KendoClub.proceedFromPrologueToDashboard()">
                                🏠 道場の埃を払い、稽古を始める（道場へ）
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function proceedFromPrologueToDashboard() {
        ClubState.viewPhase = 'dashboard';
        saveClubData();
        renderClubUI();
    }

    // ───────────────────────────────────────────
    // 高校生らしい部活イベント画面描画
    // ───────────────────────────────────────────
    function renderEventScene(container) {
        const data = ClubState.currentEventData;
        if (!data) {
            ClubState.viewPhase = 'dashboard';
            renderClubUI();
            return;
        }

        const dialoguesHtml = (data.dialogues || []).map((d) => {
            // memberId または名前から対象部員を取得
            let member = null;
            const isSenior = !!(d.isSenior || d.retiredMember);
            if (d.retiredMember) {
                member = d.retiredMember;
            } else if (d.memberId) {
                member = ClubState.members.find((m) => m.id === d.memberId);
            }
            if (!member) {
                if (d.speakerRole === '主将' || (d.speaker && d.speaker.includes('主将'))) {
                    member = ClubState.members.find((m) => m.isPlayer);
                } else {
                    member = ClubState.members.find((m) => m.name === d.speaker);
                }
            }

            const isCaptain = !isSenior && (!!(member && member.isPlayer) || (d.speaker && d.speaker.includes('主将')));
            const roleLabel = isSenior ? '🎓 卒業生' : (isCaptain ? '👑 主将' : (member ? '⚔️ 部員' : (d.speaker.includes('OB') ? '🥋 招待' : '👤')));

            let avatarHtml = '';
            if (member && window.FaceGenerator) {
                const faceSvg = window.FaceGenerator.getMemberFaceSvg(member, 44, 58, {
                    withFrame: true,
                    schoolName: ClubState.schoolName || '青雲高校',
                    stampText: isSenior ? '卒業生' : (member.isPlayer ? '主将証' : '手帳')
                });
                avatarHtml = `
                    <span class="student-photo-frame ${isSenior ? 'is-senior' : ''}" title="${escapeHtml(member.name)}の生徒手帳を開く" onclick="event.stopPropagation(); if (window.KendoClub && window.KendoClub.showMemberHandbook) { window.KendoClub.showMemberHandbook('${member.id}'); } else if (window.FaceGenerator) { window.FaceGenerator.showHandbookModal(window.ClubState.members.find(m => m.id === '${member.id}')); }">
                        ${faceSvg}
                    </span>
                `;
            } else {
                const icon = isSenior ? '🎓' : (d.speaker.includes('OB') ? '🥋' : '👤');
                avatarHtml = `
                    <div class="event-fallback-avatar ${isSenior ? 'is-senior' : ''}" title="${escapeHtml(d.speaker)}">
                        <span class="fallback-icon">${icon}</span>
                    </div>
                `;
            }

            return `
                <div class="event-dialogue-item ${isCaptain ? 'is-captain' : ''} ${isSenior ? 'is-senior' : ''} ${member ? 'has-member-photo' : ''}">
                    <div class="event-dialogue-avatar-col">
                        ${avatarHtml}
                    </div>
                    <div class="event-dialogue-content-col">
                        <div class="event-speaker-badge">
                            <span class="speaker-role-tag">${roleLabel}</span>
                            <span class="speaker-name">${escapeHtml(d.speaker)}</span>
                            ${isSenior ? '<span class="speaker-grade">(3年生・卒業生)</span>' : (member && member.grade ? `<span class="speaker-grade">(${member.grade}年)</span>` : '')}
                        </div>
                        <div class="event-dialogue-bubble">
                            ${escapeHtml(d.text)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="ceremony-container event-scene-container">
                <div class="ceremony-opening-banner event-scene-banner">
                    <span class="ceremony-season-pill">${escapeHtml(data.seasonTag || '高校生イベント')}</span>
                    <h1 class="ceremony-main-title">${escapeHtml(data.title)}</h1>
                    <div class="ceremony-venue-tag">📍 ${escapeHtml(ClubState.schoolName)} 剣道部 ｜ ${ClubState.year}年目 ${ClubState.month}月 ${ClubState.week}週</div>
                </div>

                <div class="ceremony-card event-scene-card">
                    <div class="ceremony-art-wrap event-art-wrap">
                        <img class="ceremony-art-img" src="${escapeHtml(data.image)}" alt="${escapeHtml(data.fallbackTitle || data.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="ceremony-art-fallback event-art-fallback" style="display:none;">
                            <span class="art-fallback-icon">${data.fallbackIcon || '🥋'}</span>
                            <span class="art-fallback-title">${escapeHtml(data.fallbackTitle || data.title)}</span>
                        </div>
                        <div class="ceremony-tagline-overlay">${escapeHtml(data.tagline || '')}</div>
                    </div>

                    <div class="ceremony-scroll-body event-scroll-body">
                        <div class="event-narration-box">
                            <div class="narration-header">📖 【情景】</div>
                            <p class="narration-content">${data.narration || ''}</p>
                        </div>

                        ${(data.retiredSeniors && data.retiredSeniors.length > 0) ? `
                            <div class="graduating-seniors-box">
                                <div class="seniors-box-header">
                                    <span class="seniors-header-icon">🎓</span>
                                    <span class="seniors-header-title">卒業を迎える先輩たち</span>
                                    <span class="seniors-header-sub">（前年9月に引退した3年生元部員）</span>
                                </div>
                                <div class="graduating-seniors-grid">
                                    ${data.retiredSeniors.map((senior) => {
                                        const faceSvg = window.FaceGenerator ? window.FaceGenerator.getMemberFaceSvg(senior, 50, 66, {
                                            withFrame: true,
                                            schoolName: ClubState.schoolName || '青雲高校',
                                            stampText: '卒業生'
                                        }) : '<span style="font-size:28px;">🎓</span>';
                                        const stanceLabel = senior.favStance === 'jodan' ? '上段' : (senior.favStance === 'waki' ? '下段' : '中段');
                                        const roleBadge = senior.wasPlayer ? '👑 元主将' : '⚔️ 先輩';
                                        const combatPower = (typeof getMemberCombatPower === 'function')
                                            ? getMemberCombatPower(senior)
                                            : Math.round(((senior.str || 10) + (senior.agi || 10) + (senior.spi || 10)) * 3);
                                        return `
                                            <div class="graduating-senior-card" onclick="event.stopPropagation(); if (window.KendoClub && window.KendoClub.showMemberHandbook) window.KendoClub.showMemberHandbook('${senior.id}');" title="${escapeHtml(senior.name)}の生徒手帳を開く">
                                                <div class="senior-card-avatar">
                                                    ${faceSvg}
                                                </div>
                                                <div class="senior-card-info">
                                                    <div class="senior-card-role-row">
                                                        <span class="senior-badge ${senior.wasPlayer ? 'is-captain' : ''}">${roleBadge}</span>
                                                        <span class="senior-stance-badge">構え: ${stanceLabel}</span>
                                                    </div>
                                                    <div class="senior-card-name">${escapeHtml(senior.name)}</div>
                                                    <div class="senior-card-stats">
                                                        <span class="senior-stat-item">戦力: <strong>${combatPower}</strong></span>
                                                        ${senior.favSpecialTech ? `<span class="senior-tech-item">秘技: ${escapeHtml(senior.favSpecialTech)}</span>` : ''}
                                                    </div>
                                                </div>
                                                <div class="senior-card-graduate-seal">🎓 卒業</div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        ` : ''}

                        ${dialoguesHtml ? `
                            <div class="event-dialogues-box">
                                <div class="dialogues-header">💬 【部員たちの声】</div>
                                <div class="event-dialogues-list">
                                    ${dialoguesHtml}
                                </div>
                            </div>
                        ` : ''}

                        <div class="event-bonus-card">
                            <div class="event-bonus-header">✨ 【イベント効果】</div>
                            <div class="event-bonus-desc">${escapeHtml(data.effectsDesc || '')}</div>
                        </div>

                        <div class="ceremony-actions event-actions">
                            <button type="button" class="btn-ceremony-launch pulse-gold btn-event-complete" onclick="window.KendoClub.completeEvent();">
                                🥋 稽古へ戻る（効果を反映）
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ───────────────────────────────────────────
    // マンツーマン指名特訓：実戦稽古（試合・自動観戦・即時判定）
    // ───────────────────────────────────────────
    function startSpecialPracticeBout(targetMemberId, mode = 'manual') {
        const playerMember = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
        const targetMember = ClubState.members.find((m) => m.id === targetMemberId);
        if (!playerMember || !targetMember) return;
        if (targetMember.id === playerMember.id) return;

        ClubState.selectedSpecialTargetId = targetMember.id;

        // 即時判定モードの場合は試合画面へ遷移せず、その場でシミュレートして完了
        if (mode === 'instant') {
            executeSpecialPracticeInstant(targetMemberId);
            return;
        }

        // 試合画面へ遷移する直前に、現在の部員一覧の横スクロール位置および練習メニュー画面の縦スクロール位置を確実に記録
        captureDashboardScroll();
        const curGrid = document.querySelector('.club-members-grid');
        if (curGrid && curGrid.clientWidth > 0) {
            ClubState.memberGridScrollLeft = curGrid.scrollLeft;
        }

        // 特訓相手部員の得意構えに応じたAIパターン
        const stance = targetMember.favStance || targetMember.stance || 'chudan';
        let enemyPatterns = [];
        if (stance === 'jodan') {
            enemyPatterns = [
                { stance: 'jodan', hint: `🔥【上段の構え】${targetMember.name}は頭上に構え「上段面(2ダメ)」を狙う！（「胴」で躱すか、「防御」で防いで応じ技を狙え！）`, isDanger: true, weights: { 面: 60, 小手: 25, 胴: 15, 防御: 0, 崩し: 0, 突き: 0 } },
                { stance: 'chudan', hint: `⚖️【中段の構え】${targetMember.name}は中段に戻りつつ「面」か「小手」を狙っている…（「防御」や「胴」が有効）`, isDanger: false, weights: { 面: 45, 小手: 35, 胴: 15, 防御: 5, 崩し: 0, 突き: 0 } },
            ];
        } else if (stance === 'waki') {
            enemyPatterns = [
                { stance: 'waki', hint: `🌊【下段の構え】${targetMember.name}は竹刀を低く構え「後の先防御」か「抜き胴」を狙う！（崩しが有効！）`, isDanger: false, weights: { 防御: 50, 胴: 30, 小手: 15, 面: 5, 崩し: 0, 突き: 0 } },
                { stance: 'chudan', hint: `⚖️【中段の構え】${targetMember.name}は間合いを測りながら鋭い「小手」を狙う！`, isDanger: false, weights: { 小手: 50, 防御: 25, 面: 15, 胴: 10, 崩し: 0, 突き: 0 } },
            ];
        } else {
            enemyPatterns = [
                { stance: 'chudan', hint: `⚖️【中段の構え】${targetMember.name}は真っ直ぐ「面」か「小手」を狙っている！`, isDanger: false, weights: { 面: 45, 小手: 30, 胴: 15, 防御: 10, 崩し: 0, 突き: 0 } },
                { stance: 'chudan', hint: `🛡️【中段の構え】${targetMember.name}は守りを固めつつ隙を伺っている…（崩しの好機！）`, isDanger: false, weights: { 防御: 40, 面: 30, 小手: 20, 胴: 10, 崩し: 0, 突き: 0 } },
            ];
        }

        const enemyArmorTheme = targetMember.armorTheme || {
            doStops: ['#1e293b', '#334155', '#475569', '#1e293b', '#0f172a'],
            muneFill: '#0f172a',
            muneStitch: 'rgba(56, 189, 248, 0.85)',
            tareLine: 'rgba(56, 189, 248, 0.65)',
        };

        const enemyQuote = `「主将、胸を貸してください！全力で一本を狙います！」`;

        if (window.KendoGameEngine && window.KendoGameEngine.startCustomMatch) {
            window.KendoGameEngine.startCustomMatch({
                isIndividual: false,
                isIntraClub: true,
                isSpecialPractice: true,
                isSpectating: (mode === 'spectate'),
                roundName: (mode === 'spectate' ? 'マンツーマン特別指導（自動観戦）' : 'マンツーマン特別指導'),
                boutPosName: (mode === 'spectate' ? '実戦特訓（観戦）' : '実戦特訓'),
                tournamentType: 'dojo',
                playerData: {
                    id: playerMember.id,
                    face: playerMember.face,
                    name: playerMember.name,
                    grade: playerMember.grade || (ClubState.captain ? ClubState.captain.grade : 1),
                    schoolName: ClubState.schoolName,
                    prefecture: ClubState.prefecture,
                    roleTitle: '主将',
                    maxHealth: playerMember.maxHealth || 6,
                    initialKiai: 0,
                    favStance: playerMember.favStance || 'chudan',
                    skills: playerMember.skills,
                    specialTechnique: playerMember.specialTechnique,
                    str: playerMember.str,
                    agi: playerMember.agi,
                    spi: playerMember.spi,
                    armorTheme: playerMember.armorTheme,
                },
                enemyData: {
                    id: targetMember.id,
                    face: targetMember.face,
                    originalMember: targetMember,
                    name: `${ClubState.schoolName}・${targetMember.name}`,
                    schoolName: ClubState.schoolName,
                    prefecture: ClubState.prefecture,
                    shortName: targetMember.name,
                    grade: targetMember.grade || 1,
                    role: targetMember.grade ? `${targetMember.grade}年` : '部員',
                    rank: '',
                    styleTag: `${stance === 'jodan' ? '上段' : stance === 'waki' ? '下段の構え' : '中段'}の気迫`,
                    maxHealth: targetMember.maxHealth || 6,
                    initialKiai: 0,
                    str: targetMember.str,
                    agi: targetMember.agi,
                    spi: targetMember.spi,
                    skills: targetMember.skills,
                    specialTechnique: targetMember.specialTechnique,
                    introQuote: enemyQuote,
                    armorTheme: enemyArmorTheme,
                    patterns: enemyPatterns,
                },
                onMatchEnd: function (result) {
                    const isPlayerWin = result.winner === 'player';
                    const isEnemyWin = result.winner === 'enemy';

                    const pStats = {
                        hits: (result.boutStats && result.boutStats.playerHits !== undefined) ? result.boutStats.playerHits : (isPlayerWin ? 1 : 0),
                        blocks: (result.boutStats && result.boutStats.playerBlocks !== undefined) ? result.boutStats.playerBlocks : 0,
                        rounds: result.rounds || (result.boutStats && result.boutStats.rounds) || 3,
                        winningMove: isPlayerWin ? (result.winningMove || '面') : null,
                        pushWins: (result.boutStats && result.boutStats.pushWins) || 0,
                    };

                    const eStats = {
                        hits: (result.boutStats && result.boutStats.enemyHits !== undefined) ? result.boutStats.enemyHits : (isEnemyWin ? 1 : 0),
                        blocks: (result.boutStats && result.boutStats.enemyBlocks !== undefined) ? result.boutStats.enemyBlocks : 0,
                        rounds: result.rounds || (result.boutStats && result.boutStats.rounds) || 3,
                        winningMove: isEnemyWin ? (result.winningMove || '面') : null,
                        pushWins: 0,
                    };

                    const realPlayer = getRealClubMember(playerMember) || playerMember;
                    const realTarget = getRealClubMember(targetMember) || targetMember;

                    const pGrowth = applyBoutGrowth(realPlayer, pStats);
                    const tGrowth = applyBoutGrowth(realTarget, eStats);

                    // 主将直伝 特別指導ボーナス（試合結果に関係なく、主将のほうが高いパラメータをランダムUP）
                    const STAT_COMPARE_LIST = [
                        { category: 'base', key: 'str', label: '腕力' },
                        { category: 'base', key: 'agi', label: '敏捷' },
                        { category: 'base', key: 'spi', label: '気魄' },
                        { category: 'skill', key: 'men', label: '面' },
                        { category: 'skill', key: 'kote', label: '小手' },
                        { category: 'skill', key: 'do', label: '胴' },
                        { category: 'skill', key: 'tsuki', label: '突き' },
                    ];

                    const mentorGains = [];
                    STAT_COMPARE_LIST.forEach((item) => {
                        const pVal = item.category === 'base' ? (realPlayer[item.key] || 0) : (realPlayer.skills ? realPlayer.skills[item.key] || 0 : 0);
                        const tVal = item.category === 'base' ? (realTarget[item.key] || 0) : (realTarget.skills ? realTarget.skills[item.key] || 0 : 0);

                        // 主将のほうが高いパラメータなら、勝敗に関係なく確実にランダムUP（+1〜+2）
                        if (pVal > tVal) {
                            const gainAmount = Math.random() < 0.4 ? 2 : 1;
                            const curVal = item.category === 'base' ? (realTarget[item.key] || 0) : (realTarget.skills ? realTarget.skills[item.key] || 0 : 0);
                            const finalVal = Math.min(STAT_HARD_MAX, curVal + gainAmount);
                            const actual = finalVal - curVal;
                            if (actual > 0) {
                                if (item.category === 'base') {
                                    realTarget[item.key] = finalVal;
                                } else {
                                    if (!realTarget.skills) realTarget.skills = { men: 8, kote: 8, do: 8, tsuki: 6 };
                                    realTarget.skills[item.key] = finalVal;
                                }
                                mentorGains.push(`${item.label}+${actual}`);
                            }
                        }
                    });

                    // 特訓効果として相手の調子を上向かせる
                    improveCondition(realTarget);

                    const outcomeText = isPlayerWin
                        ? `主将の一本勝ち（決まり手: ${result.winningMove || '面'}）`
                        : (isEnemyWin ? `${realTarget.name}の一本勝ち（決まり手: ${result.winningMove || '面'}）` : '互角の引き分け');

                    const pSummary = pGrowth ? pGrowth.summary : '維持';
                    const tBaseGains = (tGrowth && tGrowth.gainsText && tGrowth.gainsText !== '成長なし') ? [tGrowth.gainsText] : [];
                    const allTargetGains = [...tBaseGains, ...mentorGains];
                    const tFatigue = (tGrowth && tGrowth.fatigueAdded) || 8;
                    const tSummary = `【成長】${allTargetGains.length > 0 ? allTargetGains.join(', ') : '維持'} (疲労+${tFatigue}%)`;
                    const dualText = realTarget.isClubDual ? `（${realTarget.originalClub}掛け持ち）` : '';

                    const modeTag = mode === 'spectate' ? '👀【自動観戦】' : '';
                    const logEntry = `【${ClubState.year}年目 ${ClubState.month}月${ClubState.week}週】${modeTag}主将が${realTarget.name}${dualText}へマンツーマン指名特訓を実施！実戦稽古（結果: ${outcomeText}）を通じて互いに心技体を鍛え上げました！【${realTarget.name}】${tSummary} 【主将】${pSummary}`;

                    ClubState.activityLog.unshift(logEntry);
                    playStatUpSound();

                    if (ClubState.pendingEventData) {
                        ClubState.currentEventData = ClubState.pendingEventData;
                        ClubState.pendingEventData = null;
                        ClubState.advanceWeekOnEventComplete = true; // 特訓実行後に保留イベントを開いたため、イベント完了時に週を進める
                        ClubState.viewPhase = 'event_scene';
                    } else {
                        advanceCalendarWeek();
                    }
                    saveClubData();

                    if (window.KendoBGM && window.KendoBGM.stop) {
                        window.KendoBGM.stop();
                    }

                    if (window.KendoGameEngine && window.KendoGameEngine.showClubScreen) {
                        window.KendoGameEngine.showClubScreen();
                    }
                    renderClubUI();
                }
            });
        }
    }

    // ───────────────────────────────────────────
    // マンツーマン指名特訓：即時判定シミュレータ
    // ───────────────────────────────────────────
    function executeSpecialPracticeInstant(targetMemberId) {
        const playerMember = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
        const targetMember = ClubState.members.find((m) => m.id === targetMemberId);
        if (!playerMember || !targetMember) return;
        if (targetMember.id === playerMember.id) return;

        ClubState.selectedSpecialTargetId = targetMember.id;

        const realPlayer = getRealClubMember(playerMember) || playerMember;
        const realTarget = getRealClubMember(targetMember) || targetMember;

        const pPower = (typeof getMemberCombatPower === 'function') ? getMemberCombatPower(realPlayer) : 100;
        const tPower = (typeof getMemberCombatPower === 'function') ? getMemberCombatPower(realTarget) : 100;

        const fatiguePenalty = Math.max(0.6, 1.0 - (((realPlayer.fatigue || 0) / 100) * 0.35));
        const pFinal = pPower * fatiguePenalty;
        const total = Math.max(1, pFinal + tPower);
        const pWinRate = Math.min(0.92, Math.max(0.12, pFinal / total));

        const roll = Math.random();
        const pTechPool = ['面', '面', '小手', '胴'];
        if ((realPlayer.skills?.tsuki || 0) >= 12) pTechPool.push('突き');
        const tTechPool = ['面', '小手', '小手', '胴'];
        if ((realTarget.skills?.tsuki || 0) >= 12) tTechPool.push('突き');

        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

        let isPlayerWin = false;
        let isEnemyWin = false;
        let winningMove = '面';

        if (roll < pWinRate) {
            isPlayerWin = true;
            winningMove = pick(pTechPool);
        } else if (roll > pWinRate + 0.15) {
            isEnemyWin = true;
            winningMove = pick(tTechPool);
        }

        const pStats = {
            hits: isPlayerWin ? (Math.random() < 0.35 ? 2 : 1) : 0,
            blocks: Math.random() < 0.6 ? 2 : 1,
            rounds: 4,
            winningMove: isPlayerWin ? winningMove : null,
            pushWins: Math.random() < 0.5 ? 1 : 0,
        };

        const eStats = {
            hits: isEnemyWin ? (Math.random() < 0.35 ? 2 : 1) : 0,
            blocks: Math.random() < 0.6 ? 2 : 1,
            rounds: 4,
            winningMove: isEnemyWin ? winningMove : null,
            pushWins: 0,
        };

        const pGrowth = applyBoutGrowth(realPlayer, pStats);
        const tGrowth = applyBoutGrowth(realTarget, eStats);

        // 主将直伝 特別指導ボーナス（主将のほうが高いパラメータなら、勝敗に関係なく確実にランダムUP +1〜+2）
        const STAT_COMPARE_LIST = [
            { category: 'base', key: 'str', label: '腕力' },
            { category: 'base', key: 'agi', label: '敏捷' },
            { category: 'base', key: 'spi', label: '気魄' },
            { category: 'skill', key: 'men', label: '面' },
            { category: 'skill', key: 'kote', label: '小手' },
            { category: 'skill', key: 'do', label: '胴' },
            { category: 'skill', key: 'tsuki', label: '突き' },
        ];

        const mentorGains = [];
        STAT_COMPARE_LIST.forEach((item) => {
            const pVal = item.category === 'base' ? (realPlayer[item.key] || 0) : (realPlayer.skills ? realPlayer.skills[item.key] || 0 : 0);
            const tVal = item.category === 'base' ? (realTarget[item.key] || 0) : (realTarget.skills ? realTarget.skills[item.key] || 0 : 0);

            if (pVal > tVal) {
                const gainAmount = Math.random() < 0.4 ? 2 : 1;
                const curVal = item.category === 'base' ? (realTarget[item.key] || 0) : (realTarget.skills ? realTarget.skills[item.key] || 0 : 0);
                const finalVal = Math.min(STAT_HARD_MAX, curVal + gainAmount);
                const actual = finalVal - curVal;
                if (actual > 0) {
                    if (item.category === 'base') {
                        realTarget[item.key] = finalVal;
                    } else {
                        if (!realTarget.skills) realTarget.skills = { men: 8, kote: 8, do: 8, tsuki: 6 };
                        realTarget.skills[item.key] = finalVal;
                    }
                    mentorGains.push(`${item.label}+${actual}`);
                }
            }
        });

        improveCondition(realTarget);

        const outcomeText = isPlayerWin
            ? `主将の一本勝ち（決まり手: ${winningMove}）`
            : (isEnemyWin ? `${realTarget.name}の一本勝ち（決まり手: ${winningMove}）` : '互角の引き分け');

        const pSummary = pGrowth ? pGrowth.summary : '維持';
        const tBaseGains = (tGrowth && tGrowth.gainsText && tGrowth.gainsText !== '成長なし') ? [tGrowth.gainsText] : [];
        const allTargetGains = [...tBaseGains, ...mentorGains];
        const tFatigue = (tGrowth && tGrowth.fatigueAdded) || 8;
        const tSummary = `【成長】${allTargetGains.length > 0 ? allTargetGains.join(', ') : '維持'} (疲労+${tFatigue}%)`;
        const dualText = realTarget.isClubDual ? `（${realTarget.originalClub}掛け持ち）` : '';

        const logEntry = `【${ClubState.year}年目 ${ClubState.month}月${ClubState.week}週】⚡【即時判定】主将が${realTarget.name}${dualText}へマンツーマン特別指導を実施！実戦稽古（結果: ${outcomeText}）を通じて互いに心技体を鍛え上げました！【${realTarget.name}】${tSummary} 【主将】${pSummary}`;

        ClubState.activityLog.unshift(logEntry);
        playStatUpSound();

        if (ClubState.pendingEventData) {
            ClubState.currentEventData = ClubState.pendingEventData;
            ClubState.pendingEventData = null;
            ClubState.advanceWeekOnEventComplete = true;
            ClubState.viewPhase = 'event_scene';
        } else {
            advanceCalendarWeek();
        }
        saveClubData();
        renderClubUI();
    }

    // ───────────────────────────────────────────
    // グローバル公開インターフェース (window.KendoClub)
    // ───────────────────────────────────────────
    window.ClubState = ClubState;

    window.KendoClub = {
        getMemberById: function (id) {
            return (ClubState.members || []).find((m) => m.id === id);
        },

        showMemberHandbook: function (id) {
            let member = (ClubState.members || []).find((m) => m.id === id);
            if (!member && ClubState.lastRetiredSeniors && Array.isArray(ClubState.lastRetiredSeniors.members)) {
                member = ClubState.lastRetiredSeniors.members.find((m) => m.id === id);
            }
            if (!member && ClubState.retireCeremonyData && Array.isArray(ClubState.retireCeremonyData.retiredMembers)) {
                member = ClubState.retireCeremonyData.retiredMembers.find((m) => m.id === id);
            }
            if (member && window.FaceGenerator && typeof window.FaceGenerator.showHandbookModal === 'function') {
                window.FaceGenerator.showHandbookModal(member);
            }
        },

        getMemberCombatPower: getMemberCombatPower,

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
                const perkNotice = isCaptainAutoUnlocked() ? '\n※獲得済みの「主将試合オート機能」は引き継がれます。' : '';
                const ok = confirm(`【確認】保存されているデータ（${summary.schoolName} ${summary.year}年目 ${summary.month}月${summary.week}週）を消去して、最初から始めますか？\n※現在のセーブデータは失われます。${perkNotice}`);
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
            ClubState.activityLog = [`${ClubState.schoolName}剣道部（${ClubState.prefecture}）再建！1年生主将【${cName}】が埃をかぶった道場を復活させ、全国制覇への第一歩を踏み出しました！`];
            if (ClubState.captainAutoUnlocked) {
                ClubState.activityLog.unshift('🏆【周回特典】歴代制覇の栄誉により、主将の試合自動化（オート観戦・即時判定）が最初から解放されています！');
            }
            ClubState.memberGridScrollLeft = -1; // 開始時の初期位置は右端（大将側表示）
            ClubState.dashboardScrollY = 0;
            const animeEnabled = (window.KendoGameEngine && typeof window.KendoGameEngine.isOpeningAnimeEnabled === 'function')
                ? window.KendoGameEngine.isOpeningAnimeEnabled()
                : true;
            ClubState.viewPhase = animeEnabled ? 'prologue_video' : 'prologue_story';

            saveClubData();
            renderClubUI();
        },

        selectNewCaptain: function (memberId) {
            ClubState.members.forEach((m) => {
                m.isPlayer = (m.id === memberId);
            });
            const newCap = ClubState.members.find((m) => m.id === memberId);
            if (newCap) {
                ClubState.activityLog.unshift(`👑 新主将に【${newCap.name}】が就任！戦力順に基づき、大将～先鋒のオーダーを自動設定しました！`);
            }
            // 主将変更時：大将〜先鋒の割り当てを戦力順で自動設定
            assignOrderByCombatPower(memberId);

            // 👑 新体制始動セレモニー画面へ
            ClubState.newTeamCeremonyData = {
                year: ClubState.year,
                newCaptain: newCap,
                activeMembers: [...ClubState.members],
            };
            ClubState.viewPhase = 'new_team_ceremony';

            saveClubData();
            renderClubUI();
        },

        autoAssignOrderByCombatPower: function () {
            assignOrderByCombatPower();
            saveClubData();
            renderClubUI();
        },

        previewPracticeMotion: function (_menuId) {
            // マウスオーバーでのアニメーション切り替えは行わず、メニュークリック後に実行する
        },

        getActivePracticeMotion: function () {
            return getActivePracticeMotion();
        },

        getMemberActiveMotion: function (member, timeNow) {
            return getMemberActiveMotion(member, timeNow);
        },

        getMemberMotionBadgeText: function (member) {
            return getMemberMotionBadgeText(member);
        },

        startClubMiniCharaLoop: function () {
            startClubMiniCharaLoop();
        },

        stopClubMiniCharaLoop: function () {
            stopClubMiniCharaLoop();
        },

        executePracticeImmediate: function (menuId, targetMemberId = null) {
            executePractice(menuId, targetMemberId, true);
        },

        onSelectPractice: function (menuId, instant = false) {
            executePractice(menuId, null, instant);
        },

        onChangeSpecialTarget: function (targetId) {
            ClubState.selectedSpecialTargetId = targetId;
            const sel = document.getElementById('selSpecialTarget');
            if (sel && sel.value !== targetId) {
                sel.value = targetId;
            }
            saveClubData();
        },

        onSpecialPractice: function (mode = 'manual') {
            const sel = document.getElementById('selSpecialTarget');
            const targetId = (sel && sel.value) ? sel.value : ClubState.selectedSpecialTargetId;
            if (targetId) {
                ClubState.selectedSpecialTargetId = targetId;
                startSpecialPracticeBout(targetId, mode);
            }
        },

        startSpecialPracticeBout: function (targetId, mode = 'manual') {
            startSpecialPracticeBout(targetId, mode);
        },

        setQuickSpecialMode: function (mode) {
            ClubState.quickSpecialMode = mode;
            const bar = document.getElementById('qSpecialModeBar');
            if (bar) {
                const pills = bar.querySelectorAll('.btn-q-mode-pill');
                pills.forEach((p, idx) => {
                    const m = idx === 0 ? 'manual' : idx === 1 ? 'spectate' : 'instant';
                    p.classList.toggle('active', m === mode);
                });
            }
            const popup = document.getElementById('quickSpecialPopup');
            if (popup) {
                const labels = popup.querySelectorAll('.q-mem-btn-label');
                const btnLabel = mode === 'spectate' ? '観戦 👀' : mode === 'instant' ? '即時 ⚡' : '出陣 ⚔️';
                labels.forEach((l) => { l.textContent = btnLabel; });
            }
        },

        toggleQuickSpecialPopup: function (forceState) {
            const popup = document.getElementById('quickSpecialPopup');
            const overlay = document.getElementById('quickSpecialOverlay');
            if (!popup) return;
            const willShow = (forceState !== undefined) ? !!forceState : (popup.style.display === 'none');
            popup.style.display = willShow ? 'block' : 'none';
            if (overlay) overlay.style.display = willShow ? 'block' : 'none';
        },

        launchQuickSpecialPractice: function (memberId) {
            this.toggleQuickSpecialPopup(false);
            if (!memberId) return;
            ClubState.selectedSpecialTargetId = memberId;
            const mode = ClubState.quickSpecialMode || 'manual';
            startSpecialPracticeBout(memberId, mode);
        },

        recruitDualClubMember: function (targetSlot = null) {
            if (ClubState.members.length >= 5) {
                alert('すでに5名以上の部員が在籍しているため、助っ人の勧誘はできません。');
                return;
            }
            const recruit = createDualClubMember();
            ClubState.members.push(recruit);

            let slotName = '控え';
            if (typeof targetSlot === 'number' && targetSlot >= 0 && targetSlot < 5) {
                // ボタンを押した枠に助っ人を設定
                ClubState.order[targetSlot] = recruit.id;
                slotName = POS_NAMES[targetSlot];
            } else {
                // スロット未指定の場合：欠員枠があれば副将(3)→中堅(2)→次鋒(1)→先鋒(0)の空き枠に配置
                const slotPriority = [3, 2, 1, 0];
                const emptySlot = slotPriority.find((s) => !ClubState.order[s]);
                if (emptySlot !== undefined) {
                    ClubState.order[emptySlot] = recruit.id;
                    slotName = POS_NAMES[emptySlot];
                }
            }

            sanitizeOrder();
            ClubState.activityLog.unshift(`🤝【${ClubState.year}年目 ${ClubState.month}月${ClubState.week}週】部員不足を補うため、${recruit.originalClub}から【${recruit.name}】を掛け持ちの助っ人として勧誘・入部させました！（配置：${slotName}）`);
            saveClubData();
            renderClubUI();
        },

        executeNewSchoolYear: function () {
            executeNewSchoolYear();
        },

        getFreshmenRecruitRange: function (districtRank, nationalRank) {
            return getFreshmenRecruitRange(districtRank, nationalRank);
        },

        renderClubUI: function () {
            renderClubUI();
        },

        saveClubData: function () {
            saveClubData();
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

        setSlotMember: function (slotIdx, newMemberId) {
            if (slotIdx < 0 || slotIdx >= 5 || !newMemberId) return;

            while (ClubState.order.length < 5) {
                ClubState.order.push(null);
            }

            const oldMemberId = ClubState.order[slotIdx];
            if (oldMemberId === newMemberId) return;

            const existingSlotIdx = ClubState.order.indexOf(newMemberId);
            if (existingSlotIdx !== -1) {
                // スロット同士の入れ替え
                ClubState.order[existingSlotIdx] = oldMemberId || null;
                ClubState.order[slotIdx] = newMemberId;
            } else {
                // 控えからの配置（元いた選手は自動的に控えへ移行）
                ClubState.order[slotIdx] = newMemberId;
            }

            saveClubData();
            renderClubUI();
        },

        scrollOrderList: function (delta) {
            const el = document.querySelector('.club-members-grid');
            if (el) {
                el.scrollBy({ left: delta, behavior: 'smooth' });
                const maxS = Math.max(0, el.scrollWidth - el.clientWidth);
                const target = Math.max(0, Math.min(maxS, el.scrollLeft + delta));
                ClubState.memberGridScrollLeft = target;
                setTimeout(() => {
                    if (el) ClubState.memberGridScrollLeft = el.scrollLeft;
                }, 350);
            }
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
            // 6月1週：インターハイ個人予選
            if (ClubState.month === 6 && ClubState.week === 1) {
                if (ClubState.members.length === 0) {
                    alert('部員が不在のため、個人予選に出場できません。');
                    return;
                }
                ClubState.openingTournamentType = 'interhigh_district';
                ClubState.viewPhase = 'tournament_opening';
                saveClubData();
                renderClubUI();
                return;
            }

            // 8月1週：インターハイ全国個人戦
            if (ClubState.month === 8 && ClubState.week === 1) {
                if (ClubState.qualifiedForInterhigh && ClubState.interhighQualifiedMemberIds && ClubState.interhighQualifiedMemberIds.length > 0) {
                    ClubState.openingTournamentType = 'interhigh_national';
                    ClubState.viewPhase = 'tournament_opening';
                    saveClubData();
                    renderClubUI();
                    return;
                }
            }

            // 12月3週・3月4週：団体戦大会（最低5名必要）
            if (ClubState.members.length < 5) {
                alert(`団体戦大会には最低5名の部員が必要です（現在: ${ClubState.members.length}名）。部員が不足しているため出陣できません。`);
                return;
            }
            if (ClubState.month === 12 && ClubState.week === 3) {
                ClubState.openingTournamentType = 'district';
                ClubState.viewPhase = 'tournament_opening';
                saveClubData();
                renderClubUI();
            } else if (ClubState.month === 3 && ClubState.week === 4 && ClubState.qualifiedForNational) {
                ClubState.openingTournamentType = 'national';
                ClubState.viewPhase = 'tournament_opening';
                saveClubData();
                renderClubUI();
            }
        },

        proceedFromOpeningToMatch: function () {
            const type = ClubState.openingTournamentType;
            if (type === 'interhigh_district') {
                triggerInterhighDistrictTournament();
            } else if (type === 'interhigh_national') {
                triggerInterhighNationalTournament();
            } else if (type === 'district') {
                triggerDistrictTournament();
            } else if (type === 'national') {
                triggerNationalTournament();
            }
            ClubState.viewPhase = 'match_sim';
            saveClubData();
            renderClubUI();
        },

        debugTriggerDistrictTournament: function () {
            if (ClubState.members.length < 5) {
                alert(`団体戦大会には最低5名の部員が必要です（現在: ${ClubState.members.length}名）。部員が不足しているため大会を開始できません。`);
                return;
            }
            triggerDistrictTournament();
        },

        debugTriggerInterhighDistrictTournament: function () {
            if (ClubState.members.length === 0) {
                alert('部員が不在のため大会を開始できません。');
                return;
            }
            triggerInterhighDistrictTournament();
        },

        debugTriggerInterhighNationalTournament: function () {
            if (ClubState.members.length === 0) {
                alert('部員が不在のため大会を開始できません。');
                return;
            }
            triggerInterhighNationalTournament();
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
                    if (isCaptainAutoUnlocked() && ClubState.captainAutoMode) {
                        simulateAIBout(curBout);
                        boutsData.currentBoutIndex++;
                        if (boutsData.currentBoutIndex >= boutsData.bouts.length) {
                            boutsData.isFinished = true;
                            if (match.isIndividual) {
                                evaluateIndividualRound(boutsData);
                            } else {
                                evaluateTeamMatch(boutsData);
                            }
                        }
                        saveClubData();
                        renderClubUI();
                    } else {
                        window.KendoClub.launchPlayerBout();
                    }
                } else {
                    simulateAIBout(curBout);
                    boutsData.currentBoutIndex++;
                    if (boutsData.currentBoutIndex >= boutsData.bouts.length) {
                        boutsData.isFinished = true;
                        if (match.isIndividual) {
                            evaluateIndividualRound(boutsData);
                        } else {
                            evaluateTeamMatch(boutsData);
                        }
                    }
                    saveClubData();
                    renderClubUI();
                }
            }
        },

        simulatePlayerBoutInstant: function () {
            clearAutoSpectateTimers();
            const match = ClubState.currentMatchData;
            if (!match || !match.activeBouts || match.activeBouts.isFinished) return;

            const boutsData = match.activeBouts;
            const curBout = boutsData.bouts[boutsData.currentBoutIndex];
            if (curBout && !curBout.played) {
                simulateAIBout(curBout);
                boutsData.currentBoutIndex++;
                if (boutsData.currentBoutIndex >= boutsData.bouts.length) {
                    boutsData.isFinished = true;
                    if (match.isIndividual) {
                        evaluateIndividualRound(boutsData);
                    } else {
                        evaluateTeamMatch(boutsData);
                    }
                }
                saveClubData();
                renderClubUI();
            }
        },

        toggleCaptainAutoMode: function () {
            if (!isCaptainAutoUnlocked()) return;
            ClubState.captainAutoMode = !ClubState.captainAutoMode;
            saveClubData();
            renderClubUI();
        },

        skipToPlayerOrEnd: function () {
            clearAutoSpectateTimers();
            const match = ClubState.currentMatchData;
            if (!match || !match.activeBouts || match.activeBouts.isFinished) return;

            const boutsData = match.activeBouts;
            const totalBouts = boutsData.bouts.length;
            const canAutoCaptain = isCaptainAutoUnlocked() && ClubState.captainAutoMode;

            while (boutsData.currentBoutIndex < totalBouts) {
                const curBout = boutsData.bouts[boutsData.currentBoutIndex];
                if (curBout.isPlayerBout && !curBout.played && !canAutoCaptain) {
                    saveClubData();
                    renderClubUI();
                    return;
                }
                if (!curBout.played) simulateAIBout(curBout);
                boutsData.currentBoutIndex++;
            }

            boutsData.isFinished = true;
            if (match.isIndividual) {
                evaluateIndividualRound(boutsData);
            } else {
                evaluateTeamMatch(boutsData);
            }
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
                const totalBouts = boutsData.bouts.length;
                while (boutsData.currentBoutIndex < totalBouts) {
                    const curBout = boutsData.bouts[boutsData.currentBoutIndex];
                    if (curBout.isPlayerBout && !curBout.played) break;
                    if (!curBout.played) {
                        simulateAIBout(curBout);
                        boutsData.currentBoutIndex++;
                        if (boutsData.currentBoutIndex >= totalBouts) {
                            boutsData.isFinished = true;
                            if (match.isIndividual) {
                                evaluateIndividualRound(boutsData);
                            } else {
                                evaluateTeamMatch(boutsData);
                            }
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
            const isIndividual = !!match.isIndividual;
            const isIntraClub = !!curBout.isIntraClub;

            let enemyPatterns = [];
            if (enemyMember.stance === 'jodan' || enemyMember.favStance === 'jodan') {
                enemyPatterns = [
                    { stance: 'jodan', hint: `🔥【上段の構え】${enemyMember.name}は頭上に構え「上段面(2ダメ)」を狙う！（「胴」で躱すか、「防御」で防いで応じ技を狙え！）`, isDanger: true, weights: { 面: 60, 小手: 25, 胴: 15, 防御: 0, 崩し: 0, 突き: 0 } },
                    { stance: 'chudan', hint: `⚖️【中段の構え】${enemyMember.name}は中段に戻りつつ「面」か「小手」を狙っている…（「防御」や「胴」が有効）`, isDanger: false, weights: { 面: 45, 小手: 35, 胴: 15, 防御: 5, 崩し: 0, 突き: 0 } },
                ];
            } else if (enemyMember.stance === 'waki' || enemyMember.favStance === 'waki') {
                enemyPatterns = [
                    { stance: 'waki', hint: `🌊【下段の構え】${enemyMember.name}は竹刀を低く構え「後の先防御」か「抜き胴」を狙う！（崩しが有効！）`, isDanger: false, weights: { 防御: 50, 胴: 30, 小手: 15, 面: 5, 崩し: 0, 突き: 0 } },
                    { stance: 'chudan', hint: `⚖️【中段の構え】${enemyMember.name}は間合いを測りながら鋭い「小手」を狙う！`, isDanger: false, weights: { 小手: 50, 防御: 25, 面: 15, 胴: 10, 崩し: 0, 突き: 0 } },
                ];
            } else {
                enemyPatterns = [
                    { stance: 'chudan', hint: `⚖️【中段の構え】${enemyMember.name}は真っ直ぐ「面」か「小手」を狙っている！`, isDanger: false, weights: { 面: 45, 小手: 30, 胴: 15, 防御: 10, 崩し: 0, 突き: 0 } },
                    { stance: 'chudan', hint: `🛡️【中段の構え】${enemyMember.name}は守りを固めつつ隙を伺っている…（崩しの好機！）`, isDanger: false, weights: { 防御: 40, 面: 30, 小手: 20, 胴: 10, 崩し: 0, 突き: 0 } },
                ];
            }

            const enemySchool = isIntraClub
                ? ClubState.schoolName
                : (curBout.schoolName || boutsData.schoolName || (enemyMember && enemyMember.schoolName) || '');
            let enemyNameLabel = enemySchool ? `${enemySchool}・${enemyMember.name}` : enemyMember.name;
            let enemyIntroQuote = isIntraClub
                ? `「主将、全力を尽くして一本を狙います！」`
                : (isIndividual
                    ? (enemyMember.grade === 3
                        ? `「高校3年間、この日のために鍛え上げてきた！簡単には通さんぞ！」`
                        : `「${enemyMember.title || '個人代表'}の意地、見せてやる！」`)
                    : `「2年間積み上げてきた我らの剣道、受けてみろ！」`);

            const enemyArmorTheme = enemyMember.armorTheme || {
                doStops: ['#3b0764', '#581c87', '#7e22ce', '#3b0764', '#1e1b4b'],
                muneFill: '#1e1b4b',
                muneStitch: 'rgba(232, 121, 249, 0.85)',
                tareLine: 'rgba(232, 121, 249, 0.65)',
            };

            const enemyPref = isIntraClub
                ? ClubState.prefecture
                : (curBout.pref || boutsData.pref || (enemyMember && enemyMember.pref) || (curBout.enemyFighter && curBout.enemyFighter.pref) || (match.type === 'district' || match.type === 'interhigh_district' ? ClubState.prefecture : ''));

            let tourneyTypeTheme = 'district';
            if (match.type === 'national' || match.type === 'interhigh_national') {
                tourneyTypeTheme = 'national';
            }

            if (window.KendoGameEngine && window.KendoGameEngine.startCustomMatch) {
                window.KendoGameEngine.startCustomMatch({
                    isIndividual: isIndividual,
                    isIntraClub: isIntraClub,
                    roundName: boutsData.roundName || '',
                    boutPosName: curBout.posName || '',
                    isSpectating: isSpectating,
                    tournamentType: tourneyTypeTheme,
                    playerData: {
                        id: playerMember.id,
                        face: playerMember.face,
                        name: playerMember.name,
                        grade: playerMember.grade || (playerMember.isPlayer && ClubState.captain ? ClubState.captain.grade : (ClubState.year || 1)),
                        schoolName: ClubState.schoolName,
                        prefecture: ClubState.prefecture,
                        roleTitle: isIndividual
                            ? (playerMember.isPlayer ? '主将' : (playerMember.grade ? `${playerMember.grade}年` : ''))
                            : (playerMember.isPlayer && curBout.posName === '大将' ? '大将（主将）' : curBout.posName),
                        maxHealth: playerMember.maxHealth,
                        initialKiai: 0,
                        favStance: playerMember.favStance || 'chudan',
                        skills: playerMember.skills,
                        specialTechnique: playerMember.specialTechnique,
                        str: playerMember.str,
                        agi: playerMember.agi,
                        spi: playerMember.spi,
                        armorTheme: playerMember.armorTheme,
                    },
                    enemyData: {
                        id: enemyMember.id || `opp_${enemyMember.name}`,
                        face: enemyMember.face,
                        originalMember: enemyMember,
                        name: enemyNameLabel,
                        schoolName: enemySchool,
                        prefecture: enemyPref,
                        shortName: enemyMember.name,
                        grade: enemyMember.grade || (enemyMember.role && enemyMember.role.match(/([1-3])年/)?.[1]) || (isIndividual ? 3 : 2),
                        role: isIndividual
                            ? (isIntraClub ? (enemyMember.isPlayer ? '主将' : (enemyMember.grade ? `${enemyMember.grade}年` : '')) : (enemyMember.role || (enemyMember.grade ? `${enemyMember.grade}年 個人代表` : '3年 個人代表')))
                            : sanitizePosName(enemyMember.role || curBout.posName),
                        rank: isIndividual
                            ? (enemyMember.title && !['代表剣士', '高校剣士', '代表選手'].includes(enemyMember.title) ? enemyMember.title : '')
                            : '',
                        styleTag: `${(enemyMember.stance || enemyMember.favStance) === 'jodan' ? '上段' : (enemyMember.stance || enemyMember.favStance) === 'waki' ? '下段の構え' : '中段'}の気迫`,
                        maxHealth: enemyMember.hp || enemyMember.maxHealth || 6,
                        initialKiai: 0,
                        str: enemyMember.str,
                        agi: enemyMember.agi,
                        spi: enemyMember.spi,
                        skills: enemyMember.skills || { men: 10, kote: 10, do: 10, tsuki: 8 },
                        specialTechnique: enemyMember.specialTechnique || 'hien_men',
                        introQuote: enemyIntroQuote,
                        armorTheme: enemyArmorTheme,
                        patterns: enemyPatterns,
                    },
                    onMatchEnd: function (result) {
                        curBout.played = true;
                        const techFullNames = { 'メ': '面', 'コ': '小手', 'ド': '胴', 'ツ': '突き', '反': '反則' };
                        let winnerSide = 'draw';

                        if (result.winner === 'player') {
                            curBout.winner = 'my';
                            winnerSide = 'my';
                            const winKana = (result.myScore && result.myScore.length > 0)
                                ? result.myScore[result.myScore.length - 1]
                                : (result.winningKana || 'メ');
                            curBout.myScore = [winKana];
                            curBout.enemyScore = [];
                            const moveName = techFullNames[winKana] || result.winningMove || '面';
                            curBout.log.push(isSpectating
                                ? `【観戦】${playerMember.name}が勝負を決める鮮やかな【${moveName}】を放ち、見事に勝利を収めました！`
                                : `【実戦】あなたが勝負を決める鮮やかな【${moveName}】を一閃！勝利を掴み取りました！`);
                        } else if (result.winner === 'enemy') {
                            curBout.winner = 'enemy';
                            winnerSide = 'enemy';
                            const winKana = (result.enemyScore && result.enemyScore.length > 0)
                                ? result.enemyScore[result.enemyScore.length - 1]
                                : (result.winningKana || 'メ');
                            curBout.myScore = [];
                            curBout.enemyScore = [winKana];
                            const moveName = techFullNames[winKana] || result.winningMove || '面';
                            curBout.log.push(isSpectating
                                ? `【観戦】${playerMember.name}は相手の勝負を決める鋭い【${moveName}】に屈し惜敗…`
                                : `【実戦】相手の勝負を決める鋭い【${moveName}】に屈し惜敗…！`);
                        } else {
                            // 個人戦での引き分け防止（延長一本勝負判定）
                            if (isIndividual) {
                                curBout.winner = 'my';
                                winnerSide = 'my';
                                curBout.myScore = ['メ'];
                                curBout.enemyScore = [];
                                curBout.log.push(`【延長戦】息詰まる攻防の末、${playerMember.name}が意地の【面】を決めて激闘を制しました！`);
                            } else {
                                curBout.winner = 'draw';
                                winnerSide = 'draw';
                                curBout.myScore = [];
                                curBout.enemyScore = [];
                                const isMutual = result.winningMove === '相打ち' || (result.playerHp <= 0 && result.enemyHp <= 0);
                                const drawReason = isMutual ? '相打ちにより引き分け！' : '決定打なく引き分け！';
                                curBout.log.push(isSpectating
                                    ? `【観戦】互いに譲らぬ攻防の末、${drawReason}`
                                    : `【主将実戦】互いに譲らぬ攻防の末、${drawReason}`);
                            }
                        }

                        // 個人戦トーナメントブラケットへの結果反映
                        if (isIndividual) {
                            applyIndividualMatchOutcome(curBout, winnerSide, curBout.myScore, curBout.enemyScore, curBout.log);
                        }

                        // 試合結果に基づくパラメータ成長＆疲労度蓄積
                        const realPlayerMember = getRealClubMember(playerMember) || playerMember;
                        const stats = result.boutStats || {
                            hits: result.winner === 'player' ? 1 : 0,
                            blocks: 0,
                            rounds: result.rounds || 3,
                            winningMove: result.winner === 'player' ? (result.winningMove || '面') : null,
                            pushWins: 0,
                        };
                        if (result.winner === 'player' && !stats.winningMove && result.winningMove) {
                            stats.winningMove = result.winningMove;
                        }
                        const growth = applyBoutGrowth(realPlayerMember, stats);
                        if (growth) {
                            curBout.log.push(growth.summary);
                        }

                        // 同門対決の場合、敵側（仲間部員）にもパラメータ成長を適用！
                        if (isIntraClub) {
                            const realEnemyMember = getRealClubMember(enemyMember);
                            if (realEnemyMember) {
                                const isEnemyWin = result.winner === 'enemy';
                                const enemyStats = {
                                    hits: isEnemyWin ? 1 : 0,
                                    blocks: 1,
                                    rounds: result.rounds || 3,
                                    winningMove: isEnemyWin ? (result.winningMove || '面') : null,
                                    pushWins: 0,
                                };
                                const enemyGrowth = applyBoutGrowth(realEnemyMember, enemyStats);
                                if (enemyGrowth) {
                                    curBout.log.push(`【${realEnemyMember.name}】${enemyGrowth.summary}`);
                                }
                            }
                        }

                        boutsData.currentBoutIndex++;
                        if (boutsData.currentBoutIndex >= boutsData.bouts.length) {
                            boutsData.isFinished = true;
                            if (match.isIndividual) {
                                evaluateIndividualRound(boutsData);
                            } else {
                                evaluateTeamMatch(boutsData);
                            }
                        }

                        saveClubData();

                        // 試合終了・結果反映時はBGMを停止
                        if (window.KendoBGM && window.KendoBGM.stop) {
                            window.KendoBGM.stop();
                        }

                        // 1試合終了後はスコアボード画面を表示
                        if (window.KendoGameEngine && window.KendoGameEngine.showClubScreen) {
                            window.KendoGameEngine.showClubScreen();
                        }

                        // リアルタイム観戦が有効で、次の試合が存在し、かつ次の試合が手動操作を要求しない場合（主将自動化有効を含む）
                        const nextBout = boutsData.bouts[boutsData.currentBoutIndex];
                        const canAutoCaptain = isCaptainAutoUnlocked() && ClubState.captainAutoMode;
                        const isNextAllowed = nextBout && !nextBout.played && (!nextBout.isPlayerBout || canAutoCaptain);
                        const shouldContinueSpectating = ClubState.isAutoSpectating && isNextAllowed;

                        if (shouldContinueSpectating) {
                            renderClubUI();
                            startAutoSpectateCountdown();
                        } else {
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
            if (window.KendoBGM && window.KendoBGM.stop) {
                window.KendoBGM.stop();
            }
            renderClubUI();
        },

        advanceTournamentRound: function () {
            const match = ClubState.currentMatchData;
            if (!match) return;
            match.currentRoundIdx++;
            if (match.bracket) {
                match.bracket.currentRoundIdx = match.currentRoundIdx;
            }
            setupCurrentBouts();
            ClubState.viewPhase = 'match_sim';
            saveClubData();
            renderClubUI();
        },

        finishTournament: function (rank) {
            const match = ClubState.currentMatchData;
            if (!match) return;

            const isWin = rank === 'win';
            const rankLabel = isWin ? '優勝' : rank;
            const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
            const capName = captain ? captain.name : '主将';

            if (match.type === 'interhigh_district') {
                // インターハイ予選（個人戦）
                ClubState.lastInterhighDistrictRank = rankLabel;
                if (!ClubState.stats.interhighDistrict) {
                    ClubState.stats.interhighDistrict = { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
                }
                ClubState.stats.interhighDistrict.total++;
                if (isWin) {
                    ClubState.stats.interhighDistrict.win++;
                    ClubState.qualifiedForInterhigh = true;
                } else if (rankLabel === '準優勝') {
                    ClubState.stats.interhighDistrict.runnerUp++;
                    ClubState.qualifiedForInterhigh = true;
                } else if (rankLabel === 'ベスト4') {
                    ClubState.stats.interhighDistrict.best4++;
                } else if (rankLabel === 'ベスト8' || rankLabel === '2回戦敗退') {
                    ClubState.stats.interhighDistrict.best8++;
                }

                // 決勝進出者（優勝または準優勝の部員）をインターハイ全国出場権保持者として登録
                if (ClubState.qualifiedForInterhigh) {
                    const qualifiedMembers = (match.participants || []).filter((p) => p.isAlive || p.achievedRank === '準優勝').map((p) => p.memberId);
                    ClubState.interhighQualifiedMemberIds = qualifiedMembers.length > 0 ? qualifiedMembers : [captain.id];
                }

                const isQual = ClubState.qualifiedForInterhigh;
                ClubState.activityLog.unshift(`🏆【${ClubState.year}年目 6月1週】インターハイ都道県個人予選 終了。最高成績：${rankLabel}！${isQual ? '8月のインターハイ（全国高校総体）への出場が決定！' : ''}`);

            } else if (match.type === 'interhigh_national') {
                // インターハイ全国（個人戦）
                ClubState.lastInterhighNationalRank = rankLabel;
                if (!ClubState.stats.interhighNational) {
                    ClubState.stats.interhighNational = { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
                }
                ClubState.stats.interhighNational.total++;
                if (isWin) ClubState.stats.interhighNational.win++;
                else if (rankLabel === '準優勝') ClubState.stats.interhighNational.runnerUp++;
                else if (rankLabel === 'ベスト4') ClubState.stats.interhighNational.best4++;
                else if (rankLabel === 'ベスト8') ClubState.stats.interhighNational.best8++;

                ClubState.activityLog.unshift(`👑【${ClubState.year}年目 8月1週】全国高校総体（インターハイ）個人戦 終了。最高成績：${rankLabel}！`);

                // 全国大会終了に伴い、個人戦出場権をリセット（バッジを消去）
                ClubState.qualifiedForInterhigh = false;
                ClubState.interhighQualifiedMemberIds = [];

                if (isWin && (ClubState.stats.interhighNational.win + ClubState.stats.national.win) <= 1) {
                    ClubState.activityLog.unshift(`🏆【全国制覇・覇者特典】主将の試合自動化（オート観戦・即時判定）が解放されました！`);
                    ClubState.captainAutoUnlocked = true;
                    ClubState.captainAutoMode = true;
                    setPermanentPerk('captainAutoUnlocked', true);
                }

            } else if (match.type === 'district') {
                // 選抜地区大会（団体戦）
                ClubState.lastDistrictRank = rankLabel;
                ClubState.stats.district.total++;
                if (isWin) {
                    ClubState.stats.district.win++;
                    ClubState.qualifiedForNational = true;
                } else if (rankLabel === '準優勝') ClubState.stats.district.runnerUp++;
                else if (rankLabel === 'ベスト4') ClubState.stats.district.best4++;
                else if (rankLabel === 'ベスト8') ClubState.stats.district.best8++;

                ClubState.activityLog.unshift(`🏆【${ClubState.year}年目 12月3週】${ClubState.prefecture}大会（選抜予選） 終了。成績：${rankLabel}！${isWin ? '全国選抜大会への出場が決定！' : ''}`);

            } else {
                // 全国選抜大会（団体戦）
                ClubState.lastNationalRank = rankLabel;
                ClubState.stats.national.total++;
                if (isWin) ClubState.stats.national.win++;
                else if (rankLabel === '準優勝') ClubState.stats.national.runnerUp++;
                else if (rankLabel === 'ベスト4') ClubState.stats.national.best4++;
                else if (rankLabel === 'ベスト8') ClubState.stats.national.best8++;

                ClubState.activityLog.unshift(`👑【${ClubState.year}年目 3月4週】全国高校選抜大会 終了。成績：${rankLabel}！`);
                if (isWin && (ClubState.stats.interhighNational.win + ClubState.stats.national.win) <= 1) {
                    ClubState.activityLog.unshift(`🏆【全国制覇・覇者特典】主将の試合自動化（オート観戦・即時判定）が解放されました！`);
                    ClubState.captainAutoUnlocked = true;
                    ClubState.captainAutoMode = true;
                    setPermanentPerk('captainAutoUnlocked', true);
                }
            }

            // 年度レコード（ClubState.history）の同期・更新
            let curHistory = ClubState.history.find((h) => h.year === ClubState.year);
            if (!curHistory) {
                curHistory = {
                    year: ClubState.year,
                    captainName: capName,
                    districtResult: ClubState.lastDistrictRank || '未開催',
                    nationalResult: ClubState.lastNationalRank || '未開催',
                    interhighDistrictResult: ClubState.lastInterhighDistrictRank || '不出場',
                    interhighNationalResult: ClubState.lastInterhighNationalRank || '不出場',
                };
                ClubState.history.unshift(curHistory);
            } else {
                curHistory.captainName = capName;
                if (ClubState.lastDistrictRank) curHistory.districtResult = ClubState.lastDistrictRank;
                if (ClubState.lastNationalRank) curHistory.nationalResult = ClubState.lastNationalRank;
                if (ClubState.lastInterhighDistrictRank) curHistory.interhighDistrictResult = ClubState.lastInterhighDistrictRank;
                if (ClubState.lastInterhighNationalRank) curHistory.interhighNationalResult = ClubState.lastInterhighNationalRank;
            }

            // 出場部員の大会戦績ボーナス（心技体のパラメータ成長）の適用
            const isNational = match.type === 'interhigh_national' || match.type === 'national';
            const growthResults = [];

            if (match.isIndividual) {
                // 個人戦：出場した各自校部員の戦績に応じた成長ボーナス
                const participants = match.participants || [];
                participants.forEach((p) => {
                    const realM = getRealClubMember(p);
                    if (!realM) return;
                    let mRank = p.achievedRank || rankLabel;
                    if (isWin && p.isAlive) {
                        mRank = '優勝';
                    }
                    const res = applyTournamentRankBonus(realM, mRank, isNational, true);
                    if (res) growthResults.push(res);
                });
            } else {
                // 団体戦：オーダー表の出場部員5名にチーム戦績に応じた成長ボーナス
                for (let i = 0; i < 5; i++) {
                    const memberId = ClubState.order[i];
                    const realM = ClubState.members.find((m) => m.id === memberId);
                    if (!realM) continue;
                    const res = applyTournamentRankBonus(realM, rankLabel, isNational, false);
                    if (res) growthResults.push(res);
                }
            }

            // 活動ログへの記録
            growthResults.forEach((res) => {
                ClubState.activityLog.unshift(`📈【大会戦績成長】${res.summary}`);
            });

            // 表彰式・閉会式セレモニーデータを準備して画面遷移
            const ceremonyData = prepareCeremonyResultData(match, rankLabel, growthResults);
            ClubState.ceremonyResultData = ceremonyData;
            ClubState.viewPhase = 'tournament_ceremony';
            saveClubData();
            renderClubUI();
        },

        proceedFromCeremonyToDashboard: function () {
            // 🏆 表彰状画面のBGMを確実に停止
            if (window.KendoBGM && window.KendoBGM.stop) {
                window.KendoBGM.stop();
            }

            ClubState.ceremonyResultData = null;
            ClubState.currentMatchData = null;
            ClubState.viewPhase = 'dashboard';

            // 大会終了後はまず必ず練習メニューの画面に戻すため、イベントの即時遷移は保留(deferEvent: true)
            advanceCalendarWeek(true);
            saveClubData();
            renderClubUI();
        },

        proceedFromFreshmanWelcomeToDashboard: function () {
            proceedFromFreshmanWelcomeToDashboard();
        },

        proceedFromRetireCeremonyToCaptainSelect: function () {
            proceedFromRetireCeremonyToCaptainSelect();
        },

        proceedFromRetireCeremonyToDashboard: function () {
            proceedFromRetireCeremonyToDashboard();
        },

        proceedFromNewTeamCeremonyToDashboard: function () {
            proceedFromNewTeamCeremonyToDashboard();
        },

        proceedFromPrologueToDashboard: function () {
            proceedFromPrologueToDashboard();
        },

        skipPrologueVideo: function () {
            skipPrologueVideo();
        },

        proceedFromPrologueVideoToStory: function () {
            proceedFromPrologueVideoToStory();
        },

        replayPrologueVideo: function () {
            replayPrologueVideo();
        },

        syncPrologueVideoAudio: function () {
            syncPrologueVideoAudio();
        },

        showClubEnding: function () {
            showClubEnding();
        },

        previewOpening: function (type = 'interhigh_district') {
            ClubState.openingTournamentType = type;
            ClubState.viewPhase = 'tournament_opening';
            renderClubUI();
        },

        previewCeremony: function (type = 'interhigh_district', rank = '優勝') {
            const mockMatch = {
                type: type,
                isIndividual: type.startsWith('interhigh'),
            };
            const captain = ClubState.members.find((m) => m.isPlayer) || ClubState.members[0];
            const capName = captain ? captain.name : '主将';
            const mockGrowth = [
                {
                    name: capName,
                    rankLabel: rank,
                    gains: ['気魄+3', '腕力+2', '敏捷+2', '面+3', '体力+1'],
                }
            ];
            ClubState.ceremonyResultData = prepareCeremonyResultData(mockMatch, rank, mockGrowth);
            ClubState.viewPhase = 'tournament_ceremony';
            renderClubUI();
        },

        confirmReset: function () {
            if (confirm('剣道部のデータを初期化し、高校名・主将の入力からやり直しますか？')) {
                resetClubData();
                renderClubUI();
                updateModeCardUI();
            }
        },

        getClubState: function () {
            return ClubState;
        },

        isCaptainAutoUnlocked: function () {
            return isCaptainAutoUnlocked();
        },

        reconcileBracketData: function (bracket) {
            reconcileBracketData(bracket);
        },

        simulateAIBout: function (bout) {
            return simulateAIBout(bout);
        },

        applyBoutGrowth: function (member, stats) {
            return applyBoutGrowth(member, stats);
        },

        getFatigueGrowthMultiplier: function (fatigue) {
            return getFatigueGrowthMultiplier(fatigue);
        },

        applyTournamentRankBonus: function (member, rankLabel, isNational, isIndividual) {
            return applyTournamentRankBonus(member, rankLabel, isNational, isIndividual);
        },

        prepareCeremonyResultData: function (match, rankLabel, growthResults = []) {
            return prepareCeremonyResultData(match, rankLabel, growthResults);
        },

        getIndividualRankLabel: function (roundIdx, totalRounds) {
            return getIndividualRankLabel(roundIdx, totalRounds);
        },

        getRealClubMember: function (target) {
            return getRealClubMember(target);
        },

        growStat: function (m, category, key, baseGain) {
            return growStat(m, category, key, baseGain);
        },

        completeEvent: function () {
            completeClubEvent();
        },

        launchPendingEvent: function () {
            if (!ClubState.pendingEventData) return;
            ClubState.currentEventData = ClubState.pendingEventData;
            ClubState.pendingEventData = null;
            ClubState.viewPhase = 'event_scene';
            saveClubData();
            renderClubUI();
        },

        launchNewSchoolYear: function () {
            if (!ClubState.pendingNewSchoolYear) return;
            ClubState.pendingNewSchoolYear = false;
            executeNewSchoolYear();
        },

        triggerEventById: function (eventId) {
            const ev = CLUB_EVENTS.find(e => e.id === eventId);
            if (ev) {
                if (ev.category === 'seasonal') {
                    markEventTriggeredThisYear(ev.id);
                }
                triggerClubEvent(ev);
                saveClubData();
                renderClubUI();
                return true;
            }
            return false;
        },

        getEvents: function () {
            return CLUB_EVENTS;
        },

        clearMobilePortal: function () {
            clearMobilePortal();
        },
    };

    // DOMロード時にモードカードUIを最新セーブデータ状態に合わせて描画
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateModeCardUI);
    } else {
        updateModeCardUI();
    }
})();
