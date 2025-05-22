"use server";

import { z } from "zod";
import type { HaulingRun, HaulingRunFormState } from "./types";
import { revalidatePath } from "next/cache";

const HaulingRunSchema = z.object({
  destination: z.string().min(3, "Destination must be at least 3 characters"),
  cargo: z.string().min(3, "Cargo type must be at least 3 characters"),
  scu: z.coerce.number().positive("SCU must be a positive number").int("SCU must be a whole number"),
});

export async function logHaulingRunAction(
  prevState: HaulingRunFormState,
  formData: FormData
): Promise<HaulingRunFormState> {
  try {
    const validatedFields = HaulingRunSchema.safeParse({
      destination: formData.get("destination"),
      cargo: formData.get("cargo"),
      scu: formData.get("scu"),
    });

    if (!validatedFields.success) {
      return {
        message: "Validation failed. Please check the fields.",
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }

    const { destination, cargo, scu } = validatedFields.data;

    // Simulate saving to a database
    const newRun: HaulingRun = {
      id: crypto.randomUUID(),
      destination,
      cargo,
      scu,
      date: new Date().toISOString(),
    };

    // In a real app, you'd save to DB here.
    // For example: await db.insert(haulingRunsTable).values(newRun);

    console.log("New Hauling Run Logged:", newRun);

    revalidatePath("/"); // Revalidate the page to show new data if it were fetched server-side

    return {
      message: `Successfully logged run to ${destination} with ${scu} SCU of ${cargo}.`,
      success: true,
      run: newRun,
    };
  } catch (error) {
    console.error("Error logging hauling run:", error);
    return {
      message: "An unexpected error occurred while logging the run. Please try again.",
      success: false,
    };
  }
}
