import * as dotenv from "dotenv";
import { Controller, fetchControllers } from "./vatsim";

dotenv.config();

let controllers: Controller[] = [];

async function main() {
  await reportControllerChanges();
  setInterval(reportControllerChanges, 1000 * 15);
}

async function reportControllerChanges() {
  const now = new Date();
  const newControllers = (await fetchControllers()).filter((c) => c.facility.short !== "OBS" && c.frequency !== "199.998");
  // Generate a list of controllers that have been added or removed

  const differences = {
    added: newControllers.filter(c => !controllers.find((c2) => c2.cid == c.cid)),
    removed: controllers.filter((c) => !newControllers.find((c2) => c2.cid == c.cid))
  };

  // Report on differences
  differences.added.forEach((c) => {
    console.log(`${now.toISOString()} [SIGNED ON] [${c.callsign} ${c.facility.short}] ${c.cid} ${c.name} (${c.rating.short}) ${c.frequency}`);
  });

  differences.removed.forEach((c) => {
    console.log(`${now.toISOString()} [SIGNED OFF] [${c.callsign} ${c.facility.short}] ${c.cid} ${c.name} (${c.rating.short})`);
  });

  controllers = newControllers;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
