import { firestore } from "../config/database.js";

class Chat {
  constructor({
    id,
    user_sender,
    user_receiver,
    chat,
    datetime,
    status = "sent",
    created_at,
    updated_at = null,
    deleted_at = null,
  }) {
    this.id = id; // ID akan di-set dari Firestore doc_id
    this.user_sender = user_sender;
    this.user_receiver = user_receiver;
    this.chat = chat;
    this.datetime = datetime || new Date().toISOString();
    this.status = status; // sent, delivered, read
    this.created_at = created_at || new Date().toISOString();
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }

  static get chatsRef() {
    return firestore.collection("chats");
  }
  static async create(chatData) {
    if (!chatData.user_sender || !chatData.user_receiver || !chatData.chat) {
      throw new Error("user_sender, user_receiver, and chat message are required.");
    }

    const newChat = new Chat(chatData);
    
    try {
        //Buat ngubah format ID chat jd CH001, CH002, dst
      // const snapshot = await Chat.chatsRef.get();
      // const count = snapshot.size + 1;
      // newChat.id = `CH${String(count).padStart(3, "0")}`;


      // Pakai doc_id Firestore otomatis
      const docRef = Chat.chatsRef.doc();
      newChat.id = docRef.id; 
      
      await docRef.set({
        user_sender: newChat.user_sender,
        user_receiver: newChat.user_receiver,
        chat: newChat.chat,
        datetime: newChat.datetime,
        status: newChat.status,
        created_at: newChat.created_at,
        updated_at: newChat.updated_at,
        deleted_at: newChat.deleted_at,
      });

      console.log("Chat successfully created in Firestore with doc_id:", newChat.id);
      return newChat;
    } catch (error) {
      console.error("Error creating chat in Firestore:", error);
      throw error;
    }
  }

  static async findById(chatId) {
    try {
      const doc = await Chat.chatsRef.doc(chatId).get();
      if (doc.exists) {
        const chatData = doc.data();
        if (chatData.deleted_at) {
          return null;
        }
        return new Chat({ id: doc.id, ...chatData });
      }
      return null;
    } catch (error) {
      console.error("Error finding chat by ID:", error);
      throw error;
    }
  }

  // Get conversation between two users
  static async getConversation(userId1, userId2, page = 1, limit = 50) {
    try {
      // Query untuk chat antara dua user (bolak-balik)
      const snapshot = await Chat.chatsRef
        .where("deleted_at", "==", null)
        .get();

      const messages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter chat antara user1 dan user2 (kedua arah)
        if (
          (data.user_sender === userId1 && data.user_receiver === userId2) ||
          (data.user_sender === userId2 && data.user_receiver === userId1)
        ) {
          messages.push(new Chat({ id: doc.id, ...data }));
        }
      });

      // Sort by datetime ascending (oldest first)
      messages.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMessages = messages.slice(startIndex, endIndex);

      return {
        messages: paginatedMessages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(messages.length / limit),
          totalMessages: messages.length,
          hasNext: page * limit < messages.length,
          hasPrev: page > 1,
          limit
        }
      };
    } catch (error) {
      console.error("Error getting conversation:", error);
      throw error;
    }
  }

  // Get all conversations for a user (list of people they've chatted with)
  static async getUserConversations(userId) {
    try {
      const snapshot = await Chat.chatsRef
        .where("deleted_at", "==", null)
        .get();

      const conversations = new Map();

      snapshot.forEach((doc) => {
        const data = doc.data();
        let otherUserId = null;

        // Determine the other user in the conversation
        if (data.user_sender === userId) {
          otherUserId = data.user_receiver;
        } else if (data.user_receiver === userId) {
          otherUserId = data.user_sender;
        }

        if (otherUserId) {
          const chatData = new Chat({ id: doc.id, ...data });
          
          // Keep only the latest message for each conversation
          if (!conversations.has(otherUserId) || 
              new Date(chatData.datetime) > new Date(conversations.get(otherUserId).datetime)) {
            conversations.set(otherUserId, {
              otherUserId,
              lastMessage: chatData.chat,
              lastMessageTime: chatData.datetime,
              lastMessageStatus: chatData.status,
              lastMessageSender: chatData.user_sender
            });
          }
        }
      });

      // Convert to array and sort by last message time (newest first)
      const conversationList = Array.from(conversations.values())
        .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

      return conversationList;
    } catch (error) {
      console.error("Error getting user conversations:", error);
      throw error;
    }
  }

  // Update message status (delivered, read)
  static async updateStatus(chatId, newStatus) {
    try {
      await Chat.chatsRef.doc(chatId).update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error updating chat status:", error);
      return false;
    }
  }

  // Soft delete chat
  static async softDelete(chatId) {
    try {
      await Chat.chatsRef.doc(chatId).update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error soft deleting chat:", error);
      throw error;
    }
  }

  toJSON() {
    const { ...chatData } = this;
    return chatData;
  }
}

export default Chat;
