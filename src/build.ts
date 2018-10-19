import { TowerflowType } from "../bin";
import { checkRequiredFiles } from "./helper/check-required-files";
import { Debug } from "./helper/debugger";

const debug = Debug(__filename);

export async function build(options: {
  appPath: string;
  appName: string;
  ownPath: string;
  appType: TowerflowType;
}) {
  const isInteractive = process.stdout.isTTY;
  debug(`isInteractive: ${isInteractive}`);

  debug(`Check required files exists`);
  // Warn and crash if required files are missing
  if (!checkRequiredFiles()) {
    process.exit(1);
  }

  switch (options.appType) {
    case TowerflowType.webApp:
      debug(`Begin to run webpack build`);

      break;
    case TowerflowType.nodeApp:
      debug(`Begin to build ts lib`);

      // TODO: Do some node app specify build step.
      break;

    case TowerflowType.webLib:
    case TowerflowType.nodeLib:
      debug(`Begin to build ts lib`);

      break;
    default:
      console.log(
        `The template argument gets Unknown type, valid type: Fuck you! dummy suck loser, you gonna typing everything wrong?`
      );
  }
}
