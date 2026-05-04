import * as THREE from 'three';
import gsap from 'gsap';
import { Renderer } from './systems/Renderer';
import { CameraController } from './systems/Camera';
import { AudioManager } from './systems/Audio';
import { Board3D } from './components/Board3D';
import { Piece3D } from './components/Piece3D';
import { VFX } from './components/VFX';
import { GameState, Player } from './logic/GameState';
import { AI, Difficulty } from './logic/AI';

class Game {
    private renderer: Renderer;
    private cameraCtrl: CameraController;
    private audio: AudioManager;
    private board3D: Board3D;
    private vfx: VFX;
    private logic: GameState;
    
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private pieces: (THREE.Object3D | null)[] = Array(9).fill(null);
    
    private isAiGame = false;
    private difficulty = Difficulty.Medium;
    private isAiThinking = false;

    constructor() {
        const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.renderer = new Renderer(canvas);
        this.cameraCtrl = new CameraController(this.renderer.camera);
        this.audio = new AudioManager();
        this.board3D = new Board3D();
        this.vfx = new VFX(this.renderer.scene);
        this.logic = new GameState();

        this.renderer.scene.add(this.board3D.mesh);
        this.renderer.scene.background = new THREE.Color(0x020205); 
        
        this.setupUI();
        this.setupInput();
        
        this.updateThemeColors('neon'); 
        this.renderer.render((delta) => this.update(delta));
        this.audio.startAmbient();
    }

