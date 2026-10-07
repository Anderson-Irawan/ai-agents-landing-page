// Loaded in <head> without defer, before first paint. Adds the "js" class so
// the hidden starting states in motion.css apply from the very first frame,
// instead of the hero painting visible, then hiding, then animating (a flash).
// If this file fails to load, nothing is hidden and the page stays readable.
document.documentElement.classList.add('js');
