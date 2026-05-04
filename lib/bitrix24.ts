// lib/bitrix24.ts
const BITRIX24_WEBHOOK_URL = "https://b24-gwhw1e.bitrix24.ru/rest/1/rau312onocrn66z9/";
const ENTITY_TYPE_ID = "1042";

interface TripData {
  id: string;
  title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  status: string;
}

export async function createTripInBitrix24(tripData: TripData) {
  console.log('🚀 Отправка в Bitrix24...');
  console.log('📦 Данные:', tripData);

  const url = `${BITRIX24_WEBHOOK_URL}crm.item.add?entityTypeId=${ENTITY_TYPE_ID}`;

  // Соответствие полей из твоего проекта → коды полей в Bitrix24
  const fields = {
    fields: {
      TITLE: tripData.title,                           // стандартное поле "Название"
      ufCrm7_1777904628: tripData.id,                  // TRIP_ID
      ufCrm7_1777904756: tripData.location || '',      // LOCATION
      ufCrm7_1777904773: tripData.start_date || '',    // START_DATE
      ufCrm7_1777904785: tripData.end_date || '',      // END_DATE
      ufCrm7_1777904799: tripData.status,              // STATUS (planning/active/completed)
      OBSERVERS: "",                                   // можно оставить пустым
    }
  };

  console.log('📤 Отправляемые поля:', JSON.stringify(fields, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });

    const data = await response.json();
    console.log('📨 Ответ Bitrix24:', JSON.stringify(data, null, 2));

    if (data.result?.item) {
      console.log('✅ Поездка создана в Bitrix24, ID:', data.result.item.id);
      return data.result.item;
    } else {
      console.error('❌ Ошибка Bitrix24:', data.error_description || data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Исключение при запросе:', error);
    return null;
  }
}