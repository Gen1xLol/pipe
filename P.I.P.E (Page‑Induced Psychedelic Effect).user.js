// ==UserScript==
// @name         P.I.P.E (Page‑Induced Psychedelic Effect)
// @namespace    https://github.com/Gen1xLol/pipe
// @version      1.0
// @description  Corrupts pages enough to make you have a seizure, mostly works on HTML5 games
// @author       Gen1x
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CORRUPTION_CHANCE = 0.05;
    const GLITCH_INTENSITY = 0.1;
    const CODE_CORRUPTION_CHANCE = 0.02;
    const AUDIO_CORRUPTION_CHANCE = 0.3;

    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const originalMethods = {};

const universalAudioCorruption = {

    activeAudioElements: new Set(),
    activeAudioContexts: new Set(),
    corruptionIntervals: new Map(),

    corruptAudioConstructor: () => {
        const OriginalAudio = window.Audio;

        window.Audio = function(src) {
            const audio = new OriginalAudio(src);

            universalAudioCorruption.activeAudioElements.add(audio);

            universalAudioCorruption.corruptAudioInstance(audio);

            return audio;
        };

        window.Audio.prototype = OriginalAudio.prototype;

        document.querySelectorAll('audio').forEach(audio => {
            universalAudioCorruption.corruptAudioInstance(audio);
        });
    },

    corruptAudioInstance: (audio) => {
        const originalPlay = audio.play;
        const originalPause = audio.pause;
        const originalLoad = audio.load;

        audio.play = function() {
            if (Math.random() < AUDIO_CORRUPTION_CHANCE) {

                const corruptedVolume = Math.random();
                const corruptedRate = 0.1 + Math.random() * 2.5;

                if (isFinite(corruptedVolume) && corruptedVolume >= 0 && corruptedVolume <= 1) {
                    this.volume = corruptedVolume;
                }

                if (isFinite(corruptedRate) && corruptedRate > 0) {
                    this.playbackRate = corruptedRate;
                }

                if (Math.random() < 0.4) {
                    const pitchRate = 0.05 + Math.random() * 3;
                    if (isFinite(pitchRate) && pitchRate > 0) {
                        this.playbackRate = pitchRate;
                    }
                }

                if (Math.random() < 0.1) {
                    this.volume = 0;
                }

                if (Math.random() < 0.3) {
                    const newTime = Math.random() * (this.duration || 10);
                    if (isFinite(newTime) && newTime >= 0) {
                        this.currentTime = newTime;
                    }
                }
            }

            universalAudioCorruption.startDynamicCorruption(this);

            if (Math.random() < AUDIO_CORRUPTION_CHANCE * 0.2) {
                console.log('Audio play corrupted - prevented');
                return Promise.reject(new Error('Audio corrupted'));
            }

            return originalPlay.call(this);
        };

        audio.pause = function() {

            if (Math.random() < AUDIO_CORRUPTION_CHANCE * 0.3) {
                console.log('Audio pause corrupted - ignored');
                return;
            }

            if (Math.random() < AUDIO_CORRUPTION_CHANCE) {
                setTimeout(() => {
                    originalPause.call(this);
                }, Math.random() * 1000);
                return;
            }

            universalAudioCorruption.stopDynamicCorruption(this);
            return originalPause.call(this);
        };

        audio.load = function() {
            const result = originalLoad.call(this);

            if (Math.random() < AUDIO_CORRUPTION_CHANCE) {

                setTimeout(() => {
                    const corruptedVolume = Math.random();
                    const corruptedRate = 0.25 + Math.random() * 2;

                    if (isFinite(corruptedVolume) && corruptedVolume >= 0 && corruptedVolume <= 1) {
                        this.volume = corruptedVolume;
                    }

                    if (isFinite(corruptedRate) && corruptedRate > 0) {
                        this.playbackRate = corruptedRate;
                    }
                }, 100 + Math.random() * 500);
            }

            return result;
        };

        universalAudioCorruption.corruptAudioProperties(audio);

        audio.addEventListener('ended', () => {
            universalAudioCorruption.stopDynamicCorruption(audio);
        });

        audio.addEventListener('error', () => {
            universalAudioCorruption.stopDynamicCorruption(audio);
        });
    },

    corruptAudioProperties: (audio) => {

        let _volume = audio.volume;
        Object.defineProperty(audio, 'volume', {
            get: function() {
                if (Math.random() < AUDIO_CORRUPTION_CHANCE) {
                    const corruptedVolume = Math.random();
                    return isFinite(corruptedVolume) && corruptedVolume >= 0 && corruptedVolume <= 1 ? corruptedVolume : _volume;
                }
                return _volume;
            },
            set: function(value) {
                let corruptedVolume = value;
                if (Math.random() < AUDIO_CORRUPTION_CHANCE) {
                    corruptedVolume = Math.random();
                }

                if (isFinite(corruptedVolume) && corruptedVolume >= 0 && corruptedVolume <= 1) {
                    _volume = corruptedVolume;
                    HTMLMediaElement.prototype.__lookupSetter__('volume').call(this, _volume);
                } else {
                    _volume = Math.max(0, Math.min(1, value));
                    HTMLMediaElement.prototype.__lookupSetter__('volume').call(this, _volume);
                }
            },
            configurable: true
        });

        let _playbackRate = audio.playbackRate;
        Object.defineProperty(audio, 'playbackRate', {
            get: function() {
                if (Math.random() < AUDIO_CORRUPTION_CHANCE) {
                    const corruptedRate = 0.1 + Math.random() * 2.5;
                    return isFinite(corruptedRate) && corruptedRate > 0 ? corruptedRate : _playbackRate;
                }
                return _playbackRate;
            },
            set: function(value) {
                let corruptedRate = value;
                if (Math.random() < AUDIO_CORRUPTION_CHANCE) {
                    corruptedRate = 0.1 + Math.random() * 2.5;
                }

                if (isFinite(corruptedRate) && corruptedRate > 0) {
                    _playbackRate = corruptedRate;
                    HTMLMediaElement.prototype.__lookupSetter__('playbackRate').call(this, _playbackRate);
                } else {
                    _playbackRate = value;
                    HTMLMediaElement.prototype.__lookupSetter__('playbackRate').call(this, value);
                }
            },
            configurable: true
        });

        let _currentTime = audio.currentTime;
        Object.defineProperty(audio, 'currentTime', {
            get: function() {
                const realTime = HTMLMediaElement.prototype.__lookupGetter__('currentTime').call(this);
                if (Math.random() < AUDIO_CORRUPTION_CHANCE) {
                    const corruptedTime = realTime + (Math.random() - 0.5) * 5;
                    return isFinite(corruptedTime) && corruptedTime >= 0 ? corruptedTime : realTime;
                }
                return realTime;
            },
            set: function(value) {
                let corruptedTime = value;
                if (Math.random() < AUDIO_CORRUPTION_CHANCE) {
                    corruptedTime = value + (Math.random() - 0.5) * 3;
                }

                if (isFinite(corruptedTime) && corruptedTime >= 0) {
                    HTMLMediaElement.prototype.__lookupSetter__('currentTime').call(this, corruptedTime);
                } else {
                    HTMLMediaElement.prototype.__lookupSetter__('currentTime').call(this, value);
                }
            },
            configurable: true
        });

        let _src = audio.src;
        Object.defineProperty(audio, 'src', {
            get: function() {
                return _src;
            },
            set: function(value) {
                _src = value;

                if (Math.random() < AUDIO_CORRUPTION_CHANCE * 0.1) {
                    const corruptedSrc = value + '?corrupted=' + Math.random();
                    HTMLMediaElement.prototype.__lookupSetter__('src').call(this, corruptedSrc);
                } else {
                    HTMLMediaElement.prototype.__lookupSetter__('src').call(this, value);
                }
            },
            configurable: true
        });
    },

    corruptAudioBuffers: () => {

        if (window.AudioContext || window.webkitAudioContext) {
            const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;

            const originalAudioContextConstructor = OriginalAudioContext;
            window.AudioContext = window.webkitAudioContext = function(...args) {
                const ctx = new originalAudioContextConstructor(...args);
                universalAudioCorruption.activeAudioContexts.add(ctx);
                return ctx;
            };

            const originalCreateBuffer = OriginalAudioContext.prototype.createBuffer;
            OriginalAudioContext.prototype.createBuffer = function(channels, length, sampleRate) {
                const buffer = originalCreateBuffer.call(this, channels, length, sampleRate);

                if (Math.random() < AUDIO_CORRUPTION_CHANCE) {
                    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                        const channelData = buffer.getChannelData(channel);
                        for (let i = 0; i < channelData.length; i++) {
                            if (Math.random() < 0.001) {
                                channelData[i] = (Math.random() - 0.5) * 2;
                            }
                            if (Math.random() < 0.0001) {
                                channelData[i] *= -1;
                            }
                            if (Math.random() < 0.0001) {
                                channelData[i] *= Math.random() * 3;
                            }
                        }
                    }
                }
                return buffer;
            };

            const originalDecodeAudioData = OriginalAudioContext.prototype.decodeAudioData;
            OriginalAudioContext.prototype.decodeAudioData = function(audioData, successCallback, errorCallback) {
                const corruptedSuccessCallback = function(buffer) {
                    if (Math.random() < AUDIO_CORRUPTION_CHANCE) {

                        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                            const channelData = buffer.getChannelData(channel);
                            for (let i = 0; i < channelData.length; i++) {
                                if (Math.random() < 0.005) {
                                    channelData[i] = (Math.random() - 0.5) * 0.5;
                                }
                                if (Math.random() < 0.001) {
                                    channelData[i] *= 0.1;
                                }
                                if (Math.random() < 0.0005) {
                                    channelData[i] = Math.sin(i * 0.1) * 0.3;
                                }
                            }
                        }
                    }
                    if (successCallback) successCallback(buffer);
                };

                return originalDecodeAudioData.call(this, audioData, corruptedSuccessCallback, errorCallback);
            };
        }
    },

    corruptHTMLAudio: () => {

        const corruptMediaElement = (element) => {
            const originalPlay = element.play;
            const originalPause = element.pause;
            const originalLoad = element.load;

            universalAudioCorruption.activeAudioElements.add(element);

            element.play = function() {
                if (Math.random() < AUDIO_CORRUPTION_CHANCE) {

                    this.playbackRate = 0.1 + Math.random() * 2;
                    this.volume = Math.random();

                    if (Math.random() < 0.3) {
                        this.playbackRate = 0.25 + Math.random() * 1.5;
                    }

                    if (Math.random() < 0.1) {
                        this.playbackRate = -0.5 - Math.random() * 0.5;
                    }
                }

                universalAudioCorruption.startDynamicCorruption(this);

                return originalPlay.call(this);
            };

            element.pause = function() {
                if (Math.random() < AUDIO_CORRUPTION_CHANCE * 0.5) {

                    return Promise.resolve();
                }

                universalAudioCorruption.stopDynamicCorruption(this);

                return originalPause.call(this);
            };

            element.load = function() {
                const result = originalLoad.call(this);
                if (Math.random() < AUDIO_CORRUPTION_CHANCE) {

                    setTimeout(() => {
                        this.volume = Math.random();
                        this.playbackRate = 0.5 + Math.random();
                    }, 100);
                }
                return result;
            };

            element.addEventListener('ended', () => {
                universalAudioCorruption.stopDynamicCorruption(element);
            });

            element.addEventListener('remove', () => {
                universalAudioCorruption.activeAudioElements.delete(element);
                universalAudioCorruption.stopDynamicCorruption(element);
            });
        };

        document.querySelectorAll('audio, video').forEach(corruptMediaElement);

        const originalCreateElement = document.createElement;
        document.createElement = function(tagName, options) {
            const element = originalCreateElement.call(this, tagName, options);
            if (tagName.toLowerCase() === 'audio' || tagName.toLowerCase() === 'video') {
                setTimeout(() => corruptMediaElement(element), 0);
            }
            return element;
        };
    },

    startDynamicCorruption: (element) => {

        universalAudioCorruption.stopDynamicCorruption(element);

        const corruptionInterval = setInterval(() => {
            if (element.paused || element.ended) {
                universalAudioCorruption.stopDynamicCorruption(element);
                return;
            }

            if (Math.random() < 0.3) {
                const pitchShift = 0.25 + Math.random() * 1.75;
                element.playbackRate = pitchShift;
            }

            if (Math.random() < 0.4) {
                element.volume = Math.random() * 0.8 + 0.1;
            }

            if (Math.random() < 0.1) {
                const currentTime = element.currentTime;
                const newTime = Math.max(0, currentTime - Math.random() * 0.5);
                if (isFinite(newTime) && newTime >= 0) {
                    element.currentTime = newTime;
                }
            }

            if (Math.random() < 0.05) {
                const seekPosition = Math.random() * (element.duration || 30);
                if (isFinite(seekPosition) && seekPosition >= 0 && element.duration && seekPosition <= element.duration) {
                    element.currentTime = seekPosition;
                }
            }

            if (Math.random() < 0.2) {
                const targetRate = 0.1 + Math.random() * 2;
                const steps = 10;
                const currentRate = element.playbackRate;
                const stepSize = (targetRate - currentRate) / steps;

                let step = 0;
                const rampInterval = setInterval(() => {
                    step++;
                    element.playbackRate = currentRate + (stepSize * step);
                    if (step >= steps) {
                        clearInterval(rampInterval);
                    }
                }, 50);
            }

            if (Math.random() < 0.3) {
                const effects = [
                    `contrast(${50 + Math.random() * 200}%)`,
                    `saturate(${Math.random() * 300}%)`,
                    `brightness(${50 + Math.random() * 100}%)`,
                    `hue-rotate(${Math.random() * 360}deg)`,
                    `blur(${Math.random() * 3}px)`,
                    `opacity(${0.3 + Math.random() * 0.7})`
                ];

                const randomEffects = effects.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3));
                element.style.filter = randomEffects.join(' ');
            }

            if (Math.random() < 0.02) {

                element.playbackRate = 0.05 + Math.random() * 4;
            }

            if (Math.random() < 0.01) {

                const originalVolume = element.volume;
                element.volume = 0;
                setTimeout(() => {
                    element.volume = originalVolume;
                }, 100 + Math.random() * 500);
            }

            if (Math.random() < 0.1) {
                const delay = Math.random() * 200;
                element.style.transition = `all ${delay}ms ease`;
            }

        }, 100 + Math.random() * 400);

        universalAudioCorruption.corruptionIntervals.set(element, corruptionInterval);
    },

    stopDynamicCorruption: (element) => {
        const interval = universalAudioCorruption.corruptionIntervals.get(element);
        if (interval) {
            clearInterval(interval);
            universalAudioCorruption.corruptionIntervals.delete(element);
        }
    },

    corruptWebAudioNodes: () => {
        if (window.AudioContext || window.webkitAudioContext) {
            const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;

            const nodeCreationMethods = [
                'createBufferSource', 'createMediaElementSource', 'createMediaStreamSource',
                'createOscillator', 'createGain', 'createDelay', 'createBiquadFilter',
                'createWaveShaper', 'createPanner', 'createConvolver', 'createChannelSplitter',
                'createChannelMerger', 'createDynamicsCompressor', 'createAnalyser',
                'createScriptProcessor', 'createPeriodicWave'
            ];

            nodeCreationMethods.forEach(method => {
                if (OriginalAudioContext.prototype[method]) {
                    const originalMethod = OriginalAudioContext.prototype[method];
                    OriginalAudioContext.prototype[method] = function(...args) {
                        const node = originalMethod.apply(this, args);

                        if (Math.random() < AUDIO_CORRUPTION_CHANCE) {
                            setTimeout(() => {

                                if (node.gain && node.gain.value !== undefined) {
                                    node.gain.value *= Math.random() * 2;
                                }
                                if (node.frequency && node.frequency.value !== undefined) {
                                    node.frequency.value *= 0.5 + Math.random();
                                }
                                if (node.playbackRate && node.playbackRate.value !== undefined) {
                                    node.playbackRate.value *= 0.25 + Math.random() * 1.5;
                                }
                                if (node.detune && node.detune.value !== undefined) {
                                    node.detune.value += (Math.random() - 0.5) * 1200;
                                }
                            }, 0);

                            universalAudioCorruption.startWebAudioDynamicCorruption(node);
                        }

                        return node;
                    };
                }
            });
        }
    },

    startWebAudioDynamicCorruption: (node) => {
        if (node.start && typeof node.start === 'function') {
            const originalStart = node.start;
            node.start = function(...args) {
                const result = originalStart.apply(this, args);

                const corruptionInterval = setInterval(() => {
                    try {

                        if (node.gain && node.gain.value !== undefined) {
                            if (Math.random() < 0.3) {
                                node.gain.setValueAtTime(Math.random() * 2, node.context.currentTime);
                            }
                        }

                        if (node.frequency && node.frequency.value !== undefined) {
                            if (Math.random() < 0.2) {
                                const newFreq = node.frequency.value * (0.5 + Math.random());
                                node.frequency.setValueAtTime(newFreq, node.context.currentTime);
                            }
                        }

                        if (node.playbackRate && node.playbackRate.value !== undefined) {
                            if (Math.random() < 0.25) {
                                const newRate = 0.1 + Math.random() * 2;
                                node.playbackRate.setValueAtTime(newRate, node.context.currentTime);
                            }
                        }

                        if (node.detune && node.detune.value !== undefined) {
                            if (Math.random() < 0.15) {
                                const newDetune = (Math.random() - 0.5) * 1200;
                                node.detune.setValueAtTime(newDetune, node.context.currentTime);
                            }
                        }

                        if (node.Q && node.Q.value !== undefined) {
                            if (Math.random() < 0.1) {
                                node.Q.setValueAtTime(Math.random() * 30, node.context.currentTime);
                            }
                        }

                        if (node.delayTime && node.delayTime.value !== undefined) {
                            if (Math.random() < 0.1) {
                                node.delayTime.setValueAtTime(Math.random() * 0.5, node.context.currentTime);
                            }
                        }

                    } catch (e) {

                        clearInterval(corruptionInterval);
                    }
                }, 200 + Math.random() * 800);

                setTimeout(() => {
                    clearInterval(corruptionInterval);
                }, 30000 + Math.random() * 60000);

                return result;
            };
        }
    },

    corruptAudioFetch: () => {
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input.url;

            const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.opus'];
            const isAudioRequest = audioExtensions.some(ext => url.toLowerCase().includes(ext)) ||
                                 (init && init.headers &&
                                  Object.values(init.headers).some(h => h.includes('audio')));

            if (isAudioRequest && Math.random() < AUDIO_CORRUPTION_CHANCE) {

                return originalFetch.call(this, input, init).then(response => {
                    if (response.ok) {
                        return response.arrayBuffer().then(buffer => {

                            const corruptedBuffer = new ArrayBuffer(buffer.byteLength);
                            const originalView = new Uint8Array(buffer);
                            const corruptedView = new Uint8Array(corruptedBuffer);

                            for (let i = 0; i < originalView.length; i++) {
                                corruptedView[i] = originalView[i];
                                if (Math.random() < 0.001) {
                                    corruptedView[i] = Math.floor(Math.random() * 256);
                                }
                            }

                            return new Response(corruptedBuffer, {
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers
                            });
                        });
                    }
                    return response;
                });
            }

            return originalFetch.call(this, input, init);
        };
    },

    corruptXHRAudio: () => {
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._isAudioRequest = false;
            if (url) {
                const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.opus'];
                this._isAudioRequest = audioExtensions.some(ext => url.toLowerCase().includes(ext));
            }
            return originalXHROpen.call(this, method, url, ...args);
        };

        XMLHttpRequest.prototype.send = function(data) {
            if (this._isAudioRequest && Math.random() < AUDIO_CORRUPTION_CHANCE) {
                const originalOnLoad = this.onload;
                this.onload = function() {
                    if (this.response && this.response instanceof ArrayBuffer) {

                        const view = new Uint8Array(this.response);
                        for (let i = 0; i < view.length; i++) {
                            if (Math.random() < 0.001) {
                                view[i] = Math.floor(Math.random() * 256);
                            }
                        }
                    }
                    if (originalOnLoad) originalOnLoad.call(this);
                };
            }
            return originalXHRSend.call(this, data);
        };
    },

    corruptObjectURL: () => {
        const originalCreateObjectURL = URL.createObjectURL;
        URL.createObjectURL = function(object) {
            if (object instanceof Blob && object.type.startsWith('audio/')) {
                if (Math.random() < AUDIO_CORRUPTION_CHANCE) {

                    return object.arrayBuffer().then(buffer => {
                        const view = new Uint8Array(buffer);
                        for (let i = 0; i < view.length; i++) {
                            if (Math.random() < 0.001) {
                                view[i] = Math.floor(Math.random() * 256);
                            }
                        }
                        const corruptedBlob = new Blob([view], { type: object.type });
                        return originalCreateObjectURL.call(this, corruptedBlob);
                    });
                }
            }
            return originalCreateObjectURL.call(this, object);
        };
    },

    intensifyGlobalCorruption: () => {

        universalAudioCorruption.activeAudioElements.forEach(element => {
            if (!element.paused && !element.ended) {
                if (Math.random() < 0.8) {

                    element.playbackRate = 0.05 + Math.random() * 3;
                    element.volume = Math.random();

                    if (Math.random() < 0.5) {
                        element.currentTime = Math.max(0, element.currentTime - Math.random() * 2);
                    }
                }
            }
        });

        universalAudioCorruption.activeAudioContexts.forEach(ctx => {
            if (ctx.state === 'running') {

                if (ctx.destination && ctx.destination.channelCount) {
                    try {
                        ctx.destination.channelCount = Math.floor(Math.random() * 6) + 1;
                    } catch (e) {

                    }
                }
            }
        });
    },

    init: () => {

        if (typeof AUDIO_CORRUPTION_CHANCE === 'undefined') {
            window.AUDIO_CORRUPTION_CHANCE = 0.3;
        }

        universalAudioCorruption.corruptAudioConstructor();
        universalAudioCorruption.corruptAudioBuffers();
        universalAudioCorruption.corruptHTMLAudio();
        universalAudioCorruption.corruptWebAudioNodes();
        universalAudioCorruption.corruptAudioFetch();
        universalAudioCorruption.corruptXHRAudio();
        universalAudioCorruption.corruptObjectURL();

        setInterval(() => {
            universalAudioCorruption.intensifyGlobalCorruption();
        }, 5000 + Math.random() * 5000);

        console.log('Universal Audio Corruption initialized');
    }
};

