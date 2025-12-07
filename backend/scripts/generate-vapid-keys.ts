import webpush from 'web-push'

/**
 * Script để generate VAPID keys
 * Chạy: npm run generate-keys
 */
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
console.log('# Backend (backend/.env)')
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log(`VAPID_SUBJECT=mailto:admin@yourdomain.com\n`)

