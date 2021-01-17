export default class PlayerData {
    id: number; // Player ID
    peerID: string;
    username: string;
  
    constructor(id: number, peerID: string, username: string = null) {
      this.id = id;
      this.peerID = peerID;
      this.username = username;
    }
}