universalAudioCorruption.init();

    const codeCorruption = {
        corruptEventSystem: () => {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        const corruptedListener = (...args) => {

            if (Math.random() < 0.15 && args[0] && args[0].preventDefault && args[0].cancelable) {
                try {
                    args[0].preventDefault();
                } catch (e) {

                }
            }

            if (args[0] && Math.random() < 0.2) {
                try {
                    if (args[0].clientX !== undefined) {
                        Object.defineProperty(args[0], 'clientX', {
                            value: args[0].clientX + (Math.random() - 0.5) * 100,
                            writable: true,
                            configurable: true
                        });
                    }
                    if (args[0].clientY !== undefined) {
                        Object.defineProperty(args[0], 'clientY', {
                            value: args[0].clientY + (Math.random() - 0.5) * 100,
                            writable: true,
                            configurable: true
                        });
                    }
                } catch (e) {

                }
            }

            return listener.apply(this, args);
        };

        let actualOptions = options;
        if (typeof options === 'boolean') {
            actualOptions = { capture: options };
        } else if (options && typeof options === 'object') {
            actualOptions = { ...options };
        }

        const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
        if (passiveEvents.includes(type)) {

            if (actualOptions && actualOptions.passive !== false) {
                actualOptions = actualOptions || {};
                actualOptions.passive = true;
            }
        }

        return originalAddEventListener.call(this, type, corruptedListener, actualOptions);
    };
},

        corruptRuntimeVariables: () => {

    const variableTracker = new Map();
    const VARIABLE_CORRUPTION_CHANCE = 0.08;

    const corruptVariableAccess = () => {

        const originalWindowPropertyDescriptor = Object.getOwnPropertyDescriptor(window, 'window');

        const originalEval = window.eval;
        window.eval = function(code) {

            if (Math.random() < VARIABLE_CORRUPTION_CHANCE && code.includes('let ') || code.includes('var ')) {
                console.log('Variable declaration intercepted:', code);
            }
            return originalEval.call(this, code);
        };

        const windowHandler = {
            set: function(target, property, value) {

                if (typeof value === 'function' || property.toUpperCase() === property) {
                    return Reflect.set(target, property, value);
                }

                if (!variableTracker.has(property)) {
                    variableTracker.set(property, {
                        original: value,
                        type: typeof value,
                        corrupted: false
                    });
                }

                if (Math.random() < VARIABLE_CORRUPTION_CHANCE) {
                    const corruptedValue = corruptVariableValue(value, property);
                    console.log(`Variable ${property} corrupted: ${value} -> ${corruptedValue}`);
                    return Reflect.set(target, property, corruptedValue);
                }

                return Reflect.set(target, property, value);
            },

            get: function(target, property) {
                const value = Reflect.get(target, property);

                if (Math.random() < VARIABLE_CORRUPTION_CHANCE * 0.3 &&
                    variableTracker.has(property) &&
                    typeof value !== 'function' &&
                    property.toUpperCase() !== property) {

                    const corruptedValue = corruptVariableValue(value, property);
                    console.log(`Variable ${property} corrupted on access: ${value} -> ${corruptedValue}`);

                    Reflect.set(target, property, corruptedValue);
                    return corruptedValue;
                }

                return value;
            }
        };

        try {

        } catch (e) {
            console.log('Could not proxy window object');
        }
    };

    const corruptVariableValue = (value, varName) => {
        const originalType = typeof value;

        switch (originalType) {
            case 'number':
                if (Math.random() < 0.4) {

                    return value + (Math.random() - 0.5) * value * 0.2;
                } else if (Math.random() < 0.3) {

                    return value ^ Math.floor(Math.random() * 16);
                } else {

                    return value.toString() + Math.random();
                }

            case 'string':
                if (Math.random() < 0.3) {

                    return value.split('').sort(() => Math.random() - 0.5).join('');
                } else if (Math.random() < 0.3) {

                    return value + '_corrupted_' + Math.random();
                } else {

                    const corruptIndex = Math.floor(Math.random() * value.length);
                    return value.substring(0, corruptIndex) +
                           String.fromCharCode(Math.floor(Math.random() * 126) + 33) +
                           value.substring(corruptIndex + 1);
                }

            case 'boolean':
                return Math.random() < 0.5 ? !value : value;

            case 'object':
                if (Array.isArray(value)) {

                    if (Math.random() < 0.4) {
                        return value.slice().sort(() => Math.random() - 0.5);
                    } else {
                        return value.map(item => Math.random() < 0.2 ? corruptVariableValue(item, varName) : item);
                    }
                } else if (value !== null) {

                    const corruptedObj = { ...value };
                    Object.keys(corruptedObj).forEach(key => {
                        if (Math.random() < 0.3) {
                            corruptedObj[key] = corruptVariableValue(corruptedObj[key], key);
                        }
                    });
                    return corruptedObj;
                }
                break;

            default:
                return value;
        }

        return value;
    };

    const swapVariables = () => {

        const variables = {};

        for (let prop in window) {
            try {
                const value = window[prop];
                const type = typeof value;

                if (type === 'function' ||
                    prop.toUpperCase() === prop ||
                    prop.startsWith('_') ||
                    ['undefined', 'object'].includes(type) ||
                    ['console', 'document', 'window', 'navigator'].includes(prop)) {
                    continue;
                }

                if (!variables[type]) {
                    variables[type] = [];
                }

                variables[type].push({ name: prop, value: value });
            } catch (e) {

            }
        }

        Object.keys(variables).forEach(type => {
            const varsOfType = variables[type];
            if (varsOfType.length > 1 && Math.random() < 0.15) {

                const index1 = Math.floor(Math.random() * varsOfType.length);
                let index2 = Math.floor(Math.random() * varsOfType.length);
                while (index2 === index1) {
                    index2 = Math.floor(Math.random() * varsOfType.length);
                }

                const var1 = varsOfType[index1];
                const var2 = varsOfType[index2];

                try {

                    const temp = var1.value;
                    window[var1.name] = var2.value;
                    window[var2.name] = temp;

                    console.log(`Variables swapped: ${var1.name} (${temp}) <-> ${var2.name} (${var2.value})`);
                } catch (e) {

                }
            }
        });
    };

    const startVariableCorruption = () => {
        setInterval(() => {

            if (Math.random() < 0.1) {
                swapVariables();
            }

            if (Math.random() < 0.15) {
                for (let prop in window) {
                    try {
                        const value = window[prop];
                        const type = typeof value;

                        if (type === 'function' ||
                            prop.toUpperCase() === prop ||
                            prop.startsWith('_') ||
                            ['undefined', 'object'].includes(type) ||
                            ['console', 'document', 'window', 'navigator'].includes(prop)) {
                            continue;
                        }

                        if (Math.random() < 0.05) {
                            window[prop] = corruptVariableValue(value, prop);
                            console.log(`Runtime variable ${prop} corrupted`);
                        }
                    } catch (e) {

                    }
                }
            }
        }, 2000 + Math.random() * 3000);
    };

    corruptVariableAccess();
    startVariableCorruption();

    console.log('Runtime variable corruption initialized');
},

        corruptFunctionParams: (fn) => {
            return function(...args) {
                if (Math.random() < CODE_CORRUPTION_CHANCE) {

                    for (let i = 0; i < args.length; i++) {
                        if (typeof args[i] === 'number' && Math.random() < 0.3) {
                            args[i] += (Math.random() - 0.5) * args[i] * 0.1;
                        } else if (typeof args[i] === 'string' && Math.random() < 0.1) {
                            args[i] = args[i].split('').sort(() => Math.random() - 0.5).join('');
                        } else if (typeof args[i] === 'boolean' && Math.random() < 0.2) {
                            args[i] = !args[i];
                        }
                    }
                }
                return fn.apply(this, args);
            };
        },

        corruptAnimationFrames: () => {
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
        return originalRequestAnimationFrame.call(window, timestamp => {

            if (Math.random() < 0.05) return;
            if (Math.random() < 0.1) timestamp *= (0.9 + Math.random() * 0.2);
            callback(timestamp);
        });
    };
},

        corruptDOMProperties: () => {
            const elements = document.querySelectorAll('*');
            if (elements.length > 0) {
                const randomElement = elements[Math.floor(Math.random() * elements.length)];
                if (Math.random() < 0.5) {

                    const styles = ['opacity', 'transform', 'filter', 'position'];
                    const randomStyle = styles[Math.floor(Math.random() * styles.length)];

                    switch (randomStyle) {
                        case 'opacity':
                            randomElement.style.opacity = Math.random();
                            break;
                        case 'transform':
                            randomElement.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random()})`;
                            break;
                        case 'filter':
                            randomElement.style.filter = `hue-rotate(${Math.random() * 360}deg) saturate(${Math.random() * 3})`;
                            break;
                        case 'position':
                            randomElement.style.position = 'relative';
                            randomElement.style.left = `${(Math.random() - 0.5) * 50}px`;
                            randomElement.style.top = `${(Math.random() - 0.5) * 50}px`;
                            break;
                    }
                }
            }
        },

        corruptTimingFunctions: () => {
            const originalSetTimeout = window.setTimeout;
            const originalSetInterval = window.setInterval;

            window.setTimeout = function(fn, delay, ...args) {
                if (Math.random() < CODE_CORRUPTION_CHANCE) {

                    delay *= (0.5 + Math.random());
                }
                return originalSetTimeout(codeCorruption.corruptFunctionParams(fn), delay, ...args);
            };

            window.setInterval = function(fn, delay, ...args) {
                if (Math.random() < CODE_CORRUPTION_CHANCE) {
                    delay *= (0.5 + Math.random());
                }
                return originalSetInterval(codeCorruption.corruptFunctionParams(fn), delay, ...args);
            };
        }
    };

    const corruptionEffects = {

        offsetCoords: (args) => {
            for (let i = 0; i < args.length; i++) {
                if (typeof args[i] === 'number' && Math.random() < 0.3) {
                    args[i] += (Math.random() - 0.5) * 100 * GLITCH_INTENSITY;
                }
            }
        },

corruptWebGLArgs: (args, methodName) => {

    const safeMethods = [
        'bindTexture', 'bindBuffer', 'bindFramebuffer', 'bindRenderbuffer',
        'texParameteri', 'texParameterf', 'enable', 'disable',
        'blendFunc', 'depthFunc', 'cullFace', 'frontFace',
        'pixelStorei', 'activeTexture', 'useProgram',
        'enableVertexAttribArray', 'disableVertexAttribArray',

        'texImage2D', 'texSubImage2D', 'renderbufferStorage',
        'framebufferTexture2D', 'framebufferRenderbuffer'
    ];

    if (safeMethods.some(method => methodName.includes(method))) {
        return;
    }

    for (let i = 0; i < args.length; i++) {
        if (typeof args[i] === 'number') {

            if (i === 0 && (
                methodName.includes('bind') ||
                methodName.includes('enable') ||
                methodName.includes('texParameter') ||
                methodName.includes('pixelStore')
            )) {
                continue;
            }

            if (methodName.includes('texImage2D') || methodName.includes('renderbufferStorage')) {

                if (i === 3 || i === 4) {
                    continue;
                }
            }

            if (methodName.includes('uniform')) {

                if (Math.random() < 0.2) {
                    args[i] += (Math.random() - 0.5) * args[i] * 0.05;
                }
            } else if (methodName.includes('vertexAttrib') && i > 0) {

                if (Math.random() < 0.3) {
                    args[i] += (Math.random() - 0.5) * args[i] * 0.1;
                }
            } else if (methodName.includes('clear') && methodName.includes('Color')) {

                if (Math.random() < 0.4) {
                    args[i] = Math.max(0, Math.min(1, args[i] + (Math.random() - 0.5) * 0.2));
                }
            } else if (methodName.includes('drawArrays') || methodName.includes('drawElements')) {

                return;
            }
        }
    }
},

corruptWebGLState: (ctx) => {

    if (!ctx.canvas || ctx.canvas.width <= 0 || ctx.canvas.height <= 0) {
        return;
    }

    if (Math.random() < 0.1) {

        const canvas = ctx.canvas;
        const width = Math.max(1, Math.floor(canvas.width * (0.8 + Math.random() * 0.2)));
        const height = Math.max(1, Math.floor(canvas.height * (0.8 + Math.random() * 0.2)));
        ctx.viewport(0, 0, width, height);
    }

    if (Math.random() < 0.15) {

        const r = Math.max(0, Math.min(1, Math.random() * 0.5));
        const g = Math.max(0, Math.min(1, Math.random() * 0.5));
        const b = Math.max(0, Math.min(1, Math.random() * 0.5));
        const a = 1.0;
        ctx.clearColor(r, g, b, a);
    }

    if (Math.random() < 0.05) {

        const currentFramebuffer = ctx.getParameter(ctx.FRAMEBUFFER_BINDING);
        if (currentFramebuffer === null) {
            if (ctx.getParameter(ctx.DEPTH_TEST)) {
                ctx.disable(ctx.DEPTH_TEST);
            } else {
                ctx.enable(ctx.DEPTH_TEST);
            }
        }
    }
},

validateFramebuffer: (ctx) => {
    const status = ctx.checkFramebufferStatus(ctx.FRAMEBUFFER);
    if (status !== ctx.FRAMEBUFFER_COMPLETE) {
        console.warn('Framebuffer incomplete:', {
            FRAMEBUFFER_INCOMPLETE_ATTACHMENT: status === ctx.FRAMEBUFFER_INCOMPLETE_ATTACHMENT,
            FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: status === ctx.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT,
            FRAMEBUFFER_INCOMPLETE_DIMENSIONS: status === ctx.FRAMEBUFFER_INCOMPLETE_DIMENSIONS,
            FRAMEBUFFER_UNSUPPORTED: status === ctx.FRAMEBUFFER_UNSUPPORTED
        });
        return false;
    }
    return true;
},

        corruptColors: (ctx) => {
            if (Math.random() < 0.2) {
                const r = Math.floor(Math.random() * 256);
                const g = Math.floor(Math.random() * 256);
                const b = Math.floor(Math.random() * 256);
                const a = Math.random();
                ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
                ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
            }
        },

        randomTransform: (ctx) => {
            if (Math.random() < 0.1) {
                ctx.save();
                ctx.translate(Math.random() * 50 - 25, Math.random() * 50 - 25);
                ctx.rotate((Math.random() - 0.5) * 0.5);
                ctx.scale(0.8 + Math.random() * 0.4, 0.8 + Math.random() * 0.4);
            }
        },

        corruptImageData: (ctx, canvas) => {
            if (Math.random() < 0.02) {
                try {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height, true);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        if (Math.random() < 0.001) {
                            data[i] = Math.floor(Math.random() * 256);
                            data[i + 1] = Math.floor(Math.random() * 256);
                            data[i + 2] = Math.floor(Math.random() * 256);
                        }
                    }

                    ctx.putImageData(imageData, 0, 0);
                } catch (e) {

                }
            }
        },

        bitShiftCorruption: (args) => {
            for (let i = 0; i < args.length; i++) {
                if (typeof args[i] === 'number' && Math.random() < 0.05) {
                    args[i] = (args[i] << 1) | (args[i] >>> 1);
                }
            }
        }
    };

    const methodsToCorrupt = [
        'fillRect', 'strokeRect', 'clearRect',
        'beginPath', 'closePath', 'moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo',
        'arc', 'arcTo', 'rect', 'fill', 'stroke',
        'fillText', 'strokeText',
        'drawImage', 'putImageData',
        'translate', 'rotate', 'scale', 'transform', 'setTransform'
    ];

    function corruptContext(ctx, canvas, contextType) {

    let methodsToCorrupt = [];

    if (contextType === '2d') {
        methodsToCorrupt = [
            'fillRect', 'strokeRect', 'clearRect',
            'beginPath', 'closePath', 'moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo',
            'arc', 'arcTo', 'rect', 'fill', 'stroke',
            'fillText', 'strokeText',
            'drawImage', 'putImageData',
            'translate', 'rotate', 'scale', 'transform', 'setTransform'
        ];
    } else if (contextType === 'webgl' || contextType === 'webgl2') {
        methodsToCorrupt = [
            'clear', 'clearColor', 'clearDepth', 'clearStencil',
            'drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced',
            'viewport', 'scissor',
            'uniform1f', 'uniform1i', 'uniform2f', 'uniform2i', 'uniform3f', 'uniform3i', 'uniform4f', 'uniform4i',
            'uniformMatrix2fv', 'uniformMatrix3fv', 'uniformMatrix4fv',
            'vertexAttrib1f', 'vertexAttrib2f', 'vertexAttrib3f', 'vertexAttrib4f',
            'bindBuffer', 'bindTexture', 'bindFramebuffer', 'bindRenderbuffer',
            'texImage2D', 'texSubImage2D', 'texParameteri', 'texParameterf',
            'enable', 'disable', 'blendFunc', 'blendEquation', 'depthFunc', 'cullFace'
        ];
    } else {

        methodsToCorrupt = Object.getOwnPropertyNames(ctx).filter(name =>
            typeof ctx[name] === 'function' &&
            !name.startsWith('_') &&
            name !== 'constructor'
        );
    }

    methodsToCorrupt.forEach(method => {
        if (ctx[method] && typeof ctx[method] === 'function') {
            const originalMethod = ctx[method];
            originalMethods[method] = originalMethod;

            ctx[method] = function(...args) {

                if (Math.random() < CORRUPTION_CHANCE) {

                    if (contextType === '2d') {

                        if (Math.random() < 0.3) corruptionEffects.offsetCoords(args);
                        if (Math.random() < 0.2) corruptionEffects.bitShiftCorruption(args);
                        if (Math.random() < 0.2) corruptionEffects.corruptColors(this);
                        if (Math.random() < 0.1) corruptionEffects.randomTransform(this);
                        if (Math.random() < 0.05) corruptionEffects.corruptImageData(this, canvas);
                    } else if (contextType === 'webgl' || contextType === 'webgl2') {

                        corruptionEffects.corruptWebGLArgs(args, method);
                        if (Math.random() < 0.1) corruptionEffects.corruptWebGLState(this);
                    } else {

                        if (Math.random() < 0.3) corruptionEffects.offsetCoords(args);
                        if (Math.random() < 0.2) corruptionEffects.bitShiftCorruption(args);
                    }

                    if (Math.random() < 0.05) {
                        return;
                    }

                    if (Math.random() < 0.03) {
                        for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
                            originalMethod.apply(this, args);
                        }
                        return;
                    }
                }

                return originalMethod.apply(this, args);
            };
        }
    });
}

    HTMLCanvasElement.prototype.getContext = function(contextType, ...args) {

    if (contextType === '2d' && (!args[0] || !args[0].willReadFrequently)) {
        const contextAttributes = args[0] || {};
        contextAttributes.willReadFrequently = true;
        args[0] = contextAttributes;
    }

    const ctx = originalGetContext.call(this, contextType, ...args);

    if (ctx && !ctx._corrupted) {
        corruptContext(ctx, this, contextType);
        ctx._corrupted = true;
        console.log(`${contextType} canvas corrupted!`);
    }

    return ctx;
};

    function corruptExistingCanvases() {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {

        if (!canvas._corruptionReady) {
            canvas._corruptionReady = true;

        }
    });
}

    console.log('Initializing Universal Audio Corruption System...');

    universalAudioCorruption.corruptAudioBuffers();
    universalAudioCorruption.corruptHTMLAudio();
    universalAudioCorruption.corruptWebAudioNodes();

    corruptExistingCanvases();

    codeCorruption.corruptTimingFunctions();
    codeCorruption.corruptAnimationFrames();
    codeCorruption.corruptEventSystem();
    codeCorruption.corruptRuntimeVariables();

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.tagName === 'CANVAS') {

    if (!node._corruptionReady) {
        node._corruptionReady = true;
        console.log('New canvas prepared for corruption!');
    }
}

                    if (node.tagName === 'AUDIO' || node.tagName === 'VIDEO') {
                        universalAudioCorruption.corruptHTMLAudio();
                        console.log('New audio element corrupted!');
                    }

                    const audioElements = node.querySelectorAll && node.querySelectorAll('audio, video');
                    if (audioElements && audioElements.length > 0) {
                        audioElements.forEach(el => {
                            universalAudioCorruption.corruptHTMLAudio();
                        });
                        console.log('New nested audio elements corrupted!');
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    setInterval(() => {
        if (Math.random() < 0.5) {
        codeCorruption.corruptRuntimeVariables();
    }

        if (Math.random() < 0.1) {
            const canvases = document.querySelectorAll('canvas');
canvases.forEach(canvas => {

    const ctx2d = canvas.getContext('2d');
    const ctxWebGL = canvas.getContext('webgl') || canvas.getContext('webgl2');

    if (ctx2d) {
        corruptionEffects.corruptImageData(ctx2d, canvas);
    }

    if (ctxWebGL) {
        corruptionEffects.corruptWebGLState(ctxWebGL);
    }
});
        }

        if (Math.random() < 0.05) {
            codeCorruption.corruptDOMProperties();
        }

        if (Math.random() < 0.2) {
            const audioElements = document.querySelectorAll('audio, video');
            audioElements.forEach(el => {
                if (Math.random() < 0.7) {
                    el.playbackRate = 0.1 + Math.random() * 2;
                    el.volume = Math.random();

                    if (Math.random() < 0.3) {
                        el.style.filter = `contrast(${Math.random() * 300}%) saturate(${Math.random() * 500}%)`;
                    }
                }
            });
        }
    }, 1000);

    setInterval(() => {

        universalAudioCorruption.corruptHTMLAudio();

        if (Math.random() < 0.1) {
            universalAudioCorruption.corruptWebAudioNodes();
        }
    }, 500);

    console.log('Universal Audio Corruption + Canvas Corruption + Runtime Code Corruption loaded!');
    console.log('ALL audio playback will now be corrupted regardless of the library used!');
})();