-- 005_view_security.sql — businesses_public view 의 RLS 우회.
-- 기본값 security_invoker=on 이면 view 가 호출자(anon) 권한으로 underlying 접근.
-- businesses 에 admin-only RLS 가 있어 anon 이 view 호출해도 0 row.
-- security_invoker=off 로 변경하면 view owner 권한으로 SELECT — anon 은 view 만 쿼리 가능하므로 컬럼 마스킹이 자동 적용.
ALTER VIEW businesses_public SET (security_invoker = off);
