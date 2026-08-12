import './css/game.css';
import { Game } from './game/Game';

const container = document.getElementById('game-container');

if (!container) {
  throw new Error('Cannot initialize game: #game-container not found');
}

new Game(container);

const stage = document.querySelector<HTMLElement>('.game-stage');
const resizeGame = (): void => {
  if (!stage) {
    return;
  }

  const scale = stage.clientWidth / 600;
  container.style.transform = `scale(${scale})`;
  if (window.matchMedia('(max-width: 720px)').matches) {
    const hud = stage.querySelector<HTMLElement>('.game-hud');
    const hudRailHeight = Math.ceil((hud?.offsetTop ?? 8) + (hud?.offsetHeight ?? 60) + 6);
    const stageBorderHeight = stage.offsetHeight - stage.clientHeight;
    container.style.top = `${hudRailHeight}px`;
    stage.style.aspectRatio = 'auto';
    stage.style.height = `${Math.ceil(400 * scale + hudRailHeight + stageBorderHeight)}px`;
  } else {
    container.style.top = '';
    stage.style.aspectRatio = '';
    stage.style.height = '';
  }
};

resizeGame();
window.addEventListener('resize', resizeGame);
