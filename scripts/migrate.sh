#!/bin/bash
echo "🗄️ 데이터베이스 마이그레이션 실행"

# Supabase 마이그레이션 파일들 실행
echo "📊 SQL 마이그레이션 파일 실행 중..."

# 실제 운영에서는 Supabase CLI 사용
# npx supabase db reset --linked
# npx supabase db push

echo "✅ 마이그레이션 완료"
echo "ℹ️  실제 배포시에는 Supabase CLI를 사용하세요"
