// src/app/[locale]/contact/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ContactContent from '../../../components/contact/ContactContent';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!['fr', 'ln', 'en'].includes(locale)) notFound();

  const t = await getTranslations();

  // ✅ Passe uniquement des chaînes (string), pas la fonction `t`
  return (
    <ContactContent
      title={t('contact.title')}
      subtitle={t('contact.subtitle')}
      address={t('contact.address')}
      email={t('contact.email')}
      phone={t('contact.phone')}
      form_title={t('contact.form_title')}
      name={t('contact.name')}
      name_placeholder={t('contact.name_placeholder')}
      message={t('contact.message')}
      message_placeholder={t('contact.message_placeholder')}
      send={t('contact.send')}
    />
  );
}