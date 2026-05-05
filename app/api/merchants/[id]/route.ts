import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conn = await db();

    const [rows]: any = await conn.execute(
      `
      SELECT 
        m.id,
        m.merchant_code,
        m.business_name,
        m.owner_name,
        m.email,
        m.phone,
        m.status,

        mp.business_type,
        mp.address,
        mp.city,
        mp.province,
        mp.postal_code,

        mb.available_balance,
        mb.pending_balance,
        mb.total_withdrawn,

        mba.bank_name,
        mba.bank_code,
        mba.account_number,
        mba.account_name

      FROM merchants m
      LEFT JOIN merchant_profiles mp ON mp.merchant_id = m.id
      LEFT JOIN merchant_balances mb ON mb.merchant_id = m.id
      LEFT JOIN merchant_bank_accounts mba ON mba.merchant_id = m.id
      WHERE m.id = ?
      LIMIT 1
      `,
      [id]
    );

    await conn.end();

    if (rows.length === 0) {
      return Response.json(
        { success: false, message: "Merchant tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: rows[0],
    });
  } catch (error: any) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      business_name,
      owner_name,
      email,
      phone,
      status,
      business_type,
      address,
      city,
      province,
      postal_code,

      bank_name,
      bank_code,
      account_number,
      account_name,
    } = body;

    const conn = await db();

    await conn.execute(
      `
      UPDATE merchants
      SET business_name = ?,
          owner_name = ?,
          email = ?,
          phone = ?,
          status = ?,
          updated_at = NOW()
      WHERE id = ?
      `,
      [
        business_name,
        owner_name,
        email,
        phone || null,
        status || "pending",
        id,
      ]
    );

    await conn.execute(
      `
      UPDATE merchant_profiles
      SET business_type = ?,
          address = ?,
          city = ?,
          province = ?,
          postal_code = ?,
          updated_at = NOW()
      WHERE merchant_id = ?
      `,
      [
        business_type || null,
        address || null,
        city || null,
        province || null,
        postal_code || null,
        id,
      ]
    );

    const [bankRows]: any = await conn.execute(
      `
      SELECT id 
      FROM merchant_bank_accounts
      WHERE merchant_id = ?
      LIMIT 1
      `,
      [id]
    );

    if (bankRows.length > 0) {
      await conn.execute(
        `
        UPDATE merchant_bank_accounts
        SET bank_name = ?,
            bank_code = ?,
            account_number = ?,
            account_name = ?,
            is_primary = ?,
            updated_at = NOW()
        WHERE merchant_id = ?
        `,
        [
          bank_name || null,
          bank_code || null,
          account_number || null,
          account_name || null,
          1,
          id,
        ]
      );
    } else {
      await conn.execute(
        `
        INSERT INTO merchant_bank_accounts (
          merchant_id,
          bank_name,
          bank_code,
          account_number,
          account_name,
          is_primary,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          id,
          bank_name || null,
          bank_code || null,
          account_number || null,
          account_name || null,
          1,
        ]
      );
    }

    await conn.end();

    return Response.json({
      success: true,
      message: "Merchant berhasil diperbarui",
    });
  } catch (error: any) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return Response.json(
        { success: false, message: "ID merchant tidak ditemukan" },
        { status: 400 }
      );
    }

    const allowedStatus = ["pending", "active", "suspended", "rejected"];

    if (!allowedStatus.includes(status)) {
      return Response.json(
        { success: false, message: "Status tidak valid" },
        { status: 422 }
      );
    }

    const conn = await db();

    await conn.execute(
      `
      UPDATE merchants
      SET status = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [status, id]
    );

    await conn.end();

    return Response.json({
      success: true,
      message: "Status merchant berhasil diperbarui",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";

    return Response.json(
      { success: false, message },
      { status: 500 }
    );
  }
}