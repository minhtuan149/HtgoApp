import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/jwt';

export async function PUT(
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
    const { partnerName, partnerPhone, description, amount, date, dueDate, interestType, interestValue } = body;

    // Find existing debt
    const debt = await prisma.debt.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!debt) {
      return NextResponse.json({ error: 'Không tìm thấy khoản nợ' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (partnerName !== undefined) updateData.partnerName = partnerName.trim();
    if (partnerPhone !== undefined) updateData.partnerPhone = partnerPhone ? partnerPhone.trim() : null;
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (date !== undefined) updateData.date = new Date(date);
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (interestType !== undefined) {
      const validInterestTypes = ['NONE', 'PERCENT_MONTHLY', 'PERCENT_YEARLY', 'FIXED_MONTHLY', 'FIXED_YEARLY'];
      updateData.interestType = validInterestTypes.includes(interestType) ? interestType : 'NONE';
    }
    if (interestValue !== undefined) {
      const numInterestValue = parseFloat(interestValue);
      updateData.interestValue = isNaN(numInterestValue) || numInterestValue < 0 ? 0 : numInterestValue;
    }

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: 'Số tiền phải là số lớn hơn 0' }, { status: 400 });
      }

      // Calculate total paid so far
      const paymentsSum = await prisma.debtPayment.aggregate({
        where: { debtId: id },
        _sum: { amount: true },
      });
      const totalPaid = paymentsSum._sum.amount || 0;

      const newRemaining = numAmount - totalPaid;
      if (newRemaining < 0) {
        return NextResponse.json(
          { error: `Không thể cập nhật số tiền gốc nhỏ hơn số tiền đã thanh toán (${totalPaid.toLocaleString()}đ)` },
          { status: 400 }
        );
      }

      updateData.amount = numAmount;
      updateData.remaining = newRemaining;
      updateData.status = newRemaining === 0 ? 'PAID' : 'OPEN';

      // Update linked transaction if exists
      if (debt.transactionId) {
        const prefix = debt.type === 'LENT' ? 'Cho vay' : 'Đi vay';
        try {
          await prisma.transaction.update({
            where: { id: debt.transactionId },
            data: {
              amount: numAmount,
              date: date ? new Date(date) : undefined,
              description: `[Ghi nợ] ${prefix} - Đối tác: ${partnerName ? partnerName.trim() : debt.partnerName}${description ? ` (${description.trim()})` : ''}`,
            },
          });
        } catch (err) {
          console.error('Failed to update linked transaction:', err);
        }
      }
    } else if (partnerName !== undefined || description !== undefined) {
      // Just update linked transaction description if name/desc changed
      if (debt.transactionId) {
        const prefix = debt.type === 'LENT' ? 'Cho vay' : 'Đi vay';
        const finalName = partnerName !== undefined ? partnerName.trim() : debt.partnerName;
        const finalDesc = description !== undefined ? (description ? description.trim() : '') : (debt.description || '');
        try {
          await prisma.transaction.update({
            where: { id: debt.transactionId },
            data: {
              description: `[Ghi nợ] ${prefix} - Đối tác: ${finalName}${finalDesc ? ` (${finalDesc})` : ''}`,
            },
          });
        } catch (err) {
          console.error('Failed to update linked transaction:', err);
        }
      }
    }

    const updatedDebt = await prisma.debt.update({
      where: { id },
      data: updateData,
      include: {
        payments: true,
      },
    });

    return NextResponse.json(updatedDebt);
  } catch (error: any) {
    console.error('Error updating debt:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find existing debt
    const debt = await prisma.debt.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        payments: true,
      },
    });

    if (!debt) {
      return NextResponse.json({ error: 'Không tìm thấy khoản nợ' }, { status: 404 });
    }

    // Delete linked transactions for all payments if any
    const paymentTxIds = debt.payments.map((p) => p.transactionId).filter(Boolean) as string[];
    if (paymentTxIds.length > 0) {
      try {
        await prisma.transaction.deleteMany({
          where: {
            id: { in: paymentTxIds },
          },
        });
      } catch (err) {
        console.error('Failed to delete linked transactions for payments:', err);
      }
    }

    // Delete linked transaction for the debt itself
    if (debt.transactionId) {
      try {
        await prisma.transaction.delete({
          where: { id: debt.transactionId },
        });
      } catch (err) {
        console.error('Failed to delete linked debt transaction:', err);
      }
    }

    // Delete the debt (will cascade delete payments due to DB relation setup)
    await prisma.debt.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Xóa khoản nợ thành công' });
  } catch (error: any) {
    console.error('Error deleting debt:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}
