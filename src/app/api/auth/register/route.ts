import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ thông tin: email, mật khẩu và tên' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email này đã được sử dụng bởi một tài khoản khác' },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create user and default categories in a database transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          passwordHash,
        },
      });

      // Default categories to seed for the new user
      const defaultCategories = [
        { name: 'Ăn uống', type: 'EXPENSE', icon: 'Utensils', color: '#F59E0B' },
        { name: 'Di chuyển', type: 'EXPENSE', icon: 'Car', color: '#3B82F6' },
        { name: 'Mua sắm', type: 'EXPENSE', icon: 'ShoppingBag', color: '#EC4899' },
        { name: 'Hóa đơn', type: 'EXPENSE', icon: 'CreditCard', color: '#EF4444' },
        { name: 'Giải trí', type: 'EXPENSE', icon: 'Film', color: '#8B5CF6' },
        { name: 'Nhà cửa', type: 'EXPENSE', icon: 'Home', color: '#06B6D4' },
        { name: 'Chi phí khác', type: 'EXPENSE', icon: 'HelpCircle', color: '#6B7280' },
        { name: 'Tiền lương', type: 'INCOME', icon: 'DollarSign', color: '#22af80' },
        { name: 'Đầu tư', type: 'INCOME', icon: 'TrendingUp', color: '#14B8A6' },
        { name: 'Thu nhập khác', type: 'INCOME', icon: 'PlusCircle', color: '#A855F7' },
      ];

      await tx.category.createMany({
        data: defaultCategories.map((cat) => ({
          ...cat,
          userId: newUser.id,
        })),
      });

      return newUser;
    });

    return NextResponse.json(
      { message: 'Đăng ký tài khoản thành công', userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi hệ thống khi xử lý đăng ký' },
      { status: 500 }
    );
  }
}
