import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  let conn;

  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Number(searchParams.get("page") || 1);
    const perPage = Number(searchParams.get("per_page") || 10);
    const offset = (page - 1) * perPage;

    conn = await db();

    const where: string[] = [];
    const values: any[] = [];

    if (search) {
      where.push(`
        (
          merchant_code LIKE ?
          OR business_name LIKE ?
          OR owner_name LIKE ?
          OR email LIKE ?
          OR phone LIKE ?
        )
      `);

      const keyword = `%${search}%`;
      values.push(keyword, keyword, keyword, keyword, keyword);
    }

    if (status) {
      where.push(`status = ?`);
      values.push(status);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows]: any = await conn.execute(
      `
      SELECT COUNT(*) AS total
      FROM merchants
      ${whereSql}
      `,
      values
    );

    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / perPage);

    const [rows] = await conn.execute(
      `
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
      ${whereSql}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
      `,
      [...values, perPage, offset]
    );

    return Response.json({
      success: true,
      data: rows,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
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

export async function POST(request: Request) {
  let conn;

  try {
    const body = await request.json();

    const {
      business_name,
      owner_name,
      email,
      phone,
      password,
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

    if (!business_name || !owner_name || !email || !password) {
      return Response.json(
        { success: false, message: "Data wajib belum lengkap" },
        { status: 422 }
      );
    }

    conn = await db();

    await conn.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    const merchantCode = `MCH${Date.now()}`;

    const [result]: any = await conn.execute(
      `
      INSERT INTO merchants (
        merchant_code,
        business_name,
        owner_name,
        email,
        phone,
        password,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        merchantCode,
        business_name,
        owner_name,
        email,
        phone || null,
        hashedPassword,
        "pending",
      ]
    );

    const merchantId = result.insertId;

    await conn.execute(
      `
      INSERT INTO merchant_profiles (
        merchant_id,
        business_type,
        address,
        city,
        province,
        postal_code,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        merchantId,
        business_type || null,
        address || null,
        city || null,
        province || null,
        postal_code || null,
      ]
    );

    await conn.execute(
      `
      INSERT INTO merchant_balances (
        merchant_id,
        available_balance,
        pending_balance,
        total_withdrawn,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, NOW(), NOW())
      `,
      [
        merchantId,
        0,
        0,
        0,
      ]
    );

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
        merchantId,
        bank_name || null,
        bank_code || null,
        account_number || null,
        account_name || null,
        1,
      ]
    );

    await conn.commit();

    return Response.json({
      success: true,
      message: "Merchant berhasil ditambahkan",
    });
  } catch (error) {
    if (conn) await conn.rollback();

    const message = error instanceof Error ? error.message : "Error";

    return Response.json(
      { success: false, message },
      { status: 500 }
    );
  } finally {
    if (conn) await conn.end();
  }
}