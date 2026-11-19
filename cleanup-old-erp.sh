#!/usr/bin/env bash
# Run inside your frontend/ folder before copying src/ files:
rm -rf src/app/erp src/components/erp src/types/erp.ts src/mock-backend/erp-data.ts src/mock-backend/erp-handlers.ts src/services/erpApi.ts
rm -rf src/app/admin/products src/app/admin/rfqs src/app/admin/inspections src/app/admin/finance src/app/admin/buyers
echo "Old separate ERP and old admin sub-folders removed."
