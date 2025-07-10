export class PhoenixFire {
  async cast(spell: () => Promise<void>): Promise<void> {
    await spell();
  }
} 