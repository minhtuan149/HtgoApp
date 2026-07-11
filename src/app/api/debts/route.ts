import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/jwt';

// Helper to get or create debt-specific categories
async function getOrCreateDebtCategory(userId: string, type: 'INCOME' | 'EXPENSE') {
  const name = type === 'INCOME' ? 'Đi vay / Nhận nợ' : 'Cho vay / Trả nợ';
  const icon = type === 'INCOME' ? 'Download' : 'Upload';
  const color = type === 'INCOME' ? '#22af80' : '#EF4444';

  let category = await prisma.category.findFirst({
    where: {
      userId,
      name,
      type,
    },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name,
        type,
        icon,
        color,
        userId,
      },
    });
  }

  return category;
}

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // OPEN, PAID, or ALL
    const type = searchParams.get('type');     // LENT, BORROWED, or ALL
    const search = searchParams.get('search');

    const where: any = {
      userId: session.userId,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { partnerName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const debts = await prisma.debt.findMany({
      where,
      include: {
        payments: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(debts);
  } catch (error: any) {
    console.error('Error fetching debts:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, type, partnerName, partnerPhone, description, date, dueDate, syncToTransactions, interestType, interestValue } = body;

    if (!amount || !type || !partnerName) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ: số tiền, hình thức (Vay/Cho vay) và tên người giao dịch' },
        { status: 400 }
      );
    }

    if (type !== 'LENT' && type !== 'BORROWED') {
      return NextResponse.json(
        { error: 'Hình thức nợ không hợp lệ' },
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

    // Validate interestType
    const validInterestTypes = ['NONE', 'PERCENT_MONTHLY', 'PERCENT_YEARLY', 'FIXED_MONTHLY', 'FIXED_YEARLY'];
    const finalInterestType = interestType && validInterestTypes.includes(interestType) ? interestType : 'NONE';
    const numInterestValue = interestValue ? parseFloat(interestValue) : 0;
    if (isNaN(numInterestValue) || numInterestValue < 0) {
      return NextResponse.json(
        { error: 'Giá trị lãi suất không hợp lệ' },
        { status: 400 }
      );
    }

    let linkedTransactionId: string | null = null;

    if (syncToTransactions) {
      // For LENT (we give money), it acts as an EXPENSE (cash outflow)
      // For BORROWED (we receive money), it acts as an INCOME (cash inflow)
      const transType = type === 'LENT' ? 'EXPENSE' : 'INCOME';
      const category = await getOrCreateDebtCategory(session.userId, transType);

      const prefix = type === 'LENT' ? 'Cho vay' : 'Đi vay';
      const transaction = await prisma.transaction.create({
        data: {
          amount: numAmount,
          type: transType,
          description: `[Ghi nợ] ${prefix} - Đối tác: ${partnerName.trim()}${description ? ` (${description.trim()})` : ''}`,
          date: date ? new Date(date) : new Date(),
          userId: session.userId,
          categoryId: category.id,
        },
      });
      linkedTransactionId = transaction.id;
    }

    const debt = await prisma.debt.create({
      data: {
        amount: numAmount,
        remaining: numAmount,
        type,
        status: 'OPEN',
        interestType: finalInterestType,
        interestValue: numInterestValue,
        description: description ? description.trim() : null,
        partnerName: partnerName.trim(),
        partnerPhone: partnerPhone ? partnerPhone.trim() : null,
        date: date ? new Date(date) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: session.userId,
        transactionId: linkedTransactionId,
      },
      include: {
        payments: true,
      },
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error: any) {
    console.error('Error creating debt:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}
