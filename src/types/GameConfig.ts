export interface GameConfig {
  gridSize: number;
  gridWidth?: number;
  gridHeight?: number;
  cellSize: number;
  fps: number;
}

export interface CharacterState {
  x: number;
  y: number;
  direction: string;
}

export const defaultConfig: GameConfig = {
  gridSize: 10,
  gridWidth: 15,
  gridHeight: 10,
  cellSize: 40,
  fps: 60,
};
