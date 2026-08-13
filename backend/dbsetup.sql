-- ============================================
-- WaySpot Veritabanı Kurulum Scripti
-- PostgreSQL + PostGIS
-- Hedef: 192.168.1.123 / Database: wayspot
-- Kullanıcı: casaos
-- ============================================

-- 1. PostGIS uzantısını aktifleştir
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Temiz başlangıç (isteğe bağlı — dikkat: tüm verileri siler)
--DROP SCHEMA IF EXISTS public CASCADE;
--CREATE SCHEMA public;

-- ============================================
-- TABLOLAR
-- ============================================

CREATE TABLE IF NOT EXISTS "Users" (
    "Id" uuid NOT NULL,
    "Username" text NOT NULL,
    "Email" text NOT NULL,
    "PasswordHash" text NOT NULL,
    "FirstName" text NOT NULL DEFAULT '',
    "LastName" text NOT NULL DEFAULT '',
    "ProfileImage" text,
    "Bio" text,
    "BirthDate" timestamp with time zone,
    "Gender" text,
    "Phone" text,
    "CityId" text,
    "GoogleId" text,
    "EmailConfirmed" boolean NOT NULL DEFAULT FALSE,
    "Role" integer NOT NULL DEFAULT 1,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "Businesses" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Name" text NOT NULL,
    "Type" text NOT NULL DEFAULT '',
    "TaxNumber" text,
    "Description" text NOT NULL DEFAULT '',
    "Location" geometry(Point, 4326) NOT NULL,
    "Address" text NOT NULL DEFAULT '',
    "CityId" text,
    "DistrictId" text,
    "PostalCode" text,
    "Phone" text NOT NULL DEFAULT '',
    "Email" text NOT NULL DEFAULT '',
    "Website" text,
    "Instagram" text,
    "Facebook" text,
    "WhatsApp" text,
    "CoverImage" text,
    "LogoImage" text,
    "IsActive" boolean NOT NULL DEFAULT TRUE,
    "IsVerified" boolean NOT NULL DEFAULT FALSE,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Businesses" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Businesses_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "BusinessHours" (
    "Id" uuid NOT NULL,
    "BusinessId" uuid NOT NULL,
    "DayOfWeek" integer NOT NULL,
    "OpenTime" time without time zone NOT NULL,
    "CloseTime" time without time zone NOT NULL,
    "IsOpen" boolean NOT NULL DEFAULT TRUE,
    CONSTRAINT "PK_BusinessHours" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_BusinessHours_Businesses_BusinessId" FOREIGN KEY ("BusinessId") REFERENCES "Businesses" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "BusinessImages" (
    "Id" uuid NOT NULL,
    "BusinessId" uuid NOT NULL,
    "ImageUrl" text NOT NULL,
    "AltText" text,
    "IsPrimary" boolean NOT NULL DEFAULT FALSE,
    "DisplayOrder" integer NOT NULL DEFAULT 0,
    "UploadedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_BusinessImages" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_BusinessImages_Businesses_BusinessId" FOREIGN KEY ("BusinessId") REFERENCES "Businesses" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Shares" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "ContentType" text NOT NULL,
    "ContentId" uuid NOT NULL,
    "Platform" text NOT NULL,
    "SharedAt" timestamp with time zone NOT NULL,
    "IpAddress" text,
    CONSTRAINT "PK_Shares" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Shares_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "SavedRoutes" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Name" text NOT NULL,
    "StartPoint" geometry(Point, 4326) NOT NULL,
    "EndPoint" geometry(Point, 4326) NOT NULL,
    "WaypointsJson" text,
    "TotalDistanceKm" double precision NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_SavedRoutes" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_SavedRoutes_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Posts" (
    "Id" uuid NOT NULL,
    "BusinessId" uuid NOT NULL,
    "Content" text NOT NULL,
    "ImageUrl" text,
    "TargetRadiusKm" double precision NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "ExpiresAt" timestamp with time zone,
    CONSTRAINT "PK_Posts" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Posts_Businesses_BusinessId" FOREIGN KEY ("BusinessId") REFERENCES "Businesses" ("Id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Reviews" (
    "Id" uuid NOT NULL,
    "BusinessId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Rating" integer NOT NULL,
    "Comment" character varying(2000) NOT NULL,
    "PhotoUrl" text NOT NULL,
    "IsApproved" boolean NOT NULL DEFAULT FALSE,
    "IsFlagged" boolean NOT NULL DEFAULT FALSE,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Reviews" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Reviews_Businesses_BusinessId" FOREIGN KEY ("BusinessId") REFERENCES "Businesses" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Reviews_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE RESTRICT
);

-- Güvenlik Ayarları Tablosu (uygulama tarafından okunur)
CREATE TABLE IF NOT EXISTS "SecuritySettings" (
    "Key" text NOT NULL,
    "Value" text NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "PK_SecuritySettings" PRIMARY KEY ("Key")
);

INSERT INTO "SecuritySettings" ("Key", "Value", "UpdatedAt") VALUES
('EnableSecurityHeaders', 'true', now()),
('EnableRateLimiting', 'true', now()),
('EnableBruteForceProtection', 'true', now()),
('EnableCors', 'true', now()),
('RequireHttps', 'false', now()),
('EnableSwagger', 'true', now()),
('EnableDatabaseSecurity', 'true', now()),
('EnableAuditLogging', 'true', now()),
('EnableIpBlocking', 'true', now()),
('EnableJwtBlacklist', 'true', now())
ON CONFLICT ("Key") DO NOTHING;

-- ============================================
-- INDEKSLER
-- ============================================

CREATE INDEX IF NOT EXISTS "IX_Businesses_Location" ON "Businesses" ("Location");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Businesses_UserId" ON "Businesses" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_Posts_BusinessId" ON "Posts" ("BusinessId");
CREATE INDEX IF NOT EXISTS "IX_Reviews_BusinessId" ON "Reviews" ("BusinessId");
CREATE INDEX IF NOT EXISTS "IX_Reviews_UserId" ON "Reviews" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_SavedRoutes_UserId" ON "SavedRoutes" ("UserId");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users" ("Email");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Username" ON "Users" ("Username");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_GoogleId" ON "Users" ("GoogleId");
CREATE INDEX IF NOT EXISTS "IX_BusinessHours_BusinessId_DayOfWeek" ON "BusinessHours" ("BusinessId", "DayOfWeek");
CREATE INDEX IF NOT EXISTS "IX_BusinessImages_BusinessId" ON "BusinessImages" ("BusinessId");
CREATE INDEX IF NOT EXISTS "IX_Shares_UserId" ON "Shares" ("UserId");

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Businesses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessHours" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessImages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedRoutes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Shares" ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar: Kendi profilini görebilir, admin herkesi görebilir
CREATE POLICY user_own_policy ON "Users"
    FOR SELECT
    USING ("Id" = current_setting('app.current_user_id')::uuid OR 
           current_setting('app.current_user_role') = '3');

-- İşletmeler: Aktif işletmeler herkese açık, düzenleme sadece sahibi
CREATE POLICY business_read_policy ON "Businesses"
    FOR SELECT
    USING ("IsActive" = true OR 
           "UserId" = current_setting('app.current_user_id')::uuid OR 
           current_setting('app.current_user_role') = '3');

CREATE POLICY business_write_policy ON "Businesses"
    FOR INSERT
    WITH CHECK ("UserId" = current_setting('app.current_user_id')::uuid);

CREATE POLICY business_update_policy ON "Businesses"
    FOR UPDATE
    USING ("UserId" = current_setting('app.current_user_id')::uuid OR 
           current_setting('app.current_user_role') = '3');

-- İşletme Saatleri: Herkese açık okuma, yazma sadece işletme sahibi
CREATE POLICY business_hours_read_policy ON "BusinessHours"
    FOR SELECT
    USING (true);

CREATE POLICY business_hours_write_policy ON "BusinessHours"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Businesses" b 
            WHERE b."Id" = "BusinessId" 
            AND b."UserId" = current_setting('app.current_user_id')::uuid
        )
    );

