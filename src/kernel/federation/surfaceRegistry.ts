export class SurfaceRegistry {
  surfaces: Map<string, any> = new Map();

  registerSurface(domain: string, contract: any) {
    this.surfaces.set(domain, contract);
  }

  validateSurface(domain: string, intent: string) {
    const contract = this.surfaces.get(domain);
    if (!contract) throw new Error(`Unregistered surface: ${domain}`);
    if (!contract.allowedIntents.includes(intent)) {
      throw new Error(`Intent ${intent} not allowed on surface ${domain}`);
    }
    return true;
  }
}
