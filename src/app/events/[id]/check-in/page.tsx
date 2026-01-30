import { redirect } from 'next/navigation';

export default function EventCheckInPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = typeof searchParams.token === 'string' ? searchParams.token : null;
  const tokenParam = token ? `?token=${token}` : '';
  redirect(`/fr/events/${params.id}/check-in${tokenParam}`);
}