CREATE POLICY business_hours_update_policy ON "BusinessHours"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM "Businesses" b 
            WHERE b."Id" = "BusinessId" 
            AND b."UserId" = current_setting('app.current_user_id')::uuid
        )
    );

CREATE POLICY business_hours_delete_policy ON "BusinessHours"
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM "Businesses" b 
            WHERE b."Id" = "BusinessId" 
            AND b."UserId" = current_setting('app.current_user_id')::uuid
        )
    );

-- İşletme Görselleri: Herkese açık okuma, yazma sadece işletme sahibi
CREATE POLICY business_images_read_policy ON "BusinessImages"
    FOR SELECT
    USING (true);

CREATE POLICY business_images_write_policy ON "BusinessImages"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Businesses" b 
            WHERE b."Id" = "BusinessId" 
            AND b."UserId" = current_setting('app.current_user_id')::uuid
        )
    );

CREATE POLICY business_images_delete_policy ON "BusinessImages"
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM "Businesses" b 
            WHERE b."Id" = "BusinessId" 
            AND b."UserId" = current_setting('app.current_user_id')::uuid
        )
    );

-- Paylaşımlar: Sadece sahibi görebilir/düzenleyebilir
CREATE POLICY share_policy ON "Shares"
    FOR ALL
    USING ("UserId" = current_setting('app.current_user_id')::uuid OR 
           current_setting('app.current_user_role') = '3');

