class ShortURL {
  constructor() {
    this.storage = new Map();
  }

  set(key, value) {
    this.storage.set(key, value);
  }

  get(key) {
    return this.storage.get(key);
  }
}

export default new ShortURL();
