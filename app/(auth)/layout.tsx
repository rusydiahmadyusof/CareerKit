import { Public_Sans } from "next/font/google";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${publicSans.className} min-h-screen flex items-center justify-center bg-slate-50`}
    >
      {children}
    </div>
  );
}
