import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1780543185761 implements MigrationInterface {
  name = 'InitSchema1780543185761';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "business" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "currency" character varying NOT NULL DEFAULT 'COP', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0bd850da8dafab992e2e9b058e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "business_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user"  ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "contact" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "business_id" uuid NOT NULL, "external_id" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying, CONSTRAINT "PK_2cbbe00f59ab6b3bb5b8d19f989" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e4b9d8427bef0ba85e1e76d722" ON "contact"  ("business_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5e303623ed9055470cbe86db46" ON "contact"  ("business_id", "external_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."campaign_channel_enum" AS ENUM('meta', 'google', 'tiktok', 'email', 'whatsapp', 'organic')`,
    );
    await queryRunner.query(
      `CREATE TABLE "campaign" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "business_id" uuid NOT NULL, "name" character varying NOT NULL, "channel" "public"."campaign_channel_enum" NOT NULL, "ad_spend" numeric(14,2) NOT NULL, "platform_reported_revenue" numeric(14,2) NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, CONSTRAINT "PK_0ce34d26e7f2eb316a3a592cdc4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_109b997f1771df11053f635bba" ON "campaign"  ("business_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."touchpoint_channel_enum" AS ENUM('meta', 'google', 'tiktok', 'email', 'whatsapp', 'organic')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."touchpoint_audience_origin_enum" AS ENUM('fria', 'warm', 'base_propia')`,
    );
    await queryRunner.query(
      `CREATE TABLE "touchpoint" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "business_id" uuid NOT NULL, "contact_id" uuid NOT NULL, "campaign_id" uuid NOT NULL, "channel" "public"."touchpoint_channel_enum" NOT NULL, "audience_origin" "public"."touchpoint_audience_origin_enum" NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_6300fcbd2118e516bd624a54c2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_40fe7c0ce0e34fea15287027c4" ON "touchpoint"  ("business_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_288561e1503aff579aff9859e6" ON "touchpoint"  ("business_id", "contact_id", "occurred_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sale" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "business_id" uuid NOT NULL, "contact_id" uuid NOT NULL, "amount" numeric(14,2) NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_d03891c457cbcd22974732b5de2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_81380b8443f6f2c90af4998650" ON "sale"  ("business_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1fd9f91bb6623eca93dda97134" ON "sale"  ("business_id", "occurred_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_status_enum" AS ENUM('accepted', 'done', 'dismissed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "business_id" uuid NOT NULL, "title" character varying NOT NULL, "context" text NOT NULL, "owner" character varying NOT NULL, "suggested_date" date NOT NULL, "cta" character varying NOT NULL, "status" "public"."task_status_enum" NOT NULL DEFAULT 'accepted', "source_rule" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ed6bb3386c5888566e660dbf9f" ON "task"  ("business_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_5a4bd96d9a519d4d20a21231b9f" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_5a4bd96d9a519d4d20a21231b9f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ed6bb3386c5888566e660dbf9f"`,
    );
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1fd9f91bb6623eca93dda97134"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_81380b8443f6f2c90af4998650"`,
    );
    await queryRunner.query(`DROP TABLE "sale"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_288561e1503aff579aff9859e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_40fe7c0ce0e34fea15287027c4"`,
    );
    await queryRunner.query(`DROP TABLE "touchpoint"`);
    await queryRunner.query(
      `DROP TYPE "public"."touchpoint_audience_origin_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."touchpoint_channel_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_109b997f1771df11053f635bba"`,
    );
    await queryRunner.query(`DROP TABLE "campaign"`);
    await queryRunner.query(`DROP TYPE "public"."campaign_channel_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5e303623ed9055470cbe86db46"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e4b9d8427bef0ba85e1e76d722"`,
    );
    await queryRunner.query(`DROP TABLE "contact"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "business"`);
  }
}