-- Kayıtlı Rotalar: Sadece sahibi görebilir/düzenleyebilir
CREATE POLICY saved_route_policy ON "SavedRoutes"
    FOR ALL
    USING ("UserId" = current_setting('app.current_user_id')::uuid OR 
           current_setting('app.current_user_role') = '3');

-- Postlar: Herkese açık okuma, yazma sadece işletme sahibi
CREATE POLICY post_read_policy ON "Posts"
    FOR SELECT
    USING (true);

CREATE POLICY post_write_policy ON "Posts"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Businesses" b 
            WHERE b."Id" = "BusinessId" 
            AND b."UserId" = current_setting('app.current_user_id')::uuid
        )
    );

-- Yorumlar: Onaylı yorumlar herkese açık, bekleyen sadece admin ve işletme sahibi
CREATE POLICY review_read_policy ON "Reviews"
    FOR SELECT
    USING ("IsApproved" = true OR 
           "UserId" = current_setting('app.current_user_id')::uuid OR 
           current_setting('app.current_user_role') = '3');

CREATE POLICY review_write_policy ON "Reviews"
    FOR INSERT
    WITH CHECK ("UserId" = current_setting('app.current_user_id')::uuid);

-- ============================================
-- AUDIT LOGLAMA
-- ============================================

CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS audit."DataChanges" (
    "Id" bigserial PRIMARY KEY,
    "TableName" text NOT NULL,
    "Operation" text NOT NULL,
    "OldData" jsonb,
    "NewData" jsonb,
    "ChangedBy" uuid NOT NULL,
    "ChangedAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit.data_change_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit."DataChanges" ("TableName", "Operation", "OldData", "ChangedBy")
        VALUES (TG_TABLE_NAME, 'DELETE', row_to_json(OLD), current_setting('app.current_user_id')::uuid);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit."DataChanges" ("TableName", "Operation", "OldData", "NewData", "ChangedBy")
        VALUES (TG_TABLE_NAME, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_setting('app.current_user_id')::uuid);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit."DataChanges" ("TableName", "Operation", "NewData", "ChangedBy")
        VALUES (TG_TABLE_NAME, 'INSERT', row_to_json(NEW), current_setting('app.current_user_id')::uuid);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Users"
    FOR EACH ROW EXECUTE FUNCTION audit.data_change_trigger();

CREATE TRIGGER businesses_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Businesses"
    FOR EACH ROW EXECUTE FUNCTION audit.data_change_trigger();

CREATE TRIGGER reviews_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Reviews"
    FOR EACH ROW EXECUTE FUNCTION audit.data_change_trigger();

CREATE TRIGGER posts_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Posts"
    FOR EACH ROW EXECUTE FUNCTION audit.data_change_trigger();

CREATE TRIGGER business_hours_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "BusinessHours"
    FOR EACH ROW EXECUTE FUNCTION audit.data_change_trigger();

CREATE TRIGGER business_images_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "BusinessImages"
    FOR EACH ROW EXECUTE FUNCTION audit.data_change_trigger();

CREATE TRIGGER shares_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON "Shares"
    FOR EACH ROW EXECUTE FUNCTION audit.data_change_trigger();

-- ============================================
-- Örnek KAYITLAR (SEED DATA)
-- ============================================

-- Kullanıcılar (şifreler BCrypt ile hashlenmiştir)
-- admin123, business123, user123, user456
INSERT INTO "Users" ("Id", "Username", "Email", "PasswordHash", "FirstName", "LastName", "Role", "CreatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@wayspot.com', '$2b$12$wFhUqAWixsb2q75U3AAeVO7BhqIe4jnccCrijihqgr5pXTugcyHBy', 'Admin', 'User', 3, '2026-08-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440001', 'cafebusiness', 'cafe@wayspot.com', '$2b$12$nZjmmA3DUGnmnqerTwa2OONja6Gt4T91nqbXJJLMwV4f3Gh2rXDa2', 'Cafe', 'Owner', 2, '2026-08-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440002', 'ahmetyilmaz', 'ahmet@example.com', '$2b$12$.r4EPF8/I7K7IXPc0YBuwe4Fx8OndxviOLsXaGWRV1lj05M4QM.gW', 'Ahmet', 'Yilmaz', 1, '2026-08-02T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440003', 'elifdemir', 'elif@example.com', '$2b$12$Sdc.4maMSSu1y92HnoBTm../.0dzp41osoYLTqWmtbbS4OPJ9bFI2', 'Elif', 'Demir', 1, '2026-08-02T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440004', 'gymbusiness', 'gym@wayspot.com', '$2b$12$nZjmmA3DUGnmnqerTwa2OONja6Gt4T91nqbXJJLMwV4f3Gh2rXDa2', 'Gym', 'Owner', 2, '2026-08-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440005', 'marketbusiness', 'market@wayspot.com', '$2b$12$nZjmmA3DUGnmnqerTwa2OONja6Gt4T91nqbXJJLMwV4f3Gh2rXDa2', 'Market', 'Owner', 2, '2026-08-01T00:00:00Z');

-- İşletmeler
INSERT INTO "Businesses" ("Id", "UserId", "Name", "Type", "Description", "Location", "Address", "CityId", "DistrictId", "Phone", "Email", "IsActive", "CreatedAt") VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'WaySpot Cafe', 'Cafe', 'Kent merkezinde ferah bir kafe. Özel kahve çeşitleri ve ev yapımı tatlılar.', ST_SetSRID(ST_MakePoint(32.8541, 39.9208), 4326), 'Atatürk Bulvarı No:123', '06', 'Merkez', '0312 123 45 67', 'cafe@wayspot.com', true, '2026-08-03T00:00:00Z'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Power Gym', 'Fitness', 'Tüm ekipmanları barındıran spor salonu. 7/24 hizmetinizde.', ST_SetSRID(ST_MakePoint(32.8611, 39.9275), 4326), 'Spor Caddesi No:45', '06', 'Yenimahalle', '0312 987 65 43', 'gym@wayspot.com', true, '2026-08-04T00:00:00Z'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'Fresh Market', 'Market', 'Taptaze sebze ve meyveler, yerel üreticilerden.', ST_SetSRID(ST_MakePoint(32.8450, 39.9320), 4326), 'Çankaya Mah. No:88', '06', 'Çankaya', '0312 456 78 90', 'market@wayspot.com', true, '2026-08-05T00:00:00Z');

-- İşletme Saatleri
INSERT INTO "BusinessHours" ("Id", "BusinessId", "DayOfWeek", "OpenTime", "CloseTime", "IsOpen") VALUES
('aa0e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 1, '08:00:00', '22:00:00', true),
('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 2, '08:00:00', '22:00:00', true),
('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 3, '08:00:00', '22:00:00', true),
('aa0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440000', 4, '08:00:00', '22:00:00', true),
('aa0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440000', 5, '08:00:00', '22:00:00', true),
('aa0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 1, '00:00:00', '23:59:59', true);

-- Kampanyalar / Postlar
INSERT INTO "Posts" ("Id", "BusinessId", "Content", "ImageUrl", "TargetRadiusKm", "CreatedAt", "ExpiresAt") VALUES
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Bugün 20% indirim fırsatı! Tüm sıcak içeceklerde geçerli.', null, 20.0, '2026-08-10T08:00:00Z', null),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Yeni menümüzde deneyebileceğiniz özel lezzetler.', 'https://example.com/post2.jpg', 15.0, '2026-08-11T09:00:00Z', '2026-08-20T00:00:00Z'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', 'Hafta sonu özel etkinlik: canlı müzik ve yemekler.', null, 10.0, '2026-08-12T10:00:00Z', null),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Yıllık üyeliklerde %15 net indirim. Yaza formda girin!', null, 25.0, '2026-08-12T11:00:00Z', null),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Organik pazarımız açıldı. İlk alışverişinize özel hediye!', null, 5.0, '2026-08-13T08:00:00Z', null);

-- Yorumlar
INSERT INTO "Reviews" ("Id", "BusinessId", "UserId", "Rating", "Comment", "PhotoUrl", "IsApproved", "IsFlagged", "CreatedAt") VALUES
('880e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 5, 'Harika bir yer, çok beğendim! Kahvesi muazzam.', 'https://example.com/rev1.jpg', true, false, '2026-08-12T14:00:00Z'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 4, 'Lezzetliydi ama servis biraz yavaştı.', 'https://example.com/rev2.jpg', true, false, '2026-08-11T16:00:00Z'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 3, 'Ortalama bir deneyim, fiyatlar biraz yüksek.', 'https://example.com/rev3.jpg', false, false, '2026-08-10T12:00:00Z'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 2, 'Beklediğim gibi değildi, ücretsiz su istedim veremediler.', 'https://example.com/rev4.jpg', false, true, '2026-08-09T18:00:00Z');

-- Kayıtlı Rotalar
INSERT INTO "SavedRoutes" ("Id", "UserId", "Name", "StartPoint", "EndPoint", "WaypointsJson", "TotalDistanceKm", "CreatedAt") VALUES
('990e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Ankara - Eskişehir', ST_SetSRID(ST_MakePoint(32.8541, 39.9208), 4326), ST_SetSRID(ST_MakePoint(30.5206, 39.7767), 4326), null, 230.5, '2026-08-12T20:00:00Z'),
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Ankara - Konya', ST_SetSRID(ST_MakePoint(32.8597, 39.9334), 4326), ST_SetSRID(ST_MakePoint(32.4846, 37.8713), 4326), null, 240.0, '2026-08-11T21:00:00Z');

-- ============================================
-- EF CORE MIGRASYON GEÇMİŞİ
-- ============================================

CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion") VALUES
('20260812072233_InitialCreate', '8.0.8'),
('20260812120316_AddReviewModeration', '8.0.8');

-- ============================================
-- BİTİŞ
-- ============================================
