import { createCorsair } from 'corsair';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { gmail } from '@corsair-dev/gmail';
import { conn } from '@/db';

export const corsair = createCorsair({
  plugins: [googlecalendar(), gmail()],
  database: conn,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true,
});