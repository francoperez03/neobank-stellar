import { BalanceCard } from "@/components/BalanceCard";
import { TransferForm } from "@/components/TransferForm";

export function AppIndexPage() {
  return (
    <main className="app flex flex-col gap-4 p-4">
      <BalanceCard />
      <TransferForm />
    </main>
  );
}
