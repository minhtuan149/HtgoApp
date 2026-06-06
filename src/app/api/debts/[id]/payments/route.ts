import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/jwt';

// Helper to get or create debt-specific categories
async function getOrCreateDebtCategory(userId: string, type: 'INCOME' | 'EXPENSE') {
  const name = type === 'INCOME' ? 'Đi vay / Nhận nợ' : 'Cho vay / Trả nợ';
  const icon = type === 'INCOME' ? 'Download' : 'Upload';
  const color = type === 'INCOME' ? '#10B981' : '#EF4444';

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

// Helper to calculate accrued interest dynamically (discrete calendar periods)
function calculateAccruedInterest(debt: { amount: number; remaining: number; date: Date; interestType: string; interestValue: number; status: string }) {
  if (debt.status === 'PAID' || debt.interestType === 'NONE' || debt.interestValue <= 0) {
    return 0;
  }
  const start = new Date(debt.date);
  const end = new Date();

  if (debt.interestType === 'PERCENT_MONTHLY' || debt.interestType === 'FIXED_MONTHLY') {
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    // If today's day of the month is less than the start day, the current month period is not fully completed yet
    if (end.getDate() < start.getDate()) {
      months--;
    }
    const elapsed = Math.max(0, months);
    if (debt.interestType === 'PERCENT_MONTHLY') {
      return debt.remaining * (debt.interestValue / 100) * elapsed;
    } else {
      return debt.interestValue * elapsed;
    }
  }

  if (debt.interestType === 'PERCENT_YEARLY' || debt.interestType === 'FIXED_YEARLY') {
    let years = end.getFullYear() - start.getFullYear();
    // Verify if we have fully crossed the anniversary month and day of the month
    const hasPassedAnniversary =
      end.getMonth() > start.getMonth() ||
      (end.getMonth() === start.getMonth() && end.getDate() >= start.getDate());
    if (!hasPassedAnniversary) {
      years--;
    }
    const elapsed = Math.max(0, years);
    if (debt.interestType === 'PERCENT_YEARLY') {
      return debt.remaining * (debt.interestValue / 100) * elapsed;
    } else {
      return debt.interestValue * elapsed;
    }
  }

  return 0;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, date, description, syncToTransactions } = body;

    if (amount === undefined) {
      return NextResponse.json({ error: 'Vui lòng cung cấp số tiền thanh toán' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Số tiền thanh toán phải lớn hơn 0' }, { status: 400 });
    }

    // Find the debt
    const debt = await prisma.debt.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!debt) {
      return NextResponse.json({ error: 'Không tìm thấy khoản nợ' }, { status: 404 });
    }

    const accruedInterest = calculateAccruedInterest(debt);
    const totalOwed = debt.remaining + accruedInterest;

    if (numAmount > totalOwed + 10) { // Add 10đ buffer for float rounding precision
      return NextResponse.json(
        { error: `Số tiền thanh toán (${numAmount.toLocaleString()}đ) vượt quá tổng số nợ hiện tại (${Math.round(totalOwed).toLocaleString()}đ)` },
        { status: 400 }
      );
    }

    // Subtract from remaining principal, capped at 0
    const newRemaining = Math.max(0, debt.remaining - numAmount);
    const newStatus = newRemaining === 0 ? 'PAID' : 'OPEN';

    let linkedTransactionId: string | null = null;

    if (syncToTransactions) {
      // For LENT debt (we gave a loan), getting paid back is an INCOME (cash inflow)
      // For BORROWED debt (we took a loan), paying back is an EXPENSE (cash outflow)
      const transType = debt.type === 'LENT' ? 'INCOME' : 'EXPENSE';
      const category = await getOrCreateDebtCategory(session.userId, transType);

      const actionText = debt.type === 'LENT' ? 'Thu nợ' : 'Trả nợ';
      const transaction = await prisma.transaction.create({
        data: {
          amount: numAmount,
          type: transType,
          description: `[Thanh toán] ${actionText} - Đối tác: ${debt.partnerName}${description ? ` (${description.trim()})` : ''}`,
          date: date ? new Date(date) : new Date(),
          userId: session.userId,
          categoryId: category.id,
        },
      });
      linkedTransactionId = transaction.id;
    }

    // Run updates in a transaction to ensure integrity
    const result = await prisma.$transaction(async (tx) => {
      // Update debt remaining amount & status
      await tx.debt.update({
        where: { id },
        data: {
          remaining: newRemaining,
          status: newStatus,
        },
      });

      // Create debt payment record
      const payment = await tx.debtPayment.create({
        data: {
          amount: numAmount,
          date: date ? new Date(date) : new Date(),
          description: description ? description.trim() : null,
          debtId: id,
          transactionId: linkedTransactionId,
        },
      });

      return payment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error logging debt payment:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}
