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

        // 各部員の隠し成長率（通常部員: 80%〜120%、助っ人部員: 50%）
        const gRate = (m && typeof m.growthRate === 'number') ? m.growthRate : 1.0;
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
            desc: '刀を低く構える下段の構えから相手の打ち気を誘い、電撃の返し胴を炸裂させる職人肌。'
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

    // 部員の隠し成長率の生成（助っ人部員以外は80%〜120%の範囲で個性を付与）
    function generateGrowthRate(archetype, isPlayer = false) {
        let min = 0.82;
        let max = 1.18;
        if (archetype && archetype.id === 'talent') {
            min = 1.05;
            max = 1.20;
        } else if (archetype && archetype.id === 'allround') {
            min = 0.95;
            max = 1.12;
        } else if (isPlayer) {
            min = 0.98;
            max = 1.18;
        }
        const val = min + Math.random() * (max - min);
        return Math.round(Math.min(1.20, Math.max(0.80, val)) * 100) / 100;
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
            growthRate: generateGrowthRate(archetype, isPlayer), // 助っ人部員以外は80〜120%の隠しパラメータ
            maxHealth: Math.min(8, baseHp),
            str: baseStr,
            agi: baseAgi,
            spi: baseSpi,
            skills: skills,
            favStance: stance,
            condition: getRandomItem(['good', 'normal', 'normal', 'best']),
            fatigue: 0,
            desc: desc,
            armorTheme: null,
        };

        const existingThemes = (ClubState.members || []).map(item => item.armorTheme && item.armorTheme.themeId).filter(Boolean);
        assignMemberArmorTheme(m, existingThemes);
        return m;
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
            growthRate: 0.50, // 助っ人部員は成長率50%（隠しパラメータ）
            maxHealth: Math.min(8, baseHp),
            str: baseStr,
            agi: baseAgi,
            spi: baseSpi,
            skills: skills,
            favStance: tpl.stance || 'chudan',
            condition: getRandomItem(['good', 'normal', 'normal']),
            fatigue: 0,
            desc: tpl.desc,
            armorTheme: null,
        };

        const existingThemes = (ClubState.members || []).map(item => item.armorTheme && item.armorTheme.themeId).filter(Boolean);
        assignMemberArmorTheme(m, existingThemes);
        return m;
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

        // 初期メンバー7名全員に重複のない防具テーマを確実に割り当て
        members.forEach((m, idx) => {
            m.armorTheme = null;
            const used = members.slice(0, idx).map(other => other.armorTheme && other.armorTheme.themeId).filter(Boolean);
            assignMemberArmorTheme(m, used);
        });

        // 先鋒〜大将の初期オーダー（新1年生は全員控え、2・3年生をレギュラー、主将を大将に配置）
        const order = [
            members[3].id, // 2年（先鋒）
            members[4].id, // 2年（次鋒）
            members[1].id, // 3年（中堅）
            members[2].id, // 3年（副将）
            captain.id,    // 2年主将（大将）
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
        qualifiedForInterhigh: false, // 6月1週地区準優勝以上でtrueに
        interhighQualifiedMemberIds: [], // 全国大会出場権を獲得した部員ID
        lastDistrictRank: null,      // 直近の成績 ('win', 'runnerUp', 'best4', etc.)
        lastNationalRank: null,
        lastInterhighDistrictRank: null,
        lastInterhighNationalRank: null,
        activityLog: [],
        viewPhase: 'dashboard',      // 'setup' | 'dashboard' | 'order_edit' | 'match_sim' | 'match_result' | 'history' | 'captain_select' | 'tournament_opening' | 'tournament_ceremony'
        openingTournamentType: null, // 開会式表示中の大会種別
        ceremonyResultData: null,    // 閉会・表彰式表示用のデータ
        currentMatchData: null,      // 進行中の大会試合
        selectedSpecialTargetId: null, // 前回選択した特別指導対象部員ID
        selectedPracticeMenu: null,    // 現在選択中の練習メニュー (クリック後に 'basics' | 'suburi' | 'kakari' | 'zazen' | 'rest' | 'special')
        isPracticeExecuting: false,     // 稽古演出中フラグ
        executingPracticeMotion: null,  // 実行演出中の稽古モーション
        practiceExecutionStartTime: 0,  // 稽古クリック時の開始時刻（得意構えからの始動用）
        practiceCompleted1Cycle: false, // 座禅・休養の1回アニメーション完了フラグ
        memberGridScrollLeft: -1,       // 部員カード一覧の横スクロール位置保持（初期値-1: ゲーム開始時右端の大将を表示）
        isRestPosture: false,           // 休養後に納刀状態で待機するフラグ
        specialPracticeAttacks: null,   // マンツーマン特別指導時の主将・指名部員のランダム攻撃情報
        isAutoSpectating: false,     // 主将の出番まで連続リアルタイム観戦中フラグ
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
                currentMatchData: ClubState.currentMatchData,
                selectedSpecialTargetId: ClubState.selectedSpecialTargetId,
                selectedPracticeMenu: ClubState.selectedPracticeMenu,
                memberGridScrollLeft: ClubState.memberGridScrollLeft,
                isRestPosture: !!ClubState.isRestPosture,
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
                    if (!m.armorTheme || !m.armorTheme.themeName) {
                        const existingThemes = ClubState.members.filter(other => other !== m && other.armorTheme && other.armorTheme.themeId).map(other => other.armorTheme.themeId);
                        assignMemberArmorTheme(m, existingThemes);
                    }
                    if (!m.growthRate || (!m.isClubDual && (m.growthRate < 0.80 || m.growthRate > 1.20 || m.growthRate === 1.0))) {
                        if (m.isClubDual) {
                            m.growthRate = 0.50;
                        } else {
                            const arch = MEMBER_ARCHETYPES.find((a) => a.id === m.archetypeId);
                            m.growthRate = generateGrowthRate(arch, m.isPlayer);
                        }
                    }
                });
            }
            if (Array.isArray(data.order)) ClubState.order = data.order;
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
            ClubState.currentMatchData = data.currentMatchData || null;
            if (ClubState.currentMatchData && ClubState.currentMatchData.bracket) {
                reconcileBracketData(ClubState.currentMatchData.bracket);
            }
            ClubState.selectedSpecialTargetId = data.selectedSpecialTargetId || null;
            if (data.selectedPracticeMenu) ClubState.selectedPracticeMenu = data.selectedPracticeMenu;
            ClubState.memberGridScrollLeft = typeof data.memberGridScrollLeft === 'number' ? data.memberGridScrollLeft : -1;
            ClubState.isRestPosture = !!data.isRestPosture;
            if (Array.isArray(data.history)) ClubState.history = data.history;
            if (data.stats) {
                ClubState.stats = data.stats;
                if (!ClubState.stats.district) ClubState.stats.district = { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
                if (!ClubState.stats.national) ClubState.stats.national = { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
                if (!ClubState.stats.interhighDistrict) ClubState.stats.interhighDistrict = { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
                if (!ClubState.stats.interhighNational) ClubState.stats.interhighNational = { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 };
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
        ClubState.qualifiedForInterhigh = false;
        ClubState.interhighQualifiedMemberIds = [];
        ClubState.lastDistrictRank = null;
        ClubState.lastNationalRank = null;
        ClubState.lastInterhighDistrictRank = null;
        ClubState.lastInterhighNationalRank = null;
        ClubState.activityLog = [];
        ClubState.viewPhase = 'setup';
        ClubState.currentMatchData = null;
        ClubState.selectedSpecialTargetId = null;
        ClubState.selectedPracticeMenu = null;
        ClubState.isPracticeExecuting = false;
        ClubState.executingPracticeMotion = null;
        ClubState.practiceExecutionStartTime = 0;
        ClubState.practiceCompleted1Cycle = false;
        ClubState.memberGridScrollLeft = -1;
        ClubState.isRestPosture = false;
        ClubState.specialPracticeAttacks = null;
        ClubState.history = [];
        ClubState.stats = {
            district: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            national: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            interhighDistrict: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
            interhighNational: { win: 0, runnerUp: 0, best4: 0, best8: 0, total: 0 },
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

        saveClubData();
        renderClubUI();
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

    // オーダー整合性チェック（新1年生および助っ人は初期値で控えとし、正規部員の上級生優先で埋める）
    function sanitizeOrder() {
        const validIds = new Set(ClubState.members.map((m) => m.id));
        const newOrder = ClubState.order.filter((id) => validIds.has(id));

        const usedIds = new Set(newOrder);

        // 1. 足りない枠は未配置の正規上級生（2年生・3年生、助っ人以外）から優先して埋める
        const seniors = ClubState.members.filter((m) => m.grade >= 2 && !m.isClubDual && !usedIds.has(m.id));
        seniors.forEach((m) => {
            if (newOrder.length < 5) {
                newOrder.push(m.id);
                usedIds.add(m.id);
            }
        });

        // 2. それでも部員不足で5枠に満たない場合のみ、正規の1年生（助っ人以外）を補填する
        if (newOrder.length < 5) {
            const freshmen = ClubState.members.filter((m) => m.grade === 1 && !m.isClubDual && !usedIds.has(m.id));
            freshmen.forEach((m) => {
                if (newOrder.length < 5) {
                    newOrder.push(m.id);
                    usedIds.add(m.id);
                }
            });
        }

        // ※ 助っ人（isClubDual）は初期値で必ず控え。ユーザーがオーダー編成で手動配置した場合のみ newOrder に入る。
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

        // 大将〜先鋒の割り当て（POS_NAMES: ['先鋒', '次鋒', '中堅', '副将', '大将']）
        // 大将（インデックス4）：戦力1位（最強）
        // 副将（インデックス3）：戦力2位
        // 中堅（インデックス2）：戦力3位
        // 次鋒（インデックス1）：戦力4位
        // 先鋒（インデックス0）：戦力5位
        const newOrder = [];
        if (sortedSelected.length >= 5) {
            newOrder[4] = sortedSelected[0].id; // 大将 (1位)
            newOrder[3] = sortedSelected[1].id; // 副将 (2位)
            newOrder[2] = sortedSelected[2].id; // 中堅 (3位)
            newOrder[1] = sortedSelected[3].id; // 次鋒 (4位)
            newOrder[0] = sortedSelected[4].id; // 先鋒 (5位)
        } else {
            // 部員が5人未満の場合も戦力上位が大将側になるように配置
            for (let i = 0; i < sortedSelected.length; i++) {
                newOrder.unshift(sortedSelected[i].id);
            }
        }

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
                noteGain.gain.exponentialRampToValueAtTime(0.065, now + idx * 0.05 + 0.015);
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

        // 実行前の部員全体ステータス合計を計測
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

        // パラメータがUPしていれば、爽やかなステータスUP効果音を再生！
        const postStatSum = getTeamStatSum();
        if (postStatSum > prevStatSum) {
            playStatUpSound();
        }

        ClubState.activityLog.unshift(logEntry);
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
        ClubState.practiceExecutionStartTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
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
        const btnGroup = document.querySelectorAll('.btn-practice, .btn-special-practice');
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
    // 個人戦用 対戦相手剣士の生成
    const FIGHTER_TITLES = [
        '疾風の小手使い', '剛腕の上段', '冷静沈着な間合いの鬼', '名門の切り札',
        '電光石火の飛び込み面', '不抜の守護神', '変幻自在の技巧派', '無心の剣客',
        '熱血のポイントゲッター', '重厚なる中段', '後の先を極めし者', '名門校の主将'
    ];

    function generateOpponentIndividual(schoolName, pref, powerGrade = 2, roundIdx = 0) {
        const stances = ['chudan', 'chudan', 'jodan', 'waki'];
        const stance = getRandomItem(stances);
        const gradeBonus = Math.floor(roundIdx * 0.8);
        const baseHp = 4 + (powerGrade >= 3 ? 1 : 0) + (Math.random() < 0.5 ? 1 : 0);
        const str = 10 + (powerGrade + gradeBonus) * 2 + Math.floor(Math.random() * 4);
        const agi = 10 + (powerGrade + gradeBonus) * 2 + Math.floor(Math.random() * 4);
        const spi = 10 + (powerGrade + gradeBonus) * 2 + Math.floor(Math.random() * 4);

        const surname = getRandomItem(SURNAMES);
        const title = getRandomItem(FIGHTER_TITLES);

        return {
            name: surname,
            fullName: `${surname}`,
            schoolName: schoolName,
            pref: pref,
            role: '個人代表',
            title: title,
            shortDesc: `${pref}・${schoolName}代表。「${title}」の異名をとる強豪剣士。`,
            hp: Math.min(8, baseHp),
            str: str,
            agi: agi,
            spi: spi,
            skills: {
                men: 10 + (powerGrade + gradeBonus) * 2,
                kote: 10 + (powerGrade + gradeBonus) * 2,
                do: 9 + (powerGrade + gradeBonus) * 2,
                tsuki: 8 + (powerGrade + gradeBonus) * 2,
            },
            stance: stance,
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

        // 残りの枠にライバル選手を配置
        for (let m = 0; m < firstRoundMatches; m++) {
            const matchNode = rounds[0].matches[m];

            if (!matchNode.playerA) {
                const oppPref = isNational ? getRandomItem(otherPrefs) : pref;
                const oppSchool = `${getRandomItem(SCHOOL_PREFIXES)}高校`;
                const fighter = generateOpponentIndividual(oppSchool, oppPref, isNational ? 3 : 2, 0);
                matchNode.playerA = {
                    id: `opp_${oppSchool}_${fighter.name}_${m}a`,
                    name: fighter.name,
                    schoolName: fighter.schoolName,
                    pref: fighter.pref,
                    isMyClub: false,
                    isPlayer: false,
                    title: fighter.title,
                    hp: fighter.hp,
                    str: fighter.str,
                    agi: fighter.agi,
                    spi: fighter.spi,
                    skills: fighter.skills,
                    stance: fighter.stance,
                    favStance: fighter.stance,
                    armorTheme: null,
                };
            }

            if (!matchNode.playerB) {
                const oppPref = isNational ? getRandomItem(otherPrefs) : pref;
                const oppSchool = `${getRandomItem(SCHOOL_PREFIXES)}高校`;
                const fighter = generateOpponentIndividual(oppSchool, oppPref, isNational ? 3 : 2, 0);
                matchNode.playerB = {
                    id: `opp_${oppSchool}_${fighter.name}_${m}b`,
                    name: fighter.name,
                    schoolName: fighter.schoolName,
                    pref: fighter.pref,
                    isMyClub: false,
                    isPlayer: false,
                    title: fighter.title,
                    hp: fighter.hp,
                    str: fighter.str,
                    agi: fighter.agi,
                    spi: fighter.spi,
                    skills: fighter.skills,
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
            bout.myScore = [t2];
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
            bout.enemyScore = [t2];
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
            // 4回戦制（地区予選）
            if (roundIdx === 0) return '初戦敗退';
            if (roundIdx === 1) return '2回戦敗退';
            if (roundIdx === 2) return 'ベスト4';
            return '準優勝';
        } else {
            // 5回戦制（全国大会）
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
        if (tourneyType === 'national' || tourneyType === 'interhigh_national') {
            document.body.classList.add('bg-national');
        } else if (tourneyType === 'district' || tourneyType === 'interhigh_district') {
            document.body.classList.add('bg-district');
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
                    const now = (typeof timeNow === 'number') ? timeNow : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
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
            const now = (typeof timeNow === 'number') ? timeNow : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
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
            const stanceLabel = member.favStance === 'jodan' ? '上段' : member.favStance === 'waki' ? '脇' : '中段';
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
        renderMiniCharaFrame(typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
    }

    function renderClubUI() {
        const container = document.getElementById('clubModeView');
        if (!container) return;

        // 既存の部員一覧の横スクロール位置があれば退避保存
        const existingGrid = container.querySelector('.club-members-grid');
        if (existingGrid) {
            ClubState.memberGridScrollLeft = existingGrid.scrollLeft;
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
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('farewell');
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
            // 大会終了・表彰状表示画面：bgm/The_Sunlit_Dojo.mp3 を1回のみ再生（ループなし）
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('ceremony');
            renderTournamentCeremony(container);
        } else {
            if (window.KendoBGM && window.KendoBGM.play) window.KendoBGM.play('club');
            renderDashboard(container);
            startClubMiniCharaLoop();
        }

        // ミニキャラCanvasを直ちに1フレーム描画
        drawAllMemberMiniCanvases();
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
                                <li><strong>6月1週</strong>：インターハイ都道府県個人予選！上位2名が全国大会へ！</li>
                                <li><strong>8月1週</strong>：インターハイ（全国高校総体）個人戦！全国の猛者と勝負！</li>
                                <li><strong>9月1週</strong>：3年生引退。2年生から次期主将を指名して歴史を紡ぐ！</li>
                                <li><strong>12月3週</strong>：選抜地区予選（団体戦）。優勝校のみ全国選抜へ！</li>
                                <li><strong>3月4週</strong>：全国高校剣道選抜大会（47都道府県代表団体戦）！</li>
                                <li><strong>4月1週</strong>：進級＆大会実績に応じた新入部員が入部。</li>
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
                        <span class="stat-summary-tag">戦力: ${Math.round(getMemberCombatPower(m))}</span>
                    </div>
                    <div class="member-mini-chara-wrap">
                        <div class="mini-chara-canvas-box">
                            <canvas class="member-mini-canvas" data-member-id="${m.id}" width="91" height="100"></canvas>
                        </div>
                        <div class="mini-chara-badge" style="background: ${(m.armorTheme && m.armorTheme.badgeBg) || 'rgba(15, 23, 42, 0.85)'}; border-color: ${(m.armorTheme && m.armorTheme.badgeBorder) || 'rgba(148, 163, 184, 0.45)'};">
                            <span class="mini-armor-dot" style="background: ${(m.armorTheme && m.armorTheme.dotColor) || '#64748b'};"></span>
                            <span class="mini-armor-name">胴: ${escapeHtml((m.armorTheme && m.armorTheme.themeName) || '黒漆塗')}</span>
                        </div>
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
                bannerHtml = `
                    <div class="tourney-alert ready gold">
                        <span class="pulse-icon">👑</span>
                        <div class="alert-body">
                            <strong>【8月1週 全国高校総体（インターハイ）個人戦】開幕！</strong>
                            <p>全国の強豪剣士が集う夢の舞台！個人の頂点・日本一を目指せ！</p>
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

            bannerHtml = `
                <div class="tourney-alert pending">
                    <span class="calendar-icon">📅</span>
                    <div class="alert-body">
                        <strong>次の重要日程：${nextEventText}</strong>
                        <p>${ClubState.qualifiedForInterhigh ? '🎖️ インターハイ個人戦出場権 獲得中！' : (ClubState.qualifiedForNational ? '🎖️ 全国選抜大会出場権 獲得中！' : '日々の稽古で心技体を練磨せよ！')}</p>
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
                    <div class="member-card-top">
                        <div class="member-header">
                            <span class="member-pos-badge">${pos}</span>
                            <span class="member-name">${escapeHtml(m.name)}</span>
                            <span class="member-grade-badge">${m.grade}年</span>
                            <span class="member-cond ${cond.textClass}" title="調子: ${cond.label}">${cond.icon}</span>
                        </div>
                        ${m.isClubDual ? `
                            <div class="member-dual-row">
                                <span class="member-dual-badge" title="${escapeHtml(m.originalClub)}と掛け持ちの助っ人部員">${escapeHtml(m.originalClub)}（助っ人）</span>
                            </div>
                        ` : ''}
                        <div class="member-desc">${escapeHtml(m.desc)}</div>
                    </div>
                    <div class="member-card-bottom">
                        <div class="member-radar-wrap">
                            ${generateRadarChartSvg(m, 220, 200)}
                        </div>
                        <div class="member-stats-summary-row">
                            <span class="stat-summary-tag">構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '脇' : '中段'}</span>
                            <span class="stat-summary-tag">戦力: ${Math.round(getMemberCombatPower(m))}</span>
                        </div>
                        <div class="member-fatigue-row">
                            <span class="fatigue-label">疲労度: ${m.fatigue}%</span>
                            <div class="fatigue-bar-wrap">
                                <div class="fatigue-bar-fill ${m.fatigue > 60 ? 'high' : ''}" style="width: ${m.fatigue}%;"></div>
                            </div>
                        </div>
                        <div class="member-mini-chara-wrap">
                            <div class="mini-chara-motion-badge" data-member-id="${m.id}">
                                <span class="motion-pulse-dot"></span>
                                <span class="motion-name">${getMemberMotionBadgeText(m)}</span>
                            </div>
                            <div class="mini-chara-canvas-box">
                                <canvas class="member-mini-canvas" data-member-id="${m.id}" width="91" height="100"></canvas>
                            </div>
                            <div class="mini-chara-badge" style="background: ${(m.armorTheme && m.armorTheme.badgeBg) || 'rgba(15, 23, 42, 0.85)'}; border-color: ${(m.armorTheme && m.armorTheme.badgeBorder) || 'rgba(148, 163, 184, 0.45)'};">
                                <span class="mini-armor-dot" style="background: ${(m.armorTheme && m.armorTheme.dotColor) || '#64748b'};"></span>
                                <span class="mini-armor-name">胴: ${escapeHtml((m.armorTheme && m.armorTheme.themeName) || '黒漆塗')}</span>
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
            return `
                <div class="club-member-card is-bench ${m.isPlayer ? 'is-player' : ''} ${m.isClubDual ? 'is-dual-club' : ''}">
                    <div class="member-card-top">
                        <div class="member-header">
                            <span class="member-pos-badge bench">控え</span>
                            <span class="member-name">${escapeHtml(m.name)}</span>
                            <span class="member-grade-badge">${m.grade}年</span>
                            <span class="member-cond ${cond.textClass}" title="調子: ${cond.label}">${cond.icon}</span>
                        </div>
                        ${m.isClubDual ? `
                            <div class="member-dual-row">
                                <span class="member-dual-badge" title="${escapeHtml(m.originalClub)}と掛け持ちの助っ人部員">${escapeHtml(m.originalClub)}（助っ人）</span>
                            </div>
                        ` : ''}
                        <div class="member-desc">${escapeHtml(m.desc)}</div>
                    </div>
                    <div class="member-card-bottom">
                        <div class="member-radar-wrap">
                            ${generateRadarChartSvg(m, 220, 200)}
                        </div>
                        <div class="member-stats-summary-row">
                            <span class="stat-summary-tag">構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '脇' : '中段'}</span>
                            <span class="stat-summary-tag">戦力: ${Math.round(getMemberCombatPower(m))}</span>
                        </div>
                        <div class="member-fatigue-row">
                            <span class="fatigue-label">疲労度: ${m.fatigue}%</span>
                            <div class="fatigue-bar-wrap">
                                <div class="fatigue-bar-fill ${m.fatigue > 60 ? 'high' : ''}" style="width: ${m.fatigue}%;"></div>
                            </div>
                        </div>
                        <div class="member-mini-chara-wrap">
                            <div class="mini-chara-motion-badge" data-member-id="${m.id}">
                                <span class="motion-pulse-dot"></span>
                                <span class="motion-name">${getMemberMotionBadgeText(m)}</span>
                            </div>
                            <div class="mini-chara-canvas-box">
                                <canvas class="member-mini-canvas" data-member-id="${m.id}" width="91" height="100"></canvas>
                            </div>
                            <div class="mini-chara-badge" style="background: ${(m.armorTheme && m.armorTheme.badgeBg) || 'rgba(15, 23, 42, 0.85)'}; border-color: ${(m.armorTheme && m.armorTheme.badgeBorder) || 'rgba(148, 163, 184, 0.45)'};">
                                <span class="mini-armor-dot" style="background: ${(m.armorTheme && m.armorTheme.dotColor) || '#64748b'};"></span>
                                <span class="mini-armor-name">胴: ${escapeHtml((m.armorTheme && m.armorTheme.themeName) || '黒漆塗')}</span>
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
                            </div>
                            <p class="special-desc">あなたが直接仲間を指名して重点指導。対象部員の全能力と技が大幅に伸びます。</p>
                            <div class="special-actions">
                                <select id="selSpecialTarget" class="sel-target-member" onchange="window.KendoClub.onChangeSpecialTarget(this.value)">
                                    ${teammateOptions || '<option value="">指導対象の部員がいません</option>'}
                                </select>
                                <button type="button" 
                                        class="btn-special-practice" 
                                        onclick="window.KendoClub.onSpecialPractice()">
                                    🥋 指名して特訓開始！
                                </button>
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
            </div>
        `;

        // 部員一覧グリッドのスクロール位置を同期的に復元し、スクロールリスナーを登録
        const memberGrid = container.querySelector('.club-members-grid');
        if (memberGrid) {
            // ゲーム開始時または初期値(-1)の場合は右端（大将が見える位置）を初期値にする
            if (ClubState.memberGridScrollLeft === null || ClubState.memberGridScrollLeft === undefined || ClubState.memberGridScrollLeft < 0) {
                memberGrid.scrollLeft = memberGrid.scrollWidth;
                ClubState.memberGridScrollLeft = memberGrid.scrollLeft;
            } else {
                memberGrid.scrollLeft = ClubState.memberGridScrollLeft;
            }

            memberGrid.addEventListener('scroll', () => {
                ClubState.memberGridScrollLeft = memberGrid.scrollLeft;
            }, { passive: true });
        }
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
                    selectOptionsHtml += `<option value="${oMem.id}" ${isSelected ? 'selected' : ''}>${pName}: ${escapeHtml(oMem.name)} (${oMem.grade}年${oMem.isPlayer ? '・主将' : ''})</option>`;
                }
            });
            selectOptionsHtml += `</optgroup>`;

            if (benchMembers.length > 0) {
                selectOptionsHtml += `<optgroup label="── 控え部員から交代 ──">`;
                benchMembers.forEach((bMem) => {
                    const isSelected = m && m.id === bMem.id;
                    const dualStr = bMem.isClubDual ? `・${bMem.originalClub}助っ人` : '';
                    selectOptionsHtml += `<option value="${bMem.id}" ${isSelected ? 'selected' : ''}>控え: ${escapeHtml(bMem.name)} (${bMem.grade}年${dualStr})</option>`;
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
                            <button type="button" class="btn-slot-recruit" onclick="window.KendoClub.recruitDualClubMember()">
                                🏃 他部から勧誘
                            </button>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="order-slot-card ${m.isPlayer ? 'is-player' : ''} ${m.isClubDual ? 'is-dual-slot' : ''}">
                    <span class="order-pos-name">${pos}</span>
                    <div class="order-member-info">
                        <div class="order-name-row">
                            <strong>${escapeHtml(m.name)} ${m.isPlayer ? '(主将・あなた)' : ''}</strong>
                            <div class="order-role-sub">
                                <span>${m.grade}年生</span>
                                ${m.isClubDual ? `<span class="member-dual-badge">${escapeHtml(m.originalClub)}（助っ人）</span>` : `<span>【${m.archetypeName || '一般剣士'}】</span>`}
                                <span>構え: ${m.favStance === 'jodan' ? '上段' : m.favStance === 'waki' ? '脇' : '中段'}</span>
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
                        <div class="mini-chara-badge" style="background: ${(m.armorTheme && m.armorTheme.badgeBg) || 'rgba(15, 23, 42, 0.85)'}; border-color: ${(m.armorTheme && m.armorTheme.badgeBorder) || 'rgba(148, 163, 184, 0.45)'};">
                            <span class="mini-armor-dot" style="background: ${(m.armorTheme && m.armorTheme.dotColor) || '#64748b'};"></span>
                            <span class="mini-armor-name">胴: ${escapeHtml((m.armorTheme && m.armorTheme.themeName) || '黒漆塗')}</span>
                        </div>
                    </div>
                    <div class="order-swap-btns">
                        <button type="button" class="btn-swap" ${idx === 4 ? 'disabled' : ''} onclick="window.KendoClub.swapOrder(${idx}, ${idx + 1})" title="上のポジションと入れ替え">⬆️</button>
                        <button type="button" class="btn-swap" ${idx === 0 ? 'disabled' : ''} onclick="window.KendoClub.swapOrder(${idx}, ${idx - 1})" title="下のポジションと入れ替え">⬇️</button>
                    </div>
                </div>
            `;
        }).join('');

        const benchCardsHtml = benchMembers.length ? benchMembers.map((b) => {
            return `
                <div class="order-bench-card ${b.isPlayer ? 'is-player' : ''} ${b.isClubDual ? 'is-dual-slot' : ''}">
                    <div class="bench-card-left">
                        <span class="order-pos-name bench">控え</span>
                        <div class="bench-member-info">
                            <strong>${escapeHtml(b.name)} ${b.isPlayer ? '(主将・あなた)' : ''}</strong>
                            <div class="order-role-sub">
                                <span>${b.grade}年生</span>
                                ${b.isClubDual ? `<span class="member-dual-badge">${escapeHtml(b.originalClub)}（助っ人）</span>` : `<span>【${b.archetypeName || '一般剣士'}】</span>`}
                                <span>構え: ${b.favStance === 'jodan' ? '上段' : b.favStance === 'waki' ? '脇' : '中段'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="order-radar-wrap">
                        ${generateRadarChartSvg(b, 160, 146)}
                    </div>
                    <div class="order-mini-chara-wrap">
                        <canvas class="member-mini-canvas" data-member-id="${b.id}" width="91" height="100"></canvas>
                        <div class="mini-chara-badge" style="background: ${(b.armorTheme && b.armorTheme.badgeBg) || 'rgba(15, 23, 42, 0.85)'}; border-color: ${(b.armorTheme && b.armorTheme.badgeBorder) || 'rgba(148, 163, 184, 0.45)'};">
                            <span class="mini-armor-dot" style="background: ${(b.armorTheme && b.armorTheme.dotColor) || '#64748b'};"></span>
                            <span class="mini-armor-name">胴: ${escapeHtml((b.armorTheme && b.armorTheme.themeName) || '黒漆塗')}</span>
                        </div>
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
                    if (r === 'ベスト8' && best !== '準優勝' && best !== 'ベスト4') return 'ベスト8';
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
        const isWin = rankLabel === '優勝';
        const isRunnerUp = rankLabel === '準優勝';
        const isBest4 = rankLabel === 'ベスト4';
        const isBest8 = rankLabel === 'ベスト8';

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
            ClubState.memberGridScrollLeft = -1; // 開始時の初期位置は右端（大将側表示）
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
                ClubState.activityLog.unshift(`👑 新主将に【${newCap.name}】が就任！戦力順に基づき、大将～先鋒のオーダーを自動設定しました！`);
            }
            // 主将変更時：大将〜先鋒の割り当てを戦力順で自動設定
            assignOrderByCombatPower(memberId);
            ClubState.viewPhase = 'dashboard';
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

        onSpecialPractice: function (instant = false) {
            const sel = document.getElementById('selSpecialTarget');
            const targetId = (sel && sel.value) ? sel.value : ClubState.selectedSpecialTargetId;
            if (targetId) {
                ClubState.selectedSpecialTargetId = targetId;
                executePractice('special', targetId, instant);
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
            ClubState.activityLog.unshift(`🤝【${ClubState.year}年目 ${ClubState.month}月${ClubState.week}週】部員不足を補うため、${recruit.originalClub}から【${recruit.name}】を掛け持ちの助っ人として勧誘・入部させました！（初期配置：控え）`);
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
                    window.KendoClub.launchPlayerBout();
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

        skipToPlayerOrEnd: function () {
            clearAutoSpectateTimers();
            const match = ClubState.currentMatchData;
            if (!match || !match.activeBouts || match.activeBouts.isFinished) return;

            const boutsData = match.activeBouts;
            const totalBouts = boutsData.bouts.length;
            while (boutsData.currentBoutIndex < totalBouts) {
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
                    { stance: 'jodan', hint: `🔥【上段の構え】${enemyMember.name}は頭上に構え「上段面(2ダメ)」を狙う！（小手で迎撃せよ）`, isDanger: true, weights: { 面: 60, 小手: 25, 胴: 15, 防御: 0, 崩し: 0, 突き: 0 } },
                    { stance: 'chudan', hint: `⚖️【中段の構え】${enemyMember.name}は中段に戻りつつ「面」か「小手」を狙っている…`, isDanger: false, weights: { 面: 45, 小手: 35, 胴: 15, 防御: 5, 崩し: 0, 突き: 0 } },
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

            let enemyNameLabel = `${boutsData.schoolName || ClubState.schoolName}・${enemyMember.name}`;
            let enemyIntroQuote = isIntraClub
                ? `「主将、全力を尽くして一本を狙います！」`
                : (isIndividual ? `「${enemyMember.title || '個人代表'}の意地、見せてやる！」` : `「${boutsData.schoolName}の誇りにかけて、一本も譲らん！」`);

            const enemyArmorTheme = enemyMember.armorTheme || {
                doStops: ['#3b0764', '#581c87', '#7e22ce', '#3b0764', '#1e1b4b'],
                muneFill: '#1e1b4b',
                muneStitch: 'rgba(232, 121, 249, 0.85)',
                tareLine: 'rgba(232, 121, 249, 0.65)',
            };

            let tourneyTypeTheme = 'district';
            if (match.type === 'national' || match.type === 'interhigh_national') {
                tourneyTypeTheme = 'national';
            }

            if (window.KendoGameEngine && window.KendoGameEngine.startCustomMatch) {
                window.KendoGameEngine.startCustomMatch({
                    isIndividual: isIndividual,
                    isSpectating: isSpectating,
                    tournamentType: tourneyTypeTheme,
                    playerData: {
                        name: playerMember.name,
                        schoolName: ClubState.schoolName,
                        roleTitle: isIndividual ? `${sanitizePosName(curBout.posName)}・${ClubState.schoolName}` : `${curBout.posName}・${ClubState.schoolName}`,
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
                        name: enemyNameLabel,
                        role: sanitizePosName(curBout.posName),
                        shortName: enemyMember.name,
                        rank: isIndividual ? (enemyMember.title || '代表剣士') : '高校剣士',
                        styleTag: `${(enemyMember.stance || enemyMember.favStance) === 'jodan' ? '上段' : (enemyMember.stance || enemyMember.favStance) === 'waki' ? '下段の構え' : '中段'}の気迫`,
                        maxHealth: enemyMember.hp || enemyMember.maxHealth || 6,
                        initialKiai: 0,
                        str: enemyMember.str,
                        agi: enemyMember.agi,
                        spi: enemyMember.spi,
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

                        // リアルタイム観戦が有効で、次の試合が存在し、かつ次の試合が主将の出番でない場合
                        const nextBout = boutsData.bouts[boutsData.currentBoutIndex];
                        const shouldContinueSpectating = ClubState.isAutoSpectating && nextBout && !nextBout.played && !nextBout.isPlayerBout;

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
                } else {
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
                else ClubState.stats.interhighNational.best8++;

                ClubState.activityLog.unshift(`👑【${ClubState.year}年目 8月1週】全国高校総体（インターハイ）個人戦 終了。最高成績：${rankLabel}！`);

            } else if (match.type === 'district') {
                // 選抜地区大会（団体戦）
                ClubState.lastDistrictRank = rankLabel;
                ClubState.stats.district.total++;
                if (isWin) {
                    ClubState.stats.district.win++;
                    ClubState.qualifiedForNational = true;
                } else if (rankLabel === '準優勝') ClubState.stats.district.runnerUp++;
                else if (rankLabel === 'ベスト4') ClubState.stats.district.best4++;
                else ClubState.stats.district.best8++;

                ClubState.activityLog.unshift(`🏆【${ClubState.year}年目 12月3週】${ClubState.prefecture}大会（選抜予選） 終了。成績：${rankLabel}！${isWin ? '全国選抜大会への出場が決定！' : ''}`);

            } else {
                // 全国選抜大会（団体戦）
                ClubState.lastNationalRank = rankLabel;
                ClubState.stats.national.total++;
                if (isWin) ClubState.stats.national.win++;
                else if (rankLabel === '準優勝') ClubState.stats.national.runnerUp++;
                else if (rankLabel === 'ベスト4') ClubState.stats.national.best4++;
                else ClubState.stats.national.best8++;

                ClubState.activityLog.unshift(`👑【${ClubState.year}年目 3月4週】全国高校選抜大会 終了。成績：${rankLabel}！`);
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
            ClubState.ceremonyResultData = null;
            ClubState.currentMatchData = null;
            ClubState.viewPhase = 'dashboard';

            // 次の週へ進める
            advanceCalendarWeek();
            saveClubData();
            renderClubUI();
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

        getRealClubMember: function (target) {
            return getRealClubMember(target);
        },

        growStat: function (m, category, key, baseGain) {
            return growStat(m, category, key, baseGain);
        },
    };

    // DOMロード時にモードカードUIを最新セーブデータ状態に合わせて描画
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateModeCardUI);
    } else {
        updateModeCardUI();
    }
})();
