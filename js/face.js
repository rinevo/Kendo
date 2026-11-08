/**
 * 剣道 - 生徒手帳風 顔グラフィック（証明写真アバター）生成モジュール
 * FaceGenerator: SVGベースのプロシージャル顔写真生成エンジン
 */
(function (global) {
    'use strict';

    // 擬似乱数生成器（シード値から決定論的に生成）
    function createRng(seed) {
        let s = typeof seed === 'number' ? seed : 0;
        if (typeof seed === 'string') {
            for (let i = 0; i < seed.length; i++) {
                s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
            }
        }
        s = (s ^ 0x6a09e667) >>> 0;
        return function () {
            s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    function pickRandom(arr, rng) {
        const rand = rng ? rng() : Math.random();
        return arr[Math.floor(rand * arr.length)];
    }

    // 定義データ
    const SKIN_COLORS = [
        { id: 'fair', name: '色白', base: '#fde7d8', shadow: '#eec2a8', blush: '#f5b5aa' },
        { id: 'normal', name: '標準', base: '#fad5ba', shadow: '#e8af8e', blush: '#ed9e95' },
        { id: 'healthy', name: '健康的', base: '#f1c39e', shadow: '#d69e77', blush: '#de8a81' },
        { id: 'tanned', name: '日焼け', base: '#dda980', shadow: '#ba855d', blush: '#c8766a' },
        { id: 'deep_tanned', name: '剣道焼け', base: '#c68f64', shadow: '#a16d44', blush: '#ae5f53' }
    ];

    const HAIR_COLORS = [
        { id: 'black', name: '漆黒', main: '#121417', highlight: '#2a3138' },
        { id: 'soft_black', name: 'ソフトブラック', main: '#23252a', highlight: '#3a3e47' },
        { id: 'dark_brown', name: '焦げ茶', main: '#2d1e18', highlight: '#483329' },
        { id: 'chestnut', name: '栗色', main: '#3e291e', highlight: '#5d3e2d' },
        { id: 'ash_dark', name: 'ダークアッシュ', main: '#222830', highlight: '#38424f' },
        { id: 'blue_black', name: '藍黒', main: '#141d28', highlight: '#253448' }
    ];

    const EYE_COLORS = ['#1a1918', '#2b211a', '#1e242e', '#362319'];

    const BG_STYLES = [
        { id: 'blue_grad', top: '#6ba5e7', bottom: '#3768b5', name: '証明写真ブルー' },
        { id: 'cyan_grad', top: '#5bc0de', bottom: '#2f7b9c', name: 'スカイブルー' },
        { id: 'gray_grad', top: '#9aa0a6', bottom: '#5f6368', name: 'スタジオグレー' },
        { id: 'cream_grad', top: '#ebdccb', bottom: '#bfa993', name: 'クラシックベージュ' },
        { id: 'navy_grad', top: '#2c3e50', bottom: '#1a252f', name: 'ディープネイビー' }
    ];

    const UNIFORMS = [
        { id: 'gakuran', name: '学ラン（詰襟）' },
        { id: 'blazer_tie', name: 'ブレザー（タイ）' },
        { id: 'shirt', name: '白ワイシャツ' },
        { id: 'dougi_white', name: '白稽古着' },
        { id: 'dougi_navy', name: '紺稽古着' }
    ];

    const ACCESSORIES = [
        { id: 'none', weight: 65 },
        { id: 'glasses_square', weight: 8 },
        { id: 'glasses_round', weight: 8 },
        { id: 'bandage_nose', weight: 9 }, // 剣道部らしい鼻の絆創膏
        { id: 'bandage_cheek', weight: 5 }, // 頬の絆創膏
        { id: 'mole_eye', weight: 5 } // 泣きぼくろ
    ];

    // 男子高校生・高校剣士らしい髪型（短髪・坊主・マッシュ・ツーブロック等）
    const HAIR_STYLES = [
        'short_sporty', // 剣道ショート
        'buzz_cut',      // 気合の坊主・丸刈り
        'mash_natural',  // マッシュショート
        'center_part',   // センター分け
        'spiky',         // スパイキーショート
        'two_block',     // 爽やかツーブロック
        'side_part',     // 七三・優等生
        'all_back',      // オールバック・威風
        'messy_short'    // 癖毛風ショート
    ];

    let svgUidCounter = 0;

    const FaceGenerator = {
        /**
         * 顔データオブジェクトを生成する（男子高校生限定）
         * @param {Object} options { seed, name, gender, isPlayer, uniformType }
         */
        generateFace: function (options = {}) {
            const opts = (options && typeof options === 'object')
                ? options
                : (typeof options === 'string' || typeof options === 'number' ? { seed: options } : {});
            const seedVal = opts.seed !== undefined ? opts.seed : (opts.name || Math.random() * 1000000);
            const rng = createRng(seedVal);

            const skin = pickRandom(SKIN_COLORS, rng);
            const hairColor = pickRandom(HAIR_COLORS, rng);
            const eyeColor = pickRandom(EYE_COLORS, rng);
            const hairStyle = pickRandom(HAIR_STYLES, rng);
            const bgStyle = pickRandom(BG_STYLES, rng);

            // 服装の決定（男子高校生制服：学ラン、ネクタイブレザー、夏服ワイシャツ、稽古着）
            let uniformType = opts.uniformType;
            if (!uniformType) {
                const uRand = rng();
                if (uRand < 0.45) uniformType = 'gakuran';
                else if (uRand < 0.80) uniformType = 'blazer_tie';
                else if (uRand < 0.90) uniformType = 'shirt';
                else uniformType = (rng() < 0.5 ? 'dougi_navy' : 'dougi_white');
            } else if (uniformType === 'blazer_ribbon' && seedVal !== 'boss_kasumi') {
                uniformType = 'blazer_tie';
            }

            // アクセサリーの決定（重み付け）
            let accessory = 'none';
            const accRand = rng() * 100;
            let accAcc = 0;
            for (const acc of ACCESSORIES) {
                accAcc += acc.weight;
                if (accRand <= accAcc) {
                    accessory = acc.id;
                    break;
                }
            }

            return {
                seed: seedVal,
                skinId: skin.id,
                skin: skin,
                hairColorId: hairColor.id,
                hairColor: hairColor,
                eyeColor: eyeColor,
                hairStyle: hairStyle,
                faceShape: Math.floor(rng() * 4), // 0: 卵型, 1: シャープ, 2: 丸顔, 3: エラ張り
                eyeType: Math.floor(rng() * 8),   // 8種の目
                eyebrowType: Math.floor(rng() * 6), // 6種の眉
                mouthType: Math.floor(rng() * 6), // 6種の口
                noseType: Math.floor(rng() * 3),  // 3種の鼻
                uniformType: uniformType,
                accessory: accessory,
                bgStyleId: bgStyle.id,
                bgStyle: bgStyle,
                expressionSeed: Math.floor(rng() * 1000)
            };
        },

        /**
         * 顔データオブジェクトからSVG文字列をレンダリングする
         * @param {Object} face 顔データ
         * @param {number} width 描画幅
         * @param {number} height 描画高さ
         * @param {Object} renderOptions { withFrame, stampText, schoolName }
         */
        renderSvg: function (face, width = 120, height = 160, renderOptions = {}) {
            if (!face || !face.skin) {
                // 不正または古いデータの場合はフォールバック生成
                face = this.generateFace({ seed: face?.seed || 'default' });
            }

            const rOpts = (renderOptions && typeof renderOptions === 'object') ? renderOptions : {};
            const {
                withFrame = true,
                stampText = '青雲証',
                schoolName = '青雲高校'
            } = rOpts;

            const skin = face.skin || SKIN_COLORS[1];
            const hair = face.hairColor || HAIR_COLORS[0];
            const bg = face.bgStyle || BG_STYLES[0];

            // 男子高校生制服・髪型への自動後方互換マッピング（五人掛けボスの霞を除く）
            let effectiveHairStyle = face.hairStyle || 'short_sporty';
            let effectiveUniform = face.uniformType || 'gakuran';
            if (face.seed !== 'boss_kasumi') {
                if (effectiveUniform === 'blazer_ribbon') {
                    effectiveUniform = 'blazer_tie';
                }
                if (effectiveHairStyle === 'ponytail') {
                    effectiveHairStyle = 'short_sporty';
                } else if (effectiveHairStyle === 'bob_cut') {
                    effectiveHairStyle = 'mash_natural';
                } else if (effectiveHairStyle === 'medium_wave') {
                    effectiveHairStyle = 'messy_short';
                }
            }

            // SVG内部サイズ：120 x 160（証明写真の標準 3:4 比率）
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" width="${width}" height="${height}" class="student-face-svg" style="display:block; border-radius:inherit; overflow:hidden;">`;

            // 1. 完全一意なID（他画面やdisplay:noneコンテナとのID衝突・参照無効化バグを完全防止）
            const uid = `face_${Date.now()}_${++svgUidCounter}_${Math.random().toString(36).substr(2, 6)}`;
            const bgGradId = `bg_grad_${uid}`;
            const clipId = `clip_photo_${uid}`;
            const hairGradId = `hair_grad_${uid}`;

            svg += `
                <defs>
                    <linearGradient id="${bgGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="${bg.top}" />
                        <stop offset="100%" stop-color="${bg.bottom}" />
                    </linearGradient>
                    <clipPath id="${clipId}">
                        <rect x="0" y="0" width="120" height="160" rx="3" ry="3" />
                    </clipPath>
                    <linearGradient id="${hairGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="${hair.highlight}" />
                        <stop offset="60%" stop-color="${hair.main}" />
                        <stop offset="100%" stop-color="${hair.main}" />
                    </linearGradient>
                </defs>
            `;

            // クリップパスで囲むグループ開始
            svg += `<g clip-path="url(#${clipId})">`;

            // 2. 背景ソリッド色（下地保護）＋証明写真バックグラデーション
            svg += `<rect x="0" y="0" width="120" height="160" fill="${bg.bottom}" />`;
            svg += `<rect x="0" y="0" width="120" height="160" fill="url(#${bgGradId})" />`;

            // 微かな背景ライティング（スタジオ照明効果）
            svg += `<circle cx="60" cy="70" r="50" fill="white" opacity="0.08" />`;

            // 3. 後ろ髪（ポニーテールやボブなど後ろに髪が出る場合）
            svg += this._renderBackHair(effectiveHairStyle, `url(#${hairGradId})`);

            // 4. 首と首の影
            svg += `
                <path d="M47 88 L47 114 Q60 120 73 114 L73 88 Z" fill="${skin.shadow}" />
                <path d="M49 92 L49 113 Q60 117 71 113 L71 92 Z" fill="${skin.base}" />
            `;

            // 5. 服装（学生服 / 制服 / 道着）
            svg += this._renderUniform(effectiveUniform);

            // 6. 耳
            svg += `
                <ellipse cx="37" cy="78" rx="5" ry="9" fill="${skin.base}" />
                <ellipse cx="37" cy="78" rx="2.5" ry="5.5" fill="${skin.shadow}" opacity="0.6" />
                <ellipse cx="83" cy="78" rx="5" ry="9" fill="${skin.base}" />
                <ellipse cx="83" cy="78" rx="2.5" ry="5.5" fill="${skin.shadow}" opacity="0.6" />
            `;

            // 7. 顔の輪郭（ベース）
            svg += this._renderFaceShape(face.faceShape, skin.base, skin.shadow);

            // 8. 頬のチーク（ほんのり血色・男子高校生向けに自然な透明度）
            svg += `
                <circle cx="46" cy="85" r="7" fill="${skin.blush}" opacity="0.18" />
                <circle cx="74" cy="85" r="7" fill="${skin.blush}" opacity="0.18" />
            `;

            // 9. 鼻
            svg += this._renderNose(face.noseType, skin.shadow);

            // 10. 口
            svg += this._renderMouth(face.mouthType, skin.shadow);

            // 11. 目
            svg += this._renderEyes(face.eyeType, face.eyeColor);

            // 12. 眉毛
            svg += this._renderEyebrows(face.eyebrowType, hair.main);

            // 13. アクセサリー（眼鏡・絆創膏・ほくろなど）
            svg += this._renderAccessory(face.accessory);

            // 14. 前髪・メインヘア
            svg += this._renderFrontHair(effectiveHairStyle, `url(#${hairGradId})`, hair.highlight);

            // 15. 生徒手帳風の割り印 / スタンプ（角印・割印）
            if (withFrame) {
                svg += `
                    <!-- 生徒手帳の朱色角印スタンプ -->
                    <g transform="translate(86, 126) rotate(-10)">
                        <rect x="0" y="0" width="28" height="28" rx="2" fill="none" stroke="#dc2626" stroke-width="1.2" opacity="0.82" />
                        <rect x="2" y="2" width="24" height="24" rx="1.5" fill="#ef4444" opacity="0.08" />
                        <text x="14" y="12" font-family="'Noto Sans JP', sans-serif" font-size="8" font-weight="900" fill="#dc2626" opacity="0.88" text-anchor="middle" dominant-baseline="central">生徒</text>
                        <text x="14" y="20" font-family="'Noto Sans JP', sans-serif" font-size="8" font-weight="900" fill="#dc2626" opacity="0.88" text-anchor="middle" dominant-baseline="central">証明</text>
                    </g>
                `;
            }

            // グループ終了
            svg += `</g>`;

            // 16. 外枠（印画紙風の白枠・ボーダー）
            if (withFrame) {
                svg += `<rect x="0.5" y="0.5" width="119" height="159" rx="3" ry="3" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />`;
                svg += `<rect x="1.5" y="1.5" width="117" height="157" rx="2" ry="2" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="1" />`;
            }

            svg += `</svg>`;
            return svg;
        },

        // 輪郭描画
        _renderFaceShape: function (shapeType, baseColor, shadowColor) {
            switch (shapeType) {
                case 1: // シャープな顎
                    return `<path d="M38 65 Q38 92 60 105 Q82 92 82 65 Q82 50 60 50 Q38 50 38 65 Z" fill="${baseColor}" />`;
                case 2: // 丸顔
                    return `<path d="M37 66 Q37 96 60 102 Q83 96 83 66 Q83 49 60 49 Q37 49 37 66 Z" fill="${baseColor}" />`;
                case 3: // しっかりした顎（角張り）
                    return `<path d="M37 65 Q37 88 50 101 Q60 104 70 101 Q83 88 83 65 Q83 49 60 49 Q37 49 37 65 Z" fill="${baseColor}" />`;
                case 0: // 卵型・標準
                default:
                    return `<path d="M38 65 Q38 93 60 103 Q82 93 82 65 Q82 49 60 49 Q38 49 38 65 Z" fill="${baseColor}" />`;
            }
        },

        // 服装描画
        _renderUniform: function (type) {
            switch (type) {
                case 'gakuran': // 学ラン（黒詰襟）
                    return `
                        <path d="M22 160 L22 135 Q40 125 50 115 L50 110 Q60 115 70 110 L70 115 Q80 125 98 135 L98 160 Z" fill="#181c24" />
                        <!-- 首元の白いカラー（プラスチックカラー） -->
                        <path d="M50 109 Q60 114 70 109 L70 113 Q60 118 50 113 Z" fill="#f8fafc" />
                        <!-- 学ラン詰襟の合わせと金ボタン -->
                        <path d="M60 114 L60 160" stroke="#0f1217" stroke-width="1.8" />
                        <circle cx="60" cy="126" r="2.2" fill="#eab308" stroke="#ca8a04" stroke-width="0.6" />
                        <circle cx="60" cy="142" r="2.2" fill="#eab308" stroke="#ca8a04" stroke-width="0.6" />
                        <circle cx="60" cy="158" r="2.2" fill="#eab308" stroke="#ca8a04" stroke-width="0.6" />
                        <path d="M38 130 L48 116" stroke="#252c38" stroke-width="1.2" />
                        <path d="M82 130 L72 116" stroke="#252c38" stroke-width="1.2" />
                    `;
                case 'blazer_tie': // 紺ブレザー＋ネクタイ
                    return `
                        <path d="M20 160 L20 134 Q38 123 48 116 L72 116 Q82 123 100 134 L100 160 Z" fill="#1e293b" />
                        <!-- 白ワイシャツ -->
                        <polygon points="50,116 70,116 66,145 54,145" fill="#f8fafc" />
                        <!-- ネクタイ（臙脂/ストライプ） -->
                        <polygon points="58,122 62,122 64,152 60,158 56,152" fill="#b91c1c" />
                        <line x1="57" y1="130" x2="63" y2="128" stroke="#fcd34d" stroke-width="1" />
                        <line x1="57" y1="140" x2="63" y2="138" stroke="#fcd34d" stroke-width="1" />
                        <!-- 襟ラペル -->
                        <polygon points="46,116 56,138 46,142 36,128" fill="#293548" stroke="#1e293b" stroke-width="0.8" />
                        <polygon points="74,116 64,138 74,142 84,128" fill="#293548" stroke="#1e293b" stroke-width="0.8" />
                    `;
                case 'blazer_ribbon': // ブレザー＋リボン
                    return `
                        <path d="M20 160 L20 134 Q38 123 48 116 L72 116 Q82 123 100 134 L100 160 Z" fill="#1e293b" />
                        <!-- 白ワイシャツ襟 -->
                        <polygon points="50,116 70,116 65,138 55,138" fill="#f8fafc" />
                        <polygon points="48,116 57,125 51,126" fill="#e2e8f0" />
                        <polygon points="72,116 63,125 69,126" fill="#e2e8f0" />
                        <!-- リボン（赤） -->
                        <ellipse cx="60" cy="125" rx="3.5" ry="3" fill="#be123c" />
                        <polygon points="60,125 50,121 51,130" fill="#e11d48" />
                        <polygon points="60,125 70,121 69,130" fill="#e11d48" />
                        <polygon points="58,125 55,138 59,135" fill="#be123c" />
                        <polygon points="62,125 65,138 61,135" fill="#be123c" />
                        <!-- ラペル -->
                        <polygon points="46,116 56,138 46,142 36,128" fill="#293548" />
                        <polygon points="74,116 64,138 74,142 84,128" fill="#293548" />
                    `;
                case 'shirt': // 白ワイシャツ（夏服）
                    return `
                        <path d="M20 160 L20 136 Q40 126 50 116 L70 116 Q80 126 100 136 L100 160 Z" fill="#f1f5f9" />
                        <path d="M50 116 Q60 122 70 116 L68 126 L60 133 L52 126 Z" fill="#e2e8f0" />
                        <polygon points="48,116 58,126 48,130" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" />
                        <polygon points="72,116 62,126 72,130" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8" />
                        <line x1="60" y1="133" x2="60" y2="160" stroke="#cbd5e1" stroke-width="1.2" />
                        <circle cx="60" cy="142" r="1.5" fill="#94a3b8" />
                        <circle cx="60" cy="154" r="1.5" fill="#94a3b8" />
                    `;
                case 'dougi_white': // 白稽古着
                    return `
                        <path d="M20 160 L20 135 Q40 124 50 115 L70 115 Q80 124 100 135 L100 160 Z" fill="#f8fafc" />
                        <!-- 刺し子・菱刺しの重なり -->
                        <path d="M48 115 L75 160" stroke="#e2e8f0" stroke-width="3.5" />
                        <path d="M72 115 L50 148" stroke="#cbd5e1" stroke-width="3" />
                        <path d="M46 115 L72 160" stroke="#64748b" stroke-width="1" />
                        <path d="M74 115 L52 150" stroke="#64748b" stroke-width="1" />
                    `;
                case 'dougi_navy': // 紺稽古着
                default:
                    return `
                        <path d="M20 160 L20 135 Q40 124 50 115 L70 115 Q80 124 100 135 L100 160 Z" fill="#1e293b" />
                        <!-- 襟の合わせ -->
                        <path d="M48 115 L76 160" stroke="#0f172a" stroke-width="3.8" />
                        <path d="M72 115 L48 150" stroke="#172554" stroke-width="3.2" />
                        <path d="M46 115 L74 160" stroke="#334155" stroke-width="1" />
                    `;
            }
        },

        // 後ろ髪（髪型タイプに応じた背面髪）
        _renderBackHair: function (style, hairFill) {
            switch (style) {
                case 'ponytail': // ポニーテール（高め結びが後ろから見える）
                    return `
                        <ellipse cx="60" cy="46" rx="28" ry="24" fill="${hairFill}" />
                        <path d="M60 40 Q78 30 84 46 Q88 64 78 80 Q74 65 70 54 Z" fill="${hairFill}" />
                        <!-- ヘアゴム -->
                        <ellipse cx="73" cy="47" rx="3.5" ry="3.5" fill="#3b82f6" />
                    `;
                case 'bob_cut': // ボブ
                    return `<ellipse cx="60" cy="74" rx="28" ry="24" fill="${hairFill}" />`;
                case 'medium_wave': // セミロング
                    return `
                        <ellipse cx="60" cy="72" rx="27" ry="26" fill="${hairFill}" />
                        <path d="M33 70 Q30 96 35 110 Q42 108 40 85 Z" fill="${hairFill}" />
                        <path d="M87 70 Q90 96 85 110 Q78 108 80 85 Z" fill="${hairFill}" />
                    `;
                default:
                    return '';
            }
        },

        // 前髪・メインヘア
        _renderFrontHair: function (style, hairFill, highlightColor) {
            switch (style) {
                case 'buzz_cut': // 丸刈り・坊主
                    return `
                        <path d="M37 68 Q37 46 60 46 Q83 46 83 68 Q80 61 60 61 Q40 61 37 68 Z" fill="${hairFill}" opacity="0.9" />
                        <!-- 短い毛並みの質感 -->
                        <ellipse cx="60" cy="49" rx="18" ry="4" fill="${highlightColor}" opacity="0.3" />
                    `;
                case 'short_sporty': // 剣道ショート・スポーツ刈り
                    return `
                        <path d="M35 68 Q35 44 60 43 Q85 44 85 68 Q80 56 60 56 Q40 56 35 68 Z" fill="${hairFill}" />
                        <path d="M40 56 L46 64 L52 56 L58 65 L64 56 L70 64 L76 56 Q82 60 84 66 Q80 50 60 47 Q40 50 36 66 Z" fill="${hairFill}" />
                        <path d="M50 49 Q60 47 70 49" stroke="${highlightColor}" stroke-width="1.8" stroke-linecap="round" opacity="0.5" />
                    `;
                case 'mash_natural': // マッシュショート
                    return `
                        <path d="M34 68 Q34 42 60 41 Q86 42 86 68 Q83 60 76 68 Q68 62 60 68 Q52 62 44 68 Q37 60 34 68 Z" fill="${hairFill}" />
                        <path d="M36 67 Q44 71 52 69 Q60 72 68 69 Q76 71 84 67 Q82 50 60 46 Q38 50 36 67 Z" fill="${hairFill}" />
                        <path d="M45 49 Q60 46 75 49" stroke="${highlightColor}" stroke-width="2" stroke-linecap="round" opacity="0.45" />
                    `;
                case 'center_part': // センター分け
                    return `
                        <path d="M34 68 Q34 42 60 41 Q86 42 86 68 Q83 62 76 66 Q68 57 60 55 Q52 57 44 66 Q37 62 34 68 Z" fill="${hairFill}" />
                        <!-- 左右への分け目 -->
                        <path d="M60 55 Q50 62 42 74 Q36 65 37 54 Q48 46 60 55 Z" fill="${hairFill}" />
                        <path d="M60 55 Q70 62 78 74 Q84 65 83 54 Q72 46 60 55 Z" fill="${hairFill}" />
                        <line x1="60" y1="44" x2="60" y2="55" stroke="${highlightColor}" stroke-width="1.2" opacity="0.4" />
                    `;
                case 'spiky': // つんつんスパイキー
                    return `
                        <path d="M34 68 L32 58 L38 56 L39 46 L46 47 L51 38 L58 43 L63 36 L68 43 L74 38 L78 47 L83 49 L84 59 L86 68 Q80 58 60 58 Q40 58 34 68 Z" fill="${hairFill}" />
                        <polygon points="46,58 50,66 54,58" fill="${hairFill}" />
                        <polygon points="56,58 60,67 64,58" fill="${hairFill}" />
                        <polygon points="66,58 70,66 74,58" fill="${hairFill}" />
                    `;
                case 'two_block': // ツーブロック
                    return `
                        <!-- 刈り上げサイド -->
                        <path d="M35 72 L35 62 Q36 56 40 52 L40 68 Z" fill="#1e2229" opacity="0.5" />
                        <path d="M85 72 L85 62 Q84 56 80 52 L80 68 Z" fill="#1e2229" opacity="0.5" />
                        <!-- トップの流れる髪 -->
                        <path d="M36 60 Q40 40 64 41 Q86 42 84 56 Q75 54 66 65 Q56 55 42 62 Z" fill="${hairFill}" />
                        <path d="M48 48 Q62 46 74 50" stroke="${highlightColor}" stroke-width="2" stroke-linecap="round" opacity="0.5" />
                    `;
                case 'side_part': // 七三分け
                    return `
                        <path d="M34 68 Q34 43 55 41 Q84 42 85 68 Q81 60 70 63 Q55 56 45 68 Q37 62 34 68 Z" fill="${hairFill}" />
                        <path d="M46 52 Q60 52 76 58 Q82 50 64 45 Q48 45 46 52 Z" fill="${highlightColor}" opacity="0.4" />
                    `;
                case 'all_back': // オールバック
                    return `
                        <path d="M35 67 Q36 43 60 41 Q84 43 85 67 Q80 58 60 57 Q40 58 35 67 Z" fill="${hairFill}" />
                        <!-- 毛流れライン -->
                        <path d="M45 56 Q50 48 55 44" stroke="${highlightColor}" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
                        <path d="M60 55 Q60 47 60 43" stroke="${highlightColor}" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
                        <path d="M75 56 Q70 48 65 44" stroke="${highlightColor}" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
                    `;
                case 'bob_cut': // ボブ（前髪）
                    return `
                        <path d="M33 76 Q32 44 60 42 Q88 44 87 76 Q84 62 78 68 Q68 64 60 67 Q52 64 42 68 Q36 62 33 76 Z" fill="${hairFill}" />
                        <path d="M46 50 Q60 47 74 50" stroke="${highlightColor}" stroke-width="2" opacity="0.4" />
                    `;
                case 'ponytail': // ポニーテール（前髪）
                    return `
                        <path d="M35 70 Q35 44 60 43 Q85 44 85 70 Q81 60 74 66 Q65 62 60 66 Q55 62 46 66 Q39 60 35 70 Z" fill="${hairFill}" />
                        <!-- 横の後れ毛 -->
                        <path d="M36 68 Q34 78 37 84" stroke="${hairFill}" stroke-width="2.5" stroke-linecap="round" />
                        <path d="M84 68 Q86 78 83 84" stroke="${hairFill}" stroke-width="2.5" stroke-linecap="round" />
                    `;
                case 'medium_wave': // セミロング（前髪）
                    return `
                        <path d="M33 78 Q33 43 60 42 Q87 43 87 78 Q82 65 72 68 Q60 63 48 68 Q38 65 33 78 Z" fill="${hairFill}" />
                        <path d="M47 50 Q60 48 73 50" stroke="${highlightColor}" stroke-width="2" opacity="0.4" />
                    `;
                case 'messy_short': // 癖毛風ショート
                default:
                    return `
                        <path d="M34 68 Q32 50 48 43 Q62 38 76 44 Q86 50 85 68 Q80 60 72 67 Q63 60 55 67 Q44 61 34 68 Z" fill="${hairFill}" />
                        <!-- ふんわりハネ毛 -->
                        <path d="M40 44 Q44 38 48 42" stroke="${hairFill}" stroke-width="2.5" stroke-linecap="round" />
                        <path d="M68 40 Q74 36 76 43" stroke="${hairFill}" stroke-width="2.5" stroke-linecap="round" />
                    `;
            }
        },

        // 鼻描画
        _renderNose: function (type, shadowColor) {
            switch (type) {
                case 1: // すっきり点＋小鼻シャドウ
                    return `
                        <circle cx="60" cy="81" r="1.2" fill="${shadowColor}" />
                        <path d="M58 83 Q60 84 62 83" stroke="${shadowColor}" stroke-width="1.2" fill="none" stroke-linecap="round" />
                    `;
                case 2: // 鼻筋しっかり（涼しげ）
                    return `
                        <path d="M59 74 L60 82 L62 82" stroke="${shadowColor}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                    `;
                case 0: // 標準（ちょこん）
                default:
                    return `
                        <path d="M59 77 L60 81 L62 81" stroke="${shadowColor}" stroke-width="1.2" fill="none" stroke-linecap="round" />
                    `;
            }
        },

        // 口描画
        _renderMouth: function (type, shadowColor) {
            switch (type) {
                case 1: // 爽やかな微笑み
                    return `<path d="M54 92 Q60 96 66 92" stroke="#a33a3a" stroke-width="1.5" fill="none" stroke-linecap="round" />`;
                case 2: // きりっと真面目な一文字
                    return `
                        <line x1="55" y1="92" x2="65" y2="92" stroke="#682929" stroke-width="1.6" stroke-linecap="round" />
                        <line x1="58" y1="95" x2="62" y2="95" stroke="${shadowColor}" stroke-width="1.2" stroke-linecap="round" />
                    `;
                case 3: // オープンな元気笑顔
                    return `
                        <path d="M54 91 Q60 97 66 91 Z" fill="#b91c1c" stroke="#991b1b" stroke-width="1" />
                        <path d="M56 92 Q60 94 64 92" fill="#ffffff" />
                    `;
                case 4: // 落ち着いた口元（下唇の陰影あり）
                    return `
                        <path d="M55 92 Q60 94 65 92" stroke="#7f1d1d" stroke-width="1.4" fill="none" stroke-linecap="round" />
                        <ellipse cx="60" cy="95" rx="2.5" ry="1" fill="${shadowColor}" opacity="0.6" />
                    `;
                case 5: // 気迫ある引き締め口
                    return `<path d="M53 93 Q60 91 67 93" stroke="#450a0a" stroke-width="1.8" fill="none" stroke-linecap="round" />`;
                case 0: // 標準
                default:
                    return `
                        <path d="M54 92 Q60 94 66 92" stroke="#881337" stroke-width="1.5" fill="none" stroke-linecap="round" />
                    `;
            }
        },

        // 目描画
        _renderEyes: function (type, eyeColor) {
            let leftEye = '';
            let rightEye = '';

            switch (type) {
                case 1: // パッチリ二重
                    leftEye = `
                        <path d="M45 70 Q49 68 53 71" stroke="#334155" stroke-width="0.8" fill="none" />
                        <path d="M44 73 Q49 69 54 73" stroke="#0f172a" stroke-width="1.8" fill="none" stroke-linecap="round" />
                        <circle cx="49" cy="74.5" r="3.2" fill="${eyeColor}" />
                        <circle cx="49" cy="74.5" r="1.6" fill="#000000" />
                        <circle cx="47.8" cy="73.3" r="1" fill="#ffffff" />
                    `;
                    rightEye = `
                        <path d="M67 71 Q71 68 75 70" stroke="#334155" stroke-width="0.8" fill="none" />
                        <path d="M66 73 Q71 69 76 73" stroke="#0f172a" stroke-width="1.8" fill="none" stroke-linecap="round" />
                        <circle cx="71" cy="74.5" r="3.2" fill="${eyeColor}" />
                        <circle cx="71" cy="74.5" r="1.6" fill="#000000" />
                        <circle cx="69.8" cy="73.3" r="1" fill="#ffffff" />
                    `;
                    break;
                case 2: // 穏やかなタレ目
                    leftEye = `
                        <path d="M44 72 Q49 71 54 74" stroke="#0f172a" stroke-width="1.8" fill="none" stroke-linecap="round" />
                        <ellipse cx="49" cy="75" rx="3" ry="3.2" fill="${eyeColor}" />
                        <circle cx="49" cy="75" r="1.5" fill="#000000" />
                        <circle cx="48" cy="73.8" r="0.9" fill="#ffffff" />
                    `;
                    rightEye = `
                        <path d="M66 74 Q71 71 76 72" stroke="#0f172a" stroke-width="1.8" fill="none" stroke-linecap="round" />
                        <ellipse cx="71" cy="75" rx="3" ry="3.2" fill="${eyeColor}" />
                        <circle cx="71" cy="75" r="1.5" fill="#000000" />
                        <circle cx="70" cy="73.8" r="0.9" fill="#ffffff" />
                    `;
                    break;
                case 3: // 涼しげな切れ長目
                    leftEye = `
                        <path d="M43 74 Q49 70 54 72" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
                        <ellipse cx="49" cy="74.5" rx="2.8" ry="2.2" fill="${eyeColor}" />
                        <circle cx="48" cy="73.8" r="0.8" fill="#ffffff" />
                        <path d="M45 76 Q49 77 53 75" stroke="#475569" stroke-width="0.8" fill="none" />
                    `;
                    rightEye = `
                        <path d="M66 72 Q71 70 77 74" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
                        <ellipse cx="71" cy="74.5" rx="2.8" ry="2.2" fill="${eyeColor}" />
                        <circle cx="70" cy="73.8" r="0.8" fill="#ffffff" />
                        <path d="M67 75 Q71 77 75 76" stroke="#475569" stroke-width="0.8" fill="none" />
                    `;
                    break;
                case 4: // 三白眼・気迫ある鋭い眼光
                    leftEye = `
                        <path d="M44 72 Q49 69 54 71" stroke="#020617" stroke-width="2.2" fill="none" stroke-linecap="round" />
                        <circle cx="49" cy="73.5" r="2.2" fill="${eyeColor}" />
                        <circle cx="49" cy="73.5" r="1.1" fill="#000000" />
                        <circle cx="48.2" cy="72.8" r="0.7" fill="#ffffff" />
                        <path d="M44 76 Q49 77 54 75" stroke="#334155" stroke-width="1" fill="none" />
                    `;
                    rightEye = `
                        <path d="M66 71 Q71 69 76 72" stroke="#020617" stroke-width="2.2" fill="none" stroke-linecap="round" />
                        <circle cx="71" cy="73.5" r="2.2" fill="${eyeColor}" />
                        <circle cx="71" cy="73.5" r="1.1" fill="#000000" />
                        <circle cx="70.2" cy="72.8" r="0.7" fill="#ffffff" />
                        <path d="M66 75 Q71 77 76 76" stroke="#334155" stroke-width="1" fill="none" />
                    `;
                    break;
                case 5: // 笑顔の細目・糸目
                    leftEye = `
                        <path d="M44 75 Q49 71 54 75" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
                    `;
                    rightEye = `
                        <path d="M66 75 Q71 71 76 75" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
                    `;
                    break;
                case 6: // 強い意志・大きな瞳
                    leftEye = `
                        <path d="M44 72 Q49 68 54 72" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
                        <ellipse cx="49" cy="74.5" rx="3.5" ry="3.6" fill="${eyeColor}" />
                        <ellipse cx="49" cy="74.5" rx="1.8" ry="1.9" fill="#000000" />
                        <circle cx="47.6" cy="73" r="1.2" fill="#ffffff" />
                        <circle cx="50.6" cy="76" r="0.6" fill="#ffffff" />
                    `;
                    rightEye = `
                        <path d="M66 72 Q71 68 76 72" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
                        <ellipse cx="71" cy="74.5" rx="3.5" ry="3.6" fill="${eyeColor}" />
                        <ellipse cx="71" cy="74.5" rx="1.8" ry="1.9" fill="#000000" />
                        <circle cx="69.6" cy="73" r="1.2" fill="#ffffff" />
                        <circle cx="72.6" cy="76" r="0.6" fill="#ffffff" />
                    `;
                    break;
                case 0: // 凛々しい吊り目（標準）
                default:
                    leftEye = `
                        <path d="M44 73 Q49 70 54 72" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
                        <circle cx="49" cy="74" r="3" fill="${eyeColor}" />
                        <circle cx="49" cy="74" r="1.5" fill="#000000" />
                        <circle cx="48" cy="73" r="0.9" fill="#ffffff" />
                    `;
                    rightEye = `
                        <path d="M66 72 Q71 70 76 73" stroke="#0f172a" stroke-width="2" fill="none" stroke-linecap="round" />
                        <circle cx="71" cy="74" r="3" fill="${eyeColor}" />
                        <circle cx="71" cy="74" r="1.5" fill="#000000" />
                        <circle cx="70" cy="73" r="0.9" fill="#ffffff" />
                    `;
                    break;
            }

            return leftEye + rightEye;
        },

        // 眉毛描画
        _renderEyebrows: function (type, hairColor) {
            switch (type) {
                case 1: // 太め一本気眉（武道家風）
                    return `
                        <polygon points="42,66 54,64 54,67 42,68" fill="${hairColor}" />
                        <polygon points="66,64 78,66 78,68 66,67" fill="${hairColor}" />
                    `;
                case 2: // キリリ吊り眉
                    return `
                        <path d="M42 67 Q48 64 54 62" stroke="${hairColor}" stroke-width="2.4" stroke-linecap="round" fill="none" />
                        <path d="M66 62 Q72 64 78 67" stroke="${hairColor}" stroke-width="2.4" stroke-linecap="round" fill="none" />
                    `;
                case 3: // タレ眉・下がり眉（温和）
                    return `
                        <path d="M42 63 Q48 64 54 67" stroke="${hairColor}" stroke-width="2" stroke-linecap="round" fill="none" />
                        <path d="M66 67 Q72 64 78 63" stroke="${hairColor}" stroke-width="2" stroke-linecap="round" fill="none" />
                    `;
                case 4: // ナチュラル細眉
                    return `
                        <path d="M43 65 Q48 63 54 64" stroke="${hairColor}" stroke-width="1.6" stroke-linecap="round" fill="none" />
                        <path d="M66 64 Q72 63 77 65" stroke="${hairColor}" stroke-width="1.6" stroke-linecap="round" fill="none" />
                    `;
                case 5: // 短め太眉
                    return `
                        <path d="M44 65 L53 63" stroke="${hairColor}" stroke-width="3" stroke-linecap="round" />
                        <path d="M67 63 L76 65" stroke="${hairColor}" stroke-width="3" stroke-linecap="round" />
                    `;
                case 0: // 標準
                default:
                    return `
                        <path d="M42 66 Q48 63 54 64" stroke="${hairColor}" stroke-width="2.2" stroke-linecap="round" fill="none" />
                        <path d="M66 64 Q72 63 78 66" stroke="${hairColor}" stroke-width="2.2" stroke-linecap="round" fill="none" />
                    `;
            }
        },

        // アクセサリー描画
        _renderAccessory: function (acc) {
            switch (acc) {
                case 'glasses_square': // スクエア眼鏡
                    return `
                        <!-- 眼鏡フレーム -->
                        <rect x="42" y="69" width="14" height="10" rx="1.5" fill="none" stroke="#1e293b" stroke-width="1.2" />
                        <rect x="64" y="69" width="14" height="10" rx="1.5" fill="none" stroke="#1e293b" stroke-width="1.2" />
                        <!-- ブリッジとテンプル -->
                        <line x1="56" y1="73" x2="64" y2="73" stroke="#1e293b" stroke-width="1.2" />
                        <line x1="42" y1="72" x2="36" y2="74" stroke="#1e293b" stroke-width="1" />
                        <line x1="78" y1="72" x2="84" y2="74" stroke="#1e293b" stroke-width="1" />
                        <!-- レンズの反射光 -->
                        <line x1="44" y1="71" x2="48" y2="77" stroke="#ffffff" stroke-width="0.8" opacity="0.6" />
                        <line x1="66" y1="71" x2="70" y2="77" stroke="#ffffff" stroke-width="0.8" opacity="0.6" />
                    `;
                case 'glasses_round': // ラウンド眼鏡
                    return `
                        <circle cx="49" cy="74" r="6.2" fill="none" stroke="#78350f" stroke-width="1.2" />
                        <circle cx="71" cy="74" r="6.2" fill="none" stroke="#78350f" stroke-width="1.2" />
                        <path d="M55.2 73 Q60 71 64.8 73" stroke="#78350f" stroke-width="1.2" fill="none" />
                        <line x1="42.8" y1="73" x2="36" y2="75" stroke="#78350f" stroke-width="1" />
                        <line x1="77.2" y1="73" x2="84" y2="75" stroke="#78350f" stroke-width="1" />
                        <!-- レンズ反射 -->
                        <line x1="46" y1="71" x2="48" y2="76" stroke="#ffffff" stroke-width="0.8" opacity="0.6" />
                    `;
                case 'bandage_nose': // 鼻の上の絆創膏（部活の勲章）
                    return `
                        <g transform="translate(60, 80) rotate(-6)">
                            <rect x="-6" y="-2" width="12" height="4" rx="1" fill="#fbcfe8" stroke="#f472b6" stroke-width="0.4" />
                            <rect x="-2" y="-1.5" width="4" height="3" rx="0.5" fill="#fdf2f8" />
                            <!-- パッドの小さな穴 -->
                            <circle cx="-0.8" cy="0" r="0.25" fill="#f472b6" />
                            <circle cx="0.8" cy="0" r="0.25" fill="#f472b6" />
                        </g>
                    `;
                case 'bandage_cheek': // 頬の絆創膏
                    return `
                        <g transform="translate(45, 87) rotate(14)">
                            <rect x="-4.5" y="-2" width="9" height="4" rx="1" fill="#fed7aa" stroke="#fb923c" stroke-width="0.4" />
                            <rect x="-1.8" y="-1.5" width="3.6" height="3" rx="0.5" fill="#fff7ed" />
                        </g>
                    `;
                case 'mole_eye': // 泣きぼくろ
                    return `<circle cx="53" cy="78" r="0.8" fill="#1e1b18" />`;
                default:
                    return '';
            }
        },

        /**
         * 部員オブジェクトからSVG文字列を取得（存在しなければ生成・保存）
         * @param {Object} member 部員
         * @param {number} width 幅
         * @param {number} height 高さ
         * @param {Object} options 描画オプション
         */
        getMemberFaceSvg: function (member, width = 64, height = 80, options = {}) {
            if (!member) {
                return this.renderSvg(this.generateFace({ seed: 'unknown' }), width, height, options);
            }
            // 既存の部員名簿（ClubState.members）からの同期・逆引きチェック
            if ((!member.face || !member.face.skin) && typeof window !== 'undefined' && window.ClubState && Array.isArray(window.ClubState.members)) {
                const cleanId = (member.id || '').replace(/^practice_/, '');
                const cleanName = member.shortName || (member.name && member.name.includes('・') ? member.name.split('・')[1] : member.name);
                const realMember = window.ClubState.members.find(m => (cleanId && m.id === cleanId) || m.name === cleanName || m.id === member.id);
                if (realMember && realMember.face && realMember.face.skin) {
                    member.face = realMember.face;
                }
            }
            if (!member.face || !member.face.skin) {
                member.face = this.generateFace({
                    seed: member.id || member.name,
                    name: member.name,
                    isPlayer: !!member.isPlayer,
                    uniformType: member.isClubDual ? 'shirt' : null
                });
            }
            return this.renderSvg(member.face, width, height, options);
        },

        /**
         * 生徒手帳詳細モーダルを表示する
         * @param {Object} member 部員オブジェクト
         */
        showHandbookModal: function (member) {
            if (!member) return;
            const modal = document.getElementById('studentHandbookModal');
            if (!modal) {
                console.warn('Student handbook modal container not found');
                return;
            }

            // 部員データの補完
            if (!member.face || !member.face.skin) {
                member.face = this.generateFace({
                    seed: member.id || member.name,
                    name: member.name,
                    isPlayer: !!member.isPlayer
                });
            }

            const schoolName = (window.ClubState && window.ClubState.schoolName) || '青雲高等学校';
            const prefecture = (window.ClubState && window.ClubState.prefecture) || '東京都';
            const currentYear = new Date().getFullYear();
            const yearStr = `${currentYear}年度`;

            const photoSvg = this.renderSvg(member.face, 110, 146, { withFrame: true, stampText: '青雲証' });

            const stanceLabel = member.favStance === 'jodan' ? '上段の構え' : (member.favStance === 'waki' ? '下段の構え' : '中段の構え');
            const combatPower = Math.round(
                (window.KendoClub && typeof window.KendoClub.getMemberCombatPower === 'function')
                    ? window.KendoClub.getMemberCombatPower(member)
                    : ((member.str || 10) + (member.agi || 10) + (member.spi || 10)) * 3
            );

            // 🥋 必殺技・得意打突の日本語ラベル取得
            const TECH_NAMES = {
                hien_men: { name: '飛燕二段面', type: '面', reqStat: 'men', reqVal: 38 },
                gouriki_men: { name: '剛烈・兜割り', type: '面', reqStat: 'men', reqVal: 52 },
                tenkou_men: { name: '天光一刀面', type: '面', reqStat: 'men', reqVal: 65 },
                dengeki_kote: { name: '出ばな電撃小手', type: '小手', reqStat: 'kote', reqVal: 40 },
                kasumi_kote: { name: '霞打ち連撃小手', type: '小手', reqStat: 'kote', reqVal: 55 },
                hayate_do: { name: '疾風抜き胴', type: '胴', reqStat: 'do', reqVal: 40 },
                gen_do: { name: '幻影逆胴一閃', type: '胴', reqStat: 'do', reqVal: 55 },
                shiden_tsuki: { name: '紫電一閃突き', type: '突き', reqStat: 'tsuki', reqVal: 38 },
                tensho_tsuki: { name: '天翔諸手突き', type: '突き', reqStat: 'tsuki', reqVal: 60 }
            };

            const allSpecialTechs = (typeof window !== 'undefined' && window.SPECIAL_TECHNIQUES)
                ? window.SPECIAL_TECHNIQUES
                : (typeof SPECIAL_TECHNIQUES !== 'undefined' ? SPECIAL_TECHNIQUES : null);

            const techInfo = (allSpecialTechs && allSpecialTechs[member.specialTechnique])
                ? allSpecialTechs[member.specialTechnique]
                : TECH_NAMES[member.specialTechnique];

            let specialTechLabel = '基本面';
            if (techInfo) {
                const currentVal = (member.skills && member.skills[techInfo.reqStat]) || 0;
                const isUnlocked = currentVal >= techInfo.reqVal;
                specialTechLabel = isUnlocked
                    ? `🌟 ${techInfo.name}（覚醒済）`
                    : `🔒 ${techInfo.name} (${techInfo.type}${currentVal}/${techInfo.reqVal})`;
            } else if (member.specialTechnique) {
                specialTechLabel = member.specialTechnique;
            }

            const isIHQual = !!(
                window.ClubState &&
                window.ClubState.qualifiedForInterhigh &&
                Array.isArray(window.ClubState.interhighQualifiedMemberIds) &&
                window.ClubState.interhighQualifiedMemberIds.includes(member.id)
            );
            const ihBadge = isIHQual
                ? '<span class="hb-role-badge ih-qual" title="全国高校総体（インターハイ）個人戦 出場権獲得！" style="margin-left: 4px;">👑 IH個人代表</span>'
                : '';

            const roleBadge = (member.isPlayer
                ? '<span class="hb-role-badge captain">👑 剣道部 主将</span>'
                : (member.isClubDual ? `<span class="hb-role-badge dual">🤝 ${member.originalClub || '他部'}助っ人</span>` : '<span class="hb-role-badge">部員</span>')) + ihBadge;

            // 四至打突の技術評価（最大99基準でゲージ幅を算出）
            const SKILL_HARD_MAX = 99;
            const getSkillPct = (v) => Math.min(100, Math.max(0, ((v || 0) / SKILL_HARD_MAX) * 100)).toFixed(1);

            const menVal = member.skills?.men ?? 10;
            const koteVal = member.skills?.kote ?? 10;
            const doVal = member.skills?.do ?? 10;
            const tsukiVal = member.skills?.tsuki ?? 10;

            const contentHtml = `
                <div class="handbook-book-wrap">
                    <div class="handbook-cover-edge"></div>
                    <div class="handbook-pages-container">
                        <!-- 左ページ：身分証明書・顔写真 -->
                        <div class="handbook-page left-page">
                            <div class="handbook-page-header">
                                <span class="hb-school-emblem">⚔️</span>
                                <h3 class="hb-school-name">${schoolName}</h3>
                                <div class="hb-cert-title">生 徒 手 帳 ・ 身 分 証 明 書</div>
                            </div>
                            
                            <div class="hb-photo-and-creds">
                                <div class="hb-photo-box">
                                    ${photoSvg}
                                    <div class="hb-photo-seal-stamp">割印</div>
                                </div>
                                <div class="hb-creds-box">
                                    <div class="hb-field-row">
                                        <span class="hb-field-lbl">学　年</span>
                                        <span class="hb-field-val">${member.grade}年（第${3 - member.grade + 1}期生）</span>
                                    </div>
                                    <div class="hb-field-row">
                                        <span class="hb-field-lbl">氏　名</span>
                                        <span class="hb-field-val hb-name">${member.name}</span>
                                    </div>
                                    <div class="hb-field-row">
                                        <span class="hb-field-lbl">役　職</span>
                                        <span class="hb-field-val">${roleBadge}</span>
                                    </div>
                                    <div class="hb-field-row">
                                        <span class="hb-field-lbl">所　属</span>
                                        <span class="hb-field-val">剣道部（${prefecture}高体連）</span>
                                    </div>
                                </div>
                            </div>

                            <div class="hb-notice-box">
                                本証を所持する者は本校生徒たることを証明す。<br>
                                「交剣知愛・不撓不屈」の校訓を胸に日々精進すべし。
                                <div class="hb-principal-seal">
                                    <span>${schoolName}長之印</span>
                                </div>
                            </div>
                        </div>

                        <!-- 右ページ：剣道部活動記録・能力カルテ -->
                        <div class="handbook-page right-page">
                            <div class="handbook-page-header">
                                <h4 class="hb-record-title">🥋 剣道部 活動カルテ</h4>
                                <span class="hb-fiscal-year">${yearStr}</span>
                            </div>

                            <div class="hb-stats-grid">
                                <div class="hb-stat-item">
                                    <span class="hb-stat-k">推定総合戦力</span>
                                    <span class="hb-stat-v highlight">${combatPower}</span>
                                </div>
                                <div class="hb-stat-item">
                                    <span class="hb-stat-k">得意構え</span>
                                    <span class="hb-stat-v">${stanceLabel}</span>
                                </div>
                                <div class="hb-stat-item full-width">
                                    <span class="hb-stat-k">必殺技・得意打突</span>
                                    <span class="hb-stat-v">${specialTechLabel}</span>
                                </div>
                            </div>

                            <div class="hb-base-stats-grid">
                                <div class="hb-base-stat-item">
                                    <span class="hb-stat-k">体力</span>
                                    <span class="hb-stat-v">${member.maxHealth || member.hp || 5}</span>
                                </div>
                                <div class="hb-base-stat-item">
                                    <span class="hb-stat-k">腕力</span>
                                    <span class="hb-stat-v">${member.str || 10}</span>
                                </div>
                                <div class="hb-base-stat-item">
                                    <span class="hb-stat-k">敏捷</span>
                                    <span class="hb-stat-v">${member.agi || 10}</span>
                                </div>
                                <div class="hb-base-stat-item">
                                    <span class="hb-stat-k">気力</span>
                                    <span class="hb-stat-v">${member.spi || 10}</span>
                                </div>
                            </div>

                            <div class="hb-skills-section">
                                <div class="hb-skills-header">
                                    <span>技術評価（四至打突）</span>
                                    <span class="hb-skills-max-badge">MAX 99</span>
                                </div>
                                <div class="hb-skills-bars">
                                    <div class="hb-skill-bar-row">
                                        <span class="hb-skill-name">面技</span>
                                        <div class="hb-bar-track"><div class="hb-bar-fill men" style="width: ${getSkillPct(menVal)}%;"></div></div>
                                        <span class="hb-skill-num ${menVal >= SKILL_HARD_MAX ? 'is-max' : ''}">${menVal}</span>
                                    </div>
                                    <div class="hb-skill-bar-row">
                                        <span class="hb-skill-name">小手技</span>
                                        <div class="hb-bar-track"><div class="hb-bar-fill kote" style="width: ${getSkillPct(koteVal)}%;"></div></div>
                                        <span class="hb-skill-num ${koteVal >= SKILL_HARD_MAX ? 'is-max' : ''}">${koteVal}</span>
                                    </div>
                                    <div class="hb-skill-bar-row">
                                        <span class="hb-skill-name">胴技</span>
                                        <div class="hb-bar-track"><div class="hb-bar-fill do" style="width: ${getSkillPct(doVal)}%;"></div></div>
                                        <span class="hb-skill-num ${doVal >= SKILL_HARD_MAX ? 'is-max' : ''}">${doVal}</span>
                                    </div>
                                    <div class="hb-skill-bar-row">
                                        <span class="hb-skill-name">突き技</span>
                                        <div class="hb-bar-track"><div class="hb-bar-fill tsuki" style="width: ${getSkillPct(tsukiVal)}%;"></div></div>
                                        <span class="hb-skill-num ${tsukiVal >= SKILL_HARD_MAX ? 'is-max' : ''}">${tsukiVal}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="hb-desc-box">
                                <span class="hb-desc-title">顧問・主将評言:</span>
                                <p class="hb-desc-text">${member.desc || '真面目に稽古へ励み、チームの勝利に貢献している。'}</p>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn-close-handbook" onclick="window.FaceGenerator.closeHandbookModal()" title="生徒手帳を閉じる">✕</button>
                </div>
            `;

            modal.innerHTML = contentHtml;
            modal.style.display = 'flex';
        },

        /**
         * 生徒手帳モーダルを閉じる
         */
        closeHandbookModal: function () {
            const modal = document.getElementById('studentHandbookModal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    };

    global.FaceGenerator = FaceGenerator;

})(typeof window !== 'undefined' ? window : this);
