# Naseer Plywood & Hardware — Owner Handoff & Administrative Operations Guide

## 1. Business Profile & Showroom Operations

**Business Name:** Naseer Plywood & Hardware  
**Urdu Business Name:** نصیر پلائی ووڈ اینڈ ہارڈویئر سرگودھا  
**Physical Showroom Address:** Near New Cantt Hospital, Canal Road / General Bus Stand Road, Sargodha, Punjab, Pakistan  
**Showroom Phone:** `+92-304-5030046` / `+92-317-7030847`  
**Official WhatsApp:** `+92-304-5030046`  
**Website Domain:** `https://naseerhardware.duckdns.org`  

### Non-Negotiable Store Policy
- **No Cart / Checkout:** The website is strictly a digital product showcase and enquiry funnel. Visitors cannot purchase online directly.
- **Conversion Channel:** Inquiries are routed directly to the showroom via WhatsApp pre-filled messages and the website instant enquiry form.
- **Price on Request:** All items display `"Price on Request"` (`قیمت برائے رابطہ`) to ensure customers receive verified, current showroom pricing.

---

## 2. Administrator Access & Security

### 2.1 Private Admin Access
- Public registration is strictly disabled. There is **no public sign-up**.
- Initial super-administrator credentials are provisioned during server deployment.

### 2.2 Role-Based Access Control (RBAC) Matrix

| Capability | Super Admin | Administrator | Catalogue Editor | Enquiry Handler |
|---|:---:|:---:|:---:|:---:|
| **View Dashboard Metrics** | Yes | Yes | Yes | Yes |
| **Manage / Edit Catalogue** | Yes | Yes | Yes | Read-only |
| **Delete Products/Categories** | Yes | Yes | **No** | **No** |
| **Upload Product Images** | Yes | Yes | Yes | **No** |
| **Trigger Live Website Build** | Yes | Yes | **No** | **No** |
| **View Customer Enquiries** | Yes | Yes | **No** | Yes |
| **Invite New Administrators** | Yes | **No** | **No** | **No** |
| **Revoke Admin Sessions** | Yes | **No** | **No** | **No** |

### 2.3 Inviting Additional Staff Members
1. Sign in as Super Admin to the Admin Dashboard (`https://naseerhardware.duckdns.org/admin`).
2. Navigate to **Admin Users & Invitations**.
3. Enter the new staff member's email address and assign an appropriate role (`catalogue_editor` or `enquiry_handler`).
4. A secure, single-use invitation link (valid for 72 hours) will be generated.
5. Provide this link to the staff member. They set their password and activate their account. The invitation token is immediately revoked upon use.

---

## 3. Product & Catalogue Management

### 3.1 Adding or Updating Products
1. In the admin dashboard, navigate to **Catalogue -> Products**.
2. To edit an item, click the edit icon.
3. Fill in English and Urdu titles and descriptions:
   - English: Clear product title, specifications, and dimensions.
   - Urdu: Accurate Nastaliq translations for Sargodha customers.
4. Set categories and subcategories (Hardware, Kitchen, Bathroom, Plywood).
5. Ensure `price_on_request` remains checked (`True`).
6. Toggle **Publish Status**:
   - `Published`: Item is included in the live website catalogue upon next rebuild.
   - `Unpublished`: Item is hidden from public view and returns 404.

### 3.2 Uploading Photographs
- Upload genuine showroom photographs or authorized manufacturer imagery (JPEG/PNG/WebP).
- SVG files are automatically rejected for security.
- Images are stored in persistent volume storage and backed up daily.

---

## 4. Publishing Changes to the Live Website

Because Naseer Hardware uses high-performance Static Site Generation (SSG):
1. Catalogue edits saved in the database do not immediately appear to visitors until the site is published.
2. In the Admin Dashboard header, click the **"Publish Website"** button (or API `POST /api/v1/admin/build/trigger`).
3. The build engine fetches the latest database records and generates static bilingual HTML in ~2.8 seconds.
4. When compilation finishes successfully, an atomic release switch occurs. Visitors instantly see the updated website with zero downtime.
5. If an error occurs, the previous release remains live and untouched.

---

## 5. Daily Operations & Disaster Recovery

### 5.1 Automated Nightly Backups
- The server automatically creates a complete backup snapshot every night at 02:00 PKT.
- The snapshot includes both the PostgreSQL database (`database.dump`) and all product media (`media.tar.gz`).

### 5.2 Manual Backup Prior to Major Updates
Before importing large batches of products:
```bash
./scripts/backup.sh
```

### 5.3 Restoring from Backup
In case of accidental deletion or hardware failure:
```bash
./scripts/restore.sh backups/backup_YYYYMMDD_HHMMSS hardware_db
```
The restore script verifies cryptographic checksums, recreates the database, unpacks media files, verifies row count integrity, and triggers a clean website rebuild.
