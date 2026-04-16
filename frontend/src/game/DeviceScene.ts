import * as ex from "excalibur";
import { DeviceCharacter } from "./characters";

const POLL_INTERVAL = 10_000;

let spriteCounter = 0;

export class DeviceScene extends ex.Scene {
  private characters = new Map<string, DeviceCharacter>();
  private pollTimer = 0;

  onInitialize(engine: ex.Engine): void {
    this.pollTimer = 0;
    this.fetchAndSync(engine);
  }

  onPreUpdate(engine: ex.Engine, delta: number): void {
    this.pollTimer += delta;
    if (this.pollTimer >= POLL_INTERVAL) {
      this.pollTimer = 0;
      this.fetchAndSync(engine);
    }
  }

  private async fetchAndSync(engine: ex.Engine) {
    try {
      const res = await fetch("/devices");
      if (res.ok) {
        const data: { devices: string[] } = await res.json();
        this.syncDevices(data.devices, engine);
      }
    } catch {
      // server unreachable
    }
  }

  private syncDevices(devices: string[], engine: ex.Engine) {
    const incoming = new Set(devices);

    // Remove characters no longer in the device list
    for (const [name, char] of this.characters) {
      if (!incoming.has(name)) {
        this.remove(char);
        this.characters.delete(name);
      }
    }

    // Add new characters
    for (const name of devices) {
      if (!this.characters.has(name)) {
        const char = new DeviceCharacter(name, spriteCounter++);
        char.setBounds(engine.drawWidth, engine.drawHeight);
        this.add(char);
        this.characters.set(name, char);
      }
    }
  }
}
