import bcrypt from 'bcryptjs';

// Скрипт для хеширования пароля
// Использование: tsx scripts/hash-password.ts <password>
const password = process.argv[2];

if (!password) {
  console.error('Использование: tsx scripts/hash-password.ts <password>');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('Хешированный пароль:');
  console.log(hash);
  process.exit(0);
});

