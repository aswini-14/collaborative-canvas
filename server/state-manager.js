const { v4: uuidv4 } = require('uuid');

class StateManager {
  constructor() {
    this.strokes = [];
    this.redoStack = [];
  }

  addStroke(stroke) {
    this.strokes.push(stroke);
    this.redoStack = []; // clear redo on new action
  }

  undo() {
    if (this.strokes.length === 0) return null;
    const stroke = this.strokes.pop();
    this.redoStack.push(stroke);
    return stroke;
  }

  redo() {
    if (this.redoStack.length === 0) return null;
    const stroke = this.redoStack.pop();
    this.strokes.push(stroke);
    return stroke;
  }

  getState() {
    return this.strokes;
  }
}

module.exports = StateManager;
