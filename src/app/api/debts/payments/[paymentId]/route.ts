import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/jwt';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId } = await params;

    // Find the payment and check ownership via debt
    const payment = await prisma.debtPayment.findUnique({
      where: { id: paymentId },
      include: {
        debt: true,
      },
    });

    if (!payment || payment.debt.userId !== session.userId) {
      return NextResponse.json({ error: 'Không tìm thấy lịch sử thanh toán' }, { status: 404 });
    }

    const debtId = payment.debtId;
    const paymentAmount = payment.amount;
    const linkedTransactionId = payment.transactionId;

    // Update debt remaining amount and set status to OPEN (since some debt is restored)
    const newRemaining = payment.debt.remaining + paymentAmount;

    await prisma.$transaction(async (tx) => {
      // Restore remaining amount on Debt
      await tx.debt.update({
        where: { id: debtId },
        data: {
          remaining: newRemaining,
          status: 'OPEN',
        },
      });

      // Delete the payment record
      await tx.debtPayment.delete({
        where: { id: paymentId },
      });
    });

    // Delete linked transaction if exists
    if (linkedTransactionId) {
      try {
        await prisma.transaction.delete({
          where: { id: linkedTransactionId },
        });
      } catch (err) {
        console.error('Failed to delete linked payment transaction:', err);
      }
    }

    return NextResponse.json({ message: 'Xóa đợt thanh toán thành công' });
  } catch (error: any) {
    console.error('Error deleting debt payment:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}
