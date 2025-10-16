# 🧪 Test API Login

## Cara Test dengan cURL

### Test Login Success

```bash
curl -X POST https://api.pupuk-kujang.co.id/demplon/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD"
  }'
```

### Expected Success Response

```json
{
  "success": true,
  "application": {
    "id": 21,
    "slug": "demplonadmin",
    "name": "Demplon Admin",
    "description": "Demplon Admin",
    "active": true
  },
  "roles": ["adminhrdemplonti"],
  "user": {
    "id": "3082625",
    "username": "3082625",
    "name": "Tono Sartono",
    "pic": "https://statics.pupuk-kujang.co.id/demplon/picemp/3082625.jpg",
    "email": "tono@pupuk-kujang.co.id",
    "organization": {
      "id": "C001370000",
      "name": "Departemen Mitra Bisnis Layanan TI PKC",
      "leader": true
    }
  }
}
```

### Expected Error Response

```json
{
  "message": "App is not assigned to this employee or app is does not exist",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## Test di Browser Console

Buka Console (F12) dan jalankan:

```javascript
fetch("https://api.pupuk-kujang.co.id/demplon/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "YOUR_USERNAME",
    password: "YOUR_PASSWORD",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log("Success:", data))
  .catch((err) => console.error("Error:", err));
```

## Checklist Testing

- [ ] Test dengan username & password valid
- [ ] Test dengan username & password invalid
- [ ] Test dengan username yang tidak memiliki akses ke aplikasi
- [ ] Test response time API (< 2 detik ideal)
- [ ] Test CORS (apakah API allow request dari localhost)
- [ ] Test profile picture URL (apakah bisa diakses)
- [ ] Test dengan user yang tidak punya organization
- [ ] Test dengan user yang punya multiple roles

## Monitoring di Development

Untuk melihat request/response di NextAuth, tambahkan debug mode:

Di `src/lib/auth.ts`, tambahkan:

```typescript
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development", // Enable debug
  // ... rest config
};
```

Kemudian check terminal untuk log detail.
