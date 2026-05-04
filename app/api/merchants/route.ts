import { db } from "@/lib/db";

export async function GET() {
  try {
    const conn = await db();

    const [rows] = await conn.execute(`
      SELECT 
        id,
        merchant_code,
        business_name,
        owner_name,
        email,
        phone,
        status,
        created_at
      FROM merchants
      ORDER BY id DESC
    `);

    await conn.end();

    return Response.json({
      success: true,
      data: rows,
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
  }
}