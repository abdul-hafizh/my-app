import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ transaction_code: string }> }
) {
  let conn;

  try {
    const { transaction_code } = await params;

    conn = await db();

    const [rows]: any = await conn.execute(
      `
      SELECT 
        t.id,
        t.transaction_code,
        t.external_reference,
        t.customer_name,
        t.customer_email,
        t.customer_phone,
        t.amount,
        t.fee,
        t.net_amount,
        t.status,
        t.payment_url,
        t.expired_at,
        t.paid_at,
        t.created_at,

        m.business_name AS merchant_name,

        pm.name AS payment_method_name,
        pm.type AS payment_method_type,

        td.provider_name,
        td.qris_content,
        td.va_number,
        td.bank_code,
        td.ft_account_number,
        td.ft_account_name
      FROM transactions t
      LEFT JOIN merchants m ON m.id = t.merchant_id
      LEFT JOIN payment_methods pm ON pm.id = t.payment_method_id
      LEFT JOIN transaction_details td ON td.transaction_id = t.id
      WHERE t.transaction_code = ?
      LIMIT 1
      `,
      [transaction_code]
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