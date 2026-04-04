export type NotificationType = 'BOOKING' | 'TICKET' | 'SYSTEM';
export type EntityType = 'BOOKING' | 'TICKET' | 'RESOURCE' | null;

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: EntityType;
  entityId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPageResponse {
  notifications: {
    content: Notification[];
    pageable: any;
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: any;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
  unreadCount: number;
}
