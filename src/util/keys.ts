export function hasModifier(k: KeyboardEvent) {
	return [
		"Alt",
		"AltGraph",
		"CapsLock",
		"Control",
		"Fn",
		"FnLock",
		"Hyper",
		"Meta",
		"NumLock",
		"OS",
		"ScrollLock",
		"Shift",
		"Super",
		"Symbol",
		"SymbolLock",
		"Accel",
	].some(m => k.getModifierState(m));
}