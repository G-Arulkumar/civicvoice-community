// Admin phone numbers — users with these numbers see the Admin Dashboard.
export const ADMIN_PHONES = ['+918939202794'];

export function isAdminPhone(phone?: string | null): boolean {
  return !!phone && ADMIN_PHONES.includes(phone);
}
