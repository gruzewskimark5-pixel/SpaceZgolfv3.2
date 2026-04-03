export class SurfaceRegistry {
    surfaces = new Map();
    registerSurface(domain, contract) {
        this.surfaces.set(domain, contract);
    }
    validateSurface(domain, intent) {
        const contract = this.surfaces.get(domain);
        if (!contract)
            throw new Error(`Unregistered surface: ${domain}`);
        if (!contract.allowedIntents.includes(intent)) {
            throw new Error(`Intent ${intent} not allowed on surface ${domain}`);
        }
        return true;
    }
}
