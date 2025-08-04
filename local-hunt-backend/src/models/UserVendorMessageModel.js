// // src/models/UserVendorMessageModel.js
// const { db } = require('../config/firebaseAdmin');

// class UserVendorMessageModel {
//   /**
//    * Creates a new message document in Firestore.
//    * @param {string} senderId - The ID of the user/vendor sending the message.
//    * @param {string} receiverId - The ID of the user/vendor receiving the message.
//    * @param {string} vendorId - The ID of the vendor involved in the conversation (if sender/receiver is user/vendor).
//    * @param {string} text - The message content.
//    * @returns {Promise<object>} The created message document with its ID.
//    */
//   static async createMessage(senderId, receiverId, vendorId, text) {
//     // Ensure conversationId is consistent regardless of who initiates (e.g., sort UIDs)
//     const participantIds = [senderId, receiverId].sort();
//     const conversationId = `${participantIds[0]}_${participantIds[1]}_${vendorId}`; // Unique per user-vendor pair

//     const newMessageData = {
//       senderId,
//       receiverId,
//       vendorId, // Store vendorId for easy filtering of vendor's conversations
//       text,
//       conversationId,
//       timestamp: new Date(),
//       read: false, // Initial status
//     };

//     try {
//       const docRef = await db.collection('userVendorMessages').add(newMessageData);
//       return { id: docRef.id, ...newMessageData };
//     } catch (error) {
//       console.error('Error creating message in Firestore:', error);
//       throw new Error('Failed to save message.');
//     }
//   }

//   /**
//    * Retrieves all messages for a specific conversation ID.
//    * @param {string} conversationId - The ID of the conversation thread.
//    * @returns {Promise<Array<object>>} List of messages in the conversation.
//    */
//   static async getMessagesByConversationId(conversationId) {
//     try {
//       const snapshot = await db.collection('userVendorMessages')
//         .where('conversationId', '==', conversationId)
//         .orderBy('timestamp', 'asc') // Order messages chronologically
//         .get();

//       return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     } catch (error) {
//       console.error('Error getting messages by conversation ID:', error);
//       throw new Error('Failed to retrieve messages.');
//     }
//   }

//   /**
//    * Retrieves all unique conversations for a given user or vendor.
//    * @param {string} userId - The ID of the user or vendor.
//    * @param {string} role - The role ('user' or 'vendor') to determine query path.
//    * @returns {Promise<Array<object>>} List of latest messages for each unique conversation.
//    */
//   static async getConversationsForUser(userId, role) {
//     let querySnapshot;
//     if (role === 'user') {
//       querySnapshot = await db.collection('userVendorMessages')
//         .where('senderId', '==', userId)
//         .get();
//       const receivedSnapshot = await db.collection('userVendorMessages')
//         .where('receiverId', '==', userId)
//         .get();
//       querySnapshot = { docs: [...querySnapshot.docs, ...receivedSnapshot.docs] };
//     } else if (role === 'vendor') {
//       querySnapshot = await db.collection('userVendorMessages')
//         .where('vendorId', '==', userId) // Assuming vendorId is the same as userId for vendor role
//         .get();
//     } else {
//       throw new Error('Invalid role for fetching conversations.');
//     }

//     const conversationsMap = new Map(); // Map to store the latest message for each conversationId

//     querySnapshot.docs.forEach(doc => {
//       const message = { id: doc.id, ...doc.data() };
//       // Use conversationId as key, update if current message is newer
//       if (!conversationsMap.has(message.conversationId) || message.timestamp > conversationsMap.get(message.conversationId).timestamp) {
//         conversationsMap.set(message.conversationId, message);
//       }
//     });

//     // Convert map values to array and sort by latest message timestamp
//     const conversations = Array.from(conversationsMap.values())
//       .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate()); // Sort descending by timestamp

//     return conversations;
//   }

//   /**
//    * Marks messages in a conversation as read for a specific receiver.
//    * @param {string} conversationId - The ID of the conversation.
//    * @param {string} receiverId - The ID of the user/vendor who read the messages.
//    * @returns {Promise<void>}
//    */
//   static async markMessagesAsRead(conversationId, receiverId) {
//     try {
//       const batch = db.batch();
//       const snapshot = await db.collection('userVendorMessages')
//         .where('conversationId', '==', conversationId)
//         .where('receiverId', '==', receiverId)
//         .where('read', '==', false) // Only update unread messages for this receiver
//         .get();

//       snapshot.docs.forEach(doc => {
//         batch.update(doc.ref, { read: true });
//       });

//       await batch.commit();
//       console.log(`Marked ${snapshot.size} messages as read for conversation ${conversationId} by ${receiverId}`);
//     } catch (error) {
//       console.error('Error marking messages as read:', error);
//       // Don't re-throw, as it's a background operation
//     }
//   }
// }

// module.exports = UserVendorMessageModel;

// src/models/UserVendorMessageModel.js
const { db } = require('../config/firebaseAdmin');

