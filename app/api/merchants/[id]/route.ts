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
        mb.total_withdrawn
      FROM merchants m
      LEFT JOIN merchant_profiles mp ON mp.merchant_id = m.id
      LEFT JOIN merchant_balances mb ON mb.merchant_id = m.id
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