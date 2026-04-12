const UI_SIDE_EFFECT_FLAGS = new Set(['openEditor', 'openEditors']);

export function sanitizeBridgeCommandParam(param: unknown): unknown {
    if (!param || typeof param !== 'object' || Array.isArray(param)) {
        return param;
    }

    const sanitized = { ...(param as Record<string, unknown>) };
    for (const flag of UI_SIDE_EFFECT_FLAGS) {
        delete sanitized[flag];
    }

    return sanitized;
}