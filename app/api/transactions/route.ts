import { db } from "@/lib/db";

function generateTransactionCode() {
  return `TRX-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

export async function GET(req: Request) {
  let conn;

  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const offset = (page - 1) * limit;

    conn = await db();

    let where = `WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      where += `
        AND (
          t.transaction_code LIKE ?
          OR t.external_reference LIKE ?
          OR t.customer_name LIKE ?
          OR t.customer_email LIKE ?
          OR m.business_name LIKE ?
        )
      `;
      params.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    if (status) {
      where += ` AND t.status = ?`;
      params.push(status);
    }

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
        t.updated_at,
        m.business_name AS merchant_name,
        pm.name AS payment_method_name
      FROM transactions t
      LEFT JOIN merchants m ON m.id = t.merchant_id
      LEFT JOIN payment_methods pm ON pm.id = t.payment_method_id
      ${where}
      ORDER BY t.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countRows]: any = await conn.execute(
      `
      SELECT COUNT(*) AS total
      FROM transactions t
      LEFT JOIN merchants m ON m.id = t.merchant_id
      LEFT JOIN payment_methods pm ON pm.id = t.payment_method_id
      ${where}
      `,
      params
    );

    const total = countRows[0]?.total || 0;

    return Response.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        total_page: Math.ceil(total / limit),
      },
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

export async function POST(req: Request) {
  let conn;

  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          message: "API Key wajib dikirim melalui header x-api-key",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      payment_method_id,
      external_reference,
      customer_name,
      customer_email,
      customer_phone,
      amount,
      fee = 0,
      expired_at,
    } = body;

    if (!payment_method_id || !amount) {
      return Response.json(
        {
          success: false,
          message: "payment_method_id dan amount wajib diisi",
        },
        { status: 400 }
      );
    }

    conn = await db();

    const [merchantRows]: any = await conn.execute(
      `
      SELECT id, status
      FROM merchants
      WHERE api_key = ?
      LIMIT 1
      `,
      [apiKey]
    );

    if (merchantRows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "API Key tidak valid",
        },
        { status: 401 }
      );
    }

    const merchant = merchantRows[0];

    if (merchant.status !== "approved" && merchant.status !== "active") {
      return Response.json(
        {
          success: false,
          message: "Merchant belum aktif / belum disetujui",
        },
        { status: 403 }
      );
    }

    const transaction_code = generateTransactionCode();
    const net_amount = Number(amount) - Number(fee || 0);
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const payment_url = `${origin}/pay/${transaction_code}`;

    const [result]: any = await conn.execute(
      `
      INSERT INTO transactions (
        merchant_id,
        payment_method_id,
        transaction_code,
        external_reference,
        customer_name,
        customer_email,
        customer_phone,
        amount,
        fee,
        net_amount,
        status,
        payment_url,
        expired_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW(), NOW())
      `,
      [
        merchant.id,
        payment_method_id,
        transaction_code,
        external_reference || null,
        customer_name || null,
        customer_email || null,
        customer_phone || null,
        amount,
        fee,
        net_amount,
        payment_url,
        expired_at || null,
      ]
    );

    await conn.execute(
      `
      INSERT INTO transaction_details (
        transaction_id,
        provider_name,
        created_at,
        updated_at
      ) VALUES (?, ?, NOW(), NOW())
      `,
      [result.insertId, "manual"]
    );

    return Response.json({
      success: true,
      message: "Transaksi berhasil dibuat",
      data: {
        id: result.insertId,
        transaction_code,
        payment_url,
        status: "pending",
      },
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