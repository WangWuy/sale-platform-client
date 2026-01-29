# Models - Client Side

Tất cả các models đã được chuyển đổi sang **numeric enums** để đồng bộ với backend.

## 📁 Cấu trúc

```
src/models/
├── main/                    # Models cho MAIN database
│   ├── user.model.ts
│   ├── chat-message.model.ts
│   ├── chat-room.model.ts
│   ├── product.model.ts
│   ├── quote.model.ts
│   └── index.ts
├── store/                   # Models cho STORE database
│   ├── conversation.model.ts
│   ├── conversation-member.model.ts
│   ├── message.model.ts
│   └── index.ts
└── index.ts                 # Export tất cả
```

## 🔢 Numeric Enums

### User (Main DB)

```typescript
enum UserRole {
  ADMIN = 1,
  MANAGER = 2,
  SALES = 3
}

enum UserStatus {
  ACTIVE = 1,
  SUSPENDED = 2
}
```

### ChatMessage (Main DB)

```typescript
enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  FILE = 3
}
```

### ChatRoom (Main DB)

```typescript
enum ChatRoomType {
  GENERAL = 1,
  QUOTE = 2,
  PRODUCT = 3
}
```

### Product (Main DB)

```typescript
enum ProductCategory {
  BAN = 1,
  GHE = 2,
  SOFA = 3,
  TU = 4,
  KE = 5,
  KHAC = 6
}

enum ProductMaterial {
  GO_TU_NHIEN = 1,
  GO_CONG_NGHIEP = 2,
  SAT = 3,
  NHUA = 4,
  VAI = 5,
  DA = 6,
  KHAC = 7
}

enum ProductStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
  ARCHIVED = 4
}
```

### Quote (Main DB)

```typescript
enum QuoteStatus {
  DRAFT = 1,
  SENT = 2,
  ACCEPTED = 3,
  REJECTED = 4,
  EXPIRED = 5
}
```

### Conversation (Store DB)

```typescript
enum ConversationType {
  DM = 1,      // Direct Message
  GROUP = 2    // Group chat
}
```

### ConversationMember (Store DB)

```typescript
enum ConversationMemberRole {
  ADMIN = 1,
  MEMBER = 2
}
```

### Message (Store DB)

```typescript
enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  FILE = 3,
  SYSTEM = 4
}
```

## 📖 Cách sử dụng

### Import Models

```typescript
// Import từ main
import { 
  UserModel, 
  UserRole, 
  UserStatus,
  ProductModel,
  ProductCategory,
  QuoteModel,
  QuoteStatus
} from "@/models/main";

// Import từ store
import { 
  ConversationModel, 
  ConversationType,
  MessageModel,
  MessageType 
} from "@/models/store";

// Hoặc import tất cả
import { UserModel, ConversationModel } from "@/models";
```

### Sử dụng Enums

```typescript
// Kiểm tra role
if (user.role === UserRole.ADMIN) {
  console.log("User is admin");
}

// Sử dụng helper methods
if (user.isAdmin()) {
  console.log("User is admin");
}

// Hiển thị tên
console.log(user.getRoleName()); // "Admin"

// So sánh status
if (product.status === ProductStatus.APPROVED) {
  console.log("Product approved");
}

// Hiển thị với màu
<Badge color={product.getStatusColor()}>
  {product.getStatusName()}
</Badge>
```

### Helper Methods

Tất cả models đều có các helper methods hữu ích:

#### User Model
- `isAdmin()`, `isManager()`, `isSales()`
- `getRoleName()` - "Admin", "Manager", "Sales"
- `isActive()`, `isSuspended()`
- `getStatusName()` - "Active", "Suspended"

#### Product Model
- `isPending()`, `isApproved()`, `isRejected()`, `isArchived()`
- `getCategoryName()` - "Bàn", "Ghế", "Sofa", etc.
- `getMaterialName()` - "Gỗ tự nhiên", "Gỗ công nghiệp", etc.
- `getStatusName()` - "Chờ duyệt", "Đã duyệt", etc.
- `getStatusColor()` - "warning", "success", "error", "default"
- `formatPrice(price)` - Format VND
- `getDimensionsString()` - "D100 x R50 x C80 cm"

#### Quote Model
- `isDraft()`, `isSent()`, `isAccepted()`, `isRejected()`, `isExpired()`
- `getStatusName()` - "Nháp", "Đã gửi", etc.
- `getStatusColor()` - "default", "info", "success", etc.
- `formatPrice(price)` - Format VND
- `getCustomerDisplay()` - Tên hoặc email hoặc phone
- `getDiscountPercentage()` - % giảm giá
- `getDaysUntilExpiry()` - Số ngày còn lại

#### Message Model (Store)
- `isTextMessage()`, `isImageMessage()`, `isFileMessage()`, `isSystemMessage()`
- `hasAttachment()`, `isEdited()`, `isReply()`
- `getFormattedFileSize()` - "2.5 MB"
- `getMessageTypeName()` - "Text", "Image", "File", "System"
- `getMessageTypeIcon()` - "💬", "🖼️", "📎", "ℹ️"

## 🎨 UI Examples

### Hiển thị User Role Badge

```tsx
<Badge color={user.role === UserRole.ADMIN ? "error" : "default"}>
  {user.getRoleName()}
</Badge>
```

### Hiển thị Product Status

```tsx
<Chip 
  label={product.getStatusName()} 
  color={product.getStatusColor()}
/>
```

### Hiển thị Quote với giá

```tsx
<div>
  <h3>{quote.code}</h3>
  <p>Khách hàng: {quote.getCustomerDisplay()}</p>
  <p>Tổng: {quote.formatPrice(quote.totalAmount)}</p>
  <p>Giảm: {quote.getDiscountPercentage()}%</p>
  <p>Thành tiền: {quote.formatPrice(quote.finalAmount)}</p>
  <Badge color={quote.getStatusColor()}>
    {quote.getStatusName()}
  </Badge>
</div>
```

### Filter Products theo Category

```tsx
const filteredProducts = products.filter(p => 
  p.category === ProductCategory.BAN
);
```

### Hiển thị Message

```tsx
{message.isSystemMessage() ? (
  <SystemMessage>{message.content}</SystemMessage>
) : (
  <UserMessage>
    {message.getMessageTypeIcon()} {message.content}
    {message.isEdited() && <span>(edited)</span>}
  </UserMessage>
)}
```

## ⚠️ Lưu ý

1. **Luôn dùng enum values** thay vì hardcoded numbers
2. **Sử dụng helper methods** để kiểm tra và hiển thị
3. **Đồng bộ với backend** - Enum values phải giống backend
4. **Type safety** - TypeScript sẽ báo lỗi nếu dùng sai enum value
