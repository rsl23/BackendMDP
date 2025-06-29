import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { startChatSchema, updateMessageStatusSchema, chatPaginationSchema } from "../utils/validation/chatSchema.js";
import { successResponse, errorResponse } from "../utils/responseUtil.js";

class ChatController {
  // POST /chat - Start a new chat with a user
  static async startChat(req, res) {
    try {      // Validate request body
      const { error, value } = startChatSchema.validate(req.body);
      if (error) {
        return errorResponse(res, 400, "Validation error", {
          errors: error.details.map((detail) => detail.message)
        });
      }

      const { receiver_id, message } = value;
      const sender_id = req.user.id; // From auth middleware

      // Check if sender is trying to chat with themselves
      if (sender_id === receiver_id) {
        return errorResponse(res, 400, "Cannot start chat with yourself");
      }

      // Check if receiver exists
      const receiver = await User.findById(receiver_id);
      if (!receiver) {
        return errorResponse(res, 404, "Receiver not found");
      }// Create new chat message
      const chatData = {
        user_sender: sender_id,
        user_receiver: receiver_id,
        chat: message,
        status: "sent",
      };

      const newChat = await Chat.create(chatData);      
      return successResponse(res, 201, "Chat started successfully", {
        chat_id: newChat.id,
        sender_id: newChat.user_sender,
        receiver_id: newChat.user_receiver,
        message: newChat.chat,
        datetime: newChat.datetime,
        status: newChat.status
      });
      
    } catch (error) {
      console.error("Error starting chat:", error);
      return errorResponse(res, 500, "Internal server error", {
        error: error.message
      });
    }
  }

  // GET /chat/conversations - Get all conversations for current user
  static async getUserConversations(req, res) {
    try {
      const userId = req.user.id; // From auth middleware

      const conversations = await Chat.getUserConversations(userId);

      // Enrich conversation data with user details
      const enrichedConversations = await Promise.all(
        conversations.map(async (conversation) => {
          try {
            const otherUser = await User.findById(conversation.otherUserId);
            return {
              ...conversation,
              otherUser: otherUser ? {
                id: otherUser.id,
                name: otherUser.username,
                email: otherUser.email,
                profile_picture: otherUser.profile_picture || null,
              } : null,
            };
          } catch (error) {
            console.error(`Error fetching user ${conversation.otherUserId}:`, error);
            return {
              ...conversation,
              otherUser: null,
            };
          }
        })
      );      return successResponse(res, 200, "Conversations retrieved successfully", {
        conversations: enrichedConversations,
        total: enrichedConversations.length
      });
    } catch (error) {
      console.error("Error getting user conversations:", error);
      return errorResponse(res, 500, "Internal server error", {
        error: error.message
      });
    }
  }
  // GET /chat/conversation/:user_id - Get conversation with specific user
  static async getConversation(req, res) {
    try {
      const { user_id } = req.params;
      const currentUserId = req.user.id; // From auth middleware
        // Validate query parameters
      const { error, value } = chatPaginationSchema.validate(req.query);
      if (error) {
        return errorResponse(res, 400, "Validation error", {
          errors: error.details.map((detail) => detail.message)
        });
      }

      const { page, limit } = value;

      // Validate user_id
      if (!user_id) {        return errorResponse(res, 400, "user_id is required");
      }

      // Check if other user exists
      const otherUser = await User.findById(user_id);
      if (!otherUser) {
        return errorResponse(res, 404, "User not found");
      }

      // Get conversation
      const conversation = await Chat.getConversation(currentUserId, user_id, page, limit);

      return successResponse(res, 200, "Conversation retrieved successfully", {
        ...conversation,
        otherUser: {
          id: otherUser.id,
          name: otherUser.username,
          email: otherUser.email,
          profile_picture: otherUser.profile_picture || null,
        }
      });    } catch (error) {
      console.error("Error getting conversation:", error);
      return errorResponse(res, 500, "Internal server error", {
        error: error.message
      });
    }
  }
  // PUT /chat/:chat_id/status - Update message status
  static async updateMessageStatus(req, res) {
    try {
      const { chat_id } = req.params;
      const userId = req.user.id; // From auth middleware

      // Validate request body
      const { error, value } = updateMessageStatusSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const { status } = value;      // Check if chat exists
      const chat = await Chat.findById(chat_id);
      if (!chat) {
        return errorResponse(res, 404, "Chat not found");
      }

      // Only receiver can update message status
      if (chat.user_receiver !== userId) {
        return errorResponse(res, 403, "Only message receiver can update status");
      }

      // Update status
      const success = await Chat.updateStatus(chat_id, status);
      
      if (success) {
        return successResponse(res, 200, "Message status updated successfully", {
          chat_id: chat_id,
          status: status,
          updated_at: new Date().toISOString()
        });
      } else {
        return errorResponse(res, 500, "Failed to update message status");
      }    } catch (error) {
      console.error("Error updating message status:", error);
      return errorResponse(res, 500, "Internal server error", {
        error: error.message
      });
    }
  }

  // DELETE /chat/:chat_id - Soft delete a chat message
  static async deleteMessage(req, res) {
    try {
      const { chat_id } = req.params;
      const userId = req.user.id; // From auth middleware

      // Check if chat exists
      const chat = await Chat.findById(chat_id);      if (!chat) {
        return errorResponse(res, 404, "Chat not found");
      }

      // Only sender can delete their message
      if (chat.user_sender !== userId) {
        return errorResponse(res, 403, "Only message sender can delete the message");
      }

      // Soft delete the message
      await Chat.softDelete(chat_id);

      return successResponse(res, 200, "Message deleted successfully", {
        chat_id: chat_id,
        deleted_at: new Date().toISOString()
      });    } catch (error) {
      console.error("Error deleting message:", error);
      return errorResponse(res, 500, "Internal server error", {
        error: error.message
      });
    }
  }
}

export default ChatController;
