import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let conn;

  try {
    const { id } = await params;

    conn = await db();

    const [rows]: any = await conn.execute(
      `
      SELECT 
        t.*,
        m.business_name AS merchant_name,
        m.merchant_code,
        pm.name AS payment_method_name,
        td.provider_name,
        td.qris_content,
        td.va_number,
        td.bank_code,
        td.ft_account_number,
        td.ft_account_name,
        td.raw_response
      FROM transactions t
      LEFT JOIN merchants m ON m.id = t.merchant_id
      LEFT JOIN payment_methods pm ON pm.id = t.payment_method_id
      LEFT JOIN transaction_details td ON td.transaction_id = t.id
      WHERE t.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Transaksi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan";

    return Response.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  } finally {
    if (conn) await conn.end();
  }
}