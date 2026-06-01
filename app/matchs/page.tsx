import { redirect } from 'next/navigation';

/** Alias court → route matchs existante. */
export default function MatchsPage() {
  redirect('/matchs-amicaux');
}
