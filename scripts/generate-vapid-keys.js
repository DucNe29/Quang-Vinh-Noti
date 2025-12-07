/**
 * Script để generate VAPID keys cho Web Push Notifications
 * 
 * Cách chạy:
 *   node scripts/generate-vapid-keys.js
 * 
 * Hoặc nếu chưa có web-push:
 *   npx web-push generate-vapid-keys
 */

// Cách 1: Dùng web-push nếu đã cài
try {
  const webpush = require('web-push')
  const vapidKeys = webpush.generateVAPIDKeys()
  
  console.log('\n✅ VAPID Keys đã được tạo:\n')
  console.log('📋 Public Key (dùng cho frontend - VITE_VAPID_PUBLIC_KEY):')
  console.log(vapidKeys.publicKey)
  console.log('\n🔐 Private Key (dùng cho backend - VAPID_PRIVATE_KEY):')
  console.log(vapidKeys.privateKey)
  console.log('\n📧 Subject (dùng cho backend - VAPID_SUBJECT):')
  console.log('mailto:admin@yourdomain.com')
  console.log('\n---\n')
  console.log('📝 Copy các giá trị trên vào file .env:\n')
  console.log('# Frontend (.env)')
  console.log(`VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`)
  console.log('# Backend (.env)')
  console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
  console.log(`VAPID_SUBJECT=mailto:admin@yourdomain.com\n`)
} catch (err) {
  // Cách 2: Nếu chưa cài web-push, hướng dẫn dùng npx
  console.log('⚠️  Chưa cài package web-push.')
  console.log('\n📦 Cài đặt:')
  console.log('   npm install web-push --save-dev')
  console.log('\n🔑 Hoặc chạy trực tiếp:')
  console.log('   npx web-push generate-vapid-keys')
  console.log('\n🌐 Hoặc dùng online tool:')
  console.log('   https://web-push-codelab.glitch.me/')
  process.exit(1)
}

