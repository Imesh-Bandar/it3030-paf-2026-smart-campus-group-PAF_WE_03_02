import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useRole } from './useRole';

export interface DashboardStats {
    totalUsers?: number;
    totalResources?: number;
    pendingBookings?: number;
    openTickets?: number;
    activeBookings?: number;
    inProgressTickets?: number;
    bookingStats?: {
        pending: number;
        confirmed: number;
        rejected: number;
        cancelled: number;
    };
    ticketStats?: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    ticketStatusStats?: {
        open: number;
        inProgress: number;
        resolved: number;
    };
    assignedTickets?: {
        open: number;
        inProgress: number;
        resolved: number;
    };
    resolvedThisWeek?: number;
    averageResolutionTime?: number;
}

export function useDashboardStats() {
    const { role } = useRole();

    const endpoint = role === 'ADMIN'
        ? '/dashboard/admin/stats'
        : role === 'TECHNICIAN'
            ? '/dashboard/technician/stats'
            : '/dashboard/user/stats';

    return useQuery<DashboardStats>({
        queryKey: ['dashboard-stats', role],
        queryFn: async () => {
            const response = await api.get(endpoint);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    });
}

export function useBookingsByDate() {
    return useQuery({
        queryKey: ['bookings-by-date'],
        queryFn: async () => {
            const response = await api.get('/dashboard/admin/bookings-by-date');
            return response.data;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
}

export function useResourceUtilization() {
    return useQuery({
        queryKey: ['resource-utilization'],
        queryFn: async () => {
            const response = await api.get('/dashboard/admin/resource-utilization');
            return response.data;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
    });
}
