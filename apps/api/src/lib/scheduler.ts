import { and, eq, lte } from "drizzle-orm";
import { db } from "./db";
import { paymentSchedules, transfers, users } from "../db/schema";
import { executePayment } from "./payments";
import { logger } from "./logger";

const TICK_MS = 5_000;
// Per-payment ceiling — the server signer moves money on its own, so cap it.
const MAX_PAYMENT = 1_000_000;

// ponytail: single in-process loop with a module-level lock. Fine for one
// instance (the demo). For prod, move to a worker and take a row lock with
// `SELECT ... FOR UPDATE SKIP LOCKED` so multiple instances don't double-pay.
let running = false;

async function tick(): Promise<void> {
  if (running) return; // never overlap ticks
  running = true;
  try {
    const due = await db
      .select({ schedule: paymentSchedules, stellarAddress: users.stellarAddress })
      .from(paymentSchedules)
      .innerJoin(users, eq(users.id, paymentSchedules.userId))
      .where(and(eq(paymentSchedules.active, true), lte(paymentSchedules.nextRunAt, new Date())));

    for (const { schedule, stellarAddress } of due) {
      // Advance the clock BEFORE signing: a restart or a slow settle never
      // re-fires the same period.
      const nextRunAt = new Date(Date.now() + schedule.intervalSeconds * 1000);
      await db
        .update(paymentSchedules)
        .set({ nextRunAt, lastRunAt: new Date() })
        .where(eq(paymentSchedules.id, schedule.id));

      const setError = (lastError: string) =>
        db.update(paymentSchedules).set({ lastError }).where(eq(paymentSchedules.id, schedule.id));

      if (!stellarAddress) {
        await setError("No Stellar wallet registered for this user");
        continue;
      }
      if (Number(schedule.amount) > MAX_PAYMENT) {
        await setError(`Amount exceeds the ${MAX_PAYMENT} per-payment cap`);
        continue;
      }

      const result = await executePayment({
        from: stellarAddress,
        to: schedule.counterparty,
        amount: schedule.amount,
      });

      // Record the movement so it shows up in /api/movements regardless of
      // whether the on-chain transfer settled (txId may be null when simulated).
      await db.insert(transfers).values({
        userId: schedule.userId,
        direction: "out",
        counterparty: schedule.counterparty,
        amount: schedule.amount,
        txId: result.txId,
        scheduleId: schedule.id,
      });
      await db
        .update(paymentSchedules)
        .set({ lastTxId: result.txId, lastError: result.simulated ? "simulated (no on-chain tx)" : null })
        .where(eq(paymentSchedules.id, schedule.id));

      logger.info(
        { scheduleId: schedule.id, amount: schedule.amount, txId: result.txId, simulated: result.simulated },
        "schedule_executed",
      );
    }
  } catch (err) {
    logger.warn({ err }, "scheduler_tick_failed");
  } finally {
    running = false;
  }
}

/** Start the in-process recurring-payments loop. Idempotent across `--hot`
 *  reloads via a global guard so it never runs twice in one process. */
export function startScheduler(): void {
  const g = globalThis as { __photonScheduler?: ReturnType<typeof setInterval> };
  if (g.__photonScheduler) return;
  g.__photonScheduler = setInterval(() => void tick(), TICK_MS);
  logger.info({ tickMs: TICK_MS }, "scheduler_started");
}
