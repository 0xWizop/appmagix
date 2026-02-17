import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { ScrollProgress } from "@/components/marketing/scroll-progress";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  );
}