class UserVendorMessageModel {
  /**
   * Creates a new message document in Firestore.
   * @param {string} senderId - The ID of the user/vendor sending the message.
   * @param {string} receiverId - The ID of the user/vendor receiving the message.
   * @param {string} vendorId - The ID of the vendor involved in the conversation (if sender/receiver is user/vendor).
   * @param {string} text - The message content.
   * @returns {Promise<object>} The created message document with its ID.
   */
  static async createMessage(senderId, receiverId, vendorId, text) {
    // Ensure conversationId is consistent regardless of who initiates (e.g., sort UIDs)
    const participantIds = [senderId, receiverId].sort();
    const conversationId = `${participantIds[0]}_${participantIds[1]}_${vendorId}`; // Unique per user-vendor pair

    const newMessageData = {
      senderId,
      receiverId,
      vendorId, // Store vendorId for easy filtering of vendor's conversations
      text,
      conversationId,
      timestamp: new Date(),
      read: false, // Initial status
    };

    try {
      const docRef = await db.collection('userVendorMessages').add(newMessageData);
      return { id: docRef.id, ...newMessageData };
    } catch (error) {
      console.error('Error creating message in Firestore:', error);
      throw new Error('Failed to save message.');
    }
  }

  /**
   * Retrieves all messages for a specific conversation ID.
   * @param {string} conversationId - The ID of the conversation thread.
   * @returns {Promise<Array<object>>} List of messages in the conversation.
   */
  static async getMessagesByConversationId(conversationId) {
    try {
      const snapshot = await db.collection('userVendorMessages')
        .where('conversationId', '==', conversationId)
        .orderBy('timestamp', 'asc') // Order messages chronologically
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting messages by conversation ID:', error);
      throw new Error('Failed to retrieve messages.');
    }
  }

  /**
   * Retrieves all unique conversations for a given user, vendor, or admin.
   * @param {string} userId - The ID of the user, vendor, or admin.
   * @param {string} role - The role ('user', 'vendor', or 'admin').
   * @returns {Promise<Array<object>>} List of latest messages for each unique conversation.
   */
  static async getConversationsForUser(userId, role) {
    let messageDocs = [];

    try {
      if (role === 'user') {
        // Get messages sent by user
        const sentSnapshot = await db.collection('userVendorMessages')
          .where('senderId', '==', userId)
          .get();
        messageDocs.push(...sentSnapshot.docs);

        // Get messages received by user
        const receivedSnapshot = await db.collection('userVendorMessages')
          .where('receiverId', '==', userId)
          .get();
        messageDocs.push(...receivedSnapshot.docs);

      } else if (role === 'vendor') {
        // Get all messages where this vendor is involved (either sender or receiver, or by vendorId)
        // Assuming vendorId in message document is the vendor's userId
        const vendorSnapshot = await db.collection('userVendorMessages')
          .where('vendorId', '==', userId)
          .get();
        messageDocs.push(...vendorSnapshot.docs);

      } else if (role === 'admin') { // <--- ADDED ADMIN LOGIC
        // For admin, fetch all messages or messages where admin is sender/receiver
        // Option 1 (Implemented): Admin sees ALL conversations (might be too broad for large apps)
        const allMessagesSnapshot = await db.collection('userVendorMessages').get();
        messageDocs.push(...allMessagesSnapshot.docs);

        // Option 2 (More granular): Admin only sees conversations they are part of
        // const sentByAdminSnapshot = await db.collection('userVendorMessages')
        //   .where('senderId', '==', userId)
        //   .get();
        // messageDocs.push(...sentByAdminSnapshot.docs);
        // const receivedByAdminSnapshot = await db.collection('userVendorMessages')
        //   .where('receiverId', '==', userId)
        //   .get();
        // messageDocs.push(...receivedByAdminSnapshot.docs);

      } else {
        throw new Error('Invalid role for fetching conversations.');
      }

      const conversationsMap = new Map(); // Map to store the latest message for each conversationId

      messageDocs.forEach(doc => {
        const message = { id: doc.id, ...doc.data() };
        // Use conversationId as key, update if current message is newer
        // Convert Firestore Timestamp to Date object for comparison
        const currentTimestamp = message.timestamp.toDate();
        const existingTimestamp = conversationsMap.has(message.conversationId) ? conversationsMap.get(message.conversationId).timestamp.toDate() : new Date(0); // Default to epoch if not exists

        if (!conversationsMap.has(message.conversationId) || currentTimestamp > existingTimestamp) {
          conversationsMap.set(message.conversationId, message);
        }
      });

      // Convert map values to array and sort by latest message timestamp
      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate()); // Sort descending by timestamp

      return conversations;
    } catch (error) {
      console.error(`Error getting conversations list for role ${role} and user ${userId}:`, error);
      throw new Error('Failed to retrieve conversations list.');
    }
  }

  /**
   * Marks messages in a conversation as read for a specific receiver.
   * @param {string} conversationId - The ID of the conversation.
   * @param {string} receiverId - The ID of the user/vendor who read the messages.
   * @returns {Promise<void>}
   */
  static async markMessagesAsRead(conversationId, receiverId) {
    try {
      const batch = db.batch();
      const snapshot = await db.collection('userVendorMessages')
        .where('conversationId', '==', conversationId)
        .where('receiverId', '==', receiverId)
        .where('read', '==', false) // Only update unread messages for this receiver
        .get();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
      console.log(`Marked ${snapshot.size} messages as read for conversation ${conversationId} by ${receiverId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Don't re-throw, as it's a background operation
    }
  }
}

module.exports = UserVendorMessageModel;