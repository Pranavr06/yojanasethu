import { NextRequest, NextResponse } from 'next/server';
import { dbGetInAppNotifications, dbMarkNotificationAsRead } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const role = searchParams.get('role') || undefined;

    const notifications = await dbGetInAppNotifications(userId, role);
    return NextResponse.json({ notifications, count: notifications.length });
  } catch (error: any) {
    console.error('GET /api/placement/notifications error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const success = await dbMarkNotificationAsRead(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('PATCH /api/placement/notifications error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}
