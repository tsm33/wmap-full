// app/api/bitrix24-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('📨 Получен вебхук от Bitrix24:', JSON.stringify(payload, null, 2));

    const event = payload.event;
    const dynamicItemId = payload.data?.FIELDS?.ID;
    const fields = payload.data?.FIELDS;

    if (!dynamicItemId) {
      return NextResponse.json({ message: 'No item ID' }, { status: 400 });
    }

    switch (event) {
      case 'ONCRMDYNAMICITEMADD':
        console.log(`✨ Создана новая поездка в CRM (ID: ${dynamicItemId})`);
        // Здесь можно добавить логику для создания записи в Supabase
        break;

      case 'ONCRMDYNAMICITEMUPDATE':
        console.log(`🔄 Обновлена поездка в CRM (ID: ${dynamicItemId})`);
        
        // Если статус изменился, синхронизируем с Supabase
        if (fields?.STATUS) {
          const tripId = fields.TRIP_ID;
          if (tripId) {
            await supabase
              .from('trips')
              .update({ status: fields.STATUS })
              .eq('id', tripId);
            console.log(`✅ Статус поездки ${tripId} обновлён на ${fields.STATUS}`);
          }
        }
        break;

      default:
        console.log(`ℹ️ Необработанное событие: ${event}`);
    }

    return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
  } catch (error) {
    console.error('❌ Ошибка обработки вебхука:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}