// Export all models with namespaces to avoid conflicts
export * as MainModels from "./main";
export * as StoreModels from "./store";

// =====================================================
// MAIN DATABASE MODELS
// =====================================================

// User
export {
    UserModel,
    UserRole,
    UserStatus,
    UserResponseModel
} from "./main/user.model";

// ChatMessage
export {
    ChatMessageModel,
    MessageType as ChatMessageType,
    ChatMessageResponseModel
} from "./main/chat-message.model";

// ChatRoom
export {
    ChatRoomModel,
    ChatRoomType,
    ChatRoomResponseModel
} from "./main/chat-room.model";

// Product
export {
    ProductModel,
    ProductCategory,
    ProductMaterial,
    ProductStatus,
    ProductResponseModel
} from "./main/product.model";
export type { ProductDimensions } from "./main/product.model";

// Quote
export {
    QuoteModel,
    QuoteStatus,
    QuoteResponseModel
} from "./main/quote.model";

// =====================================================
// STORE DATABASE MODELS
// =====================================================

// Conversation
export {
    ConversationModel,
    ConversationType,
    ConversationResponseModel
} from "./store/conversation.model";

// ConversationMember
export {
    ConversationMemberModel,
    ConversationMemberRole,
    ConversationMemberResponseModel
} from "./store/conversation-member.model";

// Message
export {
    MessageModel,
    MessageType as StoreMessageType,
    MessageResponseModel
} from "./store/message.model";
