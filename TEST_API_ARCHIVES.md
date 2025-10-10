# Test Demplon API Archives Endpoint

## Untuk test dengan curl:

### 1. Get your token first

Buka browser, login ke aplikasi, lalu akses:

```
http://localhost:3000/api/auth/token
```

Copy nilai `accessToken` dari response JSON.

### 2. Test API dengan curl

```bash
# Ganti <YOUR_TOKEN> dengan token yang didapat dari step 1
curl -X GET "https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  --cookie "__Host-next-auth.csrf-token=<YOUR_CSRF_TOKEN>" \
  -v
```

### 3. Test tanpa cookies (hanya Authorization)

```bash
curl -X GET "https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -v
```

## Test dari aplikasi:

1. Buka http://localhost:3000/dashboard/siadil
2. Klik button "🧪 TEST API (Server-Side)" di Debug Panel
3. Lihat hasil di browser console dan server terminal

## Expected Response:

```json
[
  {
    "id": 17,
    "slug": "bmuz-tik-...",
    "code": "TIK",
    "name": "Teknologi, Informasi & Komunikasi",
    "id_parent": null,
    "contributors": [...]
  },
  ...
]
```
