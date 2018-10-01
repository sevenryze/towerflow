import { TowerflowType } from "../bin";
import { buildTsLib } from "./tsc/build-ts-lib";
import { checkRequiredFiles } from "./helper/check-required-files";
import { Debug } from "./helper/debugger";

const debug = Debug(__filename);

export async function build(options: {
  appPath: string;
  appName: string;
  ownPath: string;
  appType: TowerflowType;
}) {
  // Do this as the first thing so that any code reading it knows the right env.

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
      buildTsLib(options);

      // TODO: Do some node app specify build step.
      break;

    case TowerflowType.webLib:
    case TowerflowType.nodeLib:
      debug(`Begin to build ts lib`);
      buildTsLib(options);

      break;
    default:
      console.log(
        `The template argument gets Unknown type, valid type: Fuck you! dummy suck loser, you gonna typing everything wrong?`
      );
  }
}
