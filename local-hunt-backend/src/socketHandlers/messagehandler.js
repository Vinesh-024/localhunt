// src/socketHandlers/messageHandler.js
const UserVendorMessageModel = require('../models/UserVendorMessageModel');
const UserModel = require('../models/UserModel'); // To get sender/receiver names
const VendorModel = require('../models/VendorModel'); // To get vendor name

module.exports = (io, socket) => {
  socket.on('sendMessage', async ({ receiverId, vendorId, text }) => {
    const senderId = socket.user.uid;
    const senderRole = socket.user.role;

    console.log(`Backend: Received sendMessage from ${senderId} to ${receiverId} for vendor ${vendorId}: "${text}"`);

    if (!receiverId || !text || !vendorId) {
      socket.emit('messageError', 'Receiver ID, Vendor ID, and message text are required.');
      console.error('Backend: sendMessage validation failed.');
      return;
    }

    try {
      const newMessage = await UserVendorMessageModel.createMessage(
        senderId,
        receiverId,
        vendorId,
        text
      );
      console.log('Backend: Message saved to Firestore:', newMessage.id);

      const senderProfile = await UserModel.getUserProfile(senderId);
      const receiverProfile = await UserModel.getUserProfile(receiverId);

      let vendorBusinessName = 'Unknown Vendor';
      const vendorDoc = await VendorModel.getVendorById(vendorId);
      if (vendorDoc) {
        vendorBusinessName = vendorDoc.businessName;
      }

      const messageWithDetails = {
        ...newMessage,
        senderName: senderProfile ? senderProfile.name : 'Unknown Sender',
        receiverName: receiverProfile ? receiverProfile.name : 'Unknown Receiver',
        vendorBusinessName: vendorBusinessName,
      };

      // --- NEW: Add notification to recipient ---
      const senderName = senderProfile ? senderProfile.name : 'Someone';
      let notificationMessage = `New message from ${senderName}`;
      if (vendorDoc) {
        notificationMessage += ` regarding ${vendorDoc.businessName}`;
      }
      notificationMessage += `: "${text.substring(0, 50)}..."`; // Truncate message

      await UserModel.addNotification(
        receiverId, // Recipient of the message is recipient of notification
        'new_message',
        notificationMessage,
        newMessage.id // Related ID is the message ID
      );
      // --- END NEW ---


      console.log('Backend: Emitting receiveMessage to sender and receiver:', messageWithDetails.id);
      io.to(senderId).emit('receiveMessage', messageWithDetails);
      io.to(receiverId).emit('receiveMessage', messageWithDetails);

      socket.emit('messageSent', { success: true, message: 'Message sent successfully.' });

    } catch (error) {
      console.error('Error handling sendMessage:', error);
      socket.emit('messageError', 'Failed to send message.');
    }
  });

  // Listen for 'getConversationHistory' event from client
  socket.on('getConversationHistory', async ({ otherUserId, currentVendorId }) => {
    const currentUserId = socket.user.uid;

    if (!otherUserId || !currentVendorId) {
      socket.emit('messageError', 'Both user ID and vendor ID are required to get conversation history.');
      return;
    }

    try {
      // Construct conversationId consistently
      const participantIds = [currentUserId, otherUserId].sort();
      const conversationId = `${participantIds[0]}_${participantIds[1]}_${currentVendorId}`;

      const messages = await UserVendorMessageModel.getMessagesByConversationId(conversationId);

      // Fetch sender/receiver names for all messages
      const messagesWithDetails = await Promise.all(messages.map(async (msg) => {
        const senderProfile = await UserModel.getUserProfile(msg.senderId);
        const receiverProfile = await UserModel.getUserProfile(msg.receiverId);
        return {
          ...msg,
          senderName: senderProfile ? senderProfile.name : 'Unknown Sender',
          receiverName: receiverProfile ? receiverProfile.name : 'Unknown Receiver',
        };
      }));

      // Mark messages as read for the current user (receiver)
      await UserVendorMessageModel.markMessagesAsRead(conversationId, currentUserId);

      socket.emit('conversationHistory', messagesWithDetails);
    } catch (error) {
      console.error('Error getting conversation history:', error);
      socket.emit('messageError', 'Failed to retrieve conversation history.');
    }
  });

  // Listen for 'getConversationsList' event from client (for vendor/user dashboard)
  socket.on('getConversationsList', async () => {
    const userId = socket.user.uid;
    const role = socket.user.role;

    try {
      const conversations = await UserVendorMessageModel.getConversationsForUser(userId, role);

      // Fetch partner's name for each conversation
      const conversationsWithDetails = await Promise.all(conversations.map(async (conv) => {
        const partnerId = conv.senderId === userId ? conv.receiverId : conv.senderId;
        const partnerProfile = await UserModel.getUserProfile(partnerId);
        const vendorProfile = await VendorModel.getVendorById(conv.vendorId); // Get vendor details for context

        return {
          ...conv,
          partnerName: partnerProfile ? partnerProfile.name : 'Unknown',
          vendorName: vendorProfile ? vendorProfile.businessName : 'Unknown Business',
        };
      }));

      socket.emit('conversationsList', conversationsWithDetails);
    } catch (error) {
      console.error('Error getting conversations list:', error);
      socket.emit('messageError', 'Failed to retrieve conversations list.');
    }
  });
};