    private setupUI() {
        const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
        themeSelect?.addEventListener('change', (e) => {
            const theme = (e.target as HTMLSelectElement).value;
            document.body.setAttribute('data-theme', theme);
            this.updateThemeColors(theme);
        });

        document.getElementById('btn-pvp')?.addEventListener('click', () => this.startGame(false));
        document.getElementById('btn-pva')?.addEventListener('click', () => {
            document.querySelector('.difficulty-selector')?.classList.remove('hidden');
        });

        document.querySelectorAll('.diff-options button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                this.difficulty = target.dataset.diff as Difficulty;
                document.querySelectorAll('.diff-options button').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                this.startGame(true);
            });
        });

        document.getElementById('btn-undo')?.addEventListener('click', () => this.undoMove());
        document.getElementById('btn-reset')?.addEventListener('click', () => this.resetMatch());
        document.getElementById('btn-quit')?.addEventListener('click', () => this.quitToMenu());
        
        document.getElementById('btn-settings')?.addEventListener('click', () => {
            document.getElementById('main-menu')?.classList.add('hidden');
            document.getElementById('settings-menu')?.classList.remove('hidden');
        });
        document.getElementById('btn-back')?.addEventListener('click', () => {
            document.getElementById('settings-menu')?.classList.add('hidden');
            document.getElementById('main-menu')?.classList.remove('hidden');
        });
        document.getElementById('toggle-sound')?.addEventListener('click', (e) => {
            const muted = this.audio.toggleMute();
            const btn = e.target as HTMLButtonElement;
            btn.textContent = muted ? 'OFF' : 'ON';
            btn.classList.toggle('off', muted);
        });

        document.getElementById('btn-replay')?.addEventListener('click', () => this.resetMatch());
        document.getElementById('btn-next')?.addEventListener('click', () => this.resetMatch());
        document.getElementById('btn-menu')?.addEventListener('click', () => this.quitToMenu());
    }

    private setupInput() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.renderer.camera);
            const intersects = this.raycaster.intersectObjects(this.board3D.hitboxes);
            
            let hoveredIndex = null;
            if (intersects.length > 0) {
                const obj = intersects[0].object;
                if (obj.userData.index !== undefined) {
                    hoveredIndex = obj.userData.index;
                }
            }
            this.board3D.onHover(hoveredIndex);
        });

        window.addEventListener('click', () => {
            if (this.isAiThinking || this.logic.isGameOver) return;
            
            this.raycaster.setFromCamera(this.mouse, this.renderer.camera);
            const intersects = this.raycaster.intersectObjects(this.board3D.hitboxes);
            
            if (intersects.length > 0) {
                const obj = intersects[0].object;
                if (obj.userData.index !== undefined) {
                    this.handleMove(obj.userData.index);
                }
            }
        });
    }

    private handleMove(index: number) {
        if (this.logic.makeMove(index)) {
            this.audio.play('place');
            this.spawnPiece(index, this.logic.getBoard()[index]);
            this.updateHUD();
            
            if (this.logic.isGameOver) {
                this.endGame();
            } else if (this.isAiGame && this.logic.currentPlayer === 'O') {
                this.makeAiMove();
            }
        }
    }

    private makeAiMove() {
        this.isAiThinking = true;
        setTimeout(() => {
            const move = AI.getMove(this.logic.getBoard(), this.difficulty);
            this.handleMove(move);
            this.isAiThinking = false;
        }, 1000);
    }

    private spawnPiece(index: number, player: Player) {
        const piece = player === 'X' ? Piece3D.createX() : Piece3D.createO();
        const pos = this.board3D.getCellPosition(index);
        this.renderer.scene.add(piece);
        this.pieces[index] = piece;
        Piece3D.animateIn(piece, pos);
    }

    private updateHUD() {
        document.getElementById('score-x')!.textContent = this.logic.scores.X.toString();
        document.getElementById('score-o')!.textContent = this.logic.scores.O.toString();
        
        document.querySelector('.player-x')?.classList.toggle('active', this.logic.currentPlayer === 'X');
        document.querySelector('.player-o')?.classList.toggle('active', this.logic.currentPlayer === 'O');
    }

    private startGame(vsAi: boolean) {
        this.isAiGame = vsAi;
        this.logic.reset();
        this.clearPieces();
        
        document.getElementById('main-menu')?.classList.add('hidden');
        document.getElementById('game-hud')?.classList.remove('hidden');
        
        this.cameraCtrl.setGameState();
        this.updateHUD();
    }

    private endGame() {
        this.cameraCtrl.setWinState();
        setTimeout(() => {
            const resultText = this.logic.winner 
                ? `PLAYER ${this.logic.winner} WINS!` 
                : "IT'S A DRAW!";
            
            document.getElementById('result-text')!.textContent = resultText;
            document.getElementById('end-screen')?.classList.remove('hidden');
            
            if (this.logic.winningLine) {
                this.logic.winningLine.forEach(idx => {
                    if (this.pieces[idx]) Piece3D.animateWin(this.pieces[idx]!);
                });
                this.audio.play('win');
            } else {
                this.audio.play('draw');
            }
        }, 1500);
    }

    private resetMatch() {
        this.logic.reset();
        this.clearPieces();
        document.getElementById('end-screen')?.classList.add('hidden');
        this.cameraCtrl.setGameState();
        this.updateHUD();
    }

    private quitToMenu() {
        this.logic.reset();
        this.clearPieces();
        document.getElementById('game-hud')?.classList.add('hidden');
        document.getElementById('end-screen')?.classList.add('hidden');
        document.getElementById('main-menu')?.classList.remove('hidden');
        this.cameraCtrl.setMenuState();
    }

    private clearPieces() {
        this.pieces.forEach(p => {
            if (p) this.renderer.scene.remove(p);
        });
        this.pieces.fill(null);
    }

    private undoMove() {
        if (this.logic.undo()) {
            this.syncBoardToLogic();
            this.updateHUD();
        }
    }

    private syncBoardToLogic() {
        this.clearPieces();
        const board = this.logic.getBoard();
        board.forEach((player, i) => {
            if (player) this.spawnPiece(i, player);
        });
    }

    private updateThemeColors(theme: string) {
        let primary, secondary, bg;
        switch(theme) {
            case 'minimal': 
                primary = 0xffffff; secondary = 0x888888; bg = 0x050505; break;
            case 'space': 
                primary = 0xff00ea; secondary = 0x0037ff; bg = 0x020005; break;
            default: 
                primary = 0x00f2ff; secondary = 0x7000ff; bg = 0x020205;
        }
        
        const primaryColor = new THREE.Color(primary);
        
        // Update Grid
        const grid = this.board3D.mesh.children.find(c => c instanceof THREE.GridHelper) as THREE.GridHelper;
        if (grid) {
            (grid.material as THREE.LineBasicMaterial).color.copy(primaryColor);
        }
        
        // Update Scan Layer
        const scanLayer = this.board3D.mesh.children.find(c => c instanceof THREE.Mesh && c.material instanceof THREE.ShaderMaterial) as THREE.Mesh;
        if (scanLayer && scanLayer.material instanceof THREE.ShaderMaterial) {
            scanLayer.material.uniforms.uColor.value.copy(primaryColor);
        }

        // Update Dust Particles
        (this.vfx.dust.material as THREE.PointsMaterial).color.copy(primaryColor);

        // Update Scene Background
        const bgColor = new THREE.Color(bg);
        this.renderer.scene.background = bgColor;
        if (this.renderer.scene.fog) {
            (this.renderer.scene.fog as THREE.FogExp2).color.copy(bgColor);
        }
    }

    private update(delta: number) {
        const time = performance.now() * 0.001;
        this.cameraCtrl.updateIdle(time);
        this.vfx.update(time);
        this.board3D.update(time);
    }
}

new Game();