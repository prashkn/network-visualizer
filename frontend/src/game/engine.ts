import * as ex from "excalibur";

export function createEngine(canvasElement: HTMLCanvasElement): ex.Engine {
  return new ex.Engine({
    canvasElement,
    width: 800,
    height: 600,
    fixedUpdateFps: 30,
    pixelArt: true,
    antialiasing: false,
    displayMode: ex.DisplayMode.FitScreen,
    backgroundColor: ex.Color.fromHex("#1a1a2e"),
  });
}
