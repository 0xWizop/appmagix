import { getDashboardData } from "@/lib/firestore";

// firebaseUid IS the owner key now (Firestore-native)
export async function getDashboardDataFromPrisma(firebaseUid: string) {
  try {
    return await getDashboardData(firebaseUid);
  } catch (e) {
    console.error("getDashboardData error:", e);
    return null;
  }
}
