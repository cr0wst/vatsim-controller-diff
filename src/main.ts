import * as dotenv from "dotenv";

dotenv.config();

import { Controller, fetchControllers } from "./vatsim";
import { pick } from "lodash";

let controllers: Controller[] = [];

async function main() {
  await reportControllerChanges();
  setInterval(reportControllerChanges, 1000 * 15);
}

async function reportControllerChanges() {
  const now = new Date();
  const newControllers = await fetchControllers();
  // Generate a list of controllers that have been added or removed
  const differences = {
    added: newControllers.filter(c => !controllers.find((c2) => c2.cid == c.cid)),
    removed: controllers.filter((c) => !newControllers.find((c2) => c2.cid == c.cid)),
  }

  // Report on differences
  differences.added.forEach((c) => {
    console.log(`${now.toISOString()} [SIGNED ON] [${c.callsign}] ${c.cid} ${c.name} (${c.rating.short})`);
  })

  differences.removed.forEach((c) => {
    console.log(`${now.toISOString()} [SIGNED OFF] [${c.callsign}] ${c.cid} ${c.name} (${c.rating.short})`);
  })

  console.log(`${now.toISOString()} [ ${differences.added.length} Signed On | ${differences.removed.length} Signed Off ]`)

  controllers = newControllers;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
