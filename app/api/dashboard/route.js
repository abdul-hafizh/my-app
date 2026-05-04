import { db } from "@/lib/db";

export async function GET() {
  try {
    const conn = await db();

    const [[merchant]] = await conn.execute(
      "SELECT COUNT(*) AS total FROM merchants"
    );

    const [[transaction]] = await conn.execute(
      "SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS amount FROM transactions"
    );

    const [[paid]] = await conn.execute(
      "SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS amount FROM transactions WHERE status = 'paid'"
    );

    const [[settlement]] = await conn.execute(
      "SELECT COUNT(*) AS total, COALESCE(SUM(net_amount),0) AS amount FROM settlements"
    );

    await conn.end();

    return Response.json({
      success: true,
      data: {
        total_merchant: merchant.total,
        total_transaction: transaction.total,
        total_transaction_amount: transaction.amount,
        paid_transaction: paid.total,
        paid_transaction_amount: paid.amount,
        total_settlement: settlement.total,
        total_settlement_amount: settlement.amount,
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}