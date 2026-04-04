export type NotificationType = 'BOOKING' | 'TICKET' | 'SYSTEM';
export type EntityType = 'BOOKING' | 'TICKET' | 'RESOURCE' | null;

export interface PageSortOrder {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface PageSortMetadata {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
  orders: PageSortOrder[];
}

export interface PageRequestMetadata {
  pageNumber: number;
  pageSize: number;
  sort: PageSortMetadata;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

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
    pageable: PageRequestMetadata;
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: PageSortMetadata;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
  unreadCount: number;
}
