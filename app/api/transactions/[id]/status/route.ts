import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let conn;

  try {
    const { id } = await params;

    const body = await req.json();

    const { status } = body;

    const allowedStatus = [
      "pending",
      "paid",
      "expired",
      "failed",
      "refunded",
    ];

    if (!allowedStatus.includes(status)) {
      return Response.json(
        {
          success: false,
          message: "Status tidak valid",
        },
        { status: 400 }
      );
    }

    conn = await db();

    await conn.beginTransaction();

    const [trxRows]: any = await conn.execute(
      `
      SELECT
        id,
        merchant_id,
        amount,
        fee,
        net_amount,
        status,
        balance_added
      FROM transactions
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (trxRows.length === 0) {
      await conn.rollback();

      return Response.json(
        {
          success: false,
          message: "Transaksi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const trx = trxRows[0];

    await conn.execute(
      `
      UPDATE transactions
      SET
        status = ?,
        paid_at = CASE
          WHEN ? = 'paid' THEN NOW()
          ELSE paid_at
        END,
        updated_at = NOW()
      WHERE id = ?
      `,
      [status, status, id]
    );

    /**
     * Tambah saldo merchant
     * hanya jika:
     * - status baru = paid
     * - sebelumnya belum paid
     * - balance belum pernah ditambahkan
     */

    await conn.execute(
      `
      INSERT INTO merchant_balances (
        merchant_id,
        available_balance,
        pending_balance,
        total_withdrawn,
        created_at,
        updated_at
      )
      SELECT ?, 0, 0, 0, NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM merchant_balances WHERE merchant_id = ?
      )
      `,
      [trx.merchant_id, trx.merchant_id]
    );

    if (
      status === "paid" &&
      trx.status !== "paid" &&
      Number(trx.balance_added) === 0
    ) {
      await conn.execute(
        `
        UPDATE merchant_balances
        SET
          available_balance = COALESCE(available_balance, 0) + ?,
          updated_at = NOW()
        WHERE merchant_id = ?
        `,
        [trx.net_amount, trx.merchant_id]
      );

      await conn.execute(
        `
        UPDATE transactions
        SET balance_added = 1
        WHERE id = ?
        `,
        [id]
      );
    }

    /**
     * Jika refunded
     * kurangi saldo merchant kembali
     */

    if (
      status === "refunded" &&
      trx.status === "paid" &&
      Number(trx.balance_added) === 1
    ) {
      await conn.execute(
        `
        UPDATE merchant_balances
        SET
          available_balance = COALESCE(available_balance, 0) - ?,
          updated_at = NOW()
        WHERE merchant_id = ?
        `,
        [trx.net_amount, trx.merchant_id]
      );

      await conn.execute(
        `
        UPDATE transactions
        SET balance_added = 0
        WHERE id = ?
        `,
        [id]
      );
    }

    await conn.commit();

    return Response.json({
      success: true,
      message: "Status transaksi berhasil diperbarui",
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }

    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    return Response.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}