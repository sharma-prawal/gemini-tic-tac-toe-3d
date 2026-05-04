import { Howl } from 'howler';

export class AudioManager {
    private sounds: { [key: string]: Howl } = {};
    private isMuted: boolean = false;

    constructor() {
        // Placeholders for sounds - in a real app, these would be local assets
        const soundUrls: { [key: string]: string } = {
            hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
            place: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
            win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
            draw: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
            ambient: 'https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3' // Placeholder ambient
        };

        for (const [key, url] of Object.entries(soundUrls)) {
            this.sounds[key] = new Howl({
                src: [url],
                volume: key === 'ambient' ? 0.3 : 0.5,
                loop: key === 'ambient'
            });
        }
    }

    public play(name: string) {
        if (this.isMuted || !this.sounds[name]) return;
        this.sounds[name].play();
    }

    public stop(name: string) {
        if (this.sounds[name]) this.sounds[name].stop();
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        for (const sound of Object.values(this.sounds)) {
            sound.mute(this.isMuted);
        }
        return this.isMuted;
    }

    public startAmbient() {
        this.play('ambient');
    }
}