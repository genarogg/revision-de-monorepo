import chalk from "chalk";

const isDev = process.env.NODE_ENV !== "production";

const formatArgs = (args: any[]): string => {
  return args
    .map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        return JSON.stringify(arg, null, 2);
      }
      return arg;
    })
    .join(" ");
};

const createLogger = (color: (value: string) => string) => {
  return (...args: any[]) => {
    console.log(color(formatArgs(args)));
  };
};

const createDevLogger = (color: (value: string) => string) => {
  return (...args: any[]) => {
    if (isDev) {
      console.log(color(formatArgs(args)));
    }
  };
};

const success = createLogger(chalk.green);
const warning = createLogger(chalk.yellow);
const error = createLogger(chalk.red);
const info = createLogger(chalk.cyan);
const dev = createDevLogger(chalk.green);

const log = {
  success,
  warning,
  error,
  info,
  dev,
};

export default log;