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
    const { amount, type, description, date, categoryId } = await request.json();

    if (amount === undefined || !type || !description || !categoryId) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ thông tin giao dịch cần cập nhật' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Số tiền phải là số hợp lệ lớn hơn 0' },
        { status: 400 }
      );
    }

    // Verify transaction exists and belongs to the user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Không tìm thấy giao dịch hoặc bạn không có quyền sửa giao dịch này' },
        { status: 404 }
      );
    }

    // Verify the new category belongs to the user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.userId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Danh mục được chọn không hợp lệ' },
        { status: 400 }
      );
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: numAmount,
        type,
        description: description.trim(),
        date: date ? new Date(date) : new Date(),
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

    return NextResponse.json(updatedTransaction);
  } catch (error: any) {
    console.error('Error updating transaction:', error);
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

    // Verify transaction exists and belongs to the user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Không tìm thấy giao dịch hoặc bạn không có quyền xóa giao dịch này' },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Xóa giao dịch thành công' });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống' }, { status: 500 });
  }
}
