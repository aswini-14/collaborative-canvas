const StateManager = require('./state-manager');

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  getRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        users: new Map(),
        state: new StateManager(),
      });
    }
    return this.rooms.get(roomId);
  }

  addUser(roomId, socketId, user) {
    const room = this.getRoom(roomId);
    room.users.set(socketId, user);
  }

  removeUser(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.users.delete(socketId);
  }
}

module.exports = RoomManager;
