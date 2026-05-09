import { db } from "@/lib/db";
import crypto from "crypto";

function generateApiKey() {
  return `pk_live_${crypto.randomBytes(32).toString("hex")}`;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let conn;

  try {
    const { id } = await params;

    conn = await db();

    const apiKey = generateApiKey();

    const [result]: any = await conn.execute(
      `
      UPDATE merchants
      SET 
        api_key = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [apiKey, id]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        {
          success: false,
          message: "Merchant tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "API Key merchant berhasil dibuat",
      data: {
        api_key: apiKey,
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