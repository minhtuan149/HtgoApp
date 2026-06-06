import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/jwt';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, icon, color } = await request.json();

    if (!name || !type || !icon || !color) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ: tên, phân loại (thu/chi), icon và màu sắc' },
        { status: 400 }
      );
    }

    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return NextResponse.json(
        { error: 'Loại danh mục không hợp lệ' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        type,
        icon,
        color,
        userId: session.userId,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}
