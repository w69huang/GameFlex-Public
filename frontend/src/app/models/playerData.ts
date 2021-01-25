/**
 * A model that represents playerID/peerID/username trifectas while a game is in motion
 */
export default class PlayerData {
  /**
   * The playerID of a given player
   */
  id: number;

  /**
   * The peerID associated with the player
   */
  peerID: string;

  /**
   * The username associated with the player
   */
  username: string;

  /**
   * A constructor that builds the player data from the relevant parts
   * @param id - The playerID of the player
   * @param peerID - The peerID of the player
   * @param username - The username of the player (if the player has a username)
   */
  constructor(id: number, peerID: string, username: string = null) {
    this.id = id;
    this.peerID = peerID;
    this.username = username;
  }
}