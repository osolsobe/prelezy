import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import GradeBadge from "@/components/GradeBadge";
import DeleteAttemptButton from "@/components/DeleteAttemptButton";

export default async function AttemptsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const cs = locale === "cs";
  const userId = session.user.id;

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: {
      route: { select: { name: true, grade: true, id: true } },
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">
          {cs ? "Moje pokusy" : "My Attempts"}
        </h1>
        <Link href={`/${locale}/profile`} className="text-sm text-gray-500 hover:text-gray-700">
          ← {cs ? "Profil" : "Profile"}
        </Link>
      </div>

      {attempts.length === 0 ? (
        <p className="text-gray-400 text-center py-12">
          {cs ? "Žádné záznamy" : "No records yet"}
        </p>
      ) : (
        <div className="space-y-2">
          {attempts.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${locale}/routes/${a.route.id}`}
                  className="font-medium hover:text-blue-600 truncate block"
                >
                  {a.route.name}
                </Link>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{new Date(a.date).toLocaleDateString(cs ? "cs-CZ" : "en-US")}</span>
                  {a.success && (
                    <span className="text-green-600 font-medium">
                      ✓ {cs ? "Přelezeno" : "Sent"}
                    </span>
                  )}
                  {a.flash && <span className="text-yellow-500">⚡ Flash</span>}
                  {a.tryCount > 1 && (
                    <span>{a.tryCount}× {cs ? "pokusů" : "tries"}</span>
                  )}
                </div>
                {a.note && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{a.note}</p>
                )}
              </div>
              <GradeBadge grade={a.route.grade} size="sm" />
              <DeleteAttemptButton attemptId={a.id} locale={locale} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
