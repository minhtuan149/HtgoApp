import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const where: any = {
      userId: session.userId,
    };

    // Filter by type
    if (type === 'INCOME' || type === 'EXPENSE') {
      where.type = type;
    }

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of the day to cover the entire day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    // Filter by description text search
    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, type, description, date, categoryId } = await request.json();

    if (amount === undefined || !type || !description || !categoryId) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ: số tiền, phân loại, mô tả và danh mục' },
        { status: 400 }
      );
    }

    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return NextResponse.json(
        { error: 'Loại giao dịch không hợp lệ' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Số tiền phải là số lớn hơn 0' },
        { status: 400 }
      );
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.userId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Danh mục không hợp lệ hoặc không thuộc về tài khoản này' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: numAmount,
        type,
        description: description.trim(),
        date: date ? new Date(date) : new Date(),
        userId: session.userId,
        categoryId,
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}
