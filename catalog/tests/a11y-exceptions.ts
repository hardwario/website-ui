// Contrast findings the catalog's axe gate accepts knowingly. Each entry names the owner decision or
// the open change request behind it (website-admin DESIGN-SYSTEM.md, "Web layer on the Brand
// Guidelines"); remove the entry when the owner rules. Only nodes matching `selector` under the listed
// themes are excused; every other serious or critical finding still fails the test.
export interface AxeException { rule: string; themes: string[]; selector: string; reason: string }

// Empty since 2026-10-30: the one entry (the Red kicker on Panel, 4.46:1) went when the owner set
// Panel to #f7f7f7 (change request CR-1), where the kicker reaches 4.5:1.
export const AXE_EXCEPTIONS: AxeException[] = [];
