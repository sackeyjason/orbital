function timestamp() {
  return window.performance && window.performance.now
    ? window.performance.now()
    : Date.now();
}

export { timestamp }