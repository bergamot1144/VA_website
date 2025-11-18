import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

// Скрипт для управления пользователями через терминал
// Использование:
//   tsx scripts/manage-user.ts create <username> <password> [role]
//   tsx scripts/manage-user.ts delete <username>
//   tsx scripts/manage-user.ts list

const command = process.argv[2];

async function main() {
  try {
    if (command === 'create') {
      const username = process.argv[3];
      const password = process.argv[4];
      const role = (process.argv[5] || 'ADMIN').toUpperCase();

      if (!username || !password) {
        console.error('❌ Ошибка: Необходимо указать логин и пароль');
        console.log('\nИспользование:');
        console.log('  tsx scripts/manage-user.ts create <username> <password> [role]');
        console.log('\nПримеры:');
        console.log('  tsx scripts/manage-user.ts create admin mypassword ADMIN');
        console.log('  tsx scripts/manage-user.ts create user mypassword USER');
        process.exit(1);
      }

      if (role !== 'USER' && role !== 'ADMIN') {
        console.error('❌ Ошибка: Роль должна быть USER или ADMIN');
        process.exit(1);
      }

      // Проверяем, существует ли пользователь
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        console.error(`❌ Ошибка: Пользователь "${username}" уже существует`);
        process.exit(1);
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создаем пользователя
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: role as 'USER' | 'ADMIN',
        },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
        },
      });

      console.log('✅ Пользователь успешно создан!');
      console.log('\nИнформация о пользователе:');
      console.log(`  Логин: ${user.username}`);
      console.log(`  Роль: ${user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Создан: ${new Date(user.createdAt).toLocaleString('ru-RU')}`);

    } else if (command === 'delete') {
      const username = process.argv[3];

      if (!username) {
        console.error('❌ Ошибка: Необходимо указать логин пользователя');
        console.log('\nИспользование:');
        console.log('  tsx scripts/manage-user.ts delete <username>');
        console.log('\nПример:');
        console.log('  tsx scripts/manage-user.ts delete admin');
        process.exit(1);
      }

      // Находим пользователя
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          role: true,
        },
      });

      if (!user) {
        console.error(`❌ Ошибка: Пользователь "${username}" не найден`);
        process.exit(1);
      }

      // Удаляем пользователя
      await prisma.user.delete({
        where: { id: user.id },
      });

      console.log(`✅ Пользователь "${username}" успешно удален!`);
      console.log(`  Роль: ${user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}`);

    } else if (command === 'list') {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (users.length === 0) {
        console.log('📭 Пользователи не найдены');
        return;
      }

      console.log(`\n📋 Список пользователей (${users.length}):\n`);
      users.forEach((user, index) => {
        const roleLabel = user.role === 'ADMIN' ? 'Администратор' : 'Пользователь';
        const roleIcon = user.role === 'ADMIN' ? '👑' : '👤';
        console.log(`${index + 1}. ${roleIcon} ${user.username}`);
        console.log(`   Роль: ${roleLabel}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Создан: ${new Date(user.createdAt).toLocaleString('ru-RU')}`);
        console.log('');
      });

    } else {
      console.error('❌ Неизвестная команда:', command);
      console.log('\nДоступные команды:');
      console.log('  create <username> <password> [role]  - Создать пользователя');
      console.log('  delete <username>                    - Удалить пользователя');
      console.log('  list                                 - Показать всех пользователей');
      console.log('\nПримеры:');
      console.log('  tsx scripts/manage-user.ts create admin mypassword ADMIN');
      console.log('  tsx scripts/manage-user.ts delete admin');
      console.log('  tsx scripts/manage-user.ts list');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

