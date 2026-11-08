/**
 * Kendo BGM Manager (js/bgm.js)
 * 画面に応じた高品質オーディオファイル（MP3 / WAV 等）の再生エンジン
 * - 単一のオーディオインスタンス（Single Audio Player）により、複数曲の同時再生を物理的に完全防止
 * - タイトル画面：bgm/Before_the_Strike.mp3（1回のみ再生、ループなし）
 * - 練習メニュー画面：bgm/Bare_Feet_on_Polished_Pine.mp3（ループ再生）
 * - 試合中：bgm/Stance_and_Steel.mp3（ループ再生）
 * - 試合結果画面：BGM完全停止（無音）
 * - 大会表彰状表示画面（優勝）：bgm/Gold_in_the_Dojo.mp3（1回のみ再生、ループなし）
 * - 大会表彰状表示画面（準優勝等）：bgm/The_Sunlit_Dojo.mp3（1回のみ再生、ループなし）
 * - 高校生ライフイベント画面：BGMは停止せず再生中の曲（練習メニューBGM等）をそのまま継続
 * - 音量調節（0〜100%）＆ ミュート機能（localStorageで永続化）
 * - ブラウザ自動再生制限（Autoplay Policy）対応
 */

(function (window) {
    'use strict';

    const STORAGE_KEY_VOL = 'kendo_bgm_volume';
    const STORAGE_KEY_MUTE = 'kendo_bgm_muted';

    // 画面ごとのトラック定義（URLパスとループ再生の可否）
    const SCENE_TRACKS = {
        title: {
            url: 'bgm/Before_the_Strike.mp3',
            loop: false, // タイトル画面は1回のみ再生（ループなし）
        },
        club: {
            url: 'bgm/Bare_Feet_on_Polished_Pine.mp3',
            loop: true, // 練習メニュー画面はループ再生
        },
        match: {
            url: 'bgm/Stance_and_Steel.mp3',
            loop: true, // 試合中はループ再生
        },
        ceremony: {
            url: 'bgm/The_Sunlit_Dojo.mp3',
            loop: false, // 大会終了・表彰状表示画面（準優勝・入賞等）は1回のみ再生（ループなし）
        },
        victory: {
            url: 'bgm/Gold_in_the_Dojo.mp3',
            loop: false, // 大会優勝・表彰状表示画面は1回のみ再生（ループなし）
        },
        gold: {
            url: 'bgm/Gold_in_the_Dojo.mp3',
            loop: false, // 免許皆伝・完全制覇画面（エイリアス）
        },
        tournament: null,
        farewell: {
            url: 'bgm/The_Sunlit_Dojo.mp3',
            loop: false, // 3年生引退・新主将指名シーン
        },
    };

    // デフォルト音量 (0.0 〜 1.0)
    let masterVolume = 0.65;
    let isMuted = false;

    // localStorage から設定復元
    try {
        const savedVol = localStorage.getItem(STORAGE_KEY_VOL);
        if (savedVol !== null) {
            const v = parseFloat(savedVol);
            if (!isNaN(v) && v >= 0 && v <= 1) {
                masterVolume = v;
            }
        }
        const savedMute = localStorage.getItem(STORAGE_KEY_MUTE);
        if (savedMute !== null) {
            isMuted = savedMute === 'true';
        }
    } catch (e) {
        // localStorage 非対応環境へのフォールバック
    }

    // 単一オーディオインスタンス
    const bgmAudio = new Audio();
    bgmAudio.preload = 'auto';

    let currentScene = null;
    let pendingScene = null;
    let fadeTimer = null;
    let currentVolRatio = 1.0; // 定常時は 1.0（フルフェード比率）

    // 統合音量・ミュート適用関数
    // ※ createMediaElementSource を使うと、PCローカル環境（file://等）でCORS制限により
    //   ブラウザが無音を出力してしまう重大な副作用があるため、直接HTMLMediaElementで制御する。
    //   iPad/iOS対策として、ミュート時・音量ゼロ時は pause() で確実に完全無音化を行う。
    function applyVolume(volRatio) {
        if (volRatio !== undefined) {
            currentVolRatio = Math.max(0.0, Math.min(1.0, volRatio));
        } else if (!fadeTimer) {
            // フェードタイマー非作動時の定常状態は常に比率 1.0
            currentVolRatio = 1.0;
        }
        const effectiveVol = isMuted ? 0.0 : Math.max(0.0, Math.min(1.0, currentVolRatio * masterVolume));

        try {
            bgmAudio.volume = effectiveVol;
            bgmAudio.muted = isMuted || effectiveVol === 0;
        } catch (e) {}

        // iPad / iOS 対策: iOS では audio.volume プロパティが読み取り専用（常に1）のため、
        // ミュート時および音量0時は一時停止することで確実に無音化する
        if (isMuted || effectiveVol === 0) {
            if (!bgmAudio.paused) {
                bgmAudio.pause();
                bgmAudio._pausedForMute = true;
            }
        } else if (bgmAudio._pausedForMute) {
            bgmAudio._pausedForMute = false;
            if (currentScene && bgmAudio.paused && !bgmAudio.ended) {
                const p = bgmAudio.play();
                if (p) {
                    p.then(() => startFadeIn(300)).catch(() => {});
                }
            }
        }
    }

    bgmAudio.addEventListener('play', () => KendoBGM.updateUi());
    bgmAudio.addEventListener('pause', () => KendoBGM.updateUi());
    bgmAudio.addEventListener('ended', () => KendoBGM.updateUi());

    // ユーザー操作検知（ブラウザAutoplay制限の解除トリガー）
    function onUserInteraction() {
        if (currentScene && bgmAudio.paused && !bgmAudio.ended && !isMuted && masterVolume > 0) {
            const playPromise = bgmAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    startFadeIn(400);
                    KendoBGM.updateUi();
                }).catch(() => {});
            }
        } else if (pendingScene) {
            const s = pendingScene;
            pendingScene = null;
            KendoBGM.play(s);
        }
    }

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'].forEach(evt => {
            window.addEventListener(evt, onUserInteraction, { passive: true });
        });
    }

    // 音量フェードイン処理
    function startFadeIn(durationMs = 400) {
        if (fadeTimer) {
            clearInterval(fadeTimer);
            fadeTimer = null;
        }

        const startTime = Date.now();
        const startRatio = currentVolRatio;
        const targetRatio = 1.0;
        const stepInterval = 30;

        applyVolume(startRatio);

        fadeTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1.0, elapsed / durationMs);
            const ratio = startRatio + (targetRatio - startRatio) * progress;
            applyVolume(ratio);

            if (progress >= 1.0) {
                clearInterval(fadeTimer);
                fadeTimer = null;
            }
        }, stepInterval);
    }

    const KendoBGM = {
        /**
         * 指定シーンのBGMを再生
         * @param {string} sceneKey - 'title' | 'club' | 'tournament' | 'match' | 'victory' | 'farewell' | 'event'
         * @param {number} [fadeDuration=400] - フェードインにかける時間（ミリ秒）
         * @param {boolean} [forceRestart=false] - 既に終了している場合に最初から再開するか
         */
        play: function (sceneKey, fadeDuration = 400, forceRestart = false) {
            const trackDef = SCENE_TRACKS[sceneKey];
            if (!trackDef || !trackDef.url) {
                // トラック未設定のシーン（wav削除済み）は再生せず安全に停止
                this.stop();
                currentScene = sceneKey;
                return;
            }

            // ケース1: 既に同一シーンが再生中の場合は何もしない（再生中の多重呼び出し防止）
            if (!forceRestart && currentScene === sceneKey && !bgmAudio.paused && !bgmAudio.ended) {
                return;
            }

            // ケース2: 同一シーンで一時停止（Autoplay制限等）している場合は再生再開
            if (!forceRestart && currentScene === sceneKey && bgmAudio.paused && !bgmAudio.ended && bgmAudio.currentTime > 0) {
                const playPromise = bgmAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        startFadeIn(fadeDuration);
                        this.updateUi();
                    }).catch((err) => {
                        if (err.name === 'NotAllowedError') {
                            pendingScene = sceneKey;
                        }
                    });
                }
                return;
            }

            // ケース3: 新しい曲への切り替え、または再開
            currentScene = sceneKey;

            if (fadeTimer) {
                clearInterval(fadeTimer);
                fadeTimer = null;
            }
            bgmAudio.pause();
            bgmAudio.currentTime = 0;

            // ループ設定（タイトルはfalse、他はtrue）
            bgmAudio.loop = !!trackDef.loop;
            bgmAudio.src = trackDef.url;

            applyVolume(0.0);

            const playPromise = bgmAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    startFadeIn(fadeDuration);
                    this.updateUi();
                }).catch((err) => {
                    if (err.name === 'NotAllowedError') {
                        pendingScene = sceneKey;
                        this.updateUi();
                    } else {
                        console.warn(`[KendoBGM] Audio notice for '${sceneKey}':`, err.message);
                    }
                });
            }
        },

        /**
         * 現在のBGMを停止
         */
        stop: function () {
            currentScene = null;
            pendingScene = null;
            if (fadeTimer) {
                clearInterval(fadeTimer);
                fadeTimer = null;
            }
            bgmAudio.pause();
            bgmAudio.currentTime = 0;
            applyVolume(0.0);
            this.updateUi();
        },

        /**
         * マスター音量を設定 (0.0 〜 1.0)
         */
        setVolume: function (vol) {
            masterVolume = Math.max(0.0, Math.min(1.0, parseFloat(vol) || 0));
            try {
                localStorage.setItem(STORAGE_KEY_VOL, masterVolume.toFixed(2));
            } catch (e) {}

            applyVolume();

            // ゲーム内の音声（効果音・気合・審判）の音量も連動更新
            if (window.KendoGameEngine && typeof window.KendoGameEngine.updateAudioVolume === 'function') {
                window.KendoGameEngine.updateAudioVolume();
            }

            this.updateUi();
        },

        getVolume: function () {
            return masterVolume;
        },

        /**
         * 現在の有効な音声（効果音・ボイス）音量 (0.0 〜 1.0)
         */
        getSoundVolume: function () {
            return isMuted ? 0.0 : masterVolume;
        },

        /**
         * ミュート切り替え (ON / OFF)
         */
        toggleMute: function () {
            this.setMute(!isMuted);
        },

        setMute: function (mute) {
            isMuted = !!mute;
            try {
                localStorage.setItem(STORAGE_KEY_MUTE, isMuted ? 'true' : 'false');
            } catch (e) {}

            applyVolume();

            // ゲーム内の音声（効果音・気合・審判）の音量も連動更新
            if (window.KendoGameEngine && typeof window.KendoGameEngine.updateAudioVolume === 'function') {
                window.KendoGameEngine.updateAudioVolume();
            }

            // ミュート解除時に一時停止中なら再生再開
            if (!isMuted) {
                if (currentScene && bgmAudio.paused && !bgmAudio.ended) {
                    const p = bgmAudio.play();
                    if (p) {
                        p.then(() => {
                            startFadeIn(400);
                        }).catch(() => {});
                    }
                } else if (currentScene && bgmAudio.ended) {
                    this.play(currentScene, 400, true);
                }
            }

            this.updateUi();
        },

        isMuted: function () {
            return isMuted;
        },

        getCurrentScene: function () {
            return currentScene;
        },

        isPlaying: function () {
            return !bgmAudio.paused && !bgmAudio.ended && bgmAudio.volume > 0.001;
        },

        isEnded: function () {
            return bgmAudio.ended;
        },

        /**
         * ヘッダーの音響UI要素を同期更新
         */
        updateUi: function () {
            const btn = document.getElementById('bgmMuteBtn');
            const slider = document.getElementById('bgmVolumeSlider');
            const volText = document.getElementById('bgmVolumeText');
            const promptBadge = document.getElementById('bgmPromptBadge');

            const isAudioPlaying = !bgmAudio.paused && !bgmAudio.ended;

            if (btn) {
                if (isMuted || masterVolume === 0) {
                    btn.textContent = '🔇';
                    btn.title = 'BGMミュート中（クリックで解除）';
                    btn.classList.add('muted');
                } else if (!isAudioPlaying) {
                    btn.textContent = '🎵';
                    btn.title = 'クリックでBGM再生開始';
                    btn.classList.remove('muted');
                } else {
                    btn.textContent = masterVolume > 0.5 ? '🔊' : '🔉';
                    btn.title = 'BGM再生中（クリックでミュート）';
                    btn.classList.remove('muted');
                }
            }
            if (slider) {
                slider.value = isMuted ? 0 : Math.round(masterVolume * 100);
            }
            if (volText) {
                volText.textContent = isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`;
            }

            // タイトル画面のガイダンスバッジの更新
            if (promptBadge) {
                if (isAudioPlaying && !isMuted) {
                    promptBadge.classList.add('playing');
                    promptBadge.innerHTML = '🎵 <span class="bgm-badge-text">BGM再生中（1回再生）</span>';
                    promptBadge.title = 'BGM再生中';
                } else if (bgmAudio.ended) {
                    promptBadge.classList.remove('playing');
                    promptBadge.innerHTML = '🎵 <span class="bgm-badge-text">BGM再生終了（クリックで再再生）</span>';
                    promptBadge.title = 'クリックでもう一度BGMを再生';
                } else if (isMuted) {
                    promptBadge.classList.remove('playing');
                    promptBadge.innerHTML = '🔇 <span class="bgm-badge-text">BGMミュート中（クリックで再生）</span>';
                    promptBadge.title = 'クリックでミュート解除';
                } else {
                    promptBadge.classList.remove('playing');
                    promptBadge.innerHTML = '🎵 <span class="bgm-badge-text pulse">画面をクリックしてBGMを再生</span>';
                    promptBadge.title = 'クリックで和風BGMを再生';
                }
            }
        },

        /**
         * 初期化処理
         */
        init: function () {
            this.updateUi();
            this.play('title');
        }
    };

    window.KendoBGM = KendoBGM;

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => KendoBGM.init());
        } else {
            KendoBGM.init();
        }
    }

})(typeof window !== 'undefined' ? window : this);
